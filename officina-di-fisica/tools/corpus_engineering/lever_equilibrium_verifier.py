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
FAMILY='lever-equilibrium'
EXPECTED_IDS={f'AR-u2-{FAMILY}-{n:02}' for n in range(1,17)}

def oracle():
    R,b,a,F=sp.symbols('R b a F',positive=True)
    motor=sp.Matrix([-a,0,0]).cross(sp.Matrix([0,-F,0]))[2]
    load=sp.Matrix([b,0,0]).cross(sp.Matrix([0,-R,0]))[2]
    law=sp.solve(sp.Eq(motor+load,0),F)[0]
    if motor!=a*F or load!=-R*b:raise ValueError('Opposite signed moments cross product failed')
    reaction=sp.solve(sp.Eq(sp.Symbol('H')-F-R,0),sp.Symbol('H'))[0]
    if reaction.subs({F:2,R:2})!=4:raise ValueError('Hinge force equilibrium failed')
    # Orthogonal planar rotation preserves every pairwise separation.
    theta=sp.Symbol('theta',real=True)
    Q=sp.Matrix([[sp.cos(theta),-sp.sin(theta)],[sp.sin(theta),sp.cos(theta)]])
    if sp.simplify(Q.T*Q)!=sp.eye(2):raise ValueError('Rigid rotation must preserve distances')
    inverse_R=sp.solve(sp.Eq(F,law),R)[0]
    inverse_b=sp.solve(sp.Eq(F,law),b)[0]
    k,l=sp.symbols('k l',positive=True)
    ratio=sp.cancel(law.subs({R:k*R,b:l*b})/law)
    for opts,want in [([F*a/b,F*b/a,F/(a*b),2*F*a/b,F*a/(2*b)],inverse_R),([k*l,k/l,l/k,k+l,k*l**2],ratio)]:
        if [i for i,v in enumerate(opts) if sp.cancel(v-want)==0]!=[0]:raise ValueError('Lever symbolic choices not unique as general laws')
    def force(load,arm):return law.subs({a:2,R:load,b:arm})
    A,B=force(2,2),force(4,4)
    c,o=sp.symbols('c o',real=True)
    cal=sp.solve([sp.Eq(c*A+o,5),sp.Eq(c*B+o,17)],(c,o))
    C=(9-cal[o])/cal[c]
    u=sp.Symbol('u',real=True)
    if sp.solve(sp.Eq(u*u/2,2),u)!=[-2,2]:raise ValueError('Lever quadratic branches failed')
    U=SI.Quantity
    effort=(U(2,'N')*U(2,'m')/U(2,'m')).to('N')
    inverse=(U(8,'N')*U(2,'m')/U(4,'m')).to('N')
    square=(U(2,'N')*U(2,'m')/U(1,'N/m')).to('m**2')
    gain=(U(12,'')/U(6,'N')).to('1/N')
    if (effort.magnitude,inverse.magnitude,square.magnitude,gain.magnitude)!=(2,4,4,2):raise ValueError('Pint exact lever units failed')
    if (A+B)/2-force(3,3)!=sp.Rational(1,2):raise ValueError('Mean output vs inputs diagnostic failed')
    return [A,'N','La distanza fra i due punti','Da 2 a 4 N',inverse_R.subs({F:2,a:2,b:2}),inverse_b.subs({F:2,a:2,R:2}),force(2,4)/A,4-A,'R=Fa/b','κ₁ κ₂',B/A,(A+B)/2,inverse_b.subs({F:4*A,a:2,R:4})/2,inverse_R.subs({F:24/(sp.Integer(6)/A),a:2,b:4}),inverse_R.subs({F:C,a:2,b:2}),sp.Integer(2)]

MANUAL=['Momenti con antiorario positivo: forza F inx=−a diretta inbasso→+aF,caricoR inx=b inbasso→−bR. Reazione nelpolo ha momento0. aF=bR→F=Rb/a=2·2/2=2N. Reazione versoaltoF+R=4N.', 'Rb/a: N·m/m=N. a=2m è lunghezza,non2puro;Rb solo è momento.', 'Rigidità: distanzaPQ=|rQ−rP| costante. RotazioneQ ortogonale conserva normaQ(rQ−rP),non coordinate,quote,direzione o velocità nel laboratorio.', 'R2→4N,b=a2m comuni: F2→4N per momenti4→8Nm. Sono equilibri distinti,non accelerazione durante transizione.', 'R=Fa/b=2N·2m/2m=2N. Reazione priva di coppia non altera inversa.', 'b=Fa/R=2N·2m/2N=2m. Braccio perpendicolare,non lunghezza totale.', 'R2N,a2m,b2→4m: F2→4N;rapporto2. Maggiore braccio resistente richiede più sforzo.', 'CorrettoF2N;proposta4N avrebbe8Nm contro4Nm: scarto4−2=+2N.', 'Fa=Rb→R=Fa/b. a/b puro;preservare a dimensionale;positività e b>0.', 'F_A=Rb/a,F_B=κ1κ2Rb/a;rapportoκ1κ2,braccio motore fisso e momenti opposti.', 'A2N,B4·4/2=8N;rapporto8/2=4. MomentoB16Nm distinto dalla forza.', 'Media(2+8)/2=5N;ingressi mediR3N,b3m danno9/2N,differenza1/2N. Media statistica,non risultante simultanea.', 'TargetF_B4·2=8N,R_B4N: b_B=8·2/4=4m;rapporto4/2=2.', 'RefF2N,S6→c3N⁻¹;S24→F8N;R=Fa/b=8·2/4=4N.', 'RefF2,8N;ΔS12/ΔF6N→c2N⁻¹,d1. S9→F4N;R=4·2/2=4N.', 'R=cb,c1N/m;Fa=cb²→b²Fa/c=4m²;radici±2m,solo+2 ammissibile eR2N. Vincolo fra prove,non lavoro della forza.']
DISTRACTORS=['F=R qui per bracciuguali,non leggeuniversale;la cerniera non è senza forza,ma senza coppia.', 'Nm momento;kg massa;m lunghezza;1puro;soltantoN forza.', 'Posizioni,direzioni,quote e velocità possono cambiare;puntisullasse fermi non garantiscono tutte le coppie.', '8N raddoppiaancheb;1N inversa;invarianza o0 non compensano nuovo momento.', '4Nm momento nonforza;fulcrocon coppia cambierebbe bilancio maèescluso.', '1m dimezza senza ragione;bracci uguali necessari conforze uguali eopposte come momenti.', '1/2 confonde braccio resistente conmotore;4 quadrato;1 ignora;−2 esclude moduli positivi.', '−2 ordine inverso,4 proposta,1 dimezza,3 non differenza;Nm non N.', 'Fb/a scambia bracci,F/(ab)haN/m²,2Fa/b doppio,Fa/(2b)metà. Coincidenze speciali a=b non rendono identità generale alternative.', 'Quozienti effetto inverso,somma non1allidentità,quadrato delbraccio assente.', '2 un solo cambiamento,8N forzaB non rapporto,16Nm momento,1/4 inverso.', '10somma,5/2 doppia metà,9/2 ingressimedi,4o6 nonsemisomma.', 'b invariato dàF4N;quadruplicato dàF16N,otto volteA;4m nonrapporto4.', 'S24come24N darebbeR12N;guadagno nonlunghezza;4N ricostruisceS24.', 'R2,3,5,8N dannoS5,7,11,17;solo4N dà9. Rapporti grezzi conservano offset.', '−2m braccio negativo eRnegativa;4 confonde quadrato;1o3m dannoF1/2o9/2N,non2.']
ASSUMPTIONS=['Corpo rigido ideale senza peso,in equilibrio statico in riferimento inerziale,fulcro fisso senza coppia;forze con momenti opposti e bracci perpendicolari positivi. Reazione della cerniera garantisce anche equilibrio di forze,non momento rispetto aO. Confronti tra equilibri,non leggi transitorie.', 'Corpo rigido ideale senza peso,in equilibrio statico in riferimento inerziale,fulcro fisso senza coppia;forze con momenti opposti e bracci perpendicolari positivi. Reazione della cerniera garantisce anche equilibrio di forze,non momento rispetto aO. Confronti tra equilibri,non leggi transitorie.', 'Oggetto perfettamente rigido,punti materiali dello stesso corpo:invarianza delle distanze per ogni coppia,in ogni rotazione/traslazione;non coordinate di laboratorio.', 'Corpo rigido ideale senza peso,in equilibrio statico in riferimento inerziale,fulcro fisso senza coppia;forze con momenti opposti e bracci perpendicolari positivi. Reazione della cerniera garantisce anche equilibrio di forze,non momento rispetto aO. Confronti tra equilibri,non leggi transitorie.', 'Corpo rigido ideale senza peso,in equilibrio statico in riferimento inerziale,fulcro fisso senza coppia;forze con momenti opposti e bracci perpendicolari positivi. Reazione della cerniera garantisce anche equilibrio di forze,non momento rispetto aO. Confronti tra equilibri,non leggi transitorie.', 'Corpo rigido ideale senza peso,in equilibrio statico in riferimento inerziale,fulcro fisso senza coppia;forze con momenti opposti e bracci perpendicolari positivi. Reazione della cerniera garantisce anche equilibrio di forze,non momento rispetto aO. Confronti tra equilibri,non leggi transitorie.', 'Corpo rigido ideale senza peso,in equilibrio statico in riferimento inerziale,fulcro fisso senza coppia;forze con momenti opposti e bracci perpendicolari positivi. Reazione della cerniera garantisce anche equilibrio di forze,non momento rispetto aO. Confronti tra equilibri,non leggi transitorie.', 'Corpo rigido ideale senza peso,in equilibrio statico in riferimento inerziale,fulcro fisso senza coppia;forze con momenti opposti e bracci perpendicolari positivi. Reazione della cerniera garantisce anche equilibrio di forze,non momento rispetto aO. Confronti tra equilibri,non leggi transitorie.', 'Corpo rigido ideale senza peso,in equilibrio statico in riferimento inerziale,fulcro fisso senza coppia;forze con momenti opposti e bracci perpendicolari positivi. Reazione della cerniera garantisce anche equilibrio di forze,non momento rispetto aO. Confronti tra equilibri,non leggi transitorie.', 'Corpo rigido ideale senza peso,in equilibrio statico in riferimento inerziale,fulcro fisso senza coppia;forze con momenti opposti e bracci perpendicolari positivi. Reazione della cerniera garantisce anche equilibrio di forze,non momento rispetto aO. Confronti tra equilibri,non leggi transitorie.', 'Corpo rigido ideale senza peso,in equilibrio statico in riferimento inerziale,fulcro fisso senza coppia;forze con momenti opposti e bracci perpendicolari positivi. Reazione della cerniera garantisce anche equilibrio di forze,non momento rispetto aO. Confronti tra equilibri,non leggi transitorie.', 'Corpo rigido ideale senza peso,in equilibrio statico in riferimento inerziale,fulcro fisso senza coppia;forze con momenti opposti e bracci perpendicolari positivi. Reazione della cerniera garantisce anche equilibrio di forze,non momento rispetto aO. Confronti tra equilibri,non leggi transitorie.', 'Corpo rigido ideale senza peso,in equilibrio statico in riferimento inerziale,fulcro fisso senza coppia;forze con momenti opposti e bracci perpendicolari positivi. Reazione della cerniera garantisce anche equilibrio di forze,non momento rispetto aO. Confronti tra equilibri,non leggi transitorie.', 'Corpo rigido ideale senza peso,in equilibrio statico in riferimento inerziale,fulcro fisso senza coppia;forze con momenti opposti e bracci perpendicolari positivi. Reazione della cerniera garantisce anche equilibrio di forze,non momento rispetto aO. Confronti tra equilibri,non leggi transitorie.', 'Corpo rigido ideale senza peso,in equilibrio statico in riferimento inerziale,fulcro fisso senza coppia;forze con momenti opposti e bracci perpendicolari positivi. Reazione della cerniera garantisce anche equilibrio di forze,non momento rispetto aO. Confronti tra equilibri,non leggi transitorie.', 'Corpo rigido ideale senza peso,in equilibrio statico in riferimento inerziale,fulcro fisso senza coppia;forze con momenti opposti e bracci perpendicolari positivi. Reazione della cerniera garantisce anche equilibrio di forze,non momento rispetto aO. Confronti tra equilibri,non leggi transitorie. R=(1N/m)b lega prove distinte;ambedue radici considerate,solo positiva permoduli.']
UNITS={1: 'N', 2: 'N', 3: 'm', 4: 'N', 5: 'N', 6: 'm', 7: '', 8: 'N', 9: 'N', 10: '', 11: '', 12: 'N', 13: '', 14: 'N', 15: 'N', 16: 'm'}
NUMERIC_UNITS={1: 'N', 5: 'N', 6: 'm', 8: 'N', 11: '1', 12: 'N', 13: '1', 14: 'N', 16: 'm'}
SUFFIX={15: ' N'}

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

CANDIDATE_REF='2274b3d1b25342ea4f4a5432adc072390f56ab05'
REVIEWED_PACKAGE_SHA256='d6e50a22d365a55c5e0db45b5b0b59de292616521db3bfc6c163a544d62164ab'
REVIEWED_BINDINGS_SHA256='341891e65eb4ac7bfac5dc1ca5a4434535b0ae10f98528ef52014b90a0156aed'
REVIEWED_CANDIDATES={'AR-u2-lever-equilibrium-01': '8a068b4293f7522d684fbe87bad127b45a1bde61d95e3ba01cbe3b5da9ec4547', 'AR-u2-lever-equilibrium-02': '5d18400e5b2b908f750c158f05ae27bd74c547b90b97da1cf79cd41dedb2a53f', 'AR-u2-lever-equilibrium-03': '8f8f959ea6628195c7f7faadd4f5d5aee97594b4ada6ee49be5e70ce072dc336', 'AR-u2-lever-equilibrium-04': '8997e38b35c57ed1b29fc85b928bbef9e141a71b120c03b6308857dd61f7e452', 'AR-u2-lever-equilibrium-05': 'a17938ac0f63b4ca730fd193fd0003fe4a52a33a8052dc70a5de5328ba050492', 'AR-u2-lever-equilibrium-06': 'b3487e47a3d405bc57d0fadd2c230f8874fc755ec79de54ca7013b0e468bb078', 'AR-u2-lever-equilibrium-07': 'f4402add73b9cacfd48c3d7dfbfb8e4ba923997fa80a979fbf528d9f8470d32a', 'AR-u2-lever-equilibrium-08': 'e59f9e47dacb4ca2dd3c233af00f243ba2d33515b6819897938d8fb7e274637e', 'AR-u2-lever-equilibrium-09': 'd0e1063267f0c5c7c64cc427553b429666220b98ab4ab3d2519dc5a68391de36', 'AR-u2-lever-equilibrium-10': 'a30550aa1711efba8820592d198a277412d97da4b60645ce127b8e1d10d0c114', 'AR-u2-lever-equilibrium-11': 'f6ba5ecf802433a4371d3e1f8fa5b01de66dbcd84cfe178891ceffb03fb7a360', 'AR-u2-lever-equilibrium-12': '627cdf0e8531791c8fb9e2d6e2838266250b58620eb0fe9695918424a389d6bc', 'AR-u2-lever-equilibrium-13': '07a7515511ed8c18b9cf6da786e5eb79a9c3f2eac3cc44a3f7f67986a32445b9', 'AR-u2-lever-equilibrium-14': 'a3899562107d5e45e1a702083ae9170c09fc91021783aef315ba1363cb02181d', 'AR-u2-lever-equilibrium-15': 'ad84d7dcf498f3580e3f19d26dc96c66746b40c2f6ae0d6f3eb17c2592e28cc2', 'AR-u2-lever-equilibrium-16': '465d692efe0466b8388e9c29c853f3c47f8e17f229e27efd2c34b4a552840e03'}
READ_SOURCE_SHA256={'u2-lever-equilibrium-01': '942cd6fb86c60f22fcee8135f1a6d48760b674268b64c05d495b7bc3e243e3fa', 'u2-lever-equilibrium-02': 'e12742eefe8db712d733a1f7fc6c1dba85265516502d4870cdb49b54f9316652', 'u2-lever-equilibrium-03': 'ffe8c22792e8857f54ee89a591faf0ec2162dcf323547751341b96ead5dd362e', 'u2-lever-equilibrium-04': '49e0468d7c85643cc424acfca60b2a073f3c8750cf045220b12fc91ec767a35b', 'u2-lever-equilibrium-05': 'c436e35c73584b18dd010acc7162ea81e8bbd6ad5cb1bc324a2675a4f8e6b906', 'u2-lever-equilibrium-06': '18a1c1f8e5291d14da451823f31183498b9dc1e707f35e387f8470c4aeffb6df', 'u2-lever-equilibrium-07': '02dc47552940b1cafe4f7bbb6285575f993f0298e1e8b89f42b7cb6d75c6044c', 'u2-lever-equilibrium-08': '4d5b1b71d8987195e28387229474300f998fe59061682a33161c1f81a6034457', 'u2-lever-equilibrium-09': '16de513619cf1d846425095df32aa41ed363bbb3e4e2b9a9f98c3d926c83c566', 'u2-lever-equilibrium-10': '9f855cf8e372cc9150b0f7f5749fb054ccae72082fdc96b3f2d97ac71573642f', 'u2-lever-equilibrium-11': '476f35269b02b4a163c8591a63e1fb6a407dd1c3d7ee25ebfcc5e31a772c79c3', 'u2-lever-equilibrium-12': 'fd11fde48a466d90c50e59c5da579e82db08a45ca2516b0ce5ffa11023b3735c', 'u2-lever-equilibrium-13': '1a3e663cd0e25a62a21e7df06b16ef6039edb88fc6a11021d712e5540033d90c', 'u2-lever-equilibrium-14': '35364c750273e56c4e3049e635705caa7ec56fe035b7c654e4719bffd87f9a83', 'u2-lever-equilibrium-15': '21f9a310ca735d43e77490722f59f6fb1e2429643a379c4707707401e54e2196', 'u2-lever-equilibrium-16': '380836d622a5afef72cc94ea031bd012b9d7e9946e1682cf8d915b4f14912415'}
