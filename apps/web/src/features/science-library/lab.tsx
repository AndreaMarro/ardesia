/** Private development entry using the real shell, transport and Core cookie.
 * Excluded from normal/public builds. Shared composition remains S00's writer.
 */
import {StrictMode,useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {studyRequest,type StudyMe} from '../../api';
import {beginStudySessionCheck,activateStudySession,subscribeStudySessionEnd} from '../../../../studio/src/study/sessionBoundary';
import {Shell} from '../../components/Shell';
import {signOutStudySession} from '../../../../studio/src/study/apiClient';
import {ScienceLibrary} from './ScienceLibrary';
import type {ResourceRef} from './types';
import '../../styles.css';

function Lab(){
  const [me,setMe]=useState<StudyMe|null>(null),[status,setStatus]=useState('Verifico la sessione…');
  const query=new URLSearchParams(location.search);
  const editionId=query.get('edition')||'science-s01';
  const resourceId=query.get('scienceResource'),revisionId=query.get('scienceRevision');
  const ref:ResourceRef|undefined=resourceId&&revisionId?{resourceId,revisionId}:undefined;
  useEffect(()=>{
    let active=true;const epoch=beginStudySessionCheck();const abort=new AbortController();
    const off=subscribeStudySessionEnd(()=>{setMe(null);setStatus('Sessione revocata. Accedi di nuovo dallo spazio Ardesia.');});
    void studyRequest<StudyMe>('/me',undefined,{signal:abort.signal}).then(value=>{
      if(active&&activateStudySession(epoch))setMe(value);
    }).catch(()=>{if(active)setStatus('Sessione non disponibile. Accedi dallo spazio Ardesia.');});
    return()=>{active=false;abort.abort();off();};
  },[]);
  if(!me)return <main><h1>Libreria scientifica</h1><p role="status">{status}</p></main>;
  return <Shell me={me} view="materials" onView={view=>location.assign('/?view='+view)}
    onLogout={()=>{void signOutStudySession().finally(()=>{setMe(null);setStatus('Sessione chiusa.');});}}>
    <p className="science-fine">S01 · verifica privata del consumer · dati sintetici</p>
    <ScienceLibrary me={me} editionId={editionId} context="notebook" resourceRef={ref} onResourceSaved={value=>{
      const url=new URL(location.href);url.searchParams.set('scienceResource',value.resourceId);url.searchParams.set('scienceRevision',value.revisionId);history.replaceState(null,'',url);
    }}/>
  </Shell>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><Lab/></StrictMode>);
