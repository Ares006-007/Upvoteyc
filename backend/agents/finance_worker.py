from core.llm import structured_llm
from core.schema import FinanceResearch
from typing import List

def run_finance_worker(query: str, posts_summary: str, focus_areas: List[str]) -> FinanceResearch:
    """
    Analyzes financial feasibility (Only runs if supervisor routes it).
    """
    print(f"[Finance Worker] Analyzing financial constraints...")
    
    system = """You are the Finance Research Worker. Your ONLY job is to analyze the capital requirements and margin profile of the proposed idea.
Determine if this is highly capital intensive, and what the expected profit margin profile looks like.
Always ground your claims in the provided evidence.
"""

    prompt = f"""User Idea / Query: {query}
Supervisor Focus Areas: {', '.join(focus_areas)}
    
Signal Data:
{posts_summary}

Analyze the data and output the FinanceResearch JSON."""

    return structured_llm(prompt, system, FinanceResearch)
