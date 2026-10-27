import {expect,test} from 'vitest';
import {createMemoryGraph,connectionPath,focusNeighborhood,restoreGraphView,captureGraphView} from './graphAdapter';
import type {MemoryPacket} from './model';
const packet:MemoryPacket={notes:[],limits:[],nodes:[
 {id:'note:first',kind:'note',label:'Prima lezione'},
 {id:'note:second',kind:'note',label:'Seconda lezione'},
 {id:'source:exact',kind:'source',label:'Fonte originale'},
 {id:'review:one',kind:'review',label:'Review pubblicata'},
 {id:'other',kind:'note',label:'Idea separata'}],edges:[
 {source:'note:second',target:'note:first',relation:'links_to'},
 {source:'note:first',target:'source:exact',relation:'cites'},
 {source:'source:exact',target:'review:one',relation:'reviewed_by'}]};

test('uses the acquired graph to find the connection between lessons and a review',()=>{
 const cy=createMemoryGraph(packet);
 try{expect(connectionPath(cy,'note:second','review:one')).toEqual(['note:second','note:first','source:exact','review:one']);
 expect(connectionPath(cy,'note:second','other')).toEqual([]);
 expect(connectionPath(cy,'note:second','private-peer-id')).toEqual([]);}finally{cy.destroy();}
});
test('focus keeps the selected node and its real neighbors and can reset',()=>{
 const cy=createMemoryGraph(packet);
 try{expect(focusNeighborhood(cy,'note:first').sort()).toEqual(['note:first','note:second','source:exact']);
 expect(cy.getElementById('other').hasClass('outside')).toBe(true);
 focusNeighborhood(cy,null);expect(cy.elements('.outside').length).toBe(0);}finally{cy.destroy();}
});
test('restores coordinates only, without injecting snapshot data or foreign nodes',()=>{
 const cy=createMemoryGraph(packet);
 try{restoreGraphView(cy,{version:2,layout:'grid',positions:[{id:'note:first',x:100,y:200},
   {id:'private-peer-id',x:10,y:10}],zoom:1.5,pan:{x:22,y:33}});
 expect(cy.getElementById('note:first').position()).toEqual({x:100,y:200});
 expect(cy.getElementById('private-peer-id').length).toBe(0);
 expect(captureGraphView(cy,'grid',2).zoom).toBe(1.5);
 expect(captureGraphView(cy,'grid',2).pan).toEqual({x:22,y:33});}finally{cy.destroy();}
});
test('rejects invalid endpoints and never links to an object outside the server projection',()=>{
 const cy=createMemoryGraph({...packet,edges:[...packet.edges,{source:'note:first',target:'secret',relation:'cites'}]});
 try{expect(cy.nodes().length).toBe(5);expect(cy.edges().length).toBe(3);
 expect(connectionPath(cy,'note:first','secret')).toEqual([]);}finally{cy.destroy();}
});
test('a replacement projection cannot retain removed labels, source data or paths',()=>{
 const old=createMemoryGraph(packet);old.destroy();
 const current=createMemoryGraph({...packet,nodes:packet.nodes.filter(n=>n.id!=='source:exact'),
   edges:packet.edges.filter(e=>e.source!=='source:exact'&&e.target!=='source:exact')});
 try{expect(JSON.stringify(current.json())).not.toContain('Fonte originale');
 expect(connectionPath(current,'note:first','review:one')).toEqual([]);
 expect(old.destroyed()).toBe(true);}finally{current.destroy();}
});
