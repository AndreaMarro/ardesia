import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';

import NanoR4Board from '../../src/components/simulator/components/NanoR4Board.jsx';

describe('NanoR4Board', () => {
  it('renders without throwing', () => {
    expect(() => {
      render(
        <svg width="600" height="400">
          <NanoR4Board
            id="nano-test"
            x={0}
            y={0}
            state={{ running: false, pinStates: {}, leds: { power: true } }}
          />
        </svg>
      );
    }).not.toThrow();
  });
});
