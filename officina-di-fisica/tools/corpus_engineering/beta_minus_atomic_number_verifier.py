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
FAMILY='beta-minus-atomic-number'
EXPECTED_IDS={'AR-u7-beta-minus-atomic-number-14', 'AR-u7-beta-minus-atomic-number-03', 'AR-u7-beta-minus-atomic-number-01', 'AR-u7-beta-minus-atomic-number-06', 'AR-u7-beta-minus-atomic-number-07', 'AR-u7-beta-minus-atomic-number-09', 'AR-u7-beta-minus-atomic-number-16', 'AR-u7-beta-minus-atomic-number-12', 'AR-u7-beta-minus-atomic-number-08', 'AR-u7-beta-minus-atomic-number-10', 'AR-u7-beta-minus-atomic-number-11', 'AR-u7-beta-minus-atomic-number-13', 'AR-u7-beta-minus-atomic-number-15', 'AR-u7-beta-minus-atomic-number-02', 'AR-u7-beta-minus-atomic-number-04', 'AR-u7-beta-minus-atomic-number-05'}
REVIEWED_SKILLS={1: 'C5-L08', 2: 'C5-L08', 3: 'C5-L08', 4: 'C5-L08', 5: 'C5-L08', 6: 'C5-L08', 7: 'C5-L08', 8: 'C5-L08', 9: 'C5-L08', 10: 'C5-L08', 11: 'C5-L08', 12: 'C5-L08', 13: 'C5-L08', 14: 'C5-L08', 15: 'C5-L08', 16: 'C5-L08'}

@lru_cache(maxsize=1)
def oracle():
    z,n,w,k1,k2=sp.symbols('z n w k1 k2',positive=True)
    unique([w-n,w+n,w/n,n-w,w-4*n],w-n)
    unique([(k1*z+k2*n)/(z+n),k1/k2,k1*k2,(k1*z-k2*n)/(z+n),k1+k2],(k1*z+k2*n)/(z+n))
    d=model.primary_only_derivations()[255]
    out=[d[n]for n in range(1,17)]
    out[1]='1, numero puro'
    out[2]='Un neutrone diventa protone ed emette elettrone e antineutrino elettronico'
    out[3]='Da 21 a 25'
    out[8]='Z₀ = Z_f − n'
    out[9]='(κ₁ Z₀ + κ₂ n) / (Z₀ + n)'
    return out

MANUAL=['In ogni β⁻ un neutrone del nucleo si trasforma in protone, elettrone e antineutrino elettronico: Z aumenta di uno e A resta costante. Dopo n trasformazioni assegnate, Z_f=Z₀+n. Con Z₀=20 e n=1 si ottiene Z_f=21, un conteggio intero positivo. La compatibilità nucleare e la disponibilità di neutroni sono ipotesi del compito, non una previsione della stabilità reale di tutti gli isotopi della catena.', 'Z è puro; la carica nucleare Ze ha unità C. La primaria precedeva tutte le alternative; dopo la freeze tutti e cinque i distrattori/proposte sono stati letti singolarmente.', 'Nel β⁻ nucleare un neutrone diventa protone con emissione di elettrone e antineutrino elettronico; A non cambia, Z aumenta di uno. La carica è conservata perché il protone aggiunge +e al nucleo e l’elettrone emesso porta −e. Non è l’emissione di un elettrone orbitale già presente né una diminuzione di A.', 'A:20+1=21. B:24+1=25. L’aumento di Z₀ di quattro produce aumento di Z_f di quattro; la somma non impone lo stesso rapporto 24/20 fra le uscite.', 'Isolo Z₀=Z_f−n. Dati21 e1: Z₀20. Occorrono Z_f>n e risultato intero positivo; una misura incompatibile non si risolve con un conteggio frazionario.', 'Isolo n=Z_f−Z₀=21−20=1. Il numero di eventi resta intero positivo e la catena deve essere compatibile con i nucleoni disponibili.', 'A dà21; B dà20+2=22. Il rapporto finale/iniziale è22/21, puro. Raddoppiare solo n non raddoppia la somma che contiene Z₀ invariato.', 'Il corretto è21. Proposto42 meno corretto21 dà+21, puro. Il rapporto sarebbe2 e non lo scarto ordinato richiesto.', 'Z_f=Z₀+n implica Z₀=Z_f−n. Si controllano positività, integralità e compatibilità della catena. Non si sottrae un numero di massa o una carica in coulomb a Z_f.', 'Fra stati il rapporto è(κ₁Z₀+κ₂n)/(Z₀+n). Non è in generaleκ₁κ₂ néκ₁/κ₂. Entrambi i conteggi iniziali e scalati devono essere interi positivi; i singoli fattori possono essere razionali purché trasformino gli interi iniziali in interi ammessi.', 'A:20+1=21. B:24+2=26. Rapporto26/21, esatto e puro. Si sommano prima i due contributi di ciascuna preparazione.', 'Media delle uscite:(21+26)/2=47/2. Una media statistica di conteggi può essere non intera; non descrive un singolo nucleo con mezzo protone. L’estensione affine ai dati medi Z₀22 e n3/2 darebbe anch’essa47/2, ma n3/2 non è un evento fisico ammesso.', 'Il bersaglio è(26/21)·21=26. Con nuovo Z₀24 serve n_B=26−24=2. Rispetto a n_A1 il rapporto è2; entrambi i conteggi sono interi.', 'Riferimento Z_f21 e lettura63: guadagno3. Nuova lettura78→Z_f26; noto n2, Z₀=26−2=24. Il display si decodifica prima di sottrarre il numero di decadimenti.', 'Riferimenti Z_f21 e26 con letture43 e53: guadagno(53−43)/(26−21)=2 e offset1. Lettura51→Z_f25. Con n1, Z₀24. Il display continuo non cancella il vincolo intero sul numero atomico.', 'Vincolo Z₀=20n, quindi Z_f=21n. La misura21 dà n1 e Z₀20. L’equazione è indipendente e fissa un’unica coppia intera positiva; non rimane una scala libera.']

DISTRACTORS=['21=20+1; 19 darebbe ΔZ−1,20 nessun passo,24 confonde l’alfa,42 raddoppia senza bilancio.', 'Z puro, Ze carica in C; kg massa, Bq attività, keV energia.', 'n→p+e⁻+antineutrino conserva carica:0=1−1; A invariato. Positrone identifica β⁺, quattro nucleoni α, salto orbitale non muta il nucleo.', '21→25: aggiunta di1 a entrambe le partenze.24 omette il passo,29 aggiunge5,21 ignora la nuova partenza;105/4 non è intero.', 'Z₀=21−1=20;22 ridarebbe23,21 ridarebbe22,17 ridarebbe18.', 'n=21−20=1.−1 ha segno opposto,21 copia uscita,41 somma; frazioni non sono conteggi.', '22/21;2 confronta soltanto i passi,21/22 reciproco,1 ignora il nuovo passo,44/21 raddoppia il finale B.', '42−21=21.−21 ordine opposto,42 proposta,2 rapporto puro,0 accetta un bilancio falso.', 'Z_f−n inverte la somma, con Z_f>n. Somma e sottrazione4n altra legge; divisione non annulla addizione, n−Z_f negativo.', '(κ₁Z₀+κ₂n)/(Z₀+n). Rapporti/prodotti dei soli fattori perdono i pesi; segno meno falso β⁻; somma fattori vale2 a prove identiche.', '26/21;21/26 reciproco,6/5 solo Z₀,2 solo n,26 uscita non divisa per21.', '47/2:47 somma,22 media soltanto Z₀,3/2 soltanto n,24 non è la media. n medio3/2 non è una nuova catena fisica.', 'Target26, n_B26−24=2, rapporto2.1/2 inverso,26/21 uscite,26 uscita,1 dà25.', 'g63/21=3, Z_f78/3=26, Z₀24.76 toglie n al display amplificato,26 è finale,28 aggiunge i passi.', 'g(53−43)/(26−21)=2,b1; Z_f(51−1)/2=25, Z₀24.49/2 omette b ed è non intero,50 sola sottrazione offset,25 finale,26 somma.', '21n=21→n1. n2 dà42; zero escluso e non misura21. Conteggi continui vietati; A e neutroni sufficienti restano ipotesi.']

ASSUMPTIONS=['Bilancio di una catena β⁻ assegnata: Z₀ e n interi positivi, A sufficiente e almeno n neutroni disponibili. Ogni neutrone diventa protone, con elettrone e antineutrino; ΔA=0 e ΔZ=+1. La contabilità non dimostra l’ammissibilità energetica di una sequenza isotopica. Preparazioni e statistiche separate da un singolo nucleo.', 'Caso dimensionale autonomo: Bilancio di una catena β⁻ assegnata: Z₀ e n interi positivi, A sufficiente e almeno n neutroni disponibili. Ogni neutrone diventa protone, con elettrone e antineutrino; ΔA=0 e ΔZ=+1. La contabilità non dimostra l’ammissibilità energetica di una sequenza isotopica. Preparazioni e statistiche separate da un singolo nucleo.', 'Bilancio di una catena β⁻ assegnata: Z₀ e n interi positivi, A sufficiente e almeno n neutroni disponibili. Ogni neutrone diventa protone, con elettrone e antineutrino; ΔA=0 e ΔZ=+1. La contabilità non dimostra l’ammissibilità energetica di una sequenza isotopica. Preparazioni e statistiche separate da un singolo nucleo.', 'Bilancio di una catena β⁻ assegnata: Z₀ e n interi positivi, A sufficiente e almeno n neutroni disponibili. Ogni neutrone diventa protone, con elettrone e antineutrino; ΔA=0 e ΔZ=+1. La contabilità non dimostra l’ammissibilità energetica di una sequenza isotopica. Preparazioni e statistiche separate da un singolo nucleo.', 'Bilancio di una catena β⁻ assegnata: Z₀ e n interi positivi, A sufficiente e almeno n neutroni disponibili. Ogni neutrone diventa protone, con elettrone e antineutrino; ΔA=0 e ΔZ=+1. La contabilità non dimostra l’ammissibilità energetica di una sequenza isotopica. Preparazioni e statistiche separate da un singolo nucleo.', 'Bilancio di una catena β⁻ assegnata: Z₀ e n interi positivi, A sufficiente e almeno n neutroni disponibili. Ogni neutrone diventa protone, con elettrone e antineutrino; ΔA=0 e ΔZ=+1. La contabilità non dimostra l’ammissibilità energetica di una sequenza isotopica. Preparazioni e statistiche separate da un singolo nucleo.', 'Bilancio di una catena β⁻ assegnata: Z₀ e n interi positivi, A sufficiente e almeno n neutroni disponibili. Ogni neutrone diventa protone, con elettrone e antineutrino; ΔA=0 e ΔZ=+1. La contabilità non dimostra l’ammissibilità energetica di una sequenza isotopica. Preparazioni e statistiche separate da un singolo nucleo.', 'Bilancio di una catena β⁻ assegnata: Z₀ e n interi positivi, A sufficiente e almeno n neutroni disponibili. Ogni neutrone diventa protone, con elettrone e antineutrino; ΔA=0 e ΔZ=+1. La contabilità non dimostra l’ammissibilità energetica di una sequenza isotopica. Preparazioni e statistiche separate da un singolo nucleo.', 'Bilancio di una catena β⁻ assegnata: Z₀ e n interi positivi, A sufficiente e almeno n neutroni disponibili. Ogni neutrone diventa protone, con elettrone e antineutrino; ΔA=0 e ΔZ=+1. La contabilità non dimostra l’ammissibilità energetica di una sequenza isotopica. Preparazioni e statistiche separate da un singolo nucleo.', 'Bilancio di una catena β⁻ assegnata: Z₀ e n interi positivi, A sufficiente e almeno n neutroni disponibili. Ogni neutrone diventa protone, con elettrone e antineutrino; ΔA=0 e ΔZ=+1. La contabilità non dimostra l’ammissibilità energetica di una sequenza isotopica. Preparazioni e statistiche separate da un singolo nucleo.', 'Bilancio di una catena β⁻ assegnata: Z₀ e n interi positivi, A sufficiente e almeno n neutroni disponibili. Ogni neutrone diventa protone, con elettrone e antineutrino; ΔA=0 e ΔZ=+1. La contabilità non dimostra l’ammissibilità energetica di una sequenza isotopica. Preparazioni e statistiche separate da un singolo nucleo.', 'Bilancio di una catena β⁻ assegnata: Z₀ e n interi positivi, A sufficiente e almeno n neutroni disponibili. Ogni neutrone diventa protone, con elettrone e antineutrino; ΔA=0 e ΔZ=+1. La contabilità non dimostra l’ammissibilità energetica di una sequenza isotopica. Preparazioni e statistiche separate da un singolo nucleo.', 'Bilancio di una catena β⁻ assegnata: Z₀ e n interi positivi, A sufficiente e almeno n neutroni disponibili. Ogni neutrone diventa protone, con elettrone e antineutrino; ΔA=0 e ΔZ=+1. La contabilità non dimostra l’ammissibilità energetica di una sequenza isotopica. Preparazioni e statistiche separate da un singolo nucleo.', 'Bilancio di una catena β⁻ assegnata: Z₀ e n interi positivi, A sufficiente e almeno n neutroni disponibili. Ogni neutrone diventa protone, con elettrone e antineutrino; ΔA=0 e ΔZ=+1. La contabilità non dimostra l’ammissibilità energetica di una sequenza isotopica. Preparazioni e statistiche separate da un singolo nucleo.', 'Bilancio di una catena β⁻ assegnata: Z₀ e n interi positivi, A sufficiente e almeno n neutroni disponibili. Ogni neutrone diventa protone, con elettrone e antineutrino; ΔA=0 e ΔZ=+1. La contabilità non dimostra l’ammissibilità energetica di una sequenza isotopica. Preparazioni e statistiche separate da un singolo nucleo.', 'Bilancio di una catena β⁻ assegnata: Z₀ e n interi positivi, A sufficiente e almeno n neutroni disponibili. Ogni neutrone diventa protone, con elettrone e antineutrino; ΔA=0 e ΔZ=+1. La contabilità non dimostra l’ammissibilità energetica di una sequenza isotopica. Preparazioni e statistiche separate da un singolo nucleo.']

UNITS={1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '', 10: '', 11: '', 12: '', 13: '', 14: '', 15: '', 16: ''}

NUMERIC_UNITS={1: '1', 5: '1', 6: '1', 14: '1', 15: '1', 16: '1'}

SUFFIX={}

NON_NUMERIC_DISTRACTORS={}

SVG_REVIEW='Cinque XML e native completi distinti letti dopo veri child0. Questo SVG640×1500: frecce sono passi nucleari, non traiettorie. Catena Z₀20, punti(170,730),(320,645),(470,560): ascisse150 coordinate/passo,ordinate85 per protone; n0 riferimento iniziale distinto da n>0 degli esercizi. Barre252/312/282 corrispondono21/26/47/2, scala12 comune e zero comune.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION', 3: 'NO_STUDENT_CALCULATION'}

CANDIDATE_REF='7624e79ce22e32ad753af74a59d2dd96de209075'

PRIMARY_SHA256='5b685efd1f9081ea829990d63cf50291ffc298c922b8aac2b169b8de5cdaa3e4'

REVIEWED_MODEL_SHA256='f32615b7796d7dcb7c5d4e9d58566922ed01dac5f1dfd884fef5efd0108492c7'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='29e6d41c0153d676a8bfe07bfcca40a21e9d9ded4acaaf00125e13788e905b64'

REVIEWED_BINDINGS_SHA256='45105bbab6ad7e3a98033a07c08b63289816d5ac0f7556c2c60911c5c6d3b1d5'

REVIEWED_CANDIDATES={'AR-u7-beta-minus-atomic-number-01': 'a9ef29faba1e5098136d38edb8189bef8caf3ca506ac31862fb9fea3669e4800', 'AR-u7-beta-minus-atomic-number-02': '9e5d8661a3b3a28c6ef67e346b4e1cc247745f2425d4dcfb09abe925b60fb1c9', 'AR-u7-beta-minus-atomic-number-03': '0813de4831ff124023bc3698506fba56859a8a16bcf7bc471df5ac022fee64e4', 'AR-u7-beta-minus-atomic-number-04': 'e30c75aee1679a7ce1e62a7757061038796272224bc3211bcaff63d99f42722d', 'AR-u7-beta-minus-atomic-number-05': '9fd673d8c525073f689df1a2ede04f2c70ebdf31e76d3375199494f25da4933c', 'AR-u7-beta-minus-atomic-number-06': '6f92a848f38eeb73e828ad2b6cd9bc1caf699f6a784a56179577f231aaf6102c', 'AR-u7-beta-minus-atomic-number-07': '33140ad6ecc1314b4946780a33ca70337766118f7da3c312b52b29126c3f9c5a', 'AR-u7-beta-minus-atomic-number-08': 'a84f3a2fcad6569cf2a7493576f32262918097a5c6f731f2b1d03e17b1ee5b35', 'AR-u7-beta-minus-atomic-number-09': '41c8232a8e897b2cf8722e044e5f5c4283325ed40640be9171beb7919e38f0ce', 'AR-u7-beta-minus-atomic-number-10': 'aeb9f4093641d0afc58b4528a6c37c2f90d6b8ba83855562defc012c6d889dae', 'AR-u7-beta-minus-atomic-number-11': 'f555e5bc6f480bffa148f620ffe2c67d2c06b53f26988d32817d539613da8bd1', 'AR-u7-beta-minus-atomic-number-12': '99f7ac0d0d32a02fd4ebb03d42c2e69560cfd884225dcc8bd90d9ae855b2fb3b', 'AR-u7-beta-minus-atomic-number-13': 'bdd2bd72d40eb71a3025b324f109e7759bb2ca8954f3a25e84a3016ae934332e', 'AR-u7-beta-minus-atomic-number-14': '0848149780f8296852c84087db7621a9f6ff89471b7f7cbafe5dd06b302365bc', 'AR-u7-beta-minus-atomic-number-15': '3dc9229b22a4c0e8c28f6fc98954d641e0bee47bc5363df1b21f9b87c1859a52', 'AR-u7-beta-minus-atomic-number-16': 'bbe4995afaf5f5e681112891f1b8b25d8eb39f50703b527bc9b00dacd2c39dd0'}

READ_SOURCE_SHA256={'u7-beta-minus-atomic-number-01': '7aa3cbea0e90f53e6e80776565527af825fae166293855a7a16172b1148b45dd', 'u7-beta-minus-atomic-number-02': '45b1abff039722752589e27ff007e2586a75b904c46380530fc2379b62216bf6', 'u7-beta-minus-atomic-number-03': '5b0dc93935f79b1763618d2598e08eb3900d7cea51e4c35f6fb6358cc0ab4803', 'u7-beta-minus-atomic-number-04': '22f730bb31dbe99c571b9229ffe91ae7c3c46949586215f6cbb85cbe10d3b875', 'u7-beta-minus-atomic-number-05': '9599b2236677485fd5991b4f99f1daf4a047b6eb821aab6fd5ec1add4d121202', 'u7-beta-minus-atomic-number-06': '9a0cee3b71e6e734bc37effc6672d3b03b5ee56a30305af4c071560440a38308', 'u7-beta-minus-atomic-number-07': '19b9b9cedaa168a60229577f340996626d383076c8761e47c813c997f1ce4ad3', 'u7-beta-minus-atomic-number-08': '92ba9e41e6aeed9d5b5ca3710a70551a4fba313deaaa722b534648af0d5a01ac', 'u7-beta-minus-atomic-number-09': '8bfe6c548d3948ec2cc80cc1b9e075527b5110590eef2a1b6d06d1cf55a7a4e8', 'u7-beta-minus-atomic-number-10': 'cbb4d0ab52cc234e448029c8a6a7cc578b413e384f17ec60462ad5d0b369641c', 'u7-beta-minus-atomic-number-11': '73530be614daa6e6f83b99f3dd072cf4e29bec316f7a0ae2aa8456ffb9aec686', 'u7-beta-minus-atomic-number-12': '1e8eb73c517a734c5dfcfd86a3146ec6eb597cc20c9d87ba53dcc16fbbd8e315', 'u7-beta-minus-atomic-number-13': '6ec1f45e8ccfb07345373e698579b16ee6fd26f612f5310be6e60861199b3f3b', 'u7-beta-minus-atomic-number-14': '9b12f99cfd0f9b52e8dba58d7a3af1efd8e0564a3c55610ba33b754075b7806b', 'u7-beta-minus-atomic-number-15': '10f77d8ddd886a8f583d6b1f3b62221e5789ae7dbf920c6122664c879a49a7c3', 'u7-beta-minus-atomic-number-16': 'fdf6276883e45f65a63cc8bacd765f61d9efe4315d00e2970e3cf99e3d4f2f35'}

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
