"""Independent individual review, no candidate authoring import."""
from fractions import Fraction
from functools import lru_cache
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from . import electric_exact_literals as codec
from .electric_exact_literals import exact_literal,numeric_lexeme
from . import induction_helix_review_models as model
SI=pint.UnitRegistry(non_int_type=Fraction)
def unique(values,want):
    if [i for i,v in enumerate(values)if sp.simplify(v-want)==0]!=[0]:raise ValueError('Independent symbolic alternatives not unique as general laws')
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-05.json'
FAMILY='induced-transferred-charge'
EXPECTED_IDS={'AR-u6-induced-transferred-charge-01', 'AR-u6-induced-transferred-charge-09', 'AR-u6-induced-transferred-charge-15', 'AR-u6-induced-transferred-charge-13', 'AR-u6-induced-transferred-charge-16', 'AR-u6-induced-transferred-charge-08', 'AR-u6-induced-transferred-charge-07', 'AR-u6-induced-transferred-charge-10', 'AR-u6-induced-transferred-charge-05', 'AR-u6-induced-transferred-charge-04', 'AR-u6-induced-transferred-charge-02', 'AR-u6-induced-transferred-charge-03', 'AR-u6-induced-transferred-charge-11', 'AR-u6-induced-transferred-charge-06', 'AR-u6-induced-transferred-charge-14', 'AR-u6-induced-transferred-charge-12'}
REVIEWED_SKILLS={n:'C4-L10'for n in range(1,17)}

@lru_cache(maxsize=1)
def oracle():
    f,R,Q,t,k1,k2=sp.symbols('f R Q t k1 k2',positive=True)
    unique([f/R,R*f,f/(R*t),R/f,f],f/R)
    unique([Q*R,Q/R,R/Q,Q*R*t,Q],Q*R)
    unique([k1/k2,k1*k2,k2/k1,k1*k1/k2,k1+k2],k1/k2)
    d=model.primary_only_derivations()[238]
    out=[d[n]for n in range(1,17)]
    out[1]='C'
    out[2]='Q = ΔΦ / R'
    out[3]='Da 3 mC a 1/2 mC'
    out[8]='ΔΦ = Q R'
    out[9]='κ₁ / κ₂'
    out[15]='Infinite coppie continue'
    return out

MANUAL=['Fisso una normale: ε=−dΦ/dt e i=ε/R per la spira singola resistiva con R costante, autoinduzione trascurabile. Il flusso è monotono, quindi il modulo della carica complessivamente passata è Q=∫|i|dt=|ΔΦ|/R. Non occorre assumere corrente costante. 6 mWb/2 Ω=3 mC perché Wb/Ω=V·s/Ω=A·s=C.', 'La grandezza richiesta ha dimensione carica, C=A·s=Wb/Ω. Nella primaria le alternative non erano aperte; dopo il congelamento tutte e cinque sono state lette e confrontate individualmente.', 'Integrando i=−(1/R)dΦ/dt si ottiene la carica orientata−ΔΦ/R; la richiesta di modulo con variazione monotona dà Q=|ΔΦ|/R. In numeri Q[mC]=ΔΦ[mWb]/R[Ω]. Senza monotonia, carica netta e totale dei moduli richiederebbero distinzione.', 'A R 2 Ω fissata, ΔΦ passa da 6 a 1 mWb. Q passa da 3 a 1/2 mC, fattore 1/6. La durata può cambiare senza influenzare Q in questo ideale, se stessi flusso netto, monotonia e R.', 'Isolo |ΔΦ|=QR. Con Q 3 mC e R 2 Ω: ΔΦ 6 mWb. C·Ω=V·s=Wb e milli resta milli. Moduli finiti positivi.', 'Isolo R=|ΔΦ|/Q. Sei mWb divisi per 3 mC danno 2 Ω. Q>0 evita un denominatore nullo.', 'A 3 mC. B con R 1 Ω e stessoΔΦ 6 mWb dà 6 mC. Rapporto 2, inverso del fattore 1/2 della resistenza.', 'Proposta 6 mC meno corretto 3 mC=+3 mC. Il rapporto sarebbe 2; il segno dello scarto è fissato dall’ordine richiesto e non dal verso della corrente.', 'Da Q=|ΔΦ|/R si ottiene |ΔΦ|=QR. Si conserva il ramo dei moduli positivi. La formula riguarda la variazione per una sola spira; non si aggiunge N non assegnato.', 'Stati separati con ΔΦ_B=κ₁ΔΦ_A e R_B=κ₂R_A: Q_B/Q_A=κ₁/κ₂. Restano R costante entro ciascun processo e flusso monotono; non si assume una corrente costante nel tempo.', 'A:6/2=3 mC. B:12/3=4 mC. Rapporto 4/3, puro. Il fattore due della variazione di flusso va diviso per 3/2 della resistenza.', 'Media(3+4)/2=7/2 mC. Ai dati medi ΔΦ 9 mWb, R 5/2 Ω si avrebbe 18/5 mC. Media meno risultato ai dati medi=35/10−36/10=−1/10 mC. Tutto si fa con frazioni esatte.', 'Il bersaglio è(4/3)·3=4 mC. Con ΔΦ_B 12 mWb occorre R_B=12/4=3 Ω, dunque R_B/R_A=3/2. La carica trasferita non è la corrente istantanea del nuovo processo.', 'Riferimento Q_A 3 mC con lettura 9: a_cal 3 unità/mC. Lettura 12 indica Q_B 4 mC. Con R_B 3 Ω, ΔΦ_B=Q_BR_B=12 mWb.', 'Riferimenti Q_A 3 mC, Q_B 4 mC e letture 7, 9: guadagno 2 unità/mC e offset 1. Lettura 5 dà Q_C 2 mC. R_C 5 Ω implica ΔΦ_C 10 mWb. L’offset non è una carica fisica residua della spira.', 'Il vincolo numerico ΔΦ=3 R equivale a |ΔΦ|=(3 mWb/Ω)R, ossia coefficiente 3 mC. La legge dà Q 3 mC per ogni R positiva finita: infinite coppie continue. Esempi(3 mWb, 1 Ω), (6 mWb, 2 Ω), misura ridondante e nessuna equazione quadratica.']

DISTRACTORS=['3 mC=6 mWb/2Ω; 12 moltiplicaR, 6 ometteR, 1/2 copia 1/R. Carica di sezione non si accumula come netta della spira.', 'C=A·s=Wb/Ω; A corrente, V tensione, Wb flusso, Ω resistenza.', 'Q=ΔΦ/R integrando. Dividere ancora per Δt dà A; RΔΦ ha dimensioni diverse, R/ΔΦ inversa diC, ΔΦ resta Wb.', '3→1/2 mC: rapporto 1/6.18 inverte, 3/2 dimezza, 3 ignora, 1/6 mC tratta rapporto come carica.', 'QR=3·2=6 mWb.3/2 divideR e darebbe 3/4 mC; 3 copiaQ; 12 darebbe 6 mC.', 'R 6/3=2Ω.1/2 reciproco, 18 prodotto, 6 copiaflusso.', '6/3=2.1/2 segueR diretto, 4 quadra, 6 copia caricaB, 1 ignora.', '+3 mC=6−3.−3 ordine, 2 rapporto, 6 proposta, 0 accettazione.', 'ΔΦ=QR. Q/R non è Wb, R/Q è reciproco diQ/R, QRΔt aggiunge tempo eQ da solo èC.', 'κ₁/κ₂: R è costante nel processo ma può differire fra prove. Prodotto e reciproco alterano legge, quadrato/somma non giustificati.', '4/3 da 4 mC/3 mC.3/4 reciproco, 2 flusso, 2/3 soloR, 1 falsa compensazione.', '7/2 mC: media 3 e 4.18/5 ingressi medi, 7 somma, 1/2 semidifferenza, 4 seconda prova.', 'Bersaglio 4 mC:12/4=3Ω, rapporto 3/2.2/3 reciproco, 4/3 copiaQ, 2 flusso, 1 darebbe 6 mC.', 'g 3(mC)⁻¹, D 12→4 mC, QR 12 mWb.36 salta g, D 36; 4 copiaQ; 6 darebbeD 6.', 'g 2(mC)⁻¹, b 1, D 5→2 mC, QR 10 mWb.25/2 salta b, D 6; 20 salta g; 2 copiaQ.', 'ΔΦ=[3 mWb/Ω]R implicaQ 3 mC per R continua. Esempi(3 mWb, 1Ω), (6 mWb, 2Ω); assenza/unicità/due/tre non seguono.']

ASSUMPTIONS=['Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.', 'Si chiede la dimensione della grandezza nominata, senza valori numerici o modello di moto specifico; i cinque distrattori sono stati letti dopo la primaria.', 'Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.', 'Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.', 'Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.', 'Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.', 'Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.', 'Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.', 'Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.', 'Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.', 'Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.', 'Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.', 'Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.', 'Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.', 'Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.', 'Una sola spira chiusa, resistenza totale positiva costante durante il processo, autoinduzione e capacità trascurabili. Flusso esterno monotono e corrente con verso non invertito. Q è carica passata in una sezione, distinta dalla carica netta della spira e dalla corrente. Non occorre corrente costante.']

UNITS={1: 'millicoulomb', 2: 'millicoulomb', 3: 'millicoulomb', 4: 'millicoulomb', 5: 'milliweber', 6: 'ohm', 7: '', 8: 'millicoulomb', 9: 'milliweber', 10: '', 11: '', 12: 'millicoulomb', 13: '', 14: 'milliweber', 15: 'milliweber', 16: ''}

NUMERIC_UNITS={1: 'mC', 5: 'mWb', 6: 'Ω', 14: 'mWb', 15: 'mWb'}

SUFFIX={8: ' mC', 12: ' mC'}

NON_NUMERIC_DISTRACTORS={8: {'2'}}

SVG_REVIEW='XML e native indipendente completo 640 × 1720 letti. Grafico flusso: origine(130, 550), x=130+180 t[s], y=550−50 Φ[mWb], finali(310, 250)=(1 s, 6 mWb), (490, 250)=(2 s, 6 mWb). A R 2 Ω le correnti sono 3 e 3/2 mA. Rettangoli 120 × 120 e 240 × 60 hanno stessa area 14400 coordinate² e scale comuni 120 coordinate/s e 40 coordinate/mA: entrambi 3 mC. Barre 240/320/280 da 150 rappresentano 3/4/7/2 mC, scala 80 coordinate/mC; sono altre preparazioni dichiarate.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION', 16: 'SYMBOLIC_MANUAL_DERIVATION', 3: 'SYMBOLIC_MANUAL_DERIVATION'}

CANDIDATE_REF='1f9274d1ea3ff4d3ad0a97f7f820311bdf6a05ed'

PRIMARY_SHA256='c0d2d26dd79ece4c7ad2ff06d8ddd142acf02eb468b971b3e254ed06e16528bc'

REVIEWED_MODEL_SHA256='ffcffcf42b8f76159845cb9be8f16cb3529b50c5bb37790b7785ee032ed1b020'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='4175a3879fad95e4a770e328baba305d5bea6533596df3792b5ab82f8291f4f9'

REVIEWED_BINDINGS_SHA256='35b4bc881106827450bbedfafd75b8045d9d4de286b3dcfe87299592b8ff30e7'

REVIEWED_CANDIDATES={'AR-u6-induced-transferred-charge-01': '9f3272e16f1e58dbea5a75a5d6b36aef156ccec79157bb6a63268253cc225ac6', 'AR-u6-induced-transferred-charge-02': 'e458d50d17b56b0b19aaa2e4b01f86525f4163450cda9c77da0dd36a111548a1', 'AR-u6-induced-transferred-charge-03': 'c0bfb003a1ac1945cdccf8d05ee71a4da64c6544c5f76e31aa58c9c83b4af265', 'AR-u6-induced-transferred-charge-04': '4df973b5309e6814a1766845285655dcbd9b3afe6e7f0caf3a0ef6deaa2d6c2b', 'AR-u6-induced-transferred-charge-05': 'b99fc9d82bd698ef545d68b027c8ad9a86a3d406475eeba151e789f17dde6fd6', 'AR-u6-induced-transferred-charge-06': 'e88f57f79278ad808cc08a1cc3dd7ddbbe9dcdf025cffb673d3b1242420822e1', 'AR-u6-induced-transferred-charge-07': '1aa7ec80da865b7880d6b1239798e13ec69c273e6c3902c0fc66476170908cd9', 'AR-u6-induced-transferred-charge-08': 'ff8c5926898156787b2d9aa33bcb1dfecc7823183c4c3d366ddb8eedaf5da94a', 'AR-u6-induced-transferred-charge-09': '90da37a13b793453893eabe25acf5f5665404c04b780a0b7f50bd06b957402fa', 'AR-u6-induced-transferred-charge-10': 'f05a73085400a3262c38c15d6cb136dcda29359ee56b1cea3ae1c02df2bd26bf', 'AR-u6-induced-transferred-charge-11': '8fb64aa878ae170e1806de5e14e71224a8ebc1886e052dcaea047c63e562a8d3', 'AR-u6-induced-transferred-charge-12': 'c285e2fc2055b3ba84c23ccc45b4b0fc75ef12090190aea34d6cf58925489b6d', 'AR-u6-induced-transferred-charge-13': '265e82529c4b0c41aadec17f901239b9c356f47a58e27e22f00d29aa08a70b7d', 'AR-u6-induced-transferred-charge-14': '53d54f371526e3ca2e797bc9f393cabea07762fee576cbdfd1cd120d3c96275b', 'AR-u6-induced-transferred-charge-15': 'c124b24581201dc576f791305160a0aebb825b07768c049ffd9a42b16db032e7', 'AR-u6-induced-transferred-charge-16': '87f837592aa00c83459fae90016a25511bb236b4892a23aee20b20e87e9bc6b3'}

READ_SOURCE_SHA256={'u6-induced-transferred-charge-01': '98f5f5826de109a6a235699deb29d33d2516c9a34dc23d3827ed9e72652779a0', 'u6-induced-transferred-charge-02': '90d5842a200c754153304d1840917841578b9c4dff80fa02a764f73c0451443e', 'u6-induced-transferred-charge-03': '37fb67b980fa3980cd056b07674a95db2d94ab50e614cde22bd9299358a37d5f', 'u6-induced-transferred-charge-04': 'c9352639d81f49ad9af76d06130d4937cd00e719d3dea4184d7f4044ac853228', 'u6-induced-transferred-charge-05': '963b3a107970cfafb656ffa036b097c4eda6cd32d917b34013f04233ee082d7a', 'u6-induced-transferred-charge-06': 'ac5c41a4544ec81ec59e7ec4e9528b936e2a953e74f96841f4d55d86c9bdd4d1', 'u6-induced-transferred-charge-07': 'c8917fadc9b46cd752f673ff797c9350d843cd85a88beb4b669987ff626b4d0f', 'u6-induced-transferred-charge-08': '24f7effdde94c33412dfa225fb4cebf5011ed72658f3fe4e581996fb9b24dd6b', 'u6-induced-transferred-charge-09': 'a090d3150987615f528c1e017f8e472d60da368114172936c64a8d774ad147cf', 'u6-induced-transferred-charge-10': 'db3fb2b81fdeb46ce571bbb40956660b08dc7a27166eaeab12054a531e54dba6', 'u6-induced-transferred-charge-11': '6d579f026ace6e300122804d7d44f16f3b223f12c6f5ebbf64ce6e65aa3ceb62', 'u6-induced-transferred-charge-12': '095fe6796c0c3660fe977c38dbe7630c47c66ca156557aba1ced6556fb5c54e9', 'u6-induced-transferred-charge-13': '7e8a56a956d7a111a2bf71cb70ba8927883c76b4186ac16a3bcd0f24bd0389f2', 'u6-induced-transferred-charge-14': 'b0bffca7c5ef532108324b8d0a950c7ba061076bcac074dfb0a23b24c4974f0a', 'u6-induced-transferred-charge-15': '061b8e58eb8549b56c796fec455176e3f406a462bce9003ff4bcf952671744b0', 'u6-induced-transferred-charge-16': 'a1212e0a2f05bf27bc62e8e8d9ee74863b15f69841557a029ef69b8f3876eb66'}

SOURCE_READING='Tutti gli 80 originali derivati nella primaria c0d2 prima di candidate; modelli indipendenti scritti ed eseguiti sul commit d7389745 prima di aprire qualsiasi candidato B. Successivamente letti integralmente tutti i 16 prompt, opzioni, blocchi, formule, hint, feedback e metadata finali di questa famiglia, più XML e nuovo native completo indipendente. Eventuali fix autore riletti selettivamente prima del congelamento. Nessun modulo autore o primaria B importata/letta; UI prodotto e human NOT_RUN; confronto integrato ROOT PENDING.'

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
          'methods':['SymPy_independent_Faraday_Ohm_Lorentz_and_constitutive_model','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'sourceFirstPrimarySha256':PRIMARY_SHA256,'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}
