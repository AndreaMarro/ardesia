// ============================================
// ELAB Tutor - Project History Service
// "Git per bambini": snapshot dei progressi
// Collegato ai volumi ELAB e agli esperimenti
// © Andrea Marro — 2026
// ============================================

import logger from '../utils/logger';

const HISTORY_KEY = 'elab_project_history';
const MAX_SNAPSHOTS = 50;

function getAllProjects() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
  } catch { return {}; }
}

function saveAllProjects(projects) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(projects));
  } catch (e) {
    logger.error('Errore salvataggio storia progetto:', e);
  }
}

const projectHistoryService = {

  /**
   * Salva uno snapshot del progetto
   * @param {string} projectId - ID univoco del progetto (es: 'v1-cap6-led')
   * @param {object} snapshot - { code, note, experimentId, volume, chapter }
   */
  saveSnapshot(projectId, { code, note, experimentId, volume, chapter }) {
    const projects = getAllProjects();
    if (!projects[projectId]) {
      projects[projectId] = {
        id: projectId,
        experimentId: experimentId || projectId,
        volume: volume || null,
        chapter: chapter || null,
        creato: new Date().toISOString(),
        snapshots: []
      };
    }

    const project = projects[projectId];

    // Calcola diff semplice rispetto all'ultimo snapshot
    const lastSnap = project.snapshots[project.snapshots.length - 1];
    const linesChanged = lastSnap
      ? countDiffLines(lastSnap.code || '', code || '')
      : (code || '').split('\n').length;

    project.snapshots.push({
      id: `snap_${Date.now().toString(36)}`,
      code: code || '',
      note: note || '',
      linesChanged,
      timestamp: new Date().toISOString()
    });

    // Limita a MAX_SNAPSHOTS
    if (project.snapshots.length > MAX_SNAPSHOTS) {
      project.snapshots = project.snapshots.slice(-MAX_SNAPSHOTS);
    }

    saveAllProjects(projects);
    return project;
  },

  /**
   * Recupera la timeline di un progetto
   */
  getTimeline(projectId) {
    const projects = getAllProjects();
    return projects[projectId]?.snapshots || [];
  },

  /**
   * Recupera info progetto
   */
  getProject(projectId) {
    const projects = getAllProjects();
    return projects[projectId] || null;
  },

  /**
   * Elenca tutti i progetti con snapshot
   */
  listProjects() {
    const projects = getAllProjects();
    return Object.values(projects).map(p => ({
      id: p.id,
      experimentId: p.experimentId,
      volume: p.volume,
      chapter: p.chapter,
      creato: p.creato,
      snapshotCount: p.snapshots.length,
      ultimoSnapshot: p.snapshots[p.snapshots.length - 1]?.timestamp || p.creato
    })).sort((a, b) => new Date(b.ultimoSnapshot) - new Date(a.ultimoSnapshot));
  },

  /**
   * Elimina un progetto
   */
  deleteProject(projectId) {
    const projects = getAllProjects();
    delete projects[projectId];
    saveAllProjects(projects);
  },

  /**
   * Genera una narrativa testuale del percorso dello studente
   * Restituisce una stringa con emoji e tono amichevole
   */
  getStory(projectId) {
    const project = getAllProjects()[projectId];
    if (!project || project.snapshots.length === 0) return null;

    const snaps = project.snapshots;
    const first = snaps[0];
    const last = snaps[snaps.length - 1];
    const totalChanges = snaps.reduce((sum, s) => sum + (s.linesChanged || 0), 0);
    const durationMs = new Date(last.timestamp) - new Date(first.timestamp);
    const durationMin = Math.round(durationMs / 60000);

    const volLabel = project.volume ? `Volume ${project.volume}` : '';
    const chapLabel = project.chapter ? `Capitolo ${project.chapter}` : '';

    let story = `Il tuo viaggio con "${projectId}":\n\n`;

    if (volLabel) {
      story += `Hai lavorato su un esperimento dal ${volLabel}${chapLabel ? ', ' + chapLabel : ''}.\n`;
    }

    story += `Hai fatto ${snaps.length} salvataggio${snaps.length > 1 ? 'i' : ''} `;

    if (durationMin > 0) {
      story += `in ${durationMin} minut${durationMin === 1 ? 'o' : 'i'}.\n`;
    } else {
      story += `in pochi secondi.\n`;
    }

    story += `Hai modificato circa ${totalChanges} rig${totalChanges === 1 ? 'a' : 'he'} di codice.\n\n`;

    // Milestone narrative
    if (snaps.length >= 3) {
      story += `Hai iniziato con un'idea, l'hai migliorata passo dopo passo, `;
      story += `e hai raggiunto il risultato finale. `;
    }

    // Note degli snapshot
    const notedSnaps = snaps.filter(s => s.note);
    if (notedSnaps.length > 0) {
      story += `\n\nLe tue annotazioni lungo il percorso:\n`;
      notedSnaps.forEach((s, i) => {
        story += `  ${i + 1}. "${s.note}"\n`;
      });
    }

    if (snaps.length >= 5) {
      story += `\nHai dimostrato una grande perseveranza!`;
    } else if (snaps.length >= 2) {
      story += `\nOgni piccolo passo conta. Continua ad esplorare!`;
    }

    return story;
  }
};

/**
 * Conta quante righe sono diverse tra due stringhe
 */
function countDiffLines(oldCode, newCode) {
  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');
  let changes = Math.abs(oldLines.length - newLines.length);
  const minLen = Math.min(oldLines.length, newLines.length);
  for (let i = 0; i < minLen; i++) {
    if (oldLines[i] !== newLines[i]) changes++;
  }
  return changes;
}

export default projectHistoryService;
