import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import cytoscape from './package/dist/cytoscape.esm.mjs';
const started=performance.now();
const elements=[
 {data:{id:'lesson:one',label:'Prima lezione'}},
 {data:{id:'lesson:two',label:'Seconda lezione'}},
 {data:{id:'source:one',label:'Fonte esatta'}},
 {data:{id:'review:one',label:'Review pubblicata'}},
 {data:{id:'e1',source:'lesson:two',target:'lesson:one'}},
 {data:{id:'e2',source:'lesson:one',target:'source:one'}},
 {data:{id:'e3',source:'source:one',target:'review:one'}}];
const cy=cytoscape({headless:true,elements,layout:{name:'breadthfirst'},minZoom:.2,maxZoom:4});
assert.equal(cytoscape.version,'3.34.0');
assert.equal(cy.getElementById('lesson:one').closedNeighborhood().nodes().length,3);
const paths=cy.elements().dijkstra({root:cy.getElementById('lesson:two'),directed:false});
assert.equal(paths.distanceTo(cy.getElementById('review:one')),3);
assert.deepEqual(paths.pathTo(cy.getElementById('review:one')).nodes().map(n=>n.id()),['lesson:two','lesson:one','source:one','review:one']);
const grid=cy.layout({name:'grid',animate:false,boundingBox:{x1:0,y1:0,w:800,h:500}});grid.run();
assert.ok(cy.nodes().every(n=>Number.isFinite(n.position('x'))&&Number.isFinite(n.position('y'))));
cy.nodes().positions((_,i)=>({x:50+i*100,y:80+i*40}));cy.zoom(1.5);cy.pan({x:22,y:33});
const state={positions:cy.nodes().map(n=>({id:n.id(),...n.position()})),zoom:cy.zoom(),pan:cy.pan()};
const reopened=cytoscape({headless:true,elements,layout:{name:'preset'},minZoom:.2,maxZoom:4});
for(const position of state.positions)reopened.getElementById(position.id).position({x:position.x,y:position.y});
reopened.zoom(state.zoom);reopened.pan(state.pan);
assert.deepEqual(reopened.getElementById('lesson:two').position(),{x:150,y:120});
assert.equal(reopened.zoom(),1.5);assert.deepEqual(reopened.pan(),{x:22,y:33});
reopened.getElementById('source:one').remove();
assert.equal(reopened.edges().length,1);
const after=reopened.elements().dijkstra({root:reopened.getElementById('lesson:two'),directed:false});
assert.equal(after.distanceTo(reopened.getElementById('review:one')),Infinity);
cy.destroy();reopened.destroy();assert.ok(cy.destroyed()&&reopened.destroyed());
console.log(JSON.stringify({version:cytoscape.version,checks:9,result:'PASS',elapsedMs:performance.now()-started,
 scope:'actual distributed ESM, headless graph algorithms/layout/state/removal/destroy; no canvas/browser assertion'}));
