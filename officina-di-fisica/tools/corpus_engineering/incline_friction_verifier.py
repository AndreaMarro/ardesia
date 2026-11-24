"""Independent reviewer of sixteen descending kinetic-friction cases.

Derivation from normal contact equilibrium and signed tangential Newton;
never imports the candidate author's module or uses the author's key as proof.
"""
from fractions import Fraction
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows

SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-03.json'
FAMILY='incline-friction'
EXPECTED_IDS={f'AR-u2-{FAMILY}-{n:02}' for n in range(1,17)}


def oracle():
    mass,g,normal,mu,A=sp.symbols('mass g normal mu A',positive=True)
    s,c=sp.Rational(3,5),sp.Rational(4,5)
    if s*s+c*c!=1:raise ValueError('Given exact geometry inconsistent')
    contact=sp.solve(sp.Eq(normal-mass*g*c,0),normal)[0]
    # Positive direction down; already descending implies kinetic friction up.
    law=sp.solve(sp.Eq(mass*A,mass*g*s-mu*contact),A)[0]
    if sp.cancel(law-g*(3-4*mu)/5)!=0 or sp.diff(law,mu)!=-4*g/5:raise ValueError('Independent Newton projection failed')
    def accel(field,coefficient):return law.subs({g:field,mu:coefficient})
    first,second=accel(10,sp.Rational(1,2)),accel(20,sp.Rational(1,4))
    inverse_g=sp.solve(sp.Eq(A,law),g)[0]
    inverse_mu=sp.solve(sp.Eq(A,law),mu)[0]
    k1,k2=sp.symbols('k1 k2',positive=True)
    ratio=sp.cancel(law.subs({g:k1*g,mu:k2*mu})/law)
    target_ratio=k1*(3-4*k2*mu)/(3-4*mu)
    if sp.cancel(ratio-target_ratio)!=0:raise ValueError('Independent scaling failed')
    # All five symbolic alternatives checked for exact generic equivalence.
    direct=[g*(3+4*mu)/5,law,g*(4-3*mu)/5,g*(3-5*mu)/5,mu*g]
    inv=[A*(3-4*mu)/5,5*A/(3+4*mu),5*A/(3-4*mu),-5*A/(3-4*mu),5/(A*(3-4*mu))]
    scales=[k1/k2,k1*k2,target_ratio,k1*(3-4*mu)/(3-4*k2*mu),k2*(3-4*k1*mu)/(3-4*mu)]
    for options,expected,index in [(direct,law,1),(inv,inverse_g,2),(scales,ratio,2)]:
        if [i for i,v in enumerate(options) if sp.cancel(v-expected)==0]!=[index]:raise ValueError('Symbolic alternatives not unique')
    # Domain 0<mu<3/4 gives A>0; endpoints are distinct excluded cases.
    if accel(g,0)!=3*g/5 or accel(g,sp.Rational(3,4))!=0 or accel(g,1)>=0:raise ValueError('Domain sign test failed')
    gain,offset=sp.symbols('gain offset',real=True)
    cal=sp.solve([sp.Eq(gain*first+offset,5),sp.Eq(gain*second+offset,17)],(gain,offset))
    decoded=(9-cal[offset])/cal[gain]
    roots=sp.solve(sp.Eq(law.subs(g,20*mu),2),mu)
    if roots!=[sp.Rational(1,4),sp.Rational(1,2)] or not all(0<r<sp.Rational(3,4) and accel(20*r,r)==2 for r in roots):raise ValueError('Both quadratic physical branches required')
    Q=SI.Quantity
    weight=Q(1,'kg')*Q(10,'m/s**2')
    n=(weight*Fraction(4,5)).to('N');friction=(n*Fraction(1,2)).to('N')
    result=((weight*Fraction(3,5)-friction)/Q(1,'kg')).to('m/s**2')
    display_gain=(Q(6,'')/result).to('s**2/m')
    if (n.magnitude,friction.magnitude,result.magnitude,display_gain.magnitude)!=(8,4,2,3):raise ValueError('Pint rational projections/gain failed')
    if accel(15,sp.Rational(3,8))!=sp.Rational(9,2):raise ValueError('Input mean diagnostic failed')
    return [first,'m/s²','A=g(3−4μ)/5','Raddoppia da 2 a 4 m/s²',
      inverse_g.subs({A:2,mu:sp.Rational(1,2)}),inverse_mu.subs({A:2,g:10}),accel(10,sp.Rational(1,4))/first,
      4-first,'g=5A/(3−4μ)','κ₁ (3 − 4 κ₂ μ) / (3 − 4 μ)',second/first,(first+second)/2,
      inverse_mu.subs({A:4*first,g:20})/sp.Rational(1,2),inverse_g.subs({A:8,mu:sp.Rational(1,4)}),
      inverse_g.subs({A:decoded,mu:sp.Rational(1,2)}),'Due']

MANUAL=[
 'Assi: normale esterna, tangente positiva in discesa. N=4mg/5; f=μN verso monte; mA=3mg/5−μ4mg/5. Con g10,μ1/2: A=10(3−2)/5=2 m/s².',
 'Rapporti3/5,4/5 eμ puri: fattore(3−4μ)/5 puro, quindi A conserva dimensione L/T² di g.',
 'Newton perpendicolare→N=mgcosθ; tangenziale→mA=mgsinθ−μN; cancellando m>0: A=g(3−4μ)/5. Ogni proiezione applicata una volta.',
 'μ1/2→3−4μ=1, geometria fissa. g10→20 dà A2→4 m/s²; aumentano insieme componente del peso e attrito.',
 '5A=g(3−4μ); fattorepositivo1 aμ1/2→g5A=10 m/s². Al limiteμ3/4,A0, non invertibile conA2.',
 '5A/g=5·2/10=1;4μ=3−1=2→μ1/2. 0<A<3g/5 corrisponde a coefficiente positivo e A>0.',
 'μ1/2→fattore1,μ1/4→fattore2; g10→A2 e4; rapporto2, non rapportoμ1/2.',
 'Contributo gravitazionale6 m/s² e attrito per massa4 m/s² verso monte→A2. Proposta4 meno2=+2 m/s².',
 'A=g(3−4μ)/5→g=5A/(3−4μ); denominatorepositivo perμ<3/4, dimensioneaccelerazione.',
 'A_A=g(3−4μ)/5, A_B=κ₁g(3−4κ₂μ)/5. Rapportoκ₁(3−4κ₂μ)/(3−4μ), con entrambiμ eκ₂μ in(0,3/4).',
 'A_A=10·1/5=2; A_B=20·2/5=8 m/s²; rapporto4, prodotto dei duefattori2,2.',
 'Media(2+8)/2=5 m/s²; ingressi medi g15,μ3/8→15(3−3/2)/5=9/2 m/s². 5=10/2 distingue esattamente.',
 'TargetA_B4·2=8; g_B20→5A_B/g_B2, μ_B=(3−2)/4=1/4; rapporto colμ_A1/2 pari1/2.',
 'A_ref2,S_ref6→c3s²/m; S24→A8;μ1/4→g=5·8/2=20 m/s².',
 'ΔS17−5=12,ΔA8−2=6m/s²→c2s²/m;d1;S9→A4;μ1/2→g5·4=20m/s².',
 'g=(20m/s²)μ→A=(4m/s²)μ(3−4μ). ConA2 e unitàcomune divisa:8μ²−6μ+1=0=(4μ−1)(2μ−1). μ1/4,g5 eμ1/2,g10 entrambe ammesse e dannoA2.'
]
DISTRACTORS=[
 '6 ignorerebbe attrito;4 è solo contributo d’attrito per massa;10 sommerebbe attrito in versoerrato. Scorrimento discendente non decide da solo segno diA.',
 'N forza prima di dividere permassa;kg massa,m/s velocità,1 solo fattoregeometrico. Nessuna trigonometria inversa.',
 'Segno+ assegnaattrito avalle;scambio3/4 scambia componenti;5μ usaNmg;μg omette anchecosθ e peso parallelo. Contributoreale d’attritopermassa4μg/5.',
 'Invarianza ignora g;8 aggiunge quadrato. Attrito fissato mentre gcambia sarebbeincoerente perchéN crescecong.',
 'g=A omette fattore1/5;valorenegativo noncompatibile;μ3/4 dàA0 e denominatorezero, fuori datopositivo.',
 'μ1/4→A4;3/4→A0;1,2 fuori dominio discendenteaccelerato. Nessun bisogno di calcolareunangolo.',
 '1/2 seguirebbeμ come moltiplicatore di tuttaA invece che deltermine sottratto. Frizioneversomonteperentrambimoti.',
 '−2 ordineinverso;6 ometteattrito;4 ripetecontributofrenante;somma6+4 darebbe10errorediverso.',
 'Leggedirettaripetuta noninversa;+4μ cambiafisica;menofrontale dàgnegativo;1/A dimensioneinversa.',
 'κ₁/κ₂ e prodottoκ₁κ₂ ignorano differenza; parentesiinverse sbaglianoeffettoattrito;ultimaopzione scambiaκ₁ eκ₂. Sesecondoμsupera3/4 uscitamodelloA>0.',
 '2 solo g,1/2 soloμtrattatocomefattore,1 moltiplicalidueingressi senza sottrazione. A_B8m/s² nonrapportodimensionale4.',
 '10 somma;9/2 risultato suingressimedi diverso;leaccelerazionisono2e8,semisomma5.',
 '1/4 èμ_Bnonrapporto;2 o4 come rapporti dannoμ_B1 o2 fuori dominio;1 lascerebbeμ invariato e soloA_B4.',
 'S24letto comeA darebbeg60,perdendotaratura;controlloinavanti20·2/5=8,S3·8=24.',
 'g10,15,25,40 dannoS5,7,11,17;solo20dà9. Saltareoffsetdarebbeg45/2, non20.',
 'Unaperderebbeunramovalido;nessunacontraddice duesostituzioni;tre impossibileperquadraticanonnulla;infinite richiederebbeidentitànonpresente.'
]
ASSUMPTIONS=['Riferimento inerziale; piano rettilineo fisso, contatto mantenuto, sole forze peso normale e attrito dinamico. Scorrimento già discendente: attrito verso monte. m>0 costante, g>0 uniforme e rapporti sinθ3/5,cosθ4/5 dati; nessun angolo da valutare. Per il dominio assegnato0<μ<3/4, A>0; normale4mg/5 positiva.']*16
ASSUMPTIONS[9]+=' Seconda prova richiede anche0<κ₂μ<3/4;g eμ costanti dentroogniprova.'
ASSUMPTIONS[15]+=' Vincolo g=(20m/s²)μ collega prove diverse, non variazioni del campo lungo la discesa. Due coppie fisiche distinte.'
UNITS={n:'m/s**2' for n in range(1,17)}
UNITS.update({6:'',7:'',10:'',11:'',13:'',16:''})
NUMERIC_UNITS={1:'m/s²',5:'m/s²',7:'1',8:'m/s²',11:'1',12:'m/s²',14:'m/s²'}
SUFFIX={15:' m/s²'}


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
         'calculationScope':'NO_STUDENT_CALCULATION' if n==2 else 'SYMBOLIC_MANUAL_DERIVATION' if n in (9,10) or (n==3 and FAMILY!='static-threshold') else 'EXACT_MANUAL_CALCULATION',
         'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
         'methods':['SymPy_independent_Newton_contact_projection_or_elastic_model','SymPy_inverse_scaling_affine_and_branches','Pint_Fraction_exact_SI_dimensions','separate_per_ID_manual_distractor_and_SVG_reading'],
         'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':'All16original source rows and all16candidate records independently read; full solutions/options/feedback and scientific SVG frozen after separate physical derivation'}}

CANDIDATE_REF='f7970eac4b67325c87ee9ed8f02f5d640bccda89'
REVIEWED_PACKAGE_SHA256='a9f072a80dd463d9a25d43fcbb731c9400492ae2644563e8577892fed01eb2a1'
REVIEWED_BINDINGS_SHA256='c6ad92522b0efa03394f5bf999b8e679af178cc6341cf6a8d838622b6e341427'
REVIEWED_CANDIDATES={'AR-u2-incline-friction-01': 'fea3e512a73a60bc82a9491cb6e34ec97ecb7589065a812dfb6e99c2123cf171', 'AR-u2-incline-friction-02': 'cd6451be0796fb66bc95ca575b9c6700b9c2f25823f572975ea8b6c8bf7f5b4c', 'AR-u2-incline-friction-03': '90b6d0c8a67929d2689ae8bf5b774efd3e57649fdea639b8b51922ccf66bf326', 'AR-u2-incline-friction-04': '095688a8deef21723ffa25f56464bd58469ffca49ad5f804b87b4775f7e2fa62', 'AR-u2-incline-friction-05': 'd7bc0359c22c4cd1e3a891d8910bda0f391112c72434b4d0b399da4d5c0d8ff7', 'AR-u2-incline-friction-06': '76385fc2bb7e146016e0843353046c7a074238c40d0c8616d2992d4063a1afe8', 'AR-u2-incline-friction-07': '3358ce1d44bbf2e3ed1415596fb54d2f0e1e8574d6e09cc006dceddd37cc0a84', 'AR-u2-incline-friction-08': '9554a838cb7236e6eac6cd86612343a22477441ca186820ea9b37ef8736aa8b1', 'AR-u2-incline-friction-09': '93edf75f561263b41284b53c7e685cd955b82807b717af2512f9fe3f2056287b', 'AR-u2-incline-friction-10': '5b190683a79bf45515cc719f8004225d602e223ccdc63dc2664effee13eb32ce', 'AR-u2-incline-friction-11': '90d753c34759d91dd594a157107eab68d5ba2937028d565b254e6537c8a0634b', 'AR-u2-incline-friction-12': 'd2b14685e0c5d082be57880bb2415d7084a056aef57c3f2e6e5b698bcdf89fc5', 'AR-u2-incline-friction-13': '2f15daec18f326e594e6af2c5eb3459189b36c5743b198670e033f1fda709d52', 'AR-u2-incline-friction-14': '340a1d5e99f79f62b46f53f5c10f49f72488995dacd48b211e68710033db4b49', 'AR-u2-incline-friction-15': 'a008f28c6271e508a959fc7d3bf60277de3e8a1119c073ca5e0b0457064c08a2', 'AR-u2-incline-friction-16': '31c9999376955184ca36068e2418f08f975d0031f3f0cf24c0e98995ad40aa20'}
READ_SOURCE_SHA256={'u2-incline-friction-01': '3324abc9b24a9b3d42290e2a326739fab154e3adc0fdbedfcd7277b90fcaf205', 'u2-incline-friction-02': '5029edb3147d91778ad764378aeb9b9a668e511a13191be67f62a9d4fd2a3c7a', 'u2-incline-friction-03': 'b27ccf7749028a9cb1e3f01c316144c49fa9325c61638bac01acbad3464fed1f', 'u2-incline-friction-04': '5d9015349aba19e8a864221c3adaf70e94bdfb2b4ca08c439887e74d5f78344e', 'u2-incline-friction-05': '9f387a9db04cac5679cc531d78fb538e12f7d56829e7113628c6485f0ba2bfb4', 'u2-incline-friction-06': '0ca8b1e9ed25c49afe589ad1c428c1f66c2b47745e332e1f18d782231f31a28a', 'u2-incline-friction-07': '92598b97c4447e550a564e5835c57456b3d9e9fb1b78ef9935c75b5e390d0074', 'u2-incline-friction-08': '6f3d50553838039fe552d2a3fd268df584a9940d07cf7c25f557a3713d36d7d0', 'u2-incline-friction-09': 'bed37a19905b63ebd9726cb117b1be0d2f27250feda39476fd0615200d72412f', 'u2-incline-friction-10': '970bbe86d8b77eb4c541056c4afd5055a242bcfbbf995da174792db6ad1aa186', 'u2-incline-friction-11': '6ef82808cb9b87df5fecd26b5f448771787827bc8af106eb19c6c133b04307a9', 'u2-incline-friction-12': 'c37772ff32cf8aa2c8ac1f9628d89397ceaa6f186024274cffb87e641e6bae35', 'u2-incline-friction-13': 'd3d08672e4b776e9b0a9780c15e74aa38f27df20120481e258e0ab3ff8f01f17', 'u2-incline-friction-14': '2ea836b297dea360caba337dd93f626a8e3babfac183b564da42e451fb48208f', 'u2-incline-friction-15': '8d9290fcc75967cd5bfbee0f22e744ecc439373f22f3b03f59df6ae991adc5de', 'u2-incline-friction-16': 'f006774a75f3daec32bcf3b4ea01fe9707d1c1348979471434d85978f48be211'}
