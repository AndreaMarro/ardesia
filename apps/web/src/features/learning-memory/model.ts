export type MemoryReference = {resourceId:string;revisionId:string;sha256?:string;start?:number;end?:number;quote?:string};
export type NoteBody = {title:string;text:string;classification:string;concepts:string[];sourceRefs:MemoryReference[];links:string[]};
export type MemoryNote = NoteBody & {id:string;version:number;sourceState:string;updatedAt?:number;backlinks?:string[]};
export type MemoryNode = {id:string;kind:string;label:string;text?:string;reference?:MemoryReference;status?:string;sourceState?:string;contested?:boolean};
export type GraphView = {version:number;layout:'grid'|'breadthfirst'|'circle';positions:{id:string;x:number;y:number}[];zoom:number;pan:{x:number;y:number}};
export type MemoryPacket = {notes:MemoryNote[];nodes:MemoryNode[];edges:{source:string;target:string;relation:string}[];limits:string[];view?:GraphView};
export const classifications:Record<string,string> = {idea:'Idea',annotation:'Annotazione',observation:'Osservazione',
  hypothesis:'Ipotesi',correction:'Rettifica',undetermined:'Non determinato',not_understood:'Non ho capito'};
export const relations:Record<string,string> = {tagged:'riguarda',links_to:'riprende',cites:'cita',attempt_of:'ha un tentativo',
  reviewed_by:'ha una review',observed_on:'ha un’osservazione',new_attempt:'propone una nuova prova'};
export const diaryStates:Record<string,string> = {CANDIDATE:'Ipotesi da verificare',OPEN:'Osservazione del tutor',
  PRACTISING:'Nuova prova da rivedere',RECURRED:'Osservazione da riprendere',DISMISSED:'Rettificata o archiviata',
  VERIFIED_RESOLVED:'Verificato su una nuova prova'};
export function noteBody(note:MemoryNote):NoteBody {
  const {title,text,classification,concepts,sourceRefs,links}=note;
  return {title,text,classification,concepts,sourceRefs,links};
}
