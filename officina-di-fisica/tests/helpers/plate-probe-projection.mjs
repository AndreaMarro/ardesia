import * as T from '../../static/vendor/three-r180/three.module.min.js';
export function camera(spec,w,h,view='orbit'){
 const span=Math.max(spec.height,spec.width/(w/h));
 const c=new T.OrthographicCamera(-span*w/h/2,span*w/h/2,span/2,-span/2,.1,100);
 const target=new T.Vector3(...spec.target);
 const direction=new T.Vector3(...(view==='top'?[0,1,.00001]:view==='side'?[0,0,1]:spec.eye)).normalize();
 c.position.copy(target).addScaledVector(direction,14);c.up.set(0,1,0);c.lookAt(target);c.updateProjectionMatrix();c.updateMatrixWorld(true);return c;
}
function vertices(geometry,position,rotation,scale=[1,1,1]){
 const matrix=new T.Matrix4().compose(new T.Vector3(...position),rotation||new T.Quaternion(),new T.Vector3(...scale));
 const a=geometry.getAttribute('position');const out=[];
 // Geometry vertices are actualFloat32 buffers, not idealradius envelopes.
 for(let i=0;i<a.count;i++)out.push(new T.Vector3(a.getX(i),a.getY(i),a.getZ(i)).applyMatrix4(matrix));
 geometry.dispose();return out;
}
export function body(element){
 if(element.kind==='ball')return[...vertices(new T.SphereGeometry(element.r,24,16),element.p),...vertices(new T.SphereGeometry(1,24,16),element.p,undefined,[element.r,element.r,element.r])];
 if(element.kind==='box')return[...vertices(new T.BoxGeometry(...element.size),element.p),...vertices(new T.BoxGeometry(1,1,1),element.p,undefined,element.size)];
 if(element.kind==='rod'){
  const a=new T.Vector3(...element.a),b=new T.Vector3(...element.b),axis=b.clone().sub(a),length=axis.length();
  return vertices(new T.CylinderGeometry(element.r,element.r,length,32),a.lerp(b,.5).toArray(),new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),axis.normalize()));
 }
 if(element.kind==='arrow'){
  const a=new T.Vector3(...element.a),b=new T.Vector3(...element.b),d=b.clone().sub(a),length=d.length();
  const head=Math.min(.24,length*.32),axis=d.clone().normalize();
  const rotation=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),axis);
  const joint=b.clone().addScaledVector(axis,-head);
  return [
   ...vertices(new T.CylinderGeometry(.028,.028,length-head,32),a.clone().lerp(joint,.5).toArray(),rotation),
   ...vertices(new T.CylinderGeometry(0,.0812,head,32),joint.clone().lerp(b,.5).toArray(),rotation),
   ...vertices(new T.CylinderGeometry(1,1,1,32),a.clone().lerp(joint,.5).toArray(),rotation,[.028,length-head,.028]),
   ...vertices(new T.CylinderGeometry(0,1,1,32),joint.clone().lerp(b,.5).toArray(),rotation,[.0812,head,.0812]),
  ];
 }
 return [];
}
export function bounds(points,c){
 const p=points.map(v=>v.clone().project(c));
 return {lo:Math.min(...p.map(v=>v.x)),hi:Math.max(...p.map(v=>v.x)),bottom:Math.min(...p.map(v=>v.y)),top:Math.max(...p.map(v=>v.y))};
}
export function states(record){const a=record.control;return Array.from({length:Math.round((a.max-a.min)/a.step)+1},(_,i)=>a.min+i*a.step);}
