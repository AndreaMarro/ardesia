import base from '../../../apps/web/vite.config';
import {fileURLToPath} from 'node:url';
export default {...base,root:fileURLToPath(new URL('../../../apps/web',import.meta.url)),
  server:{host:'127.0.0.1',port:5425,strictPort:true,proxy:{'/study':{target:'http://127.0.0.1:5426',changeOrigin:false}}}};
