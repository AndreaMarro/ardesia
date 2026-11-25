"""Add the missing axial geometry and direct-path conditions to an echo example."""
import base64
from copy import deepcopy
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,formula

BATCH='examples-echo-revisions-105'
SOURCE_PATH='officina-di-fisica/content/C5.json'
ASSET='echo-direct-paths.svg'

def assemble(repo,source_ref):
    source=next(r for r in json.loads(git_bytes(repo,source_ref,SOURCE_PATH)) if r['id']=='C5-E009')
    raw=(Path(__file__).resolve().parents[2]/'editorial/assets'/ASSET).read_bytes();key=sha(raw)
    row=deepcopy(source);row.update(version=source['version']+1,baseVersion=source['version'])
    row['prompt']='In un blocco la velocità del suono lungo il percorso considerato è uniforme e vale v=1500 m/s. Due sottili riflettori piani, fermi e parzialmente trasmittenti, sono paralleli fra loro e perpendicolari all’asse del fascio rettilineo. Lo stesso trasduttore emette e riceve dallo stesso punto; il tempo è contato dall’emissione, con ritardi strumentali e nei riflettori trascurati. Si identificano i due echi diretti, uno per riflettore, senza percorsi multipli o rifrazioni. Arrivano rispettivamente a t₁=40 µs e t₂=68 µs. Qual è la distanza fra i due riflettori lungo il fascio? Esprimila esattamente in millimetri e centimetri.'
    row['blocks']=[
      text('Ogni eco diretto compie due volte il tragitto dalla sonda al proprio riflettore: una volta andando e una tornando. La perpendicolarità delle superfici al fascio fa tornare la riflessione verso lo stesso trasduttore. Nel modello il mezzo conserva la velocità assegnata e i riflettori sono abbastanza trasmittenti da ricevere anche il secondo eco. I due tempi non descrivono due tratte solo di andata.'),
      formula(r'v t_1=2d_1'),formula(r'v t_2=2d_2'),
      text('Il secondo riflettore è più lontano perché il suo eco arriva dopo. Sottraiamo le due equazioni: si elimina il percorso comune e resta il doppio della separazione. Definiamo Δd=d₂−d₁>0 e Δt=t₂−t₁>0. Usare subito la differenza evita di calcolare due profondità per poi sottrarle.'),
      formula(r'v(t_2-t_1)=2(d_2-d_1)'),
      formula(r'2\Delta d=v\Delta t'),
      formula(r'\Delta d=\frac{v\Delta t}{2}'),
      text('La differenza dei tempi è 68−40=28 microsecondi. Manteniamo prima la stessa unità nei due tempi; poi la velocità può essere espressa in millimetri al microsecondo. Da metri a millimetri si moltiplica per 1000 e da secondi a microsecondi il denominatore si moltiplica per un milione.'),
      formula(r'\Delta t=28\,\mu\mathrm s'),
      formula(r'\frac{1500000}{1000000}=\frac32'),
      formula(r'v=\frac32\,\frac{\mathrm{mm}}{\mu\mathrm s}'),
      text('Nel prodotto fra v e Δt i microsecondi si cancellano. Dividiamo per 2 perché la separazione viene attraversata due volte. Il conto diventa (3·28)/4 millimetri: prima facciamo 28/4=7, poi 3·7=21.'),
      formula(r'\Delta d=\frac{(3/2)\cdot28}{2}\,\mathrm{mm}'),
      formula(r'\Delta d=\frac{3\cdot28}{4}\,\mathrm{mm}'),
      formula(r'\Delta d=21\,\mathrm{mm}'),
      text('Dieci millimetri formano un centimetro, dunque 21 mm sono 21/10 cm, cioè 2,1 cm. Il decimale è finito ed esatto rispetto ai dati del modello; non è un arrotondamento di un’inversa numerica.'),
      formula(r'\Delta d=\frac{21}{10}\,\mathrm{cm}=2{,}1\,\mathrm{cm}'),
      {'type':'figure','src':'/asset/'+key,'text':'In alto le posizioni sono sulla stessa retta: sonda a 0, primo riflettore a 30 mm e secondo a 51 mm; le due superfici sono entrambe normali al fascio. In basso i tempi dei due echi diretti sono 40 e 68 µs dall’emissione. Le scale dichiarate sono distinte: 6 px/mm nello schema spaziale e 4 px/µs nella linea dei tempi. Le altezze degli impulsi sono schematiche e non misurano intensità.'},
      text('Come controllo, possiamo calcolare le profondità separatamente: d₁=(3/2)·40/2=30 mm e d₂=(3/2)·68/2=51 mm. La loro differenza è ancora 21 mm. Questi valori usano l’origine temporale all’emissione specificata nel testo; il confronto delle distanze conserva il segno e la separazione è positiva.'),
      formula(r'd_1=30\,\mathrm{mm}'),formula(r'd_2=51\,\mathrm{mm}'),
      formula(r'd_2-d_1=51\,\mathrm{mm}-30\,\mathrm{mm}'),
      formula(r'd_2-d_1=21\,\mathrm{mm}'),
      text('Omettere il fattore 2 darebbe 42 mm, contando la lunghezza totale di andata e ritorno come se fosse una separazione semplice. Usare il solo tempo 68 µs darebbe la profondità del secondo riflettore e non la distanza tra i due. Se un eco provenisse da un percorso multiplo, il suo tempo non andrebbe assegnato a una profondità con questa stessa identificazione: per questo la consegna seleziona esplicitamente i due echi diretti.'),
      text('La relazione inversa restituisce la differenza temporale prevista da una separazione nota: Δt=2Δd/v. Con 21 mm e v=3/2 mm/µs otteniamo 42 diviso 3/2, cioè 42·2/3=28 µs. Anche le unità confermano il risultato: una lunghezza divisa per una velocità è un tempo.'),
      formula(r'\Delta t=\frac{2\Delta d}{v}'),
      formula(r'\Delta t=\frac{42}{3/2}\,\mu\mathrm s'),
      formula(r'\Delta t=28\,\mu\mathrm s'),
    ]
    binding={'id':row['id'],'sourceId':source['id'],'sourceRef':source_ref,'sourceSha256':digest(source),
      'candidateSha256':digest(row),'assetChecksums':{ASSET:key}}
    package={'schema':'astra/1','records':[row],'assets':[{'id':key,'name':ASSET,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}]}
    return package,[binding]

if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser(__doc__);parser.add_argument('--repo',type=Path,required=True);parser.add_argument('--source-ref',required=True);parser.add_argument('--destination',type=Path,required=True)
    args=parser.parse_args();package,bindings=assemble(args.repo,args.source_ref);args.destination.mkdir(parents=True,exist_ok=True)
    for name,value in [(BATCH,package),(BATCH+'-bindings',bindings)]:
        (args.destination/(name+'.json')).write_text(canonical(value)+'\n')
