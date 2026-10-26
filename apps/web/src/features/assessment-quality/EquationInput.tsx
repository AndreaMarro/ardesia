import { useEffect, useRef, useState } from "react";
import type { MathfieldElement } from "mathlive";

/** Reuses the existing locally bundled MathLive/fonts; LaTeX remains editable on load failure. */
export function EquationInput({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const host = useRef<HTMLDivElement>(null),
    field = useRef<MathfieldElement | null>(null),
    current = useRef({ value, onChange, disabled });
  const [failed, setFailed] = useState(false);
  current.current = { value, onChange, disabled };
  useEffect(() => {
    let disposed = false;
    void import("mathlive")
      .then(({ MathfieldElement }) => {
        if (disposed || !host.current) return;
        MathfieldElement.fontsDirectory = `${import.meta.env.BASE_URL}mathlive/0.111.1/fonts`;
        MathfieldElement.soundsDirectory = null;
        const mf = new MathfieldElement();
        field.current = mf;
        mf.value = current.current.value;
        mf.readOnly = current.current.disabled;
        mf.setAttribute("aria-label", `Formula ${label}`);
        mf.mathVirtualKeyboardPolicy = "auto";
        mf.addEventListener("input", () => current.current.onChange(mf.value));
        host.current.appendChild(mf);
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });
    return () => {
      disposed = true;
      field.current?.blur();
      field.current?.remove();
      field.current = null;
    };
  }, [label]);
  useEffect(() => {
    if (field.current) {
      if (field.current.value !== value) field.current.value = value;
      field.current.readOnly = disabled;
    }
  }, [value, disabled]);
  return (
    <div className="aq-equation">
      <span>Espressione {label}</span>
      <div ref={host} />
      {failed && (
        <p>Editor visuale non disponibile. Puoi usare il campo LaTeX.</p>
      )}
      <details>
        <summary>Modifica LaTeX · {label}</summary>
        <label>
          LaTeX · {label}
          <textarea
            rows={2}
            maxLength={512}
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
          />
        </label>
      </details>
    </div>
  );
}
