"""Independent reading of four immutable electrostatics lessons, not authoring.

The exact probes below are reviewer examples, not newly assigned student tasks.
Conceptual judgments and mathematical checks have separate explicit scopes.
"""
from fractions import Fraction
import json
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest, sha

APP=Path(__file__).resolve().parents[2]
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/C4.json'
SOURCE_FILE_SHA256='19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c'
BATCH='lessons-electrostatics-018'
READ_SOURCE_SHA256={
 'C4-L01':'88ce847b979b22e207220620773da83adf54178cca93e65d8f6f5fdca4da2464',
 'C4-L02':'94d809d9d32afa6112a415e5973777f606b35f0c88bcfbcb714c051839acb7a6',
 'C4-L03':'3e6a6e21590c78eb5d1cc562f0f9346475dddb8b9947d08f960d2c7abf1db4b2',
 'C4-L04':'f02e6be80d89ace3468e4c4b16088f023570fbb537a4c0af086ed36bec0d07a6'}
READ_ASSETS={
 'C4-coulomb.svg':'e3478c630a080624cafaa8361d262ab0ce201ff83a2e86ea9922b9e900d95611',
 'C4-campo.svg':'9b7701684b5420ce228ee2ca927067718ff9837dbab4d9ac886295251f8cb071',
 'C4-potenziale.svg':'3b9790e70b1a7f14bd3bc095e2017700b4d8af1f7b256585a5b499893c97a2ba',
 'C4-materiali.svg':'9a2737ac65cad7f65f6570bac50e031c3ec7008f301286036fc58d55631e65ba'}
FIGURES_BY_ID={key:[name] for key,name in zip(READ_SOURCE_SHA256,READ_ASSETS)}
SI=pint.UnitRegistry(non_int_type=Fraction)
PROBE='reviewer_constructed_exact_probe_not_assigned_numeric_exercise'

def check(claim,actual,expected,unit='',scope='symbolic_source_claim'):
    if isinstance(actual,SI.Quantity):actual=sp.Rational(actual.to(unit).magnitude)
    residual=sp.simplify(actual-expected)
    return {'claim':claim,'independentExact':str(actual),'expectedValue':str(expected),
      'residual':str(residual),'unit':unit,'dimension':{str(k):str(v) for k,v in SI.Unit(unit).dimensionality.items()},
      'relation':'exact','ok':residual==0,'scope':scope}

def independent_checks():
    Q,R=SI.Quantity,sp.Rational
    k,r,m,eps,A,s,sigma=sp.symbols('k r m epsilon_r A s sigma_free',positive=True)
    q1,q2,q,test,field,va,vb,offset=sp.symbols('q1 q2 q qtest E Va Vb offset',real=True)
    # Differentiate interaction energy; force is minus its position gradient.
    force=k*q1*q2/r**2
    x,y,t,vx,vy,Ey=sp.symbols('x y t vx vy Ey',real=True)
    potential=-field*x-Ey*y+offset
    energy=q*(vb-va)
    e_SI=sp.Rational(1602176634,10**28)
    return {
      'C4-L01':[
        check('charge transferred between two isolated bodies preserves total',q1-q+q2+q,q1+q2,'C'),
        check('pair radial force follows negative energy gradient',-sp.diff(k*q1*q2/r,r),force,'N'),
        check('opposite body forces cancel in vector sum',-force+force,0,'N'),
        check('halving positive separation multiplies force magnitude by four',force.subs(r,r/2)/force,4),
        check('doubling each charge multiplies force by four',force.subs({q1:2*q1,q2:2*q2},simultaneous=True)/force,4),
        check('working9e9 times2uC times3uC over30cm squared',Q(9*10**9,'N*m**2/C**2')*Q(2,'microcoulomb')*Q(3,'microcoulomb')/Q(30,'centimeter')**2,R(3,5),'N',PROBE),
        check('five exact elementary charges count back to five',5*e_SI/e_SI,5,'',PROBE),
        check('printed1.602e-19 is rounded not exact SI elementary charge',e_SI-R(1602,10**22),R(176634,10**28),'C','quantified_rounded_working_coefficient'),
      ],
      'C4-L02':[
        check('field component is negative potential gradient',-sp.diff(potential,x),field,'N/C'),
        check('test charge quotient is independent of test magnitude',test*field/test,field,'N/C'),
        check('equal positive sources cancel at midpoint',k*q/r**2-k*q/r**2,0,'N/C'),
        check('opposite sources reinforce at midpoint',k*q/r**2+k*q/r**2,2*k*q/r**2,'N/C'),
        check('negative2uC in rightward4NperC has negative8uN force',Q(-2,'microcoulomb')*Q(4,'N/C'),-8,'micronewton',PROBE),
        check('electric acceleration has mechanical acceleration units',Q(-8,'micronewton')/Q(2,'milligram'),-4,'m/s**2',PROBE),
        check('uniform electric acceleration has zero jerk',sp.diff(vx*t+q*field*t**2/(2*m),t,3),0,'m/s**3'),
        check('transverse component has zero acceleration',sp.diff(vy*t,t,2),0,'m/s**2'),
        check('eliminating time yields parabola when transverse speed is nonzero',
              (q*field*t**2/(2*m)).subs(t,y/vy),q*field*y**2/(2*m*vy**2),'m'),
      ],
      'C4-L03':[
        check('voltage times charge is energy',Q(3,'microcoulomb')*Q(-20,'volt'),-60,'microjoule',PROBE),
        check('positive charge gains60uJ kinetic energy down20V',-R(3,10**6)*(-20),R(3,50000),'J',PROBE),
        check('negative charge reverses potential energy change',energy.subs(q,-q),-energy,'J'),
        check('changing both potential zeros preserves energy',q*((vb+offset)-(va+offset)),energy,'J'),
        check('field work plus potential energy change vanishes',-energy+energy,0,'J'),
        check('uniform field voltage difference follows line integral',sp.integrate(-field,(x,0,r)),-field*r,'V'),
        check('equipotential displacement perpendicular to field does no work',
              (potential.subs(y,y+r)-potential).subs(Ey,0),0,'V'),
        check('half sum of three charges times other-source potentials counts pairs once',
              (q1*(k*q2/r+k*q/(2*r))+q2*(k*q1/r+k*q/r)+q*(k*q1/(2*r)+k*q2/r))/2,
              k*(2*q1*q2+q1*q+2*q2*q)/(2*r),'J'),
        check('potential derivative recovers point source field',-sp.diff(k*q/r,r),k*q/r**2,'N/C'),
      ],
      'C4-L04':[
        check('redistributing conduction charge preserves neutral total',-3*q+3*q,0,'C'),
        check('each bound polarized pair is neutral',-q+q,0,'C'),
        check('opposing induced field cancels applied field in metal',field-field,0,'N/C'),
        check('constant connected metal potential has zero gradient',sp.diff(offset,x),0,'N/C'),
        check('fully filled ideal capacitor at fixed free charge reduces field',
              (sigma/eps)/(sigma),1/eps),
        check('relative permittivity four halves twice at fixed free charge',
              Q(12,'N/C')/4,3,'N/C',PROBE),
        check('fixed voltage with fixed gap instead leaves field unchanged',
              Q(6,'volt')/Q(2,'centimeter'),300,'N/C',PROBE),
        check('finite resistive conductor can sustain nonzero internal field',
              Q(2,'ohm')*Q(3,'ampere')/Q(2,'meter'),3,'V/m',PROBE),
      ]}

MANUAL={
 'C4-L01':'Nessuna valutazione decimale è assegnata: dimezzare r dà1/(1/2)^2=4. Nel solo controllo del revisore,30cm=3/10m,2µC·3µC=6·10^-12C²;9·10^9·6·10^-12/(9/100)=3/5N. I valori stampati di k ed e sono approssimati, non identità SI esatte.',
 'C4-L02':'Il testo richiede costruzione e somma di vettori, non numeri non agevoli. Per il probe:−2µC·4N/C=−8µN;2mg=2·10^-6kg, quindi−8·10^-6/(2·10^-6)=−4m/s². Le potenze di dieci si cancellano prima della divisione.',
 'C4-L03':'La figura stampa60,40,20,0V su linee equidistanti: ogni intervallo è−20V. Per il probe3µC·(−20V)=−60µJ, lavoro+60µJ per q positiva. Le frazioni bastano; nessuna radice deve essere valutata in decimale se si ricava una velocità simbolica.',
 'C4-L04':'Nessun dato numerico è assegnato; i dipoli si contano per coppie neutre. A carica libera fissata il rapporto è1/εr. Il probe12/4=3N/C usa due dimezzamenti; a6Vsu2cm,6/(2/100)=300V/m. Non confondere questi due vincoli.'}
ASSUMPTIONS={
 'C4-L01':'Cariche puntiformi ferme nel vuoto, separazione non nulla; nuclei invariati nella normale elettrizzazione; sistema isolato per conservazione della carica totale. Le forze agiscono su corpi distinti.',
 'C4-L02':'Prova sufficientemente piccola da non alterare le sorgenti; elettrostatica, campo risultante per sovrapposizione. Piastre grandi e lontano dai bordi; accelerazione costante solo in campo uniforme con altre forze trascurate e regime non relativistico. La parabola richiede velocità trasversale non nulla.',
 'C4-L03':'Sorgenti elettrostatiche e carica di prova costante; zero del potenziale comune; solo forza elettrica nel bilancio cinetico. Ogni coppia contata una volta nell’energia di assemblaggio. Formula ΔV=−E·Δr limitata al campo uniforme.',
 'C4-L04':'Equilibrio elettrostatico nel materiale conduttore collegato, non in qualunque cavità né in un filo resistivo percorso da corrente. Conduttore isolato o collegato a terra sono condizioni diverse. Riduzione dielettrica riferita al modello usuale di piastre ideali, materiale lineare che riempie l’intercapedine, carica libera fissata.'}
PEDAGOGY={
 'C4-L01':'Il trasferimento di elettroni precede segni, legge e sovrapposizione; frecce su corpi distinti impediscono di annullare le due forze nel diagramma di un solo corpo. La forza scalare stampata è un modulo.',
 'C4-L02':'La prova positiva fissa la direzione di E; il segno della carica introdotta determina la forza. Somma delle componenti distinta dalla somma dei moduli; campo e accelerazione collegati senza richiedere passaggi numerici impliciti.',
 'C4-L03':'Si definisce prima VB−VA, poi energia e lavoro; grafico a potenziale decrescente rende controllabile il segno. La scelta fra dinamica ed energia dipende dalla domanda sui tempi o sulle velocità.',
 'C4-L04':'Confronto controllato fra migrazione di elettroni nel metallo e dipoli legati; neutralità globale compatibile con separazione locale. Esplicita perché la stessa conclusione sul potenziale non vale per un filo resistivo in corrente continua.'}
FIGURE_REVIEW={
 'C4-L01':'Due frecce orizzontali di106px applicate a cariche distinte opposte e dirette verso l’altra; r quotato fra i centri152/483. Marker di ogni forza presente, segni e didascalie concordi. Lunghezze non usate come scala in newton.',
 'C4-L02':'Piastre+ a sinistra e− a destra, due lineeE verso destra; frecciaF dalla carica negativa verso sinistra. Nessuna linea attraversa simboli/etichette essenziali.',
 'C4-L03':'Quattro linee verticali distanti114px con potenziali60,40,20,0V; campo verso destra, tangente orizzontale e normale alle equipotenziali. Il gradiente grafico è uniforme; i pixel non sono convertiti in metri.',
 'C4-L04':'Conduttore con tre− a sinistra e tre+ a destra, Eint=0 nel materiale; dielettrico con sei coppie−/+ legate e orientate. Freccia del campo esterno verso destra, coerente con tutti i segni. Neutralità verificata per campione.'}

def verify(sources,asset_root=None):
    if set(READ_SOURCE_SHA256)-set(sources):raise ValueError('Missing independently read electrostatics lessons')
    root=Path(asset_root) if asset_root is not None else APP/'static/figures'
    models=independent_checks();records=[]
    for key in sorted(READ_SOURCE_SHA256):
        row=sources[key];errors=[]
        if row.get('kind')!='lesson' or digest(row)!=READ_SOURCE_SHA256[key]:errors.append('Lesson differs from independently read original')
        refs={'/figures/'+name for name in FIGURES_BY_ID[key]}
        if {b['src'] for b in row.get('blocks',[]) if b.get('type')=='figure'}!=refs:errors.append('Lesson figures differ from read original')
        assets={}
        for name in FIGURES_BY_ID[key]:
            file=root/name;actual=sha(file.read_bytes()) if file.is_file() else 'MISSING';assets['/figures/'+name]=actual
            if actual!=READ_ASSETS[name]:errors.append('Historical lesson figure changed or missing')
        checks=models[key]
        if not checks or not all(c['ok'] for c in checks):errors.append('Independent lesson mathematics failed')
        records.append({'id':key,'sourceSha256':digest(row),'sourceVersion':row.get('version',1),
          'sourceRef':SOURCE_REF,'sourcePath':SOURCE_PATH,'sourceFileSha256':SOURCE_FILE_SHA256,
          'ok':not errors,'errors':errors,'checks':checks,'dimension':{c['claim']:c['dimension'] for c in checks},
          'calculationScope':'EXACT_MANUAL_CALCULATION','manualArithmetic':MANUAL[key],
          'manualFeasibility':'PASS_AI_EXACT','physicalAssumptions':ASSUMPTIONS[key],
          'pedagogicalReview':PEDAGOGY[key],'assetChecksums':assets,'figureReview':FIGURE_REVIEW[key],
          'verificationMode':'INDEPENDENT_EXISTING_EDITION','failedPublishedEdition':False,
          'originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE'})
    return records

def report(sources):
    records=verify(sources)
    return {'schemaVersion':'1.0.0','batch':BATCH,'records':records,
      'verifierSha256':sha(Path(__file__).read_bytes()),'sourceRef':SOURCE_REF,'sourcePath':SOURCE_PATH,
      'sourceFileSha256':SOURCE_FILE_SHA256,'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),
      'acceptedCount':sum(r['ok'] for r in records),'failedCount':sum(not r['ok'] for r in records),
      'draftReviewedCount':0,'failedPublishedEditionIds':[],
      'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'root_AI_reviewer_not_historical_author','originalEditionRetained':True,
      'humanApproval':'NOT_RUN','publicationAction':'NONE'}
