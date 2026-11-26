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
from . import radiation_attenuation_review_models as model
SI=pint.UnitRegistry(non_int_type=Fraction)
def unique(values,want):
    if [i for i,v in enumerate(values)if sp.simplify(v-want)==0]!=[0]:raise ValueError('Independent general symbolic laws not unique')
def decode_numeric(raw):
    if raw=='e':return sp.E
    return exact_literal(raw)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U7-01.json'
FAMILY='two-layer-transmission'
EXPECTED_IDS={'AR-u7-two-layer-transmission-14', 'AR-u7-two-layer-transmission-15', 'AR-u7-two-layer-transmission-04', 'AR-u7-two-layer-transmission-05', 'AR-u7-two-layer-transmission-07', 'AR-u7-two-layer-transmission-12', 'AR-u7-two-layer-transmission-06', 'AR-u7-two-layer-transmission-16', 'AR-u7-two-layer-transmission-08', 'AR-u7-two-layer-transmission-02', 'AR-u7-two-layer-transmission-01', 'AR-u7-two-layer-transmission-10', 'AR-u7-two-layer-transmission-11', 'AR-u7-two-layer-transmission-13', 'AR-u7-two-layer-transmission-03', 'AR-u7-two-layer-transmission-09'}
REVIEWED_SKILLS={1: 'C5-L07', 2: 'C5-L07', 3: 'C5-L07', 4: 'C5-L07', 5: 'C5-L07', 6: 'C5-L07', 7: 'C5-L07', 8: 'C5-L07', 9: 'C5-L07', 10: 'C5-L07', 11: 'C5-L07', 12: 'C5-L07', 13: 'C5-L07', 14: 'C5-L07', 15: 'C5-L07', 16: 'C5-L07'}

@lru_cache(maxsize=1)
def oracle():
    x,y,T,k1,k2,d1,d2=sp.symbols('x y T k1 k2 d1 d2',positive=True)
    unique([2**(-x-2*y),2**(-x)+2**(-2*y),2**(-x-y),2**(x+2*y),2**(-2*x*y)],2**(-x-2*y))
    L=sp.log(1/T,2)
    unique([L-2*y,L+2*y,-L-2*y,sp.log(T,2)+2*y,L/(2*y)],L-2*y)
    unique([2**(-d1-2*d2),k1*k2,k1/k2,2**(d1+2*d2),2**(-d1-d2)],2**(-d1-2*d2))
    d=model.primary_only_derivations()[248]
    out=[d[n]for n in range(1,17)]
    out[1]='1, adimensionale'
    out[2]='T = 2^(−x₁ − 2x₂)'
    out[3]='Da 1/8 a 1/16'
    out[8]='x₁ = log₂(1/T) − 2x₂'
    out[9]='2^(−δ₁ − 2δ₂)'
    return out

MANUAL=['Le trasmissioni successive si moltiplicano: T=I/I₀=exp(−μ₁d₁)exp(−μ₂d₂). Con x_j=d_j/(1 cm), T=2^{−x₁−2 x₂}. A x₁=x₂=1 segueT=2⁻³=1/8. I due strati sono omogenei, indipendenti, senza riflessioni o sorgenti interne.', 'T è rapporto puro di intensità espresse nella stessa unità. Nella primaria nessuna alternativa era aperta; dopo il congelamento tutte e cinque sono state lette individualmente.', 'T=exp[−(μ₁d₁+μ₂d₂)]=2^{−x₁−2 x₂}. Le profondità ottiche si sommano e le frazioni trasmesse si moltiplicano. Non si sommano le trasmissioni e non si attribuisce al secondo strato lo stesso coefficiente del primo.', 'Con d₂1 cm fisso, d₁1→2 cm porta esponente totale 3→4: T 1/8→1/16. Il fattore è 1/2, un ulteriore centimetro del primo materiale.', 'La misuraT 1/8 dà−log₂T=3. Con x₂1, x₁=3−2=1 e d₁1 cm. Il dominio inverso d₁>0 richiede−log₂T>2 x₂, ossia T<2^{-2 x₂}; vale 1/8<1/4.', 'Con T 1/8, esponente 3 e x₁1, x₂=(3−1)/2=1: d₂1 cm. Il ramo positivo richiedeT<2^{-x₁}, qui 1/8<1/2.', 'A:T 2⁻³=1/8. B con x₁1, x₂2: T 2⁻⁵=1/32. Il rapporto T_B/T_A=(1/32)/(1/8)=1/4, perché il centimetro aggiunto nel secondo materiale aggiunge profondità 2 ln 2.', 'Proposto 1/4 meno corretto 1/8=+1/8, puro. Il rapporto sarebbe 2, non lo scarto. Si mantengono parentesi nel rapporto delle due trasmittanze.', 'Pongo T=I/I₀ e x_j=d_j/(1 cm). Da−log₂T=x₁+2 x₂ segue d₁=(1 cm)[−log₂T−2 x₂]. Equivalentemente d₁=[−lnT−μ₂d₂]/μ₁. Si controlla positività della differenza, non basta T>0.', 'Il rapporto èexp[−μ₁(κ₁−1)d₁−μ₂(κ₂−1)d₂]=2^{−(κ₁−1)x₁−2(κ₂−1)x₂}. Gli spessori scalati restano positivi. Non èκ₁κ₂: i parametri entrano nell’esponente.', 'A:T 1/8. B con entrambi gli spessori 2 cm: T 2⁻⁶=1/64. Rapporto(1/64)/(1/8)=1/8. Le due profondità totali sono 3 ln 2 e 6 ln 2.', 'Media(1/8+1/64)/2=9/128. Ai due spessori medi 3/2 cm si avrebbe 2^{-9/2}=√2/32. La differenza è(9−4√2)/128>0, perché 81>32; nessuna approssimazione della radice.', 'Bersaglio(1/8)(1/8)=1/64 richiede profondità totale 6 ln 2. Con x₁2 serve 2+2 x₂6, quindi x₂2: rapporto d₂B/d₂A=2.', 'RiferimentoT 1/8 e display 3/8 danno guadagno 3. Nuovo display 3/64→T 1/64, esponente 6. Con d₂2 cm, x₁=6−4=2, dunque d₁2 cm. Le letture frazionarie sono continue, non conteggi.', 'T_A 1/8, T_B 1/64; D_A 5/4, D_B 33/32. Guadagno=(5/4−33/32)/(1/8−1/64)=(7/32)/(7/64)=2; offset 1. D_C 9/8→T_C 1/16. Con x₂1, x₁=4−2=2, d₁2 cm.', 'Il vincolo d₁=d₂=d rende T=2^{-3 x}, x=d/(1 cm)>0. T 1/8=2⁻³ implica 3 x 3 e x 1: d₂1 cm e d₁1 cm. L’esponenziale è strettamente monotono, quindi non si aggiunge un ramo negativo o una seconda soluzione.']

DISTRACTORS=['1/8=(1/2)(1/4).1/4 solo secondo, 1/2 solo primo, 3/4 sommafractions, 1/16 dimezzamentoextra.', 'T puro. W/m² I, cm d, cm^-1 μ, J energia.', '2^(-x 1−2 x 2): somma dei contributi ottici, non somma di trasmissioni; omettere 2 modifica materiale, segno+ amplifica, prodottox 1 x 2 altra legge.', '1/8→1/16; 1/4 aumenta, 1/32 attribuisce coefficiente doppio al centimetroextra, zero impossibile a dfinito.', 'd 1=1 cm:3 totale−2 secondo=1; 3→1/32, 2→1/16, 0→1/4 fuori dominio.', 'd 2=1 cm:(3−1)/2; 2→1/32, 3→1/128, 1/2→1/4.', '1/4=(1/32)/(1/8); 4 reciproco, 1/2 omette coeff 2, 1/32 finale, non rapporto, 1 ignora.', '+1/8=1/4−1/8; −1/8 ordine, 2 rapporto, 1/4 proposta, 0 accetta.', 'log 2(1/T)−2 x 2: più riconta noto, segni inversi danno residuo negativo, divisione confonde somma e prodotto.', '2^(-δ1−2δ2); κprodotti/quozienti non esponenziali, segno+ reciproco, omettere 2 cambiaμ₂.', '1/8=(1/64)/(1/8); 8 reciproco, 1/2 o 1/4 solo incremento diuno strato, 1/64 finale, non rapporto.', '9/128 media 1/8, 1/64; √2/32 ingressi medi, 9/64 somma, 7/128 semidifferenza, 1/64 B.', 'd 2 B 2 cm, rapporto 2: esponente 6 e x 1 B 2.3→T 1/256, 1→1/16; 1/8 copia target.', 'g 3, D 3/64→T 1/64; esponente 6−4=2.6→D 3/1024, 1→3/32, 4→3/256.', 'g 2, b 1, D 9/8→T 1/16; d 1=2 cm. Omettereb T 9/16 supera limite 1/4; 4→D 33/32, 1→5/4.', 'x 1=x 2=x e 3 x 3→x 1 cm.3→1/512, 1/2→1/(2√2). Monotonia dà unicità, non famiglia libera.']

ASSUMPTIONS=['Due strati in successione con μ₁=ln 2/cm e μ₂=2 ln 2/cm, spessori positivi finiti e coefficienti costanti entro ogni strato. Fascio monocromatico diretto, nessuna riflessione o sorgente interna. Residui delle inverse strettamente positivi; T fra zero e uno.', 'Caso dimensionale autonomo; tutte le alternative confrontate dopo la primaria.', 'Due strati in successione con μ₁=ln 2/cm e μ₂=2 ln 2/cm, spessori positivi finiti e coefficienti costanti entro ogni strato. Fascio monocromatico diretto, nessuna riflessione o sorgente interna. Residui delle inverse strettamente positivi; T fra zero e uno.', 'Due strati in successione con μ₁=ln 2/cm e μ₂=2 ln 2/cm, spessori positivi finiti e coefficienti costanti entro ogni strato. Fascio monocromatico diretto, nessuna riflessione o sorgente interna. Residui delle inverse strettamente positivi; T fra zero e uno.', 'Due strati in successione con μ₁=ln 2/cm e μ₂=2 ln 2/cm, spessori positivi finiti e coefficienti costanti entro ogni strato. Fascio monocromatico diretto, nessuna riflessione o sorgente interna. Residui delle inverse strettamente positivi; T fra zero e uno.', 'Due strati in successione con μ₁=ln 2/cm e μ₂=2 ln 2/cm, spessori positivi finiti e coefficienti costanti entro ogni strato. Fascio monocromatico diretto, nessuna riflessione o sorgente interna. Residui delle inverse strettamente positivi; T fra zero e uno.', 'Due strati in successione con μ₁=ln 2/cm e μ₂=2 ln 2/cm, spessori positivi finiti e coefficienti costanti entro ogni strato. Fascio monocromatico diretto, nessuna riflessione o sorgente interna. Residui delle inverse strettamente positivi; T fra zero e uno.', 'Due strati in successione con μ₁=ln 2/cm e μ₂=2 ln 2/cm, spessori positivi finiti e coefficienti costanti entro ogni strato. Fascio monocromatico diretto, nessuna riflessione o sorgente interna. Residui delle inverse strettamente positivi; T fra zero e uno.', 'Due strati in successione con μ₁=ln 2/cm e μ₂=2 ln 2/cm, spessori positivi finiti e coefficienti costanti entro ogni strato. Fascio monocromatico diretto, nessuna riflessione o sorgente interna. Residui delle inverse strettamente positivi; T fra zero e uno.', 'Due strati in successione con μ₁=ln 2/cm e μ₂=2 ln 2/cm, spessori positivi finiti e coefficienti costanti entro ogni strato. Fascio monocromatico diretto, nessuna riflessione o sorgente interna. Residui delle inverse strettamente positivi; T fra zero e uno.', 'Due strati in successione con μ₁=ln 2/cm e μ₂=2 ln 2/cm, spessori positivi finiti e coefficienti costanti entro ogni strato. Fascio monocromatico diretto, nessuna riflessione o sorgente interna. Residui delle inverse strettamente positivi; T fra zero e uno.', 'Due strati in successione con μ₁=ln 2/cm e μ₂=2 ln 2/cm, spessori positivi finiti e coefficienti costanti entro ogni strato. Fascio monocromatico diretto, nessuna riflessione o sorgente interna. Residui delle inverse strettamente positivi; T fra zero e uno.', 'Due strati in successione con μ₁=ln 2/cm e μ₂=2 ln 2/cm, spessori positivi finiti e coefficienti costanti entro ogni strato. Fascio monocromatico diretto, nessuna riflessione o sorgente interna. Residui delle inverse strettamente positivi; T fra zero e uno.', 'Due strati in successione con μ₁=ln 2/cm e μ₂=2 ln 2/cm, spessori positivi finiti e coefficienti costanti entro ogni strato. Fascio monocromatico diretto, nessuna riflessione o sorgente interna. Residui delle inverse strettamente positivi; T fra zero e uno.', 'Due strati in successione con μ₁=ln 2/cm e μ₂=2 ln 2/cm, spessori positivi finiti e coefficienti costanti entro ogni strato. Fascio monocromatico diretto, nessuna riflessione o sorgente interna. Residui delle inverse strettamente positivi; T fra zero e uno.', 'Due strati in successione con μ₁=ln 2/cm e μ₂=2 ln 2/cm, spessori positivi finiti e coefficienti costanti entro ogni strato. Fascio monocromatico diretto, nessuna riflessione o sorgente interna. Residui delle inverse strettamente positivi; T fra zero e uno.']

UNITS={1: '', 2: '', 3: '', 4: '', 5: 'centimeter', 6: 'centimeter', 7: '', 8: '', 9: '', 10: '', 11: '', 12: '', 13: '', 14: 'centimeter', 15: 'centimeter', 16: 'centimeter'}

NUMERIC_UNITS={5: 'cm', 6: 'cm', 14: 'cm', 15: 'cm', 16: 'cm'}

SUFFIX={}

NON_NUMERIC_DISTRACTORS={}

SVG_REVIEW='XML e nuovo native completo 640 × 1600 letti. Schemi strati 80 × 85 dichiarati schematici; barre 400/200/50 perT 1/1/2/1/8, scala 400. Altro pannello barre 240/30/135 perT 1/8, 1/64, 9/128, scala 1920 comune soltanto entro quel pannello. Curva a d₁1 cm: x=150+110 d₂[cm], y=1450−640 T, con bordo aperto(150, 1130) T 1/2 e punti(260, 1370) T 1/8, (370, 1430) T 1/32. Bordo d₂0 esplicitamente escluso dai quesiti, non grafico d₁=d₂.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION', 3: 'SYMBOLIC_MANUAL_DERIVATION'}

CANDIDATE_REF='a99c09d1e4507650e70a4c93c84d0ed632c92273'

PRIMARY_SHA256='6ead7521b5a47b0f1cfa8675ca614070ef3c285b5b0be2815d82b299c3b26e08'

REVIEWED_MODEL_SHA256='c74b1d7f639531452c09fc4dc017b6c42d6ca298f58957e09e372092f0ca4b47'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='5a401e06680046f344c0ae256cf88ef195356c26f103c454414d8bdef796970f'

REVIEWED_BINDINGS_SHA256='970c41db2f02dd11d470fa68f145f3dc6105f564fdb54fca5f781319583e4bbc'

REVIEWED_CANDIDATES={'AR-u7-two-layer-transmission-01': '940158399ae17698a4a27dc7b61969f2eeeccabfad277aba8bb2442c237055ea', 'AR-u7-two-layer-transmission-02': '3b20e5c3cbb96cc1e820ffd9bc03677468121dacd046028d4a85ae65003ab129', 'AR-u7-two-layer-transmission-03': 'a1f73043c464ab35645044144e6a1259cb49af8e82750d8d0d9a1898b434c6d4', 'AR-u7-two-layer-transmission-04': 'a42f27fb2f54bd9e6d0de6dc24eb85bd7db283e8b091f969350884505b4f6576', 'AR-u7-two-layer-transmission-05': '91887dae22293a40a9445447e1de88588ea953816ff6168428af586de72ef200', 'AR-u7-two-layer-transmission-06': 'b049e52c9049472b52150cfda94d87d3bda332e3fb7eeb48a0fa4da0cf41b25e', 'AR-u7-two-layer-transmission-07': '0a7e085276f18f34d710622ea1bbf92ffe2cd49483cd6b6d195f880bd30a087c', 'AR-u7-two-layer-transmission-08': 'e70f1331f64771dfdb137fde37c472a0d971cb25e4116ee490dadb9e0e610f8a', 'AR-u7-two-layer-transmission-09': '6d85e0e57cbc504ac54d7ce893767e98f92827237d9c6b283e8fb063a76a8243', 'AR-u7-two-layer-transmission-10': 'cd9770fc148c9145a1d480cab79f9a49ab86ae459dd4bd2260dfa188cf2fe3d1', 'AR-u7-two-layer-transmission-11': 'cebeb0203bb3a22d0dd9b1fbc6110d8a30f488c294d5be8ac78a58415490a19d', 'AR-u7-two-layer-transmission-12': 'e99c33addab60c1bc66619ad7c1cfd1c392900b79cfe5a0af310a50a4e98f97d', 'AR-u7-two-layer-transmission-13': '8b09078c97ce10dad26516f5609a724c776d37b161e685f41aab540e2a554d5e', 'AR-u7-two-layer-transmission-14': '9501c1956512838ed6e499473436b7372b7f45a34409d6014495c2dd700ee2ce', 'AR-u7-two-layer-transmission-15': '1ada8e784fc1fe526da79f4860738afe0ac69a9bfc98798b7193f9830f8898dd', 'AR-u7-two-layer-transmission-16': '49ade72d3082472e35d97a51baa4bf8a1f4c5a36dd45fdd675104e499dc94e16'}

READ_SOURCE_SHA256={'u7-two-layer-transmission-01': '1a87d11257a6ed7e61a07fca657755c578a85d3ec5d9b6814c7c890e674632ee', 'u7-two-layer-transmission-02': 'fb3a4b5a9bf2605056dce8744db9e21e97668fca51d06698baf9189d089dbd00', 'u7-two-layer-transmission-03': 'a29791b63a640fa04a821841ad5ea15a8fd43d5bd5dda0d31b3d0d226118bd2d', 'u7-two-layer-transmission-04': '6a5dba97c6cb9cc19078aafcd0ccd52ea110315c17fb30eb6d0873b4941c12eb', 'u7-two-layer-transmission-05': 'a2e40fe77728a244a147456f903617c6f5413baffa976053499d61e8eba0a171', 'u7-two-layer-transmission-06': '987f20b4ed9c5982b8276321eb368cca8007555edf4afe93cd66e7249519c7a6', 'u7-two-layer-transmission-07': '578684b4da1b48035cef5ede5a75dd2d06cff163ab7daa83304ae4718e9ef882', 'u7-two-layer-transmission-08': '288eb8dc188a97193045945f346112ff4fd94a4c1ba54f913a84198a867c9830', 'u7-two-layer-transmission-09': '5833662ecb1ef08b189e4746f58e1518f7cb89d4829f16d241e2e9b9c9a1a272', 'u7-two-layer-transmission-10': 'ccbf262ad13abfc558c5a65f58608efadfc4edd0442ce3719aa189efbf1cd42e', 'u7-two-layer-transmission-11': '6aa7ac24b680abf8ef718ab005a37948cfc759919a987348efd9fb9b13a5f774', 'u7-two-layer-transmission-12': '456e66a42f51b4f6415830c875b72981c78d9155a15a63bbcd8f06a4d8127d0a', 'u7-two-layer-transmission-13': '2e590481824e28f0238be0d1df58d1b3cb8c80c791f0ea6ab57fcae8abae76da', 'u7-two-layer-transmission-14': '6f78f97ca8b0e8c54bb5336f8d7c74ad7c88e4b5afc17a0757935d8740f1fae1', 'u7-two-layer-transmission-15': 'dab5db000566ea09e38b94771c528cf6cfdf46c95a1ba6f53a885f263f23039a', 'u7-two-layer-transmission-16': 'b08a480022f5693259a8c86fb661d5532293677f15feffdda9701ba7afce61dd'}

SOURCE_READING='Tutti80 originali derivati individualmente nella primaria6ead prima di qualsiasi candidata; modelli scritti ed eseguiti sul commit24cf4060 prima di opzioni/chiavi/blocchi/SVG B. Poi tutti16 record di questa famiglia letti integralmente, tutte alternative e cinque figure XML/native nuove lette. Fix autore riletti prima di freeze. Nessun modulo autore o primaria B aperta. Confronto integrato ROOT PENDING, UI prodotto/human NOT_RUN.'

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
          'methods':['SymPy_independent_Planck_Beer_and_optical_depth_model','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'sourceFirstPrimarySha256':PRIMARY_SHA256,'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}
