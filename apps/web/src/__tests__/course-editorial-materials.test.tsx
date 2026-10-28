// @vitest-environment jsdom
import {afterEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import type {CourseRecord} from '../courseLearning';
import {CourseEditorialMaterials} from '../components/CourseEditorialMaterials';

function course(editorialMaterials: CourseRecord['editorialMaterials']): CourseRecord {
  return {
    pathId: 'fluidi-termodinamica', packId: 'sf-fluidi-termodinamica-v1',
    packRef: {packId: 'sf-fluidi-termodinamica-v1', packVersion: 1, packSha256: 'a'.repeat(64)},
    title: 'Fluidi e termodinamica', unitIds: ['U3', 'U5'], requiredObjectives: 57,
    completedObjectives: 0, availableLessons: 0, lessons: [], status: 'INCOMPLETE',
    editorialStatus: 'DRAFT', humanApproval: false, requirements: {}, gaps: [],
    objectiveFamilies: [{id: 'U3-01', title: 'Pressione e densità', subtargets: [
      {id: 'U3-01.02', label: 'pressione'}, {id: 'U3-01.03', label: 'densità'},
    ]}],
    editorialMaterials,
  };
}

afterEach(() => {cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals();});

describe('readable authorized course materials', () => {
  it('preserves the complete teacher rubric, decision and transfer without technical JSON', () => {
    render(<CourseEditorialMaterials course={course({atomicFinalAssessment: [{
      id: 'final-technical-id', objectiveId: 'U3-01.02',
      prompt: 'Calcola e giustifica la pressione media.', answer: {value: 4000, unit: 'Pa'},
      hints: ['Individua la forza normale.', 'Converti prima le aree.'],
      rubric: {teacherReviewRequired: true, automation: 'NO_AUTOMATIC_FREE_TEXT_MASTERY',
        criteria: [{id: 'criterion-technical-id', description: 'Distingue forza e pressione',
          expected: 'La forza normale è distribuita sull’area.', maxPoints: 0}],
        decision: 'Il docente motiva la revisione; non è una percentuale di comprensione.'},
      transfer: {prompt: 'Confronta due pistoni di aree diverse.',
        expectedEvidence: 'Uguale pressione richiede forze proporzionali alle aree.',
        hints: ['Dichiara il vincolo prima di calcolare.'],
        rubric: {criteria: ['Conserva unità e vincoli.']}},
    }]})}/>);
    fireEvent.click(screen.getByText(/Prove per gli obiettivi/));
    expect(screen.getByRole('heading', {level: 3, name: 'Pressione'})).toBeTruthy();
    for (const text of ['Calcola e giustifica la pressione media.', '4000 Pa',
      'Distingue forza e pressione', 'La forza normale è distribuita sull’area.',
      'Punteggio massimo: 0', 'Il docente motiva la revisione; non è una percentuale di comprensione.',
      'Confronta due pistoni di aree diverse.',
      'Uguale pressione richiede forze proporzionali alle aree.',
      'Individua la forza normale.', 'Dichiara il vincolo prima di calcolare.',
      'Conserva unità e vincoli.']) expect(screen.getByText(text)).toBeTruthy();
    expect(screen.queryByText('final-technical-id')).toBeNull();
    expect(screen.queryByText('criterion-technical-id')).toBeNull();
    expect(screen.queryByText('NO_AUTOMATIC_FREE_TEXT_MASTERY')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders a learner formula and recovery projection using only the supplied content', () => {
    const network = vi.fn(); vi.stubGlobal('fetch', network);
    render(<CourseEditorialMaterials course={course({
      formulaSheet: [{name: 'Pressione media', expression: 'p = F_n / A', domain: 'A > 0; forza normale.'}],
      recoveryTargets: [{itemId: 'private-item-id', objectiveId: 'U3-01.03',
        lessonId: 'private-lesson-id', feedback: 'Dividi la massa per il volume e controlla le unità.'}],
    })}/>);
    fireEvent.click(screen.getByText(/Formulario e limiti/));
    fireEvent.click(screen.getByText(/Ripasso mirato/));
    expect(screen.getByRole('heading', {level: 3, name: 'Pressione media'})).toBeTruthy();
    expect(screen.getByRole('heading', {level: 3, name: 'Densità'})).toBeTruthy();
    expect(screen.getByText('p = F_n / A')).toBeTruthy();
    expect(screen.getByText('A > 0; forza normale.')).toBeTruthy();
    expect(screen.getByText('Dividi la massa per il volume e controlla le unità.')).toBeTruthy();
    expect(screen.queryByText(/Risposta attesa/)).toBeNull();
    expect(screen.queryByText('private-item-id')).toBeNull();
    expect(screen.queryByText('private-lesson-id')).toBeNull();
    expect(network).not.toHaveBeenCalled();
  });

  it('keeps supplied prose as escaped text and handles an empty projection', () => {
    const prose = '<img src=x onerror=alert(1)> descrive un dato, non codice da eseguire.';
    const view = render(<CourseEditorialMaterials course={course({diagnostic: [{
      id: 'diag-private-id', objectiveId: 'U3-01.03', prompt: prose,
      answer: {value: 0, unit: 'kg/m³'},
      expectedEvidence: {initial: 'Dichiara il volume positivo.', transfer: 'Conserva la densità.'},
    }]})}/>);
    fireEvent.click(screen.getByText(/Diagnostica iniziale/));
    expect(screen.getByText(prose)).toBeTruthy();
    expect(screen.getByText('0 kg/m³')).toBeTruthy();
    expect(screen.getByText('Dichiara il volume positivo.')).toBeTruthy();
    expect(screen.getByText('Conserva la densità.')).toBeTruthy();
    expect(view.container.querySelector('img, script, pre')).toBeNull();
    view.rerender(<CourseEditorialMaterials course={course(null)}/>);
    expect(view.container.textContent).toBe('');
  });
});
