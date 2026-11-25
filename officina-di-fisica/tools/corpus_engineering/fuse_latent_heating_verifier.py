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
FAMILY='fuse-latent-heating'
EXPECTED_IDS={f'AR-u6-{FAMILY}-{n:02}'for n in range(1,17)}
REVIEWED_SKILLS={1: 'C4-L06', 2: 'C4-L06', 3: 'C4-L06', 4: 'C4-L06', 5: 'C4-L06', 6: 'C4-L06', 7: 'C4-L06', 8: 'C4-L06', 9: 'C4-L06', 10: 'C4-L06', 11: 'C4-L06', 12: 'C4-L06', 13: 'C4-L06', 14: 'C4-L06', 15: 'C4-L06', 16: 'C4-L06'}
def unique(options,want):
    if [i for i,item in enumerate(options) if sp.simplify(item-want)==0]!=[0]:
        raise ValueError('Independent symbolic alternatives not unique as general laws')


@lru_cache(maxsize=1)
def oracle():
    x,i,k1,k2,L,R,t=sp.symbols('x i k1 k2 L R t',positive=True)
    unique([x/(10*i*i),10*x/(i*i),x*i*i/10,x/(10*i),i*i/(10*x)],x/(10*i*i))
    unique([i*i*R*t/L,L*t/(i*i*R),i*R*t/L,i*i*R/(L*t),L/(i*i*R*t)],sp.solve(sp.Eq(t,x*L/(i*i*R)),x)[0])
    unique([k1/k2**2,k1*k2**2,k1/k2,k2**2/k1,k1**2/k2],k1/k2**2)
    assert model.fuse_time(10,1)==1 and model.fuse_current(1,10)==1 and model.fuse_mass(2,2)==80
    d=model.primary_only_derivations()[216];out=[d[i]for i in range(1,17)]
    out[1]='s';out[2]='t / (1 s) = x / (10 i²)';out[3]='Da 1 s a 2 s';out[8]='m = I² R t / L_f';out[9]='κ₁ / κ₂²'
    return out

MANUAL=['10 mg=1/100 g. Il calore latente richiesto è (1/100 g)(200 J/g)=2 J. La potenza Joule costante è I²R=(1 A)²·2 Ω=2 W. Tempo t=2 J/(2 W)=1 s; non si aggiunge riscaldamento sensibile, perché il filamento parte già alla temperatura di fusione.', 'Il tempo ha dimensione temporale e si esprime in s o in suoi multipli/sottomultipli. Dal bilancio t=energia/potenza segue J/W=s. Nella primaria le alternative non erano aperte; nella successiva lettura tutte e cinque sono state confrontate individualmente.', 'Per una massa numerica m in mg, Q_f=(m/1000 g)(200 J/g)=(m/5) J. La potenza numerica è 2I² W quando I è in A. Quindi t[s]=m[mg]/(10 I[A]²). La legge fisica è t=mL_f/(I²R) con unità coerenti, non una massa in mg trattata come grammi.', 'I resta 1 A e raddoppia soltanto la massa da 10 a 20 mg. Raddoppia il calore latente da 2 a 4 J mentre P=2 W resta fisso; t passa da 1 a 2 s.', 'Il bilancio inverte la legge: m=I²Rt/L_f. Nelle unità assegnate m[mg]=10 I[A]² t[s]. Con I=1 A e t=1 s si ottiene 10 mg. Parametri e tempo sono finiti positivi.', 'I²=mL_f/(Rt). Con m=10 mg, Q_f=2 J, R=2 Ω e t=1 s: I²=1 A². Le radici matematiche sono ±1 A; il ramo dichiarato I>0 seleziona 1 A, modulo della corrente di riscaldamento.', 'A massa fissa t è inversamente proporzionale a I². Da 1 a 2 A la potenza quadruplica e t_B/t_A=1/4. Il nuovo tempo è 1/4 s, non 1/2 s.', 'Tempo corretto 1 s, proposta 2 s: scarto +1 s. La differenza è un tempo; il rapporto 2 sarebbe adimensionale e risponderebbe a un’altra domanda.', 'Da t[s]=m[mg]/(10 I[A]²), moltiplicando per 10 I[A]² segue m[mg]=10 t[s] I[A]². In forma dimensionale m=I²Rt/L_f. La corrente non deve annullarsi nel modello di fusione a tempo finito.', 'Con m_B=κ₁m e I_B=κ₂I: t_B/t_A=κ₁/κ₂², con i fattori positivi e R,L_f invariati. Il fattore della massa è diretto; quello della corrente è inverso e quadratico.', 'A: 10/(10·1²)=1 s. B: 80/(10·2²)=2 s. Il rapporto t_B/t_A è 2: la massa fornisce un fattore otto e la potenza un fattore quattro.', 'Media delle uscite (1+2)/2=3/2 s. Ai dati medi m=45 mg e I=3/2 A, il modello darebbe 45/[10·(9/4)]=2 s, diverso di 1/2 s. Il quesito chiede la prima media e non il modello applicato agli ingressi medi.', 'Il bersaglio è t_B=2 s. Con m_B=80 mg: 2=80/(10 I_B²) ⇒ I_B²=4 A². La radice positiva è I_B=2 A; il rapporto con I_A=1 A vale 2.', 'Riferimento t=1 s e lettura 3 danno a_cal=3 s⁻¹ per display adimensionale. Lettura 6 restituisce t=2 s. Con I=2 A, m[mg]=10·2·4=80. Rimuovere prima la taratura e poi invertire il bilancio.', 'Riferimenti t_A=1 s, t_B=2 s e letture 3,5: a_cal=2 s⁻¹, b_cal=1. Lettura 6/5 restituisce t=(6/5−1)/2 s=1/10 s. Con I=1 A si trova m=10·(1/10) mg=1 mg; il risultato è positivo nonostante la piccola lettura.', 'Il vincolo fra preparazioni è m[mg]=10 I[A], con coefficiente fisico 10 mg/A. Inserendo nel bilancio t[s]=1/I[A]. La misura 1 s seleziona I=1 A e m=10 mg, un’unica coppia positiva. Non è una corrente variabile durante la fusione: ogni prova ha corrente costante.']

DISTRACTORS=['10 mg=1/100 g; energia 2 J e potenza 2 W danno 1 s. Mille s tratterebbe 10 mg come 10 g; 2 s copia il numero dell’energia; 1/2 s dimezza ancora. Le barre energetiche sono nel primo pannello, come ora precisa la didascalia finale 0444dc79 riletta.', 'Solo s rappresenta J/W. Le alternative J,W,A,J/s misurano energia, potenza, corrente, potenza. Prova dimensionale specifica, senza calcolo numerico autonomo.', 'Con x=m/(1 mg), i=I/(1 A), il tempo normalizzato è x/(10i²).10x/i² è cento volte il corretto; xi²/10 inverte l’effetto della potenza; x/(10i) perde il quadrato; i²/(10x) inverte la dipendenza dalla massa. Sono formule generali, non confronti a un valore particolare.', 'Raddoppia solo m: energia2→4 J, potenza2 W invariata, t1→2 s. Le alternative1/2,1,4,20 s invertono, ignorano, quadrano o copiano un dato di massa.', 'La massa è10 mg, non1/100 mg. Dividere2 J per200 J/g produce1/100 g.2 mg copia il numero dei joule;200 mg copia il coefficiente L_f, non una massa ricostruita.', 'I²=1 A² e il ramo positivo dà1 A. Due A darebbe8 W e1/4 s; mezzo A darebbe1/2 W e4 s; zero non trasferisce energia, −1 A è fuori dal dominio dichiarato.', 'Il fattore di corrente2 produce fattore di potenza4 e di tempo1/4. Le altre scelte seguono linearmente I, rendono il tempo diretto a I/P, oppure ignorano il cambiamento.', 'Scarto+1 s. −1 s inverte,2 puro è rapporto,2 s copia la proposta,0 accetta l’errore. Dopo la fusione completa la sola legge di fase non descrive il successivo stato termico.', 'm=I²Rt/L_f ha unità g con L_f in J/g; si converte poi in mg. Un solo I altera le dimensioni; t al denominatore farebbe diminuire la massa all’aumentare della durata a potenza fissata. Non si assegna quel segno quando variano insieme P e t. Il reciproco finale ha g⁻¹. Finding 09 corretto e riletto nel finale 0444dc79.', 'Rapportoκ₁/κ₂². Il prodotto rende il tempo diretto alla potenza; la prima potenzaκ₂ omette il quadrato;κ₂²/κ₁ inverte B/A;κ₁² introduce una massa quadratica assente nel bilancio.', 'Tempi1 e2 s danno rapporto2. Otto segue solo massa, quattro copia la potenza,1/2 è reciproco,1/4 considera solo la corrente. Massa e potenza devono essere confrontate insieme.', 'Media3/2 s; ai dati medi45 mg e3/2 A il tempo è2 s. Le alternative2,3,1/2,1 s rappresentano ingressi medi, somma, semidifferenza o sola prova A. Il tempo medio qui è statistico, non quello di una corrente variabile.', 'Bersaglio2 s con massa80 mg impone rapporto delle correnti2. Quattro copia il quadrato del rapporto,1/2 è reciproco,otto segue massa e√2 ignora il fattore della massa.', 'Guadagno3 s⁻¹, lettura6→t2 s, corrente2 A→8 W e16 J, massa80 mg. Usare D come secondi dà240 mg.20 mg corrisponderebbe a mantenere I=1 A nella ricostruzione della massa; verificato nel modello reale a2 A darebbe1/2 s.8 mg perde un fattore dieci.', 'Guadagno2 s⁻¹ e offset1, quindi tempo1/10 s e massa1 mg. Omettere offset dà6 mg e D11/5; omettere guadagno dà2 mg e D7/5.1/10 mg copia il tempo come massa.', 'Vincolo m=(10 mg/A)I fra prove, non una rampa nel tempo. t/(1 s)=1/i e misura1 s danno unica corrente1 A e massa10 mg. Due,mezzo,dieci A darebbero rispettivamente1/2,2,1/10 s; la misura non è ridondante.']

ASSUMPTIONS=['Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.', 'Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.', 'Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.', 'Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.', 'Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.', 'Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.', 'Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.', 'Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.', 'Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.', 'Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.', 'Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.', 'Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.', 'Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.', 'Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.', 'Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.', 'Filamento già alla temperatura di fusione, pressione fissata, trasformazione completa, L_f=200 J/g e R=2 Ω costanti ideali, I>0 mantenuta costante entro prova, nessuna perdita. Solo calore latente: il modello termina alla fusione completa e non è una legge universale dell’apertura di un fusibile reale. Vincolo del16 soltanto fra preparazioni.']

UNITS={1: 's', 2: '', 3: 's', 4: 's', 5: 'mg', 6: 'A', 7: '', 8: 's', 9: 'mg', 10: '', 11: '', 12: 's', 13: '', 14: 'mg', 15: 'mg', 16: 'A'}

NUMERIC_UNITS={1: 's', 5: 'mg', 6: 'A', 14: 'mg', 15: 'mg'}

SUFFIX={8: ' s', 12: ' s', 16: ' A'}

NON_NUMERIC_DISTRACTORS={8: {'2'}, 16: {'Infinite correnti positive'}}

SVG_REVIEW='SVG completo e PNG indipendente 640×1480 letti. Primo pannello energie 2/16 J e barre 40/320 da origine 150. Secondo E(t): x=150+300t, y=850−100E, segmento fino a (450,650), quindi E=2Wt e fusione completa a 1 s. Ultimo tempi 1/2/3/2 s con barre 160/320/240, origine 150. Scale distinte per grandezze fisiche; zeri e testo terminale liberi, niente prosecuzione oltre fusione.'

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


CANDIDATE_REF='0444dc79935bb8323c532fc03c4376f599253205'

PRIMARY_SHA256='4c49ff1e2020d073891686e5289e263561531a9b81e84e2f0fa9c8648dc90f4b'

REVIEWED_MODEL_SHA256='f27c33334a9349c8941704334fd73761fe9bf0e4209472ea74ae5bb4a48081b4'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='33e39e1aa3c0a0160e8cd17712e55e78428cdec045e69aa0b8a7bbd01387547c'

REVIEWED_BINDINGS_SHA256='3a0c29e4f3594804563ee30e44947649708b0adb1f3376b9b9958efe32ad6ba6'

REVIEWED_CANDIDATES={'AR-u6-fuse-latent-heating-01': '6a83c49be6a730703e9f1a41944fefa18da26a86b6ba2cbe0a0c8070c69dc235', 'AR-u6-fuse-latent-heating-02': '70fb8ed331afafc63583140cd463c61b588579e05ab28dfa12dc75bbbea52574', 'AR-u6-fuse-latent-heating-03': '760a24e755d0e53bb94adeee0ba68cd4643cca51a145b89b5f82dc7593ef38ec', 'AR-u6-fuse-latent-heating-04': '891e907c671b80af49b09cfbb78e93b62a01398eb9e1ab7ef9d20adad4511f88', 'AR-u6-fuse-latent-heating-05': 'e38f924b0de62bc1bc7b79706131997580272adce8afe7778dd2724c2af6fc3b', 'AR-u6-fuse-latent-heating-06': '48bef1bf59f61e4b6a4d3faf94af39dfbacc466fa5ad86e8a746079761551659', 'AR-u6-fuse-latent-heating-07': '8cf7f8c4b2ee8eede87e546512da1a2efedfe228f7b923f9de0a6db6e3fff81b', 'AR-u6-fuse-latent-heating-08': 'e7d33b7f20ae7ea2f6d9bacceba9a4d9d431dfdba05dec0f129c7eeedadb18a4', 'AR-u6-fuse-latent-heating-09': '37ba2d428e31597c5a26ebe8066be0945f2c4d2fc9c7062bad422b25c9d1960f', 'AR-u6-fuse-latent-heating-10': 'f0339becc35d2e577fc77f7c89fc3f71d6ff518f37303204bc361223e07aabaf', 'AR-u6-fuse-latent-heating-11': 'd0b24a0a497833b1590e5c57dcc3f131835b30eae416544cb6337ccbbe718f72', 'AR-u6-fuse-latent-heating-12': '8682cd264526c547b3f438d49e1cceb69d8c24087f100ac2317a30a01b471ffb', 'AR-u6-fuse-latent-heating-13': '9a865d3456500d8a02dc625a9d7088813ccca3bdaeb165f13a7acd7b473ca79f', 'AR-u6-fuse-latent-heating-14': '50874cf24b457a37b92e9099b896964fce992cf0b6d5258b2dd2cb04ac12087b', 'AR-u6-fuse-latent-heating-15': '64130e4e7875af0c3be6627924787415de3fa0c9286b8cfe63e37453916fce1b', 'AR-u6-fuse-latent-heating-16': 'e3b483a828b6a4518346cf1b83ff618f871c2efa9bf6ffa4461e146515222e2a'}

READ_SOURCE_SHA256={'u6-fuse-latent-heating-01': 'c603cf09abef190990d6c98c559a737e42fa11e3c42e800676257ac73647a87b', 'u6-fuse-latent-heating-02': '150c8e0af91fbba3df43a97fa6be3240fcf70e9db7b2f0f5be438824d7a04615', 'u6-fuse-latent-heating-03': '25a952717092f3f7bd74fc78d2b4d167e39cb5c660361ae0085c4d58ec804f3a', 'u6-fuse-latent-heating-04': 'f3acb1ea10f046592e36523a13379895c872e9e4a6fe40edd1018cfb6d12c696', 'u6-fuse-latent-heating-05': '06bd5456304709bcebaa73497b06313d6196d4f171e3b589144585407555174c', 'u6-fuse-latent-heating-06': 'c813624f497d7a36abd5198aadabd0d9f32863eb2b59fc162d27766bff43475f', 'u6-fuse-latent-heating-07': '511a0d71bc43f127d3b12d3ed90e07bb4c868ef8c61ee356c554666825820992', 'u6-fuse-latent-heating-08': '62ae0952df60a6d2c44621830ff877aa606cc946e2fc9ff7703f0f4ce2303fc3', 'u6-fuse-latent-heating-09': 'a3acda17e85873bfce0a027eb5c4f31879f2243643a98560417fffa9f3eee42c', 'u6-fuse-latent-heating-10': '623f7f222b1d17638262bb362c1796be8ed58a0e2e846275ff7f4cf5a0e730a6', 'u6-fuse-latent-heating-11': '7bf1f015277e6223f367d600b975ea9edd55550d19796a7b22200bbbc431c458', 'u6-fuse-latent-heating-12': '8538d66db644d76ce2e82dd3c061e77c1c25a62442900395b083775b2c6f5b68', 'u6-fuse-latent-heating-13': 'f59cdfb1069e48e26da1662df3fe2444ade8c7abb02dd32a50c88c8898fc86e9', 'u6-fuse-latent-heating-14': '64c5c44e2eee3b1dcf150a7d3de02f2426d0c123b1c61e9d8f12e2c9c70548d7', 'u6-fuse-latent-heating-15': '211ce100582a9d8d9bc8813468302bc2e61d3c58022a4a31d1e8bb8ab0e5718f', 'u6-fuse-latent-heating-16': '727cacb9bcf5af8c7bd6cd7616baaf6c6c0b5d23c463a5c12fe2e42de55db479'}

SOURCE_READING='Primaria prompt-only di tutti80 originali U6-03 215–219 congelata prima di qualunque candidato; modelli indipendenti preparati ed eseguiti prima delle chiavi. Successivamente letti individualmente tutti16 prompt/opzioni/blocchi/formule/hint/error/metadati del lotto finale, XML e nuovo PNG nativo completo. Rettifiche B rilette prima delle firme. Nessun modulo autore importato; lezioni C4-L03/L04/L07 e C3-L03/L04 reali rilette per i casi autonomi. UI prodotto e human NOT_RUN; confronto ROOT integrato PENDING.'
