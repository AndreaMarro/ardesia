import { useEffect, useState } from 'react'
import { PublicCourseView } from './PublicCourseView'
import { studyRequest } from './apiClient'
import './study.css'
type Me={id:string;role:'teacher'|'student';synthetic:true}
export default function StudyApp(){
  const [me,setMe]=useState<Me|null>(null)
  const [token,setToken]=useState('')
  const [error,setError]=useState('')
  useEffect(()=>{studyRequest<Me>('/me').then(setMe).catch(()=>{})},[])
  async function login(event:React.FormEvent){event.preventDefault();setError('');try{setMe(await studyRequest<Me>('/session',{token}));setToken('')}catch{setError('Accesso demo non valido o scaduto.')}}
  return <main className="study-root">
    <div className="study-demo-banner">Utenti sintetici · Pagamenti di test · AI live disattivata · Contenuti DRAFT</div>
    <nav className="study-nav" aria-label="Ardesia Fisica"><a href="?vista=fisica">ARDESIA</a><span>Fisica / Semestre Filtro</span>{me&&<button onClick={()=>{void studyRequest('/session',undefined,{method:'DELETE'}).then(()=>setMe(null))}}>Esci</button>}</nav>
    {me?<section><h1>Sessione attiva</h1><p>{me.role==='teacher'?'Tutor sintetico':'Studente sintetico'} · {me.id}</p></section>:<>
      <PublicCourseView/>
      <details className="study-login"><summary>Accedi alla demo</summary><form onSubmit={event=>void login(event)}><label>Accesso sintetico<input type="password" required autoComplete="off" value={token} onChange={event=>setToken(event.target.value)}/></label><button>Accedi</button><p role="alert">{error}</p></form></details>
    </>}
    <footer>Laboratorio locale di prova · nessuna affiliazione con atenei, MUR o editori.</footer>
  </main>
}
