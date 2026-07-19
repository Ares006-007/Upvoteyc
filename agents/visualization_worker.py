from core.llm import structured_llm
from core.schema import VisualizationData
from typing import List

def run_visualization_worker(query: str, posts_summary: str, focus_areas: List[str]) -> VisualizationData:
    """
    Analyzes trends and outputs chart-ready structured data (Only runs if supervisor routes it).
    """
    print(f"[Visualization Worker] Structuring trend data into chart format...")
    
    system = """You are the Visualization Research Worker. Your ONLY job is to extract time-series or comparative trend data from the evidence and format it perfectly for a chart.
Pick the best chart type (line, bar, pie), provide a title, and extract data points (label/value pairs).
Explain what the trend means in plain language.
"""

    prompt = f"""User Idea / Query: {query}
Supervisor Focus Areas: {', '.join(focus_areas)}
    
Signal Data:
{posts_summary}

Analyze the data and output the VisualizationData JSON."""

    return structured_llm(prompt, system, VisualizationData)
