
import { describe, it, expect } from 'vitest';
import BreadboardFull from '../../src/components/simulator/components/BreadboardFull';

describe('BreadboardFull Debug', () => {
    it('should have consistent pins and nets', () => {
        const bf = BreadboardFull;
        const pins = bf.pins;
        const nets = bf.getInternalConnections();

        console.log("BreadboardFull pins count:", pins.length);

        const bp1 = pins.find(p => p.id === 'bus-plus-1');
        const bp63 = pins.find(p => p.id === 'bus-plus-63');
        console.log("Bus plus 1 found:", !!bp1);
        console.log("Bus plus 63 found:", !!bp63);

        const busPlusNet = nets.find(n => n.id === 'net-bus-plus');
        console.log("Bus plus net holes count:", busPlusNet ? busPlusNet.holes.length : 0);

        if (busPlusNet) {
            console.log("First hole:", busPlusNet.holes[0]);
            console.log("Last hole:", busPlusNet.holes[busPlusNet.holes.length - 1]);

            const pinIds = new Set(pins.map(p => p.id));
            busPlusNet.holes.forEach(h => {
                if (!pinIds.has(h)) {
                    console.log("Missing pin for hole:", h);
                }
            });
        }
    });
});
