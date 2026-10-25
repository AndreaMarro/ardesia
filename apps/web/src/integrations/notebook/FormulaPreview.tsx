import { useEffect, useState } from "react";

/** Inert, sanitized MathLive output: no editor or virtual keyboard in page anchors. */
export function FormulaPreview({ value }: { value: string }) {
  const [rendered, setRendered] = useState<{ value: string; markup: string } | null>(null);
  useEffect(() => {
    let active = true;
    void import("./mathField").then(({ formulaMarkup }) => {
      const markup = formulaMarkup(value);
      if (active) setRendered({ value, markup });
    }).catch(() => { if (active) setRendered(null); });
    return () => { active = false; };
  }, [value]);
  return rendered?.value === value
    ? <span className="notebook-formula-preview" dangerouslySetInnerHTML={{ __html: rendered.markup }} />
    : <span className="notebook-formula-preview">{value}</span>;
}
