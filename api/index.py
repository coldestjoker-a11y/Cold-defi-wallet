import sys
import os

# Add defi-orchestrator-py to Python module path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
defi_dir = os.path.join(project_root, "defi-orchestrator-py")

if defi_dir not in sys.path:
    sys.path.insert(0, defi_dir)

# Import the FastAPI application
from main import app

