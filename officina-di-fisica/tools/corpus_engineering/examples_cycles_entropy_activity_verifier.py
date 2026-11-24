"""Independent AI reading and exact models for original C3-E013..020.

Hashes frozen after every original block and all five SVGs were independently
read/rendered. No answer/authoring import, human approval or publication.
"""
from fractions import Fraction
from pathlib import Path

import pint
import sympy as sp

from .pipeline import digest, sha
from .review_contract import reviewed_rows

APP = Path(__file__).resolve().parents[2]
SOURCE_REF = '5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH = 'officina-di-fisica/content/C3.json'
SOURCE_FILE_SHA256 = '44cb7679671a99a5da654133d4f1c12a542acf1a4688987121bcd5a776a262e0'
BATCH = 'examples-cycles-entropy-010'
READ_SOURCE_SHA256 = {
    'C3-E013': 'f0640b6085520fd18705d4b19c07c5ed67f05cc3aa6ed7287952059a91911ed7',
    'C3-E014': '8270a080e94e5c7eac7e3edc0ae789e97c32630901cc1812746ee9ce399015f6',
    'C3-E015': 'ef4f94526cff3a3bf716f80794be3c7ec540d13fd7aca5536451402168f86bcb',
    'C3-E016': 'f9c8fbb8a632cef3da2846de68c10d4b33fe870b5cd968c41aad057bba689412',
    'C3-E017': 'efc5259a00aa8a2b4dc1be72d97f07414ac42196cf33699716fbf61588e21c6a',
    'C3-E018': 'e842a3d2784766872ae3dc4ef5c91bec87feeca7d54cc8e3b33d40bd45d7f3fc',
    'C3-E019': 'a509f8c354728f5a3da6c663719208744cc4e10251730bd1381c322897332e9b',
    'C3-E020': '3f12b7f92e0407506a523fae14582d762ee5e412b87d59f9fd577ad77be23142',
}
READ_ASSETS = {
    'C3-percorsi.svg': '3bf54a3478de1a5cc2c30b33268d91d49456b432af41d5df7b0bdd2560edb85f',
    'C3-espansione-libera.svg': '2680bd9d79eae11adcf6592bfc4d9e8f32091c106462c93d5c3babac9a08bb0e',
    'C3-ciclo.svg': '84d1b1fb87683ae92240d45760932a7a844a5e01da70037130d703d64690cb03',
    'C3-macchina.svg': 'd731c50778f96cbb5e0038adb43ee4196ed99af557dece4c7de381d1485fb193',
    'C3-entropia.svg': '8d95c2e3952150bb1a206ee74e61635e13fa841522aa1a06383d736ed49c7782',
}
FIGURE_BY_ID = {'C3-E013': 'C3-percorsi.svg', 'C3-E014': 'C3-espansione-libera.svg',
    'C3-E015': 'C3-ciclo.svg', 'C3-E017': 'C3-macchina.svg', 'C3-E019': 'C3-entropia.svg'}
SI = pint.UnitRegistry(non_int_type=Fraction)
REVISION_IDS = {'C3-E020'}
# Frozen after the complete v2 package and the fully rendered new SVG were read.
REVIEWED_REVISIONS = {'C3-E020': '87add702a0089aaa85ffd06fd4be7ad507ea53d90938d5b67470834156548bff'}


def check(claim, actual, expected, unit=''):
    if isinstance(actual, SI.Quantity):
        actual = sp.Rational(actual.to(unit).magnitude)
    residual = sp.simplify(actual-expected)
    return {'claim': claim, 'independentExact': str(actual), 'expectedValue': str(expected),
        'unit': unit, 'dimension': {str(k): str(v) for k, v in SI.Unit(unit).dimensionality.items()},
        'relation': 'exact', 'residual': str(residual), 'ok': residual == 0}


def manual_adiabatic_bound():
    """75.75 < 50*root5(8) < 75.85 by short rational/binomial bounds."""
    R = sp.Rational
    lower_root, upper_root = R(303, 200), R(1517, 1000)
    # lower_root=(3/2)*(1+1/100). Expand the small relative increment.
    expansion = 1+R(5, 100)+R(10, 10000)+R(10, 1000000)+R(5, 100000000)+R(1, 10000000000)
    lower_upper = R(243, 32)*R(263, 250)
    upper_lower = R(243, 32)+5*R(81, 16)*R(17, 1000)
    ok = bool(expansion == R(101, 100)**5 and expansion < R(263, 250)
        and lower_root**5 < lower_upper < 8 < upper_lower < upper_root**5)
    return {'claim': '75,8kPa approssimazione secondaria esplicita',
        'independentExact': '50*2**(3/5)', 'expectedValue': '75.8', 'unit': 'kPa',
        'dimension': {str(k): str(v) for k, v in SI.Unit('kPa').dimensionality.items()},
        'relation': 'explicit_approximation_nearest_tenth',
        'manualBounds': '75.75 < 50*root5(8) < 75.85; (1.515)^5 < 63909/8000 < 8 < 128385/16000 < (1.517)^5',
        'ok': ok}


def entropy_log_bounds():
    """Convergent rational artanh series, with rigorous positive remainder."""
    R = sp.Rational
    # ln2=2*sum(z**(2k+1)/(2k+1)), z=1/3. The tail after k=2 is
    # less than 2*z**7/[7*(1-z**2)]=1/6804.
    partial = 2*(R(1, 3)+R(1, 81)+R(1, 1215))
    tail_bound = R(1, 6804)
    entropy_lower, entropy_upper = R(4157, 500)*partial, R(4157, 500)*(partial+tail_bound)
    return partial, tail_bound, entropy_lower, entropy_upper


def independent_checks():
    Q, R = SI.Quantity, sp.Rational
    ratio, gamma = R(2), R(7, 5)
    isothermal_p = 200/ratio
    # Ideal-gas entropy balance: Cv ln(Tf/Ti)+R ln(Vf/Vi)=0,
    # Cv=R/(gamma-1); combine Tf/Ti=ratio**(1-gamma) with pV=nRT.
    adiabatic_p = 200*ratio**(1-gamma)/ratio
    vi, vf = sp.symbols('T_i T_f', positive=True)
    cv = sp.Symbol('C_v', positive=True)
    free_delta_t = sp.solve(sp.Eq(cv*(vf-vi), 0), vf)[0]-vi
    volume = sp.Symbol('V', positive=True)
    work_top = sp.integrate(200, (volume, 1, 3))
    work_bottom = sp.integrate(100, (volume, 3, 1))
    work_net = work_top+work_bottom
    third_delta_u = -(130-90)
    third_heat = third_delta_u+15
    engine_in, engine_out = Q(800, 'J'), Q(560, 'J')
    engine_work = engine_in-engine_out
    efficiency = (engine_work/engine_in).to('').magnitude
    max_efficiency = 1-(Q(300, 'K')/Q(400, 'K')).to('').magnitude
    engine_reservoir_entropy = engine_out/Q(300, 'K')-engine_in/Q(400, 'K')
    cold_heat = Q(270, 'J')
    hot_heat = cold_heat*Q(300, 'K')/Q(270, 'K')
    refrigerator_work = hot_heat-cold_heat
    entropy_hot = -Q(120, 'J')/Q(400, 'K')
    entropy_cold = Q(120, 'J')/Q(300, 'K')
    amount, constant = sp.Integer(1), R(4157, 500)
    auxiliary_entropy = sp.simplify(sp.integrate(amount*constant/volume, (volume, volume, 2*volume)))
    lower_ln, tail, entropy_lower, entropy_upper = entropy_log_bounds()
    results = {
        'C3-E013': [check('pressione isoterma', isothermal_p, 100, 'kPa'),
            check('pressione adiabatica esatta', adiabatic_p, 50*2**R(3, 5), 'kPa'),
            check('quinta potenza controllo radicale', adiabatic_p**5, 8*50**5, 'kPa**5'),
            check('rapporto finale temperature adiabatiche', ratio**(1-gamma), 2**(-R(2, 5)))],
        'C3-E014': [check('lavoro frontiera nel vuoto', sp.Integer(0), 0, 'J'),
            check('calore attraverso pareti isolate', sp.Integer(0), 0, 'J'),
            check('bilancio energia interna', sp.Integer(0)-0, 0, 'J'),
            check('temperatura invariata daCvpositivo', free_delta_t, 0, 'K')],
        'C3-E015': [check('conversione kPa litro', Q(1, 'kPa*L'), 1, 'J'),
            check('integrale ramo alto', work_top, 400, 'J'),
            check('integrale ramo basso', work_bottom, -200, 'J'),
            check('lavoro netto orario', work_net, 200, 'J'),
            check('area rettangolo orientata', (200-100)*(3-1), work_net, 'J'),
            check('calore netto daDeltaUciclo0', work_net+0, 200, 'J')],
        'C3-E016': [check('terza variazione interna', sp.Integer(third_delta_u), -40, 'J'),
            check('calore terzo tratto', sp.Integer(third_heat), -25, 'J'),
            check('chiusura cicloDeltaU', sp.Integer(130-90+third_delta_u), 0, 'J'),
            check('saldo terzo trattoQmenoW', sp.Integer(third_heat-15), -40, 'J')],
        'C3-E017': [check('lavoro da primo principio', engine_work, 240, 'J'),
            check('rendimento promesso', R(efficiency), R(3, 10)),
            check('limite reversibile due sorgenti', R(max_efficiency), R(1, 4)),
            check('superamento limite', R(efficiency-max_efficiency), R(1, 20)),
            check('massimo lavoro consentito', engine_in*max_efficiency, 200, 'J'),
            check('entropia serbatoi proposta impossibile', engine_reservoir_entropy, -R(2, 15), 'J/K')],
        'C3-E018': [check('calore scaricato al caldo', hot_heat, 300, 'J'),
            check('lavoro minimo entrante', refrigerator_work, 30, 'J'),
            check('COP reversibile', cold_heat/refrigerator_work, 9),
            check('bilancio entropia reversibile', hot_heat/Q(300, 'K')-cold_heat/Q(270, 'K'), 0, 'J/K'),
            check('minimo da disuguaglianza entropica', cold_heat*(Q(300, 'K')/Q(270, 'K')-1), 30, 'J')],
        'C3-E019': [check('entropia sorgente calda', entropy_hot, -R(3, 10), 'J/K'),
            check('entropia sorgente fredda', entropy_cold, R(2, 5), 'J/K'),
            check('entropia complessiva', entropy_hot+entropy_cold, R(1, 10), 'J/K'),
            check('energia netta serbatoi', Q(-120, 'J')+Q(120, 'J'), 0, 'J')],
        'C3-E020': [check('integrale isoterma reversibile ausiliaria', auxiliary_entropy, R(4157, 500)*sp.log(2), 'J/K'),
            check('uguaglianza stampata non qualificata', auxiliary_entropy, R(144, 25), 'J/K'),
            check('serie logaritmica parziale razionale', lower_ln, R(842, 1215)),
            check('limite coda serie logaritmica', tail, R(1, 6804))],
    }
    results['C3-E013'].append(manual_adiabatic_bound())
    for claim in results['C3-E014']:
        claim['relation'] = 'symbolic_conceptual_identity_no_student_numeric_calculation'
    results['C3-E020'].append({'claim': '5,76 corretto solo se dichiarato approssimato',
        'independentExact': '(4157/500)*log(2)', 'expectedValue': '5.76', 'unit': 'J/K',
        'dimension': {str(k): str(v) for k, v in SI.Unit('J/K').dimensionality.items()},
        'relation': 'viable_nearest_hundredth_does_not_repair_original_equality',
        'manualBounds': str(entropy_lower)+' < S < '+str(entropy_upper)+'; 5.755 < lower < upper < 5.765',
        'ok': bool(R(1151, 200) < entropy_lower < entropy_upper < R(1153, 200))})
    return results


MANUAL = {
    'C3-E013': 'Isoterma200/2=100kPa. Gamma7/5,adiabatica200/2^(7/5)=50*root5(8)kPa,forma simbolica esatta già presente come200*(1/2)^1,4 nella fonte;non serve forzare decimali. Approssimazione secondaria≈75,8:1,515=(3/2)*1,01 e1,01^5=1,0510100501<1,052;dunque1,515^5<63909/8000<8. Per1,517=1,5+0,017,binomio>243/32+5*(81/16)*(17/1000)=128385/16000>8. Quinta radice monotona:75,75<p<75,85kPa.',
    'C3-E014': 'Nessun calcolo numerico richiesto:espansione nel vuoto senza resistenza⇒W0;pareti adiabatiche⇒Q0;DeltaU0. Per gasperfetto composizionefissa eCvpositivo,Uf=Ui implicaTf=Ti. Processo irreversibile:non applicare pV^gamma costante.',
    'C3-E015': '1kPa*L=1J. Ramoalto200*(3-1)=400J;ramobasso100*(1-3)=-200J;verticaliDeltaV0 danno0. Netto200J,anchearea(200-100)*(3-1)=200J. CicloDeltaU0 quindiQnet200J,nonQassorbito individuale.',
    'C3-E016': '130-90=40J;per chiudereDeltaU3=-40J. Q3=DeltaU3+W3=-40+15=-25J;caloreceduto25J e lavoroout15J sottraggono40J.',
    'C3-E017': '800-560=240J verificaenergia;240/800=3/10. Limite1-300/400=1/4;3/10-1/4=1/20>0,quindi proposta impossibile. MassimoW800/4=200J. Entropiaserbatoi560/300-800/400=28/15-2=-2/15J/K<0.',
    'C3-E018': 'PerreversibileQh/Qc=300/270=10/9;270*(10/9)=300J. Lavoroin300-270=30J. COP270/30=9;entropiahot300/300=1J/K,cold-270/270=-1J/K,somma0. Reale richiede almeno30J perstessiQc e sorgenti.',
    'C3-E019': 'Caldo-120/400=-3/10J/K;freddo120/300=2/5J/K;somma1/10J/K. Conenergia120uscita e120entrata il saldoenergiaè0 ma entropiacresce.',
    'C3-E020': 'Integrale reversibileausiliario nR*dV/V dànRln2=(4157/500)ln2J/K,esatto simbolico. La fonteuguagliaa5,76senza≈/precisionedichiarata:FAILoriginale,nonservecalcolatriceperlasciarelogsimbolico. Solo percontrollareeventualestimascriveln2=2(1/3+1/81+1/1215)+coda,0<coda<1/6804;prodottocon4157/500resta fra5,755e5,765. Talecontroprova dimostraarrotondamentopossibile,noncorreggelugualeoriginale.',
}
ASSUMPTIONS = {
    'C3-E013': 'Gas perfetto,nfisso,stessopuntoiniziale,volume doppio,γcostante7/5delmodello;isotermaTcostante eadiabaticareversibile(caloricamenteperfetta)distinte. La relazione pV^gamma nonvale per generica adiabatica irreversibile. Espressionesimbolicaesatta eapprossimazionesecondariacircaesplicita nella fonte.',
    'C3-E014': 'Gas perfetto acomposizionefissa,contenitoreesternorigidoisolato,compartimentoinizialmenteevacuato,nessunaltracoppiaQ/Woenergiamacroscopicafinalesupplementare. Statiiniziale/finaleequilibrati;Cvpositivo⇒UmonotonaconT. Nessunpercorsoquasistaticointernoassegnato.',
    'C3-E015': 'CicloquasistaticorappresentatoinpV conpressionedisistemacoerenteconlavorodifrontiera,versoorarioesplicito,Qin/Wout. Energiamacroscopica/macchinariidenticastatoinizialefinale;DeltaUciclo0. Nonserveleggedigasperfettoperarealavoro.',
    'C3-E016': 'Trestrattichiusistessosistema,DeltaUfunzionedistato;convenzioneQin/Wout. Lavoroterzo15Jpositivo perchécompie,nonriceve. Nessunaltratermineenergeticonelprimoprincipioassegnato.',
    'C3-E017': 'Macchinaciclicaconsoleduesorgentitermichea400/300Kfisse,modulicalori800/560J e lavoroout240J. Primoprincipio èsoddisfatto,secondoviolato:ilgiudizioPASSdelrecordcertificaladiagnosiIMPOSSIBILE,nonlarealizzabilitadellamacchina.',
    'C3-E018': 'Frigoriferoreversibileciclico,soleduesorgentifisse270/300K,Qc270Jpergiro,Winpositivo. ModuliQh/QcproporzionaliaT;minimorealediWinconseguessoloastessiQc e temperaturereservoir.',
    'C3-E019': 'Serbatoiidealiagrandetacapacitatemperatura400/300Kcostanticomecaption;120JscambiatisenzaW,oaltriQintermedi. DeltaSdiognibagnoQ/Tcalcolabileperstatiancheseiltrasferimentocomplessivoirreversibile.',
    'C3-E020': 'Unamolegasperfetto,Tugualetraendpoint,Vf2Vi;entropiafunzionedistato,quindipercorsoreversibileausiliarioisotermoammesso. NonapplicareQreale/Tallespansionelibera. R8,314assegnato;ln2esatto. Originalenondichiaraarrotondamentodi5,76néprecisioneperlasua uguaglianza.',
}
PEDAGOGY = {
    'C3-E013': 'Confrontofrazionivolumeeγ:adiabatica sottoisoterma perγ>1edespansione,partendodallostessostato. Esattosimbolicononcomportacalcolatricenérichiestadidecimaliforzati;75,8èesplicitamentesecondario≈econtrollatoamanoconbinomio.',
    'C3-E014': 'Distingueadiabaticodaadiabaticoreversibile:espansioneliberaidealepuoavereTcostantesenzaQ. NontracciareunfalsopercorsopV^gammaattraversostatidiequilibriononpresenti.',
    'C3-E015': 'Firmalavorodalversoorario,400positivo/200negativo;verticalinienteW. Qnettosulciclo nonècaloreassorbitoQh,rendimentononricavabiledalsoloWnet.',
    'C3-E016': 'Chiusurafunzionedistato primadiQ3;caloreceduto coerenteconDeltaU-40 eWout15. Sottrarresegno-90correttamentesommatoai130.',
    'C3-E017': 'Energiaconservatanonbastaarenderefattibileunmotore. LimiteCarnotconKelvin,η30%>25%;indipendenteentropianegativaserbatoiconfermaimpossibilita. NonconfonderequestadiagnosicorrettaconFAILdellaqualitadellesempio.',
    'C3-E018': 'QhincludeQcpiuWin;nonuguagliareWin aQc. COP9puoesseremaggioredi1 perchéprestazione,nonnormalerendimentoη. Reversibileminimizzalavorofraduesorgentifisse.',
    'C3-E019': 'SegniQoppostimaentropienonsicancellanoconTdiverse. UsiKelvin400/300,nonCelsius;somma0,1positivapertrasferimentospontaneocaldo→freddo.',
    'C3-E020': 'FAILORIGINALE:uguaglianzaa5,76nonesatta,nessun≈odichiarazioneprecisionestudente. Laformafisica nRln2ècorretta epuorestaresimbolicasenzacalcolatrice;roundingverificatonelreportnonpuoaggiungeresegnomancantenellafonte. Serve nuovaedizione separata.',
}
FIGURE_REVIEW = {
    'C3-E013': 'StessoA167/86,tuttecurvepartonodali;isocoraverticale,isobaraorizzontale,isotermasopraadiabatica. CoordenatenormalizzaterispettoVzero76,pzero205,Vi91px,pi119pxsupportanop∝V^-1/V^-1,4conarrotondamentografico. Noncisonotacchenumerichedaleggeredatiprompt.',
    'C3-E014': 'Primametacontienegas ealtravacua,doostessorecipientesenzaseparatore. Ottopuntigasprimaedottodopo,quindinconservato;paretiesternerigide/adiabatichedichiarate. NessunafrecciavelocitadatiperT.',
    'C3-E015': 'Aaltosinistra,Baltodestra,Cbassodestra,Dbassosinistra;freccecorrettamenteorarie,volumeversodestra. Schemaprivo ditacchenumeriche:areaetichetattacomeWnet,nonmisurainJdaipixel.',
    'C3-E017': 'FlussiQhcaldo→motore,Qcmotore→freddo eWuscente;nessunvalorenumericooscalafrecce,nonpresentadispositivoimpossibilecomerealizzato. Captionchiededistinguerebilancioenergiadavincolosorgenti.',
    'C3-E019': 'Frecciacaldo→freddo,singoloQconmodulocomune,DeltaSh−Q/Th eDeltaSc+Q/Tccorretti. Iconecontainerdiversicolori,nonindicazionedicapacitafiniteotemperaturevariabili.',
}


def verify_originals(sources, asset_root=None):
    missing = set(READ_SOURCE_SHA256)-set(sources)
    if missing:
        raise ValueError('Missing independently read cycle/entropy examples: '+','.join(sorted(missing)))
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
            errors.append('Independent original-example claim failed')
        if key == 'C3-E020':
            errors.append('Original presents rounded logarithmic value as exact equality without declaring approximation; new edition required')
        records.append({'id': key, 'sourceSha256': digest(row), 'sourceVersion': row.get('version', 1),
            'sourceRef': SOURCE_REF, 'sourcePath': SOURCE_PATH, 'sourceFileSha256': SOURCE_FILE_SHA256,
            'ok': not errors, 'errors': errors, 'checks': checks,
            'dimension': {claim['claim']: claim['dimension'] for claim in checks},
            'calculationScope': 'NO_STUDENT_CALCULATION' if key == 'C3-E014' else 'EXACT_MANUAL_CALCULATION',
            'manualArithmetic': MANUAL[key], 'manualFeasibility': 'FAIL_ORIGINAL_EDITION' if key == 'C3-E020' else 'PASS_AI_CONCEPTUAL' if key == 'C3-E014' else 'PASS_AI_EXACT',
            'physicalAssumptions': ASSUMPTIONS[key], 'pedagogicalReview': PEDAGOGY[key],
            'assetChecksums': assets, 'figureReview': FIGURE_REVIEW.get(key, 'No figure in this original record'),
            'verificationMode': 'INDEPENDENT_EXISTING_EDITION', 'failedPublishedEdition': key == 'C3-E020',
            'originalEditionRetained': True, 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'})
    return records


def revised_entropy_checks():
    """Real isolated expansion and a different reversible auxiliary path."""
    Q, R = SI.Quantity, sp.Rational
    cv, initial_t, final_t, initial_v = sp.symbols('Cv Ti Tf Vi', positive=True)
    final_temperature = sp.solve(sp.Eq(cv*(final_t-initial_t), 0), final_t)[0]
    amount = Q(1, 'mol')
    constant = Q(Fraction(4157, 500), 'J/(mol*K)')
    factor = (amount*constant).to('J/K')
    coefficient = R(factor.magnitude)
    dimensionless_integral = sp.integrate(1/initial_v, (initial_v, initial_v, 2*initial_v))
    entropy = sp.simplify(coefficient*dimensionless_integral)
    auxiliary_heat = coefficient*initial_t*sp.log(2)
    lower_log, tail, _, _ = entropy_log_bounds()
    checks = [check('calore processo reale isolato', sp.Integer(0), 0, 'J'),
        check('lavoro processo reale nel vuoto', sp.Integer(0), 0, 'J'),
        check('bilancio energia interna reale', sp.Integer(0)-0, 0, 'J'),
        check('temperature endpoint equilibrati uguali', final_temperature-initial_t, 0, 'K'),
        check('rapporto volumi senza unita', (2*initial_v)/initial_v, 2),
        check('fattore mol per R con cancellazione unita', factor, R(4157, 500), 'J/K'),
        check('conversione decimale R in frazione', R(8314, 1000), R(4157, 500), 'J/(mol*K)'),
        check('integrale logaritmico dimensionless', dimensionless_integral, sp.log(2)),
        check('entropia esatta simbolica', entropy, R(4157, 500)*sp.log(2), 'J/K'),
        check('Qrev diviso T per percorso ausiliario', sp.cancel(auxiliary_heat/initial_t), entropy, 'J/K'),
        check('limite inferiore entropia', coefficient/2, R(4157, 1000), 'J/K'),
        check('limite superiore entropia', coefficient, R(4157, 500), 'J/K')]
    checks.append({'claim': 'limiti logaritmici senza valutazione decimale richiesta',
        'independentExact': '1/2 < integral(1/x, x=1..2) = log(2) < 1',
        'expectedValue': '4.157 J/K < entropy < 8.314 J/K', 'unit': 'J/K',
        'dimension': {str(k): str(v) for k, v in SI.Unit('J/K').dimensionality.items()},
        'relation': 'strict_integral_bounds_and_positive_entropy',
        'proof': 'On the interval of length1,1/2<=1/x<=1,strict except isolated endpoints. Independent rational log-series bounds also lie strictly inside these endpoints.',
        'ok': bool(R(1, 2) < lower_log < lower_log+tail < 1)})
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
    by_id = {record['id']: record for record in originals}
    for row, binding, signature, assets, errors in rows:
        key = row['id']
        original = by_id[key]
        if (binding['sourceRef'] != SOURCE_REF or binding['sourceId'] != key
                or binding['sourceSha256'] != original['sourceSha256']
                or original['sourceSha256'] != READ_SOURCE_SHA256[key]):
            errors.append('Revision not bound to independently read original')
        if (row.get('kind') != 'example' or 'answer' in row
                or type(row.get('version')) is not int or type(row.get('baseVersion')) is not int
                or row['version'] != original['sourceVersion']+1
                or row['baseVersion'] != original['sourceVersion']):
            errors.append('Expected additive next example edition with correct base version and no answer key')
        checks = revised_entropy_checks()
        if not all(claim['ok'] for claim in checks):
            errors.append('Independent revised entropy model failed')
        revised = dict(original)
        revised.update(ok=not errors, errors=errors, checks=checks,
            dimension={claim['claim']: claim['dimension'] for claim in checks},
            calculationScope='EXACT_MANUAL_CALCULATION', manualFeasibility='PASS_AI_EXACT',
            manualArithmetic='NEW DRAFT: real Q=W=0 implies DeltaU0 and equal equilibrium endpoint T for fixed ideal gas. Auxiliary reversible isotherm gives integral nR*dV/V=nR*ln2. One mol cancels mol in R;8314/1000=4157/500,so exact entropy(4157/500)*ln2 J/K. No decimal logarithm requested. Integrand1/x between1/2 and1 on[1,2] proves strict1/2<ln2<1,then multiply by8,314 to get4,157<DeltaS<8,314 J/K.',
            physicalAssumptions='NEW DRAFT explicitly assigns rigid isolated two-chamber vessel,one mole fixed ideal gas,T>0,initial vacuum in equal-volume chamber,equilibrated initial/final states. No uniform equilibrium intermediate states assumed during actual irreversible expansion. RealQ0/W0 differs from reversible auxiliary Qrev=Wrev at fixedT;entropy depends on endpoints and is produced in actual isolated process.',
            pedagogicalReview='Independently read full new edition: exact symbolic logarithm is explicitly accepted and no decimal evaluation is requested. It distinguishes real versus auxiliary paths,absolute temperature,dimensionless volume ratio,J/K units and model-exact versus physical constant precision. Integral bounds give an actual manual sign/magnitude check. No false equality to5,76 remains; historical failed judgment stays separate.',
            assetChecksums=assets, candidateSha256=digest(row), reviewedSignature=signature,
            candidateVersion=row['version'], baseVersion=row['baseVersion'],
            failedPublishedEdition=True, publishedEditionReview=original, reviewedEdition='NEW_DRAFT',
            verificationMode='EXACT_ORACLE', publicationAction='DRAFT',
            figureReview='New SVG fully read and rendered: real isolated expansion(V,T)to(2V,T),different reversible auxiliary isotherm with Qrev=Wrev,exact symbolic entropy and strict integral bounds. Chambers/freccias explicitly schematic;unequal drawn whole-vessel widths are not a volume scale. No decimal logarithm or intermediate real-state equilibrium is asserted;all labels fit viewBox.')
        by_id[key] = revised
    return [by_id[key] for key in sorted(by_id)]


def report(sources, package=None, bindings=None):
    records = verify(sources, package, bindings)
    return {'schemaVersion': '1.0.0', 'batch': BATCH, 'records': records,
        'verifierSha256': sha(Path(__file__).read_bytes()), 'sourceRef': SOURCE_REF,
        'sourcePath': SOURCE_PATH, 'sourceFileSha256': SOURCE_FILE_SHA256,
        'contractSha256': sha(Path(__file__).with_name('review_contract.py').read_bytes()),
        'acceptedCount': sum(row['ok'] for row in records), 'failedCount': sum(not row['ok'] for row in records),
        'draftReviewedCount': sum(row['publicationAction'] == 'DRAFT' for row in records), 'failedPublishedEditionIds': ['C3-E020'],
        'dependencyVersions': {'sympy': sp.__version__, 'pint': pint.__version__},
        'reviewer': 'separate_AI_reviewer_not_original_or_revision_author', 'originalEditionRetained': True,
        'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
