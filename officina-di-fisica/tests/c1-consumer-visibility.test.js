import test from 'node:test';
import assert from 'node:assert/strict';
import {tavolo, colore as c} from '../static/js/banchi/voci/geometria.js';
import {meccanica} from '../static/js/banchi/voci/apparati/meccanica.js';
import {experiments} from '../static/js/banchi/voci/modelli/C1.js';
import {confronti} from '../static/js/banchi/voci/confronti.js';
import {legende} from '../static/js/banchi/voci/legende.js';

const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,`${a} differs from ${b}`);
function drawing(id,x,kind){
 const model=experiments[id],value=model.measure(x),state=model.apparatus(x,value),paper=tavolo(2);
 meccanica[kind](paper,state);
 return {state,value,items:paper.elementi};
}
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));

test('every reachable nonzero spring force keeps its full signed scale outside the opaque endpoint',()=>{
 for(let x=-4;x<=6;x+=0.5){
  const {state,items}=drawing('SIM-C1-L006-02',x,'molla');
  const ball=items.find(e=>e.kind==='ball'&&e.c===c.ocra);
  const arrows=items.filter(e=>e.kind==='arrow'&&e.c===c.verde);
  assert.equal(arrows.length,x===0?0:1);
  for(const arrow of arrows){
   near(arrow.b[0]-arrow.a[0],0.8*state.forza);
   near(arrow.a[1],ball.p[1]);near(arrow.a[2],ball.p[2]);
   assert.ok(distance(arrow.a,ball.p)>ball.r+0.01,'Nonzero force starts outside its opaque body');
   assert.equal(Math.sign(arrow.a[0]-ball.p[0]),Math.sign(state.forza));
  }
 }
});

test('rigid rod and its endpoints stay in front of the support across the complete angle grid',()=>{
 for(let angle=0;angle<=90;angle+=5){
  const {items}=drawing('SIM-C1-L010-02',angle,'leva');
  const beam=items.find(e=>e.kind==='rod'&&e.c===c.ocra);
  const post=items.find(e=>e.kind==='rod'&&e.c===c.metallo);
  near(distance(beam.a,beam.b),2);
  near(beam.a[2],0);near(beam.b[2],0);
  assert.ok(Math.abs(post.a[2])>post.r+0.11,'Support is outside the full endpoint swept plane');
  near(post.a[2],post.b[2]);
 }
});

test('lever arrows preserve force ratios and lines of action while clearing opaque markers and pivot',()=>{
 const grids=[['SIM-C1-L010-03',0,40,2],['SIM-C1-L010-04',10,40,2],['SIM-C1-L010-05',2,6,0.5]];
 for(const [id,min,max,step] of grids){
  for(let x=min;x<=max;x+=step){
   const {state,items}=drawing(id,x,'leva');
   const arrows=items.filter(e=>e.kind==='arrow');
   const forces=[state.fs,state.fd].filter(v=>v!==undefined&&v!==0);
   assert.equal(arrows.length,forces.length);
   for(let index=0;index<arrows.length;index++){
    const a=arrows[index];near(a.b[0],a.a[0]);near(a.b[2],a.a[2]);
    near(distance(a.a,a.b),Math.abs(forces[index]));
    for(const ball of items.filter(e=>e.kind==='ball')){
     assert.ok(distance(a.a,ball.p)>ball.r+0.01,'Full force arrow must start outside opaque marker/pivot');
    }
   }
   if(id==='SIM-C1-L010-03'&&x===0){near(arrows[0].a[0],-0.4);near(arrows[0].b[1]-arrows[0].a[1],-0.8);}
   if(id==='SIM-C1-L010-05')near(distance(arrows[0].a,arrows[0].b)/distance(arrows[1].a,arrows[1].b),30/x);
  }
 }
});

test('zero-duration mean power is distinguished from its zero limit and instantaneous power',()=>{
 const [label,value,unit]=confronti['SIM-C1-L007-02'](0);
 assert.match(label,/media/iu);assert.equal(typeof value,'string');assert.match(value,/non definita|intervallo nullo/iu);assert.equal(unit,'');
 near(experiments['SIM-C1-L007-02'].measure(0),0);
 for(const t of [0.25,0.5,1,2,3,4]){
  const [name,mean,u]=confronti['SIM-C1-L007-02'](t);
  assert.equal(name,label);assert.equal(u,'W');near(mean,3*t);near(experiments['SIM-C1-L007-02'].measure(t),6*t);
 }
});

test('the complete lever force glyph stays above the opaque table at every reachable input',()=>{
 for(const [id,min,max,step] of [['SIM-C1-L010-03',0,40,2],['SIM-C1-L010-04',10,40,2],['SIM-C1-L010-05',2,6,0.5]]){
  for(let x=min;x<=max;x+=step){
   const {items}=drawing(id,x,'leva');
   for(const arrow of items.filter(e=>e.kind==='arrow')){
    assert.ok(Math.min(arrow.a[1],arrow.b[1])>0.05,'No shaft or head extends into the opaque base');
    assert.ok(Math.max(arrow.a[1],arrow.b[1])<3.45,'Force scale fits the intended apparatus height');
   }
  }
 }
});

test('fulcrum and elbow names remain in the existing HTML legend without covering the rod markers',()=>{
 assert.match(legende.leva,/perno viola/iu);
 assert.match(legende.leva,/fulcro/iu);
 assert.match(legende.leva,/gomito/iu);
 for(const [id,x] of [['SIM-C1-L010-02',90],['SIM-C1-L010-03',0],['SIM-C1-L010-05',4]]){
  const {items}=drawing(id,x,'leva');
  assert.equal(items.filter(e=>e.kind==='label'&&/fulcro|gomito/iu.test(e.text)).length,0,
   'Identification belongs to the readable HTML legend, without screen-space sprite occlusion');
 }
});

test('incline normals keep the complete common-scale vector outside the opaque body on the full angle grid',()=>{
 for(let angle=0;angle<=75;angle+=5){
  const {items}=drawing('SIM-C1-L005-05',angle,'piano');
  const ball=items.find(e=>e.kind==='ball'&&e.c===c.ocra);
  const normal=items.find(e=>e.kind==='arrow'&&e.c===c.verde);
  const theta=angle*Math.PI/180,dx=normal.b[0]-normal.a[0],dy=normal.b[1]-normal.a[1];
  near(dx,-0.75*Math.cos(theta)*Math.sin(theta));near(dy,0.75*Math.cos(theta)**2);
  near((normal.a[0]-ball.p[0])*dy-(normal.a[1]-ball.p[1])*dx,0);
  assert.ok(distance(normal.a,ball.p)>ball.r+0.01,'Normal arrow begins outside its opaque body');
 }
});

test('incline weight stays above the table and separate from the normal without moving its line of action',()=>{
 for(let angle=0;angle<=75;angle+=5){
  const {items}=drawing('SIM-C1-L005-05',angle,'piano');
  const ball=items.find(e=>e.kind==='ball'&&e.c===c.ocra);
  const weight=items.find(e=>e.kind==='arrow'&&e.c===c.rosso);
  const normal=items.find(e=>e.kind==='arrow'&&e.c===c.verde);
  near(weight.a[0],ball.p[0]);near(weight.b[0],ball.p[0]);near(weight.b[1]-weight.a[1],-0.75);
  assert.ok(Math.min(weight.a[1],weight.b[1])>0.05,'Entire vertical cone clears the opaque tabletop');
  assert.ok(Math.min(weight.a[1],weight.b[1])>Math.max(normal.a[1],normal.b[1])+0.09,
   'Opposite collinear vectors remain distinct at zero angle');
  assert.ok(Math.max(weight.a[1],weight.b[1],normal.a[1],normal.b[1])<3.45);
 }
});

test('incline force names and fixed weight remain readable in the HTML legend instead of covering the glyphs',()=>{
 assert.match(legende.piano,/peso/iu);assert.match(legende.piano,/normale/iu);assert.match(legende.piano,/20\s*N/u);
 for(const angle of [0,75]){
  const {items}=drawing('SIM-C1-L005-05',angle,'piano');
  assert.equal(items.filter(e=>e.kind==='label'&&/peso|normale/iu.test(e.text)).length,0);
 }
});

test('the complete constant weight remains above its body and tabletop over every falling height',()=>{
 for(let step=0;step<=100;step++){
  const paper=tavolo(2),height=step/100;
  meccanica.caduta(paper,{altezza:height});
  const ball=paper.elementi.find(e=>e.kind==='ball'),weight=paper.elementi.find(e=>e.kind==='arrow'&&e.c===c.rosso);
  near(ball.p[1],0.3+2.05*height);
  near(weight.a[0],0);near(weight.b[0],0);near(weight.a[2],0.25);near(weight.b[2],0.25);
  near(weight.b[1]-weight.a[1],-0.42);
  assert.ok(weight.b[1]>ball.p[1]+ball.r,'Full downward glyph stays outside the opaque body at contact and before contact');
  assert.ok(weight.b[1]>0.05,'Weight cone cannot end inside the opaque base');
  assert.ok(weight.a[1]<3.45,'Unchanged force scale fits the apparatus at its greatest height');
 }
});

test('complete circular velocity and acceleration glyphs clear the body at unchanged exact scales over the orbit',()=>{
 for(let v=1;v<=6;v++)for(let phase=0;phase<32;phase++){
  const angle=phase*Math.PI/16,state=experiments['SIM-C1-L004-04'].apparatus(v,v*v/2),paper=tavolo(2);
  state.angoloOrbita=angle;meccanica.cerchio(paper,state);
  const ball=paper.elementi.find(e=>e.kind==='ball'),arrows=paper.elementi.filter(e=>e.kind==='arrow');
  assert.equal(arrows.length,2);
  for(const arrow of arrows){
   near(arrow.a[1],arrow.b[1]);
   assert.ok(arrow.a[1]-0.0812>ball.p[1]+ball.r+0.01,'Entire horizontal head and shaft clear the opaque moving body');
  }
  const velocity=arrows.find(e=>e.c===c.verde),acceleration=arrows.find(e=>e.c===c.viola);
  near(velocity.b[0]-velocity.a[0],-v*Math.sin(angle)/5);near(velocity.b[2]-velocity.a[2],-v*Math.cos(angle)/5);
  near(acceleration.b[0]-acceleration.a[0],-v*v*Math.cos(angle)/26);near(acceleration.b[2]-acceleration.a[2],v*v*Math.sin(angle)/26);
 }
});

test('collinear translational force glyphs retain their common scale in front of the complete opaque block',()=>{
 for(let force=1;force<=12;force++){
  const {items,state}=drawing('SIM-C1-L006-01',force,'forze');
  const body=items.find(e=>e.kind==='box'),arrows=items.filter(e=>e.kind==='arrow');
  assert.equal(arrows.length,2);
  for(const arrow of arrows){
   near(arrow.a[1],arrow.b[1]);near(arrow.a[2],arrow.b[2]);
   assert.ok(arrow.a[2]-0.0812>body.p[2]+body.size[2]/2+0.01,'Full cone clears the block front face');
  }
  const right=arrows.find(e=>e.c===c.verde),left=arrows.find(e=>e.c===c.rosso);
  near(right.b[0]-right.a[0],1.14*state.destra);near(left.b[0]-left.a[0],-1.14*state.sinistra);
  assert.deepEqual(right.a,left.a,'Opposing forces in the translational model share a displayed line, without implying a torque couple');
 }
});

test('moving endpoint and mass vector names remain in HTML without sprites covering their physical tips',()=>{
 assert.match(legende.molla,/estremo mobile/iu);
 assert.match(legende.caduta,/massa/iu);assert.match(legende.caduta,/tensione/iu);
 assert.match(legende.cerchio,/centro/iu);assert.match(legende.cerchio,/scale/iu);
 for(const [kind,state] of [['molla',{estensione:1.2,forza:-1.5}],['caduta',{altezza:0}],['cerchio',{r:1.4,tangente:0.2,radiale:1/26}]]){
  const paper=tavolo(2);meccanica[kind](paper,state);
  assert.equal(paper.elementi.filter(e=>e.kind==='label').length,0,'Names are read in the existing legend, without a screen-space cover over the arrows');
 }
});

test('vector names remain in the HTML legend with no opaque name sprite over a or b tips',()=>{
 assert.match(legende.vettori,/primo vettore/iu);assert.match(legende.vettori,/secondo vettore/iu);
 assert.match(legende.vettori,/prodotto vettoriale/iu);
 for(const angle of [0,90,120,180]){
  const {items}=drawing('SIM-C1-L007-01',angle,'vettori');
  assert.deepEqual(items.filter(e=>e.kind==='label').map(e=>e.text).sort(),['x','y']);
 }
});

test('default start name stays readable in the legend while custom coordinate names are retained',()=>{
 assert.match(legende.binario,/Via/u);
 const {items,state}=drawing('SIM-C1-L003-04',0,'binario');
 assert.equal(items.filter(e=>e.kind==='label'&&e.text==='Via').length,0);
 const paper=tavolo(2);meccanica.binario(paper,{...state,startLabel:'x₀ = 1/3 m'});
 assert.equal(paper.elementi.filter(e=>e.kind==='label'&&e.text==='x₀ = 1/3 m').length,1);
});
