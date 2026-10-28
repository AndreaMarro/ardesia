// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {CuratedCoursePractice} from '../components/CuratedCoursePractice';
import {studyRequest} from '../api';
vi.mock('../api',async original=>({...await original<typeof import('../api')>(),studyRequest:vi.fn()}));
afterEach(()=>{cleanup();vi.mocked(studyRequest).mockReset();});
it('explains provided-law extension without exposing an internal scope code',async()=>{
 const sha='a'.repeat(64),materials={curatedPractice:{bankId:'physics-semestre-2026',bankVersion:1,manifestSha256:sha,questionRefs:[{id:'extension',version:1,sha256:'b'.repeat(64),lessonId:'lesson',scope:'PROVIDED_LAW_EXTENSION'}]}};
 vi.mocked(studyRequest).mockResolvedValueOnce({bankSha256:sha}).mockResolvedValueOnce({bankSha256:sha,question:{id:'extension',version:1,prompt:'Usa la legge fornita.',format:'completion',options:[],taxonomy:{unitId:'U3',macroarea:'Fisica',microarea:'Fluido',topic:'Relazione fornita'},difficulty:{level:'base',reason:'Originale'},familyId:'extension',status:'DRAFT'}});
 const mounted=render(<CuratedCoursePractice materials={materials} editionId="course" me={{id:'learner',role:'student',synthetic:true}} lessonId="lesson"/>);fireEvent.click(screen.getByText('Problemi scelti per questa lezione e allenamenti tematici'));
 expect(await screen.findByText('Approfondimento: la legge necessaria è fornita; non è un requisito aggiuntivo del syllabus.')).toBeTruthy();expect(mounted.container.textContent).not.toContain('PROVIDED_LAW_EXTENSION');
});
