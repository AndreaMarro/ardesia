export type Point = [number, number, number];
export interface Board {
  box(at: Point, size: Point, color: number, opacity?: number): void;
  line(points: Point[], color: number): void;
  label(at: Point, caption: string, color?: number): void;
}
export interface Measurement { readonly x: number; readonly y: number }
export type Measure = (control: number) => number;
export type Draw = (board: Board, state: Measurement) => void;
export interface EngineV1 { measure: Measure; draw: Draw }

// Optional metadata on an experiment edition; it never supplies expected answers.
export interface ExperimentAssessmentSelectionV1 {
  readonly schemaVersion: '1.0.0';
  readonly points: readonly [number, number];
}
