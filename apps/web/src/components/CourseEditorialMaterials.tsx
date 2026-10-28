import {useId} from 'react';
import type {CourseRecord} from '../courseLearning';

type Material = Record<string, unknown>;
const proseStyle = {whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'} as const;
const collections = [
  ['diagnostic', 'Diagnostica iniziale'],
  ['formulaSheet', 'Formulario e limiti del modello'],
  ['finalAssessment', 'Verifiche di sintesi'],
  ['atomicFinalAssessment', 'Prove per gli obiettivi'],
  ['recoveryTargets', 'Ripasso mirato'],
] as const;

function record(value: unknown): Material | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Material : undefined;
}
function text(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value;
  if (typeof value === 'number' && Number.isFinite(value))
    return value.toLocaleString('it-IT', {maximumSignificantDigits: 12, useGrouping: false});
  return undefined;
}
function answer(value: unknown): string | undefined {
  const direct = text(value);
  if (direct !== undefined) return direct;
  const item = record(value);
  if (!item) return undefined;
  const result = text(item.text) ?? text(item.answerDisplay) ?? text(item.value);
  return result === undefined ? undefined : [result, text(item.unit)].filter(Boolean).join(' ');
}
function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.flatMap(item => text(item) ?? []) : [];
}
function Paragraph({label, value}: {label: string; value: unknown}) {
  const content = answer(value);
  return content === undefined ? null : <div><h4>{label}</h4><p style={proseStyle}>{content}</p></div>;
}
function TextList({label, value, ordered = false}: {label: string; value: unknown; ordered?: boolean}) {
  const items = strings(value);
  if (!items.length) return null;
  const content = items.map((item, index) => <li key={index} style={proseStyle}>{item}</li>);
  return <div><h4>{label}</h4>{ordered ? <ol>{content}</ol> : <ul>{content}</ul>}</div>;
}
function Evidence({value, label = 'Evidenza attesa'}: {value: unknown; label?: string}) {
  if (answer(value) !== undefined) return <Paragraph label={label} value={value}/>;
  const item = record(value);
  if (!item) return null;
  const parts = [
    ['initial', 'Prima prova'], ['practice', 'Esercizio'],
    ['transfer', 'Trasferimento'], ['reasoning', 'Ragionamento'],
  ].flatMap(([key, title]) => answer(item[key]) === undefined ? [] : [{title, value: answer(item[key])!}]);
  return parts.length ? <div><h4>{label}</h4><dl>{parts.map((part, index) => <div key={index}>
    <dt>{part.title}</dt><dd style={proseStyle}>{part.value}</dd>
  </div>)}</dl></div> : null;
}
function Rubric({value, label = 'Rubrica per la revisione'}: {value: unknown; label?: string}) {
  const rubric = record(value);
  if (!rubric) return null;
  const criteria = Array.isArray(rubric.criteria) ? rubric.criteria : [];
  const decision = answer(rubric.decision);
  const use = text(rubric.use);
  if (!criteria.length && !decision && !use && rubric.teacherReviewRequired !== true) return null;
  return <section aria-label={label}><h4>{label}</h4>
    {rubric.teacherReviewRequired === true && <p>Questa prova richiede la revisione del docente.</p>}
    {criteria.length > 0 && <ol>{criteria.map((criterion, index) => {
      const plain = text(criterion);
      if (plain !== undefined) return <li key={index} style={proseStyle}>{plain}</li>;
      const item = record(criterion);
      if (!item) return null;
      const description = text(item.description) ?? text(item.label) ?? `Criterio ${index + 1}`;
      const expected = answer(item.expected);
      const maximum = text(item.maxPoints);
      return <li key={index}><p><strong>{description}</strong></p>
        {expected !== undefined && <p style={proseStyle}>{expected}</p>}
        {maximum !== undefined && <p>Punteggio massimo: {maximum}</p>}
      </li>;
    })}</ol>}
    {decision && <p style={proseStyle}>{decision}</p>}
    {use && <p style={proseStyle}>{use}</p>}
  </section>;
}
function Transfer({value}: {value: unknown}) {
  if (text(value) !== undefined) return <Paragraph label="Problema di trasferimento" value={value}/>;
  const item = record(value);
  if (!item) return null;
  return <section aria-label="Problema di trasferimento">
    <Paragraph label="Problema di trasferimento" value={item.prompt}/>
    <Evidence value={item.expectedEvidence}/>
    <Paragraph label="Risposta attesa nel nuovo contesto" value={item.answer ?? item.expectedAnswer}/>
    <TextList label="Suggerimenti per il trasferimento" value={item.hints} ordered/>
    <Paragraph label="Come riprendere il ragionamento" value={item.errorFeedback}/>
    <Rubric label="Rubrica del trasferimento" value={item.rubric}/>
  </section>;
}
function title(item: Material, index: number, labels: Map<string, string>): string {
  const explicit = text(item.targetLabel) ?? text(item.name) ?? text(item.title) ?? text(item.topic);
  const objectiveIds = [item.objectiveId, ...(Array.isArray(item.objectiveIds) ? item.objectiveIds : [])];
  const objectives = [...new Set(objectiveIds.flatMap(id => typeof id === 'string' && labels.has(id) ? [labels.get(id)!] : []))];
  const result = explicit ?? (objectives.length ? objectives.join(' · ') : `Materiale ${index + 1}`);
  return result.charAt(0).toLocaleUpperCase('it-IT') + result.slice(1);
}
function MaterialItem({value, index, labels, lessonTitles}: {
  value: unknown; index: number; labels: Map<string, string>; lessonTitles: Map<string, string>;
}) {
  const plain = text(value);
  const item = record(value);
  if (!item) return plain === undefined ? null : <article><h3>Materiale {index + 1}</h3><p style={proseStyle}>{plain}</p></article>;
  const error = record(item.errorFeedback);
  const recovery = record(item.recoveryTarget);
  const recoveryId = text(item.lessonId) ?? text(error?.recoveryLessonId) ?? text(recovery?.lessonId);
  const recoveryLesson = recoveryId === undefined ? undefined : lessonTitles.get(recoveryId);
  return <article className="course-editorial-item"><h3>{title(item, index, labels)}</h3>
    <Paragraph label="Domanda" value={item.prompt}/>
    <Paragraph label="Relazione" value={item.expression ?? item.formula ?? item.relation}/>
    <Paragraph label="Quando si applica" value={item.domain}/>
    <TextList label="Ipotesi del modello" value={item.assumptions}/>
    <Paragraph label="Unità da controllare" value={item.units}/>
    <Paragraph label="Risposta attesa" value={item.answer ?? item.expectedAnswer ?? item.answerDisplay}/>
    <Evidence value={item.expectedEvidence}/>
    <Paragraph label="Feedback e recupero" value={item.feedback}/>
    <Paragraph label="Errore da riconoscere" value={error?.observedError ?? item.commonError}/>
    <Paragraph label="Come correggere l'errore" value={error?.feedback}/>
    <TextList label="Suggerimenti graduati" value={item.hints} ordered/>
    {!strings(item.hints).length && <Paragraph label="Un aiuto per ragionare" value={item.hint}/>}
    <Rubric value={item.rubric}/>
    <Transfer value={item.transfer}/>
    <Paragraph label="Passo di ripasso" value={item.action ?? recovery?.action}/>
    {recoveryLesson && <p><strong>Lezione da riprendere:</strong> {recoveryLesson}</p>}
  </article>;
}

/** Displays only the material already authorized by the course projection. */
export function CourseEditorialMaterials({course}: {course: CourseRecord}) {
  const id = useId();
  const groups = collections.flatMap(([key, label]) => {
    const items = course.editorialMaterials?.[key];
    return Array.isArray(items) && items.length ? [{key, label, items}] : [];
  });
  if (!groups.length) return null;
  const labels = new Map(course.objectiveFamilies.flatMap(family => [
    [family.id, family.title] as const,
    ...family.subtargets.map(target => [target.id, target.label] as const),
  ]));
  const lessonTitles = new Map(course.lessons.map(lesson => [lesson.id, lesson.title]));
  return <section className="course-editorial" aria-labelledby={id}>
    <h2 id={id}>Materiali per lo studio e la revisione</h2>
    <p>Consulta le relazioni, le verifiche e i percorsi di ripasso disponibili per questa edizione.</p>
    {groups.map(group => <details className="disclosure-panel" key={group.key}>
      <summary>{group.label} · {group.items.length}</summary>
      {group.items.map((item, index) => <MaterialItem key={index} value={item} index={index} labels={labels} lessonTitles={lessonTitles}/>)}
    </details>)}
  </section>;
}
