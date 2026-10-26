import type {StudyResource} from '../../api';
import {ErrorNotice} from '../../components/Feedback';
import {scienceResourceHref} from './resourceNavigation';
import {scienceSummary} from './resourceSummary';

/** Display only: the exact Core revision was authorized by SourceViewer.
 * No JSON is executed, and a summary never claims this model is installed.
 */
export function ScienceResourceView({resource}:{resource:StudyResource}){
  const summary=scienceSummary(resource);
  if(!summary)return <ErrorNotice message="Questa configurazione scientifica non è leggibile. La revisione originale resta conservata; il JSON non viene mostrato come spiegazione."/>;
  return <article aria-label="Configurazione scientifica salvata">
    <h3>Configurazione scientifica salvata</h3>
    <p>{summary.note||'Nessun ragionamento annotato.'}</p>
    {summary.prediction&&<p>Previsione annotata: {summary.prediction}</p>}
    <p className="fine-print">{summary.capabilityId} · versione {summary.capabilityVersion}. Questo riferimento conserva dati e testo; il modello non viene eseguito durante la lettura.</p>
    <a href={scienceResourceHref(resource.editionId,{resourceId:resource.id,revisionId:resource.revisionId})}>Apri questa configurazione</a>
  </article>;
}
