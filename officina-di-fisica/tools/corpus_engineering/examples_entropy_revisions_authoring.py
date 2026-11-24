"""Additive entropy example edition: exact symbolic answer without evaluating logarithms."""
import base64
import json
from pathlib import Path
from .pipeline import canonical, digest, git_bytes, sha
from .units_authoring import text, law_steps


def assemble(repo, source_ref):
    source=next(r for r in json.loads(git_bytes(repo,source_ref,'officina-di-fisica/content/C3.json')) if r['id']=='C3-E020')
    name='example-entropy-state-path.svg'
    raw=(Path(__file__).resolve().parents[2]/'editorial/assets'/name).read_bytes(); key=sha(raw)
    row={**source,'version':source['version']+1,'baseVersion':source['version'],
      'prompt':'Un recipiente rigido e termicamente isolato è diviso in due camere di uguale volume V. All’inizio una camera contiene una mole di gas perfetto in equilibrio a temperatura assoluta T>0; l’altra è vuota. Si rimuove il setto e si attende il nuovo equilibrio. Calcola la variazione di entropia del gas. Nel modello usa R=8,314 J/(mol·K). Lascia il risultato esatto in funzione di ln 2: non è richiesta alcuna valutazione numerica del logaritmo. Spiega perché il calore scambiato nel processo reale non permette da solo di calcolare questa variazione.',
      'blocks':[
        text('Seguiamo prima il processo che avviene davvero. La parete esterna è rigida e il gas si espande contro il vuoto: non compie lavoro verso l’esterno. L’isolamento termico esclude anche il calore scambiato. Con la convenzione del lavoro positivo quando è compiuto dal gas, il primo principio dà ΔU=Q−W=0. Per una quantità fissata di gas perfetto l’energia interna dipende solo dalla temperatura; i due stati di equilibrio hanno quindi la stessa T. Durante l’espansione libera non supponiamo invece una successione di stati uniformi di equilibrio.'),
        *law_steps(r'Q=0\qquad W=0\qquad \Delta U=Q-W=0\qquad T_f=T_i=T\qquad V_f=2V_i'),
        {'type':'figure','src':'/asset/'+key,'text':'Tre tappe: una camera inizialmente vuota; gli stessi stati iniziale e finale collegati da un percorso reversibile ausiliario; entropia positiva calcolata con il rapporto dei volumi. Le camere e le frecce sono schematiche, non misure del processo. Il percorso ausiliario non descrive l’espansione libera reale.'},
        text('L’entropia è una funzione di stato: la sua variazione dipende dagli estremi, come il dislivello dipende dalle quote di partenza e arrivo anche se i sentieri sono diversi. Il calore e il lavoro dipendono invece dal percorso. Per calcolare ΔS possiamo perciò immaginare un’altra trasformazione tra gli stessi stati: un’espansione isoterma reversibile, lentissima, con il gas mantenuto alla temperatura T da una sorgente termica. Non stiamo attribuendo quel calore al processo reale.'),
        text('Nel percorso reversibile la pressione esterna differisce infinitesimamente da quella del gas. Il lavoro elementare è p dV e l’equazione di stato fornisce p=nRT/V. Poiché anche in questo percorso T è costante, ΔU=0 e il calore reversibile assorbito uguaglia il lavoro compiuto. Nella definizione di variazione di entropia si deve usare proprio quel calore reversibile, diviso per la temperatura assoluta.'),
        *law_steps(r'\delta Q_{\mathrm{rev}}=p\,dV\qquad p=\frac{nRT}{V}\qquad dS=\frac{\delta Q_{\mathrm{rev}}}{T}\qquad dS=nR\frac{dV}{V}'),
        text('Il fattore T si semplifica prima di integrare; n e R sono costanti. Un logaritmo non può avere come argomento una grandezza con unità: compare il rapporto V_f/V_i, che è un numero puro. Per il raddoppio questo rapporto è due, indipendentemente dal valore iniziale del volume.'),
        *law_steps(r'\Delta S=nR\int_{V_i}^{V_f}\frac{dV}{V}\qquad \Delta S=nR\ln\!\left(\frac{V_f}{V_i}\right)\qquad \frac{V_f}{V_i}=2\qquad \Delta S=nR\ln 2'),
        text('Ora inseriamo una mole. L’unità mol si cancella con il denominatore di R e rimane J/K, l’unità dell’entropia. Il numero 8,314 è 8314/1000, cioè 4157/500 dopo aver diviso numeratore e denominatore per due. Lasciare ln 2 scritto è un risultato esatto rispetto al valore di R assegnato al modello; non occorre calcolarlo e non attribuiamo precisione illimitata alla costante fisica reale.'),
        *law_steps(r'nR=1\,\mathrm{mol}\cdot8{,}314\,\frac{\mathrm J}{\mathrm{mol\,K}}\qquad nR=8{,}314\,\frac{\mathrm J}{\mathrm K}\qquad \Delta S=\frac{4157}{500}\ln 2\,\frac{\mathrm J}{\mathrm K}'),
        text('Il segno si controlla senza una tavola di logaritmi: ln 2 è l’integrale di 1/x da uno a due, quindi è positivo. Poiché su quell’intervallo 1/x è compreso tra 1/2 e 1, il suo integrale è strettamente compreso tra 1/2 e 1. Moltiplicando per 8,314 otteniamo un controllo manuale: ΔS è maggiore di 4,157 J/K e minore di 8,314 J/K. Questi limiti non sostituiscono il valore simbolico e non richiedono approssimazioni di ln 2.'),
        *law_steps(r'\frac12<\ln 2<1\qquad 4{,}157\,\frac{\mathrm J}{\mathrm K}<\Delta S\qquad \Delta S<8{,}314\,\frac{\mathrm J}{\mathrm K}'),
        text('Il risultato positivo è coerente con l’espansione irreversibile di un sistema isolato. Nella descrizione microscopica il gas può occupare un volume maggiore: aumentano le configurazioni accessibili compatibili con lo stato. Nel processo reale Q=0, ma questo non impone ΔS=0: l’entropia viene prodotta dall’irreversibilità. Usare Q_reale/T al posto dell’integrale reversibile confonderebbe una proprietà del percorso con una funzione di stato. Un segno negativo descriverebbe invece una diminuzione di entropia del gas, incompatibile con questa espansione libera isolata.'),
      ],'review':'DRAFT; author edition after separate precision finding; independent review NOT_RUN; human approval NOT_RUN; historical edition retained'}
    binding={'id':row['id'],'sourceId':source['id'],'sourceRef':source_ref,'sourceSha256':digest(source),
      'candidateSha256':digest(row),'assetChecksums':{name:key}}
    return {'schema':'astra/1','records':[row],'assets':[{'id':key,'name':name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}]},[binding]


if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser(__doc__);parser.add_argument('--repo',type=Path,required=True)
    parser.add_argument('--source-ref',required=True);parser.add_argument('--destination',type=Path,required=True)
    args=parser.parse_args();package,bindings=assemble(args.repo,args.source_ref)
    args.destination.mkdir(parents=True,exist_ok=True)
    for name,value in [('examples-entropy-revisions-043',package),('examples-entropy-revisions-043-bindings',bindings)]:
        (args.destination/(name+'.json')).write_text(canonical(value)+'\n')
