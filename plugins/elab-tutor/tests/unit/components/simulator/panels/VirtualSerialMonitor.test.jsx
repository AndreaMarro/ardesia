/**
 * Iter 95 SP3 T2 — VirtualSerialMonitor component tests
 *
 * UI panel rendering predicted Serial.* output from user C++ Arduino sketch.
 * Consumes interpretSerialOutput(cppCode) from SP3 T1.
 *
 * Mandate Andrea iter 94 PM:
 *   - Display predicted output ([setup], [loop 1], [loop 2], ... with timestamps)
 *   - MANDATORY disclaimer when boardConnected === false
 *   - Empty state when no Serial.* calls
 *   - Baud rate display
 *   - Never claim "real serial" without hardware
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import VirtualSerialMonitor from '../../../../../src/components/simulator/panels/VirtualSerialMonitor.jsx';

const BLINK_SERIAL_CODE = `void setup() {
  Serial.begin(9600);
  Serial.println("ELAB Nano R4 pronto");
}

void loop() {
  Serial.println("LED acceso");
  delay(1000);
  Serial.println("LED spento");
  delay(1000);
}`;

const SERIAL_ONLY_CODE = `void setup() {
  Serial.begin(115200);
  Serial.println("Avvio");
}
void loop() {
  Serial.println("tick");
  delay(500);
}`;

const NO_SERIAL_CODE = `void setup() {
  pinMode(13, OUTPUT);
}
void loop() {
  digitalWrite(13, HIGH);
  delay(100);
}`;

describe('VirtualSerialMonitor', () => {
  describe('basic rendering', () => {
    it('renders monitor heading with title "Monitor Seriale Virtuale"', () => {
      render(<VirtualSerialMonitor cppCode={BLINK_SERIAL_CODE} />);
      const heading = screen.getByRole('heading', { name: /Monitor Seriale Virtuale/i });
      expect(heading).toBeTruthy();
    });

    it('displays baud rate from Serial.begin(9600)', () => {
      render(<VirtualSerialMonitor cppCode={BLINK_SERIAL_CODE} />);
      expect(screen.getByText(/9600/)).toBeTruthy();
    });

    it('displays baud rate from Serial.begin(115200)', () => {
      render(<VirtualSerialMonitor cppCode={SERIAL_ONLY_CODE} />);
      expect(screen.getByText(/115200/)).toBeTruthy();
    });
  });

  describe('setup() output', () => {
    it('renders setup lines with [setup] label', () => {
      render(<VirtualSerialMonitor cppCode={BLINK_SERIAL_CODE} />);
      expect(screen.getAllByText(/\[setup\]/i).length).toBeGreaterThan(0);
      expect(screen.getByText('ELAB Nano R4 pronto')).toBeTruthy();
    });
  });

  describe('loop() iterations', () => {
    it('renders loop iteration markers [loop 1], [loop 2], [loop 3]', () => {
      render(<VirtualSerialMonitor cppCode={BLINK_SERIAL_CODE} maxIterations={3} />);
      // BLINK_SERIAL_CODE has 2 lines per iter (acceso + spento) → 2 matches each
      expect(screen.getAllByText(/\[loop 1\]/i).length).toBe(2);
      expect(screen.getAllByText(/\[loop 2\]/i).length).toBe(2);
      expect(screen.getAllByText(/\[loop 3\]/i).length).toBe(2);
    });

    it('renders predicted output text "LED acceso" and "LED spento"', () => {
      render(<VirtualSerialMonitor cppCode={BLINK_SERIAL_CODE} maxIterations={2} />);
      const ledOnElements = screen.getAllByText('LED acceso');
      const ledOffElements = screen.getAllByText('LED spento');
      // 2 iterations × 1 LED ON line each = 2 occurrences
      expect(ledOnElements.length).toBe(2);
      expect(ledOffElements.length).toBe(2);
    });

    it('respects maxIterations prop default 10', () => {
      render(<VirtualSerialMonitor cppCode={BLINK_SERIAL_CODE} />);
      // BLINK_SERIAL_CODE 2 lines per iter × 10 iter = 20 line markers + [loop 10] appears 2 times
      expect(screen.getAllByText(/\[loop 10\]/i).length).toBe(2);
    });
  });

  describe('disclaimer (Andrea iter 94 mandate)', () => {
    it('shows mandatory disclaimer when boardConnected=false (default)', () => {
      render(<VirtualSerialMonitor cppCode={BLINK_SERIAL_CODE} />);
      expect(screen.getByText(/Seriale prevista dal programma/i)).toBeTruthy();
      expect(screen.getByText(/collega una Nano R4 via USB/i)).toBeTruthy();
    });

    it('shows mandatory disclaimer when boardConnected explicitly false', () => {
      render(<VirtualSerialMonitor cppCode={BLINK_SERIAL_CODE} boardConnected={false} />);
      expect(screen.getByText(/Seriale prevista dal programma/i)).toBeTruthy();
    });

    it('shows board-detected label when boardConnected=true (NOT seriale reale claim)', () => {
      render(<VirtualSerialMonitor cppCode={BLINK_SERIAL_CODE} boardConnected={true} />);
      // Even when board connected, this component shows PREDICTED output.
      // Real serial reading is separate feature (iter 96+). So disclaimer
      // still present but board-detected note added.
      expect(screen.getByText(/Nano R4 rilevata/i)).toBeTruthy();
    });

    it('HIGH-3 fix: disclaimer CTA changes wording when boardConnected=true (no USB advice)', () => {
      render(<VirtualSerialMonitor cppCode={BLINK_SERIAL_CODE} boardConnected={true} />);
      // Disclaimer "Seriale prevista" framing preserved (always predicted) MA
      // CTA shifts to "Monitor Seriale del kit" (NOT "collega Nano R4 via USB"
      // which would contradict green "Nano R4 rilevata" badge).
      expect(screen.getByText(/Seriale prevista dal programma/i)).toBeTruthy();
      expect(screen.getByText(/Monitor Seriale del kit/i)).toBeTruthy();
      // NOT show "collega Nano R4 via USB" when already connected
      expect(screen.queryByText(/collega una Nano R4 via USB/i)).toBeNull();
    });
  });

  describe('empty state', () => {
    it('shows empty state when cppCode has no Serial.* calls', () => {
      render(<VirtualSerialMonitor cppCode={NO_SERIAL_CODE} />);
      expect(screen.getByText(/nessuna istruzione seriale rilevata/i)).toBeTruthy();
    });

    it('shows empty state when cppCode is empty string', () => {
      render(<VirtualSerialMonitor cppCode="" />);
      expect(screen.getByText(/nessun codice/i)).toBeTruthy();
    });

    it('shows empty state when cppCode is null', () => {
      render(<VirtualSerialMonitor cppCode={null} />);
      expect(screen.getByText(/nessun codice/i)).toBeTruthy();
    });
  });
});
