"""Independent reading of all29 blocks and four historical SVGs, C4-L05..08.

Symbolic claims and constructed boundary probes are distinguished from assigned
student work. No original source, figure or publication state is modified.
"""
from fractions import Fraction
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest, sha

APP = Path(__file__).resolve().parents[2]
SOURCE_REF = '5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH = 'officina-di-fisica/content/C4.json'
SOURCE_FILE_SHA256 = '19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c'
BATCH = 'lessons-circuits-basics-020'
READ_SOURCE_SHA256 = {
 'C4-L05': 'd03d7d1a35419ae2029664d6625e7bb2d32760c08e01c4f93362c33b8513697d',
 'C4-L06': 'f83164d10183ef0156173a478a84b22d6ac8c23b701f1f3bad3039bd5c735f5f',
 'C4-L07': '6547b84fc9a72195ba79ece84e3e037a5961171d61c603aad79f56513b1606d9',
 'C4-L08': 'b3a936b9278978817b08aebb0ab28272a2f92c75686ddca760627ae945d6a498',
}
READ_ASSETS = {
 'C4-ohm.svg': 'e9aba90c0cdb89af126e62d397fb00952c59d5b527d5108c64ae34af5180874b',
 'C4-reti.svg': '07ebbd01de644aef59e43dd7fd9bda2389f55fd148901332d65e108644272333',
 'C4-condensatore.svg': '20cde9e81acdea30d4f7134a03b4634ecaa613c4dd13d2f55278e7027f8f6ce9',
 'C4-reti-c.svg': '25ad5b7d73608cd8da31f1eaf583372363a27b0cd411ae5d0dffe7408821afbb',
}
FIGURES_BY_ID = dict(zip(READ_SOURCE_SHA256, ([name] for name in READ_ASSETS)))
SI = pint.UnitRegistry(non_int_type=Fraction)


def check(claim, actual, expected, unit='', scope='symbolic_source_claim'):
    if isinstance(actual, SI.Quantity):
        actual = sp.Rational(actual.to(unit).magnitude)
    residual = sp.simplify(actual-expected)
    return {'claim': claim, 'independentExact': str(actual), 'expectedValue': str(expected),
            'unit': unit, 'dimension': {str(k): str(v) for k, v in SI.Unit(unit).dimensionality.items()},
            'relation': 'exact', 'residual': str(residual), 'ok': residual == 0, 'scope': scope}


def independent_checks():
    Q, F = SI.Quantity, sp.Rational
    t, q = sp.symbols('t q', real=True)
    rho, length, area, resistance, current, voltage = sp.symbols('rho length area R I V', positive=True)
    r1, r2, c1, c2, capacitance, charge, eps, gap, er = sp.symbols('R1 R2 C1 C2 C Q eps d er', positive=True)
    v1, v2, qmid = sp.symbols('V1 V2 Qmiddle', real=True)
    probe='reviewer_constructed_exact_probe_not_assigned_numeric_exercise'
    boundary='reviewer_boundary_probe_excluded_by_source_conditions'
    rp=r1*r2/(r1+r2)
    cp=c1+c2
    cs=c1*c2/cp
    final_v=(c1*v1+c2*v2)/cp
    loss=(c1*v1**2+c2*v2**2-cp*final_v**2)/2
    return {
      'C4-L05': [
        check('signed charge rate is current', sp.diff(3*t-2,t),3,'A',probe),
        check('average current preserves charge sign',F(-6,3),-2,'A',probe),
        check('ampere is coulomb per second',Q(6,'C')/Q(3,'s'),2,'A',probe),
        check('electron negative charge and opposite drift give positive current',(-sp.Symbol('e',positive=True))*(-sp.Symbol('flux',positive=True)),sp.Symbol('e',positive=True)*sp.Symbol('flux',positive=True),'A'),
        check('uniform wire Ohm relation from J equals E over rho', (voltage/length/rho)*area,voltage/(rho*length/area),'A'),
        check('resistivity times length over area has resistance units',Q(2,'ohm*m')*Q(3,'m')/Q(2,'m^2'),3,'ohm',probe),
        check('V of I slope is resistance',sp.diff(resistance*current,current),resistance,'ohm'),
        check('I of V slope is conductance',sp.diff(voltage/resistance,voltage),1/resistance,'S'),
        check('doubling wire length doubles resistance',rho*(2*length)/area,2*rho*length/area,'ohm'),
        check('doubling wire radius quarters resistance',rho*length/(4*area),rho*length/area/4,'ohm'),
        check('toy6V and3ohm produce2A',Q(6,'V')/Q(3,'ohm'),2,'A',probe),
        check('temperature dependent rho need not be ohmic under heating',sp.diff(current*(1+current**2),current),1+3*current**2,'ohm',boundary),
      ],
      'C4-L06': [
        check('series common current gives sum of drops',current*r1+current*r2,current*(r1+r2),'V'),
        check('parallel branch currents give reciprocal equivalent resistance',voltage/r1+voltage/r2,voltage/rp,'A'),
        check('parallel resistance smaller than R1 by positive quantity',r1-rp,r1**2/(r1+r2),'ohm'),
        check('parallel resistance smaller than R2 by positive quantity',r2-rp,r2**2/(r1+r2),'ohm'),
        check('toy2ohm3ohm series5ohm',Q(2,'ohm')+Q(3,'ohm'),5,'ohm',probe),
        check('toy2ohm3ohm parallel6over5ohm',F(1,1)/(F(1,2)+F(1,3)),F(6,5),'ohm',probe),
        check('passive power Ohm substitution',(voltage*current).subs(voltage,resistance*current),resistance*current**2,'W'),
        check('power under fixed voltage', (voltage*current).subs(current,voltage/resistance),voltage**2/resistance,'W'),
        check('voltage times current is watt',Q(6,'V')*Q(2,'A'),12,'W',probe),
        check('constant12W for3s gives36J',Q(12,'W')*Q(3,'s'),36,'J',probe),
        check('variable power needs time integral not arbitrary constant',sp.integrate(2*t,(t,0,3)),9,'J',boundary),
        check('series member power with fixed source depends on both resistances',sp.diff(voltage**2*r1/(r1+r2)**2,r1),voltage**2*(r2-r1)/(r1+r2)**3,'W/ohm',boundary),
      ],
      'C4-L07': [
        check('parallel plate capacitance from field and voltage',charge/((charge/(eps*area))*gap),eps*area/gap,'F'),
        check('permittivity area over gap has farad units',Q(2,'F/m')*Q(3,'m^2')/Q(2,'m'),3,'F',probe),
        check('capacitance uses one plate magnitude not sum of magnitudes',F(6,3),2,'F',probe),
        check('linear charging work integral yields halfQV',sp.integrate(q/capacitance,(q,0,charge)),charge**2/(2*capacitance),'J'),
        check('charge energy rewritten with voltage',(charge**2/(2*capacitance)).subs(charge,capacitance*voltage),capacitance*voltage**2/2,'J'),
        check('capacitance times voltage squared is joule',Q(2,'F')*Q(3,'V')**2/2,9,'J',probe),
        check('isolated dielectric fixed charge energy ratio', (charge**2/(2*er*capacitance))/(charge**2/(2*capacitance)),1/er),
        check('connected dielectric fixed voltage energy ratio',(er*capacitance*voltage**2/2)/(capacitance*voltage**2/2),er),
        check('fixed voltage battery energy exceeds field increase',voltage*((er-1)*capacitance*voltage)-(er-1)*capacitance*voltage**2/2,(er-1)*capacitance*voltage**2/2,'J'),
        check('toyC2F V3 givesQ6C',Q(2,'F')*Q(3,'V'),6,'C',probe),
        check('toy dielectricfactor2 fixedQ halves9J',F(6**2,2*4),F(9,2),'J',probe),
        check('toy dielectricfactor2 fixedV doubles9J',F(4*3**2,2),18,'J',probe),
      ],
      'C4-L08': [
        check('parallel total charge uses common voltage',c1*voltage+c2*voltage,cp*voltage,'C'),
        check('neutral floating middle gives equal charge magnitudes',sp.solve(sp.Eq(-charge+q,0),q)[0],charge,'C'),
        check('series voltage sum defines reciprocal capacitance',charge/c1+charge/c2,charge/cs,'V'),
        check('series equivalent smaller than C1',c1-cs,c1**2/(c1+c2),'F'),
        check('series smaller C has greater voltage ratio',(charge/c1)/(charge/c2),c2/c1),
        check('toy2F3F parallel5F',Q(2,'F')+Q(3,'F'),5,'F',probe),
        check('toy2F3F series6over5F',F(1,1)/(F(1,2)+F(1,3)),F(6,5),'F',probe),
        check('joined capacitor signed charge is conserved',cp*final_v,c1*v1+c2*v2,'C'),
        check('settled joining energy loss nonnegative square',loss,c1*c2*(v1-v2)**2/(2*cp),'J'),
        check('equal initial voltages need no dissipated energy',loss.subs(v2,v1),0,'J'),
        check('opposite charged equal capacitors cancel voltage',final_v.subs({c2:c1,v2:-v1}),0,'V',probe),
        check('charged middle node breaks equal magnitude series assumption',sp.solve(sp.Eq(-charge+q,qmid),q)[0]-charge,qmid,'C',boundary),
      ]}

MANUAL = {
'C4-L05': 'The source assigns symbolic relations, not compulsory numerical data. Current is signed net charge divided by time (or its instantaneous rate); negative electron charge times opposite signed carrier flux yields the conventional direction. Combining J=E/rho, E=V/length and I=JA gives R=rho*length/area. Differentiate V=RI versus I=V/R to distinguish slopeR from1/R. Constructed manual probes:6C/3s=2A, -6C/3s=-2A,6V/3ohm=2A, lengthfactor2 doublesR and radiusfactor2 givesonequarterR. The polynomial heating probe has slope1+3I² rather than a constant: it is outside the fixed-temperature ohmic model, not a claim that the lesson requires this derivative.',
'C4-L06': 'Source derivations: common seriesI givesV=I(R1+R2); common parallelV givesI=V(1/R1+1/R2). ThusReq=R1R2/(R1+R2), with positive gapsRi-Req. SubstituteOhm intoVI to obtainI²R andV²/R, retaining passive signs. ConstantP givesE=P*duration; varyingP requires integral. Constructed manual probes:2+3=5ohm, inverse(1/2+1/3)=6/5ohm,6V*2A=12W and12W*3s=36J. ForP(t)=2t over0..3s the integral is9J, not endpointP timesduration18J. Across separate trials at fixed sourceV a series memberP1=V²R1/(R1+R2)² is nonmonotonic; the source compares commonI within a series circuit and does not assert unchangedI when loadchanges.',
'C4-L07': 'Source formulas deriveC=Q/V=epsilon*A/d fromE=Q/(epsilon*A), V=Ed. Linear charging has integral0..Q q/C dq=Q²/(2C)=QV/2=CV²/2; platecharge magnitudeQ is not2Q. Constructed manual probeC2F,V3V givesQ6C,U9J. A dielectricfactor2 givesC4F: isolatedQ6C givesU9/2J; connectedV3V givesU18J. UnderfixedV batteryworkV*DeltaQ=18J whilefieldincrease9J, leaving9J for mechanical energy in the ideal quasistatic insertion limit. The source explicitly asks to include generator and possible mechanical work; no numerical epsilon0 calculation is assigned. Printed epsilon0 is explicitly approximate.',
'C4-L08': 'Source derivesparallelCsum fromQsum atcommonV; neutralfloatingmiddleimpliesoppositecharges andseries1/C=sum1/Ci. Constructed2F/3F probe givesCparallel5F andCseries6/5F. For source-disconnected joining, finalV=(C1V1+C2V2)/(C1+C2) uses algebraic charges; initialminusfinalU=C1C2(V1-V2)²/[2(C1+C2)]>=0. EqualV giveszero loss;equalC andoppositeV givesfinalzero. If middlenode initiallyhaschargeQmiddle, adjacentplatecharges differbyQmiddle: this boundaryprobe lies outside the explicit neutral-node premise. No required numerical transient integration appears in the lesson.'}
ASSUMPTIONS = {
'C4-L05': 'Current relative to chosen section direction; average ratio for finite interval, constant-current shortcut only when constant. Ohmic material at fixed assigned temperature. Uniform homogeneous wire, positive finite length/cross-section/resistivity. DeltaV in resistor law is explicitly a passive voltage drop, not unqualified VB-VA. Ideal generator fixes voltage, not current.',
'C4-L06': 'Ideal wires define equipotential nodes, lumped quasi-static/steady resistive circuit without accumulating nodal charge. Positive finite linear resistances. Series requires an unbranched shared node; parallel requires same two nodes. VI is absorbed power under passive convention; E=P*duration only for constantP. CommonI/commonV comparisons concern components under the stated constraint.',
'C4-L07': 'Linear constant capacitance and uniform linear dielectric with positive permittivity, plateslarge compared to gap and field considered away from edges. Q is magnitude on one plate; potential difference magnitude. Quasistatic electrostatic energy, no leakage/breakdown or fringing correction asserted. FixedQ and fixedV constraints are distinct; external source/mechanical energy included where present.',
'C4-L08': 'Positive finite linear capacitors and ideal-wire node model. Series floating middle node is initially neutral and isolated, explicitly in source. Charge conserved separately on each isolated joined conductor group, with polarity signs. Final commonV after a real settling transient; an undamped ideal LC oscillation is not assumed settled. Zero energy loss is possible for equal initial voltage.'}
PEDAGOGY = {
'C4-L05':'Separates reference direction from electron motion; defines ideal generator and axis-dependent slope before formula manipulation; fixes temperature and geometry for resistivity law. No numerical work is waived merely because the record has no answer field.',
'C4-L06':'Defines topology through node connections rather than drawn proximity; derives equivalents; compares power only after identifying held-current or held-voltage constraint. Constant-power energy qualifier is explicit.',
'C4-L07':'Defines plate charge and magnitude of voltage, then geometric model and charging-energy triangle. Distinguishes isolated from source-connected insertion and includes external energy transfers instead of claiming dielectric always lowers stored energy.',
'C4-L08':'Makes the often-missed initially-neutral middle-node condition explicit. Joining rule conserves signed groupcharge and permits energy dissipation, without claiming energy conservation only in the electric field. Contrasts resistor/capacitor equivalent formulas after physical derivations.'}
FIGURE_REVIEW = {
'C4-L05':'Complete XML and rendered diagram read: V vertical,I horizontal, straight line throughorigin,DeltaV/DeltaI triangle labelledR. Markedpoints coincide withline within subpixel rendering precision; no numeric axis calibration or pixel-based resistance assigned.',
'C4-L06':'Complete XML/render: leftR1/R2 lie on a single unbranched A-B path; rightbranches both terminate atsameA/B buses, without wire shorting eitherresistor. Symbols and lengths are schematic, not numeric resistance scales.',
'C4-L07':'Complete XML/render: upperplate+Q,lower-Q; five separated downward arrows frompositive towardnegative, gapd andfacingareaA. Thin drawnplate thickness andquote are schematic, no metric values inferred frompixels. Captionstatesfielddirection andarea/gap meaning.',
'C4-L08':'Complete XML/render: lefttwo separated capacitorplate pairs inseries, middlewirejoinsinnerplatesonly; righttwo capacitors sharethetwo buses. Wiresstopattheplate gaps, no shorts. LabelsC1/C2 not encoded throughgeometric scale; neutral-middle condition is in accompanyingcaption/text.'}


def verify(sources, asset_root=None):
    missing = set(READ_SOURCE_SHA256)-set(sources)
    if missing:
        raise ValueError('Missing independently read lessons: '+','.join(sorted(missing)))
    root = Path(asset_root) if asset_root is not None else APP/'static/figures'
    models = independent_checks()
    records = []
    for key in sorted(READ_SOURCE_SHA256):
        row = sources[key]
        errors = []
        if row.get('kind') != 'lesson' or digest(row) != READ_SOURCE_SHA256[key]:
            errors.append('Lesson differs from independently read original')
        refs = {'/figures/'+name for name in FIGURES_BY_ID[key]}
        if {b['src'] for b in row.get('blocks', []) if b.get('type') == 'figure'} != refs:
            errors.append('Lesson figures differ from read original')
        assets = {}
        for name in FIGURES_BY_ID[key]:
            file = root/name
            actual = sha(file.read_bytes()) if file.is_file() else 'MISSING'
            assets['/figures/'+name] = actual
            if actual != READ_ASSETS[name]:
                errors.append('Historical lesson figure changed or missing')
        checks = models[key]
        if not checks or not all(claim['ok'] for claim in checks):
            errors.append('Independent lesson mathematics failed')
        records.append({'id': key, 'sourceSha256': digest(row), 'sourceVersion': row.get('version', 1),
            'sourceRef': SOURCE_REF, 'sourcePath': SOURCE_PATH, 'sourceFileSha256': SOURCE_FILE_SHA256,
            'ok': not errors, 'errors': errors, 'checks': checks,
            'dimension': {claim['claim']: claim['dimension'] for claim in checks},
            'calculationScope': 'EXACT_MANUAL_CALCULATION', 'manualArithmetic': MANUAL[key],
            'manualFeasibility': 'PASS_AI_EXACT', 'physicalAssumptions': ASSUMPTIONS[key],
            'pedagogicalReview': PEDAGOGY[key], 'assetChecksums': assets, 'figureReview': FIGURE_REVIEW[key],
            'verificationMode': 'INDEPENDENT_EXISTING_EDITION', 'failedPublishedEdition': False,
            'originalEditionRetained': True, 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'})
    return records


def report(sources):
    records = verify(sources)
    return {'schemaVersion': '1.0.0', 'batch': BATCH, 'records': records,
        'verifierSha256': sha(Path(__file__).read_bytes()), 'sourceRef': SOURCE_REF,
        'sourcePath': SOURCE_PATH, 'sourceFileSha256': SOURCE_FILE_SHA256,
        'contractSha256': sha(Path(__file__).with_name('review_contract.py').read_bytes()),
        'acceptedCount': sum(row['ok'] for row in records), 'failedCount': sum(not row['ok'] for row in records),
        'draftReviewedCount': 0, 'failedPublishedEditionIds': [],
        'dependencyVersions': {'sympy': sp.__version__, 'pint': pint.__version__},
        'reviewer': 'separate_AI_reviewer_not_original_or_revision_author',
        'originalEditionRetained': True, 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
