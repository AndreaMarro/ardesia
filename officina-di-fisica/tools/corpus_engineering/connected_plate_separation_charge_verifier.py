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
FAMILY='connected-plate-separation-charge'
EXPECTED_IDS={f'AR-u6-{FAMILY}-{n:02}'for n in range(1,17)}
REVIEWED_SKILLS={1: 'C4-L07', 2: 'C4-L07', 3: 'C4-L07', 4: 'C4-L07', 5: 'C4-L07', 6: 'C4-L07', 7: 'C4-L07', 8: 'C4-L07', 9: 'C4-L07', 10: 'C4-L07', 11: 'C4-L07', 12: 'C4-L07', 13: 'C4-L07', 14: 'C4-L07', 15: 'C4-L07', 16: 'C4-L07'}
def unique(options,want):
    if [i for i,item in enumerate(options) if sp.simplify(item-want)==0]!=[0]:
        raise ValueError('Independent symbolic alternatives not unique as general laws')


@lru_cache(maxsize=1)
def oracle():
    Q0,Q,s,C0,Vg,k1,k2=sp.symbols('Q0 Q s C0 Vg k1 k2',positive=True)
    assert sp.cancel(((C0/s)*Vg)/(C0*Vg))==1/s
    unique([Q0/s,s*Q0,Q0,Q0/s**2,s**2*Q0],Q0/s)
    unique([s*Q,Q/s,s/Q,s**2*Q,Q-s],sp.solve(sp.Eq(Q,Q0/s),Q0)[0])
    unique([k1/k2,k1*k2,k2/k1,k1/k2**2,k1+k2],k1/k2)
    assert model.separated_charge(12,2)==6 and model.initial_charge(6,2)==12 and model.charge_separation(12,6)==2
    d=model.primary_only_derivations()[228];out=[d[i]for i in range(1,17)]
    out[1]='C';out[2]='Q = Q₀ / s';out[3]='Da 6 μC a 1/2 μC';out[8]='Q₀ = s Q';out[9]='κ₁ / κ₂';out[15]='Infinite coppie continue nel regime geometrico dichiarato'
    return out

MANUAL=['Con generatore ideale collegato, V resta costante entro ciascun processo. Area e dielettrico invariati danno C=C₀/s, dunque Q=CV=Q₀/s. Per Q₀=12 μC e s=2 si trova Q=6 μC su una sola piastra in modulo. La carica libera può ritornare al generatore: non è l’isolamento delle armature.', 'La carica ha unità coulomb C e qui μC. Il rapporto s=d/d₀ è puro, quindi Q₀/s conserva la dimensione di carica. Non sono ancora state lette le cinque alternative e non si confonde la capacità con la carica. Nella primaria le alternative non erano aperte; nella successiva lettura tutte e cinque sono state confrontate individualmente.', 'Dal modello piano C=εA/d e dalla tensione imposta segue C/C₀=1/s e Q/Q₀=1/s. La formula richiesta è Q=Q₀/s. Un confronto fra preparazioni con Q₀ differente va realizzato con stati iniziali coerenti, ad esempio tensioni iniziali diverse; il generatore mantiene la propria tensione durante ciascuna separazione, non obbliga tutte le preparazioni ad avere lo stesso C₀ e lo stesso V insieme a Q₀ diverso.', 'A s=2, Q₀=12 μC dà Q=6 μC e Q₀=1 μC dà Q=1/2 μC. Il fattore fra le due uscite è 1/12. Il cambio di Q₀ riguarda preparazioni iniziali distinte; non si afferma una variazione arbitraria di carica a C₀ e V simultaneamente fissati.', 'Q=Q₀/s si inverte moltiplicando per s: Q₀=sQ. Con Q=6 μC e s=2 si ricostruisce Q₀=12 μC. Il modulo iniziale deve essere positivo e non minore del finale nel dominio s≥1.', 's=Q₀/Q=12/6=2 è un rapporto puro. Serve Q>0 e Q≤Q₀ per ottenere allontanamento. s=1 è ammesso e significa d=d₀, mentre una misura Q>Q₀ non appartiene a questo processo ideale.', 'A: Q_A=12/2=6 μC. B con s=1: Q_B=12 μC. Rapporto Q_B/Q_A=2. La corrente transitoria di scambio con il generatore non è la grandezza richiesta né implica perdita di carica totale dell’intero circuito.', 'Corretto Q=6 μC e proposta 12 μC: scarto proposto meno corretto=+6 μC. La proposta mantiene impropriamente la carica su una piastra pur mantenendo la tensione durante l’allontanamento.', 'Moltiplico Q=Q₀/s per s finito almeno uno e ricavo Q₀=sQ. Unità μC se Q è in μC. La relazione differisce dal condensatore isolato, nel quale Q₀ sarebbe uguale a Q e sarebbe V a cambiare.', 'La stringa sorgente di s nei pedici va letta s_B=κ₂s_A. Con Q₀,B=κ₁Q₀,A, Q_B/Q_A=[κ₁Q₀,A/(κ₂s_A)]/[Q₀,A/s_A]=κ₁/κ₂. Entrambe le separazioni soddisfano s≥1 e il regime piano; il generatore resta costante entro ogni prova.', 'A: Q_A=12/2=6 μC. B: Q_B=9/3=3 μC. Rapporto 3/6=1/2, puro. Ogni stato iniziale è definito da Q₀ coerente con C₀V della propria preparazione.', 'Media delle uscite (6+3)/2=9/2 μC. Ai dati medi Q₀=21/2 μC e s=5/2, il modello darebbe 21/5 μC. Differenza 9/2−21/5=3/10 μC. Il rapporto fra medie non è in generale la media dei rapporti.', 'Il bersaglio è Q_B=(1/2)·6=3 μC. Con Q₀,B=9 μC serve s_B=9/3=3. Il rapporto cercato s_B/s_A=3/2, nella notazione chiarita anziché nella stringa sorgente ripetuta.', 'Il riferimento Q_A=6 μC e lettura 18 dà a_cal=3 unità/μC. Lettura 9 indica Q_B=3 μC. Con s_B=3 l’inversa dà Q₀,B=9 μC. Una lettura strumentale non è direttamente Q₀.', 'Riferimenti Q_A=6 μC e Q_B=3 μC, letture 13 e 7: a_cal=(13−7)/(6−3)=2 unità/μC e b_cal=1. Lettura 5 dà Q_C=2 μC. Con s_C=4, Q₀,C=8 μC. La sottrazione dell’offset precede la moltiplicazione per s.', 'Interpreto Q₀=6·s=d/d₀ come Q₀=(6 μC)s e s=d/d₀. Allora Q=Q₀/s=6 μC per ogni s≥1 compatibile col regime piano. La misura è ridondante e lascia infinite coppie (Q₀,s)=(6 s μC,s); non fissa una separazione assoluta né autorizza distanze arbitrarie fuori dall’approssimazione.']

DISTRACTORS=['Q=CVg=Q₀/s e Vg fissata durante prova danno 6 μC. 24 inverte s, 12 impone altro isolamento, 3 divide due volte. Carica può tornare al generatore.', 'C è carica. s=d/d₀ puro non introduce metri; F capacità, V tensione, J energia, A corrente distinta dalla carica trasferita in intervallo.', 'Q/Q₀=C/C₀=1/s con Vg fissa. sQ₀ inverte geometria, Q₀ costante è altro circuito, quadrati non derivano da C=εA/d.', 'A 6 e B 1/2 μC: rapporto 1/12. Due moltiplica nuovoQ₀1 per s 2, uno ignora separazione, sei copiaA, dodici ignora nuova preparazione. Non imposto identiciV eC₀ fra prove.', 'Q₀=sQ=12 μC≥Q. Tre ripete divisione, sei ignora geometria, 24 ricostruisceQ 12 non 6.', 's=Q₀/Q=2, puro. Mezzo inverte, seicopia Q, settantadue prodotto invece rapporto. s≥1 e regime piano anche nello stato finale.', 'B s 1 rimaneQ 12, A 6 μC: rapporto 2. Mezzo reciproco, uno ignora, quattro quadra, zero confonde ΔQ nulla con Q nulla.', 'Scarto+6 μC.−6 inverte, due rapporto, 12 proposta, zero sostituisce netta di due piastre alla carica di una.', 'Q₀=sQ ha carica.Q/s è diretta, s/Q carica inversa, s²Q potenzaaggiunta, Q−s differenzia grandezze diverse.', 'κ₁/κ₂ da Q₀/s.Prodotto rende diretto s, inverso scambia ingressi, quadrato aggiunge potenza, somma due sui fattori unitari.', 'Q_A 6, Q_B 3 μC→1/2. Due reciproco, 3/4 solo Q₀, 3/2 solo s, uno presume compensazione.', 'Media 9/2 μC contro 21/5 ai dati medi:scarto 3/10. Nove somma, 3/2 semidifferenza, zero somma algebrica di armature.', 'Bersaglio 3 μC e Q₀B 9 richiedono sB 3: rapporto 3/2; 2/3 reciproco, mezzo copia bersaglio, 3/4 segueQ₀, 2 darebbe 9/4 μC.', 'Guadagno 3 μC⁻¹, D 9→Q 3, s 3→Q₀9 μC. 27 tratta D come Q, 1 divide ancora, 3 copia il finale.', 'Guadagno 2 μC⁻¹, offset 1, D 5→Q 2, s 4→Q₀8 μC. 10 omette l’offset e D 6; 16 omette il guadagno; 2 omette inversa fisica.', 'Q₀=(6 μC)s dà Q 6 μC per ogni s≥1 nel regime geometrico. Misura ridondante; infinite coppie continue, non soltanto intere, non radici discrete.']

ASSUMPTIONS=['Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.', 'Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.', 'Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.', 'Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.', 'Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.', 'Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.', 'Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.', 'Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.', 'Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.', 'Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.', 'Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.', 'Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.', 'Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.', 'Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.', 'Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.', 'Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.']

UNITS={1: 'microcoulomb', 2: 'microcoulomb', 3: '', 4: 'microcoulomb', 5: 'microcoulomb', 6: '', 7: '', 8: 'microcoulomb', 9: 'microcoulomb', 10: '', 11: '', 12: 'microcoulomb', 13: '', 14: 'microcoulomb', 15: 'microcoulomb', 16: ''}

NUMERIC_UNITS={1: 'μC', 5: 'μC', 6: '1', 14: 'μC', 15: 'μC'}

SUFFIX={8: ' μC', 12: ' μC'}

NON_NUMERIC_DISTRACTORS={8: {'2'}}

SVG_REVIEW='XML completo e PNG nativo 640 × 1480 letti: due batterie concordi col segno delle piastre, Vg 2 V per entrambi gli stati del medesimo processo, gap 50→100 eQ 12→6 μC. Barre 240/120/180 per 6/3/9/2 μC, comune 40 coordinate/μC. Grafico soltanto tre punti(1, 12),(2, 6),(3, 4), x=150+100 s, y=1320−20 Q, nessuna interpolazione lineare. Zeri e label liberi, quote schematiche dichiarate.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION', 16: 'SYMBOLIC_MANUAL_DERIVATION'}

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


CANDIDATE_REF='df0e949226d67d210baa01717d958ee33a636f7c'

PRIMARY_SHA256='1884c8105aca5fd3c3f97999c64257e04c67490b7238cb2910764ad2a830684a'

REVIEWED_MODEL_SHA256='42da25a28a0f45351c833e9c583afeed5f0c615326404dc6ce4e2af1f8df61e9'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='ed42479b65ac424be4edc1243a863ba3127204d34c93c8402485a0fbc09d463b'

REVIEWED_BINDINGS_SHA256='86db1b9802836c2779bd294e924943ea8f76e8d0b0a387e3adafba9644760cff'

REVIEWED_CANDIDATES={'AR-u6-connected-plate-separation-charge-01': 'c7f6b8ecd197e18a072fe5870b249ec746a82f4a514b51b3cb066f8f238807cd', 'AR-u6-connected-plate-separation-charge-02': 'cc0612f20038897e5838b1f63b56f578a2924a41503c9b7ac656d8fb1dd8cbef', 'AR-u6-connected-plate-separation-charge-03': 'b72aab2e4ab408677602d7d42dba7a26192832607a4dd6922f08855b65076c45', 'AR-u6-connected-plate-separation-charge-04': '0c3d616839b4be93cb934a0079f0347be0b3ac58a5a11ff454034011640615e3', 'AR-u6-connected-plate-separation-charge-05': '242e8a0dac2c3620dba892dca7ff3e8921dd6825c939c583bb8f9a603985559f', 'AR-u6-connected-plate-separation-charge-06': '29a923be49b87a501e29a5d4cccd4ccb6333cdff2cc953195577ee22aae0ad58', 'AR-u6-connected-plate-separation-charge-07': 'e1848078a5dc7f1eb5069e431d5eb56ac4c8916be8bcca941bd785b6b7d0c6df', 'AR-u6-connected-plate-separation-charge-08': '9c98821a4c2d743bd71393e7f67f84ea1163d6d6da1f969a152475b364f81be7', 'AR-u6-connected-plate-separation-charge-09': '58dafbe3fa2756704fce48559e270b470fadcbeb232a371ce07512e398fdf651', 'AR-u6-connected-plate-separation-charge-10': 'aa02a637d4896476410343ef30e32dcf023f037bc81d6fcf173a121885bb7edd', 'AR-u6-connected-plate-separation-charge-11': 'e77c45cdb10ce9d5cbf13ced5d642183c37407f5c8ad2db58801b93052997377', 'AR-u6-connected-plate-separation-charge-12': '08acfd01bfb6c357b36acf735555cc9c16c7d3a1d715cfafb312cbca722bacf6', 'AR-u6-connected-plate-separation-charge-13': '6bcbafb1010d40936c9f5427dd39212cd6d5e2fd98400be5d9cfda9d0c46f911', 'AR-u6-connected-plate-separation-charge-14': '2c98cfc482bed0464b0a38cdf91f7e4fd6bb7a6861b0606820f9a6e31646e15d', 'AR-u6-connected-plate-separation-charge-15': 'a31c5c40ea659b7ec571529fea8aa7c91b29ff7f204fd60c17e980742e4193fb', 'AR-u6-connected-plate-separation-charge-16': '668df22a91c510395b02ce26e417f524e6fe08f4bc1eac08a13138b77ab7a4d7'}

READ_SOURCE_SHA256={'u6-connected-plate-separation-charge-01': '5425aecae9f0b69ac8da92b246a1dbf090dd56dca74a6bc286bde05a5f7654f8', 'u6-connected-plate-separation-charge-02': '2b22a31f865ddeeb00d0f11f8ee6b3eb23f750eefb1c77e19b4373377e4b4d39', 'u6-connected-plate-separation-charge-03': '22f119bae967bd2220b85be7f547d1068c45c9450a57302131c8a56ca8bac4d7', 'u6-connected-plate-separation-charge-04': 'aab22aee16b14be6d8250bd8374d70946ec23f0dc5bcb1284fe05e7d94d80419', 'u6-connected-plate-separation-charge-05': '0337075cded3f7f50ff9e60cc3b9fcb27fa3801f69fcdaa70566ac15ad506bd9', 'u6-connected-plate-separation-charge-06': '6e33b7026a1247ccc897fa6b180fd76820b3d2e00561ae2b0d2081aea916055b', 'u6-connected-plate-separation-charge-07': '150b541b847c2de93cabc96c11f9797b52bb1c638137de754b0ffe5cd33c106d', 'u6-connected-plate-separation-charge-08': '616533d923f5d429394baa1c0a074ebee113a10d259eb206a3a26886219d00f6', 'u6-connected-plate-separation-charge-09': 'a30718ec7c0d6e570c86c049bf721cfaad86736d9d0a5f3c9369e9a29640c605', 'u6-connected-plate-separation-charge-10': 'c06432c3729f383a1e4aa75e3285a493989fce7c75c3358250d9612b0b6c5d8a', 'u6-connected-plate-separation-charge-11': '46b8596ca9ba1e52891d8d2d69a6e3e92bc3cf95c1de195134554219e66921fa', 'u6-connected-plate-separation-charge-12': '8d286ad10b351bbb1bab162bd4b795a3c652ceb341b235d487221386393b0ae4', 'u6-connected-plate-separation-charge-13': 'a1fdd7712d5acedc65697dc3088983d90db2b5f541e6eaf32526e64b90b2e1d5', 'u6-connected-plate-separation-charge-14': '4b461ea449f21ae6f69cb13d599cf080dcdb2bbb688b9c641738274835ec8225', 'u6-connected-plate-separation-charge-15': 'e982e87300d3b3aadeb789171579bc1bfd27e0582d8b9b553371d5075023fc71', 'u6-connected-plate-separation-charge-16': '8d43ab085d68b7d865b97dc6d2796e73fec5cf499b2d9159e3a1a4df8ed3ae97'}

SOURCE_READING='Primaria prompt-only di tutti80 originali U6-04 B225–229 congelata prima di qualunque candidato. Successiva lettura allowlist di tutti80 prompt finali, poi modelli indipendenti scritti ed eseguiti realmente prima delle chiavi. Solo dopo sono stati letti individualmente tutti16 record finali completi, opzioni, formule, hint, feedback, metadata, XML e nuovo PNG nativo integrale. Nessuna esposizione anticipata a chiavi, nessun modulo autore importato o primaria B aperta. UI prodotto e human NOT_RUN; confronto integrato ROOT PENDING.'
