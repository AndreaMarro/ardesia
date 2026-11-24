"""Separate AI review of eight unchanged coverage/mechanics/fluid examples.

All eight originals and seven historical SVGs were read before freezing these
hashes. No authoring import, source-key oracle, human approval, or publication.
"""
from fractions import Fraction
from pathlib import Path

import pint
import sympy as sp

from .pipeline import digest, sha

APP = Path(__file__).resolve().parents[2]
SOURCE_REF = '5d1dc8dc7b601aef959d10d564c75462be74708d'
BATCH = 'examples-coverage-fluid-007'
SOURCE_FILES = {
    'officina-di-fisica/content/esempi-di-copertura.json': 'a2db79961bac47ce346d482990d1fb47105151d0650de9c4e05c5b7a5e311d82',
    'officina-di-fisica/content/C2.json': '7f2d3cf84a46d5d0086fd9cd6318b923ee073febc110a52fbc8f682edd995b23',
}
SOURCE_PATH_BY_ID = {
    **{f'C1-E{i:03}': next(iter(SOURCE_FILES)) for i in (21, 22, 23)},
    **{f'C2-E{i:03}': 'officina-di-fisica/content/C2.json' for i in range(13, 18)},
}
READ_SOURCE_SHA256 = {
    'C1-E021': '0bbfaf450aaaabb9b747d2c4df2eb4cc3313ccaee6738ed80d5a8be52a887595',
    'C1-E022': '19eab71b0d29187fc1f45ebe0d25dc2b5096fffaa84bf10f32f49c67f431b833',
    'C1-E023': '06012225cf2d58f0d8f3d6aa13d6c100f35a9e267871ed1d8c7debdad007b9e2',
    'C2-E013': 'd2429ad545a865972e48b9487858fdf809a3dc597b4f70bc1aa7379fd5b82aff',
    'C2-E014': '5455979b993c63820c406ff384abd2d91a05fb5e9e6de3b3809c875eba6628a1',
    'C2-E015': 'd05892d0a7606f82872151b6a972b783759772a525299d9b25c4b5420870d1f5',
    'C2-E016': '720ac627929d830d4ba9f0a1e095bd408305e4716059e39072e523b7ca95879a',
    'C2-E017': '00feaf8c221a572ce7a3db9ad45d8a6cc90150de9135b1d9ff7f0ec94905a722',
}
READ_ASSETS = {
    'C1-porzioni.svg': '7d9cbe10708ac5f8e0edb498d4a7cfc88ca95d98b40f72663d6b7a473afc3a79',
    'C1-pattino-inerziale.svg': 'e2e6c96b33f06ac62f1f4e361af537b46f5db6588028256f68094547c96d73d2',
    'C1-pattinatori.svg': '78bc46058a68d680c29093d58b365d026e5b94d388064b3c544f4793376a81ec',
    'C2-piastre.svg': 'ea3f68a1d20e7e356868c0884ef020ab0dd607a41e237c87e781d4379a9fab1f',
    'C2-profilo.svg': '73907de291ed86769e15e3d90e407b6ee78198524df50a8d456a8101df798b4c',
    'C2-raggio.svg': 'edfcf1d6ba50e668f509b138b751154ce5bf1be7c81ad58561316ae072a02178',
    'C2-reti.svg': '2dbdd5ee675dab5d935061d55a2aa6c63b3a5f616a1ee48da17684ea1af3a377',
}
FIGURE_BY_ID = dict(zip(READ_SOURCE_SHA256, [
    'C1-porzioni.svg', 'C1-pattino-inerziale.svg', 'C1-pattinatori.svg',
    'C2-piastre.svg', 'C2-profilo.svg', 'C2-raggio.svg', None, 'C2-reti.svg',
]))
SI = pint.UnitRegistry(non_int_type=Fraction)


def check(claim, actual, expected, unit=''):
    if isinstance(actual, SI.Quantity):
        actual = sp.Rational(actual.to(unit).magnitude)
    residual = sp.simplify(actual-expected)
    return {'claim': claim, 'independentExact': str(actual), 'expectedValue': str(expected),
            'unit': unit, 'dimension': {str(k): str(v) for k, v in SI.Unit(unit).dimensionality.items()},
            'relation': 'exact', 'residual': str(residual), 'ok': residual == 0}


def independent_checks():
    """Models constructed from each statement; no parsing of supplied solutions."""
    Q = SI.Quantity
    R = sp.Rational
    rho = Q(Fraction(4, 5), 'g/mL')
    mass_a, mass_b = rho*Q(30, 'mL'), rho*Q(70, 'mL')
    force = Q(4, 'N')-Q(4, 'N')
    t = sp.Symbol('t', real=True)
    initial_v = R(4, 5)
    # Constant zero resultant preserves v; integrate rather than assume rest.
    displacement = sp.integrate(initial_v, (t, 0, 3))
    impulse = Q(120, 'N')*Q(Fraction(1, 5), 's')
    velocity_a, velocity_b = -impulse/Q(40, 'kg'), impulse/Q(60, 'kg')
    y, b, c = sp.symbols('y b c', real=True)
    gap = R(1, 500)
    slope = sp.solve([sp.Eq(b, 0), sp.Eq(b+c*gap, R(3, 10))], (b, c))[c]
    couette = slope*y
    stress = Q(Fraction(2, 5), 'Pa*s')*Q(Fraction(slope), '1/s')
    drag = stress*Q(Fraction(1, 50), 'm**2')
    # Independent cylindrical stress balance: eta * dv/dr = -Delta_p*r/(2L).
    radius, outer, eta, pressure, length = sp.symbols('r R eta dp L', positive=True)
    profile = sp.integrate(pressure*radius/(2*eta*length), (radius, radius, outer))
    volume_flow = sp.simplify(2*sp.pi*sp.integrate(profile*radius, (radius, 0, outer)))
    normalized_r = sp.Symbol('q', nonnegative=True)
    local_profile = R(2, 5)*(1-normalized_r**2)
    area_mean = sp.integrate(2*normalized_r*local_profile, (normalized_r, 0, 1))
    flow_ratio = sp.simplify(volume_flow.subs(outer, outer/2)/volume_flow)
    r_si = Q(1, 'mm').to('m')
    l_si = Q(20, 'cm').to('m')
    flow_si = Q(Fraction(1, 2), 'mL/s').to('m**3/s')
    dp_si = Q(1, 'kPa').to('Pa')
    eta_without_pi = r_si**4*dp_si/(8*l_si*flow_si)
    viscosity = sp.pi*sp.Rational(eta_without_pi.to('Pa*s').magnitude)
    q_node, p_node = sp.symbols('q_node p_node', real=True)
    node = sp.solve([sp.Eq(22-p_node, 2*q_node), sp.Eq(p_node-4, 4*q_node)], (q_node, p_node))
    series_flow = (Q(22-4, 'kPa')/(Q(2, 'kPa*s/mL')+Q(4, 'kPa*s/mL'))).to('mL/s')
    result = {
        'C1-E021': [check('aliquota A', mass_a, 24, 'g'), check('aliquota B', mass_b, 56, 'g'),
            check('massa totale conservata', mass_a+mass_b, 80, 'g'),
            check('volume additivo assegnato', Q(30+70, 'mL'), 100, 'mL'),
            check('densita finale', (mass_a+mass_b)/Q(100, 'mL'), R(4, 5), 'g/mL'),
            check('temperatura comune da bilancio termico', (24*22+56*22)/sp.Integer(80), 22, 'degC')],
        'C1-E022': [check('risultante orizzontale', force, 0, 'N'),
            check('variazione velocita', sp.diff(initial_v, t), 0, 'm/s**2'),
            check('velocita finale', initial_v, R(4, 5), 'm/s'),
            check('spostamento integrato', displacement, R(12, 5), 'm'),
            check('spostamento se inizialmente fermo', sp.integrate(0, (t, 0, 3)), 0, 'm')],
        'C1-E023': [check('impulso su B', impulse, 24, 'N*s'),
            check('impulso su A', -impulse, -24, 'N*s'),
            check('velocita A', velocity_a, -R(3, 5), 'm/s'),
            check('velocita B', velocity_b, R(2, 5), 'm/s'),
            check('quantita moto totale', Q(40, 'kg')*velocity_a+Q(60, 'kg')*velocity_b, 0, 'kg*m/s')],
        'C2-E013': [check('spessore SI', Q(2, 'mm'), R(1, 500), 'm'),
            check('profilo soddisfa Couette v secondo nullo', sp.diff(couette, y, 2), 0, '1/(m*s)'),
            check('gradiente', slope, 150, '1/s'), check('sforzo tangenziale', stress, 60, 'Pa'),
            check('forza resistente', drag, R(6, 5), 'N'),
            check('forza con spessore raddoppiato', drag/2, R(3, 5), 'N')],
        'C2-E014': [check('velocita locale a mezzo raggio', local_profile.subs(normalized_r, R(1, 2)), R(3, 10), 'm/s'),
            check('media areale integrata', area_mean, R(1, 5), 'm/s'),
            check('locale distinta dalla media', local_profile.subs(normalized_r, R(1, 2))-area_mean, R(1, 10), 'm/s')],
        'C2-E015': [check('rapporto da integrale cilindrico', flow_ratio, R(1, 16)),
            check('nuova portata', R(24, 5)*flow_ratio, R(3, 10), 'mL/s'),
            check('percentuale', 100*flow_ratio, R(25, 4), 'percent'),
            check('riduzione della media a pari dp L eta', (R(1, 2)**2), R(1, 4))],
        'C2-E016': [check('raggio SI', r_si, R(1, 1000), 'm'), check('lunghezza SI', l_si, R(1, 5), 'm'),
            check('portata SI', flow_si, R(1, 2000000), 'm**3/s'), check('pressione SI', dp_si, 1000, 'Pa'),
            check('Poiseuille derivato da stress e portata', volume_flow-sp.pi*pressure*outer**4/(8*eta*length), 0, 'm**3/s'),
            check('viscosita esatta', viscosity, sp.pi/800, 'Pa*s'),
            check('cancellazione dimensionale eta diviso pi', eta_without_pi, R(1, 800), 'Pa*s')],
        'C2-E017': [check('resistenza equivalente', Q(2+4, 'kPa*s/mL'), 6, 'kPa*s/mL'),
            check('portata da equazioni nodali', node[q_node], 3, 'mL/s'),
            check('portata con unita', series_flow, 3, 'mL/s'),
            check('pressione nodo', node[p_node], 16, 'kPa'),
            check('caduta primo tratto', 2*node[q_node], 6, 'kPa'),
            check('caduta secondo tratto', 4*node[q_node], 12, 'kPa'),
            check('chiusura pressione uscita', node[p_node]-4*node[q_node], 4, 'kPa')],
    }
    # A coarse classical bound for pi already proves the printed 2-significant-
    # figure approximation; no calculator evaluation of pi is required.
    lower, upper = R(31, 10)/800, R(22, 7)/800
    rounding_low, rounding_high = R(77, 20000), R(79, 20000)
    bounded = bool(R(31, 10) < sp.pi < R(22, 7) and rounding_low < lower < upper < rounding_high)
    result['C2-E016'].append({'claim': 'approssimazione esplicita a due cifre significative',
        'independentExact': 'pi/800', 'expectedValue': '3.9e-3', 'unit': 'Pa*s',
        'dimension': {str(k): str(v) for k, v in SI.Unit('Pa*s').dimensionality.items()},
        'relation': 'explicit_approximation_two_significant_figures',
        'manualBounds': '3.1 < pi < 22/7; 0.00385 < 31/8000 < pi/800 < 11/2800 < 0.00395',
        'ok': bounded})
    return result


MANUAL = {
    'C1-E021': '0,80=4/5;30*4/5=24g;70*4/5=56g;24+56=80g;30+70=100mL;80/100=4/5g/mL. Stessa sostanza a22C: qualunque media termica con pesi positivi restituisce22C, non44C.',
    'C1-E022': '4-4=0N quindi a=0 per massa positiva;v resta4/5m/s e spostamento(4/5)*3=12/5=2,4m. Se vi=0, sia v sia spostamento restano0.',
    'C1-E023': '0,20=1/5s;120/5=24Ns. Su A impulso-24: -24/40=-3/5m/s;su B +24/60=2/5m/s. Momenti40*(-3/5)=-24 e60*(2/5)=24;somma0.',
    'C2-E013': '2mm=1/500m;0,30/(1/500)=(3/10)*500=150s^-1. Eta2/5Pa*s per150s^-1 dà60Pa;area1/50m² dà60/50=6/5N. Raddoppiando d la forza diventa3/5N.',
    'C2-E014': '(1/2)^2=1/4;1-1/4=3/4;vlocale=(2/5)*(3/4)=3/10m/s. Media areale2*(2/5)*integrale0..1(q-q³)dq=(4/5)*(1/2-1/4)=1/5m/s, non la lettura locale.',
    'C2-E015': '(1/2)^4=1/16;4,8=24/5;24/(5*16)=3/10mL/s.100/16=25/4=6,25%. La sezione vale1/4;la media cala1/4, perciò portata cala1/16.',
    'C2-E016': 'r=10^-3m,L=1/5m,Q=(1/2)*10^-6=5*10^-7m³/s,dp=10³Pa. Numeratore pi*10^-9;denominatore8*(1/5)*5*10^-7=8*10^-7;eta=pi*10^-2/8=pi/800Pa*s. Per arrotondare:3,1<pi<22/7 implica31/8000<eta<11/2800, entrambi fra0,00385 e0,00395;quindi3,9*10^-3Pa*s. Nessuna espansione decimale obbligatoria di pi.',
    'C2-E017': 'Delta p22-4=18kPa;Req2+4=6kPa*s/mL;Q18/6=3mL/s. Prima caduta2*3=6kPa e nodo22-6=16kPa;seconda caduta4*3=12kPa e16-12=4kPa.',
}
ASSUMPTIONS = {
    'C1-E021': 'Stesso liquido omogeneo alla stessa temperatura, nessuna perdita né scambio energetico apprezzabile; additivita dei volumi assegnata nella caption. Nessun mescolamento di sostanze diverse, contrazione o riscaldamento da considerare nel modello.',
    'C1-E022': 'Riferimento inerziale esplicito, massa positiva costante, guida orizzontale, forze assegnate simultanee opposte per3s, attrito trascurabile;peso e normale si equilibrano. La risultante zero conserva la velocita iniziale.',
    'C1-E023': 'Masse costanti, sistema orizzontale in riferimento inerziale, pattinatori inizialmente fermi, attrito trascurabile;forza MEDIA sullo stesso intervallo, quindi impulso esatto senza supporre forza istantanea costante. Le forze reciproche agiscono su corpi differenti.',
    'C2-E013': 'Couette piano:olio newtoniano,no slip su entrambe le pareti,piastre estese,flusso laminare stazionario,pressione uniforme nella direzione del moto come assegnato;effetti di bordo trascurati. Lastra superiore a velocita costante;forza applicata bilancia resistenza viscosa.',
    'C2-E014': 'Modello Poiseuille di liquido newtoniano in tubo circolare,pareti ferme con no slip,regime laminare stazionario pienamente sviluppato. r e distanza radiale dall asse,non diametro;media pesata sull area,non media non pesata delle coordinate radiali.',
    'C2-E015': 'Due prove distinte di Poiseuille a stessa caduta di pressione,viscosita e lunghezza,entrambe laminari con tubo circolare rigido,no slip,fluido newtoniano. Non due tratti in serie con la stessa portata. A r dimezzato il Reynolds diminuisce nel medesimo modello.',
    'C2-E016': 'Condizioni di Poiseuille assegnate e ribadite:fluido newtoniano,tubo diritto circolare rigido,no slip,laminare stazionario pienamente sviluppato. Valori trattati come dati del modello;3,9e-3 e una stima arrotondata,non uguaglianza esatta.',
    'C2-E017': 'Resistenze idrauliche lineari assegnate in serie,incomprimibile stazionario senza perdite laterali,portata identica nei due tratti;pressioni terminali stesso riferimento. Relazione dp=RQ incorpora le resistenze date;nessun ramo parallelo usato.',
}
PEDAGOGY = {
    'C1-E021': 'Distingue estensive da intensive per riunione di aliquote identiche:si sommano masse e volumi,non densita e temperature. Non estende l additivita a miscele arbitrarie.',
    'C1-E022': 'Affronta l errore risultante nulla implica quiete:il caso in moto e quello fermo hanno a uguale ma vi diversa. Spostamento positivo coerente con asse dichiarato.',
    'C1-E023': 'Azione-reazione non si cancellano nel diagramma di un solo pattinatore;uguali impulsi opposti producono velocita di moduli diversi. Quantita di moto totale zero controlla segni e masse.',
    'C2-E013': 'Gradiente perpendicolare alle piastre,non velocita divisa per lunghezza lungo moto. Pa*s per s^-1 dà Pa;poi area dà N. Forza viscosa opposta al moto e forza esterna concorde. No bisogno di calcolatrice.',
    'C2-E014': 'A mezzo raggio la velocita e3/4 del massimo,non1/2;la media sezionale e1/2 del massimo. Integrale delle corone spiega i pesi di area e la differenza.',
    'C2-E015': 'Legge quarta potenza,non rapporto lineare1/2 né area1/4. Tutti fattori comuni cancellati;6,25% equivale a1/16 e non a riduzione del6,25%.',
    'C2-E016': 'Converte il raggio PRIMA della quarta potenza e la portata mL/s in m³/s;isola eta al denominatore senza invertirla. Fonte contiene espressione esatta con pi e approssimazione esplicita:nessun requisito nascosto di valutazione numerica avanzata.',
    'C2-E017': 'Usa differenza22-4,non somma;somma resistenze in serie,non reciproci. Caption identifica primo tratto2;invertire le resistenze cambierebbe pressione nodo ma non portata,quindi ordine e controllato.',
}
FIGURE_REVIEW = {
    'C1-E021': 'Tre recipienti uguali;rettangoli liquido di altezze30,70,100px e larghezza69px rendono esatto il rapporto3:7:10;etichette e caption assegnano additivita. Stessa temperatura esplicitata,nessuna scala termometrica inventata.',
    'C1-E022': 'Frecce di trazione lunghe105px entrambe,opposte e applicate allo stesso pattino;asse x a destra. Caption dichiara peso/normale bilanciati:figura mostra solo componenti orizzontali,non forze mancanti.',
    'C1-E023': 'Forze reciproche su corpi distinti:95px a sinistra su A e95px a destra su B;masse40/60kg corrette. Nessuna freccia velocita confusa con forza;asse positivo a destra.',
    'C2-E013': 'Parete alta mobile a destra,bassa fissa. Frecce fluide hanno lunghezze0,92*(161-y) ai quattro livelli,quindi gradiente lineare e zero estrapolato alla parete bassa. d e perpendicolare alle lastre;scala assoluta non dichiarata.',
    'C2-E014': 'Asse a y110,pareti48/172,distanza radiale62px. Bezier M15148 Q523110151172 produce esattamente x=151+186*[1-((y-110)/62)^2];frecce ai livelli indicati concordano entro1px. Massimo al centro,zero alle pareti,no slip esplicito.',
    'C2-E015': 'Cerchi di raggi66 e33px:r2=r1/2 esatto;sono due sezioni di prove distinte,non una strozzatura in serie. Le frecce rosse rappresentano raggi,non portate1/16.',
    'C2-E017': 'Schema superiore e serie R1 poi R2 da sinistra a destra;caption esplicita ordine2poi4. Schema inferiore parallelo e separato con etichetta:non viene usato nei calcoli dell esempio. Nessuna lunghezza geometrica interpreta il valore della resistenza.',
}


def verify(sources, asset_root=None):
    missing = set(READ_SOURCE_SHA256)-set(sources)
    if missing:
        raise ValueError('Missing independently read examples: '+','.join(sorted(missing)))
    asset_root = Path(asset_root) if asset_root is not None else APP/'static/figures'
    models = independent_checks()
    records = []
    for key in sorted(READ_SOURCE_SHA256):
        row = sources[key]
        errors = []
        if row.get('kind') != 'example' or digest(row) != READ_SOURCE_SHA256[key]:
            errors.append('Source differs from the independently read original example')
        refs = {'/figures/'+FIGURE_BY_ID[key]} if FIGURE_BY_ID[key] else set()
        actual_refs = {b['src'] for b in row.get('blocks', []) if b.get('type') == 'figure'}
        if refs != actual_refs:
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
        path = SOURCE_PATH_BY_ID[key]
        records.append({'id': key, 'sourceSha256': digest(row), 'sourceVersion': row.get('version', 1),
            'sourceRef': SOURCE_REF, 'sourcePath': path, 'sourceFileSha256': SOURCE_FILES[path],
            'ok': not errors, 'errors': errors, 'checks': checks,
            'dimension': {c['claim']: c['dimension'] for c in checks},
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
        'sourcePaths': list(SOURCE_FILES), 'sourceFileSha256ByPath': SOURCE_FILES,
        'contractSha256': sha(Path(__file__).with_name('review_contract.py').read_bytes()),
        'acceptedCount': sum(r['ok'] for r in records), 'failedCount': sum(not r['ok'] for r in records),
        'draftReviewedCount': 0, 'failedPublishedEditionIds': [],
        'dependencyVersions': {'sympy': sp.__version__, 'pint': pint.__version__},
        'reviewer': 'separate_AI_reviewer_not_original_author', 'originalEditionRetained': True,
        'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
