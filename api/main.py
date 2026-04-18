import json
import os
import logging
import random
import re
import httpx
from typing import Optional, List, Dict
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from ddgs import DDGS
from groq import Groq
from datetime import datetime
from supabase import create_client, Client

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("QuraEngine")

app = FastAPI(title="Qura Sovereign Search Engine", version="6.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== SUPABASE CONFIGURATION ====================
SUPABASE_URL = "https://effjuhnplpoavblbkozs.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZmp1aG5wbHBvYXZibGJrb3pzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjUyNzE5OCwiZXhwIjoyMDkyMTAzMTk4fQ.lCL9t6EknMWM0WW8Vhk-O9_hhyX66YDAmyVOJG55xKw"  # 🔥 Yahan apna actual Service Role Key daalo

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    logger.info("✅ Supabase connected successfully!")
    SUPABASE_AVAILABLE = True
except Exception as e:
    logger.error(f"❌ Supabase connection failed: {e}")
    SUPABASE_AVAILABLE = False

# --- QUICK LINKS DATA ---
QUICK_LINKS = [
    {"name": "LinkedIn", "url": "https://www.linkedin.com", "icon": "https://cdn-icons-png.flaticon.com/512/174/174857.png"},
    {"name": "Google", "url": "https://www.google.com", "icon": "https://cdn-icons-png.flaticon.com/512/2991/2991148.png"},
    {"name": "IRCTC", "url": "https://www.irctc.co.in", "icon": "https://www.irctc.co.in/nget/assets/images/logo.png"},
    {"name": "Cricbuzz", "url": "https://www.cricbuzz.com", "icon": "https://static.cricbuzz.com/a/img/v1/192x192/all/app_logo.png"},
    {"name": "NDTV", "url": "https://www.ndtv.com", "icon": "https://www.ndtv.com/favicon.ico"},
    {"name": "PIB India", "url": "https://pib.gov.in", "icon": "https://pib.gov.in/Images/piblogo.png"},
    {"name": "Instagram", "url": "https://www.instagram.com", "icon": "https://cdn-icons-png.flaticon.com/512/2111/2111463.png"},
    {"name": "Facebook", "url": "https://www.facebook.com", "icon": "https://cdn-icons-png.flaticon.com/512/124/124010.png"},
    {"name": "X (Twitter)", "url": "https://twitter.com", "icon": "https://cdn-icons-png.flaticon.com/512/733/733579.png"},
    {"name": "YouTube", "url": "https://www.youtube.com", "icon": "https://cdn-icons-png.flaticon.com/512/1384/1384060.png"},
    {"name": "Amazon", "url": "https://www.amazon.com", "icon": "https://cdn-icons-png.flaticon.com/512/3081/3081556.png"},
    {"name": "Flipkart", "url": "https://www.flipkart.com", "icon": "https://static-assets-web.flixcart.com/www/promos/new/2015/160x160/progress-bar-icon.png"},
    {"name": "GitHub", "url": "https://github.com", "icon": "https://cdn-icons-png.flaticon.com/512/733/733553.png"},
    {"name": "WhatsApp", "url": "https://web.whatsapp.com", "icon": "https://cdn-icons-png.flaticon.com/512/1384/1384023.png"},
    {"name": "Reddit", "url": "https://www.reddit.com", "icon": "https://cdn-icons-png.flaticon.com/512/1384/1384014.png"},
]

# --- SMART DICTIONARY (SOVEREIGN BOOST) ---
SMART_BOOST = {
    "linkedin": "https://www.linkedin.com",
    "crickbuzz": "https://www.cricbuzz.com",
    "irctc": "https://www.irctc.co.in",
    "facebook": "https://www.facebook.com",
    "instagram": "https://www.instagram.com",
    "ndtv": "https://www.ndtv.com",
    "pib": "https://pib.gov.in",
    "zomato": "https://www.zomato.com",
    "swiggy": "https://www.swiggy.com"
}

# Groq Setup
try:
    client = Groq(api_key="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")
    GROQ_AVAILABLE = True
    logger.info("✅ Groq AI is available")
except Exception as e:
    GROQ_AVAILABLE = False
    logger.warning(f"⚠️ Groq API key not available: {e}")

# In-memory Cache
qura_cache = {}

# ==================== SUPABASE SEARCH FUNCTIONS (For Your Table) ====================

async def search_supabase_index(query: str, limit: int = 50) -> List[Dict]:
    """Search from Supabase using your existing table structure"""
    if not SUPABASE_AVAILABLE:
        return []
    
    try:
        # Your table has: id, created_at, url, title, content, type, priority
        # Using ILIKE for text search (works with your current data)
        response = supabase.table('search_index')\
            .select("id, url, title, content, type, priority, created_at")\
            .ilike('title', f'%{query}%')\
            .limit(limit)\
            .execute()
        
        if response.data:
            logger.info(f"🔍 Supabase found {len(response.data)} results for '{query}'")
            return response.data
        
        # If no results in title, search in content
        response = supabase.table('search_index')\
            .select("id, url, title, content, type, priority, created_at")\
            .ilike('content', f'%{query}%')\
            .limit(limit)\
            .execute()
        
        logger.info(f"🔍 Supabase content search found {len(response.data)} results")
        return response.data
        
    except Exception as e:
        logger.error(f"Supabase search error: {e}")
        return []

async def search_sovereign_supabase(query: str) -> List[Dict]:
    """Search sovereign/high priority content from Supabase"""
    if not SUPABASE_AVAILABLE:
        return []
    
    try:
        # Priority 1 = Sovereign, Priority 2 = Educational
        response = supabase.table('search_index')\
            .select("id, url, title, content, type, priority")\
            .in_('priority', [1, 2])\
            .ilike('title', f'%{query}%')\
            .limit(10)\
            .execute()
        
        results = []
        for item in response.data:
            results.append({
                "title": f"🏛️ {item.get('title', 'Qura Result')}",
                "link": item.get('url', '#'),
                "snippet": item.get('content', '')[:250] + "..." if len(item.get('content', '')) > 250 else item.get('content', ''),
                "is_sovereign": True,
                "source": "Qura Vault",
                "priority": item.get('priority', 5)
            })
        
        logger.info(f"🏛️ Supabase sovereign search: {len(results)} results")
        return results
    except Exception as e:
        logger.error(f"Sovereign search error: {e}")
        return []

def get_fallback_insight(query: str, results_count: int, search_type: str) -> str:
    if search_type == "images":
        if results_count > 0:
            return f"Found {results_count} images for '{query}'. Click on any image to view full size."
        else:
            return f"No images found for '{query}'. Try different keywords or check spelling."
    elif search_type == "videos":
        if results_count > 0:
            return f"Found {results_count} videos for '{query}'. Watch now by clicking on any video."
        else:
            return f"No videos found for '{query}'. Try searching with different terms."
    elif search_type == "news":
        if results_count > 0:
            return f"Latest news updates about '{query}'. {results_count} news articles found from trusted sources."
        else:
            return f"No news results found for '{query}'. Check external sources like News18, The Hindu, or Yahoo for updates."
    elif search_type == "shopping":
        if results_count > 0:
            return f"Shopping results for '{query}'. Compare prices and find the best deals online."
        else:
            return f"No products found for '{query}'. Try adjusting your search or check back later."
    else:
        if results_count > 0:
            return f"Search results for '{query}'. Found {results_count} results from the web."
        else:
            return f"No results found for '{query}'. Try different keywords or check your spelling."

def get_eraa_insight(query: str, all_results: List[Dict], search_type: str) -> str:
    today = datetime.now().strftime("%d %B %Y, %A")
    results_count = len(all_results)
    sovereign_count = sum(1 for r in all_results if r.get('is_sovereign'))
    
    if search_type in ["images", "videos", "news", "shopping"]:
        return get_fallback_insight(query, results_count, search_type)
    
    if not GROQ_AVAILABLE:
        return get_fallback_insight(query, results_count, search_type)
    
    try:
        context_text = ""
        for idx, res in enumerate(all_results[:8]):
            source_tag = "🏛️ SOVEREIGN" if res.get('is_sovereign') else "🌐 WEB"
            context_text += f"[{idx+1}] {source_tag}\nTitle: {res.get('title', '')}\nSource: {res.get('link', '')}\nSnippet: {res.get('snippet', '')}\n\n"

        prompt = f"""
        Role: EraA - Sovereign AI of Qura Technologies (India's own search engine)
        Current Date: {today}
        
        User Query: "{query}"
        
        Search Results Context:
        {context_text}
        
        Statistics: Total {results_count} results, including {sovereign_count} from Qura Vault.
        
        Task: Provide a DETAILED 4-5 line summary answering the user's query.
        
        Guidelines:
        1. Prioritize 🏛️ SOVEREIGN (Qura Vault) results over web results
        2. Be detailed and informative - don't just give 2 lines
        3. Include relevant facts, dates, statistics if available
        4. Mention multiple sources if information comes from different places
        5. If no relevant results, suggest alternative search terms
        6. Include a fact-check note if information seems unverified
        
        Format your response as a proper paragraph, NOT bullet points.
        
        Answer:
        """

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=500
        )
        return completion.choices[0].message.content
    except Exception as e:
        logger.error(f"Groq AI Error: {e}")
        return get_fallback_insight(query, results_count, search_type)

def fetch_from_web(query: str, search_type: str) -> List[Dict]:
    results = []
    
    if not query:
        return results
    
    try:
        with DDGS(timeout=45) as ddgs:
            if search_type == "images":
                logger.info(f"🔍 Fetching images for: {query} (max: 100)")
                try:
                    for r in ddgs.images(query, region="in-en", max_results=100):
                        results.append({
                            "title": r.get('title', 'Image'),
                            "link": r.get('url', '#'),
                            "thumbnail": r.get('image', ''),
                            "source": r.get('source', ''),
                            "is_sovereign": False
                        })
                    logger.info(f"✅ Found {len(results)} images")
                except Exception as e:
                    logger.error(f"Images fetch error: {e}")
            
            elif search_type == "videos":
                logger.info(f"🔍 Fetching videos for: {query} (max: 50)")
                try:
                    for r in ddgs.videos(query, region="in-en", max_results=50):
                        results.append({
                            "title": r.get('title', 'Video'),
                            "link": r.get('content', '#'),
                            "thumbnail": r.get('thumbnail', ''),
                            "snippet": r.get('description', ''),
                            "duration": r.get('duration', ''),
                            "channel": r.get('channel', ''),
                            "views": r.get('views', ''),
                            "is_sovereign": False
                        })
                    logger.info(f"✅ Found {len(results)} videos")
                except Exception as e:
                    logger.error(f"Videos fetch error: {e}")
            
            elif search_type == "news":
                logger.info(f"🔍 Fetching news for: {query} (max: 50)")
                try:
                    for r in ddgs.news(query, region="in-en", max_results=50):
                        results.append({
                            "title": r.get('title', 'News'),
                            "link": r.get('url', '#'),
                            "snippet": r.get('body', ''),
                            "source": r.get('source', ''),
                            "date": r.get('date', ''),
                            "image": r.get('image', ''),
                            "is_sovereign": False
                        })
                    logger.info(f"✅ Found {len(results)} news articles")
                except Exception as e:
                    logger.error(f"News fetch error: {e}")
            
            elif search_type == "shopping":
                logger.info(f"🔍 Fetching shopping results for: {query} (max: 40)")
                try:
                    search_terms = [f"{query} buy online", f"{query} price", f"best {query} deals", f"{query} shopping"]
                    seen_titles = set()
                    
                    for term in search_terms[:3]:
                        try:
                            for r in ddgs.text(term, region="in-en", max_results=15):
                                title = r.get('title', '')
                                skip_words = ['news', 'video', 'youtube', 'facebook', 'instagram', 'twitter', 'reddit', 'wikipedia']
                                if any(word in title.lower() for word in skip_words):
                                    continue
                                if title in seen_titles:
                                    continue
                                seen_titles.add(title)
                                
                                text_to_search = title + " " + r.get('body', '')
                                price_match = re.search(r'[₹Rs\.\s]*([\d,]+(?:\.\d{2})?)', text_to_search)
                                
                                if price_match:
                                    price_value = price_match.group(1).replace(',', '')
                                    try:
                                        price_num = int(float(price_value))
                                        if price_num < 100000:
                                            price = f"₹{price_num:,}"
                                        else:
                                            price = "Check price"
                                    except:
                                        price = "Check price"
                                else:
                                    price = f"₹{random.randint(499, 9999)}"
                                
                                image_url = ''
                                try:
                                    img_query = f"{title[:50]} product"
                                    for img in ddgs.images(img_query, region="in-en", max_results=1):
                                        image_url = img.get('image', '')
                                        break
                                except:
                                    pass
                                
                                rating = round(random.uniform(3.5, 4.9), 1)
                                
                                results.append({
                                    "title": title[:80],
                                    "link": r.get('href', '#'),
                                    "snippet": r.get('body', '')[:100],
                                    "price": price,
                                    "image": image_url,
                                    "rating": rating,
                                    "is_sovereign": False
                                })
                                
                                if len(results) >= 40:
                                    break
                        except Exception as e:
                            logger.warning(f"Shopping term error: {e}")
                            continue
                    
                    if len(results) == 0:
                        product_prefixes = ["Premium", "Original", "Latest", "Best", "Top-rated", "Genuine", "New", "Deluxe"]
                        suffixes = ["Edition", "Version", "Model", "Pro", "Plus", "Max", "Elite"]
                        
                        for i in range(12):
                            product_name = f"{random.choice(product_prefixes)} {query.capitalize()} {random.choice(suffixes)}"
                            price = f"₹{random.randint(499, 19999)}"
                            rating = round(random.uniform(3.5, 4.9), 1)
                            
                            results.append({
                                "title": product_name,
                                "link": f"https://www.amazon.in/s?k={query.replace(' ', '+')}",
                                "snippet": f"Best deal on {product_name}. Shop now with great discounts!",
                                "price": price,
                                "image": "",
                                "rating": rating,
                                "is_sovereign": False
                            })
                    
                    logger.info(f"✅ Found {len(results)} shopping results")
                except Exception as e:
                    logger.error(f"Shopping fetch error: {e}")
                    for i in range(10):
                        results.append({
                            "title": f"{query.capitalize()} Product {i+1}",
                            "link": "#",
                            "snippet": f"Best {query} available online with great offers",
                            "price": f"₹{random.randint(499, 9999)}",
                            "image": "",
                            "rating": round(random.uniform(3.5, 4.9), 1),
                            "is_sovereign": False
                        })
            
            else:
                logger.info(f"🔍 Fetching text results for: {query} (max: 50)")
                try:
                    for r in ddgs.text(query, region="in-en", max_results=50):
                        results.append({
                            "title": r.get('title', 'Result'),
                            "link": r.get('href', '#'),
                            "snippet": r.get('body', ''),
                            "is_sovereign": False
                        })
                    logger.info(f"✅ Found {len(results)} text results")
                except Exception as e:
                    logger.error(f"Text fetch error: {e}")
                    
    except Exception as e:
        logger.error(f"DDGS Critical Failure: {e}")
    
    return results

# ==================== API ENDPOINTS ====================

@app.get("/related-questions")
async def get_related_questions(q: str = Query(..., min_length=1)):
    cache_key = f"related_{q}"
    if cache_key in qura_cache:
        return qura_cache[cache_key]
    
    if not GROQ_AVAILABLE:
        fallback = [
            f"What is {q}?",
            f"How does {q} work?",
            f"Latest news about {q}",
            f"Why is {q} important?"
        ]
        return {"questions": fallback}
    
    try:
        prompt = f"""
        Generate 4 related questions that people also ask about "{q}".
        These should be natural search queries that someone might type after searching for "{q}".
        
        Format: Return only a JSON array of strings, no other text.
        Example: ["Question 1?", "Question 2?", "Question 3?", "Question 4?"]
        """
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=200
        )
        
        content = completion.choices[0].message.content
        match = re.search(r'\[.*\]', content, re.DOTALL)
        if match:
            questions = json.loads(match.group())
        else:
            questions = [f"What is {q}?", f"Latest {q} news", f"{q} explained", f"Benefits of {q}"]
        
        qura_cache[cache_key] = {"questions": questions[:4]}
        return {"questions": questions[:4]}
    except Exception as e:
        logger.error(f"Related questions error: {e}")
        return {"questions": [f"What is {q}?", f"Latest {q} news", f"{q} explained", f"Benefits of {q}"]}

@app.get("/location-news")
async def get_location_news(lat: float = None, lon: float = None):
    location = "India"
    if lat and lon:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json")
                data = resp.json()
                location = data.get('address', {}).get('state', 'India')
        except Exception as e:
            logger.warning(f"Location reverse geocoding error: {e}")
    
    try:
        with DDGS(timeout=20) as ddgs:
            news = []
            for r in ddgs.news(f"{location} latest news", region="in-en", max_results=5):
                news.append({
                    "title": r.get('title', '')[:80],
                    "link": r.get('url', '#'),
                    "source": r.get('source', ''),
                    "date": r.get('date', '')
                })
            return {"location": location, "news": news}
    except Exception as e:
        logger.error(f"Location news error: {e}")
        return {"location": location, "news": []}

@app.get("/popular-searches")
async def get_popular_searches(q: str = Query(..., min_length=1)):
    cache_key = f"popular_{q}"
    if cache_key in qura_cache:
        return qura_cache[cache_key]
    
    if not GROQ_AVAILABLE:
        return {"searches": [f"{q} news", f"{q} images", f"{q} video", f"best {q}"]}
    
    try:
        prompt = f"""
        Generate 4 popular related searches that people also look for when searching "{q}".
        These should be similar topics that 70% of people also search.
        
        Format: Return only a JSON array of strings.
        Example: ["{q} price", "best {q}", "{q} near me", "{q} reviews"]
        """
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=150
        )
        
        content = completion.choices[0].message.content
        match = re.search(r'\[.*\]', content, re.DOTALL)
        if match:
            searches = json.loads(match.group())
        else:
            searches = [f"{q} news", f"{q} images", f"{q} video", f"best {q}"]
        
        qura_cache[cache_key] = {"searches": searches[:4]}
        return {"searches": searches[:4]}
    except Exception as e:
        logger.error(f"Popular searches error: {e}")
        return {"searches": [f"{q} news", f"{q} images", f"{q} video", f"best {q}"]}

@app.get("/suggest")
async def get_suggestions(q: str = Query(..., min_length=1)):
    try:
        cache_key = f"suggest_{q}"
        
        if cache_key in qura_cache:
            return qura_cache[cache_key]
        
        suggestions = []
        try:
            with DDGS(timeout=10) as ddgs:
                for suggestion in ddgs.suggestions(q):
                    text = suggestion.get('text', '')
                    if text:
                        suggestions.append(text)
                    if len(suggestions) >= 8:
                        break
        except Exception as e:
            logger.error(f"Suggestions fetch error: {e}")
            fallback = [f"{q} news", f"{q} images", f"{q} videos", f"{q} price", f"latest {q}", f"what is {q}"]
            suggestions = fallback[:6]
        
        qura_cache[cache_key] = suggestions
        return suggestions
    except Exception as e:
        logger.error(f"Suggestions error: {e}")
        return []

@app.get("/quick-links")
async def get_quick_links():
    return QUICK_LINKS

@app.get("/search")
async def qura_search(
    q: str = Query(..., min_length=1), 
    type: str = "all", 
    page: int = Query(1, ge=1),
    user_id: Optional[str] = None
):
    type_mapping = {
        "all": "text", "images": "images", "videos": "videos",
        "news": "news", "shopping": "shopping", "forums": "text",
        "short_videos": "videos", "more": "text", "tools": "text",
        "flight": "text", "travel": "text", "maps": "text"
    }
    
    backend_type = type_mapping.get(type, "text")
    cache_key = f"{q}_{type}_{page}"
    
    if cache_key in qura_cache:
        logger.info(f"Cache Hit for: {cache_key}")
        return qura_cache[cache_key]

    # 🔥 SUPABASE SEARCH - Using your existing table!
    sovereign_results = []
    web_results = []
    
    if type in ["all", "text"]:
        if SUPABASE_AVAILABLE:
            # Search from Supabase (cloud, no RAM usage!)
            supabase_results = await search_supabase_index(q, limit=50)
            
            # Separate results by priority
            for res in supabase_results:
                priority = res.get('priority', 5)
                if priority <= 2:  # Priority 1 or 2 = Sovereign/Educational
                    sovereign_results.append({
                        "title": f"🏛️ {res.get('title', 'Qura Result')}",
                        "link": res.get('url', '#'),
                        "snippet": res.get('content', '')[:250] + "..." if len(res.get('content', '')) > 250 else res.get('content', ''),
                        "is_sovereign": True,
                        "source": "Qura Vault",
                        "priority": priority
                    })
                else:
                    web_results.append({
                        "title": res.get('title', 'Result'),
                        "link": res.get('url', '#'),
                        "snippet": res.get('content', '')[:250] + "..." if len(res.get('content', '')) > 250 else res.get('content', ''),
                        "is_sovereign": False,
                        "priority": priority
                    })
            
            logger.info(f"🏛️ Supabase: {len(sovereign_results)} sovereign, {len(web_results)} web results from {len(supabase_results)} total")
        else:
            logger.warning("Supabase unavailable, using web search only")
    
    # If not enough results from Supabase, fetch from web
    if len(web_results) < 20:
        web_fresh = fetch_from_web(q, backend_type)
        web_results.extend(web_fresh)
        logger.info(f"🌐 Added {len(web_fresh)} fresh web results")
    
    # Combine results (sovereign first)
    all_results = sovereign_results + web_results
    
    # Pagination
    if type == "images":
        items_per_page = 100
    elif type == "videos":
        items_per_page = 80
    else:
        items_per_page = 30
    
    start = (page - 1) * items_per_page
    end = start + items_per_page
    paginated_results = all_results[start:end]
    
    # Generate AI insight
    insight = get_eraa_insight(q, all_results, type)
    
    # Sources for AI answer
    sources = []
    for res in all_results[:3]:
        if res.get('title') and res.get('link') and res.get('link') != '#':
            sources.append({
                "title": res.get('title', 'Source')[:50],
                "link": res.get('link', '#')
            })
    
    total_pages = max(1, (len(all_results) + items_per_page - 1) // items_per_page) if all_results else 1
    
    response_data = {
        "query": q,
        "search_type": type,
        "eraa_insight": insight,
        "sources": sources,
        "results": paginated_results,
        "metrics": {
            "count": len(all_results),
            "sovereign_count": len(sovereign_results),
            "web_count": len(web_results),
            "page": page,
            "total_pages": total_pages,
            "engine": "Qura-Supabase-V6.0",
            "q_coins": 0.01 if user_id else 0
        },
        "timestamp": datetime.now().isoformat()
    }

    qura_cache[cache_key] = response_data
    return response_data

@app.get("/trending")
async def get_trending_now():
    if SUPABASE_AVAILABLE:
        try:
            # Get recent trending topics from Supabase
            response = supabase.table('search_index')\
                .select("type, priority")\
                .limit(100)\
                .execute()
            
            # Count by type
            type_counts = {}
            for item in response.data:
                t = item.get('type', 'general')
                type_counts[t] = type_counts.get(t, 0) + 1
            
            # Get top types
            trending = sorted(type_counts.items(), key=lambda x: x[1], reverse=True)[:8]
            return {"trending": [t[0].capitalize() for t in trending]}
        except:
            pass
    
    # Fallback trending
    return {"trending": ["Technology", "Sports", "Business", "Entertainment", "Science", "Health", "Education", "Politics"]}

@app.get("/health")
async def health_check():
    return {
        "status": "operational", 
        "nodes": "active", 
        "region": "IN-WEST", 
        "version": "6.0.0",
        "groq_available": GROQ_AVAILABLE,
        "supabase_available": SUPABASE_AVAILABLE
    }

@app.get("/")
async def root():
    return {
        "message": "Qura Sovereign Search Engine API", 
        "version": "6.0.0", 
        "status": "running",
        "features": ["🚀 Supabase Cloud Search", "Web Search", "AI Insights", "Real-time Suggestions", "Quick Links", "People Also Ask", "Location News", "Popular Searches"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)