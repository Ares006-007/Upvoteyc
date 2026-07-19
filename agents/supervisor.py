from core.llm import structured_llm
from core.schema import RoutingDecision

def run_supervisor(query: str, posts_summary: str) -> RoutingDecision:
    """
    Supervisor determines what specific workers need to run and what their focus areas should be.
    """
    print(f"[Supervisor] Analyzing request to orchestrate workers...")
    
    system = """You are the Supervisor Agent for an AI venture capital research pipeline.
Your job is to look at the user's idea and the initial public signals (social/news), and decide:
1. Does this idea strictly require deep financial mechanics research (finance worker)?
2. Is there explicit time-series or trend data that warrants a visualization (visualization worker)?
3. What 1-3 focus areas should the workers prioritize (e.g., 'B2B sales cycle', 'hardware supply chain', 'legal compliance')?

Do not do the research yourself. Just route and plan."""

    prompt = f"""User Idea / Query: {query}
    
Initial Signal Data Preview:
{posts_summary}

Analyze this and output the RoutingDecision JSON."""

    decision = structured_llm(prompt, system, RoutingDecision)
    print(f"[Supervisor] Routing Decision: Finance={decision.requires_finance_worker}, Viz={decision.requires_visualization}, Focus={decision.focus_areas}")
    return decision
