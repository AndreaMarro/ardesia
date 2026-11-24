"""Independent reading and exact fluid-mechanics solutions for eight original examples.

This module does not import an authoring generator or a source answer key.
Frozen source/figure signatures bind the separately read edition to its proof.
"""
from fractions import Fraction
from pathlib import Path

import pint
import sympy as sp

from .pipeline import digest,sha
from .review_contract import reviewed_rows

APP=Path(__file__).resolve().parents[2]
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/C2.json'
SOURCE_FILE_SHA256='7f2d3cf84a46d5d0086fd9cd6318b923ee073febc110a52fbc8f682edd995b23'
READ_SOURCE_SHA256={
 "C2-E005": "20ad8b54dc2f2361a5f3b5c64fd757847abb7ae4e0db69841617ce4a27447c94",
 "C2-E006": "eeadaa695d742b80ea3d0a4b693acff2db19f8cf58496543461a2dd95aa5fa64",
 "C2-E007": "2331004f4682ba4d7fe08d140d9a106f3090d4a3a593068b3a59e1b87734fe51",
 "C2-E008": "6cb57405419bdfbb86ad438be8c4f270f543b040653cae20e4580bf83c29d8e6",
 "C2-E009": "b3bd6cec744f7c20e480c93120e57742cbf6c2478afbd4fdfc6288baafe957c0",
 "C2-E010": "0e40bb3454fa75f94c31dd1064d5278f02ed19df44f2da3e9141cc63d736abd7",
 "C2-E011": "7630e860561223ed106dfc09bac6ecd7f7c98f907788e1a13659ab54f1db4914",
 "C2-E012": "7222b1f1d0f3fe515c30281bdb8c1335dd0a61c399ad298c52cde53b5d112989"
}
READ_ASSETS={
 "C2-pressa.svg": "fb80bdf658d0cfc13979a52d2565a71c06f4788e49d6e6b921d746782d8808eb",
 "C2-spinta.svg": "2ecac15c1e05af22a89873203a18b57b63ba18235f8c9fd10acc52628b6a132f",
 "C2-dirama.svg": "7a3295a71362d746c67346fead28e7e41f30322499db9cbc0ea065b121095e6e",
 "C2-bernoulli.svg": "cf0bdde00128d3ba1f7d84cedc7062963a565dcd3b263873fb08d7dcec7efa63",
 "C2-efflusso.svg": "c317f8b741114f2cd273b5b0bed1acb11a43c5674802f2d0ede4296c78b466ee"
}
FIGURE_BY_ID={'C2-E005':'C2-pressa.svg','C2-E007':'C2-spinta.svg',
 'C2-E010':'C2-dirama.svg','C2-E011':'C2-bernoulli.svg','C2-E012':'C2-efflusso.svg'}
SI=pint.UnitRegistry(non_int_type=Fraction)
REVISION_IDS={'C2-E005'}
# Frozen only after the separate reviewer read the final root-authored package,
# all formula/text blocks, actual binding and scientific SVG (also rendered).
REVIEWED_REVISIONS={'C2-E005':'6c1ca118088b01b7005fb6049afe39b08a3f624f5cfb061bf00597e885f5d8d1'}


def check(label,quantity,expected,unit):
    converted=quantity.to(unit)
    actual=sp.Rational(converted.magnitude)
    residual=sp.simplify(actual-expected)
    return {'claim':label,'independentExact':str(actual),'printedValue':str(expected),
      'unit':unit,'dimension':{str(k):str(v) for k,v in converted.dimensionality.items()},
      'relation':'exact','residual':str(residual),'ok':residual==0}


def finite_stroke_counterexample():
    """An admissible ideal liquid retaining its weight refutes the original work.

    Both piston faces start at the same height; the input force is kept at40N.
    If the large piston rises y, volume conservation lowers the small one12y.
    Hydrostatic head is therefore13y. No source value for rho or g rules out
    this water-like counterexample; ideality does not set density to zero.
    """
    y=sp.Symbol('y',nonnegative=True)
    area1,area2=sp.Rational(5,10000),sp.Rational(60,10000)
    rho,gravity=sp.Integer(1000),sp.Integer(10)
    input_force,small_stroke=sp.Integer(40),sp.Rational(12,100)
    large_stroke=area1*small_stroke/area2
    output_force=area2*(input_force/area1-rho*gravity*(area2/area1+1)*y)
    output_work=sp.integrate(output_force,(y,0,large_stroke))
    input_work=input_force*small_stroke
    fluid_energy=rho*gravity*(area1*small_stroke**2+area2*large_stroke**2)/2
    if (sp.simplify(input_work-output_work-fluid_energy)!=0 or output_work!=sp.Rational(4761,1000)
            or output_force.subs(y,large_stroke)!=sp.Rational(2361,5)):
        raise ValueError('Finite-stroke hydrostatic counterexample failed')
    return {'densityKgPerM3':'1000','gMPerS2':'10','largeStrokeM':str(large_stroke),
      'inputForceN':'40','initialOutputForceN':str(output_force.subs(y,0)),
      'finalOutputForceN':str(output_force.subs(y,large_stroke)),
      'inputWorkJ':str(input_work),'outputWorkJ':str(output_work),'fluidPotentialEnergyChangeJ':str(fluid_energy),
      'conclusion':'The original finite-stroke work equality needs an explicitly assigned negligible-head approximation'}


def independent_checks():
    Q=SI.Quantity;F=Fraction
    # Mechanical equilibrium of each piston, equal pressure at equal depth;
    # conservation of the displaced volume independently checks work balance.
    pressure=Q(40,'N')/Q(5,'cm**2')
    load=pressure*Q(60,'cm**2')
    stroke=Q(5,'cm**2')*Q(12,'cm')/Q(60,'cm**2')
    raised_pressure=Q(18,'kPa')-Q(1000,'kg/m**3')*Q(10,'m/s**2')*Q(F(2,5),'m')
    # Weight of the complete body balances weight of the displaced liquid.
    immersed=Q(800,'kg/m**3')*Q(450,'cm**3')/Q(1000,'kg/m**3')
    buoyancy=Q(5,'N')-Q(3,'N')
    displaced=buoyancy/(Q(1000,'kg/m**3')*Q(10,'m/s**2'))
    mass=Q(5,'N')/Q(10,'m/s**2')
    flow=Q(120,'mL')/Q(40,'s')
    mean=flow/Q(15,'mm**2')
    # Areas pi*r^2 are represented separately: pi cancels in the ratio only.
    branch=Q(F(9,20),'m/s')*Q(2,'mm')**2/(4*Q(F(3,2),'mm')**2)
    dynamic=Q(F(1,2),'')*Q(1000,'kg/m**3')*(Q(3,'m/s')**2-Q(1,'m/s')**2)
    head=dynamic/(Q(1000,'kg/m**3')*Q(10,'m/s**2'))
    v=sp.Symbol('v',positive=True)
    # Cancel the two atmospheric pressures in Bernoulli; solve the remaining
    # energy equality, retaining the positive outgoing speed.
    outlet=sp.solve(sp.Eq(10*sp.Rational(4,5),v**2/2),v)[0]
    return {
      'C2-E005':[check('extra pressure transmitted initially',pressure,80000,'Pa'),
       check('output load',load,480,'N'),check('output stroke',stroke,1,'cm'),
       check('input work',Q(40,'N')*Q(12,'cm'),sp.Rational(24,5),'J'),
       check('output work only in the negligible-head model',load*stroke,sp.Rational(24,5),'J'),
       check('finite vertical stroke with liquid weight retained: printed work is not universal',
         Q(Fraction(4761,1000),'J'),sp.Rational(24,5),'J')],
      'C2-E006':[check('hydrostatic pressure loss on rising',Q(18,'kPa')-raised_pressure,4,'kPa'),
       check('output relative pressure',raised_pressure,14,'kPa'),
       check('supportable load',raised_pressure*Q(20,'cm**2'),28,'N')],
      'C2-E007':[check('immersed volume',immersed,360,'cm**3'),
       check('emerged volume',Q(450,'cm**3')-immersed,90,'cm**3'),
       check('immersed fraction',immersed/Q(450,'cm**3'),sp.Rational(4,5),'')],
      'C2-E008':[check('buoyancy from force balance',buoyancy,2,'N'),
       check('displaced body volume',displaced,sp.Rational(1,5000),'m**3'),
       check('body mass from air weight',mass,sp.Rational(1,2),'kg'),
       check('average body density',mass/displaced,2500,'kg/m**3')],
      'C2-E009':[check('volume flow',flow,3,'mL/s'),
       check('volume flow in SI',flow,sp.Rational(3,1000000),'m**3/s'),
       check('tube area in SI',Q(15,'mm**2'),sp.Rational(3,200000),'m**2'),
       check('cross-sectional mean speed',mean,sp.Rational(1,5),'m/s'),
       check('volume passing during one second',Q(15,'mm**2')*mean*Q(1,'s'),3,'mL')],
      'C2-E010':[check('each branch mean speed',branch,sp.Rational(1,5),'m/s'),
       check('four branch fluxes equal inlet flux after cancelling pi',4*Q(F(3,2),'mm')**2*branch,
         sp.Rational(9,5),'mm**2*m/s')],
      'C2-E011':[check('pressure difference from kinetic energy per volume',dynamic,4000,'Pa'),
       check('piezometer level difference from static columns',head,sp.Rational(2,5),'m')],
      'C2-E012':[check('outgoing speed from positive Bernoulli root',Q(outlet,'m/s'),4,'m/s'),
       check('gravitational energy per mass',Q(10,'m/s**2')*Q(F(4,5),'m'),8,'m**2/s**2'),
       check('kinetic energy per mass',Q(F(1,2),'')*Q(outlet,'m/s')**2,8,'m**2/s**2')],
    }


MANUAL={
 'C2-E005':'60/5=12; forza iniziale40·12=480N; volume conservato dà12cm/12=1cm. Il lavoro480/100=24/5J richiede trascurare la variazione idrostatica, non dichiarata nell’originale. Con rho1000,g10 e forza entrante40N costante: finale472,2N, lavoro4761/1000J e aumento energia fluido39/1000J.',
 'C2-E006':'ρgΔh=1000·10·(2/5)=4000Pa=4kPa;18−4=14kPa.20cm²=2/1000m²;14000·2/1000=28N.',
 'C2-E007':'g si cancella nel bilancio di forze;800/1000=4/5;450·4/5=360cm³ immersi e450−360=90cm³ emersi.',
 'C2-E008':'S=5−3=2N;V=2/10000=1/5000m³;m=5/10=1/2kg;ρ=(1/2)/(1/5000)=2500kg/m³.',
 'C2-E009':'120/40=3mL/s=3·10⁻⁶m³/s;15mm²=15·10⁻⁶m²;v=3/15=1/5m/s.15·10⁻⁶·(1/5)=3·10⁻⁶m³ ogni secondo.',
 'C2-E010':'Cancellareπ e le unità mm²: (9/20)·4/[4·(9/4)]=(9/20)·4/9=1/5m/s. Quattro uscite con r²=9/4 danno9/5 dopo cancellazioneπ, come4·9/20 all’ingresso.',
 'C2-E011':'v₂²−v₁²=9−1=8m²/s²;1000·8/2=4000Pa;4000/(1000·10)=2/5m. Pressione maggiore dove la rapidità è minore.',
 'C2-E012':'Le due pressioni atmosferiche eρ si cancellano;v²=2·10·(4/5)=16m²/s². La radice positiva è4m/s, verificata4²/2=8=10·4/5.',
}
ASSUMPTIONS={
 'C2-E005':'Fluido incomprimibile ideale e pistoni leggeri senza attrito, quasi equilibrio e atmosfera esterna comune. Stessa quota solo iniziale: piccolo scende12cm, grande sale1cm; non e assegnato di trascurare la variazione idrostatica o energia gravitazionale del liquido.',
 'C2-E006':'Acqua omogenea ferma, densita1000 e campo10 uniformi; uscita0,40m piu alta, pressione relativa18kPa, pistoni leggeri esposti alla stessa atmosfera.',
 'C2-E007':'Galleggiamento libero in equilibrio, blocco uniforme e impermeabile con densita800 minore di1000; peso dell’aria e capillarita trascurabili, nessun altro sostegno.',
 'C2-E008':'Corpo completamente immerso e fermo senza contatto col recipiente, stessa massa nelle due misure; aria trascurabile; tensione verso l’alto e acqua omogenea.',
 'C2-E009':'Flusso stazionario, sezione15mm² ortogonale al flusso, velocita media sulla sezione; non si richiede profilo uniforme o velocita locale.',
 'C2-E010':'Flusso stazionario incomprimibile senza accumulo o perdite laterali; quattro rami con uguale portata, velocita medie e raggi dichiarati.',
 'C2-E011':'Bernoulli per flusso ideale stazionario incomprimibile, punti sulla stessa quota lungo una linea di corrente; piezometri statici aperti alla stessa atmosfera, senza capillarita.',
 'C2-E012':'Serbatoio grande aperto e piccolo foro, quasi stazionarieta, velocita superficiale trascurabile, getto libero alla stessa atmosfera; modello inviscido, non coefficiente reale di efflusso.',
}
PEDAGOGY={
 'C2-E005':'FAIL dell’edizione originale: forza iniziale480N e corsa1cm sono coerenti, ma il controllo dei lavori attribuisce480N costanti alla corsa verticale finita senza dichiarare trascurabile la variazione idrostatica. Non trasformare una moltiplicazione aritmetica corretta in attestazione del modello non qualificato.',
 'C2-E006':'Distingue incremento uniforme di Pascal da differenza idrostatica preesistente. Salendo si sottraeρgΔh; aggiungerlo darebbe44N, usare18kPa senza quota darebbe36N.',
 'C2-E007':'Distingue volume intero nel peso e volume immerso nella spinta.360cm³ risponderebbe alla domanda diversa sulla parte immersa;90cm³ è il residuo. Figura qualitativa senza scala, non strumento per misurare4/5.',
 'C2-E008':'Prima il bilancio delle tre forze, poi volume spostato e massa. La lettura3N in acqua non è il peso3N: usare3/g darebbe densita1500 sbagliata. Risultato2500>1000 coerente.',
 'C2-E009':'Distingue volume, portata e velocita media. Conversione di area col quadrato del prefisso e controllo tramite cilindro da3mL; nessuna analogia che imponga profilo uniforme.',
 'C2-E010':'Contorno del nodo e conservazione del volume prima della velocita in un ramo. L’area complessiva9πmm² supera4πmm², quindi rapidita diminuisce; dimenticare i quattro rami darebbe4/5m/s.',
 'C2-E011':'Pressione statica distinta dal termine cinetico; la colonna piu alta indica pressione maggiore. Mettere(3−1) al posto di(9−1) darebbe1000Pa, non4000. Segno delle quote e delle pressioni coerente.',
 'C2-E012':'Punti e condizioni di Bernoulli espliciti; radice positiva, densita cancellata, risultato ideale distinto da misura reale. h è dislivello libero-foro, non profondita totale del contenitore.',
}
FIGURE_REVIEW={
 'C2-E005':'Pistoni alla stessa quota collegati dal liquido; F1 verso il basso e F2 verso l’alto, A1 minore diA2. Caption esplicita senza scala: nessun rapporto numerico inferito dalle larghezze.',
 'C2-E007':'Blocco che attraversa superficie, frecceS/P opposte di uguale lunghezza, parti immerse/emerse distinte. Schema qualitativo senza quote: proporzione grafica non usata come misura del rapporto4/5.',
 'C2-E010':'Un ingresso comune si divide esattamente in quattro rami distinti Q1..Q4; spessori schematici, non sezioni da misurare.',
 'C2-E011':'Piezometro1 nella parte larga ha livello maggiore del2 nella parte stretta; delta_h tra livelli liberi, non tra bocche del tubo. Tubo orizzontale schematico senza scala quantitativa.',
 'C2-E012':'h dalla superficie libera alla quota del foro; parete aperta nel punto d’uscita e freccia verso esterno. Disegno non impone una velocita superficiale finita.',
}


def verify_originals(sources,asset_root=None):
    if set(READ_SOURCE_SHA256)-set(sources):raise ValueError('Missing independently read examples')
    asset_root=Path(asset_root) if asset_root is not None else APP/'static/figures'
    models=independent_checks();records=[]
    for key,pinned in READ_SOURCE_SHA256.items():
        row=sources[key];errors=[];assets={}
        if row.get('kind')!='example' or digest(row)!=pinned:errors.append('Source differs from independently read edition')
        name=FIGURE_BY_ID.get(key);expected={'/figures/'+name} if name else set()
        actual={b['src'] for b in row.get('blocks',[]) if b.get('type')=='figure'}
        if actual!=expected:errors.append('Figure references differ from read edition')
        if name:
            file=asset_root/name;value=sha(file.read_bytes()) if file.is_file() else 'MISSING';assets['/figures/'+name]=value
            if value!=READ_ASSETS[name]:errors.append('Scientific figure changed or missing')
        if not all(c['ok'] for c in models[key]):errors.append('Independent fluid mechanics failed')
        if key=='C2-E005':
            errors.append('Published stroke-work equality silently neglects the changing hydrostatic head of vertical pistons; the source does not assign this approximation')
        record={'id':key,'sourceSha256':digest(row),'sourceVersion':row.get('version',1),
          'ok':not errors,'errors':errors,'checks':models[key],'manualArithmetic':MANUAL[key],
          'calculationScope':'EXACT_MANUAL_CALCULATION','manualFeasibility':'FAIL_ORIGINAL_EDITION' if key=='C2-E005' else 'PASS_AI_EXACT',
          'physicalAssumptions':ASSUMPTIONS[key],'pedagogicalReview':PEDAGOGY[key],
          'assetChecksums':assets,'figureReview':FIGURE_REVIEW.get(key,'No figure in this source record'),
          'verificationMode':'INDEPENDENT_EXISTING_EDITION','originalEditionRetained':True,
          'failedPublishedEdition':key=='C2-E005','humanApproval':'NOT_RUN','publicationAction':'NONE'}
        if key=='C2-E005':record['physicalCounterexample']=finite_stroke_counterexample()
        records.append(record)
    return records


def revised_piston_checks():
    """Exact checks inside the NEW explicitly assigned negligible-head model."""
    Q=SI.Quantity
    area_ratio=Q(60,'cm**2')/Q(5,'cm**2')
    pressure=Q(40,'N')/Q(5,'cm**2')
    volume=Q(5,'cm**2')*Q(12,'cm')
    output_force=pressure*Q(60,'cm**2')
    large_stroke=volume/Q(60,'cm**2')
    return [check('area ratio',area_ratio,12,''),
      check('assigned common additional pressure',pressure,80000,'Pa'),
      check('constant output force in assigned approximation',output_force,480,'N'),
      check('conserved displaced volume',volume,60,'cm**3'),
      check('large piston stroke',large_stroke,1,'cm'),
      check('input work in assigned approximation',Q(40,'N')*Q(12,'cm'),sp.Rational(24,5),'J'),
      check('output work in assigned approximation',output_force*large_stroke,sp.Rational(24,5),'J'),
      check('independent pressure-volume work',pressure*volume,sp.Rational(24,5),'J')]


def verify(sources,package=None,bindings=None,asset_root=None,original_asset_root=None):
    historical_root=original_asset_root if original_asset_root is not None else asset_root if package is None else None
    originals=verify_originals(sources,historical_root)
    if package is None:
        if bindings is not None:raise ValueError('Bindings require a revision package')
        return originals
    if bindings is None:raise ValueError('Revision package requires complete source bindings')
    asset_root=Path(asset_root) if asset_root is not None else APP/'editorial/assets'
    rows=reviewed_rows(package,bindings,REVIEWED_REVISIONS,REVISION_IDS,asset_root)
    by_id={row['id']:row for row in originals}
    for row,binding,signature,assets,errors in rows:
        key=row['id'];original=by_id[key]
        if (binding['sourceRef']!=SOURCE_REF or binding['sourceId']!=key
                or binding['sourceSha256']!=original['sourceSha256']
                or original['sourceSha256']!=READ_SOURCE_SHA256[key]):
            errors.append('Revision not bound to the independently read original')
        if (row.get('kind')!='example' or row.get('version')!=original['sourceVersion']+1
                or row.get('baseVersion')!=original['sourceVersion']):
            errors.append('Expected additive next example edition with correct base version')
        for src,value in original['assetChecksums'].items():
            if value!=READ_ASSETS[src.removeprefix('/figures/')]:
                errors.append('Retained historical scientific figure changed or missing')
        checks=revised_piston_checks()
        if not all(c['ok'] for c in checks):errors.append('Independent revised piston model failed')
        reviewed=dict(original)
        reviewed.update(ok=not errors,errors=errors,checks=checks,
          dimension={c['claim']:c['dimension'] for c in checks},
          manualArithmetic='60/5=12;40·12=480N; spostato5·12=60cm³, corsa grande60/60=1cm. Lavori40·12/100=480/100=24/5J, uguali nel modello che ESCLUDE esplicitamente la variazione idrostatica; anche pressione80kPa per volume60cm³ dà24/5J.',
          manualFeasibility='PASS_AI_EXACT',
          physicalAssumptions='NEW DRAFT: common external atmosphere, incompressible liquid, no friction or piston inertia, and explicit assigned approximation neglecting hydrostatic pressure changes and gravitational energy changes of liquid throughout the finite stroke; pistons only initially at equal height.',
          pedagogicalReview='New edition independently read: declares the approximation before calculations and explains its boundary afterward; exact within assigned model. This does not approve the failed historical edition.',
          assetChecksums=assets,candidateSha256=digest(row),reviewedSignature=signature,
          candidateVersion=row['version'],baseVersion=row['baseVersion'],
          failedPublishedEdition=True,publishedEditionReview=original,reviewedEdition='NEW_DRAFT',
          verificationMode='EXACT_ORACLE',publicationAction='DRAFT',
          figureReview='Three explicitly schematic stages, no geometric or arrow scale claimed: forces40/480N, opposite strokes12/1cm, preserved volume60cm³, works24/5J within the declared approximation. Explicitly states that pistons do not remain at equal height.')
        # The counterexample belongs to the historical judgment, not this model.
        reviewed.pop('physicalCounterexample',None)
        by_id[key]=reviewed
    return [by_id[key] for key in sorted(by_id)]


def report(sources,package=None,bindings=None):
    records=verify(sources,package,bindings)
    return {'schemaVersion':'1.0.0','batch':'examples-c2-activities-006','records':records,
      'verifierSha256':sha(Path(__file__).read_bytes()),'sourceRef':SOURCE_REF,'sourcePath':SOURCE_PATH,
      'sourceFileSha256':SOURCE_FILE_SHA256,'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),
      'acceptedCount':sum(r['ok'] for r in records),'failedCount':sum(not r['ok'] for r in records),
      'draftReviewedCount':sum(r['publicationAction']=='DRAFT' for r in records),'failedPublishedEditionIds':['C2-E005'],
      'reviewer':'separate_AI_reviewer_not_original_or_revision_author','dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'humanApproval':'NOT_RUN','publicationAction':'NONE','originalEditionRetained':True}
