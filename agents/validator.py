from core.llm import llm_json

def validate(idea: dict, pain: dict) -> dict:
    print("[Validator] Checking market...")
    
    result = llm_json(
        system="You are a startup analyst. Be concise and honest.",
        prompt=f"""Startup: {idea.get('name')} — {idea.get('tagline')}
Solving: {pain.get('pain_point')} in Bangalore

Return ONLY this JSON:
{{"market_size": "estimate with numbers", "competitors": ["Competitor: gap they leave", "Competitor2: gap"], "our_edge": "why this wins", "verdict": "GO"}}"""
    )
    
    print(f"[Validator] Verdict: {result.get('verdict', '?')}")
    return result