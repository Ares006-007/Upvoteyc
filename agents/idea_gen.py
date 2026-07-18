from core.llm import llm_json

def generate_ideas(pain: dict, analysis: dict) -> list:
    print("[Idea Agent] Generating 3 startup ideas...")
    
    result = llm_json(
        system="You are a solo founder who has built and sold 3 startups. You think in terms of what ONE person can actually build and sell.",
        prompt=f"""Pain point: {pain.get('pain_point')}
Real customer: {analysis.get('real_customer')}
Willingness to pay: {analysis.get('willingness_to_pay')}
What failed before: {analysis.get('past_startups_failed')}
Hidden insight: {analysis.get('minority_insight')}
Why now: {analysis.get('market_timing')}
Solo founder risks: {analysis.get('solo_founder_risk')}

Generate 2 DIFFERENT startup ideas. Each must be:
- Buildable by ONE person in 3 months
- Have a CLEAR paying customer (not just users)
- Learn from what failed before
- Be logically correct — would a real person actually pay for this?
- BE EXTREMELY CONCISE. Every text description MUST be 1 short sentence max (under 12 words).
- For "solo_founder_execution", write a simple 4-word list (e.g., "Build, Launch, Market, Sell").

Return ONLY this JSON:
{{
    "ideas": [
        {{
            "name": "startup name",
            "angle": "which specific angle of the problem",
            "tagline": "one punchy line",
            "how_it_works": "3 clear sentences a 10 year old understands",
            "real_customer": "name the exact person who pays — their job, income, why they pay",
            "pricing": "exact price per month and why they pay this not more not less",
            "revenue_month_1": "realistic revenue in month 1",
            "revenue_month_12": "realistic revenue in month 12",
            "why_not_failed_like_others": "specifically how this avoids past failures",
            "solo_founder_execution": "week by week plan for first 4 weeks",
            "unfair_advantage": "why this specific approach wins",
            "biggest_risk": "the one thing that could kill this",
            "future_growth": "how this grows in 3 years based on market trends"
        }},
        {{...}},
        {{...}}
    ]
}}"""
    )
    
    ideas = result.get("ideas", [])
    print(f"[Idea Agent] Generated {len(ideas)} ideas")
    for i, idea in enumerate(ideas):
        print(f"  {i+1}. {idea.get('name')} — {idea.get('tagline')}")
    return ideas