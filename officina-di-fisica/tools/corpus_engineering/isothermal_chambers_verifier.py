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
FAMILY='isothermal-chambers'
BATCH='isothermal-chambers-151'
ASSET_NAME='isothermal-chambers-progressive.svg'
CANDIDATE_REF='861f7853837488683a773929f5a95ebd567b531c'
REVIEWED_PACKAGE_SHA256='961d0f355e123d46541ad011ef701d245f08ff1c197f94cc5b1e498d455c5a50'
REVIEWED_BINDINGS_SHA256='96f413bcfc896eef6bf80fa0e3f7d3fe777688e617bdfa3bb950996af1f9503e'
PRIMARY_SHA256='1a8bb11b9c09dc191e31fc3f835425f2b885393a693926bff8cfd93d35d6dc2d'
SOURCE_REFERENCE='Conserve total moles across two equal rigid volumes at common maintained temperature. The final arithmetic mean is not piston work; equal final p, V, T imply equal mean particle amounts. Inverse pressure requires 2 pf>p_other.'
FALSE_PROOF='Il collegamento di due volumi uguali somma direttamente le pressioni:100 e 200 kPa danno 300 kPa finali.'
SVG_MUTATION=(b'r="11"', b'r="12"')
EXPECTED_MAPPING={1: ('C3-L02', ['C3-L01', 'C3-L02', 'C3-L06']), 2: ('C3-L02', ['C3-L01', 'C3-L02', 'C3-L06']), 3: ('C3-L02', ['C3-L01', 'C3-L02', 'C3-L06']), 4: ('C3-L02', ['C3-L01', 'C3-L02', 'C3-L06']), 5: ('C3-L02', ['C3-L01', 'C3-L02', 'C3-L06']), 6: ('C3-L02', ['C3-L01', 'C3-L02', 'C3-L06']), 7: ('C3-L02', ['C3-L01', 'C3-L02', 'C3-L06']), 8: ('C3-L02', ['C3-L01', 'C3-L02', 'C3-L06']), 9: ('C3-L02', ['C3-L01', 'C3-L02', 'C3-L06']), 10: ('C3-L02', ['C3-L01', 'C3-L02', 'C3-L06']), 11: ('C3-L02', ['C3-L01', 'C3-L02', 'C3-L06']), 12: ('C3-L02', ['C3-L01', 'C3-L02', 'C3-L06']), 13: ('C3-L02', ['C3-L01', 'C3-L02', 'C3-L06']), 14: ('C3-L02', ['C3-L01', 'C3-L02', 'C3-L06']), 15: ('C3-L02', ['C3-L01', 'C3-L02', 'C3-L06']), 16: ('C3-L02', ['C3-L01', 'C3-L02', 'C3-L06'])}
NUMERIC_UNITS={1: 'kPa', 5: 'kPa', 14: 'kPa', 16: 'kPa'}
OPTION_SUFFIX={7: '', 8: ' kPa', 11: '', 12: ' kPa', 13: '', 15: ' kPa'}
UNITS={1: 'kilopascal', 2: 'kilopascal', 3: 'kilopascal', 4: 'kilopascal', 5: 'kilopascal', 6: 'dimensionless', 7: 'dimensionless', 8: 'kilopascal', 9: 'kilopascal', 10: 'dimensionless', 11: 'dimensionless', 12: 'kilopascal', 13: 'dimensionless', 14: 'kilopascal', 15: 'kilopascal', 16: 'kilopascal'}
MANUAL=['p_f=(100+200)/2=150 kPa.', 'unità di pressione; leggere le alternative finali.', 'semisomma, non somma né media geometrica.', 'con entrambe le pressioni 200 kPa, p_f=200 kPa; aumento da 150 kPa e non raddoppio.', 'p₁=2 p_f−p₂=300−200=100 kPa.', 'in ciascun recipiente si trova metà del totale nel modello macroscopico; frazione 1/2, indipendente dalla distribuzione iniziale.', 'p_f, B=200 kPa contro 150 kPa, rapporto 4/3.', 'proposta 300 kPa meno corretta 150 kPa=150 kPa.', 'p₁=2 p_f−p₂; p₁>0 impone 2 p_f>p₂. Non basta che le letture singole siano positive.', 'rapporto (κ₁p₁+κ₂p₂)/(p₁+p₂); denominatore positivo, media pesata dei fattori.', 'B dà 250 kPa; rapporto 250/150=5/3.', 'media (150+250)/2=200 kPa; coincide con semisomma degli ingressi medi per linearità.', 'bersaglio 250 kPa con p₁, B=200 kPa implica p₂, B=300 kPa; rapporto 300/200=3/2.', 'q=450/(150 kPa)=3 kPa⁻¹; S=750 dà p_f=250 kPa; p₂=300 kPa dà p₁=200 kPa.', 'q=(501−301)/(250−150)=2 kPa⁻¹; b=1. S=401 dà p_f=200 kPa; p₂=200 kPa dà p₁=200 kPa.', 'p₁=p₂/2 implica p_f=3 p₂/4. Da 150 kPa segue p₂=200 kPa, p₁=100 kPa.']
DISTRACTORS=['300 ignora il volume totale 2 V;100 e 200 copiano una sola pressione. La temperatura è comune, non una variabile da mediare.', 'L, K, mol, J/K non sono pressioni. Il fattore 1/2 è puro e non cambia dimensione.', 'Somma perde 2 V, differenza non conserva le moli, media armonica risolve altro problema e prodotto ha unità di pressione quadrata.', '300 raddoppia tutto il vecchio pf;400 omette il due.100 inverte l’effetto e 150 ignora il nuovo contenuto iniziale a V, T fissi.', '−50 usa pf−p₂ anziché 2 pf−p₂;300 copia la somma e 500 aggiunge. Non si richiede pf>p₂, ma 2 pf>p₂.', 'Le frazioni iniziali possono cambiare attraverso il collegamento;1/4 in ciascuno non riempie il totale. Nessun recipiente era più freddo; le quantità finali sono medie macroscopiche.', '3/2 segue solo p₂,3/4 inverte,2 assume un raddoppio della pressione finale non presente e 1 ignora B.', '−150 rovescia lo scarto,300 copia,450 somma e 0 accetta la somma scambiata per pressione finale.', 'pf−p₂ non inverte una semisomma; aggiungere p₂ lo riconta. p₂−2 pf è negativo nel dominio dichiarato.', 'Somma/prodotto dei fattori ignorano i pesi; quoziente inverte il secondo contributo. La differenza al denominatore può annullarsi per p₁=p₂, caso fisico lecito.', '3/5 inverte,2 segue p₁,3/2 p₂ e 5/2 usa 250/100 anziché 250/150.', '400 è somma,50 semidifferenza e 150/250 copiano prove. La semisomma lineare conserva qui la media degli ingressi.', '2/3 inverte,5/3 copia il target,2 segue p₁ e 5/2 omette la sottrazione della prima pressione dalla somma 500.', '1200 usa 750 direttamente come kPa in 2 S−300;250 copia pf invece di ricostruire p₁. Il guadagno precede l’inversa.', '400 è somma,100 p₁ della A e 201 omette b.600 kPa darebbero pf 400 kPa e S801, non 401.', '100 scambia i recipienti,150 copia pf e 300 omette il contributo del primo volume. Il vincolo identifica una sola coppia positiva, non una legge temporale.']
ASSUMPTIONS=['Due recipienti rigidi di uguale volume positivo, stesso gas ideale e stessa temperatura iniziale mantenuta, nessuna perdita e volume del collegamento trascurabile. Pressioni assolute positive; equilibrio finale a p, T comuni. Non è espansione reversibile di un pistone. Quantità molecolari medie macroscopiche.', 'Due recipienti rigidi di uguale volume positivo, stesso gas ideale e stessa temperatura iniziale mantenuta, nessuna perdita e volume del collegamento trascurabile. Pressioni assolute positive; equilibrio finale a p, T comuni. Non è espansione reversibile di un pistone. Quantità molecolari medie macroscopiche.', 'Due recipienti rigidi di uguale volume positivo, stesso gas ideale e stessa temperatura iniziale mantenuta, nessuna perdita e volume del collegamento trascurabile. Pressioni assolute positive; equilibrio finale a p, T comuni. Non è espansione reversibile di un pistone. Quantità molecolari medie macroscopiche.', 'Due recipienti rigidi di uguale volume positivo, stesso gas ideale e stessa temperatura iniziale mantenuta, nessuna perdita e volume del collegamento trascurabile. Pressioni assolute positive; equilibrio finale a p, T comuni. Non è espansione reversibile di un pistone. Quantità molecolari medie macroscopiche.', 'Due recipienti rigidi di uguale volume positivo, stesso gas ideale e stessa temperatura iniziale mantenuta, nessuna perdita e volume del collegamento trascurabile. Pressioni assolute positive; equilibrio finale a p, T comuni. Non è espansione reversibile di un pistone. Quantità molecolari medie macroscopiche.', 'Caso 06: quantità molecolari finali medie macroscopiche a p, V, T uguali. I recipienti comunicano, il sistema complessivo conserva materia; non restano fisse le quantità di ogni recipiente.', 'Due recipienti rigidi di uguale volume positivo, stesso gas ideale e stessa temperatura iniziale mantenuta, nessuna perdita e volume del collegamento trascurabile. Pressioni assolute positive; equilibrio finale a p, T comuni. Non è espansione reversibile di un pistone. Quantità molecolari medie macroscopiche.', 'Due recipienti rigidi di uguale volume positivo, stesso gas ideale e stessa temperatura iniziale mantenuta, nessuna perdita e volume del collegamento trascurabile. Pressioni assolute positive; equilibrio finale a p, T comuni. Non è espansione reversibile di un pistone. Quantità molecolari medie macroscopiche.', 'Due recipienti rigidi di uguale volume positivo, stesso gas ideale e stessa temperatura iniziale mantenuta, nessuna perdita e volume del collegamento trascurabile. Pressioni assolute positive; equilibrio finale a p, T comuni. Non è espansione reversibile di un pistone. Quantità molecolari medie macroscopiche.', 'Due recipienti rigidi di uguale volume positivo, stesso gas ideale e stessa temperatura iniziale mantenuta, nessuna perdita e volume del collegamento trascurabile. Pressioni assolute positive; equilibrio finale a p, T comuni. Non è espansione reversibile di un pistone. Quantità molecolari medie macroscopiche.', 'Due recipienti rigidi di uguale volume positivo, stesso gas ideale e stessa temperatura iniziale mantenuta, nessuna perdita e volume del collegamento trascurabile. Pressioni assolute positive; equilibrio finale a p, T comuni. Non è espansione reversibile di un pistone. Quantità molecolari medie macroscopiche.', 'Due recipienti rigidi di uguale volume positivo, stesso gas ideale e stessa temperatura iniziale mantenuta, nessuna perdita e volume del collegamento trascurabile. Pressioni assolute positive; equilibrio finale a p, T comuni. Non è espansione reversibile di un pistone. Quantità molecolari medie macroscopiche.', 'Due recipienti rigidi di uguale volume positivo, stesso gas ideale e stessa temperatura iniziale mantenuta, nessuna perdita e volume del collegamento trascurabile. Pressioni assolute positive; equilibrio finale a p, T comuni. Non è espansione reversibile di un pistone. Quantità molecolari medie macroscopiche.', 'Due recipienti rigidi di uguale volume positivo, stesso gas ideale e stessa temperatura iniziale mantenuta, nessuna perdita e volume del collegamento trascurabile. Pressioni assolute positive; equilibrio finale a p, T comuni. Non è espansione reversibile di un pistone. Quantità molecolari medie macroscopiche.', 'Due recipienti rigidi di uguale volume positivo, stesso gas ideale e stessa temperatura iniziale mantenuta, nessuna perdita e volume del collegamento trascurabile. Pressioni assolute positive; equilibrio finale a p, T comuni. Non è espansione reversibile di un pistone. Quantità molecolari medie macroscopiche.', 'Due recipienti rigidi di uguale volume positivo, stesso gas ideale e stessa temperatura iniziale mantenuta, nessuna perdita e volume del collegamento trascurabile. Pressioni assolute positive; equilibrio finale a p, T comuni. Non è espansione reversibile di un pistone. Quantità molecolari medie macroscopiche.']
PEDAGOGY=['La legge è motivata prima della sostituzione e il risultato resta legato alla grandezza chiesta, con unità esplicite.', 'È distinta la dimensione della grandezza dalla scala del prefisso e da grandezze fisiche di nome vicino.', 'Il caso concettuale o la legge richiesta sono spiegati con le loro ipotesi, senza una scorciatoia dal numero della chiave.', 'Il confronto controllato tiene fermi gli altri ingressi e non assegna al risultato automaticamente il fattore del solo ingresso.', 'L’inversa è svolta prima con i simboli e controllata per sostituzione e positività.', 'L’incognita o il caso separato sono riconosciuti prima di applicare la legge; sono esplicitati unità e dominio.', 'Le due risposte vengono valutate prima del rapporto e i singoli fattori non sono confusi con il risultato totale.', 'Il caso specifico è distinto dalla sola procedura numerica comune; lo scarto o la diversa legge sono motivati.', 'L’inversa simbolica include la condizione che rende lecita la divisione e mantiene le unità delle quantità.', 'I fattori sono sostituiti nei rispettivi ingressi prima del rapporto e le ipotesi di confronto sono esplicite.', 'Entrambi gli ingressi modificati sono valutati nello stesso modello prima di ridurre il rapporto.', 'La media statistica è distinta da un processo fisico; è spiegato quando il modello conserva o non conserva le medie.', 'Il bersaglio è ricostruito prima dell’inversa e il rapporto richiesto è distinto dal valore finale dell’ingresso.', 'La taratura del display continuo è separata dall’inversa della legge fisica.', 'Guadagno e offset sono ricavati da due riferimenti distinti e rimossi prima di ricostruire la grandezza fisica.', 'Il vincolo o il ciclo separato sono sostituiti nella legge prima di discutere unicità, dominio e grandezza richiesta.']
EXPECTED_IDS={f"AR-u5-{FAMILY}-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u5-isothermal-chambers-01": "fa3c74db5775d6b07ffce4a3a502dfe5ab0c25c6274a11a339e4e0df6f57ef11",
    "AR-u5-isothermal-chambers-02": "dcdee7b14fa58d4a3d99db4b813865548fdee46f9d1f8a5cc9a08d740896891d",
    "AR-u5-isothermal-chambers-03": "94699b4967a6ee66492aa398e749827c4d3d28363ac3d12f2ca80fc962eeabd1",
    "AR-u5-isothermal-chambers-04": "bd1045488e8ca7a6069b0b3eb3a3f29f15f3bad8c412e95860df5bef1c03fd58",
    "AR-u5-isothermal-chambers-05": "6a51fb288529bd29b4b48fbe6e213cf8c557f1b5d6d6ee8945f46730cbecc8e5",
    "AR-u5-isothermal-chambers-06": "a2659ea127e66f6f4500840c946ab7248756e7ac8d1bf23d2a14c6bf28a6c7d9",
    "AR-u5-isothermal-chambers-07": "24feb651280541d0dac8a37fc261e6d8ab5523a461dc6572b401adfe588776c1",
    "AR-u5-isothermal-chambers-08": "2b8179cff36984f2611a55cc7e9ac1b31a585684b3d7fa3a9063d9e0a50056d8",
    "AR-u5-isothermal-chambers-09": "009158e870e55711ba50d9a879554e114cb4512056528ada57c606896a93220c",
    "AR-u5-isothermal-chambers-10": "18c267643674448f5a9209bfb58817c35d8655f57ae5651cd6b34fb2afc8cce4",
    "AR-u5-isothermal-chambers-11": "e35cd2236a1d2175476a9b170f062f1e55163065c128d53073f4cedab2c42d9b",
    "AR-u5-isothermal-chambers-12": "7965979bc967269074dc815abe900493b1f75d9214c622e23707b19a1400e170",
    "AR-u5-isothermal-chambers-13": "36a04c0ffedcc95c64dfc919f3b13fb7bc32be3b429b603e9148cf0b8bcd25fa",
    "AR-u5-isothermal-chambers-14": "0e5cb43013efb0dcef6e82d08f6c084e5df1eff48e104e00033d7f21fbfeac48",
    "AR-u5-isothermal-chambers-15": "115d7c91c09cd18144f89ae35b4e1f802db96a0c32b124847e9364a3a1860375",
    "AR-u5-isothermal-chambers-16": "c8379f200936e73e3c201424405cb31479b4a7117785456d5272c82e02388ae5"
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

def physical_final_pressure(first,second):
    first,second=map(Fraction,(first,second))
    if min(first,second)<=0:raise ValueError("Both initial absolute pressures must be positive")
    return (first+second)/2

def inverse_initial(final,known_other):
    final,known_other=map(Fraction,(final,known_other))
    if min(final,known_other)<=0 or 2*final<=known_other:raise ValueError("Positive reconstructed initial pressure requires 2pf>p_other")
    return 2*final-known_other

def final_fraction(first_volume,second_volume):
    first_volume,second_volume=map(Fraction,(first_volume,second_volume))
    if min(first_volume,second_volume)<=0:raise ValueError("Both final volumes must be positive")
    return first_volume/(first_volume+second_volume)

@lru_cache(maxsize=1)
def oracle():
    p1,p2,V,R,T,pf,a,b=sp.symbols("p1 p2 V R T pf a b",positive=True)
    initial_moles=p1*V/(R*T)+p2*V/(R*T)
    final_law=sp.solve(sp.Eq(initial_moles,pf*2*V/(R*T)),pf)[0]
    assert final_law==(p1+p2)/2
    assert sp.solve(sp.Eq(pf,final_law),p1)[0]==2*pf-p2
    ratio=sp.cancel(final_law.subs({p1:a*p1,p2:b*p2},simultaneous=True)/final_law)
    assert sp.simplify(ratio-(a*p1+b*p2)/(p1+p2))==0
    assert sp.simplify((pf*V/(R*T))/(2*pf*V/(R*T)))==sp.Rational(1,2)
    first=sp.Rational(physical_final_pressure(100,200));second=sp.Rational(physical_final_pressure(200,300))
    assert (first,second)==(150,250)
    gain,offset,decoded,affine=calibrate(first,second,450,750,301,501,401,"kilopascal")
    assert (gain,offset,decoded,affine)==(3,1,250,200)
    assert (first+second)/2==physical_final_pressure(150,250)
    assert (SI.Quantity(100,"kilopascal")*SI.Quantity(1,"liter")+SI.Quantity(200,"kilopascal")*SI.Quantity(1,"liter"))/(SI.Quantity(2,"liter"))==SI.Quantity(150,"kilopascal")
    constrained=sp.solve(sp.Eq(150,(p2/2+p2)/2),p2)[0]
    return [first,"kPa","p_f = (p₁ + p₂) / 2","Da 150 a 200 kPa",sp.Rational(inverse_initial(150,200)),"1/2",sp.Rational(physical_final_pressure(100,300))/first,300-first,
      "p₁ = 2 p_f − p₂","(κ₁ p₁ + κ₂ p₂) / (p₁ + p₂)",second/first,(first+second)/2,sp.Rational(inverse_initial(sp.Rational(5,3)*first,200))/200,
      sp.Rational(inverse_initial(decoded,300)),sp.Rational(inverse_initial(affine,200)),constrained]

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    rects={tuple(Fraction(e.get(k,"0")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    containers=[(55,205,200,170),(385,205,200,170),(55,680,200,170),(385,680,200,170)]
    if not set(containers)<=rects:raise ValueError("Independent physical scale of equal rigid containers changed")
    dots=[tuple(Fraction(e.get(k)) for k in ("cx","cy","r")) for e in root.iter() if e.tag.endswith("circle")]
    if len(dots)!=24 or len(set(dots))!=24 or any(r!=11 for x,y,r in dots):raise ValueError("Independent physical scale of normalized gas amounts changed")
    counts=[]
    for x,y,w,h in containers:
        counts.append(sum(x+radius<cx<x+w-radius and y+radius<cy<y+h-radius for cx,cy,radius in dots))
    if counts!=[4,8,6,6] or sum(counts)!=len(dots):raise ValueError("Independent physical scale of conserved gas partition changed")
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {"M255 290H385","M255 765H385"}<=paths:raise ValueError("Independent physical scale of fixed connector changed")
    return "Full XML and full-height Chrome image independently read. All four container rectangles are 200x170 px; initial normalized amounts 4 and 8 become 6 and 6 with all 24 displayed circles uniquely assigned to the four boxes and identical dot radius 11. Each dot represents a fixed gas-amount unit, explicitly not one measured molecule; total 12 units per panel and final one-half fractions are conserved. The connector remains at vessel midheight, the closed initial valve opens, and outer boundaries are fixed. No reversible piston work is inferred."

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
