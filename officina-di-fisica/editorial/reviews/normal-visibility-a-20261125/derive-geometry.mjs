// Independent mesh containment and camera-ray geometry; no consumer mutation.
import * as T from '../../../static/vendor/three-r180/three.module.min.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
// Resolve vendor from the application explicitly, keeping this diagnostic relocatable by path edit only.
const out=path.dirname(fileURLToPath(import.meta.url));
const sphere=new T.SphereGeometry(.22,24,16),p=sphere.attributes.position,index=sphere.index;
let minimumFacetDistance=Infinity;
for(let i=0;i<index.count;i+=3){const a=new T.Vector3().fromBufferAttribute(p,index.getX(i)),b=new T.Vector3().fromBufferAttribute(p,index.getX(i+1)),c=new T.Vector3().fromBufferAttribute(p,index.getX(i+2));const normal=new T.Vector3().subVectors(b,a).cross(new T.Vector3().subVectors(c,a));if(normal.lengthSq()<1e-20)continue;minimumFacetDistance=Math.min(minimumFacetDistance,Math.abs(normal.normalize().dot(a)));}
const theta=75*Math.PI/180,L=.75*Math.cos(theta),headLength=Math.min(.24,L*.32),shaftLength=L-headLength;
function vertices(geometry,center,rotation=new T.Quaternion()){
 const values=[];for(let i=0;i<geometry.attributes.position.count;i++)values.push(new T.Vector3().fromBufferAttribute(geometry.attributes.position,i).applyQuaternion(rotation).add(center));return values;
}
const shaft=vertices(new T.CylinderGeometry(.028,.028,shaftLength,32,1,false),new T.Vector3(0,shaftLength/2,0));
const head=vertices(new T.CylinderGeometry(0,.028*2.9,headLength,32,1,false),new T.Vector3(0,shaftLength+headLength/2,0));
const maximumArrowVertexRadius=Math.max(...[...shaft,...head].map(v=>v.length()));
const mat=new T.MeshStandardMaterial({color:0xd49332,side:T.DoubleSide,transparent:false,opacity:1,depthWrite:true});
const length0=.75,head0=Math.min(.24,length0*.32),joint0=length0-head0,point0=new T.Vector3(.35,.4,0),down=new T.Vector3(0,-1,0),rot=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),down);
const headAtZero=vertices(new T.CylinderGeometry(0,.028*2.9,head0,32,1,false),point0.clone().addScaledVector(down,joint0+head0/2),rot);
const eye=new T.Vector3(2.6,1.9,6.1).normalize();
const tabletopHits=headAtZero.map(v=>v.clone().addScaledVector(eye,-v.y/eye.y));
const everyHeadRayHitsTabletop=headAtZero.every(v=>v.y<0)&&tabletopHits.every(v=>Math.abs(v.x)<6.75/2&&Math.abs(v.z)<3.45/2);
const normalSvgDX=-47*L*Math.sin(theta),normalSvgDY=-44*L*Math.cos(theta);
const report={purpose:'INDEPENDENT_GEOMETRIC_DIAGNOSIS_NO_APPROVAL',humanApproval:'NOT_RUN',publicationAction:'NONE',units:'renderer scene units, not physical metres',normalAt75:{normalExact:'5(√6−√2) N',vectorLengthExact:'3(√6−√2)/16 scene units',normal:20*Math.cos(theta),length:L,sphereRadius:.22,shaftLength,headLength,shaftRadius:.028,headBaseRadius:.028*2.9,sphereGeometry:{widthSegments:24,heightSegments:16,minimumFacetDistance},maximumArrowVertexRadius,entireArrowWithinOpaqueSphere:maximumArrowVertexRadius<minimumFacetDistance,material:{opacity:mat.opacity,transparent:mat.transparent,depthWrite:mat.depthWrite,depthTest:mat.depthTest},manualBound:'√6<5/2 and √2>7/5 imply L<33/160<11/50=r; the computed mesh bound strengthens this to containment within all polygonal facets.'},weightAt0:{sphereCenter:point0.toArray(),forceVector:[0,-.75,0],tip:[.35,-.35,0],joint:[.35,-.11,0],table:{center:[0,-.11,0],size:[6.75,.22,3.45],top:0,bottom:-.22},headYRange:[Math.min(...headAtZero.map(v=>v.y)),Math.max(...headAtZero.map(v=>v.y))],cameraDirection:eye.toArray(),headProjectionRayHitsTabletopForEveryMeshVertex:everyHeadRayHitsTabletop,tabletopIntersectionXRange:[Math.min(...tabletopHits.map(v=>v.x)),Math.max(...tabletopHits.map(v=>v.x))],tabletopIntersectionZRange:[Math.min(...tabletopHits.map(v=>v.z)),Math.max(...tabletopHits.map(v=>v.z))],interpretation:'All cone vertices lie below the opaque tabletop and their camera rays hit its interior in the default orthographic oblique view. Only part of the red shaft above the table can remain visible.'},fallbackProjection:{map:'x_px=229+47x+16z; y_px=156−44y+11z',normal75:{dx:normalSvgDX,dy:normalSvgDY,length:Math.hypot(normalSvgDX,normalSvgDY),sphereProjectedRadius:.22*44},arrowPaintedAfterBall:true,nativeTableBaseNotInFallbackElementList:true,interpretation:'SVG painter order overlays arrows after the ball, so the short normal is drawn inside its projected disk; this is different from native depth testing.'}};
await fs.writeFile(path.join(out,'geometry.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({normalFullyInsideSphere:report.normalAt75.entireArrowWithinOpaqueSphere,weightHeadOccludedInDefaultView:everyHeadRayHitsTabletop,normal75Length:L,minimumSphereFacet:minimumFacetDistance,maximumArrowVertexRadius}));
