import { lazy, Suspense, useEffect, useState } from "react";
import {
  describeError,
  StudyApiError,
  studyRequest,
  type StudyMe,
} from "./api";
import { useCourseWorkspace } from "./useCourseWorkspace";
import { clearResourceDrafts } from "./components/sessionDraftCache";
import { clearActorOffline } from "./features/independent-study/storage";
import { signOutStudySession } from "../../studio/src/study/apiClient";
import {
  activateStudySession, beginStudySessionCheck, isStudySessionEpoch, studySessionEpoch,
  StudySessionChangedError, subscribeStudySessionEnd,
} from "../../studio/src/study/sessionBoundary";
import { PhysicsLab } from "./components/PhysicsLab";
import { Shell, legacyViews, type View } from "./components/Shell";
import { ErrorNotice, Loading } from "./components/Feedback";
import { Public } from "./features/Public";
import { Today } from "./features/Today";
const LearningInsights = lazy(() => import("./features/learning-insights/LearningInsights").then(m => ({default:m.LearningInsights})));
const Courses = lazy(() =>
  import("./features/Courses").then((m) => ({ default: m.Courses })),
);
const Classroom = lazy(() =>
  import("./features/Classroom").then((m) => ({ default: m.Classroom })),
);
const Work = lazy(() =>
  import("./features/Work").then((m) => ({ default: m.Work })),
);
const MemoryView = lazy(() => import("./features/learning-memory/MemoryView").then(m => ({default:m.MemoryView})));
const Login = lazy(() =>
  import("./components/Login").then((m) => ({ default: m.Login })),
);
const Review = lazy(() =>
  import("./features/Review").then((m) => ({ default: m.Review })),
);
const Materials = lazy(() =>
  import("./features/Materials").then((m) => ({ default: m.Materials })),
);
const Exam = lazy(() =>
  import("./features/Exam").then((m) => ({ default: m.Exam })),
);
const IndependentStudy = lazy(() =>
  import("./features/independent-study/IndependentStudy").then((m) => ({ default: m.IndependentStudy })),
);
const sharedViews: View[] = [...legacyViews, "memory"];
const views: View[] = [...sharedViews, "independent-study"];
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
  const sessionVersion = studySessionEpoch();
  const course = useCourseWorkspace(me, sessionVersion);
  const { data, refresh } = course;
  const studyEnabled = me?.role === "student" && !!data?.enrolled;
  const mountedViews = studyEnabled ? views : sharedViews;
  const currentView = view === "independent-study" && !studyEnabled ? "today" : view;
  useEffect(() => {
    return subscribeStudySessionEnd(({ reason }) => {
      if (me) clearActorOffline(me.id);
      setMe(null);
      setChecking(false);
      clearResourceDrafts();
      setParentId(null);
      setError("");
      setLoginTrigger(document.activeElement as HTMLElement | null);
      setLoginOpen(reason === "rejected");
      const url = new URL(location.href);
      url.searchParams.delete("edition");
      url.searchParams.set("view", "today");
      history.replaceState(null, "", url);
      setView("today");
    });
  }, [me?.id]);
  useEffect(() => {
    const pop = () => {
      setView(initialView()); setParentId(null);
      const requested = new URLSearchParams(location.search).get("edition");
      if (requested && requested !== course.editionId) course.reloadEditions(requested);
    };
    addEventListener("popstate", pop);
    return () => removeEventListener("popstate", pop);
  }, [course.editionId, course.reloadEditions]);
  const affinity = `${me?.id}:${course.editionId}`;
  useEffect(() => {
    setParentId(null);
  }, [affinity]);
  useEffect(() => {
    let active = true;
    const epoch = beginStudySessionCheck();
    const controller = new AbortController();
    void studyRequest<StudyMe>("/me", undefined, { signal: controller.signal })
      .then((value) => {
        if (active && activateStudySession(epoch)) {
          setMe(value);
          setChecking(false);
        }
      })
      .catch((e) => {
        if (active && isStudySessionEpoch(epoch) && !(e instanceof StudySessionChangedError) && !(e instanceof StudyApiError && e.status === 401))
          setError(
            "La connessione allo spazio di lavoro non è disponibile. Il laboratorio resta accessibile quando il servizio risponde.",
          );
      })
      .finally(() => {
        if (active && isStudySessionEpoch(epoch)) setChecking(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, []);
  function navigate(next: View) {
    setView(next);
    const url = new URL(location.href);
    url.searchParams.set("view", next);
    if (next === view) history.replaceState({}, "", url);
    else history.pushState({}, "", url);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  async function logout() {
    const outcome = await signOutStudySession();
    if (outcome === "UNCONFIRMED") setError("Sei uscito da questo spazio. La revoca della sessione sul server non è confermata.");
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
          key={sessionVersion}
          me={me}
          view={currentView}
          enabledViews={mountedViews}
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
          {currentView === "memory" ? (
            <Suspense fallback={<Loading />}>
              <MemoryView key={`${me.id}:${sessionVersion}`} me={me} resources={data?.resources ?? []} />
            </Suspense>
          ) : !course.listing && !course.error && course.editions.length === 0 ? (
            me.role === "teacher" && currentView === "courses" ? (
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
              {currentView === "today" ? (
                <Today me={me} data={data} onView={navigate} />
              ) : currentView === "courses" ? (
                <Courses
                  me={me}
                  data={data}
                  editions={course.editions}
                  onEdition={course.selectEdition}
                  onManaged={course.reloadEditions}
                  onUpdate={refresh}
                  onClassroom={() => navigate("classroom")}
                />
              ) : currentView === "independent-study" && studyEnabled ? (
                <IndependentStudy me={me} editionId={data.edition.id} sessionVersion={sessionVersion} />
              ) : currentView === "classroom" ? (
                <Classroom
                  me={me}
                  data={data}
                  parentId={parentId}
                  onUpdate={async () => {
                    await refresh();
                    setParentId(null);
                  }}
                />
              ) : currentView === "work" ? (
                <>
                  <Work
                    me={me}
                    data={data}
                    onUpdate={refresh}
                    onRetry={(id) => {
                      setParentId(id);
                      navigate("classroom");
                    }}
                  />
                  <Suspense fallback={<Loading>Apro le evidenze del corso…</Loading>}>
                    <LearningInsights me={me} editionId={data.edition.id}/>
                  </Suspense>
                </>
              ) : currentView === "review" && me.role === "teacher" ? (
                <Review
                  data={data}
                  onUpdate={refresh}
                  onDiary={() => navigate("work")}
                />
              ) : currentView === "exam" && me.role === "student" ? (
                <Exam data={data} />
              ) : currentView === "materials" ? (
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
              if (!activateStudySession(studySessionEpoch())) return;
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
