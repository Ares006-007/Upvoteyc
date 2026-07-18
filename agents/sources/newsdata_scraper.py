import os
import requests
from dotenv import load_dotenv

load_dotenv()

NEWSDATA_API_KEY = os.environ.get("NEWSDATA_API_KEY", "")

def scrape_newsdata(topic="bangalore problems") -> list:
    print(f"[NewsData] Fetching news from newsdata.io for: {topic}...")
    
    if not NEWSDATA_API_KEY:
        print("[NewsData] Error: NEWSDATA_API_KEY is not configured.")
        return []
        
    url = "https://newsdata.io/api/1/news"
    params = {
        "apikey": NEWSDATA_API_KEY,
        "q": topic,
        "language": "en"
    }
    
    try:
        r = requests.get(url, params=params, timeout=10)
        if r.status_code != 200:
            print(f"[NewsData] Failed: Status code {r.status_code}")
            return []
            
        data = r.json()
        results = data.get("results", [])
        
        items = []
        for art in results[:10]:
            items.append({
                "title": art.get("title", ""),
                "source": art.get("source_id", "newsdata"),
                "score": 50,  # neutral score
                "url": art.get("link", ""),
                "source_type": "newsdata"
            })
            
        print(f"[NewsData] Found {len(items)} articles")
        return items
        
    except Exception as e:
        print(f"[NewsData] Failed: {e}")
        return []
