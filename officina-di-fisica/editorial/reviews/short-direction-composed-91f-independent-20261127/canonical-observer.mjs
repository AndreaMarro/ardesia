export async function observe({row,profile,requestedX,requestedTime}){
 const {esperienza}=await import('/js/banchi/voci/esperimento.js');
 const activity=await esperienza(row);
 const T=await import('/vendor/three-r180/three.module.min.js');
 const {posizionaEtichetta}=await import('/js/banchi/etichette.js');
 const {n}=await import('/js/banchi/misure.js');
 const {piloti}=await import('/js/banchi/quaderno.js');
 const pilot=piloti[row.id];
 const controls=[...document.querySelectorAll('.bench-params input,.bench-params select')].map(e=>({name:e.name,value:e.value,min:e.min,max:e.max,step:e.step,kind:e.tagName}));
 const xNode=controls.find(e=>e.name==='x');let x=Number(xNode.value);
 let time=activity.clock?(activity.clock.input?x:requestedTime??0):undefined;
 let s=activity.model.solve({x}),spec=activity.scene.spec,elements;
 if(pilot==='induzione'){
  const m=await import('/js/banchi/modelli/induzione.js');const scene=await import('/js/banchi/scene/induzione.js');
  const p=Object.fromEntries(controls.map(c=>[c.name,c.name==='circuit'?c.value:Number(c.value)]));
  s=m.solve(p);spec=scene.spec;time=requestedTime??0;
  // The pilot uses a separate scene, not the generic experiment apparatus.
  // Collect real scene build commands and group transforms without rendering
  // an alternate scene or mutating the consumer.
  const root=new T.Group(),commands=[];
  const add=(kind,props,parent=root)=>commands.push({kind,...props,parent});
  const b={T,base:(w,d)=>add('box',{p:[0,-.11,0],size:[w,.22,d],c:0xfff4d5,alpha:1}),
   box:(p,size,c,parent,alpha=1)=>add('box',{p,size,c,alpha},parent),ball:(p,r,c,parent,alpha=1)=>add('ball',{p,r,c,alpha},parent),
   rod:(a,b,r,c,parent,alpha=1,r2=r,openEnded=false)=>add('rod',{a,b,r,c,alpha,r2,openEnded},parent),
   arrow:(a,b,c,parent,thin=.028)=>add('arrow',{a,b,c,thin,alpha:1},parent),
   line:(points,c,parent,dash=false)=>add('line',{points,c,dash},parent),
   label:(p,text,c=0x302a3e,parent)=>add('label',{p,text,c},parent),
   group:(parent=root)=>{const g=new T.Group();parent.add(g);return g;},
   ring:(p,r,plane,c,parent)=>add('line',{points:Array.from({length:65},(_,i)=>{const a=i*Math.PI/32;return p.map((v,j)=>v+(plane==='xz'?[r*Math.cos(a),0,r*Math.sin(a)]:plane==='xy'?[r*Math.cos(a),r*Math.sin(a),0]:[0,r*Math.cos(a),r*Math.sin(a)])[j]);}),c},parent)};
  const action=scene.build(b,p,s,1);action?.(time);root.updateMatrixWorld(true);
  elements=commands.filter(e=>{let p=e.parent;while(p){if(!p.visible)return false;p=p.parent;}return true;}).map(e=>{const {parent,...value}=e;return{...value,sourceGroupMatrix:parent.matrixWorld.toArray()};});
 }else elements=activity.elements(x,1,time);
 const canvas=document.querySelector('.bench-stage canvas'),svg=document.querySelector('[data-drawing]>svg');
 const rect=(profile.fallback?svg:canvas).getBoundingClientRect(),legend=document.querySelector('[data-legend]');
 const r={requestedX,requestedTime:requestedTime??null,sourceReplayedX:x,sourceReplayedClockTime:time??null,
  actualDOMControls:controls,model:s,spec,elements,pilot:pilot??null,
  stateMeasurementScope:'Exact source replay from observed controls/interaction, not private GPU-state introspection',
  actualRenderer:document.querySelector('[data-display]').textContent,canvas:{width:rect.width,height:rect.height},
  legend:legend.textContent,legendLayout:{visible:legend.getBoundingClientRect().height>0,width:legend.clientWidth,scrollWidth:legend.scrollWidth},
  readings:document.querySelector('[data-readings]').textContent,
  guide:Object.fromEntries(['step-title','explain','equation'].map(k=>[k,document.querySelector('[data-'+k+']').textContent])),
  clockReadout:document.querySelector('[data-instant]').value,
  svg:profile.fallback?svg.outerHTML:null,
  fullGlyphAcceptance:'NOT_GRANTED; raw primitives/group transforms and native32facet source are preserved for independent checks'};
 if(!profile.fallback){
  const aspect=rect.width/rect.height,span=Math.max(spec.height,spec.width/aspect);
  const camera=new T.OrthographicCamera(-span*aspect/2,span*aspect/2,span/2,-span/2,.05,100),target=new T.Vector3(...spec.target);
  const direction=new T.Vector3(...(profile.view==='top'?[0,1,.00001]:profile.view==='side'?[0,0,1]:spec.eye));
  camera.position.copy(target).addScaledVector(direction.normalize(),14);camera.up.set(0,1,0);camera.lookAt(target);camera.updateProjectionMatrix();camera.updateMatrixWorld();
  const project=p=>{const v=new T.Vector3(...p).project(camera);return{x:(1+v.x)*rect.width/2,y:(1-v.y)*rect.height/2,depth:v.z};};
  const world=(p,e)=>e.sourceGroupMatrix?new T.Vector3(...p).applyMatrix4(new T.Matrix4().fromArray(e.sourceGroupMatrix)).toArray():p;
  const occupied=[],ctx=document.createElement('canvas').getContext('2d');ctx.font='600 42px Arial';const pixels=rect.height/span;
  r.labels=elements.filter(e=>e.kind==='label').map(e=>{const center=project(world(e.p,e)),textureWidth=Math.ceil(ctx.measureText(e.text).width)+32,h=Math.max(20,.33*pixels),w=h*textureWidth/68;
   if(center.x<0||center.x>rect.width||center.y<0||center.y>rect.height)return{...e,notPositionedOutsideViewport:true};
   return{...e,center,textureWidth,box:posizionaEtichetta(center.x,center.y,w,h,rect.width,rect.height,occupied)};});
  r.nativeGlyphs=[];
  for(const [index,e]of elements.entries())if(e.kind==='arrow'){
   const a=new T.Vector3(...e.a),b=new T.Vector3(...e.b),delta=b.clone().sub(a),length=delta.length();if(length<.012)continue;
   const u=delta.clone().normalize(),joint=b.clone().addScaledVector(u,-Math.min(.24,length*.32)),thin=e.thin??.028;
   const parts=[];
   for(const [start,end,radius,topRadius]of [[a,joint,thin,thin],[joint,b,thin*2.9,0]]){
    const d=end.clone().sub(start),len=d.length(),mobile=Boolean(activity.clock)&&!pilot;
    const geo=mobile?new T.CylinderGeometry(topRadius/radius,1,1,32,1,false):new T.CylinderGeometry(topRadius,radius,Math.max(.0001,len),32,1,false);
    const matrix=new T.Matrix4().compose(start.clone().add(end).multiplyScalar(.5),new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),d.normalize()),mobile?new T.Vector3(radius,len,radius):new T.Vector3(1,1,1));
    if(e.sourceGroupMatrix)matrix.premultiply(new T.Matrix4().fromArray(e.sourceGroupMatrix));
    const position=geo.getAttribute('position'),vertices=[],seen=new Set();
    for(let i=0;i<position.count;i++){const p=new T.Vector3().fromBufferAttribute(position,i).applyMatrix4(matrix).toArray(),k=JSON.stringify(p);if(!seen.has(k)){seen.add(k);vertices.push(p);}}
    parts.push({vertices,primitive:'closed32radialCylinderGeometry',radius,topRadius,sourceMobileUnitGeometry:mobile});geo.dispose();
   }
   const tip=project(world(e.b,e));r.nativeGlyphs.push({elementIndex:index,tail:world(e.a,e),tip:world(e.b,e),parts,tipPixels:tip,
    tipInsideOpaqueLabel:r.labels.filter(l=>l.box&&Math.abs(tip.x-l.box.x)<l.box.w/2&&Math.abs(tip.y-l.box.y)<l.box.h/2).map(l=>({text:l.text,box:l.box})),
    vertexViewportBounds:parts.flatMap(p=>p.vertices).map(project).reduce((a,p)=>({minX:Math.min(a.minX,p.x),maxX:Math.max(a.maxX,p.x),minY:Math.min(a.minY,p.y),maxY:Math.max(a.maxY,p.y)}),{minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity}),
    scope:'Full actual32facet vertex geometry; label-tip samples are not a whole-surface/camera-occlusion clearance proof'});
  }
  r.sourceDerivedCamera={view:profile.view,position:camera.position.toArray(),target:target.toArray(),zoom:1,matrixWorld:camera.matrixWorld.toArray(),projectionMatrix:camera.projectionMatrix.toArray()};
 }
 return r;
}
