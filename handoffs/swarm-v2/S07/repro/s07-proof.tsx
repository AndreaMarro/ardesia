import { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { convertToExcalidrawElements } from '@excalidraw/excalidraw'
import './src/index.css'
import Room from './src/Room'
import { pdfToImages } from './src/loadFile'
import { WorkspaceStore } from './src/store/WorkspaceStore'
import { InkSession } from './src/collaboration-v2/session'
import { InkLayer } from './src/collaboration-v2/layer'
import { readInkCheckpoint } from './src/collaboration-v2/persistence'
import type { RoomInkAdapter } from './src/collaboration-v2/RoomCollaboration'
window.EXCALIDRAW_ASSET_PATH = '/excalidraw-assets/'
location.hash='s07-proof'
const actor=new URL(location.href).searchParams.get('actor')??'alice'
const store=new WorkspaceStore(), cancellation=new AbortController()
function Proof(){
 const [prepared,setPrepared]=useState<Omit<RoomInkAdapter,'peers'>|null>(null)
 const [peers,setPeers]=useState<InkLayer[]>([]),[error,setError]=useState('')
 useEffect(()=>{void(async()=>{
  await store.init()
  const response=await fetch('/s07-proof.pdf'),pdf=await pdfToImages(new File([await response.blob()],'synthetic.pdf',{type:'application/pdf'}),1)
  const source={resourceId:pdf[0].documentId,revisionId:'synthetic-v1',sha256:pdf[0].documentId.split(':').at(-1)!,pageCount:pdf.length}
  const pages=pdf.map((_,i)=>({x:100,y:100+i*824,width:600,height:800,page:i+1}))
  if(!await store.loadScene('s07-proof'))await store.saveScene('s07-proof',JSON.stringify({
   elements:convertToExcalidrawElements(pdf.map((_,i)=>({type:'image',...pages[i],fileId:'pdf-'+i,locked:true} as any))),
   appState:{scrollX:0,scrollY:0,zoom:{value:.6}},files:Object.fromEntries(pdf.map((p,i)=>['pdf-'+i,{id:'pdf-'+i,dataURL:p.dataURL,mimeType:'image/png',created:1}]))
  }))
  const sessions=await Promise.all((['personal','shared'] as const).map(async audience=>{
   const scope={v:1 as const,roomId:'s07-proof',ownerId:actor,audience,source}
   return new InkSession(scope,(await readInkCheckpoint(store,scope))??undefined)
  }))
  setPrepared({roomId:'s07-proof',sessions:{personal:sessions[0],shared:sessions[1]},pages,signal:cancellation.signal})
 })().catch(e=>setError(String(e)))},[])
 const adapter=useMemo(()=>prepared?{...prepared,peers}:undefined,[prepared,peers])
 useEffect(()=>{
  if(!prepared)return
  ;(window as any).s07={
   source:prepared.sessions.shared.scope.source,
   dump:()=>({scope:prepared.sessions.shared.scope,snapshot:prepared.sessions.shared.checkpoint().pending??prepared.sessions.shared.checkpoint().committed,count:prepared.sessions.shared.objects().length,objects:prepared.sessions.shared.objects()}),
   visible:()=>((window as any).__MAESTRO_TEST__?.apiRef.current?.getSceneElements()??[]).filter((e:any)=>e.customData?.ardesiaInkV1).length,
   receive:(snapshot:any)=>setPeers(previous=>{
    const layer=InkLayer.restore(snapshot.scope,snapshot)
    return [...previous.filter(p=>p.scope.ownerId!==layer.scope.ownerId),layer]
   }),
   add:(id:string)=>prepared.sessions.shared.add({v:1,id,authorId:actor,source:{...prepared.sessions.shared.scope.source,page:1},kind:'stroke',color:actor==='bob'?'#963820':'#1763ff',width:.004,points:[[.2,.3,.5],[.45,.45,1]]}),
   addPersonal:(id:string)=>prepared.sessions.personal.add({v:1,id,authorId:actor,source:{...prepared.sessions.personal.scope.source,page:1},kind:'stroke',color:'#245d4b',width:.004,points:[[.15,.25,.5],[.3,.4,1]]}),
   moveGeometry:(dx:number)=>{
    const api=(window as any).__MAESTRO_TEST__.apiRef.current
    api.updateScene({elements:api.getSceneElements().map((element:any)=>element.type==='image'?{...element,x:element.x+dx}:element)})
    setPrepared(current=>current?{...current,pages:current.pages.map(page=>({...page,x:page.x+dx}))}:current)
   },
   revoke:()=>cancellation.abort(),
   gesture:()=>{const state=(window as any).__MAESTRO_TEST__.apiRef.current.getAppState();return {x:(prepared.pages[0].x+400+state.scrollX)*state.zoom.value+state.offsetLeft,y:(prepared.pages[0].y+240+state.scrollY)*state.zoom.value+state.offsetTop}},
  }
 },[prepared])
 if(!adapter)return <p role="status">Apertura PDF sintetico…{error}</p>
 return <Room store={store} collaboration={adapter}/>
}
createRoot(document.getElementById('root')!).render(<Proof/> )
