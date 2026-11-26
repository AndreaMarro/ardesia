// AUTHOR source/CPU framing proof. Actual ThreeFloat32 buffers and production
// constructor; not a new UI, GPU upload/shader/raster or arbitrary-camera proof.
import fs from'node:fs';import path from'node:path';import assert from'node:assert/strict';import{pathToFileURL}from'node:url';import{createHash}from'node:crypto';import ts from'typescript';
const app=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);const sha=b=>createHash('sha256').update(b).digest('hex');
const T=await import(pathToFileURL(path.join(app,'static/vendor/three-r180/three.module.min.js'))),{esperienza}=await import(pathToFileURL(path.join(app,'static/js/banchi/voci/esperimento.js'))),{disegna3D}=await import(pathToFileURL(path.join(app,'static/js/banchi/voci/geometria.js')));
const source=fs.readFileSync(path.join(app,'static/js/banchi/scena.js'),'utf8'),ast=ts.createSourceFile('scena.js',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),fn=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='instruments');assert.ok(fn);
const document={createElement(n){assert.equal(n,'canvas');return{width:96,height:96,getContext(){return{createRadialGradient(){return{addColorStop(){}};},fillRect(){},fillText(){},measureText(){return{width:30};}};}};}};
const instruments=new Function('T','v','ink','metal','ivory','brass','document',fn.getText(ast)+';return instruments;')(T,p=>new T.Vector3(...p),0x302a3e,0x786d87,0xfff4d5,0xd7983d,document);
const all=JSON.parse(fs.readFileSync(path.join(app,'content/esperienze-C1.json'))),rows=all.filter(r=>!r.engine&&r.apparatus==='vettori');assert.equal(rows.length,6);
const dimensions=[{name:'actual320',width:294,height:340},{name:'actual1280',width:837.921875,height:450},{name:'criticalMinSpans',width:607.5,height:450}];
let contexts=0,projected=0,sourceVertices=0;const cases=[],bad=[];
for(const row of rows){const activity=await esperienza(row),spec=activity.scene.spec,a=row.control;
 for(let i=0;i<=Math.round((a.max-a.min)/a.step);i++){const x=a.min+i*a.step;
  for(let stage=0;stage<=4;stage++){
   const root=new T.Group(),b=instruments(root);disegna3D(b,activity.elements(x,stage));root.updateMatrixWorld(true);const vertices=[];
   root.traverse(mesh=>{if(!mesh.geometry||mesh.isSprite||mesh.material?.transparent||mesh.material?.opacity!==1)return;const p=mesh.geometry.getAttribute('position');assert.ok(p.array instanceof Float32Array);for(let n=0;n<p.count;n++)vertices.push(new T.Vector3().fromBufferAttribute(p,n).applyMatrix4(mesh.matrixWorld));});
   assert.ok(vertices.length);sourceVertices+=vertices.length;contexts++;
   for(const view of['orbit','top','side'])for(const dim of dimensions){
    const aspect=dim.width/dim.height,span=Math.max(spec.height,spec.width/aspect),camera=new T.OrthographicCamera(-span*aspect/2,span*aspect/2,span/2,-span/2,.05,100),target=new T.Vector3(...spec.target),direction=new T.Vector3(...(view==='top'?[0,1,.00001]:view==='side'?[0,0,1]:spec.eye));camera.position.copy(target).addScaledVector(direction.normalize(),14);camera.up.set(0,1,0);camera.lookAt(target);camera.updateMatrixWorld(true);camera.updateProjectionMatrix();
    const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(const v of vertices){const q=v.clone().project(camera);for(let j=0;j<3;j++){const value=q.getComponent(j);min[j]=Math.min(min[j],value);max[j]=Math.max(max[j],value);}}
    const ok=min.every(v=>v>=-1)&&max.every(v=>v<=1),entry={id:row.id,x,stage,view,profile:dim.name,spec,minNDC:min,maxNDC:max,insideWholeOpaqueAndLineBuffers:ok};cases.push(entry);if(!ok)bad.push(entry);projected++;
   }
   root.traverse(o=>{o.geometry?.dispose();o.material?.map?.dispose();o.material?.dispose?.();});root.clear();
  }
 }
}
assert.equal(contexts,740);assert.equal(projected,6660);
const result={role:'AUTHOR technical, no independent SCI acceptance',scope:'All six native records, every legal control grid point, five display stages, actual opaque Float32 mesh and line position buffers with actual CPU matrixWorld; three preset orthographic cameras and two observed canvas dimensions plus the simultaneous minimum-frustum aspect. Convex buffer faces contained when all vertices contained. Sprites, GPU arithmetic/raster, arbitrary user orbit/zoom are excluded.',sourceScenaSha256:sha(Buffer.from(source)),sourceCallerSha256:sha(fs.readFileSync(path.join(app,'static/js/banchi/voci/esperimento.js'))),records:rows.map(r=>r.id),contexts,projected,sourceVertices,cases,uncontained:bad.length,activityCredit:0,scientificApproval:'NOT_GRANTED',humanApproval:'NOT_RUN',publicationAction:'NONE'};fs.writeFileSync(out,JSON.stringify(result)+'\n');console.log(JSON.stringify({contexts,projected,sourceVertices,uncontained:bad.length,first:bad.slice(0,2)}));if(bad.length)process.exitCode=1;
