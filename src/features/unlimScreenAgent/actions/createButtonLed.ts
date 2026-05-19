import { z } from 'zod';
import type { ActionDef, AstProgram } from '../types';
import { ok, setEditorProgram } from './utils';

const program: AstProgram = {
  setup: [
    { kind: 'PinMode', pin: 2, mode: 'INPUT_PULLUP' },
    { kind: 'PinMode', pin: 13, mode: 'OUTPUT' },
  ],
  loop: [
    { kind: 'Raw', code: 'int statoPulsante = digitalRead(2);', blockType: 'arduino_digital_read' },
    { kind: 'Raw', code: 'digitalWrite(13, statoPulsante == LOW ? HIGH : LOW);', blockType: 'arduino_digital_write' },
  ],
};

export const createButtonLed: ActionDef<Record<string, never>> = {
  id: 'createButtonLed',
  description: 'Crea un programma pulsante piu LED: il LED sul pin 13 si accende quando premi il pulsante sul pin 2.',
  argsSchema: z.object({}).strict(),
  async execute() {
    const { cpp, xml } = setEditorProgram(program);
    return ok('Creato programma pulsante e LED: premendo il pulsante sul pin 2 si accende il LED sul pin 13.', {
      data: { cpp, blocklyXml: xml },
    });
  },
};
