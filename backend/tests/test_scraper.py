from agents.scraper import scrape

posts = scrape("bangalore")
for p in posts[:3]:
    print(f"{p['score']} upvotes — {p['title']}")
    print(f"  {p['url']}\n")