"""Independent individual physics review; no candidate authoring module imported."""
from fractions import Fraction
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-05.json'
FAMILY='torque-perpendicular'
EXPECTED_IDS={f'AR-u2-{FAMILY}-{n:02}' for n in range(1,17)}

def oracle():
    r,F,M=sp.symbols('r F M',positive=True)
    vector=sp.Matrix([r,0,0]).cross(sp.Matrix([0,F,0]))
    law=vector[2]
    if vector!=sp.Matrix([0,0,r*F]):raise ValueError('Perpendicular oriented cross product failed')
    # Force on a line through the pivot, point may differ from the pivot.
    collinear=sp.Matrix([r,0,0]).cross(sp.Matrix([F,0,0]))
    if collinear!=sp.zeros(3,1):raise ValueError('Line through pivot must have zero torque')
    inverse_F=sp.solve(sp.Eq(M,law),F)[0]
    inverse_r=sp.solve(sp.Eq(M,law),r)[0]
    a,b=sp.symbols('a b',positive=True)
    ratio=sp.cancel(law.subs({F:a*F,r:b*r})/law)
    for opts,want,index in [([M*r,r/M,M/r,2*M/r,M/(2*r)],inverse_F,2),([a*b,a/b,b/a,a+b,a*b**2],ratio,0)]:
        if [i for i,v in enumerate(opts) if sp.cancel(v-want)==0]!=[index]:raise ValueError('Torque symbolic alternatives not unique as general laws')
    def torque(force,arm):return law.subs({F:force,r:arm})
    A,B=torque(2,2),torque(4,4)
    c,o=sp.symbols('c o',real=True)
    cal=sp.solve([sp.Eq(c*A+o,9),sp.Eq(c*B+o,33)],(c,o))
    C=(17-cal[o])/cal[c]
    u=sp.Symbol('u',real=True)
    if sp.solve(sp.Eq(u*u,4),u)!=[-2,2]:raise ValueError('Torque quadratic roots failed')
    U=SI.Quantity
    value=(U(2,'N')*U(2,'m')).to('N*m')
    force=(U(4,'N*m')/U(2,'m')).to('N')
    bad=(U(4,'N*m')*U(2,'m')).to('N*m**2')
    square=(U(4,'N*m')/U(1,'N/m')).to('m**2')
    gain=(U(24,'')/U(12,'N*m')).to('1/(N*m)')
    if (value.magnitude,force.magnitude,bad.magnitude,square.magnitude,gain.magnitude)!=(4,2,8,4,2):raise ValueError('Pint exact moment inverse/distractor/gain dimensions failed')
    if SI.Unit('N*m').dimensionality!=SI.Unit('J').dimensionality:raise ValueError('Moment and work share dimension, not physical meaning')
    if (A+B)/2-torque(3,3)!=1:raise ValueError('Mean products diagnostic failed')
    return [A,'N·m','0 N·m','Da 4 a 8 N·m',inverse_F.subs({M:4,r:2}),inverse_r.subs({M:4,F:2}),torque(2,4)/A,8-A,'F=M/r','κ₁ κ₂',B/A,(A+B)/2,inverse_r.subs({M:4*A,F:4})/2,inverse_F.subs({M:48/(sp.Integer(12)/A),r:4}),inverse_F.subs({M:C,r:2}),sp.Integer(2)]

MANUAL=['Prodotto vettoriale r=(r,0,0),forza=(0,+F,0):τz=rF positivo antiorario. Perpendicolarità dàmoduloM=rF=2·2=4Nm;consegna richiede modulo,nonversoassoluto nonassegnato.', 'N·m=kg m²/s²;stessa dimensioneJ,grandezza meccanica diversa dal lavoro. Nessuna altra unità equivalente nelle cinque opzioni.', 'Retta d’azione perO→braccio perpendicolareb0→M=8N·0m=0Nm. Il punto di applicazione può essere diverso daO,ma r eF collineari dannoprodottovettoriale0.', 'r2m comune,F2→4N: moduliM4→8Nm;rapporto2. Nessuna previsione di accelerazione senza momento totale e inerzia.', 'F=M/r=4Nm/2m=2N. r>0 consente divisione eperpendicolarità evita fattore seno ulteriore.', 'r=M/F=4Nm/2N=2m. Distanza al punto coincideconbraccioperipotesi90°;nelcasoobliquoM/Fdarebbesolobraccioperpendicolare.', 'F2Ncomune,r2→4m dàM4→8Nm,rapporto2.', 'CorrettoM4Nm;proposto8Nm;scarto8−4=+4Nm. Segno dello scarto non convenzione di rotazione.', 'M=Fr→F=M/r. MrhaN m² inveceN; r/Mha1/N. Positività di r esplicita.', 'M_B=(κ1F)(κ2r),M_A=Fr→rapportoκ1κ2. Angoli entrambi90°,nessun rapporto di seni mancante.', 'M_A4Nm,M_B4·4=16Nm;rapporto16/4=4,puro.', 'Media dei moduli(4+16)/2=10Nm;ingressi medi3N,3m danno9Nm. Prove distinte,non somma di momenti simultanei.', 'TargetM_B16Nm,F_B4N→r_B4m;rapporto a r_A2m uguale2.', 'RefM4Nm,S12→c3(Nm)⁻¹;S48→M16Nm; r4m→F4N.', 'RefM4,16Nm;ΔS24/ΔM12Nm→c2(Nm)⁻¹,a1;S17→M8Nm;r2m→F4N.', 'F=ar,a1N/m tra configurazioni→M=ar²4Nm→r²4m². Radici±2m,solo+2 con r>0 eF>0;non integrazione di lavoro.']
DISTRACTORS=['Forza2N nonmomento4Nm;nonèenergia giàtrasferita;segno orientato richiede verso scelto.', 'N forza,N/m rigidezza,kgmassa,m lunghezza. Nm corretto;non affermata dimensione differente daJ.', '2,4,8,16Nm richiedono braccio nonnullo assente;forza8Nnonmomentonecessariamente8Nm. Momento0 nonforza0 o risultante0.', '4 invariatoignoraF,16raddoppiaancher,2inverte,zeroimpossibilepermodulipositiviperpendicolari.', 'Moltiplicareperr nonisolaF,4numeromomentononforza;2Nricostruisce4Nm.', 'Fnonzero necessario;senzaangolodatoladistanza noncoincide necessariamente conM/F,maqui90°.', '1/2inverte,4quadrato,1ignora,−2 nonrapporto di moduli positivi.', '−4ordine inverso,8proposta,2dimezza,5o3noncalcolo esatto.4J nonlavoro assegnato.', 'MrhaN m²,nonN;r/M1/N;2M/r doppio,M/(2r)metà,nonriproduconoM.', 'Quozienti inversi,somma2allidentità,κ2²confondemomentodinerzia,nonmomentodiforza.', '2un cambiamento,1/4reciproco,8quadratoindebito,16NmvaloreB nonrapporto.', '20somma,5doppiametà,9ingressimedi,11nonsemisomma. Nessun momento risultante unico di prove distinte.', 'rquadruplicato conFdoppia→8volteM;rinvariato→2volte,non4;4mbracciononrapporto.', 'S48come48Nm dàF12N,guadagnospurio3;corretto4NricostruisceS48.', 'F2,3,5,8N ar2m dannoS9,13,21,33;solo4Ndà17. Offset noneliminatodarapporto letture.', '−2braccio neg eFneg;4confonder²;1o3danno1o9Nmnon4. Vincolofraprove,nonlavoro.']
ASSUMPTIONS=['Forza perpendicolare all’asta e braccio r>0,moduloF>0;M modulo positivo del momento della singola forza rispetto alfulcro,non momento totale né lavoro. Configurazioni distinte,nessuna legge di variazione neltempo presupposta.', 'Forza perpendicolare all’asta e braccio r>0,moduloF>0;M modulo positivo del momento della singola forza rispetto alfulcro,non momento totale né lavoro. Configurazioni distinte,nessuna legge di variazione neltempo presupposta.', 'Caso distinto:retta d’azione passa perfulcro,forza8N nonnulla,puntodiapplicazione potenzialmentediverso dalfulcro. Braccioperpendicolare0,momento0.', 'Forza perpendicolare all’asta e braccio r>0,moduloF>0;M modulo positivo del momento della singola forza rispetto alfulcro,non momento totale né lavoro. Configurazioni distinte,nessuna legge di variazione neltempo presupposta.', 'Forza perpendicolare all’asta e braccio r>0,moduloF>0;M modulo positivo del momento della singola forza rispetto alfulcro,non momento totale né lavoro. Configurazioni distinte,nessuna legge di variazione neltempo presupposta.', 'Forza perpendicolare all’asta e braccio r>0,moduloF>0;M modulo positivo del momento della singola forza rispetto alfulcro,non momento totale né lavoro. Configurazioni distinte,nessuna legge di variazione neltempo presupposta.', 'Forza perpendicolare all’asta e braccio r>0,moduloF>0;M modulo positivo del momento della singola forza rispetto alfulcro,non momento totale né lavoro. Configurazioni distinte,nessuna legge di variazione neltempo presupposta.', 'Forza perpendicolare all’asta e braccio r>0,moduloF>0;M modulo positivo del momento della singola forza rispetto alfulcro,non momento totale né lavoro. Configurazioni distinte,nessuna legge di variazione neltempo presupposta.', 'Forza perpendicolare all’asta e braccio r>0,moduloF>0;M modulo positivo del momento della singola forza rispetto alfulcro,non momento totale né lavoro. Configurazioni distinte,nessuna legge di variazione neltempo presupposta.', 'Forza perpendicolare all’asta e braccio r>0,moduloF>0;M modulo positivo del momento della singola forza rispetto alfulcro,non momento totale né lavoro. Configurazioni distinte,nessuna legge di variazione neltempo presupposta.', 'Forza perpendicolare all’asta e braccio r>0,moduloF>0;M modulo positivo del momento della singola forza rispetto alfulcro,non momento totale né lavoro. Configurazioni distinte,nessuna legge di variazione neltempo presupposta.', 'Forza perpendicolare all’asta e braccio r>0,moduloF>0;M modulo positivo del momento della singola forza rispetto alfulcro,non momento totale né lavoro. Configurazioni distinte,nessuna legge di variazione neltempo presupposta.', 'Forza perpendicolare all’asta e braccio r>0,moduloF>0;M modulo positivo del momento della singola forza rispetto alfulcro,non momento totale né lavoro. Configurazioni distinte,nessuna legge di variazione neltempo presupposta.', 'Forza perpendicolare all’asta e braccio r>0,moduloF>0;M modulo positivo del momento della singola forza rispetto alfulcro,non momento totale né lavoro. Configurazioni distinte,nessuna legge di variazione neltempo presupposta.', 'Forza perpendicolare all’asta e braccio r>0,moduloF>0;M modulo positivo del momento della singola forza rispetto alfulcro,non momento totale né lavoro. Configurazioni distinte,nessuna legge di variazione neltempo presupposta.', 'Forza perpendicolare all’asta e braccio r>0,moduloF>0;M modulo positivo del momento della singola forza rispetto alfulcro,non momento totale né lavoro. Configurazioni distinte,nessuna legge di variazione neltempo presupposta. F=(1N/m)r fra prove,rami±2 considerati,solo positivo.']
UNITS={1: 'N*m', 2: 'N*m', 3: 'N*m', 4: 'N*m', 5: 'N', 6: 'm', 7: '', 8: 'N*m', 9: 'N', 10: '', 11: '', 12: 'N*m', 13: '', 14: 'N', 15: 'N', 16: 'm'}
NUMERIC_UNITS={1: 'N·m', 5: 'N', 6: 'm', 8: 'N·m', 11: '1', 12: 'N·m', 13: '1', 14: 'N', 16: 'm'}
SUFFIX={15:" N"}

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle();common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed '+FAMILY+' package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed '+FAMILY+' binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u2-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        want=expected[n-1];value=row['answer']['value']
        if isinstance(want,str):
            if value!=want:errors.append('Independent '+FAMILY+' conceptual key mismatch')
        else:
            try:
                raw=str(value).replace('−','-');suffix=SUFFIX.get(n,'')
                if suffix and not raw.endswith(suffix):raise ValueError('missing unit')
                if suffix:raw=raw.removesuffix(suffix)
                if len(raw)>80 or sp.Rational(raw)!=sp.Rational(want):errors.append('Independent '+FAMILY+' result mismatch')
            except (ValueError,TypeError):errors.append('Independent '+FAMILY+' answer or unit invalid')
        if row['answer']['type']=='numeric' and row['answer'].get('unit')!=NUMERIC_UNITS.get(n):errors.append('Independent '+FAMILY+' numeric unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,
         'assetChecksums':assets,'ok':not errors,'errors':errors,'expectedExact':str(want),
         'dimension':{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},
         'manualArithmetic':MANUAL[n-1],'physicalAssumptions':ASSUMPTIONS[n-1],'distractors':DISTRACTORS[n-1],
         'pedagogicalReview':'Riletti separatamente consegna, tutti i passaggi, hint, feedback e cinque alternative ove presenti; procedura manuale esatta e vincoli espliciti. '+MANUAL[n-1],
         'calculationScope':'NO_STUDENT_CALCULATION' if n==2 else 'SYMBOLIC_MANUAL_DERIVATION' if n in (3,9,10) else 'EXACT_MANUAL_CALCULATION',
         'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
         'methods':['SymPy_independent_vector_cross_product_and_static_balance','SymPy_rigid_rotation_inverse_scaling_affine_and_identifiability','Pint_Fraction_exact_SI_dimensions','separate_per_ID_manual_distractor_and_SVG_reading'],
         'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':'All16original source rows and all16candidate records independently read; full solutions/options/feedback and scientific SVG frozen after separate physical derivation'}}

CANDIDATE_REF='6af2ce6c5fc9ab23fd36e6fa98bbab98773b2639'
REVIEWED_PACKAGE_SHA256='35efba6cbd7805bf4cc8fa5358fff2c04724b00e8f8b2947969d5fc3791662eb'
REVIEWED_BINDINGS_SHA256='d3fa70a6002b6530deee26e67492663edf2004598e95c9b094d9c8095990e903'
REVIEWED_CANDIDATES={'AR-u2-torque-perpendicular-01': '0fa00c46eb208949f8141dfb8cb26aa8a02ae918f027f1df5578a708d4359634', 'AR-u2-torque-perpendicular-02': '5fa798331b4b8ad3857bd8cb4cff1197870ee6f75f10e58f87a6b274215b55fe', 'AR-u2-torque-perpendicular-03': '30e8ae2e2ba1d3d827d14cb58f920a1f36d1152a4d337f624277790a8db02ce1', 'AR-u2-torque-perpendicular-04': 'c9bc1c5b256e0def86dd35d3bd85e6032d06ceb81a32108436d12fb0cc6206a7', 'AR-u2-torque-perpendicular-05': '958dbd01dcd2ad21d761d878b32222178e6fc5ce859e872fbc1540522ff20c70', 'AR-u2-torque-perpendicular-06': '32821c9c404d119cfb502748eba4e7b26cc952303684177ef740b1c5fe6b5487', 'AR-u2-torque-perpendicular-07': '2145ae78885d550d2676153011eb36a627d9bf648bea476a5534caa3d6abe0bc', 'AR-u2-torque-perpendicular-08': 'a430cf290ad381dd3976e00f172a2b87b4557ef2362d5eee1c5eca2260b71290', 'AR-u2-torque-perpendicular-09': '2fa669e6a1b213f1d8cc3e803bc43bbe4c8d959ca9e100cfbcfe06c407148360', 'AR-u2-torque-perpendicular-10': '6cbbe24c2f18b5dc90dbd5b1c1726cbea0fa12bfee21b6b4c2f779a0e8255c59', 'AR-u2-torque-perpendicular-11': 'f2965703771e2f0dff8103a2291e64a296598229a2a6a67904b96b8842b22bf2', 'AR-u2-torque-perpendicular-12': 'bed8c0623cbff7b526ff2ad6c4586ef860671b78a284981716f1832ba143b24e', 'AR-u2-torque-perpendicular-13': '906a746b19cb20c1445447778e508a52f1292edc71c5bbecaa49b753fd46bfbf', 'AR-u2-torque-perpendicular-14': '45e7db908d3df9e318d94482d6d019c8d27c1cce94ce09f898a7abf2eec8a19b', 'AR-u2-torque-perpendicular-15': '609a81358c40530d0688c23927b033511220964c1df26ed22a9dae7750f9293f', 'AR-u2-torque-perpendicular-16': '81198c5b2bbab205498a117ac530586d871dc1d187ec9bd2143f36741f7ef1dd'}
READ_SOURCE_SHA256={'u2-torque-perpendicular-01': '2510b6a95823bea9c839493c918986a8f00657fd576ed0b98ae62bd297f95b9c', 'u2-torque-perpendicular-02': '1512dea10b41f4cf04ba9a01de55e90a28d5277968eb3e36bef1f23a85b73a9a', 'u2-torque-perpendicular-03': '24a78abc168569afbc57e55fe5c23c7ed108516c9605699e3d8e80749d730e52', 'u2-torque-perpendicular-04': '7b2fcb7ee2334246ee03796b62d0e05e0667e548c071da906e7dd4f2149f4dfb', 'u2-torque-perpendicular-05': 'bb06de3d1eec7cb05da08e91d3e1ea73071b84e633975333f6ac56d8c0528adf', 'u2-torque-perpendicular-06': '1d68efef4fe193a1329facf4ae55c9c0f838d0164b42a32ac8c85c6e8a2db0a2', 'u2-torque-perpendicular-07': 'ec2012c90be0057f934c54d0182d9205bf5026ddc0ca4cc4a5a245bb4bcb7a49', 'u2-torque-perpendicular-08': 'c5c0ef4bf518305d1b654fd3fced89684839e7d30ab5acfecbf1bcadd8beae74', 'u2-torque-perpendicular-09': '3f97a1b9b936b3474fb57f0e4ee3caf41b7913438f190d0172060c8ffd5156b1', 'u2-torque-perpendicular-10': '55612fffab93a284419f4fc683173220a4a953f8e7052801f7918cfacd637ea6', 'u2-torque-perpendicular-11': 'f7d6963af6bdbcb215a69978f3e5f8d55c55dcc5b72e44c9068b59046106e46a', 'u2-torque-perpendicular-12': 'c9e3857af5aa240c7a766cbac11accc989b74f96778270960a89364c8b13e2d5', 'u2-torque-perpendicular-13': 'e03e0bbb05a0933b1c5f42f8c9fd79819398e1a9efba4a11e832f927420cd7fb', 'u2-torque-perpendicular-14': '65652057e1b1b9611e1e7ebe2ee27e7b8b5b539a62e030d9b0ba00e9268fe12c', 'u2-torque-perpendicular-15': 'c10b380762d25c9496ab75d6e7c1ea4dc9109a30a72ec1cca83aadd78e3e14ec', 'u2-torque-perpendicular-16': 'dfa7b8a0cbeee3bcce2e1253c9735ff2dee033b6f02aedcab812d42dbd5b93d6'}
