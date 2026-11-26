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
from . import radiation_attenuation_review_models as model
SI=pint.UnitRegistry(non_int_type=Fraction)
def unique(values,want):
    if [i for i,v in enumerate(values)if sp.simplify(v-want)==0]!=[0]:raise ValueError('Independent general symbolic laws not unique')
def decode_numeric(raw):
    if raw=='e':return sp.E
    return exact_literal(raw)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U7-01.json'
FAMILY='photon-packet-wavelength'
EXPECTED_IDS={'AR-u7-photon-packet-wavelength-08', 'AR-u7-photon-packet-wavelength-05', 'AR-u7-photon-packet-wavelength-12', 'AR-u7-photon-packet-wavelength-11', 'AR-u7-photon-packet-wavelength-16', 'AR-u7-photon-packet-wavelength-10', 'AR-u7-photon-packet-wavelength-15', 'AR-u7-photon-packet-wavelength-07', 'AR-u7-photon-packet-wavelength-09', 'AR-u7-photon-packet-wavelength-02', 'AR-u7-photon-packet-wavelength-14', 'AR-u7-photon-packet-wavelength-13', 'AR-u7-photon-packet-wavelength-04', 'AR-u7-photon-packet-wavelength-01', 'AR-u7-photon-packet-wavelength-06', 'AR-u7-photon-packet-wavelength-03'}
REVIEWED_SKILLS={1: 'C5-L07', 2: 'C5-L07', 3: 'C5-L07', 4: 'C5-L07', 5: 'C5-L07', 6: 'C5-L07', 7: 'C5-L07', 8: 'C5-L07', 9: 'C5-L07', 10: 'C5-L07', 11: 'C5-L07', 12: 'C5-L07', 13: 'C5-L07', 14: 'C5-L07', 15: 'C5-L07', 16: 'C5-L07'}

@lru_cache(maxsize=1)
def oracle():
    N,x,E,h,c,k1,k2=sp.symbols('N x E h c k1 k2',positive=True)
    unique([1980*N/x,1980*N*x,x/(1980*N),1980*x/N,1980*N*N/x],1980*N/x)
    unique([E*x/(h*c),E/(h*c*x),h*c/(E*x),E*h*c/x,E*x/h],E*x/(h*c))
    unique([k1/k2,k1*k2,k2/k1,k1*k1/k2,k1+k2],k1/k2)
    d=model.primary_only_derivations()[245]
    out=[d[n]for n in range(1,17)]
    out[1]='J'
    out[2]='e = 1980 N / ℓ'
    out[3]='Da 3 E_* a 6 E_*'
    out[8]='N = E λ₀ / (h c)'
    out[9]='κ₁ / κ₂'
    out[15]='Infinite coppie discrete, con N intero positivo'
    return out

MANUAL=['Per fotoni di uguale lunghezza d’onda nel vuoto, energia totale E=N hc/λ. Dai coefficienti prescritti, hc=(6, 6·10⁻³⁴)(3·10⁸)=19, 8·10⁻²⁶ J·m. Se x=λ/(1 nm)>0 ed e=E/(10⁻¹⁹ J), allora e=1980 N/x. Con N=1, x=660, 1980/660=3: E=3·10⁻¹⁹ J. I coefficienti approssimati assegnati sono usati come dati esatti del modello, senza sostituire costanti più precise.', 'Dimensione energia J, anche E_*10^-19 J; conteggioN puro. Nella primaria nessuna alternativa era aperta; dopo il congelamento tutte e cinque sono state lette individualmente.', 'Con e=E/(10⁻¹⁹ J) e x=λ/(1 nm), la relazione numerica corretta è e=1980 N/x; la relazione fra grandezze fisiche è E=Nhc/λ. La frequenza e la lunghezza d’onda sono collegate da c=νλ nel vuoto. Non moltiplico per λ e non applico una legge del campo classico all’energia per fotone.', 'A λ 660 nm, un fotone dà 3·10⁻¹⁹ J e due ne danno 6·10⁻¹⁹ J. Il fattore due riguarda il numero di fotoni; l’energia di ciascun fotone resta identica. N passa fra due interi ammessi.', 'Isolo N=Eλ/(hc)=e x/1980. Con e 3, x 660 si ottiene N 1, intero positivo. Una misura che producesse N non intero sarebbe incompatibile con il pacchetto ideale monocromatico dichiarato, non un numero frazionario di fotoni da accettare.', 'Isolo λ=Nhc/E. In numeri x=1980 N/e=1980/3=660, quindi λ 660 nm. E deve essere positiva; la lunghezza d’onda non è una frequenza e non prende unità hertz.', 'A N 1 fissato, λ si dimezza 660→330 nm ed E raddoppia 3→6 nelle unità 10⁻¹⁹ J. Rapporto E_B/E_A=2, inverso di λ_B/λ_A.', 'Proposta 6 meno corretto 3 dà+3 nelle unità 10⁻¹⁹ J. Il rapporto puro due non è lo scarto energetico; il segno positivo deriva dall’ordine proposto meno corretto.', 'E=Nhc/λ si moltiplica per λ e si divide per hc: N=Eλ/(hc). In variabili normalizzate N=e x/1980. Il risultato deve essere intero positivo, non soltanto reale positivo.', 'Fra pacchetti, E_B/E_A=(κ₁N hc/(κ₂λ))/(N hc/λ)=κ₁/κ₂. Serve N_A intero positivo e κ₁N_A intero positivo; κ₁ non deve necessariamente essere intero da solo. λ_B positiva e frequenza nel vuoto coerente.', 'A:1980·1/660=3. B:1980·2/330=12. Rapporto 12/3=4. Il numero doppio e la lunghezza d’onda dimezzata forniscono due fattori due concordi.', 'Media delle uscite:(3+12)/2=15/2 nelle unità 10⁻¹⁹ J. Le medie degli ingressi darebbero N=3/2 e λ 495 nm; N=3/2 non è un pacchetto fisico ammesso. La valutazione formale estesa sarebbe 6, ma va etichettata come sola estensione algebrica, non come terzo stato fisico.', 'Il bersaglio è 4·3=12 nelle unità 10⁻¹⁹ J. Con N_B 2 serve λ_B=1980·2/12=330 nm; rapportoλ_B/λ_A=330/660=1/2. N_B è un intero valido.', 'Riferimento e 3 e lettura 9 fissano guadagno 3 unità per unità energetica 10⁻¹⁹ J. Lettura 36 decodifica e 12; con λ 330 nm, N=12·330/1980=2. Si tarano le letture prima dell’inversa e si controlla l’intero.', 'Riferimenti e_A 3, e_B 12 e letture 7, 25 danno guadagno(25−7)/(12−3)=2 e offset 1. Lettura 13→e_C 6. Con λ 660 nm, N_C=6·660/1980=2. Sottrarre b precede la divisione per il guadagno.', 'Il vincolo numerico N=λ[nm]/660 equivale a λ=(660 nm)N. Inserito in E=Nhc/λ dà sempre e 3. Restano infinite coppie DISCRETE, N∈{1, 2, 3, …}, λ 660 N nm. Esempi(1, 660 nm), (2, 1320 nm). Non è una famiglia continua perché N è un conteggio intero.']

DISTRACTORS=['e 3=1980/660; 6 raddoppiaN, 1/3 reciproco, 1980 ometteλ. Il coefficiente si inserisce nell’unità E_* dichiarata.', 'J energia; Hz frequenza, W eJ/s potenze, nm lunghezza.', '1980 N/ℓ. Prodottoℓ cambia dipendenza, reciproci invertono energia oN, N² introduce quadrato assente.', '3→6 E_* lineare inN.3/2 inverso, 12 quadrato, 3 immutato, zero viola energia positiva.', 'N 1=3·660/1980.3 copiae, 2 darebbe 6 E_*, 1/3 non è un pacchetto.', 'λ 660 nm; 330→6 E_*, 1320→3/2 E_*, 1980→E_*.', '2=6/3.1/2 segueλ diretto, 4 quadra, 1 ignora, 330 copia dato.', '+3 E_*=6−3.−3 ordine, 2 rapporto, 6 proposta, 0 mancato controllo.', 'Eλ/(hc) è puro; E/(hcλ) ha m^-2, hc/(Eλ) reciproco, Eh c/λ non isolaN, Eλ/h velocità.', 'κ₁/κ₂. Prodotto segueλ diretto, reciproco scambia stati, κ₁² raddoppia potenza, somma 2 per prove identiche.', '4=12/3.1/4 reciproco, 2 un solo effetto, 1 falsa compensazione, 3 copiae_A.', '15/2 E_*; 6 è estensione formale conN 3/2 non fisico, 15 somma, 9/2 semidifferenza, 12 B.', 'λB 330 nm dà rapporto 1/2.2 darebbeEB/EA 1, 4→1/2, 1/4→8, 1→2.', 'g 3, D 36→e 12 eN 2.6 darebbeD 108, 1→18, 36 copia lettura.', 'g 2, b 1, D 13→e 6, N 2.13/6 ometteb e non intero, 4 prediceD 25, 6 copiae.', 'N 1, 2, 3, … conλ 660 Nnm: infinite discrete. Una/due confutate daN 1/2/3; nessuna daN 1; reali continui includonoN 1/2 vietato.']

ASSUMPTIONS=['Fotoni monocromatici con lunghezza d’onda nel vuoto positiva, N intero positivo; h e c approssimati sono coefficienti esatti assegnati del modello. E è fisica ed e=E/(10^-19 J) puro, ℓ=λ₀/(1 nm). Preparazioni distinte; scala discreta nel 16, medie statistiche non nuovi pacchetti.', 'Caso dimensionale autonomo; tutte le alternative confrontate dopo la primaria.', 'Fotoni monocromatici con lunghezza d’onda nel vuoto positiva, N intero positivo; h e c approssimati sono coefficienti esatti assegnati del modello. E è fisica ed e=E/(10^-19 J) puro, ℓ=λ₀/(1 nm). Preparazioni distinte; scala discreta nel 16, medie statistiche non nuovi pacchetti.', 'Fotoni monocromatici con lunghezza d’onda nel vuoto positiva, N intero positivo; h e c approssimati sono coefficienti esatti assegnati del modello. E è fisica ed e=E/(10^-19 J) puro, ℓ=λ₀/(1 nm). Preparazioni distinte; scala discreta nel 16, medie statistiche non nuovi pacchetti.', 'Fotoni monocromatici con lunghezza d’onda nel vuoto positiva, N intero positivo; h e c approssimati sono coefficienti esatti assegnati del modello. E è fisica ed e=E/(10^-19 J) puro, ℓ=λ₀/(1 nm). Preparazioni distinte; scala discreta nel 16, medie statistiche non nuovi pacchetti.', 'Fotoni monocromatici con lunghezza d’onda nel vuoto positiva, N intero positivo; h e c approssimati sono coefficienti esatti assegnati del modello. E è fisica ed e=E/(10^-19 J) puro, ℓ=λ₀/(1 nm). Preparazioni distinte; scala discreta nel 16, medie statistiche non nuovi pacchetti.', 'Fotoni monocromatici con lunghezza d’onda nel vuoto positiva, N intero positivo; h e c approssimati sono coefficienti esatti assegnati del modello. E è fisica ed e=E/(10^-19 J) puro, ℓ=λ₀/(1 nm). Preparazioni distinte; scala discreta nel 16, medie statistiche non nuovi pacchetti.', 'Fotoni monocromatici con lunghezza d’onda nel vuoto positiva, N intero positivo; h e c approssimati sono coefficienti esatti assegnati del modello. E è fisica ed e=E/(10^-19 J) puro, ℓ=λ₀/(1 nm). Preparazioni distinte; scala discreta nel 16, medie statistiche non nuovi pacchetti.', 'Fotoni monocromatici con lunghezza d’onda nel vuoto positiva, N intero positivo; h e c approssimati sono coefficienti esatti assegnati del modello. E è fisica ed e=E/(10^-19 J) puro, ℓ=λ₀/(1 nm). Preparazioni distinte; scala discreta nel 16, medie statistiche non nuovi pacchetti.', 'Fotoni monocromatici con lunghezza d’onda nel vuoto positiva, N intero positivo; h e c approssimati sono coefficienti esatti assegnati del modello. E è fisica ed e=E/(10^-19 J) puro, ℓ=λ₀/(1 nm). Preparazioni distinte; scala discreta nel 16, medie statistiche non nuovi pacchetti.', 'Fotoni monocromatici con lunghezza d’onda nel vuoto positiva, N intero positivo; h e c approssimati sono coefficienti esatti assegnati del modello. E è fisica ed e=E/(10^-19 J) puro, ℓ=λ₀/(1 nm). Preparazioni distinte; scala discreta nel 16, medie statistiche non nuovi pacchetti.', 'Fotoni monocromatici con lunghezza d’onda nel vuoto positiva, N intero positivo; h e c approssimati sono coefficienti esatti assegnati del modello. E è fisica ed e=E/(10^-19 J) puro, ℓ=λ₀/(1 nm). Preparazioni distinte; scala discreta nel 16, medie statistiche non nuovi pacchetti.', 'Fotoni monocromatici con lunghezza d’onda nel vuoto positiva, N intero positivo; h e c approssimati sono coefficienti esatti assegnati del modello. E è fisica ed e=E/(10^-19 J) puro, ℓ=λ₀/(1 nm). Preparazioni distinte; scala discreta nel 16, medie statistiche non nuovi pacchetti.', 'Fotoni monocromatici con lunghezza d’onda nel vuoto positiva, N intero positivo; h e c approssimati sono coefficienti esatti assegnati del modello. E è fisica ed e=E/(10^-19 J) puro, ℓ=λ₀/(1 nm). Preparazioni distinte; scala discreta nel 16, medie statistiche non nuovi pacchetti.', 'Fotoni monocromatici con lunghezza d’onda nel vuoto positiva, N intero positivo; h e c approssimati sono coefficienti esatti assegnati del modello. E è fisica ed e=E/(10^-19 J) puro, ℓ=λ₀/(1 nm). Preparazioni distinte; scala discreta nel 16, medie statistiche non nuovi pacchetti.', 'Fotoni monocromatici con lunghezza d’onda nel vuoto positiva, N intero positivo; h e c approssimati sono coefficienti esatti assegnati del modello. E è fisica ed e=E/(10^-19 J) puro, ℓ=λ₀/(1 nm). Preparazioni distinte; scala discreta nel 16, medie statistiche non nuovi pacchetti.']

UNITS={1: 'joule', 2: 'joule', 3: '', 4: 'joule', 5: '', 6: 'nanometer', 7: '', 8: 'joule', 9: '', 10: '', 11: '', 12: 'joule', 13: '', 14: '', 15: '', 16: ''}

NUMERIC_UNITS={1: '10⁻¹⁹ J', 5: '1', 6: 'nm', 14: '1', 15: '1'}

SUFFIX={8: ' E_*', 12: ' E_*'}

NON_NUMERIC_DISTRACTORS={8: {'2'}}

SVG_REVIEW='XML e nuovo native completo 640 × 1600 letti. Primo profilo periodo 300 e secondo 150 coordinate con barre di lunghezza 300 e 150, quindi 660 e 330 nm alla stessa scala; nessuna traiettoria di fotone. Barre energia 75/300/187.5 da 150 rappresentano 3/12/15/2 E_* con scala 25 coordinate/E_*. Grafico N controλ₀: origine(150, 1480), x=150+(2/11)λ₀[nm], y=1480−80 N; punti(270, 1400), (390, 1320), (510, 1240) sono N 1/2/3 eλ 660/1320/1980 nm. Nessuna linea continua o conteggio frazionario.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 16: 'SYMBOLIC_MANUAL_DERIVATION'}

CANDIDATE_REF='539e12af7cb128b8d7748915424b37c8ab988ac1'

PRIMARY_SHA256='6ead7521b5a47b0f1cfa8675ca614070ef3c285b5b0be2815d82b299c3b26e08'

REVIEWED_MODEL_SHA256='c74b1d7f639531452c09fc4dc017b6c42d6ca298f58957e09e372092f0ca4b47'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='3d0ea7e4b524ca03d846f5140930a3b8ef6b0892793ca2cbbb0f743f0a219047'

REVIEWED_BINDINGS_SHA256='3bf73c48c9a8c01cecea0ceffe4c58cfe09708b9dcc4d43fcb4d869b98625064'

REVIEWED_CANDIDATES={'AR-u7-photon-packet-wavelength-01': '068ea90dad00ee1c8f76a9c020e399f5d979506869247ede8cb2cb30adf01418', 'AR-u7-photon-packet-wavelength-02': '98b6d27a2c4b2e4d3635330da44f8e4de32a9dd1420f941dce3d8746b06697a6', 'AR-u7-photon-packet-wavelength-03': '88870317458bcc4929f71215890161b4b8bf21e2db887b1f26f178274f1be8be', 'AR-u7-photon-packet-wavelength-04': '086f9232f1e7a3864283c518da345fe707abdd3814d9738a8eb495d871a95aa1', 'AR-u7-photon-packet-wavelength-05': '1e408c380b7230b8888401754a983a28e21396a8167b267f6eeb68403541e115', 'AR-u7-photon-packet-wavelength-06': 'b1b3bb8b2f66b99bd3d4d7f23a5f88a40069f5fa39d4069ce27c37a36bfcfbae', 'AR-u7-photon-packet-wavelength-07': 'b67620c7c7d6c049b752074787d763046aecbbbcb6bca26f0f25def0f59baac9', 'AR-u7-photon-packet-wavelength-08': '81ae4e266193b286244279f44ecfb7a1e15e612c495297413c8e0c85577e6000', 'AR-u7-photon-packet-wavelength-09': '5897221c66a73bc085ecaf60cce06534f01ae4cbadd9cb8934590369840e2792', 'AR-u7-photon-packet-wavelength-10': 'e1617007e3c28ca9b71c6215bf6cb2492a088c38d30d9dd2dab44d5d05e5c1d4', 'AR-u7-photon-packet-wavelength-11': '61103215f48d715acd0518cf02fd20e9ea2acc2d765c70e25e4ad10190583942', 'AR-u7-photon-packet-wavelength-12': '0453e569ba29982720ef6c03ce1122bf6a7ca9d8a98e9e4c7dc7eb4cd8c905ee', 'AR-u7-photon-packet-wavelength-13': 'ed0fbf400fbe7d06e3c8fd3cf66940a26480c2fe7f190f63bb8392835809943a', 'AR-u7-photon-packet-wavelength-14': 'de13c7c1413e9a36c0c35f1c44770d9ca1477a9a22da3f74af5d705dc1843d8c', 'AR-u7-photon-packet-wavelength-15': '52d028e6d87b6f2826efaa91c94793f4abbf36bec76df13a8100fa0d2edd0c94', 'AR-u7-photon-packet-wavelength-16': 'b0fbb238e392ee40ef1a4834b583ba6091882176a6d34d0f564e39bd5d57b480'}

READ_SOURCE_SHA256={'u7-photon-packet-wavelength-01': '5d019fd2a5c7e27cf5028144e7ffa46ef50e1c3bef1ad2b8a1c727ece3442673', 'u7-photon-packet-wavelength-02': 'a16db9957aa840d8cf665773b0d82edef21c36bc611a17f81d563af256cdd9d6', 'u7-photon-packet-wavelength-03': 'faae664490000b60bd2ab9cec4b06fbd9b83a0a7928c5f1dacb9ce20f44a7976', 'u7-photon-packet-wavelength-04': '7d5c815c6d527e75b9e878a0dc00a1bc4ca5d0911f547436a996a215c09239d0', 'u7-photon-packet-wavelength-05': '3cb78e52918e69bd54e13ac47765b10e219ca2da5f557f2f5ccb6fa3038fd0d9', 'u7-photon-packet-wavelength-06': '1eb1f5b67cd026d1199abf941e22197d77347aa65e22e92cb975c2624f12b583', 'u7-photon-packet-wavelength-07': '936e207e59fcf014fd2ad885d9dc14516d09a91ddb44658253f29c8634546306', 'u7-photon-packet-wavelength-08': 'dc50864f92afeffa9f84cd83a50d8d55832c1410b4fa4c6c4d246a08d9ff98e8', 'u7-photon-packet-wavelength-09': '6c2a5c2afda7126d27fc947f37731e219a60fd32ff3e4e74d055787fe3fd9ea1', 'u7-photon-packet-wavelength-10': '571375a52b03bf55f1f9e279ef5de1dd26afb8fe0e9e30b9d95062051bdf1967', 'u7-photon-packet-wavelength-11': '6c3b1d71e33cf54da1b37cef5cb20944e685fdd4f52b37253e6e684f81c39264', 'u7-photon-packet-wavelength-12': 'a6474d477526c849a8790d17f53137e901df1749f6205e249a9dc88fa9379948', 'u7-photon-packet-wavelength-13': 'd494ea0b3d859714017fd850b5bebcb259f76687d522b99f366647b7d94b0523', 'u7-photon-packet-wavelength-14': '7907648067669840667578264912a983e099496283a26153caa9c541dbb4cb99', 'u7-photon-packet-wavelength-15': '12d52405b71a36201b15bbbb22b7518e47063226fc338209245e71ea26b497ce', 'u7-photon-packet-wavelength-16': '35e02b7b92c94e19cafeac8baf019dda42ca30993f0639902caee605f5450469'}

SOURCE_READING='Tutti80 originali derivati individualmente nella primaria6ead prima di qualsiasi candidata; modelli scritti ed eseguiti sul commit24cf4060 prima di opzioni/chiavi/blocchi/SVG B. Poi tutti16 record di questa famiglia letti integralmente, tutte alternative e cinque figure XML/native nuove lette. Fix autore riletti prima di freeze. Nessun modulo autore o primaria B aperta. Confronto integrato ROOT PENDING, UI prodotto/human NOT_RUN.'

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
          'methods':['SymPy_independent_Planck_Beer_and_optical_depth_model','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'sourceFirstPrimarySha256':PRIMARY_SHA256,'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}
