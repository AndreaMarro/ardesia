import { useEffect, useRef, useState } from 'react'
import { PublicCourseView } from './PublicCourseView'
import { signOutStudySession, studyRequest } from './apiClient'
import {
  activateStudySession, beginStudySessionCheck, beginStudySessionExchange, isStudySessionEpoch,
  studySessionEpoch, subscribeStudySessionEnd,
} from './sessionBoundary'
import './study.css'
import { StudyWorkspace } from './StudyWorkspace'
import {CoursePackPreview} from './CoursePackPreview'
type Me={id:string;role:'teacher'|'student';synthetic:true}
export default function StudyApp(){
  const mounted=useRef(true),pendingLogin=useRef<AbortController|null>(null)
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;pendingLogin.current?.abort()}},[])
  const [me,setMe]=useState<Me|null>(null)
  const [token,setToken]=useState('')
  const [error,setError]=useState('')
  const [invitation,setInvitation]=useState(false)
  useEffect(()=>subscribeStudySessionEnd(()=>{setMe(null);setToken('');setError('')}),[])
  useEffect(()=>{
    let mounted=true
    const epoch=beginStudySessionCheck(),controller=new AbortController()
    void studyRequest<Me>('/me',undefined,{signal:controller.signal}).then(value=>{
      if(mounted&&activateStudySession(epoch))setMe(value)
    }).catch(()=>{})
    return()=>{mounted=false;controller.abort()}
  },[])
  async function login(event:React.FormEvent){
    event.preventDefault();setError('');const epoch=beginStudySessionExchange()
    const controller=new AbortController();pendingLogin.current?.abort();pendingLogin.current=controller
    try{
      const value=await studyRequest<Me>(invitation?'/invitations/accept':'/session',{token},{signal:controller.signal})
      if(mounted.current&&activateStudySession(epoch)){setMe(value);setToken('')}
    }catch{if(mounted.current&&isStudySessionEpoch(epoch))setError('Accesso demo non valido, già usato o scaduto.')}
  }
  async function logout(all=false){
    if(await signOutStudySession(all)==='UNCONFIRMED')setError('Sei uscito da questo spazio. La revoca della sessione sul server non è confermata.')
  }
  return <main className="study-root">
    <div className="study-demo-banner">Utenti sintetici · Pagamenti di test · AI live disattivata · Contenuti DRAFT</div>
    <nav className="study-nav" aria-label="Ardesia Fisica"><a href="?vista=fisica">ARDESIA</a><span>Fisica / Semestre Filtro</span>{me&&<><button onClick={()=>void logout()}>Esci</button><button onClick={()=>void logout(true)}>Revoca tutti i miei accessi</button></>}</nav>
    {error&&<p role="alert">{error}</p>}
    {me?<StudyWorkspace key={`${studySessionEpoch()}:${me.id}`} me={me}/>:<>
      <PublicCourseView/>
      <details className="study-login"><summary>Banco contenuti DRAFT — anteprima locale</summary><CoursePackPreview/></details>
      <details className="study-login"><summary>Accedi alla demo</summary><form onSubmit={event=>void login(event)}><label><input type="checkbox" checked={invitation} onChange={event=>setInvitation(event.target.checked)}/>Usa invito monouso</label><label>Accesso sintetico<input type="password" required autoComplete="off" value={token} onChange={event=>setToken(event.target.value)}/></label><button>Accedi</button></form></details>
    </>}
    <footer>Laboratorio locale di prova · nessuna affiliazione con atenei, MUR o editori.</footer>
  </main>
}
