from core.llm import structured_llm
from core.schema import CompetitorResearch
from typing import List

def run_competitor_worker(query: str, posts_summary: str, focus_areas: List[str]) -> CompetitorResearch:
    """
    Analyzes existing alternatives and past failures for the idea.
    """
    print(f"[Competitor Worker] Analyzing alternatives and past failures...")
    
    system = """You are the Competitor Research Worker. Your ONLY job is to identify what people currently use to solve this problem, and what similar startups have failed in the past.
Find the gaps in existing solutions.
Always ground your claims in the provided evidence.
"""

    prompt = f"""User Idea / Query: {query}
Supervisor Focus Areas: {', '.join(focus_areas)}
    
Signal Data:
{posts_summary}

Analyze the data and output the CompetitorResearch JSON."""

    return structured_llm(prompt, system, CompetitorResearch)
