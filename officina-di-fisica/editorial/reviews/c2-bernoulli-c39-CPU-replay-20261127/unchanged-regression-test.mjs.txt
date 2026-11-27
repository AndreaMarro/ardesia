import test from 'node:test';import assert from 'node:assert/strict';import {experiments} from '../../../static/js/banchi/voci/modelli/C2.js';
const s=experiments['SIM-C2-L006-03'].apparatus(1,2);
test('equal physical areas and speeds have equal displayed section-speed vectors',()=>{assert.equal(s.r1,s.r2);assert.equal(s.v2/s.v1,1);});
test('no contraction and equal physical speeds have no ideal pressure-column drop',()=>{assert.equal(.24*(s.v1*s.v1-s.v2*s.v2),0);});
