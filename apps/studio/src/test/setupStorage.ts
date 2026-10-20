/** Node 26 exposes an undefined native localStorage without a backing file.
 * In jsdom this can shadow the browser Storage object. Match the Storage
 * contract explicitly for those environments; preserve real jsdom Storage.
 */
import { beforeEach } from 'vitest'
beforeEach(()=>{
  if(typeof window==='undefined')return
  let missing=false
  try{missing=typeof globalThis.localStorage==='undefined'}catch{missing=true}
  if(!missing)return
  const entries=new Map<string,string>()
  const storage:Storage={
    get length(){return entries.size},
    clear(){entries.clear()},
    getItem(key){return entries.get(String(key))??null},
    key(index){return [...entries.keys()][index]??null},
    removeItem(key){entries.delete(String(key))},
    setItem(key,value){entries.set(String(key),String(value))},
  }
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:storage})
})
