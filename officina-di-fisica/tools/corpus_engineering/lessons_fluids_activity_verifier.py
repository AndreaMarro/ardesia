"""Independent reading of all 25 blocks and four SVGs in C2-L003..L006.

Source assumptions delimit the ideal models. Reviewer-constructed exact probes
and tests of excluded regimes are not student exercises or empirical calibration.
"""
from fractions import Fraction
from pathlib import Path

import pint
import sympy as sp

from .pipeline import digest, sha

APP = Path(__file__).resolve().parents[2]
SOURCE_REF = '5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH = 'officina-di-fisica/content/C2.json'
SOURCE_FILE_SHA256 = '7f2d3cf84a46d5d0086fd9cd6318b923ee073febc110a52fbc8f682edd995b23'
BATCH = 'lessons-fluids-014'
READ_SOURCE_SHA256 = {
    'C2-L003': 'c4f7f2f1b18364a7c7f385dedc37be5edae78d97ce759454461f33c4be3fea61',
    'C2-L004': 'f11680573b89e237ea222e1274184768269363e6fe62b5d3884ede4dd855a2ca',
    'C2-L005': '74d33cc6dcc108f2ec81b20ab8335768bab52aa834b78e718f8a3f6840cc101b',
    'C2-L006': '6bac962d14b5a716e3373bedcf9673cf16faab3135af5ad83441cb846bf7f37c',
}
READ_ASSETS = {
    'C2-pressa.svg': 'fb80bdf658d0cfc13979a52d2565a71c06f4788e49d6e6b921d746782d8808eb',
    'C2-spinta.svg': '2ecac15c1e05af22a89873203a18b57b63ba18235f8c9fd10acc52628b6a132f',
    'C2-condotto.svg': '403e01941806532289c8c82f6751978bcd4512d6235e08069cc3e7bf65bb02ba',
    'C2-bernoulli.svg': 'cf0bdde00128d3ba1f7d84cedc7062963a565dcd3b263873fb08d7dcec7efa63',
}
FIGURES_BY_ID = {'C2-L003': ['C2-pressa.svg'], 'C2-L004': ['C2-spinta.svg'],
                 'C2-L005': ['C2-condotto.svg'], 'C2-L006': ['C2-bernoulli.svg']}
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
    A1, A2, A, F1, s1, rho, g, volume, body_rho, height, depth = sp.symbols(
        'A1 A2 A F1 s1 rho g V rho_body H d', positive=True)
    x, t = sp.symbols('x t', real=True)
    s2, F2 = sp.symbols('s2 F2', real=True)
    force_out = sp.solve(F1/A1-F2/A2, F2)[0]
    stroke_out = sp.solve(A1*s1-A2*s2, s2)[0]
    # Explicit source approximation excludes growing hydrostatic head over a
    # finite stroke; quantify that excluded correction instead of hiding it.
    varying_head = x*(1+A1/A2)
    full_force_out = force_out-rho*g*A2*varying_head
    work_with_head = sp.integrate(full_force_out*(A1/A2), (x, 0, s1))
    lost_output_to_fluid_potential = F1*s1-work_with_head
    p0 = sp.Symbol('p0', real=True)
    top_pressure = p0+rho*g*depth
    bottom_pressure = p0+rho*g*(depth+height)
    buoyancy = (bottom_pressure-top_pressure)*A
    immersed = sp.solve(rho*g*x-body_rho*volume*g, x)[0]
    radius, outer, vmax = sp.symbols('r R vmax', positive=True)
    profile = vmax*(1-radius**2/outer**2)
    flow = sp.integrate(2*sp.pi*radius*profile, (radius, 0, outer))
    mean_speed = flow/(sp.pi*outer**2)
    rho1, rho2, v1, v2 = sp.symbols('rho1 rho2 v1 v2', positive=True)
    second_v = sp.solve(rho1*A1*v1-rho2*A2*v2, v2)[0]
    inflow, outflow = sp.symbols('Qin Qout', real=True)
    storage_rate = inflow-outflow
    p1, p2, z1, z2, dV = sp.symbols('p1 p2 z1 z2 dV', real=True)
    # Work on one material volume equals its kinetic-energy change.
    work_balance = (p1-p2)*dV+rho*dV*g*(z1-z2)-rho*dV*(v2**2-v1**2)/2
    solved_p1 = sp.solve(work_balance, p1)[0]
    path = sp.Symbol('ell', real=True)
    vpath, ppath, zpath = [sp.Function(name)(path) for name in ('v', 'p', 'z')]
    bernoulli_derivative = sp.diff(ppath+rho*vpath*vpath/2+rho*g*zpath, path)
    bernoulli_derivative = bernoulli_derivative.subs(sp.diff(ppath, path),
        -rho*vpath*sp.diff(vpath, path)-rho*g*sp.diff(zpath, path))
    # Why the source explicitly requires approximately uniform section profiles:
    # a parabolic profile has kinetic energy-flux coefficient alpha=2, not1.
    energy_flux_numerator = sp.integrate(2*sp.pi*radius*profile**3, (radius, 0, outer))
    alpha = sp.simplify(energy_flux_numerator/(sp.pi*outer**2*mean_speed**3))
    probe = 'reviewer_constructed_exact_probe_not_assigned_numeric_exercise'
    boundary = 'reviewer_limit_probe_excluded_by_explicit_source_approximation'
    return {
        'C2-L003': [
            check('same excess pressure gives force ratio', force_out, F1*A2/A1, 'N'),
            check('incompressible volume gives inverse stroke ratio', stroke_out, A1*s1/A2, 'm'),
            check('ideal model force times output stroke equals input work', force_out*stroke_out, F1*s1, 'J'),
            check('equal atmospheric load cancels from pressure difference', (p0+F1/A1)-p0, F1/A1, 'Pa'),
            check('pressure unit from load and area', Q(1, 'N')/Q(1, 'm**2'), 1, 'Pa'),
            check('volume swept by piston units', Q(1, 'cm**2')*Q(1, 'cm'), 1, 'cm**3'),
            check('probe area ratio4 converts5N to20N', force_out.subs({F1: 5, A1: 1, A2: 4}), 20, 'N', probe),
            check('probe input8cm means output2cm', stroke_out.subs({A1: 1, A2: 4, s1: R(8, 100)}), R(1, 50), 'm', probe),
            check('probe transmitted work5N times0.08m', 5*R(8, 100), R(2, 5), 'J', probe),
            check('probe output20N times0.02m', 20*R(2, 100), R(2, 5), 'J', probe),
            check('retained hydrostatic head costs fluid gravitational energy', lost_output_to_fluid_potential,
                  rho*g*A1*s1**2*(1+A1/A2)/2, 'J', boundary),
            check('neglected-head model recovers equal work', work_with_head.subs(rho, 0), F1*s1, 'J', boundary),
            check('relative head-work correction vanishes for short stroke',
                  sp.limit(lost_output_to_fluid_potential/(F1*s1), s1, 0, dir='+'), 0, '', boundary)],
        'C2-L004': [
            check('box pressure resultant is displaced fluid weight', buoyancy, rho*g*A*height, 'N'),
            check('buoyancy independent of depth at constant volume and density', sp.diff(buoyancy, depth), 0, 'N/m'),
            check('individual top pressure still grows with depth', sp.diff(top_pressure, depth), rho*g, 'Pa/m'),
            check('uniform background pressure cancels on closed body', sp.diff(buoyancy, p0), 0, 'm**2'),
            check('floating force balance yields immersed volume', immersed, body_rho*volume/rho, 'm**3'),
            check('floating fraction uses mean body density', sp.cancel(immersed/volume), body_rho/rho),
            check('neutral density requires fully submerged volume', immersed.subs(body_rho, rho), volume, 'm**3'),
            check('buoyancy units', Q(1, 'kg/m**3')*Q(1, 'm/s**2')*Q(1, 'm**3'), 1, 'N'),
            check('probe floating600kg/m3 body in1000kg/m3 fluid', R(600, 1000), R(3, 5), '', probe),
            check('probe1L body fully submerged buoyancy10N', 1000*10*R(1, 1000), 10, 'N', probe),
            check('probe600kg/m3 body1L weighs6N', 600*R(1, 1000)*10, 6, 'N', probe),
            check('probe tether force must supply4N downward', 10-6, 4, 'N', probe),
            check('probe denser1200kg/m3 body1L has negative free net force', (1000-1200)*10*R(1, 1000), -2, 'N', probe),
            check('probe3000kg/m3 material walls10mL weigh30g', Q(3000, 'kg/m**3')*Q(10, 'mL'), 30, 'g', probe),
            check('probe hollow30g over100mL mean density', Q(30, 'g')/Q(100, 'mL'), 300, 'kg/m**3', probe),
            check('probe hollow object displaced volume30mL at1000kg/m3', Q(30, 'g')/Q(1000, 'kg/m**3'), 30, 'mL', probe),
            check('figure upward and downward arrow shafts equal', sp.Integer(118-41), 201-124, 'pixel', 'read_SVG_balance_not_assigned_force_scale')],
        'C2-L005': [
            check('uniform normal velocity swept volume over interval', A*v1*t/t, A*v1, 'm**3/s'),
            check('area integral of nonuniform parabolic velocity', flow, sp.pi*outer**2*vmax/2, 'm**3/s'),
            check('area mean differs from profile maximum', mean_speed, vmax/2, 'm/s'),
            check('mass flux at uniform section density', rho*flow, rho*sp.pi*outer**2*vmax/2, 'kg/s'),
            check('general one-dimensional mass conservation velocity ratio', second_v, rho1*A1*v1/(rho2*A2), 'm/s'),
            check('same density reduces to volume continuity', second_v.subs(rho2, rho1), A1*v1/A2, 'm/s'),
            check('flow units from section and velocity', Q(1, 'm**2')*Q(1, 'm/s'), 1, 'm**3/s'),
            check('mass flow units', Q(1, 'kg/m**3')*Q(1, 'm**3/s'), 1, 'kg/s'),
            check('probe4cm3/s through4cm2 gives1cm/s', Q(4, 'cm**3/s')/Q(4, 'cm**2'), 1, 'cm/s', probe),
            check('probe4cm3/s through1cm2 gives4cm/s', Q(4, 'cm**3/s')/Q(1, 'cm**2'), 4, 'cm/s', probe),
            check('probe400 parallel radiiR/10 total area4piR2', 400*sp.pi*(outer/10)**2, 4*sp.pi*outer**2, 'm**2', probe),
            check('probe parallel bed speed one quarter at common totalQ', A*v1/(4*A), v1/4, 'm/s', probe),
            check('storage balance retains Qin minus Qout', rho*storage_rate, rho*inflow-rho*outflow, 'kg/s'),
            check('stationary storage requires equal in and out', storage_rate.subs(outflow, inflow), 0, 'm**3/s'),
            check('probe3mL/s in minus1mL/s out for5s stores10mL', (3-1)*5, 10, 'mL', probe),
            check('figure narrow-section speed arrow longer', sp.Integer(421-310)-sp.Integer(135-81), 57, 'pixel', 'read_SVG_order_not_assigned_speed_scale')],
        'C2-L006': [
            check('Bernoulli pressure difference from material-volume work', solved_p1-p2,
                  rho*(v2**2-v1**2)/2+rho*g*(z2-z1), 'Pa'),
            check('steady inviscid streamline derivative of Bernoulli sum', bernoulli_derivative, 0, 'Pa/m'),
            check('kinetic energy per volume pressure units', Q(1, 'kg/m**3')*Q(1, 'm/s')**2, 1, 'Pa'),
            check('potential energy per volume pressure units', Q(1, 'kg/m**3')*Q(1, 'm/s**2')*Q(1, 'm'), 1, 'Pa'),
            check('equal height removes gravitational difference', (solved_p1-p2).subs(z2, z1), rho*(v2**2-v1**2)/2, 'Pa'),
            check('probe1000kg/m3 and1to2m/s gives1500Pa drop',
                  ((solved_p1-p2).subs(z2, z1)).subs({rho: 1000, v1: 1, v2: 2}), 1500, 'Pa', probe),
            check('probe open piezometer difference1500/(1000*10)', R(1500, 1000*10), R(3, 20), 'm', probe),
            check('probe dilation reverses ideal pressure difference',
                  ((solved_p1-p2).subs(z2, z1)).subs({rho: 1000, v1: 2, v2: 1}), -1500, 'Pa', probe),
            check('probe elevationrise0.10m adds1000Pa to1500Pa',
                  (solved_p1-p2).subs({rho: 1000, v1: 1, v2: 2, g: 10, z1: 0, z2: R(1, 10)}), 2500, 'Pa', probe),
            check('uniform profile kinetic energy-flux correction is1', sp.cancel(A*v1**3/(A*v1**3)), 1),
            check('parabolic profile needs kinetic correction2', alpha, 2, '', boundary),
            check('figure wide piezometer surface higher than narrow', sp.Integer(76-44), 32, 'pixel', 'read_SVG_head_order_not_assigned_length_scale')],
    }


MANUAL = {
    'C2-L003': 'No assigned numerical exercise. From equal excess pressure derive F2=F1*A2/A1; incompressible volume gives s2=A1*s1/A2; multiplying gives equal ideal transmitted works. Distances are magnitudes and atmospheric loads cancel. Reviewer probe only: area ratio4,5N input and8cm stroke give20N,2cm and both works2/5J. Source explicitly neglects hydrostatic/inertial/dissipative corrections. Checking the excluded finite-head case gives missing output work rho*g*A1*s1²*(1+A1/A2)/2; it is not silently treated as zero for an arbitrary finite real stroke. Relative correction tends to zero with stroke. This lesson judgement does not change the separately failed original numerical E005 edition.',
    'C2-L004': 'No assigned numerical exercise. Pressure on a submerged box gives upward force[p0+rho*g(d+H)-(p0+rho*g*d)]A=rho*g*A*H; constant background and depth cancel. With no other forces, equality to mean-body-density*Vtotal*g yields immersed fraction rho_body/rho_fluid. Reviewer probes only:600kg/m³ in1000kg/m³ gives3/5;1L fully submerged has buoyancy10N and weight6N for assignedg10,requiring4N downward tether. Closed hollow body30g with100mL external excluding-liquid volume has mean density300kg/m³ and floating displaced volume30mL,regardless of denser wall material.',
    'C2-L005': 'No assigned numerical exercise. For uniform perpendicular velocity, swept volume A*v*dt gives Q=A*v. Independent area integral of parabolic profile vmax(1-r²/R²) gives Q=pi*R²*vmax/2 and area mean vmax/2. Section-uniform density gives mass flux rho*Q. Stationary no-leak balance gives rho1*A1*v1=rho2*A2*v2; equal densities permit volume continuity even if viscous. Reviewer probes only:4cm³/s through4 and1cm² gives1 and4cm/s;400 parallel branches eachradiusR/10 have totalarea4piR²,so common totalQ needs one-quarter speed. A filling tank retains storage:3-1mL/s for5s adds10mL.',
    'C2-L006': 'No assigned numerical exercise. Pressure work(p1-p2)dV plus gravityrho*dV*g(z1-z2) equals kineticchangerho*dV(v2²-v1²)/2, giving the printed pressure-difference sign. Integrating steady Euler along a streamline gives constant p+rho*v²/2+rho*g*z. All terms have Pa dimensions. Reviewer probes only:rho1000,1to2m/s at equalheight gives1500Pa static drop and piezometer difference3/20m with assignedg10;reversing speed change gives ideal recovery1500Pa. Rising1/10m adds1000Pa. A nonuniform parabolic profile has kinetic-flux coefficient2,proving why the stated nearly uniform profile condition matters;not a permitted substitution into the uncorrected section formula.'}
ASSUMPTIONS = {
    'C2-L003': 'Confined incompressible liquid,ideal frictionless pistons,equal atmospheric reference,slow quasi-equilibrium operation,positive areas and normal load increments. The source explicitly neglects hydrostatic,inertial,dissipative corrections; equal-work formula is inside that model. Initial equal heights alone do not eliminate head changes of an arbitrary finite real stroke. Significant evolving head requires fluid gravitational energy,as independently quantified;source approximation is not universalized.',
    'C2-L004': 'Hydrostatic homogeneous fluid and approximately constant gravity,body not supported by bottom;buoyancy uses volume actually excluding liquid. Floating ratio assumes freely equilibrated body with only weight and liquid buoyancy,air neglected. Immersed fraction must lie[0,1];mean density greater thanfluid cannot satisfy free floating. Hollow-body external volume must exclude fluid,not include a flooded open cavity. Constraint forces must be included if held submerged,as source states.',
    'C2-L005': 'Positive control-section area and positive elapsed time;normal component and area average,not profile peak. Finite-interval volume/time is time-averaged flow if unsteady. Scalar rho*Q and one-dimensional rho*A*v require uniform density on each section,as in the homogeneous-liquid introductory model;they are not generalized to correlated nonuniform density/velocity without the mass-flux integral. Stationary no-leak regions have no mass storage;volume continuity additionally needs common constant density. Viscosity does not invalidate mass conservation. Parallel branches use summed areas;filling includes accumulation.',
    'C2-L006': 'Steady incompressible flow without dissipation or intervening machines;Bernoulli constant follows one streamline,not arbitrary different streamlines. Gravity coordinate z upward. Section-mean substitution additionally assumes approximately uniform profiles,explicit in source;otherwise kinetic corrections and real losses matter. Open piezometers measure static pressure head;they are not Pitot stagnation probes. Clinical blood-flow examples are explicitly idealized,with viscosity,pulsatility,wall elasticity,separation andirreversiblelosses limiting applicability;no patient measurement or recommendation is inferred.'}
PEDAGOGY = {
    'C2-L003': 'Separates pressure increment from force and atmosphere,states approximation assumptions,then derives inverse stroke ratio before ideal work balance. Warns against simultaneous force and displacement gain. Complete source includes direct permission to neglect hydrostatic corrections;that statement is not invented by reviewer. No numerical calculator requirement or student calibration.',
    'C2-L004': 'Derives upward resultant from varying surface pressure and displaced-fluid substitution,then distinguishes complete immersion from free flotation. Uses mean density for hollow objects and explicitly requires adding constraint forces when held underwater. Displaced volume means excluded liquid,not every geometric interior regardless of flooding. No keyed answer substituted for reasoning.',
    'C2-L005': 'Defines normal area mean before continuity and distinguishes mass balance from volume balance. Handles viscous liquids,parallel totalarea and filling storage ratherthan applying A1v1=A2v2 indiscriminately. Reviewer calculations test nonuniform profiles and networks but are not presented as source exercises or measured student performance.',
    'C2-L006': 'Begins with energy sources and streamline conditions,checks term dimensions andheight sign,then distinguishes static pressure and velocity contributions. Explicit nearly uniform section-profile qualification and real-flow/clinical caveats prevent unqualified application to stenosis or pressure recovery. Reviewer toy numbers are algebra probes,not clinical data.'}
FIGURE_REVIEW = {
    'C2-L003': 'Original XML and rendered preview read:pistons atsamey87..96,large/right widerthan small/left;input arrowdown andoutput arrowup. No numericalarea orforce scale assigned;equal-length force arrows are schematic directions,not force equality. Caption expressly same atmosphere/equal heights. Figure depicts reference configuration,not invariant equality of heights during finite stroke.',
    'C2-L004': 'Original XML and rendered preview read:block spansy72..166,liquid levely106,so only lowerportion excludesliquid;labels pointto emerged/immersedparts. UpwardS anddownwardP shafts both77px,consistent withfree-floating forcebalance. No numericdensity orvolume scale assigned. The SVG title says displaced volume;the picture itself uses a dashed free-surface line,not an extra numerical region to measure.',
    'C2-L005': 'Original XML and rendered preview read:verticaldashed sectionlinesx160/390 inwide/narrowchannel;velocityarrows54px/111px showhighermean speedinnarrowsection. No physicalspeed/area scale nor circularcrosssection is assigned,so no squaring drawingwidth or exactratio is inferred.',
    'C2-L006': 'Original XML and rendered preview read:wideleft andnarrowright pipewithopenverticalpiezometers;leftsurfacey44 isabove rightsurfacey76,consistent withlargerstaticpressure headinwidepart. Pipecenterlines horizontal within1pxillustrative strokeoffset. No physicalheight scale;32px head difference isqualitative only. The vertical open tubes indicate static head,not velocity-directed stagnation measurement.'}


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
