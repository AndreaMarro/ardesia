"""Distinct individual reviewer; no authoring import and no human approval."""
from fractions import Fraction
from functools import lru_cache
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from . import electric_exact_literals as codec
from .electric_exact_literals import exact_literal,numeric_lexeme
from . import nuclei_optics_review_models as model
SI=pint.UnitRegistry(non_int_type=Fraction)
def unique(values,want):
    if [i for i,v in enumerate(values)if sp.simplify(v-want)==0]!=[0]:raise ValueError('Independent general symbolic laws not unique')
def decode_numeric(raw):
    return exact_literal(raw)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U7-02.json'
FAMILY='gamma-transition-energy'
EXPECTED_IDS={'AR-u7-gamma-transition-energy-01', 'AR-u7-gamma-transition-energy-06', 'AR-u7-gamma-transition-energy-12', 'AR-u7-gamma-transition-energy-03', 'AR-u7-gamma-transition-energy-14', 'AR-u7-gamma-transition-energy-16', 'AR-u7-gamma-transition-energy-09', 'AR-u7-gamma-transition-energy-04', 'AR-u7-gamma-transition-energy-08', 'AR-u7-gamma-transition-energy-10', 'AR-u7-gamma-transition-energy-07', 'AR-u7-gamma-transition-energy-11', 'AR-u7-gamma-transition-energy-13', 'AR-u7-gamma-transition-energy-05', 'AR-u7-gamma-transition-energy-15', 'AR-u7-gamma-transition-energy-02'}
REVIEWED_SKILLS={1: 'C5-L08', 2: 'C5-L08', 3: 'C5-L08', 4: 'C5-L08', 5: 'C5-L08', 6: 'C5-L08', 7: 'C5-L08', 8: 'C5-L08', 9: 'C5-L08', 10: 'C5-L08', 11: 'C5-L08', 12: 'C5-L08', 13: 'C5-L08', 14: 'C5-L08', 15: 'C5-L08', 16: 'C5-L08'}

@lru_cache(maxsize=1)
def oracle():
    a,b,e,k1,k2=sp.symbols('a b e k1 k2',positive=True)
    unique([e+b,e-b,b-e,e*b,e/b],e+b)
    unique([(k1*a-k2*b)/(a-b),k1/k2,k1*k2,(k1*a+k2*b)/(a-b),k1-k2],(k1*a-k2*b)/(a-b))
    d=model.primary_only_derivations()[256]
    out=[d[n]for n in range(1,17)]
    out[1]='keV'
    out[2]='A e Z restano invariati; diminuisce l’energia di eccitazione'
    out[3]='Da 80 a 100 keV'
    out[8]='E_i = E_γ + E_f'
    out[9]='(κ₁ E_i − κ₂ E_f) / (E_i − E_f)'
    return out

MANUAL=['Trascurando rinculo e altri canali, conservazione dell’energia: E_γ=E_i−E_f. I livelli hanno lo stesso riferimento. Con100 e20 keV, E_γ80 keV, positiva. Con rinculo reale il fotone avrebbe energia lievemente minore della differenza, ma quel contributo è esplicitamente escluso dal modello.', 'keV è energia; keV/Hz richiede la costante di Planck dimensionata. La primaria precedeva tutte le alternative; dopo la freeze tutti e cinque i distrattori/proposte sono stati letti singolarmente.', 'Una semplice de-eccitazione gamma cambia il livello energetico del medesimo nucleo, non il numero di protoni o nucleoni: A e Z invariati. Non è un decadimento alfa o beta, né la cattura o espulsione di un nucleone.', 'A:100−20=80 keV. B:120−20=100 keV. L’aumento iniziale20 keV produce lo stesso aumento dell’energia del fotone, mentre il rapporto delle uscite è5/4, non120/100.', 'Isolo E_i=E_γ+E_f. Con80 e20 keV segue100 keV. La somma recupera un livello iniziale maggiore del finale.', 'Isolo E_f=E_i−E_γ=100−80=20 keV. Per il ramo richiesto E_f>0 occorre E_i>E_γ>0; si mantiene un riferimento energetico comune.', 'A:80 keV. B:100−40=60 keV. Rapporto60/80=3/4. Aumentare E_f avvicina i livelli e riduce l’energia emessa.', 'Proposto160 keV meno corretto80 keV dà+80 keV. Il fattore2 non è lo scarto e non mantiene l’unità energetica.', 'Da E_γ=E_i−E_f sommo E_f: E_i=E_γ+E_f. Non prendo una differenza con segno invertito né una media dei livelli.', 'Rapporto(κ₁E_i−κ₂E_f)/(E_i−E_f). Ogni differenza deve restare strettamente positiva: κ₁E_i>κ₂E_f>0, oltre al dominio iniziale. Le scalature riguardano livelli in prove differenti, non una variazione temporale arbitraria di un unico fotone.', 'A:100−20=80 keV. B:2−1=1 keV. Rapporto1/80. Si conserva esatto un risultato molto minore di uno, senza arrotondarlo a zero.', 'Media(80+1)/2=81/2 keV. Per la legge affine la differenza dei livelli medi51 e21/2 keV vale anch’essa81/2 keV; qui le due operazioni coincidono per linearità, non per una regola universale sulle medie.', 'Il target è(1/80)·80=1 keV. Nuovo E_i2 keV implica E_f1 keV. Il rapporto dei finali è1/20, non il rapporto delle energie dei fotoni.', 'Riferimento E_γ80 keV e lettura240→guadagno3 perkeV. Lettura3→E_γ1 keV. Con E_f1 keV il livello iniziale è2 keV.', 'Riferimenti E_γ80 e1 keV, letture161 e3: guadagno(161−3)/(80−1)=2 perkeV e offset1. D201→E_γ100 keV; con E_f20 keV serve E_i120 keV.', 'Vincolo E_i=5E_f rende E_γ=4E_f. Misura80 keV→E_f20 keV ed E_i100 keV. Unica soluzione positiva entro il modello a rinculo trascurato.']

DISTRACTORS=['Eγ100−20=80keV.120 somma,−80 segno contrario,100 ignora energia finale,160 doppio salto.', 'keV energia, Hz frequenza,Bq attività,s tempo,m⁻¹ inverso lunghezza. E=hf richiede h dimensionata.', 'Il fotone non porta nucleoni né carica: ΔA=ΔZ=0. α cambia A/Z,β cambia Z; espulsione nucleoni è altra trasformazione.', '80→100keV.96 scala solo E_i,120 ignora E_f,140 somma,80 non cambia.', 'E_i80+20=100.60 predice40,80 predice60,160 predice140keV emessi.', 'E_f100−80=20.180 somme,−20 inversione,80 copia fotone.', '60/80=3/4;4/3 reciproco,2 segue E_f,1/2 falsa proporzione inversa,1 ignora.', '160−80=80keV;−80 ordine,160 proposta,2 rapporto non energia,0 falsa conservazione.', 'Eγ+E_f energia corretta; sottrazioni non inverse, prodotto energia², quoziente puro.', '(κ₁E_i−κ₂E_f)/(E_i−E_f), nuovo salto positivo. Rapporti/prodotti fattori ignorano pesi, somma livelli falsa,κ₁−κ₂ dà0 a prove identiche.', '1/80 da salti1 e80.80 reciproco,1/50 solo iniziali,1/20 solo finali,1 salti non uguali.', '81/2keV;81 somma,80 e1 singoli fotoni,51 soli livelli iniziali. Coincide formalmente con51−21/2 per linearità.', 'Target1keV, E_f,B2−1=1keV, rapporto1/20.20 inverso,1/80 fotoni,1/50 iniziali,1 imporrebbe E_f20>E_i2.', 'g240/80=3;D3→Eγ1;E_i2.4 somma display a livello senza togliere g,1 solo salto,0 inversa falsa.', 'g158/79=2,b1,D201→Eγ100;E_i120.241/2 omette offset,100 solo salto,221 somma display al livello.', '4E_f80keV→E_f20.16 darebbe salto64;80 confonde livello e salto; negativi esclusi. Misura assoluta fissa la scala.']

ASSUMPTIONS=['Transizione radiativa assegnata fra livelli E_i>E_f>0 nello stesso riferimento energetico; rinculo trascurabile, quindi tutta la differenza va al fotone. Le coppie di livelli sono dati ideali e non uno spettro universale. Numeri atomico e di massa invariati, massa fisica nucleare invece diminuita per l’energia emessa.', 'Caso dimensionale autonomo: Transizione radiativa assegnata fra livelli E_i>E_f>0 nello stesso riferimento energetico; rinculo trascurabile, quindi tutta la differenza va al fotone. Le coppie di livelli sono dati ideali e non uno spettro universale. Numeri atomico e di massa invariati, massa fisica nucleare invece diminuita per l’energia emessa.', 'Transizione radiativa assegnata fra livelli E_i>E_f>0 nello stesso riferimento energetico; rinculo trascurabile, quindi tutta la differenza va al fotone. Le coppie di livelli sono dati ideali e non uno spettro universale. Numeri atomico e di massa invariati, massa fisica nucleare invece diminuita per l’energia emessa.', 'Transizione radiativa assegnata fra livelli E_i>E_f>0 nello stesso riferimento energetico; rinculo trascurabile, quindi tutta la differenza va al fotone. Le coppie di livelli sono dati ideali e non uno spettro universale. Numeri atomico e di massa invariati, massa fisica nucleare invece diminuita per l’energia emessa.', 'Transizione radiativa assegnata fra livelli E_i>E_f>0 nello stesso riferimento energetico; rinculo trascurabile, quindi tutta la differenza va al fotone. Le coppie di livelli sono dati ideali e non uno spettro universale. Numeri atomico e di massa invariati, massa fisica nucleare invece diminuita per l’energia emessa.', 'Transizione radiativa assegnata fra livelli E_i>E_f>0 nello stesso riferimento energetico; rinculo trascurabile, quindi tutta la differenza va al fotone. Le coppie di livelli sono dati ideali e non uno spettro universale. Numeri atomico e di massa invariati, massa fisica nucleare invece diminuita per l’energia emessa.', 'Transizione radiativa assegnata fra livelli E_i>E_f>0 nello stesso riferimento energetico; rinculo trascurabile, quindi tutta la differenza va al fotone. Le coppie di livelli sono dati ideali e non uno spettro universale. Numeri atomico e di massa invariati, massa fisica nucleare invece diminuita per l’energia emessa.', 'Transizione radiativa assegnata fra livelli E_i>E_f>0 nello stesso riferimento energetico; rinculo trascurabile, quindi tutta la differenza va al fotone. Le coppie di livelli sono dati ideali e non uno spettro universale. Numeri atomico e di massa invariati, massa fisica nucleare invece diminuita per l’energia emessa.', 'Transizione radiativa assegnata fra livelli E_i>E_f>0 nello stesso riferimento energetico; rinculo trascurabile, quindi tutta la differenza va al fotone. Le coppie di livelli sono dati ideali e non uno spettro universale. Numeri atomico e di massa invariati, massa fisica nucleare invece diminuita per l’energia emessa.', 'Transizione radiativa assegnata fra livelli E_i>E_f>0 nello stesso riferimento energetico; rinculo trascurabile, quindi tutta la differenza va al fotone. Le coppie di livelli sono dati ideali e non uno spettro universale. Numeri atomico e di massa invariati, massa fisica nucleare invece diminuita per l’energia emessa.', 'Transizione radiativa assegnata fra livelli E_i>E_f>0 nello stesso riferimento energetico; rinculo trascurabile, quindi tutta la differenza va al fotone. Le coppie di livelli sono dati ideali e non uno spettro universale. Numeri atomico e di massa invariati, massa fisica nucleare invece diminuita per l’energia emessa.', 'Transizione radiativa assegnata fra livelli E_i>E_f>0 nello stesso riferimento energetico; rinculo trascurabile, quindi tutta la differenza va al fotone. Le coppie di livelli sono dati ideali e non uno spettro universale. Numeri atomico e di massa invariati, massa fisica nucleare invece diminuita per l’energia emessa.', 'Transizione radiativa assegnata fra livelli E_i>E_f>0 nello stesso riferimento energetico; rinculo trascurabile, quindi tutta la differenza va al fotone. Le coppie di livelli sono dati ideali e non uno spettro universale. Numeri atomico e di massa invariati, massa fisica nucleare invece diminuita per l’energia emessa.', 'Transizione radiativa assegnata fra livelli E_i>E_f>0 nello stesso riferimento energetico; rinculo trascurabile, quindi tutta la differenza va al fotone. Le coppie di livelli sono dati ideali e non uno spettro universale. Numeri atomico e di massa invariati, massa fisica nucleare invece diminuita per l’energia emessa.', 'Transizione radiativa assegnata fra livelli E_i>E_f>0 nello stesso riferimento energetico; rinculo trascurabile, quindi tutta la differenza va al fotone. Le coppie di livelli sono dati ideali e non uno spettro universale. Numeri atomico e di massa invariati, massa fisica nucleare invece diminuita per l’energia emessa.', 'Transizione radiativa assegnata fra livelli E_i>E_f>0 nello stesso riferimento energetico; rinculo trascurabile, quindi tutta la differenza va al fotone. Le coppie di livelli sono dati ideali e non uno spettro universale. Numeri atomico e di massa invariati, massa fisica nucleare invece diminuita per l’energia emessa.']

UNITS={1: 'kiloelectron_volt', 2: 'kiloelectron_volt', 3: '', 4: 'kiloelectron_volt', 5: 'kiloelectron_volt', 6: 'kiloelectron_volt', 7: '', 8: 'kiloelectron_volt', 9: 'kiloelectron_volt', 10: '', 11: '', 12: 'kiloelectron_volt', 13: '', 14: 'kiloelectron_volt', 15: 'kiloelectron_volt', 16: 'kiloelectron_volt'}

NUMERIC_UNITS={1: 'keV', 5: 'keV', 6: 'keV', 14: 'keV', 15: 'keV', 16: 'keV'}

SUFFIX={}

NON_NUMERIC_DISTRACTORS={}

SVG_REVIEW='SVG640×1500 letto XML e native intero dopo child0. Livelli y490−3E[keV]:100 a190,20 a430,zero490; salto verticale240 rappresenta80keV. A/Z invariati nel pannello centrale. Barre320/4/162 per80/1/81/2keV, scala4 comune e origine150; piccolo1keV volutamente non amplificato.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION', 3: 'NO_STUDENT_CALCULATION'}

CANDIDATE_REF='9d1882af96b4281b642bf86285bb26e403b24556'

PRIMARY_SHA256='5b685efd1f9081ea829990d63cf50291ffc298c922b8aac2b169b8de5cdaa3e4'

REVIEWED_MODEL_SHA256='f32615b7796d7dcb7c5d4e9d58566922ed01dac5f1dfd884fef5efd0108492c7'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='9a56b4e7c1d5de518fb03dd34a88111a8e196c71e83ef6ce88cc60fb5973c847'

REVIEWED_BINDINGS_SHA256='4358ff3d429436afdff9304116838a44656545df495e03e8b954b55e1384f4eb'

REVIEWED_CANDIDATES={'AR-u7-gamma-transition-energy-01': '5c70f2210f298eb3869387e048611614dfea8bab6d8473260853a2ef1a26145c', 'AR-u7-gamma-transition-energy-02': '3b208ac42c0ab4c69167ca1b0da284c0c3e49d99b9e09ae2476b16ee8332e1a2', 'AR-u7-gamma-transition-energy-03': 'c6d5ffefa90f5e8cbfb87654e2a4771f55a0ea719e2b935dcae6bd5dfe5096dc', 'AR-u7-gamma-transition-energy-04': 'c3db9e8fa4796a1ff4b92b20056c702166240c4e5c56e1b1a3494c7980925ac4', 'AR-u7-gamma-transition-energy-05': '24452d1eb674d9e51c2e9da07923654b690fce4bb704d36a0d8eb8cbe6e16c5a', 'AR-u7-gamma-transition-energy-06': 'b45b3470f6345f89bacfaa31507a99ad57613113832e5b0d6b63c718d3012726', 'AR-u7-gamma-transition-energy-07': 'acfcef28704e1ef7a627cea695f3b148443229960cef2a2aa484c94ec340b262', 'AR-u7-gamma-transition-energy-08': 'c3af2c69459a3a9dc121d6054d181065c89230d71ca16a84fdd3ef26a1d7ab13', 'AR-u7-gamma-transition-energy-09': '8ed38effffd180458f72b408aa4f1d09ae4fd6254af8748f3921ead6e2bbd003', 'AR-u7-gamma-transition-energy-10': '876a4ad0a9dfd910dee124b49e07feb670bbb2e34de47f9530d0894f48f4ec54', 'AR-u7-gamma-transition-energy-11': 'ca8a671a2c45494e4011c7f9904e8f650b7b83478bd20a8f992b333aabdf7c90', 'AR-u7-gamma-transition-energy-12': '023949baa7e31ce84a459750eba46e1f56bd4b7921e854b328c795a6e886370e', 'AR-u7-gamma-transition-energy-13': '862b6d21c3f7537b4b490a27a29ce5ac95051dc434f9f4171270ceb75254f28b', 'AR-u7-gamma-transition-energy-14': '248a7c64822bfd17ddac4c474370c9d230d320cdee9fa86dadeb4de221ac2770', 'AR-u7-gamma-transition-energy-15': 'd39f198dd18a1a1635c1b7d2890bec66c1b62cfff2703dc26b040ad99a119d2b', 'AR-u7-gamma-transition-energy-16': 'be067e988fc3443d47d0c153a27cd9fa75e70a1f9f5bf6cc59f461a86bad6a16'}

READ_SOURCE_SHA256={'u7-gamma-transition-energy-01': 'b5456c613267b38862c1195794e613ba7e157a8784cdcca9c545ead642e765e8', 'u7-gamma-transition-energy-02': '030a16ab0fb97afcb1901f028fb551c109a7035a5f61445c9657b2394c574868', 'u7-gamma-transition-energy-03': '0c7fa1b154e0f75c3a82b0855fb676f1889cbbb88602a7a24d013fb423a033e3', 'u7-gamma-transition-energy-04': '3d4c6137438b47b1eb01f1b27531a6c6d38701f0c8eb470c368db0338f983df2', 'u7-gamma-transition-energy-05': 'af1e1a8cdccf75cf57d7c5a12aaa02ad4424b9629007b5fb570e7ace96c60cf6', 'u7-gamma-transition-energy-06': 'aa5009c4924ad81a7e4915d3887c83308228d52069cae9d545123fc803329647', 'u7-gamma-transition-energy-07': 'ace6a39ee25f8d8dea97b8429fdfbf015d2766ac49269b65c90e8ed8cd8302e6', 'u7-gamma-transition-energy-08': '6dfdd206ad220acd337df98cb5ef4549601fb78501e817d1f7053091703b92d2', 'u7-gamma-transition-energy-09': '8908a604e25ce7e7463b482b8eac1feca0f8d04e15ca01d375b800076ff7776e', 'u7-gamma-transition-energy-10': 'f7a756aee538d72bb3650b807c0af03f46b933bcdff8ffbaf5695692db2fe93d', 'u7-gamma-transition-energy-11': 'fc34910343c4102d29deea6e0a2f6e9cb6a3cc62da3053fa93f8cf7e8d832719', 'u7-gamma-transition-energy-12': '358f2dfee612618f0525657cc2b64f608262d8bde3aaaf904dfe275bb3b5464d', 'u7-gamma-transition-energy-13': '569242108889686143e9785864fe1ee00782282c71db4d68bb22c0aa107955a7', 'u7-gamma-transition-energy-14': 'c6bfbd0b31f3606e14396b849d9b4d0eefba8417f7647fc3544ae7265d57f478', 'u7-gamma-transition-energy-15': '73d5b05e6447c1a9318b3936a618a127d50c4384ce1425bb14aaa2aad12c0f9c', 'u7-gamma-transition-energy-16': '1ab6f77481040ae91eb321f89cc6033827ff71e25ac924a55bff47974b795f0a'}

SOURCE_READING='Tutti80 originali derivati nella primaria prompt-only5b685 su d0628ef6 prima di ogni candidata; modelli propri corretti e realmente eseguiti su a114caa9 prima di opzioni/chiavi/blocchi/SVG. La precedente ricevuta5c3af5ea è esplicitamente invalida, conservata con esito negativo e successivo positivo separati. Poi tutti16 record di questa famiglia e cinque XML/native nuovi letti integralmente. Nessun modulo autore o primariaB aperta. Confronto integrato ROOT PENDING, UI prodotto/human NOT_RUN.'

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
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u7-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        if row.get('course')!='C5' or row.get('skill')!=REVIEWED_SKILLS[n]:errors.append('Independent real course or primary skill mismatch')
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
                exact=decode_numeric(raw)
                if sp.simplify(exact-want)!=0:errors.append('Independent '+FAMILY+' result mismatch')
                if row['answer']['type']=='choice':
                    equivalent=[]
                    for alternative in row['answer']['options']:
                        option=str(alternative).replace('−','-').strip()
                        if option in NON_NUMERIC_DISTRACTORS.get(n,set()):continue
                        if suffix and not option.endswith(suffix):raise ValueError('alternative missing physical unit')
                        if suffix:option=option.removesuffix(suffix).strip()
                        if sp.simplify(decode_numeric(option)-want)==0:equivalent.append(alternative)
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
          'methods':['SymPy_independent_nuclear_charge_energy_Snell_and_lens_model','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'sourceFirstPrimarySha256':PRIMARY_SHA256,'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}
