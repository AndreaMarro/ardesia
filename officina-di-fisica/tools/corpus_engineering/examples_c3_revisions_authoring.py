"""A new example edition separating model-exact arithmetic from explicit rounding."""
import base64
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,law_steps


def assemble(repo,source_ref):
    source=next(r for r in json.loads(git_bytes(repo,source_ref,'officina-di-fisica/content/C3.json')) if r['id']=='C3-E003')
    home=Path(__file__).resolve().parents[2]/'editorial/assets'
    name='example-gas-volume-exact.svg';raw=(home/name).read_bytes();key=sha(raw)
    row={**source,'version':source['version']+1,'baseVersion':source['version'],
      'prompt':'Un campione descritto dal modello del gas perfetto contiene 0,0200 mol, ha temperatura assoluta 300 K e pressione assoluta 100 kPa. Per il calcolo usa R=8,314 J/(mol·K) e tratta questi valori come assegnati nel modello. Ricava il volume in litri senza arrotondare i passaggi. Se riporti anche tre cifre significative, distingui esplicitamente quel risultato arrotondato dal valore calcolato.',
      'blocks':[
        text('I tre dati descrivono lo stato di un gas, non una trasformazione. Nel modello del gas perfetto la pressione assoluta, il volume e la temperatura assoluta soddisfano pV=nRT. Per ricavare V dividiamo per la pressione, positiva. Il valore assegnato di R usa unità SI: prima rendiamo coerente la pressione, poi svolgiamo il conto. Il modello è adatto a un campione sufficientemente diluito; non attribuisce esattezza fisica illimitata a una costante arrotondata o a una misura.'),
        {'type':'figure','src':'/asset/'+key,'text':'Tre tappe: stato del campione con p e T assolute; conversione della pressione e prodotto nRT; volume senza arrotondamento e stima a tre cifre. Il recipiente è schematico e non in scala. Il simbolo ≈ distingue il valore arrotondato.'},
        *law_steps(r'pV=nRT\qquad V=\frac{nRT}{p}\qquad p=100\,\mathrm{kPa}\qquad 100\,\mathrm{kPa}=100000\,\mathrm{Pa}'),
        text('Scriviamo 0,0200 mol come 1/50 mol per semplificare prima del prodotto. Il fattore 300/50 vale sei: la moltiplicazione rimasta è soltanto 6 per 8,314. A mano si può moltiplicare 8314 per 6, ottenendo 49884, e ripristinare le tre cifre dopo la virgola: 49,884. Nessun arrotondamento è entrato in questo passaggio.'),
        *law_steps(r'n=\frac1{50}\,\mathrm{mol}\qquad nT=\frac{300}{50}\,\mathrm{mol\,K}\qquad \frac{300}{50}\,\mathrm{mol\,K}=6\,\mathrm{mol\,K}\qquad nRT=6\cdot8{,}314\,\mathrm J\qquad 6\cdot8{,}314\,\mathrm J=49{,}884\,\mathrm J'),
        text('Le unità mol e K si cancellano contro quelle di R. Inoltre J=Pa·m³: dividere 49,884 J per 100000 Pa produce proprio un volume. Dividere per una potenza di dieci sposta la virgola; si può anche lasciare il rapporto come frazione esatta.'),
        *law_steps(r'V=\frac{49{,}884}{100000}\,\mathrm{m^3}\qquad V=4{,}9884\cdot10^{-4}\,\mathrm{m^3}\qquad 1\,\mathrm{m^3}=1000\,\mathrm L\qquad V=0{,}49884\,\mathrm L\qquad 0{,}49884\,\mathrm L=\frac{12471}{25000}\,\mathrm L'),
        text('0,49884 L è il risultato senza arrotondamenti intermedi rispetto ai numeri assegnati. È vicino a mezzo litro: per una mole, cinquanta volte la quantità di sostanza, lo stesso modello darebbe cinquanta volte il volume alle stesse p e T. La proporzionalità con n offre un controllo fisico del risultato.'),
        text('Per scrivere tre cifre significative conserviamo 4, 9 e 8 nelle posizioni significative di 0,49884. La cifra seguente è 8, quindi l’ultima conservata sale da 8 a 9. Il risultato arrotondato è circa 0,499 L: qui compare ≈, non un’uguaglianza con il valore precedente.'),
        {'type':'formula','text':r'V\approx0{,}499\,\mathrm L'},
        text('Una verifica dell’arrotondamento usa solo interi: 49850≤49884<49950, dopo aver moltiplicato i limiti 0,4985 e 0,4995 L per 100000. La differenza fra 0,499 e 0,49884 L è 0,00016 L, inferiore a mezzo millilitro. Usare 100 come pressione insieme a R in SI darebbe un volume mille volte troppo grande; convertire m³ in L dividendo per mille introdurrebbe l’errore opposto.'),
      ],'review':'DRAFT; new authored edition after independent precision finding; candidate scientific review NOT_RUN; human approval NOT_RUN; original retained'}
    binding={'id':row['id'],'sourceId':source['id'],'sourceRef':source_ref,'sourceSha256':digest(source),
      'candidateSha256':digest(row),'assetChecksums':{name:key}}
    return {'schema':'astra/1','records':[row],'assets':[{'id':key,'name':name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()}]},[binding]


if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser(__doc__);parser.add_argument('--repo',type=Path,required=True)
    parser.add_argument('--source-ref',required=True);parser.add_argument('--destination',type=Path,required=True)
    args=parser.parse_args();package,bindings=assemble(args.repo,args.source_ref)
    args.destination.mkdir(parents=True,exist_ok=True)
    for name,value in [('examples-thermo-revisions-042',package),('examples-thermo-revisions-042-bindings',bindings)]:
        (args.destination/(name+'.json')).write_text(canonical(value)+'\n')
