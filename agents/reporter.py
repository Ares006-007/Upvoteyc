from core.llm import structured_llm
from core.schema import FinalReport

def run_reporter(query: str, validated_research: dict, worker_outputs: dict) -> FinalReport:
    """
    Converts validated structured data into a polished founder / investor memo.
    """
    print(f"[Reporter] Generating final structured report...")
    
    system = """You are the Report Generator Agent. Your job is to take raw, validated research data and convert it into a polished, structured FinalReport for founders and investors.
You must synthesize the data into clear, compelling sections.

Ensure that:
1. The 'action_plan' contains 3 concrete steps for the next 30 days.
2. The 'verdict_badge' perfectly matches the Validator's verdict (GO or NO-GO).
3. The 'problem_evidence', 'market_customer', and 'competition_risks' sections are written in clear, professional prose (not just bullet points).
"""

    prompt = f"""User Idea / Query: {query}
    
Validated Research Output:
{validated_research}

Worker Details:
{worker_outputs}

Synthesize this into the FinalReport JSON."""

    return structured_llm(prompt, system, FinalReport)
