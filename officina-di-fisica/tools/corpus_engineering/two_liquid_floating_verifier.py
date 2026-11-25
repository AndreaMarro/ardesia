"""Independent full-record fluid review; never imports candidate authoring."""
from fractions import Fraction
from functools import lru_cache
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-02.json'
FAMILY='two-liquid-floating'
EXPECTED_IDS={f'AR-u3-{FAMILY}-{n:02}' for n in range(1,17)}

@lru_cache(maxsize=1)
def oracle():
    t,c,b,V,g,f=sp.symbols('t c b V g f',positive=True)
    law=sp.solve(sp.Eq(c*g*V,t*g*(1-f)*V+b*g*f*V),f)[0]
    invc=sp.solve(sp.Eq(f,law),c)[0]
    invb=sp.solve(sp.Eq(f,law),b)[0]
    k,l=sp.symbols('k l',positive=True)
    ratio=sp.factor(law.subs({c:k*c,b:l*b})/law)
    if sp.simplify(law-(c-t)/(b-t))!=0 or sp.simplify(invc-(t+f*(b-t)))!=0:raise ValueError('Independent two-fluid force balance failed')
    for opts,want in [([(c-t)/(b-t),c/b,b/c,(b-t)/(c-t),c-t],law),([t+f*(b-t),f*b,t+(b-t)/f,b-f*t,f/(b-t)],invc),([ratio,k/l,k*l,1/ratio,(k*c-t)/(c-t)],ratio)]:
        if [i for i,x in enumerate(opts) if sp.simplify(x-want)==0]!=[0]:raise ValueError('Independent two-fluid symbolic alternatives not unique')
    F=lambda body,bottom:law.subs({t:sp.Rational(1,2),c:body,b:bottom})
    A,B=F(sp.Rational(3,4),sp.Rational(3,2)),F(1,2)
    q,z=sp.symbols('q z',real=True)
    cal=sp.solve([sp.Eq(q*A+z,sp.Rational(3,2)),sp.Eq(q*B+z,sp.Rational(5,3))],(q,z))
    C=sp.simplify((2-cal[z])/cal[q])
    if (cal[q],cal[z],C)!=(2,1,sp.Rational(1,2)):raise ValueError('Two-fluid exact affine calibration failed')
    if F(sp.Rational(7,8),sp.Rational(7,4))-(A+B)/2!=sp.Rational(1,120):raise ValueError('Two-fluid mean counterexample failed')
    roots=sp.solve(sp.Eq(F(b/2,b),sp.Rational(1,4)),b)
    if roots!=[sp.Rational(3,2)] or roots[0]<=1:raise ValueError('Two-fluid constrained positive domain failed')
    U=SI.Quantity
    upper=(U(Fraction(1,2),'kg/L')*U(Fraction(3,4),'L')*U(10,'m/s**2')).to('N')
    lower=(U(Fraction(3,2),'kg/L')*U(Fraction(1,4),'L')*U(10,'m/s**2')).to('N')
    weight=(U(Fraction(3,4),'kg/L')*U(1,'L')*U(10,'m/s**2')).to('N')
    inferred=(U(Fraction(1,2),'kg/L')+U(Fraction(1,2),'')*(U(Fraction(3,2),'kg/L')-U(Fraction(1,2),'kg/L'))).to('kg/L')
    if (upper.magnitude,lower.magnitude,weight.magnitude,inferred.magnitude)!=(Fraction(15,4),Fraction(15,4),Fraction(15,2),1):raise ValueError('Pint Fraction piecewise buoyancy units failed')
    return [A,'1','f = (ρ_c − ρ_t) / (ρ_b − ρ_t)','Da 1/4 a 1/2',invc.subs({t:sp.Rational(1,2),f:A,b:sp.Rational(3,2)}),invb.subs({t:sp.Rational(1,2),c:sp.Rational(3,4),f:A}),F(sp.Rational(3,4),1)/A,sp.Rational(1,2)-A,'ρ_c = ρ_t + f(ρ_b − ρ_t)','(X_B Y) / (Y_B X)',B/A,(A+B)/2,sp.Rational(4,3),invc.subs({t:sp.Rational(1,2),f:sp.Rational(1,3),b:2}),invc.subs({t:sp.Rational(1,2),f:C,b:sp.Rational(3,2)}),roots[0]]

MANUAL = ['Il bilancio è ρ_c g V = ρ_t g(1−f)V + ρ_b gf V. Si cancellano g V e si isola f = (ρ_c−ρ_t)/(ρ_b−ρ_t). Con '
 '3/4, 1/2, 3/2 kg/L si ottiene (1/4)/1 = 1/4.',
 'La frazione V_b/V è un rapporto di volumi: unità 1. Il vincolo geometrico è 0 < f < 1; 1/4 equivale a 25%.',
 'Raccogliendo f nel bilancio: ρ_c = ρ_t + (ρ_b−ρ_t)f. Il contrasto positivo permette la divisione e dà la '
 'legge richiesta.',
 'A liquidi fissi il contrasto inferiore è 1 kg/L; l’eccesso del corpo passa da 1/4 a 1/2 kg/L. f passa '
 'quindi da 1/4 a 1/2.',
 'L’inversa è ρ_c = ρ_t(1−f)+ρ_b f. I due contributi sono 3/8+3/8 = 3/4 kg/L, interno all’intervallo.',
 'ρ_b = ρ_t + (ρ_c−ρ_t)/f = 1/2 + (1/4)/(1/4) = 3/2 kg/L. Riaggiungere il termine superiore è necessario.',
 'Con ρ_b ridotta a 1 kg/L il contrasto si dimezza: f_B = (1/4)/(1/2)=1/2. Rapporto a f_A=1/4 uguale 2.',
 'Proposta 1/2 meno corretta 1/4 = +1/4. La proposta equilibra un corpo da 1 kg/L, non quello da 3/4 kg/L.',
 'Moltiplicando per ρ_b−ρ_t e aggiungendo ρ_t si ricava ρ_c = ρ_t+f(ρ_b−ρ_t), con le dimensioni di densità.',
 'f_A=X/Y, f_B=X_B/Y_B; rapporto X_B Y/(Y_B X). ρ_t è fisso e non scala con gli altri dati; tutti i '
 'contrasti sono positivi.',
 'A dà 1/4 e B dà (1/2)/(3/2)=1/3. Il rapporto (1/3)/(1/4) = 4/3.',
 'Media (1/4+1/3)/2 = 7/24. Le densità medie 7/8 e 7/4 kg/L danno 3/10, maggiore della media di 1/120.',
 'Target (4/3)(1/4)=1/3. Con ρ_c, B=1 kg/L si ricava ρ_b, B=1/2+(1/2)/(1/3)=2 kg/L; rapporto a 3/2 uguale '
 '4/3.',
 'Guadagno (3/4)/(1/4)=3. S=1 dà f_B=1/3; ρ_b=2 kg/L dà ρ_c=1/2+(1/3)(3/2)=1 kg/L.',
 'Differenze Δ S=1/6 e Δ f=1/12 danno q=2, offset 1. S_C=2 dà f_C=1/2 e ρ_c, C=1 kg/L.',
 'ρ_c=ρ_b/2 non elimina il fondo fisso ρ_t. Equazione 1/4=(ρ_b/2−ρ_t)/(ρ_b−ρ_t) porta ρ_b=3 ρ_t=3/2 kg/L, '
 'ρ_c=3/4; dominio vincolato ρ_b>1 verificato.']
DISTRACTORS = ['1/2 trascura il liquido superiore; 3/4 è il volume superiore; 1/3 fallisce il bilancio; 4 supera il volume '
 'totale.',
 'L volume, kg/L densità, N forza, m² area: soltanto 1 è puro.',
 'I rapporti senza ρ_t omettono una parte della spinta; il reciproco può superare 1; la differenza da sola è '
 'dimensionata.',
 '1/3 applica il rapporto delle densità del corpo senza sottrarre ρ_t; 1 ignora la stratificazione interna; '
 '1/8 inverte il cambiamento; invarianza falsa.',
 'Solo ρ_b f darebbe 3/8 kg/L, sotto il liquido superiore e fuori dominio.',
 'Omettere ρ_t darebbe 1 kg/L e densità del corpo ricostruita 5/8, non 3/4.',
 '1/2 inverte, 3/2 usa densità inferiori senza lo sfondo, 1 ignora, 4 duplica ancora.',
 '−1/4 ordine invertito; 1/2 proposta; 0 accetta; 1/8 dimezza ancora.',
 'f ρ_b omette sopra; divisione per f sbaglia l’inversa; ρ_b−f ρ_t non è la media pesata (per esempio f 1/4 '
 'dà 11/8 anziché 3/4); ultima espressione inversa densità.',
 'κ₁/κ₂ ignora gli offset di densità; prodotto non segue dal bilancio; reciproco scambia stati; X_B/X omette '
 'il contrasto inferiore.',
 '3/4 reciproco, 2 solo eccesso corpo, 1/3 singola uscita B, 1 scalerebbe erroneamente anche ρ_t.',
 '7/12 somma, 7/48 doppia metà, 3/10 ingressi medi, 1/12 differenza.',
 '2 è densità B numerica, non rapporto; 3/4 reciproco; 1 lascerebbe f 1/2 anziché 1/3; 1/3 è frazione '
 'target.',
 'S = 1 non significa f 1: includendo q = 3, il corpo resta tra i due liquidi.',
 'ρ_c 3/4 e 5/4 danno S 3/2 e 5/2; 3/2 è bordo f 1 escluso; 2 supera il liquido inferiore.',
 'Nessuna cancellazione tra differenze con ρ_t nonzero; nessuna seconda radice; zero fuori dominio.']
ASSUMPTIONS = ['Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. '
 'Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità '
 'uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, '
 'frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.',
 'Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. '
 'Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità '
 'uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, '
 'frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.',
 'Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. '
 'Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità '
 'uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, '
 'frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.',
 'Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. '
 'Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità '
 'uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, '
 'frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.',
 'Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. '
 'Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità '
 'uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, '
 'frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.',
 'Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. '
 'Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità '
 'uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, '
 'frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.',
 'Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. '
 'Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità '
 'uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, '
 'frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.',
 'Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. '
 'Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità '
 'uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, '
 'frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.',
 'Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. '
 'Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità '
 'uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, '
 'frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.',
 'Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. '
 'Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità '
 'uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, '
 'frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.',
 'Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. '
 'Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità '
 'uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, '
 'frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.',
 'Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. '
 'Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità '
 'uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, '
 'frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.',
 'Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. '
 'Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità '
 'uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, '
 'frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.',
 'Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. '
 'Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità '
 'uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, '
 'frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.',
 'Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. '
 'Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità '
 'uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, '
 'frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.',
 'Solido omogeneo libero e fermo, volume esterno positivo completamente ripartito fra due liquidi in quiete. '
 'Liquidi immiscibili con densità uniformi e stratificazione stabile: ρ_t=1/2 kg/L < ρ_c < ρ_b. Gravità '
 'uniforme; tensione interfacciale e vincoli esterni trascurati. Solo peso e risultante idrostatica, '
 'frazione inferiore 0<f<1. Le prove possono cambiare densità senza mescolare stati.']
UNITS={1: '', 2: '', 3: '', 4: '', 5: 'kg/L', 6: 'kg/L', 7: '', 8: '', 9: 'kg/L', 10: '', 11: '', 12: '', 13: '', 14: 'kg/L', 15: 'kg/L', 16: 'kg/L'}
NUMERIC_UNITS={5: 'kg/L', 6: 'kg/L', 14: 'kg/L', 16: 'kg/L'}
SUFFIX={15: ' kg/L'}
SVG_REVIEW = ('XML e rendering completo letti. Corpo a sezione costante: 120 px sopra e 40 px sotto alla scala '
 'volumetrica 160 px/L, totale 1 L. Densità 1/2 e 3/2 kg/L, corpo 3/4 kg/L. Con g 10 m/s² i contributi di '
 'spinta sono 15/4 N ciascuno, peso 15/2 N: frecce 75, 75, 150 px a 20 px/N, ciascuna in path separato. '
 'Barre finali 150+50 px a 200 px/L; nessuna scala di forza confusa con quella di volume.')

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle(); common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed '+FAMILY+' package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed '+FAMILY+' binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u3-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        want=expected[n-1];value=row['answer']['value']
        if isinstance(want,str):
            if value!=want:errors.append('Independent '+FAMILY+' conceptual key mismatch')
        else:
            try:
                raw=str(value).replace('−','-').strip();suffix=SUFFIX.get(n,'')
                if suffix and not raw.endswith(suffix):raise ValueError('missing physical unit')
                if suffix:raw=raw.removesuffix(suffix).strip()
                if len(raw)>60:raise ValueError('literal too long')
                f=Fraction(raw)
                if sp.Rational(f.numerator,f.denominator)!=want:errors.append('Independent '+FAMILY+' result mismatch')
            except (ValueError,TypeError,ZeroDivisionError):errors.append('Independent '+FAMILY+' answer or unit invalid')
        if row['answer']['type']=='numeric' and row['answer'].get('unit')!=NUMERIC_UNITS.get(n):errors.append('Independent '+FAMILY+' numeric unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'assetChecksums':assets,
          'ok':not errors,'errors':errors,'expectedExact':str(want),
          'dimension':{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},
          'manualArithmetic':MANUAL[n-1],'physicalAssumptions':ASSUMPTIONS[n-1],'distractors':DISTRACTORS[n-1],
          'pedagogicalReview':'Consegna, tutti i passaggi, alternative, hint e feedback letti separatamente; procedura manuale esatta e condizioni controllate. '+MANUAL[n-1],
          'scientificAssetReview':SVG_REVIEW if assets else 'Nessuna figura collegata a questo record; testi e formule letti integralmente.',
          'calculationScope':'NO_STUDENT_CALCULATION' if n==2 else 'SYMBOLIC_MANUAL_DERIVATION' if n in (3,9,10) else 'EXACT_MANUAL_CALCULATION',
          'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
          'methods':['SymPy_independent_buoyancy_equilibrium_or_flux_integral_or_mass_continuity','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}

CANDIDATE_REF='712aa70dfafde874399b35b85a5c285a4598d2d3'
SOURCE_READING='All80 original U3-02 prompts in the assigned five families individually read and solved before candidate keys. All16 final candidate records, alternatives, hints, feedback and scientific SVG XML/native rendering read before freezing; never imports candidate authoring. C2 lessons L004/L005 and supplied profile assumptions reviewed separately.'
REVIEWED_PACKAGE_SHA256='88e8b41341187e9c49a63e252168138768e68792750ae682fa270b6cb64d2b0b'
REVIEWED_BINDINGS_SHA256='17d71424b5b3e23194f98e54ed442d350abb6debe0159b0caea5a682dfa739a4'
REVIEWED_CANDIDATES={'AR-u3-two-liquid-floating-01': '753857ce0a50c646f5191b35c48e79741b2ad4fc7203ba73916391789743c07c', 'AR-u3-two-liquid-floating-02': 'f10404d28eb3d8c25fca5caabddb08fa2eda7657844bcc235956765d053fd0d3', 'AR-u3-two-liquid-floating-03': '5a7714389f18a7ee33f84962e06e82e923d7fdf8e61fc502b3299cf658557e3c', 'AR-u3-two-liquid-floating-04': '58849da4b2bb4c390fb2ee613b80acc37508503af1b7db237ed19ecfe4713722', 'AR-u3-two-liquid-floating-05': '366296e323a3dce3addd50b1635e0e3bdc8d1b94dba36530123dd2111f9404aa', 'AR-u3-two-liquid-floating-06': '55576dcd90ee1f99f4f59c2c196f864fe894a65ec2b159211164a006bd8c6c62', 'AR-u3-two-liquid-floating-07': '667bd336dfbe1be8dc5ec9b5ca65d88d02f6e004ace2beeaaae8e144a7bc32d0', 'AR-u3-two-liquid-floating-08': 'debe2e93e4882d7f5107cc67f8578741347554b76c4db053beb15777761da3d4', 'AR-u3-two-liquid-floating-09': '184ab6fcdba45ae93648f74385bd38b32dcc7003f472cd9ec21a0fb482db80b7', 'AR-u3-two-liquid-floating-10': '24655d77a2a22ee0df94cab29723ee867df1c5ecc36cdd99ed4360ffe62bbaaa', 'AR-u3-two-liquid-floating-11': '9b31d175a74fbd278c6637cfc8ef374e1aca2239c53bca6b209531c525cace84', 'AR-u3-two-liquid-floating-12': '2b0d03c591109192ff293172a89080b3483cf3ccfaa0d58ff2f1b604eae55087', 'AR-u3-two-liquid-floating-13': '6780c296e1857b52a91d2f69c7efdcb90eabd3eb13835df96419278d59ee56ec', 'AR-u3-two-liquid-floating-14': 'b1697518031946857dd15ca004e92efc7e33e149ffb1b8fcc6c0447e8e576437', 'AR-u3-two-liquid-floating-15': '0c5107a3ee93ae326df9bd8ff52c988190c76cd0623f2aabc12be60e55875c79', 'AR-u3-two-liquid-floating-16': 'e92c657d18cb9eb896d384e04af38176d35c9f8a5cb03321000d8661d759591e'}
READ_SOURCE_SHA256={'u3-two-liquid-floating-01': '7e2933a34d2d7f13c5115ace36544a9ce2a41cc0d40a77c5b11117bdcb281596', 'u3-two-liquid-floating-02': '867b510580c09166cc3d7c6de2e0dce3067122012d2bfb494cbbf75b39e4e7a0', 'u3-two-liquid-floating-03': '9dbda7bcb5a8f57da8fe166839878aa997bfa9ecbe2411edb7f0c18bda666746', 'u3-two-liquid-floating-04': '27c8a7eab5214697707ee83b3438cd10db47a9c26c472958e2e7c887e47eb79a', 'u3-two-liquid-floating-05': '571b5b88d149ab24bb05003ef418dcaf6f1a3b4bd4df6135827e9675845541de', 'u3-two-liquid-floating-06': '67614ccebb37bc4ada362dcc9b977a26b981e9b0034a52a033ffb73070bf7b0c', 'u3-two-liquid-floating-07': 'b054b9a14c56273493c4fefa06aad80d87c35bdad685a4c62b3db0d77d6af1e9', 'u3-two-liquid-floating-08': '184b8cd7f3735747951c9932c955a299a1768e58b4d08f31bdf692d1da0821cb', 'u3-two-liquid-floating-09': '3af1aaac035116798f4bbd20461e99cbfc1ef353edfeae4b90f7344f0e8437d5', 'u3-two-liquid-floating-10': '958b0d4e4d72e8248559d749622264ce9aba861a6e7e7c3194765ba7a4400e43', 'u3-two-liquid-floating-11': '333fb0bf0dc2d873a4a0c2bf968074ad0dc5d707269cb03e8dc931fd82c333d8', 'u3-two-liquid-floating-12': '8346bdb3712874fdb88a39f60996cca730e7fe768719bb00077560bc24f2c13f', 'u3-two-liquid-floating-13': '08a501cf615e348a8268074ece737c30440e9efd53d09fce0b951ab190a0b62e', 'u3-two-liquid-floating-14': 'f7460e9c21672d4f37b5e124df6817af5d82ac29a81c46bc9112cb0889fe0008', 'u3-two-liquid-floating-15': '3f67b2e98a493c525822f0cfcd41ecb40e3d50e7ae2cf9ab503efe462a82f905', 'u3-two-liquid-floating-16': 'bfb56965c3829481f700a5143e407025ec5420a5854db0c3126ab42e1ea6038d'}
