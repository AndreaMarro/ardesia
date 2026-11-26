"""Independent individual review, no candidate authoring import."""
from fractions import Fraction
from functools import lru_cache
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from . import electric_exact_literals as codec
from .electric_exact_literals import exact_literal,numeric_lexeme
from . import induction_helix_review_models as model
SI=pint.UnitRegistry(non_int_type=Fraction)
def unique(values,want):
    if [i for i,v in enumerate(values)if sp.simplify(v-want)==0]!=[0]:raise ValueError('Independent symbolic alternatives not unique as general laws')
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-05.json'
FAMILY='motional-induced-current'
EXPECTED_IDS={'AR-u6-motional-induced-current-10', 'AR-u6-motional-induced-current-12', 'AR-u6-motional-induced-current-06', 'AR-u6-motional-induced-current-01', 'AR-u6-motional-induced-current-09', 'AR-u6-motional-induced-current-15', 'AR-u6-motional-induced-current-13', 'AR-u6-motional-induced-current-07', 'AR-u6-motional-induced-current-03', 'AR-u6-motional-induced-current-11', 'AR-u6-motional-induced-current-14', 'AR-u6-motional-induced-current-02', 'AR-u6-motional-induced-current-04', 'AR-u6-motional-induced-current-16', 'AR-u6-motional-induced-current-05', 'AR-u6-motional-induced-current-08'}
REVIEWED_SKILLS={n:'C4-L10'for n in range(1,17)}

@lru_cache(maxsize=1)
def oracle():
    B,L,v,R,I,k1,k2=sp.symbols('B L v R I k1 k2',positive=True)
    unique([B*L*v/R,B*L*v*R,R/(B*L*v),B*v/R,B*L/(R*v)],B*L*v/R)
    unique([I*R/(B*L),I/(B*L*R),B*L/(I*R),I*R*B*L,I*R/B],I*R/(B*L))
    unique([k1/k2,k1*k2,k2/k1,k1*k1/k2,k1+k2],k1/k2)
    d=model.primary_only_derivations()[237]
    out=[d[n]for n in range(1,17)]
    out[1]='A'
    out[2]='I = B L v / R'
    out[3]='Da 4 A a 6 A'
    out[8]='v = I R / (B L)'
    out[9]='κ₁ / κ₂'
    out[15]='Infinite coppie continue'
    return out

MANUAL=['Il circuito è chiuso, con resistenza totale R costante e autoinduzione trascurata. E=BLv=(2 T·m)v e il modulo di corrente è I=E/R. Nelle unità SI I[A]=2 v[m/s]/R[Ω]. v 2, R 1 danno E 4 V e I 4 A; la corrente non nasce da un generatore elettrico esterno implicito.', 'La grandezza richiesta ha dimensione corrente, A=C/s=V/Ω. Nella primaria le alternative non erano aperte; dopo il congelamento tutte e cinque sono state lette e confrontate individualmente.', 'Faraday per asta mobile e Ohm nello stesso circuito resistivo danno I=BLv/R. Con B 1 T e L 2 m la legge numerica è 2 v/R. Occorre includere la resistenza totale, non confondere E e I o omettere il coefficiente fisico BL.', 'A R 1 Ω invariata, v passa da 2 a 3 m/s. E 4→6 V e I 4→6 A: fattore 3/2. La velocità è mantenuta dalle condizioni del moto; non la considero costante per sola forza magnetica.', 'Isolo v=IR/(BL). Con I 4 A, R 1 Ω, BL 2 T·m: v=2 m/s. Il risultato ha m/s perché A·Ω=V e V/(T·m)=m/s.', 'Isolo R=BLv/I. I 4 A e v 2 m/s danno R=4 V/(4 A)=1 Ω. La divisione per I è ammessa nel ramo positivo.', 'A 4 A; B con R 2 Ω e v 2 m/s ha I 2 A. Rapporto 1/2. Il raddoppio della resistenza dimezza la corrente, poiché l’asta mantiene la stessa f.e.m. a stessa velocità.', 'Corretto 4 A, proposto 8 A. Scarto proposto meno corretto=+4 A. Il rapporto 2 è un numero puro e non lo scarto.', 'Da I=BLv/R moltiplico per R e divido per BL: v=IR/(BL). Con BL 2 T·m, si può scrivere la relazione dei numeri v[m/s]=I[A]R[Ω]/2. Il due fisico non va omesso nelle dimensioni.', 'Con v_B=κ₁v_A e R_B=κ₂R_A, a B, L fissi, I_B/I_A=κ₁/κ₂. I parametri sono preparazioni del circuito/moto, non una legge del materiale R(t). Entrambi restano finiti e positivi.', 'A:2·2/1=4 A. B:2·1/2=1 A. Rapporto 1/4, prodotto del fattore 1/2 della velocità e del fattore inverso 1/2 della resistenza.', 'Media delle correnti(4+1)/2=5/2 A. Ai dati medi v=3/2 m/s, R=3/2 Ω, la corrente sarebbe 2 A: media superiore di 1/2 A. Non è una corrente attraverso due circuiti connessi, ma una media statistica.', 'Il bersaglio è(1/4)·4=1 A. Con v_B 1 m/s, R_B=BLv/I=2 Ω. Rapporto R_B/R_A=2. Dimezzare v da solo darebbe 2 A, non il bersaglio.', 'Riferimento I_A 4 A, lettura 12: a_cal 3 unità/A. Lettura 3 indica I_B 1 A. Con R_B 2 Ω, v_B=I_BR_B/(BL)=1 m/s.', 'Riferimenti I_A 4 A, I_B 1 A e letture 9, 3: guadagno(9−3)/(4−1)=2 unità/A, offset 1. Lettura 13 dà I_C 6 A. Con R_C 1 Ω e BL 2 T·m: v_C 3 m/s.', 'Il vincolo numerico v=2 R porta il coefficiente 2(m/s)/Ω. Inserito in I=BLv/R con BL 2 T·m, dà I=4 A per ogni R positiva finita nel regime ideale. La misura è ridondante: infinite coppie, per esempio R 1 Ω, v 2 m/s e R 2 Ω, v 4 m/s. Non è una relazione temporale fra resistenza e velocità entro una prova.']

DISTRACTORS=['4 A=(1·2·2)/1.2 omette L, 8 raddoppia, 0 confonde chiuso con quasi aperto. Energia proviene da agente.', 'A=C/s=V/Ω; V f.e.m., Ω resistenza, C carica, W potenza.', 'I=BLv/R da due leggi. Prodotto R rende dipendenza diretta, R/(BLv) è A⁻¹, omissione L perde lunghezza e v inversa non segue.', '4→6 A lineare.8/3 inverte fattore 3/2; 9 applica(3/2)²; 3 omette BL; 4 ignora.', 'v=IR/(BL)=4/2=2 m/s.4 omette L e darebbe 8 A; 1/2 reciproco; 8 moltiplica per BL.', 'R 4 V/4 A=1Ω.2Ω darebbe 2 A; 4 copia valori; 16 moltiplica.', '2 A/4 A=1/2.2 segue R diretto, 1/4 quadra, 4 inverte quadrato, 1 ignora.', '+4 A=8−4.−4 ordine, 2 rapporto, 8 proposta, 0 mancato controllo.', 'v=IR/(BL), unità m/s. I/(BLR) divide di nuovo per R, BL/(IR) è inversa, IRBL non isola eIR/B ha m²/s.', 'κ₁/κ₂ dalla f.e.m. diretta eR inversa. Prodotto/reciproco/quadrato/somma sono leggi diverse.', '1 A/4 A=1/4.4 reciproco, 1/2 solo un effetto, 2 aumento incompatibile, 1 falsa compensazione.', '5/2 A media di 4 e 1; 2 usa ingressi medi, 5 somma, 3/2 semidifferenza, 4 prima prova.', 'Bersaglio 1 A, nuovaE 2 V: R 2Ω, rapporto 2.1/2 reciproco, 4 trascura dimezzamentoE, 1/4 copia I, 1 darebbe 2 A.', 'g 3 A⁻¹, D 3→1 A, E 2 V, v 1 m/s.3 m/s salta g, D 9; 2 copia E; 1/2 darebbeD 3/2.', 'g 2 A⁻¹, b 1, D 13→6 A, v 3 m/s.13/4 salta offset, D 14; 6 salta g; 1 m/s darebbeD 5.', 'v=[2(m/s)/Ω]R rendeI 4 A identica. EsempiR 1/2Ω, v 2/4 m/s dimostrano scala continua; non si conta il numero 4 della corrente.']

ASSUMPTIONS=['B 1 T e L 2 m, geometria ortogonale; circuito chiuso resistivo con resistenza totale positiva costante entro ogni prova, autoinduzione ed effetti di bordo trascurati. Un agente mantiene v: il lavoro esterno alimenta il calore, non un lavoro della forza magnetica sulla singola carica. Confronti fra preparazioni.', 'Si chiede la dimensione della grandezza nominata, senza valori numerici o modello di moto specifico; i cinque distrattori sono stati letti dopo la primaria.', 'B 1 T e L 2 m, geometria ortogonale; circuito chiuso resistivo con resistenza totale positiva costante entro ogni prova, autoinduzione ed effetti di bordo trascurati. Un agente mantiene v: il lavoro esterno alimenta il calore, non un lavoro della forza magnetica sulla singola carica. Confronti fra preparazioni.', 'B 1 T e L 2 m, geometria ortogonale; circuito chiuso resistivo con resistenza totale positiva costante entro ogni prova, autoinduzione ed effetti di bordo trascurati. Un agente mantiene v: il lavoro esterno alimenta il calore, non un lavoro della forza magnetica sulla singola carica. Confronti fra preparazioni.', 'B 1 T e L 2 m, geometria ortogonale; circuito chiuso resistivo con resistenza totale positiva costante entro ogni prova, autoinduzione ed effetti di bordo trascurati. Un agente mantiene v: il lavoro esterno alimenta il calore, non un lavoro della forza magnetica sulla singola carica. Confronti fra preparazioni.', 'B 1 T e L 2 m, geometria ortogonale; circuito chiuso resistivo con resistenza totale positiva costante entro ogni prova, autoinduzione ed effetti di bordo trascurati. Un agente mantiene v: il lavoro esterno alimenta il calore, non un lavoro della forza magnetica sulla singola carica. Confronti fra preparazioni.', 'B 1 T e L 2 m, geometria ortogonale; circuito chiuso resistivo con resistenza totale positiva costante entro ogni prova, autoinduzione ed effetti di bordo trascurati. Un agente mantiene v: il lavoro esterno alimenta il calore, non un lavoro della forza magnetica sulla singola carica. Confronti fra preparazioni.', 'B 1 T e L 2 m, geometria ortogonale; circuito chiuso resistivo con resistenza totale positiva costante entro ogni prova, autoinduzione ed effetti di bordo trascurati. Un agente mantiene v: il lavoro esterno alimenta il calore, non un lavoro della forza magnetica sulla singola carica. Confronti fra preparazioni.', 'B 1 T e L 2 m, geometria ortogonale; circuito chiuso resistivo con resistenza totale positiva costante entro ogni prova, autoinduzione ed effetti di bordo trascurati. Un agente mantiene v: il lavoro esterno alimenta il calore, non un lavoro della forza magnetica sulla singola carica. Confronti fra preparazioni.', 'B 1 T e L 2 m, geometria ortogonale; circuito chiuso resistivo con resistenza totale positiva costante entro ogni prova, autoinduzione ed effetti di bordo trascurati. Un agente mantiene v: il lavoro esterno alimenta il calore, non un lavoro della forza magnetica sulla singola carica. Confronti fra preparazioni.', 'B 1 T e L 2 m, geometria ortogonale; circuito chiuso resistivo con resistenza totale positiva costante entro ogni prova, autoinduzione ed effetti di bordo trascurati. Un agente mantiene v: il lavoro esterno alimenta il calore, non un lavoro della forza magnetica sulla singola carica. Confronti fra preparazioni.', 'B 1 T e L 2 m, geometria ortogonale; circuito chiuso resistivo con resistenza totale positiva costante entro ogni prova, autoinduzione ed effetti di bordo trascurati. Un agente mantiene v: il lavoro esterno alimenta il calore, non un lavoro della forza magnetica sulla singola carica. Confronti fra preparazioni.', 'B 1 T e L 2 m, geometria ortogonale; circuito chiuso resistivo con resistenza totale positiva costante entro ogni prova, autoinduzione ed effetti di bordo trascurati. Un agente mantiene v: il lavoro esterno alimenta il calore, non un lavoro della forza magnetica sulla singola carica. Confronti fra preparazioni.', 'B 1 T e L 2 m, geometria ortogonale; circuito chiuso resistivo con resistenza totale positiva costante entro ogni prova, autoinduzione ed effetti di bordo trascurati. Un agente mantiene v: il lavoro esterno alimenta il calore, non un lavoro della forza magnetica sulla singola carica. Confronti fra preparazioni.', 'B 1 T e L 2 m, geometria ortogonale; circuito chiuso resistivo con resistenza totale positiva costante entro ogni prova, autoinduzione ed effetti di bordo trascurati. Un agente mantiene v: il lavoro esterno alimenta il calore, non un lavoro della forza magnetica sulla singola carica. Confronti fra preparazioni.', 'B 1 T e L 2 m, geometria ortogonale; circuito chiuso resistivo con resistenza totale positiva costante entro ogni prova, autoinduzione ed effetti di bordo trascurati. Un agente mantiene v: il lavoro esterno alimenta il calore, non un lavoro della forza magnetica sulla singola carica. Confronti fra preparazioni.']

UNITS={1: 'ampere', 2: 'ampere', 3: 'ampere', 4: 'ampere', 5: 'meter/second', 6: 'ohm', 7: '', 8: 'ampere', 9: 'meter/second', 10: '', 11: '', 12: 'ampere', 13: '', 14: 'meter/second', 15: 'meter/second', 16: ''}

NUMERIC_UNITS={1: 'A', 5: 'm/s', 6: 'Ω', 14: 'm/s', 15: 'm/s'}

SUFFIX={8: ' A', 12: ' A'}

NON_NUMERIC_DISTRACTORS={8: {'2'}}

SVG_REVIEW='XML e native indipendente completo 640 × 1520 letti. Sbarretta destra, B entrante, corrente sale nella sbarretta e gira antioraria, opponendosi all’aumento di flusso entrante; Iℓ×B frena a sinistra. Ogni freccia ha un solo sottopercorso. Grafico a R 1 Ω: origine(130, 900), x=130+120 v, y=900−50 I, finali(370, 700)=(2, 4), (490, 600)=(3, 6). Barre 320/80/200 da 150 rappresentano 4/1/5/2 A, scala 80 coordinate/A. Zeri sono accanto agli assi, non sovrapposti.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION', 16: 'SYMBOLIC_MANUAL_DERIVATION', 3: 'SYMBOLIC_MANUAL_DERIVATION'}

CANDIDATE_REF='1f9274d1ea3ff4d3ad0a97f7f820311bdf6a05ed'

PRIMARY_SHA256='c0d2d26dd79ece4c7ad2ff06d8ddd142acf02eb468b971b3e254ed06e16528bc'

REVIEWED_MODEL_SHA256='ffcffcf42b8f76159845cb9be8f16cb3529b50c5bb37790b7785ee032ed1b020'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='7cf2c02b2d000aa288c51d9d93efe0f6c2b311e411cde62ba1489f2798a9eb21'

REVIEWED_BINDINGS_SHA256='e8d7732a55f3319c5aa3614c531be070ea5efc95881cbfc60e569e46aef23c98'

REVIEWED_CANDIDATES={'AR-u6-motional-induced-current-01': '7ec3c932ec48000bec4933420e59a7b4c0c3e8de8a796a5da7b73712bc74e007', 'AR-u6-motional-induced-current-02': '89de13b4782a3e0442b507e041c77129b48374429281adeb4dc36394f68105fc', 'AR-u6-motional-induced-current-03': '05bf60be0502cb0c159f5709020cdff81c0971db781be010dc48cc8f233f1316', 'AR-u6-motional-induced-current-04': '2c6d6569f48a25b189a39a5b1aa5b0c8a4eb490cb5f352b7e70e7194b1e48726', 'AR-u6-motional-induced-current-05': 'aa8b578489f5a6867e90644caa392e779b1f439e418c6211e90be4b54c2dcf04', 'AR-u6-motional-induced-current-06': '611d6cad582dd9e5cc626ff073a54e2bfdc337a3602569953ac250a33a2cf953', 'AR-u6-motional-induced-current-07': '56340ef38c680b41c7683f58b627fd33911cfdb1ba2fe29065a5912e09c7ca89', 'AR-u6-motional-induced-current-08': '6f9c33dfbc3c9312018025ef57aef255f8c68d1d285b0a9a89bd77575adefba7', 'AR-u6-motional-induced-current-09': 'c0a45b719e6f534497dbdccc73da31894cf93dc29db3076a0a92e94ce6f04f47', 'AR-u6-motional-induced-current-10': 'c204ff04a2e29f74df8c1990ce24153793001d019d205d96c6c087f39f96f781', 'AR-u6-motional-induced-current-11': 'b0d333de78026876ccda9d423f8ad78313c859f3426d2a3b6be2b9ea7b66b1e8', 'AR-u6-motional-induced-current-12': 'acbdbb687edc584c09de155d387f0982beac3778974a5b2c30d1212840abe2c2', 'AR-u6-motional-induced-current-13': '2f61f080bb50c546d0243483cdf3062a837e62f5da0e4950bb0e18e2fece399e', 'AR-u6-motional-induced-current-14': '22dc419f8ccbbdf52a95c4b456e5cfabeb84f435aba1aeb934a58555e03268da', 'AR-u6-motional-induced-current-15': '6e817a8401f10a9178cfda035b1efa3bf728b4bf9a02e13add771f61586f8442', 'AR-u6-motional-induced-current-16': '4bf055ffc2e69a67d569e07e25b94c8e06d9ad9f2df6114e19e081691f2166f1'}

READ_SOURCE_SHA256={'u6-motional-induced-current-01': 'dba9475f443be18632d9a12fb1c1ca7652f6a4eb883fb844b102f72ea97b0850', 'u6-motional-induced-current-02': 'fe88f73d878a4b8c12a2e88959096740642a5cb3747a7d53e63c2c9b8a89d9f1', 'u6-motional-induced-current-03': 'b7a3bac3e154f674ed496fd97f10aa6c2381e09d0f6228f9748e6ee84a45f75d', 'u6-motional-induced-current-04': '4bf22fba02ec5f5f349fc8b9d9a8baaac222ede5e9d8cea35dc37fa18389924a', 'u6-motional-induced-current-05': 'c181da421b0e01d8f04195e9b86c092dd93097f317bc7ad99cdb531ec45bd877', 'u6-motional-induced-current-06': '6d65fe6ba0068e8bd666807d86b8365d7fc922516007873618f0fb5ef33d8dd5', 'u6-motional-induced-current-07': 'fcbdcc3f19f93170c12b8bcd5b83077061170d0f6ad9de830afd8a042466f5e1', 'u6-motional-induced-current-08': '6053608cb4eb0192241dcddee8ede63cb32742460d3693774ca35b0e885a585a', 'u6-motional-induced-current-09': '793d00658e3557744ea96b72c373a76a56e6d2a3b5d09eaa5ea3ef000071ed8f', 'u6-motional-induced-current-10': 'db16f01923f3d9e49ecb724bb1d2420140a7190c89dfcbece9aec3da623cc99b', 'u6-motional-induced-current-11': '4e9bd1287b90c574cca8ca777e7dea4fb89c86bc01dbd7998a805ef308cd0f08', 'u6-motional-induced-current-12': '98a9c5ab34a008ac72d251035ddd994d802dd2c00fe7b7b035d4f099501847cc', 'u6-motional-induced-current-13': '7eb87d3a81ec6694ca1589d66705191bcf95052d14e2c8794b3ca2febb000a3c', 'u6-motional-induced-current-14': '336f61b6454823ba93f60cbbbac09c3008dc0ac86d8e7e1e22992c94913871d5', 'u6-motional-induced-current-15': '68573ffa7c2be1c6e0a22a78bd0968d68326006b4ddaa0018b0673ba2e1253f9', 'u6-motional-induced-current-16': '7ed5138f9e93947212acbcdc094d77de5244113421e68b1be4edc8cbaef2c584'}

SOURCE_READING='Tutti gli 80 originali derivati nella primaria c0d2 prima di candidate; modelli indipendenti scritti ed eseguiti sul commit d7389745 prima di aprire qualsiasi candidato B. Successivamente letti integralmente tutti i 16 prompt, opzioni, blocchi, formule, hint, feedback e metadata finali di questa famiglia, più XML e nuovo native completo indipendente. Eventuali fix autore riletti selettivamente prima del congelamento. Nessun modulo autore o primaria B importata/letta; UI prodotto e human NOT_RUN; confronto integrato ROOT PENDING.'

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle(); common=[]
    if sha(Path(codec.__file__).read_bytes())!=REVIEWED_LITERAL_CODEC_SHA256:common.append('Independent exact literal codec dependency changed')
    if sha(Path(model.__file__).read_bytes())!=REVIEWED_MODEL_SHA256:common.append('Independent physical model dependency changed')
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed '+FAMILY+' package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed '+FAMILY+' binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u6-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        if row.get('course')!='C4' or row.get('skill')!=REVIEWED_SKILLS[n]:errors.append('Independent real course or primary skill mismatch')
        want=expected[n-1];value=row['answer']['value']
        if isinstance(want,str):
            if value!=want:errors.append('Independent '+FAMILY+' conceptual key mismatch')
        else:
            try:
                raw=numeric_lexeme(value).replace('−','-').strip();suffix=SUFFIX.get(n,'')
                if suffix==' giri' and raw.endswith(' giro'):raw=raw.removesuffix(' giro')+' giri'
                if suffix and not raw.endswith(suffix):raise ValueError('missing physical unit')
                if suffix:raw=raw.removesuffix(suffix).strip()
                if len(raw)>60:raise ValueError('literal too long')
                exact=exact_literal(raw)
                if sp.simplify(exact-want)!=0:errors.append('Independent '+FAMILY+' result mismatch')
                if row['answer']['type']=='choice':
                    equivalent=[]
                    for alternative in row['answer']['options']:
                        option=str(alternative).replace('−','-').strip()
                        if option in NON_NUMERIC_DISTRACTORS.get(n,set()):continue
                        if suffix and not option.endswith(suffix):raise ValueError('alternative missing physical unit')
                        if suffix:option=option.removesuffix(suffix).strip()
                        if sp.simplify(exact_literal(option)-want)==0:equivalent.append(alternative)
                    if equivalent!=[value]:errors.append('Independent '+FAMILY+' numeric alternatives not unique')
            except (ValueError,TypeError,ZeroDivisionError,SyntaxError,RecursionError):errors.append('Independent '+FAMILY+' answer or unit invalid')
        if row['answer']['type']=='numeric' and (row['answer'].get('unit')!=NUMERIC_UNITS.get(n) or row['answer'].get('tolerance')!=0):errors.append('Independent '+FAMILY+' numeric unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'assetChecksums':assets,
          'ok':not errors,'errors':errors,'expectedExact':str(want),
          'dimension':{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},
          'manualArithmetic':MANUAL[n-1],'physicalAssumptions':ASSUMPTIONS[n-1],'distractors':DISTRACTORS[n-1],
          'pedagogicalReview':'Consegna, tutti i passaggi, alternative, hint e feedback letti separatamente; procedura manuale esatta e condizioni controllate. '+MANUAL[n-1],
          'scientificAssetReview':SVG_REVIEW if assets else 'Nessuna figura collegata a questo record; testi e formule letti integralmente.',
          'calculationScope':CALCULATION_SCOPE.get(n,'EXACT_MANUAL_CALCULATION'),
          'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
          'reviewDependencySha256':{Path(codec.__file__).name:sha(Path(codec.__file__).read_bytes()),Path(model.__file__).name:sha(Path(model.__file__).read_bytes())},
          'methods':['SymPy_independent_Faraday_Ohm_Lorentz_and_constitutive_model','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'sourceFirstPrimarySha256':PRIMARY_SHA256,'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}
