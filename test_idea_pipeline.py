import sys
from agents.aggregator import aggregate
from agents.pain_finder import find_pain
from agents.analyzer import analyze
from agents.idea_refiner import extract_search_queries, refine_idea
from agents.validator import validate
from agents.pitcher import write_pitch
from agents.memory import remember

print("🚀 Starting UpvoteVC Idea Research Pipeline...\n")

# Get input from command line or prompt user
if len(sys.argv) > 1:
    user_idea = " ".join(sys.argv[1:])
else:
    try:
        user_idea = input("Enter your startup idea to research: ").strip()
    except (IOError, EOFError):
        user_idea = ""
    if not user_idea:
        user_idea = "A smart device that detects when school bus drivers use their phones and alerts parents"

print(f"\n🔍 Researching Idea: '{user_idea}'\n")

# 1. Extract search queries
queries = extract_search_queries(user_idea)
topic = queries.get("topic", "bangalore")
keyword = queries.get("keyword")

# 2. Aggregate data
all_data = aggregate(topic, keyword=keyword)
posts = all_data.get("reddit", []) + all_data.get("news", []) + all_data.get("newsdata", []) + all_data.get("trends", [])

if not posts:
    print(f"❌ No signals found for topic '{topic}' and keyword '{keyword}'. Retrying broad search...")
    all_data = aggregate(topic, keyword=None)
    posts = all_data.get("reddit", []) + all_data.get("news", []) + all_data.get("newsdata", []) + all_data.get("trends", [])

if not posts:
    print("❌ No signals found. Try a different idea or describe it differently.")
else:
    # 3. Find pain point
    pain = find_pain(posts)
    
    # 4. Analyze pain point
    analysis = analyze(pain, all_data)
    
    # 5. Refine user's idea
    refined = refine_idea(user_idea, pain, analysis)
    
    # 6. Validate refined idea
    validation = validate(refined, pain)
    
    # 7. Generate final pitch
    pitch = write_pitch(pain, analysis, [refined], [validation], posts)
    
    # 8. Store in memory
    remember(pain, analysis, [refined])
    
    print("\n" + "="*50)
    print(pitch)
    print("="*50)
