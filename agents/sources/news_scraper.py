import requests
import os
from dotenv import load_dotenv

load_dotenv()

NEWS_API_KEY = os.environ.get("NEWS_API_KEY", "")

def scrape_news(topic="bangalore problems") -> list:
    print(f"[News] Fetching news for: {topic}...")
    
    if not NEWS_API_KEY:
        print("[News] Error: NEWS_API_KEY is not configured.")
        return []
        
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": topic,
        "apiKey": NEWS_API_KEY,
        "pageSize": 10
    }
    
    try:
        r = requests.get(url, params=params, timeout=10)
        if r.status_code != 200:
            print(f"[News] Failed: Status code {r.status_code}")
            return []
            
        data = r.json()
        articles = data.get("articles", [])
        
        items = []
        for art in articles:
            items.append({
                "title": art.get("title", ""),
                "source": art.get("source", {}).get("name", "newsapi"),
                "score": 50,  # neutral score
                "url": art.get("url", ""),
                "source_type": "newsapi"
            })
            
        print(f"[News] Found {len(items)} articles")
        return items
        
    except Exception as e:
        print(f"[News] Failed: {e}")
        return []