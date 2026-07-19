import json
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from orchestrator.run_pipeline import pipeline_generator

app = FastAPI(title="OpenVc Supervisor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
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

# If you still want the Slack command, you can adapt it to run the pipeline synchronously 
# and return the final text report, but for now we focus on the frontend API.