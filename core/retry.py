import json
from pydantic import ValidationError

def extract_json_from_text(text: str) -> str:
    """Safely extract JSON from markdown code blocks or raw text."""
    clean = text.strip()
    if "```" in clean:
        parts = clean.split("```")
        if len(parts) >= 3:
            clean = parts[1]
            if clean.startswith("json"):
                clean = clean[4:]
    return clean.strip()

def with_retry(llm_func, prompt: str, system: str, response_model, max_retries: int = 3):
    """
    Calls the LLM function and attempts to parse the output into the given Pydantic model.
    If it fails, it feeds the validation error back to the LLM to fix it.
    """
    current_prompt = prompt
    last_error = None
    
    # We append the schema requirement to the system prompt
    schema_json = response_model.schema_json()
    system_with_schema = f"{system}\n\nYou MUST return ONLY valid JSON that perfectly matches this JSON schema:\n{schema_json}"
    
    for attempt in range(max_retries):
        raw_response = llm_func(current_prompt, system_with_schema)
        if not raw_response:
            continue
            
        json_str = extract_json_from_text(raw_response)
        
        try:
            parsed_data = json.loads(json_str)
            # Validate against Pydantic model
            validated_model = response_model(**parsed_data)
            return validated_model
            
        except json.JSONDecodeError as e:
            last_error = f"Invalid JSON format. Error: {str(e)}\nRaw output: {json_str}"
        except ValidationError as e:
            last_error = f"JSON does not match the required schema. Error:\n{str(e)}\nRaw JSON: {json_str}"
        except Exception as e:
            last_error = f"Unexpected error: {str(e)}"
            
        # If we failed, construct a repair prompt
        print(f"[Retry {attempt+1}/{max_retries}] Validation failed. Retrying...")
        current_prompt = f"""Your previous response failed validation.
        
ERROR DETAILS:
{last_error}

Please fix the errors and return the corrected JSON matching the schema. DO NOT return anything except the JSON."""

    # If all retries fail, return a fallback object or raise
    print(f"[Retry Failed] Could not get valid output after {max_retries} attempts.")
    # Return a generic failure based on the model if possible
    try:
        # Attempt to instantiate with empty values, this will likely fail validation again,
        # but if we construct a raw dict we can bypass it by using construct()
        fallback_data = {
            "confidence_score": 0,
            "evidence_list": [],
            "summary": "Validation failed after multiple retries.",
            "failure_reason": last_error
        }
        return response_model.construct(**fallback_data)
    except:
        return None
