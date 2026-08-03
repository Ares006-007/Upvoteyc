from agents.scraper import scrape
from agents.sources.news_scraper import scrape_news
from agents.sources.newsdata_scraper import scrape_newsdata
from agents.sources.trends_scraper import scrape_trends

def aggregate(city="bangalore", keyword=None) -> dict:
    print(f"[Aggregator] Collecting from all sources... keyword={keyword}")
    
    # Pass keyword to all scrapers
    search_term = f"{city} {keyword}" if keyword else city
    
    reddit_posts = scrape(city, keyword=keyword)
    news_posts   = scrape_news(search_term)
    newsdata_posts = scrape_newsdata(search_term)
    trends_posts = scrape_trends(city)
    
    all_data = {
        "reddit": reddit_posts,
        "news": news_posts,
        "newsdata": newsdata_posts,
        "trends": trends_posts,
        "keyword": keyword,
        "total_signals": len(reddit_posts) + len(news_posts) + len(newsdata_posts) + len(trends_posts)
    }
    
    print(f"[Aggregator] Total: {all_data['total_signals']} signals")
    return all_data