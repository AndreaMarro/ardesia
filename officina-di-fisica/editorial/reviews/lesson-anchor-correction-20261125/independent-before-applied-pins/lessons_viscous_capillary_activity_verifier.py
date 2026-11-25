"""Independent full reading of C2-L007..L010, including an original domain failure.

All 26 blocks and four historical SVGs read/rendered before source pins. Exact
reviewer probes are not assigned numerical work or empirical student evidence.
"""
from fractions import Fraction
from pathlib import Path

import pint
import sympy as sp

from .pipeline import digest, sha
from .review_contract import reviewed_rows

APP = Path(__file__).resolve().parents[2]
SOURCE_REF = '5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH = 'officina-di-fisica/content/C2.json'
SOURCE_FILE_SHA256 = '7f2d3cf84a46d5d0086fd9cd6318b923ee073febc110a52fbc8f682edd995b23'
BATCH = 'lessons-viscous-capillary-015'
READ_SOURCE_SHA256 = {
    'C2-L007': 'f0382da70dabd853ad1d8d6a1f8d006063f7b2f4d12327f390305169a70e3670',
    'C2-L008': 'a4e4ff8f537596cd3a413f09c4d730888b0e91e49c44699e2c9f58149f526ca1',
    'C2-L009': '363e23db48dc4b256af71866af2c2db5e6cc72514b6204dd01b726e4ebf65fa4',
    'C2-L010': '668f4bf72f97a6f77e3dc0a8e696d784012da1745358c42d99efdf9975e336d0',
}
READ_ASSETS = {
    'C2-profilo.svg': '73907de291ed86769e15e3d90e407b6ee78198524df50a8d456a8101df798b4c',
    'C2-raggio.svg': 'edfcf1d6ba50e668f509b138b751154ce5bf1be7c81ad58561316ae072a02178',
    'C2-reti.svg': '2dbdd5ee675dab5d935061d55a2aa6c63b3a5f616a1ee48da17684ea1af3a377',
    'C2-capillare.svg': '3bd5058865211ddca1631b5195f13e3e0f788681e80720f125762914dc710de2',
}
FIGURES_BY_ID = {'C2-L007': ['C2-profilo.svg'], 'C2-L008': ['C2-raggio.svg'],
                 'C2-L009': ['C2-reti.svg'], 'C2-L010': ['C2-capillare.svg']}
ISSUES = {'C2-L007': {'priority': 'P2', 'kind': 'missing_stationarity_condition_for_pipe_profile',
    'reason': 'Tube paragraph and parabolic-profile/half-maximum formula omit stationarity, although laminar and stationary are explicitly distinguished. Fully developed unsteady Newtonian no-slip flow need not be parabolic; the independent polynomial Navier-Stokes solution has mean minus half maximum b*R^4/6.'}}
SI = pint.UnitRegistry(non_int_type=Fraction)
REVISION_IDS = {'C2-L007'}
# Frozen only after complete independent reading of the final 28-block edition,
# exact worked example/area integral, and byte-identical uploaded historical SVG.
REVIEWED_REVISIONS = {
    'C2-L007': '9c1c72d008f9c87d70e4bdcd7646ee24398e6bc6089bdab210d5c83ce7e0f05e',
}


def check(claim, actual, expected, unit='', scope='symbolic_source_claim'):
    if isinstance(actual, SI.Quantity):
        actual = sp.Rational(actual.to(unit).magnitude)
    residual = sp.simplify(actual-expected)
    return {'claim': claim, 'independentExact': str(actual), 'expectedValue': str(expected),
            'unit': unit, 'dimension': {str(k): str(v) for k, v in SI.Unit(unit).dimensionality.items()},
            'relation': 'exact', 'residual': str(residual), 'ok': residual == 0, 'scope': scope}


def independent_checks():
    Q, R = SI.Quantity, sp.Rational
    r, outer, eta, rho, length, dp, area, gap = sp.symbols('r R eta rho L dp A d', positive=True)
    t, y, z, beta = sp.symbols('t y z beta', real=True)
    low, high = sp.symbols('U0 U1', real=True)
    couette = low+(high-low)*y/gap
    # Cylinder force balance gives eta*dv/dr=-dp*r/(2L); integrate inward
    # from the stationary no-slip wall, under the steady conditions of L008.
    profile = sp.integrate(dp*r/(2*eta*length), (r, r, outer))
    flow = sp.integrate(2*sp.pi*r*profile, (r, 0, outer))
    mean = sp.cancel(flow/(sp.pi*outer**2))
    resistance = sp.cancel(dp/flow)
    dissipation = sp.integrate(eta*sp.diff(profile, r)**2*2*sp.pi*r*length, (r, 0, outer))
    a0, b = sp.symbols('a0 b', positive=True)
    unsteady_a = a0+16*eta*b*t/rho
    unsteady_v = unsteady_a*(outer**2-r**2)+b*(outer**4-r**4)
    forcing = 4*eta*unsteady_a+16*eta*b*outer**2
    ns_residual = sp.simplify(rho*sp.diff(unsteady_v, t)-forcing
                            -eta*(sp.diff(unsteady_v, r, 2)+sp.diff(unsteady_v, r)/r))
    unsteady_mean = sp.integrate(2*r*unsteady_v, (r, 0, outer))/outer**2
    unsteady_max = unsteady_v.subs(r, 0)
    R1, R2 = sp.symbols('R1 R2', positive=True)
    pa, pb, pm, flux = sp.symbols('pa pb pm Q', real=True)
    series_solution = sp.solve([pa-pm-R1*flux, pm-pb-R2*flux], (pm, flux))
    parallel_total = (pa-pb)/R1+(pa-pb)/R2
    parallel_R = sp.cancel((pa-pb)/parallel_total)
    gamma, edge, gravity, density, radius = sp.symbols('gamma ell g density radius', positive=True)
    theta, displacement = sp.symbols('theta displacement', real=True)
    height = sp.solve(2*sp.pi*radius*gamma*sp.cos(theta)-density*gravity*sp.pi*radius**2*z, z)[0]
    sphere_area, sphere_volume = 4*sp.pi*outer**2, 4*sp.pi*outer**3/3
    drop_pressure = sp.cancel(sp.diff(gamma*sphere_area, outer)/sp.diff(sphere_volume, outer))
    film_pressure = sp.cancel(sp.diff(2*gamma*sphere_area, outer)/sp.diff(sphere_volume, outer))
    probe = 'reviewer_constructed_exact_probe_not_assigned_numeric_exercise'
    counter = 'original_domain_counterexample_not_a_student_exercise'
    checks = {
        'C2-L007': [
            check('steady zero-pressure-gradient Couette curvature zero', sp.diff(couette, y, 2), 0, '1/m/s'),
            check('Couette no-slip lower boundary', couette.subs(y, 0), low, 'm/s'),
            check('Couette no-slip upper boundary', couette.subs(y, gap), high, 'm/s'),
            check('Couette transverse velocity gradient', sp.diff(couette, y), (high-low)/gap, '1/s'),
            check('dynamic viscosity unit', Q(1, 'Pa')/Q(1, '1/s'), 1, 'Pa*s'),
            check('probe0.30m/s across2mm gives150persecond', Q(Fraction(3, 10), 'm/s')/Q(2, 'mm'), 150, '1/s', probe),
            check('probeeta0.4Pas times150 gives60Pa', Q(Fraction(2, 5), 'Pa*s')*Q(150, '1/s'), 60, 'Pa', probe),
            check('probe60Pa over0.02m2 needs1.2N', Q(60, 'Pa')*Q(Fraction(1, 50), 'm**2'), R(6, 5), 'N', probe),
            check('steady pipe profile has zero wall speed', profile.subs(r, outer), 0, 'm/s'),
            check('steady pipe area mean half axis speed', mean, profile.subs(r, 0)/2, 'm/s'),
            check('Reynolds number dimensions', Q(1, 'kg/m**3')*Q(1, 'm/s')*Q(1, 'm')/Q(1, 'Pa*s'), 1),
            check('inertia to viscosity scale ratio', (rho*high**2/length)/(eta*high/length**2), rho*high*length/eta),
            check('unsteady counterexample solves axial Navier-Stokes', ns_residual, 0, 'Pa/m', counter),
            check('unsteady counterexample satisfies no-slip', unsteady_v.subs(r, outer), 0, 'm/s', counter),
            check('unsteady counterexample smooth axis gradient', sp.diff(unsteady_v, r).subs(r, 0), 0, '1/s', counter),
            check('unsteady counterexample independent of axial coordinate', sp.diff(unsteady_v, z), 0, '1/s', counter),
            check('unsteady counterexample mean from area integral', unsteady_mean,
                  unsteady_a*outer**2/2+2*b*outer**4/3, 'm/s', counter),
            check('original half-maximum claim without stationarity', sp.simplify(unsteady_mean-unsteady_max/2), 0, 'm/s', counter)],
        'C2-L008': [
            check('steady radial shear balances pressure gradient', eta*sp.diff(profile, r), -dp*r/(2*length), 'Pa'),
            check('independently integrated Hagen-Poiseuille flow', flow, sp.pi*outer**4*dp/(8*eta*length), 'm**3/s'),
            check('hydraulic resistance from flow coefficient', resistance, 8*eta*length/(sp.pi*outer**4), 'Pa*s/m**3'),
            check('radius squared scaling of mean velocity', sp.cancel(mean.subs(outer, 2*outer)/mean), 4),
            check('radius squared scaling of cross-sectional area', (sp.pi*(2*outer)**2)/(sp.pi*outer**2), 4),
            check('halving radius at fixed pressure gives one-sixteenth flow', sp.cancel(flow.subs(outer, outer/2)/flow), R(1, 16)),
            check('halving radius multiplies resistance by16', sp.cancel(resistance.subs(outer, outer/2)/resistance), 16),
            check('fixed flow requires16fold pressure after halving radius',
                  sp.cancel((resistance*flux).subs(outer, outer/2)/(resistance*flux)), 16),
            check('double viscosity halves flow', sp.cancel(flow.subs(eta, 2*eta)/flow), R(1, 2)),
            check('double length halves flow', sp.cancel(flow.subs(length, 2*length)/flow), R(1, 2)),
            check('Poiseuille coefficient units', Q(1, 'm')**4*Q(1, 'Pa')/(Q(1, 'Pa*s')*Q(1, 'm')), 1, 'm**3/s'),
            check('hydraulic resistance units', Q(1, 'Pa')/Q(1, 'm**3/s'), 1, 'Pa*s/m**3'),
            check('radius1mm converts to1over1000m', Q(1, 'mm'), R(1, 1000), 'm'),
            check('toy1mm,eta0.001,L0.1,dp8 flow exact',
                  flow.subs({outer: R(1, 1000), eta: R(1, 1000), length: R(1, 10), dp: 8}), sp.pi/R(100000000), 'm**3/s', probe),
            check('toy exact flow in mL persecond',
                  flow.subs({outer: R(1, 1000), eta: R(1, 1000), length: R(1, 10), dp: 8})*1000000, sp.pi/100, 'mL/s', probe),
            check('pressure power equals integrated viscous dissipation', dissipation, dp*flow, 'W'),
            check('actual figure radius ratio33over66', R(33, 66), R(1, 2), '', 'read_SVG_labelled_radius_ratio')],
        'C2-L009': [
            check('series flow from middle-node elimination', series_solution[flux], (pa-pb)/(R1+R2), 'm**3/s'),
            check('intermediate pressure cancels in series drop', (pa-pm)+(pm-pb), pa-pb, 'Pa'),
            check('parallel equivalent from summed branch flows', parallel_R, R1*R2/(R1+R2), 'Pa*s/m**3'),
            check('parallel smaller than R1 with positive difference', R1-parallel_R, R1**2/(R1+R2), 'Pa*s/m**3'),
            check('parallel smaller than R2 with positive difference', R2-parallel_R, R2**2/(R1+R2), 'Pa*s/m**3'),
            check('series exceeds R1 by positive R2', (R1+R2)-R1, R2, 'Pa*s/m**3'),
            check('closing branch2 returns equivalent R1', sp.limit(parallel_R, R2, sp.oo), R1, 'Pa*s/m**3'),
            check('closed branch2 flow tends zero', sp.limit((pa-pb)/R2, R2, sp.oo), 0, 'm**3/s'),
            check('toy seriesR2plus4 gives Q3 for drop18', ((pa-pb)/(R1+R2)).subs({pa: 22, pb: 4, R1: 2, R2: 4}), 3, 'mL/s', probe),
            check('toy intermediate pressure16', series_solution[pm].subs({pa: 22, pb: 4, R1: 2, R2: 4}), 16, 'Pa', probe),
            check('toy parallelR2and4 equals4over3', parallel_R.subs({R1: 2, R2: 4}), R(4, 3), 'Pa*s/mL', probe),
            check('toy parallel totalQ27over2', parallel_total.subs({pa: 22, pb: 4, R1: 2, R2: 4}), R(27, 2), 'mL/s', probe),
            check('parallel power is sum of branch powers', (pa-pb)*parallel_total,
                  (pa-pb)**2/R1+(pa-pb)**2/R2, 'W'),
            check('pressure flow product power units', Q(1, 'Pa')*Q(1, 'm**3/s'), 1, 'W')],
        'C2-L010': [
            check('surface energy and line force units agree', Q(1, 'J/m**2'), 1, 'N/m'),
            check('single straight moving edge force from energy', sp.diff(gamma*edge*displacement, displacement), gamma*edge, 'N'),
            check('soap film two interfaces double edge force', sp.diff(2*gamma*edge*displacement, displacement), 2*gamma*edge, 'N'),
            check('capillary height from vertical force balance', height, 2*gamma*sp.cos(theta)/(density*gravity*radius), 'm'),
            check('wettingtheta0 height positive coefficient', height.subs(theta, 0), 2*gamma/(density*gravity*radius), 'm'),
            check('theta90deg gives zero capillary height', height.subs(theta, sp.pi/2), 0, 'm'),
            check('theta120deg gives negative capillary height', height.subs(theta, 2*sp.pi/3), -gamma/(density*gravity*radius), 'm'),
            check('halving capillary radius doubles signed height', sp.cancel(height.subs(radius, radius/2)/height), 2),
            check('capillary coefficient units', Q(1, 'N/m')/(Q(1, 'kg/m**3')*Q(1, 'm/s**2')*Q(1, 'm')), 1, 'm'),
            check('spherical drop pressure from energy-volume derivative', drop_pressure, 2*gamma/outer, 'Pa'),
            check('thin soap film pressure from two interface energies', film_pressure, 4*gamma/outer, 'Pa'),
            check('finite two-radius soap film tends to thin-film pressure',
                  sp.limit(2*gamma/outer+2*gamma/(outer+gap), gap, 0, dir='+'), 4*gamma/outer, 'Pa'),
            check('plane-interface curvature limit', sp.limit(drop_pressure, outer, sp.oo), 0, 'Pa'),
            check('smaller drop radius doubles pressure', drop_pressure.subs(outer, outer/2)/drop_pressure, 2),
            check('sphere saturates geometric isoperimetric bound', sphere_area**3-36*sp.pi*sphere_volume**2, 0, 'm**6'),
            check('two equal-volume spheres increase total surface',
                  (2*4*sp.pi*(outer/2**R(1, 3))**2)/sphere_area, 2**R(1, 3)),
            check('surface tension50mNpermetre converts exactly', Q(50, 'mN/m'), R(1, 20), 'N/m'),
            check('toy surface work over1cm2', Q(Fraction(1, 20), 'N/m')*Q(1, 'cm**2'), R(1, 200000), 'J', probe),
            check('toy capillary1mm,g10,density1000,theta0 gives1cm',
                  height.subs({gamma: R(1, 20), density: 1000, gravity: 10, radius: R(1, 1000), theta: 0}), R(1, 100), 'm', probe),
            check('toy capillarytheta60 halves rise',
                  height.subs({gamma: R(1, 20), density: 1000, gravity: 10, radius: R(1, 1000), theta: sp.pi/3}), R(1, 200), 'm', probe),
            check('toy spherical drop1mm has100Pa excess', drop_pressure.subs({gamma: R(1, 20), outer: R(1, 1000)}), 100, 'Pa', probe),
            check('toy soap bubble1mm has200Pa excess', film_pressure.subs({gamma: R(1, 20), outer: R(1, 1000)}), 200, 'Pa', probe)],
    }
    return checks


MANUAL = {
    'C2-L007': 'Source has no assigned numerical exercise. Couette no-slip endpoints yield linear profile and gradient(U1-U0)/d under its explicitly steady zero-pressure-gradient assumptions. Reviewer probe0.30m/s over2mm gives150s^-1;eta0.4Pas gives60Pa andarea0.02m² needs6/5N. Steady pipe area integration gives half-axis mean and Reynolds units cancel. ORIGINAL FAIL is domain,not difficult arithmetic: the tube statement omits stationarity. Exact counterexample v=a(t)(R²-r²)+b(R⁴-r⁴),a=a0+16eta*b*t/rho,drivinggradientG=4eta*a+16eta*b*R² satisfies the unsteady fully developed axial momentum equation,no-slip andsmoothaxis. Mean minushalfmaximum=bR⁴/6,nonzero for b>0. For toySIcoefficientsa0=b=R=eta=rho=1 at t0,maximum2m/s,mean7/6m/s,Re7/3;low-Re laminar motion remains nonparabolic.',
    'C2-L008': 'No assigned numeric calculator task. Integrate radial stress balance eta*dv/dr=-Delta_p*r/(2L) from no-slip wall to getv=Delta_p(R²-r²)/(4etaL);integrate2pi*r*v forQ=piR⁴Delta_p/(8etaL). Mean scalesR² andareaR². Source actualmanual relation:(1/2)^4=1/16 at fixedpressure;fixedQ insteadneeds16timespressure. Reviewer toy:r1mm=1/1000m,eta1/1000Pas,L1/10m,drop8Pa giveQ=pi/10^8m³/s=pi/100mL/s exactly. Pi neednot be evaluated. Independently integrated viscous dissipation equalsDelta_p*Q,consistent with continuous pressure work.',
    'C2-L009': 'No numerical exercise assigned. Eliminate pressureatmiddle node to deriveRseries=R1+R2;sumparallelflowsDelta_p/Ri andinvert to getR1R2/(R1+R2). Positive finite resistances imply parallel beloweachbranch andseries aboveeachcontribution;R2toinfinity returnsR1 andbranch2flow0. Reviewer toy:R1=2,R2=4Pa*s/mL,nodes22and4Pa give seriesQ3mL/s andmiddle16Pa;parallelReq4/3Pa*s/mL andtotalQ27/2mL/s. Node power equals sum of branchpowers. These are exact illustrative numbers,not measured biological parameters.',
    'C2-L010': 'Source quantitative relations are all checked despite its stated qualitative syllabus aim;no assigned decimalcalculation. Moving straight edge createsareaell*dx soenergyderivative givesgamma*ell,or2gamma*ell forsoapfilm. Force balance givesh=2gamma*cos(theta)/(rho*g*r),positivebelow90deg,zeroat90,negativeabove90. Differentiate4piR²gamma with respect to4piR³/3 toderive2gamma/R foroneinterface;twointerfacesthinfilm gives4gamma/R. Reviewer toys:50mN/m=1/20N/m;newarea1cm² needs1/200000J. Capillaryr1mm,rho1000,g10,theta0 gives1cm;theta60 gives1/2cm. DropR1mm has100Pa excess,andthinsoapbubble200Pa. Exactfractions,pi cancellation andstandardcosines suffice;no calculator or studentcalibration claimed.'}
ASSUMPTIONS = {
    'C2-L007': 'Newtonian constant dynamicviscosity,signedshear convention handled through sourceabsolutevalues. Couette assumptions explicitly steady developed,no pressuregradient,no-slip. A stationary circular pressure-driven flow gives the displayedparabola,but the originaltube paragraph omits stationarity despite distinguishing laminarfromsteady. Fullydeveloped means no axialprofilechange;it neednot exclude timedependence. Counterexample usespositivea0,b,R,eta,rho,t>=0 withsmoothpositiveaxisymmetricvelocity,no radial/axialdependence,andcanbechosenlowRe. Reynolds isdimensionless scaling,not a universaltransitionthreshold.',
    'C2-L008': 'All sourceconditions explicitly present:straight rigid circular uniform-radiuspipe,incompressibleNewtonianfluid,laminarsteadyfullydeveloped,no-slip,horizontal. Positiveeta,L,r;Delta_p signsetinflowdirection. Resistanceatzeroflow is understood aslinearcoefficient,not evaluating0/0. Radius/diameter distinction and controlledpressureversuscontrolledflow matter. Realphysiologicalpulsatility,deformability andreology are explicitly outside this scalarlinear model.',
    'C2-L009': 'Stationaryincompressibleflow,positivefinitelinearresistances andidealnodesofcommonpressure,withnoextraunassignedjunctionstorageorloss. Series hascommonflow,parallelcommonpressuredifference. Limitinfiniteresistance closesbranch. Fixednodepressures requiredforflowcomparison;elastic regulation/pulsation are not reduced tofixedmeasuredparameters. PrerequisitehorizontalPoiseuillemodel supplies the pressure-resistance interpretation.',
    'C2-L010': 'Constantgamma underassignedthermodynamicconditions;DeltaA countsphysicalinterfaces. F=gamma*ell islocal/co-directedtractionalong a straight effectiveedge,not scalar summation of arbitrarily turningclosedborderforces. Smallfreedrops approximate spheres;gravity/supportdeformation limitedasstated. Circularthincapillary,equilibriummeniscus,contactanglethroughliquid,equalatmospheres andnegligiblegasdensity;meniscusvolumecorrection neglectedexplicitly. Laplace2gamma/R isoneinterface sphere;4gamma/R forsoapbubble isthinfilmapproximation,twoalmostequalradii,as source says.'}
PEDAGOGY = {
    'C2-L007': 'Correct shear-gradient explanation,Couette assumptions,units,laminarversustemporalsteadiness distinction andReynolds caveat. Originaltubeparabola andhalfmaximum needtheadditionalexplicitsteadycondition. Cannot silently importthat condition fromthe precedingdifferentgeometry orfromnextlesson tocertifythebroadclaim. Failure doesnotimpugnthecorrectsteadyparaboladiagram.',
    'C2-L008': 'Complete conditions precede formula,thenexplicitSIunits andtwooriginsofradiusfourthpower. ControlledDelta_p versuscontrolledQ ismadeexplicit;actualhalf-radiusconclusion1/16 ismanual. Realphysiology caveat preventstreatingtoy law aspatientcalibration.',
    'C2-L009': 'Topology/nodeidentification precedesalgebra. Cancelsmiddlepressure inseries andsumsbranchflows inparallel;closingabranch provideslimitcheck. Distinguishesfixednodepressures fromphysiological regulation. No answerkey orfixture substitutesfor a solvednetwork.',
    'C2-L010': 'Connectsenergyandforcemeasurements,countssoapinterfaces,definescontactangleandrisemeasurement,checkspositive/negativeheightandcurvaturepressure. Quantitativeextensions actually derivedratherthan waivedbecausequalitativesyllabus. Explicitthinfilmandmeniscus approximations retaincorrectlimits;nounassigneddecimaltrig step.'}
FIGURE_REVIEW = {
    'C2-L007': 'XML/render read:axisy110,wallsy48/172,radius62px. QuadraticBezier M15148 Q523110151172 equalsx151+186[1-((y-110)/62)^2] exactly. Arrowsatselectedlevels meetcurvewithin1pxrounding;axismaximumandnoslipcorrect. Shapevalidforsteadycase;originaldomainfailureistextualstationarityomission,not wronggeometry.',
    'C2-L008': 'XML/render read:circleradii66and33px exactratio1/2;separatecomparisonpipes,notserialstenosis. Captionexplicitlyfixespressure,viscosity,length. Redarrowslabelradii,notflowsorforces;circlegeometryratherthanarrowheadinkverifiestheratio.',
    'C2-L009': 'XML/render read:upperpath crossesR1thenR2;lowerR1/R2branchesjoinidenticalleft/rightnodes. Labelsandcaptionmatchseries/parallelalgebra. No spatiallengthinterpretedasresistanceorpressure.',
    'C2-L010': 'XML/render read:connectedreservoirandverticalcapillary,externallevely129,concavewettingmeniscusedgesy53andcentery61,referencelinehnear59. Positiveheightshown;captionexplicitlyneglectssmallmeniscuscorrections. Sameatmospherelegendcorrect. No numericr,h,thetaorgamma scaleassigned;meniscuscurve isqualitativelywetting,notananglemeasurementexercise.'}


def verify_originals(sources, asset_root=None):
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
            errors.append('Independent lesson claim counterexample or mathematics failed')
        if key in ISSUES:
            errors.append(ISSUES[key]['reason'])
        record = {'id': key, 'sourceSha256': digest(row), 'sourceVersion': row.get('version', 1),
            'sourceRef': SOURCE_REF, 'sourcePath': SOURCE_PATH, 'sourceFileSha256': SOURCE_FILE_SHA256,
            'ok': not errors, 'errors': errors, 'checks': checks,
            'dimension': {claim['claim']: claim['dimension'] for claim in checks},
            'calculationScope': 'EXACT_MANUAL_CALCULATION', 'manualArithmetic': MANUAL[key],
            'manualFeasibility': 'FAIL_ORIGINAL_EDITION' if key in ISSUES else 'PASS_AI_EXACT',
            'physicalAssumptions': ASSUMPTIONS[key], 'pedagogicalReview': PEDAGOGY[key],
            'assetChecksums': assets, 'figureReview': FIGURE_REVIEW[key],
            'verificationMode': 'INDEPENDENT_EXISTING_EDITION', 'failedPublishedEdition': key in ISSUES,
            'originalEditionRetained': True, 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
        if key in ISSUES:
            record['publishedEditionIssue'] = ISSUES[key]
        records.append(record)
    return records


def revised_checks():
    checks = [claim for claim in independent_checks()['C2-L007']
              if claim['claim'] != 'original half-maximum claim without stationarity']
    R = sp.Symbol('R', positive=True)
    r, y = sp.symbols('r y', real=True)
    vmax = sp.Symbol('vmax', positive=True)
    profile = vmax*(1-r*r/(R*R))
    area_mean = sp.integrate(2*r*profile, (r, 0, R))/(R*R)
    diameter_mean = sp.integrate(vmax*(1-y*y/(R*R)), (y, -R, R))/(2*R)
    worked = 'new_edition_worked_example_arithmetic'
    checks.extend([
        check('new Couette worked gradient4mm/s over2mm', SI.Quantity(4, 'mm/s')/SI.Quantity(2, 'mm'), 2, '1/s', worked),
        check('new Couette worked stress2Pas times2persecond', SI.Quantity(2, 'Pa*s')*SI.Quantity(2, '1/s'), 4, 'Pa', worked),
        check('new example4mm/s converts exactly to1over250m/s', SI.Quantity(4, 'mm/s'), sp.Rational(1, 250), 'm/s', worked),
        check('new profile center limit', profile.subs(r, 0), vmax, 'm/s'),
        check('new profile stationary wall limit', profile.subs(r, R), 0, 'm/s'),
        check('new profile at half radius', profile.subs(r, R/2), 3*vmax/4, 'm/s'),
        check('new printed power integral', sp.integrate(r-r**3/R**2, (r, 0, R)), R**2/4, 'm**2'),
        check('new area weighted mean', area_mean, vmax/2, 'm/s'),
        check('diameter line mean would differ from area mean', diameter_mean-area_mean, vmax/6, 'm/s',
              'reviewer_comparison_not_assigned_extra_student_calculation'),
        check('new Reynolds numerator shares viscosity base units',
              SI.Quantity(1, 'kg/m**3')*SI.Quantity(1, 'm/s')*SI.Quantity(1, 'm'), 1, 'kg/m/s'),
    ])
    return checks


def verify(sources, package=None, bindings=None, asset_root=None, original_asset_root=None):
    historical_root = original_asset_root if original_asset_root is not None else asset_root if package is None else None
    originals = verify_originals(sources, historical_root)
    if package is None:
        if bindings is not None:
            raise ValueError('Bindings require a revision package')
        return originals
    if bindings is None:
        raise ValueError('Revision package requires complete source bindings')
    root = Path(asset_root) if asset_root is not None else APP/'editorial/assets'
    rows = reviewed_rows(package, bindings, REVIEWED_REVISIONS, REVISION_IDS, root)
    byid = {record['id']: record for record in originals}
    for row, binding, signature, assets, errors in rows:
        key = row['id']
        original = byid[key]
        if (binding['sourceRef'] != SOURCE_REF or binding['sourceId'] != key
                or binding['sourceSha256'] != original['sourceSha256']
                or original['sourceSha256'] != READ_SOURCE_SHA256[key]):
            errors.append('Lesson revision not bound to independently read original')
        if (row.get('kind') != 'lesson' or 'answer' in row
                or type(row.get('version')) is not int or type(row.get('baseVersion')) is not int
                or row['version'] != original['sourceVersion']+1 or row['baseVersion'] != original['sourceVersion']):
            errors.append('Expected additive next lesson edition with correct base and no answer key')
        for src, checksum in original['assetChecksums'].items():
            if checksum != READ_ASSETS[src.removeprefix('/figures/')]:
                errors.append('Retained historical lesson figure changed or missing')
        checks = revised_checks()
        if not all(claim['ok'] for claim in checks):
            errors.append('Independent revised lesson mathematics failed')
        revised = dict(original)
        revised.update(ok=not errors, errors=errors, checks=checks,
            dimension={claim['claim']: claim['dimension'] for claim in checks},
            manualFeasibility='PASS_AI_EXACT',
            manualArithmetic='NEW DRAFT: worked example 4mm/s over 2mm gives 2s^-1; 2Pa*s times 2s^-1 gives 4Pa. In SI, 0.004/0.002=2 exactly. Steady pipe profile endpoints vmax/0 and half-radius value 3vmax/4 checked. Area weighting 2pi*r*dr gives integral R²/4 and mean vmax/2; reviewer comparison over a diameter instead gives 2vmax/3, so area weighting matters. The exact polynomial unsteady counterexample remains a boundary probe explaining why startup is excluded, not an exercise assigned in the new lesson. Reynolds numerator kg/(m*s) matches eta, so Re is dimensionless. No calculator or student-performance evidence claimed.',
            physicalAssumptions='NEW DRAFT: Couette is steady and developed, with no pressure gradient and no slip. Tube explicitly straight, circular, horizontal, steady, laminar and fully developed; incompressible Newtonian fluid with constant positive eta/rho, stationary walls and no slip. Entrance/end effects excluded; R>0, 0<=r<=R and axis along the flow with vmax>0. Startup may be laminar but unsteady and does not automatically share the parabola or half-maximum mean. Small Re does not imply time independence. All these conditions are actually present in the final edition.',
            pedagogicalReview='NEW DRAFT: all 28 blocks reread. Explicit stationarity repairs the original domain failure. The worked Couette example separates shear stress from normal pressure despite common Pa units. The area integral explains why outer annuli have more weight and why this differs from a diameter line average. Checks center, wall, half-radius and the laminar/steady distinction with a startup warning. Reynolds remains an optional scaling comparison without a universal threshold. Formulas are explicit standalone equations, with no dangling chains or hidden numerical trigonometry step.',
            assetChecksums=assets, candidateSha256=digest(row), reviewedSignature=signature,
            candidateVersion=row['version'], baseVersion=row['baseVersion'], failedPublishedEdition=True,
            publishedEditionReview=original, reviewedEdition='NEW_DRAFT', verificationMode='EXACT_ORACLE',
            publicationAction='DRAFT',
            figureReview='Historical C2-profilo.svg in final package, editorial asset and Git5d1d are byte-identical, including the Base64 payload. Parabolic Bezier and arrow tips reread/rendered. Caption explicitly steady, identifies local velocity tips rather than a particle trajectory and the diameter of one section. No assigned velocity scale. Figure is uploaded as a hash-bound asset; the historical edition is retained.')
        byid[key] = revised
    return [byid[key] for key in sorted(byid)]


def report(sources, package=None, bindings=None):
    records = verify(sources, package, bindings)
    return {'schemaVersion': '1.0.0', 'batch': BATCH, 'records': records,
        'verifierSha256': sha(Path(__file__).read_bytes()), 'sourceRef': SOURCE_REF,
        'sourcePath': SOURCE_PATH, 'sourceFileSha256': SOURCE_FILE_SHA256,
        'contractSha256': sha(Path(__file__).with_name('review_contract.py').read_bytes()),
        'acceptedCount': sum(row['ok'] for row in records), 'failedCount': sum(not row['ok'] for row in records),
        'draftReviewedCount': sum(row['publicationAction'] == 'DRAFT' for row in records),
        'failedPublishedEditionIds': sorted(ISSUES),
        'dependencyVersions': {'sympy': sp.__version__, 'pint': pint.__version__},
        'reviewer': 'separate_AI_reviewer_not_original_or_revision_author',
        'originalEditionRetained': True, 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
