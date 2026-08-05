import os
import sys

# In Vercel Serverless environment, the root of the project is the current working directory or parent of api/
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)

# Add backend directory to sys.path
backend_dirs = [
    os.path.join(root_dir, "backend"),
    os.path.join(current_dir, "backend"),
    os.path.abspath("backend"),
]

for b_dir in backend_dirs:
    if os.path.exists(b_dir) and b_dir not in sys.path:
        sys.path.insert(0, b_dir)

try:
    from main import app
except ImportError:
    from backend.main import app
