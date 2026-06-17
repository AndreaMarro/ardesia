"""ELAB Local Server — FastAPI main.

Replicates the nanobot cloud API using Ollama for local AI inference.
Pipeline: L0 Filters -> L1 Brain -> L2 Specialist Prompts -> L3 LLM -> L4 Post-processing.
"""
import json
import time
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config import VERSION, SERVER_PORT, BRAIN_MODEL, LLM_MODEL
from filters import check_profanity, check_injection, sanitize_message
from postprocess import postprocess, normalize_action_tags, sanitize_identity_leaks
from specialists import (
    load_specialists, get_specialist_prompt, get_site_prompt,
    classify_intent, format_circuit_context, format_simulator_context,
)
from brain import get_brain
from llm import generate, generate_vision, list_models, check_model_available, get_available_providers
from memory import get_memory, sync_memory, save_to_session, get_history
from compiler import compile_code, is_available as compiler_available

# === APP ===
app = FastAPI(title="ELAB Local Server", version=VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Local server — permissive CORS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# === MODELS ===
class ChatRequest(BaseModel):
    message: str
    sessionId: Optional[str] = "default"
    experimentId: Optional[str] = None
    circuitState: Optional[dict] = None
    simulatorContext: Optional[dict] = None
    images: Optional[list] = None  # base64 image strings


class CompileRequest(BaseModel):
    code: str
    board: str = "arduino:avr:nano:cpu=atmega328"


class MemorySyncRequest(BaseModel):
    memory: Optional[dict] = None
    history: Optional[list] = None


class HintRequest(BaseModel):
    experimentId: str
    hintLevel: int = 1


# === STARTUP ===
@app.on_event("startup")
async def startup():
    load_specialists()
    if BRAIN_MODEL:
        brain = get_brain()
        await brain.is_available()
        print(f"[Server] Brain: {BRAIN_MODEL}")
    else:
        print("[Server] Brain SKIPPED — using keyword routing (fast mode)")
    print(f"[Server] LLM: {LLM_MODEL}")
    print(f"[Server] ELAB Local Server v{VERSION} ready on port {SERVER_PORT}")


# === ENDPOINTS ===


@app.get("/health")
async def health():
    """Health check — matches cloud format exactly."""
    models = await list_models()
    brain_ok = False
    if BRAIN_MODEL:
        brain = get_brain()
        brain_ok = await brain.is_available()
    llm_ok = await check_model_available()

    return {
        "status": "ok",
        "version": VERSION,
        "mode": "local",
        "models": {
            "brain": {"name": BRAIN_MODEL or "disabled", "available": brain_ok},
            "llm": {"name": LLM_MODEL, "available": llm_ok},
        },
        "ollama_models": models,
        "compiler": compiler_available(),
        "llm_providers": get_available_providers(),
    }


@app.post("/chat")
async def chat(req: ChatRequest):
    """Main chat endpoint — full L0-L1-L2-L3-L4 pipeline."""
    start = time.monotonic()

    if not req.message or not req.message.strip():
        return {"response": "Ciao! Sono Galileo, il tuo tutor di elettronica. Come posso aiutarti?"}

    message = req.message.strip()

    # --- L0: Filters ---
    profanity = check_profanity(message)
    if profanity:
        return {"response": profanity}

    injection = check_injection(message)
    if injection:
        return {"response": injection}

    sanitized = sanitize_message(message)

    # Prepare context
    circuit_context = format_circuit_context(req.circuitState)
    sim_context = format_simulator_context(req.simulatorContext)
    has_images = bool(req.images)
    history = get_history(req.sessionId) if req.sessionId else []

    # --- L0.5: Fast-path for pure actions (regex, 0ms, no LLM needed) ---
    if not has_images:
        from postprocess import deterministic_action_fallback
        fast_response = deterministic_action_fallback(sanitized, "")
        if fast_response.strip():
            # Regex found a clear action — respond immediately
            fast_response = fast_response.strip()
            if req.sessionId:
                save_to_session(req.sessionId, "user", req.message)
                save_to_session(req.sessionId, "assistant", fast_response)
            elapsed = (time.monotonic() - start) * 1000
            return {
                "response": fast_response,
                "intent": "action",
                "source": "regex",
                "latency_ms": round(elapsed, 1),
            }

    # --- L1: Brain Router (skipped if BRAIN_MODEL is None) ---
    brain_result = None

    if BRAIN_MODEL and not has_images:
        brain = get_brain()
        brain_context = sim_context
        if circuit_context:
            brain_context += f"\ncircuito: {circuit_context[:300]}"
        brain_result = await brain.classify(sanitized, brain_context)

        # Brain says it can handle this directly (needs_llm=false)
        if brain_result and brain_result.get("needs_llm") is False:
            response = brain.format_brain_response(brain_result)
            if response:
                # L4: Post-process
                response = postprocess(response, sanitized)

                if req.sessionId:
                    save_to_session(req.sessionId, "user", req.message)
                    save_to_session(req.sessionId, "assistant", response)

                elapsed = (time.monotonic() - start) * 1000
                return {
                    "response": response,
                    "intent": brain_result.get("intent"),
                    "source": "brain",
                    "latency_ms": round(elapsed, 1),
                }

    # --- L2: Specialist Prompt ---
    intent = "vision" if has_images else classify_intent(sanitized, has_images=has_images)

    # Override intent with Brain hint if available
    if brain_result and brain_result.get("intent"):
        brain_intent = brain_result["intent"]
        if brain_intent in ("circuit", "code", "tutor", "vision"):
            intent = brain_intent

    system_prompt = get_specialist_prompt(intent)

    # Add circuit context to user message
    augmented_message = sanitized
    if circuit_context:
        augmented_message = f"[Stato circuito]\n{circuit_context}\n\n{sanitized}"
    if sim_context:
        augmented_message = f"{sim_context}\n\n{augmented_message}"
    if req.experimentId:
        augmented_message = f"[Esperimento: {req.experimentId}]\n{augmented_message}"

    # --- L3: LLM ---
    if has_images and req.images:
        result = await generate_vision(
            system_prompt=system_prompt,
            user_message=augmented_message,
            image_base64=req.images[0],
        )
    else:
        result = await generate(
            system_prompt=system_prompt,
            user_message=augmented_message,
            history=history,
        )

    response = result.get("response", "")

    if result.get("error") and not response:
        response = (
            "Mi dispiace, ho un problema tecnico. "
            "Assicurati che Ollama sia in esecuzione con il modello corretto."
        )

    # --- L4: Post-process ---
    response = postprocess(response, sanitized)

    # Save to session
    if req.sessionId:
        save_to_session(req.sessionId, "user", req.message)
        save_to_session(req.sessionId, "assistant", response)

    elapsed = (time.monotonic() - start) * 1000
    return {
        "response": response,
        "intent": intent,
        "source": "llm",
        "model": result.get("model"),
        "latency_ms": round(elapsed, 1),
    }


@app.post("/tutor-chat")
async def tutor_chat(req: ChatRequest):
    """Tutor chat — same as /chat but with experiment context emphasis."""
    return await chat(req)


@app.post("/site-chat")
async def site_chat(req: ChatRequest):
    """Site chatbot — uses site-specific prompt."""
    if not req.message or not req.message.strip():
        return {"response": "Ciao! Come posso aiutarti con ELAB?"}

    message = req.message.strip()

    profanity = check_profanity(message)
    if profanity:
        return {"response": profanity}

    injection = check_injection(message)
    if injection:
        return {"response": injection}

    sanitized = sanitize_message(message)
    system_prompt = get_site_prompt()

    result = await generate(
        system_prompt=system_prompt,
        user_message=sanitized,
    )

    response = result.get("response", "")
    if not response:
        response = "Mi dispiace, non riesco a rispondere. Riprova tra poco!"

    response = sanitize_identity_leaks(normalize_action_tags(response))

    return {"response": response}


@app.post("/diagnose")
async def diagnose(req: ChatRequest):
    """Circuit diagnosis — uses circuit specialist with diagnosis focus."""
    if not req.circuitState:
        return {"response": "Nessun circuito da analizzare. Costruisci qualcosa sulla breadboard!"}

    circuit_context = format_circuit_context(req.circuitState)
    system_prompt = get_specialist_prompt("circuit")

    diagnosis_prompt = (
        f"[DIAGNOSI CIRCUITO]\n{circuit_context}\n\n"
        f"Esperimento: {req.experimentId or 'libero'}\n\n"
        f"Analizza il circuito e trova errori."
    )

    result = await generate(
        system_prompt=system_prompt,
        user_message=diagnosis_prompt,
    )

    response = result.get("response", "Non riesco ad analizzare il circuito.")
    response = postprocess(response, "diagnosi circuito")

    return {"response": response}


@app.post("/hints")
async def hints(req: HintRequest):
    """Progressive hints for experiments."""
    system_prompt = get_specialist_prompt("tutor")

    hint_prompt = (
        f"Dammi un suggerimento di livello {req.hintLevel} (1=gentile, 2=medio, 3=diretto) "
        f"per l'esperimento {req.experimentId}. "
        f"Non rivelare la soluzione completa ai livelli 1 e 2."
    )

    result = await generate(
        system_prompt=system_prompt,
        user_message=hint_prompt,
    )

    return {
        "hint": result.get("response", "Prova a rileggere le istruzioni dell'esperimento."),
        "level": req.hintLevel,
    }


@app.get("/memory/{session_id}")
async def read_memory(session_id: str):
    """Read session memory."""
    return get_memory(session_id)


@app.post("/memory/sync")
async def memory_sync(req: MemorySyncRequest, session_id: str = "default"):
    """Sync session memory from frontend."""
    return sync_memory(session_id, req.model_dump())


@app.post("/compile")
async def compile_endpoint(req: CompileRequest):
    """Compile Arduino code using arduino-cli."""
    if not req.code or not req.code.strip():
        return {
            "success": False,
            "hex": None,
            "output": "",
            "errors": ["Nessun codice da compilare"],
            "warnings": [],
        }

    result = await compile_code(req.code, req.board)
    return result


@app.get("/brain-stats")
async def brain_stats():
    """Brain model stats."""
    if not BRAIN_MODEL:
        return {"model": "disabled", "available": False, "mode": "keyword-routing"}
    brain = get_brain()
    available = await brain.is_available()
    return {
        "model": BRAIN_MODEL,
        "available": available,
        "mode": "active" if available else "off",
    }


@app.get("/brain-test")
async def brain_test():
    """Quick Brain test with a sample message."""
    if not BRAIN_MODEL:
        return {"input": "avvia la simulazione", "result": None, "available": False, "mode": "keyword-routing"}
    brain = get_brain()
    result = await brain.classify("avvia la simulazione", "[CONTESTO]\ntab: simulator")
    return {
        "input": "avvia la simulazione",
        "result": result,
        "available": await brain.is_available(),
    }


# === MAIN ===
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=SERVER_PORT)
