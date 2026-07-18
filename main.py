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
    from agents.idea_refiner import extract_search_queries, refine_idea

    raw_text = text.strip()
    is_idea_research = raw_text.lower().startswith("idea:")
    
    user_idea = None
    subreddit = "bangalore"  # default
    keyword = None
    
    if is_idea_research:
        user_idea = raw_text[5:].strip()
        confirm_msg = f"Got it! Researching your idea: *\"{user_idea}\"*"
    else:
        parts = raw_text.split()
        for part in parts:
            if part.startswith("r/"):
                subreddit = part[2:]  # strip r/
            elif part.startswith("/"):
                subreddit = part[1:]  # strip leading /
            else:
                keyword = part
                
        confirm_msg = f"Got it! Searching *r/{subreddit}*"
        if keyword:
            confirm_msg += f" for *{keyword}*"
            
    confirm_msg += "\nRunning 7 agents... Results in ~2 minutes 🤖"
    
    # Run pipeline in background thread
    def run_and_send():
        try:
            nonlocal subreddit, keyword
            
            # Extract search queries if it's a custom idea
            if is_idea_research:
                queries = extract_search_queries(user_idea)
                subreddit = queries.get("topic", "bangalore")
                keyword = queries.get("keyword")
                
            all_data    = aggregate(subreddit, keyword=keyword)
            posts       = all_data.get("reddit", []) + all_data.get("news", []) + all_data.get("newsdata", []) + all_data.get("trends", [])
            
            # Retry broad search if no signals found
            if not posts and keyword:
                print("[Main] No signals found, retrying broad search...")
                all_data = aggregate(subreddit, keyword=None)
                posts = all_data.get("reddit", []) + all_data.get("news", []) + all_data.get("newsdata", []) + all_data.get("trends", [])
                
            if not posts:
                requests.post(response_url, json={
                    "text": f"❌ No signals found for topic '{subreddit}' / '{keyword or 'None'}'. Try describing your idea differently."
                })
                return
            
            pain        = find_pain(posts)
            analysis    = analyze(pain, all_data)
            
            if is_idea_research:
                # Refine and validate the user's custom idea
                refined = refine_idea(user_idea, pain, analysis)
                val_result = validate(refined, pain)
                pitch = write_pitch(pain, analysis, [refined], [val_result], posts)
                remember(pain, analysis, [refined])
                
                full = f"🔍 *Custom Idea Research: \"{user_idea}\"*\n"
                full += f"Topic: *{subreddit}* · Keyword: *{keyword}*\n\n" + pitch
            else:
                # Standard flow: generate new ideas
                ideas       = generate_ideas(pain, analysis)
                val_results = [validate(idea, pain) for idea in ideas]
                pitch       = write_pitch(pain, analysis, ideas, val_results, posts)
                remember(pain, analysis, ideas)
                
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