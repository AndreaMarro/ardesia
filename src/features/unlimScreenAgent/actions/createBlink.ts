import { z } from 'zod';
import type { ArduinoProgram } from '../../elabArduinoAst';
import type { ActionDef } from '../types';
import { ok, setEditorProgram } from './utils';

const program: ArduinoProgram = {
  type: 'Program',
  globals: [],
  setup: [{ type: 'PinMode', pin: '13', mode: 'OUTPUT' }],
  loop: [
    { type: 'DigitalWrite', pin: '13', value: 'HIGH' },
    { type: 'Delay', ms: '1000' },
    { type: 'DigitalWrite', pin: '13', value: 'LOW' },
    { type: 'Delay', ms: '1000' },
  ],
};

export const createBlink: ActionDef<Record<string, never>> = {
  id: 'createBlink',
  description: 'Crea un programma Blink per Nano R4: LED sul pin 13 acceso e spento ogni secondo.',
  argsSchema: z.object({}).strict(),
  async execute() {
    const { cpp, xml } = setEditorProgram(program);
    return ok('Creato Blink: LED sul pin 13 acceso e spento ogni secondo. Modalita dual attivata.', {
      data: { cpp, blocklyXml: xml },
    });
  },
};
