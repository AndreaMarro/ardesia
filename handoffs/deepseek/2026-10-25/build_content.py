"""Editorial handoff only: original prose/data, no second runtime or quiz engine."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BASE = '64f6206271b218683f4d45cf953d6ee4b9d5f414'
PATHS = {'U1': 'strumenti-meccanica', 'U2': 'strumenti-meccanica', 'U3': 'fluidi-termodinamica', 'U5': 'fluidi-termodinamica', 'U6': 'elettricita-magnetismo', 'U4': 'onde-ottica-radiazioni', 'U7': 'onde-ottica-radiazioni'}
SYLLABUS = [
 ('U1-01',2,'Notazione scientifica','potenze di dieci; operazioni; ordine di grandezza'),
 ('U1-02',2,'Grandezze e unità','dimensioni; SI; conversioni; stime; estensive e intensive; scalari e vettori'),
 ('U1-03',2,'Trigonometria','seno; coseno; tangente; angoli e componenti'),
 ('U1-04',2,'Operazioni vettoriali','componenti; somma; differenza; prodotto scalare; prodotto vettoriale'),
 ('U2-01',2,'Cinematica','posizione e spostamento; traiettoria e legge oraria; velocità media e istantanea; accelerazione media e istantanea; MRU; moto uniformemente accelerato; caduta libera; lancio parabolico; moto circolare e accelerazione centripeta'),
 ('U2-02',2,'Dinamica e forze','inerzia; risultante e accelerazione; azione e reazione; equilibrio traslazionale; peso e gravitazione; contatto e normale; attrito statico e dinamico; tensione; Hooke'),
 ('U2-03',[2,3],'Lavoro ed energia','lavoro; potenza; teorema energia cinetica; forze conservative e dissipative; energia potenziale gravitazionale ed elastica; conservazione energia meccanica'),
 ('U2-04',3,'Impulso e quantità di moto','quantità di moto; impulso; sistema isolato; conservazione negli urti'),
 ('U2-05',3,'Sistemi e leve','centro di massa; moto del centro di massa; corpo rigido; momento torcente; equilibrio rotazionale; leve nel corpo umano'),
 ('U3-01',3,'Pressione e densità','fluido e solido; pressione; densità; statica e dinamica'),
 ('U3-02',3,'Idrostatica','Stevino; Pascal; Archimede; galleggiamento; Torricelli; manometro'),
 ('U3-03',3,'Continuità e Bernoulli','flusso e portata; stazionario e turbolento; laminare; conservazione massa; Bernoulli; stenosi e aneurisma'),
 ('U3-04',3,'Viscosità e Poiseuille','fluidi reali; profilo parabolico; gradiente velocità; Poiseuille; resistenze idrauliche serie e parallelo'),
 ('U3-05',3,'Superfici e capillarità','tensione superficiale; piccole gocce; capillarità; interfacce piane e curve; Laplace qualitativa'),
 ('U4-01',3,'Onda armonica','mezzo materiale; propagazione energia; oscillatore armonico; frequenza; periodo; pulsazione; lunghezza onda; velocità; legge onda; trasversale e longitudinale'),
 ('U4-02',3,'Sovrapposizione','principio sovrapposizione; interferenza costruttiva e distruttiva'),
 ('U4-03',3,'Energia e intensità','energia onda; potenza; intensità; inverso quadrato distanza'),
 ('U4-04',4,'Suono e decibel','mezzi e velocità suono; intensità fisica e percezione; decibel'),
 ('U4-05',4,'Doppler qualitativo','avvicinamento; allontanamento; sorgente e osservatore; frequenza ricevuta'),
 ('U5-01',4,'Stato e gas ideale','sistema e ambiente; pressione volume temperatura; stato e funzioni stato; scale termometriche; gas ideale'),
 ('U5-02',4,'Calore e calorimetria','calore come trasferimento; capacità termica; calore specifico; gas ideali; fusione evaporazione condensazione; calore latente; calorimetria'),
 ('U5-03',4,'Trasmissione calore','conduzione; convezione; irraggiamento'),
 ('U5-04',4,'Primo principio e trasformazioni','energia interna; calore e lavoro; primo principio; reversibilità; isoterma; isocora; isobara; adiabatica'),
 ('U5-05',4,'Secondo principio ed entropia','Kelvin-Planck e Clausius; irreversibilità; ciclo; macchina termica e rendimento; Carnot; entropia funzione stato; interpretazione statistica; direzione processi'),
 ('U6-01',4,'Carica e campo','carica e unità; conservazione; Coulomb; campo e linee; sovrapposizione cariche; moto in campo uniforme'),
 ('U6-02',4,'Potenziale elettrico','energia potenziale; potenziale; differenza potenziale; conservazione energia carica'),
 ('U6-03',4,'Conduttori e dielettrici','induzione elettrostatica; polarizzazione'),
 ('U6-04',4,'Corrente e circuiti','DC; intensità; generatore ideale; Ohm; resistività; Joule; serie e parallelo'),
 ('U6-05',4,'Condensatori','capacità; condensatore piano; dielettrico; energia; serie e parallelo'),
 ('U6-06',5,'Campo magnetico','Oersted; campo da correnti; Lorentz su carica; forza su filo; moto circolare carica'),
 ('U6-07',5,'Induzione','flusso; fem indotta; Faraday-Neumann-Lenz; verso corrente'),
 ('U7-01',5,'Radiazione elettromagnetica','campi elettrico e magnetico perpendicolari; frequenza e lunghezza; velocità; ampiezza; intensità'),
 ('U7-02',5,'Spettro','radio; microonde; infrarosso; visibile; ultravioletto; raggi X; gamma; ordine frequenza e lunghezza'),
 ('U7-03',5,'Fotoni','quantizzazione; energia e frequenza'),
 ('U7-04',5,'Assorbimento','Lambert-Beer; coefficiente; cammino; trasmissione'),
 ('U7-05',5,'Radioattività','nuclei instabili e isotopi; attività; decadimento; emivita; alfa beta gamma; trasformazioni nucleari'),
 ('U7-06',5,'Ionizzazione','soglia atomica; ionizzanti e non ionizzanti; esempi; energia singolo fotone e intensità'),
 ('U7-07',5,'Ottica geometrica','riflessione; rifrazione; indice; Snell; lenti convergenti sottili; immagini e punti coniugati'),
]

def dump(name, data):
    path = ROOT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def baseline():
    rows=[]
    for ident,pages,title,targets in SYLLABUS:
        unit=ident[:2]
        rows.append({'id':ident,'pathId':PATHS[unit],'unitId':unit,'title':title,
          'sourcePages':pages if isinstance(pages,list) else [pages],
          'subtargets':[{'id':f'{ident}.{i:02d}','label':s.strip(),'baselineConsumerStatus':'NOT_VERIFIED'} for i,s in enumerate(targets.split(';'),1)],
          'baselineCourseComplete':False,'editorialStatus':'DRAFT','humanApproval':False})
    dump('baseline.json',{'baseSha':BASE,'source':{'primaryHost':'medicina.unicz.it','pdf':'sources/syllabus-unicz-2026.pdf','sha256':hashlib.sha256((ROOT/'sources/syllabus-unicz-2026.pdf').read_bytes()).hexdigest(),'authority':'university-hosted syllabus linked by 2026 teaching page; MUR byte equality NOT_VERIFIED','murDirect':'HTTP_403','crosscheck':'https://www.unibo.it/it/studiare/insegnamenti-competenze-trasversali-moocs/insegnamenti/insegnamento/2026/568106','retrievedDate':'2026-10-25'},'denominatorType':'38 source bullet families, editorial grouping; NOT 38 atomic objectives','familyCount':len(rows),'atomicSubtargetCount':sum(len(x['subtargets']) for x in rows),'families':rows})

if __name__=='__main__':
    baseline()
