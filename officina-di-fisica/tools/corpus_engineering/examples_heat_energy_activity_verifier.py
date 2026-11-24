"""Separate AI reading and exact oracles for original C3-E005..C3-E012.

All eight full originals and four historical figures were read before freezing.
No answer-key/authoring import, human approval, candidate edit or publication.
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
BATCH = 'examples-heat-energy-009'
READ_SOURCE_SHA256 = {
    'C3-E005': '2f472491f1b556804b52c3d18fb23e51a6dcbbecaf15c29a89de4f6d00fe86ef',
    'C3-E006': '7ad3ec962ef54c67cab68997e63d0c262097c2dea276895ba5087af396e7e44a',
    'C3-E007': 'f4f2ce4f6b2fb9f43d3968481c952b16cf87c253e4152c46ced94e718922e0c5',
    'C3-E008': '36a1ad47c741cb1cb0a43efcf548cb124aab4997755e35ba30d57f1ce68cf149',
    'C3-E009': '6b6f7518146894926b31cf56c2d1d3ce04aee4b1e76a3f65506276670dc13cb9',
    'C3-E010': '82d1941b1ca2b8aa1d918981217a33c50d18456db52fd89cf384509b2d6d0548',
    'C3-E011': '8de362e53ef8e8ed4e18c9d99591aa31a135b4e2a1057c81fe80173e24b620df',
    'C3-E012': 'ef55d5f9da0b811d4de838a4441b7238ce883310c55f6059601596054d66ab47',
}
READ_ASSETS = {
    'C3-scambi.svg': '5fe72c5b200c4e14ad3db3c88469737cf19a1aca4b1516c9c391b025dc6f9c8f',
    'C3-fasi.svg': '59316774d57a882676062fc86650c6a080c6aebda3180da2e5aaf83fc6940828',
    'C3-parete.svg': 'c7241066dc2e892527868cecb8fa7cbb1c14a2771b080d6c17b3edaf2ed4346f',
    'C3-compressione.svg': 'd5d094fbd32e0532a21a45ab170b8517b10c54f59155ba6793c5de5091945829',
}
FIGURE_BY_ID = {'C3-E005': 'C3-scambi.svg', 'C3-E007': 'C3-fasi.svg',
                'C3-E009': 'C3-parete.svg', 'C3-E011': 'C3-compressione.svg'}
SI = pint.UnitRegistry(non_int_type=Fraction)


def check(claim, actual, expected, unit=''):
    if isinstance(actual, SI.Quantity):
        actual = sp.Rational(actual.to(unit).magnitude)
    residual = sp.simplify(actual-expected)
    return {'claim': claim, 'independentExact': str(actual), 'expectedValue': str(expected),
            'unit': unit, 'dimension': {str(k): str(v) for k, v in SI.Unit(unit).dimensionality.items()},
            'relation': 'exact', 'residual': str(residual), 'ok': residual == 0}


def independent_checks():
    """Build balances from statements, not from the printed solutions."""
    Q, R = SI.Quantity, sp.Rational
    hot_mass, cold_mass = Q(100, 'g').to('kg'), Q(300, 'g').to('kg')
    hot_t = sp.Rational(Q(60, 'degC').to('K').magnitude)
    cold_t = sp.Rational(Q(20, 'degC').to('K').magnitude)
    equilibrium, specific = sp.symbols('T_eq c', positive=True)
    balance = R(hot_mass.magnitude)*specific*(equilibrium-hot_t)+R(cold_mass.magnitude)*specific*(equilibrium-cold_t)
    final_t = sp.solve(sp.Eq(balance, 0), equilibrium)[0]
    calorimeter_total = Q(960, 'J')/Q(4, 'K')
    container_capacity = calorimeter_total-Q(180, 'J/K')
    mass_ice = Q(50, 'g').to('kg')
    latent = Q(334, 'kJ/kg')
    liquid_specific = Q(Fraction(209, 50), 'kJ/(kg*K)')
    melting_heat = mass_ice*latent
    warming_heat = mass_ice*liquid_specific*Q(10, 'K')
    combined_heat = (melting_heat+warming_heat).to('kJ')
    mass_initial = Q(80, 'g').to('kg')
    heat_absorbed = Q(Fraction(501, 50), 'kJ')
    full_melting = mass_initial*latent
    mass_melted = (heat_absorbed/latent).to('kg')
    mass_remaining = mass_initial-mass_melted
    thickness = Q(5, 'mm').to('m')
    conductivity = Q(Fraction(1, 5), 'W/(m*K)')
    area = Q(Fraction(1, 50), 'm**2')
    temperature_drop = Q(32, 'degC').to('K')-Q(22, 'degC').to('K')
    gradient = -temperature_drop/thickness
    conduction_power = (-conductivity*area*gradient).to('W')
    duration = Q(2, 'minute').to('s')
    interface, power = sp.symbols('T_interface P', real=True)
    layers = sp.solve([sp.Eq(40-interface, power*1), sp.Eq(interface-20, power*3)], (interface, power))
    compression_work = Q(80, 'kPa')*(Q(2, 'L')-Q(4, 'L'))
    heat_out = Q(-50, 'J')
    compression_delta_u = heat_out-compression_work
    delta_u = Q(240, 'J')-Q(160, 'J')
    second_heat = delta_u+Q(90, 'J')
    results = {
        'C3-E005': [check('massa acqua calda SI', hot_mass, R(1, 10), 'kg'),
            check('massa acqua fredda SI', cold_mass, R(3, 10), 'kg'),
            check('temperatura equilibrio assoluta', final_t, R(6063, 20), 'K'),
            check('temperatura equilibrio Celsius', Q(Fraction(final_t), 'K').to('degC'), 30, 'degC'),
            check('calore caldo normalizzato a c', R(hot_mass.magnitude)*(final_t-hot_t), -3, 'kg*K'),
            check('calore freddo normalizzato a c', R(cold_mass.magnitude)*(final_t-cold_t), 3, 'kg*K'),
            check('bilancio energia netto', balance.subs(equilibrium, final_t), 0, 'J')],
        'C3-E006': [check('capacita totale', calorimeter_total, 240, 'J/K'),
            check('capacita contenitore', container_capacity, 60, 'J/K'),
            check('energia contenitore', container_capacity*Q(4, 'K'), 240, 'J'),
            check('energia campione', Q(180, 'J/K')*Q(4, 'K'), 720, 'J'),
            check('bilancio totale', (container_capacity+Q(180, 'J/K'))*Q(4, 'K'), 960, 'J')],
        'C3-E007': [check('massa ghiaccio SI', mass_ice, R(1, 20), 'kg'),
            check('energia fusione', melting_heat, R(167, 10), 'kJ'),
            check('energia aumento temperatura', warming_heat, R(209, 100), 'kJ'),
            check('energia totale senza arrotondamenti', combined_heat, R(1879, 100), 'kJ'),
            check('fusione supera riscaldamento', melting_heat-warming_heat, R(1461, 100), 'kJ')],
        'C3-E008': [check('energia per fusione completa', full_melting, R(668, 25), 'kJ'),
            check('margine energia prima di fusione completa', full_melting-heat_absorbed, R(167, 10), 'kJ'),
            check('massa fusa SI', mass_melted, R(3, 100), 'kg'),
            check('massa fusa grammi', mass_melted, 30, 'g'),
            check('massa residua ghiaccio', mass_remaining, 50, 'g'),
            check('conservazione massa totale', mass_melted+mass_remaining, 80, 'g')],
        'C3-E009': [check('spessore SI', thickness, R(1, 200), 'm'),
            check('differenza termica', temperature_drop, 10, 'K'),
            check('gradiente termico', gradient, -2000, 'K/m'),
            check('potenza da Fourier', conduction_power, 8, 'W'),
            check('intervallo secondi', duration, 120, 's'),
            check('energia trasferita', conduction_power*duration, 960, 'J'),
            check('resistenza termica parete', thickness/(conductivity*area), R(5, 4), 'K/W')],
        'C3-E010': [check('resistenza serie', Q(1+3, 'K/W'), 4, 'K/W'),
            check('potenza comune da due bilanci', layers[power], 5, 'W'),
            check('temperatura interfaccia', layers[interface], 35, 'degC'),
            check('caduta primo strato', layers[power]*1, 5, 'K'),
            check('caduta secondo strato', layers[power]*3, 15, 'K'),
            check('ricostruzione faccia fredda', layers[interface]-layers[power]*3, 20, 'degC')],
        'C3-E011': [check('conversione kPa litro', Q(1, 'kPa*L'), 1, 'J'),
            check('variazione volume', Q(2, 'L')-Q(4, 'L'), -2, 'L'),
            check('lavoro uscente gas', compression_work, -160, 'J'),
            check('calore entrante gas', heat_out, -50, 'J'),
            check('variazione energia interna', compression_delta_u, 110, 'J'),
            check('energia meccanica entrante meno calore ceduto', -compression_work-Q(50, 'J'), 110, 'J')],
        'C3-E012': [check('differenza energia interna primo cammino', delta_u, 80, 'J'),
            check('calore secondo cammino', second_heat, 170, 'J'),
            check('stessa energia accumulata secondo cammino', second_heat-Q(90, 'J'), 80, 'J'),
            check('differenza calore', Q(240, 'J')-second_heat, 70, 'J'),
            check('differenza lavoro', Q(160, 'J')-Q(90, 'J'), 70, 'J')],
    }
    exact_heat = R(combined_heat.magnitude)
    rounded_heat = sp.floor(exact_heat*10+R(1, 2))/10
    results['C3-E007'].append({'claim': 'approssimazione esplicita18,8kJ',
        'independentExact': str(exact_heat), 'expectedValue': '18.8', 'unit': 'kJ',
        'dimension': {str(k): str(v) for k, v in SI.Unit('kJ').dimensionality.items()},
        'relation': 'explicit_approximation_nearest_tenth', 'residual': str(exact_heat-R(94, 5)),
        'manualBounds': '18.75 < 18.79 < 18.85', 'ok': rounded_heat == R(94, 5)})
    results['C3-E008'].append({'claim': 'coesistenza acqua ghiaccio in equilibrio',
        'independentExact': '0 < 3/100 kg < 2/25 kg', 'expectedValue': 'partial melting, T=0 degC',
        'unit': 'degC', 'dimension': {'[temperature]': '1'}, 'relation': 'phase_branch_from_exact_energy_and_mass',
        'ok': bool(0 < R(mass_melted.magnitude) < R(mass_initial.magnitude))})
    return results


MANUAL = {
    'C3-E005': '100*60=6000 e300*20=6000;somma12000 divisa per400 dà30C. Fredda sale10K ecalda scende30K;300*10=100*30=3000g*K,quindi calori opposti a pari c.',
    'C3-E006': '960/4=240J/K totali;240-180=60J/K contenitore. Contenitore60*4=240J,campione180*4=720J;240+720=960J.',
    'C3-E007': '50g=1/20kg;334/20=16,7kJ.4,18*10/20=2,09kJ.16,70+2,09=18,79kJ;circa18,8 al decimo perché18,75<18,79<18,85. Nessuna energia per scaldare ghiaccio sotto0C perché la partenza è già0C.',
    'C3-E008': '80g=2/25kg;334*2/25=668/25=26,72kJ.10,02kJ è inferiore;10,02/334=0,03kg perché334*3/100=10,02. Si fondono30g,restano80-30=50g;entrambe le fasi coesistono a0C.',
    'C3-E009': '5mm=1/200m;DeltaT32-22=10K.0,20*0,020*10=0,040W*m;0,040/0,0050=8W.2min=120s;8*120=960J. Rtermica0,005/0,004=5/4K/W;10/(5/4)=8W.',
    'C3-E010': 'Rserie1+3=4K/W;DeltaT40-20=20K;P20/4=5W. Primo salto5*1=5K;interfaccia40-5=35C. Secondo salto5*3=15K e35-15=20C.',
    'C3-E011': '1kPa*L=(1000Pa)*(1/1000m³)=1J. DeltaV2-4=-2L;Wgas80*(-2)=-160J;Qin=-50J;DeltaU=-50-(-160)=110J. Energia entrante160 meno uscente50 dà110;cessione di calore non prova temperatura in discesa.',
    'C3-E012': 'DeltaU240-160=80J. Identici stati finali/iniziali impongono stesso80J lungo altro cammino;Q2=80+90=170J.240-170=70 e160-90=70,controllo delle differenze di calore/lavoro.',
}
ASSUMPTIONS = {
    'C3-E005': 'Sistema chiuso alle due masse,recipiente isolato e capacita trascurabile come assegnato;stessa acqua modellata con uguale c costante nell intervallo,nessuna fase cambia o altra forma significativa di lavoro. Equilibrio finale comune.',
    'C3-E006': 'Campione e contenitore raggiungono uguale incremento termico;capacita costanti nell intervallo4K;960J effettivamente trasferiti ai due,perdite trascurate come richiesto. Non si confonde capacita J/K con calore specifico J/(kg*K).',
    'C3-E007': 'Ghiaccio iniziale0C al punto di fusione del modello conLf334kJ/kg;fusione completa seguita da riscaldamento di acqua liquida0→10C con c assegnato. Nessuna dispersione/contenitore da conteggiare;nessuna fase vapore o riscaldamento sotto0C.',
    'C3-E008': 'Pressione atmosferica esplicita,Lf assegnato,campione iniziale interamente ghiaccio0C,assorbimento netto10,02kJ;equilibrio finale con due fasi pure. L energia non basta a fondere tutto,quindi non si passa al ramo di acqua sopra0C.',
    'C3-E009': 'Conduzione1D stazionaria in lastra piana omogenea,conducibilita costante,facce mantenute a32/22C per2min,effetti laterali/contatti trascurati nel modello di lastra. Si chiede energia trasferita,non aumento della sua energia interna in regime stazionario.',
    'C3-E010': 'Resistenze termiche lineari assegnate in serie,nell ordine esplicito caldoR1=1 poiR2=3;regime stazionario senza accumulo/perdite laterali o resistenza addizionale interfaccia. Stessa potenza attraversa entrambi.',
    'C3-E011': 'ConvenzioneQ entrante,W uscente;compressione di gas chiuso con lavoro di frontiera contro pressione esterna costante80kPa,senza ulteriori modi di lavoro o accumuli meccanici netti del pistone nel modello del bilancio. Nessun bisogno di supporre p interna costante o gas perfetto perDeltaU. Calore uscente non implicaDeltaT negativo.',
    'C3-E012': 'Medesimo sistema chiuso fra identici statiA/B:energia interna è funzione di stato;variazioni macroscopiche cinetiche/potenziali non incluse e soli scambiQ/W della convenzioneQin,Wout. Calore e lavoro sono di cammino,non differenze di stato separatamente.',
}
PEDAGOGY = {
    'C3-E005': 'Media ponderata30C,non media aritmetica40C;piu vicina a20C per capacita tripla. Grammi sono coerenti nel rapporto e si cancellano;usareKelvin darebbe303,15K e stessa30C.',
    'C3-E006': 'Prima capacita totaleQ/DeltaT,poi sottrarre campione. Non attribuisce tutti960J al contenitore;energia ripartita240/720J fornisce controcontrollo.',
    'C3-E007': 'Somma cambiamento di fase e di temperatura,in ordine corretto. Latente non cDeltaT aDeltaT0;energia fusione domina.18,79 è esatto con dati assegnati,18,8 è esplicitamente approssimato nella fonte.',
    'C3-E008': 'Controlla il ramo fisico prima del conto di temperatura;frazione fusa positiva e minore massa iniziale. Anche dopo assorbimento resta0C perché coesistono ghiaccio e acqua;non tutto il calore produceDeltaT.',
    'C3-E009': 'DistingueP8W daenergia960J;converte mm e minuti,usaDeltaT10K anziché temperatureassolute sommate. Verso caldo→freddo;energia espressa come modulo come nella fonte.',
    'C3-E010': 'Ordine delle resistenze conta per l interfaccia,non perPtotale;salto piu grande sullo stratoR3.35C intermedio e ricostruzione20C confermano segni e ordine.',
    'C3-E011': 'Frecce di scambio reale distinte dai segni:Qout50 significaQin−50;workin160 significaWout−160. Sottrarre un negativo dàDeltaU+110. Il titolo raffreddamento indica cessione di calore,non una temperatura finale calcolata o necessariamente minore.',
    'C3-E012': 'Riutilizza soloDeltaU,nonQ oW del primo cammino. CambioW di−70J accompagna cambioQ di−70J mantenendo identico saldo;nessuna conservazione separata di calore.',
}
FIGURE_REVIEW = {
    'C3-E005': 'Due corpi nello stesso involucro isolante,freccia caldo→freddo eQcaldo+Qfreddo0 coerenti. Rettangoli quasi uguali non dichiarano scala di massa/volume;masse100/300 vengono dal prompt,non misurando immagine.',
    'C3-E007': 'Curva genericaTvsQ con ramo solido,plateau solido+liquido e ramo liquido. Caption seleziona partenza sul plateau per ghiaccio già0C;non si include il ramo precedente. Assi senza numeri:lunghezze non codificano rapporto quantitativo16,7/2,09.',
    'C3-E009': 'Faccia calda a sinistra,fredda a destra,freccia potenza attraverso la lastra e spessore perpendicolare alle facce. Geometria schematica senza scalaarea/spessore assegnata;nessun altro flusso disegnato.',
    'C3-E011': 'Calore50J con freccia uscente sinistra,lavoro160J con freccia entrante destra;caption e footerQin/Wout chiariscono entrambi i segni negativi. Lunghezze frecce non sono scala energetica e non vengono lette come50/160.',
}


def verify(sources, asset_root=None):
    missing = set(READ_SOURCE_SHA256)-set(sources)
    if missing:
        raise ValueError('Missing independently read heat/energy examples: '+','.join(sorted(missing)))
    root = Path(asset_root) if asset_root is not None else APP/'static/figures'
    models, records = independent_checks(), []
    for key in sorted(READ_SOURCE_SHA256):
        row, errors = sources[key], []
        if row.get('kind') != 'example' or digest(row) != READ_SOURCE_SHA256[key]:
            errors.append('Source differs from independently read original')
        refs = {'/figures/'+FIGURE_BY_ID[key]} if key in FIGURE_BY_ID else set()
        if {block['src'] for block in row.get('blocks', []) if block.get('type') == 'figure'} != refs:
            errors.append('Historical figure references differ from read original')
        assets = {}
        for src in refs:
            name = src.removeprefix('/figures/')
            file = root/name
            actual = sha(file.read_bytes()) if file.is_file() else 'MISSING'
            assets[src] = actual
            if actual != READ_ASSETS[name]:
                errors.append('Historical scientific figure changed or missing')
        checks = models[key]
        if not all(claim['ok'] for claim in checks):
            errors.append('Independent original-example model failed')
        records.append({'id': key, 'sourceSha256': digest(row), 'sourceVersion': row.get('version', 1),
            'sourceRef': SOURCE_REF, 'sourcePath': SOURCE_PATH, 'sourceFileSha256': SOURCE_FILE_SHA256,
            'ok': not errors, 'errors': errors, 'checks': checks,
            'dimension': {claim['claim']: claim['dimension'] for claim in checks},
            'calculationScope': 'EXACT_MANUAL_CALCULATION', 'manualArithmetic': MANUAL[key],
            'manualFeasibility': 'PASS_AI_EXACT', 'physicalAssumptions': ASSUMPTIONS[key],
            'pedagogicalReview': PEDAGOGY[key], 'assetChecksums': assets,
            'figureReview': FIGURE_REVIEW.get(key, 'No figure in this original record'),
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
        'reviewer': 'separate_AI_reviewer_not_original_author', 'originalEditionRetained': True,
        'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
