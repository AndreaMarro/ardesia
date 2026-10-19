import {useEffect,useState} from 'react'
import {studyRequest} from './apiClient'
type Access={members:string[];invitations:{id:string;actor_id:string;state:string;expires_at:number}[]}
export function AccessPanel(){
 const [data,setData]=useState<Access|null>(null),[actor,setActor]=useState(''),[token,setToken]=useState(''),[error,setError]=useState('')
 async function refresh(){const value=await studyRequest<Access>('/editions/fluidi/access');setData(value);setActor(previous=>previous||value.members[0]||'')}
 useEffect(()=>{void refresh().catch(()=>setError('Accessi non disponibili.'))},[])
 async function create(){setError('');setToken('');try{const value=await studyRequest<{token:string}>('/editions/fluidi/invitations',{actorId:actor});setToken(value.token);await refresh()}catch{setError('Invito non creato.')}}
 async function revoke(id:string){setError('');setToken('');try{await studyRequest(`/invitations/${id}`,undefined,{method:'DELETE'});await refresh()}catch{setError('Revoca non riuscita.')}}
 return <section className="study-lab"><h2>Inviti monouso sintetici</h2><p>Scadenza 15 minuti; ogni invito apre una sola sessione di un’ora. Il codice compare soltanto dopo la creazione. Nessun invio automatico a persone reali.</p>{error&&<p role="alert">{error}</p>}{data&&<><label>Studente da invitare<select value={actor} onChange={event=>{setActor(event.target.value);setToken('')}}>{data.members.map(id=><option key={id}>{id}</option>)}</select></label><button disabled={!actor} onClick={()=>void create()}>Crea invito monouso</button>{token&&<label>Codice invito appena creato<input aria-label="Codice invito appena creato" readOnly type="password" value={token} onFocus={event=>event.target.select()}/></label>}<p>Per provarlo, seleziona “Usa invito monouso” nell’accesso di un browser pulito. Il codice non va aggiunto a link o screenshot.</p><ul>{data.invitations.map(invite=><li key={invite.id}>{invite.actor_id} · {invite.state} · scade {new Date(invite.expires_at*1000).toLocaleString('it-IT')}{invite.state==='pending'&&<button onClick={()=>void revoke(invite.id)}>Revoca invito {invite.id.slice(0,6)}</button>}</li>)}</ul></>}</section>
}
