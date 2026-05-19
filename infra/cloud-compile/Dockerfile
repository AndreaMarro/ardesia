# ELAB Cloud Compile Service iter 76 — Render deploy
# arduino-cli + Renesas core 1.5.3 + Express POST /compile endpoint
# Andrea direttiva iter 75 PM: WebUSB direct dalla piattaforma, NO download docente.

FROM node:22-bookworm-slim AS base

# System deps for arduino-cli + Renesas RA4M1 compile chain
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Install arduino-cli 1.4.1 (matches Andrea local dev iter 73 CC-1 verified)
RUN mkdir -p /usr/local/bin && \
    curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | BINDIR=/usr/local/bin sh && \
    arduino-cli version

# Init arduino-cli config + install Renesas UNO R4 core (~150MB toolchain)
RUN arduino-cli config init && \
    arduino-cli core update-index && \
    arduino-cli core install arduino:renesas_uno@1.5.3 && \
    arduino-cli core install arduino:avr@1.8.7 && \
    arduino-cli core list

# Working directory for cloud service
WORKDIR /app

# Install Node deps (package.json + package-lock.json)
COPY package.json ./
RUN npm install --production --no-audit --no-fund

# Copy service source
COPY server.js ./

# Render port convention (env $PORT) + healthcheck
ENV PORT=8765
EXPOSE 8765

# Use dumb-init OR node direct
CMD ["node", "server.js"]
