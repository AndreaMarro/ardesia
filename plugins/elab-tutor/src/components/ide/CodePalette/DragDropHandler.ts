import { EditorView } from '@codemirror/view';
import type { Extension } from '@codemirror/state';
import type { DragEvent as ReactDragEvent } from 'react';

export const PALETTE_SNIPPET_MIME = 'application/x-elab-palette-snippet';
export const CODE_PALETTE_DROP_ACTIVE_CLASS = 'code-palette-drop-active';

type PaletteInsertView = Pick<EditorView, 'dispatch' | 'focus' | 'posAtCoords'> & {
  dom: HTMLElement;
  state: EditorView['state'];
};

function dataTransferTypes(event: DragEvent): string[] {
  const types = event.dataTransfer?.types;
  if (!types) return [];
  return Array.from(types as ArrayLike<string>);
}

function cleanupDropState(view: Pick<EditorView, 'dom'>) {
  view.dom.classList.remove(CODE_PALETTE_DROP_ACTIVE_CLASS);
}

function readPaletteSnippet(event: DragEvent): string {
  const custom = event.dataTransfer?.getData(PALETTE_SNIPPET_MIME) || '';
  if (custom) return custom;
  return event.dataTransfer?.getData('text/plain') || '';
}

function dropPosition(view: PaletteInsertView, event?: DragEvent): number {
  if (event && Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
    const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
    if (typeof pos === 'number') return pos;
  }
  return view.state.selection.main.from;
}

export function isPaletteSnippetDrag(event: DragEvent): boolean {
  return dataTransferTypes(event).includes(PALETTE_SNIPPET_MIME);
}

export function setPaletteDragData(event: DragEvent | ReactDragEvent, snippet: string) {
  const dataTransfer = event.dataTransfer;
  if (!dataTransfer) return;
  dataTransfer.setData(PALETTE_SNIPPET_MIME, snippet);
  dataTransfer.setData('text/plain', snippet);
  dataTransfer.effectAllowed = 'copy';
}

export function insertPaletteSnippet(view: PaletteInsertView, snippet: string, event?: DragEvent): boolean {
  if (!snippet) return false;
  const from = Math.max(0, Math.min(dropPosition(view, event), view.state.doc.length));
  view.dispatch({
    changes: { from, insert: snippet },
    selection: { anchor: from + snippet.length },
    scrollIntoView: true,
  });
  view.focus();
  return true;
}

export function handlePaletteDragEnter(event: DragEvent, view: PaletteInsertView): boolean {
  if (!isPaletteSnippetDrag(event)) {
    cleanupDropState(view);
    return false;
  }
  event.preventDefault();
  view.dom.classList.add(CODE_PALETTE_DROP_ACTIVE_CLASS);
  return true;
}

export function handlePaletteDragOver(event: DragEvent, view: PaletteInsertView): boolean {
  if (!isPaletteSnippetDrag(event)) {
    cleanupDropState(view);
    return false;
  }
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  view.dom.classList.add(CODE_PALETTE_DROP_ACTIVE_CLASS);
  return true;
}

export function handlePaletteDragLeave(event: DragEvent, view: PaletteInsertView): boolean {
  cleanupDropState(view);
  return isPaletteSnippetDrag(event);
}

export function handlePaletteDrop(event: DragEvent, view: PaletteInsertView): boolean {
  try {
    if (!isPaletteSnippetDrag(event)) return false;

    const snippet = readPaletteSnippet(event);
    if (!snippet) return false;

    event.preventDefault();
    event.stopPropagation();
    return insertPaletteSnippet(view, snippet, event);
  } finally {
    cleanupDropState(view);
  }
}

const paletteDropTheme = EditorView.baseTheme({
  [`&.${CODE_PALETTE_DROP_ACTIVE_CLASS}`]: {
    outline: '2px solid var(--color-accent, #4A7A25)',
    outlineOffset: '-2px',
  },
  [`&.${CODE_PALETTE_DROP_ACTIVE_CLASS} .cm-content`]: {
    backgroundColor: 'rgba(74, 122, 37, 0.12)',
  },
});

export function createPaletteDropExtension(): Extension {
  return [
    paletteDropTheme,
    EditorView.domEventHandlers({
      dragenter(event, view) {
        return handlePaletteDragEnter(event, view);
      },
      dragover(event, view) {
        return handlePaletteDragOver(event, view);
      },
      dragleave(event, view) {
        return handlePaletteDragLeave(event, view);
      },
      drop(event, view) {
        return handlePaletteDrop(event, view);
      },
    }),
  ];
}
