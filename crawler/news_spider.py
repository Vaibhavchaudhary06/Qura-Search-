import asyncio
import json
import os
import logging
import hashlib
import random
import signal
import sys
from datetime import datetime, timedelta
from typing import List, Dict, Set, Optional, Tuple
from urllib.parse import urljoin, urlparse
from collections import defaultdict
from dataclasses import dataclass, asdict
from enum import Enum
import re

import aiohttp
from playwright.async_api import async_playwright, Browser, BrowserContext
from bs4 import BeautifulSoup

# Optional imports with fallback
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

try:
    from elasticsearch import Elasticsearch
    ES_AVAILABLE = True
except ImportError:
    ES_AVAILABLE = False

try:
    from kafka import KafkaProducer
    KAFKA_AVAILABLE = True
except ImportError:
    KAFKA_AVAILABLE = False

# ==================== CONFIGURATION ====================

@dataclass
class NewsConfig:
    """Centralized configuration"""
    # File paths
    index_file: str = "news_index.jsonl"
    stats_file: str = "news_stats.json"
    categories_file: str = "news_categories.json"
    failed_urls_file: str = "failed_urls.json"
    
    # Crawling limits
    max_news: int = 50000
    max_retries: int = 3
    retry_delay: int = 5
    request_timeout: int = 30000
    
    # Rate limiting
    requests_per_minute: int = 30
    concurrent_sources: int = 3
    scan_interval: int = 300  # seconds
    
    # Content filters
    min_title_length: int = 20
    max_title_length: int = 200
    max_text_length: int = 5000
    
    # Deduplication
    use_redis: bool = False
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    
    # Elasticsearch (optional)
    use_elasticsearch: bool = False
    es_host: str = "localhost"
    es_port: int = 9200
    es_index: str = "news"
    
    # Kafka (optional)
    use_kafka: bool = False
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_topic: str = "news_topic"

# ==================== DATA MODELS ====================

class NewsPriority(Enum):
    CRITICAL = 1
    HIGH = 2
    MEDIUM = 3
    LOW = 4

class NewsCategory(Enum):
    GOVERNMENT = "government"
    POLITICS = "politics"
    TECHNOLOGY = "technology"
    SPORTS = "sports"
    BUSINESS = "business"
    ENTERTAINMENT = "entertainment"
    SCIENCE = "science"
    HEALTH = "health"
    EDUCATION = "education"
    INTERNATIONAL = "international"
    CRIME = "crime"
    WEATHER = "weather"
    GENERAL = "general"

# ==================== SOURCES DATABASE ====================

NEWS_SOURCES = [
    # CRITICAL PRIORITY - Government Sources
    {
        "name": "PIB India",
        "url": "https://pib.gov.in/indexd.aspx",
        "category": NewsCategory.GOVERNMENT,
        "priority": NewsPriority.CRITICAL,
        "selectors": ["h1", "h2", ".press-release-title", ".news-title", ".title", "a[href*='PressRelease']"],
        "rate_limit": 10,
        "enabled": True,
        "country": "India",
        "language": "en"
    },
    {
        "name": "PIB Press Releases",
        "url": "https://pib.gov.in/PressReleasePage.aspx",
        "category": NewsCategory.GOVERNMENT,
        "priority": NewsPriority.CRITICAL,
        "selectors": ["h1", "h2", ".press-release-title"],
        "rate_limit": 10,
        "enabled": True,
        "country": "India",
        "language": "en"
    },
    {
        "name": "MyGov India",
        "url": "https://www.mygov.in/latest-news/",
        "category": NewsCategory.GOVERNMENT,
        "priority": NewsPriority.CRITICAL,
        "selectors": ["h2", ".news-title", ".title", "a"],
        "rate_limit": 10,
        "enabled": True,
        "country": "India",
        "language": "en"
    },
    
    # HIGH PRIORITY - Major News Outlets
    {
        "name": "NDTV",
        "url": "https://www.ndtv.com/latest",
        "category": NewsCategory.GENERAL,
        "priority": NewsPriority.HIGH,
        "selectors": ["h1", "h2", ".news_title", ".story__title", ".src_lst-cn", "a[href*='/news/']"],
        "rate_limit": 20,
        "enabled": True,
        "country": "India",
        "language": "en"
    },
    {
        "name": "Times of India",
        "url": "https://timesofindia.indiatimes.com/india",
        "category": NewsCategory.GENERAL,
        "priority": NewsPriority.HIGH,
        "selectors": ["h1", "h2", ".article_title", ".w_tle", ".headlines", "a[href*='/india/']"],
        "rate_limit": 20,
        "enabled": True,
        "country": "India",
        "language": "en"
    },
    {
        "name": "The Hindu",
        "url": "https://www.thehindu.com/news/national/",
        "category": NewsCategory.GENERAL,
        "priority": NewsPriority.HIGH,
        "selectors": ["h1", "h2", ".title", ".story-title", ".headline", "a[href*='/news/']"],
        "rate_limit": 20,
        "enabled": True,
        "country": "India",
        "language": "en"
    },
    {
        "name": "Indian Express",
        "url": "https://indianexpress.com/latest-news/",
        "category": NewsCategory.GENERAL,
        "priority": NewsPriority.HIGH,
        "selectors": ["h1", "h2", ".title", ".heading", ".article-title", "a[href*='/article/']"],
        "rate_limit": 20,
        "enabled": True,
        "country": "India",
        "language": "en"
    },
    {
        "name": "BBC News",
        "url": "https://www.bbc.com/news/world/asia/india",
        "category": NewsCategory.INTERNATIONAL,
        "priority": NewsPriority.HIGH,
        "selectors": ["h1", "h2", ".gs-c-promo-heading", "a[href*='/news/']"],
        "rate_limit": 20,
        "enabled": True,
        "country": "UK",
        "language": "en"
    },
    {
        "name": "Reuters India",
        "url": "https://www.reuters.com/world/india/",
        "category": NewsCategory.INTERNATIONAL,
        "priority": NewsPriority.HIGH,
        "selectors": ["h1", "h2", ".story-title", "a[href*='/world/india/']"],
        "rate_limit": 20,
        "enabled": True,
        "country": "UK",
        "language": "en"
    },
    
    # MEDIUM PRIORITY - Tech News
    {
        "name": "Gadgets 360",
        "url": "https://www.gadgets360.com/news",
        "category": NewsCategory.TECHNOLOGY,
        "priority": NewsPriority.MEDIUM,
        "selectors": ["h1", "h2", ".news-title", ".heading", ".post-title", "a[href*='/news/']"],
        "rate_limit": 15,
        "enabled": True,
        "country": "India",
        "language": "en"
    },
    {
        "name": "Inc42",
        "url": "https://inc42.com/buzz/",
        "category": NewsCategory.TECHNOLOGY,
        "priority": NewsPriority.MEDIUM,
        "selectors": ["h1", "h2", ".post-title", ".heading", ".entry-title", "a[href*='/buzz/']"],
        "rate_limit": 15,
        "enabled": True,
        "country": "India",
        "language": "en"
    },
    {
        "name": "TechCrunch",
        "url": "https://techcrunch.com/category/startups/",
        "category": NewsCategory.TECHNOLOGY,
        "priority": NewsPriority.MEDIUM,
        "selectors": ["h1", "h2", ".post-title", "a[href*='/']"],
        "rate_limit": 15,
        "enabled": True,
        "country": "USA",
        "language": "en"
    },
    
    # MEDIUM PRIORITY - Sports
    {
        "name": "NDTV Sports",
        "url": "https://sports.ndtv.com/latest",
        "category": NewsCategory.SPORTS,
        "priority": NewsPriority.MEDIUM,
        "selectors": ["h1", "h2", ".news_title", ".story__title", "a[href*='/sports/']"],
        "rate_limit": 15,
        "enabled": True,
        "country": "India",
        "language": "en"
    },
    {
        "name": "Cricbuzz",
        "url": "https://www.cricbuzz.com/cricket-news/latest",
        "category": NewsCategory.SPORTS,
        "priority": NewsPriority.MEDIUM,
        "selectors": ["h1", "h2", ".cb-nws-hdln", ".news-title", "a[href*='/cricket-news/']"],
        "rate_limit": 15,
        "enabled": True,
        "country": "India",
        "language": "en"
    },
    {
        "name": "ESPN",
        "url": "https://www.espn.com/cricket/stories",
        "category": NewsCategory.SPORTS,
        "priority": NewsPriority.MEDIUM,
        "selectors": ["h1", "h2", ".headline", "a[href*='/story/']"],
        "rate_limit": 15,
        "enabled": True,
        "country": "USA",
        "language": "en"
    },
    
    # MEDIUM PRIORITY - Business
    {
        "name": "Business Standard",
        "url": "https://www.business-standard.com/latest",
        "category": NewsCategory.BUSINESS,
        "priority": NewsPriority.MEDIUM,
        "selectors": ["h1", "h2", ".heading", ".title", ".article-title", "a[href*='/article/']"],
        "rate_limit": 15,
        "enabled": True,
        "country": "India",
        "language": "en"
    },
    {
        "name": "Economic Times",
        "url": "https://economictimes.indiatimes.com/news",
        "category": NewsCategory.BUSINESS,
        "priority": NewsPriority.MEDIUM,
        "selectors": ["h1", "h2", ".article_title", ".title", ".eachStory", "a[href*='/news/']"],
        "rate_limit": 15,
        "enabled": True,
        "country": "India",
        "language": "en"
    },
    {
        "name": "Bloomberg",
        "url": "https://www.bloomberg.com/asia",
        "category": NewsCategory.BUSINESS,
        "priority": NewsPriority.MEDIUM,
        "selectors": ["h1", "h2", ".story-title", "a[href*='/news/']"],
        "rate_limit": 15,
        "enabled": True,
        "country": "USA",
        "language": "en"
    },
    
    # LOW PRIORITY - Entertainment
    {
        "name": "Bollywood Hungama",
        "url": "https://www.bollywoodhungama.com/news/",
        "category": NewsCategory.ENTERTAINMENT,
        "priority": NewsPriority.LOW,
        "selectors": ["h1", "h2", ".news-title", ".title", "a"],
        "rate_limit": 10,
        "enabled": True,
        "country": "India",
        "language": "en"
    },
    
    # SCIENCE
    {
        "name": "ISRO News",
        "url": "https://www.isro.gov.in/Updates.html",
        "category": NewsCategory.SCIENCE,
        "priority": NewsPriority.MEDIUM,
        "selectors": ["h1", "h2", ".title", "a"],
        "rate_limit": 10,
        "enabled": True,
        "country": "India",
        "language": "en"
    }
]

# ==================== ENTERPRISE NEWS SPIDER ====================

class EnterpriseNewsSpider:
    """Production-grade news crawler with all enterprise features"""
    
    def __init__(self, config: NewsConfig = None):
        self.config = config or NewsConfig()
        self.logger = self._setup_logging()
        
        # State management
        self.visited_hashes: Set[str] = set()
        self.news_count = 0
        self.failed_sources: Dict[str, int] = defaultdict(int)
        self.successful_sources: Dict[str, int] = defaultdict(int)
        self.rate_limiters: Dict[str, List[datetime]] = defaultdict(list)
        
        # Cache
        self.url_cache: Dict[str, Dict] = {}
        
        # Performance metrics
        self.metrics = {
            "total_fetched": 0,
            "total_saved": 0,
            "total_duplicates": 0,
            "total_errors": 0,
            "average_response_time": 0,
            "start_time": None,
            "end_time": None
        }
        
        # Initialize components
        self._init_optional_components()
        self._load_existing_data()
        
        # Setup signal handlers
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _setup_logging(self) -> logging.Logger:
        """Setup professional logging with UTF-8 support for Windows"""
        logger = logging.getLogger("EnterpriseNewsSpider")
        logger.setLevel(logging.INFO)
        
        # Console handler with UTF-8 support
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        
        # Force UTF-8 for Windows console
        if sys.platform == "win32":
            try:
                import codecs
                console_handler.stream = codecs.getwriter('utf-8')(sys.stdout.buffer)
            except:
                pass
        
        console_format = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        console_handler.setFormatter(console_format)
        logger.addHandler(console_handler)
        
        # File handler with UTF-8
        file_handler = logging.FileHandler("news_spider.log", encoding='utf-8')
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(console_format)
        logger.addHandler(file_handler)
        
        return logger
    
    def _init_optional_components(self):
        """Initialize optional components (Redis, Elasticsearch, Kafka)"""
        self.redis_client = None
        self.es_client = None
        self.kafka_producer = None
        
        if self.config.use_redis and REDIS_AVAILABLE:
            try:
                self.redis_client = redis.Redis(
                    host=self.config.redis_host,
                    port=self.config.redis_port,
                    db=self.config.redis_db,
                    decode_responses=True
                )
                self.redis_client.ping()
                self.logger.info("Redis connected")
            except Exception as e:
                self.logger.warning(f"Redis connection failed: {e}")
        
        if self.config.use_elasticsearch and ES_AVAILABLE:
            try:
                self.es_client = Elasticsearch([f"http://{self.config.es_host}:{self.config.es_port}"])
                if not self.es_client.indices.exists(index=self.config.es_index):
                    self.es_client.indices.create(index=self.config.es_index)
                self.logger.info("Elasticsearch connected")
            except Exception as e:
                self.logger.warning(f"Elasticsearch connection failed: {e}")
        
        if self.config.use_kafka and KAFKA_AVAILABLE:
            try:
                self.kafka_producer = KafkaProducer(
                    bootstrap_servers=self.config.kafka_bootstrap_servers,
                    value_serializer=lambda v: json.dumps(v).encode('utf-8')
                )
                self.logger.info("Kafka connected")
            except Exception as e:
                self.logger.warning(f"Kafka connection failed: {e}")
    
    def _load_existing_data(self):
        """Load existing data from file or Redis"""
        if os.path.exists(self.config.index_file):
            try:
                with open(self.config.index_file, "r", encoding="utf-8") as f:
                    for line in f:
                        try:
                            data = json.loads(line)
                            if 'content_hash' in data:
                                self.visited_hashes.add(data['content_hash'])
                            self.news_count += 1
                        except:
                            continue
                self.logger.info(f"Loaded {self.news_count} existing news items")
                self.logger.info(f"Loaded {len(self.visited_hashes)} content hashes")
            except Exception as e:
                self.logger.error(f"Error loading news: {e}")
    
    def _signal_handler(self, signum, frame):
        """Handle graceful shutdown"""
        self.logger.info("Received shutdown signal, saving state...")
        self.save_stats()
        self.logger.info("Shutdown complete")
        sys.exit(0)
    
    def get_content_hash(self, title: str, url: str) -> str:
        """Generate unique hash for news item"""
        content = f"{title}_{url}".lower().strip()
        return hashlib.md5(content.encode('utf-8')).hexdigest()
    
    def is_duplicate(self, title: str, url: str) -> bool:
        """Check if news already exists using multiple strategies"""
        content_hash = self.get_content_hash(title, url)
        
        if content_hash in self.visited_hashes:
            self.metrics["total_duplicates"] += 1
            return True
        
        self.visited_hashes.add(content_hash)
        return False
    
    def can_fetch_source(self, source_name: str, rate_limit: int) -> bool:
        """Check if source can be fetched based on rate limiting"""
        now = datetime.now()
        timestamps = self.rate_limiters[source_name]
        
        timestamps = [ts for ts in timestamps if now - ts < timedelta(minutes=1)]
        self.rate_limiters[source_name] = timestamps
        
        if len(timestamps) >= rate_limit:
            return False
        
        self.rate_limiters[source_name].append(now)
        return True
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        if not text:
            return ""
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[^\w\s\.\?\!\-:]', '', text)
        return text.strip()
    
    def is_blocked_content(self, text: str) -> bool:
        """Check if content should be blocked"""
        blocked_patterns = [
            r'^advertisement', r'^subscribe', r'newsletter', r'cookie',
            r'privacy', r'terms', r'login', r'sign up', r'search',
            r'copyright', r'all rights reserved', r'powered by'
        ]
        text_lower = text.lower()
        return any(re.search(pattern, text_lower) for pattern in blocked_patterns)
    
    def extract_news_from_page(self, soup: BeautifulSoup, url: str, source: Dict) -> List[Dict]:
        """Extract news items from page using multiple strategies"""
        news_items = []
        seen_titles = set()
        
        selectors = source.get("selectors", ["h1", "h2", "h3", ".title", ".heading"])
        
        for selector in selectors:
            try:
                elements = soup.select(selector)
                for elem in elements:
                    title = elem.get_text().strip()
                    title = self.clean_text(title)
                    
                    if not title:
                        continue
                    if len(title) < self.config.min_title_length:
                        continue
                    if len(title) > self.config.max_title_length:
                        continue
                    if title in seen_titles:
                        continue
                    if self.is_blocked_content(title):
                        continue
                    
                    seen_titles.add(title)
                    
                    link = url
                    if elem.name == 'a' and elem.get('href'):
                        link = elem.get('href')
                        if not link.startswith('http'):
                            link = urljoin(url, link)
                    
                    image_url = None
                    img = elem.find('img')
                    if img and img.get('src'):
                        image_url = urljoin(url, img['src'])
                    
                    author = None
                    author_elem = elem.find(['span', 'a'], attrs={'rel': 'author'})
                    if author_elem:
                        author = author_elem.get_text().strip()
                    
                    news_items.append({
                        "title": title[:200],
                        "url": link[:500],
                        "text": title[:self.config.max_text_length],
                        "source": source["name"],
                        "domain": urlparse(url).netloc,
                        "category": source["category"].value,
                        "sub_category": self.detect_category(title),
                        "priority": source["priority"].value,
                        "author": author,
                        "image_url": image_url,
                        "published_date": self.extract_date(soup),
                        "metadata": {
                            "country": source.get("country", "Unknown"),
                            "language": source.get("language", "en")
                        }
                    })
                    
                    if len(news_items) >= 20:
                        break
            except Exception as e:
                self.logger.debug(f"Selector {selector} failed: {e}")
        
        return news_items
    
    def detect_category(self, title: str) -> str:
        """Detect news category from title"""
        title_lower = title.lower()
        
        category_keywords = {
            NewsCategory.POLITICS: ["modi", "pm modi", "government", "minister", "election", "parliament", "bjp", "congress", "political", "democracy", "vote"],
            NewsCategory.TECHNOLOGY: ["ai", "tech", "smartphone", "app", "startup", "google", "apple", "microsoft", "software", "digital", "cyber", "data", "algorithm"],
            NewsCategory.SPORTS: ["cricket", "ipl", "match", "world cup", "player", "team", "sport", "football", "tennis", "kohli", "dhoni", "rohit", "virat"],
            NewsCategory.BUSINESS: ["market", "stock", "economy", "business", "company", "startup", "funding", "investment", "gst", "tax", "finance", "bank", "nifty"],
            NewsCategory.ENTERTAINMENT: ["movie", "film", "actor", "actress", "bollywood", "hollywood", "netflix", "amazon prime", "disney", "ott", "cinema"],
            NewsCategory.SCIENCE: ["space", "isro", "research", "scientist", "discovery", "study", "lab", "nasa", "mars", "moon", "satellite"],
            NewsCategory.HEALTH: ["covid", "hospital", "health", "medical", "doctor", "vaccine", "treatment", "disease", "pandemic", "corona", "virus"],
            NewsCategory.EDUCATION: ["school", "college", "university", "exam", "result", "student", "education", "board", "cbse", "upsc", "jee", "neet"],
            NewsCategory.CRIME: ["crime", "murder", "theft", "robbery", "arrest", "police", "court", "case", "accused", "victim", "investigation"],
            NewsCategory.WEATHER: ["weather", "rain", "storm", "cyclone", "flood", "drought", "temperature", "heatwave", "monsoon", "climate"],
            NewsCategory.INTERNATIONAL: ["usa", "uk", "russia", "china", "pakistan", "world", "global", "foreign", "united nations", "eu", "brexit"]
        }
        
        for category, keywords in category_keywords.items():
            if any(keyword in title_lower for keyword in keywords):
                return category.value
        return NewsCategory.GENERAL.value
    
    def extract_date(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract published date from page"""
        date_patterns = [
            ('meta', {'name': 'date'}),
            ('meta', {'property': 'article:published_time'}),
            ('meta', {'name': 'publishdate'}),
            ('time', {'datetime': True}),
            ('span', {'class': 'date'}),
            ('div', {'class': 'publish-date'})
        ]
        
        for tag, attrs in date_patterns:
            elem = soup.find(tag, attrs)
            if elem:
                if tag == 'time' and elem.get('datetime'):
                    return elem['datetime'][:10]
                if elem.get('content'):
                    return elem['content'][:10]
                if elem.get_text():
                    date_text = elem.get_text().strip()
                    for fmt in ['%Y-%m-%d', '%d/%m/%Y', '%B %d, %Y', '%d %B %Y']:
                        try:
                            dt = datetime.strptime(date_text, fmt)
                            return dt.strftime('%Y-%m-%d')
                        except:
                            continue
        return datetime.now().strftime('%Y-%m-%d')
    
    async def fetch_page(self, context: BrowserContext, url: str, timeout: int = None) -> Optional[str]:
        """Fetch page content with retry logic"""
        timeout = timeout or self.config.request_timeout
        
        for attempt in range(self.config.max_retries):
            page = await context.new_page()
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=timeout)
                content = await page.content()
                await page.close()
                return content
            except Exception as e:
                self.logger.warning(f"Attempt {attempt + 1} failed for {url}: {e}")
                if attempt < self.config.max_retries - 1:
                    await asyncio.sleep(self.config.retry_delay)
            finally:
                await page.close()
        
        self.metrics["total_errors"] += 1
        return None
    
    async def save_news(self, news_data: Dict):
        """Save news to multiple destinations"""
        news_id = hashlib.md5(f"{news_data['title']}_{news_data['url']}".encode()).hexdigest()[:16]
        news_data['id'] = news_id
        news_data['crawled_date'] = datetime.now().isoformat()
        news_data['word_count'] = len(news_data['text'].split())
        news_data['content_hash'] = self.get_content_hash(news_data['title'], news_data['url'])
        
        with open(self.config.index_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(news_data, ensure_ascii=False) + "\n")
        
        self.metrics["total_saved"] += 1
    
    def save_stats(self):
        """Save comprehensive statistics"""
        def json_serializer(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            raise TypeError(f"Type {type(obj)} not serializable")
        
        stats = {
            "last_scan": datetime.now().isoformat(),
            "total_news": self.news_count,
            "unique_hashes": len(self.visited_hashes),
            "max_target": self.config.max_news,
            "successful_sources": dict(self.successful_sources),
            "failed_sources": dict(self.failed_sources),
            "metrics": self.metrics,
            "config": {
                "max_news": self.config.max_news,
                "scan_interval": self.config.scan_interval,
                "requests_per_minute": self.config.requests_per_minute
            }
        }
        
        with open(self.config.stats_file, "w", encoding="utf-8") as f:
            json.dump(stats, f, indent=2, default=json_serializer)
        
        self.save_category_stats()
    
    def save_category_stats(self):
        """Save category-wise statistics"""
        if not os.path.exists(self.config.index_file):
            return
        
        category_counts = {cat.value: 0 for cat in NewsCategory}
        
        try:
            with open(self.config.index_file, "r", encoding="utf-8") as f:
                for line in f:
                    try:
                        data = json.loads(line)
                        cat = data.get('sub_category', data.get('category', 'general'))
                        if cat in category_counts:
                            category_counts[cat] += 1
                        else:
                            category_counts['general'] += 1
                    except:
                        continue
            
            with open(self.config.categories_file, "w", encoding="utf-8") as f:
                json.dump(category_counts, f, indent=2)
        except Exception as e:
            self.logger.error(f"Error saving category stats: {e}")
    
    async def crawl_source(self, context: BrowserContext, source: Dict):
        """Crawl a single news source"""
        url = source["url"]
        name = source["name"]
        rate_limit = source.get("rate_limit", 20)
        
        if not self.can_fetch_source(name, rate_limit):
            return
        
        start_time = datetime.now()
        content = await self.fetch_page(context, url)
        
        if content:
            soup = BeautifulSoup(content, 'html.parser')
            news_items = self.extract_news_from_page(soup, url, source)
            
            new_count = 0
            for news in news_items:
                if not self.is_duplicate(news['title'], news['url']):
                    await self.save_news(news)
                    self.news_count += 1
                    new_count += 1
                    
                    if self.news_count >= self.config.max_news:
                        break
            
            response_time = (datetime.now() - start_time).total_seconds()
            if self.metrics["total_fetched"] > 0:
                self.metrics["average_response_time"] = (
                    (self.metrics["average_response_time"] * self.metrics["total_fetched"] + response_time) /
                    (self.metrics["total_fetched"] + 1)
                )
            else:
                self.metrics["average_response_time"] = response_time
            
            self.logger.info(f"[OK] {name} -> {new_count} new news (total: {self.news_count})")
            self.successful_sources[name] += 1
        else:
            self.failed_sources[name] += 1
        
        self.metrics["total_fetched"] += 1
    
    async def run(self):
        """Main execution loop"""
        self.logger.info("Starting Enterprise News Spider")
        self.logger.info(f"Target: {self.config.max_news} news items")
        self.metrics["start_time"] = datetime.now()
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                viewport={'width': 1920, 'height': 1080}
            )
            
            scan_count = 0
            
            while self.news_count < self.config.max_news:
                scan_count += 1
                self.logger.info(f"Scan #{scan_count} at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                
                sources_to_crawl = [s for s in NEWS_SOURCES if s.get("enabled", True)]
                random.shuffle(sources_to_crawl)
                
                semaphore = asyncio.Semaphore(self.config.concurrent_sources)
                
                async def process_with_semaphore(source):
                    async with semaphore:
                        await self.crawl_source(context, source)
                
                tasks = [process_with_semaphore(source) for source in sources_to_crawl]
                await asyncio.gather(*tasks)
                
                self.save_stats()
                
                if self.news_count < 1000:
                    wait_time = 120
                elif self.news_count < 10000:
                    wait_time = 300
                else:
                    wait_time = self.config.scan_interval
                
                self.logger.info(f"Sleeping for {wait_time//60} minutes before next scan...")
                await asyncio.sleep(wait_time)
                
                await context.close()
                context = await browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    viewport={'width': 1920, 'height': 1080}
                )
            
            await browser.close()
        
        self.metrics["end_time"] = datetime.now()
        self.save_stats()
        
        duration = (self.metrics["end_time"] - self.metrics["start_time"]).total_seconds() / 60
        self.logger.info(f"News collection complete!")
        self.logger.info(f"Total: {self.news_count} news items")
        self.logger.info(f"Duration: {duration:.1f} minutes")

# ==================== ENTRY POINT ====================

if __name__ == "__main__":
    config = NewsConfig(
        max_news=50000,
        scan_interval=300,
        concurrent_sources=3,
        use_redis=False,
        use_elasticsearch=False,
        use_kafka=False
    )
    
    spider = EnterpriseNewsSpider(config)
    asyncio.run(spider.run())