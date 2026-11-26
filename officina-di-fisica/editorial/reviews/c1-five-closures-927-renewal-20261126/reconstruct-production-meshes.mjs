// No browser: real production geometry constructors, same recorded elements.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import{pathToFileURL}from'node:url';import{createHash}from'node:crypto';import ts from'typescript';
const app=path.resolve(process.argv[2]),input=path.resolve(process.argv[3]),output=path.resolve(process.argv[4]);const sha=x=>createHash('sha256').update(x).digest('hex');
const T=await import(pathToFileURL(path.join(app,'static/vendor/three-r180/three.module.min.js')));
const{disegna3D,scenaMobile}=await import(pathToFileURL(path.join(app,'static/js/banchi/voci/geometria.js')));
const source=fs.readFileSync(path.join(app,'static/js/banchi/scena.js'),'utf8'),ast=ts.createSourceFile('scena.js',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),node=ast.statements.find(s=>ts.isFunctionDeclaration(s)&&s.name?.text==='instruments');assert.ok(node);
const verbatim=node.getText(ast),doc={createElement(name){assert.equal(name,'canvas');return{width:96,height:96,getContext(){return{createRadialGradient(){return{addColorStop(){}};},fillRect(){},measureText(){return{width:10};}};}};}};
const instruments=new Function('T','v','ink','metal','ivory','brass','document',verbatim+';return instruments;')(T,p=>new T.Vector3(...p),0x302a3e,0x786d87,0xfff4d5,0xd7983d,doc);
const report=JSON.parse(fs.readFileSync(path.join(input,'report.json')));let count=0,parts=0,meshes=0;const hash=createHash('sha256');fs.writeFileSync(output,'');
function meshInfo(mesh){
 assert.ok(mesh.isMesh);const positions=mesh.geometry.getAttribute('position');assert.ok(positions.array instanceof Float32Array);const vertices=[],seen=new Set();
 for(let i=0;i<positions.count;i++){const v=new T.Vector3().fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld).toArray(),key=JSON.stringify(v);if(!seen.has(key)){seen.add(key);vertices.push(v);}}
 return{geometryType:mesh.geometry.type,geometryParameters:mesh.geometry.parameters,positionStorageType:positions.array.constructor.name,localBufferByteSha256:sha(Buffer.from(positions.array.buffer,positions.array.byteOffset,positions.array.byteLength)),actualObjectMatrixWorldCPU:mesh.matrixWorld.toArray(),vertices};
}
for(const entry of report.cases){
 const c=JSON.parse(fs.readFileSync(path.join(input,entry.file)));if(!c.interaction||c.profile.fallback)continue;const root=new T.Group(),b=instruments(root);const mobile=Boolean(c.nativeGlyphs[0]?.parts[0].sourceMobileUnitGeometry);
 if(mobile){const frame=scenaMobile(b,()=>c.elements);frame(c.sourceReplayedClockTime??0);}else disegna3D(b,c.elements);
 root.updateMatrixWorld(true);assert.equal(root.children.slice(0,6).filter(n=>n.isMesh&&!n.material.transparent).length,5);const baseMeshes=root.children.slice(0,6).filter(n=>n.isMesh&&!n.material.transparent).map(meshInfo);const physical=[],glyphs=[];let cursor=6;
 for(const[index,e]of c.elements.entries()){
  const object=root.children[cursor++];assert.ok(object,'actual production node missing');
  if(e.kind==='arrow'){
   const pair=mobile?object.children:[object,root.children[cursor++]];assert.equal(pair.length,2);assert.ok(pair.every(n=>n.isMesh));glyphs.push({elementIndex:index,parts:pair.map(meshInfo)});parts+=2;
  }else if(['box','ball','rod'].includes(e.kind)&&e.alpha>=1){assert.ok(object.isMesh);physical.push({elementIndex:index,...meshInfo(object)});meshes++;}
 }
 assert.equal(cursor,root.children.length);assert.equal(glyphs.length,c.nativeGlyphs.length);const line=JSON.stringify({caseKey:c.caseKey,recordedCaseSha256:entry.sha256,sourceDerivedCamera:c.sourceDerivedCamera,baseMeshes,physicalMeshes:physical,glyphs})+'\n';fs.appendFileSync(output,line);hash.update(line);count++;
 root.traverse(o=>{o.geometry?.dispose();if(o.material?.map)o.material.map.dispose();o.material?.dispose?.();});root.clear();
}
assert.equal(count,396);assert.equal(parts,1332);console.log(JSON.stringify({sourceRuntime:'9279713a1f2cbb27fbb2014ae68d15b70f71ea3249c4ec33d7430a54a3fdcd0d',actualRecordedNativeStates:count,sourceGlyphParts:parts,physicalMeshes:meshes,productionScenaFileSha256:sha(Buffer.from(source)),executedInstrumentsVerbatimSha256:sha(Buffer.from(verbatim)),productionGeometriaSha256:sha(fs.readFileSync(path.join(app,'static/js/banchi/voci/geometria.js'))),nativeMeshJsonlSha256:hash.digest('hex'),scope:'CPU reconstruction of real Float32 position buffers with real production constructors and source CPU matrixWorld. No new UI, GPU readback, shader or rasterization claim.',activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'}));
