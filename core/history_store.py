import json
import os
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any

HISTORY_FILE = "history.json"

DEFAULT_SEED_HISTORY = [
    {
        "id": "memo-ev-fleet-2026",
        "query": "EV fleet charging orchestration and dynamic grid balancing",
        "mode": "discover",
        "company_name": "GridVolt Fleet OS",
        "tagline": "Real-time depot load balancing and fleet charging orchestration software.",
        "verdict": "GO",
        "confidence": 88,
        "created_at": "2026-07-28T14:22:10Z",
        "posts_count": 42,
        "reportData": {
            "id": "memo-ev-fleet-2026",
            "created_at": "2026-07-28T14:22:10Z",
            "posts_count": 42,
            "val_result": {
                "verdict": "GO",
                "confidence": 88,
                "unfair_advantage": "Direct telemetry integrations with commercial charging hardware and predictive tariff arbitrage algorithms.",
                "biggest_risk": "Utility interconnection lead times and hardware vendor lock-in.",
                "rationale": "High regulatory pressure (clean fleet mandates) combined with acute demand charges creates immediate ROI for mid-market fleet operators."
            },
            "idea": {
                "name": "GridVolt Fleet OS",
                "tagline": "Real-time depot load balancing and fleet charging orchestration software.",
                "how_it_works": "GridVolt connects directly to commercial fleet depot chargers and telematics to dynamically distribute power based on vehicle departure schedules, utility peak pricing, and transformer constraints.",
                "pricing_model": "$45/vehicle/month SaaS + 10% peak demand charge savings fee.",
                "30_day_plan": [
                    "Validate transformer queue bottlenecks across 10 regional mid-mile logistics depots.",
                    "Benchmark firmware protocol support across ChargePoint, ABB, and Tritium DC fast chargers.",
                    "Audit commercial utility tariff structures across California, Texas, and New York."
                ]
            },
            "pain": {
                "pain_point": "Depot transformer overloads & $15k/mo utility demand penalties",
                "description": "Commercial fleet operators electrifying medium-duty trucks face massive demand spikes that trigger five-figure utility penalties and tripped substations.",
                "evidence": "Our depot tripped local grid fuses twice last month when 8 delivery vans plugged in simultaneously at 5 PM. Demand charges alone cost us $18,400.",
                "rage_score": 9
            },
            "analysis": {
                "root_cause": "Uncoordinated charging schedules compounded by legacy utility metering that penalizes 15-minute peak power spikes.",
                "hidden_insight": "Fleet managers care more about guaranteed route readiness by 6:00 AM than pure electricity cost optimization.",
                "customer": "VP of Fleet Operations at regional parcel delivery, food distribution, and school bus transit fleets.",
                "pricing": "Strong willingness to pay from existing fuel/maintenance OPEX budgets; payback period under 4 months.",
                "failures": "Past residential EV charging apps failed in commercial depots due to lack of multi-protocol charger telemetry and route-schedule inputs.",
                "founder_risks": [
                    "High integration fragmentation across non-standard OCPP charger firmwares.",
                    "Long utility engagement cycles for pilot site grid interconnect agreements.",
                    "Incumbent fleet telematics providers (Samsara, Geotab) building native EV charging modules."
                ]
            }
        }
    },
    {
        "id": "memo-radiology-ai-2026",
        "query": "Autonomous triage and report generation for emergency radiology",
        "mode": "research",
        "company_name": "RadPulse AI",
        "tagline": "Zero-latency critical pathology detection for nighttime emergency imaging queues.",
        "verdict": "GO",
        "confidence": 82,
        "created_at": "2026-07-24T09:45:00Z",
        "posts_count": 38,
        "reportData": {
            "id": "memo-radiology-ai-2026",
            "created_at": "2026-07-24T09:45:00Z",
            "posts_count": 38,
            "val_result": {
                "verdict": "GO",
                "confidence": 82,
                "unfair_advantage": "Sub-2-second edge inference model directly on PACS workstation with FDA 510(k) pathway documentation.",
                "biggest_risk": "Hospital procurement cycles averaging 9-14 months and stringent radiologist liability indemnity.",
                "rationale": "Severe overnight radiologist shortages and statutory turnaround time mandates make triage an urgent hospital priority."
            },
            "idea": {
                "name": "RadPulse AI",
                "tagline": "Zero-latency critical pathology detection for nighttime emergency imaging queues.",
                "how_it_works": "Integrates via DICOM proxy into hospital PACS queues to automatically flag intracranial hemorrhages, pulmonary embolisms, and aortic dissections in under 120 seconds.",
                "pricing_model": "$3.50 per emergency scan processed with volume tiers.",
                "30_day_plan": [
                    "Complete retrospective sensitivity validation on 5,000 multi-center CT head scans.",
                    "Review FDA pre-submission Q-Sub feedback for computer-assisted triage categorization.",
                    "Interview 15 radiology practice leaders on teleradiology cost-per-read economics."
                ]
            },
            "pain": {
                "pain_point": "3+ hour overnight CT turnaround times during critical trauma cases",
                "description": "Community ERs face severe delays waiting for teleradiology over-reads, risking patient outcomes in time-critical ischemic stroke cases.",
                "evidence": "Night shifts at our Level 3 trauma center often have 40 unread head CTs in the queue because our remote radiology group is backed up across 8 hospitals.",
                "rage_score": 9
            },
            "analysis": {
                "root_cause": "Structural shortage of fellowship-trained neuroradiologists willing to work overnight shifts combined with 25% annual scan volume growth.",
                "hidden_insight": "Hospitals will pay for triage even without full diagnostic clearance because it mitigates malpractice liability during peak emergency hours.",
                "customer": "Emergency Department Chairs and Hospital Chief Medical Officers at community health systems.",
                "pricing": "Standard per-click imaging budget line item; clear reduction in ER dwell time costs ($1,200/hr).",
                "failures": "Earlier AI imaging startups tried to replace full diagnostic reports, triggering intense radiologist resistance and regulatory dead-ends.",
                "founder_risks": [
                    "Regulatory classification uncertainty (Class II 510(k) vs De Novo).",
                    "EHR / PACS vendor API resistance and security audit lead times.",
                    "Malpractice insurance and enterprise liability carve-outs."
                ]
            }
        }
    },
    {
        "id": "memo-b2b-procurement-2026",
        "query": "AI agent for automated SMB indirect procurement negotiating",
        "mode": "research",
        "company_name": "Vendora Autonomous",
        "tagline": "Autonomous supplier price negotiation and renewal management for mid-market SaaS.",
        "verdict": "NO-GO",
        "confidence": 35,
        "created_at": "2026-07-20T16:10:00Z",
        "posts_count": 29,
        "reportData": {
            "id": "memo-b2b-procurement-2026",
            "created_at": "2026-07-20T16:10:00Z",
            "posts_count": 29,
            "val_result": {
                "verdict": "NO-GO",
                "confidence": 35,
                "unfair_advantage": "None identified; easily replicated email agent with zero proprietary benchmark data.",
                "biggest_risk": "Enterprise vendors refuse to negotiate with bots; aggressive pushback from vendor sales reps.",
                "rationale": "High churn risk, severe pricing pressure from incumbent spend management platforms (Ramp, Zip, Coupa), and lack of data defensibility."
            },
            "idea": {
                "name": "Vendora Autonomous",
                "tagline": "Autonomous supplier price negotiation and renewal management for mid-market SaaS.",
                "how_it_works": "Scans inbox for contract renewals and automatically sends email counter-offers to software vendors based on generic market benchmarks.",
                "pricing_model": "15% of negotiated annual savings.",
                "30_day_plan": [
                    "Conduct structured interviews with enterprise vendor account executives.",
                    "Benchmark feature overlap with Ramp Contract Negotiations and Tropic.",
                    "Evaluate customer retention after first annual renewal cycle."
                ]
            },
            "pain": {
                "pain_point": "Manual contract renewal renegotiation friction",
                "description": "Finance managers lack time to negotiate dozens of $5k-$20k SaaS renewals each quarter.",
                "evidence": "We missed our auto-renew deadline on HubSpot and got locked in for another year at full list price.",
                "rage_score": 6
            },
            "analysis": {
                "root_cause": "Fragmented software ownership across department heads without dedicated procurement staff.",
                "hidden_insight": "Vendors ignore automated bots and mandate executive phone calls for discounts above 10%.",
                "customer": "Finance directors at 50-250 person companies.",
                "pricing": "Low willingness for recurring software fees; contingent savings models suffer from attribution disputes.",
                "failures": "Dozens of browser extension discount bots failed because B2B sales cycles require human leverage and volume commitments.",
                "founder_risks": [
                    "Zero technological moat against Ramp / Brex bundling native negotiation services for free.",
                    "Attribution friction when calculating actual delivered savings.",
                    "High customer churn after first-year contract cleanups."
                ]
            }
        }
    }
]

def load_history() -> List[Dict[str, Any]]:
    if not os.path.exists(HISTORY_FILE):
        save_all_history(DEFAULT_SEED_HISTORY)
        return DEFAULT_SEED_HISTORY
    
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
            return DEFAULT_SEED_HISTORY
    except Exception as e:
        print(f"[History] Error loading history file: {e}")
        return DEFAULT_SEED_HISTORY

def save_all_history(history: List[Dict[str, Any]]) -> None:
    try:
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"[History] Error saving history file: {e}")

def get_history_summary_list() -> List[Dict[str, Any]]:
    history = load_history()
    summaries = []
    for item in history:
        summaries.append({
            "id": item.get("id"),
            "query": item.get("query"),
            "mode": item.get("mode", "research"),
            "company_name": item.get("company_name") or item.get("reportData", {}).get("idea", {}).get("name", "Untitled Memo"),
            "tagline": item.get("tagline") or item.get("reportData", {}).get("idea", {}).get("tagline", ""),
            "verdict": item.get("verdict") or item.get("reportData", {}).get("val_result", {}).get("verdict", "NO-GO"),
            "confidence": item.get("confidence") or item.get("reportData", {}).get("val_result", {}).get("confidence", 0),
            "created_at": item.get("created_at", datetime.now().isoformat()),
            "posts_count": item.get("posts_count") or item.get("reportData", {}).get("posts_count", 0),
            "pain_point": item.get("reportData", {}).get("pain", {}).get("pain_point", ""),
            "rage_score": item.get("reportData", {}).get("pain", {}).get("rage_score", 0)
        })
    # Sort newest first
    summaries.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return summaries

def get_history_item(item_id: str) -> Optional[Dict[str, Any]]:
    history = load_history()
    for item in history:
        if item.get("id") == item_id:
            return item
    return None

def save_history_item(query: str, mode: str, report_data: Dict[str, Any]) -> Dict[str, Any]:
    history = load_history()
    
    item_id = str(uuid.uuid4())[:8]
    created_at = datetime.now().isoformat()
    
    # Ensure ID and timestamps are in the report_data as well
    report_data["id"] = item_id
    report_data["created_at"] = created_at
    
    new_entry = {
        "id": item_id,
        "query": query,
        "mode": mode,
        "company_name": report_data.get("idea", {}).get("name", "Investment Memo"),
        "tagline": report_data.get("idea", {}).get("tagline", "Diligence Summary"),
        "verdict": report_data.get("val_result", {}).get("verdict", "NO-GO"),
        "confidence": report_data.get("val_result", {}).get("confidence", 0),
        "created_at": created_at,
        "posts_count": report_data.get("posts_count", 0),
        "reportData": report_data
    }
    
    # Insert at top
    history.insert(0, new_entry)
    
    # Cap history at 100 entries
    history = history[:100]
    save_all_history(history)
    print(f"[History] Saved memo '{new_entry['company_name']}' with ID {item_id}")
    return new_entry

def delete_history_item(item_id: str) -> bool:
    history = load_history()
    filtered = [item for item in history if item.get("id") != item_id]
    if len(filtered) < len(history):
        save_all_history(filtered)
        print(f"[History] Deleted memo ID {item_id}")
        return True
    return False
