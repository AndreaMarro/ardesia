"""
ELAB Automa — Benchmark Definitions V3
Definiti da Andrea Marro 2026-03-25.
Usati da: orchestrator.py, evaluate.py (parzialmente), PROMPT-DEFINITIVO.md.

Struttura:
  BENCHMARK_CORE     — misurati da evaluate.py ogni ciclo
  BENCHMARK_LIM      — esperienza insegnante alla LIM (da misurare)
  BENCHMARK_SIM      — simulatore circuiti
  BENCHMARK_GALILEO  — AI tutor Galileo
  BENCHMARK_MKTG     — marketing e ricavi
  BENCHMARK_PEDAGOGY — impatto pedagogico
  BENCHMARK_GDPR     — privacy e conformità
  BENCHMARK_AESTHETIC — design ed estetica
  BENCHMARK_TECH     — stato dell'arte tecnico
"""

# ═══ CORE (misurati da evaluate.py) ═══
BENCHMARK_CORE = {
    "composite":          {"target": 0.92,  "unit": "score", "note": "target realistico"},
    "lighthouse_perf":    {"target": 0.80,  "unit": "score"},
    "ipad_compliance":    {"target": 0.85,  "unit": "score"},
    "galileo_check":      {"target": 0.80,  "unit": "score"},
    "gulpease":           {"target": 0.75,  "unit": "score"},
    "galileo_identity":   {"target": 1.00,  "unit": "score", "note": "non negoziabile"},
    "content_integrity":  {"target": 1.00,  "unit": "score", "note": "non negoziabile"},
    "build_pass":         {"target": True,   "unit": "bool",  "note": "non negoziabile"},
}

# ═══ SIMULAZIONI UTENTE E LEZIONI ═══
BENCHMARK_SIMULATIONS = {
    "sim_teacher_lim_success":         {"target": 0.90,  "unit": "rate", "note": "% simulazioni insegnante LIM che passano"},
    "sim_student_ipad_success":        {"target": 0.90,  "unit": "rate", "note": "% simulazioni studente iPad che passano"},
    "sim_lesson_45min_no_errors":      {"target": True,   "unit": "bool", "note": "lezione 45min senza crash"},
    "sim_experiment_load_time_s":      {"target": 3,      "unit": "sec",  "note": "max secondi per caricare esperimento"},
    "sim_experiment_switch_time_s":    {"target": 2,      "unit": "sec",  "note": "max secondi per cambiare esperimento"},
}

# ═══ LIM EXPERIENCE ═══
BENCHMARK_LIM = {
    "teacher_flow_clicks":             {"target": 3,      "unit": "count", "note": "max click per iniziare lezione"},
    "first_load_seconds":              {"target": 5,      "unit": "sec"},
    "mobile_touch_target_min_px":      {"target": 44,     "unit": "px",   "note": "Apple HIG standard"},
    "text_readability_min_px":         {"target": 16,     "unit": "px"},
    "time_to_first_wow_seconds":       {"target": 30,     "unit": "sec"},
    "no_manual_needed":                {"target": True,   "unit": "bool"},
    "self_explanatory_ui":             {"target": 0.80,   "unit": "score"},
    "error_messages_italian_clear":    {"target": 1.00,   "unit": "score"},
    "help_galileo_accessible":         {"target": True,   "unit": "bool", "note": "Galileo con 1 click"},
    "zero_tech_knowledge_usable":      {"target": 0.80,   "unit": "score"},
}

# ═══ SIMULATORE ═══
BENCHMARK_SIMULATOR = {
    "simulator_all_experiments_work":  {"target": 0.95,  "unit": "rate"},
    "simulator_mna_solver_accuracy":   {"target": 0.99,  "unit": "score"},
    "simulator_canvas_responsive":     {"target": True,   "unit": "bool"},
    "simulator_touch_interactions":    {"target": True,   "unit": "bool"},
    "simulator_offline_capable":       {"target": True,   "unit": "bool", "note": "PWA target"},
    "vol1_experiments_complete":       {"target": 0.80,   "unit": "rate", "note": "38 esperimenti"},
    "vol2_experiments_complete":       {"target": 0.50,   "unit": "rate", "note": "18 esperimenti"},
    "vol3_arduino_ready":              {"target": False,  "unit": "bool", "note": "target futuro"},
}

# ═══ GALILEO AI TUTOR ═══
BENCHMARK_GALILEO = {
    "galileo_load_experiment_tag":     {"target": 1.00,  "unit": "score", "note": "[[AZIONE:loadexp]]"},
    "galileo_all_27_tags_work":        {"target": 0.95,  "unit": "rate",  "note": "27 tag azione"},
    "galileo_guides_experiment":       {"target": 0.80,  "unit": "score"},
    "galileo_explains_circuit":        {"target": 0.90,  "unit": "score"},
    "galileo_adapts_to_level":         {"target": 0.70,  "unit": "score"},
    "galileo_response_time_s":         {"target": 3,     "unit": "sec"},
    "galileo_factual_accuracy":        {"target": 0.95,  "unit": "score"},
    "galileo_no_hallucination":        {"target": 0.99,  "unit": "score"},
    "galileo_pedagogical_tone":        {"target": 0.90,  "unit": "score"},
    "galileo_identity_preserved":      {"target": 1.00,  "unit": "score", "note": "non negoziabile"},
    "nanobot_routing_accuracy":        {"target": 0.95,  "unit": "score"},
    "brain_classification_speed_ms":   {"target": 100,   "unit": "ms"},
    "vocabulary_progressive":          {"target": True,   "unit": "bool"},
    "curriculum_yaml_aligned":         {"target": True,   "unit": "bool"},
}

# ═══ PRODUTTIVITA' AUTOMA ═══
BENCHMARK_AUTOMA = {
    "cycle_productivity":              {"target": 0.60,  "unit": "rate", "note": "cicli che producono codice"},
    "research_actionability":          {"target": 0.50,  "unit": "rate", "note": "ricerche -> task"},
    "resources_utilization":           {"target": 0.50,  "unit": "rate"},
    "context_continuity":              {"target": 0.70,  "unit": "rate"},
    "new_features_per_week":           {"target": 2,     "unit": "count"},
    "lateral_insights_applied":        {"target": 1,     "unit": "count/week"},
    "experiments_run":                 {"target": 5,     "unit": "count/week"},
    "ux_improvements_per_week":        {"target": 3,     "unit": "count"},
}

# ═══ MARKETING E RICAVI ═══
BENCHMARK_MARKETING = {
    "landing_page_conversion_ready":   {"target": True,   "unit": "bool"},
    "seo_meta_complete":               {"target": True,   "unit": "bool"},
    "social_proof_elements":           {"target": 3,      "unit": "count"},
    "value_proposition_clarity":       {"target": 0.90,   "unit": "score", "note": "capisce in 5s"},
    "pricing_page_exists":             {"target": True,   "unit": "bool"},
    "free_trial_flow_clicks":          {"target": 2,      "unit": "count"},
    "onboarding_completion_rate":      {"target": 0.80,   "unit": "rate"},
    "time_to_first_value_seconds":     {"target": 30,     "unit": "sec"},
}

# ═══ ESTETICA ═══
BENCHMARK_AESTHETIC = {
    "visual_consistency":              {"target": 0.90,   "unit": "score"},
    "modern_design":                   {"target": 0.80,   "unit": "score"},
    "whitespace_balance":              {"target": 0.80,   "unit": "score"},
    "color_contrast_aa":               {"target": True,   "unit": "bool",  "note": "WCAG AA"},
    "animation_smooth":                {"target": True,   "unit": "bool"},
}

# ═══ TECNOLOGIA ═══
BENCHMARK_TECH = {
    "uses_latest_react":               {"target": True,   "unit": "bool", "note": "React 19+"},
    "uses_modern_bundler":             {"target": True,   "unit": "bool", "note": "Vite 6+"},
    "ai_model_current":                {"target": True,   "unit": "bool"},
    "pwa_score":                       {"target": 0.80,   "unit": "score"},
    "security_headers":                {"target": True,   "unit": "bool", "note": "CSP, HSTS, X-Frame"},
}

# ═══ ARDUINO (Vol3) ═══
BENCHMARK_ARDUINO = {
    "arduino_avr_bridge_functional":   {"target": True,   "unit": "bool", "note": "ATmega328p nel simulatore"},
    "arduino_basic_sketch_runs":       {"target": 0.80,   "unit": "rate", "note": "% sketch base"},
    "arduino_serial_monitor":          {"target": True,   "unit": "bool"},
    "arduino_led_rgb_control":         {"target": True,   "unit": "bool"},
    "arduino_sensor_reading":          {"target": True,   "unit": "bool"},
}

# ═══ BREAKOUT (giochi educativi) ═══
BENCHMARK_BREAKOUT = {
    "breakout_game_functional":        {"target": True,   "unit": "bool"},
    "breakout_touch_controls":         {"target": True,   "unit": "bool", "note": "iPad/LIM"},
    "breakout_educational_integration":{"target": 0.70,   "unit": "score"},
    "breakout_reward_system":          {"target": True,   "unit": "bool"},
}

# ═══ SCRATCH (programmazione visuale) ═══
BENCHMARK_SCRATCH = {
    "scratch_blocks_available":        {"target": True,   "unit": "bool"},
    "scratch_to_circuit_mapping":      {"target": 0.70,   "unit": "score"},
    "scratch_beginner_friendly":       {"target": 0.90,   "unit": "score"},
    "scratch_visual_feedback":         {"target": True,   "unit": "bool"},
    "scratch_undo_redo":               {"target": True,   "unit": "bool"},
}

# ═══ RICAVI (Revenue) ═══
BENCHMARK_RICAVI = {
    "school_paid_subscriptions":       {"target": 0,     "unit": "count", "note": "scuole con abbonamento attivo"},
    "monthly_recurring_revenue_eur":   {"target": 0,     "unit": "eur",   "note": "MRR target entro 6 mesi"},
    "trial_to_paid_conversion_rate":   {"target": 0.15,  "unit": "rate",  "note": "15% conversione demo→pagante"},
    "cac_school_eur":                  {"target": 200,   "unit": "eur",   "note": "costo acquisizione scuola"},
    "ltv_school_eur":                  {"target": 500,   "unit": "eur",   "note": "lifetime value scuola media"},
    "demo_requests_per_month":         {"target": 5,     "unit": "count", "note": "richieste demo al mese"},
    "referral_rate":                   {"target": 0.20,  "unit": "rate",  "note": "scuole che referral ad altre"},
    "revenue_per_student_eur":         {"target": 5,     "unit": "eur/yr","note": "€5/studente/anno target"},
}

# ═══ PEDAGOGIA (Learning Outcomes) ═══
BENCHMARK_PEDAGOGY = {
    "learning_objective_coverage":     {"target": 0.90,  "unit": "rate",  "note": "% obiettivi curricolo coperti"},
    "concept_scaffolding_quality":     {"target": 0.80,  "unit": "score", "note": "ZPD Vygotsky: da semplice a complesso"},
    "error_feedback_actionable":       {"target": 0.90,  "unit": "rate",  "note": "% errori con feedback utile"},
    "experiment_completion_rate":      {"target": 0.75,  "unit": "rate",  "note": "studenti che completano esperimento"},
    "student_progression_tracked":     {"target": True,   "unit": "bool",  "note": "progresso per studente salvato"},
    "teacher_prep_time_min":           {"target": 5,     "unit": "min",   "note": "max tempo preparazione lezione"},
    "socratic_questions_ratio":        {"target": 0.60,  "unit": "rate",  "note": "Galileo chiede vs spiega"},
    "misconception_detection":         {"target": 0.70,  "unit": "rate",  "note": "individua errori concettuali"},
    "formative_assessment_builtin":    {"target": True,   "unit": "bool",  "note": "quiz integrati nei moduli"},
    "differentiated_levels":           {"target": 3,     "unit": "count", "note": "livelli: base/intermedio/avanzato"},
}

# ═══ VOLUMI (Per-volume completion) ═══
BENCHMARK_VOLUMI = {
    "vol1_experiments_count":          {"target": 38,    "unit": "count", "note": "Vol1: Elettricità base"},
    "vol2_experiments_count":          {"target": 18,    "unit": "count", "note": "Vol2: Arduino base"},
    "vol3_experiments_count":          {"target": 11,    "unit": "count", "note": "Vol3: Arduino avanzato"},
    "vol1_all_solvable":               {"target": 1.00,  "unit": "rate",  "note": "100% circuiti risolvibili dal solver"},
    "vol2_avr_runs":                   {"target": 0.90,  "unit": "rate",  "note": "% sketch AVR che girano"},
    "vol3_avr_runs":                   {"target": 0.80,  "unit": "rate",  "note": "% sketch avanzati"},
    "vol1_curriculum_yaml_aligned":    {"target": True,   "unit": "bool"},
    "vol2_curriculum_yaml_aligned":    {"target": True,   "unit": "bool"},
    "vol3_curriculum_yaml_aligned":    {"target": False,  "unit": "bool", "note": "work in progress"},
}

# ═══ INTELLETTIVI (Cognitive & Innovation) ═══
BENCHMARK_INTELLETTIVI = {
    "cognitive_load_low":              {"target": 0.80,  "unit": "score", "note": "UI non sovraccarica"},
    "attention_span_match_min":        {"target": 10,    "unit": "min",   "note": "unità di apprendimento ≤10 min"},
    "curiosity_triggers_per_lesson":   {"target": 3,     "unit": "count", "note": "momenti wow/sorpresa per lezione"},
    "innovation_features_per_sprint":  {"target": 2,     "unit": "count", "note": "nuove feature non standard"},
    "lateral_thinking_applied":        {"target": 1,     "unit": "count/week", "note": "idee da ambiti non-edtech"},
    "creative_problem_solving_score":  {"target": 0.80,  "unit": "score"},
    "autonomous_discovery_enabled":    {"target": True,   "unit": "bool",  "note": "studente può sperimentare liberamente"},
    "fail_safe_experimentation":       {"target": True,   "unit": "bool",  "note": "non si può rompere niente"},
    "interdisciplinary_connections":   {"target": 3,     "unit": "count/vol", "note": "fisica, math, IT per volume"},
}

# ═══ GDPR E PRIVACY ═══
BENCHMARK_GDPR = {
    "gdpr_cookie_consent":             {"target": True,   "unit": "bool"},
    "gdpr_no_tracking_without_consent":{"target": True,   "unit": "bool"},
    "gdpr_data_minimization":          {"target": True,   "unit": "bool"},
    "gdpr_privacy_policy_exists":      {"target": True,   "unit": "bool"},
    "gdpr_no_pii_in_logs":             {"target": True,   "unit": "bool"},
    "gdpr_right_to_deletion":          {"target": True,   "unit": "bool"},
}

# ═══ SUMMARY ═══
ALL_BENCHMARKS = {
    **{k: v["target"] for k, v in BENCHMARK_CORE.items()},
    **{k: v["target"] for k, v in BENCHMARK_SIMULATIONS.items()},
    **{k: v["target"] for k, v in BENCHMARK_LIM.items()},
    **{k: v["target"] for k, v in BENCHMARK_SIMULATOR.items()},
    **{k: v["target"] for k, v in BENCHMARK_GALILEO.items()},
    **{k: v["target"] for k, v in BENCHMARK_AUTOMA.items()},
    **{k: v["target"] for k, v in BENCHMARK_MARKETING.items()},
    **{k: v["target"] for k, v in BENCHMARK_AESTHETIC.items()},
    **{k: v["target"] for k, v in BENCHMARK_TECH.items()},
    **{k: v["target"] for k, v in BENCHMARK_GDPR.items()},
    **{k: v["target"] for k, v in BENCHMARK_ARDUINO.items()},
    **{k: v["target"] for k, v in BENCHMARK_BREAKOUT.items()},
    **{k: v["target"] for k, v in BENCHMARK_SCRATCH.items()},
    **{k: v["target"] for k, v in BENCHMARK_RICAVI.items()},
    **{k: v["target"] for k, v in BENCHMARK_PEDAGOGY.items()},
    **{k: v["target"] for k, v in BENCHMARK_VOLUMI.items()},
    **{k: v["target"] for k, v in BENCHMARK_INTELLETTIVI.items()},
}

# Core subset used for scoring in orchestrator.py
BENCHMARK_CORE_TARGETS = {k: v["target"] for k, v in BENCHMARK_CORE.items()}


def get_benchmark_summary():
    """Return a concise benchmark summary for prompt injection."""
    sections = {
        "CORE (misurati)": BENCHMARK_CORE,
        "LIM EXPERIENCE": BENCHMARK_LIM,
        "SIMULATORE": BENCHMARK_SIMULATOR,
        "GALILEO": BENCHMARK_GALILEO,
        "MARKETING": BENCHMARK_MARKETING,
        "GDPR": BENCHMARK_GDPR,
    }
    lines = []
    for section, benchmarks in sections.items():
        lines.append(f"\n### {section}")
        for key, meta in list(benchmarks.items())[:6]:  # Max 6 per section
            target = meta["target"]
            note = meta.get("note", "")
            note_str = f" ({note})" if note else ""
            lines.append(f"  {key}: {target}{note_str}")
    return "\n".join(lines)


if __name__ == "__main__":
    print(f"Totale benchmark definiti: {len(ALL_BENCHMARKS)}")
    print(get_benchmark_summary())
