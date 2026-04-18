import asyncio
import json
import os
import logging
import random
import hashlib
import heapq
from urllib.parse import urljoin, urlparse
from datetime import datetime
from collections import defaultdict
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import re

logging.basicConfig(level=logging.INFO, format='%(asctime)s - QuraSpider - %(levelname)s - %(message)s')
logger = logging.getLogger("Spider")

class WebSpider:
    def __init__(self, limit=50000):
        # 🔥 CHANGE: Sirf qura_index.jsonl use karo
        self.index_file = "qura_index.jsonl"  # ← Yahan change kiya!
        self.links_file = "links_to_crawl.txt"  # ← Yahan bhi change!
        self.visited_urls = set()
        self.queue = []
        self.crawl_limit = limit
        self.pages_crawled = 0
        self.stats = {"news": 0, "tech": 0, "business": 0, "other": 0}
        self.load_state()

    def get_priority(self, url):
        url_lower = url.lower()
        # News sites - highest priority
        if any(x in url_lower for x in ['ndtv', 'timesofindia', 'thehindu', 'indianexpress', 'bbc', 'reuters', 'cricbuzz', 'espn']):
            return 1
        # Tech sites
        if any(x in url_lower for x in ['gadgets360', 'techcrunch', 'wired', 'theverge', 'cnet', 'zdnet']):
            return 2
        # Business sites
        if any(x in url_lower for x in ['economictimes', 'business-standard', 'bloomberg', 'forbes', 'moneycontrol']):
            return 3
        # Educational sites
        if any(x in url_lower for x in ['.edu', '.ac.in', 'coursera', 'udemy', 'khanacademy']):
            return 4
        # Wikipedia - LOWEST priority
        if 'wikipedia' in url_lower:
            return 10
        return 5

    def is_useful_url(self, url):
        """Check if URL is worth crawling"""
        useful = ['news', 'article', 'blog', 'tech', 'business', 'sports', 
                  'cricket', 'india', 'world', 'science', 'health', 'education']
        url_lower = url.lower()
        
        # Skip useless domains
        skip = ['facebook', 'twitter', 'instagram', 'linkedin', 'reddit', 
                'pinterest', 'tumblr', 'whatsapp', 'telegram', 'discord',
                'youtube', 'vimeo', 'dailymotion', 'wikipedia', 'fandom',
                'quora', 'medium.com', 'github.com', 'stackoverflow']
        
        if any(s in url_lower for s in skip):
            return False
        
        # Check if useful
        return any(u in url_lower for u in useful) or '.com' in url_lower

    def load_state(self):
        # Load existing data from qura_index.jsonl
        if os.path.exists(self.index_file):
            with open(self.index_file, "r", encoding="utf-8") as f:
                for line in f:
                    try:
                        d = json.loads(line)
                        self.visited_urls.add(d['url'])
                    except:
                        continue
            self.pages_crawled = len(self.visited_urls)
            logger.info(f"Loaded {self.pages_crawled} existing pages from qura_index.jsonl")
        
        # Load queue from links_to_crawl.txt
        if os.path.exists(self.links_file):
            with open(self.links_file, "r", encoding="utf-8") as f:
                for line in f:
                    parts = line.strip().split('|')
                    if len(parts) >= 2:
                        self.queue.append((int(parts[1]), parts[0]))
                    else:
                        self.queue.append((5, parts[0]))
            heapq.heapify(self.queue)
            logger.info(f"Loaded {len(self.queue)} pending links from queue")

    def save_queue(self):
        temp = []
        with open(self.links_file, "w", encoding="utf-8") as f:
            while self.queue:
                priority, url = heapq.heappop(self.queue)
                temp.append((priority, url))
                f.write(f"{url}|{priority}\n")
                if len(temp) >= 10000:
                    break
        for item in temp:
            heapq.heappush(self.queue, item)

    async def save_to_index(self, data):
        data['crawled_at'] = datetime.now().isoformat()
        
        # Add content hash for deduplication
        if 'text' in data:
            clean_text = ' '.join(data['text'].lower().split())[:1000]
            data['content_hash'] = hashlib.md5(clean_text.encode('utf-8')).hexdigest()
        
        with open(self.index_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(data, ensure_ascii=False) + "\n")
        
        # Update stats
        if data.get('type') == 'news':
            self.stats['news'] += 1
        elif data.get('type') == 'technology':
            self.stats['tech'] += 1
        elif data.get('type') == 'business':
            self.stats['business'] += 1
        else:
            self.stats['other'] += 1
        
        logger.info(f"✅ Indexed ({self.pages_crawled}): {data['title'][:50]}... | Type: {data.get('type', 'unknown')}")

    async def crawl_page(self, context, url, priority):
        if url in self.visited_urls:
            return []
        
        if not self.is_useful_url(url):
            return []
        
        # Skip file extensions
        if any(url.endswith(ext) for ext in ['.pdf', '.zip', '.mp4', '.exe', '.jpg', '.png', '.svg', '.css', '.js', '.xml']):
            return []
        
        self.visited_urls.add(url)
        page = await context.new_page()
        
        try:
            await asyncio.sleep(random.uniform(0.5, 1.5))
            await page.goto(url, wait_until="domcontentloaded", timeout=25000)
            content = await page.content()
            soup = BeautifulSoup(content, 'html.parser')
            
            # Clean text
            for script in soup(["script", "style", "nav", "footer", "header", "aside", "noscript"]):
                script.decompose()
            
            title = soup.title.string.strip() if soup.title else "Untitled"
            text = ' '.join(soup.get_text().split())[:3000]
            
            if len(text) < 300:
                await page.close()
                return []
            
            # Detect page type
            page_type = "general"
            url_lower = url.lower()
            if any(x in url_lower for x in ['news', 'ndtv', 'timesofindia', 'thehindu', 'indianexpress', 'bbc', 'reuters']):
                page_type = "news"
            elif any(x in url_lower for x in ['tech', 'gadget', 'android', 'apple', 'microsoft', 'google', 'ai']):
                page_type = "technology"
            elif any(x in url_lower for x in ['business', 'economy', 'market', 'stock', 'finance']):
                page_type = "business"
            
            data = {
                "title": title[:200],
                "url": url,
                "text": text,
                "domain": urlparse(url).netloc,
                "type": page_type,
                "priority": priority,
                "source": "web_crawler"
            }
            
            await self.save_to_index(data)
            self.pages_crawled += 1
            
            # Extract new links (limit per domain to avoid getting stuck)
            new_links = []
            domain_count = {}
            
            for a in soup.find_all('a', href=True):
                full_url = urljoin(url, a['href'])
                parsed = urlparse(full_url)
                domain = parsed.netloc
                
                # Max 50 links per domain
                if domain_count.get(domain, 0) > 50:
                    continue
                
                if parsed.netloc and full_url not in self.visited_urls:
                    if self.is_useful_url(full_url):
                        new_priority = self.get_priority(full_url)
                        new_links.append((new_priority, full_url))
                        domain_count[domain] = domain_count.get(domain, 0) + 1
                    
                    if len(new_links) >= 30:
                        break
            
            return new_links
            
        except Exception as e:
            logger.error(f"Error: {url[:80]} - {e}")
            return []
        finally:
            await page.close()

    async def run(self, seed_urls):
        if not self.queue:
            for url in seed_urls:
                priority = self.get_priority(url)
                heapq.heappush(self.queue, (priority, url))
            logger.info(f"Added {len(seed_urls)} seed URLs to queue")
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                viewport={'width': 1920, 'height': 1080}
            )
            
            while self.queue and self.pages_crawled < self.crawl_limit:
                priority, current_url = heapq.heappop(self.queue)
                
                logger.info(f"🕷️ Crawling [P{priority}]: {current_url[:80]}... (Queue: {len(self.queue)} | Total: {self.pages_crawled})")
                
                new_items = await self.crawl_page(context, current_url, priority)
                
                for p, url in new_items:
                    heapq.heappush(self.queue, (p, url))
                
                if self.pages_crawled % 20 == 0:
                    self.save_queue()
                    logger.info(f"📊 Stats - Pages: {self.pages_crawled} | News: {self.stats['news']} | Tech: {self.stats['tech']} | Business: {self.stats['business']}")
            
            await browser.close()
        
        logger.info(f"🎉 Crawl Complete! Pages: {self.pages_crawled} | News: {self.stats['news']} | Tech: {self.stats['tech']} | Business: {self.stats['business']}")

if __name__ == "__main__":
    seeds = [
        # News Sites
        "https://www.ndtv.com/latest",
        "https://timesofindia.indiatimes.com/india",
        "https://www.thehindu.com/news/national/",
        "https://indianexpress.com/latest-news/",
        "https://www.cricbuzz.com/cricket-news/latest",
        "https://www.espncricinfo.com/",
        
        # Tech Sites
        "https://www.gadgets360.com/news",
        "https://techcrunch.com/",
        "https://www.wired.com/",
        
        # Business Sites
        "https://economictimes.indiatimes.com/news",
        "https://www.business-standard.com/latest",
        "https://www.moneycontrol.com/news/",
        
        # General
        "https://www.bbc.com/news",
        "https://www.reuters.com/",
    ]
    
    spider = WebSpider(limit=50000)
    asyncio.run(spider.run(seeds))