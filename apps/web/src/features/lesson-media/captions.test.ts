import {expect,test} from 'vitest';
import {importCaptions} from './captions';
import {defaultIndex,toVtt} from './model';
import {source} from './fixture';

const base=()=>defaultIndex(source())!;
const vtt='WEBVTT\n\nfirst\n00:00.125 --> 00:02.250\n<v Ada><b>Portata</b> &amp; pressione.</v>\n\nsecond\n00:03.500 --> 00:09.875\nIl vincolo resta Q costante.\n';
const srt='1\r\n00:00:00,125 --> 00:00:02,250\r\nPortata e pressione.\r\n\r\n2\r\n00:00:03,500 --> 00:00:09,875\r\nIl vincolo resta Q costante.\r\n';

test('adopts VTT parsing/tokenization, preserves exact source/times and exports a lossless plain-text roundtrip',async()=>{
  const original=base(),r=await importCaptions('\uFEFF'+vtt,'vtt',original,'transcript');
  expect(r.index.source).toEqual(original.source);expect(r.index.chapters).toEqual(original.chapters);
  expect(r.index.cues.map(({startMs,endMs,text})=>({startMs,endMs,text}))).toEqual([
    {startMs:125,endMs:2250,text:'Ada: Portata & pressione.'},
    {startMs:3500,endMs:9875,text:'Il vincolo resta Q costante.'},
  ]);
  const reopened=await importCaptions(toVtt(r.index),'vtt',original,'transcript');
  expect(reopened.index.cues).toEqual(r.index.cues);
  expect(original.cues).toHaveLength(1);
});

test('imports SRT via the donor and can replace chapters without changing transcript/source',async()=>{
  const original=base(),r=await importCaptions(srt,'srt',original,'chapters');
  expect(r.index.cues).toEqual(original.cues);expect(r.index.source).toEqual(original.source);
  expect(r.index.chapters.map(({atMs,title})=>({atMs,title}))).toEqual([
    {atMs:125,title:'Portata e pressione.'},{atMs:3500,title:'Il vincolo resta Q costante.'},
  ]);
});

test.each([
  ['vtt',vtt+'\nBAD BLOCK\nNO TIMESTAMP\nNon perdermi.\n'],
  ['srt',srt+'\nBAD BLOCK\nNO TIMESTAMP\nNon perdermi.\n'],
  ['vtt',vtt+'\n00:xx.000 --> 00:09.000\nNon perdermi.\n'],
  ['vtt',vtt.replace('00:03.500','00:01.500')],
  ['vtt',vtt.replace('00:09.875','00:10.001')],
  ['vtt',vtt.replace('00:02.250','00:00.125')],
  ['vtt','WEBVTT\n\n'],
  ['vtt','x'.repeat(65537)],
  ['vtt',vtt+'\u0000'],
] as const)('rejects incomplete, overlapping, out-of-duration, empty or oversized %s input atomically',async(type,text)=>{
  const original=base(),before=JSON.stringify(original);
  await expect(importCaptions(text,type,original,'transcript')).rejects.toThrow();
  expect(JSON.stringify(original)).toBe(before);
});

test('does not silently truncate cue counts or the Core resource text budget',async()=>{
  const block=(i:number,text:string)=>`${i}\n00:00:${String(i).padStart(2,'0')}.000 --> 00:00:${String(i+1).padStart(2,'0')}.000\n${text}\n`;
  const many=Array.from({length:101},(_,i)=>`00:${String(Math.floor(i/60)).padStart(2,'0')}:${String(i%60).padStart(2,'0')}.000 --> 00:${String(Math.floor((i+1)/60)).padStart(2,'0')}:${String((i+1)%60).padStart(2,'0')}.000\nx\n`).join('\n');
  await expect(importCaptions('WEBVTT\n\n'+many,'vtt',{...base(),durationMs:200000},'transcript')).rejects.toThrow();
  await expect(importCaptions('WEBVTT\n\n'+[0,1,2].map(i=>block(i,'x'.repeat(7000))).join('\n'),'vtt',base(),'transcript')).rejects.toThrow();
});

test('projects style, regions and markup as plain text; never executes HTML',async()=>{
  const raw='WEBVTT\n\nNOTE Commento editoriale\n\nSTYLE\n::cue { color: red; }\n\n00:00.000 --> 00:01.000\n<script>alert(1)</script> &lt;b&gt; &amp; Δp\n';
  const r=await importCaptions(raw,'vtt',base(),'transcript');
  expect(r.index.cues[0].text).toBe('<script>alert(1)</script> <b> & Δp');
  expect(toVtt(r.index)).toContain('&lt;script&gt;alert(1)&lt;/script&gt; &lt;b&gt; &amp; Δp');
});

test.each(['srt','vtt'] as const)('preserves literal mathematical inequalities and unknown tags in %s instead of dropping scientific text',async format=>{
  for(const text of ['La pressione Δp < 10 kPa.','Il vincolo è 0 < x < 5 e y > 2.','x<y>z','<script>testo letterale</script>']){
    const raw=(format==='vtt'?'WEBVTT\n\n':'1\n')+'00:00:00.000 --> 00:00:01.000\n'+text+'\n';
    const r=await importCaptions(raw,format,base(),'transcript');
    expect(r.index.cues[0].text).toBe(text);
  }
});

test('SRT formatting is projected while literal comparisons survive',async()=>{
  const r=await importCaptions('1\n00:00:00,125 --> 00:00:02,250\n<B>Δp</B> < 10 kPa e <i>Q</i> > 2.\n','srt',base(),'transcript');
  expect(r.index.cues[0].text).toBe('Δp < 10 kPa e Q > 2.');
});
