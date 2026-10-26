import {describe,expect,it} from 'vitest';
import {readScienceSelection,scienceResourceHref} from '../resourceNavigation';

describe('scientific resource navigation',()=>{
  it('keeps a closed entry without a reference or explicit request',()=>{
    expect(readScienceSelection('?view=materials')).toEqual({open:false,invalid:false});
  });
  it('round trips exact resource and revision IDs through the real Materials route',()=>{
    const ref={resourceId:'resource/a?b',revisionId:'revision&2'};
    const url=new URL(scienceResourceHref('edition/a',ref),'https://example.invalid/studio/room');
    expect(url.pathname).toBe('/');
    expect(url.searchParams.get('view')).toBe('materials');
    expect(url.searchParams.get('edition')).toBe('edition/a');
    expect(readScienceSelection(url.search)).toEqual({open:true,invalid:false,resourceRef:ref});
  });
  it('requires an explicit request to open a new experiment',()=>{
    const url=new URL(scienceResourceHref('edition'),'https://example.invalid');
    expect(readScienceSelection(url.search)).toEqual({open:true,invalid:false});
  });
  it('refuses partial, empty, duplicated or oversized references without choosing latest',()=>{
    for(const search of ['?scienceResource=old','?scienceRevision=old','?scienceResource=&scienceRevision=r',
      '?scienceResource=a&scienceRevision=r&scienceRevision=r','?scienceResource=a&scienceResource=b&scienceRevision=r',
      '?scienceResource=%00&scienceRevision=r','?scienceResource='+('a'.repeat(129))+'&scienceRevision=r']){
      expect(readScienceSelection(search),search).toEqual({open:true,invalid:true});
    }
  });
});
