"""Independent U4-02 full-record review; never imports candidate authoring."""
from fractions import Fraction
import ast,re
from functools import lru_cache
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U4-02.json'
FAMILY='beats-envelope'
EXPECTED_IDS={f'AR-u4-{FAMILY}-{n:02}' for n in range(1,17)}
REVIEWED_SKILLS={1: 'C5-L03', 2: 'C5-L03', 3: 'C5-L05', 4: 'C5-L03', 5: 'C5-L03', 6: 'C5-L03', 7: 'C5-L03', 8: 'C5-L03', 9: 'C5-L03', 10: 'C5-L03', 11: 'C5-L03', 12: 'C5-L03', 13: 'C5-L03', 14: 'C5-L03', 15: 'C5-L03', 16: 'C5-L05'}

def exact_literal(raw):
    """Bounded arithmetic AST for rational, pi and integer-radical numeric choices."""
    if len(raw)>60:raise ValueError('literal too long')
    raw=raw.replace('π','p')
    raw=re.sub(r'√([0-9]{1,4})',r'r(\1)',raw)
    raw=re.sub(r'(?<=\d)(?=r\(|p)', '*',raw)
    if not re.fullmatch(r'[0-9rp()+*/. \-]+',raw):raise ValueError('unsupported numeric literal')
    tree=ast.parse(raw,mode='eval')
    if len(list(ast.walk(tree)))>80:raise ValueError('numeric literal too complex')
    def visit(node):
        if isinstance(node,ast.Name) and node.id=='p':return sp.pi
        if isinstance(node,ast.Constant) and type(node.value) is int and abs(node.value)<=10**9:return sp.Integer(node.value)
        if isinstance(node,ast.Constant) and type(node.value) is float and len(str(node.value))<=16:
            return sp.Rational(str(node.value))
        if isinstance(node,ast.UnaryOp) and isinstance(node.op,(ast.UAdd,ast.USub)):
            value=visit(node.operand);return value if isinstance(node.op,ast.UAdd) else -value
        if isinstance(node,ast.BinOp):
            left,right=visit(node.left),visit(node.right)
            if isinstance(node.op,ast.Add):return left+right
            if isinstance(node.op,ast.Sub):return left-right
            if isinstance(node.op,ast.Mult):return left*right
            if isinstance(node.op,ast.Div) and right!=0:return left/right
        if isinstance(node,ast.Call) and isinstance(node.func,ast.Name) and node.func.id=='r' and len(node.args)==1 and not node.keywords:
            value=visit(node.args[0])
            if value.is_Integer and 0<=value<=10**4:return sp.sqrt(value)
        raise ValueError('unsupported arithmetic node')
    value=visit(tree.body)
    if value.is_real is not True or value.is_finite is not True:raise ValueError('nonreal numeric result')
    return value


def unique(options,want):
    if [i for i,item in enumerate(options) if sp.simplify(item-want)==0]!=[0]:
        raise ValueError('Independent symbolic alternatives not unique as general laws')

def calibrate(first,second,reading_first,reading_second):
    gain,offset=sp.symbols('gain offset',real=True)
    result=sp.solve([sp.Eq(gain*first+offset,reading_first),sp.Eq(gain*second+offset,reading_second)],(gain,offset))
    if result[gain]<=0:raise ValueError('Independent calibration gain not positive')
    return result[gain],result[offset]

@lru_cache(maxsize=1)
def oracle():

    alpha,beta=sp.symbols('alpha beta',real=True)
    assert sp.simplify(sp.expand_trig(sp.cos(alpha+beta)+sp.cos(alpha-beta))-2*sp.cos(alpha)*sp.cos(beta))==0
    x,y,r,a,b=sp.symbols('x y r a b',positive=True)
    law=x-y;inv=sp.solve(sp.Eq(r,law),x)[0];other=sp.solve(sp.Eq(r,law),y)[0]
    ratio=sp.cancel(law.subs({x:a*x,y:b*y})/law)
    unique([r+y,y-r,r*y,r/y,r*r+y*y],inv)
    unique([(a*x-b*y)/(x-y),a-b,a/b,a*b,(a*x+b*y)/(x+y)],ratio)
    first,second=law.subs({x:302,y:300}),law.subs({x:401,y:400})
    assert first==2 and second==1
    gain,offset=calibrate(first,second,5,3);assert (gain,offset)==(2,1)
    # Doppler comes from wavelengths and encounter rates, separately from beating.
    f0,z,approach,recede=sp.symbols('f0 z approach recede',positive=True)
    solved=sp.solve([sp.Eq(approach,f0/(1-z)),sp.Eq(recede,f0/(1+z))],(f0,z),dict=True)[0]
    emitted=solved[f0].subs({approach:600,recede:400});speed_ratio=solved[z].subs({approach:600,recede:400})
    assert emitted==480 and speed_ratio==sp.Rational(1,5)
    assert emitted/(1-speed_ratio)==600 and emitted/(1+speed_ratio)==400
    vs,vo,c=sp.symbols('vs vo c',positive=True)
    assert sp.factor((c+vo)-(c-vs))==vo+vs
    # Modulus of the slow cosine repeats after a half signed-cosine period.
    t=sp.symbols('t',real=True)
    assert sp.simplify(sp.cos(2*sp.pi*(t+sp.Rational(1,2)))+sp.cos(2*sp.pi*t))==0
    q=SI.Quantity;assert (q(302,'Hz')-q(300,'Hz')).to('1/s').magnitude==2
    assert (q(6,'')/q(2,'Hz')).to('s').magnitude==3
    assert sp.Rational(302+401,2)-350==(first+second)/2
    return [first,'Hz','La frequenza ricevuta è maggiore di quella emessa','Da 2 a 1 Hz',inv.subs({r:2,y:300}),other.subs({r:2,x:302}),law.subs({x:302,y:301})/first,4-first,'f₁ = f_b + f₂','(κ₁ f₁ − κ₂ f₂) / (f₁ − f₂)',second/first,(first+second)/2,other.subs({x:401,r:first/2})/300,inv.subs({r:3/(6/first),y:400}),inv.subs({r:(7-offset)/gain,y:500}),emitted]

MANUAL=['Nuovi dati 302−300=2 Hz. Frequenza media301 Hz; somma2A cos(2πu)cos(602πu), u=t/(1 s). Modulo inviluppo2A|cos(2πu)| ha massimi ogni1/2 s:2 Hz, mentre fattore lento con segno ha1 Hz.', 'f_b è numero di massimi del modulo per secondo, dimensione T⁻¹ e unità Hz. Il periodo fra massimi è1/f_b in secondi.', 'Doppler distinto: f_ric/f₀=(c+v_o)/(c−v_s)>1 per0≤v_o,v_s<c con almeno un modulo positivo. Numeratore−denominatore=v_o+v_s>0; c nel mezzo non aumenta.', 'Nuove portanti301 e300 Hz danno1 Hz rispetto ai2 Hz iniziali. Periodo fra massimi passa da1/2 s a1 s.', 'Ramo superiore f₁=f₂+f_b=300+2=302 Hz;298 Hz invertirebbe l’ordine delle etichette.', 'f₂=f₁−f_b=302−2=300 Hz, positiva e vicina alla maggiore. Richiede0<f_b<f₁.', 'B:302−301=1 Hz; A:302−300=2 Hz. Rapporto1/2, pur variando pochissimo la portante inferiore.', 'Proposto4 Hz meno corretto2 Hz dà+2 Hz. Non si confronta il battimento con la frequenza media.', 'f_b=f₁−f₂ sul ramo dichiarato; aggiungendo f₂ a entrambi i membri si ricava f₁=f_b+f₂.', 'Rapporto (κ₁f₁−κ₂f₂)/(f₁−f₂); i due ordini e il regime vicino sono esplicitamente mantenuti. Fattore comuneκ dà rapportoκ.', 'A:302−300=2 Hz; B:401−400=1 Hz. Rapporto1/2 benché entrambe le portanti crescano.', 'Media(2+1)/2=3/2 Hz; portanti medie703/2 e350 Hz differiscono ancora3/2 Hz. Media dei periodi(1/2+1)/2=3/4 s, diversa da2/3 s reciproco della frequenza media.', 'Target1 Hz con f₁,B401 Hz impone f₂,B400 Hz. Rapporto400/300=4/3, ordine e vicinanza rispettati.', 'q=6/(2 Hz)=3 s. S_B3 rappresenta1 Hz; aggiungendo400 Hz si trova f₁,B401 Hz. Verifica S=3·(401−400)=3.', 'q=(5−3)/(2−1) Hz=2 s,b1; S_C7 dà f_b3 Hz. f₁,C=500+3=503 Hz; legge strumentale ricostruisce7.', 'Doppler separato: somma reciproci1/600+1/400=1/240 s=2/f₀. Quindi f₀480 Hz. Rapporto v/c=(600−400)/(600+400)=1/5;480/(1−1/5)=600 e480/(1+1/5)=400.']
DISTRACTORS=['602 Hz somma,301 media,1 metà dello scarto e frequenza del coseno lento con segno; i massimi del suo modulo hanno frequenza doppia.', 's periodo,m lunghezza,W/m² intensità,rad fase; nessuna alternativa ha dimensione T⁻¹.', 'Meno frequenza descrive allontanamento; invariata contraddice numero maggiore di fronti; c non raddoppia e una seconda onda non è necessaria.', '4 aumenta anziché ridurre lo scarto;1/2 dimezza ancora;301 copia portante e2 ignora variazione.', '298 Hz ramo inverso,2 battimento e300 frequenza inferiore. Nessuna somma di quadrati dà la frequenza mancante.', '304 Hz supera la prima e cambia ramo;0 o valori negativi violano il dominio delle frequenze.', '2 reciproco,1 ignora cambiamento,301/300 segue portante e1/4 quadra il rapporto senza motivo.', '−2 ordine inverso,4 proposta,0 la accetta e6 somma. Tutte le quantità hanno la medesima unità Hz.', 'f₂−f_b scende sotto f₂; prodotto e somma quadrati Hz²; quoziente puro invece di frequenza.', 'Differenza fattori nulla per prove identiche, prodotto/quoziente ignorano separazioni, rapporto somme confronta portanti medie. Unicità come legge generale, non per coincidenze isolate.', '2 reciproco,401/302 sola f₁,4/3 sola f₂,1 ignora lo scarto che si dimezza.', '3 somma,1/2 semidifferenza,2 e1 una sola prova. Non confondere media frequenze e media periodi.', '3/4 reciproco,1/2 target,401/302 sola maggiore,400 frequenza numerica non rapporto puro.', 'Usare S_B3 come Hz porta403 Hz e lettura9, non3.1 Hz è battimento, non portante.', '507 usa S come scarto;500 annulla.501 darebbeS3,505 darebbeS11.503 restituisceS7.', '500 media aritmetica: non risolve entrambi i dati con uguale v.200 differenza è altra grandezza; stare fra400 e600 è necessario ma non sufficiente.']
ASSUMPTIONS=['Somma locale lineare di contributi stabili di uguale ampiezza e polarizzazione; portanti vicine ma fase relativa variabile. Il battimento conta massimi del modulo dell’inviluppo, non del coseno lento con segno. Frequenze positive e ordine preservato.', 'Somma locale lineare di contributi stabili di uguale ampiezza e polarizzazione; portanti vicine ma fase relativa variabile. Il battimento conta massimi del modulo dell’inviluppo, non del coseno lento con segno. Frequenze positive e ordine preservato.', 'Doppler separato da battimenti: aria ferma, avvicinamento rettilineo, velocità rispetto al mezzo subsoniche e almeno un modulo non nullo; sorgente a frequenza propria costante. Nessuna seconda portante necessaria.', 'Somma locale lineare di contributi stabili di uguale ampiezza e polarizzazione; portanti vicine ma fase relativa variabile. Il battimento conta massimi del modulo dell’inviluppo, non del coseno lento con segno. Frequenze positive e ordine preservato.', 'Somma locale lineare di contributi stabili di uguale ampiezza e polarizzazione; portanti vicine ma fase relativa variabile. Il battimento conta massimi del modulo dell’inviluppo, non del coseno lento con segno. Frequenze positive e ordine preservato.', 'Somma locale lineare di contributi stabili di uguale ampiezza e polarizzazione; portanti vicine ma fase relativa variabile. Il battimento conta massimi del modulo dell’inviluppo, non del coseno lento con segno. Frequenze positive e ordine preservato.', 'Somma locale lineare di contributi stabili di uguale ampiezza e polarizzazione; portanti vicine ma fase relativa variabile. Il battimento conta massimi del modulo dell’inviluppo, non del coseno lento con segno. Frequenze positive e ordine preservato.', 'Somma locale lineare di contributi stabili di uguale ampiezza e polarizzazione; portanti vicine ma fase relativa variabile. Il battimento conta massimi del modulo dell’inviluppo, non del coseno lento con segno. Frequenze positive e ordine preservato.', 'Somma locale lineare di contributi stabili di uguale ampiezza e polarizzazione; portanti vicine ma fase relativa variabile. Il battimento conta massimi del modulo dell’inviluppo, non del coseno lento con segno. Frequenze positive e ordine preservato.', 'Somma locale lineare di contributi stabili di uguale ampiezza e polarizzazione; portanti vicine ma fase relativa variabile. Il battimento conta massimi del modulo dell’inviluppo, non del coseno lento con segno. Frequenze positive e ordine preservato.', 'Somma locale lineare di contributi stabili di uguale ampiezza e polarizzazione; portanti vicine ma fase relativa variabile. Il battimento conta massimi del modulo dell’inviluppo, non del coseno lento con segno. Frequenze positive e ordine preservato.', 'Somma locale lineare di contributi stabili di uguale ampiezza e polarizzazione; portanti vicine ma fase relativa variabile. Il battimento conta massimi del modulo dell’inviluppo, non del coseno lento con segno. Frequenze positive e ordine preservato.', 'Somma locale lineare di contributi stabili di uguale ampiezza e polarizzazione; portanti vicine ma fase relativa variabile. Il battimento conta massimi del modulo dell’inviluppo, non del coseno lento con segno. Frequenze positive e ordine preservato.', 'Somma locale lineare di contributi stabili di uguale ampiezza e polarizzazione; portanti vicine ma fase relativa variabile. Il battimento conta massimi del modulo dell’inviluppo, non del coseno lento con segno. Frequenze positive e ordine preservato.', 'Somma locale lineare di contributi stabili di uguale ampiezza e polarizzazione; portanti vicine ma fase relativa variabile. Il battimento conta massimi del modulo dell’inviluppo, non del coseno lento con segno. Frequenze positive e ordine preservato.', 'Doppler separato: osservatore e mezzo fermi, sorgente in due prove rettilinee con uguale modulo0<v<c e stessa f₀. Leggi classiche assegnate, c comune e positivo; escluso cambiamento di ramo o velocità fra le due misure.']
UNITS={1: 'Hz', 2: 'Hz', 3: 'Hz', 4: 'Hz', 5: 'Hz', 6: 'Hz', 7: '', 8: 'Hz', 9: 'Hz', 10: '', 11: '', 12: 'Hz', 13: '', 14: 'Hz', 15: 'Hz', 16: 'Hz'}
NUMERIC_UNITS={1: 'Hz', 5: 'Hz', 6: 'Hz', 14: 'Hz', 16: 'Hz'}
SUFFIX={8: ' Hz', 12: ' Hz', 15: ' Hz'}
CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering completo letti. Frecce separate e schematiche a t0,1/4,1/2 s hanno segni concordi/opposti/concordi coerenti con302/300 Hz. Inviluppo normalizzato2|cos(2πt/s)|:400 px/s e60 px per E/A, massimi a x100/300/500 e ordinata830, zeri200/400 a950. Il pannello Doppler è esplicitamente senza scala metrica, con fronti più ravvicinati davanti alla sorgente; non applica la differenza dei battimenti al moto.'

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle(); common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed '+FAMILY+' package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed '+FAMILY+' binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u4-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        if row.get('course')!='C5' or row.get('skill')!=REVIEWED_SKILLS[n]:errors.append('Independent real course or primary skill mismatch')
        want=expected[n-1];value=row['answer']['value']
        if isinstance(want,str):
            if value!=want:errors.append('Independent '+FAMILY+' conceptual key mismatch')
        else:
            try:
                raw=str(value).replace('−','-').strip();suffix=SUFFIX.get(n,'')
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
                        if suffix and not option.endswith(suffix):raise ValueError('alternative missing physical unit')
                        if suffix:option=option.removesuffix(suffix).strip()
                        if sp.simplify(exact_literal(option)-want)==0:equivalent.append(alternative)
                    if equivalent!=[value]:errors.append('Independent '+FAMILY+' numeric alternatives not unique')
            except (ValueError,TypeError,ZeroDivisionError,SyntaxError,RecursionError):errors.append('Independent '+FAMILY+' answer or unit invalid')
        if row['answer']['type']=='numeric' and row['answer'].get('unit')!=NUMERIC_UNITS.get(n):errors.append('Independent '+FAMILY+' numeric unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'assetChecksums':assets,
          'ok':not errors,'errors':errors,'expectedExact':str(want),
          'dimension':{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},
          'manualArithmetic':MANUAL[n-1],'physicalAssumptions':ASSUMPTIONS[n-1],'distractors':DISTRACTORS[n-1],
          'pedagogicalReview':'Consegna, tutti i passaggi, alternative, hint e feedback letti separatamente; procedura manuale esatta e condizioni controllate. '+MANUAL[n-1],
          'scientificAssetReview':SVG_REVIEW if assets else 'Nessuna figura collegata a questo record; testi e formule letti integralmente.',
          'calculationScope':CALCULATION_SCOPE.get(n,'EXACT_MANUAL_CALCULATION'),
          'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
          'methods':['SymPy_independent_conservation_and_constitutive_model','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}



CANDIDATE_REF='13db5a6e0945076d49ea0afb4574b6d6498e76cb'
SOURCE_READING='All 48 B145–147 U4-02 original prompts individually read and independent per-ID derivations persisted before opening any B candidate. Handoffs exposed only commits, files and general assumptions, no numeric result or key. Reviewer authored distinct A141–144 and already knows superposition laws; no claim of ignorance of the physics. All 16 final candidate records, every option, block, hint, feedback, metadata and caption read completely, with complete SVG XML structure and native rendering. Never imports authoring. Actual C5-L01/L02/L03/L05 and C1-L001 lessons reread. Edition 146 frequencies independently recalculated from its declared close-carrier parametrization; separate Doppler03/16 preserved. Edition147 frozen only after rereading final feedback15 at72861a39.'
REVIEWED_PACKAGE_SHA256='47af5876c9794ae01d0bc113634254636d4a5c7ac875db2fe61dc5a7af5deb5b'
REVIEWED_BINDINGS_SHA256='b080ff9fc3784a2362059f2474b3dc45003014725a96d70fc134c5503582425c'
REVIEWED_CANDIDATES={'AR-u4-beats-envelope-01': '5c56349b88ed368543f152f898936f90e827a40e3a1bd47900f550b3c59781ca', 'AR-u4-beats-envelope-02': '63cb0d80f9e752d25a6427c5bc5c4b5ff94a39aad089566d34c7da3621f52bf8', 'AR-u4-beats-envelope-03': '5ad45ddbbb57ac3ccfb99303b0b99f1f5837eecae93b3d87215757e532ab3390', 'AR-u4-beats-envelope-04': '9af8a560d9983ca4fb0e9b0be9de36d035fe04ecaf6815c983e6d0cc2b1d8e54', 'AR-u4-beats-envelope-05': 'a525a02039dd3b09042d8255c07922bed17b36dce236849267e163e420515924', 'AR-u4-beats-envelope-06': 'c29cc6dc1d41d97202a64424ed8d9b9ec54a8022d737752e34b2e9cfdd86f190', 'AR-u4-beats-envelope-07': 'f4d65c7b9c51bae9ceb673337aa52257f2447b4dcad86f42bcc0e24f366f7aaf', 'AR-u4-beats-envelope-08': '09a80efe49a644aa6f3e318624fd3f9db7f87590f940120c753e0942a3567b90', 'AR-u4-beats-envelope-09': '163cd625ac096264559306a33e2107f10332d419f9236f540f68588384eebe00', 'AR-u4-beats-envelope-10': 'f1550d9c4dc060873123ce0629a54ec964f982f058c5ea3828a1bc51d701e3f9', 'AR-u4-beats-envelope-11': 'c129aa0a9d6a6efe0dde8025b4e2bb1fa170e339191eaaf5759401d171047728', 'AR-u4-beats-envelope-12': '24aeb4a0af68ef620bac644b248a5a17a63365600bd81199e54f36a5186d886f', 'AR-u4-beats-envelope-13': '887195b1bc6c95dc0067a679ff5e5ef57f8fdaaad1192f205c05a598573eedaf', 'AR-u4-beats-envelope-14': 'b34de3fc9bac254c35569b869f9b010319b36fea8ca06b7e2aca8fd18ce77810', 'AR-u4-beats-envelope-15': '8aaed6613dd19478c1415f8b0a4ba6a8d5a959e8e7c3635b9e6f656bdc2c12c9', 'AR-u4-beats-envelope-16': 'f9f1384d33d48e0f4f851bf60ba6308cf78f13a304b8f19754a141b2da662a30'}
READ_SOURCE_SHA256={'u4-beats-envelope-01': 'e0387cee52f056c09b2899e39a21922f711fe4fef02a04ceccbb2a6d376d3462', 'u4-beats-envelope-02': '0c25c192165f002e9df3c4bf5fa7992004177785d0b022dcc764cd3b4345da3c', 'u4-beats-envelope-03': '4746d19efc556a1369d956dadc7bc25b895852902d314c581254db6d7f2a5c7b', 'u4-beats-envelope-04': '8e0d10b0236ff917800ca5c6c0216b5ca935b3e364b30dd4dd2e3d0e35b060f1', 'u4-beats-envelope-05': '3fb2eeb1a99fd17002d8ccaec0c562b8f5e8f6e31ef91d6eece238ccfafa0c11', 'u4-beats-envelope-06': '71bd9dc740773c8af36f40b1acceb6e96cce274f154b29d098a35cf312039334', 'u4-beats-envelope-07': '884312d94c6ce66b6f9854ca8852f62914a76b2ca677c3a9e5104aa33828f891', 'u4-beats-envelope-08': '13d4353b2b7f71157d72f47d7a2bff188e105b362061bbe8c49898e5ebaf7b5f', 'u4-beats-envelope-09': '3708131701efe3ed7281763285165b885cf22002e444c1c3243b5ead99613c60', 'u4-beats-envelope-10': 'c1c28ceebad85e0ee9c80a35738b353fbe3212faf453f1911fed943492149076', 'u4-beats-envelope-11': '8007e25e8a268912d02d9ca57fd5add8f20293501bfa70a5a3a51520ba82f99d', 'u4-beats-envelope-12': 'a427b97ecc680f69df395a65d14a9cd1a0d627bcc17863f119df7a176d24eec9', 'u4-beats-envelope-13': 'f7d472a9d70637ce5706657ea43f47067358dc86afd12acf59d76db822a29992', 'u4-beats-envelope-14': 'b51e452c7d1b89a683d37cf163c074064f67fb7a41e796e1014a8d020ff17649', 'u4-beats-envelope-15': 'a0b6e14453f05cd23d3d657520f7d642421644598ea94d3b98bac6a5fb094836', 'u4-beats-envelope-16': '3f7a9a2d8a45c1fb4ee194b8e1f87e794f5a7c527a39034dbaa1f50423860771'}
