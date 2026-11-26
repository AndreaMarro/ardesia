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
FAMILY='snell-refracted-sine'
EXPECTED_IDS={'AR-u7-snell-refracted-sine-12', 'AR-u7-snell-refracted-sine-04', 'AR-u7-snell-refracted-sine-08', 'AR-u7-snell-refracted-sine-14', 'AR-u7-snell-refracted-sine-01', 'AR-u7-snell-refracted-sine-06', 'AR-u7-snell-refracted-sine-15', 'AR-u7-snell-refracted-sine-16', 'AR-u7-snell-refracted-sine-09', 'AR-u7-snell-refracted-sine-03', 'AR-u7-snell-refracted-sine-13', 'AR-u7-snell-refracted-sine-11', 'AR-u7-snell-refracted-sine-05', 'AR-u7-snell-refracted-sine-07', 'AR-u7-snell-refracted-sine-02', 'AR-u7-snell-refracted-sine-10'}
REVIEWED_SKILLS={1: 'C5-L09', 2: 'C5-L09', 3: 'C5-L09', 4: 'C5-L09', 5: 'C5-L09', 6: 'C5-L09', 7: 'C5-L09', 8: 'C5-L09', 9: 'C5-L09', 10: 'C5-L09', 11: 'C5-L09', 12: 'C5-L09', 13: 'C5-L09', 14: 'C5-L09', 15: 'C5-L09', 16: 'C5-L09'}

@lru_cache(maxsize=1)
def oracle():
    s,n,r,k1,k2=sp.symbols('s n r k1 k2',positive=True)
    unique([s/n,n*s,n/s,s-n,s/n**2],s/n)
    unique([n*r,r/n,n/r,r-n,n*n*r],n*r)
    unique([k1/k2,k1*k2,k2/k1,k1*k1/k2,k1+k2],k1/k2)
    d=model.primary_only_derivations()[257]
    out=[d[n]for n in range(1,17)]
    out[1]='1, adimensionale'
    out[2]='s_r = s_i / n'
    out[3]='Da 1/4 a 3/8'
    out[8]='s_i = n s_r'
    out[9]='κ₁ / κ₂'
    out[15]='Infinite coppie, con 1 ≤ n ≤ 4 e s_i = n/4'
    return out

MANUAL=['Snell dall’aria con indice1: sinθ_i=n sinθ_r. Quindi s_r=s_i/n. Con s_i1/2,n2 segue s_r1/4. Gli angoli sono misurati dalla normale; non serve calcolare arcsin o approssimare gradi.', 'Il seno è un rapporto puro di lunghezze. La primaria precedeva tutte le alternative; dopo la freeze tutti e cinque i distrattori/proposte sono stati letti singolarmente.', 'La relazione simbolica è sinθ_r=s_i/n. Per0<s_i≤1,n≥1 si ha0<s_r≤1/n≤1: il raggio nel mezzo più rifrangente si avvicina alla normale. La frequenza resta invariata a un’interfaccia stazionaria, ma non si chiede la lunghezza d’onda.', 'A:s_r=(1/2)/2=1/4. B:(3/4)/2=3/8. Rapporto3/2 fra i seni, non fra gli angoli; non si assume proporzionalità θ_r∝θ_i.', 'Isolo s_i=n s_r=2·1/4=1/2. Il risultato deve rispettare0<s_i≤1; una misura con n s_r>1 sarebbe incompatibile con il dominio.', 'Caso autonomo con lastra a facce parallele. Prima interfaccia: s_interno=(3/5)/(3/2)=2/5. Alla seconda, verso aria, s_out=(3/2)(2/5)=3/5. Il raggio emergente è parallelo all’incidente, pur potendo essere lateralmente spostato. Non vi è riflessione totale: il seno interno2/5 è minore del limite2/3.', 'A:s_r1/4. B:s_r=(1/2)/(3/2)=1/3. Rapporto(1/3)/(1/4)=4/3, inverso del rapporto degli indici. Entrambi i seni sono fisici.', 'Corretto1/4; proposto1/2. Scarto proposto meno corretto=+1/4, puro. Non si sottraggono angoli che non sono stati richiesti.', 'Isolo s_i=n sinθ_r. La positività non basta: occorre n sinθ_r≤1 e n≥1. Il seno rifratto non è l’angolo rifratto.', 'Fra prove s_r,B/s_r,A=(κ₁s_i/(κ₂n))/(s_i/n)=κ₁/κ₂. I domini impongono0<κ₁s_i≤1 eκ₂n≥1; non bastaκ₁,κ₂>0. Le variazioni sono fra preparazioni.', 'A:s_r1/4. B:(3/4)/(3/2)=1/2. Rapporto2. Il seno incidente cresce e l’indice cala: i due effetti aumentano entrambi il seno rifratto.', 'Media(1/4+1/2)/2=3/8. Ai dati medi s_i5/8,n7/4, il modello darebbe5/14. Differenza3/8−5/14=1/56, positiva. Nessuna valutazione trigonometrica decimale.', 'Target s_r,B=2·1/4=1/2. Con s_i,B3/4 serve n_B=(3/4)/(1/2)=3/2. Rapporto n_B/n_A=3/4, con indice finale ancora≥1.', 'Riferimento s_r1/4,D3/4→guadagno3. D3/2→s_r1/2. Con n3/2 il seno incidente è3/4. Il display e il seno sono puri ma vanno comunque distinti.', 'Riferimenti s_r1/4 e1/2, D3/2 e2: guadagno(2−3/2)/(1/2−1/4)=2 e offset1. D7/4→s_r3/8. Con n2 segue s_i3/4.', 'Vincolo s_i=n/4 rende s_r1/4 identico alla misura: dato ridondante. Esistono infinite coppie continue con1≤n≤4 e s_i=n/4. Il bordo s_i1 è incidenza radente, da intendere come limite del modello; anche restringendo al passaggio effettivo s_i<1 restano infinite coppie1≤n<4. Esempi(n,s_i)=(1,1/4),(2,1/2),(3,3/4).']

DISTRACTORS=['(1/2)/2=1/4;1 moltiplica per n,1/2 ignora n,2 non è seno reale,negativo fuori ramo.', 'Seno puro come rapporto di lunghezze; gradi/rad descrivono l’angolo, m/m⁻¹ altre grandezze.', 'Snell s_i=n s_r→s_r=s_i/n. Prodotto o reciproco possono superare1, differenza non positiva, n² assente.', '1/4→3/8.1/6 falsa dipendenza inversa,3/2 fuori ramo,1/4 ignora,9/16 quadrato senza legge.', '2·1/4=1/2.1/8 riapplica avanti,2 fuori seno,1/4 omette n,−1/2 fuori ramo.', 'Interno(3/5)/(3/2)=2/5; fuori(3/2)(2/5)=3/5.2/5 resta interno,9/10 omette prima rifrazione,1/0 non ricostruiscono ingresso.', '(1/3)/(1/4)=4/3.3/4 segue indice diretto,1/3 e1/4 singole uscite,1 ignora mezzo.', '1/2−1/4=1/4;−1/4 ordine,1/2 proposta,2 rapporto,0 accetta.', 's_i=n s_r con0<n s_r≤1. Dividere riapplica avanti,reciproco/n² falsi, differenza non positiva.', 'κ₁/κ₂. Prodotto rende n diretto, reciproco scambia ruoli,κ₁² potenza assente, somma2 per identiche.', '(1/2)/(1/4)=2.1/2 reciproco,3/2 sola incidenza,4/3 solo indice,3/4 somma seni.', '3/8;5/14 modello ai dati medi,3/4 somma,1/4 o1/2 singola lettura. Differenza esatta1/56.', 'Target1/2, n_B(3/4)/(1/2)=3/2, rapporto3/4.4/3 reciproco,2 solo target,3/2 non diviso,1 dà3/8.', 'g3,D3/2→s_r1/2, s_i3/4.9/4 usa display come seno,1/2 è rifratto,1/4 riferimento,1 display errato.', 'g2,b1,D7/4→s_r3/8, s_i3/4.7/4 omette b,3/8 rifratto,1/2 vecchia incidenza,1 display errato.', 'Misura ridondante;1≤n≤4 con s_i=n/4. Oltre4 seno>1,sotto1 indice escluso. Esistono infinite coppie anche escludendo il solo endpoint radente; una/due/nessuna false.']

ASSUMPTIONS=['Interfaccia piana ferma, ottica geometrica monocromatica aria n₁=1 verso mezzo n≥1. Angoli dalla normale, 0<s_i≤1; il bordo s_i=1 è soltanto limite radente. Le inverse devono dare n s_r≤1. Fattori tra prove non modificano l’indice entro una singola prova.', 'Caso dimensionale autonomo: Interfaccia piana ferma, ottica geometrica monocromatica aria n₁=1 verso mezzo n≥1. Angoli dalla normale, 0<s_i≤1; il bordo s_i=1 è soltanto limite radente. Le inverse devono dare n s_r≤1. Fattori tra prove non modificano l’indice entro una singola prova.', 'Interfaccia piana ferma, ottica geometrica monocromatica aria n₁=1 verso mezzo n≥1. Angoli dalla normale, 0<s_i≤1; il bordo s_i=1 è soltanto limite radente. Le inverse devono dare n s_r≤1. Fattori tra prove non modificano l’indice entro una singola prova.', 'Interfaccia piana ferma, ottica geometrica monocromatica aria n₁=1 verso mezzo n≥1. Angoli dalla normale, 0<s_i≤1; il bordo s_i=1 è soltanto limite radente. Le inverse devono dare n s_r≤1. Fattori tra prove non modificano l’indice entro una singola prova.', 'Interfaccia piana ferma, ottica geometrica monocromatica aria n₁=1 verso mezzo n≥1. Angoli dalla normale, 0<s_i≤1; il bordo s_i=1 è soltanto limite radente. Le inverse devono dare n s_r≤1. Fattori tra prove non modificano l’indice entro una singola prova.', 'Caso autonomo06:lastra indice3/2 con facce parallele, aria1 ai due lati,sin ingresso3/5. Normali parallele,seno interno2/5<2/3 soglia uscita;solo fascio trasmesso seguito.', 'Interfaccia piana ferma, ottica geometrica monocromatica aria n₁=1 verso mezzo n≥1. Angoli dalla normale, 0<s_i≤1; il bordo s_i=1 è soltanto limite radente. Le inverse devono dare n s_r≤1. Fattori tra prove non modificano l’indice entro una singola prova.', 'Interfaccia piana ferma, ottica geometrica monocromatica aria n₁=1 verso mezzo n≥1. Angoli dalla normale, 0<s_i≤1; il bordo s_i=1 è soltanto limite radente. Le inverse devono dare n s_r≤1. Fattori tra prove non modificano l’indice entro una singola prova.', 'Interfaccia piana ferma, ottica geometrica monocromatica aria n₁=1 verso mezzo n≥1. Angoli dalla normale, 0<s_i≤1; il bordo s_i=1 è soltanto limite radente. Le inverse devono dare n s_r≤1. Fattori tra prove non modificano l’indice entro una singola prova.', 'Interfaccia piana ferma, ottica geometrica monocromatica aria n₁=1 verso mezzo n≥1. Angoli dalla normale, 0<s_i≤1; il bordo s_i=1 è soltanto limite radente. Le inverse devono dare n s_r≤1. Fattori tra prove non modificano l’indice entro una singola prova.', 'Interfaccia piana ferma, ottica geometrica monocromatica aria n₁=1 verso mezzo n≥1. Angoli dalla normale, 0<s_i≤1; il bordo s_i=1 è soltanto limite radente. Le inverse devono dare n s_r≤1. Fattori tra prove non modificano l’indice entro una singola prova.', 'Interfaccia piana ferma, ottica geometrica monocromatica aria n₁=1 verso mezzo n≥1. Angoli dalla normale, 0<s_i≤1; il bordo s_i=1 è soltanto limite radente. Le inverse devono dare n s_r≤1. Fattori tra prove non modificano l’indice entro una singola prova.', 'Interfaccia piana ferma, ottica geometrica monocromatica aria n₁=1 verso mezzo n≥1. Angoli dalla normale, 0<s_i≤1; il bordo s_i=1 è soltanto limite radente. Le inverse devono dare n s_r≤1. Fattori tra prove non modificano l’indice entro una singola prova.', 'Interfaccia piana ferma, ottica geometrica monocromatica aria n₁=1 verso mezzo n≥1. Angoli dalla normale, 0<s_i≤1; il bordo s_i=1 è soltanto limite radente. Le inverse devono dare n s_r≤1. Fattori tra prove non modificano l’indice entro una singola prova.', 'Interfaccia piana ferma, ottica geometrica monocromatica aria n₁=1 verso mezzo n≥1. Angoli dalla normale, 0<s_i≤1; il bordo s_i=1 è soltanto limite radente. Le inverse devono dare n s_r≤1. Fattori tra prove non modificano l’indice entro una singola prova.', 'Interfaccia piana ferma, ottica geometrica monocromatica aria n₁=1 verso mezzo n≥1. Angoli dalla normale, 0<s_i≤1; il bordo s_i=1 è soltanto limite radente. Le inverse devono dare n s_r≤1. Fattori tra prove non modificano l’indice entro una singola prova.']

UNITS={1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: '', 10: '', 11: '', 12: '', 13: '', 14: '', 15: '', 16: ''}

NUMERIC_UNITS={}

SUFFIX={}

NON_NUMERIC_DISTRACTORS={}

SVG_REVIEW='SVG640×1750 letto XML e native intero dopo child0. Primo raggio incidente (80,80√3) ha norma160 e seno1/2; trasmesso(40,40√15), norma160,seno1/4. Nella lastra ingresso/uscita(90,120) hanno seno3/5,interno spostamento orizzontale150·2/√21 con verticale150 dà seno2/5. Normali parallele, emergente parallelo ma traslato. Barre160/320/240 per1/4,1/2,3/8 alla scala640 comune.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 16: 'SYMBOLIC_MANUAL_DERIVATION'}

CANDIDATE_REF='4dfc3535c3c19a4b580e255f57b25a543e8404f7'

PRIMARY_SHA256='5b685efd1f9081ea829990d63cf50291ffc298c922b8aac2b169b8de5cdaa3e4'

REVIEWED_MODEL_SHA256='f32615b7796d7dcb7c5d4e9d58566922ed01dac5f1dfd884fef5efd0108492c7'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='4381f4fa8baa09552c3ba2e288e6960cedd6ab4f874cb402fa52c4ca65eba09c'

REVIEWED_BINDINGS_SHA256='4f29527617afb5ae2f5c581091328e177f60e9cd354c620d77d3b7077fe0c717'

REVIEWED_CANDIDATES={'AR-u7-snell-refracted-sine-01': 'f002a2ac71d59a5826c55489defdc72e0148cb0280e18c2fae7b88b7870a320e', 'AR-u7-snell-refracted-sine-02': 'd87045d653d68fa713e780aa62f245e7bd308f6aa46bd0f3980ef3207735fee9', 'AR-u7-snell-refracted-sine-03': '14e78134239544d90be9163a8329f5f4e6c58f9e1e68fbfe76e7682a569c999c', 'AR-u7-snell-refracted-sine-04': '98eb8b94cb441e065df9a5fe3315bdd87a263e4cbef8eb6d6efc85ae062a8090', 'AR-u7-snell-refracted-sine-05': '4abd0f612567844f09d64b55999d6b4f39d38c4f820f1e070eae222713c679a8', 'AR-u7-snell-refracted-sine-06': 'aa5d442554b5aecf0525897b06ca8276855c9f67eea83d5529d2a0953d9ffe2f', 'AR-u7-snell-refracted-sine-07': '87d9466a27f01e7f9d92d2518384cf13eecc80214aad0757f007712f872c539c', 'AR-u7-snell-refracted-sine-08': 'e9849be79ffd723ba88c911a855fee5cfedcf20085a1aab64fcaae67758db9d5', 'AR-u7-snell-refracted-sine-09': '454ccd093ea62e778e8d1ad230625c5accc8777ed4dec50e7a3f4613b5c54fb2', 'AR-u7-snell-refracted-sine-10': 'b6e168c59d994af9a4f37959dfa3627061d3d7266a7e21133d59b46c1616bf1f', 'AR-u7-snell-refracted-sine-11': 'd3894ba8f246a02b8561d92e96273f99c096f825c31bb3bacd3109ff242f8916', 'AR-u7-snell-refracted-sine-12': 'c8f299632ee705513c3ed60347c3e437f0734dbf3f53e2eaeb56563a5296f083', 'AR-u7-snell-refracted-sine-13': '409d31f0e3e27bc83bd440094fd4c375096bb17f1e3b6a1836d914c38a4d6d83', 'AR-u7-snell-refracted-sine-14': '6b061352c7d6ee796e6d7a2649982cee8a6d87caf2b46c84f97939e4fdda988f', 'AR-u7-snell-refracted-sine-15': 'bdef5aa0681093c6e44a9ee5f1eaa6425a262a1ecb22b56f0305f083107e651f', 'AR-u7-snell-refracted-sine-16': '5d4813bc37e0c2e430b7e1f515e50b036898b8d6b496aa61afe5265b459bfb75'}

READ_SOURCE_SHA256={'u7-snell-refracted-sine-01': '25e89eee87415b873345603b441401897c6c2271a2376fae50823f10c79ddd09', 'u7-snell-refracted-sine-02': 'fb43e851d114b8544376ad9459e77f1e6086782c187faab3b84f08d510b7b954', 'u7-snell-refracted-sine-03': 'c319643bcfad25e4a8f850e97f9c8fe51e538a4fd2dea15ca60131919d97ff31', 'u7-snell-refracted-sine-04': '34c3157b160c01cdf92cc628e395a2833291eb33bb01eed19916c2bd4bd3d5a4', 'u7-snell-refracted-sine-05': '0b2e85b0844f764628d7e6ba70a536b5cab590b8095f3872887fc39da556e79c', 'u7-snell-refracted-sine-06': '0fdac1c276d946fe223cff057d08f4b2f0fb243bd078bc460b69596571f92eda', 'u7-snell-refracted-sine-07': '4539bc8a5a7275ae51dd686df0500373d03ef18e00852501cec19f7e4ae7d54d', 'u7-snell-refracted-sine-08': 'eb04b0adc2fb04e3cb3aed776de809861b7528c5103c1efb4c736597735b20f5', 'u7-snell-refracted-sine-09': '4553b1a35c1018a44546ba7dc8dc4211873d9373570d86d4ab318ab96977f208', 'u7-snell-refracted-sine-10': 'c04b8212f8b98a88b013bb9c93da27837959c5c28ffe0fc9d6e326b6a7816064', 'u7-snell-refracted-sine-11': '7328cc4168b3cb95fca02af77a462e95df054069219a73d1b057d515dfd0bdf6', 'u7-snell-refracted-sine-12': 'd05a0e481b00d1994222eb4ce5684cf09b1af676fcbb2d5c81fb5eac966d98fc', 'u7-snell-refracted-sine-13': 'e0e7d0264ec0df77e8465f21b8d79f4b04f7b141a668668ca2191977c95ddb84', 'u7-snell-refracted-sine-14': '1e1b0bdde97c8cee398c75453962db28cb4fb87241604e590b18128c8b82926e', 'u7-snell-refracted-sine-15': 'b05d2b74ba425bbf50c072c4fcda269b959a2bf622dbbba3aecc9a33783786ae', 'u7-snell-refracted-sine-16': '8a01affbf43e6a708ad58ebdf59e919ce60a7e6854d2793f9db042b2289d580e'}

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
