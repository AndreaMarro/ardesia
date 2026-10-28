/** Development verification harness, excluded from normal/public build inputs.
 * It is not a published lesson or a Core persistence acceptance test. */
import {StrictMode,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {FluidThermoActivity,newLabSnapshot,type LabSnapshot} from './FluidThermoActivity';
function Harness(){
  const [snapshot,setSnapshot]=useState<LabSnapshot>(()=>newLabSnapshot());
  return <main style={{fontFamily:'system-ui,sans-serif',padding:'20px 12px'}}><p style={{textAlign:'center'}}>Verifica privata · plugin condiviso · ripresa Core verificata separatamente</p>
    <FluidThermoActivity initialSnapshot={snapshot} onSnapshotChange={setSnapshot} allowModelSelection authoringTools/>
  </main>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><Harness/></StrictMode>);
