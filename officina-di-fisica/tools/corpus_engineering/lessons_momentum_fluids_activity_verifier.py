"""Independent full reading of four original momentum/statics/fluid lessons.

All 26 blocks and four SVGs were read before freezing. Source figure arithmetic
is separated from reviewer-constructed probes; no student calibration is claimed.
"""
from fractions import Fraction
from pathlib import Path

import pint
import sympy as sp

from .pipeline import digest, sha

APP = Path(__file__).resolve().parents[2]
SOURCE_REF = '5d1dc8dc7b601aef959d10d564c75462be74708d'
BATCH = 'lessons-momentum-fluids-013'
SOURCE_FILES = {
    'officina-di-fisica/content/C1.json': '0a79b1212adbef650733d655d1de2d5ffd7af5eb2be2bde50710a0a1721ab0cf',
    'officina-di-fisica/content/C2.json': '7f2d3cf84a46d5d0086fd9cd6318b923ee073febc110a52fbc8f682edd995b23',
}
SOURCE_PATH_BY_ID = {key: f'officina-di-fisica/content/{key[:2]}.json'
                     for key in ('C1-L009', 'C1-L010', 'C2-L001', 'C2-L002')}
READ_SOURCE_SHA256 = {
    'C1-L009': '6da3e8d798cea99aedcdd24660d192e25a13ff20a0777a2394f88b67ac7c378c',
    'C1-L010': '3b2ada176b273a262f7bbbbbb0d4a064163450799252680eb63049360d9e08b0',
    'C2-L001': '9f40cad727f6e4532a5c05eb73182493b739ba4c052d2c59aedecc710f1a157a',
    'C2-L002': 'd8d27ee72e253975ef7dd8655928a7db901aefe3905ee0cdf608324cf7de7d6f',
}
READ_ASSETS = {
    'C1-impulso.svg': 'da0e022c6e42c1509d6a7c3f5721cc633f046ff164b2ab06878cab7b931f8402',
    'C1-leva.svg': 'e708c2fc539832a2dc4f5de2015f9b3cba8584883f3a7900ba2e1ad74a6f1d41',
    'C2-colonna.svg': 'cb4402efed8b277b255f7e8019f634ad90f691557fc5bfeceb1b69598e9d6944',
    'C2-manometro.svg': '6422c8e2f436ca33deee8b7d18294ffed0c4095e40d3fba6205dd616ea0bd90c',
}
FIGURES_BY_ID = {'C1-L009': ['C1-impulso.svg'], 'C1-L010': ['C1-leva.svg'],
                 'C2-L001': [], 'C2-L002': ['C2-colonna.svg', 'C2-manometro.svg']}
SI = pint.UnitRegistry(non_int_type=Fraction)


def check(claim, actual, expected, unit='', scope='symbolic_source_claim'):
    if isinstance(actual, SI.Quantity):
        actual = sp.Rational(actual.to(unit).magnitude)
    residual = sp.simplify(actual-expected)
    return {'claim': claim, 'independentExact': str(actual), 'expectedValue': str(expected),
            'unit': unit, 'dimension': {str(k): str(v) for k, v in SI.Unit(unit).dimensionality.items()},
            'relation': 'exact', 'residual': str(residual), 'ok': residual == 0, 'scope': scope}


def independent_checks():
    Q, R = SI.Quantity, sp.Rational
    t = sp.Symbol('t', real=True)
    m1, m2, area, rho, g, h, length, width = sp.symbols('m1 m2 A rho g h L b', positive=True)
    u1, u2, fext1, fext2, internal = sp.symbols('u1 u2 Fext1 Fext2 F12', real=True)
    v1 = sp.Function('v1')(t)
    v2 = sp.Function('v2')(t)
    momentum = m1*v1+m2*v2
    net_momentum_rate = sp.diff(momentum, t).subs({sp.diff(v1, t): (fext1+internal)/m1,
                                                        sp.diff(v2, t): (fext2-internal)/m2})
    total_mass = m1+m2
    stick_v = sp.solve(total_mass*sp.Symbol('vf')-(m1*u1+m2*u2), sp.Symbol('vf'))[0]
    initial_k = (m1*u1*u1+m2*u2*u2)/2
    stuck_k = total_mass*stick_v*stick_v/2
    # Momentum eliminates v2f; solving kinetic-energy equality gives the
    # nontrivial elastic collision root (the other root is no interaction).
    vf = sp.Symbol('vf', real=True)
    other_vf = (m1*u1+m2*u2-m1*vf)/m2
    elastic_roots = sp.solve(m1*vf*vf/2+m2*other_vf*other_vf/2-initial_k, vf)
    elastic_v1 = next(root for root in elastic_roots if sp.simplify(root-u1) != 0)
    elastic_v2 = sp.simplify(other_vf.subs(vf, elastic_v1))
    # Actual labelled source figure, not an invented numerical exercise.
    rising_force = 400*t
    falling_force = 80-400*t
    impulse_rise = sp.integrate(rising_force, (t, 0, R(1, 10)))
    impulse_fall = sp.integrate(falling_force, (t, R(1, 10), R(1, 5)))
    q1, q2 = sp.Function('x1')(t), sp.Function('x2')(t)
    center = (m1*q1+m2*q2)/total_mass
    cm_force = sp.diff(center, t, 2)*total_mass
    cm_force = cm_force.subs({sp.diff(q1, t, 2): (fext1+internal)/m1,
                              sp.diff(q2, t, 2): (fext2-internal)/m2})
    rx, ry, fx, fy, dx, dy = sp.symbols('rx ry Fx Fy dx dy', real=True)
    position, force = sp.Matrix([rx, ry, 0]), sp.Matrix([fx, fy, 0])
    shift = sp.Matrix([dx, dy, 0])
    torque = position.cross(force)
    ptop, pbottom, p0, p1, p2, patm, pgas, pvapor = sp.symbols('ptop pbottom p0 p1 p2 patm pgas pvapor', real=True)
    hydrostatic_bottom = sp.solve(pbottom*area-ptop*area-rho*area*h*g, pbottom)[0]
    normal = sp.Matrix([sp.cos(t), sp.sin(t), 0])
    pressure_force = -p0*area*normal
    z = sp.Symbol('z', real=True)
    mu, shear, modulus = sp.symbols('mu tau modulus', positive=True)
    # Constitutive examples support the introductory fluid/solid distinction;
    # neither an exhaustive material taxonomy nor a student exercise is claimed.
    fluid_strain = sp.integrate(shear/mu, (t, 0, t))
    solid_strain = shear/modulus
    probe = 'reviewer_constructed_exact_probe_not_assigned_numeric_exercise'
    figure = 'actual_labelled_source_figure_arithmetic'
    return {
        'C1-L009': [
            check('momentum derivative equals resultant for constant mass', sp.diff(m1*v1, t), m1*sp.diff(v1, t), 'N'),
            check('internal pair cancels in total momentum rate', net_momentum_rate, fext1+fext2, 'N'),
            check('zero external component gives zero momentum rate on that axis', net_momentum_rate.subs(fext2, -fext1), 0, 'N'),
            check('source pulse reaches40N at0.10s', rising_force.subs(t, R(1, 10)), 40, 'N', figure),
            check('source first half triangular impulse', impulse_rise, 2, 'N*s', figure),
            check('source second half triangular impulse', impulse_fall, 2, 'N*s', figure),
            check('source total triangular impulse', impulse_rise+impulse_fall, 4, 'N*s', figure),
            check('source average force over0.20s', (impulse_rise+impulse_fall)/R(1, 5), 20, 'N', figure),
            check('impulse and momentum unit identity', Q(1, 'N*s'), 1, 'kg*m/s'),
            check('probe reversed pulse has negative impulse', -impulse_rise-impulse_fall, -4, 'N*s', probe),
            check('common final velocity from signed momentum', stick_v*total_mass, m1*u1+m2*u2, 'kg*m/s'),
            check('sticking loss equals half reduced mass times relative speed squared', initial_k-stuck_k, m1*m2*(u1-u2)**2/(2*total_mass), 'J'),
            check('probe signed velocities2kg*3 plus1kg*(-1)', stick_v.subs({m1: 2, m2: 1, u1: 3, u2: -1}), R(5, 3), 'm/s', probe),
            check('probe sticking kinetic loss', (initial_k-stuck_k).subs({m1: 2, m2: 1, u1: 3, u2: -1}), R(16, 3), 'J', probe),
            check('elastic collision root preserves momentum', m1*elastic_v1+m2*elastic_v2, m1*u1+m2*u2, 'kg*m/s'),
            check('elastic collision root preserves kinetic energy', (m1*elastic_v1**2+m2*elastic_v2**2)/2, initial_k, 'J')],
        'C1-L010': [
            check('center of mass acceleration from pair equations', cm_force, fext1+fext2, 'N'),
            check('CM coordinate translated by common origin shift', (m1*(q1+dx)+m2*(q2+dx))/total_mass-center, dx, 'm'),
            check('probe weighted coordinate (1*0+3*4)/4', (center.subs({m1: 1, m2: 3})).subs({q1: 0, q2: 4}), 3, 'm', probe),
            check('signed planar torque from cross product', torque[2], rx*fy-ry*fx, 'N*m'),
            check('torque magnitude squared from perpendicular component', torque.dot(torque), position.dot(position)*force.dot(force)-position.dot(force)**2, 'N**2*m**2'),
            check('force through pivot has zero moment', torque.subs({rx: 0, ry: 0}).dot(torque.subs({rx: 0, ry: 0})), 0, 'N**2*m**2'),
            check('parallel position and force can have zero moment', torque[2].subs({fx: rx, fy: ry}), 0, 'N*m'),
            check('changing moment pole subtracts shift cross force', ((position-shift).cross(force)-torque)[2], -shift.cross(force)[2], 'N*m'),
            check('probe short muscle arm requires60N for10N load', (10*R(24, 100))/R(4, 100), 60, 'N', probe),
            check('probe muscle moment balances load moment', 60*R(4, 100)-10*R(24, 100), 0, 'N*m', probe),
            check('probe pivot reaction required by force balance', 60-10-50, 0, 'N', probe),
            check('moment unit dimensional identity', Q(1, 'N')*Q(1, 'm'), 1, 'kg*m**2/s**2'),
            check('figure muscle lever shorter than load lever', sp.Integer(465-91)-sp.Integer(153-91), 312, 'pixel', 'read_SVG_order_not_assigned_length_scale')],
        'C2-L001': [
            check('density definition dimensions', Q(1, 'kg')/Q(1, 'm**3'), 1, 'kg/m**3'),
            check('homogeneous density equals average', (rho*area*length)/(area*length), rho, 'kg/m**3'),
            check('density invariant under homogeneous subdivision', (rho*area*length/2)/(area*length/2), rho, 'kg/m**3'),
            check('probe40g over50mL equals800kg/m3', Q(40, 'g')/Q(50, 'mL'), 800, 'kg/m**3', probe),
            check('uniform pressure force magnitude', sp.trigsimp(pressure_force.dot(pressure_force)), (p0*area)**2, 'N**2'),
            check('opposite equal pressure tractions cancel', (pressure_force+(-pressure_force)).dot(pressure_force+(-pressure_force)), 0, 'N**2'),
            check('two-face difference from opposite normal tractions', p1*area-p2*area, (p1-p2)*area, 'N'),
            check('pascal definition', Q(1, 'N/m**2'), 1, 'Pa'),
            check('pascal base dimensions', Q(1, 'Pa'), 1, 'kg/m/s**2'),
            check('probe20kPa across2cm2 gives4N', Q(20, 'kPa')*Q(2, 'cm**2'), 4, 'N', probe),
            check('gauge plus atmosphere recovers absolute pressure', (p1-patm)+patm, p1, 'Pa'),
            check('equal atmospheric pressure gives zero membrane load', ((p1-p2)*area).subs({p1: patm, p2: patm}), 0, 'N'),
            check('illustrative viscous fluid strains persistently under constant shear', sp.diff(fluid_strain, t), shear/mu, '1/s', probe),
            check('illustrative elastic solid has finite static shear balance', modulus*solid_strain, shear, 'Pa', probe)],
        'C2-L002': [
            check('hydrostatic pressure from vertical cylinder force balance', hydrostatic_bottom, ptop+rho*g*h, 'Pa'),
            check('pressure increment independent of cross section', sp.diff(hydrostatic_bottom, area), 0, 'Pa/m**2'),
            check('pressure increases with downward depth', sp.diff(ptop+rho*g*h, h), rho*g, 'Pa/m'),
            check('upward coordinate reverses gradient sign', sp.diff(ptop-rho*g*z, z), -rho*g, 'Pa/m'),
            check('same depth in same connected fluid gives equal pressure', (p0+rho*g*h)-(p0+rho*g*h), 0, 'Pa'),
            check('rho gh dimensions', Q(1, 'kg/m**3')*Q(1, 'm/s**2')*Q(1, 'm'), 1, 'Pa'),
            check('probe two layers sum pressure increments', 800*10*R(1, 10)+1000*10*R(1, 5), 2800, 'Pa', probe),
            check('probe inclinedlength0.10m at30deg has verticalheight0.05m', R(1, 10)*sp.sin(sp.pi/6), R(1, 20), 'm', probe),
            check('probe tiltedheight pressure increment', 1000*10*R(1, 20), 500, 'Pa', probe),
            check('U-tube lower gas interface means positive gauge pressure', sp.solve(pgas-(patm+rho*g*h), pgas)[0]-patm, rho*g*h, 'Pa'),
            check('probe manometer1000*10*0.02', 1000*10*R(1, 50), 200, 'Pa', probe),
            check('probe absolute gas pressure adds atmosphere', 100000+200, 100200, 'Pa', probe),
            check('Torricelli retains upper vapor pressure before approximation', (pvapor+rho*g*h)-rho*g*h, pvapor, 'Pa'),
            check('Torricelli approximation follows neglected vapor pressure', (pvapor+rho*g*h).subs(pvapor, 0), rho*g*h, 'Pa'),
            check('reviewer toy barometer with assignedg10 andheight3/4m', 13600*10*R(3, 4), 102000, 'Pa', probe),
            check('figure gas interface lower than atmospheric interface', sp.Integer(104-64), 40, 'pixel', 'read_SVG_depth_order_not_assigned_length_scale')],
    }


MANUAL = {
    'C1-L009': 'Actual source SVG: triangle peak40N at0.10s and zero endpoints0/0.20s. Each half has impulse(1/2)(1/10)40=2N*s; total4N*s and average4/(1/5)=20N, below40N. Signed component areas give signed impulse. Sum two Newton equations: internal forces cancel, external impulse alone changes total momentum. Reviewer collision probe only: masses2,1kg and velocities+3,-1m/s give p=5kg*m/s, sticking vf=5/3m/s, Ki=19/2J,Kf=25/6J,loss16/3J. General sticking loss is half reduced mass times relative speed squared; elastic root is derived from momentum and kinetic energy equations. No decimal calculator work or student calibration claimed.',
    'C1-L010': 'Source has symbolic relations and a schematic lever, with no assigned numerical exercise. Derive xCM by weighted coordinates and differentiate twice; paired internal forces cancel. Torque z=rx*Fy-ry*Fx and magnitude identity follow from cross product. Reviewer probes only: masses1,3kg at0,4m give xCM=3m; lever arms0.04,0.24m and load10N require muscle60N, equal opposite moments2.4N*m and pivot reaction-50N for force balance, neglecting arm weight explicitly in this probe. Changing pole subtracts shift cross net force, hence cannot change equilibrium when net force is zero.',
    'C2-L001': 'Source has no numerical exercise. Density of a homogeneous subdivision remains rho because mass and volume scale equally. Reviewer probes only:40g/50mL=800kg/m³;20kPa times2cm²=(20000)(2/10000)=4N. A normal pressure traction is -p*n; opposing equal pressures cancel, two different face pressures give(p1-p2)A. Gauge pressure plus local atmosphere equals absolute pressure. Constitutive illustrations only: Newtonian fluid under constant nonzero shear accumulates strain tau*t/mu; an elastic solid balances the same static shear at finite strain tau/G. These models illustrate, rather than exhaustively classify, materials.',
    'C2-L002': 'Derive pbottom*A-ptop*A-rho*A*h*g=0 and divide by nonzero A. Positive downward depth increases pressure by rho*g*h; upward height reverses sign. Reviewer probes only: layers800kg/m³ over0.10m plus1000kg/m³ over0.20m with assignedg10 give2800Pa. Inclined0.10m at30deg gives vertical0.05m and500Pa. U-tube lower gas interface means pgas=patm+rho*g*Delta_h;rho1000,g10,Delta_h0.02m give200Pa gauge,100200Pa absolute for assignedpatm100000Pa. Barometer exact balance is patm=pvapor+rho*g*H; neglect only the explicitly small vapor term. Toyrho13600,g10,H3/4m give102000Pa;not a measured terrestrial calibration.'}
ASSUMPTIONS = {
    'C1-L009': 'Classical inertial frame and constant constituent masses. Vector impulse, average force and signed areas are componentwise; positive contact duration. Momentum conservation requires negligible external impulse for the chosen system/component. Internal action-reaction pairs belong to different bodies. Sticking shares one velocity; elastic collision preserves total kinetic energy; ordinary inelastic transfer may enter internal energy. No assumption that every collision conserves kinetic energy.',
    'C1-L010': 'Closed classical system with constant total mass and material constituents in an inertial frame; Newton third-law pair cancellation. Positive total mass for weighted coordinate. Rigid body means fixed interpoint distances. Planar statics uses zero two-component resultant plus zero signed moment about the perpendicular axis. Ideal hinge reaction force passes through pole; no unassigned hinge couple. Lever drawing is schematic, and quantitative biomechanics additionally requires tendon direction and limb weight as source explicitly states.',
    'C2-L001': 'Introductory fluid/solid descriptions, not an exhaustive rheological classification; water treated incompressible only for moderate pressure changes as stated. Average density is mass/positive volume; homogeneity equates average and local values. Pressure is scalar, with normal traction direction supplied by surface orientation. Simple F=pA requires uniform pressure over a flat face; two-face difference uses the same area and opposing normals. Gauge reference is local atmospheric pressure. Illustrative viscous/elastic constitutive probes do not assert universality for all materials.',
    'C2-L002': 'Fluid at rest in gravity, homogeneous layer density and approximately constant g. Depth coordinate downward, h>=0. Equal pressure at equal elevation requires the same connected liquid in equilibrium. Add layer contributions if densities differ. Manometer liquid-density model neglects gas-column variation at this introductory scale; interfaces have no assigned capillary correction. Barometer approximation explicitly neglects small vapor pressure; a positive vapor term belongs in the exact balance. No horizontal container shape enters the vertical pressure law.'}
PEDAGOGY = {
    'C1-L009': 'Connects rapid variable force to impulse rather than substituting peak force for mean force. Actual triangular SVG makes4N*s and20N manually available. Introduces system selection, external impulse and componentwise conservation before collision equations. Requires signed velocities and distinguishes elastic energy conservation from sticking/internal conversion. No choice options or empirical student calibration.',
    'C1-L010': 'Weighted coordinates precede center-of-mass dynamics; rigid-body and lever discussion adds rotational equilibrium to translation. Defines perpendicular arm and signed moments, and explains a hinge as useful pole. Explicit limitations on tendon geometry and limb weight prevent treating the schematic as a full biomechanical numerical case. Reviewer adds pivot reaction in the illustrative balance; arrow lengths are not interpreted as force magnitudes.',
    'C2-L001': 'Moves from material response to mass per volume, then distributed normal force and scalar pressure. Explicit uniformity condition precedes pA and distinguishes one-face force from net two-face force. Absolute and relative pressures have clear references; atmosphere on both membrane faces is used to explain cancellation. No numerical calculator requirement is hidden by the missing answer field.',
    'C2-L002': 'Derives Stevino by force balance, states assumptions and vertical-depth sign, then treats equal level, shape independence and layers. The U-tube reading follows a pressure walk down/up; lower gas interface is consistent with higher gas pressure. The barometer specifies the upper near-vacuum reference and vapor-pressure approximation. Distinguishes vertical depth from an inclined path before any substitution.'}
FIGURE_REVIEW = {
    'C1-L009': 'Read/rendered XML: source-labelled triangle40N peak at0.10s, end0.20s, symmetric176px horizontal halves. Correct actual area4N*s and average20N. Endpoint/baseline stroke offset2px is decorative overlap at the intended zero axis, not assigned residual force. No change to original SVG.',
    'C1-L010': 'Read/rendered XML: horizontal arm hinged atO,x91; muscle upward atx153, load downward atx465. Muscle arm is shorter. b1/b2 are schematic arm annotations; no length or force scale is assigned, dashed annotation ends do not prescribe measurement data, and arrow lengths are not force ratios. Hinge support implies a reaction; full quantitative use needs that reaction and any limb weight, consistent with text. No empirical calibration inferred.',
    'C2-L001': 'No figure blocks; all six textual/formula blocks read, including material-state qualifications and absolute/gauge reference.',
    'C2-L002': 'Both SVGs read/rendered. Column surfacey61 andpointAy126 make h vertical downward. U-tube has gas left interfacey104 andatmospheric right interfacey64, so lower gas interface andpositive gauge pressure; lower dashed line compares the same connected liquid at one level. Delta_h is40px qualitatively with no physical length scale. Captions, signs and connected-liquid conditions agree.'}


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
        if not all(claim['ok'] for claim in checks):
            errors.append('Independent lesson mathematics failed')
        path = SOURCE_PATH_BY_ID[key]
        records.append({'id': key, 'sourceSha256': digest(row), 'sourceVersion': row.get('version', 1),
            'sourceRef': SOURCE_REF, 'sourcePath': path, 'sourceFileSha256': SOURCE_FILES[path],
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
        'sourcePaths': list(SOURCE_FILES), 'sourceFileSha256ByPath': SOURCE_FILES,
        'contractSha256': sha(Path(__file__).with_name('review_contract.py').read_bytes()),
        'acceptedCount': sum(row['ok'] for row in records), 'failedCount': sum(not row['ok'] for row in records),
        'draftReviewedCount': 0, 'failedPublishedEditionIds': [],
        'dependencyVersions': {'sympy': sp.__version__, 'pint': pint.__version__},
        'reviewer': 'separate_AI_reviewer_not_original_or_revision_author',
        'originalEditionRetained': True, 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
