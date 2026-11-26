"""Distinct individual reviewer; no authoring import and no human approval."""
from fractions import Fraction
from functools import lru_cache
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from . import electric_exact_literals as codec
from .electric_exact_literals import exact_literal,numeric_lexeme
from . import nuclei_optics_review_models as model
SI=pint.UnitRegistry(non_int_type=Fraction)
def unique(values,want):
    if [i for i,v in enumerate(values)if sp.simplify(v-want)==0]!=[0]:raise ValueError('Independent general symbolic laws not unique')
def decode_numeric(raw):
    return exact_literal(raw)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U7-02.json'
FAMILY='critical-angle-sine'
EXPECTED_IDS={'AR-u7-critical-angle-sine-06', 'AR-u7-critical-angle-sine-01', 'AR-u7-critical-angle-sine-07', 'AR-u7-critical-angle-sine-08', 'AR-u7-critical-angle-sine-04', 'AR-u7-critical-angle-sine-11', 'AR-u7-critical-angle-sine-03', 'AR-u7-critical-angle-sine-14', 'AR-u7-critical-angle-sine-16', 'AR-u7-critical-angle-sine-10', 'AR-u7-critical-angle-sine-02', 'AR-u7-critical-angle-sine-09', 'AR-u7-critical-angle-sine-15', 'AR-u7-critical-angle-sine-13', 'AR-u7-critical-angle-sine-05', 'AR-u7-critical-angle-sine-12'}
REVIEWED_SKILLS={1: 'C5-L09', 2: 'C5-L09', 3: 'C5-L09', 4: 'C5-L09', 5: 'C5-L09', 6: 'C5-L09', 7: 'C5-L09', 8: 'C5-L09', 9: 'C5-L09', 10: 'C5-L09', 11: 'C5-L09', 12: 'C5-L09', 13: 'C5-L09', 14: 'C5-L09', 15: 'C5-L09', 16: 'C5-L09'}

@lru_cache(maxsize=1)
def oracle():
    s,n,k1,k2=sp.symbols('s n k1 k2',positive=True)
    unique([n*s,n/s,s/n,n-s,n*s*s],n*s)
    unique([k1/k2,k1*k2,k2/k1,k1*k1/k2,k1+k2],k1/k2)
    d=model.primary_only_derivations()[258]
    out=[d[n]for n in range(1,17)]
    out[1]='1, adimensionale'
    out[2]='Arrivo dal mezzo di indice maggiore con θ_i maggiore dell’angolo limite'
    out[3]='Da 1/2 a 3/4'
    out[8]='n_e = n_i s_c'
    out[9]='κ₁ / κ₂'
    out[15]='Infinite coppie positive con n_e = n_i/2'
    return out

MANUAL=['Per rifrazione da indice maggiore n_i a minore n_e, al limite il seno rifratto è1: n_i sinθ_c=n_e. Quindi s_c=n_e/n_i=1/2. Il seno è fra0 e1 per l’ipotesi stretta n_i>n_e>0.', 'Il rapporto di indici e il seno limite sono numeri puri. La primaria precedeva tutte le alternative; dopo la freeze tutti e cinque i distrattori/proposte sono stati letti singolarmente.', 'È necessario passare da indice maggiore a indice minore, n_i>n_e. Per avere effettivamente riflessione totale interna serve anche θ_i>θ_c, con sinθ_c=n_e/n_i. All’uguaglianza il raggio rifratto è radente: condizione limite, non un angolo strettamente oltre il limite. Interfaccia fra mezzi trasparenti nel modello geometrico.', 'A:1/2. Con n_e3/2,n_i2 si ha s_c3/4. Il seno limite cresce di fattore3/2; non si identifica questo fattore con il rapporto degli angoli.', 'Isolo n_e=n_i s_c=2·1/2=1. Verifico0<n_e<n_i. Il risultato non ha unità.', 'Isolo n_i=n_e/s_c=1/(1/2)=2. Per n_e>0 e0<s_c<1 segue n_i>n_e; il denominatore non può essere nullo.', 'A:s_c1/2. B:n_e1,n_i3→s_c1/3. Rapporto2/3. L’angolo limite diminuisce quando aumenta solo l’indice del mezzo di partenza.', 'Proposto1 meno corretto1/2 dà+1/2, puro. Il proposto coincide con un seno massimo, ma non con quello richiesto da n_i2,n_e1.', 'La relazione n_i s_c=n_e dà n_e=n_i s_c. Si mantiene0<s_c<1 per la disuguaglianza stretta fra gli indici; non si usa un reciproco del seno.', 'Rapporto s_c,B/s_c,A=κ₁/κ₂. Il dominio delle nuove coppie imponeκ₂n_i>κ₁n_e>0. Se i fattori violano questa condizione non esiste quel limite di riflessione totale nella direzione assegnata.', 'A:s_c1/2. B:n_e2,n_i3→s_c2/3. Rapporto4/3. Si dividono due seni, non due indici senza conservare il loro ruolo.', 'Media(1/2+2/3)/2=7/12. Agli indici medi n_e3/2,n_i5/2 si avrebbe3/5. Differenza7/12−3/5=−1/60. Media delle uscite e uscita degli ingressi medi sono diverse.', 'Target(4/3)(1/2)=2/3. Con n_e,B2 serve n_i,B=2/(2/3)=3. Rapporto n_i,B/n_i,A=3/2, dominio3>2 soddisfatto.', 'Riferimento s_c1/2,D3/2→guadagno3. D2→s_c2/3. Con n_i3 si ottiene n_e2, minore dell’indice di partenza.', 'Riferimenti s_c1/2,2/3 e letture2,7/3 danno guadagno[(7/3)−2]/[(2/3)−1/2]=2 e offset1. D5/2→s_c3/4. Con n_i2 si ricava n_e3/2.', 'Vincolo n_e=n_i/2 rende s_c1/2 ridondante: infinite coppie continue positive. Esempi(n_e,n_i)=(1,2),(2,4). Non si impone n_e≥1 se il testo dichiara soltanto n_i>n_e>0; eventuali ulteriori restrizioni di un materiale reale andrebbero esplicitate e non cambiano l’infinità del modello continuo.']

DISTRACTORS=['1/2;2 reciproco fuori seno,1 manca contrasto,1/4 quadrato,−1/2 fuori ramo.', 's_c puro; gradi angolo,m lunghezza,s tempo,m⁻¹ inverso lunghezza.', 'n_i>n_e e θ_i>θ_c stretti. Sotto soglia trasmissione,al limite radente; da minore indice nessuna TIR. Campo evanescente non raggio propagante.', '1/2→3/4;1/3 inversa,3/2 non seno,1/2 ignora,9/16 quadrato.', 'n_e2·1/2=1.4 inverte ordine,2 elimina contrasto,1/2 copia seno.', 'n_i1/(1/2)=2.1/2 ordine inverso,1 parità,4 darebbe1/4.', '(1/3)/(1/2)=2/3;3/2 reciproco,1/3 o1/2 uscita,1 ignora.', '1−1/2=1/2;−1/2 ordine,1 proposta,2 rapporto,0 accetta.', 'n_e=n_i s_c,0<s_c<1. Quozienti/differenza/quadrato non invertono Snell; dimensioni pure da sole insufficienti.', 'κ₁/κ₂, con κ₂n_i>κ₁n_e. Prodotto indice interno diretto,reciproco ruoli invertiti,quadrato altra legge,somma2 a prove identiche.', '(2/3)/(1/2)=4/3.3/4 reciproco,2 solo n_e,2/3 o1/2 uscita.', '7/12;3/5 ingressi medi,7/6 somma fuori seno,1/2 e2/3 singole soglie. Differenza dati-medi meno media1/60.', 'Target2/3, n_i,B2/(2/3)=3, rapporto3/2.2/3 reciproco,4/3 target,2 solo n_e,1 annulla contrasto.', 'g3,D2→s_c2/3; n_e3·2/3=2.6 fuori ordine,2/3 seno,3 parità,1 non display.', 'g2,b1,D5/2→s_c3/4,n_e3/2.5/2 omette offset e supera n_i2,3/4 seno,1 riferimento,2 parità.', 'n_e=n_i/2 rende s_c1/2 per ogni n_i>0. Esempi(1,2),(3/2,3); infinite coppie. Nessuna/una/due/sola aria false.']

ASSUMPTIONS=['Due mezzi trasparenti ideali, interfaccia piana ferma; arrivo dal maggiore indice n_i>n_e>0, angoli dalla normale. Al limite il trasmesso è radente: s_c=n_e/n_i strettamente fra zero e uno. Riflessione totale per θ_i>θ_c, non per semplice disuguaglianza degli indici; campo evanescente distinto dal raggio propagante.', 'Caso dimensionale autonomo: Due mezzi trasparenti ideali, interfaccia piana ferma; arrivo dal maggiore indice n_i>n_e>0, angoli dalla normale. Al limite il trasmesso è radente: s_c=n_e/n_i strettamente fra zero e uno. Riflessione totale per θ_i>θ_c, non per semplice disuguaglianza degli indici; campo evanescente distinto dal raggio propagante.', 'Due mezzi trasparenti ideali, interfaccia piana ferma; arrivo dal maggiore indice n_i>n_e>0, angoli dalla normale. Al limite il trasmesso è radente: s_c=n_e/n_i strettamente fra zero e uno. Riflessione totale per θ_i>θ_c, non per semplice disuguaglianza degli indici; campo evanescente distinto dal raggio propagante.', 'Due mezzi trasparenti ideali, interfaccia piana ferma; arrivo dal maggiore indice n_i>n_e>0, angoli dalla normale. Al limite il trasmesso è radente: s_c=n_e/n_i strettamente fra zero e uno. Riflessione totale per θ_i>θ_c, non per semplice disuguaglianza degli indici; campo evanescente distinto dal raggio propagante.', 'Due mezzi trasparenti ideali, interfaccia piana ferma; arrivo dal maggiore indice n_i>n_e>0, angoli dalla normale. Al limite il trasmesso è radente: s_c=n_e/n_i strettamente fra zero e uno. Riflessione totale per θ_i>θ_c, non per semplice disuguaglianza degli indici; campo evanescente distinto dal raggio propagante.', 'Due mezzi trasparenti ideali, interfaccia piana ferma; arrivo dal maggiore indice n_i>n_e>0, angoli dalla normale. Al limite il trasmesso è radente: s_c=n_e/n_i strettamente fra zero e uno. Riflessione totale per θ_i>θ_c, non per semplice disuguaglianza degli indici; campo evanescente distinto dal raggio propagante.', 'Due mezzi trasparenti ideali, interfaccia piana ferma; arrivo dal maggiore indice n_i>n_e>0, angoli dalla normale. Al limite il trasmesso è radente: s_c=n_e/n_i strettamente fra zero e uno. Riflessione totale per θ_i>θ_c, non per semplice disuguaglianza degli indici; campo evanescente distinto dal raggio propagante.', 'Due mezzi trasparenti ideali, interfaccia piana ferma; arrivo dal maggiore indice n_i>n_e>0, angoli dalla normale. Al limite il trasmesso è radente: s_c=n_e/n_i strettamente fra zero e uno. Riflessione totale per θ_i>θ_c, non per semplice disuguaglianza degli indici; campo evanescente distinto dal raggio propagante.', 'Due mezzi trasparenti ideali, interfaccia piana ferma; arrivo dal maggiore indice n_i>n_e>0, angoli dalla normale. Al limite il trasmesso è radente: s_c=n_e/n_i strettamente fra zero e uno. Riflessione totale per θ_i>θ_c, non per semplice disuguaglianza degli indici; campo evanescente distinto dal raggio propagante.', 'Due mezzi trasparenti ideali, interfaccia piana ferma; arrivo dal maggiore indice n_i>n_e>0, angoli dalla normale. Al limite il trasmesso è radente: s_c=n_e/n_i strettamente fra zero e uno. Riflessione totale per θ_i>θ_c, non per semplice disuguaglianza degli indici; campo evanescente distinto dal raggio propagante.', 'Due mezzi trasparenti ideali, interfaccia piana ferma; arrivo dal maggiore indice n_i>n_e>0, angoli dalla normale. Al limite il trasmesso è radente: s_c=n_e/n_i strettamente fra zero e uno. Riflessione totale per θ_i>θ_c, non per semplice disuguaglianza degli indici; campo evanescente distinto dal raggio propagante.', 'Due mezzi trasparenti ideali, interfaccia piana ferma; arrivo dal maggiore indice n_i>n_e>0, angoli dalla normale. Al limite il trasmesso è radente: s_c=n_e/n_i strettamente fra zero e uno. Riflessione totale per θ_i>θ_c, non per semplice disuguaglianza degli indici; campo evanescente distinto dal raggio propagante.', 'Due mezzi trasparenti ideali, interfaccia piana ferma; arrivo dal maggiore indice n_i>n_e>0, angoli dalla normale. Al limite il trasmesso è radente: s_c=n_e/n_i strettamente fra zero e uno. Riflessione totale per θ_i>θ_c, non per semplice disuguaglianza degli indici; campo evanescente distinto dal raggio propagante.', 'Due mezzi trasparenti ideali, interfaccia piana ferma; arrivo dal maggiore indice n_i>n_e>0, angoli dalla normale. Al limite il trasmesso è radente: s_c=n_e/n_i strettamente fra zero e uno. Riflessione totale per θ_i>θ_c, non per semplice disuguaglianza degli indici; campo evanescente distinto dal raggio propagante.', 'Due mezzi trasparenti ideali, interfaccia piana ferma; arrivo dal maggiore indice n_i>n_e>0, angoli dalla normale. Al limite il trasmesso è radente: s_c=n_e/n_i strettamente fra zero e uno. Riflessione totale per θ_i>θ_c, non per semplice disuguaglianza degli indici; campo evanescente distinto dal raggio propagante.', 'Due mezzi trasparenti ideali, interfaccia piana ferma; arrivo dal maggiore indice n_i>n_e>0, angoli dalla normale. Al limite il trasmesso è radente: s_c=n_e/n_i strettamente fra zero e uno. Riflessione totale per θ_i>θ_c, non per semplice disuguaglianza degli indici; campo evanescente distinto dal raggio propagante.']

UNITS={1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '', 10: '', 11: '', 12: '', 13: '', 14: '', 15: '', 16: ''}

NUMERIC_UNITS={5: '1', 6: '1', 14: '1'}

SUFFIX={}

NON_NUMERIC_DISTRACTORS={}

SVG_REVIEW='SVG640×1610 letto XML e native intero dopo child0. Caso limite: incidente(80,−80√3) seno1/2/30°,uscente orizzontale radente. Pannello TIR: incidente(120,−120),riflesso(120,120),45° dalla normale,entrambe le frecce complete; nessun trasmesso propagante,evanescente dichiarato non rappresentato. Barre240/320/280 per1/2,2/3,7/12 alla scala480 comune.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION', 3: 'NO_STUDENT_CALCULATION', 16: 'SYMBOLIC_MANUAL_DERIVATION'}

CANDIDATE_REF='b8d4f026f67fde1303fb13b4b10ce4cdbeb5e9dc'

PRIMARY_SHA256='5b685efd1f9081ea829990d63cf50291ffc298c922b8aac2b169b8de5cdaa3e4'

REVIEWED_MODEL_SHA256='f32615b7796d7dcb7c5d4e9d58566922ed01dac5f1dfd884fef5efd0108492c7'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='e53ce6fb4094e1aa7e2dbb443872c25b62477da0ee92fae9cc686b5f761ecfdc'

REVIEWED_BINDINGS_SHA256='63b8b23e09f329dec466199472e9de5e29f2bc31362128e7ef907dd8a81822dd'

REVIEWED_CANDIDATES={'AR-u7-critical-angle-sine-01': 'dda20cf91ee8bec6adeb910edb5782814fa4acd3aa3637592400c01afe9d85ef', 'AR-u7-critical-angle-sine-02': '9480fccb49c1fb93d3840cc81b33743ff54f00a89e46572fd927c4fa5ed1fbf6', 'AR-u7-critical-angle-sine-03': 'ded33734a192e0afbc2398c4aa409b7e4c0222508cacd424f9f4d71716929e78', 'AR-u7-critical-angle-sine-04': '3b302045064af0e3e157219578b2ef4645fe1e7da2a50def7e10aaed3b53651b', 'AR-u7-critical-angle-sine-05': '85c24df10097be62c8e17cbc86efea9ccb20addb85b7e4dfd333356df8eb0cd2', 'AR-u7-critical-angle-sine-06': '6c2d4d40d227e34ca489378d45d2c22436b2a3601c39d319d1926f52f74a1052', 'AR-u7-critical-angle-sine-07': '245528827d92ce881be9b3e0fd46e810c65fdc87fce883810c871b0e5fa1db2d', 'AR-u7-critical-angle-sine-08': 'b010851193d614ea328f63494881fcaf87691189cb75598a34c40431496828a6', 'AR-u7-critical-angle-sine-09': 'cd8fa5b3ea1dc31880b37795dcb2a94c2ba4947c6ed8ecd8229885da3599ef03', 'AR-u7-critical-angle-sine-10': '1febceb74c4bca2aa52b51e0a3418c23068114fe851756951735f72b2f329081', 'AR-u7-critical-angle-sine-11': '2e2e352e63a0d7eca04654432cbedd0f91c579b698e7f545e8ae73ede7aa7e30', 'AR-u7-critical-angle-sine-12': 'e0cbb2afa570d29b76b1ca02aefa603883e9baaa497afc9f90e5f40ca7305de7', 'AR-u7-critical-angle-sine-13': '85d85cf3bae0bc60a442ca00db061f18066c967147fe2031463987b351534a20', 'AR-u7-critical-angle-sine-14': '828df85e3d0f0a5e24d0ec6a9548a6609d01a9cf70d2eab3149775f16de5a0f3', 'AR-u7-critical-angle-sine-15': '64456a9178330dc28987182ad6bd021a7233e3a746daba603179fd0322ca4a16', 'AR-u7-critical-angle-sine-16': 'c53e76684fa537cf548e6294d48de5fb4859c919627d8e010e612d14f0f22a42'}

READ_SOURCE_SHA256={'u7-critical-angle-sine-01': 'cdb9f2ea5a090ad9c40d522dfa6f4db7da3e93a2ba93afc25e39ac8bceaff7da', 'u7-critical-angle-sine-02': '79bc624fbc8bfe61dc7170694135a754790fe257f342e66e690a33cebed2cc66', 'u7-critical-angle-sine-03': '10ac14a21a69bd27e88edbc864b9a243351b5542184ae582fc14a186720d176f', 'u7-critical-angle-sine-04': '87f139581014b831d5c5005d9689ae85c9d78c4f7b30d86984f10907454cf80f', 'u7-critical-angle-sine-05': '9abc306781f22e273c89808459f454079324f7915c553872058f570f8aaa2577', 'u7-critical-angle-sine-06': 'b186713088ea612a088a2247dd9442d42e98ba199e5af0a2282c63be3f2aa544', 'u7-critical-angle-sine-07': 'dfefb4b31be0d2c1c7fb4e071fbdeb1856272eb83e1553001b5ec483653cce30', 'u7-critical-angle-sine-08': '48f55ea1c2f1f42635e7720fc8f288896119ac81ffbc5b399132f0d8706fa16d', 'u7-critical-angle-sine-09': '802485b9ac45e15918708e663275c436f292b8fba1947ad9d28dd29ff7bbb45d', 'u7-critical-angle-sine-10': 'f6c61bdb43a6944700922b41f5fb63d915fece1f29053522b6f54086b86b2701', 'u7-critical-angle-sine-11': '82892f25a6ed76a0612e0c2f18ea97beacfb3f2f060af81c708aa16473306dcc', 'u7-critical-angle-sine-12': '949d44160f52cf3b509484d5598997d7b660310a5d735d5903de4a18df2a6a3b', 'u7-critical-angle-sine-13': '07b2f009d874f15a00d242bcfb2a87b9221e43be69e44b383e3666665639d77c', 'u7-critical-angle-sine-14': '4040f9f14b7c0429807776154c208852db19fff5b763b677680b6bd121a91a81', 'u7-critical-angle-sine-15': '667cb94b57332b323472909a7556183888359057b7943adf3cf14d612dae82a9', 'u7-critical-angle-sine-16': '87d45fb4d43e3c5097dcc6aad156f9207ca3c52f69e8eba6c52bc41e05365580'}

SOURCE_READING='Tutti80 originali derivati nella primaria prompt-only5b685 su d0628ef6 prima di ogni candidata; modelli propri corretti e realmente eseguiti su a114caa9 prima di opzioni/chiavi/blocchi/SVG. La precedente ricevuta5c3af5ea è esplicitamente invalida, conservata con esito negativo e successivo positivo separati. Poi tutti16 record di questa famiglia e cinque XML/native nuovi letti integralmente. Nessun modulo autore o primariaB aperta. Confronto integrato ROOT PENDING, UI prodotto/human NOT_RUN.'

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
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u7-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        if row.get('course')!='C5' or row.get('skill')!=REVIEWED_SKILLS[n]:errors.append('Independent real course or primary skill mismatch')
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
                exact=decode_numeric(raw)
                if sp.simplify(exact-want)!=0:errors.append('Independent '+FAMILY+' result mismatch')
                if row['answer']['type']=='choice':
                    equivalent=[]
                    for alternative in row['answer']['options']:
                        option=str(alternative).replace('−','-').strip()
                        if option in NON_NUMERIC_DISTRACTORS.get(n,set()):continue
                        if suffix and not option.endswith(suffix):raise ValueError('alternative missing physical unit')
                        if suffix:option=option.removesuffix(suffix).strip()
                        if sp.simplify(decode_numeric(option)-want)==0:equivalent.append(alternative)
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
          'methods':['SymPy_independent_nuclear_charge_energy_Snell_and_lens_model','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'sourceFirstPrimarySha256':PRIMARY_SHA256,'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}
