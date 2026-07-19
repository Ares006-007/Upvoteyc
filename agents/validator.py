from core.llm import structured_llm
from core.schema import ValidatedResearch

def run_validator(query: str, worker_outputs: dict) -> ValidatedResearch:
    """
    Validates all worker outputs against each other, detecting contradictions and unsupported claims.
    """
    print(f"[Validator] Merging and validating all worker outputs...")
    
    system = """You are the Validator Agent. You receive outputs from multiple research workers (Pain, Competitor, Customer, Market, etc.).
Your job is to:
1. Detect contradictions (e.g., one worker says it's a huge market, another says it's niche).
2. Check if claims have strong evidence. If they don't, mark them as 'unsupported_claims' (hypotheses).
3. Merge the strongest evidence into a de-duplicated list.
4. Give a final 'GO' or 'NO-GO' verdict and an overall confidence score.

DO NOT do new research. Only evaluate what the workers provided.
"""

    prompt = f"""User Idea / Query: {query}
    
Worker Outputs:
{worker_outputs}

Evaluate the data and output the ValidatedResearch JSON."""

    return structured_llm(prompt, system, ValidatedResearch)