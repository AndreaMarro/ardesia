import { defineConfig, mergeConfig } from "vite";
import { fileURLToPath } from "node:url";
import web from "../../../../vite.config.ts";

// Only this proof build composes the mount proposed to S00. Shared source stays unchanged.
export default mergeConfig(web, defineConfig({
  root: fileURLToPath(new URL("../../../../", import.meta.url)),
  define: { "import.meta.env.VITE_S20_LEARNING_JOURNEY": JSON.stringify("1") },
  plugins: [{ name: "s20-proposed-classroom-mount", enforce: "pre", transform(code, id) {
    if (id.endsWith("/src/App.tsx")) {
      const anchor = '    url.searchParams.set("view", next);\n    history.replaceState({}, "", url);';
      if (!code.includes(anchor)) throw Error("S02 navigation anchor changed");
      return code.replace(anchor, '    url.searchParams.set("view", next);\n    if (next === view) history.replaceState({}, "", url);\n    else history.pushState({}, "", url);');
    }
    if (id.endsWith("/src/useCourseWorkspace.ts")) {
      const anchor = '      if (!valid()) return;\n      if (value.edition.id !== editionId)';
      if (!code.includes(anchor)) throw Error("Workspace filter anchor changed");
      return code.replace(anchor, '      if (!valid()) return;\n      value.resources = value.resources.filter(resource => resource.kind !== "learning-journey-checkpoint");\n      if (value.edition.id !== editionId)');
    }
    if (!id.endsWith("/src/features/Classroom.tsx")) return;
    if (!code.includes("export function Classroom(props: Props) {")) throw Error("Classroom mount anchor changed");
    return code.replace("type Props = {", 'const LearningJourney = lazy(() => import("./learning-journey/LearningJourney").then(m => ({ default: m.LearningJourney })));\n\ntype Props = {')
      .replace("export function Classroom(props: Props) {", 'export function Classroom(props: Props) {\n  if (import.meta.env.VITE_S20_LEARNING_JOURNEY === "1" && props.me.role === "student" && props.data.enrolled && baseActivity(props.data.edition) === "poiseuille-v1")\n    return <Suspense fallback={<Loading>Apro il percorso di studio…</Loading>}><LearningJourney me={props.me} data={props.data} /></Suspense>;');
  } }],
  build: { outDir: fileURLToPath(new URL("../../../../../../../proof-dist", import.meta.url)), emptyOutDir: true, manifest: true },
}));
