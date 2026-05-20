import { z } from 'zod';
import type { ArduinoProgram } from '../../elabArduinoAst';
import type { ActionDef } from '../types';
import { ok, setEditorProgram } from './utils';

const program: ArduinoProgram = {
  type: 'Program',
  globals: [],
  setup: [
    { type: 'PinMode', pin: '2', mode: 'INPUT_PULLUP' },
    { type: 'PinMode', pin: '13', mode: 'OUTPUT' },
  ],
  loop: [
    {
      type: 'Variable',
      varType: 'int',
      name: 'statoPulsante',
      init: { type: 'DigitalRead', pin: '2' },
    },
    { type: 'DigitalWrite', pin: '13', value: 'statoPulsante == LOW ? HIGH : LOW' },
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
