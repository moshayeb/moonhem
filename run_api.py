#!/usr/bin/env python3
"""
Start the FastAPI app. Safe to run from any directory.

    python run_api.py

Do not run `uvicorn backend.app:app` from inside the `backend/` folder — that causes
ModuleNotFoundError: No module named 'backend'.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.app:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        reload_dirs=[str(ROOT / "backend")],
    )
