from fastapi import FastAPI, Request, Form
from fastapi.responses import JSONResponse
import threading
import requests

from agents.aggregator import aggregate
from agents.pain_finder import find_pain
from agents.analyzer import analyze
from agents.idea_gen import generate_ideas
from agents.validator import validate
from agents.pitcher import write_pitch
from agents.memory import remember

app = FastAPI()

@app.post("/slack/command")
async def slack_command(
    request: Request,
    command: str = Form(default=""),
    text: str = Form(default=""),
    response_url: str = Form(default="")
):
    # Parse input: /upvotevc r/startups agriculture
    parts = text.strip().split()
    
    subreddit = "bangalore"  # default
    keyword = None
    
    for part in parts:
        if part.startswith("r/"):
            subreddit = part[2:]  # strip r/
        elif part.startswith("/"):
            subreddit = part[1:]  # strip leading /
        else:
            keyword = part
    
    # Confirm immediately to Slack (must respond in 3 seconds)
    confirm_msg = f"Got it! Searching *r/{subreddit}*"
    if keyword:
        confirm_msg += f" for *{keyword}*"
    confirm_msg += "\nRunning 7 agents... Results in ~2 minutes 🤖"
    
    # Run pipeline in background thread
    def run_and_send():
        try:
            all_data    = aggregate(subreddit, keyword=keyword)
            posts       = all_data.get("reddit", [])
            
            if not posts:
                requests.post(response_url, json={
                    "text": f"❌ No complaint posts found in r/{subreddit}. Try a different subreddit or keyword."
                })
                return
            
            pain        = find_pain(posts)
            analysis    = analyze(pain, all_data)
            ideas       = generate_ideas(pain, analysis)
            val_results = [validate(idea, pain) for idea in ideas]
            pitch       = write_pitch(pain, analysis, ideas, val_results, posts)
            remember(pain, analysis, ideas)
            
            # Add header to pitch
            full = f"🔍 *r/{subreddit}*"
            if keyword:
                full += f" · *{keyword}*"
            full += "\n\n" + pitch
            
            # Split if too long
            MAX = 3000
            chunks = [full[i:i+MAX] for i in range(0, len(full), MAX)]
            for chunk in chunks:
                requests.post(response_url, json={"text": chunk})
                
        except Exception as e:
            requests.post(response_url, json={"text": f"❌ Error: {str(e)}"})
    
    thread = threading.Thread(target=run_and_send)
    thread.start()
    
    # Immediate response to Slack
    return JSONResponse(content={
        "response_type": "in_channel",
        "text": confirm_msg
    })