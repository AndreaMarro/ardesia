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
FAMILY='faraday-average-emf'
EXPECTED_IDS={'AR-u6-faraday-average-emf-16', 'AR-u6-faraday-average-emf-06', 'AR-u6-faraday-average-emf-02', 'AR-u6-faraday-average-emf-08', 'AR-u6-faraday-average-emf-09', 'AR-u6-faraday-average-emf-14', 'AR-u6-faraday-average-emf-13', 'AR-u6-faraday-average-emf-01', 'AR-u6-faraday-average-emf-10', 'AR-u6-faraday-average-emf-07', 'AR-u6-faraday-average-emf-15', 'AR-u6-faraday-average-emf-11', 'AR-u6-faraday-average-emf-12', 'AR-u6-faraday-average-emf-05', 'AR-u6-faraday-average-emf-03', 'AR-u6-faraday-average-emf-04'}
REVIEWED_SKILLS={n:'C4-L10'for n in range(1,17)}

@lru_cache(maxsize=1)
def oracle():
    E,t,N,k1,k2=sp.symbols('E t N k1 k2',positive=True)
    unique([E*t/N,N*E*t,E/(N*t),N*t/E,E*t],E*t/N)
    unique([k1/k2,k1*k2,k2/k1,k1*k1/k2,k1+k2],k1/k2)
    d=model.primary_only_derivations()[235]
    out=[d[n]for n in range(1,17)]
    out[1]='V'
    out[2]='Lontano dall’osservatore'
    out[3]='Da 30 V a 5 V'
    out[8]='ΔΦ = E Δt / N'
    out[9]='κ₁ / κ₂'
    out[15]='Infinite coppie continue'
    return out

MANUAL=['Fisso un verso della normale e uso ε_media=−N(Φ_f−Φ_i)/Δt. Si chiede il modulo della media, quindi E=N|ΔΦ|/Δt, non necessariamente la media dei moduli istantanei se il flusso non fosse monotono. N=10 e il rapporto mWb/ms vale Wb/s=V, perché i due millesimi si cancellano. Con 6 mWb in 2 ms: E=10·6/2=30 V.', 'La grandezza richiesta ha dimensione tensione, V=J/C=Wb/s. Nella primaria le alternative non erano aperte; dopo il congelamento tutte e cinque sono state lette e confrontate individualmente.', 'Il flusso diretto verso l’osservatore sta aumentando. Lenz richiede un campo indotto opposto all’aumento: diretto lontano dall’osservatore, entrante nel piano del disegno. Vista dall’osservatore, la corrente corrispondente è oraria con la regola della mano destra. Non si oppone necessariamente al campo esistente in qualunque situazione: qui si oppone alla sua variazione positiva.', 'Con Δt=2 ms e 10 spire fisse, E è lineare nella variazione di flusso per spira. Da 6 a 1 mWb la f.e.m. media passa da 30 a 5 V; fattore 1/6. Non cambia il numero di spire e non si applica un quadrato.', 'Isolo |ΔΦ|=EΔt/N. Con 30 V e 2 ms:30·2/10=6 mWb. V·ms è mWb; N è un conteggio positivo puro. La durata deve essere positiva e finita.', 'Da EΔt=N|ΔΦ| ricavo Δt=N|ΔΦ|/E. Con 10 spire, 6 mWb e 30 V: Δt=10·6/30=2 ms. Divido per il modulo positivo non nullo della f.e.m.', 'A:10·6/2=30 V. B:10·6/1=60 V. Il rapporto B/A è 2, inverso del fattore 1/2 della durata. Si confrontano intervalli distinti, non due valori istantanei nella medesima variazione.', 'Corretto 30 V, proposto 60 V. Scarto proposto meno corretto=+30 V. Il rapporto sarebbe 2 senza unità e non risponde alla richiesta dello scarto.', 'Da E=N|ΔΦ|/Δt moltiplico per Δt e divido per N: |ΔΦ|=EΔt/N nel ramo del modulo positivo. N=10 resta nel denominatore. L’unità V·s=Wb; con durata in ms si ottengono mWb.', 'Stati separati: E_A=NΔΦ/Δt ed E_B=Nκ₁ΔΦ/(κ₂Δt). Il rapporto esatto èκ₁/κ₂. Tutte le durate e variazioni di flusso restano finite e positive; nessun segno di Lenz si deduce dal solo modulo.', 'A dà 30 V. B dà 10·12/3=40 V. Rapporto 40/30=4/3. Il fattore due della variazione di flusso va diviso per il fattore 3/2 della durata.', 'Media aritmetica delle due letture: (30+40)/2=35 V. Agli ingressi medi ΔΦ=9 mWb e Δt=5/2 ms, la legge darebbe 36 V. La media richiesta è inferiore di 1 V; nessuna divisione decimale necessaria.', 'Il bersaglio è(4/3)·30=40 V. Con ΔΦ_B=12 mWb, Δt_B=10·12/40=3 ms. Rispetto ai 2 ms iniziali, il rapporto richiesto è 3/2, non 4/3.', 'Riferimento E_A=30 V e lettura 90: guadagno a_cal=3 unità/V, senza offset. Lettura 120 indica 40 V. Con durata 3 ms, |ΔΦ|=40·3/10=12 mWb. Prima taratura e poi inversa fisica.', 'Riferimenti E_A=30 V ed E_B=40 V con letture 61 e 81: a_cal=(81−61)/(40−30)=2 unità/V e b_cal=1. Lettura 41 implica E_C=(41−1)/2=20 V. Con 5 ms, ΔΦ_C=20·5/10=10 mWb.', 'Il vincolo numerico ΔΦ=3 Δt significa |ΔΦ|=(3 mWb/ms)Δt=(3 V)Δt, non un’uguaglianza fra grandezze senza coefficienti dimensionali. La legge dà E=10·3=30 V per qualunque durata positiva finita: misura ridondante, infinite coppie. Esempi(ΔΦ, Δt)=(3 mWb, 1 ms), (6 mWb, 2 ms); i parametri sono continui, non entrambi conteggi interi.']

DISTRACTORS=['30 V=10·6/2. Tre omette N, 60 raddoppia, 120 segue 10·6·2. Il modulo medio non determina una corrente in circuito aperto.', 'V=J/C=Wb/s; N forza, Wb flusso, A corrente, J energia non hanno questa dimensione.', 'Flusso uscente crescente richiede contributo entrante: lontano dall’osservatore. Campo uscente rinforza; spira ferma non esclude induzione; lungo il filo non descrive il campo centrale.', '30→5 V è la riduzione 1/6.180 inverte, 15 dimezza, 30 ignora e 1/6 V scambia rapporto e tensione.', '6 mWb=30·2/10.60 è concatenata, 15 copia 30/2 e 3 salta il fattore 2 della durata.', '2 ms=10·6/30.1/2 inverte; 20 ms darebbe 3 V; 60 non divide per E.', '60/30=2. Mezzo segue t anziché 1/t; 4 quadra; 1 ignora; 6 copia flusso.', '+30 V=60−30. −30 cambia ordine, 2 rapporto, 60 proposta, 0 mancato confronto.', 'ΔΦ=EΔt/N. NEΔt moltiplica ancora per spire; E/(NΔt) ha V/s, NΔt/E non è Wb, EΔt è concatenata.', 'κ₁/κ₂. Prodotto e reciproco cambiano legge, quadrato non presente, somma 2 per fattori unitari.', '40/30=4/3.3/4 reciproco, 2 segue flusso, 2/3 segue solo durata, 1 presume compensazione.', '35 V è semisomma.36 usa dati medi, 70 somma, 5 semidifferenza, 40 una sola prova.', 'Bersaglio 40 V richiede 3 ms, rapporto 3/2.2/3 reciproco, 4/3 copia uscita, 2 flusso, 1 darebbe 60 V.', 'g 3 V⁻¹:120→40 V, ΔΦ 12 mWb.36 salta guadagno e predice D 360; 6 darebbe D 60; 3 copia durata.', 'g 2 V⁻¹, b 1:41→20 V, 5 ms→10 mWb.41/4 salta offset e predice 42; 20 salta guadagno e predice 81; 5 copia durata.', 'Infinite coppie continue: ΔΦ 3 Δt rende E 30 V. Esempi(3 mWb, 1 ms), (6 mWb, 2 ms) confutano nessuna/unica; N 10 non discretizza flusso e tempo.']

ASSUMPTIONS=['Bobina ferma con dieci spire, identica variazione per spira, durata positiva finita. Si misura il modulo della media orientata, non la media dei moduli istantanei: non si assume monotonia per gli esercizi quantitativi. Normale e percorrenza associate con mano destra. Preparazioni e vincoli fra prove distinti.', 'Si chiede la dimensione della grandezza nominata, senza valori numerici o modello di moto specifico; i cinque distrattori sono stati letti dopo la primaria.', 'Caso autonomo di una sola spira chiusa conduttrice nel modello resistivo di Lenz, flusso esterno uscente crescente visto dall’osservatore. Normale uscente assunta per esplicitare il segno di Faraday, non un conteggio di dieci spire.', 'Bobina ferma con dieci spire, identica variazione per spira, durata positiva finita. Si misura il modulo della media orientata, non la media dei moduli istantanei: non si assume monotonia per gli esercizi quantitativi. Normale e percorrenza associate con mano destra. Preparazioni e vincoli fra prove distinti.', 'Bobina ferma con dieci spire, identica variazione per spira, durata positiva finita. Si misura il modulo della media orientata, non la media dei moduli istantanei: non si assume monotonia per gli esercizi quantitativi. Normale e percorrenza associate con mano destra. Preparazioni e vincoli fra prove distinti.', 'Bobina ferma con dieci spire, identica variazione per spira, durata positiva finita. Si misura il modulo della media orientata, non la media dei moduli istantanei: non si assume monotonia per gli esercizi quantitativi. Normale e percorrenza associate con mano destra. Preparazioni e vincoli fra prove distinti.', 'Bobina ferma con dieci spire, identica variazione per spira, durata positiva finita. Si misura il modulo della media orientata, non la media dei moduli istantanei: non si assume monotonia per gli esercizi quantitativi. Normale e percorrenza associate con mano destra. Preparazioni e vincoli fra prove distinti.', 'Bobina ferma con dieci spire, identica variazione per spira, durata positiva finita. Si misura il modulo della media orientata, non la media dei moduli istantanei: non si assume monotonia per gli esercizi quantitativi. Normale e percorrenza associate con mano destra. Preparazioni e vincoli fra prove distinti.', 'Bobina ferma con dieci spire, identica variazione per spira, durata positiva finita. Si misura il modulo della media orientata, non la media dei moduli istantanei: non si assume monotonia per gli esercizi quantitativi. Normale e percorrenza associate con mano destra. Preparazioni e vincoli fra prove distinti.', 'Bobina ferma con dieci spire, identica variazione per spira, durata positiva finita. Si misura il modulo della media orientata, non la media dei moduli istantanei: non si assume monotonia per gli esercizi quantitativi. Normale e percorrenza associate con mano destra. Preparazioni e vincoli fra prove distinti.', 'Bobina ferma con dieci spire, identica variazione per spira, durata positiva finita. Si misura il modulo della media orientata, non la media dei moduli istantanei: non si assume monotonia per gli esercizi quantitativi. Normale e percorrenza associate con mano destra. Preparazioni e vincoli fra prove distinti.', 'Bobina ferma con dieci spire, identica variazione per spira, durata positiva finita. Si misura il modulo della media orientata, non la media dei moduli istantanei: non si assume monotonia per gli esercizi quantitativi. Normale e percorrenza associate con mano destra. Preparazioni e vincoli fra prove distinti.', 'Bobina ferma con dieci spire, identica variazione per spira, durata positiva finita. Si misura il modulo della media orientata, non la media dei moduli istantanei: non si assume monotonia per gli esercizi quantitativi. Normale e percorrenza associate con mano destra. Preparazioni e vincoli fra prove distinti.', 'Bobina ferma con dieci spire, identica variazione per spira, durata positiva finita. Si misura il modulo della media orientata, non la media dei moduli istantanei: non si assume monotonia per gli esercizi quantitativi. Normale e percorrenza associate con mano destra. Preparazioni e vincoli fra prove distinti.', 'Bobina ferma con dieci spire, identica variazione per spira, durata positiva finita. Si misura il modulo della media orientata, non la media dei moduli istantanei: non si assume monotonia per gli esercizi quantitativi. Normale e percorrenza associate con mano destra. Preparazioni e vincoli fra prove distinti.', 'Bobina ferma con dieci spire, identica variazione per spira, durata positiva finita. Si misura il modulo della media orientata, non la media dei moduli istantanei: non si assume monotonia per gli esercizi quantitativi. Normale e percorrenza associate con mano destra. Preparazioni e vincoli fra prove distinti.']

UNITS={1: 'volt', 2: 'volt', 3: 'tesla', 4: 'volt', 5: 'milliweber', 6: 'millisecond', 7: '', 8: 'volt', 9: 'milliweber', 10: '', 11: '', 12: 'volt', 13: '', 14: 'milliweber', 15: 'milliweber', 16: ''}

NUMERIC_UNITS={1: 'V', 5: 'mWb', 6: 'ms', 14: 'mWb', 15: 'mWb'}

SUFFIX={8: ' V', 12: ' V'}

NON_NUMERIC_DISTRACTORS={8: {'2'}}

SVG_REVIEW='XML e native indipendente completo 640 × 1500 letti. Nella vista frontale campo esterno uscente crescente, indotto entrante e freccia oraria. Grafico per spira: origine(130, 860), x=130+120 t[ms], y=860−30 Φ[mWb]; finali(370, 680)=(2 ms, 6 mWb) e(490, 500)=(3 ms, 12 mWb). Faraday con 10 spire dà 30/40 V. Barre origine 150 e larghezze 240/320/280 danno 30/40/35 V, scala 8 coordinate/V. Le rette sono esempi, non necessità di flusso lineare per la media.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION', 16: 'SYMBOLIC_MANUAL_DERIVATION', 3: 'NO_STUDENT_CALCULATION'}

CANDIDATE_REF='1f9274d1ea3ff4d3ad0a97f7f820311bdf6a05ed'

PRIMARY_SHA256='c0d2d26dd79ece4c7ad2ff06d8ddd142acf02eb468b971b3e254ed06e16528bc'

REVIEWED_MODEL_SHA256='ffcffcf42b8f76159845cb9be8f16cb3529b50c5bb37790b7785ee032ed1b020'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='01b07b23aca38ec3d4db04b5476d1e787ed64c4a18f2c6eedb57d6d4b95c5a9d'

REVIEWED_BINDINGS_SHA256='925627c989992209557dea2a4b481af509df14c528281656e8590a82e18fd6a2'

REVIEWED_CANDIDATES={'AR-u6-faraday-average-emf-01': '2b9e6820d4ab0de7601284c2666114b9d31fec0c4e8532d50884015c6ec9bf7c', 'AR-u6-faraday-average-emf-02': '12c5fc351e5b292e15ee8c1195c0394b1015b18503fabb30a887c98a3a8833a5', 'AR-u6-faraday-average-emf-03': '9735e53dae2ffb2bde5e181d3bdc67a1185117263c2b7c5529214de7fce59eeb', 'AR-u6-faraday-average-emf-04': '00c9bf7aa4357cedd22620983ee737da1fde111b7e6dae0992c8643e03181ae2', 'AR-u6-faraday-average-emf-05': '4ec1f4ec2e2474031596562cd1e26aaa2b39a9525533b1fae1818d42b9466047', 'AR-u6-faraday-average-emf-06': '9f54b54493b8ebbd2510da717f8fd34ae3067da34c6b781040c3db61a09f5302', 'AR-u6-faraday-average-emf-07': 'b5462947dbb22365939a427c4302e6e941131d725d0ecb595c204d46433dc971', 'AR-u6-faraday-average-emf-08': '41e6c4ff9c9cf8b3c16d5745155d1097addc330d010beaa09db06b31bdb5eb6d', 'AR-u6-faraday-average-emf-09': 'c51d8b4c9404b59dde38861849416697c2f8715c5330d59df1e1caf354663f06', 'AR-u6-faraday-average-emf-10': '0f82a3d6c24957d544465a5cff8a43fd42091ab77b5fe8b78146d3973a4abbbb', 'AR-u6-faraday-average-emf-11': 'e4a7d860ce7ca259b48dd5ee4a5af0b261a8ddf07e88f28ce12f6d4c22f04b4c', 'AR-u6-faraday-average-emf-12': '22087edc7668a7289ede86bfecd986ae45878eb33875be86eada1bef26f41170', 'AR-u6-faraday-average-emf-13': 'a963a373fdca5f9975a2b8b7cb0b43e41a3e4495fed09850acead8802a5fa414', 'AR-u6-faraday-average-emf-14': '45cbfcd4face08e3f0e7a0d2825f45e74786ef8778a42bceb7db099635d4e281', 'AR-u6-faraday-average-emf-15': 'dc8ab8e352898b06074a8a58cf529d72d136dbcac3bb926f4f5591554b4ce038', 'AR-u6-faraday-average-emf-16': '4b1825c07c61bdb264719771197a847f1a6ef44bea0f00793d312c8d0e1d0ced'}

READ_SOURCE_SHA256={'u6-faraday-average-emf-01': '0755415f0c0677a2a0c07796497f91bf2a5f485e4027c604169397508e0113c3', 'u6-faraday-average-emf-02': '99380ab6413389510d3d52e1e69b32df6c43f3c31648cc8a39acfa80671b5dda', 'u6-faraday-average-emf-03': 'aef944e42441d1e8d1357bdef9677ddf4fb93ccce3a2060551817bd9ac3397e2', 'u6-faraday-average-emf-04': '626f9bc722eebbee3cab84f4c26eb56973abf2a7533a7cae183be826e236a26e', 'u6-faraday-average-emf-05': '0d3f4aff3c785653c41ff2c8f0ad155ae48c288f231556304212c60a22c4f1e8', 'u6-faraday-average-emf-06': '84b21ddb0a1a35d6d83c611e0e770798ee749cf57d50a7ea4196441110b955b0', 'u6-faraday-average-emf-07': '026d6dd4cc3134a85ec16fcfbdc76efa27917bc12986ecc29cbaba027f749556', 'u6-faraday-average-emf-08': 'db84ed3b214107f524e90dff3bfe9124be33cf78de723291e801bdfd477b53ee', 'u6-faraday-average-emf-09': 'e387b85acc0218b8c6f96b419832a734617e293ade087ff05273b271867e0844', 'u6-faraday-average-emf-10': '2ecb638ea29c31ff0b2d266ba72b517c9d6165c5007e09229a0af09950c8a897', 'u6-faraday-average-emf-11': 'b70b901f45e541d6444e11d475de03147e464a8dc9c95f6774f7bf3634c1a473', 'u6-faraday-average-emf-12': 'f6bf88c4b0b275c3ae3412d0ad91453d8a2693aeac5008115754a7f41e93bfe9', 'u6-faraday-average-emf-13': '979480edbde217ce40188594e981aeade7bc55300afa450400035e28633fd5de', 'u6-faraday-average-emf-14': 'fdb89d89199feadd7ff3c5797eb69e836aeee389603bf764bd80f5d45bc7d1c9', 'u6-faraday-average-emf-15': '5c064a10522fe7f8e381bbbd801a532c4b7cb48cb92be0470cb8c38a38c00183', 'u6-faraday-average-emf-16': 'c3210c81a55f35dc93e44c56cc8acb50194c4db379407242bded640783a8ac72'}

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
