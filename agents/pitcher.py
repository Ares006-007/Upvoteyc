def write_pitch(pain: dict, analysis: dict, ideas: list, val_results: list, posts: list) -> str:
    print("[Pitcher] Writing investor-grade pitch...")
    
    top_url = posts[0]["url"] if posts else ""
    
    pitch = f"""
🔴 *PAIN POINT ANALYSIS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*{pain.get('pain_point')}*
📊 Severity: *{analysis.get('severity_score', '?')}/10*
💬 _"{pain.get('evidence', '')[:100]}"_
🔗 {top_url}

🔍 *DEEP ANALYSIS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*Root Cause:* {analysis.get('root_cause')}

*Real Customer:* {analysis.get('real_customer')}
*Will They Pay?* {analysis.get('willingness_to_pay')}

*What Failed Before:* {analysis.get('past_startups_failed')}
*Hidden Insight:* _{analysis.get('minority_insight')}_
*Why Now:* {analysis.get('market_timing')}
*Solo Founder Risk:* ⚠️ {analysis.get('solo_founder_risk')}
""".strip()

    for i, (idea, val) in enumerate(zip(ideas, val_results)):
        competitors = "\n".join(
            f"    • {c}" for c in val.get("competitors", [])[:2]
        )
        pitch += f"""

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 *IDEA {i+1} — {idea.get('name')}*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_{idea.get('tagline')}_

*How it works:* {idea.get('how_it_works')}

👤 *Real Customer:* {idea.get('real_customer')}
💰 *Pricing:* {idea.get('pricing')}
📈 *Revenue:* Month 1 → {idea.get('revenue_month_1')} | Month 12 → {idea.get('revenue_month_12')}

🏗️ *4-Week Execution Plan:*
{idea.get('solo_founder_execution')}

✅ *Why It Won't Fail Like Others:*
{idea.get('why_not_failed_like_others')}

🎯 *Unfair Advantage:* {idea.get('unfair_advantage')}
⚠️ *Biggest Risk:* {idea.get('biggest_risk')}
🚀 *3-Year Growth:* {idea.get('future_growth')}

📈 *Market:* {val.get('market_size')}
⚔️ *Competitors:*
{competitors}
✅ *Verdict: {val.get('verdict')}*"""

    pitch += f"\n\n_UpvoteVC 🤖 v2.0 — _"
    return pitch