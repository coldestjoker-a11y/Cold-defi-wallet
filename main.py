import os
import sys

# Ensure defi-orchestrator-py is on sys.path
root_dir = os.path.dirname(os.path.abspath(__file__))
defi_dir = os.path.join(root_dir, "defi-orchestrator-py")
if defi_dir not in sys.path:
    sys.path.insert(0, defi_dir)

# Import root FastAPI application
from main import app  # noqa: E402

