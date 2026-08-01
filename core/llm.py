import os
from dotenv import load_dotenv

load_dotenv()

# Works locally (hardcoded) AND on Railway/Vercel (env var)
# We provide a dummy fallback so it doesn't crash on import if env vars aren't set yet on Vercel
raw_key = os.environ.get("HACKCLUB_API_KEY", "")
API_KEY = raw_key if raw_key else "dummy_key_to_prevent_crash"

from openai import OpenAI
from core.retry import with_retry

client = OpenAI(
    base_url="https://ai.hackclub.com/proxy/v1",
    api_key=API_KEY
)

MODEL = "qwen/qwen3-32b"

def llm(prompt: str, system: str = "", model: str = None) -> str:
    """Basic text-to-text LLM call."""
    if model is None:
        model = MODEL
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    try:
        response = client.chat.completions.create(
            model=model,
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

def structured_llm(prompt: str, system: str, response_model, model: str = None):
    """
    Calls the LLM and enforces the Pydantic response_model schema,
    using an automatic retry loop for JSON repair.
    """
    return with_retry(llm, prompt, system, response_model, model=model)