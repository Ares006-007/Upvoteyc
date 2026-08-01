import json
from concurrent.futures import ThreadPoolExecutor

from agents.aggregator import aggregate
from core.llm import structured_llm
from pydantic import BaseModel, Field

class SearchQueries(BaseModel):
    topic: str = Field(..., description="broad industry/location/subject (e.g., 'data centers', 'logistics')")
    keyword: str = Field(..., description="specific problem keyword (e.g., 'backlash', 'delays')")

def extract_search_queries(user_idea: str) -> dict:
    print("[Signal Extractor] Extracting search queries from thesis/sector...")
    system = "You are a venture research query optimizer. Given a startup thesis, company, or sector, extract the search topic and search keywords to find demand signals, market friction, and customer discussions."
    prompt = f"Investment thesis / query: {user_idea}"
    res = structured_llm(prompt, system, SearchQueries)
    return res.model_dump() if res else {"topic": "startups", "keyword": "problem"}
from agents.supervisor import run_supervisor
from agents.pain_worker import run_pain_worker
from agents.competitor_worker import run_competitor_worker
from agents.customer_worker import run_customer_worker
from agents.market_worker import run_market_worker
from agents.founder_risk_worker import run_founder_risk_worker
from agents.finance_worker import run_finance_worker
from agents.visualization_worker import run_visualization_worker
from agents.validator import run_validator
from agents.reporter import run_reporter
from core.history_store import save_history_item

def pipeline_generator(req_mode: str, query: str):
    """
    Generator that executes the Multi-Agent Pipeline and yields progress updates as dicts.
    """
    try:
        is_idea_research = req_mode == "research"
        user_idea = query if is_idea_research else None
        
        subreddit = "bangalore"
        keyword = query if not is_idea_research else None
        
        yield {"step": "start", "message": "Initializing autonomous multi-agent venture intelligence pipeline..."}
        
        if is_idea_research:
            yield {"step": "aggregating", "message": "Extracting market taxonomy and search queries..."}
            queries = extract_search_queries(user_idea)
            subreddit = queries.get("topic", "bangalore")
            keyword = queries.get("keyword")
            
        yield {"step": "aggregating", "message": "Mining market signals across communities, news, and search trends..."}
        all_data = aggregate(subreddit, keyword=keyword)
        posts = all_data.get("reddit", []) + all_data.get("news", []) + all_data.get("newsdata", []) + all_data.get("trends", [])
        
        if not posts and keyword:
            yield {"step": "aggregating", "message": "Refining signal filters, retrying broader market search..."}
            all_data = aggregate(subreddit, keyword=None)
            posts = all_data.get("reddit", []) + all_data.get("news", []) + all_data.get("newsdata", []) + all_data.get("trends", [])
            
        if not posts:
            yield {"step": "error", "message": "No market signals found. Try specifying a broader sector or alternative keywords."}
            return
            
        # Create a summary of posts to pass to agents (limit size)
        posts_summary = "\n".join(f"[{p.get('source_type', 'unknown')}] {p['title']}" for p in posts[:25])
        
        yield {"step": "supervisor", "message": f"Identified {len(posts)} market signals. Supervisor routing diligence workers..."}
        routing = run_supervisor(query, posts_summary)
        
        yield {"step": "workers", "message": f"Dispatching core research workers with priority on: {', '.join(routing.focus_areas)}..."}
        
        worker_outputs = {}
        
        # Run core workers concurrently to save time
        with ThreadPoolExecutor(max_workers=5) as executor:
            future_pain = executor.submit(run_pain_worker, query, posts_summary, routing.focus_areas)
            future_comp = executor.submit(run_competitor_worker, query, posts_summary, routing.focus_areas)
            future_cust = executor.submit(run_customer_worker, query, posts_summary, routing.focus_areas)
            future_mark = executor.submit(run_market_worker, query, posts_summary, routing.focus_areas)
            future_risk = executor.submit(run_founder_risk_worker, query, posts_summary, routing.focus_areas)
            
            worker_outputs["pain"] = future_pain.result().model_dump()
            worker_outputs["competitor"] = future_comp.result().model_dump()
            worker_outputs["customer"] = future_cust.result().model_dump()
            worker_outputs["market"] = future_mark.result().model_dump()
            worker_outputs["founder_risk"] = future_risk.result().model_dump()
            
        if routing.requires_finance_worker:
            yield {"step": "workers", "message": "Dispatching Capital & Margin Worker..."}
            finance = run_finance_worker(query, posts_summary, routing.focus_areas)
            worker_outputs["finance"] = finance.model_dump()
            
        if routing.requires_visualization:
            yield {"step": "workers", "message": "Dispatching Trend & Growth Visualization Worker..."}
            viz = run_visualization_worker(query, posts_summary, routing.focus_areas)
            worker_outputs["visualization"] = viz.model_dump()
            
        yield {"step": "validator", "message": "Validator stress-testing worker claims and resolving contradictions..."}
        validation = run_validator(query, json.dumps(worker_outputs))
        
        yield {"step": "reporter", "message": "Reporter synthesizing final investment memo..."}
        final_report = run_reporter(query, validation.model_dump_json(), json.dumps(worker_outputs))
        
        # Map the new structured output to the format expected by the frontend ReportPage.jsx
        frontend_payload = {
            "pain": {
                "pain_point": worker_outputs["pain"]["pain_point"],
                "description": worker_outputs["pain"]["summary"],
                "evidence": worker_outputs["pain"]["evidence_list"][0] if worker_outputs["pain"]["evidence_list"] else "",
                "rage_score": worker_outputs["pain"]["severity"]
            },
            "analysis": {
                "root_cause": worker_outputs["pain"]["root_cause"],
                "customer": worker_outputs["customer"]["target_buyer"],
                "pricing": worker_outputs["customer"]["willingness_to_pay"],
                "failures": "\\n".join(worker_outputs["competitor"]["past_failures"]),
                "hidden_insight": worker_outputs["market"]["macro_trend"],
                "founder_risks": worker_outputs["founder_risk"]["legal_regulatory_risks"] + worker_outputs["founder_risk"]["execution_hurdles"]
            },
            "idea": {
                "name": final_report.title,
                "tagline": final_report.tagline,
                "how_it_works": final_report.executive_summary,
                "pricing_model": worker_outputs.get("finance", {}).get("margin_profile", "SaaS"),
                "30_day_plan": final_report.action_plan
            },
            "val_result": {
                "verdict": final_report.verdict_badge,
                "confidence": final_report.confidence_score,
                "rationale": final_report.problem_evidence,
                "unfair_advantage": worker_outputs["competitor"]["differentiation_opportunity"],
                "biggest_risk": worker_outputs["founder_risk"]["biggest_risk"]
            },
            "posts_count": len(posts)
        }
        
        # Persist to history for institutional review
        try:
            saved_item = save_history_item(query=query, mode=req_mode, report_data=frontend_payload)
            frontend_payload["id"] = saved_item["id"]
            frontend_payload["created_at"] = saved_item["created_at"]
        except Exception as err:
            print(f"[Pipeline] History save warning: {err}")
        
        yield {"step": "complete", "result": frontend_payload}
        
    except Exception as e:
        yield {"step": "error", "message": str(e)}
