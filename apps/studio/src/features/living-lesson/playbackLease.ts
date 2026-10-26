import type { LessonAccess, LessonMoment } from './model'
/** A cancellation fence only; the host still decides every authorization. */
export function createPlaybackLease(access:LessonAccess,stop:()=>void) {
  let generation=0,disposed=false
  const unsubscribe=access.subscribe(()=>{generation++;stop()})
  return {
    async authorize(moment:LessonMoment):Promise<boolean> {
      const requested=++generation
      if(disposed || !access.allowed()) return false
      const approved=await access.authorize(moment)
      return approved && !disposed && access.allowed() && requested===generation
    },
    dispose(){if(disposed)return;disposed=true;generation++;unsubscribe();stop()},
  }
}
