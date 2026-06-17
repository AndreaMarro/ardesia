"""
Combinatorial section: generates multi-component/multi-action phrases
by sampling from component pools, action verbs, and conjunctions.

The combinatorial space is huge (21 comp × 10 verbs × 7 conjunctions × C(21,2-4))
so we sample randomly rather than enumerating all combinations.
"""
import json
from .base import Section


class ComboSection(Section):
    """Generate multi-component placement phrases via random sampling."""

    def __init__(self, components: dict, action_verbs: list, conjunctions: list,
                 corruption_pipeline, system_prompt: str = "",
                 corruptions: dict = None, responses: list = None):
        super().__init__({"id": "combos", "name": "Combinatorial Multi-Component"})
        self.components = components
        self.verbs = action_verbs
        self.conj = conjunctions
        self.cp = corruption_pipeline
        self.system_prompt = system_prompt
        self.corruptions = corruptions or {"typo_swap": 0.3, "emoji": 0.1}
        self.responses = responses or [
            "{components} — li monto subito!",
            "Ecco {components}, tutti in posizione!",
            "Arrivo con {components}!",
            "{components}? Fatto, tutto montato!",
            "Pronti! {components} sulla breadboard!",
        ]

    def _pick_slang(self, comp_id: str) -> str:
        """Pick a random slang name for a component."""
        slang_list = self.components[comp_id].get("slang", [comp_id])
        return self.cp.rng.choice(slang_list) if slang_list else comp_id

    def _build_phrase(self, parts: list[str]) -> str:
        """Build a natural language phrase from component names."""
        verb = self.cp.rng.choice(self.verbs)
        conj = self.cp.rng.choice(self.conj)

        if len(parts) == 1:
            return f"{verb} {parts[0]}"
        elif len(parts) == 2:
            return f"{verb} {parts[0]} {conj} {parts[1]}"
        else:
            return f"{verb} {', '.join(parts[:-1])} {conj} {parts[-1]}"

    def _build_response(self, comp_ids: list[str]) -> str:
        """Pick and fill a warm response template."""
        template = self.cp.rng.choice(self.responses)
        comp_names = ", ".join(comp_ids)
        return template.replace("{components}", comp_names)

    def generate(self, target_count: int) -> list[dict]:
        """Generate target_count multi-component examples."""
        rng = self.cp.rng
        comp_ids = list(self.components.keys())
        results = []

        while len(results) < target_count:
            # Pick 2-4 components (weighted toward 2-3)
            n = rng.choice([2, 2, 2, 3, 3, 4])
            n = min(n, len(comp_ids))
            chosen = rng.sample(comp_ids, k=n)

            # Build phrase from slang names
            parts = [self._pick_slang(c) for c in chosen]
            phrase = self._build_phrase(parts)

            # Apply corruption
            if self.corruptions:
                phrase = self.cp.apply_config(phrase, self.corruptions)

            # Build JSON output
            intent_obj = {
                "action": "place_and_wire",
                "components": [{"type": c} for c in chosen],
                "wires": "auto",
            }
            output = json.dumps({
                "intent": "circuit",
                "entities": chosen,
                "actions": [f"[INTENT:{json.dumps(intent_obj, ensure_ascii=False)}]"],
                "needs_llm": False,
                "response": self._build_response(chosen),
                "llm_hint": None,
            }, ensure_ascii=False)

            results.append({
                "messages": [
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": phrase},
                    {"role": "assistant", "content": output},
                ]
            })

        return results[:target_count]
