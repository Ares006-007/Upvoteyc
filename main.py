import json
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from orchestrator.run_pipeline import pipeline_generator
from core.history_store import get_history_summary_list, get_history_item, delete_history_item

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