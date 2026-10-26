// @vitest-environment jsdom
import {afterEach,expect,it} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {EvidenceExplorer} from './EvidenceExplorer';
import type {InsightAttempt} from './contracts';
const a:InsightAttempt={receiptId:'r1',activityId:'poiseuille-v1',studentId:'s1',parentId:null,receivedAt:1,modelVersion:1,packRef:{packId:'fluidi',packVersion:1,packSha256:'abc'},sourceRefs:[{resourceId:'source1',revisionId:'rev1'}],sourceState:'CURRENT',supportUsed:[],assistance:'NO_SUPPORT_REQUESTED',outcome:'MATCH',provenance:'CANONICAL_RECEIPT'};
afterEach(cleanup);
it('uses real Plot SVG and a keyboard-operable table for exact source evidence',async()=>{
 render(<EvidenceExplorer attempts={[a]} role="student"/>);
 await screen.findByRole('img',{name:'Prove conservate per verifica e aiuti richiesti'});
 fireEvent.click(screen.getByText('Tabella delle prove (1)'));
 fireEvent.click(screen.getByRole('button',{name:'Apri prova 1'}));
 expect(screen.getByRole('region',{name:'Evidenza selezionata'}).textContent).toContain('source1');
 expect(screen.getByRole('region',{name:'Evidenza selezionata'}).textContent).toContain('rev1');
});
it('suppresses chart and group values for small tutor subsets while keeping authorized rows',async()=>{
 render(<EvidenceExplorer attempts={[a]} role="teacher"/>);
 expect(screen.getByText(/meno di cinque studenti/)).toBeTruthy();
 expect(screen.queryByRole('img')).toBeNull();
 fireEvent.click(screen.getByText('Tabella delle prove (1)'));
 expect(screen.getByRole('button',{name:'Apri prova 1'})).toBeTruthy();
});

it('uses distinct integer ticks when two groups each have one receipt',async()=>{
 render(<EvidenceExplorer attempts={[a,{...a,receiptId:'r2',outcome:'MISMATCH',assistance:'SUPPORT_REQUESTED'}]} role="student"/>);
 const chart=await screen.findByRole('img',{name:'Prove conservate per verifica e aiuti richiesti'});
 const labels=[...chart.querySelectorAll('g[aria-label="x-axis tick label"] text')].map(el=>el.textContent);
 expect(labels).toEqual(['0','1']);
});
