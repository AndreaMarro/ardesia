/** Cancels stale asynchronous UI intents without granting any authority. */
export function createIntentFence(){
 let revision=0
 return {
  begin(){const requested=++revision;return()=>requested===revision},
  invalidate(){revision++},
 }
}
