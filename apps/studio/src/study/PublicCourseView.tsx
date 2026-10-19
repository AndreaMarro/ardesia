import { useEffect, useRef, useState } from 'react'
import { PhysicsActivity } from './PhysicsActivity'
import { requestKey, studyRequest } from './apiClient'
export type PublicCourse={id:string;capacity:number;priceMinor:number;state:string;sessions:{start:string;end:string}[];timezone:string;confirmedTest:number;available:number;title:string;scope:string;duration:string}
export function PublicCourseView(){
  const [course,setCourse]=useState<PublicCourse|null>(null)
  const [contact,setContact]=useState('')
  const [consent,setConsent]=useState(false)
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)
  const key=useRef(requestKey())
  useEffect(()=>{studyRequest<PublicCourse>('/course').then(setCourse).catch(()=>setMessage('La scheda corso non è disponibile. Riprova.'))},[])
  async function interest(event:React.FormEvent){
    event.preventDefault();setBusy(true);setMessage('')
    try{
      const receipt=await studyRequest<{id:string}>('/interests',{editionId:course?.id,contact,topic:'fluidi',slots:['slot-a'],consent},{headers:{'Idempotency-Key':key.current}})
      setMessage(`Interesse ricevuto · riferimento ${receipt.id}`)
    }catch{setMessage('Interesse non registrato. Conserva i dati e riprova.')}
    finally{setBusy(false)}
  }
  return <>
    <header className="study-hero"><p className="study-eyebrow">ARDESIA / FISICA</p><h1>Prima prevedi.<br/>Poi metti alla prova l’idea.</h1><p>Un laboratorio su proporzioni e fluidi. La lezione continua nel tuo lavoro.</p><a className="study-primary" href="#physics-title">Prova il laboratorio</a></header>
    <PhysicsActivity/>
    <section className="study-offer" aria-labelledby="course-title"><p className="study-eyebrow">Il primo gruppo</p><h2 id="course-title">{course?.title??'Fisica: relazioni e fluidi'}</h2>
      {course&&<><p>{course.scope}</p><p><strong>{(course.priceMinor/100).toLocaleString('it-IT',{style:'currency',currency:'EUR'})} totali · {course.duration}</strong></p><p>Massimo {course.capacity} · {course.confirmedTest} iscrizioni di test · {course.available} posti di test disponibili</p>
      {course.sessions.length>0?<ul>{course.sessions.map(session=><li key={session.start}>{new Date(session.start).toLocaleString('it-IT',{timeZone:course.timezone})}</li>)}</ul>:<p>Calendario in definizione. Nessuna data confermata.</p>}</>}
      <p>Demo sintetica: prezzo proposto, nessuna vendita attiva. Due revisioni per studente e accesso di 30 giorni sono condizioni da confermare prima del pilot.</p>
      <form onSubmit={event=>void interest(event)}><h3>Trova un gruppo</h3><p>Nella demo usa un indirizzo sintetico che termina con .invalid.</p>
        <label>Contatto sintetico<input type="email" required value={contact} onChange={event=>{setContact(event.target.value);key.current=requestKey()}} placeholder="studente@example.invalid"/></label>
        <label className="study-checkbox"><input type="checkbox" required checked={consent} onChange={event=>{setConsent(event.target.checked);key.current=requestKey()}}/>Acconsento alla registrazione di questa richiesta sintetica</label>
        <button className="study-primary" disabled={busy||!course}>Invia interesse</button><p role="status">{message}</p>
      </form>
    </section>
  </>
}
