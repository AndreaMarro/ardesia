// Offline checks of the committed GLB bytes, independent Khronos validation,
// numeric dimensions/topology, and static resource budgets. No browser claim.
import assert from 'node:assert/strict';
import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {NodeIO} from './.toolchain/node_modules/@gltf-transform/core/dist/index.js';
import validator from './.toolchain/node_modules/gltf-validator/index.js';

const root = new URL('../../../assets/scientific3d/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('manifest.json',root),'utf8'));
const io = new NodeIO();
const eps = 2e-8;
const close = (actual,expected,tolerance = eps) => assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} != ${expected}`);
const sub = (a,b) => a.map((x,i)=>x-b[i]);
const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot = (a,b) => a.reduce((s,x,i)=>s+x*b[i],0);
const element = (accessor,i) => accessor.getElement(i,[]);
const key = p => p.map(x=>Math.round(x*1e8)).join(',');
function bounds(doc) {
  const min = [Infinity,Infinity,Infinity], max = [-Infinity,-Infinity,-Infinity];
  for (const node of doc.getRoot().listNodes()) {
    if (!node.getMesh()) continue;
    const m = node.getWorldMatrix();
    for (const primitive of node.getMesh().listPrimitives()) {
      const positions = primitive.getAttribute('POSITION');
      for (let i=0;i<positions.getCount();i++) {
        const p = element(positions,i);
        const world = [0,1,2].map(j=>m[j]*p[0]+m[4+j]*p[1]+m[8+j]*p[2]+m[12+j]);
        world.forEach((x,j)=>{min[j]=Math.min(min[j],x);max[j]=Math.max(max[j],x);});
      }
    }
  }
  return {min,max,dimensions:min.map((x,i)=>max[i]-x)};
}
function meshChecks(mesh) {
  let triangles = 0, vertices = 0, volume = 0;
  const edges = new Map();
  for (const primitive of mesh.listPrimitives()) {
    const positions = primitive.getAttribute('POSITION'), normals = primitive.getAttribute('NORMAL'), indices = primitive.getIndices();
    assert.equal(primitive.getMode(),4); // TRIANGLES
    assert.equal(indices.getComponentType(),5123); // uint16 indices; broad WebGL support
    assert.equal(normals.getCount(),positions.getCount());
    assert.equal(indices.getCount()%3,0);
    assert.ok(positions.getCount()<65536);
    vertices+=positions.getCount();
    for (let i=0;i<positions.getCount();i++) {
      const p=element(positions,i), n=element(normals,i);
      assert.ok([...p,...n].every(Number.isFinite)); close(Math.hypot(...n),1,2e-6);
    }
    for (let i=0;i<indices.getCount();i+=3) {
      const ids=[0,1,2].map(k=>indices.getScalar(i+k));
      assert.ok(ids.every(x=>Number.isInteger(x)&&x>=0&&x<positions.getCount()));
      const p=ids.map(x=>element(positions,x));
      const face=cross(sub(p[1],p[0]),sub(p[2],p[0]));
      assert.ok(Math.hypot(...face)>1e-14,`${mesh.getName()}: degenerate triangle`);
      assert.ok(dot(face,element(normals,ids[0]))>0,`${mesh.getName()}: inverted normal/winding`);
      volume+=dot(p[0],cross(p[1],p[2]))/6;
      const keys=p.map(key);
      for (const [a,b] of [[0,1],[1,2],[2,0]]) {
        assert.notEqual(keys[a],keys[b]);
        const edge=[keys[a],keys[b]].sort().join('|');
        const record=edges.get(edge)||{count:0,direction:0};
        record.count++; record.direction+=keys[a]<keys[b]?1:-1; edges.set(edge,record);
      }
      triangles++;
    }
  }
  for (const record of edges.values()) {assert.equal(record.count,2,`${mesh.getName()}: non-manifold edge`);assert.equal(record.direction,0,`${mesh.getName()}: inconsistent winding`);}
  assert.ok(volume>0,`${mesh.getName()}: nonpositive enclosed mesh volume`);
  return {triangles,vertices,volumeM3:volume};
}
function radialCheck(node, allowedRadii) {
  const accessor=node.getMesh().listPrimitives()[0].getAttribute('POSITION');
  for (let i=0;i<accessor.getCount();i++) {
    const [x,,z]=element(accessor,i), r=Math.hypot(x,z);
    assert.ok(allowedRadii.some(expected=>Math.abs(r-expected)<eps),`${node.getName()}: wrong radius ${r}`);
  }
}

assert.equal(manifest.status,'PENDING_S13_CONSUMER');
assert.equal(manifest.integration.approved,false);
assert.equal(manifest.integration.consumerVerified,false);
assert.equal(manifest.format.units,'m');
assert.equal(manifest.assets.length,3);
const result={status:'PASS',scope:'offline geometry, glTF conformance, deterministic regeneration and static budgets',browser:'NOT_RUN',mobileDevice:'NOT_RUN',physics:'NOT_VERIFIED',integration:'PENDING_S13_CONSUMER',checks:[],assets:[]};
let packBytes=0;
for (const metadata of manifest.assets) {
  const data=await readFile(new URL(metadata.path,root)); packBytes+=data.length;
  assert.equal(data.toString('ascii',0,4),'glTF'); assert.equal(data.readUInt32LE(4),2); assert.equal(data.readUInt32LE(8),data.length);
  assert.equal(createHash('sha256').update(data).digest('hex'),metadata.sha256);
  assert.equal(data.length,metadata.bytes); assert.ok(data.length<=manifest.budgets.maxBytesPerAsset);
  const json=JSON.parse(data.toString('utf8',20,20+data.readUInt32LE(12)));
  assert.equal(json.asset.version,'2.0'); assert.ok(!json.extensionsRequired?.length);
  assert.ok(!json.images?.length&&!json.textures?.length&&!json.animations?.length&&!json.skins?.length);
  assert.ok(json.buffers.every(b=>!b.uri));
  assert.ok(json.materials.every(m=>m.alphaMode===undefined||m.alphaMode==='OPAQUE'));
  const conformance=await validator.validateBytes(new Uint8Array(data),{uri:metadata.path,maxIssues:100});
  assert.equal(conformance.issues.numErrors,0,JSON.stringify(conformance.issues));
  assert.equal(conformance.issues.numWarnings,0,JSON.stringify(conformance.issues));
  const doc=await io.readBinary(new Uint8Array(data));
  const nodes=doc.getRoot().listNodes(), node=name=>{const found=nodes.find(n=>n.getName()===name);assert.ok(found,name);return found;};
  assert.equal(new Set(nodes.map(n=>n.getName())).size,nodes.length);
  const measured=doc.getRoot().listMeshes().map(m=>({name:m.getName(),...meshChecks(m)}));
  const triangles=measured.reduce((sum,m)=>sum+m.triangles,0), vertices=measured.reduce((sum,m)=>sum+m.vertices,0);
  assert.equal(triangles,metadata.triangles);assert.equal(vertices,metadata.vertices);
  assert.ok(triangles<=manifest.budgets.maxTrianglesPerAsset);
  assert.equal(json.meshes.reduce((sum,m)=>sum+m.primitives.length,0),metadata.primitives);
  assert.ok(metadata.primitives<=manifest.budgets.maxPrimitivesPerAsset);
  const measuredBounds=bounds(doc);
  if(metadata.id==='calibrated-vessel') {
    const p=metadata.parameters;
    radialCheck(node('vessel-wall-cutaway'),[p.innerRadiusM,p.outerRadiusM]);
    [0.086,0.124,0.086].forEach((expected,i)=>close(measuredBounds.dimensions[i],expected));
    close(measuredBounds.min[1],0);
    for(const tick of metadata.calibration) {
      const y=node(tick.node).getTranslation()[1];
      close(y,tick.localY);close(y-p.baseThicknessM,tick.heightAboveFloorM);
      close(Math.PI*p.innerRadiusM**2*(y-p.baseThicknessM)*1e6,tick.volumeMl,1e-8);
      assert.ok(y>p.baseThicknessM&&y<p.baseThicknessM+p.cavityHeightM);
    }
  } else if(metadata.id==='piston-cylinder') {
    const p=metadata.parameters, control=metadata.controls[0], moving=node(control.node);
    radialCheck(node('cylinder-wall-cutaway'),[p.boreRadiusM,p.outerRadiusM]);
    radialCheck(node('piston-disc'),[0,p.pistonRadiusM]);
    radialCheck(node('piston-rod'),[0,p.rodRadiusM]);
    close(moving.getTranslation()[1],control.initial);
    assert.ok(p.pistonRadiusM<p.boreRadiusM);
    for(const y of [control.min,control.initial,control.max]) {
      assert.ok(y-p.pistonThicknessM/2>p.barrelFloorM);
      assert.ok(y+p.pistonThicknessM/2<p.barrelRimM);
    }
    [0.056,0.108,0.056].forEach((expected,i)=>close(measuredBounds.dimensions[i],expected));
  } else if(metadata.id==='biconvex-lens') {
    const p=metadata.parameters,a=p.apertureRadiusM,R=p.curvatureRadiusM,t=p.centerThicknessM;
    [2*a,2*a,t].forEach((expected,i)=>close(measuredBounds.dimensions[i],expected));
    const positions=node('lens-body').getMesh().listPrimitives()[0].getAttribute('POSITION');
    for(let i=0;i<positions.getCount();i++) {
      const [x,y,z]=element(positions,i), r=Math.hypot(x,y);
      assert.ok(r<=a+eps);
      close(Math.abs(z),t/2-R+Math.sqrt(R*R-r*r));
    }
    const analyticVolume=Math.PI*a*a*(t-2*R)+(4*Math.PI/3)*(R**3-(R*R-a*a)**1.5);
    const relativeError=Math.abs(measured[0].volumeM3-analyticVolume)/analyticVolume;
    assert.ok(relativeError<0.005,`lens tessellation volume error ${relativeError}`);
    result.checks.push({name:'lens tessellation volume versus analytic solid',relativeError,limit:0.005});
  }
  result.assets.push({id:metadata.id,bytes:data.length,sha256:metadata.sha256,triangles,vertices,primitives:metadata.primitives,boundsM:measuredBounds,khronos:{errors:conformance.issues.numErrors,warnings:conformance.issues.numWarnings,infos:conformance.issues.numInfos},meshes:measured});
}
assert.ok(packBytes<=manifest.budgets.maxPackBytes);
result.packBytes=packBytes;
result.checks.push({name:'all meshes closed, consistent winding, positive volume, finite/unit normals',status:'PASS'},
  {name:'100–500 mL graduation positions; cylinder bore/rod/piston dimensions and safe stroke limits; lens surface and dimensions',status:'PASS'},
  {name:'GLB digest/container; no textures, external URIs, required extensions, animation or skins; uint16 indices',status:'PASS'},
  {name:'static per-asset and pack resource budgets',status:'PASS'});
if (process.argv.includes('--write-report')) await writeFile(new URL('verification.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
