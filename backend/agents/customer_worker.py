from core.llm import structured_llm
from core.schema import CustomerProfile
from typing import List

def run_customer_worker(query: str, posts_summary: str, focus_areas: List[str]) -> CustomerProfile:
    """
    Profiles the exact buyer and their willingness to pay.
    """
    print(f"[Customer Worker] Profiling target customer...")
    
    system = """You are the Customer Research Worker. Your ONLY job is to identify who exactly is experiencing this pain and if they have the budget and willingness to pay to solve it.
Determine where these customers hang out (acquisition channels).
Always ground your claims in the provided evidence.
"""

    prompt = f"""User Idea / Query: {query}
Supervisor Focus Areas: {', '.join(focus_areas)}
    
Signal Data:
{posts_summary}

Analyze the data and output the CustomerProfile JSON."""

    return structured_llm(prompt, system, CustomerProfile)
