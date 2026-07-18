from core.llm import llm_json

def find_pain(posts: list) -> dict:
    print("[Pain Finder] Finding biggest pain point...")
    
    dump = "\n".join(
        f"[{p.get('source_type', 'unknown')}] {p['title']}" 
        for p in posts[:25]
    )
    
    result = llm_json(
        system="You are a startup researcher finding real painful problems. You are analyzing complaints from multiple sources (social media/reddit, news api, and newsdata api). Pay close attention to cross-source validation: if a specific pain point is verified across all three source types (reddit, newsapi, and newsdata), it is highly critical. Rank it much higher than issues appearing in only one source.",
        prompt=f"""Here are complaints aggregated from multiple sources:
 
{dump}
 
Find the single BIGGEST recurring pain point that has the highest cross-source alignment. Return ONLY this JSON, nothing else:
{{"pain_point": "short title", "description": "2 sentence explanation", "evidence": "exact quote from one post title", "rage_score": 8}}"""
    )
    
    print(f"[Pain Finder] Found: {result.get('pain_point', '?')}")
    return result