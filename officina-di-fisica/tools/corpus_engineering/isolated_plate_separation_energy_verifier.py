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
from . import dielectric_lorentz_review_models as model
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-04.json'
FAMILY='isolated-plate-separation-energy'
EXPECTED_IDS={f'AR-u6-{FAMILY}-{n:02}'for n in range(1,17)}
REVIEWED_SKILLS={1: 'C4-L07', 2: 'C4-L07', 3: 'C4-L07', 4: 'C4-L07', 5: 'C4-L07', 6: 'C4-L07', 7: 'C4-L07', 8: 'C4-L07', 9: 'C4-L07', 10: 'C4-L07', 11: 'C4-L07', 12: 'C4-L07', 13: 'C4-L07', 14: 'C4-L07', 15: 'C4-L07', 16: 'C4-L07'}
def unique(options,want):
    if [i for i,item in enumerate(options) if sp.simplify(item-want)==0]!=[0]:
        raise ValueError('Independent symbolic alternatives not unique as general laws')


@lru_cache(maxsize=1)
def oracle():
    U0,U,s,Q,C0,k1,k2=sp.symbols('U0 U s Q C0 k1 k2',positive=True)
    assert sp.cancel((Q**2/(2*(C0/s)))/(Q**2/(2*C0)))==s
    unique([s*U0,U0/s,s**2*U0,U0,U0/s**2],s*U0)
    unique([U/s,s*U,s/U,U/s**2,U-s],sp.solve(sp.Eq(U,s*U0),U0)[0])
    unique([k1*k2,k1/k2,k2/k1,k1*k2**2,k1+k2],k1*k2)
    assert model.isolated_energy(2,2)==4 and model.initial_energy(4,2)==2 and model.energy_separation(4,2)==2
    d=model.primary_only_derivations()[227];out=[d[i]for i in range(1,17)]
    out[1]='J';out[2]='U = s U₀';out[3]='Da 4 μJ a 8 μJ';out[8]='U₀ = U / s';out[9]='κ₁ κ₂'
    return out

MANUAL=['Area e dielettrico invariati danno C=εA/d=C₀/s. L’isolamento mantiene Q costante su ciascuna armatura; U=Q²/(2 C)=sU₀. Con U₀=2 μJ e s=2 si ottiene U=4 μJ. L’energia del campo aumenta per il lavoro esternonecessario a separare piastre attrattive, nel limite quasi statico senza perdite; non è un’energia conservata del solo campo.', 'L’energia ha unità joule J, qui μJ. Il fattore s=d/d₀ è puro; moltiplicare U₀ per s conserva la dimensione energetica. Nella primaria le alternative non erano aperte; nella successiva lettura tutte e cinque sono state confrontate individualmente.', 'Da C/C₀=d₀/d=1/s e Q costante segue U/U₀=C₀/C=s. La legge richiesta è U=sU₀, non U₀/s e non s²U₀. Bisogna conservare il modello piano con separazione ancora piccola rispetto alle dimensioni laterali, anche nello stato finale.', 'A s=2 fissato, U₀ passa da 2 a 4 μJ. Le uscite passano da 4 a 8 μJ, rapporto due. I preparati hanno energie iniziali diverse, ciascuno poi segue il proprio processo isolato; non si impone stessa Q fra preparati se cambia U₀ a C₀ fissata.', 'L’inversa è U₀=U/s. Con U=4 μJ e s=2 si trova U₀=2 μJ. Il denominatore è almeno uno, finito, e l’energia iniziale resta positiva. U≥U₀ nel dominio dell’allontanamento.', 'Da U=sU₀ segue s=U/U₀=4/2=2, adimensionale. Serve U₀>0 e deve risultare s≥1; una misura U<U₀ sarebbe incompatibile con allontanamento a carica costante nelle ipotesi dichiarate.', 'A con s=2 ha U_A=4 μJ. B con s=1 ha U_B=2 μJ. Rapporto 1/2. Il confine s=1 significa nessun allontanamento e non una distanza nulla: d=d₀>0.', 'Corretto U=4 μJ; proposta 8 μJ. Scarto proposto meno corretto=+4 μJ. Otto deriverebbe da U₀s² in questa sostituzione; il modello a Q fissata è invece lineare in s.', 'Si isola U₀ dalla relazione U=sU₀ dividendo per s≥1: U₀=U/s, con unità di energia. Non si deve usare CV²/2 mantenendo contemporaneamente V fisso: in questo processo V aumenta perché Q è isolata e C diminuisce.', 'La notazione sorgente ripete malamente s=d/d₀ nei pedici; interpreto esplicitamente s_A=d_A/d₀,A e s_B=κ₂s_A. Con U₀,B=κ₁U₀,A, le uscite sono U_A=s_AU₀,A e U_B=κ₁κ₂s_AU₀,A, quindi rapporto κ₁κ₂. Entrambi s_A e s_B devono essere almeno uno e mantenere il regime piano; i fattori singoli non devono essere interi.', 'A: U_A=2·2=4 μJ. B: U_B=3·3=9 μJ. Rapporto 9/4, puro. Il fattore 3/2 dell’energia iniziale e quello 3/2 della separazione si moltiplicano.', 'Media delle due uscite=(4+9)/2=13/2 μJ. Ai dati medi U₀=5/2 μJ e s=5/2, il prodotto sarebbe 25/4 μJ. Differenza 13/2−25/4=1/4 μJ. Sono medie statistiche di stati, non un singolo processo con ingresso variabile.', 'Il rapporto richiesto del fattore di separazione va scritto s_B/s_A nonostante la stringa sorgente ripetuta. Bersaglio U_B=(9/4)·4=9 μJ, U₀,B=3 μJ: s_B=3. Dividendo per s_A=2 segue s_B/s_A=3/2, entrambi ≥1.', 'Riferimento U_A=4 μJ, lettura 12: guadagno 3 unità/μJ. Lettura 27 indica U_B=9 μJ. Con s_B=3, U₀,B=9/3=3 μJ. Il display misura l’energia finale prima dell’inversione.', 'Le uscite dei riferimenti sono 4 e 9 μJ e le letture 9 e 19. Guadagno a_cal=(19−9)/(9−4)=2 unità/μJ, offset 1. Lettura 17 dà U_C=(17−1)/2=8 μJ; s_C=2 implica U₀,C=4 μJ.', 'Leggo il vincolo sorgente U₀=1·s=d/d₀ come U₀=(1 μJ)s, con s=d/d₀, evitando l’uguaglianza fra energia e numero puro. Inserendo in U=sU₀ segue U[μJ]=s². Misura 4 μJ richiede s²=4: solo s=2 è ≥1, con U₀=2 μJ. La geometria finale deve restare nel regime piano.']

DISTRACTORS=['C=C₀/s e Q costante: U=Q²/(2 C)=sU₀=4 μJ. Uno usa erroneamente V fisso, due conserva U campo, otto usa s². Apporto meccanico possibile distinto dall’isolamento elettrico.', 'J è energia. C²/F=C·V=J; W è potenza, V tensione, C carica, F capacità. Fattore due puro.', 'Q resta costante e U/U₀=C₀/C=s. U₀/s vale con V mantenuta e altro circuito; quadrati non derivano da C∝1/s; Ucostante omette apporto esterno meccanico.', 'A 4, B 8 μJ per s 2 e U₀2, 4 μJ. Due divide invece di moltiplicare, quattro ignora preparazione, sedici aggiunge fattore non previsto. Q fisso entro prova non significa stessoQ fra prove.', 'U₀=4/2=2 μJ. Otto usa sU, quattro ignora s, mezzo darebbe U 1 μJ. U₀≤U nel dominio s≥1.', 's=4/2=2 e d 2 d₀. Mezzo è avvicinamento escluso, otto prodotto, quattro copia numero di U finale.', 's_B 1 conserva U₀2 μJ; A 4 μJ: rapporto 1/2. Due reciproco, uno ignora s, 1/4 quadrato, zero confonde ΔU 0 con U 0.', 'Proposta 8 meno 4=+4 μJ; ΔU rispetto allo stato iniziale è invece 2 μJ. −4 inverte, due puro è rapporto, otto copia proposta, zero non verifica.', 'U₀=U/s ha energia e 0<U₀≤U. sU è diretta, s/U energia inversa, U−s dimensioni incompatibili, U/s² aggiunge potenza.', 'κ₁κ₂:prodotto delle due variazioni. Quozienti invertono diretta, κ₂² aggiunge potenza, somma fallisce sui fattori unitari. Entrambe le geometrie restano piastre grandi.', 'U_A 4, U_B 9 μJ→9/4; 4/9 reciproco, 3/2 solo ingresso, 9/2 divide per U₀A invece diUA, uno ignora variazione.', 'Media 13/2 μJ distinta da 25/4 ai dati medi, scarto 1/4.13 somma, 5/2 semidifferenza, zero non è media di energie positive.', 'Bersaglio 9 μJ e U₀B 3 μJ danno sB 3, rapporto 3/2; 2/3 reciproco, 9/4 copia rapporto energetico, 2 darebbe UB 12 μJ; 3/4 non raggiunge bersaglio.', 'Guadagno 3 μJ⁻¹, D 27→U 9 μJ, s 3→U₀3 μJ. Nove omette divisione fisica, 27 copiaD e omette entrambe, uno predice D 9.', 'Guadagno 2 μJ⁻¹, offset 1, D 17→U 8 μJ, s 2→U₀4 μJ. 17/4 omette l’offset e D 18; otto copiaUfinale; 16 prediceUC 32 e D 65.', 'U₀=(1 μJ)s porta U/(1 μJ)=s²=4, ramo s 2.−2 distanza negativa, 4 omette radice, mezzo avvicina e non soddisfa misura; nessuna ridondanza.']

ASSUMPTIONS=['Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.', 'Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.', 'Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.', 'Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.', 'Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.', 'Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.', 'Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.', 'Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.', 'Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.', 'Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.', 'Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.', 'Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.', 'Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.', 'Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.', 'Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.', 'Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.']

UNITS={1: 'microjoule', 2: 'microjoule', 3: '', 4: 'microjoule', 5: 'microjoule', 6: '', 7: '', 8: 'microjoule', 9: 'microjoule', 10: '', 11: '', 12: 'microjoule', 13: '', 14: 'microjoule', 15: 'microjoule', 16: ''}

NUMERIC_UNITS={1: 'μJ', 5: 'μJ', 6: '1', 14: 'μJ', 15: 'μJ'}

SUFFIX={8: ' μJ', 12: ' μJ'}

NON_NUMERIC_DISTRACTORS={8: {'2'}, 16: {'Infinite separazioni'}}

SVG_REVIEW='XML completo e PNG nativo 640 × 1480 letti: distanze fra facce interne 50 e 100 coordinate, d₀→2 d₀, area/carica invariate e U 2→4 μJ. Barre 128/288/208 per 4/9/13/2 μJ, comune 32 coordinate/μJ. Grafico a U₀2: x=150+100 s, y=1300−20 U, segmento s 1..3 da(250, 1260) a(450, 1180), punto iniziale chiuso. Nessuna falsa retta per s<1.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle(); common=[]
    if sha(Path(codec.__file__).read_bytes())!=REVIEWED_LITERAL_CODEC_SHA256:common.append('Independent exact literal codec dependency changed')
    if sha(Path(model.__file__).read_bytes())!=REVIEWED_MODEL_SHA256:common.append('Independent physical model dependency changed')
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
          'reviewDependencySha256':{Path(codec.__file__).name:sha(Path(codec.__file__).read_bytes()),Path(model.__file__).name:sha(Path(model.__file__).read_bytes())},
          'methods':['SymPy_independent_conservation_and_constitutive_model','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'sourceFirstPrimarySha256':PRIMARY_SHA256,'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}


CANDIDATE_REF='b455db658158695f249e6baf7949687d5ae7453f'

PRIMARY_SHA256='1884c8105aca5fd3c3f97999c64257e04c67490b7238cb2910764ad2a830684a'

REVIEWED_MODEL_SHA256='42da25a28a0f45351c833e9c583afeed5f0c615326404dc6ce4e2af1f8df61e9'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='8dfd9487293f89d073cc1f122ae1baf6acb98e19ffea8b6f93436a273fd96aca'

REVIEWED_BINDINGS_SHA256='44e5c1b4ec220abc392c97a13465ca02debf6b1ee29bdd52b6cc873a9463b80b'

REVIEWED_CANDIDATES={'AR-u6-isolated-plate-separation-energy-01': 'ae1583c46428cfaf4a8b5b79bc251466dbf909ff341887fe8a1645281d5e8eec', 'AR-u6-isolated-plate-separation-energy-02': '623f1c22d449df83ef6ae8137296f197e6e2a0c4111792251b352875fc74c81e', 'AR-u6-isolated-plate-separation-energy-03': '54b9d7dc3d5aaf4f08627f82efaa73d329dd627c04d81140733f522d54633ff1', 'AR-u6-isolated-plate-separation-energy-04': '68295f33aa680c3d51432185ddd36012f2626268468e3c7c38629da910a1224b', 'AR-u6-isolated-plate-separation-energy-05': '0d8ed4e5cf5d13e23f969f6249ce3dd97373e4df3c4671ab50a275b1644d32e4', 'AR-u6-isolated-plate-separation-energy-06': 'da059ae325bd5366a57d14c2651525b5b1bd538104dbd420a7c0eb963b2d2825', 'AR-u6-isolated-plate-separation-energy-07': 'c95aab06b588ff4299720d72a9d453350110b8921f63e9fcc248d3ebd86c3184', 'AR-u6-isolated-plate-separation-energy-08': '9a8864d88e81abf3b30ba532dd6b6906be267aeb8eb239f52cd3414a7c3f0113', 'AR-u6-isolated-plate-separation-energy-09': 'f950831d7004e7b41bb72fb6dacb69d05c587a43d3dbe2c884a5ba7586ebee58', 'AR-u6-isolated-plate-separation-energy-10': '7ca24df1fe7a949948c9ad9b14b8ba7a7255f80e8d7664efcf19f2712fd940da', 'AR-u6-isolated-plate-separation-energy-11': '3d6d867bb4a9dccb175100b27961a943ebe2bb304897c1181f2184c6759401ee', 'AR-u6-isolated-plate-separation-energy-12': '37d82e71447c366828eeacf89fe24eea3b385788bdb4a7d32145cab36f1dda50', 'AR-u6-isolated-plate-separation-energy-13': 'c36f23460c87925732d5adc4a06e8c9008a1cc497818fcf89da8718f7f56245b', 'AR-u6-isolated-plate-separation-energy-14': 'e09f91fe3457e46d5ea00686a75caf14c659f5b5d8d4b5a7279d9963653e8e30', 'AR-u6-isolated-plate-separation-energy-15': '457877a0d0f9c3254407aa5d6f75605f8cfac25cc19f785129934088af43b635', 'AR-u6-isolated-plate-separation-energy-16': '8654a4c1f787adebcb3263deffe6b67124e4ac5c3c2d88f2d6af0075ab2ffb47'}

READ_SOURCE_SHA256={'u6-isolated-plate-separation-energy-01': '5b35fffa2497b984024f76ce9672a1a92e46b4cdaac772ab920a8489a6b32e10', 'u6-isolated-plate-separation-energy-02': '90d81a24a320bb70f2950c2f03a9b2dbea5802406d0d613182ab8ee8fe8eafdf', 'u6-isolated-plate-separation-energy-03': '9343fa3f339eb0d80b1fcda97c56aff9d4ce4eff50ff8c0bb9c325a3b27db6ac', 'u6-isolated-plate-separation-energy-04': '718a77d774f70f1d63876ce66cc8d32e85a084f61cf7b0eb05e1773cdf55d984', 'u6-isolated-plate-separation-energy-05': 'b287f3a3dcb905335f547b0f96685e7bc3d1761ef64f6a40fe7eb66f0fff3206', 'u6-isolated-plate-separation-energy-06': '2710f8365ed244411c17152491cfbdb4b2c44b945ced10eb019553c0cc687c1a', 'u6-isolated-plate-separation-energy-07': '0fcb9cee272c7a0103403529dd90e19e1e45926a2857458936695fce595b124f', 'u6-isolated-plate-separation-energy-08': 'cf510b704f29a910109979168f5e1e97de54f32c0729eafa93d3485b568e2b9d', 'u6-isolated-plate-separation-energy-09': 'e72d26b92a70c0f56e4534c502c77f46cfabff844b43e68b45af3240672fba7d', 'u6-isolated-plate-separation-energy-10': '06b43dfa24c69c97047de97d729fc1838c215fd45120d202e0fd27d283d3d150', 'u6-isolated-plate-separation-energy-11': 'a21f13cd0dd7fa5e3dcdf608d123f26034075475b674a8b6183a09210d165017', 'u6-isolated-plate-separation-energy-12': '4972ac4ea7d49f0cde7116238b1b4a198caed8c55ec2fd5056b29a9fcc86a3fb', 'u6-isolated-plate-separation-energy-13': '12859a8cb9aa03355a54945173bf947a42ec858b1c7786396ea142b57a0a4819', 'u6-isolated-plate-separation-energy-14': 'fa3c398c2a83f77436797281ffab81267186753117d1f72ceb9ec3da5b36814c', 'u6-isolated-plate-separation-energy-15': 'e3fe29bd394b2b348d734186edf8610ac9fe213dad844f9cb1acf8bc8a55e3fe', 'u6-isolated-plate-separation-energy-16': '4f2699efb9954930a1829faed8abefaed1dd9d0d468f1371d2079a03c7c868c3'}

SOURCE_READING='Primaria prompt-only di tutti80 originali U6-04 B225–229 congelata prima di qualunque candidato. Successiva lettura allowlist di tutti80 prompt finali, poi modelli indipendenti scritti ed eseguiti realmente prima delle chiavi. Solo dopo sono stati letti individualmente tutti16 record finali completi, opzioni, formule, hint, feedback, metadata, XML e nuovo PNG nativo integrale. Nessuna esposizione anticipata a chiavi, nessun modulo autore importato o primaria B aperta. UI prodotto e human NOT_RUN; confronto integrato ROOT PENDING.'
