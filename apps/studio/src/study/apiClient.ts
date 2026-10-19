export class StudyApiError extends Error {
  status:number
  constructor(code:string,status:number){super(code);this.status=status}
}
export async function studyRequest<T>(path:string,body?:unknown,options:RequestInit={}):Promise<T> {
  const response=await fetch(`/study${path}`,{
    ...options,method:options.method??(body===undefined?'GET':'POST'),credentials:'same-origin',
    headers:{...(body===undefined?{}:{'Content-Type':'application/json'}),...options.headers},
    ...(body===undefined?{}:{body:JSON.stringify(body)}),
  })
  if(!response.ok){
    const error=await response.json().catch(()=>({error:'network_error'})) as {error?:string}
    throw new StudyApiError(error.error??'request_failed',response.status)
  }
  return response.json() as Promise<T>
}
export const requestKey=()=>crypto.randomUUID()
