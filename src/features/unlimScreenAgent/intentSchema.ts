import { z } from 'zod';

const allowedPins = new Set([
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13',
  'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7',
]);

const stringFromScalar = z.preprocess((value) => {
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return value;
}, z.string());

const pinSchema = stringFromScalar
  .transform((pin) => pin.trim().toUpperCase())
  .refine((pin) => allowedPins.has(pin), {
    message: 'pin must be one of 0-13 or A0-A7',
  });

const digitalPinSchema = pinSchema;

const nlSchema = stringFromScalar.pipe(
  z.string()
    .trim()
    .min(1, 'nl prompt is required')
    .max(500, 'nl prompt must be 500 chars or less'),
);

const safeTextSchema = stringFromScalar.pipe(
  z.string()
    .max(160, 'value is too long')
  .refine((value) => !/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value), {
      message: 'value contains control characters',
    }),
);

const identifierSchema = stringFromScalar.pipe(
  z.string()
    .trim()
    .regex(/^[A-Za-z_][A-Za-z0-9_]{0,31}$/, 'variable must be a valid identifier'),
);

const exprSchema = stringFromScalar.pipe(
  z.string()
    .trim()
    .min(1, 'expr is required')
    .max(160, 'expr is too long')
    .refine((expr) => /^[A-Za-z0-9_()[\]\s+\-*/%&|!<>=.,;]+$/.test(expr), {
      message: 'expr contains unsupported characters',
    })
    .refine((expr) => {
      const semicolons = [...expr.matchAll(/;/g)].map((match) => match.index ?? -1);
      return semicolons.length === 0 || (semicolons.length === 1 && semicolons[0] === expr.length - 1);
    }, {
      message: 'expr must be a single expression or one terminated statement',
    }),
);

const base = {
  nl: nlSchema,
};

export const CreateBlinkIntentSchema = z.object({
  intent: z.literal('create_blink'),
  ...base,
  params: z.object({
    pin: digitalPinSchema,
    intervalMs: z.coerce.number().int().min(1).max(60_000).default(1000),
  }).strict(),
}).strict();

export const DigitalWriteIntentSchema = z.object({
  intent: z.literal('digital_write'),
  ...base,
  params: z.object({
    pin: digitalPinSchema,
    value: z.enum(['HIGH', 'LOW']),
  }).strict(),
}).strict();

export const AnalogWriteIntentSchema = z.object({
  intent: z.literal('analog_write'),
  ...base,
  params: z.object({
    pin: z.enum(['3', '5', '6', '9', '10', '11']),
    value: z.union([
      z.coerce.number().int().min(0).max(255),
      exprSchema,
    ]),
  }).strict(),
}).strict();

export const PinModeIntentSchema = z.object({
  intent: z.literal('pin_mode'),
  ...base,
  params: z.object({
    pin: digitalPinSchema,
    mode: z.enum(['INPUT', 'OUTPUT', 'INPUT_PULLUP']),
  }).strict(),
}).strict();

export const DelayIntentSchema = z.object({
  intent: z.literal('delay'),
  ...base,
  params: z.object({
    value: z.coerce.number().int().min(1).max(60_000),
  }).strict(),
}).strict();

export const SerialPrintIntentSchema = z.object({
  intent: z.literal('serial_print'),
  ...base,
  params: z.object({
    expr: exprSchema,
  }).strict(),
}).strict();

export const AnalogReadIntentSchema = z.object({
  intent: z.literal('analog_read'),
  ...base,
  params: z.object({
    pin: pinSchema.refine((pin) => /^A[0-7]$/.test(pin), {
      message: 'analog_read pin must be A0-A7',
    }),
    variable: identifierSchema.default('valore'),
  }).strict(),
}).strict();

export const CommentIntentSchema = z.object({
  intent: z.literal('comment'),
  ...base,
  params: z.object({
    pin: pinSchema,
    value: safeTextSchema,
    expr: exprSchema,
  }).strict(),
}).strict();

export const UnlimIntentSchema = z.discriminatedUnion('intent', [
  CreateBlinkIntentSchema,
  DigitalWriteIntentSchema,
  AnalogWriteIntentSchema,
  PinModeIntentSchema,
  DelayIntentSchema,
  SerialPrintIntentSchema,
  AnalogReadIntentSchema,
  CommentIntentSchema,
]);

export type UnlimIntent = z.infer<typeof UnlimIntentSchema>;

export function parseUnlimIntent(input: unknown): UnlimIntent {
  const result = UnlimIntentSchema.safeParse(input);
  if (result.success) return result.data;
  const issues = result.error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
    return `${path}${issue.message}`;
  });
  throw new Error(`Invalid UNLIM intent params: ${issues.join('; ')}`);
}

export function isAllowedPin(pin: unknown): boolean {
  const result = pinSchema.safeParse(pin);
  return result.success;
}
