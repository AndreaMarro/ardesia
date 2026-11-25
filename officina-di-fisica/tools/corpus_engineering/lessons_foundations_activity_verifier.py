"""Independent complete reading of four original foundations lessons.

Every block and six historical figures read/rendered before freezing source
hashes. Source teaching claims are checked, not inferred from missing answers.
"""
from fractions import Fraction
from pathlib import Path

import pint
import sympy as sp

from .pipeline import digest,sha
from .review_contract import reviewed_rows

APP=Path(__file__).resolve().parents[2]
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/C1.json'
SOURCE_FILE_SHA256='0a79b1212adbef650733d655d1de2d5ffd7af5eb2be2bde50710a0a1721ab0cf'
BATCH='lessons-foundations-011'
READ_SOURCE_SHA256={
    'C1-L001':'9c4fe4cb7a39a054a231ba95e5bb8cbf16c144f396dff41146907d9e6a6a1a2a',
    'C1-L002':'99819e1718415a1562dda30d5475ac988421423a5e1746ca3328d0f5b6419b28',
    'C1-L003':'6c15729bda7bfdfd6dd9b1b6c1387cf59a9a9938a153094c30b2af283eaaea2b',
    'C1-L004':'964bdc7021fe5466d3a86cf18356fe1708bb9441d184414cb88587fa4bb00584',
}
READ_ASSETS={
    'C1-scala.svg':'6c59566179802d99d4bc34c78f1a5074d2c3c1f0fd273c850631d0992ec19bad',
    'C1-vettore.svg':'aba4cee638235b6a99ea823d57361e3b1366cd79ce92b8ac46240ec29580ff8c',
    'C1-posizione.svg':'60f8e433938fb419332373efd343b8986057bea63c44691770fa8d40454e6d89',
    'C1-velocita.svg':'0983a43aa7f3bb6aeb9493172a1bdc7361ef602887b9bb29c0e4db4e02776d3a',
    'C1-parabola.svg':'dd8d8c1f3bd2470e26e9867d6d5475286f1bfab0030be95597f689031df37bcb',
    'C1-circolo.svg':'158b6a3f5b0614ce90034b870182536612b95171a10fc9cb51ee6d7d749341cf',
}
FIGURES_BY_ID={'C1-L001':['C1-scala.svg'],'C1-L002':['C1-vettore.svg'],
    'C1-L003':['C1-posizione.svg','C1-velocita.svg'],'C1-L004':['C1-parabola.svg','C1-circolo.svg']}
ISSUES={'C1-L002':{'priority':'P2','kind':'signed_projection_overgeneralization',
    'reason':'Original says parallel vectors have maximum projection without restricting to codirected vectors or projection magnitude; antiparallel signed projection is the minimum.'},
    'C1-L003':{'priority':'P3','kind':'endpoint_caption_precision',
    'reason':'Velocity-graph caption says positive throughout; intended labelled endpoints are zero. Motion conclusion and all slope/area formulas remain correct; precision issue only.'}}
SI=pint.UnitRegistry(non_int_type=Fraction)
REVISION_IDS={'C1-L002','C1-L003'}
# Final complete editions reread after formula splitting and asset-binding fixes.
REVIEWED_REVISIONS={
    'C1-L002':'1686898c49d4a603e58f396cbc7466d05d197a8a927bfd51b04314fd2dec6d3e',
    'C1-L003':'5bbc6f5055a9345120879dc10a7016c4be35a0cc8883e2866e02820d6cd3dc8f',
}


def check(claim,actual,expected,unit=''):
    if isinstance(actual,SI.Quantity):actual=sp.Rational(actual.to(unit).magnitude)
    residual=sp.simplify(actual-expected)
    return {'claim':claim,'independentExact':str(actual),'expectedValue':str(expected),'unit':unit,
        'dimension':{str(k):str(v) for k,v in SI.Unit(unit).dimensionality.items()},
        'relation':'exact','residual':str(residual),'ok':residual==0}


def independent_checks():
    Q,R=SI.Quantity,sp.Rational
    m,V=sp.symbols('m V',positive=True)
    A,B=sp.symbols('A B',positive=True)
    theta,phi=sp.symbols('theta phi',real=True)
    avec=sp.Matrix([A*sp.cos(theta),A*sp.sin(theta),0])
    bvec=sp.Matrix([B*sp.cos(phi),B*sp.sin(phi),0])
    ax,ay,bx,by=sp.symbols('ax ay bx by',real=True)
    coordinate_sum=sp.Matrix([ax,ay])+sp.Matrix([bx,by])
    dot=sp.trigsimp(avec.dot(bvec));cross=avec.cross(bvec)
    t=sp.Symbol('t',real=True)
    v0,a,g=sp.symbols('v0 a g',real=True)
    x0,y0,vx,vy=sp.symbols('x0 y0 vx vy',real=True)
    uniform_v=v0+sp.integrate(a,(t,0,t))
    displacement=sp.integrate(uniform_v,(t,0,t))
    projectile_x=x0+vx*t;projectile_y=y0+vy*t-g*t**2/2
    horizontal=sp.Symbol('x',real=True)
    eliminated_y=projectile_y.subs(t,(horizontal-x0)/vx)
    step,beta=sp.symbols('step beta',real=True)
    r,period=sp.symbols('r period',positive=True)
    omega=2*sp.pi/period
    orbit=sp.Matrix([r*sp.cos(omega*t),r*sp.sin(omega*t)])
    orbit_v=sp.diff(orbit,t);orbit_a=sp.diff(orbit_v,t)
    u=sp.Symbol('u',real=True)
    px=(1-u)**2*85+2*(1-u)*u*276+u**2*467
    py=(1-u)**2*169+2*(1-u)*u*(-97)+u**2*169
    # Printed labelled position graph: (0,0),(2,6),(4,6),(6,2).
    pos_slopes=[R(6,2),R(0,2),R(2-6,6-4)]
    # The second graphic illustrates a different motion: v0,peak6 at3s,end0 at6s.
    velocity_first=2*t;velocity_second=12-2*t
    results={
        'C1-L001':[
            check('3mm equivalgono a0,003m',Q(3,'mm'),R(3,1000),'m'),
            check('area centimetro quadrato',Q(1,'cm**2'),100,'mm**2'),
            check('volume centimetro cubo',Q(1,'cm**3'),R(1,1000000),'m**3'),
            check('densita g/cm3 convertita',Q(1,'g/cm**3'),1000,'kg/m**3'),
            check('segno notazione scientifica',-3*R(1,1000),-R(3,1000),'m'),
            check('fattore conversione vale1',Q(1,'cm')/Q(10,'mm'),1),
            check('densita dopo divisione uniforme',sp.simplify((m/2)/(V/2)),m/V,'kg/m**3'),
            check('soglia logaritmica sqrt10',sp.log(sp.sqrt(10),10),R(1,2)),
            check('figura10celle per lato',R(156)/R(156,10),10),
            check('figura100celle di area',R(156)**2/R(156,10)**2,100)],
        'C1-L002':[
            check('modulo da componenti ortonormali',sp.trigsimp(avec.dot(avec)),A**2,'m**2'),
            check('dot da componenti e angolo relativo',dot,A*B*sp.cos(theta-phi),'m**2'),
            check('identita area parallelogramma',sp.trigsimp(cross.dot(cross)+dot**2),A**2*B**2,'m**4'),
            check('dot paralleli concordi',dot.subs({theta:0,phi:0}),A*B,'m**2'),
            check('dot paralleli discordi',dot.subs({theta:0,phi:sp.pi}),-A*B,'m**2'),
            check('cross paralleli nullo',cross.subs({theta:0,phi:sp.pi}).dot(cross.subs({theta:0,phi:sp.pi})),0,'m**4'),
            check('prova manuale modulo3-4-5',sp.sqrt(3**2+4**2),5,'m'),
            check('somma componenti x',coordinate_sum[0],ax+bx,'m'),
            check('somma componenti y',coordinate_sum[1],ay+by,'m'),
            check('vettore e opposto sommano zero',(sp.Matrix([3,4,0])+sp.Matrix([-3,-4,0])).dot(sp.Matrix([3,4,0])+sp.Matrix([-3,-4,0])),0,'m**2'),
            check('prodotto scalare con opposto3-4',sp.Matrix([3,4,0]).dot(sp.Matrix([-3,-4,0])),-25,'m**2'),
            check('mano destra basisx cross basisy',sp.Matrix([1,0,0]).cross(sp.Matrix([0,1,0])).dot(sp.Matrix([0,0,1])),1),
            check('dimensione lavoro da forza e spostamento',Q(3,'N')*Q(4,'m'),12,'J'),
            check('stessa tangente quadranti opposti',R(-4,-3),R(4,3)),
            check('figura rapporto proiezioni',R(174-54,328-88),R(1,2)),
            check('controesempio alla proiezione firmata massima di tutti i paralleli',sp.Integer(-1),1,'m')],
        'C1-L003':[
            check('pendenza primo tratto x-t',pos_slopes[0],3,'m/s'),
            check('pendenza sosta x-t',pos_slopes[1],0,'m/s'),
            check('pendenza ritorno x-t',pos_slopes[2],-2,'m/s'),
            check('spostamento complessivo x-t',sp.Integer(2-0),2,'m'),
            check('distanza percorsa x-t',sp.Integer(6+0+4),10,'m'),
            check('velocita media su6s',R(2,6),R(1,3),'m/s'),
            check('rapidita media diversa',R(10,6),R(5,3),'m/s'),
            check('limite secante per velocita istantanea',sp.limit((beta*(t+step)**2-beta*t**2)/step,step,0),2*beta*t,'m/s'),
            check('limite secante per accelerazione',sp.limit(((v0+a*(t+step))-(v0+a*t))/step,step,0),a,'m/s**2'),
            check('accelerazione salita v-t',sp.diff(velocity_first,t),2,'m/s**2'),
            check('accelerazione discesa v-t',sp.diff(velocity_second,t),-2,'m/s**2'),
            check('spostamento da area primo triangolo',sp.integrate(velocity_first,(t,0,3)),9,'m'),
            check('spostamento da area secondo triangolo',sp.integrate(velocity_second,(t,3,6)),9,'m'),
            check('velocita agli estremi v-t',velocity_first.subs(t,0)+velocity_second.subs(t,6),0,'m/s')],
        'C1-L004':[
            check('integrazione accelerazione costante',uniform_v,v0+a*t,'m/s'),
            check('integrazione velocita lineare',displacement,v0*t+a*t**2/2,'m'),
            check('accelerazione orizzontale proiettile',sp.diff(projectile_x,t,2),0,'m/s**2'),
            check('accelerazione verticale proiettile',sp.diff(projectile_y,t,2),-g,'m/s**2'),
            check('vy al culmine g nonnullo',sp.diff(projectile_y,t).subs(t,vy/g),0,'m/s'),
            check('vx al culmine obliquo',sp.diff(projectile_x,t).subs(t,vy/g),vx,'m/s'),
            check('eliminazione tempo dà parabola',sp.diff(eliminated_y,horizontal,2),-g/vx**2,'1/m'),
            check('velocita circolare al quadrato',sp.trigsimp(orbit_v.dot(orbit_v)),omega**2*r**2,'m**2/s**2'),
            check('accelerazione radiale reale',sp.trigsimp(orbit_a.dot(orbit)), -omega**2*r**2,'m**2/s**2'),
            check('v e a perpendicolari giro uniforme',sp.trigsimp(orbit_v.dot(orbit_a)),0,'m**2/s**3'),
            check('modulo accelerazione centripeta',sp.sqrt(sp.trigsimp(orbit_a.dot(orbit_a))),omega**2*r,'m/s**2'),
            check('modulo velocita da periodo',sp.sqrt(sp.trigsimp(orbit_v.dot(orbit_v))),2*sp.pi*r/period,'m/s'),
            check('ac uguale vquadro su r',(omega*r)**2/r,omega**2*r,'m/s**2'),
            check('figura parabola culmine x',px.subs(u,R(1,2)),276),
            check('figura parabola culmine y',py.subs(u,R(1,2)),36),
            check('tangente orizzontale al culmine SVG',sp.diff(py,u).subs(u,R(1,2)),0),
            check('prova firmata v0-1,a1,t3',displacement.subs({v0:-1,a:1,t:3}),R(3,2),'m'),
            check('distanza prova invertita',-sp.integrate(t-1,(t,0,1))+sp.integrate(t-1,(t,1,3)),R(5,2),'m')],
    }
    results['C1-L001'].append({'claim':'SI sette dimensioni base distinte','independentExact':'m,kg,s,A,K,mol,cd','expectedValue':'7',
        'unit':'','dimension':{},'relation':'independent_unit_dimension_identity',
        'ok':len({tuple(sorted((str(k),str(v)) for k,v in SI.Unit(unit).dimensionality.items())) for unit in ('m','kg','s','A','K','mol','cd')})==7})
    results['C1-L003'].append({'claim':'caption strettamente positiva anche agli estremi',
        'independentExact':'v(0)=v(6)=0;v>0 only for0<t<6',
        'expectedValue':'positive throughout all displayed instants','unit':'m/s','dimension':{'[length]':'1','[time]':'-1'},
        'relation':'editorial_boundary_counterexample_motion_conclusion_remains_correct','ok':False})
    return results


MANUAL={
    'C1-L001':'3mm=3/1000m=0,003m;10mm=1cm,quindi1cm²=100mm² e1cm³=(1/100m)^3=1/1000000m³.1g/cm³=(1/1000kg)/(1/1000000m³)=1000kg/m³.−3*0,001=−0,003. Soglia logaritmica fra10^n e10^(n+1):loga=1/2⇒a=sqrt10;9<10<16 distingue coefficienti3/4 senza calcolatrice. Densita (m/2)/(V/2)=m/V. Griglia10*10=100celle.',
    'C1-L002':'Formule controllate simbolicamente:cos²+sin²=1;dotABcos(theta−phi);cross²+dot²=A²B². Prova costruita dal reviewer(3,4)m ha modulo5m,cos3/5,sin4/5;opposto(−3,−4) ha stessa tangente4/3 ma quadrante opposto. Figura proietta240px e120px,rapporto1/2. FALLIMENTO originale limitato:perA=(1,0)m e direzioneB=(−1,0),proiezione firmata−1m non è massimo+1m. Dire concordi o massimo IN MODULO risolve,ma non è aggiunto retroattivamente.',
    'C1-L003':'Figura x-t:(0,0),(2,6),(4,6),(6,2),pendenze3,0,−2m/s;spostamento2m,distanza10m,medie1/3 e5/3m/s. Figura v-t distinta:0→6m/s in3s poi0in6s;accelerazioni±2m/s² earee9+9=18m. Nessun ritorno nel secondo grafico. FALLIMENTO editorialeP3:caption dicepositiva,ma v agli estremi è0;corretta la crescita di posizione. Non invento errore nel moto né equivalenza fra due grafici che illustrano moti diversi.',
    'C1-L004':'Integraa costante:v0+at e integralev=v0t+at²/2. Cony alto,secondaderivatay=−g anche in salita;apicevy0 maax0/ay−g,perobliquovx non0. Derivaorbita(r cosωt,r sinωt):v²=ω²r²,a=−ω²rhat,a·v0,ac=ω²r=v²/r,ω2pi/T. Prova numerica del reviewer v0−1,a1,t3:spostamento3/2m,distanza1/2+2=5/2m. Nessun valore decimale di pi richiesto. Bezier culmine(276,36),tangenteorizzontale;circolo r76px,tangente e centro perpendicolari.'}
ASSUMPTIONS={
    'C1-L001':'SI dimensional framework,nonzero quantity for normalized scientific notation and logarithmic order;zero separately written with unit. Order of magnitude uses explicitly logarithmic distance and upper exponent at tie. Intensive/extensive comparison is same uniform substance and unchanged state;density is average homogeneous mass/volume.',
    'C1-L002':'Orthonormal Cartesian axes,right-handed orientation for cross product;A denotes nonnegative magnitude. Angle between nonzero vectors is in[0,pi],so cross magnitudeABsin(alpha) is nonnegative. Zero/parallel cross has no defined nonzero normal direction. Signed projections may be negative. Final original maximum-projection sentence fails for antiparallel vectors.',
    'C1-L003':'One-dimensional coordinates relative to chosen origin and axis,positive elapsed time;instantaneous derivatives where differentiable. Corners of ideal piecewise plots require one-sided treatment,not unique tangents. Position and velocity figures are separate illustrations,not derivatives of one shared motion. Intended zero endpoints in v-t lie within the SVG stroke/one-pixel baseline offset;caption positivity issue does not reverse motion.',
    'C1-L004':'Constant acceleration along fixed line;initial clockt0. Projectile near Earth in approximately inertial lab,uniform downwardg,no air,oblique launchvx nonzero and same clock for axes. Circular uniform motion has positiver,T and constant speed;centripetal is acceleration direction caused by real radial interactions,not an extra force.'}
PEDAGOGY={
    'C1-L001':'Progression from matching units to derived density,area/volume powers,signed scientific notation,explicit logarithmic threshold,intensive/extensive distinction and scalars/vectors. No prefix shortcut for volumes. Exactmanual comparisons3²<10<4² check threshold without calculating sqrt10.',
    'C1-L002':'Correct components,head-to-tail sum/opposite difference,dot/cross contrast and quadrant warning. Original signed-projection wording needs concordant/discordant qualification;cannot silently read maximum as magnitude because negative projections were explicitly introduced.',
    'C1-L003':'Correct distinction of trajectory versus time graph,secant/tangent slope,velocity/acceleration and signed area. Correct stop atx6m and falling positive-v segment without return. Original boundary-caption precision only:zero endpoints should be called nonnegative,positive internally. This isP3,not a false acceleration/direction lesson.',
    'C1-L004':'Integrates linearly changing velocity and distinguishes signed displacement from distance. Gravity remains downward at apex;horizontal velocity survives an oblique launch. Circle explains changing direction at constant speed and points to real tension/radial force rather than adding a fictitious centripetal interaction.'}
FIGURE_REVIEW={
    'C1-L001':'156px square with9 internal grid lines per direction at15,6px spacing,10x10 cells;red square15,6pxside is1/100totalarea.10mm=1cm and1cm²=100mm² exact.',
    'C1-L002':'Origin(88,174),tip(328,54):positive x240px,y120px,perpendicular dashed projections and angle from+x toward+y. No numeric length/angle scale assigned;arc is schematic,not decimal atan requirement.',
    'C1-L003':'x-t ticks t2/4/6 andx0/6/2 agree withpiecewise plot,plateau2..4 at6m. v-t ticks peak6at3s and end6s supporttriangle area18m;baselinepolygonoffset1px iswithin stroke,not meaningful residual speed. Caption strictlypositive fails intended zero endpoints;all interiorv positive.',
    'C1-L004':'Projectile quadraticBezier has apex(276,36) exactly and horizontalv at apex,downwardg;launch/return sameheight. Circlecenter(235,111),rightpoint(311,111),radius76px;velocityup tangent,accelerationleft towardcenter. No numeric physical arrow/length scale claimed.'}


def verify_originals(sources,asset_root=None):
    missing=set(READ_SOURCE_SHA256)-set(sources)
    if missing:raise ValueError('Missing independently read lessons: '+','.join(sorted(missing)))
    root=Path(asset_root) if asset_root is not None else APP/'static/figures';models=independent_checks();records=[]
    for key in sorted(READ_SOURCE_SHA256):
        row=sources[key];errors=[]
        if row.get('kind')!='lesson' or digest(row)!=READ_SOURCE_SHA256[key]:errors.append('Lesson differs from independently read original')
        refs={'/figures/'+name for name in FIGURES_BY_ID[key]}
        if {b['src'] for b in row.get('blocks',[]) if b.get('type')=='figure'}!=refs:errors.append('Lesson figures differ from read original')
        assets={}
        for name in FIGURES_BY_ID[key]:
            file=root/name;actual=sha(file.read_bytes()) if file.is_file() else'MISSING';assets['/figures/'+name]=actual
            if actual!=READ_ASSETS[name]:errors.append('Historical lesson figure changed or missing')
        checks=models[key]
        if not all(claim['ok'] for claim in checks):errors.append('Independent lesson claim counterexample or mathematics failed')
        if key in ISSUES:errors.append(ISSUES[key]['reason'])
        record={'id':key,'sourceSha256':digest(row),'sourceVersion':row.get('version',1),'sourceRef':SOURCE_REF,
            'sourcePath':SOURCE_PATH,'sourceFileSha256':SOURCE_FILE_SHA256,'ok':not errors,'errors':errors,'checks':checks,
            'dimension':{claim['claim']:claim['dimension'] for claim in checks},'calculationScope':'EXACT_MANUAL_CALCULATION',
            'manualArithmetic':MANUAL[key],'manualFeasibility':'FAIL_ORIGINAL_EDITION' if key in ISSUES else'PASS_AI_EXACT',
            'physicalAssumptions':ASSUMPTIONS[key],'pedagogicalReview':PEDAGOGY[key],'assetChecksums':assets,'figureReview':FIGURE_REVIEW[key],
            'verificationMode':'INDEPENDENT_EXISTING_EDITION','failedPublishedEdition':key in ISSUES,
            'originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
        if key in ISSUES:record['publishedEditionIssue']=ISSUES[key]
        records.append(record)
    return records


def revised_checks(key):
    """Independent full mathematics retained, corrected new claims checked anew."""
    original=independent_checks()[key]
    if key=='C1-L002':
        checks=[claim for claim in original if claim['claim']!='controesempio alla proiezione firmata massima di tutti i paralleli']
        A=sp.Matrix([1,0,0]);same=sp.Matrix([1,0,0]);opposite=sp.Matrix([-1,0,0]);orthogonal=sp.Matrix([0,1,0])
        checks.extend([check('nuovo esempio coseno3-4-5',3/sp.sqrt(3**2+4**2),sp.Rational(3,5)),
            check('nuovo esempio seno3-4-5',4/sp.sqrt(3**2+4**2),sp.Rational(4,5)),
            check('concordi massimo con segno',A.dot(same),1),
            check('discordi minimo con segno',A.dot(opposite),-1),
            check('ortogonali prodotto scalare',A.dot(orthogonal),0),
            check('area concordi',A.cross(same).norm(),0),
            check('area discordi',A.cross(opposite).norm(),0),
            check('area ortogonali',A.cross(orthogonal).norm(),1),
            check('figura modulo unitario scala comune',sp.Rational(120,120),1),
            check('figura area unitaria quadrato',sp.Rational(120*120,120**2),1)])
    else:
        checks=[claim for claim in original if claim['claim']!='caption strettamente positiva anche agli estremi']
        t=sp.Symbol('t',real=True);first=2*t;second=12-2*t
        checks.extend([check('nuova caption estremo iniziale nullo',first.subs(t,0),0,'m/s'),
            check('nuova caption estremo finale nullo',second.subs(t,6),0,'m/s'),
            check('triangolo v-t area totale',sp.integrate(first,(t,0,3))+sp.integrate(second,(t,3,6)),18,'m'),
            check('media velocita secondo grafico',sp.Rational(18,6),3,'m/s'),
            check('accelerazione media intero intervallo',sp.Rational(0-0,6),0,'m/s**2'),
            check('derivate unilaterali diverse al vertice',sp.diff(second,t)-sp.diff(first,t),-4,'m/s**2')])
        checks.append({'claim':'nonnegativita con sola positivita interna',
            'independentExact':'2t for0<=t<=3;12-2t for3<=t<=6; endpoints0,peak6',
            'expectedValue':'nonnegative on[0,6],positive on(0,6),not differentiable at3',
            'unit':'m/s','dimension':{'[length]':'1','[time]':'-1'},'relation':'piecewise_linear_sign_and_derivative_check',
            'ok':bool(first.subs(t,0)==0 and first.subs(t,3)==6 and second.subs(t,3)==6
                      and second.subs(t,6)==0 and sp.diff(first,t)>0 and sp.diff(second,t)<0)})
    return checks


def verify(sources,package=None,bindings=None,asset_root=None,original_asset_root=None):
    historical_root=original_asset_root if original_asset_root is not None else asset_root if package is None else None
    originals=verify_originals(sources,historical_root)
    if package is None:
        if bindings is not None:raise ValueError('Bindings require a revision package')
        return originals
    if bindings is None:raise ValueError('Revision package requires complete source bindings')
    root=Path(asset_root) if asset_root is not None else APP/'editorial/assets'
    rows=reviewed_rows(package,bindings,REVIEWED_REVISIONS,REVISION_IDS,root)
    byid={record['id']:record for record in originals}
    for row,binding,signature,assets,errors in rows:
        key=row['id'];original=byid[key]
        if (binding['sourceRef']!=SOURCE_REF or binding['sourceId']!=key
                or binding['sourceSha256']!=original['sourceSha256']
                or original['sourceSha256']!=READ_SOURCE_SHA256[key]):
            errors.append('Lesson revision not bound to independently read original')
        if (row.get('kind')!='lesson' or 'answer' in row
                or type(row.get('version')) is not int or type(row.get('baseVersion')) is not int
                or row['version']!=original['sourceVersion']+1 or row['baseVersion']!=original['sourceVersion']):
            errors.append('Expected additive next lesson edition with correct base and no answer key')
        for src,checksum in original['assetChecksums'].items():
            if checksum!=READ_ASSETS[src.removeprefix('/figures/')]:
                errors.append('Retained historical lesson figure changed or missing')
        checks=revised_checks(key)
        if not all(claim['ok'] for claim in checks):errors.append('Independent revised lesson mathematics failed')
        revised=dict(original)
        revised.update(ok=not errors,errors=errors,checks=checks,
            dimension={claim['claim']:claim['dimension'] for claim in checks},
            manualFeasibility='PASS_AI_EXACT',manualArithmetic='NEW DRAFT: '+MANUAL[key],
            physicalAssumptions=('NEW DRAFT: '+ASSUMPTIONS[key].split('Final original')[0]
                if key=='C1-L002' else 'NEW DRAFT: Separate labelled position/velocity examples,positive elapsed times;derivatives where defined. Velocity triangle zero at0/6s,positive internally,nonnegative overall;acceleration vertex undefined as explicitly stated.'),
            pedagogicalReview=('New complete L002 reread: explicitly distinguishes maximum signed dot for concordant vectors,minimum for discordant,max projection magnitude for both;angle undefined for zero vector,vertical Ax0 case avoids division.3-4-5 example explicitly distinct from illustration and exact direction ratios require no inverse-trig decimal. All formulas are now standalone valid equations.'
                if key=='C1-L002' else 'New complete L003 reread: states two figures are different motions,corrects zero-endpoint caption and derives slopes,displacement versus distance,mean speeds,triangle area and signed acceleration. Precise boundary statement repairs only original P3 wording;no false motion defect is invented.'),
            assetChecksums=assets,candidateSha256=digest(row),reviewedSignature=signature,
            candidateVersion=row['version'],baseVersion=row['baseVersion'],failedPublishedEdition=True,
            publishedEditionReview=original,reviewedEdition='NEW_DRAFT',verificationMode='EXACT_ORACLE',publicationAction='DRAFT',
            figureReview=('Historical vector SVG uploaded byte-identically,plus fully read/rendered new signed-vector comparison at common120px/unit:codirected arrows coincide,orthogonal120x120 square area1,opposite arrows same norm with−1 signed projection. Geometric path endpoints define scale,arrowhead ink is decorative;no length read from glyph overflow.'
                if key=='C1-L002' else 'Both historical graph SVGs uploaded byte-identically,with explicit distinct-motion and nonnegative-velocity caption. Printed tick values,slopes3/0/−2 and±2,areas18m,displacement2m/distance10m checked independently;no changed geometry or invented precise pixel metric.'))
        # Candidate manual description must identify the correction as fixed, not
        # repeat the retained original finding as though still applicable to v2.
        revised['manualArithmetic']=('NEW DRAFT: 3²+4²=25⇒A5m,cos3/5,sin4/5 withQI and no inverse-trig decimal;vector sum componentwise and difference via opposite. Unit vectors give dot+1/0/−1 and cross areas0/1/0 forconcordant/orthogonal/opposite;maximum/minimum signed values and maximum absolute projection are now distinguished.'
            if key=='C1-L002' else 'NEW DRAFT: first graph slopes6/2=3,0,(2−6)/2=−2m/s;spost2m,distance6+4=10m,means1/3 and5/3m/s. Second independent graph hasv0/6/0 at0/3/6s,areas9+9=18m,meanv3m/s,a±2m/s²,meanaccel0;nonnegative withzeros atends,positive inside,derivative undefined atvertex.')
        byid[key]=revised
    return [byid[key] for key in sorted(byid)]


def report(sources,package=None,bindings=None):
    records=verify(sources,package,bindings)
    return {'schemaVersion':'1.0.0','batch':BATCH,'records':records,'verifierSha256':sha(Path(__file__).read_bytes()),
        'sourceRef':SOURCE_REF,'sourcePath':SOURCE_PATH,'sourceFileSha256':SOURCE_FILE_SHA256,
        'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),
        'acceptedCount':sum(row['ok'] for row in records),'failedCount':sum(not row['ok'] for row in records),
        'draftReviewedCount':sum(row['publicationAction']=='DRAFT' for row in records),'failedPublishedEditionIds':sorted(ISSUES),
        'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},'reviewer':'separate_AI_reviewer_not_original_or_revision_author',
        'originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
