#!/usr/bin/env node
// Optional build-time authoring tool, never imported by the web runtime.
// Supply a local @echogarden/espeak-ng-emscripten@0.3.5 module; no download/API.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import crypto from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const enginePath=process.argv[2];
if(!enginePath)throw Error('Usage: node bin/web/generate_poiseuille_voice.mjs /absolute/local/espeak-ng.js');
const engine=path.resolve(enginePath), pkg=JSON.parse(fs.readFileSync(path.join(path.dirname(engine),'package.json'),'utf8'));
if(pkg.name!=='@echogarden/espeak-ng-emscripten'||pkg.version!=='0.3.5')throw Error('Pinned authoring engine required');
const manifest=JSON.parse(fs.readFileSync(process.argv[3] || path.join(root,'bin/web/poiseuille-demo.json'),'utf8'));
const {default:initialize}=await import(pathToFileURL(engine).href);
const module=await initialize(), voice=new module.eSpeakNGWorker(), chunks=[];
voice.set_voice('it');voice.set_rate(.95);voice.set_pitch(1);voice.set_range(1);
voice.synthesize(manifest.transcript,(samples)=>{if(samples?.length)chunks.push(Int16Array.from(samples));});
const sampleCount=chunks.reduce((sum,c)=>sum+c.length,0);
if(sampleCount<22050||sampleCount>22050*120)throw Error('Unexpected synthesized duration');
const wav=Buffer.alloc(44+sampleCount*2);
wav.write('RIFF',0);wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(22050,24);wav.writeUInt32LE(44100,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(sampleCount*2,40);
let at=44;for(const chunk of chunks)for(const value of chunk){wav.writeInt16LE(value,at);at+=2;}
if (manifest.audioPath !== 'lesson-demo/poiseuille.wav' && !/^courses\/audio\/[a-z0-9-]+\.wav$/.test(manifest.audioPath)) throw Error('Unsupported authoring output path');
const output=path.join(root,'apps/web/public',manifest.audioPath);fs.writeFileSync(output,wav);
console.log(JSON.stringify({engine:pkg.name,version:pkg.version,voice:'it',method:'formant synthesis; no MBROLA or recorded voice model',sampleRate:22050,seconds:sampleCount/22050,bytes:wav.length,sha256:crypto.createHash('sha256').update(wav).digest('hex')},null,2));
