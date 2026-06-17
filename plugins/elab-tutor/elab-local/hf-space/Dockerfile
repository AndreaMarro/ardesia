FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential cmake && \
    rm -rf /var/lib/apt/lists/*

ENV CMAKE_ARGS="-DGGML_CUDA=OFF -DGGML_BLAS=OFF -DGGML_METAL=OFF"
ENV FORCE_CMAKE=1

RUN pip install --no-cache-dir \
    llama-cpp-python \
    fastapi \
    "uvicorn[standard]" \
    huggingface_hub

COPY server.py .

ENV PORT=7860
EXPOSE 7860

CMD ["python", "server.py"]
