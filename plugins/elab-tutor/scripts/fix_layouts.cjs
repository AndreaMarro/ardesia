const fs = require('fs');
const path = require('path');

const BB_HOLE_PITCH = 7.5;
const BB_PAD_X = 14;
const ROW_Y = {
    a: 57, b: 64.15, c: 71.3, d: 78.45, e: 85.6,
    f: 104.5, g: 111.65, h: 118.8, i: 125.95, j: 133.1
};

// Returns center point x, y for a given component based on its pin assignments
function calculateOptimalLayout(comp, pinAssignments, bbX, bbY) {
    let pins = [];
    for (const [key, val] of Object.entries(pinAssignments)) {
        if (key.startsWith(comp.id + ':')) {
            const pinId = val.split(':')[1];
            if (/^[a-j]\d+$/.test(pinId)) {
                const row = pinId.charAt(0);
                const col = parseInt(pinId.substring(1));
                pins.push({
                    x: bbX + BB_PAD_X + (col - 1) * BB_HOLE_PITCH,
                    y: bbY + ROW_Y[row]
                });
            }
        }
    }

    if (pins.length === 0) return null;

    // Average X
    const targetX = pins.reduce((sum, p) => sum + p.x, 0) / pins.length;

    // Y logic depends on component type
    let targetY = pins.reduce((sum, p) => sum + p.y, 0) / pins.length;

    if (comp.type === 'rgb-led') {
        targetY = targetY - 22.5;
    } else if (comp.type === 'led') {
        targetY = targetY - 14;
    } else if (comp.type === 'resistor') {
        // pin1 and pin2 average is center
    } else if (comp.type === 'potentiometer') {
        targetY = targetY - 9;
    } else if (comp.type === 'lcd-16x2') {
        // Top-left vs Center? Let's check LCD pins
        // Usually pins are at top or bottom. We'll adjust manually if needed.
        targetY = targetY - 20;
    }

    return { x: Number(targetX.toFixed(2)), y: Number(targetY.toFixed(2)) };
}


const lcdPins = {
    "lcd1:vss": "bb1:j1",
    "lcd1:vdd": "bb1:j2",
    "lcd1:v0": "bb1:j3",
    "lcd1:rs": "bb1:j4",
    "lcd1:rw": "bb1:j5",
    "lcd1:e": "bb1:j6",
    "lcd1:d0": "bb1:j7",
    "lcd1:d1": "bb1:j8",
    "lcd1:d2": "bb1:j9",
    "lcd1:d3": "bb1:j10",
    "lcd1:d4": "bb1:j11",
    "lcd1:d5": "bb1:j12",
    "lcd1:d6": "bb1:j13",
    "lcd1:d7": "bb1:j14",
    "lcd1:a": "bb1:j15",
    "lcd1:k": "bb1:j16",
    "pot1:vcc": "bb1:g12",
    "pot1:signal": "bb1:g13",
    "pot1:gnd": "bb1:g14",
    "r1:pin1": "bb1:f15",
    "r1:pin2": "bb1:f23"
};

const lcdComponents = [
    { type: "lcd-16x2", id: "lcd1" },
    { type: "potentiometer", id: "pot1", value: 10000 },
    { type: "resistor", id: "r1", value: 220 }
];

console.log("Calculated Layout for LCD Hello:");
const bb1 = { x: 80, y: 150 }; // Assuming BB is at 150 Y 
lcdComponents.forEach(comp => {
    const coords = calculateOptimalLayout(comp, lcdPins, bb1.x, bb1.y);
    console.log(`        "${comp.id}": { x: ${coords ? coords.x : 0}, y: ${coords ? coords.y : 0} },`);
});

