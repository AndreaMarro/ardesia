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
FAMILY='magnetic-helix-pitch'
EXPECTED_IDS={'AR-u6-magnetic-helix-pitch-15', 'AR-u6-magnetic-helix-pitch-10', 'AR-u6-magnetic-helix-pitch-07', 'AR-u6-magnetic-helix-pitch-03', 'AR-u6-magnetic-helix-pitch-08', 'AR-u6-magnetic-helix-pitch-12', 'AR-u6-magnetic-helix-pitch-13', 'AR-u6-magnetic-helix-pitch-06', 'AR-u6-magnetic-helix-pitch-05', 'AR-u6-magnetic-helix-pitch-11', 'AR-u6-magnetic-helix-pitch-02', 'AR-u6-magnetic-helix-pitch-04', 'AR-u6-magnetic-helix-pitch-01', 'AR-u6-magnetic-helix-pitch-14', 'AR-u6-magnetic-helix-pitch-09', 'AR-u6-magnetic-helix-pitch-16'}
REVIEWED_SKILLS={n:'C4-L09'for n in range(1,17)}

@lru_cache(maxsize=1)
def oracle():
    q,m,B,H,k1,k2=sp.symbols('q m B H k1 k2',positive=True)
    unique([q*B*H/m,m*H/(q*B),m/(q*B*H),B*H,2*sp.pi*q*B*H/m],q*B*H/m)
    unique([k1/k2,k1*k2,k2/k1,k1*k1/k2,k1+k2],k1/k2)
    d=model.primary_only_derivations()[239]
    out=[d[n]for n in range(1,17)]
    out[1]='m'
    out[2]='Un’elica con asse parallelo al campo'
    out[3]='Da 2 m a 3 m'
    out[8]='v∥ = |q| B H / m'
    out[9]='κ₁ / κ₂'
    out[15]='Infinite coppie continue'
    return out

MANUAL=['Pongo α=|q|/m=1 C/kg, mantenendo le unità del coefficiente. La forza parallela a B è nulla: v∥ resta costante. La componente perpendicolare ruota con ω=αB, periodo T=2π/(αB). Quindi p=v∥T e X=p/(2π)=v∥/(αB). Con v∥2 m/s e B 1 T: X 2 m e p 4π m. Raggio e v⊥ non sono richiesti per il passo.', 'La grandezza richiesta ha dimensione lunghezza, m, perché p/(2π) conserva la dimensione di p. Nella primaria le alternative non erano aperte; dopo il congelamento tutte e cinque sono state lette e confrontate individualmente.', 'La forza magnetica non cambia l’energia cinetica né la componente parallela. La componente perpendicolare descrive una rotazione a raggio costante; quella parallela un avanzamento uniforme. Con entrambe non nulle la traiettoria è un’elica cilindrica a passo costante intorno alla direzione di B. Il verso di avvolgimento dipende dal segnoq; non si deduce senza tale dato.', 'Con B 1 T e α 1 C/kg invariati, X è lineare in v∥. Da 2 a 3 m/s si passa da 2 a 3 m. Il passo p passa da 4π a 6π m, mentre si chiedeva p/(2π).', 'Isolo v∥=αBX. X 2 m, B 1 T, α 1 C/kg danno v∥2 m/s. Il coefficiente α deve restare nella formula dimensionale: B·m da solo non ha unità di velocità.', 'Isolo B=v∥/(αX). Con 2 m/s, α 1 C/kg e X 2 m si ha B 1 T. Le quantità sono positive e finite; la componente perpendicolare non nulla serve a mantenere un giro e un’elica.', 'A X_A 2 m. B con B 2 T e stessa v∥2 m/s ha X_B 1 m. Rapporto 1/2; un campo maggiore accorcia il periodo e l’avanzamento per giro a v∥ fissata.', 'Proposta X 4 m meno corretto X 2 m=+2 m. Non è la differenza fra p e X; p è 2π volte X e non è richiesto numericamente qui.', 'La relazione dimensionale corretta è v∥=(|q|/m)B[p/(2π)]. Con α 1 C/kg si ottiene per i numeri SI v∥[m/s]=B[T]X[m]. L’abbreviazione numerica sorgente X=v∥/B non deve essere presentata come uguaglianza dimensionale universale senza α. Conservo il coefficiente assegnato e il ramo positivo.', 'α è identico nelle preparazioni. v∥, B scalati diκ₁, κ₂ danno X_B/X_A=κ₁/κ₂. Entrambe le componenti restano non nulle e la rapidità totale resta nel regime non relativistico in entrambi gli stati; non è una rampa di campo applicata alla stessa particella.', 'A X 2 m; B con v∥1 m/s e B 2 T dà X 1/2 m. Rapporto 1/4, fattore 1/2 della velocità parallela diviso per fattore due del campo.', 'Media delle lunghezze(2+1/2)/2=5/4 m. Ai dati medi v∥3/2 m/s e B 3/2 T la legge dà 1 m. Differenza 1/4 m; una media statistica di passi non è il passo derivato dagli ingressi medi.', 'Il bersaglio è(1/4)·2=1/2 m. Con v∥_B 1 m/s e α 1 C/kg, B_B=v∥/(αX)=2 T. Rapporto B_B/B_A=2. L’altro componente deve restare non nullo e compatibile con il regime dichiarato.', 'Riferimento X_A 2 m, lettura 6: a_cal 3 unità/m. Lettura 3/2 implica X_B 1/2 m. Con B_B 2 T e α 1 C/kg: v∥_B=αB_BX_B=1 m/s.', 'Riferimenti X_A 2 m e X_B 1/2 m, letture 5 e 2: guadagno(5−2)/(2−1/2)=2 unità/m, offset 1. Lettura 7 dà X_C 3 m. Con B_C 1 T, v∥_C 3 m/s. Non si deve confondere il guadagno con 2π.', 'Il vincolo numerico v∥=2 B ha coefficiente 2(m/s)/T. Con α 1 C/kg, X=v∥/(αB)=2 m per ogni B>0 compatibile con il regime non relativistico e v⊥ non nulla. La misura è ridondante e lascia infinite coppie, anche restringendo a un intervallo piccolo di B. Esempi B 1 T, v∥2 m/s e B 2 T, v∥4 m/s, con v⊥1 m/s in entrambi: tutti i moduli restano molto minori di c. Non si determina un raggio senza v⊥.']

DISTRACTORS=['H=v_parallel/(αB)=2 m; p 4πm è diverso.1 omette v_parallel 2, 4 aggiunge fattore 2, 0 viola v_parallel>0.', 'm: p è lunghezza e 2π puro. s periodo, m/s rapidità, T campo, 1 adimensionale.', 'Elica cilindrica: componente trasversa circolare e parallela uniforme. Cerchio richiede v_parallel 0, retta v_perp 0, parabola forza assiale e spirale r variabile escluse.', '2→3 m: H segue v_parallel.4/3 inverte, 9/2 quadra, 2 ignora, 6πm è il passo completo.', 'v_parallel=αBH=2 m/s.1/2 reciproco, 4π usa p senza compensare 2π, 0 incompatibile.', 'B 2/(1·2)=1 T.2 T darebbeH 1 m, 1/2 T H 4 m, 4 copia prodotto anziché rapporto.', '1 m/2 m=1/2.2 segueB diretto, 1/4 e 4 quadrato/reciproco, 1 ignora.', '+2 m=4−2.−2 ordine, 2 puro rapporto, 4 proposta, 0 mancato confronto.', 'v_parallel=|q|BH/m. mH/(|q|B) non inverte, m/(|q|BH) ha s/m, BH ha T·m, 2π aggiunge fattore già eliminato.', 'κ₁/κ₂. H non dipende da v_perp ma componente perpendicolare resta non nulla; prodotto, reciproco, quadrato, somma non seguono.', '1/2 m diviso 2 m=1/4.4 reciproco, 1/2 solo un effetto, 2/1 non danno riduzione combinata.', '5/4 m media 2 e 1/2.1 m ingressi medi, 5/2 somma, 3/4 semidifferenza, 2 prima prova. pmedio=2πHmedio.', 'H bersaglio 1/2 m richiedeB 2 T, rapporto 2.1/2 reciproco, 1/4 copiaH, 1 darebbeH 1 m, 4 T H 1/4 m.', 'g 3 m⁻¹, D 3/2→H 1/2 m, v 1 m/s.3 m/s trattaD come H, D 9/2; 1/2 m/s D 3/4; 2 copiaB.', 'g 2 m⁻¹, b 1, D 7→H 3 m, v 3 m/s.7/2 omette offset, D 8; 6 salta g; 2 m/s D 5.', 'v_parallel=[2(m/s)/T]B rendeH 2 m. Infinite coppie anche in un intervallo piccolo nonrel, con v_perp 1 m/s; non si contano 2π né si estende a velocità arbitrarie.']

ASSUMPTIONS=['Particella classica, rapporto |q|/m 1 C/kg; B uniforme, sola forza magnetica, radiazione trascurata. Componenti parallela concorde e perpendicolare entrambe non nulle, velocità totale non relativistica in ogni preparazione/inversa. H=p/(2π) non è né p né r; il segno di q cambia la rotazione.', 'Si chiede la dimensione della grandezza nominata, senza valori numerici o modello di moto specifico; i cinque distrattori sono stati letti dopo la primaria.', 'Caso autonomo classico: particella carica, B uniforme e sole forze magnetiche; componenti parallela e perpendicolare iniziali entrambe non nulle. Non richiede valore numerico del rapporto carica/massa né segno della componente parallela per identificare una elica.', 'Particella classica, rapporto |q|/m 1 C/kg; B uniforme, sola forza magnetica, radiazione trascurata. Componenti parallela concorde e perpendicolare entrambe non nulle, velocità totale non relativistica in ogni preparazione/inversa. H=p/(2π) non è né p né r; il segno di q cambia la rotazione.', 'Particella classica, rapporto |q|/m 1 C/kg; B uniforme, sola forza magnetica, radiazione trascurata. Componenti parallela concorde e perpendicolare entrambe non nulle, velocità totale non relativistica in ogni preparazione/inversa. H=p/(2π) non è né p né r; il segno di q cambia la rotazione.', 'Particella classica, rapporto |q|/m 1 C/kg; B uniforme, sola forza magnetica, radiazione trascurata. Componenti parallela concorde e perpendicolare entrambe non nulle, velocità totale non relativistica in ogni preparazione/inversa. H=p/(2π) non è né p né r; il segno di q cambia la rotazione.', 'Particella classica, rapporto |q|/m 1 C/kg; B uniforme, sola forza magnetica, radiazione trascurata. Componenti parallela concorde e perpendicolare entrambe non nulle, velocità totale non relativistica in ogni preparazione/inversa. H=p/(2π) non è né p né r; il segno di q cambia la rotazione.', 'Particella classica, rapporto |q|/m 1 C/kg; B uniforme, sola forza magnetica, radiazione trascurata. Componenti parallela concorde e perpendicolare entrambe non nulle, velocità totale non relativistica in ogni preparazione/inversa. H=p/(2π) non è né p né r; il segno di q cambia la rotazione.', 'Particella classica, rapporto |q|/m 1 C/kg; B uniforme, sola forza magnetica, radiazione trascurata. Componenti parallela concorde e perpendicolare entrambe non nulle, velocità totale non relativistica in ogni preparazione/inversa. H=p/(2π) non è né p né r; il segno di q cambia la rotazione.', 'Particella classica, rapporto |q|/m 1 C/kg; B uniforme, sola forza magnetica, radiazione trascurata. Componenti parallela concorde e perpendicolare entrambe non nulle, velocità totale non relativistica in ogni preparazione/inversa. H=p/(2π) non è né p né r; il segno di q cambia la rotazione.', 'Particella classica, rapporto |q|/m 1 C/kg; B uniforme, sola forza magnetica, radiazione trascurata. Componenti parallela concorde e perpendicolare entrambe non nulle, velocità totale non relativistica in ogni preparazione/inversa. H=p/(2π) non è né p né r; il segno di q cambia la rotazione.', 'Particella classica, rapporto |q|/m 1 C/kg; B uniforme, sola forza magnetica, radiazione trascurata. Componenti parallela concorde e perpendicolare entrambe non nulle, velocità totale non relativistica in ogni preparazione/inversa. H=p/(2π) non è né p né r; il segno di q cambia la rotazione.', 'Particella classica, rapporto |q|/m 1 C/kg; B uniforme, sola forza magnetica, radiazione trascurata. Componenti parallela concorde e perpendicolare entrambe non nulle, velocità totale non relativistica in ogni preparazione/inversa. H=p/(2π) non è né p né r; il segno di q cambia la rotazione.', 'Particella classica, rapporto |q|/m 1 C/kg; B uniforme, sola forza magnetica, radiazione trascurata. Componenti parallela concorde e perpendicolare entrambe non nulle, velocità totale non relativistica in ogni preparazione/inversa. H=p/(2π) non è né p né r; il segno di q cambia la rotazione.', 'Particella classica, rapporto |q|/m 1 C/kg; B uniforme, sola forza magnetica, radiazione trascurata. Componenti parallela concorde e perpendicolare entrambe non nulle, velocità totale non relativistica in ogni preparazione/inversa. H=p/(2π) non è né p né r; il segno di q cambia la rotazione.', 'Particella classica, rapporto |q|/m 1 C/kg; B uniforme, sola forza magnetica, radiazione trascurata. Componenti parallela concorde e perpendicolare entrambe non nulle, velocità totale non relativistica in ogni preparazione/inversa. H=p/(2π) non è né p né r; il segno di q cambia la rotazione.']

UNITS={1: 'meter', 2: 'meter', 3: '', 4: 'meter', 5: 'meter/second', 6: 'tesla', 7: '', 8: 'meter', 9: 'meter/second', 10: '', 11: '', 12: 'meter', 13: '', 14: 'meter/second', 15: 'meter/second', 16: ''}

NUMERIC_UNITS={1: 'm', 5: 'm/s', 6: 'T', 14: 'm/s', 15: 'm/s'}

SUFFIX={8: ' m', 12: ' m'}

NON_NUMERIC_DISTRACTORS={8: {'2'}}

SVG_REVIEW='XML e native indipendente completo 640 × 1560 letti. Proiezione trasversa circolare r 1 m per q positiva, B uscente, v_perp 1 m/s; freccia oraria corretta, componente parallela assente da quella proiezione. Grafico z/(2π) contro giri n: origine(130, 870), x=130+360 n, y=870−120 z/(2π)[m]; a n 1 i punti(490, 630), (490, 810) danno H 2 e 1/2 m. Il conteggio di giri trascorsi può essere frazionario. Barre 320/80/200 da 150 danno 2/1/2/5/4 m, scala 160 coordinate/m. Nessuna identificazione del raggio col passo.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION', 16: 'SYMBOLIC_MANUAL_DERIVATION', 3: 'NO_STUDENT_CALCULATION'}

CANDIDATE_REF='1f9274d1ea3ff4d3ad0a97f7f820311bdf6a05ed'

PRIMARY_SHA256='c0d2d26dd79ece4c7ad2ff06d8ddd142acf02eb468b971b3e254ed06e16528bc'

REVIEWED_MODEL_SHA256='ffcffcf42b8f76159845cb9be8f16cb3529b50c5bb37790b7785ee032ed1b020'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='7f26772b85bffbb1255589393ddad4d7964cecdbf6b0ab15dc54187c996a44e5'

REVIEWED_BINDINGS_SHA256='531eb209333b2ffda5f9ce1ec0b8e053d8af7d797002eba3f83b6385717b3a15'

REVIEWED_CANDIDATES={'AR-u6-magnetic-helix-pitch-01': 'c7509f59f8ced65ca486a5bb80d2907640fa2a835448b6627e7905c0c43a7951', 'AR-u6-magnetic-helix-pitch-02': 'adb2170d8ca25178b5d46614627dcf9161b686a20c8d85cb8e64e23c49069a13', 'AR-u6-magnetic-helix-pitch-03': '06dae04f36d70358c80ba26908da8a5fbc556fa9d5a3d2667ad378fabdb772b3', 'AR-u6-magnetic-helix-pitch-04': '76c8b507031ea11256a56f1e60100b387ead880bccecc46bb9a28295250db8ab', 'AR-u6-magnetic-helix-pitch-05': '0dc996b7ddabc0505e7bdfe09acee7bfe34249a4e03c96f9b679981b4478b01f', 'AR-u6-magnetic-helix-pitch-06': '6fca01e45bad2e619d9b65cfe46d9703967aa8d3b7ceea7baaf12bded4540ea0', 'AR-u6-magnetic-helix-pitch-07': '0ec793248e5f68451900a3bd724e1ebbf1d50baa3aa16f5aad69deab792c05d7', 'AR-u6-magnetic-helix-pitch-08': 'af36a31b210d2b938cb274309a0a30f9206139e4436b61f811d53834d3cbd570', 'AR-u6-magnetic-helix-pitch-09': 'a138370ff1f6cabb353f313483c94572ff7f658519d3c67b58dc02607fdf3d5e', 'AR-u6-magnetic-helix-pitch-10': 'd6c70d66dcc997fe6da321c66bd2ef4a1219171fd14647b7d3aa2c078d4b943d', 'AR-u6-magnetic-helix-pitch-11': 'a521abc0fb83f35ff1748e132bab2684e634dae4a6dd72ea011d1febe018d539', 'AR-u6-magnetic-helix-pitch-12': '492aa39c0862d17ed8785fb30e8cbabca2a8e520c41bae03d3d6ae9d773a28e2', 'AR-u6-magnetic-helix-pitch-13': '3222c91d017b637ec1f61bd09afb6691cabd0340fe3d989b0bfd2054176e33d6', 'AR-u6-magnetic-helix-pitch-14': 'ce4892f1baca1afc018b5771c428333dc9b543e4fbff533c2fde8d77e853e5be', 'AR-u6-magnetic-helix-pitch-15': 'e75fb8f1cbb797366ff23ef0199de8b4fa05bc1ea6af9d3de345b7fad1202afe', 'AR-u6-magnetic-helix-pitch-16': 'cbf3e36a71c5e5654b417107ab5358d0eaad430608b061778cf6bd8b5c296103'}

READ_SOURCE_SHA256={'u6-magnetic-helix-pitch-01': '11ffea3a1847ae69e0c30ca3229312d883b62a3b35c4d328f3a69af09315703b', 'u6-magnetic-helix-pitch-02': '2a3acb29e556b09c97b09e4401eb8a27de5564dd67506d6f9360ac2db427e6d1', 'u6-magnetic-helix-pitch-03': 'bc38193d8a909a7946e2f90d474c651c8a1aed716f9aaf12dcefb1b73a9d6709', 'u6-magnetic-helix-pitch-04': '4c3bd944c72be511b82c66744f964ce490b21fad9a5b4a9b120dc5826e0b9874', 'u6-magnetic-helix-pitch-05': 'd3cfb0ba3c04c3048eb33d404f2aedd6cd2a30904f8370a4442fde087f84eba2', 'u6-magnetic-helix-pitch-06': '060bcb0ff731ad7a323aab79a0df5eb71ae69781023833695fa255906f951c3b', 'u6-magnetic-helix-pitch-07': '2d2d52dfcb4c91eb67cbf7c2cb7c2550376cbf79d179c22a696172ec65f05e36', 'u6-magnetic-helix-pitch-08': '7f625fee1e055cc150e4f3fc7b80a9618fbf578c17013cfa66d6e7182007ff53', 'u6-magnetic-helix-pitch-09': '66ddf6399b3d46018b209ea410a4b6c66e3344158e64d0d15605f20897bb07d1', 'u6-magnetic-helix-pitch-10': '376c81e170833f71d64fb7d1244457997ad5e472d961dc5b1dd4561895d9ac93', 'u6-magnetic-helix-pitch-11': '5e7fd0a732aaf331759d86c1574900b88687213345c8ece77073d3fe441e6007', 'u6-magnetic-helix-pitch-12': 'bd7ce9725321919e166d79ce9e147a07e324b03621cab550007c7f134cf26c89', 'u6-magnetic-helix-pitch-13': '3909c501e72d8c5542b683e220459a26b714e79c6b12886a7d7bbbcd9943a48d', 'u6-magnetic-helix-pitch-14': '4b0bc8b3165133e8fd0e491dfb64e0ce6d6c8c6ee234c374d8aa6020669ec3a3', 'u6-magnetic-helix-pitch-15': '6f8ac2e40266a03d12364346d3f0812e0280b15e4728151fb62e1704a0d07ed0', 'u6-magnetic-helix-pitch-16': '477b1306bc872dbc2e19e36861b434a11ddbecb5a8d5420fe9693eee81fb4253'}

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
