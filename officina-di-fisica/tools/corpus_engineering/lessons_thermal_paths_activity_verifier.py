"""Independent reading of C3-L05..L08: transport, first law, paths and cycles.

All30 blocks and four original SVGs read/rendered before pins. Exact constructed
probes and symbolic extensions are distinguished from actual student requests.
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
BATCH = 'lessons-thermal-paths-017'
READ_SOURCE_SHA256 = {
    'C3-L05': 'e5d6023249016be7b946a4f39d56500a074b24c91a52f6dc83ff270eb593ee8b',
    'C3-L06': '786a58a1fdd9690ef30134a8b61dc46dbe24afe66933bad555853c50c173c727',
    'C3-L07': '54b71deb97e5651a0dfbdd7db4eb6ab02707ef1d9613bdc3b7c2acfcea612d82',
    'C3-L08': 'ba1507cbec7061182e0c2e2c8c4a33a3f33cc9293200870a8a0aa017b6761b14',
}
READ_ASSETS = {
    'C3-parete.svg': 'c7241066dc2e892527868cecb8fa7cbb1c14a2771b080d6c17b3edaf2ed4346f',
    'C3-bilancio.svg': '0e2f94b8ca3e6ee11ccd8e3d0cc40d77782dca7a43315db6928fa6259035a815',
    'C3-percorsi.svg': '3bf54a3478de1a5cc2c30b33268d91d49456b432af41d5df7b0bdd2560edb85f',
    'C3-ciclo.svg': '84d1b1fb87683ae92240d45760932a7a844a5e01da70037130d703d64690cb03',
}
FIGURES_BY_ID = {'C3-L05': ['C3-parete.svg'], 'C3-L06': ['C3-bilancio.svg'],
                 'C3-L07': ['C3-percorsi.svg'], 'C3-L08': ['C3-ciclo.svg']}
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
    area, thick, conductivity, Th, Tc, epsilon, sigma = sp.symbols('A s lambda Th Tc epsilon sigma', positive=True)
    x, shift = sp.symbols('x shift', real=True)
    slab_temperature = Th+(Tc-Th)*x/thick
    conducted = -conductivity*area*sp.diff(slab_temperature, x)
    radiation = epsilon*sigma*area*(Th**4-Tc**4)
    pext, Vi, Vf, n, cv, gas_R, Ti = sp.symbols('pext Vi Vf n Cv Rgas Ti', positive=True)
    volume = sp.Symbol('V', positive=True)
    work = sp.integrate(pext, (volume, Vi, Vf))
    particle_mass, drift, thermal_speed = sp.symbols('m drift u', real=True)
    pair_kinetic = particle_mass*((drift+thermal_speed)**2+(drift-thermal_speed)**2)/2
    center_kinetic = particle_mass*drift**2
    internal_translation = sp.expand(pair_kinetic-center_kinetic)
    gamma = 1+gas_R/cv
    isotherm_pressure = n*gas_R*Ti/volume
    adiabatic_temperature = Ti*(Vi/volume)**(gas_R/cv)
    adiabatic_pressure = n*gas_R*adiabatic_temperature/volume
    pi = n*gas_R*Ti/Vi
    friction, distance, speed = sp.symbols('friction distance speed', positive=True)
    p_high, p_low, v_large, v_small = sp.symbols('ph pl Vl Vs', positive=True)
    expanded = sp.integrate(p_high, (volume, v_small, v_large))
    compressed = sp.integrate(p_low, (volume, v_large, v_small))
    cycle_work = sp.factor(expanded+compressed)
    Ua, Ub, Uc, Ud, Sa, Sb, Sc, Sd = sp.symbols('Ua Ub Uc Ud Sa Sb Sc Sd', real=True)
    probe = 'reviewer_constructed_exact_probe_not_assigned_numeric_exercise'
    return {
        'C3-L05': [
            check('linear steady slab hot endpoint', slab_temperature.subs(x, 0), Th, 'K'),
            check('linear steady slab cold endpoint', slab_temperature.subs(x, thick), Tc, 'K'),
            check('Fourier gradient gives stated positive conducted power', conducted, conductivity*area*(Th-Tc)/thick, 'W'),
            check('steady heat current constant through slab', sp.diff(conducted, x), 0, 'W/m'),
            check('thermal conductivity units', Q(1, 'W/m/K')*Q(1, 'm**2')*Q(1, 'K')/Q(1, 'm'), 1, 'W'),
            check('double thickness halves power', conducted.subs(thick, 2*thick)/conducted, R(1, 2)),
            check('double area and thickness leaves power unchanged', conducted.subs({area: 2*area, thick: 2*thick})/conducted, 1),
            check('toy slab lambda0.5 A2 delta20 s0.1 gives200W', conducted.subs({conductivity: R(1, 2), area: 2, Th: 320, Tc: 300, thick: R(1, 10)}), 200, 'W', probe),
            check('slab10cm converts to0.1m', Q(10, 'cm'), R(1, 10), 'm'),
            check('toy buoyancy density contrast can drive natural convection', (1000-990)*10*R(1, 1000), R(1, 10), 'N', probe),
            check('radiation coefficient gives power units', Q(1, 'W/m**2/K**4')*Q(1, 'm**2')*Q(1, 'K')**4, 1, 'W'),
            check('equal absolute temperatures cancel net radiation', radiation.subs(Th, Tc), 0, 'W'),
            check('body twice ambient absoluteT gives15ambient emission units net', radiation.subs(Th, 2*Tc), 15*epsilon*sigma*area*Tc**4, 'W'),
            check('emitted power itself scales by16 on doubled absoluteT', (epsilon*sigma*area*(2*Th)**4)/(epsilon*sigma*area*Th**4), 16),
            check('arbitrary temperature origin changes fourth power difference',
                  sp.diff(epsilon*sigma*area*((Th+shift)**4-(Tc+shift)**4), shift).subs(shift, 0),
                  4*epsilon*sigma*area*(Th**3-Tc**3), 'W/K'),
            check('radiative net power changes sign on swapping temperatures', radiation.subs({Th: Tc, Tc: Th}, simultaneous=True), -radiation, 'W')],
        'C3-L06': [
            check('microscopic kinetic energy excludes coherent translation', internal_translation, particle_mass*thermal_speed**2, 'J'),
            check('internal translation energy independent of center velocity', sp.diff(internal_translation, drift), 0, 'kg*m/s'),
            check('external constant pressure work from volume integral', work, pext*(Vf-Vi), 'J'),
            check('force displacement equals pressure times swept volume', (pext*area)*(Vf-Vi)/area, pext*(Vf-Vi), 'J'),
            check('actual source kPa litre identity', Q(1, 'kPa')*Q(1, 'L'), 1, 'J'),
            check('toy expansion2kPa times3L gives6J', Q(2, 'kPa')*Q(3, 'L'), 6, 'J', probe),
            check('toy compression2kPa timesminus3L givesminus6J', Q(2, 'kPa')*Q(-3, 'L'), -6, 'J', probe),
            check('toy heat20J and work5J leave deltaU15J', 20-5, 15, 'J', probe),
            check('toy adiabatic compression workminus10J increasesU10J', 0-(-10), 10, 'J', probe),
            check('toy positive heat5J with greater work8J still lowersU', 5-8, -3, 'J', probe),
            check('fixed amount ideal gas equal endpointT giveszero deltaU', n*cv*(Ti-Ti), 0, 'J'),
            check('toy isothermal nonzero heat and work can cancel deltaU', 7-7, 0, 'J', probe)],
        'C3-L07': [
            check('isochoric volume increment makes boundary work zero', work.subs(Vf, Vi), 0, 'J'),
            check('isobaric work is rectangle', sp.integrate(pext, (volume, Vi, Vf)), pext*(Vf-Vi), 'J'),
            check('closed ideal isobaric expansion increases temperature', sp.diff(pext*volume/(n*gas_R), volume), pext/(n*gas_R), 'K/m**3'),
            check('isotherm product is constant nRT', isotherm_pressure*volume, n*gas_R*Ti, 'J'),
            check('reversible isothermal doubling work remains exact log', sp.integrate(isotherm_pressure, (volume, Vi, 2*Vi)), n*gas_R*Ti*sp.log(2), 'J'),
            check('adiabatic temperature solves Cv dT plus RT dV overV zero',
                  n*cv*sp.diff(adiabatic_temperature, volume)+adiabatic_pressure, 0, 'Pa'),
            check('gamma minusone from Cp-Cv relation', gamma-1, gas_R/cv),
            check('adiabatic logarithmic pressure slope is minusgamma', sp.simplify(sp.diff(adiabatic_pressure, volume)*volume/adiabatic_pressure), -gamma),
            check('isothermal logarithmic pressure slope is minusone', sp.diff(isotherm_pressure, volume)*volume/isotherm_pressure, -1),
            check('reversible adiabat pVgamma invariant by derivative',
                  sp.diff(sp.log(adiabatic_pressure)+gamma*sp.log(volume), volume), 0, '1/m**3'),
            check('toy monatomic eightfold expansion temperature quarter',
                  (adiabatic_temperature/Ti).subs({cv: 3*gas_R/2, volume: 8*Vi}), R(1, 4)),
            check('toy same expansion adiabatic pressure one32 versusisothermal one8',
                  (adiabatic_pressure/pi).subs({cv: 3*gas_R/2, volume: 8*Vi}), R(1, 32)),
            check('toy reversibleadiabatic work32kPa1L to1kPa8L', R(32-8)/(R(5, 3)-1), 36, 'J', probe),
            check('arbitrarily slow dry friction still dissipates positiveFdistance',
                  sp.limit(friction*speed*(distance/speed), speed, 0, dir='+'), friction*distance, 'J',
                  'reviewer_boundary_probe_slow_does_not_imply_reversible')],
        'C3-L08': [
            check('upper pressure expansion work positive coefficient', expanded, p_high*(v_large-v_small), 'J'),
            check('lower pressure compression work has opposite sign', compressed, -p_low*(v_large-v_small), 'J'),
            check('clockwise cycle integral equals enclosed rectangle', cycle_work, (p_high-p_low)*(v_large-v_small), 'J'),
            check('reversed cycle negates net work', -expanded-compressed, -(p_high-p_low)*(v_large-v_small), 'J'),
            check('internal energy differences telescope over cycle', (Ub-Ua)+(Uc-Ub)+(Ud-Uc)+(Ua-Ud), 0, 'J'),
            check('fluid entropy differences telescope over cycle', (Sb-Sa)+(Sc-Sb)+(Sd-Sc)+(Sa-Sd), 0, 'J/K'),
            check('toy rectangle3minus1kPa and4minus1L gives6J', Q(3-1, 'kPa')*Q(4-1, 'L'), 6, 'J', probe),
            check('toy separate expansion9J compressionminus3J', 3*(4-1)+1*(1-4), 6, 'J', probe),
            check('toy heatin10J heatout7J givesnet3J not10J', 10-7, 3, 'J', probe),
            check('toy cyclic deltaU zero whennetheat equalsnetwork', (10-7)-3, 0, 'J', probe),
            check('toy reservoirs entropy canincrease despitefluidcyclezero', -R(10, 600)+R(7, 300), R(1, 150), 'J/K', probe),
            check('source drawn rectangle has area246times91', sp.Integer((418-172)*(156-65)), 22386, 'pixel**2', 'read_SVG_geometry_not_assigned_energy_scale')],
    }


MANUAL = {
    'C3-L05': 'No assigned numerical exercise. A linear steady slab profile gives Fourier power-lambda*A*dT/dx=lambda*A(Th-Tc)/s. Double thickness halves power; double area and thickness cancel. Reviewer toy:lambda1/2W/(mK),area2m²,deltaT20K,s1/10m gives200W. Density contrast1000minus990kg/m³ over1L in assignedg10 gives upwardbuoyancy1/10N as a possible natural-convection driver. Radiation uses absolute fourth powers: equalbody/environmentT givesnetzero, doubledbodyT versusunchangedambient gives15ambient emissionunits net, whileemissionalone scales16. Shifting the arbitrary temperature origin changes the expression; Celsius cannot replacekelvin.',
    'C3-L06': 'No assigned numerical task apart from the printed exact unitidentity1kPa*1L=1J. Decompose two particle velocities drift±thermal to separate coherenttranslation frominternalthermalenergy. Pressurework followsconstantp_ext integral inV, orforcep_ext*A times displacementDeltaV/A. Reviewer probes:2kPa over±3L gives±6J;Q20,W5 givesdeltaU15J;adiabaticcompressionW-10 givesdeltaU+10J. PositiveheatQ5 withwork8 still givesdeltaU-3,soheatinput contribution alone isnot a guaranteeofwarming. FixedcompositionidealgaswithsameendpointT returnsU,even ifnonzeroQ andWcancel.',
    'C3-L07': 'No assigned numerical calculator exercise. Isochore giveszero boundarywork;isobaricidealexpansionraisesT. Reversibleisotherm integratesnRT/V toexactnRTln2 forvolume doubling;source doesnot demandadecimal log. AdiabaticQ0 andpositiveCv givecooling ifWoutpositive. IntegratingCv*dT+RT*dV/V=0 yieldsTV^(R/Cv) constant andpV^gamma invariant,gamma1+R/Cv>1. Adiabaticlogarithmicslope-gamma issteeperthanisothermal-1. Reviewer toy monatomicgamma5/3,eightfoldV yieldsT/4,p/32 instead ofisothermp/8;32kPa1L to1kPa8L gives36Jwork. FrictionF overdistanceD dissipatesFD even as speedtendszero,so slowalone isnotreversible.',
    'C3-L08': 'No numerical axisvalues assigned. IntegrateupperexpansionpHigh(Vl-Vs) andlowercompression-pLow(Vl-Vs);verticalsegments givezero. Clockwisework is(pressuregap)(volumegap),reversalnegatesit. U andfluidS differences telescope tozero overcycle;thisdoesnot implyzerouniverseentropy. Reviewer toy rectangle3/1kPa and4/1L gives9J-3J=6J. Heat10Jin and7Jout givesnet3J andcyclicwork3J,not10J. Reservoirs600/300K withthoseheats haveentropychange1/150J/K despitefluidSreturning. DrawnSVGarea22386px² hasnoassignedJcalibration.'}
ASSUMPTIONS = {
    'C3-L05': 'One-dimensional homogeneous slab,positiveconstant/effectiveconductivity,steadyfixedfacetemperatures,negligiblelateral losses,positiveelapsedtime. Th>Tc fixespositiveconductedpower. Naturalconvectionneedsgravityanddensitycontrast;not everyhotparcelnecessarilyrises. Greybodyconstantemissivity[0,1] inlargeisothermalenclosure,absolute temperatures,netoutward sign. Absorption/emissionmaybothnonzerowhilenetzero. Electromagnetictransportdoesnotneedmaterialmedium.',
    'C3-L06': 'Closed gas thermodynamic model with internalenergy accounting andnochangesofmacroscopickinetic/potentialenergy. Qpositivein,Wpositiveout,totalworkfirstlaw;subsequentpistonexpressionisexternalpVboundaryworkunderconstantp_ext. p_extisthemechanicalpressureopposingthegasboundary,not anarbitraryinternalbulkpressureinrapidnonequilibrium. Anyadditionalmacroscopicenergy/workmode needs itsownbookkeeping. Fixedamount/compositionidealgasforU(T);quasistaticmechanicalequilibrium requiredforinternalpVpatharea,as explicitlystated.',
    'C3-L07': 'EquilibriumstatesalongquasistaticpVpaths. Closedfixedcompositionidealgas,positiveT,V,n andpositiveheatcapacities. Reversibleadiabaticpowerlawadditionallyconstantmolarcapacitiesandnodissipation;Q0alone isnot sufficientforpVgamma. Isothermalreversibleexpansionrequirescompensatingheat;rapidpathneednot haveuniforminternalp. Slowmotionwithfrictioncanstillbeirreversible,as sourcenotes. Symbolicln2 is anexactresultofareviewerextension,not ademandeddecimalanswer.',
    'C3-L08': 'Closedfluidreturns tosamecompleteequilibriumstate;U andSarestatefunctions,whileheat/workarepathdependent. Quasistaticmechanicallyequilibratedpressurevolume work;simpleclockwiserectanglewithpHigh>pLow andVl>Vs. Netheat meanssignedsum,notonlyabsorbedheat. FluidcycleS0doesnotimplyreversibilityofsystemplusenvironment. Axisscalesneededfornumericalarea;originaldiagramhasnoassignedphysicalscale.'}
PEDAGOGY = {
    'C3-L05': 'ConditionsprecedeFourierlaw,distinguishessteadytemperaturefromzeroheatflow andforcedfromnaturalconvection. Grey-enclosureconditionandabsoluteTprecederadiationformula;netbalance andorigin-dependencewarningarecorrect.',
    'C3-L06': 'Choosesthegas systemandseparatesinternalfromwhole-bodykineticenergy. Q/Wsignconventionprecedesequation;externalpressureworkandSIunits precedepVarea. Rapidnonequilibriumwarningpreventsassigninganarbitraryuniforminternalpressure. IdealU(T)propertyiscircumscribed.',
    'C3-L07': 'Constraintsselectpaths,thenworkandthermalconsequencesfollow. Explicitlydistinguishesquasistaticfromreversiblethroughfriction andqualifiesadiabaticpowerlaw. No numericlogorunassignedtrigonometricsteprequired.',
    'C3-L08': 'Separatesstatefunctionreturnfromnonzerocyclictransfers. Expandsathigherpressurethancompression,soorientedareaandworksigndefined. Netheatnotabsorbedheat,endsnotpath,andscalescheckedbeforemeasurement.'}
FIGURE_REVIEW = {
    'C3-L05': 'XML/renderread:hotleftface,coldrightface,energyarrowrightwardthroughslab;thicknesssmeasuredalongpropagationbetweenfacesx215/420. Steadylegendcorrect. No numericalthermalconductivity/temperature/geometry scaleassigned.',
    'C3-L06': 'XML/renderread:leftQarrowintobox,rightWarrowoutofbox andDeltaU=Q-Wlabelcorrect. SimilararrowlengthsdonotassignQ=W;onlyreference signs. No numericenergy scale.',
    'C3-L07': 'XML/renderread:commonA(167,86),verticalisochore,horizontalisobar,twoexpansioncurvesstartingatA. Atallsharedlaterabscissasadiabaticcurvehaslowerpressurethanisotherm;bothdecreaseandstaypositiveaboveaxis. No numericalgamma/pressure/volume scaleassigned;thecomparisonisqualitative.',
    'C3-L08': 'XML/renderread:Aupperleft,Bupperright,Clowerright,Dlowerleft. Toparrowright,rightarrowdown,bottomarrowleft,leftarrowup formclockwisecycle. VerticallegsconstantV,upperlegexpansionandlowerlegcompressioncorrect. Rectangle246x91px;physicalenergycannotbecomputedwithoutp/Vscales.'}


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
