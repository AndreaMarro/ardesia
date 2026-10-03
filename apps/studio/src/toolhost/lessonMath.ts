/** Exact AST → native MathML. This module formats supplied expressions; it never solves a circuit. */
type Q={n:bigint;d:bigint};
type Expr={kind:'number';coefficients:string[]}|{kind:'symbol';name:string}|{kind:'add'|'multiply';args:Expr[]}|{kind:'divide';numerator:Expr;denominator:Expr};
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const row=(s:string)=>`<mrow>${s}</mrow>`;
const op=(s:string)=>`<mo>${s}</mo>`;
const parentheses=(s:string)=>row(op('(')+s+op(')'));
const abs=(v:bigint)=>v<0n?-v:v;
function q(n:bigint,d=1n):Q{
 if(!d)throw new Error('Denominatore nullo.');
 if(d<0n){n=-n;d=-d;}
 let a=abs(n),b=d;while(b){[a,b]=[b,a%b];}
 return {n:n/a,d:d/a};
}
function fraction(value:string):Q{
 if(typeof value!=='string'||value.length>400||!/^[-+]?\d+(?:\/[1-9]\d*)?$/.test(value))throw new Error('Coefficiente non valido.');
 const [n,d='1']=value.split('/');return q(BigInt(n),BigInt(d));
}
const add=(a:Q,b:Q)=>q(a.n*b.d+b.n*a.d,a.d*b.d);
const half=(a:Q)=>q(a.n,a.d*2n);
const positive=(a:Q)=>q(abs(a.n),a.d);
function rational(a:Q):string{
 const sign=a.n<0n?op('−'):'';
 return sign+(a.d===1n?`<mn>${abs(a.n)}</mn>`:`<mfrac><mn>${abs(a.n)}</mn><mn>${a.d}</mn></mfrac>`);
}
function radical(a:Q,b:Q):string{
 let out=a.n?rational(a):'';
 if(b.n){
  if(out)out+=op(b.n<0n?'−':'+');else if(b.n<0n)out+=op('−');
  const coefficient=positive(b);
  out+=(coefficient.n===coefficient.d?'':rational(coefficient))+`<msqrt><mn>3</mn></msqrt>`;
 }
 return out||'<mn>0</mn>';
}
function number(coefficients:string[]):string{
 const [a,b,c,d]=coefficients.map(fraction);
 const re=[add(a,half(c)),half(b)],im=[add(d,half(b)),half(c)];
 const hasReal=re.some(x=>x.n!==0n),hasImag=im.some(x=>x.n!==0n);
 if(!hasImag)return radical(re[0],re[1]);
 const negative=im[0].n<0n&&!im[1].n||im[1].n<0n&&!im[0].n;
 const ia=negative?q(-im[0].n,im[0].d):im[0],ib=negative?q(-im[1].n,im[1].d):im[1];
 const imag=ia.n===ia.d&&!ib.n?'<mi>j</mi>':'<mi>j</mi>'+(ia.n&&ib.n?parentheses(radical(ia,ib)):radical(ia,ib));
 return (hasReal?radical(re[0],re[1])+op(negative?'−':'+'):negative?op('−'):'')+imag;
}
function validate(value:unknown,depth=0,budget={nodes:0}):Expr{
 if(depth>32||++budget.nodes>4000||!value||typeof value!=='object'||Array.isArray(value))throw new Error('Espressione non valida.');
 const v=value as Record<string,unknown>;
 if(v.kind==='number'&&Array.isArray(v.coefficients)&&v.coefficients.length===4){v.coefficients.forEach(x=>fraction(x as string));return {kind:'number',coefficients:v.coefficients as string[]};}
 if(v.kind==='symbol'&&typeof v.name==='string'&&v.name.length<=160)return {kind:'symbol',name:v.name};
 if((v.kind==='add'||v.kind==='multiply')&&Array.isArray(v.args)&&v.args.length<=256)return {kind:v.kind,args:v.args.map(x=>validate(x,depth+1,budget))};
 if(v.kind==='divide')return {kind:'divide',numerator:validate(v.numerator,depth+1,budget),denominator:validate(v.denominator,depth+1,budget)};
 throw new Error('Espressione non valida.');
}
function scalar(expr:Expr,value:bigint):boolean{
 return expr.kind==='number'&&expr.coefficients.every((v,i)=>{const r=fraction(v);return r.n===(i===0?value*r.d:0n);});
}
function negativeTerm(expr:Expr):Expr|null{
 if(expr.kind==='multiply'){
  let negative=false;
  const args=expr.args.map(x=>{const neg=negativeTerm(x);if(neg)negative=!negative;return neg??x;});
  if(negative)return {kind:'multiply',args};
 }
 if(expr.kind==='number'&&expr.coefficients.slice(1).every(v=>fraction(v).n===0n)&&fraction(expr.coefficients[0]).n<0n)
  return {kind:'number',coefficients:[expr.coefficients[0].replace(/^-/,'').replace(/^\+/,'') ,'0','0','0']};
 return null;
}
function expression(expr:Expr):string{
 switch(expr.kind){
  case 'number':return row(number(expr.coefficients));
  case 'symbol':{
   const match=/^([VI])\((.+)\)$/.exec(expr.name);
   return match?`<msub><mi>${match[1]}</mi><mtext>${escape(match[2])}</mtext></msub>`:`<mi>${escape(expr.name)}</mi>`;
  }
  case 'divide':return `<mfrac>${row(expression(expr.numerator))}${row(expression(expr.denominator))}</mfrac>`;
  case 'add':return row(expr.args.map((x,i)=>{
   const neg=negativeTerm(x);return (neg?op('−'):i?op('+'):'')+expression(neg??x);
  }).join('')||'<mn>0</mn>');
  case 'multiply':{
   let negative=false;
   const args=expr.args.map(x=>{const neg=negativeTerm(x);if(neg)negative=!negative;return neg??x;}).filter(x=>!scalar(x,1n));
   return row((negative?op('−'):'')+(args.map(x=>{
    const grouped=x.kind==='add'||x.kind==='number'&&x.coefficients.slice(1).some(v=>fraction(v).n!==0n);
    return grouped?parentheses(expression(x)):expression(x);
   }).join(op('·'))||'<mn>1</mn>'));
  }
 }
}
/** Invalid AST falls back to the supplied plain equations in each caller. */
export function lessonExpressionMarkup(value:unknown):string|null{
 try{return `<math xmlns="http://www.w3.org/1998/Math/MathML">${expression(validate(value))}</math>`;}catch{return null;}
}
export function lessonMathMarkup(value:unknown):string|null{
 try{
  if(!Array.isArray(value)||!value.length||value.length>256)return null;
  return value.map(raw=>{
   if(!raw||typeof raw!=='object'||raw.kind!=='equation'||raw.label!==undefined&&(typeof raw.label!=='string'||raw.label.length>160)||raw.unit!==undefined&&(typeof raw.unit!=='string'||raw.unit.length>40))throw new Error('Equazione non valida.');
   const left=validate(raw.left),right=validate(raw.right);
   return `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">${row((raw.label?`<mtext>${escape(raw.label)}: </mtext>`:'')+expression(left)+op('=')+expression(right)+(raw.unit?`<mspace width="0.4em"/><mtext>${escape(raw.unit)}</mtext>`:''))}</math>`;
  }).join('');
 }catch{return null;}
}
