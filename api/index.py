import sys
import os

# Ensure the root directory is in the Python path for imports to work on Vercel
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

import json
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from orchestrator.run_pipeline import pipeline_generator

app = FastAPI(title="UpvoteVC Supervisor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins in production for Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResearchRequest(BaseModel):
    mode: str
    query: str

@app.post("/api/research")
async def api_research(req: ResearchRequest):
    def sse_wrapper():
        for event in pipeline_generator(req.mode, req.query):
            yield f'data: {json.dumps(event)}\n\n'
            
    return StreamingResponse(sse_wrapper(), media_type="text/event-stream")
