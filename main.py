import os
import sys

# Ensure defi-orchestrator-py takes precedence over root
current_dir = os.path.dirname(os.path.abspath(__file__))
defi_dir = os.path.join(current_dir, "defi-orchestrator-py")

if current_dir in sys.path:
    sys.path.remove(current_dir)

if defi_dir not in sys.path:
    sys.path.insert(0, defi_dir)

# Prevent circular self-import when root file is named main.py
if "main" in sys.modules and getattr(sys.modules["main"], "__file__", "") != os.path.join(defi_dir, "main.py"):
    del sys.modules["main"]

import main as defi_main  # noqa: E402

app = defi_main.app
