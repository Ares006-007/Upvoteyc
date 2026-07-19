import requests

HEADERS = {"User-Agent": "OpenVc/1.0"}

def scrape_trends(city="Bangalore") -> list:
    print(f"[Trends] Fetching trending topics for {city}...")
    
    try:
        # Google Trends RSS - free
        url = f"https://trends.google.com/trends/trendingsearches/daily/rss?geo=IN"
        r = requests.get(url, headers=HEADERS, timeout=10)
        
        import re
        titles = re.findall(r'<title>(.*?)</title>', r.text)[1:]
        traffic = re.findall(r'<ht:approx_traffic>(.*?)</ht:approx_traffic>', r.text)
        
        items = []
        for i, title in enumerate(titles[:10]):
            items.append({
                "title": title,
                "source": "google_trends",
                "score": int(traffic[i].replace(',', '').replace('+', '')) if i < len(traffic) else 100,
                "url": ""
            })
        
        print(f"[Trends] Found {len(items)} trending topics")
        return items
    
    except Exception as e:
        print(f"[Trends] Failed: {e}")
        return []