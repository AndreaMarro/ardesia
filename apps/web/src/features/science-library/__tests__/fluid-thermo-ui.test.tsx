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
  it.each([
    ['manometer',/p₁ − p₂ =/],['hydrostatic',/Δp =/],['pascal',/F₂ =/],
    ['buoyancy',/F_A =/],['continuity',/v₂ =/],['venturi',/p₂ =/],
    ['poiseuille',/u parete =/],['hydraulic-network',/R equivalente =/],
    ['capillary',/p_gas − p_liquido =/],['ideal-gas',/Stato selezionato/],
    ['calorimetry',/Equilibrio comune:/],['phase-change',/frazione fusa =/],
    ['heat-transfer',/[\d,]+ W/],['process',/W =/],
    ['carnot',/Isoterma calda/],['entropy',/ΔS₁ =/],
  ] as const)('reveals %s solved diagram data only after prediction and comparison',(id,solved)=>{
    const view=render(<FluidThermoActivity initialSnapshot={newLabSnapshot(id)}/>);
    const diagram=()=>view.container.querySelector('svg.lab-diagram')!;
    expect(diagram().textContent).not.toMatch(solved);
    expect(view.container.querySelector('.ft-observation strong')).toBe(null);
    expect(screen.queryByText('Misure e dati equivalenti')).toBe(null);
    fireEvent.change(screen.getByLabelText('La tua previsione'),{target:{value:'Prevedo un cambiamento e ne controllo il segno'}});
    expect(diagram().textContent).not.toMatch(solved);
    fireEvent.click(screen.getByRole('button',{name:'Confronta con il modello'}));
    expect(diagram().textContent).toMatch(solved);
    expect(view.container.querySelector('.ft-observation strong')).toBeTruthy();
    expect(screen.getByText('Misure e dati equivalenti')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('La tua previsione'),{target:{value:'Rivedo la previsione'}});
    expect(diagram().textContent).not.toMatch(solved);
    expect(screen.queryByText('Misure e dati equivalenti')).toBe(null);
  });
  it('conceals the previous solved values when the parameters change',()=>{
    const view=render(<FluidThermoActivity initialSnapshot={newLabSnapshot('hydrostatic')}/>);
    fireEvent.change(screen.getByLabelText('La tua previsione'),{target:{value:'La pressione aumenta'}});
    fireEvent.click(screen.getByRole('button',{name:'Confronta con il modello'}));
    expect(view.container.querySelector('svg')?.textContent).toContain('Δp =');
    fireEvent.change(screen.getByLabelText('Profondità [m]'),{target:{value:'4'}});
    expect(view.container.querySelector('svg')?.textContent).not.toContain('Δp =');
    expect(view.container.querySelector('.ft-observation strong')).toBe(null);
  });
  it.each([
    ['buoyancy',{bodyDensity:1500,fluidDensity:1000},/questo corpo non può galleggiare/],
    ['process',{path:4},/nessuna area del grafico rappresenta il lavoro, che è zero/],
  ] as const)('reveals %s computed conclusions only during the comparison',(id,parameters,conclusion)=>{
    const initial=newLabSnapshot(id);Object.assign(initial.configuration.parameters,parameters);
    const view=render(<FluidThermoActivity initialSnapshot={initial}/>);
    expect(screen.queryByText(conclusion)).toBe(null);
    expect(screen.getByText('Modello, formula e intervalli di validità')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('La tua previsione'),{target:{value:'Prevedo il comportamento a partire dai dati'}});
    fireEvent.click(screen.getByRole('button',{name:'Confronta con il modello'}));
    expect(screen.getByText(conclusion)).toBeTruthy();
    fireEvent.change(screen.getByLabelText('La tua previsione'),{target:{value:'Rivedo il ragionamento'}});
    expect(screen.queryByText(conclusion)).toBe(null);
    fireEvent.click(screen.getByRole('button',{name:'Confronta con il modello'}));
    expect(screen.getByText(conclusion)).toBeTruthy();
    const input=view.container.querySelector('.ft-parameter input[type=number]') as HTMLInputElement;
    fireEvent.change(input,{target:{value:String(Number(input.value)*1.1)}});
    expect(screen.queryByText(conclusion)).toBe(null);
  });
  it('keeps domain errors available before a prediction or comparison',()=>{
    render(<FluidThermoActivity initialSnapshot={newLabSnapshot('hydrostatic')}/>);
    fireEvent.change(screen.getByLabelText('Profondità [m]'),{target:{value:'-1'}});
    expect(screen.getByRole('alert').textContent).toContain('Profondità');
    expect((screen.getByRole('button',{name:'Confronta con il modello'}) as HTMLButtonElement).disabled).toBe(true);
  });
  it('conceals the Poiseuille velocity graph and vectors until comparison',()=>{
    const view=render(<FluidThermoActivity initialSnapshot={newLabSnapshot('poiseuille')}/>);
    const graph=()=>view.container.querySelector('svg.lab-diagram')!;
    expect(graph().querySelector('polyline')).toBe(null);
    expect(graph().querySelector('[marker-end]')).toBe(null);
    fireEvent.change(screen.getByLabelText('La tua previsione'),{target:{value:'Confronto velocità al centro e alla parete'}});
    fireEvent.click(screen.getByRole('button',{name:'Confronta con il modello'}));
    expect(graph().querySelector('polyline')).toBeTruthy();
    expect(graph().querySelector('[marker-end]')).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:'Ripristina lo scenario'}));
    expect(graph().querySelector('polyline')).toBe(null);
    expect(graph().querySelector('[marker-end]')).toBe(null);
  });
  it('describes free expansion as two equilibrium states without a work area',()=>{
    const initial=newLabSnapshot('process');initial.configuration.parameters.path=4;
    const view=render(<FluidThermoActivity initialSnapshot={initial}/>);
    fireEvent.change(screen.getByLabelText('La tua previsione'),{target:{value:'Il gas si espande nel vuoto'}});
    fireEvent.click(screen.getByRole('button',{name:'Confronta con il modello'}));
    expect(view.container.querySelector('svg desc')?.textContent).toContain('solo due stati di equilibrio');
    expect(view.container.querySelector('svg desc')?.textContent).toContain('Nessun cammino intermedio');
    expect(view.container.querySelector('svg polygon')).toBe(null);
    const paths=[...view.container.querySelectorAll('svg polyline')];
    expect(paths).toHaveLength(2);
    expect(paths.every(path=>path.getAttribute('points')?.trim().split(/\s+/).length===1)).toBe(true);
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
    expect(screen.queryByText('Configurazione salvata.')).toBe(null);
    expect(screen.getByRole('alert').textContent).toContain('Le modifiche aperte restano da salvare');
  });
});
