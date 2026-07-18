import json, os
from datetime import datetime

MEMORY_FILE = "memory.json"

def load_memory() -> dict:
    if os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE, "r") as f:
            return json.load(f)
    return {"pain_points": [], "ideas": [], "runs": 0}

def save_memory(memory: dict):
    with open(MEMORY_FILE, "w") as f:
        json.dump(memory, f, indent=2)

def remember(pain: dict, analysis: dict, ideas: list):
    memory = load_memory()
    
    memory["runs"] += 1
    memory["pain_points"].append({
        "pain": pain.get("pain_point"),
        "root_cause": analysis.get("root_cause"),
        "timestamp": datetime.now().isoformat(),
        "severity": analysis.get("severity_score")
    })
    
    for idea in ideas:
        memory["ideas"].append({
            "name": idea.get("name"),
            "pain_solved": pain.get("pain_point"),
            "timestamp": datetime.now().isoformat()
        })
    
    # Keep only last 50 entries
    memory["pain_points"] = memory["pain_points"][-50:]
    memory["ideas"] = memory["ideas"][-50:]
    
    save_memory(memory)
    print(f"[Memory] Saved. Total runs: {memory['runs']}")

def get_past_pain_points() -> list:
    memory = load_memory()
    return [p["pain"] for p in memory["pain_points"]]

def already_seen(pain_point: str) -> bool:
    past = get_past_pain_points()
    return any(pain_point.lower() in p.lower() for p in past)
