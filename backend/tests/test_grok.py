import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.environ.get("HACKCLUB_API_KEY", "")

url = "https://ai.hackclub.com/proxy/v1/models"
headers = {"Authorization": f"Bearer {API_KEY}"}
response = requests.get(url, headers=headers)
data = response.json()

grok_models = [m['id'] for m in data.get('data', []) if 'grok' in m['id'].lower()]
print("Grok models found:", grok_models)
