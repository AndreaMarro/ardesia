#!/usr/bin/env python3
"""
ELAB Automa — Micro-Research Module
Integrates Semantic Scholar searches in the autonomous cycle.
Every cycle, after checks, searches for 1 relevant paper and saves findings.
"""

import json
import random
from datetime import datetime, date
from pathlib import Path
from typing import Dict, List, Optional

# Import our tools
from tools import search_papers

AUTOMA_ROOT = Path(__file__).parent
KNOWLEDGE_DIR = AUTOMA_ROOT / "knowledge"
DAILY_FINDINGS_FILE = KNOWLEDGE_DIR / "daily-findings.md"

# Ensure knowledge directory exists
KNOWLEDGE_DIR.mkdir(parents=True, exist_ok=True)

def extract_research_topic(check_results: List[Dict], mode: str, task: Optional[Dict] = None) -> str:
    """Extract a relevant research topic from check results and current context."""
    
    # Base topics for different modes
    mode_topics = {
        "IMPROVE": ["educational technology", "learning management systems", "pedagogy technology"],
        "RESEARCH": ["educational psychology", "STEM education", "learning analytics"],
        "WRITE": ["educational content", "teacher training", "educational innovation"],
        "AUDIT": ["accessibility education", "usability testing", "educational interfaces"],
        "EVOLVE": ["automated assessment", "machine learning education", "educational metrics"]
    }
    
    # Extract specific topics from failed checks
    failed_checks = [r for r in check_results if r["status"] == "fail"]
    specific_topics = []
    
    for check in failed_checks:
        name = check.get("name", "")
        detail = check.get("detail", "")
        
        if "galileo" in name.lower():
            if "identity" in detail.lower():
                specific_topics.append("AI tutoring systems identity")
            elif "tag" in detail.lower():
                specific_topics.append("educational AI classification")
            else:
                specific_topics.append("conversational AI education")
        
        elif "ipad" in name.lower():
            specific_topics.append("mobile learning interfaces")
        
        elif "lighthouse" in name.lower():
            specific_topics.append("educational website performance")
        
        elif "build" in name.lower():
            specific_topics.append("educational software development")
    
    # Add task-specific topics if available
    if task:
        task_desc = task.get("description", "").lower()
        if "semantic scholar" in task_desc:
            specific_topics.append("research integration education")
        elif "error" in task_desc:
            specific_topics.append("error handling education")
        elif "vocab" in task_desc:
            specific_topics.append("vocabulary learning systems")
    
    # Combine electronics education with the selected topic
    base_topic = "electronics education"
    
    # Select topic: prefer specific from checks, fallback to mode topics
    if specific_topics:
        additional_topic = random.choice(specific_topics)
    else:
        additional_topic = random.choice(mode_topics.get(mode, mode_topics["IMPROVE"]))
    
    # Create compound query
    research_query = f"{base_topic} {additional_topic}"
    
    return research_query


def perform_micro_research(check_results: List[Dict], mode: str, task: Optional[Dict] = None) -> Dict:
    """Perform micro-research using Semantic Scholar."""
    
    # Extract research topic
    query = extract_research_topic(check_results, mode, task)
    
    # Perform search (limit to 3 to avoid rate limiting)
    papers = search_papers(query, limit=3)
    
    # Process results
    research_result = {
        "timestamp": datetime.now().isoformat(),
        "query": query,
        "mode": mode,
        "task_id": task.get("id", None) if task else None,
        "papers_found": len([p for p in papers if "error" not in p]),
        "papers": papers,
        "actionable_findings": []
    }
    
    # Extract actionable findings
    for paper in papers:
        if "error" in paper:
            continue
            
        title = paper.get("title", "")
        year = paper.get("year", 0)
        citations = paper.get("citationCount", 0)
        abstract = paper.get("abstract", "")
        
        # Only consider recent papers with some citations
        if year >= 2020 and citations >= 5:
            # Simple keyword matching for actionable findings
            actionable_keywords = [
                "misconceptions", "errors", "difficulties", "problems",
                "interface", "usability", "accessibility", 
                "engagement", "motivation", "scaffolding",
                "feedback", "assessment", "evaluation"
            ]
            
            found_keywords = []
            abstract_lower = abstract.lower()
            for keyword in actionable_keywords:
                if keyword in abstract_lower:
                    found_keywords.append(keyword)
            
            if found_keywords:
                research_result["actionable_findings"].append({
                    "title": title,
                    "year": year,
                    "citations": citations,
                    "keywords": found_keywords,
                    "relevance": len(found_keywords) * citations / 100  # Simple relevance score
                })
    
    # Sort by relevance
    research_result["actionable_findings"].sort(key=lambda x: x["relevance"], reverse=True)
    
    return research_result


def save_daily_findings(research_result: Dict) -> None:
    """Save research findings to daily-findings.md."""
    
    today = date.today().strftime("%Y-%m-%d")
    timestamp = datetime.now().strftime("%H:%M")
    
    # Format findings
    findings_text = f"\n## {today} {timestamp} — Micro-Research\n"
    findings_text += f"**Query:** {research_result['query']}\n"
    findings_text += f"**Mode:** {research_result['mode']}\n"
    findings_text += f"**Papers found:** {research_result['papers_found']}\n\n"
    
    if research_result["actionable_findings"]:
        findings_text += "### Actionable Findings:\n"
        for finding in research_result["actionable_findings"][:2]:  # Top 2 most relevant
            findings_text += f"- **{finding['title']}** ({finding['year']}, {finding['citations']} cit.)\n"
            findings_text += f"  Keywords: {', '.join(finding['keywords'])}\n"
            findings_text += f"  Relevance: {finding['relevance']:.1f}\n\n"
    else:
        findings_text += "No actionable findings from current search.\n\n"
    
    # Error papers summary
    error_count = len([p for p in research_result["papers"] if "error" in p])
    if error_count > 0:
        findings_text += f"⚠️ {error_count} search errors (rate limiting?)\n\n"
    
    # Append to daily findings file
    if DAILY_FINDINGS_FILE.exists():
        content = DAILY_FINDINGS_FILE.read_text()
        # Keep only last 30 days of findings (approximate)
        lines = content.split("\n")
        if len(lines) > 1000:  # Trim old content
            lines = lines[-800:]
            content = "\n".join(lines)
    else:
        content = f"# Daily Micro-Research Findings\n\nGenerated by ELAB Automa micro-research system.\n"
    
    content += findings_text
    DAILY_FINDINGS_FILE.write_text(content)


def should_create_task(research_result: Dict) -> Optional[Dict]:
    """Determine if research findings warrant creating a new task."""
    
    # Only create tasks for high-relevance findings
    high_relevance_findings = [
        f for f in research_result["actionable_findings"] 
        if f["relevance"] >= 10  # Threshold for task creation
    ]
    
    if not high_relevance_findings:
        return None
    
    top_finding = high_relevance_findings[0]
    
    # Create task based on keywords
    keywords = top_finding["keywords"]
    
    if "misconceptions" in keywords or "errors" in keywords:
        return {
            "title": f"Research-based improvement: Address common misconceptions",
            "priority": "P2",
            "description": f"Based on recent research '{top_finding['title']}' ({top_finding['year']}), investigate and address common misconceptions in electronics education. Focus on error prevention and correction strategies.",
            "source": "micro_research",
            "paper_reference": {
                "title": top_finding["title"],
                "year": top_finding["year"],
                "citations": top_finding["citations"]
            }
        }
    
    elif "interface" in keywords or "usability" in keywords:
        return {
            "title": f"Research-based UX improvement from recent paper",
            "priority": "P2", 
            "description": f"Based on research '{top_finding['title']}' ({top_finding['year']}), review and improve interface usability. Research shows specific patterns for educational interfaces.",
            "source": "micro_research",
            "paper_reference": {
                "title": top_finding["title"],
                "year": top_finding["year"],
                "citations": top_finding["citations"]
            }
        }
    
    elif "engagement" in keywords or "motivation" in keywords:
        return {
            "title": f"Research-based engagement enhancement",
            "priority": "P3",
            "description": f"Based on research '{top_finding['title']}' ({top_finding['year']}), implement strategies to improve student engagement in electronics education.",
            "source": "micro_research", 
            "paper_reference": {
                "title": top_finding["title"],
                "year": top_finding["year"],
                "citations": top_finding["citations"]
            }
        }
    
    return None


def create_research_task(task_data: Dict) -> None:
    """Create a new task YAML file from research findings."""
    
    queue_dir = AUTOMA_ROOT / "queue" / "pending"
    queue_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique task ID
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    task_id = f"research-{timestamp}"
    
    # Create YAML content
    yaml_content = f"""# Task auto-generated from micro-research
id: {task_id}
title: "{task_data['title']}"
priority: {task_data['priority']}
description: |
  {task_data['description']}

source: {task_data['source']}
created: {datetime.now().isoformat()}

# Research reference
paper_reference:
  title: "{task_data['paper_reference']['title']}"
  year: {task_data['paper_reference']['year']}
  citations: {task_data['paper_reference']['citations']}

tags:
  - research-driven
  - auto-generated
  - evidence-based

estimate_hours: 2
complexity: medium
"""
    
    task_file = queue_dir / f"{task_id}.yml"
    task_file.write_text(yaml_content)
    
    print(f"✅ Created research-driven task: {task_file}")


def run_micro_research(check_results: List[Dict], mode: str, task: Optional[Dict] = None) -> Dict:
    """Main entry point for micro-research integration."""
    
    print("🔬 Running micro-research...")
    
    # Perform research
    research_result = perform_micro_research(check_results, mode, task)
    
    # Save findings
    save_daily_findings(research_result)
    
    # Check if we should create a task
    new_task = should_create_task(research_result)
    if new_task:
        create_research_task(new_task)
        research_result["task_created"] = True
        research_result["task_title"] = new_task["title"]
    else:
        research_result["task_created"] = False
    
    print(f"📊 Research complete: {research_result['papers_found']} papers, {len(research_result['actionable_findings'])} actionable findings")
    
    if research_result["task_created"]:
        print(f"✨ Created new task: {research_result['task_title']}")
    
    return research_result


if __name__ == "__main__":
    # Test the micro-research system
    test_checks = [
        {"name": "galileo", "status": "fail", "detail": "identity leak detected"},
        {"name": "ipad", "status": "warning", "detail": "small buttons found"}
    ]
    
    result = run_micro_research(test_checks, "IMPROVE")
    print(json.dumps(result, indent=2))