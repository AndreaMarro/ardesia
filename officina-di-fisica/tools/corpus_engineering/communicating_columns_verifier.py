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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-01.json'
FAMILY='communicating-columns'
EXPECTED_IDS={f'AR-u3-{FAMILY}-{n:02}' for n in range(1,17)}

@lru_cache(maxsize=1)
def oracle():
    r1,r2,g,H,h,p0=sp.symbols('r1 r2 g H h p0',positive=True)
    law=sp.solve(sp.Eq(p0+r1*g*H,p0+r2*g*h),h)[0]
    inverse=sp.solve(sp.Eq(h,law),r1)[0]
    a,b=sp.symbols('a b',positive=True)
    ratio=sp.simplify(law.subs({r1:a*r1,r2:b*r2})/law)
    if law!=H*r1/r2 or inverse!=h*r2/H or ratio!=a/b:raise ValueError('Independent equal-level hydrostatic derivation failed')
    for options,want in [([H*r1/r2,H*r2/r1,2*H*r1/r2,H*r1/(2*r2),H],law),([r2*h/H,r2*H/h,h/(r2*H),2*r2*h/H,r2*h/(2*H)],inverse),([a/b,a*b,b/a,a+b,a*a/b],ratio)]:
        if [i for i,x in enumerate(options) if sp.simplify(x-want)==0]!=[0]:raise ValueError('Symbolic alternatives not uniquely equal as general laws')
    def height(x,z):return law.subs({H:10,r1:x,r2:z})
    A,B=height(1,2),height(sp.Rational(4,5),1)
    q,d=sp.symbols('q d',real=True)
    cal=sp.solve([sp.Eq(q*A+d,11),sp.Eq(q*B+d,17)],(q,d))
    C=(9-cal[d])/cal[q]
    if (cal[q],cal[d],C)!=(2,1,4):raise ValueError('Affine column-height calibration failed')
    if (A+B)/2-height(sp.Rational(9,10),sp.Rational(3,2))!=sp.Rational(1,2):raise ValueError('Nonlinear mean distinction failed')
    if sp.simplify(law.subs(r1,r2/2)-H/2)!=0:raise ValueError('Scale non-identifiability failed')
    U=SI.Quantity
    result=(U(10,'cm')*U(1,'kg/L')/U(2,'kg/L')).to('cm')
    pressure=(U(1,'kg/L')*U(10,'m/s**2')*U(10,'cm')).to('kPa')
    inferred=(U(2,'kg/L')*U(5,'cm')/U(10,'cm')).to('kg/L')
    gain=(U(15,'')/U(5,'cm')).to('1/cm')
    if (result.magnitude,pressure.magnitude,inferred.magnitude,gain.magnitude)!=(5,1,1,3):raise ValueError('Pint Fraction column units failed')
    return [A,'cm','h₂=h₁ρ₁/ρ₂','Da 5 a 4 cm',inverse.subs({h:5,r2:2,H:10}),sp.solve(sp.Eq(h,law),r2)[0].subs({h:5,r1:1,H:10}),height(1,1)/A,10-A,'ρ₁=ρ₂h₂/h₁','κ₁ / κ₂',B/A,(A+B)/2,sp.Rational(1,2),inverse.subs({h:sp.Rational(24,3),r2:1,H:10}),inverse.subs({h:C,r2:2,H:10}),'Infinite']

MANUAL=['Quota comune: p0+ρ1gH=p0+ρ2gh; si cancellano p0,g. H10cm,rapporto1/2→h5cm; incrementi entrambi1kPa se g10.', 'Il rapporto di densità è puro; H è lunghezza,quindi h in cm. 1cm=1/100m; nessun calcolo numerico autonomo oltre al riconoscimento dimensionale.', 'Dividere il bilancio perρ2g positivo dà h=Hρ1/ρ2. Più densità sopra richiede più altezza equivalente del secondo liquido.', 'A10·1/2=5cm; B10·(4/5)/2=4cm. Effetto direttoρ1,stati separati stabili.', 'ρ1=ρ2h/H=2·5/10=1kg/L; ρ1≤ρ2 verificata.', 'ρ2=ρ1H/h=1·10/5=2kg/L=2000kg/m³; non chiamato acqua.', 'A5cm; B10cm per densità uguali e immiscibilità mantenuta, equilibrio neutro. Rapporto10/5=2.', 'hcorretta5cm;10−5=+5cm. Scarto fra altezze,non verso di moto.', 'ρ1=ρ2h/H,lunghezze cancellate; stabilità impone0<h≤H.', 'Sostituzione fattori positivi: (Hκ1ρ1/(κ2ρ2))/(Hρ1/ρ2)=κ1/κ2; entrambi gli stati nel dominio.', 'A5cm,B10·(4/5)/1=8cm;rapporto8/5,entrambe le densità ordinate.', '(5+8)/2=13/2cm. Densità medie9/10 e3/2 danno6cm;diff1/2cm,senza decimali.', 'Target(8/5)·5=8cm;ρ2B=(4/5)·10/8=1kg/L;rapporto1/2.', 'Gain15/(5cm)=3cm⁻¹;S24→h8cm;ρ1=(1kg/L)8/10=4/5kg/L≤ρ2.', 'ΔS6,Δh3cm→c2cm⁻¹,d1. C(9−1)/2=4cm;ρ1C=2·4/10=4/5kg/L.', 'ρ1=ρ2/2→h=H/2=5cm per ogniρ2>0. Infinite scale positive: (1,2) e(4/5,8/5)kg/L,zero escluso.']
DISTRACTORS=['10cm ignoraρ2doppia;20inverte rapporto; non si impongono superfici alla stessa quota.', 'kg massa,s tempo,Pa pressione,kg/L densità; soltanto cm lunghezza.', 'Rapporto inverso,doppio,metà e h=H falliscono l’identità generale; ultimo valido solo a densità uguali.', '25/4 inverte variazione,8 ometteρ2due,5 ignora,zero viola positività.', 'Rapporto altezza inverso darebbe4kg/L e stratificazione invertita,non equilibrio richiesto.', '1/2kg/L implicherebbe h20cm e violerebbe ordine stabile dato.', '1/2 segueρ2diretto,4quadrato,1ignora cambiamento,−2impossibile per altezze positive.', '−5ordine invertito,10proposta,0accetta,5/2dimezza errore.', 'Rapporto h inverso non isolaρ1;ρ2 al denominatore inverse density;2 e1/2 spuri.', 'Prodotto cresce conρ2,reciproco scambia stati,somma dà2 per fattoriunitari,quadrato duplicaκ1.', '5/8inverso,4/5soloρ1,2soloρ2,8numero altezza B invece rapporto.', '13somma,13/4doppia metà,6ingressi medi,3differenza non media.', 'Rapporto1 lascerebbe h4cm;ρ2raddoppiata accorcerebbe h. Bersaglio richiedeρ2B1kg/L.', 'ρ1=1dàS30;8/5violastabilità eformalmenteS48;2/5dàS12;negativa fuori dominio.', 'ρ1=2/5,1,8/5dannoS5,11,17;negativa fuori dominio. Solo4/5dàS9.', 'Unica/due finite non riconoscono scala libera;nessuna contraddice esempi;coppi nulla esclusa.']
ASSUMPTIONS=['Liquidi omogenei immiscibili in quiete,ρ1≤ρ2 positive,gravità uniforme,gas alla stessa pressione superiore,capillarità e pressione di vapore trascurate. Liquido2 connesso sotto interfaccia; H10cm e h misurate dalla stessa quota,0<h≤H. Dati variano fra preparazioni,non densità lungo la colonna. ', 'Liquidi omogenei immiscibili in quiete,ρ1≤ρ2 positive,gravità uniforme,gas alla stessa pressione superiore,capillarità e pressione di vapore trascurate. Liquido2 connesso sotto interfaccia; H10cm e h misurate dalla stessa quota,0<h≤H. Dati variano fra preparazioni,non densità lungo la colonna. ', 'Liquidi omogenei immiscibili in quiete,ρ1≤ρ2 positive,gravità uniforme,gas alla stessa pressione superiore,capillarità e pressione di vapore trascurate. Liquido2 connesso sotto interfaccia; H10cm e h misurate dalla stessa quota,0<h≤H. Dati variano fra preparazioni,non densità lungo la colonna. ', 'Liquidi omogenei immiscibili in quiete,ρ1≤ρ2 positive,gravità uniforme,gas alla stessa pressione superiore,capillarità e pressione di vapore trascurate. Liquido2 connesso sotto interfaccia; H10cm e h misurate dalla stessa quota,0<h≤H. Dati variano fra preparazioni,non densità lungo la colonna. ', 'Liquidi omogenei immiscibili in quiete,ρ1≤ρ2 positive,gravità uniforme,gas alla stessa pressione superiore,capillarità e pressione di vapore trascurate. Liquido2 connesso sotto interfaccia; H10cm e h misurate dalla stessa quota,0<h≤H. Dati variano fra preparazioni,non densità lungo la colonna. ', 'Liquidi omogenei immiscibili in quiete,ρ1≤ρ2 positive,gravità uniforme,gas alla stessa pressione superiore,capillarità e pressione di vapore trascurate. Liquido2 connesso sotto interfaccia; H10cm e h misurate dalla stessa quota,0<h≤H. Dati variano fra preparazioni,non densità lungo la colonna. ', 'Liquidi omogenei immiscibili in quiete,ρ1≤ρ2 positive,gravità uniforme,gas alla stessa pressione superiore,capillarità e pressione di vapore trascurate. Liquido2 connesso sotto interfaccia; H10cm e h misurate dalla stessa quota,0<h≤H. Dati variano fra preparazioni,non densità lungo la colonna. Densità uguali restano immiscibili e sono ammesse in equilibrio neutro. ', 'Liquidi omogenei immiscibili in quiete,ρ1≤ρ2 positive,gravità uniforme,gas alla stessa pressione superiore,capillarità e pressione di vapore trascurate. Liquido2 connesso sotto interfaccia; H10cm e h misurate dalla stessa quota,0<h≤H. Dati variano fra preparazioni,non densità lungo la colonna. ', 'Liquidi omogenei immiscibili in quiete,ρ1≤ρ2 positive,gravità uniforme,gas alla stessa pressione superiore,capillarità e pressione di vapore trascurate. Liquido2 connesso sotto interfaccia; H10cm e h misurate dalla stessa quota,0<h≤H. Dati variano fra preparazioni,non densità lungo la colonna. ', 'Liquidi omogenei immiscibili in quiete,ρ1≤ρ2 positive,gravità uniforme,gas alla stessa pressione superiore,capillarità e pressione di vapore trascurate. Liquido2 connesso sotto interfaccia; H10cm e h misurate dalla stessa quota,0<h≤H. Dati variano fra preparazioni,non densità lungo la colonna. ', 'Liquidi omogenei immiscibili in quiete,ρ1≤ρ2 positive,gravità uniforme,gas alla stessa pressione superiore,capillarità e pressione di vapore trascurate. Liquido2 connesso sotto interfaccia; H10cm e h misurate dalla stessa quota,0<h≤H. Dati variano fra preparazioni,non densità lungo la colonna. ', 'Liquidi omogenei immiscibili in quiete,ρ1≤ρ2 positive,gravità uniforme,gas alla stessa pressione superiore,capillarità e pressione di vapore trascurate. Liquido2 connesso sotto interfaccia; H10cm e h misurate dalla stessa quota,0<h≤H. Dati variano fra preparazioni,non densità lungo la colonna. ', 'Liquidi omogenei immiscibili in quiete,ρ1≤ρ2 positive,gravità uniforme,gas alla stessa pressione superiore,capillarità e pressione di vapore trascurate. Liquido2 connesso sotto interfaccia; H10cm e h misurate dalla stessa quota,0<h≤H. Dati variano fra preparazioni,non densità lungo la colonna. ', 'Liquidi omogenei immiscibili in quiete,ρ1≤ρ2 positive,gravità uniforme,gas alla stessa pressione superiore,capillarità e pressione di vapore trascurate. Liquido2 connesso sotto interfaccia; H10cm e h misurate dalla stessa quota,0<h≤H. Dati variano fra preparazioni,non densità lungo la colonna. ', 'Liquidi omogenei immiscibili in quiete,ρ1≤ρ2 positive,gravità uniforme,gas alla stessa pressione superiore,capillarità e pressione di vapore trascurate. Liquido2 connesso sotto interfaccia; H10cm e h misurate dalla stessa quota,0<h≤H. Dati variano fra preparazioni,non densità lungo la colonna. ', 'Liquidi omogenei immiscibili in quiete,ρ1≤ρ2 positive,gravità uniforme,gas alla stessa pressione superiore,capillarità e pressione di vapore trascurate. Liquido2 connesso sotto interfaccia; H10cm e h misurate dalla stessa quota,0<h≤H. Dati variano fra preparazioni,non densità lungo la colonna. Vincoloρ1=ρ2/2 ridondante con misura h5cm. ']
UNITS={1: 'cm', 2: 'cm', 3: 'cm', 4: 'cm', 5: 'kg/L', 6: 'kg/L', 7: '', 8: 'cm', 9: 'kg/L', 10: '', 11: '', 12: 'cm', 13: '', 14: 'kg/L', 15: 'kg/L', 16: ''}
NUMERIC_UNITS={1: 'cm', 5: 'kg/L', 6: 'kg/L', 13: '1'}
SUFFIX={8: ' cm', 12: ' cm', 14: ' kg/L', 15: ' kg/L'}
SVG_REVIEW='XML e rendering completo letti: H200px/h100px alla scala20px/cm;interfacciaz0,puntiA/B stessa quota in liquido2connesso. Incrementi1kPa entrambi,barre200px a200px/kPa. Ultimo pannello altra prova immiscibile a densitàuguali,altezze200/200px per10cm,neutralità esplicita;non aree interpretate come masse.'

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
          'methods':['SymPy_independent_hydrostatic_equilibrium_or_pressure_integral_or_volume_conservation','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}

CANDIDATE_REF='007219e'
SOURCE_READING='All80original prompts individually read before candidate solutions, except accidental first07901 full-row display including key disclosed; that direct result independently rederived from equal-level hydrostatics. All16final candidate records, alternatives, feedback and SVG read before freezing; never imports authoring.'
REVIEWED_PACKAGE_SHA256='01c993793f468c3464f2ccdb8b9e4482607bff27e090fd2a308b332a2a5106c8'
REVIEWED_BINDINGS_SHA256='dfd559575521fd0e1bf355116496e8049154ed9977fce6313085ac97844e69e8'
REVIEWED_CANDIDATES={'AR-u3-communicating-columns-01': 'dd3dd4a1ced0e3ec1cfbcf6392582f3242eeb2e26cf29f48a94b49990d1af7a0', 'AR-u3-communicating-columns-02': 'f91b92d4d73fc8803d4172e110e85e4a23e88084a29cdcbddf979b551f935eb0', 'AR-u3-communicating-columns-03': 'f49bf5c13507b5fcfe58d9490a4983801e8518e2f184aae3e77a8231c6f0c1a1', 'AR-u3-communicating-columns-04': 'e3b448e36e82c5dbbbd826bc51fb24ec805baba50555ffca7d8cc9a14538a5e1', 'AR-u3-communicating-columns-05': '91eabfd2a04ae885b3ea0a863cf75d2b83e635ca1e96fdc6f162536dba0499bb', 'AR-u3-communicating-columns-06': '0423e2626d9f92bdd92935be8d1b30acfa794d2b4097910dd0e9f0d502022a3e', 'AR-u3-communicating-columns-07': '3807c30e89dca1884e12c2e2396b0cacde5ffb7b6b7696c718d55ded33999a99', 'AR-u3-communicating-columns-08': 'b6a55f24f4313fd504e64d7178c45eae0a636b969a7b90551cc307b9bc791d80', 'AR-u3-communicating-columns-09': 'b38e281612e5df366e348dae61561cf4ed87cd492403fdac7d0878f9a55811b5', 'AR-u3-communicating-columns-10': '86dabbe63586b2898748a36c641a587b4596190911473835de67bb63bcc74a52', 'AR-u3-communicating-columns-11': 'c1baf320a0cf19a90afec6dcdd2d1451909ef4b964591ee2e038386fe9b7fe58', 'AR-u3-communicating-columns-12': 'adf4c3b9363a533c6ce0ff4eadf6abdeb9fa4c86aa2794e7de3dff86879c7136', 'AR-u3-communicating-columns-13': '42a34c89c85d03d2b0986517fe584879f9f3f52241e2035339fdf3d583d911b0', 'AR-u3-communicating-columns-14': 'a4ce8b9a9e48e0bbb194e6e61e6c4d9fbb47e7234ec40a59deec89cbc22aa764', 'AR-u3-communicating-columns-15': '0fb1121f5a00a009b2b6575fa7d13784bc38d6b3547b7dcceed1941a005efe90', 'AR-u3-communicating-columns-16': '578eb4f3f747263fbcf250e6f75388d421d4c726a61269c62691ba162838c65e'}
READ_SOURCE_SHA256={'u3-communicating-columns-01': '7c3a69d508252d386f48ba9b311444cf0f05ccc373bf9c0627938b733723b674', 'u3-communicating-columns-02': '657cdf53c7207e80e55b52168907171b11e5e7e432f1bb0559cfec0ddc2491f8', 'u3-communicating-columns-03': '7983947a069dda5f068ef2e76980cdd26992bcd5f8806fe0dd98394e75dd53a7', 'u3-communicating-columns-04': '94df94232e87ffea2b85b19d5b054ce4f41e6dfc8d2422b401dadb6ab479379f', 'u3-communicating-columns-05': '0202cafb86d7cbd5987a31f080a5548fafc67ea8477fb4a37d00f025e58fe726', 'u3-communicating-columns-06': 'cd2d54f019bd06992892fa24ea0dea70e8dbe479023bcc49c29812f783bba687', 'u3-communicating-columns-07': '5b5f3b4433606e678d0b2325ce6f5d6d6b6cad09f7d46a286e6c2ec437adeab0', 'u3-communicating-columns-08': '1f0cf80e411df3d8090a556324418b32032250908716cdcfc7c3fbcdfbb3f56f', 'u3-communicating-columns-09': 'd7a121d967f95fde1a29895a278f406d3b83985e1116b077020df99250919328', 'u3-communicating-columns-10': '451bd8ffc2439300eb65379a376499b69cae431401d216ca4a1158e6434be85b', 'u3-communicating-columns-11': '3376e3476349b970bf0be62d2df87055872cb45b2c3a90b91fb426460257a523', 'u3-communicating-columns-12': '90269c9539664e451df16fbdced6c2f14578880fcb53164b1b234b23dc6fee37', 'u3-communicating-columns-13': '8a99d2138d93acc40c5f9b468944430def98e93e24c7a4453de3df2accd5a6e2', 'u3-communicating-columns-14': '444dbd6b20305fc8e1450d339f83bc9a21b44aadb797cda53a6cd2b582c06c70', 'u3-communicating-columns-15': 'e695b5ffb6898ab5a962e662532df64b76f2c6959ae548007b80a42c507e1fbc', 'u3-communicating-columns-16': '8cdc7c02888ed40e0fef08f5d19a1d8df8aec53a434f6c0b6f252042a10c9b88'}
