/** Core revision clocks are Unix seconds; imported ISO records remain readable. */
export function scienceTimestamp(value:string|number|undefined):number{return typeof value==='number'&&Number.isFinite(value)?value*1000:typeof value==='string'?(Date.parse(value)||0):0;}
