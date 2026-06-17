FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Core server + prompt files
COPY server.py .
COPY nanobot.yml .
COPY site-prompt.yml .

# Multi-Galileo v4.0: memory system + specialist prompts
COPY memory.py .
COPY brain.py .
COPY vocab_checker.py .
COPY patterns.json .
COPY prompts/ ./prompts/

# Runtime directories for session/memory storage
RUN mkdir -p sessions/tutor sessions/site sessions/memory

# Railway/Render/Fly.io inject PORT env var
ENV PORT=8100

EXPOSE ${PORT}

CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT}"]

