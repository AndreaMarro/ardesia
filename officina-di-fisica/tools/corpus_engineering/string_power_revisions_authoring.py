"""Add an explicitly constrained edition of the string-power comparison example."""
import base64
from copy import deepcopy
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,formula

BATCH='examples-string-power-revisions-094'
SOURCE_PATH='officina-di-fisica/content/C5.json'
ASSET='string-power-factors.svg'

def assemble(repo,source_ref):
    source=next(r for r in json.loads(git_bytes(repo,source_ref,SOURCE_PATH)) if r['id']=='C5-E008')
    raw=(Path(__file__).resolve().parents[2]/'editorial/assets'/ASSET).read_bytes();key=sha(raw)
    row=deepcopy(source);row.update(version=source['version']+1,baseVersion=source['version'])
    row['prompt']='Una corda ideale flessibile e uniforme ha densità lineare μ costante. Si confrontano due regimi già stabilizzati di onde trasversali progressive sinusoidali, senza riflessioni o perdite apprezzabili e con pendenze piccole in entrambi i regimi. La tensione T è mantenuta allo stesso valore positivo nei due esperimenti: anche la velocità di propagazione v è quindi invariata. L’ampiezza passa da A₁=2 mm ad A₂=3 mm e la frequenza da f₁=80 Hz a f₂=40 Hz. Qual è il rapporto tra potenza media finale P₂ e iniziale P₁? Lascia il risultato come frazione esatta.'
    row['blocks']=[
      text('L’onda porta energia lungo la corda mentre i suoi elementi oscillano trasversalmente. Nel modello lineare di onda progressiva sinusoidale la potenza media dipende dal quadrato dell’ampiezza e dal quadrato della pulsazione. La densità lineare e la velocità di propagazione completano il coefficiente. Usiamo questa legge perché il testo assegna una sola onda progressiva e piccole pendenze, escludendo riflessioni e dissipazione.'),
      formula(r'P_j=\frac12\mu v\omega_j^2A_j^2'),
      formula(r'\omega_j=2\pi f_j\qquad(j=1,2)'),
      text('La tensione fissata è il vincolo che permette di confrontare soltanto ampiezza e frequenza: per la stessa densità lineare, la velocità dipende dalla radice del rapporto T/μ. Nei due esperimenti i due fattori sono identici. Questa v descrive la propagazione lungo la corda; è distinta dalla velocità trasversale dei singoli elementi.'),
      formula(r'v=\sqrt{\frac{T}{\mu}}'),
      text('Controlliamo le unità prima del rapporto. μ si misura in kg/m, v in m/s, ω in s⁻¹ e A in m; il radiante è adimensionale. Il prodotto ha unità kg·m²/s³, cioè watt. Il fattore 1/2 è una media nel tempo: la potenza istantanea oscilla, ma qui si confrontano le potenze medie di due regimi sinusoidali.'),
      formula(r'1\,\mathrm{kg\,m^2/s^3}=1\,\mathrm W'),
      text('Dividiamo la formula dello stato 2 per quella dello stato 1. Il fattore 1/2, μ e v si cancellano perché hanno davvero lo stesso valore. Anche il 2π del rapporto fra le pulsazioni si cancella: non occorre calcolare π o una pulsazione in decimale.'),
      formula(r'\frac{P_2}{P_1}=\frac{A_2^2\omega_2^2}{A_1^2\omega_1^2}'),
      formula(r'\frac{\omega_2}{\omega_1}=\frac{f_2}{f_1}'),
      formula(r'\frac{P_2}{P_1}=\left(\frac{A_2}{A_1}\right)^2\left(\frac{f_2}{f_1}\right)^2'),
      text('Le ampiezze possono essere convertite in metri: 2 mm sono 2·10⁻³ m e 3 mm sono 3·10⁻³ m. Nel rapporto il medesimo fattore 10⁻³ si semplifica; usare direttamente i due valori in millimetri dà lo stesso numero puro. Per la frequenza, 40/80 si riduce dividendo numeratore e denominatore per 40.'),
      formula(r'A_1=2\cdot10^{-3}\,\mathrm m'),
      formula(r'A_2=3\cdot10^{-3}\,\mathrm m'),
      formula(r'\frac{A_2}{A_1}=\frac32'),
      formula(r'\frac{f_2}{f_1}=\frac{40}{80}=\frac12'),
      text('Ora eleviamo al quadrato entrambi i rapporti, poi moltiplichiamo le frazioni. Il denominatore finale è 4·4=16 e il numeratore è 9·1=9. Ogni passaggio è una piccola operazione tra interi.'),
      formula(r'\frac{P_2}{P_1}=\left(\frac32\right)^2\left(\frac12\right)^2'),
      formula(r'\frac{P_2}{P_1}=\frac94\cdot\frac14'),
      formula(r'\frac{P_2}{P_1}=\frac9{16}'),
      {'type':'figure','src':'/asset/'+key,'text':'Le barre rappresentano potenze medie relative, tutte alla stessa scala. La prima vale P₁. Il confronto intermedio cambia soltanto l’ampiezza e vale 9P₁/4; nello stato finale si dimezza anche la frequenza e rimane 9P₁/16. Il confronto intermedio serve a separare i due fattori della legge, non descrive un transitorio della corda.'},
      text('Il risultato è poco maggiore della metà della potenza iniziale: 1/2 è 8/16, quindi 9/16 supera la metà di 1/16. L’ampiezza maggiore compensa solo in parte la frequenza minore. Un controllo fisico alternativo usa Aω, la massima velocità trasversale: il suo rapporto è (3/2)·(1/2)=3/4. Il quadrato di 3/4 restituisce 9/16, mentre la velocità di propagazione lungo la corda rimane fissata.'),
      text('Usare soltanto il quadrato dell’ampiezza darebbe 9/4 e perderebbe il cambiamento di frequenza. Usare soltanto il quadrato della frequenza darebbe 1/4. Il prodotto non quadratico 3/4 riguarda Aω, non direttamente la potenza media. Infine, la cancellazione di v richiede proprio la tensione invariata assegnata nel testo: la sola identità della corda non basterebbe a fissarla.'),
      text('Possiamo controllare anche la relazione inversa. Chiamiamo r il rapporto P₂/P₁, a il rapporto A₂/A₁ e b il rapporto f₂/f₁, tutti positivi. Da r=a²b² si divide per b² e si prende la radice positiva, perché a è un rapporto di ampiezze. Con r=9/16 e b=1/2 si recupera l’ampiezza relativa assegnata.'),
      formula(r'r=a^2b^2'),
      formula(r'a^2=\frac{r}{b^2}'),
      formula(r'a=\frac{\sqrt r}{b}'),
      formula(r'\sqrt{\frac9{16}}=\frac34'),
      formula(r'a=\frac{3/4}{1/2}=\frac32'),
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
