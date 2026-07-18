import json, os
from dotenv import load_dotenv

load_dotenv()

# Works locally (hardcoded) AND on Railway (env var)
API_KEY = os.environ.get(
    "HACKCLUB_API_KEY",
    ""
)

from openai import OpenAI

client = OpenAI(
    base_url="https://ai.hackclub.com/proxy/v1",
    api_key=API_KEY
)

MODEL = "qwen/qwen3-32b"

def llm(prompt: str, system: str = "") -> str:
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            max_tokens=3000
        )
        content = response.choices[0].message.content
        if content is None:
            return ""
        return content
    except Exception as e:
        print(f"[LLM API Error] {e}")
        return ""

def llm_json(prompt: str, system: str = "") -> dict:
    raw = llm(prompt, system)
    if not raw:
        return {}
    try:
        clean = raw.strip()
        if "```" in clean:
            clean = clean.split("```")[1]
            if clean.startswith("json"):
                clean = clean[4:]
        
        # Try to fix truncated JSON by appending closing braces if missing
        if not clean.strip().endswith("}"):
            clean += "\n}"
            
        return json.loads(clean.strip())
    except Exception as e:
        print(f"[LLM] JSON parse failed: {e}")
        print(f"[LLM] Raw: {raw[:200]}")
        return {}