"""Independent complete reading of C1-L005..L008 and three historical SVGs.

All teaching blocks, assumptions and graphics were read before pinning. Exact
reviewer probes below are explicitly distinguished from assigned exercises.
No source key, authoring module or candidate is used as an oracle.
"""
from fractions import Fraction
from pathlib import Path

import pint
import sympy as sp

from .pipeline import digest, sha

APP = Path(__file__).resolve().parents[2]
SOURCE_REF = '5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH = 'officina-di-fisica/content/C1.json'
SOURCE_FILE_SHA256 = '0a79b1212adbef650733d655d1de2d5ffd7af5eb2be2bde50710a0a1721ab0cf'
BATCH = 'lessons-mechanics-012'
READ_SOURCE_SHA256 = {
    'C1-L005': 'b31d059be5483e5b03604a72e1a2cbc0cc85ef37f274ab954231a13ea3ecbe24',
    'C1-L006': '980579f3788f171777b116945d26043a5f8a0ed6322a91ed9a28c7931b23e6b2',
    'C1-L007': '3c1635ae6031ba25c8ed8e4467d54c759b107e0ea4fe4ab1c3d3503908081ede',
    'C1-L008': 'c6f724bcee46cc869778a7e3e48a29c18802f42fb756b0f6f073eb1f62793af5',
}
READ_ASSETS = {
    'C1-forze.svg': '23032966207743fa88c6b6c4491a80d13b9da68c1e913bd4ebd8719f610c620a',
    'C1-molla.svg': '0a74e505ec7655923b437653802e23302be900f6f2292751d1c56735f41868c1',
    'C1-energia.svg': '13899393ff8432b08112f3766b163b4223d5d6f3d3541630b24f5a56faa1d21b',
}
FIGURES_BY_ID = {'C1-L005': ['C1-forze.svg'], 'C1-L006': ['C1-molla.svg'],
                 'C1-L007': [], 'C1-L008': ['C1-energia.svg']}
SI = pint.UnitRegistry(non_int_type=Fraction)


def check(claim, actual, expected, unit='', scope='symbolic_source_claim'):
    if isinstance(actual, SI.Quantity):
        actual = sp.Rational(actual.to(unit).magnitude)
    residual = sp.simplify(actual - expected)
    return {'claim': claim, 'independentExact': str(actual), 'expectedValue': str(expected),
            'unit': unit, 'dimension': {str(k): str(v) for k, v in SI.Unit(unit).dimensionality.items()},
            'relation': 'exact', 'residual': str(residual), 'ok': residual == 0, 'scope': scope}


def independent_checks():
    Q, R = SI.Quantity, sp.Rational
    m, g, k, G, M, rho, r, a = sp.symbols('m g k G M rho r a', positive=True)
    normal, ay, up, pull, resistance = sp.symbols('normal ay up pull resistance', real=True)
    x, t, u, s = sp.symbols('x t u s', real=True)
    v0, acc, beta = sp.symbols('v0 acc beta', real=True)
    # Solve the isolated body's two equations, rather than assuming N=mg.
    solved_normal = sp.solve(normal + up - m*g - m*ay, normal)[0]
    solved_ax = (pull - resistance)/m
    vx, vy, vz = [sp.Function(name)(t) for name in ('vx', 'vy', 'vz')]
    velocity = sp.Matrix([vx, vy, vz])
    newton_force = m*sp.diff(velocity, t)
    kinetic = m*velocity.dot(velocity)/2
    # Thin shell angular kernel gives a constant potential inside, not inverse
    # square extrapolation through the planet. Positive r,a and split r<a/r>a.
    kernel = 1/sp.sqrt(r*r + a*a - 2*r*a*u)
    primitive = -sp.sqrt(r*r + a*a - 2*r*a*u)/(r*a)
    shell_integral_inside = ((a+r)-(a-r))/(r*a)
    shell_integral_outside = ((a+r)-(r-a))/(r*a)
    potential_inside = -G*M*shell_integral_inside/2
    potential_outside = -G*M*shell_integral_outside/2
    enclosed = sp.integrate(4*sp.pi*rho*s*s, (s, 0, r))
    interior_g = sp.cancel(G*enclosed/r**2)
    height, length = sp.symbols('height length', positive=True)
    path1 = sp.Matrix([length*s, height*(1-s)])
    path2 = sp.Matrix([length*s, height*(1-s*s)])
    weight = sp.Matrix([0, -m*g])
    path_work1 = sp.integrate(weight.dot(sp.diff(path1, s)), (s, 0, 1))
    path_work2 = sp.integrate(weight.dot(sp.diff(path2, s)), (s, 0, 1))
    Ui, Uf, Ki, Wother, C = sp.symbols('Ui Uf Ki Wother C', real=True)
    Kf = Ki + Ui - Uf + Wother  # work theorem with Wcons=Ui-Uf
    probe = 'reviewer_constructed_exact_probe_not_assigned_numeric_exercise'
    results = {
        'C1-L005': [
            check('normal reaction from signed vertical Newton equation', solved_normal, m*g + m*ay - up, 'N'),
            check('N=mg only for no other vertical force and ay=0', solved_normal.subs({ay: 0, up: 0}), m*g, 'N'),
            check('horizontal force difference divided by mass', solved_ax*m, pull-resistance, 'N'),
            check('balanced forces give zero acceleration, not zero speed', solved_ax.subs(pull, resistance), 0, 'm/s**2'),
            check('integrate zero acceleration with arbitrary initial speed', v0 + sp.integrate(0, (t, 0, t)), v0, 'm/s'),
            check('Newton unit', Q(1, 'kg')*Q(1, 'm/s**2'), 1, 'N'),
            check('force per mass acceleration dimension', Q(1, 'N')/Q(1, 'kg'), 1, 'm/s**2'),
            check('probe upward-accelerating contact N=2(10+3)', solved_normal.subs({m: 2, g: 10, ay: 3, up: 0}), 26, 'N', probe),
            check('probe horizontal (10-6)/4', solved_ax.subs({pull: 10, resistance: 6, m: 4}), 1, 'm/s**2', probe),
            check('third law pair cancels only when both bodies included', pull + (-pull), 0, 'N'),
            check('diagram vertical arrow shaft lengths balanced', sp.Integer(115-35), 201-121, 'pixel', 'read_SVG_geometry_not_physical_unit_scale'),
            check('diagram horizontal arrow resultant points right', sp.Integer((408-268)-(266-187)), 61, 'pixel', 'read_SVG_geometry_not_physical_unit_scale')],
        'C1-L006': [
            check('probe threshold mu_s N = (2/5)80', R(2, 5)*80, 32, 'N', probe),
            check('probe equilibrium friction opposes applied20N', sp.solve(20+x, x)[0], -20, 'N', probe),
            check('probe sliding friction magnitude (3/10)80', R(3, 10)*80, 24, 'N', probe),
            check('probe sliding acceleration (40-24)/8', R(40-24, 8), 2, 'm/s**2', probe),
            check('friction coefficient dimensionless', Q(24, 'N')/Q(80, 'N'), R(3, 10)),
            check('Hooke stretched spring restores toward negative x', (-k*x).subs({k: 250, x: R(1, 25)}), -10, 'N', probe),
            check('Hooke compressed spring restores toward positive x', (-k*x).subs({k: 250, x: -R(1, 25)}), 10, 'N', probe),
            check('Hooke stiffness dimension', Q(10, 'N')/Q(R(1, 25), 'm'), 250, 'N/m'),
            check('gravity divided by test mass', sp.cancel((G*M*m/r**2)/m), G*M/r**2, 'm/s**2'),
            check('doubling center distance quarters g', sp.cancel((G*M/(2*r)**2)/(G*M/r**2)), R(1, 4)),
            check('gravity constant dimensions', Q(1, 'N*m**2/kg**2'), 1, 'm**3/kg/s**2'),
            check('force GMm/R2 dimensions', Q(1, 'm**3/kg/s**2')*Q(1, 'kg')**2/Q(1, 'm')**2, 1, 'N'),
            check('shell angular antiderivative', sp.diff(primitive, u), kernel, '1/m'),
            check('interior shell angular integral', shell_integral_inside, 2/a, '1/m'),
            check('exterior shell angular integral', shell_integral_outside, 2/r, '1/m'),
            check('interior shell potential independent of r', sp.diff(potential_inside, r), 0, 'm/s**2'),
            check('exterior shell inward field', -sp.diff(potential_outside, r), -G*M/r**2, 'm/s**2'),
            check('uniform density enclosed mass from volume integral', enclosed, 4*sp.pi*rho*r**3/3, 'kg'),
            check('uniform planet internal field linear in r', interior_g, 4*sp.pi*G*rho*r/3, 'm/s**2'),
            check('uniform planet central field limit', sp.limit(interior_g, r, 0, dir='+'), 0, 'm/s**2'),
            check('uniform planet internal and external boundary agree', interior_g.subs(r, a), G*(4*sp.pi*rho*a**3/3)/a**2, 'm/s**2')],
        'C1-L007': [
            check('constant force concordant work', 4*3*sp.cos(0), 12, 'J', probe),
            check('constant force orthogonal work', 4*3*sp.cos(sp.pi/2), 0, 'J', probe),
            check('constant force opposite work', 4*3*sp.cos(sp.pi), -12, 'J', probe),
            check('work unit', Q(1, 'N')*Q(1, 'm'), 1, 'J'),
            check('variable spring force work is signed integral', sp.integrate(-k*s, (s, 0, x)), -k*x*x/2, 'J'),
            check('Newton power equals derivative of kinetic energy', newton_force.dot(velocity), sp.diff(kinetic, t), 'W'),
            check('probe work-energy final K', sp.Integer(2)*1**2/2+12, 13, 'J', probe),
            check('probe exact final speed no decimal radical required', sp.sqrt(2*13/sp.Integer(2)), sp.sqrt(13), 'm/s', probe),
            check('same probe from integrated acceleration', 1**2+2*(sp.Integer(4)/2)*3, 13, 'm**2/s**2', probe),
            check('power unit', Q(1, 'J')/Q(1, 's'), 1, 'W'),
            check('instantaneous power unit F dot v', Q(1, 'N')*Q(1, 'm/s'), 1, 'W'),
            check('probe motor work at uniform speed', sp.Integer(10)*2*3, 60, 'J', probe),
            check('probe resisting force work at uniform speed', -sp.Integer(10)*2*3, -60, 'J', probe),
            check('probe total work zero despite individual nonzero work', 60-60, 0, 'J', probe),
            check('instantaneous power for W(t)=beta t2', sp.diff(beta*t*t, t), 2*beta*t, 'W'),
            check('average power for W(t)=beta t2 over0..t', sp.cancel((beta*t*t)/t), beta*t, 'W')],
        'C1-L008': [
            check('uniform gravity potential yields weight', -sp.diff(m*g*x, x), -m*g, 'N'),
            check('elastic potential yields Hooke restoring force', -sp.diff(k*x*x/2, x), -k*x, 'N'),
            check('gravity work along straight descent', path_work1, m*g*height, 'J'),
            check('gravity work along curved descent', path_work2, m*g*height, 'J'),
            check('common arbitrary potential zero cancels', (Ui+C)-(Uf+C), Ui-Uf, 'J'),
            check('work theorem rearranges to mechanical energy balance', (Kf+Uf)-(Ki+Ui), Wother, 'J'),
            check('mechanical energy conserved for zero other work', ((Kf+Uf)-(Ki+Ui)).subs(Wother, 0), 0, 'J'),
            check('elastic energy even under compression/stretch', (k*x*x/2).subs(x, -x), k*x*x/2, 'J'),
            check('probe spring energy 200*(1/10)^2/2', sp.Integer(200)*R(1, 10)**2/2, 1, 'J', probe),
            check('probe energy1J into mass1/2kg gives speed2', sp.sqrt(2*1/R(1, 2)), 2, 'm/s', probe),
            check('probe fall20J minus friction2J leaves K18J', 1*10*2-2, 18, 'J', probe),
            check('probe final speed from18J and1kg', sp.sqrt(2*18/sp.Integer(1)), 6, 'm/s', probe),
            check('probe isolated mechanical loss becomes internal gain', -sp.Integer(-2), 2, 'J', probe),
            check('kinetic energy cannot distinguish opposite velocity', m*(-v0)**2/2, m*v0**2/2, 'J'),
            check('gravity potential dimensions', Q(1, 'kg')*Q(1, 'm/s**2')*Q(1, 'm'), 1, 'J'),
            check('elastic potential dimensions', Q(1, 'N/m')*Q(1, 'm')**2, 1, 'J')],
    }
    # The inequalities are substantive conditions of the static-friction model.
    results['C1-L006'].append({'claim': 'probe static20N is within32N threshold',
        'independentExact': '|-20|=20<=32;required40>32 cannot be static', 'expectedValue': '20<=32<40',
        'unit': 'N', 'dimension': {'[mass]': '1', '[length]': '1', '[time]': '-2'},
        'relation': 'exact_threshold_comparison', 'ok': bool(abs(-20)<=32<40), 'scope': probe})
    return results


MANUAL = {
    'C1-L005': 'No assigned numerical exercise: all source equations and force directions checked. Reviewer probes only: (10-6)N/4kg=1m/s²; N=mg+may-Fup gives 2(10+3)=26N, rather than 20N. Zero resultant integrates to arbitrary constant v0, which may be nonzero. Third-law forces cancel in the combined system; an isolated body receives only its own interaction member.',
    'C1-L006': 'No assigned numerical exercise. Reviewer probes: N=80N and mu_s=2/5 give a 32N threshold; a 20N static pull needs -20N friction; 40N exceeds the threshold. If sliding, mu_d=3/10 gives 24N friction and (40-24)/8=2m/s². k=250N/m and x=±1/25m give F=∓10N. Independently integrate the spherical-shell angular kernel: inside, potential -GM/a is constant; outside, -GM/r. Uniform density gives M(r)=4pi*rho*r³/3 and g=4pi*G*rho*r/3, whose center limit is zero. No numerical G or pi evaluation is requested by the source.',
    'C1-L007': 'The source teaches symbolic relations, with no assigned numerical exercise. Reviewer probes: 4N over 3m at angles 0, pi/2, pi give 12,0,-12J. The spring-force integral gives -kx²/2. Newton F=m*dv/dt dotted with v equals d(mv²/2)/dt. For m=2kg, vi=1m/s, work=12J: Ki=1J, Kf=13J, vf=sqrt(13)m/s exactly; no decimal is required. Uniform motion with motor +10N and resistance -10N at 2m/s for 3s gives individual works ±60J and net zero. W=beta*t² yields instantaneous power 2beta*t and average power beta*t.',
    'C1-L008': 'Source symbolic balances checked without introducing a numerical requirement. Curves (Ls,H(1-s)) and (Ls,H(1-s²)) give identical gravity work mgH. Differentiating mgz and kx²/2 recovers -mg and -kx. The work theorem with Wcons=Ui-Uf gives Delta(K+U)=Wother; a common potential offset C cancels. Reviewer probes: 200*(1/10)²/2=1J; transferring this to 1/2kg gives 2m/s. A 1kg mass descends 2m with g=10m/s² and friction work -2J: Kf=18J and speed=6m/s. With the stated isolation, the internal gain is 2J. Equal energy for ±v shows that direction is not determined.'}
ASSUMPTIONS = {
    'C1-L005': 'Classical inertial frame and constant positive mass. Isolate the chosen body and distinguish received forces from forces it exerts. The perpendicular contact normal must satisfy N>=0; N=mg additionally needs zero normal acceleration and no other normal component. Zero net force does not imply zero velocity. For extended static bodies, the source explicitly also requires moment balance.',
    'C1-L006': 'Nonnegative dry-friction coefficients. Static friction adapts in the stated initially resting, slow-pull situation and is bounded, rather than universally mu_s*N. Kinetic friction opposes relative sliding; mu_d*N is the explicitly approximate dry-contact model. Hooke law applies in the linear elastic regime, with signed deformation from natural length. Gravity applies to point masses or nonoverlapping spherically symmetric masses, with center distance R. The interior shell result requires spherical symmetry; linear internal g additionally requires uniform density. Local mg assumes approximately uniform g over a small height.',
    'C1-L007': 'Classical point particle, constant mass and inertial frame for the work-kinetic theorem. Constant-force work uses displacement of its application point and angle in [0,pi]; a variable force requires a signed line integral. Total work includes all forces on the chosen body. Instantaneous force power uses velocity of the application point. Average power needs positive elapsed time. Extended-body rotation or internal energy needs expanded system bookkeeping, beyond the stated point-particle theorem.',
    'C1-L008': 'A time-independent conservative interaction permits a potential with a common arbitrary zero. mgz requires uniform g and upward z; elastic energy requires an ideal Hooke spring with x measured from natural length. Mechanical balance includes work of the other forces explicitly. Conversion of mechanical loss into internal energy needs the stated appropriate isolation. Endpoint energy usually determines speed, rather than velocity direction.'}
PEDAGOGY = {
    'C1-L005': 'Identifies agents and a one-body force diagram before signed components and equations. Explicitly avoids assuming N=mg or cancelling a third-law pair on one body. Notes that extended equilibrium also needs moment balance. No choice options or hidden numerical calculator step.',
    'C1-L006': 'Threshold comparison precedes accepting rest, and static inequality is distinguished from the kinetic model. Signed Hooke restoration explains the minus sign. Separates external inverse-square gravity, interior enclosed mass and local uniform g; it does not extrapolate GM/r² through the center. Reviewer exact examples are explicitly labelled as constructed probes.',
    'C1-L007': 'Connects signed projection to work, variable-force area to integration, and total work to DeltaK. Distinguishes average from instantaneous power. Uniform motion with nonzero motor work is explained by including resisting work. The exact radical in a reviewer probe is sufficient; no decimal trigonometric or root evaluation is assigned.',
    'C1-L008': 'Progresses from endpoint potential to force-specific expressions and then mechanical balance with other-force work. Distinguishes internal conversion from energy destruction and selects Newton or energy methods based on the requested quantity. Warns that speed is not direction. The path figure is qualitative, with no undeclared measurement exercise.'}
FIGURE_REVIEW = {
    'C1-L005': 'Read XML and rendered original: N upward and mg downward have equal 80px shafts. Rightward traction 140px exceeds leftward friction 79px, consistent with a rightward resultant. Directions and caption agree. No force-per-pixel scale or numerical forces are assigned; only balance and ordering are asserted, without using arrowhead ink as metric data.',
    'C1-L006': 'Read XML and rendered original: upper rest and lower extended configurations are offset vertically. Positive extension is rightward from the rest reference; red restoring force is leftward. No numerical stiffness, extension or force scale is declared; schematic arrow placement does not prescribe a point measurement. Caption and restoring direction agree.',
    'C1-L007': 'No figure blocks in the independently read source. All scalar/vector formulas and explanatory blocks were read.',
    'C1-L008': 'Read XML and rendered original: descent from A to B, vertical h marker and dashed B-level zero support dependence on height rather than incline path length. No numeric length scale is declared. The mass icon above the incline is illustrative; no pixel-derived center-of-mass height is asserted. Figure and caption agree with uniform g.'}


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
