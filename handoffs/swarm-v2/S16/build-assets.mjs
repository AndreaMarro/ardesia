// Original S16 parametric geometry for Ardesia. See assets/scientific3d/RIGHTS.md.
// Build-time exporter only. This module is never imported by the product.
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {Document, NodeIO} from './.toolchain/node_modules/@gltf-transform/core/dist/index.js';

const output = fileURLToPath(new URL('../../../assets/scientific3d/', import.meta.url));
const io = new NodeIO();
const check = process.argv.includes('--check');
const TAU = Math.PI * 2;
const norm = v => { const n = Math.hypot(...v); return v.map(x => x / n); };
const sub = (a, b) => a.map((v, i) => v - b[i]);
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const dot = (a, b) => a.reduce((s, x, i) => s + x*b[i], 0);

class Geometry {
  positions = []; normals = []; indices = []; vertices = new Map();
  triangle(points, normals) {
    const face = cross(sub(points[1], points[0]), sub(points[2], points[0]));
    if (Math.hypot(...face) < 1e-14) return; // Axis fan: exactly one nondegenerate triangle per quad.
    if (!normals) normals = points.map(() => norm(face));
    if (dot(face, normals[0]) < 0) {
      [points[1], points[2]] = [points[2], points[1]];
      [normals[1], normals[2]] = [normals[2], normals[1]];
    }
    for (let i = 0; i < 3; i++) {
      const key = [...points[i], ...normals[i]].map(x => x.toFixed(10)).join(',');
      let index = this.vertices.get(key);
      if (index === undefined) {
        index = this.positions.length / 3;
        this.vertices.set(key, index);
        this.positions.push(...points[i]); this.normals.push(...normals[i]);
      }
      this.indices.push(index);
    }
  }
  quad(points, normals) {
    this.triangle([points[0], points[1], points[2]], normals && [normals[0], normals[1], normals[2]]);
    this.triangle([points[0], points[2], points[3]], normals && [normals[0], normals[2], normals[3]]);
  }
}

// Revolve a closed (radius,height) profile. Partial revolutions include closed cut faces.
function revolve(profile, start = 0, extent = TAU, segments = 64) {
  const geometry = new Geometry();
  const point = ([r,y], t) => [r*Math.sin(t), y, r*Math.cos(t)];
  for (let p = 0; p < profile.length; p++) {
    const a = profile[p], b = profile[(p+1) % profile.length];
    const [nr, ny] = norm([b[1]-a[1], a[0]-b[0]]);
    for (let i = 0; i < segments; i++) {
      const t0 = start + extent*i/segments, t1 = start + extent*(i+1)/segments;
      const n0 = [nr*Math.sin(t0),ny,nr*Math.cos(t0)], n1 = [nr*Math.sin(t1),ny,nr*Math.cos(t1)];
      geometry.quad([point(a,t0),point(b,t0),point(b,t1),point(a,t1)], [n0,n0,n1,n1]);
    }
  }
  if (extent < TAU) {
    // Profiles used here are convex four-point annuli sections.
    for (const [theta, direction] of [[start,-1],[start+extent,1]]) {
      const normal = [direction*Math.cos(theta),0,-direction*Math.sin(theta)];
      geometry.quad(profile.map(p => point(p,theta)), profile.map(() => normal));
    }
  }
  return geometry;
}
const cylinder = (r, y0, y1) => revolve([[0,y0],[r,y0],[r,y1],[0,y1]]);
const cutWall = (inner, outer, bottom, top) => revolve([[inner,bottom],[outer,bottom],[outer,top],[inner,top]], Math.PI/4, 3*Math.PI/2, 48);

function box(x, y, z) {
  const g = new Geometry();
  for (const [axis,u,v] of [[0,1,2],[1,2,0],[2,0,1]]) {
    for (const sign of [-1,1]) {
      const normal = [0,0,0]; normal[axis] = sign;
      const points = [[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b]) => {
        const p = [0,0,0]; p[axis] = [x,y,z][axis]*sign/2;
        p[u] = [x,y,z][u]*a/2; p[v] = [x,y,z][v]*b/2; return p;
      });
      g.quad(points, points.map(() => normal));
    }
  }
  return g;
}

function lensGeometry(radius, aperture, thickness, rings = 16, segments = 64) {
  const g = new Geometry();
  const point = (r,t,sign) => [r*Math.cos(t),r*Math.sin(t),sign*(thickness/2-radius+Math.sqrt(radius*radius-r*r))];
  const normal = (r,t,sign) => [r*Math.cos(t)/radius,r*Math.sin(t)/radius,sign*Math.sqrt(radius*radius-r*r)/radius];
  for (const sign of [-1,1]) {
    for (let ring = 0; ring < rings; ring++) {
      const a = aperture*ring/rings, b = aperture*(ring+1)/rings;
      for (let i = 0; i < segments; i++) {
        const t0 = TAU*i/segments, t1 = TAU*(i+1)/segments;
        g.quad([point(a,t0,sign),point(b,t0,sign),point(b,t1,sign),point(a,t1,sign)],
          [normal(a,t0,sign),normal(b,t0,sign),normal(b,t1,sign),normal(a,t1,sign)]);
      }
    }
  }
  for (let i = 0; i < segments; i++) {
    const t0 = TAU*i/segments, t1 = TAU*(i+1)/segments;
    const n0 = [Math.cos(t0),Math.sin(t0),0], n1 = [Math.cos(t1),Math.sin(t1),0];
    g.quad([point(aperture,t0,-1),point(aperture,t1,-1),point(aperture,t1,1),point(aperture,t0,1)], [n0,n1,n1,n0]);
  }
  return g;
}

function asset(id) {
  const doc = new Document();
  doc.getRoot().getAsset().copyright = 'Original Ardesia S16 geometry, 2026. See RIGHTS.md.';
  doc.getRoot().setExtras({ardesiaScientificAsset: {id, revision: 1, units: 'm', purpose: 'illustration', physicsVerified: false}});
  const buffer = doc.createBuffer();
  const scene = doc.createScene(id);
  const root = doc.createNode(id); scene.addChild(root); doc.getRoot().setDefaultScene(scene);
  const materials = new Map();
  function material(key, color) {
    if (!materials.has(key)) materials.set(key, doc.createMaterial(key).setBaseColorFactor([...color,1]).setMetallicFactor(0).setRoughnessFactor(0.45));
    return materials.get(key);
  }
  function part(name, geometry, color = [0.15,0.45,0.65], parent = root, translation = [0,0,0]) {
    const positions = doc.createAccessor(`${name}-positions`).setType('VEC3').setArray(new Float32Array(geometry.positions)).setBuffer(buffer);
    const normals = doc.createAccessor(`${name}-normals`).setType('VEC3').setArray(new Float32Array(geometry.normals)).setBuffer(buffer);
    const indices = doc.createAccessor(`${name}-indices`).setType('SCALAR').setArray(new Uint16Array(geometry.indices)).setBuffer(buffer);
    const primitive = doc.createPrimitive().setAttribute('POSITION',positions).setAttribute('NORMAL',normals).setIndices(indices).setMaterial(material(color.join(','),color));
    const mesh = doc.createMesh(name).addPrimitive(primitive);
    const node = doc.createNode(name).setMesh(mesh).setTranslation(translation); parent.addChild(node); return node;
  }
  return {doc, root, part};
}

const definitions = [];
{
  const id = 'calibrated-vessel', {doc,part} = asset(id);
  const bore = 0.04, base = 0.004, height = 0.12;
  part('vessel-base', cylinder(0.043,0,base));
  part('vessel-wall-cutaway', cutWall(bore,0.043,base,base+height));
  const calibration = [100,200,300,400,500].map(volumeMl => {
    const y = base + volumeMl*1e-6/(Math.PI*bore*bore);
    const node = `graduation-${volumeMl}ml`;
    part(node,box(0.010,0.0008,0.0015),[0.04,0.08,0.12],undefined,[0,y,-0.03925]);
    return {node, volumeMl, heightAboveFloorM: y-base, localY: y};
  });
  definitions.push({id,doc,title:'Recipiente cilindrico graduato — sezione aperta',
    parameters:{innerRadiusM:bore,outerRadiusM:0.043,baseThicknessM:base,cavityHeightM:height,cutawayDegrees:90},
    anchors:{floor:[0,base,0],rim:[0,base+height,0]},calibration,
    scienceLimit:'Graduazioni per il cilindro ideale completo; la parete ha una sezione visiva aperta di 90°. Non è una misura sperimentale o una simulazione di fluido.'});
}
{
  const id = 'piston-cylinder', {doc,root,part} = asset(id);
  part('cylinder-base',cylinder(0.028,0,0.003));
  part('cylinder-wall-cutaway',cutWall(0.025,0.028,0.003,0.103));
  const moving = doc.createNode('piston-moving').setTranslation([0,0.055,0]); root.addChild(moving);
  part('piston-disc',cylinder(0.0245,-0.003,0.003),[0.70,0.45,0.15],moving);
  part('piston-rod',cylinder(0.004,0.003,0.053),[0.3,0.35,0.4],moving);
  definitions.push({id,doc,title:'Cilindro e pistone — sezione aperta',
    parameters:{boreRadiusM:0.025,outerRadiusM:0.028,barrelFloorM:0.003,barrelRimM:0.103,pistonRadiusM:0.0245,pistonThicknessM:0.006,rodRadiusM:0.004},
    anchors:{floor:[0,0.003,0],axis:[0,0,0]},
    controls:[{node:'piston-moving',property:'translation.y',units:'m',initial:0.055,min:0.012,max:0.082,authority:'S13 integration proposal; not an installed control'}],
    scienceLimit:'Gioco radiale e limiti di corsa geometrici soltanto. Nessuna legge dei gas, tenuta, attrito, pressione o forza è calcolata dal GLB.'});
}
{
  const id = 'biconvex-lens', {doc,part} = asset(id);
  part('lens-body',lensGeometry(0.10,0.025,0.010),[0.20,0.60,0.80]);
  definitions.push({id,doc,title:'Lente biconvessa sferica illustrativa',
    parameters:{curvatureRadiusM:0.10,apertureRadiusM:0.025,centerThicknessM:0.010,radialSegments:16,angularSegments:64},
    anchors:{opticalCenter:[0,0,0],frontVertex:[0,0,0.005],backVertex:[0,0,-0.005],opticalAxis:[0,0,1]},
    scienceLimit:'Superfici sferiche geometriche e materiale opaco per compatibilità. Nessun indice, tracciamento raggi, rifrazione, focale o precisione ottica è verificato.'});
}

if (!check) await mkdir(output,{recursive:true});
const assets = [];
for (const definition of definitions) {
  const {doc,...metadata} = definition;
  const bytes = await io.writeBinary(doc);
  if (check) assert.deepEqual(bytes,new Uint8Array(await readFile(`${output}/${definition.id}.glb`)),`${definition.id}: generated bytes differ`);
  else await writeFile(`${output}/${definition.id}.glb`,bytes);
  let triangles = 0, vertices = 0, primitives = 0;
  for (const mesh of doc.getRoot().listMeshes()) for (const p of mesh.listPrimitives()) {
    triangles += p.getIndices().getCount()/3; vertices += p.getAttribute('POSITION').getCount(); primitives++;
  }
  assets.push({...metadata,path:`${definition.id}.glb`,mediaType:'model/gltf-binary',sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,triangles,vertices,primitives,
    provenance:{kind:'ORIGINAL_PARAMETRIC',generator:'../../handoffs/swarm-v2/S16/build-assets.mjs',thirdPartyGeometry:[],rights:'RIGHTS.md'}});
}
const manifest = {
  schema:'ardesia.scientific3d-assets/1',revision:1,status:'PENDING_S13_CONSUMER',
  integration:{owner:'S13',approved:false,consumerVerified:false,reason:'No 3D consumer/contract observed in the inspected checkout paths or open PRs at 8e0737b1 during S16 reconnaissance. This is a proposed asset boundary.'},
  format:{spec:'glTF 2.0',container:'GLB',units:'m',handedness:'right',up:'+Y',front:'+Z',requiredExtensions:[],externalResources:false,textures:false,animations:false,materialProfile:'core opaque metallic-roughness'},
  budgets:{maxBytesPerAsset:262144,maxTrianglesPerAsset:6000,maxPrimitivesPerAsset:8,maxPackBytes:524288,scope:'Static resource budgets only; browser/mobile rendering is NOT_RUN'},
  rights:'LicenseRef-Ardesia-Original; see RIGHTS.md; build-tool licenses are separate',
  science:'Illustrative geometry. No physical model, scientific approval, simulation, learner outcome, or runtime performance certification.',
  assets
};
const serialized = JSON.stringify(manifest,null,2)+'\n';
if (check) assert.equal(serialized,await readFile(`${output}/manifest.json`,'utf8'),'Generated manifest differs');
else await writeFile(`${output}/manifest.json`,serialized);
if (check) console.log('Deterministic regeneration: all 3 GLBs and manifest are byte-identical.');
console.log(JSON.stringify(assets.map(({id,bytes,triangles,vertices,primitives,sha256})=>({id,bytes,triangles,vertices,primitives,sha256})),null,2));
