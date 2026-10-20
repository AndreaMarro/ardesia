import { useState } from "react";
import { CoursePackPreview } from "../../../studio/src/study/CoursePackPreview";

export function CoursePackDisclosure({
  summary,
  className = "",
  editionId,
}: {
  summary: string;
  className?: string;
  editionId?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <details
      className={`disclosure-panel ${className}`.trim()}
      onToggle={(event) => setExpanded(event.currentTarget.open)}
    >
      <summary>{summary}</summary>
      {expanded && <CoursePackPreview editionId={editionId} />}
    </details>
  );
}
