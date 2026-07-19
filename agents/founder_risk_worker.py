from core.llm import structured_llm
from core.schema import FounderRisk
from typing import List

def run_founder_risk_worker(query: str, posts_summary: str, focus_areas: List[str]) -> FounderRisk:
    """
    Identifies specific execution risks.
    """
    print(f"[Founder Risk Worker] Identifying execution risks...")
    
    system = """You are the Founder Risk Worker. Your ONLY job is to identify the biggest reasons why this specific idea might fail during execution.
Focus heavily on legal, regulatory, or technical hurdles.
Always ground your claims in the provided evidence.
"""

    prompt = f"""User Idea / Query: {query}
Supervisor Focus Areas: {', '.join(focus_areas)}
    
Signal Data:
{posts_summary}

Analyze the data and output the FounderRisk JSON."""

    return structured_llm(prompt, system, FounderRisk)
