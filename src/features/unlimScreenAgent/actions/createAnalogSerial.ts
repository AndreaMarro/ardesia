import { z } from 'zod';
import type { ActionDef, AstProgram } from '../types';
import { ok, setEditorProgram } from './utils';

const program: AstProgram = {
  setup: [{ kind: 'SerialBegin', baud: 9600 }],
  loop: [
    { kind: 'Raw', code: 'int valore = analogRead(A0);', blockType: 'arduino_analog_read' },
    { kind: 'Raw', code: 'Serial.println(valore);', blockType: 'arduino_serial_print' },
    { kind: 'Delay', ms: 200 },
  ],
};

export const createAnalogSerial: ActionDef<Record<string, never>> = {
  id: 'createAnalogSerial',
  description: 'Crea un programma potenziometro e Serial Monitor: legge A0 e stampa il valore ogni 200 ms.',
  argsSchema: z.object({}).strict(),
  async execute() {
    const { cpp, xml } = setEditorProgram(program);
    return ok('Creato programma analogico: legge il potenziometro su A0 e stampa il valore nel Serial Monitor.', {
      data: { cpp, blocklyXml: xml },
    });
  },
};
