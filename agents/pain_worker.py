from core.llm import structured_llm
from core.schema import PainResearch
from typing import List

def run_pain_worker(query: str, posts_summary: str, focus_areas: List[str]) -> PainResearch:
    """
    Analyzes public signals to extract the core problem and its severity.
    """
    print(f"[Pain Worker] Identifying core pain points...")
    
    system = """You are the Pain Research Worker. Your ONLY job is to identify the core problem being experienced based on the provided signals.
You must extract the most severe pain point, rate its severity (1-10), and explain its root cause.
Always ground your claims in the provided evidence.
"""

    prompt = f"""User Idea / Query: {query}
Supervisor Focus Areas: {', '.join(focus_areas)}
    
Signal Data:
{posts_summary}

Analyze the data and output the PainResearch JSON."""

    return structured_llm(prompt, system, PainResearch)
