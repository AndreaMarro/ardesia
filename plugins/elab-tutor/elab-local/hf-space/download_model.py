"""Download model from private HF repo, set MODEL_PATH env var, start server."""
import os
import sys

REPO_ID = "AIndrea/galileo-brain-gguf"
FILENAME = "galileo-brain-v13.gguf"

print(f"[Boot] Downloading {FILENAME} from {REPO_ID}...")
from huggingface_hub import hf_hub_download

model_path = hf_hub_download(
    repo_id=REPO_ID,
    filename=FILENAME,
    token=os.environ.get("HF_TOKEN"),
)
print(f"[Boot] Model at: {model_path}")
print(f"[Boot] Size: {os.path.getsize(model_path) / 1e9:.1f} GB")

# Pass actual path to server via env var
os.environ["MODEL_PATH"] = model_path

# Start server
print("[Boot] Starting server...")
os.execvp(sys.executable, [sys.executable, "server.py"])
