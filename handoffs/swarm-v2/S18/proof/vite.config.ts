import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { pdfAssets } from '../../../../apps/web/pdfAssets';
import { mathAssets } from '../../../../apps/web/mathAssets';
import { materialsPatch,sourceViewerPatch } from './consumerPatch';
export default defineConfig({
  root:resolve(import.meta.dirname,'../../../../apps/web'),
  plugins:[{name:'s18-candidate-materials-composition',enforce:'pre',transform(source,id){if(id.endsWith('/src/features/Materials.tsx'))return materialsPatch(source);if(id.endsWith('/src/components/SourceViewer.tsx'))return sourceViewerPatch(source);}},react(),pdfAssets(),mathAssets()],
  resolve:{dedupe:['react','react-dom']},
  build:{outDir:resolve(import.meta.dirname,'../../../../work/proof-dist'),emptyOutDir:true},
  server:{host:'127.0.0.1',port:5418,strictPort:true,proxy:{'/study':{target:'http://127.0.0.1:5419',changeOrigin:false}}},
});
