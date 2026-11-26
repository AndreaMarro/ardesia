from pathlib import Path
import ast,re
A=Path('/private/tmp/cric-author-a-resident/officina-di-fisica')
names=['dielectric_isolated_voltage','dielectric_connected_charge','isolated_plate_separation_energy','connected_plate_separation_charge','lorentz_force']
repls={'Le cinque alternative non sono state aperte; saranno confrontate solo dopo il congelamento di questa primaria. ':'','Le alternative non sono state aperte; saranno confrontate dopo il congelamento di questa primaria. ':'','seiN':'sei N','microq':'il prefisso micro della carica','omettev':'omette v','variazioneK':'variazione di K','Vettorev':'Il vettore v','eangolo':'e angolo','copiaF':'copia F','dàF':'dà F','ignoraB':'ignora B','Reciprocoha':'Il reciproco ha','eF/':'e F/','richiedonoB':'richiedono B','rapportoF':'rapporto di F','trattaDcomeF':'tratta D come F','eD ':'e D ','prediceD':'predice D','copiaQ':'copia Q','indipendenteB':'indipendente con B','moduloQ':'modulo Q','campoB':'campo B','perQ':'per Q','solaC':'sola C','puroQ':'numero puro Q','ometteVg':'omette Vg','microcoulombcome':'microcoulomb come','regimepiano':'regime piano','no n':'non','dato-medio':'risultato ai dati medi'}
def clean(s):
 for old,new in repls.items():s=s.replace(old,new)
 s=re.sub(r'(?<=[A-Za-zÀ-ÿΑ-ω])(?=[0-9])',' ',s);s=re.sub(r'(?<=[0-9])(?=[A-Za-zÀ-ÿΑ-ω])',' ',s)
 s=re.sub(r'(?<=[A-Za-zÀ-ÿΑ-ω])\.(?=[0-9])','. ',s);s=re.sub(r'\.([0-9]+/)','; \\1',s)
 s=s.replace('nel03','nel 03').replace('vincolo16','vincolo 16').replace('aκ','a κ').replace('aU₀','a U₀').replace('q+,','q positiva,').replace(':media',': media').replace(':rapporto',': rapporto')
 return s
for name in names:
 p=A/f'tools/corpus_engineering/{name}_verifier.py';s=p.read_text();t=ast.parse(s);lines=s.splitlines(keepends=True);changes=[]
 for node in t.body:
  if not isinstance(node,ast.Assign)or not isinstance(node.targets[0],ast.Name):continue
  key=node.targets[0].id
  if key not in ['MANUAL','DISTRACTORS','ASSUMPTIONS','SVG_REVIEW','CALCULATION_SCOPE']:continue
  value=ast.literal_eval(node.value)
  if isinstance(value,list):value=[clean(x)for x in value]
  elif isinstance(value,str):value=clean(value)
  if key=='ASSUMPTIONS'and name=='lorentz_force':value[2]='Caso autonomo: particella carica, non necessariamente q=+1 μC, soggetta soltanto a campo magnetico uniforme statico; nessun campo elettrico, altre forze o radiazione. Modello classico, massa positiva costante. Il prodotto vettoriale è ortogonale a v anche con componente parallela a B: K e rapidità si conservano. Non si impone qui v perpendicolare a B né un valore numerico della carica.'
  if key=='CALCULATION_SCOPE'and name in ['dielectric_isolated_voltage','connected_plate_separation_charge']:value[16]='SYMBOLIC_MANUAL_DERIVATION'
  changes.append((node.lineno-1,node.end_lineno,key+'='+repr(value)+'\n'))
 for start,end,replacement in reversed(changes):lines[start:end]=[replacement]
 p.write_text(''.join(lines))
print('Final review prose spacing and autonomous Lorentz03 assumptions refined; no candidate/model changes; reports need real regeneration')
