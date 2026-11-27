// Derived from primary; isolated JS process, zero consumer imports.
const specs=[['01',.5,5,.5,[1.5,4]],['02',.5,4,.5,[.5,3]],['03',0,180,5,[60,120]],['04',0,2,.25,[0,1.5]],['05',1,8,1,[2,8]]];
function law(s,x){if(s==='01')return x;if(s==='02')return 3/x;if(s==='03')return 10*Math.cos(x*Math.PI/180);if(s==='04')return 100*x;return 200/x;}
console.log(JSON.stringify({phase:'ISOLATED_IEEE_REFERENCE_BEFORE_BLOCKS',consumerImports:[],results:specs.map(([s,lo,hi,step,ps])=>({id:'SIM-C2-L010-'+s,states:Array.from({length:Math.round((hi-lo)/step)+1},(_,i)=>{let x=lo+i*step;return{x,y:law(s,x)}}),tasks:ps.map(x=>({x,y:law(s,x)}))}))}));
