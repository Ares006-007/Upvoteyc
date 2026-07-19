import json
from orchestrator.run_pipeline import pipeline_generator

def main():
    print("=== Testing Supervisor Multi-Agent Pipeline ===")
    
    # Simulate a user requesting research on an idea
    mode = "research"
    query = "A dashcam that automatically reports potholes to the city council"
    
    print(f"Request: Mode='{mode}', Query='{query}'\\n")
    
    for event in pipeline_generator(mode, query):
        step = event.get("step")
        msg = event.get("message", "")
        
        if step == "error":
            print(f"\\n❌ [ERROR] {msg}")
            break
            
        elif step == "complete":
            print("\\n✅ [PIPELINE COMPLETE] Final Result:\\n")
            result = event.get("result", {})
            print(json.dumps(result, indent=2))
            
        else:
            print(f"[{step.upper()}] {msg}")

if __name__ == "__main__":
    main()