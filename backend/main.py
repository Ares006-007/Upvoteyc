import json
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

from orchestrator.run_pipeline import pipeline_generator
from core.history_store import get_history_summary_list, get_history_item, delete_history_item
from core.feedback_service import submit_feedback, get_all_feedbacks

app = FastAPI(title="OpenVC Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResearchRequest(BaseModel):
    mode: str
    query: str

class FeedbackRequest(BaseModel):
    name: str = ""
    email: str = ""
    category: str = "General Feedback"
    rating: int = 5
    message: str
    page_url: str = ""
    metadata: dict = {}

@app.post("/api/feedback")
async def api_submit_feedback(req: FeedbackRequest):
    """
    Receives feedback from the UI and dispatches email directly to shaikajhaj@gmail.com,
    stores in database/local fallback, and mirrors to Slack.
    """
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Feedback message cannot be empty.")
    
    result = submit_feedback(req.dict())
    return result

@app.get("/api/feedback")
async def api_get_feedbacks():
    """
    Returns stored feedback history.
    """
    return get_all_feedbacks()


@app.post("/api/research")
async def api_research(req: ResearchRequest):
    """
    SSE Endpoint for the React Frontend.
    Yields real-time events from the Supervisor Multi-Agent Pipeline.
    """
    def sse_wrapper():
        for event in pipeline_generator(req.mode, req.query):
            yield f'data: {json.dumps(event)}\n\n'
            
    return StreamingResponse(sse_wrapper(), media_type="text/event-stream")

@app.get("/api/history")
async def api_get_history():
    """
    Returns summary list of previous venture diligence memos and scans.
    """
    return get_history_summary_list()

@app.get("/api/history/{item_id}")
async def api_get_history_item(item_id: str):
    """
    Returns the complete structured report data for a specific memorandum.
    """
    item = get_history_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Diligence memorandum not found")
    return item

@app.delete("/api/history/{item_id}")
async def api_delete_history_item(item_id: str):
    """
    Deletes a memorandum from history.
    """
    success = delete_history_item(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Diligence memorandum not found")
    return {"deleted": True, "id": item_id}


@app.get("/api/health")
async def api_health():
    """
    Healthcheck: verifies Supabase client and raw Postgres connectivity.
    """
    supabase_status = "error"
    supabase_detail = ""
    postgres_status = "error"
    postgres_detail = ""

    # --- Supabase client check (anon key) ---
    try:
        from core.supabase_client import supabase_public
        if supabase_public is None:
            supabase_detail = "Client not initialized — check SUPABASE_URL and SUPABASE_ANON_KEY in .env"
        else:
            # Use a simple RPC or raw PostgREST health ping
            # supabase-py v2 exposes .table().select()
            result = supabase_public.table("_health_check_dummy").select("*").limit(1).execute()
            # If we get here without exception, the client connected successfully.
            # A 404/empty result is fine — it means the API responded.
            supabase_status = "ok"
            supabase_detail = f"Supabase client responded (rows: {len(result.data)})"
    except Exception as e:
        err_msg = str(e)
        # PostgREST errors like PGRST205 / 404 / "relation does not exist" still
        # prove the client is wired correctly — the REST API responded.
        ok_signals = ["404", "pgrst", "relation", "does not exist", "schema cache"]
        if any(sig in err_msg.lower() for sig in ok_signals):
            supabase_status = "ok"
            supabase_detail = "Supabase client connected (table not found is expected — no tables yet)"
        else:
            supabase_detail = f"Supabase client error: {err_msg[:200]}"
            print(f"[Health] Supabase error: {e}")

    # --- Raw Postgres check (DATABASE_URL) ---
    try:
        import psycopg2
        from urllib.parse import urlparse, urlencode, parse_qs, urlunparse
        database_url = os.getenv("DATABASE_URL", "")
        if not database_url:
            postgres_detail = "DATABASE_URL not set in .env"
        else:
            # Strip non-libpq query params (e.g. Supabase dashboard adds "projectName")
            parsed = urlparse(database_url)
            clean_params = {k: v for k, v in parse_qs(parsed.query).items()
                           if k in ("sslmode", "connect_timeout", "application_name",
                                    "options", "sslcert", "sslkey", "sslrootcert")}
            clean_query = urlencode(clean_params, doseq=True)
            clean_url = urlunparse(parsed._replace(query=clean_query))
            conn = psycopg2.connect(clean_url)
            cur = conn.cursor()
            cur.execute("SELECT NOW()")
            now = cur.fetchone()[0]
            cur.close()
            conn.close()
            postgres_status = "ok"
            postgres_detail = f"Postgres responded with server time: {now}"
    except Exception as e:
        postgres_detail = f"Postgres connection error: {str(e)[:200]}"
        print(f"[Health] Postgres error: {e}")

    return {
        "supabaseClient": supabase_status,
        "postgres": postgres_status,
        "details": f"Supabase: {supabase_detail} | Postgres: {postgres_detail}"
    }