// @vitest-environment jsdom
import {afterEach,expect,test,vi} from 'vitest'
import {cleanup,fireEvent,render,screen} from '@testing-library/react'
import {CoursePackPreview} from '../CoursePackPreview'
afterEach(()=>{cleanup();vi.unstubAllGlobals()})
test('draft preview exposes original content and hides result after failed input change',async()=>{
 vi.stubGlobal('fetch',async(url:string,init?:RequestInit)=>{
  if(url.includes('/coursepack'))return new Response(JSON.stringify({title:'Originale',scope:'Modulo limitato',status:'DRAFT',activities:[{id:'units-v1',title:'Unità'}],exercises:[{id:'RF-01',session:1,activityId:'units-v1',prompt:'Area originale',solution:'Quadrato',answer:{value:100,unit:'cm²'}}],transferTests:[{id:'TR-A',title:'Nuovo problema',instructions:'Senza aiuti',items:[]}],reviewRubric:['Unità']}))
  const body=JSON.parse(String(init?.body));if(body.parameters.value===2)throw new Error('offline')
  return new Response(JSON.stringify({value:10000,unit:'cm²',calculatedVariable:'Valore convertito',domain:'Area geometrica'}))
 })
 render(<CoursePackPreview/>);await screen.findByText('Area originale');await screen.findByText('Valore convertito: 10.000 cm²')
 expect(screen.getByText(/Revisione scientifica umana: da eseguire/)).toBeTruthy()
 fireEvent.change(screen.getByLabelText('Valore iniziale'),{target:{value:'2'}})
 await screen.findByRole('alert');expect(screen.queryByText('Valore convertito: 10.000 cm²')).toBeNull()
})
