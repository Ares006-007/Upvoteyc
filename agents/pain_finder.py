from core.llm import llm_json

def find_pain(posts: list) -> dict:
    print("[Pain Finder] Finding biggest pain point...")
    
    dump = "\n".join(
        f"[{p['score']} upvotes] {p['title']}" 
        for p in posts[:15]
    )
    
    result = llm_json(
        system="You are a startup researcher finding real painful problems.",
        prompt=f"""Top complaints from r/bangalore this week:

{dump}

Find the single BIGGEST recurring pain point. Return ONLY this JSON, nothing else:
{{"pain_point": "short title", "description": "2 sentence explanation", "evidence": "exact quote from one post title", "rage_score": 8}}"""
    )
    
    print(f"[Pain Finder] Found: {result.get('pain_point', '?')}")
    return result