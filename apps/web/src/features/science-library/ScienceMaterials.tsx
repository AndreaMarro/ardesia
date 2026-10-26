import {lazy, Suspense, useEffect, useState} from 'react';
import type {StudyMe} from '../../api';
import {ErrorNotice, Loading} from '../../components/Feedback';
import {readScienceSelection, scienceResourceHref, type ScienceSelection} from './resourceNavigation';

const Library=lazy(()=>import('./ScienceLibrary').then(m=>({default:m.ScienceLibrary})));

/** The parent keys this entry by actor and edition; Core owns all saved state. */
export function ScienceMaterials({me,editionId,onUpdate}:{me:StudyMe;editionId:string;onUpdate:()=>Promise<void>}){
  const [selection,setSelection]=useState<ScienceSelection>(()=>readScienceSelection(location.search));
  const [refreshError,setRefreshError]=useState('');
  useEffect(()=>{
    const pop=()=>{setRefreshError('');setSelection(readScienceSelection(location.search));};
    addEventListener('popstate',pop);return()=>removeEventListener('popstate',pop);
  },[]);
  function toggle(){
    const url=new URL(location.href);
    for(const key of ['scienceLibrary','scienceResource','scienceRevision'])url.searchParams.delete(key);
    if(!selection.open)url.searchParams.set('scienceLibrary','1');
    history.pushState(null,'',url);setSelection(readScienceSelection(url.search));setRefreshError('');
  }
  return <section className="disclosure-panel" aria-label="Esperimenti scientifici privati">
    <h2>Prevedi, sperimenta, ritrova.</h2>
    <p>Quattro percorsi condividono gli strumenti del Core. Salva una configurazione e il tuo ragionamento nei Materiali privati dell’edizione.</p>
    <button type="button" aria-expanded={selection.open} onClick={toggle}>
      {selection.open?'Chiudi la libreria scientifica':'Apri la libreria scientifica'}
    </button>
    {selection.open&&(selection.invalid
      ?<ErrorNotice message="Riferimento scientifico non valido: servono risorsa e revisione esatte. Nessuna versione diversa è stata aperta."/>
      :<Suspense fallback={<Loading>Apro la libreria scientifica…</Loading>}>
        <Library me={me} editionId={editionId} resourceRef={selection.resourceRef} onResourceSaved={ref=>{
          history.replaceState(null,'',scienceResourceHref(editionId,ref));
          // Keep the open experiment/result; cold reopen uses the exact saved URL.
          void onUpdate().catch(()=>setRefreshError('Configurazione salvata. L’elenco dei Materiali non è aggiornato; riapri la pagina per ricaricarlo.'));
        }}/>
      </Suspense>)}
    {refreshError&&<ErrorNotice message={refreshError}/>}
  </section>;
}
