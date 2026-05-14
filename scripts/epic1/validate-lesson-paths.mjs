#!/usr/bin/env node
/**
 * EPIC 1 / A4.1a — lesson-path validation gate (READ-ONLY).
 *
 * Compares every src/data/lesson-paths/*.json against its a3-corrections.json
 * entry (the correction contract). At A4.1a-time this reports RED — it IS the
 * A4.1 divergence work-list. It turns GREEN as A4.1b-e land.
 *
 * Usage: node scripts/epic1/validate-lesson-paths.mjs
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { norm } from './build-alignment-records.mjs';

export function checkLessonPath(id, lessonPath, correction) {
  const issues = [];
  if (!correction) {
    return { id, action: null, ok: false, issues: [`no correction entry for ${id}`] };
  }
  if (correction.action === 'remove') {
    issues.push(`pending-removal: correction.action=remove but lesson-path ${id} still exists`);
  } else if (correction.action === 'consolidate') {
    issues.push(`pending-consolidation: ${id} should be consolidated into ${correction.consolidateInto}`);
  } else {
    // action keep | correct — the lesson-path should match the contract
    if (correction.bookFaithfulTitle != null
        && norm(lessonPath?.title) !== norm(correction.bookFaithfulTitle)) {
      issues.push(`title: "${lessonPath?.title}" != contract "${correction.bookFaithfulTitle}"`);
    }
    if (correction.chapter != null && Number(lessonPath?.chapter) !== Number(correction.chapter)) {
      issues.push(`chapter: ${lessonPath?.chapter} != contract ${correction.chapter}`);
    }
    const lpNext = lessonPath?.next_experiment?.id ?? null;
    if (lpNext !== correction.nextId) {
      issues.push(`nextId: ${lpNext} != contract ${correction.nextId}`);
    }
  }
  return { id, action: correction.action, ok: issues.length === 0, issues };
}
