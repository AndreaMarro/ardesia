"""Independent review of the two remaining real C3 lessons, L09 and L10.

All15 blocks and two SVGs read/rendered before pins. Exact symbolic logarithms
are not compulsory decimal tasks; constructed probes are explicitly labelled.
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
BATCH = 'lessons-thermal-second-law-019'
READ_SOURCE_SHA256 = {
    'C3-L09': 'aea4c6724c1f14307b97b8e2ca64b622d2a35248ef29f02f2c72b3212d22b214',
    'C3-L10': 'd129e867749b91c95d0d0f7af9daa0179ccc38ba033dd3d1a7cad66bb011ab74',
}
READ_ASSETS = {
    'C3-macchina.svg': 'd731c50778f96cbb5e0038adb43ee4196ed99af557dece4c7de381d1485fb193',
    'C3-entropia.svg': '8d95c2e3952150bb1a206ee74e61635e13fa841522aa1a06383d736ed49c7782',
}
FIGURES_BY_ID = {'C3-L09': ['C3-macchina.svg'], 'C3-L10': ['C3-entropia.svg']}
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
    qh, qc, Th, Tc, production = sp.symbols('Qh Qc Th Tc Sgen', positive=True)
    work = qh-qc
    eta = work/qh
    carnot = 1-Tc/Th
    # Reservoir entropy gives the universal two-source bound, not an assumed
    # formula fitted to a particular ideal-gas cycle.
    solved_qc = sp.solve(qc/Tc-qh/Th-production, qc)[0]
    eta_from_balance = sp.simplify(eta.subs(qc, solved_qc))
    va, vb, gas_R, n, gamma_minus_one = sp.symbols('Va Vb Rgas n gminus1', positive=True)
    volume_factor = (Th/Tc)**(1/gamma_minus_one)
    vc, vd = vb*volume_factor, va*volume_factor
    reversible_qh = n*gas_R*Th*sp.log(vb/va)
    reversible_qc = n*gas_R*Tc*sp.log(vc/vd)
    temperature, ti, tf, capacity = sp.symbols('T Ti Tf C', positive=True)
    entropy_integral = sp.integrate(capacity/temperature, (temperature, ti, tf))
    finite_final = sp.solve(capacity*(temperature-400)+capacity*(temperature-100), temperature)[0]
    finite_entropy = capacity*sp.log(finite_final/400)+capacity*sp.log(finite_final/100)
    kb, omega_i, omega_f = sp.symbols('kb Oi Of', positive=True)
    particles = sp.Symbol('N', integer=True, positive=True)
    biased_entropy = -kb*(R(3, 4)*sp.log(R(3, 4))+R(1, 4)*sp.log(R(1, 4)))
    probe = 'reviewer_constructed_exact_probe_not_assigned_numeric_exercise'
    boundary = 'reviewer_boundary_probe_excluded_by_source_conditions'
    return {
        'C3-L09': [
            check('engine work from signed heat balance', work, qh-qc, 'J'),
            check('efficiency divides work by absorbed heat', sp.cancel(eta), 1-qc/qh),
            check('engine efficiency dimensionless', Q(3, 'J')/Q(6, 'J'), R(1, 2)),
            check('Carnot gap follows nonnegative total reservoir entropy', carnot-eta_from_balance,
                  Tc*production/qh),
            check('reversible zero production recovers Carnot', eta_from_balance.subs(production, 0), carnot),
            check('same reservoir temperatures give zero Carnot efficiency', carnot.subs(Tc, Th), 0),
            check('positive cold temperature makes Carnot smaller than one', 1-carnot, Tc/Th),
            check('two reversible adiabats preserve isotherm volume ratio', sp.cancel(vc/vd), vb/va),
            check('reversible isotherm heats have temperature ratio', sp.simplify(reversible_qc/reversible_qh), Tc/Th),
            check('toy source600K and300K boundonehalf', carnot.subs({Th: 600, Tc: 300}), R(1, 2), '', probe),
            check('toy6Jin3Jout giveswork3J and efficiencyonehalf', R(6-3, 6), R(1, 2), '', probe),
            check('toy6Jin4Jout givesreal-efficiencyonethird', R(6-4, 6), R(1, 3), '', probe),
            check('toy higherthanCarnot engine has negative reservoir entropy', -R(6, 600)+R(2, 300), -R(1, 300), 'J/K', boundary),
            check('toy single bath complete cyclic heat-to-work removes entropy', -R(6, 600), -R(1, 100), 'J/K', boundary),
            check('toy noncyclic isothermal expansion can compensate bathentropy', R(6, 600)-R(6, 600), 0, 'J/K', boundary),
            check('toy fridge cold3J plusinputwork3J delivers6Jhot', sp.Integer(3+3), 6, 'J', probe),
            check('toy reversible fridge reservoir entropy balances', -R(3, 300)+R(6, 600), 0, 'J/K', probe),
            check('using Celsius would give wrong600K300K limit',
                  1-(300-R(5463, 20))/(600-R(5463, 20)), R(2000, 2179), '', boundary)],
        'C3-L10': [
            check('reservoirs receive opposite heats at own temperatures', -qh/Th+qh/Tc,
                  qh*(Th-Tc)/(Th*Tc), 'J/K'),
            check('equal reservoir temperature reversible limit', (-qh/Th+qh/Tc).subs(Tc, Th), 0, 'J/K'),
            check('entropy units joule per kelvin', Q(1, 'J')/Q(1, 'K'), 1, 'J/K'),
            check('toy hot reservoir losesone100JperK', -R(6, 600), -R(1, 100), 'J/K', probe),
            check('toy cold reservoir gainsone50JperK', R(6, 300), R(1, 50), 'J/K', probe),
            check('toy hot-to-cold total entropy positiveone100', -R(6, 600)+R(6, 300), R(1, 100), 'J/K', probe),
            check('toy unassisted inverse conserves energy but decreases total entropy',
                  R(6, 600)-R(6, 300), -R(1, 100), 'J/K', boundary),
            check('varying-temperature reversible reference integral', entropy_integral, capacity*sp.log(tf/ti), 'J/K'),
            check('toy equal finite capacities400K100K equilibrate250K', finite_final, 250, 'K', probe),
            check('toy finite-body entropy stays exact log25over16', sp.expand_log(finite_entropy, force=True),
                  capacity*sp.log(R(25, 16)), 'J/K', probe),
            check('statistical entropy difference is log microstate ratio',
                  kb*sp.log(omega_f)-kb*sp.log(omega_i), kb*sp.log(omega_f/omega_i), 'J/K'),
            check('independent microstate counts make entropy additive',
                  sp.expand_log(kb*sp.log(omega_i*omega_f)), kb*sp.log(omega_i)+kb*sp.log(omega_f), 'J/K'),
            check('two equally probable states giveklog2 from Gibbs formula',
                  -kb*(R(1, 2)*sp.log(R(1, 2))+R(1, 2)*sp.log(R(1, 2))), kb*sp.log(2), 'J/K'),
            check('biased two-state entropy differs fromklogOmega', sp.expand_log(biased_entropy),
                  kb*(2*sp.log(2)-R(3, 4)*sp.log(3)), 'J/K', boundary),
            check('uniform minus biased entropy is positive log27over16 quarter',
                  kb*sp.log(2)-biased_entropy, kb*sp.log(R(27, 16))/4, 'J/K', boundary),
            check('doubling ideal configuration volume perparticle givesNklog2',
                  kb*sp.log(2**particles), particles*kb*sp.log(2), 'J/K', probe),
            check('ten independent particles all in one compartment probability',
                  R(2, 1)**(1-10), R(1, 512), '', probe),
            check('many-particle probability of one occupied compartment tendszero',
                  sp.limit(2**(1-particles), particles, sp.oo), 0),
        ],
    }


MANUAL = {
    'C3-L09': 'No assigned numerical exercise. Signed engine heat givesW=Qh-Qc andeta=1-Qc/Qh. ReservoirSgen=Qc/Tc-Qh/Th yieldsetaCarnot-eta=Tc*Sgen/Qh>=0. Reversibleadiabats of a Carnot ideal-gas realization makeVc/Vd=Vb/Va, so reversibleisotherm logarithms cancel andQc/Qh=Tc/Th. Reviewer probes:600/300K givebound1/2;heat6Jin3Jout giveswork3J,eta1/2;4Jout giveseta1/3. A would-be6Jin2Jout engine would lowerreservoirentropy1/300J/K. A fridge canmove3J fromcold with3Jwork anddeliver6Jhot. Celsius substitution wouldgive2000/2179,not1/2. Symboliclogarithms cancel;no studentdecimal evaluation is required.',
    'C3-L10': 'No assigned decimal calculation. ForreservoirtransferQ,DeltaStotal=Q(Th-Tc)/(ThTc)>0 whenTh>Tc>0. Reviewer6J from600to300K giveshot-1/100,cold+1/50,total+1/100J/K;unassistedinverse givesnegative1/100 despiteenergyconservation. Forfiniteconstantcapacities oneintegratesC/T;equalcapacities at400/100K end250K withDeltaS=C*ln(25/16)>0,not a singlearbitraryT denominator. Statisticaldifferencescombineexactlogratios. Equiprobabletwo-stateS=kb*ln2;biased3/4,1/4 probabilities insteadgivekb(2ln2-3ln3/4),strictlysmallerbecause27>16. DoublingaccessiblevolumeforNindependentidealparticles givesNkBln2;all-in-onecompartment probability2^(1-N) is1/512for10andvanishesforlargeN. Theseareconstructedprobes,notrequirednumbers.'}
ASSUMPTIONS = {
    'C3-L09': 'Cyclic heat engine between only two fixed-temperature reservoirs,0<Tc<Th,Qh>0,Qc>=0 andW>=0,withnoothernetresourceoruncompensatedeffect. Qh/Qc arepositive magnitudes,not signed systemheats. ReversibleCarnot uses twoisotherms andtwoadiabats;generalboundfromisolatedsystem+environmententropy. Equaltemperatures givezerobound. A refrigeratorreceiveswork andisnot a heatengine towhich positive-outputeta is applied. Temperaturesabsolute;Celsiusnot permitted inratio.',
    'C3-L10': 'Combinedsystemandenvironmentisolated fornonnegative totalentropy;localpartmayloseentropy. Positiveabsolutetemperatures. Qrev belongs toanauxiliaryreversiblepath betweenendstates,not necessarilyactualirreversibleheat. Q/T appliesdirectlytofixed-Treservoir orreversibleisothermalprocess;temperaturevariation needsintegral. BoltzmannlnOmega assumesaccessiblemicrostatesequiprobable,explicitinsource. Independentclassicalidealparticlecompartment probes areillustrations,not auniversalstatecountforinteractingorquantumgas.'}
PEDAGOGY = {
    'C3-L09': 'Definesheatmagnitudesandcycleresourceboundarybeforeefficiency;Kelvin-PlanckandClausiusbothincludeuniqueeffectqualification. Refrigeratorworkinputavoidsspuriouscounterexample. CarnotconstraintsandabsoluteTprecedeformula;doesnotclaimallwork/heatprocessesarecyclicengines.',
    'C3-L10': 'Separatesenergyconservationfromspontaneousdirection,localfromtotalentropy,andactualirreversiblepathfromreversiblereference. Explicitfinite-temperaturewarningpreventsQ/arbitraryT. Statisticalformulaisequiprobability-qualified andmany-particleoutcomeisextremelyprobable,not anassertionaboutindividualmicroscopiccertainty. Exactlogsareallowedwithoutinventingdecimalwork.'}
FIGURE_REVIEW = {
    'C3-L09': 'XML/renderread:Qh entersenginefromleft hotreservoir,Qc leavesrighttocold,andWleavesdownward. LabelsQh/Qcaremagnitudes;arrowlengthsaretransportdirections,notscaledenergyvalues. No numericalreservoirtemperatureorheatassigned.',
    'C3-L10': 'XML/renderread:heatQ arrowfromhotlefttocoldright;labelsDeltaSh=-Q/Th andDeltaSc=+Q/Tc useeachfixedreservoirtemperature. No numericalT/Qscale orfinite-objectconstantTassumption introduced;captionexplicitlyreservoirs.'}


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
