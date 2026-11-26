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
FAMILY='thin-lens-real-image'
EXPECTED_IDS={'AR-u7-thin-lens-real-image-08', 'AR-u7-thin-lens-real-image-10', 'AR-u7-thin-lens-real-image-13', 'AR-u7-thin-lens-real-image-09', 'AR-u7-thin-lens-real-image-01', 'AR-u7-thin-lens-real-image-15', 'AR-u7-thin-lens-real-image-04', 'AR-u7-thin-lens-real-image-05', 'AR-u7-thin-lens-real-image-12', 'AR-u7-thin-lens-real-image-02', 'AR-u7-thin-lens-real-image-07', 'AR-u7-thin-lens-real-image-11', 'AR-u7-thin-lens-real-image-14', 'AR-u7-thin-lens-real-image-06', 'AR-u7-thin-lens-real-image-03', 'AR-u7-thin-lens-real-image-16'}
REVIEWED_SKILLS={1: 'C5-L10', 2: 'C5-L10', 3: 'C5-L10', 4: 'C5-L10', 5: 'C5-L10', 6: 'C5-L10', 7: 'C5-L10', 8: 'C5-L10', 9: 'C5-L10', 10: 'C5-L10', 11: 'C5-L10', 12: 'C5-L10', 13: 'C5-L10', 14: 'C5-L10', 15: 'C5-L10', 16: 'C5-L10'}

@lru_cache(maxsize=1)
def oracle():
    p,q,f,k1,k2=sp.symbols('p q f k1 k2',positive=True)
    unique([p*q/(p+q),p*q/(p-q),p+q,(p+q)/(p*q),p*q],p*q/(p+q))
    unique([k1*k2*(p-f)/(k2*p-k1*f),k1*k2,k1/k2,(k2*p-k1*f)/(p-f),k1+k2],k1*k2*(p-f)/(k2*p-k1*f))
    d=model.primary_only_derivations()[259]
    out=[d[n]for n in range(1,17)]
    out[1]='cm'
    out[2]='Virtuale, diritta e ingrandita, sul lato dell’oggetto'
    out[3]='Da 4/3 a 4 cm'
    out[8]='f = p q / (p + q)'
    out[9]='κ₁ κ₂ (p − f) / (κ₂ p − κ₁ f)'
    return out

MANUAL=['Nel modello parassiale della lente sottile convergente, 1/f=1/p+1/q. Moltiplico per fpq: pq=fq+fp, quindi q=fp/(p−f). Con f1cm,p4cm: q4/3cm, positiva perché p>f. La superficie e lo spessore della lente sono idealizzati.', 'q è una lunghezza in cm, il suo reciproco ha cm⁻¹. La primaria precedeva tutte le alternative; dopo la freeze tutti e cinque i distrattori/proposte sono stati letti singolarmente.', 'Caso autonomo p<f, fuori dal ramo di immagine reale degli altri esercizi. q=fp/(p−f)<0: immagine virtuale sul lato dell’oggetto. L’ingrandimento m=−q/p=f/(f−p)>1 è positivo, quindi immagine diritta e ingrandita nel modello parassiale. Non si proietta su uno schermo sul lato opposto.', 'A:f1,p4→q4/3cm. B:f2,p4→q4cm. A p costante avvicinare f a p aumenta q; non è una proporzione q∝f perché cambia anche il denominatore.', 'Isolo f=pq/(p+q). Con p4cm,q4/3cm: prodotto16/3cm² diviso16/3cm dà f1cm. Per p,q positivi il risultato è minore di entrambi, coerente con un oggetto oltre il fuoco.', 'Da q(p−f)=fp ricavo p(q−f)=qf, dunque p=qf/(q−f). Con q4/3cm,f1cm si ottiene p4cm. L’inversa richiede q>f>0; altrimenti il ramo di oggetto e immagine reali non è quello dichiarato.', 'A:q4/3cm. B:f1,p6→q6/5cm. Rapporto(6/5)/(4/3)=9/10. Allontanare l’oggetto avvicina l’immagine al fuoco, senza oltrepassarlo nel ramo reale.', 'Proposto8/3cm meno corretto4/3cm dà+4/3cm. Il rapporto2 è puro e non risponde allo scarto richiesto.', 'Isolo f=pq/(p+q) sommando le potenze reciproche, oppure dalla relazione pq=f(p+q). Il numeratore ha dimensioneL² e il denominatoreL; per p,q>0 non compare una differenza rischiosa o un ramo negativo.', 'Rapporto q_B/q_A=κ₁κ₂(p−f)/(κ₂p−κ₁f). Le condizioni includonoκ₂p>κ₁f>0 oltre a p>f>0. Non si cancella il denominatore come se fosse un semplice prodotto fp.', 'A:q4/3cm. B:f2,p6→q12/4=3cm. Rapporto3/(4/3)=9/4. Entrambi gli stati hanno oggetto oltre il fuoco.', 'Media(4/3+3)/2=13/6cm. Dati medi f3/2cm,p5cm→q15/7cm. Differenza13/6−15/7=(91−90)/42=1/42cm, positiva. Le frazioni restano esatte.', 'Target q_B=(9/4)(4/3)=3cm. Con f_B2cm, p_B=qf/(q−f)=6cm. Rapporto p_B/p_A=6/4=3/2 e p_B>f_B.', 'Riferimento q4/3cm,D4→guadagno3cm⁻¹. D9→q3cm. Con p6cm, f=pq/(p+q)=18/9=2cm. Prima display, poi relazione dei punti coniugati.', 'Riferimenti q4/3cm,3cm e letture11/3,7: guadagno[(7−11/3)/(3−4/3)]=2cm⁻¹, offset1. D9→q4cm; con p4cm, f16/8=2cm. Le due letture individuano una taratura non degenere.', 'Vincolo f=p/4: q=(p²/4)/(3p/4)=p/3. La misura q4/3cm impone p4cm e f1cm. Unica coppia positiva, con p>f verificata; non rimane una famiglia continua.']

DISTRACTORS=['1/q1−1/4=3/4cm⁻¹→q4/3cm.3/4 numero inverso,4 copia p,5 somma,−4/3 ramo virtuale escluso.', 'q lunghezza cm,cm⁻¹ reciproco,1 ingrandimento,gradi angolo,s tempo.', '0<p<f→q<0,m=f/(f−p)>1: virtuale,diritta,ingrandita. Reale richiede intersezione effettiva,capovolta m<0,nessuna confonde virtuale con assente.', '4/3→4cm.8/3 cambia solo numeratore,2/3 dimezza,immutato ignora,infinito solo p=f non qui.', 'f=pq/(p+q)=1cm.16/3 somma,3 non legge,4 fuoco impossibile per q finito.', 'p=fq/(q−f)=4cm,q>f.1/4 copia reciproco,7/3 somma, p<f incompatibile reale.', '(6/5)/(4/3)=9/10.10/9 reciproco,3/2 solo p,6/5 valore numerico di q_B,1 ignora.', '8/3−4/3=4/3cm;−4/3 ordine,8/3 proposta,2 rapporto non distanza,0 falsa coniugazione.', 'f=pq/(p+q). Segno meno non somma reciproci,p+q altra legge,(p+q)/(pq) L⁻¹,pq L².', 'κ₁κ₂(p−f)/(κ₂p−κ₁f),nuovo denominatore>0. Solo prodotto ignora denominatore,quoziente altra legge,rapporto denominatori perde prodotto,somma2 per identiche.', '3/(4/3)=9/4.4/9 reciproco,2 solo f,3/2 solo p,3 valore numerico q_B.', '13/6cm;15/7 dati medi,13/3 somma,4/3 e3 singoli piani. Differenza1/42cm.', 'Target3cm,p_B2·3/(3−2)=6cm,rapporto3/2.2/3 inverso,9/4 target,2 f,1 darebbe q4cm.', 'g3,D9→q3cm,f6·3/(6+3)=2cm.18/5 usa display come q,3 copia q,6 p.', 'g2,b1,D9→q4cm,f2cm.36/17 omette b usando q9/2,4 copia q,1 vecchia focale.', 'f=p/4→q=p/3, misura q4/3cm→p4cm.1 copia f,4/9 usa q/3; non infinite con q assoluto.']

ASSUMPTIONS=['Lente sottile convergente parassiale, stesso mezzo sui due lati, f>0 e oggetto reale p>f salvo il03 autonomo. q positivo sul lato d’uscita per immagine reale, distanze coerenti in cm; inversa in p richiede q>f. Variazioni tra lenti/preparazioni rispettano il nuovo ramo p_B>f_B, senza applicare la formula reale al fuoco.', 'Caso dimensionale autonomo: Lente sottile convergente parassiale, stesso mezzo sui due lati, f>0 e oggetto reale p>f salvo il03 autonomo. q positivo sul lato d’uscita per immagine reale, distanze coerenti in cm; inversa in p richiede q>f. Variazioni tra lenti/preparazioni rispettano il nuovo ramo p_B>f_B, senza applicare la formula reale al fuoco.', 'Caso autonomo03:oggetto reale dentro il fuoco0<p<f; q negativo sul lato dell’oggetto e m=−q/p>1. Non applicare p>f dal prefisso degli altri15 record.', 'Lente sottile convergente parassiale, stesso mezzo sui due lati, f>0 e oggetto reale p>f salvo il03 autonomo. q positivo sul lato d’uscita per immagine reale, distanze coerenti in cm; inversa in p richiede q>f. Variazioni tra lenti/preparazioni rispettano il nuovo ramo p_B>f_B, senza applicare la formula reale al fuoco.', 'Lente sottile convergente parassiale, stesso mezzo sui due lati, f>0 e oggetto reale p>f salvo il03 autonomo. q positivo sul lato d’uscita per immagine reale, distanze coerenti in cm; inversa in p richiede q>f. Variazioni tra lenti/preparazioni rispettano il nuovo ramo p_B>f_B, senza applicare la formula reale al fuoco.', 'Lente sottile convergente parassiale, stesso mezzo sui due lati, f>0 e oggetto reale p>f salvo il03 autonomo. q positivo sul lato d’uscita per immagine reale, distanze coerenti in cm; inversa in p richiede q>f. Variazioni tra lenti/preparazioni rispettano il nuovo ramo p_B>f_B, senza applicare la formula reale al fuoco.', 'Lente sottile convergente parassiale, stesso mezzo sui due lati, f>0 e oggetto reale p>f salvo il03 autonomo. q positivo sul lato d’uscita per immagine reale, distanze coerenti in cm; inversa in p richiede q>f. Variazioni tra lenti/preparazioni rispettano il nuovo ramo p_B>f_B, senza applicare la formula reale al fuoco.', 'Lente sottile convergente parassiale, stesso mezzo sui due lati, f>0 e oggetto reale p>f salvo il03 autonomo. q positivo sul lato d’uscita per immagine reale, distanze coerenti in cm; inversa in p richiede q>f. Variazioni tra lenti/preparazioni rispettano il nuovo ramo p_B>f_B, senza applicare la formula reale al fuoco.', 'Lente sottile convergente parassiale, stesso mezzo sui due lati, f>0 e oggetto reale p>f salvo il03 autonomo. q positivo sul lato d’uscita per immagine reale, distanze coerenti in cm; inversa in p richiede q>f. Variazioni tra lenti/preparazioni rispettano il nuovo ramo p_B>f_B, senza applicare la formula reale al fuoco.', 'Lente sottile convergente parassiale, stesso mezzo sui due lati, f>0 e oggetto reale p>f salvo il03 autonomo. q positivo sul lato d’uscita per immagine reale, distanze coerenti in cm; inversa in p richiede q>f. Variazioni tra lenti/preparazioni rispettano il nuovo ramo p_B>f_B, senza applicare la formula reale al fuoco.', 'Lente sottile convergente parassiale, stesso mezzo sui due lati, f>0 e oggetto reale p>f salvo il03 autonomo. q positivo sul lato d’uscita per immagine reale, distanze coerenti in cm; inversa in p richiede q>f. Variazioni tra lenti/preparazioni rispettano il nuovo ramo p_B>f_B, senza applicare la formula reale al fuoco.', 'Lente sottile convergente parassiale, stesso mezzo sui due lati, f>0 e oggetto reale p>f salvo il03 autonomo. q positivo sul lato d’uscita per immagine reale, distanze coerenti in cm; inversa in p richiede q>f. Variazioni tra lenti/preparazioni rispettano il nuovo ramo p_B>f_B, senza applicare la formula reale al fuoco.', 'Lente sottile convergente parassiale, stesso mezzo sui due lati, f>0 e oggetto reale p>f salvo il03 autonomo. q positivo sul lato d’uscita per immagine reale, distanze coerenti in cm; inversa in p richiede q>f. Variazioni tra lenti/preparazioni rispettano il nuovo ramo p_B>f_B, senza applicare la formula reale al fuoco.', 'Lente sottile convergente parassiale, stesso mezzo sui due lati, f>0 e oggetto reale p>f salvo il03 autonomo. q positivo sul lato d’uscita per immagine reale, distanze coerenti in cm; inversa in p richiede q>f. Variazioni tra lenti/preparazioni rispettano il nuovo ramo p_B>f_B, senza applicare la formula reale al fuoco.', 'Lente sottile convergente parassiale, stesso mezzo sui due lati, f>0 e oggetto reale p>f salvo il03 autonomo. q positivo sul lato d’uscita per immagine reale, distanze coerenti in cm; inversa in p richiede q>f. Variazioni tra lenti/preparazioni rispettano il nuovo ramo p_B>f_B, senza applicare la formula reale al fuoco.', 'Lente sottile convergente parassiale, stesso mezzo sui due lati, f>0 e oggetto reale p>f salvo il03 autonomo. q positivo sul lato d’uscita per immagine reale, distanze coerenti in cm; inversa in p richiede q>f. Variazioni tra lenti/preparazioni rispettano il nuovo ramo p_B>f_B, senza applicare la formula reale al fuoco.']

UNITS={1: 'centimeter', 2: 'centimeter', 3: '', 4: 'centimeter', 5: 'centimeter', 6: 'centimeter', 7: '', 8: 'centimeter', 9: 'centimeter', 10: '', 11: '', 12: 'centimeter', 13: '', 14: 'centimeter', 15: 'centimeter', 16: 'centimeter'}

NUMERIC_UNITS={5: 'cm', 6: 'cm', 14: 'cm', 15: 'cm', 16: 'cm'}

SUFFIX={}

NON_NUMERIC_DISTRACTORS={}

SVG_REVIEW='SVG640×1740 letto XML e native intero dopo child0. Asse x:oggetto60,lente360,fuochi285/435,immagine460; scala75 coordinate/cm dà p4,f1,q4/3. Altezze72/−24, stesso fattore verticale e ingrandimento−1/3; anisotropia dichiarata,angoli non misurabili. Raggi intersecano esattamente(460,344); barre120/270/195 per4/3,3,13/6cm con scala90 comune. Curva solo f1 usa x150+65p,y1570−90q; punto(410,1450) per(4,4/3),asintoti p1 e q1. Segmenti campionati dichiarati visualizzazione,coordinate arrotondate a5decimali,nessuna domanda con calcolatrice.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION', 3: 'NO_STUDENT_CALCULATION'}

CANDIDATE_REF='4a4e4f91ef352498c66aaf85528cb3f538dbd893'

PRIMARY_SHA256='5b685efd1f9081ea829990d63cf50291ffc298c922b8aac2b169b8de5cdaa3e4'

REVIEWED_MODEL_SHA256='f32615b7796d7dcb7c5d4e9d58566922ed01dac5f1dfd884fef5efd0108492c7'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='e479b6577027a53a4868aa30528e3ce5e32ac5773679102b3b2c99a5f05ea6b5'

REVIEWED_BINDINGS_SHA256='b955ee306fa1b4710c1d893af76452f14f30f45af2617f8dac4b84bbac4754e6'

REVIEWED_CANDIDATES={'AR-u7-thin-lens-real-image-01': '511ff590e0eae9454f579080f16c3ee1211b6ac93e1f859329ebe410c01b36f0', 'AR-u7-thin-lens-real-image-02': '0ca8778996917666e7d939f3b046ad8783616661984b6771fc06caf4cf2a8cec', 'AR-u7-thin-lens-real-image-03': '0656c1fc8b206b6f69372f93548e57b0aa532d452ff0ea25c600eb692546822f', 'AR-u7-thin-lens-real-image-04': '9bc8f981c70e1a67081536b61e7d6daeac5b7e2d784147d8e095f8695ffc7863', 'AR-u7-thin-lens-real-image-05': 'e48b7393bb91fb7230e2932bd330e2cc485b3d4bc9f29dfe7203449b1b13ee6c', 'AR-u7-thin-lens-real-image-06': '2ec84a7bbc894aceb03dbc1ced13a00631c333b9d9cd3a3a8f085bfe8596cd42', 'AR-u7-thin-lens-real-image-07': 'd0552b53772e56021891687d602f8bbf043946d1f77a80f66ac3ef7d13d4d0a8', 'AR-u7-thin-lens-real-image-08': 'a44eaee11ed2c66b6750ec80be5daaf66a0a2190e29d614fccbacd640bc27b08', 'AR-u7-thin-lens-real-image-09': 'ccde372ad647431b43151ab641ce776b5cdf67ad3b6235f44f508534a2ef3d26', 'AR-u7-thin-lens-real-image-10': '381f7afd8efa115d39687e4c2a61a6e988dc55c6349ed997c3f779e953e19bac', 'AR-u7-thin-lens-real-image-11': '461af7040a697af983a5a3490cdd8314e685c1dfb02d1e555a6ff41d775b277d', 'AR-u7-thin-lens-real-image-12': '1c61ea5ab530a040c766d585281fca3064504404458ed1529eaf9fbb24d830ca', 'AR-u7-thin-lens-real-image-13': '5f89c1deedca74af2f916000f2570acc6ff6f09fd5186d1fe17824cb46f3875a', 'AR-u7-thin-lens-real-image-14': 'eabf4f168e7614f6e44a6ed44be294578988f879aea6fa947f667a7fe16af938', 'AR-u7-thin-lens-real-image-15': '7de12cc32215f78edffbe1a34b84ed22d8a82d6063ac2a8942398a9da0b3bb06', 'AR-u7-thin-lens-real-image-16': 'ac1366b39d5787f0352b46d65e6fa1b4db7b82847f681f80846d302d27386a07'}

READ_SOURCE_SHA256={'u7-thin-lens-real-image-01': '7ca07a98025d4662ae609fc2960bc21d8b445cb10c258ab3216b7de3c0dea2dc', 'u7-thin-lens-real-image-02': '1e7b64010604d6098619599e0cfd3e3c4da8eb3d06f1e18a13d3512837314d56', 'u7-thin-lens-real-image-03': 'c709e165957666cb4d666ac616c9b9327337098f771b711fc220ed2e2b36d32f', 'u7-thin-lens-real-image-04': '1b72211af390329939e7ae339f6c68162adac34ce05e644c9432335836aa0933', 'u7-thin-lens-real-image-05': '520d83db6cca79dec5c1fb1c99d53dea5daa6e6c2be7c2b7b736c03c8e91619a', 'u7-thin-lens-real-image-06': 'dd5c6d5d32f953027ab6435dfe618d910ff65ffb9cdd7fd236fad3a476a45128', 'u7-thin-lens-real-image-07': 'ad9aed01429e0936c10ab053460aeae6991d3ef17c6119b995d7b79a4fd76d47', 'u7-thin-lens-real-image-08': '504a04a751df91714a1af6fad6149899705509479dc68159fcb3befb834d3b63', 'u7-thin-lens-real-image-09': 'fda69b83efbb5aa806dfe52b44e6c879d69f93e1a5b331f66b857f91150c33b6', 'u7-thin-lens-real-image-10': '441ac933ea44bcd6f791ff0102be72d1aaaf6bd5dad6251f6d43a0677bfaa678', 'u7-thin-lens-real-image-11': '6faf21108f195487abb85df6e7e54415ec836cdd5b00f91ef66bc6b41c3e5071', 'u7-thin-lens-real-image-12': 'e91a05e2fd3c717bf4d669ceae3999e4e88a6764c7c60cc85ebbef79f61927fa', 'u7-thin-lens-real-image-13': 'f854b1220cfade8061ab0472e2eafb6eda0d8a7509d5552231a3c662dea65a89', 'u7-thin-lens-real-image-14': 'bfd829734651b3d60735f3b7e3e816380b2da4a1eb275e0a827cdda97fceb192', 'u7-thin-lens-real-image-15': '31fb7a96ff9d6b6153c5534b4fb1e35b75b41ad5e80574a4ad0df4f46805ac4a', 'u7-thin-lens-real-image-16': 'f95b339a1699a64fdf2ee4e2f86d17f76edb65a3ada3690268c06ece8ff17c46'}

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
