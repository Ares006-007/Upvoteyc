import requests
import urllib.parse
import re

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}

def scrape(subreddit="bangalore", keyword=None, limit=100) -> list:
    subreddit = subreddit.strip()
    is_search = " " in subreddit
    
    if is_search:
        print(f"[Scraper] Searching Reddit for '{subreddit}' via RSS-to-JSON...")
        rss_url = f"https://www.reddit.com/search.rss?q={urllib.parse.quote(subreddit)}"
    else:
        clean_sub = "".join(c for c in subreddit if c.isalnum()).lower()
        print(f"[Scraper] Fetching r/{clean_sub} via RSS-to-JSON...")
        rss_url = f"https://www.reddit.com/r/{clean_sub}/.rss"
        
    posts = []
    
    url = f"https://api.rss2json.com/v1/api.json?rss_url={urllib.parse.quote(rss_url)}"
    try:
        r = requests.get(url, timeout=10)
        
        # Fallback to global search if subreddit not found or returns an error
        if r.status_code != 200 and not is_search:
            print(f"[Scraper] Subreddit '{subreddit}' returned status {r.status_code}. Falling back to global Reddit search...")
            rss_url = f"https://www.reddit.com/search.rss?q={urllib.parse.quote(subreddit)}"
            url = f"https://api.rss2json.com/v1/api.json?rss_url={urllib.parse.quote(rss_url)}"
            r = requests.get(url, timeout=10)
            
        if r.status_code == 200:
            data = r.json()
            items = data.get("items", [])
            for p in items:
                # Clean description HTML
                desc = p.get("description", "")
                clean_desc = re.sub(r'<[^>]*>', '', desc).strip()[:300]
                
                posts.append({
                    "title": p.get("title", ""),
                    "score": 100,
                    "comments": 10,
                    "url": p.get("link", ""),
                    "preview": clean_desc,
                    "timeframe": "recent",
                    "source_type": "reddit"
                })
        else:
            print(f"[Scraper] Warning: rss2json status code {r.status_code} for {rss_url}")
    except Exception as e:
        print(f"[Scraper] Failed to fetch via RSS: {e}")
    
    # Remove duplicates by URL
    seen = set()
    unique = []
    for p in posts:
        if p["url"] not in seen:
            seen.add(p["url"])
            unique.append(p)
    
    # Filter by keyword if provided
    if keyword:
        keyword_lower = keyword.lower()
        unique = [
            p for p in unique 
            if keyword_lower in p["title"].lower() 
            or keyword_lower in p["preview"].lower()
        ]
        print(f"[Scraper] Keyword '{keyword}' filtered to {len(unique)} posts")
    
    filtered = unique
    
    ranked = sorted(
        filtered,
        key=lambda x: x["score"] + x["comments"] * 3,
        reverse=True
    )
    
    print(f"[Scraper] Found {len(ranked)} posts total")
    return ranked[:30]