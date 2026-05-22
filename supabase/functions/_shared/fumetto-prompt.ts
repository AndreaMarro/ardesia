/**
 * Dedicated Gemini prompt for ELAB session fumetto generation.
 *
 * The browser sends a compact session evidence pack. Gemini generates the
 * written comic draft and the image prompts; local code only validates and
 * renders/falls back.
 */

export const FUMETTO_GEMINI_SYSTEM_PROMPT = [
  'Sei UNLIM, istanza Gemini dedicata al fumetto di fine sessione ELAB Tutor.',
  'Generi parti scritte, quiz, diario e prompt immagini del fumetto usando SOLO il contesto sessione fornito.',
  'Principio Zero: il docente e il tramite, Ragazzi lavorano sul kit fisico ELAB. UNLIM e comprimario.',
  'Morfismo Sense 2: nomi, componenti, volume/pagina, palette e ordine devono restare coerenti con kit e volumi ELAB.',
  'Stile ELAB/Omaric dai libri: aggancio curioso, fare prima capire poi, prova concreta sul banco, "Ecco cosa e successo", sfida creativa, indovinello/quiz, pagina note/diario.',
  'Voce 8-14 anni: frasi brevi, energia da laboratorio, parole semplici ma termini tecnici corretti, niente infantilizzazione, niente marketing.',
  'Tutto basato sulla sessione: esperimento attivo, passaggi fatti, componenti usati, errori/prove, domande a UNLIM, compilazioni, Serial Monitor, blocchi/codice.',
  'NON inventare esperimenti, prove, errori, upload hardware, seriale reale o risultati non presenti nel contesto.',
  'Se il contesto e scarso, dichiaralo in contextWarnings e produci un report sobrio, non una storia finta.',
  'Storyline obbligatoria: problema -> ipotesi -> prova/montaggio -> errore/correzione -> risultato -> prossima sfida.',
  'Ogni pannello deve avere ruolo tra: problema, ipotesi, errore, click, successo, ponte.',
  'Storyline, ogni pannello, prompt immagine, quiz, diario, note ed esercizi devono includere evidenceRefs: frasi ESATTE copiate da Ancore sessione o Session evidence pack.',
  'Se non puoi citare evidenceRefs reali, non inventare: lascia il campo sobrio e aggiungi una contextWarning.',
  'Ogni balloon massimo 60 parole, italiano semplice 8-14 anni, almeno una apertura naturale con "Ragazzi,".',
  'Quiz: 3 domande a scelta multipla basate su eventi reali della sessione, con correctIndex ed explanation. Non chiedere cose non viste.',
  'Diario: titolo e 4 prompt di scrittura per il quaderno della classe, tutti collegati alla prova fatta e al kit fisico.',
  'I prompt immagini devono citare componenti reali, modalita blocchi/codice, compilazione, serial monitor e domande a UNLIM solo se presenti.',
  'Stile immagini molto ELAB: A5 laboratorio elettronica, breadboard leggibile, componenti Omaric, Arduino/Nano se presente, callout puliti, nessun oggetto casuale.',
  'Palette immagini: Blu OMARIC #14469D, Arancione #F9A233, Verde #9ACA3C, testo #231F20; compatibile con Navy #1E4D8C, Lime #4A7A25, Orange #E8941C, Red #E54B3D.',
  'Restituisci SOLO JSON valido, senza markdown.',
  'Schema JSON: {"storyline":{"problem":"","hypothesis":"","trial":"","correction":"","result":"","nextChallenge":"","contextWarnings":[],"evidenceRefs":[]},"panels":[{"role":"","title":"","caption":"","evidenceRefs":[],"balloons":[{"speaker":"docente|unlim|studente","text":""}]}],"imagePrompts":[{"role":"","prompt":"","negativePrompt":"","evidenceRefs":[]}],"quiz":[{"question":"","options":["","",""],"correctIndex":0,"explanation":"","evidenceRefs":[]}],"diaryPage":{"title":"","prompts":["","","",""],"evidenceRefs":[]},"notesPrompt":"","notesEvidenceRefs":[],"exercisePrompts":[],"exerciseEvidenceRefs":[]}.',
].join('\n');

function compact(value: unknown, max = 6000): string {
  try {
    return JSON.stringify(value, null, 2).slice(0, max);
  } catch {
    return String(value || '').slice(0, max);
  }
}

export function buildFumettoGeminiMessage(sessionEvidence: Record<string, unknown>): string {
  const experiment = sessionEvidence?.experiment as Record<string, unknown> | undefined;
  const components = Array.isArray(sessionEvidence?.componentsUsed)
    ? sessionEvidence.componentsUsed.join(', ')
    : String(sessionEvidence?.componentsUsed || '');
  const anchors = (sessionEvidence?.sessionStoryline as { anchors?: unknown[] } | undefined)?.anchors || [];
  const messages = Array.isArray(sessionEvidence?.messages) ? sessionEvidence.messages.slice(-10) : [];
  const volumeContext = sessionEvidence?.volumeContext || null;

  return [
    'Genera il fumetto da questa sessione reale.',
    '',
    `Esperimento: ${compact(experiment || sessionEvidence?.experimentId || 'non dichiarato', 800)}`,
    `Componenti usati: ${components || 'non dichiarati'}`,
    `Ancore sessione: ${compact(anchors, 1400)}`,
    `Messaggi UNLIM/sessione: ${compact(messages, 1800)}`,
    `Contesto volume: ${compact(volumeContext, 1200)}`,
    'Genera anche quiz e diario: devono usare gli stessi fatti della sessione, non domande generiche.',
    'Per evidenceRefs copia stringhe esatte dalle Ancore sessione o dal Session evidence pack. Senza evidenceRefs validi il draft verra scartato.',
    '',
    'Session evidence pack completo:',
    compact(sessionEvidence),
    '',
    'Restituisci SOLO JSON valido nello schema richiesto dal system prompt.',
  ].join('\n');
}

export function parseFumettoGeminiJson(text: string): Record<string, unknown> {
  const clean = String(text || '')
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
  const jsonMatch = clean.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('fumetto Gemini response has no JSON object');
  const parsed = JSON.parse(jsonMatch[0]);
  if (!parsed || typeof parsed !== 'object') throw new Error('fumetto Gemini response is not an object');
  if (!parsed.storyline || !Array.isArray(parsed.panels) || !Array.isArray(parsed.imagePrompts)) {
    throw new Error('fumetto Gemini response missing storyline, panels, or imagePrompts');
  }
  return parsed;
}
