#!/usr/bin/env python3
"""
Patch per l'orchestrator: integrazione micro-research
"""

# Patch 1: Aggiungere import del nuovo modulo micro_research
import_patch = """
# Import our modules
sys.path.insert(0, str(AUTOMA_ROOT))
from checks import run_all_checks, print_results
from queue_manager import get_next_task, claim_task, complete_task, fail_task, stats
from tools import search_papers, gulpease_index, chat_galileo
from micro_research import run_micro_research  # NEW: micro-research integration
"""

# Patch 2: Sostituire la vecchia implementazione micro_research
micro_research_patch = """
def micro_research_integration(check_results: list, state: dict, mode: str = "IMPROVE", task: dict = None) -> str:
    \"\"\"Integrated micro-research using Semantic Scholar with check results context.\"\"\"
    try:
        research_result = run_micro_research(check_results, mode, task)
        
        # Format summary for orchestrator logs
        summary = f"Query: {research_result['query']}"
        if research_result['papers_found'] > 0:
            summary += f" | {research_result['papers_found']} papers, {len(research_result['actionable_findings'])} actionable"
            if research_result['task_created']:
                summary += f" | Task created: {research_result['task_title'][:50]}"
        else:
            summary += " | No papers found (rate limit?)"
            
        return summary
        
    except Exception as e:
        return f"Micro-research error: {str(e)[:100]}"


# OLD micro_research function to replace
def micro_research(state: dict) -> str:
    \"\"\"DEPRECATED: Use micro_research_integration instead\"\"\"
    return "DEPRECATED - using new micro_research_integration"
"""

# Patch 3: Sostituire la chiamata nella run_cycle
call_patch = """
    # Step 4: Micro-research (every cycle — costante ricerca)
    print("\\n🔬 Micro-research...")
    research = micro_research_integration(check_results, state, mode, task)
    if research:
        print(f"   {research[:120]}")
    else:
        print("   No results")
"""

print("Patches ready for orchestrator.py:")
print("1. Add import:", import_patch)
print("2. Replace micro_research function:", micro_research_patch)
print("3. Update call in run_cycle:", call_patch)