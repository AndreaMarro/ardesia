// @vitest-environment jsdom
import {afterEach,expect,test,vi} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {SourceViewer} from '../../components/SourceViewer';
const reference={resourceId:'source',revisionId:'exact',contextId:'context'};
function serve(kind:string,body:unknown){
 const text=typeof body==='string'?body:JSON.stringify(body);
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({id:'source',revisionId:'exact',contextId:'context',kind,text,ownerId:'student-s06',visibility:'private',sha256:'a'.repeat(64)}))));
 return text;
}
afterEach(()=>{cleanup();vi.unstubAllGlobals();});

test('editorial receipt source never exposes a future solution or raw JSON selection',async()=>{
 serve('independent-study-source-v1',{title:'Fonte molla',editorialStatus:'DRAFT',humanApproval:false,transfer:{answer:{value:'CANARY_FUTURE_SOLUTION'}}});
 render(<SourceViewer reference={reference} onSelect={vi.fn()}/>);
 await screen.findByText('Fonte molla');
 expect(screen.queryByText(/CANARY_FUTURE_SOLUTION/)).toBeNull();
 expect(screen.queryByLabelText('Originale della fonte')).toBeNull();
 expect(screen.getByText('exact')).toBeTruthy();
});

test.each([['Controllo F/k < 2',0],['🔬 F/k < 2',1]])('attempt reader keeps Core citation indices for %s',async(reasoning,astral)=>{
 const raw=serve('independent-study-attempt-v1',{schemaVersion:1,phase:'practice',answer:{value:999,unit:'m',reasoning},assistance:{observed:['hint-1'],external:'UNKNOWN'}});
 const selected=vi.fn();render(<SourceViewer reference={reference} onSelect={selected}/>);
 await screen.findByRole('heading',{name:'Tentativo di studio autonomo'});
 expect(screen.getByText(reasoning)).toBeTruthy();
 expect(screen.getByText(/indizio 1/)).toBeTruthy();
 const original=screen.getByLabelText('Originale della fonte') as HTMLTextAreaElement;
 expect(original.closest('details')?.open).toBe(false);
 fireEvent.click(screen.getByText('Cita l’originale strutturato'));
 const start=raw.indexOf('F/k');original.focus();original.setSelectionRange(start,start+3);fireEvent.select(original);
 expect(selected).toHaveBeenCalledWith(start-astral,start+3-astral,'F/k');
});

test.each(['independent-study-source-v1','independent-study-attempt-v1','independent-study-plan-v1'])('malformed %s fails closed without falling back to raw bytes',async(kind)=>{
 serve(kind,'CANARY_MALFORMED_JSON');render(<SourceViewer reference={reference} onSelect={vi.fn()}/>);
 await screen.findByText(/non è leggibile/);
 expect(screen.queryByText(/CANARY_MALFORMED_JSON/)).toBeNull();
 expect(screen.queryByLabelText('Originale della fonte')).toBeNull();
});

test('ordinary notes retain their original reader and exact selection contract',async()=>{
 serve('notes','Una nota ordinaria F/k');render(<SourceViewer reference={reference} onSelect={vi.fn()}/>);
 expect((await screen.findByLabelText('Originale della fonte') as HTMLTextAreaElement).value).toBe('Una nota ordinaria F/k');
});
