import {expect, test} from 'vitest';
import {readLessonPassage} from '../../components/lessonPassageReference';
import {defaultIndex, parseIndex, replayAt, toVtt, type MediaIndex} from './model';
import {source} from './fixture';


test('two takes stay distinct, text edits keep exact timecodes and replay pins',()=>{
  const a=defaultIndex(source())!;const b=defaultIndex(source('second','take-two'))!;
  expect(a.source).not.toEqual(b.source);
  const edited={...a,cues:a.cues.map(c=>({...c,text:'Testo corretto'}))};
  expect(parseIndex(JSON.stringify(edited))).toEqual(edited);
  expect(edited.cues[0].startMs).toBe(0);expect(edited.cues[0].endMs).toBe(10000);
  const url=new URL(replayAt(source(),4500)!);
  expect(url.searchParams.get('at')).toBe('5500');expect(url.searchParams.get('recording')).toBe('take-one');
  expect(url.searchParams.get('sha')).toBe('a'.repeat(64));
  expect(replayAt(source(),10001)).toBeNull();
});

test('rejects unknown fields, overlaps, floating times, duplicate chapters and empty captions',()=>{
  const a=defaultIndex(source())!;
  const changes:MediaIndex[]=[{...a,cues:[{...a.cues[0],startMs:0.5}]},{...a,cues:[...a.cues,{...a.cues[0],id:'two'}]},
    {...a,chapters:[...a.chapters,{id:'two',atMs:0,title:'second'}]},{...a,cues:[{...a.cues[0],text:''}]}];
  for(const value of changes)expect(parseIndex(JSON.stringify(value))).toBeNull();
  expect(parseIndex(JSON.stringify({...a,remoteUrl:'https://wrong.invalid'}))).toBeNull();
});

test('captions export uses millisecond timecodes and escapes cue payload markup',()=>{
  const a=defaultIndex(source())!;a.cues[0].text='<script> & -->';
  expect(toVtt(a)).toContain('00:00:00.000 --> 00:00:10.000\n&lt;script&gt; &amp; --&gt;');
});

test('earlier audio cues do not claim an object version that only exists at the canonical anchor',()=>{
  const a=source(),d=readLessonPassage(a)!.descriptor;
  const earlier=new URL(replayAt(a,0)!);
  expect(earlier.searchParams.get('at')).toBe(String(d.startEpoch));
  expect(earlier.searchParams.has('object')).toBe(false);
  expect(new URL(replayAt(a,10000)!).searchParams.get('objectVersion')).toBe('1');
});
