import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { assertFullCommitSha } from './src/core/contracts/eventEnvelope.ts'

const GIT_SHA_PROVIDERS = [
  'ARDESIA_GIT_SHA',
  'VERCEL_GIT_COMMIT_SHA',
  'GITHUB_SHA',
  'RENDER_GIT_COMMIT',
] as const

type BuildEnvironment = Readonly<Record<string, string | undefined>>

export function resolveBuildCommitSha(environment: BuildEnvironment, readGitSha: () => unknown): string {
  const providerShas: string[] = []
  for (const provider of GIT_SHA_PROVIDERS) {
    const value = environment[provider]
    if (value === undefined || value === '') continue
    try {
      assertFullCommitSha(value)
    } catch {
      throw new Error(`Ardesia build provenance: provider ${provider} must contain a full Git SHA`)
    }
    providerShas.push(value.toLowerCase())
  }

  if (new Set(providerShas).size > 1) {
    throw new Error('Ardesia build provenance: populated providers disagree')
  }

  let gitSha: string | null = null
  try {
    const raw = readGitSha()
    if (typeof raw === 'string') {
      const withoutLineEnding = raw.replace(/\r?\n$/, '')
      try {
        assertFullCommitSha(withoutLineEnding)
        gitSha = withoutLineEnding.toLowerCase()
      } catch {
        gitSha = null
      }
    }
  } catch {
    gitSha = null
  }

  const providerSha = providerShas[0] ?? null
  if (providerSha !== null && gitSha !== null && providerSha !== gitSha) {
    throw new Error('Ardesia build provenance: provider and Git checkout disagree')
  }
  if (providerSha !== null) return providerSha
  if (gitSha !== null) return gitSha
  throw new Error('Ardesia build provenance: Git fallback did not return a full SHA')
}

const checkoutRoot = fileURLToPath(new URL('../..', import.meta.url))
const studioPackage = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version?: unknown
}
if (typeof studioPackage.version !== 'string') {
  throw new Error('Ardesia build provenance: apps/studio/package.json version is missing')
}
const buildCommitSha = resolveBuildCommitSha(process.env, () =>
  execFileSync('git', ['rev-parse', 'HEAD'], { cwd: checkoutRoot, encoding: 'utf8' }),
)

// https://vite.dev/config/
export default defineConfig({
  define: {
    __ARDESIA_STUDIO_VERSION__: JSON.stringify(studioPackage.version),
    __ARDESIA_GIT_SHA__: JSON.stringify(buildCommitSha),
  },
  plugins: [react()],
  resolve: {
    // Forza UNA sola copia di React (Excalidraw + app): senza, l'optimizer
    // duplica react quando si aggiunge una dep → "Invalid hook call".
    dedupe: ['react', 'react-dom'],
    alias: {
      // Confine host→plugin (canon ELAB-AS-PLUGIN §6): l'host consuma il
      // Simulation Plugin SOLO via questo alias; i tipi stanno in
      // src/types/elab-tutor-plugin.d.ts (il plugin è JS con suite propria).
      '@elab-tutor-plugin': fileURLToPath(new URL('../../plugins/elab-tutor/src', import.meta.url)),
      // Confine host→Pack (dati + metodo, slice 3 #68): sede canonica
      // packs/elab-tutor; i tipi stanno in src/types/elab-pack.d.ts.
      '@elab-pack': fileURLToPath(new URL('../../packs/elab-tutor', import.meta.url)),
    },
  },
  server: {
    // Il dev-server deve poter servire i sorgenti del plugin fuori da
    // apps/studio (monorepo): consenti la radice del repo, nient'altro.
    fs: { allow: [fileURLToPath(new URL('../..', import.meta.url))] },
  },
  optimizeDeps: { include: ['react', 'react-dom', 'react-dom/client'] },
})
