import cytoscape,{type Core,type ElementDefinition,type StylesheetJson} from './vendor/cytoscape-3.34.0/cytoscape.mjs';
import type {GraphView,MemoryPacket} from './model';

const styles:StylesheetJson=[
 {selector:'node',style:{label:'data(label)',width:124,height:48,shape:'round-rectangle',
  'background-color':'#e8ece3','border-color':'#355d4e','border-width':1,'font-size':13,
  color:'#202b2b','text-valign':'center','text-halign':'center','text-wrap':'wrap','text-max-width':'112px'}},
 {selector:'node[kind="source"]',style:{'background-color':'#fff1d8','border-color':'#986a32'}},
 {selector:'node[kind="concept"]',style:{shape:'ellipse','background-color':'#e5eaf5','border-color':'#64769b'}},
 {selector:'node[kind="review"],node[kind="observation"]',style:{'background-color':'#f4e8e2','border-color':'#a44932'}},
 {selector:'edge',style:{width:1.5,'line-color':'#9aa79d','target-arrow-color':'#9aa79d',
  'target-arrow-shape':'triangle','curve-style':'bezier'}},
 {selector:'.outside',style:{opacity:.15}},
 {selector:'.connection',style:{'line-color':'#3155a1','target-arrow-color':'#3155a1','border-color':'#3155a1','border-width':3}},
 {selector:'edge.connection',style:{width:3}},
 {selector:'node:selected',style:{'border-width':3,'border-color':'#a44932'}},
];

export function createMemoryGraph(packet:MemoryPacket,container?:HTMLElement):Core {
 const ids=new Set<string>(),elements:ElementDefinition[]=[];
 for(const node of packet.nodes){
  if(!node.id||ids.has(node.id))continue;
  ids.add(node.id);elements.push({data:{id:node.id,label:node.label,kind:node.kind}});
 }
 packet.edges.forEach((edge,index)=>{
  if(!ids.has(edge.source)||!ids.has(edge.target))return;
  let id='__memory_relation:'+index;while(ids.has(id))id='_'+id;ids.add(id);
  elements.push({data:{id,source:edge.source,target:edge.target,relation:edge.relation}});
 });
 return cytoscape({container,elements,headless:!container,styleEnabled:Boolean(container),
  style:container?styles:undefined,layout:{name:'grid',animate:false},minZoom:.2,maxZoom:4,
  boxSelectionEnabled:false});
}

export function connectionPath(cy:Core,from:string,to:string):string[] {
 cy.elements().removeClass('connection');
 const root=cy.getElementById(from),target=cy.getElementById(to);
 if(root.empty()||target.empty()||!root.isNode()||!target.isNode())return [];
 const result=cy.elements().dijkstra({root,directed:false});
 if(!Number.isFinite(result.distanceTo(target)))return [];
 const path=result.pathTo(target);path.addClass('connection');
 return path.nodes().map(node=>node.id());
}

export function focusNeighborhood(cy:Core,id:string|null):string[] {
 cy.elements().removeClass('outside');
 if(id===null)return cy.nodes().map(node=>node.id());
 const node=cy.getElementById(id);if(node.empty()||!node.isNode())return [];
 const neighborhood=node.closedNeighborhood();
 cy.elements().difference(neighborhood).addClass('outside');
 return neighborhood.nodes().map(item=>item.id());
}

export function arrangeGraph(cy:Core,layout:GraphView['layout']) {
 cy.layout({name:layout,animate:false,padding:32,spacingFactor:1.4,
  boundingBox:!cy.container()?{x1:0,y1:0,w:900,h:620}:undefined}).run();
}

export function restoreGraphView(cy:Core,view:GraphView) {
 for(const point of view.positions){
  const node=cy.getElementById(point.id);
  if(node.isNode()&&Number.isFinite(point.x)&&Number.isFinite(point.y))
   node.position({x:point.x,y:point.y}); // Never pass arbitrary snapshot fields to position().
 }
 if(Number.isFinite(view.zoom)&&view.zoom>=.2&&view.zoom<=4)cy.zoom(view.zoom);
 if(Number.isFinite(view.pan.x)&&Number.isFinite(view.pan.y))cy.pan({x:view.pan.x,y:view.pan.y});
}

export function captureGraphView(cy:Core,layout:GraphView['layout'],expectedVersion:number) {
 const pan=cy.pan();
 return {expectedVersion,layout,positions:cy.nodes().map(node=>{
  const point=node.position();return {id:node.id(),x:point.x,y:point.y};
 }),zoom:cy.zoom(),pan:{x:pan.x,y:pan.y}};
}
