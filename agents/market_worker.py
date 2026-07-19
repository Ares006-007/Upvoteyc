from core.llm import structured_llm
from core.schema import MarketResearch
from typing import List

def run_market_worker(query: str, posts_summary: str, focus_areas: List[str]) -> MarketResearch:
    """
    Looks at macro trends and growth.
    """
    print(f"[Market Worker] Analyzing market trends...")
    
    system = """You are the Market Research Worker. Your ONLY job is to identify macro shifts (technological, cultural, economic) that make this idea relevant right now.
Estimate qualitatively if this is a niche market or a mass market.
Always ground your claims in the provided evidence.
"""

    prompt = f"""User Idea / Query: {query}
Supervisor Focus Areas: {', '.join(focus_areas)}
    
Signal Data:
{posts_summary}

Analyze the data and output the MarketResearch JSON."""

    return structured_llm(prompt, system, MarketResearch)
