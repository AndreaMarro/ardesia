"""Independent source-first thermal review; no candidate authoring imports.
Literal signatures freeze only editions read independently, including final textual corrections.
"""
from fractions import Fraction
from functools import lru_cache
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET
import pint
import sympy as sp
import hypothesis
from .pipeline import canonical,digest,git_bytes,sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF="5cfbdcb055ba3ba136f97fb56e997f06e6cf3605"
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-01.json"
FAMILY='gas-density'
BATCH='gas-density-150'
ASSET_NAME='gas-density-progressive.svg'
CANDIDATE_REF='e32c3ae9940ec58e01eef921ad4b0dbfd3557b44'
REVIEWED_PACKAGE_SHA256='e0e323fa5a530f2e47a7e285d6819b50cda0feb9afedae67354c8f02240bf00d'
REVIEWED_BINDINGS_SHA256='659a29d778f121eb48dd825a0ccb12ab1cabb518df73504bd6fecbbc6820825e'
PRIMARY_SHA256='1a8bb11b9c09dc191e31fc3f835425f2b885393a693926bff8cfd93d35d6dc2d'
SOURCE_REFERENCE='Combine n/V=p/(RT) with m=nM to derive mass density; preserve prescribed R=8 approximation and actual composition. Keep provided molecular translational-energy law 08 separate.'
FALSE_PROOF='Un grammo per litro corrisponde a mille kg/m³, quindi va aggiunto un fattore mille alla densità.'
SVG_MUTATION=(b'width="320"', b'width="321"')
EXPECTED_MAPPING={1: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 2: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 3: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 4: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 5: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 6: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 7: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 8: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 9: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 10: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 11: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 12: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 13: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 14: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 15: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 16: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02'])}
NUMERIC_UNITS={1: 'g/L', 5: 'kPa', 6: 'K', 14: 'kPa'}
OPTION_SUFFIX={7: '', 8: '', 11: '', 12: ' g/L', 13: '', 15: ' kPa'}
UNITS={1: 'gram/liter', 2: 'gram/liter', 3: 'gram/liter', 4: 'gram/liter', 5: 'kilopascal', 6: 'kelvin', 7: 'dimensionless', 8: 'dimensionless', 9: 'kilopascal', 10: 'dimensionless', 11: 'dimensionless', 12: 'gram/liter', 13: 'dimensionless', 14: 'kilopascal', 15: 'kilopascal', 16: 'dimensionless'}
MANUAL=['4 ×80/320=1 g/L.', 'dimensione massa per volume; identificare l’unica alternativa compatibile.', 'legge ρ=pM/(RT); il coefficiente quattro della forma numerica non è adimensionale se si lavora con quantità fisiche.', 'p=160 kPa a T=320 K dà 2 g/L; raddoppia.', 'p=ρRT/M=80 kPa.', 'T=pM/(Rρ)=320 K.', 'dimezzare T a p fisso dà ρ_B=2 g/L, rapporto due.', 'energia cinetica traslazionale media per molecola è proporzionale a T; 900/300=3. Nessuna radice: non è rapporto di velocità quadratiche medie.', 'p=ρRT/M, cioè p[kPa]=ρ[g/L]T[K]/4 nelle unità dichiarate.', 'rapporto κ₁/κ₂.', 'B dà 4 ×160/160=4 g/L; rapporto quattro.', 'media (1+4)/2=5/2 g/L; agli ingressi medi 4 ×120/240=2 g/L, distinto.', 'a p doppia per avere ρ quadrupla serve T dimezzata: rapporto 1/2.', 'q=3 L/g; S=12 dà ρ=4 g/L. A T=160 K si ricava p=160 kPa.', 'q=(9−3)/(4−1)=2 L/g; b=1. S=5 dà ρ=2 g/L, T=320 K dà p=160 kPa.', 'p=cT con c=(1/4) kPa/K rende ρ=1 g/L per tutte le T positive del modello. Infinite coppie, ad esempio (80 kPa,320 K) e (40 kPa,160 K).']
DISTRACTORS=['1/4 omette M/R=4,4 copia il coefficiente,80 p e 1000 aggiunge un prefisso inesistente;1 g/L=1 kg/m³.', 'g L è un prodotto, mol/L è densità molare, g è massa e K temperatura. Serve massa su volume.', 'Scambiare M e R non converte moli in massa; RT/(pM) è inversa di densità, il T al numeratore cambia la dipendenza.', '4 quadra il raddoppio,1/2 lo inverte,160 copia p e 1 ignora il nuovo stato; non occorre massa totale doppia.', '1280 moltiplica per quattro,320 lo omette e 1/80 inverte il numero del risultato. La pressione resta assoluta.', '80 perde M/R e 1 copia la densità. T deve essere tolta dal denominatore della legge e poi si divide per ρ;320 °C non è320 K.', '1/2 usa dipendenza termica diretta,4 aggiunge un quadrato,1 ignora T.1/4=(T_B/T_A)² combina dipendenza diretta e quadrato, non due inversioni.', '9 quadra il rapporto energetico lineare;√3 riguarda una scala di velocità,1/3 inverte e 1 ignora T. Non sono densità o energie interne totali di molecole con moti interni.', 'ρM/(RT) riapplica il fattore diretto; reciproci invertono la dipendenza da ρ e T al denominatore non isola p. Le unità delle quattro alternative sono incompatibili con pressione.', 'Prodotto rende T diretta, reciproco scambia stati, quadrato altera p e somma dà 2 per stati uguali. M comune è essenziale.', '2 conta solo un effetto,1/2 solo T,1/4 è reciproco completo e 1 cancella effetti che in realtà aumentano entrambi ρ.', '5 è somma,3/2 semidifferenza,4 solo B e 2 il modello agli ingressi medi. Nessun mescolamento è assegnato.', '2 inverte,4 copia il target e 1/4 ignora il raddoppio di p;1 darebbe solo densità doppia.', '480 usa S=12 come g/L anziché decodificare 4;4 copia ρ e 80 la vecchia p. q ha unità L/g.', '80 ignora la densità nuova,320 copia T,200 dimentica b e 400 usa S come densità. Solo 160 ricostruisce S=5.', 'Misura e vincolo ripetono la stessa relazione p/T. Due esempi non esauriscono le coppie; la coppia nulla ha T=0 e rende la legge indefinita.']
ASSUMPTIONS=['Gas ideale in equilibrio con composizione invariata, M=32 g/mol e R=8 J/(mol K) esplicitamente prescritto come approssimazione; pressione assoluta e temperatura assoluta positive. Densità di massa distinta da densità molare. Display continuo con guadagno positivo.', 'Gas ideale in equilibrio con composizione invariata, M=32 g/mol e R=8 J/(mol K) esplicitamente prescritto come approssimazione; pressione assoluta e temperatura assoluta positive. Densità di massa distinta da densità molare. Display continuo con guadagno positivo.', 'Gas ideale in equilibrio con composizione invariata, M=32 g/mol e R=8 J/(mol K) esplicitamente prescritto come approssimazione; pressione assoluta e temperatura assoluta positive. Densità di massa distinta da densità molare. Display continuo con guadagno positivo.', 'Gas ideale in equilibrio con composizione invariata, M=32 g/mol e R=8 J/(mol K) esplicitamente prescritto come approssimazione; pressione assoluta e temperatura assoluta positive. Densità di massa distinta da densità molare. Display continuo con guadagno positivo.', 'Gas ideale in equilibrio con composizione invariata, M=32 g/mol e R=8 J/(mol K) esplicitamente prescritto come approssimazione; pressione assoluta e temperatura assoluta positive. Densità di massa distinta da densità molare. Display continuo con guadagno positivo.', 'Gas ideale in equilibrio con composizione invariata, M=32 g/mol e R=8 J/(mol K) esplicitamente prescritto come approssimazione; pressione assoluta e temperatura assoluta positive. Densità di massa distinta da densità molare. Display continuo con guadagno positivo.', 'Gas ideale in equilibrio con composizione invariata, M=32 g/mol e R=8 J/(mol K) esplicitamente prescritto come approssimazione; pressione assoluta e temperatura assoluta positive. Densità di massa distinta da densità molare. Display continuo con guadagno positivo.', 'Caso separato 08: legge fornita della sola energia cinetica traslazionale media per molecola ideale classica in equilibrio, k_B positivo, T assolute 300 e 900 K. Non è energia interna totale o densità.', 'Gas ideale in equilibrio con composizione invariata, M=32 g/mol e R=8 J/(mol K) esplicitamente prescritto come approssimazione; pressione assoluta e temperatura assoluta positive. Densità di massa distinta da densità molare. Display continuo con guadagno positivo.', 'Gas ideale in equilibrio con composizione invariata, M=32 g/mol e R=8 J/(mol K) esplicitamente prescritto come approssimazione; pressione assoluta e temperatura assoluta positive. Densità di massa distinta da densità molare. Display continuo con guadagno positivo.', 'Gas ideale in equilibrio con composizione invariata, M=32 g/mol e R=8 J/(mol K) esplicitamente prescritto come approssimazione; pressione assoluta e temperatura assoluta positive. Densità di massa distinta da densità molare. Display continuo con guadagno positivo.', 'Gas ideale in equilibrio con composizione invariata, M=32 g/mol e R=8 J/(mol K) esplicitamente prescritto come approssimazione; pressione assoluta e temperatura assoluta positive. Densità di massa distinta da densità molare. Display continuo con guadagno positivo.', 'Gas ideale in equilibrio con composizione invariata, M=32 g/mol e R=8 J/(mol K) esplicitamente prescritto come approssimazione; pressione assoluta e temperatura assoluta positive. Densità di massa distinta da densità molare. Display continuo con guadagno positivo.', 'Gas ideale in equilibrio con composizione invariata, M=32 g/mol e R=8 J/(mol K) esplicitamente prescritto come approssimazione; pressione assoluta e temperatura assoluta positive. Densità di massa distinta da densità molare. Display continuo con guadagno positivo.', 'Gas ideale in equilibrio con composizione invariata, M=32 g/mol e R=8 J/(mol K) esplicitamente prescritto come approssimazione; pressione assoluta e temperatura assoluta positive. Densità di massa distinta da densità molare. Display continuo con guadagno positivo.', 'Gas ideale in equilibrio con composizione invariata, M=32 g/mol e R=8 J/(mol K) esplicitamente prescritto come approssimazione; pressione assoluta e temperatura assoluta positive. Densità di massa distinta da densità molare. Display continuo con guadagno positivo.']
PEDAGOGY=['La legge è motivata prima della sostituzione e il risultato resta legato alla grandezza chiesta, con unità esplicite.', 'È distinta la dimensione della grandezza dalla scala del prefisso e da grandezze fisiche di nome vicino.', 'Il caso concettuale o la legge richiesta sono spiegati con le loro ipotesi, senza una scorciatoia dal numero della chiave.', 'Il confronto controllato tiene fermi gli altri ingressi e non assegna al risultato automaticamente il fattore del solo ingresso.', 'L’inversa è svolta prima con i simboli e controllata per sostituzione e positività.', 'L’incognita o il caso separato sono riconosciuti prima di applicare la legge; sono esplicitati unità e dominio.', 'Le due risposte vengono valutate prima del rapporto e i singoli fattori non sono confusi con il risultato totale.', 'Il caso specifico è distinto dalla sola procedura numerica comune; lo scarto o la diversa legge sono motivati.', 'L’inversa simbolica include la condizione che rende lecita la divisione e mantiene le unità delle quantità.', 'I fattori sono sostituiti nei rispettivi ingressi prima del rapporto e le ipotesi di confronto sono esplicite.', 'Entrambi gli ingressi modificati sono valutati nello stesso modello prima di ridurre il rapporto.', 'La media statistica è distinta da un processo fisico; è spiegato quando il modello conserva o non conserva le medie.', 'Il bersaglio è ricostruito prima dell’inversa e il rapporto richiesto è distinto dal valore finale dell’ingresso.', 'La taratura del display continuo è separata dall’inversa della legge fisica.', 'Guadagno e offset sono ricavati da due riferimenti distinti e rimossi prima di ricostruire la grandezza fisica.', 'Il vincolo o il ciclo separato sono sostituiti nella legge prima di discutere unicità, dominio e grandezza richiesta.']
EXPECTED_IDS={f"AR-u5-{FAMILY}-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u5-gas-density-01": "cd5d556989d7fa516e39c54bab6f246f2aef88b98f3bf657e74e51e398c73606",
    "AR-u5-gas-density-02": "1baed93d21c0ed5e654813d075d2dfc8903fdb7dcc5463782d75deeb6490188b",
    "AR-u5-gas-density-03": "0937a91de7ccb499a8de2e15ae37698b1258936fc30d9ccc6855f3a1bcb6d7d6",
    "AR-u5-gas-density-04": "c9f21a52458d3f5d6e3e0fc313af7f5f002153cf833464fd78ab35818ecd99ff",
    "AR-u5-gas-density-05": "243327dc38ace8310e9a20e5fb076175677e7bfe4e349aa63a0b49011e0b0785",
    "AR-u5-gas-density-06": "502d3a7356388ae623dff3792b1cf4fb6e0522ccad7f2b86417aaa9b5e53a290",
    "AR-u5-gas-density-07": "b8f2a1283443612360d0c81a3b0d5135d6efb320218e6008ae00a88b3d1d6cdf",
    "AR-u5-gas-density-08": "6a243d2a19854585faaf9b31a4a2a1bb93b538f21686d4e0fd4920a7e549a890",
    "AR-u5-gas-density-09": "c21312967db061db3561b915ac911c97a8bf835f30d037c500bab2af2931350c",
    "AR-u5-gas-density-10": "f477caa91276aa6c97d85464808c0e6b810ea49e99ea5c1359612e50a152ce86",
    "AR-u5-gas-density-11": "3bb01e3f505ed1076207b58187699aafb7cc2fc72c640d018dd911b6dedc26a6",
    "AR-u5-gas-density-12": "990b6bb2bd0a8c6244aa78f0068e2202e5877671ee0966bcbbf808f33a343724",
    "AR-u5-gas-density-13": "ac5a6d8f70e7d4900ab8c120445a2dcfbe0eea72f50b09a668ec0603a9993c4a",
    "AR-u5-gas-density-14": "09715e150997cb20245b5644ab5810305c793d1f3395a451193566a7966a98b8",
    "AR-u5-gas-density-15": "e90fdb0d89a195e102816a45de78b2ad36078653295accc4e3b77652b71674fa",
    "AR-u5-gas-density-16": "51911d4886d92371ab998430afa2badc51568036e402550ad48ef25068c069c0"
}

@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}

def parse_literal(raw):
    """Bounded exact decimal/fraction or single radical monomial; no eval."""
    if not isinstance(raw,str) or len(raw)>80:raise ValueError("Bounded exact literal required")
    raw=raw.strip().replace("−","-")
    number=r"[+-]?[0-9]+(?:[.,][0-9]+)?"
    match=re.fullmatch("("+number+")(?:/("+number+"))?",raw)
    if match:
        try:
            value=Fraction(match[1].replace(",","."))
            if match[2]:value/=Fraction(match[2].replace(",","."))
            result=sp.Rational(value)
        except (ValueError,ZeroDivisionError) as error:raise ValueError("Invalid rational literal") from error
    else:
        match=re.fullmatch(r"([+-]?[0-9]*)√([0-9]{1,4})(?:/([0-9]{1,8}))?",raw)
        if not match:raise ValueError("Outside independently reviewed exact literal grammar")
        coefficient,radicand,denominator=match.groups();coefficient={"":"1","+":"1","-":"-1"}.get(coefficient,coefficient)
        denominator=int(denominator or 1)
        if denominator==0:raise ValueError("Zero radical denominator")
        result=sp.Rational(coefficient)*sp.sqrt(int(radicand))/denominator
    if result.is_finite is not True or result.is_real is not True:raise ValueError("Finite real exact literal required")
    return result

def equivalent_literal(wanted):
    wanted=sp.Rational(wanted)
    return f"{2*wanted.p}/{2*wanted.q}"

def parse_option(number,option):
    if BATCH=="isothermal-work-152" and number==12 and option=="(15 ln 3 / ln 2) J":
        return 15*sp.log(3)/sp.log(2)
    suffix=OPTION_SUFFIX.get(number,"")
    if suffix and not option.endswith(suffix):raise ValueError("Required literal physical unit absent")
    return parse_literal(option.removesuffix(suffix) if suffix else option)

def calibrate(first,second,reference_reading,new_reading,reading_a,reading_b,third_reading,unit):
    q,z=sp.symbols("q z",real=True)
    first,second=sp.Rational(first),sp.Rational(second)
    gain=sp.cancel(sp.Rational(reference_reading)/first)
    decoded=sp.cancel(sp.Rational(new_reading)/gain)
    fit=sp.solve([sp.Eq(q*first+z,reading_a),sp.Eq(q*second+z,reading_b)],(q,z))
    assert first!=second and gain>0 and fit[q]>0
    physical=(SI.Quantity(Fraction(reference_reading),"")/SI.Quantity(Fraction(first),unit)).to("1/("+unit+")")
    assert sp.simplify(sp.Rational(physical.magnitude)-gain)==0
    return gain,fit[z],decoded,sp.cancel((third_reading-fit[z])/fit[q])

def physical_density(pressure,temperature,molar_mass=32,gas_constant=8):
    pressure,temperature,molar_mass,gas_constant=map(Fraction,(pressure,temperature,molar_mass,gas_constant))
    if min(pressure,temperature,molar_mass,gas_constant)<=0:raise ValueError("Positive absolute state and fixed composition required")
    quantity=(SI.Quantity(pressure,"kilopascal")*SI.Quantity(molar_mass,"gram/mole")/(SI.Quantity(gas_constant,"joule/(mole*kelvin)")*SI.Quantity(temperature,"kelvin"))).to("gram/liter")
    return Fraction(quantity.magnitude)

def pressure_from_density(density,temperature,molar_mass=32,gas_constant=8):
    density,temperature,molar_mass,gas_constant=map(Fraction,(density,temperature,molar_mass,gas_constant))
    if min(density,temperature,molar_mass,gas_constant)<=0:raise ValueError("Positive mass density and absolute state required")
    return Fraction((SI.Quantity(density,"gram/liter")*SI.Quantity(gas_constant,"joule/(mole*kelvin)")*SI.Quantity(temperature,"kelvin")/SI.Quantity(molar_mass,"gram/mole")).to("kilopascal").magnitude)

def temperature_from_density(density,pressure,molar_mass=32,gas_constant=8):
    density,pressure,molar_mass,gas_constant=map(Fraction,(density,pressure,molar_mass,gas_constant))
    if min(density,pressure,molar_mass,gas_constant)<=0:raise ValueError("Positive mass density, absolute pressure and composition required")
    return Fraction((SI.Quantity(pressure,"kilopascal")*SI.Quantity(molar_mass,"gram/mole")/(SI.Quantity(gas_constant,"joule/(mole*kelvin)")*SI.Quantity(density,"gram/liter"))).to("kelvin").magnitude)

def redundant_density(coefficient,measured_density,molar_mass=32,gas_constant=8):
    coefficient,measured_density,molar_mass,gas_constant=map(Fraction,(coefficient,measured_density,molar_mass,gas_constant))
    if min(coefficient,measured_density,molar_mass,gas_constant)<=0:raise ValueError("Positive cross-state coefficient and composition required")
    if measured_density!=coefficient*molar_mass/gas_constant:raise ValueError("Incompatible redundant density measurement")
    return "infinite"

@lru_cache(maxsize=1)
def oracle():
    p,T,M,R,rho,a,b,n,V=sp.symbols("p T M R rho a b n V",positive=True)
    molar_density=sp.solve(sp.Eq(p*V,n*R*T),n)[0]/V
    law=sp.cancel(molar_density*M)
    assert law==p*M/(R*T)
    assert sp.solve(sp.Eq(rho,law),p)[0]==rho*R*T/M
    assert sp.solve(sp.Eq(rho,law),T)[0]==p*M/(R*rho)
    assert sp.cancel(law.subs({p:a*p,T:b*T},simultaneous=True)/law)==a/b
    first=sp.Rational(physical_density(80,320));second=sp.Rational(physical_density(160,160))
    assert (first,second)==(1,4)
    assert SI.Quantity(1,"gram/liter").to("kilogram/meter**3").magnitude==1
    assert (first+second)/2-physical_density(120,240)==sp.Rational(1,2)
    gain,offset,decoded,affine=calibrate(first,second,3,12,3,9,5,"gram/liter")
    assert (gain,offset,decoded,affine)==(3,1,4,2)
    k,t1,t2=sp.symbols("k t1 t2",positive=True)
    mean_kinetic=sp.Rational(3,2)*k*T
    assert sp.cancel(mean_kinetic.subs(T,t2)/mean_kinetic.subs(T,t1))==t2/t1
    assert redundant_density(Fraction(1,4),1)=="infinite"
    return [first,"g/L","ρ = p M / (R T)","Da 1 a 2 g/L",sp.Rational(pressure_from_density(1,320)),sp.Rational(temperature_from_density(1,80)),sp.Rational(physical_density(80,160))/first,sp.Rational(900,300),
      "p = ρ R T / M","κ₁ / κ₂",second/first,(first+second)/2,sp.Rational(temperature_from_density(4,160))/320,
      sp.Rational(pressure_from_density(decoded,160)),sp.Rational(pressure_from_density(affine,320)),"Infinite coppie: qualsiasi T>0 con p=kT"]

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    rects={tuple(Fraction(e.get(k,"0")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    required={(100,705,80*physical_density(80,320),40),(100,845,80*physical_density(160,160),40),(100,1290,100,35),(100,1420,100*Fraction(900,300),35)}
    if not required<=rects:raise ValueError("Independent physical scale of density or molecular-energy bars changed")
    return "Full XML and full-height Chrome image independently read. The unit derivation preserves M=32 g/mol and prescribed R=8 kPa L/(mol K). Density bars 80 and 320 px at 80 px/(g/L) share x100 zero and encode 1 and 4 g/L. The separate task08 panel has normalized molecular translational-energy bars 100 and 300 px at 100 px per pure unit, not density; ratio 900/300=3. The statement 1 g/L=1 kg/m^3 is dimensionally exact; no gratuitous factor 1000. Labels and panel distinctions read."

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected independently reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    expected=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    records=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);number=int(row["id"].rsplit("-",1)[1]);source_id="u5-"+FAMILY+f"-{number:02}"
        source=originals[source_id];provenance=b.get("provenance",{})
        if b.get("sourceId")!=source_id or b.get("sourceRef")!=SOURCE_REF or b.get("sourceSha256")!=digest(source):
            errors.append("Independent pinned Git source binding mismatch")
        if (provenance.get("sourcePath")!=SOURCE_PATH or provenance.get("sourceRef")!=SOURCE_REF or provenance.get("sourceId")!=source_id
            or provenance.get("sourceReasoningTask")!=source["descriptors"]["reasoningTask"] or provenance.get("sourceProvenance")!=source.get("provenance")
            or b.get("provenanceSha256")!=digest(provenance) or provenance.get("humanApproval")!="NOT_RUN" or provenance.get("status")!="DRAFT"
            or provenance.get("independentReview")!="NOT_RUN"):
            errors.append("Independent pinned source provenance mismatch")
        skill,prerequisites=EXPECTED_MAPPING[number]
        if row.get("course")!="C3" or row.get("skill")!=skill or row.get("prerequisites")!=prerequisites or row.get("reuse")!=["C6"]:
            errors.append("Independent reviewed course or actual lesson mapping mismatch")
        wanted=expected[number-1];value=row["answer"]["value"]
        if isinstance(wanted,str):
            if value!=wanted:errors.append("Independent thermodynamic conceptual key mismatch")
        else:
            try:
                actual=parse_option(number,str(value)) if row["answer"]["type"]=="choice" else parse_literal(str(value))
                if sp.simplify(actual-wanted)!=0:errors.append("Independent primary physical exact result mismatch")
            except (ValueError,TypeError):errors.append("Independent exact answer or physical unit invalid")
        if not isinstance(wanted,str) and row["answer"]["type"]=="choice":
            values=[]
            for option in row["answer"]["options"]:
                try:values.append(parse_option(number,option))
                except (ValueError,TypeError):errors.append("Independent literal numeric alternative or physical unit invalid")
            if len(values)!=len(set(values)):errors.append("Equivalent exact numeric choices require editorial review")
        if row["answer"]["type"]=="numeric" and row["answer"].get("unit")!=NUMERIC_UNITS.get(number):
            errors.append("Independent numeric physical unit mismatch")
        records.append({"id":row["id"],"sourceSha256":b["sourceSha256"],"candidateSha256":digest(row),"reviewedSignature":signature,
          "assetChecksums":assets,"ok":not errors,"errors":errors,"expectedExact":str(wanted),
          "dimension":{str(k):str(v) for k,v in SI.Unit(UNITS[number]).dimensionality.items()},
          "manualArithmetic":MANUAL[number-1],"physicalAssumptions":ASSUMPTIONS[number-1],"distractors":DISTRACTORS[number-1],
          "pedagogicalReview":PEDAGOGY[number-1],"assetReview":geometry if assets else "not attached to this record",
          "verificationMode":"AI_CONCEPTUAL" if isinstance(wanted,str) else "EXACT_ORACLE",
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_independent_ideal_state_conservation_or_reversible_work_derivation_inverse_and_calibration",
            "Pint_exact_SI_quantity_conversion_with_offset_temperature_points_distinct_from_intervals","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return records

def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),
      "dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__,"hypothesis":hypothesis.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT",
      "reviewedCandidateCommit":CANDIDATE_REF,"packageSha256":digest(package),"bindingsSha256":digest(bindings),
      "source":{"commit":SOURCE_REF,"path":SOURCE_PATH,"title":FAMILY,"reference":SOURCE_REFERENCE},
      "primaryBeforeCandidateKeys":{"path":"editorial/reviews/u5-gas-basics-148-152-primary-source-only.md","sha256":PRIMARY_SHA256}}
def mutation_audit(package,bindings,asset_root):
    """Adversarial checks; temporary token patches never renew frozen reading."""
    import base64
    from copy import deepcopy
    import sys
    import tempfile
    from unittest.mock import patch
    module=sys.modules[__name__];cases=[]
    def retoken(changed,links,key):
        token=next(s for r,b,s,a,e in reviewed_rows(changed,links,{},EXPECTED_IDS,asset_root) if r["id"]==key)
        with patch.dict(REVIEWED_CANDIDATES,{key:token}),patch.multiple(module,
                REVIEWED_PACKAGE_SHA256=digest(changed),REVIEWED_BINDINGS_SHA256=digest(links)):
            return next(r for r in verify(changed,links,asset_root) if r["id"]==key)
    for i,original in enumerate(package["records"]):
        changed,links=deepcopy(package),deepcopy(bindings);row=changed["records"][i];answer=row["answer"]
        answer["value"]=(answer["value"]+1 if answer["type"]=="numeric" else next(o for o in answer["options"] if o!=answer["value"]))
        links[i]["candidateSha256"]=digest(row);result=retoken(changed,links,row["id"])
        reasons=[e for e in result["errors"] if "conceptual key" in e or "exact result mismatch" in e]
        if result["ok"] or not reasons:raise AssertionError("Rebound retokenized wrong key escaped independent oracle:"+row["id"])
        cases.append({"case":"wrong_key_rebound_and_all_edition_tokens_replaced","id":row["id"],"rejectedBy":reasons})
    changed,links=deepcopy(package),deepcopy(bindings)
    idx=next(i for i,r in enumerate(changed["records"]) if r["answer"]["type"]=="numeric")
    row=changed["records"][idx];row["answer"]["unit"]="kg" if row["answer"]["unit"]!="kg" else "N"
    links[idx]["candidateSha256"]=digest(row);result=retoken(changed,links,row["id"])
    if result["ok"] or "Independent numeric physical unit mismatch" not in result["errors"]:
        raise AssertionError("Rebound retokenized wrong physical unit accepted")
    cases.append({"case":"wrong_unit_rebound_and_retokenized","id":row["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    links[0]["sourceSha256"]="0"*64;result=retoken(changed,links,changed["records"][0]["id"])
    if result["ok"] or "Independent pinned Git source binding mismatch" not in result["errors"]:
        raise AssertionError("Rebound and retokenized false original hash accepted")
    cases.append({"case":"false_source_hash_rebound_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U5-01","U2-01")
    links[0]["provenanceSha256"]=digest(links[0]["provenance"])
    result=retoken(changed,links,changed["records"][0]["id"])
    if result["ok"] or "Independent pinned source provenance mismatch" not in result["errors"]:
        raise AssertionError("Rehashed retokenized false source shard accepted")
    cases.append({"case":"false_source_shard_provenance_rehashed_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    idx=next(i for i,r in enumerate(changed["records"]) if int(r["id"].rsplit("-",1)[1]) in OPTION_SUFFIX and r["answer"]["type"]=="choice")
    row=changed["records"][idx];number=int(row["id"].rsplit("-",1)[1]);wanted=oracle()[number-1]
    duplicate=equivalent_literal(wanted)+OPTION_SUFFIX[number]
    wrong=next(i for i,o in enumerate(row["answer"]["options"]) if o!=row["answer"]["value"])
    row["answer"]["options"][wrong]=duplicate;links[idx]["candidateSha256"]=digest(row)
    result=retoken(changed,links,row["id"])
    if result["ok"] or not any("Equivalent exact numeric choices" in e for e in result["errors"]):
        raise AssertionError("Numerically duplicate distractor accepted after retokenization")
    cases.append({"case":"equivalent_literal_distractor_rebound_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    false_proof=FALSE_PROOF
    changed["records"][0]["blocks"].append({"type":"text","text":false_proof})
    links[0]["candidateSha256"]=digest(changed["records"][0]);result=verify(changed,links,asset_root)[0]
    if result["ok"] or "Independent reviewed signature mismatch" not in result["errors"]:
        raise AssertionError("Correct key with plausible false physical proof escaped frozen reading")
    cases.append({"case":"correct_key_but_false_physical_proof_rebound","id":result["id"],"rejectedBy":result["errors"]})
    for name,mutate in [("empty",lambda p:p.update(records=[])),("partial",lambda p:p["records"].pop()),
                        ("duplicate",lambda p:p["records"].__setitem__(1,deepcopy(p["records"][0])))]:
        changed=deepcopy(package);mutate(changed)
        try:verify(changed,bindings,asset_root)
        except ValueError:cases.append({"case":name+"_batch","rejectedBy":"complete unique reviewed batch boundary"})
        else:raise AssertionError("Incomplete or duplicate batch accepted:"+name)
    changed,links=deepcopy(package),deepcopy(bindings)
    original=next(a for a in changed["assets"] if a["name"]==ASSET_NAME)
    raw=base64.b64decode(original["data"])
    old,new=SVG_MUTATION
    assert old in raw;raw=raw.replace(old,new,1);oldsha=original["id"];newsha=sha(raw)
    original.update(id=newsha,data=base64.b64encode(raw).decode())
    for row,b in zip(changed["records"],links):
        for block in row["blocks"]:
            if block.get("src")=="/asset/"+oldsha:block["src"]="/asset/"+newsha
        if ASSET_NAME in b.get("assetChecksums",{}):b["assetChecksums"][ASSET_NAME]=newsha
        b["candidateSha256"]=digest(row)
    with tempfile.TemporaryDirectory(prefix="independent-dynamics-svg-mutation-") as home:
        home=Path(home)
        for a in changed["assets"]:(home/a["name"]).write_bytes(base64.b64decode(a["data"]))
        tokens={r["id"]:sig for r,b,sig,a,e in reviewed_rows(changed,links,{},EXPECTED_IDS,home)}
        with patch.dict(REVIEWED_CANDIDATES,tokens),patch.multiple(module,
                REVIEWED_PACKAGE_SHA256=digest(changed),REVIEWED_BINDINGS_SHA256=digest(links)):
            try:verify(changed,links,home)
            except ValueError as e:
                if "physical scale" not in str(e):raise
                cases.append({"case":"wrong_SVG_physical_scale_or_continuity_all_hashes_bindings_and_tokens_replaced","rejectedBy":str(e)})
            else:raise AssertionError("Wrong physical scale escaped independent geometry")
    changed,links=deepcopy(package),deepcopy(bindings)
    links[0]["provenance"]["independentReview"]="PASS_AI"
    links[0]["provenanceSha256"]=digest(links[0]["provenance"])
    result=retoken(changed,links,changed["records"][0]["id"])
    if result["ok"] or "Independent pinned source provenance mismatch" not in result["errors"]:
        raise AssertionError("Rehashed self-certified author provenance accepted")
    cases.append({"case":"author_self_certification_rehashed_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    return {"scope":"independent_oracle_integrity_and_manual_review_boundary_mutation_tests","cases":cases,"caseCount":len(cases),
            "allRejected":True,"frozenSignaturesRestored":True,"humanApproval":"NOT_RUN","publication":"DRAFT"}


if __name__=="__main__":
    import argparse
    parser=argparse.ArgumentParser(__doc__);parser.add_argument("--directory",type=Path,required=True)
    parser.add_argument("--asset-root",type=Path);parser.add_argument("--output",type=Path,required=True)
    args=parser.parse_args();package=json.loads((args.directory/(BATCH+".json")).read_text())
    bindings=json.loads((args.directory/(BATCH+"-bindings.json")).read_text())
    result=report(package,bindings,args.asset_root);args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(canonical(result)+"\n")
    print(canonical({"count":len(result["records"]),"passed":sum(r["ok"] for r in result["records"])}))
    raise SystemExit(0 if all(r["ok"] for r in result["records"]) else 1)
