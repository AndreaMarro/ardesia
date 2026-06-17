# Wokwi Custom Board Format Research
**Research Date**: February 9, 2026
**Objective**: Understand custom board format for creating Arduino Nano R4 visual board with AVR emulation

---

## Overview

Wokwi supports custom boards through two files:
1. **board.json** - Pin mappings, metadata, dimensions, LEDs
2. **board.svg** - Visual representation of the board

These files work together to create a custom hardware definition that can be loaded into any Wokwi project.

---

## 1. board.json Schema

### Complete Structure
Based on ESP32 DevKit V1 example from [wokwi-boards repository](https://github.com/wokwi/wokwi-boards/blob/main/boards/esp32-devkit-v1/board.json):

```json
{
  "name": "ESP32 DevKit V1",
  "version": 1,
  "description": "A common ESP32 dev board by DOIT",
  "author": "Uri Shaked",
  "mcu": "esp32",
  "fqbn": "esp32:esp32:esp32doit-devkit-v1",
  "width": 28.2,
  "height": 53,
  "pins": {
    "EN": { "x": 1.27, "y": 3.17, "target": "EN" },
    "VN": { "x": 1.27, "y": 5.71, "target": "GPIO36" },
    "D34": { "x": 1.27, "y": 10.79, "target": "GPIO34" },
    "GND.2": { "x": 1.27, "y": 43.69, "target": "GND" },
    "VIN": { "x": 1.27, "y": 46.23, "target": "power(5V)" },
    "3V3": { "x": 26.8, "y": 3.17, "target": "power(3.3V)" },
    "D23": { "x": 26.8, "y": 49.3, "target": "GPIO23" }
  },
  "leds": [
    {
      "id": "power",
      "x": 23,
      "y": 30,
      "type": "0603",
      "color": "red",
      "pins": {
        "A": "3V3",
        "C": "GND.1"
      }
    },
    {
      "id": "led2",
      "x": 23,
      "y": 35,
      "type": "0603",
      "color": "blue",
      "pins": {
        "A": "GPIO2",
        "C": "GND.1"
      }
    }
  ]
}
```

### Schema Fields

#### Core Metadata
- **name** (string, required): Display name of the board
- **version** (number, required): Schema version, increment when making changes
- **description** (string, optional): Board description
- **author** (string, optional): Board creator name
- **mcu** (string, required): MCU type (`esp32`, `atmega328p`, `attiny85`, etc.)
- **fqbn** (string, required): Fully Qualified Board Name for Arduino CLI
  - Format: `{vendor}:{architecture}:{board_id}`
  - Examples:
    - `arduino:avr:nano` - Arduino Nano
    - `esp32:esp32:esp32doit-devkit-v1` - ESP32 DevKit

#### Physical Dimensions
- **width** (number, required): Board width in millimeters
- **height** (number, required): Board height in millimeters

#### Pin Definitions
**pins** (object, required): Maps board label to physical location and MCU target

Each pin entry format:
```json
"LABEL": {
  "x": 1.27,           // X coordinate in mm from top-left
  "y": 5.71,           // Y coordinate in mm from top-left
  "target": "GPIO36"   // MCU pin or special target
}
```

**Target Types**:
- **GPIO pins**: `GPIO36`, `GPIO2`, etc.
- **Ground**: `"GND"`
- **Power**: `"power(5V)"`, `"power(3.3V)"`
- **Special**: `"EN"`, `"RESET"`, etc.

**Pin Naming Convention**:
- Use `.1`, `.2` suffix for multiple GND pins: `"GND.1"`, `"GND.2"`
- Pin labels should match what's printed on the physical board

#### LED Definitions
**leds** (array, optional): Onboard LEDs with position and connections

Each LED entry format:
```json
{
  "id": "power",           // Unique identifier
  "x": 23,                 // X coordinate in mm (center of LED)
  "y": 30,                 // Y coordinate in mm (center of LED)
  "type": "0603",          // LED type
  "color": "red",          // LED color (for 0603 type)
  "pins": {                // Electrical connections
    "A": "3V3",            // Anode connection
    "C": "GND.1"           // Cathode connection
  }
}
```

**LED Types**:
- **`0603`**: Standard SMD LED (requires `color` field)
  - Colors: `red`, `green`, `blue`, `yellow`, `orange`, `white`
  - Pins: `A` (anode), `C` (cathode)
- **`ws2812`**: Addressable RGB LED (NeoPixel)
  - Pins: `DI` (data in), `GND`, `VCC`
- **`apa102`**: Addressable RGB LED with clock
  - Pins: `DI` (data in), `CI` (clock in), `GND`, `VCC`
- **`rgb`**: Generic RGB LED
  - Pins: `R`, `G`, `B`, `A` (common anode) or `C` (common cathode)

---

## 2. board.svg Format

### Structure
Based on ESP32 DevKit V1 example, the SVG uses **pattern-based rendering** rather than individual elements for each pin.

### Pin Pattern Definition
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="28.2mm" height="53mm" viewBox="0 0 28.2 53">
  <defs>
    <pattern id="pin-pattern" height="2.54mm" width="2.54mm" patternUnits="userSpaceOnUse">
      <circle fill="#9a916c" cx="1.27mm" cy="1.27mm" r="1mm" />
      <circle fill="white" cx="1.27mm" cy="1.27mm" r="0.6mm" />
    </pattern>
  </defs>

  <!-- Left pin row -->
  <rect transform="translate(0, 17.12)" width="2.54mm" height="38.1mm"
        fill="url(#pin-pattern)" />

  <!-- Right pin row -->
  <rect transform="translate(25.66, 17.12)" width="2.54mm" height="38.1mm"
        fill="url(#pin-pattern)" />

  <!-- Pin labels -->
  <text x="4" y="5" style="font-size: 2px; fill: white;">EN</text>
  <text x="4" y="8" style="font-size: 2px; fill: white;">VN</text>
  <!-- ... more labels ... -->
</svg>
```

### Key Characteristics
- **Coordinate System**: Millimeters, origin at top-left
- **Pin Spacing**: Standard 2.54mm (0.1-inch) pitch
- **Pin Rendering**: Concentric circles pattern
  - Outer circle: Brown (`#9a916c`), 1mm radius
  - Inner circle: White, 0.6mm radius
- **Text Labels**: Positioned separately using `<text>` elements
- **Dimensions**: SVG `width` and `height` must match `board.json` dimensions

### SVG Requirements
1. Root SVG element must specify width/height in mm
2. ViewBox should match physical dimensions
3. Pins rendered as rectangular areas filled with repeating pattern
4. Use `transform="translate(x, y)"` for positioning pin rows
5. Text labels use small font sizes (typically 2px for readability at scale)

### Important Notes
- **No Individual Pin Elements**: Wokwi doesn't use `data-pin` attributes on circles
- **Pattern-Based**: Pins are drawn as repeating patterns in rectangular regions
- **Coordinate Mapping**: Pin positions in `board.json` determine click/connection areas
- **Visual Only**: SVG is for display; `board.json` handles electrical connections

---

## 3. Using Custom Boards in diagram.json

### Basic Template
```json
{
  "version": 1,
  "author": "Ambitious maker",
  "editor": "wokwi",
  "parts": [
    {
      "type": "wokwi-custom-board",
      "id": "board"
    }
  ],
  "connections": []
}
```

### Loading Custom Board
From [wokwi-boards README](https://github.com/wokwi/wokwi-boards/blob/main/README.md):

1. Create a new project on wokwi.com
2. Press F1 and select "Load custom board file..."
3. Select directory containing `board.json` and `board.svg`
4. Check browser console for errors
5. Test pin connections and simulation

### Connection Format
Once loaded, connect components using standard syntax:
```json
{
  "connections": [
    ["board:D2", "led1:A", "green", []],
    ["board:GND.1", "led1:C", "black", []]
  ]
}
```

Connection format: `["sourceId:pinName", "targetId:pinName", "color", []]`

---

## 4. Creating Arduino Nano R4 Custom Board

### Strategy
To create a board that **looks like** Arduino Nano R4 but uses **AVR emulation**:

#### board.json Configuration
```json
{
  "name": "Arduino Nano R4 (AVR Compatible)",
  "version": 1,
  "description": "Custom board with Nano R4 appearance, AVR emulation",
  "author": "Andrea Marro - ELAB",
  "mcu": "atmega328p",
  "fqbn": "arduino:avr:nano",
  "width": 18,
  "height": 45,
  "pins": {
    "D13": { "x": 1.27, "y": 5, "target": "GPIO13" },
    "D12": { "x": 1.27, "y": 7.54, "target": "GPIO12" },
    "D11": { "x": 1.27, "y": 10.08, "target": "GPIO11" },
    "D10": { "x": 1.27, "y": 12.62, "target": "GPIO10" },
    "D9": { "x": 1.27, "y": 15.16, "target": "GPIO9" },
    "D8": { "x": 1.27, "y": 17.7, "target": "GPIO8" },
    "D7": { "x": 1.27, "y": 20.24, "target": "GPIO7" },
    "D6": { "x": 1.27, "y": 22.78, "target": "GPIO6" },
    "D5": { "x": 1.27, "y": 25.32, "target": "GPIO5" },
    "D4": { "x": 1.27, "y": 27.86, "target": "GPIO4" },
    "D3": { "x": 1.27, "y": 30.4, "target": "GPIO3" },
    "D2": { "x": 1.27, "y": 32.94, "target": "GPIO2" },
    "GND.1": { "x": 1.27, "y": 35.48, "target": "GND" },
    "RST": { "x": 1.27, "y": 38.02, "target": "RESET" },
    "RX": { "x": 1.27, "y": 40.56, "target": "GPIO0" },
    "TX": { "x": 1.27, "y": 43.1, "target": "GPIO1" },

    "D12": { "x": 16.73, "y": 5, "target": "GPIO12" },
    "D13": { "x": 16.73, "y": 7.54, "target": "GPIO13" },
    "3V3": { "x": 16.73, "y": 10.08, "target": "power(3.3V)" },
    "REF": { "x": 16.73, "y": 12.62, "target": "AREF" },
    "A0": { "x": 16.73, "y": 15.16, "target": "A0" },
    "A1": { "x": 16.73, "y": 17.7, "target": "A1" },
    "A2": { "x": 16.73, "y": 20.24, "target": "A2" },
    "A3": { "x": 16.73, "y": 22.78, "target": "A3" },
    "A4": { "x": 16.73, "y": 25.32, "target": "A4" },
    "A5": { "x": 16.73, "y": 27.86, "target": "A5" },
    "A6": { "x": 16.73, "y": 30.4, "target": "A6" },
    "A7": { "x": 16.73, "y": 32.94, "target": "A7" },
    "5V": { "x": 16.73, "y": 35.48, "target": "power(5V)" },
    "RST.2": { "x": 16.73, "y": 38.02, "target": "RESET" },
    "GND.2": { "x": 16.73, "y": 40.56, "target": "GND" },
    "VIN": { "x": 16.73, "y": 43.1, "target": "power(5V)" }
  },
  "leds": [
    {
      "id": "led_builtin",
      "x": 9,
      "y": 10,
      "type": "0603",
      "color": "orange",
      "pins": {
        "A": "GPIO13",
        "C": "GND.1"
      }
    },
    {
      "id": "power",
      "x": 9,
      "y": 7,
      "type": "0603",
      "color": "green",
      "pins": {
        "A": "5V",
        "C": "GND.1"
      }
    }
  ]
}
```

#### Key Decisions
1. **MCU**: `atmega328p` - AVR chip compatible with Nano
2. **FQBN**: `arduino:avr:nano` - Uses Arduino Nano board definition
3. **Dimensions**: 18mm x 45mm (standard Nano dimensions)
4. **Pin Layout**: 2x15 header, 2.54mm pitch
5. **LEDs**: Built-in LED (D13) and power LED

### SVG Design
- Create Nano R4 visual appearance (black PCB, USB-C connector)
- Use standard pin patterns (2.54mm pitch)
- Include "Arduino Nano R4" silkscreen for realism
- Add USB-C connector graphics
- Position pin labels to match physical layout

---

## 5. Testing Custom Board

### Test Procedure
1. **Create Test Project**:
   ```json
   {
     "version": 1,
     "author": "ELAB",
     "editor": "wokwi",
     "parts": [
       { "type": "wokwi-custom-board", "id": "board" }
     ],
     "connections": []
   }
   ```

2. **Load Custom Board** (F1 → "Load custom board file...")

3. **Verify**:
   - Board renders correctly
   - Pin hover shows correct names
   - Dimensions match expected size
   - LEDs appear at correct positions

4. **Test Connections**:
   - Add LED to diagram
   - Connect to board pin
   - Run simulation
   - Verify pin functionality

5. **Check Console** for errors or warnings

### Common Issues
- **Missing board.svg**: Ensure file is in same directory as board.json
- **Incorrect dimensions**: SVG width/height must match JSON
- **Pin position mismatch**: Verify x/y coordinates align with SVG visual
- **MCU not supported**: Check Wokwi's supported MCU list
- **FQBN invalid**: Use Arduino CLI format

---

## 6. Custom Battery Chip (Bonus)

For experiments requiring variable voltage (0-9V battery), create a custom chip:

### chip.json Example
```json
{
  "name": "Variable Battery",
  "author": "ELAB",
  "pins": [
    "VCC",
    "GND"
  ],
  "controls": [
    {
      "id": "voltage",
      "label": "Voltage (V)",
      "type": "range",
      "min": 0,
      "max": 9,
      "step": 0.1,
      "default": 5
    }
  ]
}
```

### Usage in diagram.json
```json
{
  "parts": [
    {
      "type": "chip-custom",
      "id": "battery1",
      "top": 100,
      "left": 200,
      "attrs": {
        "voltage": "9"
      }
    }
  ]
}
```

---

## 7. Resources

### Official Documentation
- [Wokwi Custom Boards Repository](https://github.com/wokwi/wokwi-boards)
- [Wokwi diagram.json Format](https://docs.wokwi.com/diagram-format)
- [Wokwi Custom Chips API](https://docs.wokwi.com/chips-api/getting-started)

### Examples
- [ESP32 DevKit V1 board.json](https://github.com/wokwi/wokwi-boards/blob/main/boards/esp32-devkit-v1/board.json)
- [ESP32 Wemos R1 D32 PR](https://github.com/wokwi/wokwi-boards/pull/21/files)

### Project Files
- `/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/components/simulator/`
  - `WokwiSimulator.jsx` - Current simulator component
  - `DualSimulator.jsx` - Dual-pane simulator (Wokwi + TinkerCAD)
  - `ArduinoSimulatorV2.jsx` - Legacy Arduino simulator

---

## 8. Implementation Roadmap

### Phase 1: Basic Custom Board
1. Create `board.json` with Arduino Nano AVR pinout
2. Design minimal `board.svg` (simple PCB outline + pin markers)
3. Test loading in Wokwi project
4. Verify pin connections work

### Phase 2: Visual Enhancement
1. Design realistic Nano R4 appearance in SVG
2. Add USB-C connector graphics
3. Add silkscreen labels ("Arduino Nano R4")
4. Add LEDs (power, built-in)
5. Refine pin spacing and alignment

### Phase 3: Integration
1. Update `WokwiSimulator.jsx` to load custom board
2. Add board file upload in ELAB interface
3. Store board files in project structure
4. Add board selector dropdown (Standard Nano / Custom R4)

### Phase 4: Battery Chip (Optional)
1. Create custom battery chip JSON
2. Implement voltage control UI
3. Test with experiments requiring variable voltage
4. Document usage in ELAB manual

---

## Notes

- **No Arduino in diagram.json = No Arduino shown**: To hide standard Arduino board from experiments, simply omit it from the `parts` array. Custom board will be the only board visible.

- **Protection Strategy**:
  - Use Wokwi "Unlisted" project visibility ($7/month plan)
  - Enable "Lock Project" to prevent unauthorized editing
  - Inject project URL after authentication in ELAB interface
  - URLs are unguessable without token

- **Tested**: Wokwi iframe works with full editor features (drag-drop, code editing) - no X-Frame-Options blocking detected.

---

**Document Version**: 1.0
**Last Updated**: February 9, 2026
**Author**: Research compiled from Wokwi documentation and community examples
