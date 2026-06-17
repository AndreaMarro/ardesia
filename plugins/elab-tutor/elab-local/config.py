"""ELAB Local Server configuration."""
import os
from pathlib import Path

VERSION = "1.0.0"
SERVER_PORT = int(os.environ.get("ELAB_PORT", 8000))
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")

# Models — override via env vars
# Set ELAB_BRAIN_MODEL="" to skip Brain (uses keyword routing instead — faster on slow hardware)
_brain_env = os.environ.get("ELAB_BRAIN_MODEL", "galileo-brain")
BRAIN_MODEL = _brain_env if _brain_env else None
LLM_MODEL = os.environ.get("ELAB_LLM_MODEL", "qwen2.5:1.5b")  # 1.5b default (fast, fits 4GB RAM)

# Paths
BASE_DIR = Path(__file__).parent
YAML_DIR = BASE_DIR / "yaml"
MEMORY_DIR = Path.home() / ".elab-local" / "sessions"
COMPILE_DIR = Path("/tmp/elab-compile")

# Limits
MAX_MESSAGE_LENGTH = 15000
MAX_CONTEXT_LENGTH = 10000
MAX_SESSION_MESSAGES = 20  # 10 turns
SESSION_TTL = 86400  # 24h

# Timeouts (seconds)
BRAIN_TIMEOUT = 15  # first call may be slow (Ollama cold start loads model to GPU)
LLM_TIMEOUT = 60
COMPILE_TIMEOUT = 60  # first compile may be slow (arduino-cli cold start)

# LLM settings
MAX_TOKENS = 1500
TEMPERATURE = 0.7

# Cloud LLM API keys (optional — enables hybrid mode: Brain local + LLM cloud)
# Set these to use DeepSeek/Gemini instead of local Ollama for responses
DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "").strip() or None
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip() or None
CLOUD_LLM_MODEL = os.environ.get("CLOUD_LLM_MODEL", "deepseek-chat")  # deepseek-chat or gemini-2.0-flash
