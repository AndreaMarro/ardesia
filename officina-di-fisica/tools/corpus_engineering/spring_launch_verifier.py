"""Independent per-ID review, distinct from candidate author. No authoring import."""
from fractions import Fraction
from pathlib import Path
import pint
import sympy as sp
import re
from .pipeline import digest,sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-06.json'
FAMILY='spring-launch'
EXPECTED_IDS={f'AR-u2-{FAMILY}-{n:02}' for n in range(1,17)}

def oracle():
    k,m,ell,V=sp.symbols('k m ell V',positive=True)
    s=sp.Symbol('s',real=True)
    work=sp.integrate(k*(ell-s),(s,0,ell))
    if work!=k*ell**2/2:raise ValueError('Actual decreasing spring force work integral failed')
    law=sp.solve(sp.Eq(m*V**2/2,work),V)[0]
    inverse_m=sp.solve(sp.Eq(V,law),m)[0]
    inverse_ell=sp.solve(sp.Eq(V,law),ell)[0]
    a,b=sp.symbols('a b',positive=True)
    ratio=sp.simplify(law.subs({m:a*m,ell:b*ell})/law)
    for opts,want,index in [([ell*sp.sqrt(k/m),2*ell*sp.sqrt(k/m),ell*sp.sqrt(k/m)/2,-ell*sp.sqrt(k/m),k*ell/m],law,0),
      ([k*ell**2/V**2,k*ell/V,k*ell**2/(2*V**2),2*k*ell**2/V**2,V**2/(k*ell**2)],inverse_m,0),
      ([b/sp.sqrt(a),a*b,b/a,sp.sqrt(a)/b,b*b/a],ratio,0)]:
        if [i for i,x in enumerate(opts) if sp.simplify(x-want)==0]!=[index]:raise ValueError('Spring symbolic alternatives not unique as general laws')
    def speed(mass,compression):return law.subs({k:2,m:mass,ell:compression})
    A,B=speed(2,1),speed(1,2)
    gain,offset=sp.symbols('gain offset',real=True)
    cal=sp.solve([sp.Eq(gain*A+offset,3),sp.Eq(gain*B+offset,1+4*sp.sqrt(2))],(gain,offset))
    C=sp.simplify((2-cal[offset])/cal[gain])
    if cal[gain]!=2 or cal[offset]!=1 or C!=sp.Rational(1,2):raise ValueError('Exact radical affine calibration failed')
    if sp.simplify((A+B)/2-speed(sp.Rational(3,2),sp.Rational(3,2)))==0:raise ValueError('Nonlinear mean diagnostic failed')
    coefficient=sp.Symbol('coefficient',positive=True)
    constrained=sp.simplify(law**2).subs(m,coefficient*ell)
    if sp.simplify(constrained-k*ell/coefficient)!=0:raise ValueError('Positive compression cancellation failed')
    U=SI.Quantity
    energy=(U(2,'N/m')*U(1,'m')**2/2).to('J')
    speed_squared=(2*energy/U(2,'kg')).to('m**2/s**2')
    inferred_mass=(U(2,'N/m')*U(1,'m')**2/U(Fraction(1,2),'m/s')**2).to('kg')
    gain_si=(U(3,'')/U(1,'m/s')).to('s/m')
    constrained_accel=(U(2,'N/m')/U(2,'kg/m')).to('m/s**2')
    if (energy.magnitude,speed_squared.magnitude,inferred_mass.magnitude,gain_si.magnitude,constrained_accel.magnitude)!=(1,1,8,3,1):raise ValueError('Pint Fraction spring energy/inverse/gain dimensions failed')
    return [A,'m/s','V=ℓ√(k/m)','Da 1 a 1/2 m/s',inverse_m.subs({k:2,ell:1,V:1}),inverse_ell.subs({k:2,m:2,V:1}),speed(2,2)/A,2-A,'m=kℓ²/V²','κ₂ / √κ₁',B/A,(A+B)/2,sp.simplify(2*sp.sqrt(2)*A/sp.sqrt(2)),inverse_m.subs({k:2,ell:2,V:2*sp.sqrt(2)}),inverse_m.subs({k:2,ell:1,V:C}),sp.Integer(1)]

MANUAL=['Forza reale durante corsa s:k(ℓ−s),integrale0→ℓ=kℓ²/2=1J. Quota invariata,normale/peso senza lavoro,supportofisso senza lavoro. KfinalmV²/2=1J con m2→V²1→V1m/s.', 'kℓ²/m ha N·m/kg=m²/s²;radice→m/s,non energia o durata.', 'Due mezzi si cancellano:V²=kℓ²/m. ℓ>0→V=ℓ√(k/m),positivo; kℓ/m invece accelerazione iniziale.', 'Compressionsame1m,energia1J. m2→8kg→V²1→1/4m²/s²,quindiV1→1/2m/s.', 'm=kℓ²/V²=2J/(1m²/s²)=2kg; controlloK1J.', 'ℓ²=mV²/k=1m²,radici±1m;solo+1compressionepositiva,noncoordinataconsegno.', 'ℓ1→2,m2→energia1→4J,V1→2m/s,rapporto2;rapportoenergie4distinto.', 'Vcorretto1m/s,proposta2→scarto+1m/s. Proposta richiederebbe4J,non1.', 'V²=kℓ²/m→mV²=kℓ²→m=kℓ²/V²,V>0;unitàkg,nessunmezzo residuo.', 'V_B/V_A=κ2/√κ1 con k comune;perκ1=4,κ2=2 rapporto1 eenergia proporzionaleamassa.', 'A1m/s;B m1kg,ℓ2m→V²8→V2√2m/s;rapporto2√2esatto,no decimali.', 'Media(1+2√2)/2=(1/2+√2)m/s. Ingressi medi3/2kg,3/2m danno√3m/s,distinto senza decimalizzazione.', 'Target2√2V_A,m_B1kg→fattoremassa√2,quindiℓ_B/ℓ_A=(2√2)/√2=2.', 'q=3s/m,S6√2→V2√2,m=kℓ²/V²=8/8=1kg.', 'ΔS4√2−2=2(2√2−1),ΔV(2√2−1)m/s,nonnullo→q2s/m,offset1. SC2→V1/2,m=2/(1/4)=8kg.', 'm=cℓ,c2kg/m tra prove,nonmassavariabile durante lancio. V²=(k/c)ℓ con k/c1m/s²;V1→ℓ1m,m2kg,unicalineare.']
DISTRACTORS=['2m/s richiede4J;forzainizialecostanteperℓdarebbe2Jerrati,invecedellareaforza–spostamento1J.', 'mlunghezza,sdurata,Nforza,Jenergia;solo m/s rapidità.', 'Doppio/metà fallisconoenergia;negativo nonrapidità;kℓ/m accelerazione,non velocità.', '1/4salta radice,2effettoinverso,1ignoranuovamassa,zeroimpossibileaenergia positiva/massa finita.', 'Quadratimancanti rompono unità;energia cinetica con2kgvalida1J.', '−1modulonegativo,1m²nonlunghezza,zero nonmisuraV1.', '4energie nonrapidità;1/2reciproco;1ignora;−2 impossibilepermoduli.', '−1ordineinverso,2proposta,0accetta,1/2doppia metà.', 'kℓ/V nonmassa,reciprocoinversomassa,mezzo/doppio spuri perché mezzipresenti inentrambi imembri.', 'Prodotto cresceconmassaerratamente;κ2/κ1dimenticaradice;reciproco invertestati;κ2²/κ1quadratorapporto.', '√2solamassa,2solacompressione,4√2fattore2extra,1/√2massa nelversosbagliato.', 'Somma nonmedia,doppiametà,±1aggiuntisono±1m/s nonderivanodallamedia. √3ingressimedi≠1/2+√2.', 'ℓB1dà√2,ℓB4dà4√2;2corretto produce4J eV²8.', 'Ignoraregain3introducefattore9nelquadratoe1/9nellamassa;1kg ricostruisce lettura6√2.', 'Masse2,4,16,1/2kg dannoS3,1+√2,1+1/√2,5;nessuna2. Offsetprima di gain e quadrato.', '0massa ecompressionenulle escluse;negative nonmoduli;ℓ2,m4→V²2non1;massa nonindipendente dopovincolo.']
ASSUMPTIONS=['Riferimento inerziale,blocco inizialmente fermo,orizzontale liscio,molla ideale massless k2N/m,estremo fisso senza lavoro,nonattaccata alblocco,regime lineare,compressione positiva. Peso/normale nonlavoro,nessunaperdita;distacco alla lunghezzanaturale.', 'Riferimento inerziale,blocco inizialmente fermo,orizzontale liscio,molla ideale massless k2N/m,estremo fisso senza lavoro,nonattaccata alblocco,regime lineare,compressione positiva. Peso/normale nonlavoro,nessunaperdita;distacco alla lunghezzanaturale.', 'Riferimento inerziale,blocco inizialmente fermo,orizzontale liscio,molla ideale massless k2N/m,estremo fisso senza lavoro,nonattaccata alblocco,regime lineare,compressione positiva. Peso/normale nonlavoro,nessunaperdita;distacco alla lunghezzanaturale.', 'Riferimento inerziale,blocco inizialmente fermo,orizzontale liscio,molla ideale massless k2N/m,estremo fisso senza lavoro,nonattaccata alblocco,regime lineare,compressione positiva. Peso/normale nonlavoro,nessunaperdita;distacco alla lunghezzanaturale.', 'Riferimento inerziale,blocco inizialmente fermo,orizzontale liscio,molla ideale massless k2N/m,estremo fisso senza lavoro,nonattaccata alblocco,regime lineare,compressione positiva. Peso/normale nonlavoro,nessunaperdita;distacco alla lunghezzanaturale.', 'Riferimento inerziale,blocco inizialmente fermo,orizzontale liscio,molla ideale massless k2N/m,estremo fisso senza lavoro,nonattaccata alblocco,regime lineare,compressione positiva. Peso/normale nonlavoro,nessunaperdita;distacco alla lunghezzanaturale.', 'Riferimento inerziale,blocco inizialmente fermo,orizzontale liscio,molla ideale massless k2N/m,estremo fisso senza lavoro,nonattaccata alblocco,regime lineare,compressione positiva. Peso/normale nonlavoro,nessunaperdita;distacco alla lunghezzanaturale.', 'Riferimento inerziale,blocco inizialmente fermo,orizzontale liscio,molla ideale massless k2N/m,estremo fisso senza lavoro,nonattaccata alblocco,regime lineare,compressione positiva. Peso/normale nonlavoro,nessunaperdita;distacco alla lunghezzanaturale.', 'Riferimento inerziale,blocco inizialmente fermo,orizzontale liscio,molla ideale massless k2N/m,estremo fisso senza lavoro,nonattaccata alblocco,regime lineare,compressione positiva. Peso/normale nonlavoro,nessunaperdita;distacco alla lunghezzanaturale.', 'Riferimento inerziale,blocco inizialmente fermo,orizzontale liscio,molla ideale massless k2N/m,estremo fisso senza lavoro,nonattaccata alblocco,regime lineare,compressione positiva. Peso/normale nonlavoro,nessunaperdita;distacco alla lunghezzanaturale.', 'Riferimento inerziale,blocco inizialmente fermo,orizzontale liscio,molla ideale massless k2N/m,estremo fisso senza lavoro,nonattaccata alblocco,regime lineare,compressione positiva. Peso/normale nonlavoro,nessunaperdita;distacco alla lunghezzanaturale.', 'Riferimento inerziale,blocco inizialmente fermo,orizzontale liscio,molla ideale massless k2N/m,estremo fisso senza lavoro,nonattaccata alblocco,regime lineare,compressione positiva. Peso/normale nonlavoro,nessunaperdita;distacco alla lunghezzanaturale.', 'Riferimento inerziale,blocco inizialmente fermo,orizzontale liscio,molla ideale massless k2N/m,estremo fisso senza lavoro,nonattaccata alblocco,regime lineare,compressione positiva. Peso/normale nonlavoro,nessunaperdita;distacco alla lunghezzanaturale.', 'Riferimento inerziale,blocco inizialmente fermo,orizzontale liscio,molla ideale massless k2N/m,estremo fisso senza lavoro,nonattaccata alblocco,regime lineare,compressione positiva. Peso/normale nonlavoro,nessunaperdita;distacco alla lunghezzanaturale.', 'Riferimento inerziale,blocco inizialmente fermo,orizzontale liscio,molla ideale massless k2N/m,estremo fisso senza lavoro,nonattaccata alblocco,regime lineare,compressione positiva. Peso/normale nonlavoro,nessunaperdita;distacco alla lunghezzanaturale.', 'Riferimento inerziale,blocco inizialmente fermo,orizzontale liscio,molla ideale massless k2N/m,estremo fisso senza lavoro,nonattaccata alblocco,regime lineare,compressione positiva. Peso/normale nonlavoro,nessunaperdita;distacco alla lunghezzanaturale. m=(2kg/m)ℓ lega provedistinte,massacostante duranteciascunlancio;ℓ>0consente cancellazione.']
UNITS={1: 'm/s', 2: 'm/s', 3: 'm/s', 4: 'm/s', 5: 'kg', 6: 'm', 7: '', 8: 'm/s', 9: 'kg', 10: '', 11: '', 12: 'm/s', 13: '', 14: 'kg', 15: 'kg', 16: 'm'}
NUMERIC_UNITS={1: 'm/s', 5: 'kg', 6: 'm', 13: '1', 14: 'kg', 16: 'm'}
SUFFIX={8: ' m/s', 12: ' m/s', 15: ' kg'}

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
                if len(raw)>80:raise ValueError('too long')
                raw=raw.replace('√2','sqrt(2)')
                raw=re.sub(r'(?<=\d)(?=sqrt\()', '*',raw)
                if not re.fullmatch(r'(?:[0-9\s+*/().-]|sqrt)+',raw):raise ValueError('unsupported exact literal')
                if sp.simplify(sp.sympify(raw,locals={'sqrt':sp.sqrt})-want)!=0:errors.append('Independent '+FAMILY+' result mismatch')
            except (ValueError,TypeError):errors.append('Independent '+FAMILY+' answer or unit invalid')
        if row['answer']['type']=='numeric' and row['answer'].get('unit')!=NUMERIC_UNITS.get(n):errors.append('Independent '+FAMILY+' numeric unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,
         'assetChecksums':assets,'ok':not errors,'errors':errors,'expectedExact':str(want),
         'dimension':{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},
         'manualArithmetic':MANUAL[n-1],'physicalAssumptions':ASSUMPTIONS[n-1],'distractors':DISTRACTORS[n-1],
         'pedagogicalReview':'Riletti separatamente consegna, tutti i passaggi, hint, feedback e cinque alternative ove presenti; procedura manuale esatta e vincoli espliciti. '+MANUAL[n-1],
         'calculationScope':'NO_STUDENT_CALCULATION' if n==2 else 'SYMBOLIC_MANUAL_DERIVATION' if n in (3,9,10) else 'EXACT_MANUAL_CALCULATION',
         'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
         'methods':['SymPy_independent_work_integral_or_collision_conservation','SymPy_inverse_scaling_affine_radicals_and_physical_branches','Pint_Fraction_exact_SI_dimensions','separate_per_ID_manual_distractor_and_SVG_reading'],
         'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':'All16original source rows and all16candidate records independently read; full solutions/options/feedback and scientific SVG frozen after separate physical derivation'}}

CANDIDATE_REF='5fefc96dc46930732bd8b34d5d7f33d90431984d'
REVIEWED_PACKAGE_SHA256='19d1df7605e417c1ddb4d58938727ab1820c642cb833ad32334c6d4d30399016'
REVIEWED_BINDINGS_SHA256='3cf11bc184f722f81e42a5674139f06b5ad5884be777f17298478ce3b7430abe'
REVIEWED_CANDIDATES={'AR-u2-spring-launch-01': '70c6148377354e5a8cc85981892edb7799cda77354865522e079b3b1f0af04ef', 'AR-u2-spring-launch-02': '4b9e7b177a381f7429ae962528797df14a6a9ad621507d42db91f30db8a0c169', 'AR-u2-spring-launch-03': 'ec442eecb985a49d0f0958e6c849d6cc654bf2ac9d7d0e301d8ca9145c91488f', 'AR-u2-spring-launch-04': 'c2a9743c31ce17cfbf076f79b149198295cbcd26a21f4d3a1153d61d70774e21', 'AR-u2-spring-launch-05': 'a81084f021cfb0c5704bff678c10855817c2456300972322a758b9814fd32f81', 'AR-u2-spring-launch-06': 'b3ae4f1ebc9ea5e1dd3bb72353cd55dbd8402d586e054f80b75911828f9d16d9', 'AR-u2-spring-launch-07': '63c997239eb884d26c6ca5b958f69514b5f30a6e5586ad18d729cd157dfc6885', 'AR-u2-spring-launch-08': 'ffb7b7d049ec90e700497ea8cae56a33d7734093e1c829908ad4d817d2f72871', 'AR-u2-spring-launch-09': 'f4043a9f5130176470ce0b224508638fc381aed165e8e9fcde13a325f1daa8b3', 'AR-u2-spring-launch-10': '4361f699ab588c5e98dab095300a2709e3ca127b88e97ab8611985783d0b4b84', 'AR-u2-spring-launch-11': '12dc6feaceefbb2c5bbb8945091af783842176c3fb80502950449d6ae48592b4', 'AR-u2-spring-launch-12': 'fca8d012d3cbe5a130f1563457ae4b85a0eff8afb1915c9020cfaa2b4ec5356c', 'AR-u2-spring-launch-13': '10e74e2e9e76d978f5f931348d1162a4476949dee35123d49549a7103b8b59d4', 'AR-u2-spring-launch-14': 'f3ed82d10989a3308b851ede6a5cfd3ec899682c54369c4c7cf6a7cbb5843091', 'AR-u2-spring-launch-15': '2f1cfc2beec7c768064a205edb5bda4425d4289860f874b2e08236fcc0e71195', 'AR-u2-spring-launch-16': '35b9405ad67e4f31ba4832447b03d4e87ec2db1f4a67bfdb7a2fd54958bdf3bb'}
READ_SOURCE_SHA256={'u2-spring-launch-01': 'd85f22f5b15faf8ce3b620eae129419d71514b03669d99908c2542811676a0e0', 'u2-spring-launch-02': '876d809eb07c11c691c163d0bd4e01fae333113161d4e44a470b69efa3b6ee21', 'u2-spring-launch-03': '8d8e15bf5381d13de222699d15925858459acb5176b7542146ba28a6bacff2b8', 'u2-spring-launch-04': '47d218a32178bcb84356d0e9e7a1e0bd2b2fd3141fc92e4749eb2921dc51f9c4', 'u2-spring-launch-05': 'c745113e18b48d458db623e964dca7eb7223115607ea134d196db0e95fb6e55e', 'u2-spring-launch-06': '0a54f612a10422eaebface45232e30611033afd256a85bb455fb067e8f874977', 'u2-spring-launch-07': '116347ba2f29c22daee272a584da52941891871c23d982c628e22f13d025f164', 'u2-spring-launch-08': '73a847c5a4f167c5788f62d6c435ba827d08762972fe192f9619b53b629b4514', 'u2-spring-launch-09': '3b61d8d9a79342a1a40a96b154add720b0b5a6f61be442041137dea5754e217a', 'u2-spring-launch-10': '8995d8d833e3063bf4b339d3cd0dc6cdb2f101cf3425c75de59ad6225d9fe5b3', 'u2-spring-launch-11': 'b9c12584a9aa3d27ce456fd7300b25469cc53b0482b09bec9b2ffc8583073ea2', 'u2-spring-launch-12': '2df408958f9a48eec8aa3150156defe4e6a1e69f05ae5afcf9333599d99e86cc', 'u2-spring-launch-13': '23ff4ada91aa5ee7dd00a720ede616a87c353e46b0b28c772fc1a6640771d138', 'u2-spring-launch-14': 'f666fef36911210b3a4e90eb46265500fdc9b3efaa926d519f8646336f210449', 'u2-spring-launch-15': '419e3f1cd22bcdebeb19d7224f15c46ea1a0ecab80925ee878d8f663f0e35263', 'u2-spring-launch-16': '4e5fbaaa090b6ca3c8409b3d62a4d5e96e0517dd6e9b9611cbf55fd95b60e245'}
