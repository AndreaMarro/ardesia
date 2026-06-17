
import CircuitSolver from '../../src/components/simulator/engine/CircuitSolver';
import { registerComponent } from '../../src/components/simulator/components/registry';
import BreadboardFull from '../../src/components/simulator/components/BreadboardFull';
import Battery9V from '../../src/components/simulator/components/Battery9V';
import Wire from '../../src/components/simulator/components/Wire';

// Minimal mock registry
const registry = new Map();
registerComponent.impl = (type, config) => { registry.set(type, config); };
// Monkey-patch registerComponent before import? No, node module structure.
// We will just assume the existing registry mock in unit test worked, 
// so let's reproduce the setup in a standalone way if possible, or just add logging to the test.

// Actually, let's just create a focused test file that logs the Union-Find state.
console.log("DEBUG: Investigating BreadboardFull net formation");

const bf = BreadboardFull;
const pins = bf.pins;
const nets = bf.getInternalConnections();

console.log("BreadboardFull pins count:", pins.length);
console.log("Bus plus pins check:", pins.find(p => p.id === 'bus-plus-1'));
console.log("Bus plus pins check:", pins.find(p => p.id === 'bus-plus-63'));

console.log("Nets count:", nets.length);
const busPlusNet = nets.find(n => n.id === 'net-bus-plus');
console.log("Bus plus net holes count:", busPlusNet ? busPlusNet.holes.length : 0);
if (busPlusNet) {
    console.log("First hole:", busPlusNet.holes[0]);
    console.log("Last hole:", busPlusNet.holes[busPlusNet.holes.length - 1]);
}

// Check for mismatches
const pinIds = new Set(pins.map(p => p.id));
let missing = 0;
if (busPlusNet) {
    busPlusNet.holes.forEach(h => {
        if (!pinIds.has(h)) {
            console.log("Missing pin for hole:", h);
            missing++;
        }
    });
}
console.log("Missing pins in net:", missing);
