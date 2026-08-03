from core.llm import structured_llm
from core.schema import FounderRisk
from typing import List

def run_founder_risk_worker(query: str, posts_summary: str, focus_areas: List[str]) -> FounderRisk:
    """
    Identifies specific execution, legal, and downside risks for venture investment diligence.
    """
    print(f"[Investment Risk Worker] Identifying downside and execution risks...")
    
    system = """You are the Investment Risk Analyst Agent. Your ONLY job is to identify critical downside risks, execution bottlenecks, regulatory headwinds, and structural failure modes for this company or thesis.
Focus heavily on market risk, defensibility, compliance hurdles, and technical operational friction.
Always ground your claims in the provided evidence.
"""

    prompt = f"""User Idea / Query: {query}
Supervisor Focus Areas: {', '.join(focus_areas)}
    
Signal Data:
{posts_summary}

Analyze the data and output the FounderRisk JSON."""

    return structured_llm(prompt, system, FounderRisk)
