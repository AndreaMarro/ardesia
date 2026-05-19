const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const responseSchema = {
  type: 'OBJECT',
  properties: {
    intent: {
      type: 'STRING',
      enum: [
        'create_blink',
        'digital_write',
        'analog_write',
        'pin_mode',
        'delay',
        'serial_print',
        'analog_read',
      ],
    },
    nl: { type: 'STRING' },
    params: { type: 'OBJECT' },
  },
  required: ['intent', 'nl', 'params'],
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function fallbackIntent(prompt: string) {
  const text = prompt.toLowerCase();
  const pinMatch = /\b(?:pin|d)\s*(a[0-7]|1[0-3]|[0-9])\b/i.exec(prompt);
  const pin = (pinMatch?.[1] || '13').toUpperCase();
  const intervalMatch = /\b([1-9][0-9]{1,4})\s*(?:ms|millisecondi)?\b/i.exec(prompt);
  const intervalMs = intervalMatch ? Number(intervalMatch[1]) : 1000;

  if (/\b(blink|lampeggia|lampeggio)\b/i.test(text)) {
    return { intent: 'create_blink', nl: prompt, params: { pin, intervalMs } };
  }
  if (/\b(spegni|low|basso)\b/i.test(text)) {
    return { intent: 'digital_write', nl: prompt, params: { pin, value: 'LOW' } };
  }
  if (/\b(accendi|high|alto)\b/i.test(text)) {
    return { intent: 'digital_write', nl: prompt, params: { pin, value: 'HIGH' } };
  }
  return { intent: 'create_blink', nl: prompt, params: { pin, intervalMs } };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body: { prompt?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const prompt = String(body.prompt || '').trim();
  if (!prompt) return json({ error: 'prompt is required' }, 400);
  if (prompt.length > 500) return json({ error: 'prompt must be 500 chars or less' }, 400);

  const apiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_GENERATIVE_AI_API_KEY');
  if (!apiKey) return json({ intent: fallbackIntent(prompt), source: 'fallback' });

  const systemPrompt = [
    'Converti una richiesta in italiano o inglese in un JSON intent per Blockly Arduino ELAB.',
    'Rispondi solo con JSON conforme allo schema.',
    'Pin consentiti: stringhe "0".."13" e "A0".."A7".',
    'Intent supportati:',
    '- create_blink params { pin, intervalMs }',
    '- digital_write params { pin, value: "HIGH"|"LOW" }',
    '- analog_write params { pin: "3"|"5"|"6"|"9"|"10"|"11", value }',
    '- pin_mode params { pin, mode: "INPUT"|"OUTPUT"|"INPUT_PULLUP" }',
    '- delay params { value }',
    '- serial_print params { expr }',
    '- analog_read params { pin: "A0".."A7", variable }',
  ].join('\n');

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [{
            role: 'user',
            parts: [{ text: prompt }],
          }],
          generationConfig: {
            temperature: 0,
            responseMimeType: 'application/json',
            responseSchema,
          },
        }),
      },
    );

    const geminiJson = await geminiResponse.json();
    if (!geminiResponse.ok) {
      return json({
        intent: fallbackIntent(prompt),
        source: 'fallback',
        warning: geminiJson?.error?.message || `Gemini HTTP ${geminiResponse.status}`,
      });
    }

    const text = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
    const intent = JSON.parse(text);
    return json({ intent: { ...intent, nl: intent.nl || prompt }, source: 'gemini' });
  } catch (error) {
    return json({
      intent: fallbackIntent(prompt),
      source: 'fallback',
      warning: error instanceof Error ? error.message : String(error),
    });
  }
});
