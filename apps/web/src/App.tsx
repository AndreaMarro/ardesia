import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import {
  describeError,
  StudyApiError,
  studyRequest,
  type StudyMe,
  type Workspace,
} from "./api";
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
    [data, setData] = useState<Workspace | null>(null),
    [error, setError] = useState(""),
    [loginOpen, setLoginOpen] = useState(false),
    [loginTrigger, setLoginTrigger] = useState<HTMLElement | null>(null),
    [parentId, setParentId] = useState<string | null>(null);
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
  const refresh = useCallback(async () => {
    if (!me) return;
    const value = await studyRequest<Workspace>("/workspace?editionId=fluidi");
    setData(value);
  }, [me?.id]);
  useEffect(() => {
    if (me) {
      setData(null);
      setError("");
      void refresh().catch((e) =>
        setError(describeError(e, "Il tuo spazio non è disponibile. Riprova.")),
      );
    }
  }, [me?.id, refresh]);
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
      setData(null);
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
        >
          {error && (
            <ErrorNotice
              message={error}
              onRetry={() =>
                void refresh()
                  .then(() => setError(""))
                  .catch((e) => setError(describeError(e)))
              }
            />
          )}{" "}
          {!data && !error ? (
            <Loading />
          ) : data ? (
            <Suspense
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
