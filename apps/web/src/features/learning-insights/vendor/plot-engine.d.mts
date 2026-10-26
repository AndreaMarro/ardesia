/** First-party narrow bridge for the bundled official Plot 0.6.17 subset. */
type EvidenceRow={outcome:string;assistance:string;count:number};
export function barX(data:EvidenceRow[],options:{x:'count';y:'outcome';fill:'assistance';title:(datum:EvidenceRow)=>string;tip:boolean}):unknown;
export function ruleX(data:number[]):unknown;
export function plot(options:{width:number;height:number;marginLeft:number;marginRight:number;ariaLabel:string;ariaDescription:string;x:{label:string;grid:boolean;tickFormat:string;domain:[number,number];ticks:number[]};y:{label:null;domain:string[];tickSize:number};color:{domain:string[];range:string[];legend:boolean};marks:unknown[]}):SVGSVGElement|HTMLElement;
