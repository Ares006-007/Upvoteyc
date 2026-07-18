from core.llm import llm_json

def extract_search_queries(user_idea: str) -> dict:
    print("[Idea Refiner] Extracting search queries from idea...")
    res = llm_json(
        system="You are a search query optimizer. Given a startup idea, extract the search topic and search keywords to find complaints/discussions about the problem this idea solves.",
        prompt=f"""User's startup idea: {user_idea}
        
        Identify the primary search topic and keyword we should query to find complaints and discussions related to the problem this idea solves.
        Return ONLY this JSON:
        {{"topic": "broad industry/location/subject (e.g., 'data centers', 'logistics', 'education', 'parking')", "keyword": "specific problem keyword (e.g., 'backlash', 'delays', 'safety', 'scarcity')"}}"""
    )
    return res

def refine_idea(user_idea: str, pain: dict, analysis: dict) -> dict:
    print(f"[Idea Refiner] Fleshing out details for idea: '{user_idea}'...")
    
    result = llm_json(
        system="You are a startup incubator director. Flesh out a user's raw startup idea based on a pain point analysis.",
        prompt=f"""User's startup idea: {user_idea}
        
        Target Pain Point: {pain.get('pain_point')}
        Root Cause: {analysis.get('root_cause')}
        Real Customer: {analysis.get('real_customer')}
        
        Refine the user's idea and generate the details. BE EXTREMELY CONCISE (each text description under 12 words).
        Return ONLY this JSON:
        {{
            "name": "startup name",
            "angle": "specific angle matching the pain point",
            "tagline": "one punchy line",
            "how_it_works": "1 short sentence explaining execution",
            "real_customer": "exact customer segment",
            "pricing": "pricing model and monthly cost",
            "revenue_month_1": "realistic revenue in month 1",
            "revenue_month_12": "realistic revenue in month 12",
            "why_not_failed_like_others": "1 short sentence on how it avoids past failures",
            "solo_founder_execution": "Build, Launch, Market, Sell",
            "unfair_advantage": "why this approach wins",
            "biggest_risk": "the main risk factor",
            "future_growth": "how it scales in 3 years"
        }}"""
    )
    return result
