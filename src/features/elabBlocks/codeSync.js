// © Andrea Marro — 24/05/2026 — ELAB Tutor — Tutti i diritti riservati
import { getStarterXml } from './starterTemplates.js';

export const NANO_R4_BLINK_CPP = `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}
`;

function stripCppComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

function normalizeCpp(source) {
  return stripCppComments(source)
    .replace(/\bLED_BUILTIN\b/g, '13')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isNanoR4BlinkCpp(source) {
  const code = normalizeCpp(source);
  return /void\s+setup\s*\(\s*\)\s*{[^}]*pinMode\s*\(\s*13\s*,\s*OUTPUT\s*\)\s*;[^}]*}/.test(code)
    && /void\s+loop\s*\(\s*\)\s*{[^}]*digitalWrite\s*\(\s*13\s*,\s*HIGH\s*\)\s*;[^}]*delay\s*\(\s*\d+\s*\)\s*;[^}]*digitalWrite\s*\(\s*13\s*,\s*LOW\s*\)\s*;[^}]*delay\s*\(\s*\d+\s*\)\s*;[^}]*}/.test(code);
}

export function cppToBlocklyXml(source) {
  if (!isNanoR4BlinkCpp(source)) return null;
  return getStarterXml('blink');
}
