import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../../apps/web',import.meta.url));
export default defineConfig({root,plugins:[react()],resolve:{dedupe:['react','react-dom']},
  server:{host:'127.0.0.1',port:55510,strictPort:true,fs:{allow:[fileURLToPath(new URL('../../..',import.meta.url))]},
    proxy:{'/study':{target:'http://127.0.0.1:55511',changeOrigin:false}}},
  build:{outDir:process.env.ARDESIA_S01_BUILD_DIR||'/private/tmp/ardesia-s01-proof-dist',emptyOutDir:true,
    rollupOptions:{input:root+'/src/features/science-library/lab.html'}}});
