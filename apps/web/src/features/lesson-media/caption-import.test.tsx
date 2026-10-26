// @vitest-environment jsdom
import {afterEach,expect,test,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {useState} from 'react';
import {CaptionImport} from './CaptionImport';
import {MediaIndexEditor} from './MediaIndexEditor';
import {defaultIndex,INDEX_KIND,type MediaIndex} from './model';
import {source} from './fixture';

const captions='WEBVTT\n\n00:00.125 --> 00:02.250\nPortata importata &amp; pressione.\n\n00:03.500 --> 00:09.875\nSecondo frammento.\n';
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();});

test('preview does not write or replace the draft; explicit application and Core save preserve exact source/times',async()=>{
  const a=source(),saved=vi.fn(),fetch=vi.fn(async(_url:unknown,init?:RequestInit)=>{
    if(init?.method!=='POST')return Response.json(a);
    const body=JSON.parse(init.body as string);
    return Response.json({...a,id:'index',revisionId:'index-rev',kind:INDEX_KIND,text:body.text});
  });vi.stubGlobal('fetch',fetch);
  render(<MediaIndexEditor source={a} indexResource={null} initial={defaultIndex(a)!} resources={[a]} onSaved={saved}/>);
  fireEvent.change(screen.getByLabelText('Testo dei sottotitoli'),{target:{value:captions}});
  fireEvent.click(screen.getByRole('button',{name:'Analizza i sottotitoli'}));
  await screen.findByRole('button',{name:'Sostituisci la trascrizione nella bozza'});
  expect(fetch).not.toHaveBeenCalled();expect((screen.getByLabelText('Trascrizione 1') as HTMLTextAreaElement).value).not.toContain('importata');
  fireEvent.click(screen.getByRole('button',{name:'Sostituisci la trascrizione nella bozza'}));
  expect((screen.getByLabelText('Trascrizione 1') as HTMLTextAreaElement).value).toBe('Portata importata & pressione.');
  expect((screen.getByLabelText('Inizio 1 (secondi)') as HTMLInputElement).value).toBe('0.125');
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button',{name:'Salva indice e trascrizione'}));
  await waitFor(()=>expect(saved).toHaveBeenCalledOnce());
  const stored=JSON.parse(saved.mock.calls[0][0].text);
  expect(stored.source).toEqual(defaultIndex(a)!.source);
  expect(stored.cues[1]).toMatchObject({startMs:3500,endMs:9875,text:'Secondo frammento.'});
});

test('cancel and malformed input retain the draft; edits invalidate a previously valid preview',async()=>{
  const initial=defaultIndex(source())!,apply=vi.fn();
  render(<CaptionImport draft={initial} disabled={false} onApply={apply}/>);
  fireEvent.change(screen.getByLabelText('Testo dei sottotitoli'),{target:{value:captions}});
  fireEvent.click(screen.getByRole('button',{name:'Analizza i sottotitoli'}));
  fireEvent.click(await screen.findByRole('button',{name:'Annulla anteprima'}));expect(apply).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button',{name:'Analizza i sottotitoli'}));
  await screen.findByRole('button',{name:'Sostituisci la trascrizione nella bozza'});
  fireEvent.change(screen.getByLabelText('Testo dei sottotitoli'),{target:{value:captions+'\nBAD\nMISSING TIME\n'}});
  expect(screen.queryByRole('button',{name:'Sostituisci la trascrizione nella bozza'})).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Analizza i sottotitoli'}));
  await screen.findByRole('alert');expect(apply).not.toHaveBeenCalled();
});

test('a new draft or pending Core write invalidates the preview; an oversized file is rejected before reading',async()=>{
  const initial=defaultIndex(source())!,apply=vi.fn();
  const view=render(<CaptionImport draft={initial} disabled={false} onApply={apply}/>);
  fireEvent.change(screen.getByLabelText('Testo dei sottotitoli'),{target:{value:captions}});
  fireEvent.click(screen.getByRole('button',{name:'Analizza i sottotitoli'}));
  await screen.findByRole('button',{name:'Sostituisci la trascrizione nella bozza'});
  view.rerender(<CaptionImport draft={{...initial,title:'Bozza più recente'}} disabled={false} onApply={apply}/>);
  expect(screen.queryByRole('button',{name:'Sostituisci la trascrizione nella bozza'})).toBeNull();
  fireEvent.change(screen.getByLabelText('File dei sottotitoli'),{target:{files:[new File(['x'.repeat(65537)],'large.vtt')]}});
  expect(await screen.findByRole('alert')).toBeTruthy();expect(apply).not.toHaveBeenCalled();
  view.rerender(<CaptionImport draft={initial} disabled onApply={apply}/>);
  expect(screen.getByRole('button',{name:'Analizza i sottotitoli'}).matches(':disabled')).toBe(true);
});

test('a local SRT file imports chapters through preview and leaves transcript untouched',async()=>{
  function Host(){const [draft,setDraft]=useState<MediaIndex>(defaultIndex(source())!);return <><CaptionImport draft={draft} disabled={false} onApply={setDraft}/><output data-testid="draft">{JSON.stringify(draft)}</output></>;}
  render(<Host/>);
  const text='1\n00:00:00,125 --> 00:00:02,250\nPortata costante\n';
  fireEvent.change(screen.getByLabelText('File dei sottotitoli'),{target:{files:[new File([text],'capitoli.srt',{type:'application/x-subrip'})]}});
  await waitFor(()=>expect((screen.getByLabelText('Testo dei sottotitoli') as HTMLTextAreaElement).value).toBe(text));
  fireEvent.change(screen.getByLabelText('Importa come'),{target:{value:'chapters'}});
  fireEvent.click(screen.getByRole('button',{name:'Analizza i sottotitoli'}));
  fireEvent.click(await screen.findByRole('button',{name:'Sostituisci i capitoli nella bozza'}));
  const draft=JSON.parse(screen.getByTestId('draft').textContent!);
  expect(draft.chapters).toEqual([{id:'caption-1',atMs:125,title:'Portata costante'}]);
  expect(draft.cues).toEqual(defaultIndex(source())!.cues);
});
