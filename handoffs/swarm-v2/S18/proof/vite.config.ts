import { defineConfig, mergeConfig } from 'vite';
import { resolve } from 'node:path';
import webConfig from '../../../../apps/web/vite.config';

// The consumer and installers are mounted in product source. No proof-only transforms.
export default mergeConfig(webConfig, defineConfig({
  root:resolve(import.meta.dirname,'../../../../apps/web'),
  build:{outDir:resolve(import.meta.dirname,'../../../../work/proof-dist'),emptyOutDir:true},
  server:{host:'127.0.0.1',port:5418,strictPort:true,proxy:{'/study':{target:'http://127.0.0.1:5419',changeOrigin:false}}},
}));
