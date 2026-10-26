import { mergeConfig } from 'vite'
import base from '../../../../vite.config'
// @ts-expect-error Node-only SHA-pinned verification helper has no runtime browser import.
import { patchCanonicalReplay } from './canonical-patch.mjs'
export default mergeConfig(base,{plugins:[{name:'s17-canonical-replay-patch-proof',enforce:'pre',transform(source:string,id:string){if(id.endsWith('/src/ReplayView.tsx'))return patchCanonicalReplay(source)}}]})
