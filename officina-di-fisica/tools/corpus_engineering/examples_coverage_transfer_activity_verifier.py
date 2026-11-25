"""Independent complete seven original coverage/transfer examples:41blocks/7SVGs.

Two true source provenances, exact nominal arithmetic with declared estimates,
manual bounds and explicitly scoped reviewer probes. Not author approval.
"""
from fractions import Fraction
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
APP=Path(__file__).resolve().parents[2]
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
BATCH='examples-coverage-transfer-034'
SOURCE_FILES={'officina-di-fisica/content/esempi-di-copertura.json': 'a2db79961bac47ce346d482990d1fb47105151d0650de9c4e05c5b7a5e311d82', 'officina-di-fisica/content/lotto-001.json': '71c563d3ea98f92602f04d1956df968bf125b85fad72521bd6742d8070e53e2a'}
SOURCE_PATH_BY_ID={'C3-E021': 'officina-di-fisica/content/esempi-di-copertura.json', 'C3-E022': 'officina-di-fisica/content/esempi-di-copertura.json', 'C3-E023': 'officina-di-fisica/content/esempi-di-copertura.json', 'C4-E021': 'officina-di-fisica/content/esempi-di-copertura.json', 'C5-E021': 'officina-di-fisica/content/esempi-di-copertura.json', 'C5-E022': 'officina-di-fisica/content/esempi-di-copertura.json', 'C6-AE01': 'officina-di-fisica/content/lotto-001.json'}
READ_SOURCE_SHA256={'C3-E021': '23e3bcb7c72d510d8d1306699b574b7f936cb8008016e8936be5c55df9562e8c', 'C3-E022': 'eef0ad98ad42465e43618a0fc090e1994dfdfa17350fb1a47aee8a5631ffdcf1', 'C3-E023': '73ac06cb7de1a1a99345e66ffd42d3117292d7b695b461348c8fe6fbefd0a465', 'C4-E021': 'a4329128b8ce6181bb71aa3211731e8313687c155af82d7c92b4b81ef3d536e8', 'C5-E021': 'e877c25cf09fbf473addd7d19d0a8475b810b0d7a57d3069eea59d13f5f07902', 'C5-E022': 'c1ea7d3fa44b5224af064de726b900dbd7f2f9430772f602a87357e0eae01b52', 'C6-AE01': 'c53762c1585fc1cacc266a44f5185a4ec0ef4abd19fca876570a7937473529c8'}
READ_ASSETS={'C3-due-cilindri.svg': 'cce5a1ed943fd9f48d84ff72c5610163e4ef685563a9fe1c3d833d34bc1ecdcd', 'C3-convezione.svg': '8452b3e37127429e12ea1133f3930953d26de939ecfb578860a3baef9a2b2610', 'C3-scambio-radiante.svg': 'a349e16243c82c568314d88b0d4bfa7fdff3ac244ddf983b0e448af6276c74a9', 'C4-bussola-nord.svg': '0df5c1a38e4a58f25dd5608367a1bba41d61ce7382b7e995c1449b6663b30794', 'C5-due-fronti.svg': '40341e7154851bd86d00d0ff8d5aab16cee1da6d82e8f945ebe6de592cbdbf3c', 'C5-spettro.svg': 'bfff537db5e0ad8070bd0e10742483e7d3ae4daa72e4ab52da1aba442a95012d', 'C6-galleggiante.svg': '75e4ab92441954d2100ccfacf1bc402a8222ffc8c00b69f042b1e54289990a61'}
FIGURES_BY_ID={'C3-E021': ['C3-due-cilindri.svg'], 'C3-E022': ['C3-convezione.svg'], 'C3-E023': ['C3-scambio-radiante.svg'], 'C4-E021': ['C4-bussola-nord.svg'], 'C5-E021': ['C5-due-fronti.svg'], 'C5-E022': ['C5-spettro.svg'], 'C6-AE01': ['C6-galleggiante.svg']}
SOURCE_ISSUES={}
SI=pint.UnitRegistry(non_int_type=Fraction)


def check(claim,actual,expected,unit='',scope='symbolic_source_claim'):
    if isinstance(actual,SI.Quantity):actual=sp.sympify(actual.to(unit).magnitude)
    residual=sp.simplify(actual-expected)
    return {'claim':claim,'independentExact':str(actual),'expectedValue':str(expected),
            'unit':unit,'dimension':{str(k):str(v) for k,v in SI.Unit(unit).dimensionality.items()},
            'relation':'exact','residual':str(residual),'ok':residual==0,'scope':scope}


def independent_checks():
    F=sp.Rational;Q=SI.Quantity;flag=lambda c:sp.Integer(int(bool(c)))
    actual='actual_source_worked_manual_calculation'
    approx='actual_source_explicit_estimate_or_optional_approximation'
    probe='reviewer_constructed_exact_probe_not_assigned_numeric_exercise'
    amount=F(1,5);cv=F(25,2);cp=F(104,5);heat=100
    deltaA=heat/(amount*cv);deltaB=heat/(amount*cp);internal=amount*cv*deltaB;work=heat-internal
    volume=Q(20,'cm^3');g=Q(F(981,100),'m/s^2');hotdensity=Q(995,'kg/m^3');surround=Q(998,'kg/m^3')
    buoy=surround*g*volume;weight=hotdensity*g*volume;net=buoy-weight
    coefficient=F(4,5)*F(567,10**10)*F(1,100)
    emitted=coefficient*310**4;absorbed=coefficient*300**4;radnet=emitted-absorbed
    pi_lo,pi_hi=F(314159,100000),F(355,113)
    sinlo=lambda x:sum((-1)**j*x**(2*j+1)/sp.factorial(2*j+1) for j in range(6))
    sinhi=lambda x:sum((-1)**j*x**(2*j+1)/sp.factorial(2*j+1) for j in range(7))
    coslo=lambda x:sum((-1)**j*x**(2*j)/sp.factorial(2*j) for j in range(6))
    coshi=lambda x:sum((-1)**j*x**(2*j)/sp.factorial(2*j) for j in range(7))
    lowanglehi=F(737,3600)*pi_hi;highanglelo=F(739,3600)*pi_lo
    period=F(1,50);csound=340;usource=17;front=csound*period;shift=usource*period
    freqs=[sp.Integer(10)**8,F(24,10)*10**9]+[Q(300000000,'m/s')/Q(lam,unit) for lam,unit in [(10,'um'),(500,'nm'),(300,'nm'),(F(1,10),'nm'),(1,'pm')]]
    freqvalues=[f.to('Hz').magnitude if isinstance(f,SI.Quantity) else f for f in freqs]
    mass=F(8,25);area=F(1,500);rho=1000;stiffness=rho*F(981,100)*area;immersion=mass/(rho*area)
    x=sp.Symbol('x',real=True);force=mass*F(981,100)-rho*F(981,100)*area*(immersion+x)
    return {
    'C3-E021':[
        check('actual fixedvolume heatcapacity2point5joulesperkelvin',Q(amount,'mol')*Q(cv,'J/(mol*K)'),F(5,2),'J/K',actual),
        check('actual fixedvolume gain40kelvin',deltaA,40,'K',actual),
        check('actual fixedpressure nominalgain625over26kelvin',deltaB,F(625,26),'K',actual),
        check('explicit approx24point0 has nearesttenth bound',flag(F('23.95')<deltaB<F('24.05')),1,'',approx),
        check('actual nominal internalgain3125over52joules',internal,F(3125,52),'J',actual),
        check('actual nominal work2075over52joules',work,F(2075,52),'J',actual),
        check('explicit approx60point1 valid',flag(F('60.05')<internal<F('60.15')),1,'',approx),
        check('explicit approximateintermediate work39point9 valid',flag(F('39.85')<work<F('39.95')),1,'',approx),
        check('nominal firstlaw100joules closes',internal+work,100,'J'),
        check('roundedworking heatcapacitydifference8point3 notexactSIclaim',cp-cv,F(83,10),'J/(mol*K)',probe),
        check('nominal pVwork usingassignedcapacitydifference',amount*(cp-cv)*deltaB,work,'J'),
    ],
    'C3-E022':[
        check('actual20cubiccentimetres conversion',volume,F(1,50000),'m^3',actual),
        check('actual hydrostaticbuoyancy nominal979038over5million',buoy,F(979038,5000000),'N',actual),
        check('actual hotportionweight195219over1million',weight,F(195219,1000000),'N',actual),
        check('actual netupwardforce2943over5million',net,F(2943,5000000),'N',actual),
        check('explicit estimate5point89eMinus4 nearest3significantfigures',flag(F('0.0005885')<net.to('N').magnitude<F('0.0005895')),1,'',approx),
        check('explicit estimate0point59millinewton nearesthundredth',flag(F('.585')<net.to('mN').magnitude<F('.595')),1,'',approx),
        check('same densities givezeroinitialhydrostaticresultant',(Q(998,'kg/m^3')-Q(998,'kg/m^3'))*g*volume,0,'N',probe),
        check('positive externallydriven hydraulicflow possiblewithoutdensitydifference',Q(4,'Pa')/Q(8,'Pa*s/m^3'),F(1,2),'m^3/s',probe),
    ],
    'C3-E023':[
        check('actual310fourthpower9235210000',sp.Integer(310)**4,9235210000,'K^4',actual),
        check('actual300fourthpower8100000000',sp.Integer(300)**4,8100000000,'K^4',actual),
        check('nominal emittedpower exact523636407over125million',emitted,F(523636407,125000000),'W',actual),
        check('nominal absorbedpower exact45927over12500',absorbed,F(45927,12500),'W',actual),
        check('nominal netpower exact64366407over125million',radnet,F(64366407,125000000),'W',actual),
        check('explicit4point189 emission nearestthousandth',flag(F('4.1885')<emitted<F('4.1895')),1,'',approx),
        check('explicit3point674 absorption nearestthousandth',flag(F('3.6735')<absorbed<F('3.6745')),1,'',approx),
        check('explicit0point515 netnearestthousandth',flag(F('.5145')<radnet<F('.5155')),1,'',approx),
        check('radiative coefficient dimensionalpower',Q(F(4,5),'')*Q(F(567,10**10),'W/(m^2*K^4)')*Q(F(1,100),'m^2')*Q(310,'K')**4,emitted,'W'),
        check('equaltemperatures stilltwoequalnonzerofluxes',coefficient*300**4-coefficient*300**4,0,'W'),
    ],
    'C4-E021':[
        check('upwardcurrent atnorth giveswestvector',sp.Matrix([0,0,1]).cross(sp.Matrix([0,1,0]))[0],-1),
        check('actual resultantcomponentsminus15east20north',sp.Matrix([-15,20,0]).dot(sp.Matrix([-15,20,0])),625,'uT^2',actual),
        check('actual magnitude25microtesla',sp.sqrt(15**2+20**2),25,'uT',actual),
        check('actual exactnorthwestdirection tangentthreequarters',F(15,20),F(3,4),'',actual),
        check('optional36point9 lowerangle bound via rationalTaylor',flag(sinhi(lowanglehi)/coslo(lowanglehi)<F(3,4)),1,'',probe),
        check('optional36point9 upperangle bound via rationalTaylor',flag(sinlo(highanglelo)/coshi(highanglelo)>F(3,4)),1,'',probe),
        check('reversingcurrent reflectssame25magnitude',sp.sqrt((-15)**2+20**2),25,'uT',actual),
        check('switchingoff returns20north',sp.sqrt(0**2+20**2),20,'uT',actual),
    ],
    'C5-E021':[
        check('actual interemissionperiod onefiftiethsecond',Q(F(20,1000),'s'),F(1,50),'s',actual),
        check('actualfirstfronttravel34over5metres',front,F(34,5),'m',actual),
        check('actualsourceadvance17over50metres',shift,F(17,50),'m',actual),
        check('actualforwardfrontseparation323over50metres',front-shift,F(323,50),'m',actual),
        check('actualbackwardfrontseparation357over50metres',front+shift,F(357,50),'m',actual),
        check('actualforwardreceiverinterval19milliseconds',(front-shift)/csound,F(19,1000),'s',actual),
        check('actualbackwardreceiverinterval21milliseconds',(front+shift)/csound,F(21,1000),'s',actual),
        check('arrivalposition cancellation forforwardreceiver',sp.simplify(period+(sp.Symbol('D')-shift)/csound-sp.Symbol('D')/csound),F(19,1000),'s'),
        check('arrivalposition cancellation forbackwardreceiver',sp.simplify(period+(sp.Symbol('D')+shift)/csound-sp.Symbol('D')/csound),F(21,1000),'s'),
        check('sourcefrequency50betweenreceivedfrequencies',flag(F(1000,21)<50<F(1000,19)),1,'',probe),
    ],
    'C5-E022':[
        *[check('actual spectrumfrequency'+str(i),f,want,'Hz',actual) for i,(f,want) in enumerate(zip(freqs,[10**8,2400000000,3*10**13,6*10**14,10**15,3*10**18,3*10**20]))],
        check('actual sevenfrequencies strictlyincreasing',flag(all(a<b for a,b in zip(freqvalues,freqvalues[1:]))),1,'',actual),
        check('vacuumwavelength decreaseswithpositivefrequency',sp.diff(sp.Symbol('c',positive=True)/sp.Symbol('f',positive=True),sp.Symbol('f',positive=True)),-sp.Symbol('c',positive=True)/sp.Symbol('f',positive=True)**2,'m/Hz'),
        check('radio100MHz vacuumwavelength3metres',Q(300000000,'m/s')/Q(100,'MHz'),3,'m',probe),
    ],
    'C6-AE01':[
        check('actual20squarecentimetres conversion',Q(20,'cm^2'),F(1,500),'m^2',actual),
        check('actual equilibriumimmersion16centimetres',Q(immersion,'m'),16,'cm',actual),
        check('actual releasedextreme17centimetres',Q(immersion+F(1,100),'m'),17,'cm',actual),
        check('oppositeextreme15centimetres retainspartialimmersion',Q(immersion-F(1,100),'m'),15,'cm'),
        check('actual stiffness981over50newtonpermetre',Q(rho,'kg/m^3')*g*Q(area,'m^2'),F(981,50),'N/m',actual),
        check('independent buoyancy balance giveslinearrestoringforce',sp.expand(force),-stiffness*x,'N'),
        check('actual nominalforce minus981over5000newton',force.subs(x,F(1,100)),-F(981,5000),'N',actual),
        check('prose force0point196 isvalid3significantfigureestimate',flag(F('.1955')<stiffness*F(1,100)<F('.1965')),1,'',approx),
        check('actual periodexact8pioverroot981',sp.simplify(2*sp.pi*sp.sqrt(mass/stiffness)),8*sp.pi/sp.sqrt(981),'s',actual),
        check('periodsquareunitissecondssquared',Q(mass,'kg')/Q(stiffness,'N/m'),F(16,981),'s^2'),
        check('explicit0point80period rounding frommanualsquaredbounds',flag(F('.795')**2<64*pi_lo*pi_lo/981 and 64*pi_hi*pi_hi/981<F('.805')**2),1,'',approx),
        check('bothmotionextremes strictlyinside30cmheight',flag(0<immersion-F(1,100)<immersion+F(1,100)<F(3,10)),1),
        check('addedmass changesperiod andisexcludedbyprompt',sp.simplify(sp.sqrt((mass+mass)/stiffness)/sp.sqrt(mass/stiffness)),sp.sqrt(2),'',probe),
    ]}


MANUAL={
'C3-E021':'Actualgivenworkingcapacities: nCv=.20*12.5=2.5J/K, so100J gives40K. nCp=.20*20.8=4.16J/K, so100/4.16=625/26=24+1/26K, explicitlyapprox24.0. DeltaUB=nCvDeltaTB=3125/52=60+5/52J, W=2075/52=39+47/52J. Manualintegerboundsjustify60.1and39.9. Source100-60.1=39.9isexactarithmeticofalreadyqualifiedroundedintermediate, notclaimexactUB60.1. NominalCp-Cv8.3istheroundedworkingR ofthesuppliedcapacities, notexactSIuniversalconstant. Q=U+W=100. GasAwarmsmore; worktransferredtopiston/externalmechanicalreservoir, notpartofgasinternalenergy.',
'C3-E022':'PromptasksSTIMA explicitly.20cm³=20e-6m³=1/50000m³. Initialhydrostaticbuoyancy998*9.81/50000=.1958076N; hotportionweight995*9.81/50000=.195219N. Difference3*9.81/50000=.0005886N=.5886mN upward. Assignedestimate5.89e-4N andapprox.59mN havecorrectroundingbounds. Contextstimaqualifiesdisplayedroundedforce, unlike anunqualifiedexact-answer equality. Naturalconvectionfromdensitydifference; pumpcanprovidepressuregradientwithoutdensitydifference. Revieweradditional4Pa/8Pa*s/m³positivehydraulicresistancetoy gives.5m³/s atzerobuoyantdifference, notapredictionoftheactualbathvelocity.',
'C3-E023':'Actualcoefficient.8*.010*5.67e-8=4.536e-10W/K⁴.310⁴=(31²)²*10000=9235210000;300⁴=8100000000. Longmultiplication givesPem523636407/125000000=4.189091256W,Pass45927/12500=3.67416W,net64366407/125000000=.514931256W. Allshownapproximations4.189,3.674,.515correctnearest.001W, explicitlymarkedapprox. Repeatedinteger squaring/powers and multiplication are manualalgorithms, no transcendental/calculatorneed. Givenworking sigma roundsphysicalconstant, not exactSIclaim. Atboth300Knet0whileeachflux3.67416Wnonzero. Oneface,blackisothermalcavitycompleteexposure, absoluteK, netoutpositive.',
'C4-E021':'Actualcurrentup(outoftopview) givesBwirewestatnorth by right-handcrossproductz×y=-x. Components(-15,20)microtesla form3-4-5scaled5, magnitude25microtesla. Directionisnorthwestwith exacttan(alpha)=15/20=3/4=.75, alreadyidentifyinganglewithoutmandatoryinversefunction. Optionalapprox36.9degandabout37degarevalid: reviewer rational sine/cosineTaylorboundsprove36.85<alpha<36.95. Theseoptionalroundingboundsarenotclaimedstudent-assignedTaylorwork. Reversingcurrent gives(+15,20),samemagnitude/mirroredeast;switchoff20north. No fieldmagnitudeaddition35.',
'C5-E021':'ActualT=.020=1/50s. Firstfrontmoves340/50=6.8m,source17/50=.34m. Spacingsforward6.46=323/50m,back7.14=357/50m. Bothfrontsspeed340throughstillair, sointerarrival19/1000sforward and21/1000sbackexact. Independentarrivaltime t_emit+distance/c cancelsreceiverdistance while receiverremainsonthelabelledforward/backwardsideofthetwoemissions; crossingbetweenemissions isnotthisforward/backwardcomparison. Frequencies1000/19>50>1000/21areadditionalreviewerchecks. Source’sfixedcollinearahead/behinddescriptionisreadforthecomparedfronts,nottouniversallyextendconstantDopplertimingthroughapassage.',
'C5-E022':'ActualMHz1e6/GHz1e9 gives1e8and2.4e9Hz. Workingvacuumc3e8 dividedby10um1e-5m=>3e13;500nm5e-7=>6e14;300nm3e-7=>1e15;.10nm1e-10=>3e18;1pm1e-12=>3e20Hz. Integers/powersprovideascendingorder radio,microwaves,IR,visible,UV,X,gamma. Sourceexplicitlynotesmicrowavesarebroadlyradio andX/gammabandoverlap; electronic/nuclearoriginsgivenforthespecificlasttwo, no universalsharpphotonenergyboundaryinvented. WorkingcroundednotexactSI. Spectrumfigureordinal, notlinearorlogarithmicquantitativebandscale.',
'C6-AE01':'Actual20cm²=20*(1e-2)²=.002m². h0=.32/(1000*.002)=.16m, displacement±.01keeps15..17cm submergedbelow30cmheight. Courseworkingg9.81givesk=rhogA=19.62N/m. DownpositiveF=mg-rhogA(h0+x)=-kx, nominalatx.010gives-.1962N;sourceprose-.196Nisvalid3significantfigurepresentation, not a printed exactequalitychain. T=2pi*sqrt(.32/19.62)=8pi/sqrt981seconds. Withoutcalculatingaradicaldecimal, squaredboundsusing3.14159<pi<355/113establish.795²<T²<.805² andoptionalTapprox.80s. Sourceexplicitlyexcludeswateraddedinertiaandfriction; constantsection/partialimmersion makesmodelisochronous. Revieweraddedmadd=mwouldmultiplyperiodsqrt2andisoutsidedomain. No needtoroundedforcefortheperiod.'}
ASSUMPTIONS={
'C3-E021':'Twosametypeideal-gassamples,n.20mol,sameinitialT,closedgasandonlypVwork,onefixedVoneconstantpressure, quasistaticthermalcapacitymodel. SuppliedCv12.5/Cp20.8constantworkingroundeddata;donotasserttheirone-decimaldifferenceexactSI R8.314... . InitialTnotneededforincrements.',
'C3-E022':'Smallhotparcel,quiescentinitialhydrostaticapproximatelyconstantdensitysurroundingwaterabove20C;rhohot995/rhooutside998,volume20cm³,g9.81. Initialverticalpressureplusweightonly,notcompleteacceleratingflowpressure/dragmodel. Subsequentvelocityexplicitlydependsviscosity/mixing;forcedconvectioncanexistindependentlyofdensitydifference.',
'C3-E023':'Onlyonegrayface,.010m²,emissivity/absorptivity.80at310K fullyviewslargeblack300Kisothermalcavitythroughvacuum,viewfactor1inassignedcompleteexposuremodel,noothersupportexchange. AbsoluteK,workingroundedStefanconstant. Netlossdoesnotimplyzeroabsorbedflux;equalTnetzeroallowstwooppositefluxes.',
'C4-E021':'Horizontalcompassandhorizontalbackground20microteslanorth,straightverticalwirecurrentupgives15microteslawestatthegivenpointnorth. Linearfieldsuperposition,needlenorthpolealignsequilibriumresultanthorizontalB;staticfriction/othermagneticfieldsneglected. Optionalnumericdegreeangleissupplementtoexacttan3/4direction.',
'C5-E021':'Stationarycollinearahead/behindreceiversfortherelevanttwoemissions,source17m/srightsubsonic,stillairc340,emissionperiod.020. Sourceclassificationforward/backwardappliesduringcomparison;notuniversalacrossreceiverpassage/transverseDoppler/acceleratingorwindcases.',
'C5-E022':'Allgivenlambdaarevacuumlambda,workingc3e8,frequenciesHz. Ordinalnamedregionsatwell-interiorsamples,notuniversalsharpboundaries;Xelectronic/gammanuclearoriginsstated. No materialindexorfrequencychangedbyobserver.',
'C6-AE01':'Uniformcylindricalverticaltranslation20cm²/height30cm/mass.32kg,rho1000,terrestrialcourseg9.81working. Bothmotionextremespartiallyimmersed;freewatersurface,hydrostaticArchimedes,constantsection,nohysteresis/surfacetension/frictionoraddedwaterinertiaasexplicitlyexcluded. No taperedbody/fullsubmersionextrapolation.'}
PEDAGOGY={key:'Originalfullprompt/allblocksread; actualassignednumericalworkindependentlyderived, exactnominalforms andexplicitestimatesdistinguished. Revieweraddedcounterexamples/roundingboundsnotclaimedasstudentperformanceorrequiredTaylorprocedure. Reviewmetadataignoredasapproval; no sourcekey used.' for key in READ_SOURCE_SHA256}
FIGURE_REVIEW={
'C3-E021':'C3-due-cilindriXML/full580x226renderread. Alockedpiston/Braisedpistonwitholdpositiondashed;equal100Jheatlabels. Cylinderheightsnotassignedcalibratedtemperature/energyaxes;externalworkarrowupmatchesexpansion.',
'C3-E022':'C3-convezioneXML/full580x226renderread. Upwardspintaarrow36.11pxvsdownweight36px andcaptionnearlyequal. Assigneddensityratio998/995differs36.11/36byunder5e-5,reasonablepixelrounding;warmparcel/pressureforceandweightclearlydistinguished. No velocity/pumpflowvalue encoded.',
'C3-E023':'C3-scambio-radianteXML/full580x226renderread. Arrowsemissionfrom310Kfaceandabsorptionfrom300Kcavityoppositeacrossvacuum. Diagramisaschematicexchange,notfiniteparallelplateviewfactorcalibration;arrowlengthsnotpowerscale. EqualTstatementdoesnotturnoffradiation.',
'C4-E021':'C4-bussola-nordXML/full580x226renderread. Leftcurrentdotoutofpage,Pnorthofwire;right20microteslanorth/15westandNWresultantcorrect. Commonoriginswithin1pxstrokeoffset,noexplicitmetricmicrotesla-per-pixelclaim;vectorschematicnotdecimalanglemeasurement.',
'C5-E021':'C5-due-frontiXML/full580x226renderread. Initialsourcex285,new293.5,frontsx115/455.25px/m commonaxis:8.5/.34=170/6.8=178.5/7.14=161.5/6.46=25. Correctsourcebirthpositionversusfirstfrontdirections,captiondeclaresactualspacingscale. Receivernotpictured;regionclassificationfromprompt,notextraunseenpositiondata.',
'C5-E022':'C5-spettroXML/full640x230renderread. Ordinalfrequencylefttoright radio/microwave/IR/visible/UV/X/gamma,lambdaopposite;titleexplicitlyordinal,even79pxspacingnotlinearorlog-frequencyorbandwidthmeasurement.',
'C6-AE01':'C6-galleggianteXML/full700x270renderread. Waterlinehorizontalfixed,constantwidthbodylowered,rightbottomhatchedbandheightxshowsaddedAxvolume. Diagramqualitative,nonumericcentimetre-per-pixelscaledeclared;visible19pxshiftisillustrative,notmetric1cm. Noliteralscaleclaimedfrombodyheight. Downpositiverestoringforceexplainedintext,notamissingarrow.'}

def verify(sources, asset_root=None):
    missing = set(READ_SOURCE_SHA256)-set(sources)
    if missing:
        raise ValueError('Missing independently read examples: '+','.join(sorted(missing)))
    root = Path(asset_root) if asset_root is not None else APP/'static/figures'
    models = independent_checks()
    records = []
    for key in sorted(READ_SOURCE_SHA256):
        row = sources[key]
        errors = []
        if row.get('kind') != 'example' or digest(row) != READ_SOURCE_SHA256[key]:
            errors.append('Example differs from independently read original')
        refs = {'/figures/'+name for name in FIGURES_BY_ID[key]}
        if {b['src'] for b in row.get('blocks', []) if b.get('type') == 'figure'} != refs:
            errors.append('Example figures differ from read original')
        assets = {}
        for name in FIGURES_BY_ID[key]:
            file = root/name
            actual = sha(file.read_bytes()) if file.is_file() else 'MISSING'
            assets['/figures/'+name] = actual
            if actual != READ_ASSETS[name]:
                errors.append('Historical example figure changed or missing')
        if key in SOURCE_ISSUES:
            errors.append(SOURCE_ISSUES[key])
        checks = models[key]
        if not checks or not all(claim['ok'] for claim in checks):
            errors.append('Independent example mathematics failed')
        records.append({'id': key, 'sourceSha256': digest(row), 'sourceVersion': row.get('version', 1),
            'sourceRef': SOURCE_REF, 'sourcePath': SOURCE_PATH_BY_ID[key], 'sourceFileSha256': SOURCE_FILES[SOURCE_PATH_BY_ID[key]],
            'ok': not errors, 'errors': errors, 'checks': checks,
            'dimension': {claim['claim']: claim['dimension'] for claim in checks},
            'calculationScope': 'EXACT_MANUAL_CALCULATION', 'manualArithmetic': MANUAL[key],
            'manualFeasibility': 'FAIL_ORIGINAL_EDITION' if key in SOURCE_ISSUES else 'PASS_AI_EXACT', 'physicalAssumptions': ASSUMPTIONS[key],
            'pedagogicalReview': PEDAGOGY[key], 'assetChecksums': assets, 'figureReview': FIGURE_REVIEW[key],
            'verificationMode': 'INDEPENDENT_EXISTING_EDITION', 'failedPublishedEdition': key in SOURCE_ISSUES,
            'originalEditionRetained': True, 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'})
    return records






def report(sources):
    records=verify(sources)
    return {'schemaVersion':'1.0.0','batch':BATCH,'records':records,
        'verifierSha256':sha(Path(__file__).read_bytes()),'sourceRef':SOURCE_REF,
        'sourcePaths':list(SOURCE_FILES),'sourceFileSha256ByPath':SOURCE_FILES,
        'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),
        'acceptedCount':sum(row['ok'] for row in records),'failedCount':sum(not row['ok'] for row in records),
        'draftReviewedCount':0,'failedPublishedEditionIds':sorted(SOURCE_ISSUES),
        'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
        'reviewer':'separate_AI_reviewer_not_original_author','originalEditionRetained':True,
        'humanApproval':'NOT_RUN','publicationAction':'NONE'}
