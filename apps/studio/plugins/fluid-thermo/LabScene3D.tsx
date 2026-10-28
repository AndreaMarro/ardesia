import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import type {LabDefinition,LabResult,Parameters} from './types';
import {pistonGeometry,PIPE_ROTATION_Z} from './sceneGeometry';

const vesselUrl=new URL('../../../../assets/scientific3d/calibrated-vessel.glb',import.meta.url).href;
const pistonUrl=new URL('../../../../assets/scientific3d/piston-cylinder.glb',import.meta.url).href;
const colors={ink:0x263b41,water:0x2b6970,accent:0xa84b32,soft:0xeae8df};
const measure=(r:LabResult,key:string)=>r.measurements.find(m=>m.key===key)?.value??0;
type Engine={set:(d:LabDefinition,p:Parameters,r:LabResult)=>void;rotate:(angle:number)=>void;reset:()=>void;dispose:()=>void};
function release(root:T.Object3D){root.traverse(o=>{
  if(o instanceof T.Mesh||o instanceof T.Line){o.geometry.dispose();const materials=Array.isArray(o.material)?o.material:[o.material];materials.forEach(m=>m.dispose());}
});}
function mesh(geometry:T.BufferGeometry,color:number,opacity=1){return new T.Mesh(geometry,new T.MeshStandardMaterial({color,roughness:.65,metalness:.03,transparent:opacity<1,opacity,side:T.DoubleSide,depthWrite:opacity===1}));}
function arrow(group:T.Group,origin:T.Vector3,direction:T.Vector3,length:number,color:number){if(length>.0001)group.add(new T.ArrowHelper(direction.normalize(),origin,length,color,.12,.065));}
function cylinder(group:T.Group,radius:number,height:number,x:number,y:number,color:number,opacity=1){const m=mesh(new T.CylinderGeometry(radius,radius,height,40,1,false),color,opacity);m.position.set(x,y,0);group.add(m);return m;}

function build(d:LabDefinition,p:Parameters,r:LabResult):T.Group{
  const g=new T.Group();
  if(d.id==='buoyancy'){
    const side=Math.cbrt(p.volume/.001),fraction=p.submergedFraction,body=mesh(new T.BoxGeometry(side,side,side),colors.accent,.8);body.position.y=side/2;g.add(body);
    const radius=.04*Math.max(28,side*25);
    const water=mesh(new T.CylinderGeometry(radius,radius,Math.max(.005,side*fraction+.4),40),colors.water,.2);water.position.y=(side*fraction-.4)/2;g.add(water);
    if(fraction>0){const displaced=mesh(new T.BoxGeometry(side,side*fraction,side),colors.water,.65);displaced.position.y=side*fraction/2;g.add(displaced);}
    const maximum=Math.max(measure(r,'buoyancy'),measure(r,'weight'),1e-10);
    arrow(g,new T.Vector3(.8,.5,0),new T.Vector3(0,1,0),1.2*measure(r,'buoyancy')/maximum,colors.water);
    arrow(g,new T.Vector3(-.8,.5,0),new T.Vector3(0,-1,0),1.2*measure(r,'weight')/maximum,colors.accent);
  }else if(d.id==='poiseuille'){
    const shell=mesh(new T.CylinderGeometry(1,1,3.8,40,1,true,Math.PI/4,1.5*Math.PI),colors.ink,.18);shell.rotation.z=Math.PI/2;g.add(shell);
    const profile=r.series.find(s=>s.label.toLowerCase().includes('profil'))||r.series[0];
    const points=profile?.points||[],maximum=Math.max(...points.map(v=>Math.abs(v[1])),1e-10),radius=Math.max(...points.map(v=>Math.abs(v[0])),1e-10);
    // Revolve the analytical profile already returned by the model. x encodes
    // speed, while y/z encode position in the circular section, not distance traveled.
    const positions:number[]=[],indices:number[]=[],rings=points.filter(v=>v[0]>=0);
    rings.forEach(([radial,velocity])=>{for(let j=0;j<=40;j++){const angle=j/40*2*Math.PI;positions.push(-1.5+2.5*velocity/maximum,radial/radius*Math.cos(angle),radial/radius*Math.sin(angle));}});
    for(let i=0;i<rings.length-1;i++)for(let j=0;j<40;j++){const a=i*41+j,b=a+41;indices.push(a,b,a+1,b,b+1,a+1);}
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();g.add(mesh(geometry,colors.water,.8));
    points.filter((_,i)=>i%3===0).forEach(([radial,velocity])=>arrow(g,new T.Vector3(-1.5,radial/radius,0),new T.Vector3(1,0,0),2.5*velocity/maximum,colors.accent));
  }else if(d.id==='venturi'||d.id==='continuity'){
    const radius1=Math.sqrt(p.area1),radius2=Math.sqrt(p.area2),scale=Math.max(radius1,radius2),a=radius1/scale,b=radius2/scale;
    const tube=mesh(new T.LatheGeometry([new T.Vector2(a,-2),new T.Vector2(a,-1),new T.Vector2(b,-.35),new T.Vector2(b,1),new T.Vector2(a,2)],48),colors.water,.27);tube.rotation.z=PIPE_ROTATION_Z;g.add(tube);
    [-1.5,.4].forEach((x,i)=>{const radius=i?b:a;const ring=mesh(new T.TorusGeometry(radius,.018,8,48),colors.ink);ring.rotation.y=Math.PI/2;ring.position.x=x;g.add(ring);});
    const v1=d.id==='venturi'?p.speed1:measure(r,'speed1'),v2=measure(r,'speed2'),max=Math.max(v1,v2,1e-12);
    arrow(g,new T.Vector3(-1.7,0,0),new T.Vector3(1,0,0),1.4*v1/max,colors.accent);
    arrow(g,new T.Vector3(.2,0,0),new T.Vector3(1,0,0),1.4*v2/max,colors.accent);
    // Height remains in the quantitative 2D energy diagram. The section view
    // is explicitly a straightened duct; it does not encode an unshown slope.
  }else if(d.id==='capillary'){
    if(p.surfaceMode>0){
      const sphere=mesh(new T.SphereGeometry(1,48,32),colors.water,.7);g.add(sphere);
      if(p.surfaceMode===2)g.add(mesh(new T.SphereGeometry(1.09,48,32),colors.water,.18));
      arrow(g,new T.Vector3(0,0,0),new T.Vector3(1,0,0),1,colors.accent);
    }else{
      const theta=p.contactAngleDeg*Math.PI/180,cos=Math.cos(theta),points:T.Vector2[]=[];
      for(let i=0;i<=30;i++){const radial=i/30;const y=Math.abs(cos)<1e-7?0:-Math.sign(cos)*(Math.sqrt(1/(cos*cos)-radial*radial)-Math.sqrt(1/(cos*cos)-1));points.push(new T.Vector2(radial,y+.35));}
      g.add(mesh(new T.LatheGeometry(points,48),colors.water,.8));
      g.add(mesh(new T.CylinderGeometry(1.02,1.02,1.8,40,1,true,Math.PI/4,1.5*Math.PI),colors.ink,.18));
      const rim=mesh(new T.TorusGeometry(1,.016,8,48),colors.accent);rim.rotation.x=Math.PI/2;rim.position.y=.35;g.add(rim);
    }
  }else if(d.id==='pascal'){
    const normal=Math.sqrt(Math.max(p.inputArea,p.outputArea)),small=.8*Math.sqrt(p.inputArea)/normal,large=.8*Math.sqrt(p.outputArea)/normal;
    cylinder(g,small,1.5,-1.1,0,colors.water,.25);cylinder(g,large,1.5,1.1,0,colors.water,.25);
    cylinder(g,small,.1,-1.1,.6,colors.ink);cylinder(g,large,.1,1.1,.6,colors.ink);
    const pipe=mesh(new T.CylinderGeometry(.13,.13,2.2,20),colors.water);pipe.rotation.z=Math.PI/2;pipe.position.y=-.6;g.add(pipe);
    const maximum=Math.max(p.inputForce,measure(r,'outputForce'),1e-10);
    arrow(g,new T.Vector3(-1.1,1.7,0),new T.Vector3(0,-1,0),p.inputForce/maximum,colors.accent);
    arrow(g,new T.Vector3(1.1,.7,0),new T.Vector3(0,1,0),measure(r,'outputForce')/maximum,colors.water);
  }else{
    const shape=pistonGeometry(d,p,r),height=shape.height;
    const gas=cylinder(g,.625,height,0,height/2+shape.floorY,colors.water,.3);gas.name='gas-volume';
    const piston=cylinder(g,.625,.1,0,shape.pistonY,colors.ink);piston.name='analytical-piston';
    const shellHeight=Math.max(2.4,height+.35),shell=mesh(new T.CylinderGeometry(.7,.7,shellHeight,40,1,true,Math.PI/4,1.5*Math.PI),colors.ink,.18);shell.position.y=shape.floorY+shellHeight/2;g.add(shell);
  }
  return g;
}

function createEngine(canvas:HTMLCanvasElement,onLost:()=>void,onAsset:(text:string)=>void):Engine{
  const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,1.5));renderer.setClearColor(colors.soft);renderer.outputColorSpace=T.SRGBColorSpace;
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,1,.02,100);scene.add(new T.HemisphereLight(0xffffff,0x707977,2.2));
  const light=new T.DirectionalLight(0xfff6e7,2.6);light.position.set(3,5,4);scene.add(light);
  let group=new T.Group(),asset:T.Group|null=null,yaw=.65,distance=6,disposed=false,frame=0,generation=0;
  scene.add(group);const target=new T.Vector3(0,.15,0);
  function fit(){const bounds=new T.Box3().setFromObject(group);if(asset)bounds.expandByObject(asset);bounds.getCenter(target);distance=Math.max(6,bounds.getSize(new T.Vector3()).length()*1.2);camera.far=Math.max(100,distance*10);camera.updateProjectionMatrix();}
  function draw(){if(disposed)return;camera.position.set(target.x+distance*Math.sin(yaw),target.y+.55*distance,target.z+distance*Math.cos(yaw));camera.lookAt(target);renderer.render(scene,camera);}
  function requestDraw(){if(!frame&&!disposed)frame=requestAnimationFrame(()=>{frame=0;draw();});}
  function resize(){const rect=canvas.getBoundingClientRect();renderer.setSize(Math.max(1,rect.width),Math.max(1,rect.height),false);camera.aspect=Math.max(1,rect.width)/Math.max(1,rect.height);camera.updateProjectionMatrix();requestDraw();}
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
  const contextLost=(event:Event)=>{event.preventDefault();onLost();};canvas.addEventListener('webglcontextlost',contextLost);
  let pointer:{id:number;x:number;y:number}|null=null;
  const down=(e:PointerEvent)=>{pointer={id:e.pointerId,x:e.clientX,y:e.clientY};};
  const move=(e:PointerEvent)=>{if(!pointer||e.pointerId!==pointer.id)return;const dx=e.clientX-pointer.x;if(Math.abs(dx)>Math.abs(e.clientY-pointer.y)){yaw-=dx*.008;pointer.x=e.clientX;pointer.y=e.clientY;requestDraw();}};
  const up=()=>{pointer=null;};canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('pointerleave',up);
  return {rotate(angle){yaw+=angle;requestDraw();},reset(){yaw=.65;requestDraw();},set(d,p,r){
    generation++;const current=generation;scene.remove(group);release(group);group=build(d,p,r);scene.add(group);
    if(asset){scene.remove(asset);release(asset);asset=null;}
    fit();
    const pistonShape=d.id==='ideal-gas'||d.id==='process'?pistonGeometry(d,p,r):null;
    if(d.id==='buoyancy'||pistonShape?.useS16){
      const url=d.id==='buoyancy'?vesselUrl:pistonUrl;
      void new GLTFLoader().loadAsync(url).then(gltf=>{
        if(disposed||current!==generation){release(gltf.scene);return;}
        asset=gltf.scene;
        // Reuse S16 geometry as a normalized cutaway. Tick marks carry no
        // metrological values after this illustration transform.
        if(d.id==='buoyancy'){asset.scale.setScalar(Math.max(28,Math.cbrt(p.volume/.001)*25));asset.position.y=-.4;}
        else if(pistonShape){asset.scale.setScalar(pistonShape.assetScale);asset.position.y=pistonShape.assetOffsetY;const piston=asset.getObjectByName('piston-moving');if(piston){piston.position.y=pistonShape.assetTranslation;const fallback=group.getObjectByName('analytical-piston');if(fallback)fallback.visible=false;}}
        asset.traverse(o=>{if(o instanceof T.Mesh){const old=Array.isArray(o.material)?o.material:[o.material];old.forEach(m=>m.dispose());o.material=new T.MeshStandardMaterial({color:colors.ink,roughness:.8,transparent:true,opacity:.22,side:T.DoubleSide,depthWrite:false});}});
        scene.add(asset);fit();onAsset(d.id==='buoyancy'?'Recipiente in sezione.':'Cilindro e pistone in sezione.');requestDraw();
      }).catch(()=>{if(!disposed&&current===generation)onAsset('Vista semplificata del modello.');});
    }else onAsset('Geometria del modello analitico.');
    requestDraw();
  },dispose(){disposed=true;generation++;if(frame)cancelAnimationFrame(frame);observer.disconnect();canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);canvas.removeEventListener('pointerleave',up);release(group);if(asset)release(asset);renderer.dispose();
    // StrictMode probes cleanup while retaining the canvas. A forced loss here
    // would poison the renderer created by the second effect setup.
    if(!canvas.isConnected)renderer.forceContextLoss();}};
}

export function LabScene3D({definition,parameters,result,onUnavailable}:{definition:LabDefinition;parameters:Parameters;result:LabResult;onUnavailable:()=>void}){
  const canvas=useRef<HTMLCanvasElement>(null),engine=useRef<Engine|null>(null),latest=useRef({definition,parameters,result,onUnavailable});latest.current={definition,parameters,result,onUnavailable};
  const [error,setError]=useState(''),[asset,setAsset]=useState('');
  useEffect(()=>{
    if(!canvas.current)return;
    try{const value=createEngine(canvas.current,()=>{setError('Il contesto grafico è stato perso. Torna alla vista 2D: dati e previsione sono conservati.');},setAsset);engine.current=value;}
    catch{setError('Il 3D non è disponibile su questo dispositivo. La vista 2D contiene gli stessi dati.');}
    return()=>{engine.current?.dispose();engine.current=null;};
  },[]);
  useEffect(()=>{engine.current?.set(definition,parameters,result);},[definition,parameters,result]);
  return <figure className="ft-scene"><canvas ref={canvas} aria-label={definition.title+' · geometria 3D ruotabile con i pulsanti'}/>
    {error?<div role="alert"><p>{error}</p><button type="button" onClick={onUnavailable}>Riprendi in 2D</button></div>:<div className="ft-camera" role="group" aria-label="Camera 3D"><button type="button" onClick={()=>engine.current?.rotate(-.22)}>Ruota a sinistra</button><button type="button" onClick={()=>engine.current?.rotate(.22)}>Ruota a destra</button><button type="button" onClick={()=>engine.current?.reset()}>Ripristina camera</button></div>}
    <figcaption className="ft-scene-caption">{asset} Geometria normalizzata: graduazioni illustrative e vettori con scala relativa. Nessuna animazione del moto.
      {definition.id==='poiseuille'?' Profilo normalizzato r/R e v/v_max: la superficie rappresenta la velocità nella sezione circolare, non una superficie materiale. Le misure assolute sono nella tabella.':definition.id==='venturi'?' Condotto raddrizzato per leggere le sezioni; il dislivello è nel bilancio quantitativo 2D.':definition.id==='capillary'?' La doppia superficie della bolla è separata per renderla leggibile; lo spessore non è in scala.':''}</figcaption>
  </figure>;
}
