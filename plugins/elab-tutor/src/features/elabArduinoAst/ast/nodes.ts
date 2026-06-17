import { z } from 'zod';

const stringToken = z.string().min(1);

export const RawExpressionNodeSchema = z.object({
  type: z.literal('RawExpression'),
  raw: z.string(),
});

export const PinModeNodeSchema = z.object({
  type: z.literal('PinMode'),
  pin: stringToken,
  mode: stringToken,
});

export const DigitalWriteNodeSchema = z.object({
  type: z.literal('DigitalWrite'),
  pin: stringToken,
  value: stringToken,
});

export const AnalogWriteNodeSchema = z.object({
  type: z.literal('AnalogWrite'),
  pin: stringToken,
  value: stringToken,
});

export const DigitalReadNodeSchema = z.object({
  type: z.literal('DigitalRead'),
  pin: stringToken,
  storeIn: z.string().optional(),
});

export const AnalogReadNodeSchema = z.object({
  type: z.literal('AnalogRead'),
  pin: stringToken,
  storeIn: z.string().optional(),
});

export const DelayNodeSchema = z.object({
  type: z.literal('Delay'),
  ms: stringToken,
});

export const SerialBeginNodeSchema = z.object({
  type: z.literal('SerialBegin'),
  baud: stringToken,
});

export const SerialPrintNodeSchema = z.object({
  type: z.literal('SerialPrint'),
  value: z.string(),
  newline: z.boolean(),
});

export const UnsupportedCppBlockNodeSchema = z.object({
  type: z.literal('UnsupportedCppBlock'),
  raw: z.string(),
});

export type RawExpressionNode = z.infer<typeof RawExpressionNodeSchema>;
export type PinModeNode = z.infer<typeof PinModeNodeSchema>;
export type DigitalWriteNode = z.infer<typeof DigitalWriteNodeSchema>;
export type AnalogWriteNode = z.infer<typeof AnalogWriteNodeSchema>;
export type DigitalReadNode = z.infer<typeof DigitalReadNodeSchema>;
export type AnalogReadNode = z.infer<typeof AnalogReadNodeSchema>;
export type DelayNode = z.infer<typeof DelayNodeSchema>;
export type SerialBeginNode = z.infer<typeof SerialBeginNodeSchema>;
export type SerialPrintNode = z.infer<typeof SerialPrintNodeSchema>;
export type UnsupportedCppBlockNode = z.infer<typeof UnsupportedCppBlockNodeSchema>;

export const ExpressionNodeSchema = z.discriminatedUnion('type', [
  RawExpressionNodeSchema,
  DigitalReadNodeSchema,
  AnalogReadNodeSchema,
]);

export type ExpressionNode = z.infer<typeof ExpressionNodeSchema>;

export const VariableNodeSchema = z.object({
  type: z.literal('Variable'),
  varType: stringToken,
  name: stringToken,
  init: ExpressionNodeSchema.optional(),
});

export type VariableNode = z.infer<typeof VariableNodeSchema>;

export type IfNode = {
  type: 'If';
  cond: string;
  then: ArduinoAstNode[];
  else?: ArduinoAstNode[];
};

export type ArduinoAstNode =
  | PinModeNode
  | DigitalWriteNode
  | AnalogWriteNode
  | DigitalReadNode
  | AnalogReadNode
  | DelayNode
  | SerialBeginNode
  | SerialPrintNode
  | VariableNode
  | IfNode
  | UnsupportedCppBlockNode;

export const IfNodeSchema: z.ZodType<IfNode> = z.lazy(() =>
  z.object({
    type: z.literal('If'),
    cond: z.string(),
    then: z.array(ArduinoAstNodeSchema),
    else: z.array(ArduinoAstNodeSchema).optional(),
  }),
);

export const ArduinoAstNodeSchema: z.ZodType<ArduinoAstNode> = z.lazy(() =>
  z.union([
    PinModeNodeSchema,
    DigitalWriteNodeSchema,
    AnalogWriteNodeSchema,
    DigitalReadNodeSchema,
    AnalogReadNodeSchema,
    DelayNodeSchema,
    SerialBeginNodeSchema,
    SerialPrintNodeSchema,
    VariableNodeSchema,
    IfNodeSchema,
    UnsupportedCppBlockNodeSchema,
  ]),
);

export const ArduinoProgramSchema = z.object({
  type: z.literal('Program'),
  globals: z.array(ArduinoAstNodeSchema),
  setup: z.array(ArduinoAstNodeSchema),
  loop: z.array(ArduinoAstNodeSchema),
});

export type ArduinoProgram = z.infer<typeof ArduinoProgramSchema>;
