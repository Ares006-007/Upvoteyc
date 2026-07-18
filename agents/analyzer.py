from core.llm import llm_json

def analyze(pain: dict, all_data: dict) -> dict:
    print("[Analyzer] Deep analyzing pain point...")
    
    reddit_titles = "\n".join(
        f"- [{p['score']} upvotes] {p['title']}" 
        for p in all_data.get("reddit", [])[:10]
    )
    news_titles = "\n".join(
        f"- {p['title']}" 
        for p in all_data.get("news", [])[:5]
    )
    
    result = llm_json(
        system="You are a brutal startup analyst who has seen 1000 startups fail. You are ruthlessly honest.",
        prompt=f"""Pain point: {pain.get('pain_point')}

REDDIT SIGNALS:
{reddit_titles}

NEWS SIGNALS:
{news_titles}

Do a BRUTALLY HONEST deep analysis. Answer every question:

1. ROOT CAUSE — not the surface problem, the real systemic reason
2. REAL CUSTOMER — exactly who pays, their income, their daily life, why they PAY not just complain
3. WILLINGNESS TO PAY — will a real person actually pay? how much per month? why?
4. PAST STARTUPS — name startups that tried this, exactly why they failed
5. MINORITY INSIGHT — unpopular opinion that mainstream misses completely
6. MARKET TIMING — why now specifically, what changed in last 2 years
7. SOLO FOUNDER RISK — what will kill a solo founder building this

Return ONLY this JSON:
{{
    "root_cause": "the real systemic reason",
    "real_customer": "exactly who they are, income level, daily life",
    "willingness_to_pay": "yes/no and exactly how much per month and why",
    "past_startups_failed": "name real startups and exactly why they failed",
    "minority_insight": "unpopular opinion that changes everything",
    "market_timing": "what changed in last 2 years that makes now perfect",
    "solo_founder_risk": "top 3 things that will kill a solo founder",
    "severity_score": 9,
    "market_readiness": "1 sentence on why now"
}}"""
    )
    
    print(f"[Analyzer] Done. Customer: {result.get('real_customer', '?')[:60]}...")
    return result