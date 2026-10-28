// @vitest-environment jsdom
import {afterEach,describe,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {FluidThermoActivity,newLabSnapshot,labDefinitions} from '../FluidThermoActivity';
import type {LabSnapshot} from '../FluidThermoActivity';

vi.mock('../../../../../studio/plugins/fluid-thermo/LabScene3D',()=>{throw Error('chunk unavailable');});
afterEach(()=>{cleanup();vi.restoreAllMocks();});
describe('reusable lab state and fallback',()=>{
  it.each(labDefinitions)('renders $id with manipulable controls and an accessible diagram',definition=>{
      const view=render(<FluidThermoActivity configuration={newLabSnapshot(definition.id).configuration}/>);
      expect(screen.getByRole('heading',{name:definition.title})).toBeTruthy();
      expect(screen.getByRole('img',{name:new RegExp(definition.title.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))})).toBeTruthy();
      expect(screen.getAllByRole('slider').length).toBeGreaterThan(0);view.unmount();
  });
  it('keeps controls mounted for an own echo, resets to baseline, and accepts an external restore',()=>{
    const original=newLabSnapshot('hydrostatic');let emitted:LabSnapshot|undefined;
    const change=(value:LabSnapshot)=>{emitted=value;};
    const view=render(<FluidThermoActivity initialSnapshot={original} onSnapshotChange={change}/>);
    const input=screen.getByLabelText('Profondità [m]') as HTMLInputElement;
    fireEvent.change(input,{target:{value:'4'}});
    expect(emitted?.configuration.parameters.depth).toBe(4);
    view.rerender(<FluidThermoActivity initialSnapshot={emitted} onSnapshotChange={change}/>);
    expect(screen.getByLabelText('Profondità [m]')).toBe(input);
    fireEvent.click(screen.getByRole('button',{name:'Ripristina lo scenario'}));
    expect((screen.getByLabelText('Profondità [m]') as HTMLInputElement).value).toBe('2');
    const restored=newLabSnapshot('hydrostatic');restored.configuration.parameters.depth=5;
    view.rerender(<FluidThermoActivity initialSnapshot={restored} onSnapshotChange={change}/>);
    expect((screen.getByLabelText('Profondità [m]') as HTMLInputElement).value).toBe('5');
  });
  it('does not replace a valid draft when imported data is malformed',()=>{
    render(<FluidThermoActivity initialSnapshot={newLabSnapshot('hydrostatic')} authoringTools/>);
    fireEvent.change(screen.getByLabelText('Osservazioni'),{target:{value:'Conservo il mio ragionamento'}});
    fireEvent.change(screen.getByLabelText('Configurazione JSON'),{target:{value:'{"pluginVersion":"999"}'}});
    fireEvent.click(screen.getByRole('button',{name:'Valida e riapri'}));
    expect(screen.getByRole('alert').textContent).toContain('Configurazione non riconosciuta');
    expect((screen.getByLabelText('Osservazioni') as HTMLTextAreaElement).value).toBe('Conservo il mio ragionamento');
  });
  it('closes supports on reset so a visible hint cannot be called an unaided attempt',async()=>{
    let emitted:LabSnapshot|undefined;
    render(<FluidThermoActivity initialSnapshot={newLabSnapshot('hydrostatic')} onSnapshotChange={s=>{emitted=s;}}/>);
    const hint=screen.getByText('Un aiuto per ragionare').closest('details')!;
    hint.open=true;fireEvent(hint,new Event('toggle'));
    await waitFor(()=>expect(emitted?.supportUsed).toEqual(['hint']));
    fireEvent.click(screen.getByRole('button',{name:'Ripristina lo scenario'}));
    expect(hint.open).toBe(false);expect(emitted?.supportUsed).toEqual([]);
  });
  it('preserves the workspace when the lazy 3D chunk fails before WebGL is initialized',async()=>{
    vi.spyOn(console,'error').mockImplementation(()=>{});
    // Resolve the mocked module failure explicitly; do not make the assertion
    // depend on the host's dynamic-import scheduling within findBy's 1s window.
    await import('../../../../../studio/plugins/fluid-thermo/LabScene3D').catch(()=>{});
    render(<FluidThermoActivity initialSnapshot={newLabSnapshot('ideal-gas')}/>);
    fireEvent.change(screen.getByLabelText('La tua previsione'),{target:{value:'La pressione raddoppia'}});
    await act(async()=>{fireEvent.click(screen.getByRole('button',{name:'Esplora la geometria 3D'}));});
    await screen.findByRole('button',{name:'Riprendi in 2D'});
    fireEvent.click(screen.getByRole('button',{name:'Riprendi in 2D'}));
    expect((screen.getByLabelText('La tua previsione') as HTMLInputElement).value).toBe('La pressione raddoppia');
    expect(screen.getByRole('img',{name:/Gas ideale e pistone/})).toBeTruthy();
  });
  it('does not claim an edited snapshot was saved when an older save resolves',async()=>{
    let resolve:(()=>void)|undefined;
    const saved=new Promise<void>(done=>{resolve=done;});
    render(<FluidThermoActivity initialSnapshot={newLabSnapshot('hydrostatic')} onSave={()=>saved}/>);
    fireEvent.click(screen.getByRole('button',{name:'Salva la configurazione nel corso'}));
    fireEvent.change(screen.getByLabelText('Osservazioni'),{target:{value:'Nuova osservazione'}});
    await act(async()=>resolve?.());
    expect(screen.queryByText('Salvataggio confermato dall’host.')).toBe(null);
    expect(screen.getByRole('alert').textContent).toContain('Le modifiche aperte restano da salvare');
  });
});
