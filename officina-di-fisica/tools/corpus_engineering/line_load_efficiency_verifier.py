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
from . import circuit_capacitor_review_models as model
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-03.json'
FAMILY='line-load-efficiency'
EXPECTED_IDS={f'AR-u6-{FAMILY}-{n:02}'for n in range(1,17)}
REVIEWED_SKILLS={1: 'C4-L06', 2: 'C4-L06', 3: 'C4-L06', 4: 'C4-L06', 5: 'C4-L06', 6: 'C4-L06', 7: 'C4-L06', 8: 'C4-L06', 9: 'C4-L06', 10: 'C4-L06', 11: 'C4-L06', 12: 'C4-L06', 13: 'C4-L06', 14: 'C4-L06', 15: 'C4-L06', 16: 'C4-L06'}
def unique(options,want):
    if [i for i,item in enumerate(options) if sp.simplify(item-want)==0]!=[0]:
        raise ValueError('Independent symbolic alternatives not unique as general laws')


@lru_cache(maxsize=1)
def oracle():
    x,y,k1,k2,e=sp.symbols('x y k1 k2 e',positive=True)
    unique([x/(x+y),y/(x+y),x/y,y/x,(x+y)/x],x/(x+y))
    unique([e*y/(1-e),(1-e)*y/e,e*y,y/(1-e),e/y],sp.solve(sp.Eq(e,x/(x+y)),x)[0])
    a=x/(x+y);b=y/(x+y)
    unique([k1/(k1*a+k2*b),k2/(k1*a+k2*b),k1/k2,k1*a+k2*b,k1*k2],sp.cancel((k1*x/(k1*x+k2*y))/(x/(x+y))))
    assert model.load_fraction(3,1)==sp.Rational(3,4)
    assert model.inverse_load(sp.Rational(1,2),2)==2 and model.inverse_cable(sp.Rational(3,4),3)==1
    d=model.primary_only_derivations()[215];out=[d[i]for i in range(1,17)]
    out[1]='1';out[2]='R_L / (R_L + R_c)';out[3]='Da 3/4 a 4/5';out[8]='η R_c / (1 − η)';out[9]='κ₁ / (κ₁ a + κ₂ b)';out[15]='Infinite coppie positive'
    return out

MANUAL=['La corrente è comune nella serie. P_L=I²R_L e P_c=I²R_c; per I≠0 la frazione η=R_L/(R_L+R_c). Con 3 e 1 Ω si ottiene 3/4, compreso strettamente fra zero e uno. Se I=0 la definizione come rapporto di potenze sarebbe 0/0: l’edizione futura deve dichiarare funzionamento con corrente non nulla, oppure definire esplicitamente il rapporto dei coefficienti dissipativi come limite.', 'η è rapporto di potenze e quindi adimensionale: unità 1, eventualmente espresso in percentuale dopo moltiplicazione per cento. Nella primaria le alternative non erano aperte; nella successiva lettura tutte e cinque sono state confrontate individualmente.', 'Dalla somma delle potenze P_tot=I²(R_L+R_c) segue η=R_L/(R_L+R_c) per corrente comune non nulla. Non è un rendimento di conversione dell’intera rete termodinamica: qui utile significa precisamente potenza dissipata nel carico e persa significa quella nei cavi. Con resistenze positive finite, 0<η<1.', 'R_c resta 1 Ω. Passare da R_L=3 a 4 Ω dà η da 3/4 a 4/5: aumenta, ma non di un fattore 4/3 perché cambia anche il denominatore. La corrente può cambiare a seconda del generatore; il rapporto delle potenze conserva questa formula.', 'η(R_L+R_c)=R_L implica (1−η)R_L=ηR_c. Con η=3/4 e R_c=1 Ω, R_L=(3/4)/(1/4) Ω=3 Ω. In generale servono R_c>0 e 0<η<1 per resistenza finita positiva.', 'ηR_c=(1−η)R_L, quindi R_c=R_L(1−η)/η. Con R_L=3 Ω e η=3/4 si ottiene 3·(1/4)/(3/4)=1 Ω. Il denominatore η è strettamente positivo.', 'η_A=3/4 e η_B=3/(3+2)=3/5. Rapporto (3/5)/(3/4)=4/5: l’aumento delle perdite nei cavi diminuisce la frazione utile. Il valore non è il reciproco semplice del rapporto delle resistenze dei cavi.', 'Valore corretto 3/4; proposta 3/2. Scarto proposta−corretto=3/2−3/4=3/4, adimensionale. La proposta stessa supera uno, già incompatibile con due potenze dissipate positive nella definizione assegnata.', 'Da η(R_L+R_c)=R_L si raccolgono i termini in R_L: (1−η)R_L=ηR_c. Si divide per 1−η>0: R_L=ηR_c/(1−η). Unità Ω; η=1 non ammette R_c>0 finita e η=0 non ammette R_L>0.', 'η_B=κ₁R_L/(κ₁R_L+κ₂R_c). Dividendo per η_A=R_L/(R_L+R_c), il rapporto è κ₁(R_L+R_c)/(κ₁R_L+κ₂R_c). Fattori positivi mantengono denominatore positivo; una scalatura comune κ₁=κ₂ lascia η invariata.', 'A: 3/(3+1)=3/4. B: 2/(2+2)=1/2. Rapporto (1/2)/(3/4)=2/3. La potenza utile resta definita sul carico, senza cambiare il significato del rapporto fra le prove.', 'Media delle due uscite: (3/4+1/2)/2=5/8. Ai dati medi R_L=5/2 Ω e R_c=3/2 Ω si ottiene ancora (5/2)/4=5/8 perché in queste due prove il totale R_L+R_c è identico, 4 Ω. È una coincidenza motivata, non una regola generale per questa funzione non lineare.', 'Bersaglio η_B=(2/3)(3/4)=1/2. Con R_L,B=2 Ω, 2/(2+R_c,B)=1/2 dà R_c,B=2 Ω. Dividendo per R_c,A=1 Ω segue il rapporto richiesto 2.', 'Il riferimento ha η=3/4 e lettura 9/4, quindi a_cal=(9/4)/(3/4)=3. La nuova lettura 3/2 restituisce η=1/2. Con R_c=2 Ω, R_L=ηR_c/(1−η)=2 Ω. La lettura strumentale non è direttamente una resistenza.', 'η_A=3/4 e η_B=1/2. Guadagno a_cal=[5/2−2]/[3/4−1/2]=2, offset b_cal=2−2·(1/2)=1. Lettura 13/5 restituisce η_C=(13/5−1)/2=4/5. Con R_c=1 Ω si trova R_L=(4/5)/(1/5) Ω=4 Ω, nel dominio fisico.', 'Il vincolo R_L=3R_c rende η=3R_c/(4R_c)=3/4 per ogni R_c>0 finita. La misura è ridondante e non fissa la scala: infinite coppie positive (R_L,R_c)=(3x,x), x>0. Nessuna ulteriore misura assoluta è stata fornita.']

DISTRACTORS=['Le alternative sono state tutte lette: 1/4 è quota persa; 4/3 supera uno; 3 confronta utile con perdita anziché totale; 1 richiederebbe R_c=0. Solo 3/4 rispetta il modello.', '1 è adimensionale. W, J e Ω rappresentano altre dimensioni; %·W conserva dimensione di potenza, non quella di una quota.', 'R_c/(R_L+R_c) è la perdita; R_L/R_c e R_c/R_L non hanno il totale al denominatore; (R_L+R_c)/R_L è il reciproco della quota e supera uno. Il fattore I² si cancella soltanto con I>0, reso esplicito.', '4/5−3/4=1/20. Le alternative 1,3/5,3/4,1/2 eliminano perdite, conservano il vecchio numeratore, ignorano la modifica o impongono resistenze uguali. Non si inferisce una maggiore potenza utile assoluta senza controllo del generatore.', 'Il valore 3 Ω ricompone la quota 3/4. I controesempi 3/4 Ω e 4/3 Ω danno quote 3/7 e 4/7. Il dominio inverso è aperto 0<η<1.', 'R_c=1 Ω. Il valore errato 3/4 Ω è il prodotto R_L(1−η), privo della divisione per η; 9 Ω dà η=1/4 e zero darebbe η=1, esclusa. Quote sul totale e fra utile/perdita sono distinte.', '4/5 è il rapporto delle due uscite; 5/4 ne è il reciproco, 1/2 considera solo R_c, 2 copia il suo fattore e 1 ignora la variazione.', 'La differenza è +3/4. Le altre scelte invertono il segno, formano il rapporto 2, ripetono 3/2 o accettano lo zero. La proposta non è fisicamente ammissibile anche se lo scarto si può calcolare.', 'Con η=3/4 e R_c=1 Ω, il rapporto invertito darebbe R_L=1/3 Ω e quota1/4; ηR_c dà 3/4 Ω e quota3/7; R_c/(1−η) dà4 Ω e quota4/5. η/R_c ha unità S. Il noto resta R_c nelle formule effettive.', 'La candidata definisce a=R_L/(R_L+R_c), b=R_c/(R_L+R_c). κ₁/(κ₁a+κ₂b) equivale esattamente alla formula della primaria. Il numeratore κ₂ segue i cavi; κ₁/κ₂ omette i pesi; la somma è il solo fattore totale; il prodotto fallisce già con κ₁=κ₂=2.', '2/3 è il rapporto corretto; 3/2 è il reciproco e 1/2 copia η_B. 4/3 inverte la sola quota iniziale 3/4, non il rapporto dei carichi. Uno confonde totale uguale con ripartizione uguale. Finding 11 corretto nel finale aea78b9 e riletto.', 'Media5/8. Le alternative3/4 e1/2 ripetono una prova,5/4 non dimezza,1/8 è metà differenza. Il controesempio(1,1),(3,1) Ω dà media5/8 ma uscita ai dati medi2/3: la coincidenza del caso richiesto dipende dal totale4 Ω.', 'Il bersaglioη_B=1/2 e R_L,B=2 Ω danno R_c,B=2 Ω e rapporto2. Le altre alternative invertono il rapporto, seguono soltanto le quote o lasciano R_c invariata; quest’ultima darebbeη_B=2/3.', 'Guadagno 3, quota decodificata 1/2 e R_L=2 Ω. Sei Ω darebbe D=9/4 anziché 3/2; non è l’omissione del guadagno applicato alla quota. Finding 14 corretto nel finale aea78b9 e riletto.', 'Guadagno2, offset1,η_C=4/5,R_L,C=4 Ω. Omettere offset dà13/10; omettere guadagno dopo sottrazione dà8/5: entrambe quote impossibili. Le controprove R_L=1 e2 Ω ricostruiscono D=2 e7/3.', 'R_L=3R_c elimina la scala dalla quota. Le coppie(3,1) e(6,2) Ω sono esempi di una famiglia continua, non le uniche due. Nessuna e coppie indipendenti contraddicono rispettivamente gli esempi e il vincolo; R_c=0 è esclusa.']

ASSUMPTIONS=['Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.', 'Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.', 'Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.', 'Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.', 'Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.', 'Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.', 'Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.', 'Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.', 'Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.', 'Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.', 'Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.', 'Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.', 'Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.', 'Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.', 'Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.', 'Serie passiva con R_L,R_c finiti positivi e corrente operativa I>0 comune; utile è precisamente I²R_L, perdita I²R_c. Confronti fra preparazioni stazionarie, non obbligo di potenza utile assoluta crescente. Display continuo, guadagno positivo, offset rimosso prima della legge. Inverse con 0<η<1.']

UNITS={1: '', 2: '', 3: '', 4: '', 5: 'ohm', 6: 'ohm', 7: '', 8: '', 9: 'ohm', 10: '', 11: '', 12: '', 13: '', 14: 'ohm', 15: 'ohm', 16: ''}

NUMERIC_UNITS={5: 'Ω', 6: 'Ω', 14: 'Ω', 15: 'Ω'}

SUFFIX={}

NON_NUMERIC_DISTRACTORS={}

SVG_REVIEW='SVG completo e PNG indipendente 640×1470 letti. Serie R_L=3 Ω e R_c=1 Ω, corrente 1 A e generatore 4 V: topologia senza ramo. Barre di potenza 180/60/240 corrispondono a 3/1/4 W, origine 150; barre delle quote 300/200/250 a 3/4,1/2,5/8 con scala distinta. Unica freccia separata, punta visibile e verso dal polo positivo. Simboli resistivi schematici, zeri 118 esterni agli assi.'

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


CANDIDATE_REF='aea78b9bbe3e4218b719049d231b31b54ebbc848'

PRIMARY_SHA256='4c49ff1e2020d073891686e5289e263561531a9b81e84e2f0fa9c8648dc90f4b'

REVIEWED_MODEL_SHA256='f27c33334a9349c8941704334fd73761fe9bf0e4209472ea74ae5bb4a48081b4'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='c0adf6ca14559a267adaa84f45dc16da8439d00f50514928631c170a5cb57fef'

REVIEWED_BINDINGS_SHA256='62525f3c389b0497d31703be39cac636bb5734a53a6449253d1ff6bf9c30f95b'

REVIEWED_CANDIDATES={'AR-u6-line-load-efficiency-01': 'dd376b1d4a0b6159de2fd72bc8d108bd6ac7a00b8ea6a7dbacf99eb3be6d8b0c', 'AR-u6-line-load-efficiency-02': '52ed0afe930645ae5ae1365eec9088b9a3ba5ae6aa38a40f749d88883dcb3e26', 'AR-u6-line-load-efficiency-03': '89dacef9db72fb054ce403e64cbdc950b3ef3b5f71f50bc5e987169ba697790b', 'AR-u6-line-load-efficiency-04': '4be33781438249e6b784c51029e5c21023496c64f1a4cc9782b8015243b8679b', 'AR-u6-line-load-efficiency-05': '1706c91b4b77c33048ef6317d5bb9f11c540e97ca200e543f5af83460d8d8a90', 'AR-u6-line-load-efficiency-06': '11fdf43d270ee76f44b6a065284261856b2a99c200c9ba9f50ffe002d3798162', 'AR-u6-line-load-efficiency-07': 'ed7cb7aae00b71c881f986241dedab2731ffb7e57815cc733bc4cf4f46798865', 'AR-u6-line-load-efficiency-08': 'd559c6fab43ea4bacc4b73288c1eeb525ac16e879d311e4108247c80d6e43cbc', 'AR-u6-line-load-efficiency-09': 'd48892a744435103b31e264d375b668cff70c95e3021a7b70ced44225402f089', 'AR-u6-line-load-efficiency-10': 'ee7c2045ece2ea201a5b4702d7e201d7c61969850f3a9be90d7763904f5dcb54', 'AR-u6-line-load-efficiency-11': '970b8ba0d4e1e657842e764981524a4f032cdc85d0b056cb14d3371b6f33ec50', 'AR-u6-line-load-efficiency-12': '020c015a85a4ff8c54733c892fb0bae1542e39c9a41b7da264f4908710831dc3', 'AR-u6-line-load-efficiency-13': '00611dcfb67a92f93377d2407c99204a023b3c1c417c2917a73655d91e72540e', 'AR-u6-line-load-efficiency-14': '43208815084523bb3bb5cbc5436b17d3c747813e3726529bf2ecf2329528babe', 'AR-u6-line-load-efficiency-15': 'fb00dc99bbfa799286583473bfb62b2db7ce4d88699eda2ac8dcf0a081eb6a45', 'AR-u6-line-load-efficiency-16': 'a10e3e8f50cc8ee27dd4698e03cd3c34fe6f178be1072389615e1f77d1fd99ff'}

READ_SOURCE_SHA256={'u6-line-load-efficiency-01': '3bf25e9cd38347e8070d4004742d05e57007e289b2cbf64b2db1a14d5bcbc665', 'u6-line-load-efficiency-02': '07f7ae4b245924bdfa0169e825028011fa57887258ef12803e2eebd2c78c0b8d', 'u6-line-load-efficiency-03': '8165181f94051e82716e4d9f4a499c83a0038e8cc9ade64e74fae23795732cc4', 'u6-line-load-efficiency-04': '6be52bc3c1ede1aaed4d4ca39078ba37c3627819ab2d6c5394f5745f2dc29cbd', 'u6-line-load-efficiency-05': '16b4c2e1a5b280a70784bec1f89e1d8d135e15da4640e76b00558e13a1f582f2', 'u6-line-load-efficiency-06': '8e84fc51770e94b89817810bb4c7c7481cecaac5cb1616f1c7e33b3b6dbe1ced', 'u6-line-load-efficiency-07': '7b249a59f6e8a9ec11dfbc46db769aa6aed7bce5385394a55ad950d39e0aff3b', 'u6-line-load-efficiency-08': '74557a5ea017679722c2ba90087483968d7559fb9ae05d6cb9ed2fafb1089c4a', 'u6-line-load-efficiency-09': '76773605f2c401b8d47fee421af513ed40c201ebd70099d0236bc7daf3283f05', 'u6-line-load-efficiency-10': '64a08ba9d337566168de862a9bda5457c9a8f155c8968e8a90f5f5d1928ed74c', 'u6-line-load-efficiency-11': '6be14a934f8fa9a05a9c581970970f5be0c84517bd409b3831b53d7fa700580f', 'u6-line-load-efficiency-12': '253fc270572ba2f72f9d3d9c0cd3d89f1887f85f7403e92074461c9c8c56126b', 'u6-line-load-efficiency-13': '1e4f742865339bb3abe453b930d3408ae18cc50378a302c9fea731ff2046ae37', 'u6-line-load-efficiency-14': 'eceaaa6ca5fba351de4dffabac23dba17bfe2e82c1b39cb1b506575bf6fd0b26', 'u6-line-load-efficiency-15': '0b330bbf989af918a1d53e1a08e1a1d962f5d3a4e63a4ea224764cc64f23c0f8', 'u6-line-load-efficiency-16': 'e63bb774219ee8a9a4bc1abfdda2563c5f254371787b309c58c6aa02efc23929'}

SOURCE_READING='Primaria prompt-only di tutti80 originali U6-03 215–219 congelata prima di qualunque candidato; modelli indipendenti preparati ed eseguiti prima delle chiavi. Successivamente letti individualmente tutti16 prompt/opzioni/blocchi/formule/hint/error/metadati del lotto finale, XML e nuovo PNG nativo completo. Rettifiche B rilette prima delle firme. Nessun modulo autore importato; lezioni C4-L03/L04/L07 e C3-L03/L04 reali rilette per i casi autonomi. UI prodotto e human NOT_RUN; confronto ROOT integrato PENDING.'
