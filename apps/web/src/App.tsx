import { lazy, Suspense, useEffect, useState } from "react";
import {
  describeError,
  StudyApiError,
  studyRequest,
  type StudyMe,
} from "./api";
import { useCourseWorkspace } from "./useCourseWorkspace";
import { clearResourceDrafts } from "./components/sessionDraftCache";
import { PhysicsLab } from "./components/PhysicsLab";
import { Shell, type View } from "./components/Shell";
import { ErrorNotice, Loading } from "./components/Feedback";
import { Public } from "./features/Public";
import { Today } from "./features/Today";
const Courses = lazy(() =>
  import("./features/Courses").then((m) => ({ default: m.Courses })),
);
const Classroom = lazy(() =>
  import("./features/Classroom").then((m) => ({ default: m.Classroom })),
);
const Work = lazy(() =>
  import("./features/Work").then((m) => ({ default: m.Work })),
);
const Login = lazy(() =>
  import("./components/Login").then((m) => ({ default: m.Login })),
);
const Review = lazy(() =>
  import("./features/Review").then((m) => ({ default: m.Review })),
);
const Materials = lazy(() =>
  import("./features/Materials").then((m) => ({ default: m.Materials })),
);
const views: View[] = [
  "today",
  "courses",
  "classroom",
  "work",
  "review",
  "materials",
];
function initialView(): View {
  const requested = new URLSearchParams(location.search).get("view");
  return views.includes(requested as View) ? (requested as View) : "today";
}
export default function App() {
  const [me, setMe] = useState<StudyMe | null>(null),
    [checking, setChecking] = useState(true),
    [view, setView] = useState<View>(initialView),
    [error, setError] = useState(""),
    [loginOpen, setLoginOpen] = useState(false),
    [loginTrigger, setLoginTrigger] = useState<HTMLElement | null>(null),
    [parentId, setParentId] = useState<string | null>(null);
  const course = useCourseWorkspace(me);
  const { data, refresh } = course;
  useEffect(() => {
    if (!course.sessionExpired) return;
    setMe(null);
    clearResourceDrafts();
    setLoginTrigger(document.activeElement as HTMLElement | null);
    setLoginOpen(true);
  }, [course.sessionExpired]);
  const affinity = `${me?.id}:${course.editionId}`;
  useEffect(() => {
    setParentId(null);
  }, [affinity]);
  useEffect(() => {
    let active = true;
    void studyRequest<StudyMe>("/me")
      .then((value) => {
        if (active) setMe(value);
      })
      .catch((e) => {
        if (active && !(e instanceof StudyApiError && e.status === 401))
          setError(
            "La connessione allo spazio di lavoro non è disponibile. Il laboratorio resta accessibile quando il servizio risponde.",
          );
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, []);
  function navigate(next: View) {
    setView(next);
    const url = new URL(location.href);
    url.searchParams.set("view", next);
    history.replaceState({}, "", url);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  async function logout() {
    try {
      await studyRequest("/session", undefined, { method: "DELETE" });
      setMe(null);
      clearResourceDrafts();
      navigate("today");
    } catch (e) {
      setError(describeError(e, "Uscita non riuscita. Puoi riprovare."));
    }
  }
  if (checking)
    return (
      <div className="app-loading">
        <span className="wordmark">ardesia.</span>
        <Loading />
      </div>
    );
  return (
    <>
      {me ? (
        <Shell
          me={me}
          view={view}
          onView={navigate}
          onLogout={() => void logout()}
          editions={course.editions}
          editionId={course.editionId}
          onEdition={course.selectEdition}
          editionPagination={course.pagination}
        >
          {(error || course.error) && (
            <ErrorNotice
              message={error || course.error}
              onRetry={() =>
                void course
                  .retry()
                  .then(() => setError(""))
                  .catch((e) => setError(describeError(e)))
              }
            />
          )}{" "}
          {!course.listing &&
            !course.error &&
            course.editions.length === 0 &&
            course.pagination.hasPrevious && (
              <p role="status">
                Questa pagina non contiene edizioni disponibili. Usa
                “Precedenti” per rileggere le altre pagine.
              </p>
            )}
          {!course.listing && !course.error && course.editions.length === 0 ? (
            me.role === "teacher" && view === "courses" ? (
              <Suspense fallback={<Loading />}>
                <Courses
                  me={me}
                  data={null}
                  editions={[]}
                  onManaged={course.reloadEditions}
                  onUpdate={refresh}
                  onClassroom={() => navigate("classroom")}
                />
              </Suspense>
            ) : (
              <>
                <header className="page-heading">
                  <h1>
                    {course.pagination.hasPrevious
                      ? "Questa pagina è vuota."
                      : "Il tuo spazio è pronto."}
                  </h1>
                  <p>
                    {course.pagination.hasPrevious
                      ? "Puoi tornare alla pagina precedente oppure "
                      : "Non risultano edizioni accessibili al tuo account. Puoi "}
                    esplorare il laboratorio pubblico; fonti, consegne e
                    iscrizioni restano chiuse.
                  </p>
                </header>
                {me.role === "teacher" && (
                  <button
                    className="button-primary"
                    onClick={() => navigate("courses")}
                  >
                    {course.pagination.hasPrevious
                      ? "Prepara un’edizione"
                      : "Crea la prima edizione"}
                  </button>
                )}
                <PhysicsLab />
              </>
            )
          ) : !data && !error && !course.error ? (
            <Loading />
          ) : data ? (
            <Suspense
              key={affinity}
              fallback={
                <Loading>Sto aprendo questa parte del tuo spazio…</Loading>
              }
            >
              {view === "today" ? (
                <Today me={me} data={data} onView={navigate} />
              ) : view === "courses" ? (
                <Courses
                  me={me}
                  data={data}
                  editions={course.editions}
                  onEdition={course.selectEdition}
                  onManaged={course.reloadEditions}
                  onUpdate={refresh}
                  onClassroom={() => navigate("classroom")}
                />
              ) : view === "classroom" ? (
                <Classroom
                  me={me}
                  data={data}
                  parentId={parentId}
                  onUpdate={async () => {
                    await refresh();
                    setParentId(null);
                  }}
                />
              ) : view === "work" ? (
                <Work
                  me={me}
                  data={data}
                  onRetry={(id) => {
                    setParentId(id);
                    navigate("classroom");
                  }}
                />
              ) : view === "review" && me.role === "teacher" ? (
                <Review
                  data={data}
                  onUpdate={refresh}
                  onDiary={() => navigate("work")}
                />
              ) : view === "materials" ? (
                <Materials me={me} data={data} onUpdate={refresh} />
              ) : (
                <Today me={me} data={data} onView={navigate} />
              )}
            </Suspense>
          ) : null}
        </Shell>
      ) : (
        <>
          <Public
            onLogin={() => {
              setLoginTrigger(document.activeElement as HTMLElement);
              setLoginOpen(true);
            }}
          />
          {error && (
            <div className="public-service-error">
              <ErrorNotice message={error} />
            </div>
          )}
        </>
      )}
      {loginOpen && (
        <Suspense fallback={null}>
          <Login
            restoreFocus={loginTrigger}
            onClose={() => setLoginOpen(false)}
            onSuccess={(value) => {
              setMe(value);
              setLoginOpen(false);
              setError("");
              navigate("today");
            }}
          />
        </Suspense>
      )}
    </>
  );
}
