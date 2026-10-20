import { useEffect, useRef, useState } from "react";
import type { MathfieldElement } from "mathlive";

export function FormulaField({ value, onChange, readOnly = false, disabled = false, label = "Formula matematica" }: {
  value: string; onChange?: (value: string) => void; readOnly?: boolean; disabled?: boolean; label?: string;
}) {
  const host = useRef<HTMLDivElement>(null), field = useRef<MathfieldElement | null>(null);
  const latest = useRef({ value, onChange, disabled }); latest.current = { value, onChange, disabled };
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    let dispose = () => {};
    void import("./mathField").then(({ createMathField }) => {
      if (!active || !host.current) return;
      const element = createMathField(latest.current.value, readOnly, label);
      element.readOnly = readOnly || latest.current.disabled;
      const input = () => { if (!latest.current.disabled) latest.current.onChange?.(element.value); };
      element.addEventListener("input", input);
      host.current.appendChild(element); field.current = element;
      dispose = () => {
        if (!readOnly) window.mathVirtualKeyboard?.hide();
        element.removeEventListener("input", input);
        if (element.isConnected) element.resetUndo();
        element.remove(); field.current = null;
      };
      // A new field already owns its initial Undo snapshot. Clearing it here
      // would make the first typed change impossible to undo.
      element.menuItems = [];
    }).catch(() => { dispose(); if (active) setError(true); });
    return () => { active = false; dispose(); };
  }, [readOnly, label]);
  useEffect(() => {
    if (field.current && field.current.value !== value) {
      field.current.resetUndo();
      // setValue records the new baseline after clearing the previous source.
      field.current.setValue(value, { silenceNotifications: true });
    }
  }, [value]);
  useEffect(() => {
    if (field.current) field.current.readOnly = readOnly || disabled;
    if (disabled) window.mathVirtualKeyboard?.hide();
  }, [readOnly, disabled]);
  return <div className={`notebook-formula ${readOnly ? "notebook-formula-readonly" : ""}`}>
    <div ref={host} />
    {error && <p role="status">L’editor matematico non è disponibile. Il codice LaTeX resta leggibile e modificabile.</p>}
    {!readOnly ? <details open={error}>
      <summary>Codice LaTeX</summary>
      <textarea aria-label="Codice LaTeX" value={value} disabled={disabled} maxLength={5000} rows={3} onChange={e => onChange?.(e.target.value)} />
    </details> : error ? <code>{value}</code> : null}
  </div>;
}
