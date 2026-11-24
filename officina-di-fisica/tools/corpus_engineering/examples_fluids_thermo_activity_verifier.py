"""Independent AI reading of eight unchanged fluid/thermodynamic examples.

Frozen only after all eight full records and five historical figures were read.
No authoring/answer-key import, human approval, candidate edit, or publication.
"""
from fractions import Fraction
from pathlib import Path

import pint
import sympy as sp

from .pipeline import digest, sha
from .review_contract import reviewed_rows

APP = Path(__file__).resolve().parents[2]
SOURCE_REF = '5d1dc8dc7b601aef959d10d564c75462be74708d'
BATCH = 'examples-fluids-thermo-008'
SOURCE_FILES = {
    'officina-di-fisica/content/C2.json': '7f2d3cf84a46d5d0086fd9cd6318b923ee073febc110a52fbc8f682edd995b23',
    'officina-di-fisica/content/esempi-di-copertura.json': 'a2db79961bac47ce346d482990d1fb47105151d0650de9c4e05c5b7a5e311d82',
    'officina-di-fisica/content/C3.json': '44cb7679671a99a5da654133d4f1c12a542acf1a4688987121bcd5a776a262e0',
}
SOURCE_PATH_BY_ID = {
    **{f'C2-E{i:03}': 'officina-di-fisica/content/C2.json' for i in (18, 19, 20)},
    'C2-E021': 'officina-di-fisica/content/esempi-di-copertura.json',
    **{f'C3-E{i:03}': 'officina-di-fisica/content/C3.json' for i in range(1, 5)},
}
READ_SOURCE_SHA256 = {
    'C2-E018': 'a439a2b83f9150f1b9e5b782d6b137a64cf8cfb5e78dbc36391c310642c1625c',
    'C2-E019': '18604fa37d76e2e7c65dee346bae91d50654ac389c8fa9411ee0d728641952de',
    'C2-E020': '90c4fee9449a31a98818d8fe5e7e08003fd80c6cba97745d03984cfb11dfc464',
    'C2-E021': 'b6f85f460493f2a02e49ebda8dbf931f6b6d81da3ada21943f19ac3f5d550b35',
    'C3-E001': '1578fd4caddc0e8cc1be70cb4a56cf653e359874732c036dd4a7ab19fc188832',
    'C3-E002': '9b704ca7d49711bb847c8d806bb02136c6809fc3ed961bfb7a19edf3451c2c5f',
    'C3-E003': '6bb59b6080db8bb27a2905455ab6fe426753e19e183851d5add6758e3f85a88b',
    'C3-E004': 'fa928103343f9db61c1e361b051cc9a484ae6b3fd91e21e2af30d2c4359bde7d',
}
READ_ASSETS = {
    'C2-reti.svg': '2dbdd5ee675dab5d935061d55a2aa6c63b3a5f616a1ee48da17684ea1af3a377',
    'C2-capillare.svg': '3bd5058865211ddca1631b5195f13e3e0f788681e80720f125762914dc710de2',
    'C2-gocce.svg': '31a831c8b55812ba94ecce576f5afadfbce74989bfae54d681efacf5c3e536ff',
    'C2-traccianti.svg': '6299886015baa1a631f72237d6349b9ddc160bb0319c8d3e905b93038ac65841',
    'C3-rigido.svg': 'c41643ea4e0e5fc86b52a952cc7db66e49e3678d8059ce2321ee5c0577d8eca2',
}
FIGURE_BY_ID = {
    'C2-E018': 'C2-reti.svg', 'C2-E019': 'C2-capillare.svg', 'C2-E020': 'C2-gocce.svg',
    'C2-E021': 'C2-traccianti.svg', 'C3-E002': 'C3-rigido.svg',
}
SI = pint.UnitRegistry(non_int_type=Fraction)
REVISION_IDS = {'C3-E003'}
# Frozen after reading the final v2 package, bindings and fully rendered SVG.
REVIEWED_REVISIONS = {'C3-E003': '6129f38c1d63ac06abb338abc3b9ff7cbc74f2001c2257f1d4905aff74953e43'}


def check(claim, actual, expected, unit=''):
    if isinstance(actual, SI.Quantity):
        actual = sp.Rational(actual.to(unit).magnitude)
    residual = sp.simplify(actual-expected)
    return {'claim': claim, 'independentExact': str(actual), 'expectedValue': str(expected),
            'unit': unit, 'dimension': {str(k): str(v) for k, v in SI.Unit(unit).dimensionality.items()},
            'relation': 'exact', 'residual': str(residual), 'ok': residual == 0}


def rounded(claim, actual, printed, quantum, unit):
    result = check(claim, actual, printed, unit)
    rounded_value = sp.floor(actual/quantum+sp.Rational(1, 2))*quantum
    result.update(relation='reported_precision_nearest_half_up', roundingQuantum=str(quantum),
                  independentlyRounded=str(rounded_value), ok=rounded_value == printed)
    return result


def independent_checks():
    Q = SI.Quantity
    R = sp.Rational
    pressure = Q(12, 'kPa')
    flow1 = pressure/Q(3, 'kPa*s/mL')
    flow2 = pressure/Q(6, 'kPa*s/mL')
    radius = Q(Fraction(1, 2), 'mm').to('m')
    tension = Q(Fraction(9, 125), 'N/m')
    density, gravity = Q(1000, 'kg/m**3'), Q(10, 'm/s**2')
    height = (2*tension/(density*gravity*radius)).to('m')
    h, r, gamma, rho, g = sp.symbols('h r gamma rho g', positive=True)
    capillary_h = sp.solve(sp.Eq(2*sp.pi*r*gamma, rho*g*sp.pi*r**2*h), h)[0]
    # Independent surface-energy virtual work for sphere: dp=d(gamma*A)/dV.
    surface = 4*sp.pi*r**2
    volume = 4*sp.pi*r**3/3
    drop_laplace = sp.simplify(sp.diff(gamma*surface, r)/sp.diff(volume, r))
    film_laplace = sp.simplify(sp.diff(2*gamma*surface, r)/sp.diff(volume, r))
    droplet = (2*Q(Fraction(3, 100), 'N/m')/Q(2, 'mm')).to('Pa')
    bubble = 2*droplet
    local_change = ((Q(Fraction(3, 10), 'm/s')-Q(Fraction(9, 50), 'm/s'))/Q(3, 's')).to('m/s**2')
    # A local probe derivative is not necessarily a material acceleration.
    x, t = sp.symbols('x t', real=True)
    trial_velocity = R(9, 50)+t/25+x
    material = sp.diff(trial_velocity, t)+trial_velocity*sp.diff(trial_velocity, x)
    final_kelvin = sp.Rational(Q(26, 'degC').to('K').magnitude)
    initial_kelvin = sp.Rational(Q(18, 'degC').to('K').magnitude)
    pressure_t = sp.Function('p')(t)
    constant_volume = sp.Symbol('V0', positive=True)
    pv_work = sp.integrate(pressure_t*sp.diff(constant_volume, t), (t, 0, 1))
    energy, heat, work = sp.symbols('delta_U Q W', real=True)
    heat_only = sp.solve(sp.Eq(energy, heat-work).subs(work, 0), heat)[0]
    n, gas_constant, temperature, p = Q(Fraction(1, 50), 'mol'), Q(Fraction(4157, 500), 'J/(mol*K)'), Q(300, 'K'), Q(100, 'kPa')
    sample_volume = (n*gas_constant*temperature/p).to('L')
    exact_liters = sp.Rational(sample_volume.magnitude)
    initial_abs = Q(40, 'kPa')+Q(100, 'kPa')
    final_abs = initial_abs*Q(330, 'K')/Q(300, 'K')
    result = {
        'C2-E018': [check('portata ramo1', flow1, 4, 'mL/s'), check('portata ramo2', flow2, 2, 'mL/s'),
            check('continuita nodo', flow1+flow2, 6, 'mL/s'),
            check('resistenza equivalente', pressure/(flow1+flow2), 2, 'kPa*s/mL'),
            check('rapporto inverso delle resistenze', R(flow1.to('mL/s').magnitude)/R(flow2.to('mL/s').magnitude), 2),
            check('somma conduttanze', R(1, 3)+R(1, 6), R(1, 2), 'mL/(kPa*s)')],
        'C2-E019': [check('raggio SI', radius, R(1, 2000), 'm'),
            check('Jurin da equilibrio delle forze', capillary_h-2*gamma/(rho*g*r), 0, 'm'),
            check('altezza modello colonna', height, R(18, 625), 'm'),
            check('conversione centimetri', height, R(72, 25), 'cm'),
            check('raggio doppio altezza dimezzata', height/2, R(9, 625), 'm'),
            rounded('risalita circa2,9cm', R(72, 25), R(29, 10), R(1, 10), 'cm')],
        'C2-E020': [check('singola interfaccia da lavoro virtuale', drop_laplace-2*gamma/r, 0, 'Pa'),
            check('due interfacce limite film sottile', film_laplace-4*gamma/r, 0, 'Pa'),
            check('sovrapressione goccia', droplet, 30, 'Pa'), check('sovrapressione film sottile', bubble, 60, 'Pa'),
            check('rapporto due interfacce', R(bubble.magnitude)/R(droplet.magnitude), 2)],
        'C2-E021': [check('incremento velocita locale', Q(Fraction(3, 10)-Fraction(9, 50), 'm/s'), R(3, 25), 'm/s'),
            check('variazione locale MEDIA da sonda fissa', local_change, R(1, 25), 'm/s**2'),
            check('controesempio convettivo distinto', (material-sp.diff(trial_velocity, t)).subs({x:0, t:R(3, 2)}), R(6, 25), 'm/s**2')],
        'C3-E001': [check('temperatura finale assoluta', final_kelvin, R(5983, 20), 'K'),
            check('temperatura iniziale assoluta', initial_kelvin, R(5823, 20), 'K'),
            check('incremento K', final_kelvin-initial_kelvin, 8, 'K'),
            rounded('temperatura a un decimo', final_kelvin, R(1496, 5), R(1, 10), 'K')],
        'C3-E002': [check('volume rigido variazione simbolica', sp.diff(constant_volume, t), 0, 'm**3/s'),
            check('integrale pressione per velocita confine', pv_work, 0, 'J'),
            check('primo principio senza altre forme lavoro', heat_only-energy, 0, 'J')],
        'C3-E003': [check('pressione assoluta SI', p, 100000, 'Pa'),
            check('volume esatto con R8,314', sample_volume, R(12471, 25000), 'L'),
            check('conversione volume SI', sample_volume, R(12471, 25000000), 'm**3'),
            check('uguaglianza ESATTA stampata senza arrotondamento dichiarato', exact_liters/1000, R(499, 1000000), 'm**3'),
            check('rapporto una mole campione', 1/R(1, 50), 50),
            rounded('volume riportato a tre cifre in L', exact_liters, R(499, 1000), R(1, 1000), 'L'),
            rounded('volume riportato a tre cifre in m3', exact_liters/1000, R(499, 1000000), R(1, 1000000), 'm**3')],
        'C3-E004': [check('pressione iniziale assoluta', initial_abs, 140, 'kPa'),
            check('rapporto temperature assolute', R(330, 300), R(11, 10)),
            check('pressione finale assoluta', final_abs, 154, 'kPa'),
            check('pressione finale relativa', final_abs-Q(100, 'kPa'), 54, 'kPa'),
            check('incremento lettura manometro', final_abs-initial_abs, 14, 'kPa')],
    }
    for item in result['C3-E002']:
        item['relation'] = 'symbolic_conceptual_identity_no_student_numeric_calculation'
    return result


MANUAL = {
    'C2-E018': '12/3=4 e12/6=2mL/s;totale6mL/s;Req12/6=2kPa*s/mL. Anche1/3+1/6=1/2(mL/(kPa*s)),inverso2. Non sommare resistenze parallele.',
    'C2-E019': '0,50mm=1/2000m;2gamma=0,144=18/125N/m;rho*g*r=1000*10/2000=5;h=(18/125)/5=18/625m=0,0288m=2,88cm,circa2,9cm. r doppio dimezza h. Pi cancella fra bordo2pi*r e area pi*r².',
    'C2-E020': '2mm=1/500m;gamma3/100N/m;2gamma/R=(6/100)*500=30Pa. Due interfacce quasi stessoR raddoppiano a60Pa. Gas dentro liquido:una sola interfaccia,30Pa a stessi dati.',
    'C2-E021': '0,30-0,18=0,12=3/25m/s;dividere per3s dà1/25=0,040m/s²,variazione temporale locale media. Non si media arbitrariamente la velocita A perché la storia fra gli estremi non è assegnata;0,24m/s appartiene alla media temporale indicata perB.',
    'C3-E001': '26+273,15=299,15K;al decimo299,2K.18+273,15=291,15K;differenza8K,riportata8,0K. Offset273,15 cancella nella differenza,non si aggiunge a8.',
    'C3-E002': 'Nessun calcolo numerico richiesto allo studente:classificare il confine chiuso e rigido. Controllo fisico simbolico effettivo:V costante⇒dV/dt=0⇒integrale p(dV/dt)dt=0. Solo SE mancano altre forme di lavoro,DeltaU=Q;rigido non significa isolato né esclude da solo lavoro elettrico o di agitazione.',
    'C3-E003': 'n=1/50mol;nT=300/50=6mol*K;6*8,314=49,884J. Dividere per100000Pa dà0,00049884m³;moltiplicare per1000 dà0,49884L. A tre cifre0,499L perché0,4985<0,49884<0,4995. Una mole è50volte0,0200mol. Nessuna calcolatrice richiesta,solo moltiplicazione per6 e potenze10.',
    'C3-E004': 'piass=40+100=140kPa;330/300=11/10;140*11/10=154kPa. Manometro154-100=54kPa;incremento54-40=14kPa. 40*11/10=44 sarebbe errore perché usa pressione relativa nel rapporto.',
}
ASSUMPTIONS = {
    'C2-E018': 'Resistenze lineari assegnate,collegamento parallelo agli stessi due nodi,liquido incomprimibile e regime stazionario senza perdite di massa:stessa dp sui rami e somma delle portate al nodo.',
    'C2-E019': 'Modello standard di Jurin:equilibrio statico,tubo cilindrico sottile,bagno ampio,stessa atmosfera,theta0,superficie bagnante,gravita e tensione uniformi;si usa la colonna equivalente e si trascura il piccolo contributo geometrico del menisco. Altezza numerica del modello e risultato finale approssimato,non soluzione esatta della forma Young-Laplace completa.',
    'C2-E020': 'Superfici sferiche con tensione gamma uniforme;per il film sottile le due curvature hanno raggi pressoché uguali come assegnato. Differenza positiva interno-esterno;non si confonde bolla di sapone a due facce con bolla di gas nel liquido a una faccia.',
    'C2-E021': 'Sonda allo stesso punto:il rapporto finito è media della variazione temporale locale su3s,non necessariamente accelerazione materiale o derivata istantanea. Filamento A compatibile con laminare,non prova universale;perB fluttuazioni/volute sostengono turbolenza. Media stabile può accompagnare stazionarieta statistica ma da sola non dimostra invarianti tutti i momenti e correlazioni.',
    'C3-E001': 'Scala Celsius e kelvin differiscono di offset esatto273,15;incrementi stessa ampiezza. Letture al decimo e risultato finale arrotondato al decimo;non si attribuisce precisione fisica addizionale all offset.',
    'C3-E002': 'Sistema gas,recipiente sigillato e rigido:nessun flusso di materia e nessun lavoro di espansione. Fonte rende esplicita la condizione per attribuire energia al calore:riscaldamento dal bagno e assenza altre forme lavoro. Non deduce isolamento dalla chiusura.',
    'C3-E003': 'Modello gas perfetto dichiarato nella soluzione per campione diluito,pressione ASSOLUTA100kPa,temperatura300K,n costante. R8,314J/(mol*K) è il valore numerico assegnato dalla soluzione. Il numero finale sarebbe corretto arrotondato a tre cifre,ma la fonte NON dichiara questa convenzione e presenta una uguaglianza non esatta.',
    'C3-E004': 'Modello gas perfetto della sezione,serbatoio rigido e chiuso quindi V,n costanti,stati in equilibrio termico a T note;pressione atmosferica100kPa mantenuta per entrambe le letture. La legge proporzionale usa pressioni e temperature assolute.',
}
PEDAGOGY = {
    'C2-E018': 'Individua ramo meno resistente con piu portata e Req inferiore a ciascunaR;distinzione dal disegno superiore in serie,caption seleziona esplicitamente riga inferiore.',
    'C2-E019': 'Bordo circolare sostiene peso colonna,pi cancella,altezza inversa al raggio. r non diametro;conversione mm prima del calcolo. Approssimazione2,9cm esplicita e manualmente verificata.',
    'C2-E020': 'Conta interfacce prima dei fattori2/4;pressione cresce all interno. Segno circa per film coerente con raggi solo pressoché uguali;spessore disegnato ampliato è dichiarato.',
    'C2-E021': 'Separa laminare/turbolento da stazionario/nonstazionario;non scambia media lunga con valore istantaneo né derivata euleriana locale con materiale. Non attribuisce automaticamente adA media0,24 da soli estremi.',
    'C3-E001': 'Temperatura assoluta diversa da incremento;kelvin senza simbolo grado,segnoDeltaT positivo,offset si cancella solo nella sottrazione. Arrotondamento299,2 è esplicitamente indicato.',
    'C3-E002': 'Concettuale ma verificato fisicamente:chiuso non è isolato,rigido vieta WpV ma non qualunque lavoro. Allargando sistema a bagno+gas lo scambio interno cambia classificazione,non sparisce energia.',
    'C3-E003': 'FAIL ORIGINALE:nessun arrotondamento/cifre significative dichiarato nel materiale studente;uguale davanti a4,99e-4 non coincide con0,00049884m³ ricavato dai dati. Il circa finale riguarda il confronto con una mole,non il risultato. La stima0,499L sarebbe corretta con≈ o contesto esplicito,ma il reviewer non può aggiungerlo retroattivamente. Calcolo fattibile a mano,non un problema di calcolatrice.',
    'C3-E004': 'Pressione atmosferica aggiunta PRIMA del rapporto e sottratta DOPO.10% è crescita della pressione assoluta,non della lettura relativa;incremento del manometro14kPa,non4kPa.',
}
FIGURE_REVIEW = {
    'C2-E018': 'Caption sceglie rete parallela inferiore:entrambi i rami uniscono gli stessi due nodi,punti pieni corretti;rete superiore serie distinta da etichetta. Lunghezze/resistenze non in scala metrica.',
    'C2-E019': 'Menisco concavo e risalita sopra livello esterno,stessa atmosfera esplicita,h verticale. Schema qualitativo:forma quadratica e larghezza non misurano angolo0 o rapporto numerico h/r;nessuna scala dichiarata.',
    'C2-E020': 'Goccia piena con una circonferenza;film con due circonferenze e aria interna. Caption dichiara spessore ampliato:non si deduce errore di raggi dal disegno schematico.',
    'C2-E021': 'TubiA/B etichettati,filamento sottile ordinato contro volute e ramificazioni;immagine non fornisce tempi o velocita misurabili e caption rinvia alla sonda temporale.',
    'C3-E002': 'Recipiente tappato a pareti fisse immerso nel bagno,Q entra dall esterno,gas chiuso/Vcostante chiaramente distinti. Freccia calore non è moto di materia;nessun pistone in movimento.',
}


def verify_originals(sources, asset_root=None):
    missing = set(READ_SOURCE_SHA256)-set(sources)
    if missing:
        raise ValueError('Missing independently read fluid/thermo examples: '+','.join(sorted(missing)))
    asset_root = Path(asset_root) if asset_root is not None else APP/'static/figures'
    models, records = independent_checks(), []
    for key in sorted(READ_SOURCE_SHA256):
        row, errors = sources[key], []
        if row.get('kind') != 'example' or digest(row) != READ_SOURCE_SHA256[key]:
            errors.append('Source differs from the independently read original example')
        refs = {'/figures/'+FIGURE_BY_ID[key]} if key in FIGURE_BY_ID else set()
        if {b['src'] for b in row.get('blocks', []) if b.get('type') == 'figure'} != refs:
            errors.append('Figure references differ from the independently read original')
        assets = {}
        for src in refs:
            name = src.removeprefix('/figures/')
            file = asset_root/name
            actual = sha(file.read_bytes()) if file.is_file() else 'MISSING'
            assets[src] = actual
            if actual != READ_ASSETS[name]:
                errors.append('Historical scientific figure changed or missing')
        checks = models[key]
        if not all(c['ok'] for c in checks):
            errors.append('Independent original-example model failed')
        if key == 'C3-E003':
            errors.append('Original presents a rounded numerical equality without declaring approximation or precision; a new edition is required')
        path = SOURCE_PATH_BY_ID[key]
        records.append({'id': key, 'sourceSha256': digest(row), 'sourceVersion': row.get('version', 1),
            'sourceRef': SOURCE_REF, 'sourcePath': path, 'sourceFileSha256': SOURCE_FILES[path],
            'ok': not errors, 'errors': errors, 'checks': checks,
            'dimension': {c['claim']: c['dimension'] for c in checks},
            'calculationScope': 'NO_STUDENT_CALCULATION' if key == 'C3-E002' else 'EXACT_MANUAL_CALCULATION',
            'manualArithmetic': MANUAL[key], 'manualFeasibility': 'FAIL_ORIGINAL_EDITION' if key == 'C3-E003' else 'PASS_AI_CONCEPTUAL' if key == 'C3-E002' else 'PASS_AI_EXACT',
            'physicalAssumptions': ASSUMPTIONS[key], 'pedagogicalReview': PEDAGOGY[key],
            'assetChecksums': assets, 'figureReview': FIGURE_REVIEW.get(key, 'No figure in this original record'),
            'verificationMode': 'INDEPENDENT_EXISTING_EDITION', 'failedPublishedEdition': key == 'C3-E003',
            'originalEditionRetained': True, 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'})
    return records


def revised_gas_checks():
    """Re-derive every numeric stage from the newly assigned model values."""
    Q = SI.Quantity
    R = sp.Rational
    n, temperature = Q(Fraction(1, 50), 'mol'), Q(300, 'K')
    constant, pressure = Q(Fraction(4157, 500), 'J/(mol*K)'), Q(100, 'kPa')
    product = (n*constant*temperature).to('J')
    volume = (product/pressure).to('L')
    exact = R(volume.magnitude)
    checks = [check('quantita di sostanza frazionaria', n, R(1, 50), 'mol'),
        check('pressione SI', pressure, 100000, 'Pa'),
        check('semplificazione nT', n*temperature, 6, 'mol*K'),
        check('prodotto nRT senza arrotondare', product, R(12471, 250), 'J'),
        check('volume SI senza arrotondare', volume, R(12471, 25000000), 'm**3'),
        check('volume litri esatto nel modello', volume, R(12471, 25000), 'L'),
        check('frazione e decimale equivalenti', R(49884, 100000), R(12471, 25000), 'L'),
        rounded('stima dichiarata tre cifre', exact, R(499, 1000), R(1, 1000), 'L'),
        check('errore arrotondamento dichiarato', R(499, 1000)-exact, R(1, 6250), 'L'),
        check('mezzo millilitro in litri', Q(Fraction(1, 2), 'mL'), R(1, 2000), 'L'),
        check('proporzionalita volume una mole', 1/R(n.magnitude), 50)]
    checks.append({'claim': 'limiti manuali interi per arrotondamento',
        'independentExact': '49850 <= 49884 < 49950; 1/6250 < 1/2000',
        'expectedValue': 'within nearest-0.001-L rounding interval; error below 0.5 mL',
        'unit': '', 'dimension': {}, 'relation': 'exact_integer_and_fraction_bounds',
        'ok': bool(49850 <= 49884 < 49950 and R(1, 6250) < R(1, 2000))})
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
    reviewed = reviewed_rows(package, bindings, REVIEWED_REVISIONS, REVISION_IDS, root)
    by_id = {row['id']: row for row in originals}
    for row, binding, signature, assets, errors in reviewed:
        key = row['id']
        original = by_id[key]
        if (binding['sourceRef'] != SOURCE_REF or binding['sourceId'] != key
                or binding['sourceSha256'] != original['sourceSha256']
                or original['sourceSha256'] != READ_SOURCE_SHA256[key]):
            errors.append('Revision not bound to the independently read original')
        if (row.get('kind') != 'example' or 'answer' in row
                or type(row.get('version')) is not int or type(row.get('baseVersion')) is not int
                or row['version'] != original['sourceVersion']+1
                or row['baseVersion'] != original['sourceVersion']):
            errors.append('Expected additive next example edition with correct base version and no answer key')
        checks = revised_gas_checks()
        if not all(claim['ok'] for claim in checks):
            errors.append('Independent revised gas-model calculation failed')
        revised = dict(original)
        revised.update(ok=not errors, errors=errors, checks=checks,
            dimension={claim['claim']: claim['dimension'] for claim in checks},
            manualArithmetic='NEW DRAFT: n=1/50mol;nT=300/50=6mol*K;8314*6=49884⇒nRT49,884J.100kPa=100000Pa;J/Pa=m³. V=49,884/100000m³=4,9884e-4m³=0,49884L=12471/25000L. Optional three significant figures is EXPLICITLY approximate:0,499L.49850≤49884<49950 proves nearest0,001L;error1/6250L=0,00016L<1/2000L=0,5mL.',
            manualFeasibility='PASS_AI_EXACT', calculationScope='EXACT_MANUAL_CALCULATION',
            physicalAssumptions='NEW DRAFT explicitly assigns ideal-gas model, absolute p100kPa/T300K,n0,0200mol and R8,314J/(mol*K) for arithmetic. Exactness is relative to these model numbers,not infinite precision of a real measurement or the gas constant. No transformation path is inferred from a state calculation.',
            pedagogicalReview='Independently read entire new edition: exact fraction/decimal precede OPTIONAL explicitly marked approximation. It supplies the multiplication algorithm, SI/volume conversions and integer rounding bounds;student need not infer precision from an undeclared equality. Unit-error counterexamples have correct direction. The failed historical judgment remains separate.',
            assetChecksums=assets, candidateSha256=digest(row), reviewedSignature=signature,
            candidateVersion=row['version'], baseVersion=row['baseVersion'],
            failedPublishedEdition=True, publishedEditionReview=original, reviewedEdition='NEW_DRAFT',
            verificationMode='EXACT_ORACLE', publicationAction='DRAFT',
            figureReview='Three full stages independently read and rendered: ideal gas with assigned absolute p/T and n1/50mol;100kPa→100000Pa,nRT49,884J,J/Pa=m³;exact0,49884L then≈0,499L with three significant figures. Vessel explicitly schematic/not to scale,all labels within viewBox;no geometric measurement inferred.')
        by_id[key] = revised
    return [by_id[key] for key in sorted(by_id)]


def report(sources, package=None, bindings=None):
    records = verify(sources, package, bindings)
    return {'schemaVersion': '1.0.0', 'batch': BATCH, 'records': records,
        'verifierSha256': sha(Path(__file__).read_bytes()), 'sourceRef': SOURCE_REF,
        'sourcePaths': list(SOURCE_FILES), 'sourceFileSha256ByPath': SOURCE_FILES,
        'contractSha256': sha(Path(__file__).with_name('review_contract.py').read_bytes()),
        'acceptedCount': sum(r['ok'] for r in records), 'failedCount': sum(not r['ok'] for r in records),
        'draftReviewedCount': sum(row['publicationAction'] == 'DRAFT' for row in records), 'failedPublishedEditionIds': ['C3-E003'],
        'dependencyVersions': {'sympy': sp.__version__, 'pint': pint.__version__},
        'reviewer': 'separate_AI_reviewer_not_original_or_revision_author', 'originalEditionRetained': True,
        'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
