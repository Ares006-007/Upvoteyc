from core.llm import structured_llm
from core.schema import FinalReport

def run_reporter(query: str, validated_research: dict, worker_outputs: dict) -> FinalReport:
    """
    Converts validated structured data into a polished venture capital investment memo.
    """
    print(f"[Reporter] Generating investment committee memo...")
    
    system = """You are the Investment Memo Generator Agent for OpenVC. Your job is to take raw, validated research data and convert it into a polished, structured FinalReport for venture capital investment committees and partners.
You must synthesize the data into clear, analytical, evidence-backed sections.

Ensure that:
1. The 'action_plan' contains 3 concrete diligence and milestone verification steps.
2. The 'verdict_badge' perfectly matches the Validator's verdict (GO or NO-GO).
3. The 'problem_evidence', 'market_customer', and 'competition_risks' sections are written in sharp, institutional-grade venture prose.
"""

    prompt = f"""User Idea / Query: {query}
    
Validated Research Output:
{validated_research}

Worker Details:
{worker_outputs}

Synthesize this into the FinalReport JSON."""

    return structured_llm(prompt, system, FinalReport)
