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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-01.json'
FAMILY='electric-gravity-balance'
EXPECTED_IDS={f'AR-u6-{FAMILY}-{n:02}'for n in range(1,17)}
REVIEWED_SKILLS={n:'C4-L02'for n in range(1,17)}
def unique(options,want):
    if [i for i,item in enumerate(options) if sp.simplify(item-want)==0]!=[0]:
        raise ValueError('Independent symbolic alternatives not unique as general laws')

def calibrate(first,second,reading_first,reading_second):
    gain,offset=sp.symbols('gain offset',real=True)
    result=sp.solve([sp.Eq(gain*first+offset,reading_first),sp.Eq(gain*second+offset,reading_second)],(gain,offset))
    if result[gain]<=0:raise ValueError('Independent calibration gain not positive')
    return result[gain],result[offset]




def field(mass,charge):
    mass,charge=map(sp.sympify,(mass,charge))
    if any(x.is_real is not True or x.is_finite is not True or x<=0 for x in (mass,charge)):raise ValueError('Finite positive mass and charge required')
    return 10*mass/charge # m in mg and q in microcoulomb, E in N/C

def inverse_mass(electric,charge):
    electric,charge=map(sp.sympify,(electric,charge))
    if any(x.is_real is not True or x.is_finite is not True or x<=0 for x in (electric,charge)):raise ValueError('Finite positive upward field and charge required')
    return electric*charge/10

@lru_cache(maxsize=1)
def oracle():
    m,q,g,E,k1,k2=sp.symbols('m q g E k1 k2',positive=True)
    force_y=q*E-m*g;law=sp.solve(sp.Eq(force_y,0),E)[0]
    unique([m*g/q,q/(m*g),m*g*q,m/(q*g),-m*g/q],law)
    inv=sp.solve(sp.Eq(force_y,0),m)[0];unique([q*E/g,q*E*g,g/(q*E),E/(q*g),q/(E*g)],inv)
    unique([k1/k2,k1*k2,k2/k1,k1+k2,k1/k2**2],sp.cancel(law.subs({m:k1*m,q:k2*q})/law))
    aa,bb=field(1,2),field(2,1);assert(aa,bb)==(5,20)
    gain,offset=calibrate(aa,bb,11,41);assert(gain,offset)==(2,1)
    assert field(sp.Rational(3,2),sp.Rational(3,2))==10
    scale=sp.symbols('scale',positive=True);assert field(scale/2,scale)==5
    assert field(1,2)==field(sp.Rational(3,2),3)==5
    Q=SI.Quantity;assert Q(1,'milligram').to('kilogram').magnitude==Fraction(1,10**6)
    assert (Q(1,'milligram')*Q(10,'meter/second**2')/Q(2,'microcoulomb')).to('newton/coulomb').magnitude==5
    assert inverse_mass(5,2)==1
    return [aa,'N/C','E = m g / q','Da 5 a 15 N/C',inverse_mass(5,2),sp.Rational(10,5),field(1,1)/aa,10-aa,'m = q E / g','κ₁/κ₂',bb/aa,(aa+bb)/2,sp.Rational(1,2),inverse_mass(sp.Rational(60,3),1),inverse_mass((31-offset)/gain,2),'Infinite coppie positive']

def decode_read_quantity(raw):
    return exact_literal(raw)

MANUAL=['Asse +y verso l’alto: qE−mg=0. 1 mg=10⁻⁶ kg, q=2·10⁻⁶ C e mg=10⁻⁵ N; E=mg/q=5 N/C. Le forze non sono singolarmente nulle.', 'Dal rapporto peso/carica segue N/C, equivalente a V/m. Lette tutte le alternative dopo la primaria: N è forza, C carica, kg massa e V potenziale, non campo.', 'La componente della forza elettrica su q>0 è +qE, il peso è −mg. Equilibrio significa somma nulla, quindi E=mg/q>0. Non si tratta di azione e reazione su corpi differenti né di una prova di stabilità.', 'Con q=2 μC fisso, m da 1 a 3 mg triplica il peso: campo richiesto da 5 a 15 N/C. Il nuovo campo è preparato per un altro equilibrio.', 'm=qE/g=(2 μC)(5 N/C)/(10 m/s²)=10⁻⁶ kg=1 mg. Dividere una forza per g produce massa.', 'q=mg/E=(10⁻⁵ N)/(5 N/C)=2·10⁻⁶ C=2 μC. Il segno positivo dà la forza verso l’alto nel campo dato.', 'Stesso peso e carica dimezzata 2→1 μC: E deve raddoppiare 5→10 N/C. Rapporto 2.', 'Proposta 10 N/C meno corretto 5 N/C=+5 N/C. Il numero puro 2 è il rapporto, non la differenza dimensionata.', 'Da qE=mg si divide per g>0: m=qE/g. N/(m/s²)=kg. Nei numeri m[mg]=q[μC]E[N/C]/10 perché entrambi i prefissi introducono 10⁻⁶.', 'Con m_B=κ₁m_A e q_B=κ₂q_A, E_B/E_A=κ₁/κ₂. g si cancella; fattori uguali lasciano il campo invariato.', 'A:10·1/2=5 N/C. B:10·2/1=20 N/C. Rapporto 4, fattore due del peso per fattore due dovuto alla carica dimezzata.', 'Media dei campi (5+20)/2=25/2 N/C. Il modello ai dati medi m=q=3/2 nelle rispettive unità dà 10 N/C, diverso di 5/2 N/C.', 'Bersaglio4E_A=20 N/C e m_B=2 mg impongono q_B=1 μC. Rapporto q_B/q_A=1/2.', 'A E=5 N/C con D=15 dà a=3 C/N. D_B=60 dà E_B=20 N/C. Con q_B=1 μC, m_B=q_BE_B/g=2 mg.', 'Campi di riferimento5,20 N/C e display11,41: a=2 C/N,b=1. D_C=31 dà E_C=15 N/C; q_C=2 μC implica massa3 mg.', 'β=(1/2)mg/μC=1/2 kg/C. Se m=βq, E=βg=5 N/C per ogni q>0. La misura ridondante non fissa la scala: esempi (1 mg,2 μC) e (3/2 mg,3 μC); infinite coppie positive nel modello continuo.']

DISTRACTORS=['10 N/C omette la carica2;5000 N/C tratta1 mg come10⁻³ kg; campo nullo non può sostenere il peso non nullo.', 'N forza,C carica,kg massa,V potenziale. Il campo equivale a V/m, non V.', 'q/(mg) dàC/N;mgq dàNC;m/(qg) cambia dimensione;−mg/q darebbe forza verso il basso su qpositiva.', '5/3 inverte massa;10 raddoppia anziché triplicare;5 ignora cambio;45 applica quadrato del fattore3.', '10 mg omette divisione per g;1 g perde mille; non si sommano carica e campo per ottenere massa.', 'mgE non ha C;2 C perde micro;1 μC sostiene metà peso;segno negativo darebbe forza verso il basso.', '1/2 segue carica direttamente;1 ignora variazione;4 introduce quadrato;−2 non è rapporto di moduli positivi.', '−5 inverte scarto;10 copia proposta;0 l’accetta;2 puro non è differenza di campi.', 'qEg è kg per g²;g/(qE) dà kg⁻¹;E/(qg) dàkg/C²;q/(Eg) non dàkg. SoloqE/g isola m.', 'Prodotto rende diretta q;reciproco inverte prove;somma vale2 per prove uguali;κ₂² è quadrato assente.', '2 considera un solo cambio;1/4 reciproco;1/2 segueq nel verso sbagliato;1 presume compensazione inesistente.', '10 usa ingressi medi;25 non dimezza;15/2 è metà differenza;5 copia A.', '2 inverte rapporto;1 dàE10;1/4 dàE40;4 dàE5/2, tutti diversi dal bersaglio20 N/C.', 'D60 come campo dà6 mg;1 mg conq1 darebbeE10;20 copia campo;g non si cambia per adattare un display.', '31/10 mg omette offset e prediceD32;1 mg torna adA;2 mg prediceD21;15 mg prediceD151.', 'Coppie singole non esauriscono infinite soluzioni;conqfisso2 non sono ammesse tutte le masse perché m/q deve restare1/2 kg/C.']

ASSUMPTIONS=['Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.', 'Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.', 'Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.', 'Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.', 'Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.', 'Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.', 'Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.', 'Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.', 'Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.', 'Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.', 'Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.', 'Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.', 'Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.', 'Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.', 'Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi.', 'Equilibrio verticale inizialmente fermo, carica positiva, campo locale verso l’alto, g10 m/s² e nessuna altra forza verticale. +y verso l’alto; peso e forza elettrica sullo stesso corpo, non azione-reazione. Si ricava condizione di equilibrio, senza inferire stabilità restaurativa; parametri continui positivi. Il vincolo tra preparazioni rende la misura ridondante e lascia libera una scala positiva.']

UNITS={1: 'newton/coulomb', 2: 'newton/coulomb', 3: 'newton/coulomb', 4: 'newton/coulomb', 5: 'milligram', 6: 'microcoulomb', 7: '', 8: 'newton/coulomb', 9: 'kilogram', 10: '', 11: '', 12: 'newton/coulomb', 13: '', 14: 'milligram', 15: 'milligram', 16: ''}

NUMERIC_UNITS={1: 'N/C', 5: 'mg', 6: 'μC', 14: 'mg'}

SUFFIX={8: ' N/C', 12: ' N/C', 15: ' mg'}

NON_NUMERIC_DISTRACTORS={8: {'2'}}

SVG_REVIEW='XML e PNG nativo integrale letti. Forze elettrica e peso hanno frecce simmetriche rispetto a centro(320,260), da232→120 e288→400 con medesimo marker: moduli uguali10 μN e versi opposti. Campo5 N/C separato e schematico, non confrontato in lunghezza con forze. Prefissi mg→kg eμC→C entrambi10⁻⁶. Barre5,20,25/2N/C larghe80,320,200 da origine130 con scala comune; testi e origine liberi.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}

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
                exact=decode_read_quantity(raw)
                if sp.simplify(exact-want)!=0:errors.append('Independent '+FAMILY+' result mismatch')
                if row['answer']['type']=='choice':
                    equivalent=[]
                    for alternative in row['answer']['options']:
                        option=str(alternative).replace('−','-').strip()
                        if option in NON_NUMERIC_DISTRACTORS.get(n,set()):continue
                        if suffix and not option.endswith(suffix):raise ValueError('alternative missing physical unit')
                        if suffix:option=option.removesuffix(suffix).strip()
                        if sp.simplify(decode_read_quantity(option)-want)==0:equivalent.append(alternative)
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


CANDIDATE_REF='e82f91ab990e0c43ca7073dd7492aa2ba23fbfd0'

PRIMARY_SHA256='3531bf38e7970d52ba36b9193b48827d0a59b7f8d5c364705e0ff60809e268e9'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='c69a76ace742c26dd0034e65528542d446e29b383afc12cb84c9ae6ddbf71f03'

REVIEWED_BINDINGS_SHA256='1c9b39f86ca0f0db9eed46d55a9db18d9f075cf95e14aab86246b14063c3528a'

REVIEWED_CANDIDATES={'AR-u6-electric-gravity-balance-01': 'a0376fc1ade0b57d97700197224c88518f27ea40ba62860dab35fe51205f01f1', 'AR-u6-electric-gravity-balance-02': '32785c0bae45b0b401f44988b1cc1d8ed70fe96a9b80aa30f357f23345965be8', 'AR-u6-electric-gravity-balance-03': '9cb9e2bf69565aa01e89c321d02a94960b26d52926c551546baec5bddc4db23a', 'AR-u6-electric-gravity-balance-04': 'b9feac668d02fdfedcaaa2824150953b66e018c1343b7b588deea573d28fd63f', 'AR-u6-electric-gravity-balance-05': 'ee22a4d24ff14077012dd0905651f424d96de77887cf07e0ad15841decea308e', 'AR-u6-electric-gravity-balance-06': '6e6e5bc1d707c9df92ece97b888af584dab09244e99f0dfd2641532d72a96fe2', 'AR-u6-electric-gravity-balance-07': 'c3084f64917b436619f60620d21e54bd77a1cb1955d5f2cafcc82c179835f19b', 'AR-u6-electric-gravity-balance-08': '747c47725c39fd3391ec1ad172dc7467a28824c0607eec572fa004c068d3be8a', 'AR-u6-electric-gravity-balance-09': '19bfb5f46227d0f1e26bfa29eddf83e1dd9491cb23f8a30821e932acc0fe3291', 'AR-u6-electric-gravity-balance-10': '8e6c2ea4f7c38e490327f8dd569089fe7953c42fad869740f67598f0f61bd990', 'AR-u6-electric-gravity-balance-11': 'fb1a9e910dc026b65aacccadcbed3e161c64c8f6e3f9224fb3b3b05d89be2787', 'AR-u6-electric-gravity-balance-12': '9f095a70e5c88c9939dc7eab49258c14e0d012e8952366d6313332393b01feed', 'AR-u6-electric-gravity-balance-13': '2594aecb7026d13ab6afc767c44c2e7428ad342ea989410d117f49bdffadfabe', 'AR-u6-electric-gravity-balance-14': '4bf6cd089b90d7a34cb2c7e0ea1323711158ee7a8e63a55f8e21a007903a62a6', 'AR-u6-electric-gravity-balance-15': '86d1e54d63de19895591f22b3bc35ca84d4b96474e641de2d57dc95c3212f91e', 'AR-u6-electric-gravity-balance-16': '81203d308263f6709015ce3311101f9c8bec190fd508894d8976ad18ad890638'}

READ_SOURCE_SHA256={'u6-electric-gravity-balance-01': '6546f4d34b9a8b563e89468951d5bef21687f08a98135224ba2e7e2c1447f51f', 'u6-electric-gravity-balance-02': '9c53231bd1a6c3002675b6a54d6b79884cc40d91bbe350ad639b1c9f8c10cfe6', 'u6-electric-gravity-balance-03': '710997f2801a4ea36efc6ba59ffc15bb84a857cdf36766f070382f2bcbf4e418', 'u6-electric-gravity-balance-04': '26d25c8332d2052239b477549911932845b03eff1c2b20fc528ef3ca87e68933', 'u6-electric-gravity-balance-05': '50e70bb587dc92419ccb7bdf82827dbe3ee69077726d277f2365daac16db994d', 'u6-electric-gravity-balance-06': '5135cae09ea6b7feb891d5c15b9f436062318a45fd551d9af50df02c8c2f6fc0', 'u6-electric-gravity-balance-07': 'ee4b71a343294ff0971858426bbb64aa792c563633507b838972c418e7537968', 'u6-electric-gravity-balance-08': 'bb32a47dd204d5e13e6c433f171a5ef850c4d460dcd4d25ece56b62f9716254f', 'u6-electric-gravity-balance-09': 'bc199bb2eaccba4c40a7f87b27039e019f188e7f134f0cb4c31a454d517935cc', 'u6-electric-gravity-balance-10': 'b173d8e24efafede883ec733c009d6c6f26f31e5ca6f7ada1c2c7c0ba348f1e0', 'u6-electric-gravity-balance-11': 'a480294b8a937bae23d3ccbc22489a7ec9fd937dc59e72bb2ec2cd0860b79330', 'u6-electric-gravity-balance-12': 'c58a629457f2b7dbb11cf8677bed9893c48b2beb5d5c612bccb0fefd88aa301a', 'u6-electric-gravity-balance-13': '74dd130d22c1ea5be6fa5f4ded43990b3184f51b955265cdf67bfbe335fcece3', 'u6-electric-gravity-balance-14': 'e1286093c79b68f13d4a0498e57deccd283aa2aaea3310aa29210799ca53e377', 'u6-electric-gravity-balance-15': 'ea97b553ed1f4a71f82df7d8ef8cb2696789fdd524c9240796a6ba460a786337', 'u6-electric-gravity-balance-16': '1aead403f345f40cd93e27d19fd76dbd1905a4afe425ffafa8c3f2eb53fc90f4'}

SOURCE_READING='Primaria indipendente3531 congelata dopo tutti80 originali prompt-only, prima delle candidate. Poi letti integralmente i16 record finali del lotto, tutte opzioni, blocchi, formule, hint/error, metadati, XML e rendering nativo completo realmente prodotto. Nessun autore importato. Lezioni reali C4-L02/L03 e prerequisiti di meccanica riletti; ipotesi e casi speciali confrontati individualmente. Byte congelati soltanto dopo lettura finale; UI prodotto NOT_RUN.'
