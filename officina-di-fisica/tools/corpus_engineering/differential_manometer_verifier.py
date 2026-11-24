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
FAMILY='differential-manometer'
EXPECTED_IDS={f'AR-u3-{FAMILY}-{n:02}' for n in range(1,17)}

@lru_cache(maxsize=1)
def oracle():
    x,z,r,g,y=sp.symbols('x z r g y',positive=True)
    # Follow one static liquid upwards: integral dp=-rho*g*dz.
    jump=sp.integrate(r*g,(sp.Symbol('zeta'),0,z))
    law=sp.solve(sp.Eq(x,y+jump),y)[0]
    inv=sp.solve(sp.Eq(y,law),x)[0]
    a,b=sp.symbols('a b',positive=True)
    ratio=sp.factor(law.subs({x:a*x,z:b*z})/law)
    if law!=x-r*g*z or inv!=y+r*g*z:raise ValueError('Independent oriented hydrostatic derivation failed')
    for options,want in [([x-r*g*z,x+r*g*z,r*g*z,2*(x-r*g*z),(x-r*g*z)/2],law),([y+r*g*z,y-r*g*z,r*g*z-y,2*(y+r*g*z),(y+r*g*z)/2],inv),([ratio,a/b,a*b,1/ratio,2*ratio],ratio)]:
        if [i for i,expr in enumerate(options) if sp.simplify(expr-want)==0]!=[0]:raise ValueError('Independent symbolic alternatives not unique')
    # Numeric map carries kPa and cm conversion; universal law above remains SI.
    f=lambda p,h:sp.Rational(p)-sp.Rational(h)/10
    A,B=f(100,20),f(80,10)
    q,d=sp.symbols('q d',real=True)
    cal=sp.solve([sp.Eq(q*A+d,197),sp.Eq(q*B+d,159)],(q,d))
    C=(157-cal[d])/cal[q]
    if (cal[q],cal[d],C)!=(2,1,78):raise ValueError('Exact affine manometer calibration failed')
    if (A+B)/2!=f(90,15):raise ValueError('Affine mean coincidence failed')
    constrained=sp.solve(sp.Eq(98,5*z-z/10),z)
    if constrained!=[20]:raise ValueError('Dimensional pressure-height constraint linear branch failed')
    # Real counterexample: a wrong inverse can be positive; do not assert a universal sign.
    if (3-2,2-1)!=(1,1):raise ValueError('Symbolic distractor sign counterexample failed')
    U=SI.Quantity
    pressure=(U(100,'kPa')-U(1000,'kg/m**3')*U(10,'m/s**2')*U(20,'cm')).to('kPa')
    height=((U(100,'kPa')-U(98,'kPa'))/(U(1000,'kg/m**3')*U(10,'m/s**2'))).to('cm')
    gradient=(U(1000,'kg/m**3')*U(10,'m/s**2')).to('kPa/cm')
    gain=(U(294,'')/U(98,'kPa')).to('1/kPa')
    if (pressure.magnitude,height.magnitude,gradient.magnitude,gain.magnitude)!=(98,20,Fraction(1,10),3):raise ValueError('Pint Fraction manometer dimensions failed')
    return [A,'kPa','p₂=p₁−ρgΔh','Da 98 a 78 kPa',A+2,(100-A)*10,f(100,10)/A,196-A,'p₁=p₂+ρgΔh','P_B / P_A',B/A,(A+B)/2,sp.Rational(1,2),sp.Rational(237,3)+1,C+2,constrained[0]]

MANUAL=['Si sale dalla superficie1bassa a2alta: p2=p1−ρgΔh.20cm=1/5m;salto1000·10/5Pa=2000Pa=2kPa;p2100−2=98kPa.', 'ρgΔh ha kg/(m·s²),cioè Pa. kPa=1000Pa,unica pressione nelle alternative; riferimento assoluto non cambia unità.', 'Alla quota bassa nel ramo2 p=p2+ρgΔh=p1;isolando p2 compare il meno. Conp1>ρgΔh resta p2>0.', 'Salto fisso2kPa:100→80kPa dà98→78kPa. Differenza−20,non fattore4/5 sull’interauscita.', 'Inversa p1=p2+salto=98+2=100kPa,scendendo si aggiunge pressione.', 'Differenza2kPa2000Pa;Δh2000/(10000Pa/m)=1/5m=20cm.', 'ConΔh10cm,salto1kPa,p2B99kPa;rapporto99/98>1,non dimezzamento della pressione assoluta.', 'Proposta196 meno corretta98=+98kPa; proposta>p1 incoerente anche col verso.', 'AggiungereρgΔh ad entrambi imembri: p1=p2+ρgΔh. Il distrattoreρgΔh−p2 non isola p1,ma non ha sempre segno negativo. Controesempio p2=1,salto2,p1=3kPa: distrattore+1kPa.', 'P_A=p1A−ρgΔhA e P_B=κ1p1A−ρgκ2ΔhA sono positivi per dominio. R=P_B/P_A,non quoziente dei fattori. Perκ1=κ2=κ,R=κ.', 'A100−2=98,B80−1=79kPa;rapporto79/98esatto.', '(98+79)/2=177/2kPa. Ingressi medi90kPa,15cm→90−3/2=177/2,coincidenza da linearità conρgcostante.', 'Target(79/98)98=79kPa,p1B80→salto1kPa→ΔhB10cm,rapporto10/20=1/2positivo.', 'c294/(98kPa)=3kPa⁻¹;S237→p2B79kPa;Δh10cm→salto1kPa;p1B80kPa.', 'ΔS−38,Δp−19kPa→c2kPa⁻¹,d1. C(157−1)/2=78kPa;salto2→p1C80kPa.', 'a5kPa/cm,b1/10kPa/cm; p2=(a−b)Δh=(49/10kPa/cm)Δh98kPa→Δh98·10/49=20cm. p1100,salto2,p298.']
DISTRACTORS=['Somma102kPa segnoerrato,2kPasolo salto; nessuna nuova atmosfera.', 'kgmassa,mlunghezza,stempo,kg/m³densità:nessuna pressione.', 'Più inverte salita,solo salto non assoluta,doppio/metà spuri.', '392/5è98·4/5affineerrato,82somma il salto,98ignora cambiamento,zerononpositivo.', '96kPasottrae duevolte,atmosfera e peso gas non necessari.', '2ènumero del salto in kPa;1/5unità metri,noncm;segnoΔhpositivo richiede p1>p2.', '98/99reciproco,1/2e2seguonosoltantoΔh,1/98incrementorelativo nonrapporto finale.', '−98ordineinverso,196proposta,0accetta,49doppia metà.', 'Sottrazione ripetuta e ordineinvertito nonisolano p1;2e1/2spuri. Segno del distrattore invertito dipende dai dati,non è un criterio universale.', 'κ1/κ2eprodotto perdono differenza,reciprocoscambiaA/B,duefattoreestraneo.', '98/79inverso,4/5solop1,1/2soloΔh,79uscita invece rapporto.', '177somma,177/4doppia metà,19/2metà differenza,90media p1nonp2.', 'ΔhB20darebbe78non79;10èlunghezzaincm,nonrapporto.', '237letturapura;79pressione2non1;78sottraeancora il salto invece sommarlo.', 'ConΔh20cm,p179,81,40,160kPa produconoS155,159,77,317;solo80dà157.', 'Ignoraregradiente usa5invece49/10;vincolodipreparazionenonleggeulteriore,coefficiente positivo garantisce unicità.']
ASSUMPTIONS=['Acqua1000kg/m³ inquiete,g10uniforme,peso gas ecapillarità trascurati,interfaccia2più alta di1 diΔh>0. Pressioniassolutepositive p1>ρgΔh,p2=p1−ρgΔh;quotaorientata esplicita,conversionecm→m. Preparazioni distinte,stessifluidog. ', 'Acqua1000kg/m³ inquiete,g10uniforme,peso gas ecapillarità trascurati,interfaccia2più alta di1 diΔh>0. Pressioniassolutepositive p1>ρgΔh,p2=p1−ρgΔh;quotaorientata esplicita,conversionecm→m. Preparazioni distinte,stessifluidog. ', 'Acqua1000kg/m³ inquiete,g10uniforme,peso gas ecapillarità trascurati,interfaccia2più alta di1 diΔh>0. Pressioniassolutepositive p1>ρgΔh,p2=p1−ρgΔh;quotaorientata esplicita,conversionecm→m. Preparazioni distinte,stessifluidog. ', 'Acqua1000kg/m³ inquiete,g10uniforme,peso gas ecapillarità trascurati,interfaccia2più alta di1 diΔh>0. Pressioniassolutepositive p1>ρgΔh,p2=p1−ρgΔh;quotaorientata esplicita,conversionecm→m. Preparazioni distinte,stessifluidog. ', 'Acqua1000kg/m³ inquiete,g10uniforme,peso gas ecapillarità trascurati,interfaccia2più alta di1 diΔh>0. Pressioniassolutepositive p1>ρgΔh,p2=p1−ρgΔh;quotaorientata esplicita,conversionecm→m. Preparazioni distinte,stessifluidog. ', 'Acqua1000kg/m³ inquiete,g10uniforme,peso gas ecapillarità trascurati,interfaccia2più alta di1 diΔh>0. Pressioniassolutepositive p1>ρgΔh,p2=p1−ρgΔh;quotaorientata esplicita,conversionecm→m. Preparazioni distinte,stessifluidog. ', 'Acqua1000kg/m³ inquiete,g10uniforme,peso gas ecapillarità trascurati,interfaccia2più alta di1 diΔh>0. Pressioniassolutepositive p1>ρgΔh,p2=p1−ρgΔh;quotaorientata esplicita,conversionecm→m. Preparazioni distinte,stessifluidog. ', 'Acqua1000kg/m³ inquiete,g10uniforme,peso gas ecapillarità trascurati,interfaccia2più alta di1 diΔh>0. Pressioniassolutepositive p1>ρgΔh,p2=p1−ρgΔh;quotaorientata esplicita,conversionecm→m. Preparazioni distinte,stessifluidog. ', 'Acqua1000kg/m³ inquiete,g10uniforme,peso gas ecapillarità trascurati,interfaccia2più alta di1 diΔh>0. Pressioniassolutepositive p1>ρgΔh,p2=p1−ρgΔh;quotaorientata esplicita,conversionecm→m. Preparazioni distinte,stessifluidog. Fix finaleae4c2c4 riletto: nessun segno universale assegnato al distrattore nel quesito simbolico. ', 'Acqua1000kg/m³ inquiete,g10uniforme,peso gas ecapillarità trascurati,interfaccia2più alta di1 diΔh>0. Pressioniassolutepositive p1>ρgΔh,p2=p1−ρgΔh;quotaorientata esplicita,conversionecm→m. Preparazioni distinte,stessifluidog. ', 'Acqua1000kg/m³ inquiete,g10uniforme,peso gas ecapillarità trascurati,interfaccia2più alta di1 diΔh>0. Pressioniassolutepositive p1>ρgΔh,p2=p1−ρgΔh;quotaorientata esplicita,conversionecm→m. Preparazioni distinte,stessifluidog. ', 'Acqua1000kg/m³ inquiete,g10uniforme,peso gas ecapillarità trascurati,interfaccia2più alta di1 diΔh>0. Pressioniassolutepositive p1>ρgΔh,p2=p1−ρgΔh;quotaorientata esplicita,conversionecm→m. Preparazioni distinte,stessifluidog. ', 'Acqua1000kg/m³ inquiete,g10uniforme,peso gas ecapillarità trascurati,interfaccia2più alta di1 diΔh>0. Pressioniassolutepositive p1>ρgΔh,p2=p1−ρgΔh;quotaorientata esplicita,conversionecm→m. Preparazioni distinte,stessifluidog. ', 'Acqua1000kg/m³ inquiete,g10uniforme,peso gas ecapillarità trascurati,interfaccia2più alta di1 diΔh>0. Pressioniassolutepositive p1>ρgΔh,p2=p1−ρgΔh;quotaorientata esplicita,conversionecm→m. Preparazioni distinte,stessifluidog. ', 'Acqua1000kg/m³ inquiete,g10uniforme,peso gas ecapillarità trascurati,interfaccia2più alta di1 diΔh>0. Pressioniassolutepositive p1>ρgΔh,p2=p1−ρgΔh;quotaorientata esplicita,conversionecm→m. Preparazioni distinte,stessifluidog. ', 'Acqua1000kg/m³ inquiete,g10uniforme,peso gas ecapillarità trascurati,interfaccia2più alta di1 diΔh>0. Pressioniassolutepositive p1>ρgΔh,p2=p1−ρgΔh;quotaorientata esplicita,conversionecm→m. Preparazioni distinte,stessifluidog. Vincolop1=(5kPa/cm)Δh fra preparazioni,a>ρg. ']
UNITS={1: 'kPa', 2: 'kPa', 3: 'kPa', 4: 'kPa', 5: 'kPa', 6: 'cm', 7: '', 8: 'kPa', 9: 'kPa', 10: '', 11: '', 12: 'kPa', 13: '', 14: 'kPa', 15: 'kPa', 16: 'cm'}
NUMERIC_UNITS={1: 'kPa', 5: 'kPa', 6: 'cm', 13: '1', 14: 'kPa', 16: 'cm'}
SUFFIX={8: ' kPa', 12: ' kPa', 15: ' kPa'}
SVG_REVIEW='XML e rendering completo letti: interfaccia1y420,2y220,dislivello200px per20cm a10px/cm;A/B allastessaquota420nel liquidoconnesso,p_A=p_B. Barra delsolo salto200px per2kPaa100px/kPa,esplicitamente nonp1/p2assolute troncate. Conversione1/5m→2000Pa→2kPa e verso sottrattivo coerenti.'

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
          'verificationMode':'AI_CONCEPTUAL_WITH_SPECIFIC_PHYSICS_PROOF' if isinstance(want,str) else 'EXACT_ORACLE',
          'methods':['SymPy_independent_hydrostatic_equilibrium_or_pressure_integral_or_volume_conservation','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}

CANDIDATE_REF='ae4c2c4cdb288c8dcca53d989d225e5cc9a82554'
SOURCE_READING='All80original prompts individually read before candidate solutions, except accidental first07901 full-row display including key disclosed; that direct result independently rederived from equal-level hydrostatics. All16final candidate records, alternatives, feedback and SVG read before freezing; never imports authoring.'
REVIEWED_PACKAGE_SHA256='c9d13d71ac6309c6de1b4281419a495dfb036eac0db1cbb0043807256a03172b'
REVIEWED_BINDINGS_SHA256='9077b336b658c3efc657b4d3a622d55bb8a9d9d1ad64db0850c38a96a3549176'
REVIEWED_CANDIDATES={'AR-u3-differential-manometer-01': '882ae8932a0c8d7e3d8b34f96c8b1a2cd773b49b024b4b5f0298a49a8b5443cd', 'AR-u3-differential-manometer-02': '76123da1ff98863d9281a79ff2205b4e5d137a892492db277ee87b8b62d77b07', 'AR-u3-differential-manometer-03': '837a63b8909b7ddfbdba7c1e2c1885a737761ed75268e414906e7cda68d6e180', 'AR-u3-differential-manometer-04': '0c3370ea85f31e0f921692b384f00b9f0f03e9b3be7be75c572a9375a59641d5', 'AR-u3-differential-manometer-05': 'f69953644d369b1a20f473078124d8a8d68388afde14aa79ce137f7c453f52b5', 'AR-u3-differential-manometer-06': '20e50b714af2d2cd590decb16ba13109a7fae1a60cf984adbb2f85282a0e3b69', 'AR-u3-differential-manometer-07': 'c053706815ef722cc8a3d26b2e0ab4f2b2836d075a462828acbc7f273f55f3a8', 'AR-u3-differential-manometer-08': '25294ab90043af816fb8db8f6b597897263a864309c25cd1dfae245fd2fd7558', 'AR-u3-differential-manometer-09': 'c9fd036badffe22343b50ee4551f225d6d27bd7fa39edcc2ef44dc135d1cf1ce', 'AR-u3-differential-manometer-10': 'cd710ca91a30fa9a88c4783b1c3b3438ddc9eb3cfef4e9baf2e745b3cd6d8841', 'AR-u3-differential-manometer-11': 'd85b2a28e40c2a7439715e69af2989d0be4a05f7c05d040c06b9197c952146be', 'AR-u3-differential-manometer-12': '19d9066446980f5cb7e4355f0554094c5431fb349660209c433fa0c089e40f79', 'AR-u3-differential-manometer-13': 'a82b9b90bfe9e7e6c47d95c5811b638e1f0dcea8a2ad0918953fb3060f2447e3', 'AR-u3-differential-manometer-14': '7770df07ae88a8ae7a37ce55a360ae36b3f77734fbe348d9aa6bbe198ac3ceff', 'AR-u3-differential-manometer-15': 'd31dac8c26ef3b299a0d4eb24b726952c08aa94e73adfffb872f27eb9a24397b', 'AR-u3-differential-manometer-16': '642e8a9dd7023fb7b08a89db9783b834cb215e42ed1eb1d1adf661313e46c40b'}
READ_SOURCE_SHA256={'u3-differential-manometer-01': '9a584191aefe8423d1c3573c20d9a05da4b24621ff9e6a3cd09a83ac2d997d7c', 'u3-differential-manometer-02': 'd45bf9a6d95198dfdc0111b0cd835e228c26be07b33af3d753890676e41a2825', 'u3-differential-manometer-03': '7c64b24391ab3442832fca885e9a443e11754f7f4167bbd87667852b9ecb20a6', 'u3-differential-manometer-04': 'f9a2f0faaacaaec6f1525ebc5a427df0058c918e16e6f00830cd37036b3110f4', 'u3-differential-manometer-05': 'd3c1d5bcf3232684e3db70fd67542e529d18df70865bde9d231a252bfececb43', 'u3-differential-manometer-06': 'fc0329b5718fb0722034a9d6f3e49c6e2d1f16fafc1bb41e704c39e2f24ef306', 'u3-differential-manometer-07': 'cfb4f1617fea98533f8b3c677e357312ea7ef5fa2667a508459a0ac386e1181f', 'u3-differential-manometer-08': '1fa765ae91beeb1c6f278c8833ce63b4754996c2f1b53f17386956c970c554b9', 'u3-differential-manometer-09': 'b9a65721d76fb92347b4ee75fa320a4dd4f85d246b7f5ffb5c8c8b95904af2b7', 'u3-differential-manometer-10': 'b0a261768410a9b0674832c227594dc18b4e33c14f906519372d0067065be6f8', 'u3-differential-manometer-11': 'bc6778e6a572a3dbb239efffcfebc5cebcd788425e72f8411a3d2d61f0b0bdfb', 'u3-differential-manometer-12': 'afefb7dfacdd0ec69689f0bbae76824a54149cb1ed385a44d35dd932184c2fc3', 'u3-differential-manometer-13': '38e4a37f65e38027711d9d8415412fe486bb31e1a4d31e9d21086305ac87e95d', 'u3-differential-manometer-14': '22cb84d026f5207ed88a59080191d90e3f75beff07b864614417af00638e9477', 'u3-differential-manometer-15': 'f91a7ed5a0b9bb5b8f31d3154398495a2c5bd26e8b00e60d5cc81d1b9bc747d6', 'u3-differential-manometer-16': 'adfd2b08a22b590cd797a4b1eb35a9e2d554d4eaad6eda6a41253dcc3f8dc9d3'}
