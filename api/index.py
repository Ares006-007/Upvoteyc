import sys
import os

# Add root directory to sys.path for module resolution in Vercel serverless environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
