import { describe, expect, it, vi } from 'vitest';
import {
  CODE_PALETTE_DROP_ACTIVE_CLASS,
  createPaletteDropExtension,
  handlePaletteDragEnter,
  handlePaletteDragLeave,
  handlePaletteDragOver,
  handlePaletteDrop,
  insertPaletteSnippet,
  isPaletteSnippetDrag,
  PALETTE_SNIPPET_MIME,
  setPaletteDragData,
} from '../../../src/components/ide/CodePalette/DragDropHandler';

function makeDataTransfer(types: string[], values: Record<string, string> = {}) {
  const store = new Map(Object.entries(values));
  return {
    types,
    dropEffect: '',
    effectAllowed: '',
    setData: vi.fn((type: string, value: string) => store.set(type, value)),
    getData: vi.fn((type: string) => store.get(type) || ''),
  };
}

function makeEvent(types: string[], values: Record<string, string> = {}) {
  return {
    clientX: 10,
    clientY: 20,
    dataTransfer: makeDataTransfer(types, values),
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  } as unknown as DragEvent;
}

function makeView() {
  const dom = document.createElement('div');
  dom.classList.add(CODE_PALETTE_DROP_ACTIVE_CLASS);
  return {
    dom,
    state: {
      doc: { length: 20, toString: () => '01234567890123456789' },
      selection: { main: { from: 5 } },
    },
    posAtCoords: vi.fn(() => 7),
    dispatch: vi.fn(),
    focus: vi.fn(),
  };
}

describe('DragDropHandler palette source guard', () => {
  it('setPaletteDragData writes custom MIME and text/plain fallback', () => {
    const event = makeEvent([]);
    setPaletteDragData(event, 'digitalWrite(13, HIGH);');

    expect(event.dataTransfer?.setData).toHaveBeenCalledWith(PALETTE_SNIPPET_MIME, 'digitalWrite(13, HIGH);');
    expect(event.dataTransfer?.setData).toHaveBeenCalledWith('text/plain', 'digitalWrite(13, HIGH);');
    expect(event.dataTransfer?.effectAllowed).toBe('copy');
  });

  it('recognizes only drags that include the custom MIME type', () => {
    expect(isPaletteSnippetDrag(makeEvent([PALETTE_SNIPPET_MIME]))).toBe(true);
    expect(isPaletteSnippetDrag(makeEvent(['text/plain']))).toBe(false);
  });

  it('palette drop inserts the custom MIME snippet at the drop coordinates', () => {
    const view = makeView();
    const event = makeEvent([PALETTE_SNIPPET_MIME, 'text/plain'], {
      [PALETTE_SNIPPET_MIME]: 'delay(500);',
      'text/plain': 'fallback',
    });

    const handled = handlePaletteDrop(event, view as any);

    expect(handled).toBe(true);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(view.posAtCoords).toHaveBeenCalledWith({ x: 10, y: 20 });
    expect(view.dispatch).toHaveBeenCalledWith(expect.objectContaining({
      changes: { from: 7, insert: 'delay(500);' },
      scrollIntoView: true,
    }));
    expect(view.dom).not.toHaveClass(CODE_PALETTE_DROP_ACTIVE_CLASS);
  });

  it('palette drop falls back to text/plain only when the custom payload is empty', () => {
    const view = makeView();
    const event = makeEvent([PALETTE_SNIPPET_MIME, 'text/plain'], {
      [PALETTE_SNIPPET_MIME]: '',
      'text/plain': 'pinMode(13, OUTPUT);',
    });

    expect(handlePaletteDrop(event, view as any)).toBe(true);
    expect(view.dispatch).toHaveBeenCalledWith(expect.objectContaining({
      changes: { from: 7, insert: 'pinMode(13, OUTPUT);' },
    }));
  });

  it('external text/plain drop is ignored so CodeMirror can keep default behavior', () => {
    const view = makeView();
    const event = makeEvent(['text/plain'], { 'text/plain': 'external text' });

    const handled = handlePaletteDrop(event, view as any);

    expect(handled).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.stopPropagation).not.toHaveBeenCalled();
    expect(view.dispatch).not.toHaveBeenCalled();
    expect(view.dom).not.toHaveClass(CODE_PALETTE_DROP_ACTIVE_CLASS);
  });

  it('dragover for external payload does not intercept default handling', () => {
    const view = makeView();
    const event = makeEvent(['text/plain']);

    expect(handlePaletteDragOver(event, view as any)).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(view.dom).not.toHaveClass(CODE_PALETTE_DROP_ACTIVE_CLASS);
  });

  it('dragenter and dragleave always clean active state predictably', () => {
    const view = makeView();
    const enter = makeEvent([PALETTE_SNIPPET_MIME]);

    expect(handlePaletteDragEnter(enter, view as any)).toBe(true);
    expect(view.dom).toHaveClass(CODE_PALETTE_DROP_ACTIVE_CLASS);

    const leave = makeEvent([PALETTE_SNIPPET_MIME]);
    expect(handlePaletteDragLeave(leave, view as any)).toBe(true);
    expect(view.dom).not.toHaveClass(CODE_PALETTE_DROP_ACTIVE_CLASS);
  });

  it('drop cleanup runs even when palette payload is empty', () => {
    const view = makeView();
    const event = makeEvent([PALETTE_SNIPPET_MIME], { [PALETTE_SNIPPET_MIME]: '' });

    expect(handlePaletteDrop(event, view as any)).toBe(false);
    expect(view.dispatch).not.toHaveBeenCalled();
    expect(view.dom).not.toHaveClass(CODE_PALETTE_DROP_ACTIVE_CLASS);
  });

  it('insertPaletteSnippet uses current selection when no coordinates are provided', () => {
    const view = makeView();

    insertPaletteSnippet(view as any, 'Serial.println("ciao");');

    expect(view.posAtCoords).not.toHaveBeenCalled();
    expect(view.dispatch).toHaveBeenCalledWith(expect.objectContaining({
      changes: { from: 5, insert: 'Serial.println("ciao");' },
    }));
  });

  it('exports a CodeMirror extension object for editor wiring', () => {
    expect(createPaletteDropExtension()).toBeTruthy();
  });
});
