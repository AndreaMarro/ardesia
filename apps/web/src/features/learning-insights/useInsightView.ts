import {useEffect,useState} from 'react';
import {parseInsightView,viewSearch,type InsightView} from './explorer';
export function useInsightView(models:string[]){
 const [search,setSearch]=useState(()=>window.location.search);
 useEffect(()=>{const update=()=>setSearch(window.location.search);window.addEventListener('popstate',update);return()=>window.removeEventListener('popstate',update);},[]);
 const parsed=parseInsightView(search,models);
 function change(view:InsightView){
  const next=viewSearch(window.location.search,view);
  window.history.pushState(null,'',window.location.pathname+next+window.location.hash);setSearch(next);
 }
 return {...parsed,change};
}
