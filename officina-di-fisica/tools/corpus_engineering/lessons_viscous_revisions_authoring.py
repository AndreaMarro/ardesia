"""Additive viscosity lesson edition with the missing steady-pipe-flow hypothesis."""
import base64
from copy import deepcopy
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,formula


def assemble(repo,source_ref):
    source=next(r for r in json.loads(git_bytes(repo,source_ref,'officina-di-fisica/content/C2.json')) if r['id']=='C2-L007')
    name='C2-profilo.svg';raw=git_bytes(repo,source_ref,'officina-di-fisica/static/figures/'+name);key=sha(raw)
    row=deepcopy(source);row.update(version=source['version']+1,baseVersion=source['version'])
    row['blocks']=[
      deepcopy(source['blocks'][0]),
      formula(r'|\tau|=\eta\left|\frac{\mathrm dv_x}{\mathrm dy}\right|'),
      formula(r'[\tau]=\mathrm{Pa}'),formula(r'[\eta]=\mathrm{Pa\,s}'),
      deepcopy(source['blocks'][2]),
      text('Il gradiente di velocità ha unità (m/s)/m=1/s. Moltiplicarlo per una viscosità in Pa·s dà uno sforzo tangenziale in Pa. Per esempio, tra piastre distanti 2 mm, con velocità 0 e 4 mm/s e viscosità 2 Pa·s, il modello stazionario lineare dà gradiente 2 s⁻¹ e modulo dello sforzo 4 Pa. I millimetri si semplificano perché sono la stessa unità nelle due lunghezze del rapporto. Sono conti esatti nel modello; lo sforzo tangenziale e la pressione condividono l’unità, ma agiscono in direzioni diverse sulla superficie.'),
      formula(r'\left|\frac{\Delta v_x}{\Delta y}\right|=\frac{4\,\mathrm{mm/s}}{2\,\mathrm{mm}}'),
      formula(r'\left|\frac{\Delta v_x}{\Delta y}\right|=2\,\mathrm{s^{-1}}'),
      formula(r'|\tau|=(2\,\mathrm{Pa\,s})(2\,\mathrm{s^{-1}})'),
      formula(r'|\tau|=4\,\mathrm{Pa}'),
      text('Passiamo a un diverso modello: un tubo diritto, circolare e orizzontale di raggio R>0, con pareti ferme e aderenza del fluido alle pareti. Consideriamo un fluido newtoniano incomprimibile, con densità e viscosità positive costanti, mosso dalla differenza di pressione. Il flusso è laminare, stazionario e pienamente sviluppato: nella regione considerata il profilo non cambia né nel tempo né lungo l’asse. Le regioni di ingresso e gli effetti di estremità sono esclusi. Orientiamo l’asse lungo il moto: la velocità centrale v_max è positiva. Sono queste ipotesi, insieme, a giustificare il profilo parabolico.'),
      {'type':'figure','src':'/asset/'+key,'text':'Nel modello stazionario del tubo, le frecce verdi mostrano velocità locali e la curva rossa ne unisce le punte: non è la traiettoria di una particella. I due lati del disegno appartengono a un diametro della stessa sezione; la velocità è nulla alle pareti e massima sull’asse. Il disegno è schematico, senza assegnare un valore numerico alla scala delle velocità.'},
      formula(r'v(r)=v_{\max}\left[1-\left(\frac rR\right)^2\right]'),
      text('Qui r è la distanza radiale dall’asse, compresa fra 0 e R, e v_max è la velocità centrale. Il controllo agli estremi non richiede numeri: per r=0 la parentesi vale 1 e la velocità è v_max; per r=R vale 0 e il fluido aderisce alla parete ferma. A metà raggio, r/R=1/2: il quadrato è 1/4 e rimangono tre quarti della velocità centrale.'),
      formula(r'v(0)=v_{\max}'),formula(r'v(R)=0'),formula(r'v(R/2)=\frac34v_{\max}'),
      text('La velocità media che determina la portata è una media sull’AREA della sezione, non una media dei punti lungo un solo diametro. Una corona circolare di raggio r e spessore dr ha area 2πr dr: le corone esterne pesano di più perché hanno più area. Dividiamo la portata integrata per l’area totale πR².'),
      formula(r'\bar v=\frac{1}{\pi R^2}\int_0^R v(r)\,2\pi r\,dr'),
      formula(r'\bar v=\frac{2v_{\max}}{R^2}\int_0^R\left(r-\frac{r^3}{R^2}\right)dr'),
      text('Si integrano solo due potenze: r dà r²/2 e r³ dà r⁴/4. Sostituendo R al limite superiore e 0 a quello inferiore, l’integrale è R²/2−R²/4=R²/4. Il raggio si semplifica e resta metà della velocità centrale. Il risultato simbolico è già esatto; non serve valutare π.'),
      formula(r'\int_0^R\left(r-\frac{r^3}{R^2}\right)dr=\frac{R^2}{4}'),
      formula(r'\bar v=\frac{2v_{\max}}{R^2}\frac{R^2}{4}'),
      formula(r'\bar v=\frac{v_{\max}}2'),
      text('Laminare e stazionario descrivono proprietà diverse. Nel regime laminare il moto è ordinato; stazionario significa che la velocità in un punto non varia nel tempo. Durante un avviamento si può avere un moto laminare che varia nel tempo: non si deve assegnargli automaticamente il profilo parabolico già stabilito, né la relazione media=velocità centrale/2. Un moto turbolento presenta invece fluttuazioni e mescolamento; la sua media statistica può rimanere stazionaria pur mentre la velocità istantanea fluttua.'),
      deepcopy(source['blocks'][6]),
      formula(r'\mathrm{Re}=\frac{\rho\bar vD}{\eta}'),
      text('Il diametro è D=2R. Nel rapporto di Reynolds le unità si cancellano: ρv̄D ha unità kg/(m·s), le stesse di η in SI. Il numero è quindi puro. Confrontare il suo valore non sostituisce l’ipotesi di stazionarietà: un flusso può avere un numero di Reynolds piccolo e continuare a cambiare nel tempo.'),
    ]
    row['review']='DRAFT; new lesson edition after separate stationary-flow finding; independent review NOT_RUN; human approval NOT_RUN; source retained'
    binding={'id':row['id'],'sourceId':source['id'],'sourceRef':source_ref,'sourceSha256':digest(source),'candidateSha256':digest(row),'assetChecksums':{name:key}}
    return {'schema':'astra/1','records':[row],'assets':[{'id':key,'name':name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}]},[binding]

if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser(__doc__);parser.add_argument('--repo',type=Path,required=True);parser.add_argument('--source-ref',required=True);parser.add_argument('--destination',type=Path,required=True)
    args=parser.parse_args();package,bindings=assemble(args.repo,args.source_ref);args.destination.mkdir(parents=True,exist_ok=True)
    for name,value in [('lessons-viscous-revisions-073',package),('lessons-viscous-revisions-073-bindings',bindings)]:
        (args.destination/(name+'.json')).write_text(canonical(value)+'\n')
    raw=base64.b64decode(package['assets'][0]['data']);asset=Path(__file__).resolve().parents[2]/'editorial/assets'/package['assets'][0]['name']
    if asset.exists() and asset.read_bytes()!=raw:raise ValueError('Historical asset name already has different bytes')
    asset.write_bytes(raw)
