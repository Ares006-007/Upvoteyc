from pydantic import BaseModel, Field
from typing import List, Optional

# --- Base Schema for all workers ---
class WorkerOutput(BaseModel):
    confidence_score: int = Field(..., ge=0, le=100, description="Confidence score from 0 to 100")
    evidence_list: List[str] = Field(..., description="List of direct quotes or data points from sources supporting the claims")
    summary: str = Field(..., description="A 1-2 sentence summary of the worker's findings")
    failure_reason: Optional[str] = Field(None, description="If the worker could not complete the task, explain why")

# --- Orchestrator / Supervisor Schemas ---
class RoutingDecision(BaseModel):
    requires_finance_worker: bool = Field(..., description="True if the idea is strictly related to investing, stock trading, or deep financial mechanics")
    requires_visualization: bool = Field(..., description="True if the evidence includes explicit time-series data or trends over time (e.g., 'searches grew 50% year over year')")
    focus_areas: List[str] = Field(..., description="A list of 1-3 specific areas the workers should prioritize for this idea (e.g., 'legal liability', 'B2B sales cycle')")

# --- Worker Schemas ---
class PainResearch(WorkerOutput):
    pain_point: str = Field(..., description="Short title of the core problem")
    severity: int = Field(..., ge=1, le=10, description="How painful is this problem? (1-10)")
    root_cause: str = Field(..., description="The underlying reason this problem exists")

class CompetitorResearch(WorkerOutput):
    existing_alternatives: List[str] = Field(..., description="What are people currently using to solve this?")
    past_failures: List[str] = Field(..., description="Startups or projects that tried this and failed")
    differentiation_opportunity: str = Field(..., description="Where the new idea can stand out")

class CustomerProfile(WorkerOutput):
    target_buyer: str = Field(..., description="Who exactly makes the purchasing decision?")
    willingness_to_pay: str = Field(..., description="Will they pay for this? Why or why not?")
    acquisition_channel: str = Field(..., description="Where do these customers hang out?")

class MarketResearch(WorkerOutput):
    macro_trend: str = Field(..., description="What shift in the world makes this relevant now?")
    market_size_indicator: str = Field(..., description="Qualitative indicator of market size (niche vs mass)")

class FounderRisk(WorkerOutput):
    biggest_risk: str = Field(..., description="The #1 reason this specific idea will fail")
    legal_regulatory_risks: List[str] = Field(..., description="Any compliance or legal hurdles")
    execution_hurdles: List[str] = Field(..., description="Difficult technical or operational barriers")

class FinanceResearch(WorkerOutput):
    capital_requirements: str = Field(..., description="Is this highly capital intensive?")
    margin_profile: str = Field(..., description="Expected profit margin profile (e.g., high-margin SaaS vs low-margin physical)")

class VisualizationData(WorkerOutput):
    chart_type: str = Field(..., description="e.g., 'line', 'bar', 'pie'")
    chart_title: str = Field(..., description="Title of the chart")
    data_points: List[dict] = Field(..., description="List of dictionaries with 'label' and 'value' keys")
    plain_language_explanation: str = Field(..., description="What does this chart mean in simple terms?")

# --- Validator Schema ---
class ValidatedResearch(BaseModel):
    verdict: str = Field(..., description="'GO' or 'NO-GO'")
    overall_confidence: int = Field(..., ge=0, le=100)
    merged_evidence: List[str] = Field(..., description="De-duplicated list of the strongest evidence")
    unsupported_claims: List[str] = Field(..., description="Claims made by workers that lacked evidence (demoted to hypotheses)")
    contradictions_resolved: str = Field(..., description="Explanation of any contradictions between workers and how they were resolved")

# --- Reporter Schema ---
class FinalReport(BaseModel):
    title: str = Field(..., description="Startup Name / Idea Title")
    tagline: str = Field(..., description="One sentence pitch")
    executive_summary: str = Field(..., description="High level overview")
    verdict_badge: str = Field(..., description="GO or NO-GO")
    confidence_score: int = Field(..., ge=0, le=100)
    problem_evidence: str = Field(..., description="Detailed explanation of the problem and evidence")
    market_customer: str = Field(..., description="Customer profile and willingness to pay")
    competition_risks: str = Field(..., description="What failed before and founder risks")
    action_plan: List[str] = Field(..., description="Next 30 days execution steps")
