from agents.aggregator import aggregate
from agents.pain_finder import find_pain
from agents.analyzer import analyze
from agents.idea_gen import generate_ideas
from agents.validator import validate
from agents.pitcher import write_pitch
from agents.memory import remember

print("🚀 Starting UpvoteVC pipeline...\n")

all_data = aggregate("education", keyword="Neet Scam")
posts = all_data.get("reddit", []) + all_data.get("news", []) + all_data.get("newsdata", []) + all_data.get("trends", [])

if not posts:
    print("❌ No posts found. Try a different city or keyword.")
else:
    pain = find_pain(posts)
    analysis = analyze(pain, all_data)
    ideas = generate_ideas(pain, analysis)
    val_results = [validate(idea, pain) for idea in ideas]
    pitch = write_pitch(pain, analysis, ideas, val_results, posts)
    remember(pain, analysis, ideas)

    print("\n" + "="*50)
    print(pitch)
    print("="*50)