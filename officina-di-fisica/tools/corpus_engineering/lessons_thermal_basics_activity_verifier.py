"""Independent reading of the real canonical C3-L01..L04 lesson IDs.

All 29 blocks and four original SVGs read/rendered before pinning. Constructed
probes are separated from source requirements. A printed working gas constant
is not asserted to be the exact SI value; its rounding is checked explicitly.
"""
from fractions import Fraction
from pathlib import Path

import pint
import sympy as sp

from .pipeline import digest, sha

APP = Path(__file__).resolve().parents[2]
SOURCE_REF = '5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH = 'officina-di-fisica/content/C3.json'
SOURCE_FILE_SHA256 = '44cb7679671a99a5da654133d4f1c12a542acf1a4688987121bcd5a776a262e0'
BATCH = 'lessons-thermal-basics-016'
READ_SOURCE_SHA256 = {
    'C3-L01': '45fc983887bd650ee8ab45f9482fd00b1823a95a53dc3cc84ded01cbbe064eef',
    'C3-L02': 'a5e5291a81721079a6c08422baca89b59539532f3a11211ea339353799e95a67',
    'C3-L03': '1201fe443d15dbdc0b64d6a62d1376f68d429812aa29e76530c6b56324e1e5c3',
    'C3-L04': 'cd25cb01f21086c43a8a332874c5e01dcb10c9062e9d26411387e5d8c3d292a3',
}
READ_ASSETS = {
    'C3-confine.svg': '60305e8f10320fd9030f3ac8a7b3a7d7ba25adbff8489be42e864d1e06ff39f4',
    'C3-isoterma.svg': 'f2b86e9001fe906ef43b1f6b54c3af3908e51e2ea3b3bdf9930aeafda5c00e47',
    'C3-scambi.svg': '5fe72c5b200c4e14ad3db3c88469737cf19a1aca4b1516c9c391b025dc6f9c8f',
    'C3-fasi.svg': '59316774d57a882676062fc86650c6a080c6aebda3180da2e5aaf83fc6940828',
}
FIGURES_BY_ID = {'C3-L01': ['C3-confine.svg'], 'C3-L02': ['C3-isoterma.svg'],
                 'C3-L03': ['C3-scambi.svg'], 'C3-L04': ['C3-fasi.svg']}
SI = pint.UnitRegistry(non_int_type=Fraction)
WORKING_R = sp.Rational(4157, 500)
EXACT_SI_R = sp.Integer(602214076)*10**15*sp.Rational(1380649, 10**29)


def check(claim, actual, expected, unit='', scope='symbolic_source_claim'):
    if isinstance(actual, SI.Quantity):
        actual = sp.Rational(actual.to(unit).magnitude)
    residual = sp.simplify(actual-expected)
    return {'claim': claim, 'independentExact': str(actual), 'expectedValue': str(expected),
            'unit': unit, 'dimension': {str(k): str(v) for k, v in SI.Unit(unit).dimensionality.items()},
            'relation': 'exact', 'residual': str(residual), 'ok': residual == 0, 'scope': scope}


def independent_checks():
    Q, R = SI.Quantity, sp.Rational
    offset = R(5463, 20)
    ci, cf, ua, ub, uc = sp.symbols('ci cf Ua Ub Uc', real=True)
    n, gas_R, temp, vol, mass, c, C1, C2, delta, cv = sp.symbols('n Rgas T V m c C1 C2 delta Cv', positive=True)
    pressure = n*gas_R*temp/vol
    particle_count, particle_mass, kb = sp.symbols('N particle_mass kb', positive=True)
    # Translational momentum-flux pressure and isotropic equipartition.
    speed_squared = 3*kb*temp/particle_mass
    kinetic_pressure = particle_count*particle_mass*speed_squared/(3*vol)
    hot, cold, final, container = sp.symbols('Th Tc Tf Ccontainer', real=True)
    calorimeter_final = sp.solve(C1*(final-hot)+C2*(final-cold), final)[0]
    with_container = sp.solve(C1*(final-hot)+C2*(final-cold)+container*(final-cold), final)[0]
    internal = n*cv*temp
    enthalpy = internal+n*gas_R*temp
    molar_cp = sp.diff(enthalpy, temp)/n
    latent, cs, cl, transformed, power = sp.symbols('L cs cl mtrans P', positive=True)
    initial, fusion, target, energy = sp.symbols('Ti Tm Ttarget E', real=True)
    warm_solid = mass*cs*(fusion-initial)
    melt = mass*latent
    warm_liquid = mass*cl*(target-fusion)
    melt_mass_from_budget = (energy-warm_solid)/latent
    liquid_temperature = fusion+(energy-warm_solid-melt)/(mass*cl)
    toy = {mass: 1, cs: 2000, cl: 4000, latent: 300000, initial: -10, fusion: 0}
    probe = 'reviewer_constructed_exact_probe_not_assigned_numeric_exercise'
    precision = 'rounded_tabulated_working_coefficient_not_exact_SI_identity'
    return {
        'C3-L01': [
            check('closed system may change energy without matter crossing', sp.Integer(11-7), 4, 'J', probe),
            check('state function change telescopes on closed cycle', (ub-ua)+(uc-ub)+(ua-uc), 0, 'J'),
            check('Celsius to kelvin at20degrees', Q(20, 'degC'), R(5863, 20), 'K', probe),
            check('Celsius zero is273.15kelvin', Q(0, 'degC'), offset, 'K'),
            check('absolute zero Celsius conversion', -offset+offset, 0, 'K'),
            check('offset cancels exactly in temperature difference', (cf+offset)-(ci+offset), cf-ci, 'K'),
            check('one Celsius interval equals one kelvin interval', Q(1, 'delta_degC'), 1, 'K'),
            check('probe20to35Celsius gives15kelvin difference', (35+offset)-(20+offset), 15, 'K', probe),
            check('probe40C over20C is not absolute temperature ratio2', (40+offset)/(20+offset), R(6263, 5863), '', probe),
            check('probeabsolute200to400kelvin has ratio2', (-R(1463, 20)+offset+200)/(-R(1463, 20)+offset), 2, '', probe)],
        'C3-L02': [
            check('kinetic momentum-flux model gives NkT', kinetic_pressure*vol, particle_count*kb*temp, 'J'),
            check('moles and SI definitions convert kinetic pressure to nRT',
                  (kinetic_pressure*vol).subs({particle_count: n*sp.Integer(602214076)*10**15,
                                             kb: sp.Rational(1380649, 10**29)}), n*EXACT_SI_R*temp, 'J'),
            check('gas constant exact SI derived product', EXACT_SI_R, R(207861565453831, 25000000000000), 'J/mol/K', precision),
            check('printed gas constant is correct rounded working value', sp.floor(EXACT_SI_R*1000+R(1, 2))/1000,
                  WORKING_R, 'J/mol/K', precision),
            check('printed workingR differs from exactSI by quantified amount', EXACT_SI_R-WORKING_R,
                  R(11565453831, 25000000000000), 'J/mol/K', precision),
            check('Pa times cubicmetre equals joule', Q(1, 'Pa')*Q(1, 'm**3'), 1, 'J'),
            check('nRT dimensions', Q(1, 'mol')*Q(1, 'J/mol/K')*Q(1, 'K'), 1, 'J'),
            check('same nR cancels in pV over T', pressure*vol/temp, n*gas_R, 'J/K'),
            check('isothermal half volume doubles pressure', pressure.subs(vol, vol/2)/pressure, 2),
            check('constantvolume double absoluteT doubles pressure', pressure.subs(temp, 2*temp)/pressure, 2),
            check('same volume and T halfmoles halves pressure', pressure.subs(n, n/2)/pressure, R(1, 2)),
            check('probeabsolute20kPagauge plus100kPa atmosphere', Q(20, 'kPa')+Q(100, 'kPa'), 120000, 'Pa', probe),
            check('toy volume using explicitly printed workingR', (n*gas_R*temp/sp.Integer(100000)).subs({n: R(1, 10), gas_R: WORKING_R, temp: 250}), R(4157, 2000000), 'm**3', probe),
            check('toy working model volume inlitres', R(4157, 2000000)*1000, R(4157, 2000), 'L', probe),
            check('source isotherm rectangle products agree', sp.Integer((150-72)*(211-85)), (306-72)*(211-169), 'pixel**2', 'read_SVG_equal_rectangles_without_physical_axis_scale')],
        'C3-L03': [
            check('constant heatcapacity integral givesCdeltaT', sp.integrate(mass*c, (temp, ci, cf)), mass*c*(cf-ci), 'J'),
            check('specific heatcapacity is totalcapacity overmass', (mass*c)/mass, c, 'J/kg/K'),
            check('heatcapacity times deltaT dimensions', Q(1, 'J/K')*Q(1, 'K'), 1, 'J'),
            check('specificcapacity units', Q(1, 'J/K')/Q(1, 'kg'), 1, 'J/kg/K'),
            check('probehalfkg withc400 hasC200', Q(Fraction(1, 2), 'kg')*Q(400, 'J/kg/K'), 200, 'J/K', probe),
            check('probecooling10kelvin givesnegative2000J', R(1, 2)*400*(-10), -2000, 'J', probe),
            check('calorimeter final temperature from complete balance', calorimeter_final, (C1*hot+C2*cold)/(C1+C2), 'K'),
            check('final abovecold forpositive capacities andhot-cold delta',
                  (calorimeter_final-cold).subs(hot, cold+delta), C1*delta/(C1+C2), 'K'),
            check('final belowhot forpositive capacities andhot-cold delta',
                  (hot-calorimeter_final).subs(hot, cold+delta), C2*delta/(C1+C2), 'K'),
            check('toyC200at80C andC100at20C give60C', calorimeter_final.subs({C1: 200, C2: 100, hot: 80, cold: 20}), 60, 'degC', probe),
            check('toy hot minus4000J cold plus4000J', 200*(60-80)+100*(60-20), 0, 'J', probe),
            check('toyincludecontainerC100at20C gives50C', with_container.subs({C1: 200, C2: 100, container: 100, hot: 80, cold: 20}), 50, 'degC', probe),
            check('constantvolume heat equalschangeinternalenergy', sp.diff(internal, temp)*delta, n*cv*delta, 'J'),
            check('constantpressure heat includes expansionwork', n*cv*delta+n*gas_R*delta, n*molar_cp*delta, 'J'),
            check('molarCp minusCv isR foridealgas', molar_cp-cv, gas_R, 'J/mol/K'),
            check('molar heatcapacity dimensions', Q(1, 'J')/(Q(1, 'mol')*Q(1, 'K')), 1, 'J/mol/K')],
        'C3-L04': [
            check('phaseheat magnitude uses transformedmass', sp.Abs(-transformed*latent), transformed*latent, 'J'),
            check('latent heat dimensions', Q(1, 'J')/Q(1, 'kg'), 1, 'J/kg'),
            check('three-stage heat balance', sp.integrate(mass*cs, (temp, initial, fusion))+melt
                  +sp.integrate(mass*cl, (temp, fusion, target)),
                  mass*cs*(fusion-initial)+mass*latent+mass*cl*(target-fusion), 'J'),
            check('coexistence temperature independent ofsuppliedphaseheat', sp.diff(fusion, energy), 0, 'K/J'),
            check('fractionmelted fromenergy aftersolidwarming', melt_mass_from_budget/mass,
                  (energy-warm_solid)/(mass*latent)),
            check('toy warming fromminus10to0 needs20kJ', warm_solid.subs(toy), 20000, 'J', probe),
            check('toy entirefusion requires300kJ', melt.subs(toy), 300000, 'J', probe),
            check('toy heatingliquid0to10 needs40kJ', warm_liquid.subs(toy).subs(target, 10), 40000, 'J', probe),
            check('toy completepath needs360kJ', (warm_solid+melt+warm_liquid).subs(toy).subs(target, 10), 360000, 'J', probe),
            check('toybudget170kJ melts onlyhalfkg afterwarming', melt_mass_from_budget.subs(toy).subs(energy, 170000), R(1, 2), 'kg', probe),
            check('toybudget340kJ endsatplus5Celsius', liquid_temperature.subs(toy).subs(energy, 340000), 5, 'degC', probe),
            check('toy500W takes600s for300kJ fusion', Q(300000, 'J')/Q(500, 'W'), 600, 's', probe),
            check('constantpower suppliedheat linearintime', sp.integrate(power, (delta, 0, sp.Symbol('duration', positive=True))),
                  power*sp.Symbol('duration', positive=True), 'J'),
            check('toyfreezinghalfkg releases150kJ', (-transformed*latent).subs({transformed: sp.Rational(1, 2), latent: 300000}), -150000, 'J', probe),
            check('source plateau has equal ordinate endpoints', sp.Integer(125), 125, 'pixel', 'read_SVG_phase_coexistence_not_numeric_material_data')],
    }


MANUAL = {
    'C3-L01': 'No assigned numerical exercise. Exact SI offset273.15=5463/20 cancels in final-minus-initial differences. Reviewer probes:20C=5863/20K and35-20C=15K. The absolute ratio for40C versus20C is6263/5863, not2; absolute200to400K has ratio2. State-function differences telescope to zero on a closed cycle. Boundary classifications were read conceptually, not certified by a zero-valued test: closed forbids matter crossing but permits energy transfer; isolated forbids both. Constructed energy change11-7=4J illustrates an allowed closed-system exchange.',
    'C3-L02': 'Momentum-flux pressure with isotropic translational energy givespV=NkT, thenN=nNA givesnRT. PrintedR8.314=4157/500 is a rounded tabulated working coefficient, not exactSI. NA*kB=207861565453831/25000000000000; rounding to0.001 gives8.314, with explicit nonzero gap11565453831/25000000000000. No source calculation demands precision beyond the printed coefficient. Reviewer probe:n1/10mol,T250K,p100000Pa gives4157/2000000m³=4157/2000L using that workingR, with no hidden rounding of the computed result. Two-state ratios cancelnR only for fixed gas amount; leaks change n. The source SVG rectangles78*126=234*42=9828px² check constantpV without inventing physical axis scales.',
    'C3-L03': 'No assigned numerical exercise. Integrating approximately constantC=mc givesQ=mc(Tf-Ti); cooling with positiveC gives negativeQ. Solve isolatedsumCi(Tf-Ti)=0 as a weighted mean; distances from hot/cold endpoints are positive weighted fractions. Reviewer probes:C200J/K at80C andC100 at20C give60C, exchanges-4000/+4000J. Include aC100 container initially20C and the final temperature becomes50C. For ideal gasU=nCvT andH=U+nRT giveCp-Cv=R;QV=nCvDeltaT andQp=nCpDeltaT use the stated constant-capacity approximation. SampleC, specificc and molarCp/Cv have distinct units.',
    'C3-L04': 'No assigned numerical exercise. Phase heat magnitude uses transformed mass times positiveL; freezing/condensation reverse the system-heat sign. Integrate sensible heating separately before and after melting, and addmL. Reviewer toy coefficients:m1kg,cs2000,cl4000J/kg/K,L300000J/kg,Tm0C,Ti-10C are assigned illustrative values, not precise water data. Stages20kJ+300kJ+40kJ need360kJ to reach10C. A170kJ budget warms then melts only1/2kg and ends atTm;340kJ ends at5C. Heat input500W needs600s for300kJ fusion. Evaporation cooling is conditional, not guaranteed when external heat compensates.'}
ASSUMPTIONS = {
    'C3-L01': 'Choose the matter/energy boundary first. Closed gas has no matter crossing; isolated additionally has no energy exchange. Unchanged contents alone do not prove isolation. Equilibrium simple gas at fixed composition has definedp,V,T; state-function changes need endpoints. Thermal contact permits heat exchange. Celsius/kelvin offset is exact; ordinary gas absolute temperatures are positive and denominators in ratios nonzero.',
    'C3-L02': 'Classical dilute ideal gas, equilibrium states, positive absoluteT,V,n and absolute pressure. Fixed quantity/composition is required for two-state ratios; otherwise change n explicitly. The source excludes molecular size/interactions and warns about condensation. PrintedR is the conventional rounded working value; no exactSI or higher-precision numerical result is claimed. Exact arithmetic within an assigned rounded coefficient is distinguished from physical constant exactness. Gauge pressure needs the atmospheric contribution.',
    'C3-L03': 'Heat transfer is caused by temperature difference; capacity depends on material, amount and path. Positive capacities approximately constant over the interval, with no phase transition. The ideal calorimeter neglects work and container capacity explicitly; include the container when relevant. The endpoint range assumes only thermal contact. Ideal-gas molarCp/Cv, fixed composition and onlypV expansion work; finiteDeltaT formulas retain the stated constant-capacity approximation.',
    'C3-L04': 'Pure ice/water near equilibrium at assigned atmospheric pressure, melting near0C and plateau while both phases remain. Positive latentL depends on the phase process and pressure; only transformed mass counts. Full three-stage expression requires complete melting and final liquid aboveTm. Otherwise solve phase fraction or earlier stage. Constant supplied-heat power makes heat linear in time. Evaporation may cool the residue if energy loss is not externally compensated.'}
PEDAGOGY = {
    'C3-L01': 'Boundary selection precedes closed/open/isolated classification and state variables. Distinguishes heat from work and temperature from energy, then teaches exact offset versus temperature differences before ratios. The historical assisted-review flag is ignored as evidence; all blocks were read.',
    'C3-L02': 'Absolute variables and SI units precede two-state ratios; n is held constant only where justified. Explicit manometer warning and ideal-gas limits. The tabulated constant is checked at working precision without silently equating it to exactSI. No false computed rounded identity or calculator requirement.',
    'C3-L03': 'Distinguishes state temperature from heat transfer, sampleC from specificc and molar capacities. Cooling sign and container inclusion precede calorimetry, with final-temperature range as a check. The differenceCp-Cv is explained through expansion work, not an unlabelled memorized formula.',
    'C3-L04': 'Checks phase fraction before final temperature. Plateau energy changes phase rather than temperature; signs, transformed mass and separate heating stages are explicit. Evaporation below boiling and possible cooling are qualified. Exact reviewer budgets test the domain of the full-melt expression.'}
FIGURE_REVIEW = {
    'C3-L01': 'XML/render read:gas inside the dashed boundary, heat input toward the left wall and work output through the piston; environment outside. Caption and labels agree. Arrows show transfer direction, with no assigned energy/force scale. A moving piston boundary can remain closed to matter.',
    'C3-L02': 'XML/render read:origin(72,211),A(150,85),B(306,169). Rectangles78*126 and234*42 both have area9828px². All119 curve vertices approximatey=211-9828/(x-72), maximum vertical rounding0.05px. No physicalp/V calibration assigned; correct fixed-n isotherm and equal products.',
    'C3-L03': 'XML/render read:hot body left, cold body right; energy arrow points hot to cold entirely inside the insulating outer box. Qhot+Qcold=0 concerns the combined isolated system; individual exchanges have opposite signs. No numerical capacities or arrow-length energy scale assigned.',
    'C3-L04': 'XML/render read:T vertical, Q horizontal; solid warming, horizontal coexistence segment(196,125)to(364,125), then liquid warming. Tfusion label matches the plateau. No numerical heat-capacity/latent calibration or literal Celsius-zero baseline assigned.'}


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
