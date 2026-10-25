import { lazy, Suspense, useState } from "react";
import type { Edition, StudyMe } from "../api";
import { studySessionEpoch } from "../../../studio/src/study/sessionBoundary";
import { Loading } from "../components/Feedback";
import "./register.css";
const RegisterContent = lazy(() => import("./RegisterContent"));

export function EditionRegister({ me, edition }: { me: StudyMe; edition: Edition }) {
  const [open, setOpen] = useState(false);
  const epoch = studySessionEpoch();
  const scope = JSON.stringify([me.id, epoch, edition.id]);
  if (me.role !== "teacher" || me.id !== edition.teacherId) return null;
  return <details className="disclosure-panel edition-register" onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary>Registro dell’edizione</summary>
    {open && <Suspense fallback={<Loading>Aprendo il registro…</Loading>}><RegisterContent key={scope} me={me} edition={edition} scope={scope} epoch={epoch} /></Suspense>}
  </details>;
}
