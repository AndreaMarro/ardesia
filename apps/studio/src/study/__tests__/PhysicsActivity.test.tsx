// @vitest-environment jsdom
import {afterEach,expect,test,vi} from 'vitest'
import {cleanup,fireEvent,render,screen} from '@testing-library/react'
import {PhysicsActivity} from '../PhysicsActivity'
afterEach(()=>{cleanup();vi.unstubAllGlobals()})
test('failed boundary change never labels an old pressure result as fixed flow',async()=>{
 let count=0
 vi.stubGlobal('fetch',async()=>{count++;if(count>1)throw new Error('offline');return new Response(JSON.stringify({ratio:5.0625,fixedQuantity:'pressure',calculatedVariable:'Q/Q0',domain:'idealized'}),{status:200})})
 render(<PhysicsActivity/>);await screen.findByText(/Q\/Q0 = 5,0625/)
 fireEvent.change(screen.getByRole('combobox',{name:'Grandezza fissata'}),{target:{value:'flow'}})
 await screen.findByRole('alert')
 expect(screen.queryByTestId('physics-ratio')).toBeNull()
})
