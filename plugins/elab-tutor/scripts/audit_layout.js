import fs from 'fs';
import path from 'path';

// Load files simply by reading exports
const readExperiments = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Simple regex extraction since we know the exact export format
    // We'll extract the JSON-like object by taking everything after "const EXPERIMENTS_VOL" or "export const" up to the end.
    // Actually, we can just use dynamic import if we run this script with `node` and the project is ESM.
    return filePath;
};

async function run() {
    console.log('Auditing experiments for layout overlaps and weird crossings...');

    // Simple static config for sizes
    const SIZES = {
        'breadboard-half': { w: 171.5, h: 228.6 }, // Actually rotated? No, width is 262px, height 175px (horizontal)
        'nano-r4': { w: 139.5, h: 99 },
        'arduino-r3': { w: 200, h: 140 },
        'resistor': { w: 52.5, h: 10 },
        'led': { w: 10, h: 10 },
        'push-button': { w: 30, h: 15 },
        'potentiometer': { w: 20, h: 30 },
        'servo': { w: 50, h: 40 },
        'lcd16x2': { w: 142, h: 60 }
    };

    try {
        const vol1 = (await import('../src/data/experiments-vol1.js')).default;
        const vol2 = (await import('../src/data/experiments-vol2.js')).default;
        const vol3 = (await import('../src/data/experiments-vol3.js')).default;

        const allVols = [vol1, vol2, vol3];

        for (const vol of allVols) {
            if (!vol || !vol.experiments) continue;
            console.log(`\\n--- Checking ${vol.title || 'Volume'} ---`);

            for (const exp of vol.experiments) {
                let issues = [];

                const layout = exp.layout || {};
                const connections = exp.connections || [];
                const components = exp.components || [];

                // 1. Check for overlapping bounding boxes among components
                for (let i = 0; i < components.length; i++) {
                    for (let j = i + 1; j < components.length; j++) {
                        const compA = components[i];
                        const compB = components[j];
                        const posA = layout[compA.id];
                        const posB = layout[compB.id];
                        if (!posA || !posB) continue;

                        // Simplified collision check - we assume components have standard sizes
                        const sizeA = SIZES[compA.type] || { w: 20, h: 20 };
                        const sizeB = SIZES[compB.type] || { w: 20, h: 20 };

                        const overlapX = posA.x < posB.x + sizeB.w && posA.x + sizeA.w > posB.x;
                        const overlapY = posA.y < posB.y + sizeB.h && posA.y + sizeA.h > posB.y;

                        // Breadboards and Arduinos are allowed to overlap in Vol3 (Nano on Breadboard)
                        const isNanoBb = (compA.type.includes('nano') && compB.type.includes('breadboard')) ||
                            (compB.type.includes('nano') && compA.type.includes('breadboard'));

                        if (overlapX && overlapY && !isNanoBb) {
                            issues.push(`Overlap between ${compA.id} (${compA.type}) and ${compB.id} (${compB.type}) at ${posA.x},${posA.y} vs ${posB.x},${posB.y}`);
                        }
                    }
                }

                // 2. Wires routing under Nano R4
                // The top gutter of a breadboard is y = bb1.y + 43.75 - 8 = bb1.y + 35.75
                // Nano R4 body spans from y=10 to y=109 in Vol3, covering the top gutter.
                // If a wire routes from Nano D-pins to the breadboard, it enters the top gutter.
                // Is this wire hidden by the Nano? Yes! SVG draws wires before components.
                // Let's flag any wire from Nano to Breadboard top rows (a-e).

                for (const conn of connections) {
                    if (conn.from.includes('nano') || conn.to.includes('nano')) {
                        const nanoPin = conn.from.includes('nano') ? conn.from : conn.to;
                        const otherPin = conn.from.includes('nano') ? conn.to : conn.from;

                        // Check if the other pin is on the top half of the breadboard (rows a,b,c,d,e)
                        if (otherPin.match(/bb\d+:[a-e]\d+/)) {
                            // The wire routes through the top gutter, which is covered by Nano!
                            issues.push(`Warning: Wire ${conn.from} -> ${conn.to} routes through the top gutter under the Nano R4, potentially obscuring it visually!`);
                        }
                    }
                }

                if (issues.length > 0) {
                    console.log(`[${exp.id}] ${exp.title} has ${issues.length} potential issues:`);
                    issues.forEach(i => console.log(`  - ${i}`));
                }
            }
        }
    } catch (e) {
        console.error("Script failed to run: ", e);
    }
}

run();
