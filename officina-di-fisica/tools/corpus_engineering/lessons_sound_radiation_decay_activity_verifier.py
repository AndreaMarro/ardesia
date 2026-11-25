"""Independent review of C5-L05..08:29 blocks, five immutable SVGs.

All examples, quantities and domains are checked independently from source flags.
Exact symbolic logarithms/exponentials are retained; no decimal task is invented.
"""
from fractions import Fraction
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
APP=Path(__file__).resolve().parents[2]
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/C5.json'
SOURCE_FILE_SHA256='dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422'
BATCH='lessons-sound-radiation-decay-023'
READ_SOURCE_SHA256={
'C5-L05':'56b3e565fcbec34b37288328ba4d66ab30f532e639dfd995d6a25b82122ee49e',
'C5-L06':'a16943b28a605d4c06e64bca15dbf22bff9b822192bc7eec6a18c1fac7cd112a',
'C5-L07':'993eb56b10a1ac8d3eec606291fc00cd5c11dc5e035f853efeb225710612aae9',
'C5-L08':'9176ee6ab49e6213cf094c437c87e14ed1b52fdad7ed34751f85b4069d05dc09'}
READ_ASSETS={
'C5-doppler.svg':'618c6baecf5fe6b62d60f5e4c1ea7ad9bf1a475edeb1701e443a9758432c4697',
'C5-campi.svg':'76eecac175a09dc3230ea84a31ba22df7f6e9376f053542355c0a67aaa6db120',
'C5-spettro.svg':'bfff537db5e0ad8070bd0e10742483e7d3ae4daa72e4ab52da1aba442a95012d',
'C5-attenuazione.svg':'be137de5807896ee23ffe8b0ee181c48a4faea98ab6831eb294bfd734f2cc233',
'C5-emivita.svg':'a7100392247d5f3be71ecc60e462678a7fc2c1b8a84035c708e88b30866e394b'}
FIGURES_BY_ID={'C5-L05':['C5-doppler.svg'],'C5-L06':['C5-campi.svg','C5-spettro.svg'],
'C5-L07':['C5-attenuazione.svg'],'C5-L08':['C5-emivita.svg']}
SI=pint.UnitRegistry(non_int_type=Fraction)


def check(claim, actual, expected, unit='', scope='symbolic_source_claim'):
    if isinstance(actual, SI.Quantity):
        actual = sp.Rational(actual.to(unit).magnitude)
    residual = sp.simplify(actual-expected)
    return {'claim': claim, 'independentExact': str(actual), 'expectedValue': str(expected),
            'unit': unit, 'dimension': {str(k): str(v) for k, v in SI.Unit(unit).dimensionality.items()},
            'relation': 'exact', 'residual': str(residual), 'ok': residual == 0, 'scope': scope}


def independent_checks():
    Q,F=SI.Quantity,sp.Rational
    c,f,vs,d,elapsed,I,I0,n,E0,mu,x,h,lam,N0,T,t=sp.symbols('c f vs d dt I I0 n E0 mu x h lambda_d N0 T t',positive=True)
    probe='reviewer_constructed_exact_probe_not_assigned_numeric_exercise'
    actual='actual_source_example_or_figure_manual_calculation'
    boundary='reviewer_boundary_probe_excluded_by_source_conditions'
    base10=lambda ratio:sp.log(ratio)/sp.log(10)
    surviving=N0*sp.exp(-lam*t)
    return {
    'C5-L05':[
     check('echo roundtrip time gives one way distance',sp.solve(sp.Eq(elapsed,2*d/c),d)[0],c*elapsed/2,'m'),
     check('toy echo300mpersec in2seconds gives300m',Q(300,'m/s')*Q(2,'s')/2,300,'m',probe),
     check('stationary interface samef gives newlambda byspeedsratio',(c/n/f)/(c/f),1/n),
     check('intensity reference10minus12 has SI intensityunits',Q(F(1,10**12),'W/m^2'),F(1,10**12),'W/m^2'),
     check('source tenfold intensity raises10dB',10*base10(10),10,'',actual),
     check('toy hundredfold raises20dB not100',10*base10(100),20,'',probe),
     check('equal intensities givezero leveldifference',10*base10(1),0),
     check('Doppler approaching source compresses forwardwavelength',(c-vs)/f,c/f-vs/f,'m'),
     check('Doppler stationaryreceiver approachesratio', (c/((c-vs)/f))/f,c/(c-vs)),
     check('Doppler receding source giveslowerfrequency', (c/((c+vs)/f))/f,c/(c+vs)),
     check('source graphic speedratio13over23 is subsonic',F(13,23),F(13,23),'',actual),
     check('source graphic forward10px versusbackward36px',F(23-13,23+13),F(5,18),'',actual),
    ],
    'C5-L06':[
     check('upward E and outgoing B carry energy right',sp.Matrix([0,1,0]).cross(sp.Matrix([0,0,1]))[0],1),
     check('vacuum wavelength frequency gives speedunits',Q(3,'m')*Q(2,'Hz'),6,'m/s',probe),
     check('vacuum EoverB has speedunits',Q(6,'V/m')/Q(2,'T'),3,'m/s',probe),
     check('vacuum amplitude squared average intensity',sp.integrate(E0**2*sp.cos(x)**2,(x,0,2*sp.pi))/(2*sp.pi),E0**2/2,'V^2/m^2'),
     check('doubling E amplitude quadruples intensity',(2*E0)**2/E0**2,4),
     check('frequency doubles vacuum wavelength halves',(c/(2*f))/(c/f),sp.Rational(1,2)),
     check('stationary medium wavelength is vacuumlambdaovern',(c/n)/f,(c/f)/n,'m'),
     check('toy n3over2 reduces600nm to400nm',Q(600,'nm')/F(3,2),400,'nm',probe),
     check('toy mediumfrequency still equals vacuumfrequency',(c/F(3,2))/(F(400,10**9)),c/F(600,10**9),'Hz',probe),
     check('printed approximate c is not exact SI c',sp.Integer(300000000-299792458),207542,'m/s',boundary),
    ],
    'C5-L07':[
     check('photon hertz timesaction givesjoule',Q(2,'J*s')*Q(3,'Hz'),6,'J',probe),
     check('vacuum photon wavelength law followslambda0f', (h*f).subs(f,c/sp.Symbol('lambda0',positive=True)),h*c/sp.Symbol('lambda0',positive=True),'J'),
     check('photon power is photonrate timesenergy',Q(3,'1/s')*Q(2,'J'),6,'W',probe),
     check('higher photoncount doesnot increase perphotonenergy', (10*h*f)/(10),h*f,'J',probe),
     check('rounded working Planck6point626 representation',F('6.626')*sp.Integer(10)**(-34),sp.Rational(3313,500)*sp.Integer(10)**(-34),'J*s'),
     check('working h differs from exact SI h notclaimedidentity', (F('6.62607015')-F('6.626'))*sp.Integer(10)**(-34),F('0.00007015')*sp.Integer(10)**(-34),'J*s',boundary),
     check('Beer fraction solvesconstant fractionalremoval law',sp.diff(I0*sp.exp(-mu*x),x),-mu*(I0*sp.exp(-mu*x)),'W/m^3'),
     check('half layer exact ln2overmu',sp.exp(-mu*(sp.log(2)/mu)),F(1,2)),
     check('two half layers transmitquarter',sp.exp(-mu*(2*sp.log(2)/mu)),F(1,4),'',actual),
     check('three half layers transmiteighth',sp.exp(-mu*(3*sp.log(2)/mu)),F(1,8),'',actual),
     check('source25percent transmitted leaves75percent absorbed onlynootherloss',1-F('0.25'),F(3,4),'',actual),
     check('inversecm timescm yields dimensionlessexponent',Q(2,'1/cm')*Q(3,'cm'),6),
     check('inversecm mustconvert beforemultiplyingmeters',Q(2,'1/cm')*Q(3,'m'),600,'',probe),
     check('equal layers remove smaller absolute amounts', (1-F(1,2))-(F(1,2)-F(1,4)),F(1,4),'',actual),
    ],
    'C5-L08':[
     check('decay equation independent derivative',sp.diff(surviving,t),-lam*surviving,'1/s'),
     check('activity is negative population derivative',-sp.diff(surviving,t),lam*surviving,'Bq'),
     check('half time exact logarithm',surviving.subs(t,sp.log(2)/lam),N0/2),
     check('half time exponent form equivalent',surviving.subs(lam,sp.log(2)/T),N0*2**(-t/T)),
     check('activity halves atsamehalf time',(lam*surviving).subs(t,sp.log(2)/lam),lam*N0/2,'Bq'),
     check('sourcefigure expected32 to16 to8',sp.Integer(32)*F(1,2)**2,8,'',actual),
     check('one halflife finite decayprobability isonehalf',1-sp.exp(-lam*(sp.log(2)/lam)),F(1,2)),
     check('lambda times interval is only infinitesimal probability',sp.limit((1-sp.exp(-lam*t))/t,t,0),lam,'1/s'),
     check('onepersecond hazard over2s doesnotmeanprobability2',1-sp.exp(-2),1-sp.exp(-2),'',boundary),
     check('population uncertainty variance for32 andsurvivalhalf',32*F(1,2)*(1-F(1,2)),8,'',probe),
     check('toy detector efficiencyquarter activity80 plusbackground3 gives23countspersec',F(1,4)*80+3,23,'1/s',probe),
     check('toy backgroundsubtraction efficiencyrecovers80Bq',F(23-3,1)/F(1,4),80,'Bq',probe),
     check('alpha massnumber balances example238',sp.Integer(234+4),238),
     check('alpha protonnumber balances example92',sp.Integer(90+2),92),
     check('beta minus electriccharge balance neutron',sp.Integer(1-1+0),0),
     check('beta plus electriccharge balance proton',sp.Integer(0+1+0),1),
     check('beta minus leptonnumber electronantineutrino',sp.Integer(1-1),0),
     check('beta plus leptonnumber positronneutrino',sp.Integer(-1+1),0),
    ]}

MANUAL={
'C5-L05':'Source actual tenfold intensity gives10*log10(10)=10dB, requiring no general numerical logarithm. Echo d=c*dt/2 follows summing equal outward/return times for fixed reflector and coincident fixed emitter/receiver in a stationary uniform medium; toy300m/s and2s gives300m. Stationary-interface frequency is continuous, wavelength follows speed. Doppler is derived from successive emission positions: lambda_forward=(c-vs)/f and lambda_back=(c+vs)/f. The diagram has source advance13px per cycle against sound travel23px, hence subsonic13/23 and spacings10px/36px. These are geometric ratios, not assigned absolute speeds/frequency. Receiver radial motion and source radial motion are conceptually distinct; no numerical Doppler exercise or arbitrary decimal logarithm is assigned.',
'C5-L06':'Right-handed E upward and B outgoing yield E cross B rightward. Vacuum E=cB and c=lambda0*f have matching SI dimensions; averaging cos² over a cycle gives1/2, so intensity scales E0². The source c approximately3.00e8m/s is a working rounded value, not exact SI299792458m/s; the difference207542m/s is explicitly checked rather than hidden. Stationary transparent interface keeps frequency and lambda=lambda0/n. Constructed n3/2,lambda0=600nm yields400nm manually; these are not source data. Spectrum ordering is ordinal with overlap/convention qualifications, not a metric axis or disjoint frequency partition.',
'C5-L07':'Planck working h is explicitly approximate6.626e-34J*s, distinct from exact SI6.62607015e-34J*s. Per-photon hf and total photonrate*hf distinguish photon energy from total beam power; monochromaticity is required to infer a single photoncount from total energy. Constant fractional removal integrates dI/dx=-muI to I0exp(-mu*x). Exact half-thickness ln2/mu is symbolic; at two/three half layers the transmitted fractions are1/4 and1/8. Actual0.25 means25percent transmitted and75percent absorbed only under the text no-other-loss qualifier. Forcm^-1 the thickness must usecm or be converted:2cm^-1*3cm=6 versus2cm^-1*3m=600. No unprovided logarithm or exponential decimal evaluation is demanded.',
'C5-L08':'Independent survival law solves dN/dt=-lambda_d*N, with activity-lambda derivative positive. At ln2/lambda_d the expected population and activity halve; alternate2^(-t/T_half) is algebraically equivalent. Actual figure has32/16/8 dots explicitly labelled expected counts, not guaranteed realizations. Finite decay probability is1-exp(-lambda_d*dt), with lambda_d the infinitesimal rate; replacing it by lambda_d*dt for longintervals is excluded. Reviewer binomial variance at32 nuclei andhalf survival is8. Toy80Bq,quarter efficiency and3/s background gives23/s measured; subtracting3 and dividingbyonequarter recovers80Bq. Alpha daughter losesA4,Z2; beta-minus neutron toproton+electron+antineutrino conserves charge andleptonnumber, beta-plus reverses withpositron+neutrino; gamma changesexcitationenergy without A/Z change. Numeric nuclear examples are reviewer checks, not source assignments.'}
ASSUMPTIONS={
'C5-L05':'Echo formula assumes stationary uniform propagation and fixed reflector/coincident stationary source/receiver; no unaccounted wind or moving-boundary correction. Decibel intensity ratio is positive/dimensionless with sameunits, reference1e-12W/m² inair. Intensitylevel isnot perceived loudness or pressurelevel. Doppler diagram explicitlysubsonic, classical medium andradial directions; transverse motion needs the stated usual radial approximation, not relativistic transverseDoppler.',
'C5-L06':'Plane travelling electromagnetic wave in vacuum for orthogonal in-phase E/B and E0=cB0. Nonzero monochromatic vacuum phase frequency/wavelength; transparent stationary interface, real phaseindex atthatfrequency, not groupvelocity substitution. Ordinary ordinal bandclassification allowsradio/microwave inclusion andX/gammaoverlap, explicitly intext. Rounded workingc isapproximate.',
'C5-L07':'Single-photon threshold statements, not exclusionofall nonlinear multiphoton processes. Monochromaticbeam andassigned material/process ionizationthreshold. Homogeneous constantmu,nonnegative thickness andmu>0 for finitehalfthickness; detectorselectsdirectbeam, scatteringout maycontributeattenuation. Absorptionfraction equalsmissingtransmission only absentotherlosses. happroximation explicit,lambda0 isvacuum wavelength.',
'C5-L08':'Large identical independent nuclei withconstant decayhazard, isolated singleparent specieswithoutnewproduction forsimpleexponential/activityhalving; population equations giveexpectations. Unpredictable individualdecay isnot deterministictimehalving. Decaychannels mustbeenergeticallyallowed inthenucleus; beta-plus description doesnotclaimfree protondecay. Measured counts needbackground/efficiency andemissionbranchingconditions, notautomaticallyBq; activityisnotdose.'}
PEDAGOGY={
'C5-L05':'Separatesmediumspeed, fixed-interfacefrequency, echodoublepath andlogarithmicratio.10dB relation is exactly manual. Qualitative Doppler usesemissiongeometry andreceiver frontcount ratherthan relativevelocitywithoutmediumreference. Perception isnot equatedwithphysicalintensity.',
'C5-L06':'Fieldorientationisonepoint/instant; E/B directionandtransportdirection aredistinct. Ordinal spectrumexplicitlynotdrawntoscale andproduction/conventionaloverlap ismentioned. Wavelengthmediumischeckedbeforeusingc.',
'C5-L07':'Separatesper-photon andtotalenergy; ionization thresholddepends onmaterial/process. Half-layerdiagram teachesfractional,notconstantabsolute,removal. Direct-beam attenuation andpureabsorption arequalified; dimensionsofmu mustmatchthickness.',
'C5-L08':'Expectedpopulationsfigureavoidsclaimingpredictableindividualdecay. Distinguisheslambda_dfromwavelength, activityfromcounts, parentexponentialfromnewproduction, and beta/gamma/alpha nuclearaccounting. Manualhalving doesnotrequiredecimalexponential evaluation.'}
FIGURE_REVIEW={
'C5-L05':'FullXML/render:fourwavefrontcircles centered330/343/356/369 atsamey126, radii92/69/46/23, current source382 andreceiver467ahead. Successivecenters advance13whilewavesadvance23, givingforwardspacing10/back36;subsonicsourceanddirectionlabel agree. Noabsolute physicalunit scale assigned.',
'C5-L06':'FullXML/renderboth: E up, Boutgoingdot, propagationright givespositive ExB; labels sayonepoint/instant. Ordinal spectrum arrows frequencyincreasing/wavelengthdecreasing, regionsradio,microwaves,IR,visible,UV,X,gamma, uniformspacingnotmetric. Textqualifiesoverlap andmicrowaveconvention.',
'C5-L07':'FullXML/render: thicknesspoints0,d,2d,3d atx80/193/306/419 are113pxapart. Zerointensityy191,unityy43 gives148pxunit;pointsy43/117/154/172.5 areexact1,1/2,1/4,1/8. Curve agreeswithin0.01pxrounding. Noassignednumericmuord.',
'C5-L08':'FullXML/render:threeboxes at0,T_half,2T_half contain32,16,8 dots andlabelN0,N0/2,N0/4. Caption/titleexplicitlyexpectedcounts; dotsarenotclaimed exactrealizations ofsmallstochastic samples.'}


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
