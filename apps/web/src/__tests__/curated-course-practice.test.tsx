// @vitest-environment jsdom
import {afterEach,beforeEach,it,expect,vi} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {CuratedCoursePractice} from '../components/CuratedCoursePractice';
import {studyRequest} from '../api';
vi.mock('../api',async original=>({...await original<typeof import('../api')>(),studyRequest:vi.fn()}));
const me={id:'learner',role:'student' as const,synthetic:true as const};
const materials={curatedPractice:{bankId:'physics-semestre-2026',bankVersion:1,manifestSha256:'a'.repeat(64),questionRefs:[{id:'question-one',version:1,sha256:'b'.repeat(64),lessonId:'lesson'}]},workedProblemRefs:[],examSimulations:[]};
function open(){render(<CuratedCoursePractice materials={materials} editionId="edition" me={me} lessonId="lesson"/>);fireEvent.click(screen.getByText('Problemi scelti per questa lezione e allenamenti tematici'));}
beforeEach(()=>vi.mocked(studyRequest).mockReset());afterEach(cleanup);
it('does not substitute a changed question bank',async()=>{
 vi.mocked(studyRequest).mockResolvedValueOnce({bankSha256:'c'.repeat(64)});open();
 expect(await screen.findByText(/La banca è stata aggiornata/)).toBeTruthy();expect(studyRequest).toHaveBeenCalledTimes(1);
});
it('respects the publication gate instead of fetching teacher answers for students',async()=>{
 vi.mocked(studyRequest).mockResolvedValueOnce({bankSha256:'a'.repeat(64)}).mockRejectedValueOnce(Error('question_not_found'));open();
 expect(await screen.findByText(/Il docente può verificare la revisione/)).toBeTruthy();
 expect(vi.mocked(studyRequest).mock.calls.every(([path])=>!path.includes('/review/'))).toBe(true);
});
