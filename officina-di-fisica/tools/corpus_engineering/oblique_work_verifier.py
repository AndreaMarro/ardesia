"""Independent oblique-work review from a vector scalar product, not authoring."""
from fractions import Fraction
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-04.json'
FAMILY='oblique-work'
EXPECTED_IDS={f'AR-u2-{FAMILY}-{n:02}' for n in range(1,17)}


def oracle():
    F,s,W=sp.symbols('F s W',positive=True)
    # Exact geometry, not a numerical trigonometric approximation for students.
    vector=sp.Matrix([F/2,sp.sqrt(3)*F/2]);displacement=sp.Matrix([s,0])
    if sp.simplify(vector.dot(vector)-F**2)!=0:raise ValueError('Oblique vector magnitude failed')
    law=sp.simplify(vector.dot(displacement))
    if law!=F*s/2:raise ValueError('Parallel projection scalar product failed')
    invF=sp.solve(sp.Eq(W,law),F)[0];invs=sp.solve(sp.Eq(W,law),s)[0]
    def work(force,length):return law.subs({F:force,s:length})
    first,second=work(2,2),work(4,4)
    a,b=sp.symbols('a b',positive=True)
    ratio=sp.cancel(law.subs({F:a*F,s:b*s})/law)
    for options,want,index in [([F*s,F*s/2,-F*s/2,F*s/4,0],law,1),([W/s,2*W/s,W/(2*s),4*W/s,s/(2*W)],invF,1),([a/b,b/a,a*b,a*b/2,2*a*b],ratio,2)]:
        if [i for i,v in enumerate(options) if sp.cancel(v-want)==0]!=[index]:raise ValueError('Oblique symbolic alternatives not unique')
    gain,offset=sp.symbols('gain offset',real=True)
    cal=sp.solve([sp.Eq(gain*first+offset,5),sp.Eq(gain*second+offset,17)],(gain,offset))
    third=(9-cal[offset])/cal[gain]
    real_s=sp.Symbol('real_s',real=True)
    roots=sp.solve(sp.Eq(real_s**2/2,2),real_s)
    if roots!=[-2,2] or [r for r in roots if r>0]!=[2]:raise ValueError('Oblique positive displacement branch failed')
    Q=SI.Quantity
    projection=Q(2,'N')*Fraction(1,2);measured=(projection*Q(2,'m')).to('J')
    invunits=(2*measured/Q(2,'m')).to('N');gain_units=(Q(6,'')/measured).to('1/J')
    constraint=(2*Q(2,'J')/Q(1,'N/m')).to('m**2')
    if (projection.magnitude,measured.magnitude,invunits.magnitude,gain_units.magnitude,constraint.magnitude)!=(1,2,2,3,4):raise ValueError('Exact Pint oblique work/inverse/gain/constraint failed')
    if work(3,3)!=sp.Rational(9,2) or (first+second)/2!=5:raise ValueError('Mean of oblique products diagnostic failed')
    return [first,'J','W=Fs/2','Da 2 a 4 J',invF.subs({W:2,s:2}),invs.subs({W:2,F:2}),work(2,4)/first,4-first,
      'F=2W/s','κ₁ κ₂',second/first,(first+second)/2,(2*(4*first)/4)/2,(2*(24/sp.Integer(3)))/4,invF.subs({W:third,s:2}),sp.Integer(2)]
MANUAL=[
 'Forza( F/2,√3F/2), spostamento(s,0): prodotto scalareFs/2. ConF2N,s2m proiezione1N e lavoro2J. Coseno1/2 fornito, non valutazione numerica.',
 'Coseno puro: lavoro N·m=J, dimensioneML²/T² anche se valore zero perangolo retto.',
 'W=F·Δr=Fs cos60°=Fs/2. Solo proiezione parallela contribuisce; componentetrasversa ha spostamentonullo.',
 'F2→4N,s2m,cos1/2 invariati: W2→4J, rapporto2.',
 'F=2W/s=2·2J/(2m)=2N;W/s=1N sarebbe solaproiezione.',
 's=2W/F=2·2J/(2N)=2m;W/F1m omette coseno.',
 'F2N,s2→4m: W2→4J, rapporto2, medesimo coseno si cancella.',
 'PropostaFs4J,correttoFs/2=2J;4−2=+2J.',
 'W=Fs/2→2W=Fs→F=2W/s>0; dimensioneJ/m=N.',
 'NuovoFs κ₁κ₂ volte; mezzo comune si cancella: W_B/W_A=κ₁κ₂, angolouguale necessario.',
 'A2·2/2=2J;B4·4/2=8J;rapporto4. Valore8J nonrapportopuro.',
 'Media(2+8)/2=5J;prodottodati medi3N,3m con mezzo=9/2J, diverso da10/2J.',
 'TargetW_B4·2=8J,F_B4N→s_B2·8/4=4m;su2m iniziali rapporto2.',
 'Wref2J,Sref6→c3J⁻¹;S24→W8J;s4m→F2·8/4=4N.',
 'ΔS17−5=12,ΔW8−2=6J→c2J⁻¹;d1;S9→W4J;s2m→F4N.',
 'F=cs,c1N/m fra prove→W=cs²/2=2J→s²4m²;rami±2m,solo+2 ammesso,F2N. Nonforza variabile con posizionedurante singolaprova.'
]
DISTRACTORS=[
 '4J omettecoseno,1J loapplicaduevolte. Lavorodellaforzaassegnata non lavorototalerichiestoperΔK.',
 'N forza,W wattenergia/tempo,m/s velocità,1puro;coseno non cambia dimensione.',
 'Fs angolo0°,−Fs/2 angolo120°,Fs/4doppia proiezione,0angolo90°. Angolotraforza e spostamentodelpuntodiapplicazione.',
 '8 raddoppiaanche soomettecosenoinB;1inverteeffettoF;negativoincompatibile angoloacuto.',
 '1N soloproiezione;4N doppia correzione dell’inverso. Controllo2N·2m/2=2J.',
 '1m daW/F richiederebbe forza parallela;modulos positivo senza segnoorientato.',
 '1/2 inverso,4quadratoassente,1nessuncambiamento,−2 nonrapporto diduelavoripositivi.',
 '−2ordineinverso;4proposta;1altrametà;3sottrarrebbe numerodiforza a energia, dimensioni diverse.',
 'W/s soloFparallela;W/(2s)èquattrovoltepiùpiccolo,4W/sdoppio;s/(2W) inversoforza.',
 'Quozienti invertonouningresso;mezzo/doppiorestaerroneamentenelrapporto einvalidanoidentitàκ₁=κ₂=1.',
 '2unfattore solooconservailmezzo;8J singolalavoroB;1/4 rapporto inverso.',
 '10somma,5/2doppiadivisione,9/2modellodati medi,4/6 nonsemisomma esatta.',
 'squadruplo eFdoppia→Wottuplo;suguale→Wdoppio;4mnuovi nonrapporto4.',
 'S24comeJ→F12N;W/s anchetarato dàproiezione2N nonmodulo4N.',
 'F2,3,5,8N su2m dannoS5,7,11,17;solo4dà9. Offsetnoneliminabileconrapportigrezzi.',
 'Ramo−2 vietato siaFches;4confondequadrato;1/3 nonricostruisconoW2J. Nessunaintegrazionediforzacrescenteammessa.'
]
ASSUMPTIONS=['Forza costante, spostamento rettilineo positivo del suo punto di applicazione, angolo60° e cos60°=1/2 fornito. Lavoro della sola forza assegnata; F,s>0 e W>0 in questo angoloacuto. Riferimento inerziale ove dichiarato; nessuna deduzione automatica suΔK senza altri lavori.']*16
ASSUMPTIONS[15]+=' VincoloF=(1N/m)s collega proveseparate, conFcostante dentroogniprova; non leggediHooke lungo unpercorso.'
UNITS={n:'J'for n in range(1,17)}
UNITS.update({5:'N',6:'m',7:'',9:'N',10:'',11:'',13:'',14:'N',15:'N',16:'m'})
NUMERIC_UNITS={1:'J',5:'N',6:'m',8:'J',11:'1',12:'J',13:'1',14:'N',16:'m'}
SUFFIX={15:' N'}

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
         'methods':['SymPy_independent_vector_scalar_product_projection','SymPy_inverse_scaling_affine_and_branches','Pint_Fraction_exact_SI_dimensions','separate_per_ID_manual_distractor_and_SVG_reading'],
         'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':'All16original source rows and all16candidate records independently read; full solutions/options/feedback and scientific SVG frozen after separate physical derivation'}}

CANDIDATE_REF='a39ae3935b9156c064ff80dfec84691f4c821b5d'
REVIEWED_PACKAGE_SHA256='3adc59b4f25e11d3d626e2e4ca869ca5730f958e096626b13f6a9bffd0fa5946'
REVIEWED_BINDINGS_SHA256='bdfeb526028b93e570b142fa13bb980b02b57ef2c14d2cd2f196e222581583ab'
REVIEWED_CANDIDATES={'AR-u2-oblique-work-01': '3a74b7eeb32cc1402a5d49643a81e1a708d20e19e83b0c8debb763ad3db91de7', 'AR-u2-oblique-work-02': '6156ff73ee6fcb815ebbf0eadefde39fafaaf878efc6b7dc4daf678b345b3314', 'AR-u2-oblique-work-03': 'f837e64baf34c8095e7718518e34ebc5df0c7b6de2a095ff1101a0e4b1b061a8', 'AR-u2-oblique-work-04': '6c52eb546a5f6072b7df7cc2525462a102839750e73f09c616d3216c77a9a3d7', 'AR-u2-oblique-work-05': '6ace649e3be45cc3d8bb72a0f7ec0a76d96f2d7177fe50a00957b6ff2e1d595a', 'AR-u2-oblique-work-06': '89d39a8af0555b90193aaa0e44fdeb62b4b25e7030fb063a9b03ea0050bd59b0', 'AR-u2-oblique-work-07': 'f181c3f67ce59e43ce133a879675d438e455de6674babd87db85775668f571b5', 'AR-u2-oblique-work-08': 'de5237ca77d6fdd3b9c4e035effc625a93b4eb7bbae5d5aa3c5144b24ae13ef6', 'AR-u2-oblique-work-09': '3bacbea5deb62f41993c3df394137b3fe6cf23379a5b16d7fbaa41ca9dfae82b', 'AR-u2-oblique-work-10': 'ae472a6b8bbe3c86593b13dc5ccfc469523e642e1d488f72d04ade10c0dce3fe', 'AR-u2-oblique-work-11': '78b9a2ae3e35bb9603a323329f5984405415166c46097114412782f6f77e7c8c', 'AR-u2-oblique-work-12': '43dc488691da413670fdae6b236f1a73e96f7e18c965b5344c81f765cffc6f1f', 'AR-u2-oblique-work-13': 'b4c9706f0c2bcea8ab93c38c6b01100e8889d87c440724c74023035953b0a5a2', 'AR-u2-oblique-work-14': '627b13533ba16e44b6b045fbc915b92ec141c3d1a4c6b2439d38cda605cf6629', 'AR-u2-oblique-work-15': '9d8d1f92ef3083e3166d8b6bdf1e47663628c97ae90b8a9593de2d3a4a69f90e', 'AR-u2-oblique-work-16': '149db93e16084a3f492dd8c90972ab0f9b6012aab8345383b4f7061dada299c4'}
READ_SOURCE_SHA256={'u2-oblique-work-01': '7e1657c86327f8e6bd8935e8be41e2a6fd958eff63ee5c6efe1ea34df467b2bd', 'u2-oblique-work-02': '9733021214b5f4afac4e8a5fb7e81b3a94d3128632d7d60c66a77f7a2d23fc82', 'u2-oblique-work-03': 'd54807740b1875d0a694ffa764b1302d52263dc3f55a3198b2f0c372e02f0243', 'u2-oblique-work-04': 'cc8cc54fb026d7bba3b631619fcc5f91003def397267296cc776d1088cda0cb1', 'u2-oblique-work-05': 'e5f97de7cef94760e762679e5f836ae377d265b50db90a5b3fa9affbd48897ff', 'u2-oblique-work-06': '5c82592f8fe1a865435925597ec78c7afc8aa45d9e2063bf01c5a194d8a91a20', 'u2-oblique-work-07': 'baa7ba95c526d60915f9983feedccfa9800dbbc7f6456a719a0c54f8ed49884b', 'u2-oblique-work-08': '5d3e0eaef3150f378a8af2b9256c42d4a967aaab77806268380c4b95c1be3062', 'u2-oblique-work-09': 'fa97ff6eb4ffb535734e885ed8a2a9e682a40f09439be2777e80dc1833489855', 'u2-oblique-work-10': 'c0d4ba0ea5df70d1787ec8eb03567265f27dcd640b4985d51c0186c563a5d4f6', 'u2-oblique-work-11': '56854688e2f8c9a26abe20beff45decbbdbd1681cd9120f1ccde8dacbb1dfa86', 'u2-oblique-work-12': '74cacf3b645aa9297e9d38d9ac84a36b23179c091ec742ac143f9061f1c4f77f', 'u2-oblique-work-13': '45eba5a39dac35d9045ae1fdf0352d87df7f692137a66baa5b9260a8b665e0c9', 'u2-oblique-work-14': '1c62219587f2c897a6c85f7176e641003b34ac910fdcd7fbc78518731819ea8f', 'u2-oblique-work-15': 'c5832b122d98d9b3f8bed7e06dc45ffffc3ddf73bf5d9242733baf13625c0a91', 'u2-oblique-work-16': 'aa1045565d257b083a7e4f88656d46ef27a7d9f54b133f66ff80aa4e451dbe24'}
