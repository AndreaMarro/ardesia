"""Independent source-first electric review; no candidate authoring imports."""
from fractions import Fraction
from functools import lru_cache
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from . import electric_exact_literals as codec
from .electric_exact_literals import exact_literal,numeric_lexeme
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-02.json'
FAMILY='wire-stretched-fixed-volume'
EXPECTED_IDS={f'AR-u6-{FAMILY}-{n:02}'for n in range(1,17)}
REVIEWED_SKILLS={n:'C4-L05'for n in range(1,17)}

def numbers(*values):
    if any(type(x) is bool or not isinstance(x,(int,Fraction,sp.Expr)) for x in values):
        raise ValueError('Numeric exact objects required; raw text is decoded only by the bounded AST codec')
    values=tuple(map(sp.sympify,values))
    if any(x.is_number is not True or x.is_real is not True or x.is_finite is not True or x.has(sp.Float) for x in values):
        raise ValueError('Finite real exact numeric parameters required; use lexical rationals, not binary floats')
    return values

def positive(*values):
    values=numbers(*values)
    if any(x<=0 for x in values):raise ValueError('Strictly positive physical parameters required')
    return values

def unique(options,want):
    if [i for i,x in enumerate(options)if sp.simplify(x-want)==0]!=[0]:raise AssertionError('Independent symbolic alternatives not unique')

def calibrate(x1,x2,y1,y2):
    x1,x2,y1,y2=numbers(x1,x2,y1,y2)
    if x1<=0 or x2<=0 or x1==x2:raise ValueError('Distinct positive reference outputs required')
    gain=sp.cancel((y2-y1)/(x2-x1));offset=sp.cancel(y1-gain*x1)
    if gain<=0:raise ValueError('Positive nonzero display gain required')
    return gain,offset

def stretched(initial,scale):
    initial,scale=numbers(initial,scale)
    if initial<=0 or scale<1:raise ValueError('Positive initial resistance and stretching s>=1 required')
    return initial*scale**2

def inverse_initial(final,scale):
    final,scale=numbers(final,scale)
    if final<=0 or scale<1:raise ValueError('Positive final resistance and s>=1 required')
    return final/scale**2

def inverse_scale(final,initial):
    final,initial=positive(final,initial)
    if final<initial:raise ValueError('A measured resistance below initial is not stretching')
    return sp.sqrt(final/initial)

@lru_cache(maxsize=1)
def oracle():
    rho,L,A,s,R0,R,k1,k2=sp.symbols('rho L A s R0 R k1 k2',positive=True)
    final=rho*(s*L)/(A/s);initial=rho*L/A
    assert sp.simplify(final/initial)==s**2
    unique([R/s**2,R/s,R*s**2,s**2/R,R/(2*s**2)],sp.solve(sp.Eq(R,R0*s**2),R0)[0])
    unique([k1*k2**2,k1*k2,k1/k2**2,k1**2*k2**2,k2**2/k1],sp.cancel((k1*R0*(k2*s)**2)/(R0*s**2)))
    # Same material and temperature fix rho; different geometries do not fix R or G.
    geometry1=rho*1/1;geometry2=rho*2/1;assert sp.simplify(geometry2/geometry1)==2
    aa,bb=stretched(1,2),stretched(2,3);assert(aa,bb)==(4,18)
    assert stretched(sp.Rational(3,2),sp.Rational(5,2))==sp.Rational(75,8)
    gain,offset=calibrate(aa,bb,9,37);assert(gain,offset)==(2,1)
    assert inverse_initial((25-offset)/gain,2)==3
    x=sp.symbols('x',real=True);assert sp.solve(sp.Eq(x**3,8),x)==[2]
    Q=SI.Quantity;assert (Q(Fraction(1),'ohm*meter')*Q(Fraction(2),'meter')/Q(Fraction(1),'meter**2')).to('ohm').magnitude==2
    assert inverse_scale(4,1)==2
    return [aa,'Ω','La resistività ρ','Da 4 a 12 Ω',inverse_initial(4,2),inverse_scale(4,1),stretched(1,1)/aa,8-aa,'R₀ = R / s²','κ₁ κ₂²',bb/aa,(aa+bb)/2,sp.Rational(3,2),inverse_initial(sp.Rational(54,3),3),inverse_initial((25-offset)/gain,2),sp.Integer(2)]

MANUAL=['Volume A₀L₀=AL e L=sL₀ impongono A=A₀/s. Con resistività ρ invariata, R=ρL/A=R₀s². R₀=1 Ω, s=2 danno 4 Ω. Il modello assume deformazione uniforme e temperatura/materiale tali da mantenere ρ costante.', 'R è resistenza elettrica, quindi la dimensione è V/A e l’unità Ω. Un prefisso non ne cambia dimensione. Nella primaria prompt-only le alternative non erano aperte; nella successiva revisione tutte e cinque sono state lette e confrontate: solo Ω è resistenza.', 'Per stesso materiale e temperatura, nel modello ohmico la resistività ρ deve coincidere, non la resistenza R=ρL/A né necessariamente la conduttanza. Cambiare geometria può cambiare L/A; la resistività è proprietà del materiale alle condizioni fissate.', 'A s=2 fisso, R=4 R₀. R₀ da 1 a 3 Ω porta R da 4 a 12 Ω: dipendenza lineare da R₀, non triplicazione di s.', 'R₀=R/s². Misura 4 Ω e s=2 danno 4/4=1 Ω. s è adimensionale e non nullo; R₀ resta positivo.', 's²=R/R₀=4; radici±2, ma s=L/L₀≥1 impone s=2. Per un’inversa generale occorre R≥R₀>0; se R<R₀ non descrive allungamento nel dominio dichiarato.', 'A dà 1·2²=4 Ω. B con s=1 dà 1 Ω; rapporto B/A=1/4. s=1 è il confine ammesso di nessun allungamento.', 'Il corretto è 4 Ω. Scarto con segno proposta−corretto=8−4=+4 Ω; il rapporto 2 sarebbe puro e risponderebbe a un’altra domanda.', 'Da R=R₀s² si divide per s²>0: R₀=R/s². La dimensione rimane Ω. Non si usa R/s o s²/R.', 'Sostituendo R₀, B=κ₁R₀, A e s_B=κ₂s_A si ottiene R_B/R_A=κ₁κ₂². I fattori positivi devono anche conservare s_A, s_B≥1; non ogni fattore piccolo è lecito a s_A fissato.', 'A:1·2²=4 Ω. B:2·3²=18 Ω. Rapporto 18/4=9/2, comprendendo sia la variazione di R₀ sia il quadrato di s.', 'Media delle uscite (4+18)/2=11 Ω. Ai dati medi R₀=3/2 Ω, s=5/2 il modello darebbe(3/2)(25/4)=75/8 Ω;11−75/8=13/8 Ω. Si devono mediare le resistenze già calcolate.', 'Il bersaglio è(9/2)·4=18 Ω. Con R₀, B=2 Ω segue s_B²=9, quindi s_B=3. Rapporto s_B/s_A=3/2, con entrambi i fattori almeno 1.', 'Riferimento 4 Ω con S 12: guadagno a=3 Ω⁻¹ se il display è adimensionale. Lettura 54 dà R=18 Ω. s=3 implica R₀=18/9=2 Ω; la taratura si rimuove prima dell’inversa.', 'Riferimenti R_A 4, R_B 18 Ω, letture 9,37: a=(37−9)/(18−4)=2 Ω⁻¹, b=1. Lettura 25 dà R_C=(25−1)/2=12 Ω; con s_C 2 segue R₀, C=12/4=3 Ω.', 'Il vincolo nelle unità dichiarate è R₀=(1/2 Ω)s. Sostituendo in R=R₀s²:4 Ω=(1/2 Ω)s³, quindi s³=8 e s=2≥1. È unico sul ramo s≥1, con R₀=1 Ω. Non è una legge temporale di variazione della resistività.']

DISTRACTORS=['2 Ω omette la diminuzione della sezione; 1/2 Ω inverte la variazione di lunghezza; 8 Ω aggiunge un altro fattore due. La resistività rimane invariata.', 'Ω·m misura resistività, S conduttanza, A corrente e V tensione. Solo Ω corrisponde a V/A.', 'A parità di resistività, L/A può cambiare: geometrie con L/A pari a 1 e 2 hanno resistenze diverse; anche conduttanze e correnti a tensione non nulla possono differire.', '4/3 Ω inverte il fattore della resistenza iniziale; 36 Ω lo eleva anche al quadrato; 4 Ω ignora il cambiamento; 6 Ω omette il contributo della sezione.', '2 Ω divide soltanto per s; 16 Ω moltiplica per s²; 4 Ω non rimuove il fattore geometrico. La sola resistenza non determina la resistività senza geometria.', '4 è s²; −2 viola il rapporto positivo; 1/2 descriverebbe accorciamento, escluso da s≥1. Il rapporto di lunghezze è adimensionale.', '1/2 considera solo la lunghezza; 4 inverte il rapporto; 1 ignora la variazione; −1/4 non è rapporto di resistenze positive.', '−4 Ω inverte lo scarto; 8 Ω ripete la proposta; zero la accetta; 2 è un rapporto adimensionale, non una differenza in Ω.', 'R/s rimuove un solo fattore geometrico; s²/R ha unità Ω⁻¹; Rs² non isola R₀; il fattore due ulteriore è arbitrario.', 'κ₁κ₂ omette un fattore geometrico; κ₁/κ₂² inverte la scalatura; κ₁²κ₂² quadra anche R₀; κ₂²/κ₁ rende inversa R₀.', '2 segue solo R₀; 9/4 segue solo s²; 3 usa s linearmente; 2/9 è il reciproco del rapporto corretto 9/2.', '75/8 Ω applica il modello ai dati medi; 22 Ω omette la divisione per due; 7 Ω è metà della differenza; 4 Ω ripete la prima prova.', '2/3 inverte il rapporto; 9/4 confronta i quadrati; 9/2 copia il fattore di R; 3 è il solo valore finale di s, senza divisione per quello iniziale.', '6 Ω usa la lettura come resistenza senza taratura; 18 Ω è la resistenza finale; R₀=1 Ω ricostruisce una lettura 27, non 54.', '25/8 Ω non sottrae l’offset e ricostruisce 26; 1 Ω ricostruisce 9; 6 Ω ricostruisce 49; 12 Ω ricostruisce 97. Solo 3 Ω restituisce 25.', '8 copia s³; 4 non risolve la cubica; −2 viola s≥1 e renderebbe R₀ negativo nel vincolo. La monotonia di s³ esclude infinite soluzioni.']

ASSUMPTIONS=['Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.', 'Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.', 'Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.', 'Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.', 'Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.', 'Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.', 'Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.', 'Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.', 'Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.', 'Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.', 'Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.', 'Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.', 'Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.', 'Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.', 'Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.', 'Filo uniforme prima e dopo una preparazione ideale, volume LA conservato e resistività invariata alla stessa temperatura; R 0>0, s>=1 finiti. R è resistenza e rho è proprietà del materiale. Confronti fra preparazioni, non variazione temporale della resistività. Nel 03 autonomo due fili dello stesso materiale/temperatura/stato, senza vincolo di uguale geometria.']

UNITS={1: 'ohm', 2: 'ohm', 3: 'ohm*meter', 4: 'ohm', 5: 'ohm', 6: '', 7: '', 8: 'ohm', 9: 'ohm', 10: '', 11: '', 12: 'ohm', 13: '', 14: 'ohm', 15: 'ohm', 16: ''}

NUMERIC_UNITS={1: 'Ω', 5: 'Ω', 14: 'Ω', 6: '1'}

SUFFIX={8: ' Ω', 12: ' Ω', 15: ' Ω'}

NON_NUMERIC_DISTRACTORS={8: {'2'}, 16: {'Infinite soluzioni con s≥1'}}

SVG_REVIEW='XML finale e rendering nativo indipendente completo letti. I rettangoli L×A hanno lati 120×80 e 240×40 e area comune 9600 nelle coordinate del disegno: A è una sezione, non un diametro. Nella curva x=220+240u e y=840−80u−80u², le variabili fisiche sono s=(x−100)/120 e R=(860−y)/20=s². I punti s=1,2,3 restituiscono R=1,4,9 Ω. Le barre 4,18,11 Ω sono larghe 80,360,220 con origine 150 e scala comune 20 coordinate/Ω. Le origini numeriche sono separate dagli assi. Queste coordinate documentano la verifica, non compaiono come pixel fisici nel percorso studente.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle(); common=[]
    if sha(Path(codec.__file__).read_bytes())!=REVIEWED_LITERAL_CODEC_SHA256:common.append('Independent exact literal codec dependency changed')
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
          'reviewDependencySha256':{Path(codec.__file__).name:sha(Path(codec.__file__).read_bytes())},
          'methods':['SymPy_independent_conservation_and_constitutive_model','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'sourceFirstPrimarySha256':PRIMARY_SHA256,'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}


CANDIDATE_REF='e9405f9104380baffa38f7c6725765a239317a89'

PRIMARY_SHA256='e8b27ab57d7cae8ac419227900fbb28282555d33ba3c3265e0e55199e19378bd'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='2b21bf8ed8649e3c04e77daf6418ded387347746e5a105fe4058876b44674f5b'

REVIEWED_BINDINGS_SHA256='abf1a5a3ff88ceae454d05547899211ce8eae4fee69a54ad5ccdc4742757f5c9'

REVIEWED_CANDIDATES={'AR-u6-wire-stretched-fixed-volume-01': 'a823782e9d2bbf353f444c66525592b7b2ee4b900ef01001cbfcfc10d7478422', 'AR-u6-wire-stretched-fixed-volume-02': '0f4303df276bcb4fbc47984d20d11a942ff4512c7a5c1cf5ecd0cefb2dc75bcd', 'AR-u6-wire-stretched-fixed-volume-03': '135ef2d93337754b4c6ece6ce318daf2f8e79eb5d42c5cdd17eb818c1ac33c56', 'AR-u6-wire-stretched-fixed-volume-04': '675a11ac9934f64836d4de108b5fadbe2871be2339e6426806f0e799fd2ca1a6', 'AR-u6-wire-stretched-fixed-volume-05': '01873fa25db310266bedf41b3cacb03ffc3ac073f0aedf3bbc7be709a3272204', 'AR-u6-wire-stretched-fixed-volume-06': '095471886756607219c5b22367c693fafe605af92ebb94bc2d09bf94da2617b2', 'AR-u6-wire-stretched-fixed-volume-07': 'ae6fcb766a001bc403bb539d8492ee5dd61b571b878226eed56b19ff6089c99a', 'AR-u6-wire-stretched-fixed-volume-08': '8feb0282b5ffd499e47505970201c83027a4eaa4071a4dd7ee7bbaa2913e3220', 'AR-u6-wire-stretched-fixed-volume-09': 'f78851629eabc2e0e73dac437a0a6c034f121c4aecf0b2e0e4e8b2e98d1f5cf4', 'AR-u6-wire-stretched-fixed-volume-10': 'e0f8571909a16dd942344ff59581ef1b57b9d9647b21b35b92e7013a2d42450a', 'AR-u6-wire-stretched-fixed-volume-11': '2d476ba291eb3234c2ca2fbb2cec65c3c0d8e33f9c6413d0b977f3859b7eb8ab', 'AR-u6-wire-stretched-fixed-volume-12': 'ed8e8e9c5a7e277e5fc4acb3d94a4bdd480e2d598810117e2ab0503a28269254', 'AR-u6-wire-stretched-fixed-volume-13': 'bf1733ec4b22acfbf7262f30169ff35934e3e94b630de031e2ecdfbc63c02215', 'AR-u6-wire-stretched-fixed-volume-14': '6b5c7503ad3c049e782e43d9ec8ba45782854201b2a56f8db87652f15acb7b2e', 'AR-u6-wire-stretched-fixed-volume-15': '875c0722f112164d5aa898dcd6f313730ad76d1841e747daa8ae79a01fc0469e', 'AR-u6-wire-stretched-fixed-volume-16': '1732b13a00f700fab67d961defc600edf7ea4a9db41c4c83d28ff4d62ddec6ba'}

READ_SOURCE_SHA256={'u6-wire-stretched-fixed-volume-01': '616449b98d1a726aea8fca0a82674eb837802fa4d52d1f21f80823e93c661a0d', 'u6-wire-stretched-fixed-volume-02': '713aecdad09fbb1e72e6faddf5e55e22ae970cd65d714e54af7060adca1e8b14', 'u6-wire-stretched-fixed-volume-03': 'b55b5b86fdcf85303d23071b132cf06ebfece56f144fe05e2f6d189500979957', 'u6-wire-stretched-fixed-volume-04': '5069587842b654ad66421b3d4d08b443998ab66d6e5b97c17aa0f536d7f6083a', 'u6-wire-stretched-fixed-volume-05': 'e0e5b077366eabc783d998e7d2e24004d907c1f953a94d8c906e6fc4116038b5', 'u6-wire-stretched-fixed-volume-06': 'd160a469374c3e86b2ddb871d0849b647337268d55d8a98ed41f0f0b5c84fd9a', 'u6-wire-stretched-fixed-volume-07': '27b3e1e14b9fb22a8e3108c32a21446513c54e3d7ac7dbaf68d17e7de708f4ba', 'u6-wire-stretched-fixed-volume-08': '767e5ce76bc970eacc6eff8ca7c9a13002f313583941730f98cc6dd5379a9261', 'u6-wire-stretched-fixed-volume-09': 'ee4b9508eebe8663ff6f55084a04d1ae01c847251bffdcca1b3622507ba62d39', 'u6-wire-stretched-fixed-volume-10': '58e9061d97d2356f7da6bf77694739eb0928505baebaa42219087aa5cc92b3c7', 'u6-wire-stretched-fixed-volume-11': '0081688fc91ffb91e7114e8e4e1a985e28223289e6cf766c5ced8be3a51c8078', 'u6-wire-stretched-fixed-volume-12': '7a2d7be06c0dfc7d1a5d2dfe9129c38eab259f1ecd1048f4f1c0655f1e196a2c', 'u6-wire-stretched-fixed-volume-13': '52dbc5e71bae7ac154884e32c482c6a94b0aba6ca8806cc5c8d482c4b6819bbf', 'u6-wire-stretched-fixed-volume-14': '9cacdf9b61609d0a8b2db68b55f0836c3d94611f065984823ab83a8ced21d532', 'u6-wire-stretched-fixed-volume-15': '16deb17fa47abbb58664e4fb002f2287b8b741f00e7cd56478a8008463a7461b', 'u6-wire-stretched-fixed-volume-16': 'd6b435216936a98d240f5dd7889917443efe23e062868a88e1021d9555d5f71d'}

SOURCE_READING='Tutti gli 80 originali U6-02 B205–209 sono stati letti e derivati da prompt e dati prima di candidati, alternative o chiavi. La primaria e8b27ab5 resta immutata. Successivamente ogni campo di ciascun record finale, tutte le alternative e i cinque SVG XML/native completi sono stati letti separatamente. Le correzioni B sono state rilette prima del congelamento; nessun modulo autore importato. Catalogo reale C4-L05/L06 riletto. UI del prodotto e approvazione umana NOT_RUN. Nessun push o upload durante il vincolo operativo ROOT.'
