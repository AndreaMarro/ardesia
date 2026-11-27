import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {esperienza} from '../../../static/js/banchi/voci/esperimento.js';
import {camera,body,bounds,states} from '../../../tests/helpers/plate-probe-projection.mjs';
const source=JSON.parse(readFileSync(new URL('../../../content/esperienze-C4.json',import.meta.url)));
const ids=['SIM-C4-L02-03','SIM-C4-L03-02','SIM-C4-L03-03'];const rows=[];
for(const id of ids){const r=source.find(x=>x.id===id),a=await esperienza(r);
 for(const x of states(r))for(const[w,h]of[[294,341],[839,451]]){
  const elements=a.elements(x,2),plates=elements.filter(e=>e.kind==='box'&&e.size[0]===.11),marker=elements.find(e=>e.kind==='ball'&&e.r===.13),field=elements.filter(e=>e.kind==='arrow'),cam=camera(a.scene.spec,w,h);
  const left=bounds(body(plates[0]),cam),right=bounds(body(plates[1]),cam);
  const observations=[marker,...field].map(e=>{const mesh=body(e),b=bounds(mesh,cam);return{kind:e.kind,vertices:mesh.length,leftGapCss:(b.lo-left.hi)*w/2,rightGapCss:(right.lo-b.hi)*w/2,screenBounds:b};});
  rows.push({id,input:x,canvasCss:[w,h],pointLongitudinalX:marker.p[0],eye:a.scene.spec.eye,observations});
 }
}
const minimum=Math.min(...rows.flatMap(r=>r.observations.flatMap(x=>[x.leftGapCss,x.rightGapCss])));
if(!(minimum>0))throw Error('Actual mesh support not separated');
const report={baseCommit:'b9994b9116e87478905191d85cca8037d17ae4bd',rows,frameCases:rows.length,minimumPositiveGapCss:minimum,meshModel:'Union of actual Float32 direct/static geometries and unit geometries scaled by mobile renderer. Orthographic projected supports enclose every triangle face. No GPU vertex rounding/antialias/raster/UI visibility certificate.',rawIndependentBaselineRasterScope:'Only six original high-endRootPNGs are known raster negatives. The stronger projection-plane separation test failing elsewhere is not a count of newly observed occlusions.',role:'AUTHOR_PROJECTUAL_GEOMETRY_ONLY',browserStarted:false,activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'};
writeFileSync(new URL('actual-mesh-projection.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({frameCases:rows.length,minimumPositiveGapCss:minimum,activityCredit:0}));
