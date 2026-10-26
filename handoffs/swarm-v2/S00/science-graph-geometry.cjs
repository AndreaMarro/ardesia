/** Executed in the page: inspect the actual projected scientific SVG shapes. */
module.exports=node=>{
 const svg=node.querySelector('svg'),box=node.getBoundingClientRect();
 const parts=svg?[...svg.querySelectorAll('path,ellipse,circle')]
  .filter(el=>['#a84b32','#2b6970','#565c69'].includes(el.getAttribute('stroke')))
  .map(el=>{const b=el.getBBox();return {id:el.id,x:b.x,y:b.y,width:b.width,height:b.height};}):[];
 return {width:box.width,height:box.height,svgWidth:svg?.getAttribute('width'),svgHeight:svg?.getAttribute('height'),parts,
  fitted:parts.length>=3&&Math.abs(Number(svg?.getAttribute('width'))-box.width)<2&&
   Math.abs(Number(svg?.getAttribute('height'))-box.height)<2&&
   parts.every(b=>b.x>=-8&&b.y>=-8&&b.x+b.width<=box.width+8&&b.y+b.height<=box.height+8)};
};
