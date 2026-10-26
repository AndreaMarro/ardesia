/** A cancellation fence only; the host still decides every authorization. */
export function createPlaybackLease<Context>(access:{allowed():boolean;subscribe(listener:()=>void):()=>void;authorize(context:Context):Promise<boolean>},stop:()=>void) {
  let generation=0,disposed=false
  const unsubscribe=access.subscribe(()=>{generation++;stop()})
  return {
    async authorize(context:Context):Promise<boolean> {
      const requested=++generation
      if(disposed || !access.allowed()) return false
      const approved=await access.authorize(context)
      return approved && !disposed && access.allowed() && requested===generation
    },
    dispose(){if(disposed)return;disposed=true;generation++;unsubscribe();stop()},
  }
}
