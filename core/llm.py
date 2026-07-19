import os
from dotenv import load_dotenv

load_dotenv()

# Works locally (hardcoded) AND on Railway (env var)
API_KEY = os.environ.get("HACKCLUB_API_KEY", "")

from openai import OpenAI
from core.retry import with_retry

client = OpenAI(
    base_url="https://ai.hackclub.com/proxy/v1",
    api_key=API_KEY
)

MODEL = "qwen/qwen3-32b"

def llm(prompt: str, system: str = "") -> str:
    """Basic text-to-text LLM call."""
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

def structured_llm(prompt: str, system: str, response_model):
    """
    Calls the LLM and enforces the Pydantic response_model schema,
    using an automatic retry loop for JSON repair.
    """
    return with_retry(llm, prompt, system, response_model)