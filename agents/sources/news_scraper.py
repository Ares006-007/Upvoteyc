import requests

HEADERS = {"User-Agent": "UpvoteVC/1.0"}

def scrape_news(topic="bangalore problems") -> list:
    print(f"[News] Fetching news for: {topic}...")
    
    # Using Google News RSS - completely free, no key
    url = f"https://news.google.com/rss/search?q={topic.replace(' ', '+')}&hl=en-IN&gl=IN&ceid=IN:en"
    
    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        
        # Parse RSS manually - no extra library needed
        items = []
        content = r.text
        
        # Extract titles and links
        import re
        titles = re.findall(r'<title>(.*?)</title>', content)[2:]  # skip feed title
        links = re.findall(r'<link>(.*?)</link>', content)
        
        for i, title in enumerate(titles[:10]):
            # Clean HTML entities
            title = title.replace('&amp;', '&').replace('&quot;', '"')
            items.append({
                "title": title,
                "source": "google_news",
                "score": 50,  # neutral score
                "url": links[i] if i < len(links) else ""
            })
        
        print(f"[News] Found {len(items)} articles")
        return items
    
    except Exception as e:
        print(f"[News] Failed: {e}")
        return []