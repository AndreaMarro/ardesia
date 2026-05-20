import { z } from 'zod';
import type { ArduinoProgram } from '../../elabArduinoAst';
import type { ActionDef } from '../types';
import { ok, setEditorProgram } from './utils';

const program: ArduinoProgram = {
  type: 'Program',
  globals: [],
  setup: [{ type: 'SerialBegin', baud: '9600' }],
  loop: [
    {
      type: 'Variable',
      varType: 'int',
      name: 'valore',
      init: { type: 'AnalogRead', pin: 'A0' },
    },
    { type: 'SerialPrint', value: 'valore', newline: true },
    { type: 'Delay', ms: '200' },
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
