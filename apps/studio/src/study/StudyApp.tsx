import { useEffect, useState } from 'react'
import { PublicCourseView } from './PublicCourseView'
import { studyRequest } from './apiClient'
import './study.css'
import { StudyWorkspace } from './StudyWorkspace'
import {CoursePackPreview} from './CoursePackPreview'
type Me={id:string;role:'teacher'|'student';synthetic:true}
export default function StudyApp(){
  const [me,setMe]=useState<Me|null>(null)
  const [token,setToken]=useState('')
  const [error,setError]=useState('')
  const [invitation,setInvitation]=useState(false)
  useEffect(()=>{studyRequest<Me>('/me').then(setMe).catch(()=>{})},[])
  async function login(event:React.FormEvent){event.preventDefault();setError('');try{setMe(await studyRequest<Me>(invitation?'/invitations/accept':'/session',{token}));setToken('')}catch{setError('Accesso demo non valido, già usato o scaduto.')}}
  return <main className="study-root">
    <div className="study-demo-banner">Utenti sintetici · Pagamenti di test · AI live disattivata · Contenuti DRAFT</div>
    <nav className="study-nav" aria-label="Ardesia Fisica"><a href="?vista=fisica">ARDESIA</a><span>Fisica / Semestre Filtro</span>{me&&<><button onClick={()=>{void studyRequest('/session',undefined,{method:'DELETE'}).then(()=>setMe(null)).catch(()=>setError('Uscita non riuscita. Riprova.'))}}>Esci</button><button onClick={()=>{void studyRequest('/session/revoke-all',{}).then(()=>setMe(null)).catch(()=>setError('Revoca non riuscita. Riprova.'))}}>Revoca tutti i miei accessi</button></>}</nav>
    {error&&<p role="alert">{error}</p>}
    {me?<StudyWorkspace me={me}/>:<>
      <PublicCourseView/>
      <details className="study-login"><summary>Banco contenuti DRAFT — anteprima locale</summary><CoursePackPreview/></details>
      <details className="study-login"><summary>Accedi alla demo</summary><form onSubmit={event=>void login(event)}><label><input type="checkbox" checked={invitation} onChange={event=>setInvitation(event.target.checked)}/>Usa invito monouso</label><label>Accesso sintetico<input type="password" required autoComplete="off" value={token} onChange={event=>setToken(event.target.value)}/></label><button>Accedi</button></form></details>
    </>}
    <footer>Laboratorio locale di prova · nessuna affiliazione con atenei, MUR o editori.</footer>
  </main>
}
