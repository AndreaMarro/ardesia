import {createServer} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('./',import.meta.url)),repo=fileURLToPath(new URL('../../../../',import.meta.url));
const server=await createServer({configFile:false,root,plugins:[react()],resolve:{alias:{'@s06':path.join(repo,'apps/web/src/features/independent-study'),'@s06styles':path.join(repo,'apps/web/src/styles.css')},dedupe:['react','react-dom']},server:{host:'127.0.0.1',port:5360,strictPort:true,fs:{allow:[repo]},proxy:{'/study':{target:'http://127.0.0.1:5361'}}}});await server.listen();server.printUrls();
