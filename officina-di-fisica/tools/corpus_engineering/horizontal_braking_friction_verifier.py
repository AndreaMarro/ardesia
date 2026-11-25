"""Independent per-ID review, distinct from candidate author. No authoring import."""
from fractions import Fraction
from pathlib import Path
import pint
import sympy as sp
import re
from .pipeline import digest,sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-06.json'
FAMILY='horizontal-braking-friction'
EXPECTED_IDS={f'AR-u2-{FAMILY}-{n:02}' for n in range(1,17)}

def oracle():
    m,v,mu,g,D=sp.symbols('m v mu g D',positive=True)
    t,s=sp.symbols('t s',real=True)
    normal=m*g
    resist=-mu*normal
    acceleration=sp.cancel(resist/m)
    moving=v+acceleration*t
    stop=sp.solve(sp.Eq(moving,0),t)[0]
    law=sp.simplify(sp.integrate(moving,(t,0,stop)))
    work=sp.integrate(resist,(s,0,D))
    from_energy=sp.solve(sp.Eq(-m*v**2/2,work),D)[0]
    if sp.simplify(law-from_energy)!=0 or acceleration!=-mu*g or stop!=v/(mu*g):raise ValueError('Newton first-stop integral must agree with signed work')
    if moving.subs(t,2*stop)!=-v:raise ValueError('Counterexample must expose invalid continuation beyond stop')
    # Sliding law only for0<=t<=T. Beyond T, no horizontal drive and required static force0 admits rest.
    if sp.diff(sp.Integer(0),t)!=0:raise ValueError('After-stop rest branch failed')
    inverse_v=sp.solve(sp.Eq(D,law),v)[0]
    inverse_mu=sp.solve(sp.Eq(D,law),mu)[0]
    a,b=sp.symbols('a b',positive=True)
    ratio=sp.cancel(law.subs({v:a*v,mu:b*mu})/law)
    for opts,want,index in [([v*v/(2*mu*g),v*v/(mu*g),v*v/(4*mu*g),-v*v/(2*mu*g),v/(mu*g)],law,0),
      ([sp.sqrt(2*mu*g*D),-sp.sqrt(2*mu*g*D),2*sp.sqrt(2*mu*g*D),sp.sqrt(2*mu*g*D)/2,2*mu*g*D],inverse_v,0),
      ([a*a/b,a/b,a*a*b,b/(a*a),a*b],ratio,0)]:
        if [i for i,x in enumerate(opts) if sp.simplify(x-want)==0]!=[index]:raise ValueError('Braking symbolic alternatives not unique as general laws')
    def distance(speed,coefficient):return law.subs({v:speed,mu:coefficient,g:10})
    A,B=distance(2,sp.Rational(1,5)),distance(4,sp.Rational(2,5))
    gain,offset=sp.symbols('gain offset',real=True)
    cal=sp.solve([sp.Eq(gain*A+offset,3),sp.Eq(gain*B+offset,5)],(gain,offset))
    C=(9-cal[offset])/cal[gain]
    if (A+B)/2!=distance(3,sp.Rational(3,10)):raise ValueError('Actual coincident mean must be recognized')
    if (distance(2,sp.Rational(1,5))+distance(4,sp.Rational(1,5)))/2==distance(3,sp.Rational(1,5)):raise ValueError('Independent counterexample to general mean identity failed')
    c=sp.Symbol('c',positive=True)
    constrained=sp.cancel(law.subs(v,c*mu))
    if constrained!=c*c*mu/(2*g):raise ValueError('Positive friction cancellation must leave a linear law')
    U=SI.Quantity
    force=(U(Fraction(1,5),'')*U(2,'kg')*U(10,'m/s**2')).to('N')
    duration=(U(2,'m/s')/(U(Fraction(1,5),'')*U(10,'m/s**2'))).to('s')
    run=(U(2,'m/s')*duration/2).to('m')
    squared=(2*U(Fraction(2,5),'')*U(10,'m/s**2')*U(2,'m')).to('m**2/s**2')
    coefficient=(U(10,'m/s')**2/(2*U(10,'m/s**2'))).to('m')
    if (force.magnitude,duration.magnitude,run.magnitude,squared.magnitude,coefficient.magnitude)!=(4,1,1,16,5):raise ValueError('Pint Fraction force/first-stop/radical/constraint dimensions failed')
    return [A,'m','D=v²/(2μg)','Da 1 a 4 m',inverse_v.subs({mu:sp.Rational(1,5),g:10,D:1}),inverse_mu.subs({v:2,g:10,D:1}),distance(2,sp.Rational(2,5))/A,2-A,'v=√(2μgD)','κ₁² / κ₂',B/A,(A+B)/2,inverse_mu.subs({v:4,g:10,D:2*A})/sp.Rational(1,5),inverse_v.subs({mu:sp.Rational(2,5),g:10,D:6/(sp.Integer(3)/A)}),inverse_v.subs({mu:sp.Rational(1,5),g:10,D:C}),sp.Rational(1,5)]

MANUAL=['N=mg,frizione−μmg; a_x−μg=−2m/s². Primozero v_x=v−μgt aT=v/(μg)=1s. Area triangolare vT/2=1m;anche−mv²/2=−μmgD. DopoTsoloattritostaticorichiesto0,nonaccelerazione negativa persistente.', 'v²/g ha lunghezza,μ e2puri. T=v/(μg) ha tempo;v/g anchesso tempo ma nonvaloreTsalvoμ1. D non un intervallo temporale.', 'Segni lavoro eΔK entrambi negativi:−mv²/2=−μmgD→D=v²/(2μg)>0. Validofino primoarresto;massacancella specificamentef∝m.', 'μ1/5fissa,v2→4→D1→4m;Kinizialequadrupla eforzafrenante stessa per stessamassa.', 'v²=2μgD=4m²/s²;radici±2,solo+2rapidità assegnata;inserita dàD1m.', 'μ=v²/(2gD)=4/20=1/5,puro. Nessunlimiteuniversaleμ≤1 imposto.', 'v2comune,μ1/5→2/5→D1→1/2m,rapporto1/2;forzadoppia assorbela stessa energia inmetàstrada.', 'Dcorretta1m,proposta2→scarto+1m;2mattritodissiperebbeenergia doppia delladisponibile.', 'v=√(2μgD)>0 conμ,g,D>0;quadrato non rapidità,segno assegnato daltesto e nonenergia sola.', 'D_B/D_A=κ1²/κ2:quadratofattorev,dipendenzainversadaμ. Perκ2=κ1²invarianza.', 'A1m,B16/[2(2/5)10]=2m;rapporto2. Energiainizialequadrupla,forzafrenantedoppia.', 'Media(1+2)/2=3/2m;ingressimediv3,μ3/10danno9/6=3/2anchessi. Nonidentitàgenerale:μ1/5costante,v2e4→media5/2controD(vmedio3)=9/4.', 'TargetD_B2m,v_B4→μ_B16/(2·10·2)=2/5;rapporto a1/5uguale2.', 'q3m⁻¹ dalrefD1,S3;S6→D2,μ2/5→v²2μgD16→v4m/s.', 'q(5−3)/(2−1)=2m⁻¹,offset1;S9→D4,μ1/5→v²16→v4m/s.', 'v=cμ,c10m/s soltanto tra prove;μcostante dentroogni frenata. D=c²μ/(2g)=(5m)μ;D1→μ1/5,v2. Positivitàμconsentecancellazione,unicitàlineare.']
DISTRACTORS=['Non proseguirea_xnegativaoltretT:produrrebbevelocitànegativa senza agente motore. Lo staticorichiesto è0,nonμNsempre.', 'm/svelocità,stempi,Nforza,Jenergia. v/gdimtempo maTè v/(μg),nonv/g ingenerale.', 'Senza2distanzadoppia,4metà,negativa confonde lavoro conlunghezza,v/(μg)tempo. Massacancella perattritosuquestopiano,nonogniresistenza.', '2seguestessopowerdi v invecev²,1/2inverso,1ignora,0impossibileparametrifinitipositivi.', '4quadratononrapidità,−2nonmodulo;energia fissa modulo maassefissasegno.', '2/5omette2,1/10contadueduevolte,5reciproco,1copiadistanza.', '2segueμdirettamente,1ignora,1/4quadratoμindebito,−1/2distanzanegativa.', '−1ordineinverso,2proposta,0accetta,1/2doppiametà. Modellofinitoprimoarresto.', 'Negativa nonrapidità,doppio/metà falliscono,Dsenza radicetargetvelocitàquadrata.', 'κ1/κ2mancaquadrato,κ1²κ2effettoμinverso,reciproco invertestati,κ1κ2 entrambeleleggierrate.', '4solov,1/2soloμ,8moltiplicaeffettichevannodivisi.', '3somma,3/4doppiametà,1/2metàA,2soloB. Controesempio separato conferma coincidenza nonuniversale.', 'μinvariatoD4,quadruploD1;doppioD2richiesto.', 'S6nonmetri,16nonrapidità;taratura3/m eprimoradicalequadrato16 danno4.', 'v2,3,5,8aμ1/5→S3,11/2,27/2,33;solov4dà9. Rapporto letture o radicegrezzaignoranooffset/gain.', '2/5→D2,1/10→D1/2,6/5→D6,−4/5violaμ>0. Nonquadraticadopocancellazionelecita;μnonvaria con v(t) nella frenata.']
ASSUMPTIONS=['Blocco classico m>0costante,orizzontalefisso,inriferimento inerziale,contattomantenuto eaccelerazioneverticalenulla:N=mg. Solo pesonormaleeattrito,secco dinamicoμ>0costante,f_x−μmg nelloscorrimentopositivo. Dfinoalprimoarresto;dopoassenza spinta eattritostaticorichiesto0 consentonoresto,nonproseguimento di a_xnegativa.', 'Blocco classico m>0costante,orizzontalefisso,inriferimento inerziale,contattomantenuto eaccelerazioneverticalenulla:N=mg. Solo pesonormaleeattrito,secco dinamicoμ>0costante,f_x−μmg nelloscorrimentopositivo. Dfinoalprimoarresto;dopoassenza spinta eattritostaticorichiesto0 consentonoresto,nonproseguimento di a_xnegativa.', 'Blocco classico m>0costante,orizzontalefisso,inriferimento inerziale,contattomantenuto eaccelerazioneverticalenulla:N=mg. Solo pesonormaleeattrito,secco dinamicoμ>0costante,f_x−μmg nelloscorrimentopositivo. Dfinoalprimoarresto;dopoassenza spinta eattritostaticorichiesto0 consentonoresto,nonproseguimento di a_xnegativa.', 'Blocco classico m>0costante,orizzontalefisso,inriferimento inerziale,contattomantenuto eaccelerazioneverticalenulla:N=mg. Solo pesonormaleeattrito,secco dinamicoμ>0costante,f_x−μmg nelloscorrimentopositivo. Dfinoalprimoarresto;dopoassenza spinta eattritostaticorichiesto0 consentonoresto,nonproseguimento di a_xnegativa.', 'Blocco classico m>0costante,orizzontalefisso,inriferimento inerziale,contattomantenuto eaccelerazioneverticalenulla:N=mg. Solo pesonormaleeattrito,secco dinamicoμ>0costante,f_x−μmg nelloscorrimentopositivo. Dfinoalprimoarresto;dopoassenza spinta eattritostaticorichiesto0 consentonoresto,nonproseguimento di a_xnegativa.', 'Blocco classico m>0costante,orizzontalefisso,inriferimento inerziale,contattomantenuto eaccelerazioneverticalenulla:N=mg. Solo pesonormaleeattrito,secco dinamicoμ>0costante,f_x−μmg nelloscorrimentopositivo. Dfinoalprimoarresto;dopoassenza spinta eattritostaticorichiesto0 consentonoresto,nonproseguimento di a_xnegativa.', 'Blocco classico m>0costante,orizzontalefisso,inriferimento inerziale,contattomantenuto eaccelerazioneverticalenulla:N=mg. Solo pesonormaleeattrito,secco dinamicoμ>0costante,f_x−μmg nelloscorrimentopositivo. Dfinoalprimoarresto;dopoassenza spinta eattritostaticorichiesto0 consentonoresto,nonproseguimento di a_xnegativa.', 'Blocco classico m>0costante,orizzontalefisso,inriferimento inerziale,contattomantenuto eaccelerazioneverticalenulla:N=mg. Solo pesonormaleeattrito,secco dinamicoμ>0costante,f_x−μmg nelloscorrimentopositivo. Dfinoalprimoarresto;dopoassenza spinta eattritostaticorichiesto0 consentonoresto,nonproseguimento di a_xnegativa.', 'Blocco classico m>0costante,orizzontalefisso,inriferimento inerziale,contattomantenuto eaccelerazioneverticalenulla:N=mg. Solo pesonormaleeattrito,secco dinamicoμ>0costante,f_x−μmg nelloscorrimentopositivo. Dfinoalprimoarresto;dopoassenza spinta eattritostaticorichiesto0 consentonoresto,nonproseguimento di a_xnegativa.', 'Blocco classico m>0costante,orizzontalefisso,inriferimento inerziale,contattomantenuto eaccelerazioneverticalenulla:N=mg. Solo pesonormaleeattrito,secco dinamicoμ>0costante,f_x−μmg nelloscorrimentopositivo. Dfinoalprimoarresto;dopoassenza spinta eattritostaticorichiesto0 consentonoresto,nonproseguimento di a_xnegativa.', 'Blocco classico m>0costante,orizzontalefisso,inriferimento inerziale,contattomantenuto eaccelerazioneverticalenulla:N=mg. Solo pesonormaleeattrito,secco dinamicoμ>0costante,f_x−μmg nelloscorrimentopositivo. Dfinoalprimoarresto;dopoassenza spinta eattritostaticorichiesto0 consentonoresto,nonproseguimento di a_xnegativa.', 'Blocco classico m>0costante,orizzontalefisso,inriferimento inerziale,contattomantenuto eaccelerazioneverticalenulla:N=mg. Solo pesonormaleeattrito,secco dinamicoμ>0costante,f_x−μmg nelloscorrimentopositivo. Dfinoalprimoarresto;dopoassenza spinta eattritostaticorichiesto0 consentonoresto,nonproseguimento di a_xnegativa.', 'Blocco classico m>0costante,orizzontalefisso,inriferimento inerziale,contattomantenuto eaccelerazioneverticalenulla:N=mg. Solo pesonormaleeattrito,secco dinamicoμ>0costante,f_x−μmg nelloscorrimentopositivo. Dfinoalprimoarresto;dopoassenza spinta eattritostaticorichiesto0 consentonoresto,nonproseguimento di a_xnegativa.', 'Blocco classico m>0costante,orizzontalefisso,inriferimento inerziale,contattomantenuto eaccelerazioneverticalenulla:N=mg. Solo pesonormaleeattrito,secco dinamicoμ>0costante,f_x−μmg nelloscorrimentopositivo. Dfinoalprimoarresto;dopoassenza spinta eattritostaticorichiesto0 consentonoresto,nonproseguimento di a_xnegativa.', 'Blocco classico m>0costante,orizzontalefisso,inriferimento inerziale,contattomantenuto eaccelerazioneverticalenulla:N=mg. Solo pesonormaleeattrito,secco dinamicoμ>0costante,f_x−μmg nelloscorrimentopositivo. Dfinoalprimoarresto;dopoassenza spinta eattritostaticorichiesto0 consentonoresto,nonproseguimento di a_xnegativa.', 'Blocco classico m>0costante,orizzontalefisso,inriferimento inerziale,contattomantenuto eaccelerazioneverticalenulla:N=mg. Solo pesonormaleeattrito,secco dinamicoμ>0costante,f_x−μmg nelloscorrimentopositivo. Dfinoalprimoarresto;dopoassenza spinta eattritostaticorichiesto0 consentonoresto,nonproseguimento di a_xnegativa. v=(10m/s)μ tra prove;μcostante durante ciascuna,semplificazioneμ>0 e legge lineare risultante.']
UNITS={1: 'm', 2: 'm', 3: 'm', 4: 'm', 5: 'm/s', 6: '', 7: '', 8: 'm', 9: 'm/s', 10: '', 11: '', 12: 'm', 13: '', 14: 'm/s', 15: 'm/s', 16: ''}
NUMERIC_UNITS={1: 'm', 5: 'm/s', 11: '1', 13: '1', 14: 'm/s'}
SUFFIX={8: ' m', 12: ' m', 15: ' m/s'}

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle();common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed '+FAMILY+' package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed '+FAMILY+' binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u2-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        want=expected[n-1];value=row['answer']['value']
        if isinstance(want,str):
            if value!=want:errors.append('Independent '+FAMILY+' conceptual key mismatch')
        else:
            try:
                raw=str(value).replace('−','-');suffix=SUFFIX.get(n,'')
                if suffix and not raw.endswith(suffix):raise ValueError('missing unit')
                if suffix:raw=raw.removesuffix(suffix)
                if len(raw)>80:raise ValueError('too long')
                raw=raw.replace('√2','sqrt(2)')
                raw=re.sub(r'(?<=\d)(?=sqrt\()', '*',raw)
                if not re.fullmatch(r'(?:[0-9\s+*/().-]|sqrt)+',raw):raise ValueError('unsupported exact literal')
                if sp.simplify(sp.sympify(raw,locals={'sqrt':sp.sqrt})-want)!=0:errors.append('Independent '+FAMILY+' result mismatch')
            except (ValueError,TypeError):errors.append('Independent '+FAMILY+' answer or unit invalid')
        if row['answer']['type']=='numeric' and row['answer'].get('unit')!=NUMERIC_UNITS.get(n):errors.append('Independent '+FAMILY+' numeric unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,
         'assetChecksums':assets,'ok':not errors,'errors':errors,'expectedExact':str(want),
         'dimension':{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},
         'manualArithmetic':MANUAL[n-1],'physicalAssumptions':ASSUMPTIONS[n-1],'distractors':DISTRACTORS[n-1],
         'pedagogicalReview':'Riletti separatamente consegna, tutti i passaggi, hint, feedback e cinque alternative ove presenti; procedura manuale esatta e vincoli espliciti. '+MANUAL[n-1],
         'calculationScope':'NO_STUDENT_CALCULATION' if n==2 else 'SYMBOLIC_MANUAL_DERIVATION' if n in (3,9,10) else 'EXACT_MANUAL_CALCULATION',
         'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
         'methods':['SymPy_independent_work_integral_or_collision_conservation','SymPy_inverse_scaling_affine_radicals_and_physical_branches','Pint_Fraction_exact_SI_dimensions','separate_per_ID_manual_distractor_and_SVG_reading'],
         'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':'All16original source rows and all16candidate records independently read; full solutions/options/feedback and scientific SVG frozen after separate physical derivation'}}

CANDIDATE_REF='d2d21137991401944e957ff45e811f3733d20a25'
REVIEWED_PACKAGE_SHA256='51c942c0cbd0366bcd862795e6ccc5144f253ca75ea82b77ba78d0954386823e'
REVIEWED_BINDINGS_SHA256='1291e6647b5fd3000c378723fdae1cacdce8896844271536a85c1d27e60d4c85'
REVIEWED_CANDIDATES={'AR-u2-horizontal-braking-friction-01': '2872347163f598446ad90518e959420b7317eacf7cf5e7ee1917e4aef66726e0', 'AR-u2-horizontal-braking-friction-02': '06dbc9b399766125a5d39f93f9d2122a7913f7365f461ba6b00baa6f808bb4a2', 'AR-u2-horizontal-braking-friction-03': '5a92f7e096f85fe71c0478eeea90cc555f84ea94dc5c9f07f7e780637bbd16c6', 'AR-u2-horizontal-braking-friction-04': '5f1f62d9bf703d47a3c9bebf4e2f36410a908a701f0faf4924b97201ca01844e', 'AR-u2-horizontal-braking-friction-05': '54d49ff5a7104e01242d37cc79c0f735ec587e0e046b999baeb4eff982ae9281', 'AR-u2-horizontal-braking-friction-06': 'c8e62f5433fd33d3c5f986a890b1e00047c3c73b54adadc712bf0ee13fa640ce', 'AR-u2-horizontal-braking-friction-07': 'de42a124f6f48310e7ddb1e9712cca8e732b0e231f3d4d0546bca32029fca495', 'AR-u2-horizontal-braking-friction-08': '62801dde149f42a5d8f2d198e80384d2eced22b5c01f14b10244b583112bc861', 'AR-u2-horizontal-braking-friction-09': '10b785f8a81896b9ba5d5d111e947241e12dae81d958fcc1b690b60f505228a4', 'AR-u2-horizontal-braking-friction-10': '4b6006544380088c7e6d7eb05610492f7689d53fcc2b67c04b309151f033cd08', 'AR-u2-horizontal-braking-friction-11': '96369ebafbb05a2bdf452aa691001f0bab426ed95e146228dd2f6a8f9ef4abb4', 'AR-u2-horizontal-braking-friction-12': '93feedea8919e890bcf94e8c3b3244f8467a9199d0b768bdaa2394e770f8380c', 'AR-u2-horizontal-braking-friction-13': '337b515b53bdfc0370bf4edb15557f09cdb0bef2d96a1d17b373b61121aad966', 'AR-u2-horizontal-braking-friction-14': '519b7bc4b1091c9c71c66f6ac69e5fa6fc6aff94b8a552198a72aaf03e1bea27', 'AR-u2-horizontal-braking-friction-15': '5a119d5ad67d196ee29facb30e923b4308a1d6416bbe94f1c551d02fa787d444', 'AR-u2-horizontal-braking-friction-16': '1f99c7d57582edf0d9f177585b870edf406f50591d5ba919973ada2ed3265247'}
READ_SOURCE_SHA256={'u2-horizontal-braking-friction-01': 'f3d26c157698d6aea27ed000fe430e3e4094f05cd117ec46db9156023ef124df', 'u2-horizontal-braking-friction-02': '8434e65b644246c56f0188658d97a576ed69aee9b3238942bab16762577e3e57', 'u2-horizontal-braking-friction-03': '7b5d46369f65f20e41d57dcf639bde182d674901592706b890738eb0bfb876ff', 'u2-horizontal-braking-friction-04': '528598b67c7a90085c7e98b9c49482630ec6dc6ae006f3c2eda630b661f8c9bc', 'u2-horizontal-braking-friction-05': 'ca059b9329f2abf035879fa252b3ddeabbe5936a228f65d6a0dfd92ada11babf', 'u2-horizontal-braking-friction-06': '9da3821c6299b57b7584c8c582c6d56277abd976154068e2cb4b92661e38e3de', 'u2-horizontal-braking-friction-07': '5409c80988ddd2122feceb3ae07b58efe67bc277b3088d6f398e73ca7e1d3e32', 'u2-horizontal-braking-friction-08': '0f3acac47664e75c4326d826c4f9c68205ab51f41f344950f54572a45eece803', 'u2-horizontal-braking-friction-09': '1ffcabd4aa459a0947dc1936d2c8c2fbea4007e16b60c9c0b10ece8302114c9c', 'u2-horizontal-braking-friction-10': '023d612c5f33c244514a27fa054dbdf580e915b49e1d8594ad9b4e194f9c00b7', 'u2-horizontal-braking-friction-11': 'fedca07a600f765b1c5fd40b43c750436e71abb3452fab9dee67fc328d5a6bec', 'u2-horizontal-braking-friction-12': '2c7971408e9e1dee3b752dd347e7f519ac8cb22f1772605e13a56c8f71a48253', 'u2-horizontal-braking-friction-13': 'cf3c0a1e1942d2f1ed933b2c431bba6fe95ded8f2be810c204fae88ae51b03eb', 'u2-horizontal-braking-friction-14': '413c75506913cd38935d88edff7f0db4aabd47ee3b4e40023aa3c1c7b4039499', 'u2-horizontal-braking-friction-15': '7f82a5abf28c2f698c47314623c13a21d6e5fa6195c3b6c6cec77e9f615ed924', 'u2-horizontal-braking-friction-16': 'bcdd850ef56839a17c6ce9b68bd37a2da8cdf63af66a19da758c02ead5fb10e2'}
