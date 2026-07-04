// Shim di transizione F4: la geometria breadboard pura vive in
// sim/breadboard/simulationBreadboard.ts (direzione permessa: src -> sim).
// Questo re-export tiene stabili gli import di ToolCanvasEmbeddable e dei test
// finché il flip degli import non chiude il ciclo B.
export * from "../../sim/breadboard/simulationBreadboard.ts"
