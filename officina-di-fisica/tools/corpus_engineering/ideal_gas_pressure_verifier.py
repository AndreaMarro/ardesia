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
FAMILY='ideal-gas-pressure'
BATCH='ideal-gas-pressure-149'
ASSET_NAME='ideal-gas-pressure-progressive.svg'
CANDIDATE_REF='000451a3aaf92639cb5df1c8c624f61bf4b280a9'
REVIEWED_PACKAGE_SHA256='a7156e5054a24508e0eee60e3d34f669feab939e2f4385541da02d4aa5206277'
REVIEWED_BINDINGS_SHA256='204ff7391357995159b40cc4e015df8f15b391beb415ddce308fc62d0a10b16e'
PRIMARY_SHA256='1a8bb11b9c09dc191e31fc3f835425f2b885393a693926bff8cfd93d35d6dc2d'
SOURCE_REFERENCE='Derive p=nRT/V with fixed sample nR and exact kPa L=J. State equation fixes pressures, not path heat. Candidate 11–15 explicitly replace the source 1 K formal state by 400 K/2 L and recalculate all affected quantities.'
FALSE_PROOF='Gli stessi stati estremi fissano sempre il calore scambiato, qualunque sia il lavoro del percorso.'
SVG_MUTATION=(b'width="300"', b'width="301"')
EXPECTED_MAPPING={1: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 2: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 3: ('C3-L06', ['C3-L01', 'C3-L02', 'C3-L06']), 4: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 5: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 6: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 7: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 8: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 9: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 10: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 11: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 12: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 13: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 14: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 15: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02']), 16: ('C3-L02', ['C1-L001', 'C3-L01', 'C3-L02'])}
NUMERIC_UNITS={1: 'kPa', 5: 'K', 6: 'L', 14: 'K'}
OPTION_SUFFIX={7: '', 11: '', 12: ' kPa', 13: '', 15: ' K'}
UNITS={1: 'kilopascal', 2: 'kilopascal', 3: 'joule', 4: 'kilopascal', 5: 'kelvin', 6: 'liter', 7: 'dimensionless', 8: 'kilopascal', 9: 'kelvin', 10: 'dimensionless', 11: 'dimensionless', 12: 'kilopascal', 13: 'dimensionless', 14: 'kelvin', 15: 'kelvin', 16: 'dimensionless'}
MANUAL=['300 J/3 L=100 kPa.', 'pressione ha dimensione energia per volume; Pa e kPa sono compatibili, secondo le alternative finali.', 'dagli stati del gas ideale la variazione di U dipende dalle temperature per composizione fissata; Q=ΔU+W richiede il percorso del lavoro. Stati uguali non fissano sempre Q; due cammini con W diversi hanno Q diversi dello stesso scarto.', 'T raddoppiata a V fisso dà 200 kPa anziché 100 kPa.', 'T=pV/C=100 ×3/1=300 K.', 'V=CT/p=300/100=3 L.', 'V raddoppia a T fisso, p_B=50 kPa; rapporto 1/2.', 'a densità elevata volume molecolare e interazioni intermolecolari trascurati possono diventare rilevanti. Non si deduce un verso universale dello scarto senza un modello ulteriore; nessuna transizione di fase è assunta.', 'T=pV/C come quantità fisiche. Solo nelle unità e nel C assegnati i valori numerici soddisfano T[K]=p[kPa]V[L].', 'rapporto κ₁/κ₂, entrambi positivi.', 'Il candidato sostituisce il dato sorgente formale 1 K con 400 K e 2 L, dichiarandolo nelle note autore: p_B=400 J/2 L=200 kPa, p_A=100 kPa, rapporto 2. Stesso nR e stessa competenza di confronto T/V; stati classici ordinari.', 'Le pressioni candidate 100 e 200 kPa hanno media 150 kPa. T media 350 K e V medio 5/2 L darebbero 140 kPa; scarto−10 kPa rispetto alla media delle uscite. Non si interpreta la media come un mescolamento fisico.', 'B impone T=400 K e p_B=2 p_A=200 kPa. V_B=nRT_B/p_B=2 L, rapporto V_B/V_A=2/3. L’alternativa 1/2 produrrebbe rapporto delle pressioni 8/3, diverso dal bersaglio 2.', 'Taratura candidata: p_A=100 kPa, S_A=300 dà q=3 kPa⁻¹. S_B=600 dà p_B=200 kPa; V_B=2 L e nR=1 J/K implicano T_B=400 K. Ricalcolo separato dai dati sorgente 1 K/1 L.', 'I riferimenti candidati 100 e 200 kPa con S=201,401 danno q=2 kPa⁻¹, b=1. S_C=401 implica p_C=200 kPa; V_C=3 L dà T_C=600 K. La pressione coincide con B, lo stato completo no.', 'T=cV, c=100 K/L, rende p=Cc=100 kPa per ogni V>0. Misura ridondante e infinite coppie; esempi positivi (V=3 L, T=300 K) e (6 L,600 K).']
DISTRACTORS=['900 moltiplica T per V e 300 copia nRT;100 Pa perderebbero il prefisso kilo. Si usa pressione assoluta.', 'J è energia, K temperatura, L volume e J/K capacità o nR. Il prefisso non cambia la dimensione di pressione.', 'Q non è funzione di stato; gas ideale non implica Q=0. La pressione finale non ricostruisce W; ΔU del campione è invece una differenza di stato.', '400 quadra il fattore termico,50 lo inverte,600 omette V e 100 ignora il nuovo stato.', '100 copia p e 100/3 divide per V invece di moltiplicare;300 °C non è300 K.', '1/3 è l’inverso numerico,30000 il prodotto.3 L=3/1000 m³, non 3 m³.', '2 segue V direttamente,1 lo ignora,1/4 e 4 aggiungono un quadrato.', 'La non idealità non è riparata da Celsius, non rende R dipendente dal recipiente e non impone p=0 o assenza di equilibrio.', 'nR/(pV) ha K⁻¹. Le altre combinazioni non hanno dimensione di temperatura; il numero uno non rende nR adimensionale.', 'κ₁κ₂ rende diretta V, κ₂/κ₁ scambia le prove, κ₁² aggiunge un esponente e la somma dà 2 per stati uguali.', '1/2 inverte,4/3 segue T,2/3 segue V e 200 copia il valore della pressione B anziché il rapporto.', '300 è somma,50 semidifferenza,200 solo B e 140 il modello agli ingressi medi. Lo scarto con 150 è10 kPa.', '3/2 inverte i volumi,2 copia il target e 4/3 segue T soltanto;1/2 darebbe p_B/p_A=8/3.', '1200 usa S grezzo come pressione,200 copia p_B. Il guadagno è3 per kPa, non 3 per kelvin.', '400 copia T_B malgrado V_C diverso;300 copia A,200 copia p_C,1203 è401 ×3 senza decodifica.', 'Due esempi non limitano una famiglia continua a due soluzioni. La coppia nulla viola T, V>0; la misura è ridondante e non determina la scala.']
ASSUMPTIONS=['Campione ideale chiuso con quantità e composizione fissate, nR=1 J/K assegnato; T assoluta e V e p assoluta positivi. Conversione esatta kPa L=J. Stati di equilibrio; il percorso termico non è dedotto dalla sola equazione di stato. Display continuo.', 'Campione ideale chiuso con quantità e composizione fissate, nR=1 J/K assegnato; T assoluta e V e p assoluta positivi. Conversione esatta kPa L=J. Stati di equilibrio; il percorso termico non è dedotto dalla sola equazione di stato. Display continuo.', 'Sistema chiuso con campione assegnato, estremi di equilibrio e nessuna variazione macroscopica cinetica o potenziale. Il lavoro del gas è positivo; Q dipende anche dal cammino.', 'Campione ideale chiuso con quantità e composizione fissate, nR=1 J/K assegnato; T assoluta e V e p assoluta positivi. Conversione esatta kPa L=J. Stati di equilibrio; il percorso termico non è dedotto dalla sola equazione di stato. Display continuo.', 'Campione ideale chiuso con quantità e composizione fissate, nR=1 J/K assegnato; T assoluta e V e p assoluta positivi. Conversione esatta kPa L=J. Stati di equilibrio; il percorso termico non è dedotto dalla sola equazione di stato. Display continuo.', 'Campione ideale chiuso con quantità e composizione fissate, nR=1 J/K assegnato; T assoluta e V e p assoluta positivi. Conversione esatta kPa L=J. Stati di equilibrio; il percorso termico non è dedotto dalla sola equazione di stato. Display continuo.', 'Campione ideale chiuso con quantità e composizione fissate, nR=1 J/K assegnato; T assoluta e V e p assoluta positivi. Conversione esatta kPa L=J. Stati di equilibrio; il percorso termico non è dedotto dalla sola equazione di stato. Display continuo.', 'Campione ideale chiuso con quantità e composizione fissate, nR=1 J/K assegnato; T assoluta e V e p assoluta positivi. Conversione esatta kPa L=J. Stati di equilibrio; il percorso termico non è dedotto dalla sola equazione di stato. Display continuo.', 'Campione ideale chiuso con quantità e composizione fissate, nR=1 J/K assegnato; T assoluta e V e p assoluta positivi. Conversione esatta kPa L=J. Stati di equilibrio; il percorso termico non è dedotto dalla sola equazione di stato. Display continuo.', 'Campione ideale chiuso con quantità e composizione fissate, nR=1 J/K assegnato; T assoluta e V e p assoluta positivi. Conversione esatta kPa L=J. Stati di equilibrio; il percorso termico non è dedotto dalla sola equazione di stato. Display continuo.', 'Campione ideale chiuso con quantità e composizione fissate, nR=1 J/K assegnato; T assoluta e V e p assoluta positivi. Conversione esatta kPa L=J. Stati di equilibrio; il percorso termico non è dedotto dalla sola equazione di stato. Display continuo.', 'Campione ideale chiuso con quantità e composizione fissate, nR=1 J/K assegnato; T assoluta e V e p assoluta positivi. Conversione esatta kPa L=J. Stati di equilibrio; il percorso termico non è dedotto dalla sola equazione di stato. Display continuo.', 'Campione ideale chiuso con quantità e composizione fissate, nR=1 J/K assegnato; T assoluta e V e p assoluta positivi. Conversione esatta kPa L=J. Stati di equilibrio; il percorso termico non è dedotto dalla sola equazione di stato. Display continuo.', 'Campione ideale chiuso con quantità e composizione fissate, nR=1 J/K assegnato; T assoluta e V e p assoluta positivi. Conversione esatta kPa L=J. Stati di equilibrio; il percorso termico non è dedotto dalla sola equazione di stato. Display continuo.', 'Campione ideale chiuso con quantità e composizione fissate, nR=1 J/K assegnato; T assoluta e V e p assoluta positivi. Conversione esatta kPa L=J. Stati di equilibrio; il percorso termico non è dedotto dalla sola equazione di stato. Display continuo.', 'Campione ideale chiuso con quantità e composizione fissate, nR=1 J/K assegnato; T assoluta e V e p assoluta positivi. Conversione esatta kPa L=J. Stati di equilibrio; il percorso termico non è dedotto dalla sola equazione di stato. Display continuo.']
PEDAGOGY=['La legge è motivata prima della sostituzione e il risultato resta legato alla grandezza chiesta, con unità esplicite.', 'È distinta la dimensione della grandezza dalla scala del prefisso e da grandezze fisiche di nome vicino.', 'Il caso concettuale o la legge richiesta sono spiegati con le loro ipotesi, senza una scorciatoia dal numero della chiave.', 'Il confronto controllato tiene fermi gli altri ingressi e non assegna al risultato automaticamente il fattore del solo ingresso.', 'L’inversa è svolta prima con i simboli e controllata per sostituzione e positività.', 'L’incognita o il caso separato sono riconosciuti prima di applicare la legge; sono esplicitati unità e dominio.', 'Le due risposte vengono valutate prima del rapporto e i singoli fattori non sono confusi con il risultato totale.', 'Il caso specifico è distinto dalla sola procedura numerica comune; lo scarto o la diversa legge sono motivati.', 'L’inversa simbolica include la condizione che rende lecita la divisione e mantiene le unità delle quantità.', 'I fattori sono sostituiti nei rispettivi ingressi prima del rapporto e le ipotesi di confronto sono esplicite.', 'Entrambi gli ingressi modificati sono valutati nello stesso modello prima di ridurre il rapporto.', 'La media statistica è distinta da un processo fisico; è spiegato quando il modello conserva o non conserva le medie.', 'Il bersaglio è ricostruito prima dell’inversa e il rapporto richiesto è distinto dal valore finale dell’ingresso.', 'La taratura del display continuo è separata dall’inversa della legge fisica.', 'Guadagno e offset sono ricavati da due riferimenti distinti e rimossi prima di ricostruire la grandezza fisica.', 'Il vincolo o il ciclo separato sono sostituiti nella legge prima di discutere unicità, dominio e grandezza richiesta.']
EXPECTED_IDS={f"AR-u5-{FAMILY}-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u5-ideal-gas-pressure-01": "a2dbb9657fb6309d9e08aab764e4368d380e69baa6e0e2e5e0ee672984e4a20a",
    "AR-u5-ideal-gas-pressure-02": "093595f12e6ec873d1f87fa9bff752cbec8628203463e014e9c26debb192c6d0",
    "AR-u5-ideal-gas-pressure-03": "5d42c95a15ea165ea11ec5bf81b6baefb85ee6b17a828c7e77ea9925362a79b9",
    "AR-u5-ideal-gas-pressure-04": "115d64779c049a7cd1dfa919d7c8352761be0a207a3f68e14abea6e4c2ddf773",
    "AR-u5-ideal-gas-pressure-05": "9aa3b41fa1809a7cfdfd8ea27e44b1a44e9cb8ea93d45020c97cbfc9fc93dbb0",
    "AR-u5-ideal-gas-pressure-06": "cab6d0c530c8d1fa4d0957b2820da64ab81305757a952f148dd4397a618082fb",
    "AR-u5-ideal-gas-pressure-07": "8af4c9b9e8ec0db8681eabb153f2e1c7aa77292dc2f8f5ef73f345bcede8f011",
    "AR-u5-ideal-gas-pressure-08": "e427d99bc209f5ee6c691f451b3167f61b8d4cc869c3400ab1cfaf03ee110dc1",
    "AR-u5-ideal-gas-pressure-09": "8a0e3479230c18631ee4f8e2783f34d1ee98e92023e5e6f2aa0bc607f6b49042",
    "AR-u5-ideal-gas-pressure-10": "507122190bbe127a6c0253e74b2ec1a950743b59cfcfc40c5d26cd2d708988b3",
    "AR-u5-ideal-gas-pressure-11": "caf133d950249d191886da743f7d3dd33769d1501b61918c3759883d0622e0b8",
    "AR-u5-ideal-gas-pressure-12": "c3cb87819df02f0e41555d29161f48baded879afd621dd1ba7d054130235c0c2",
    "AR-u5-ideal-gas-pressure-13": "ba65b47db1e8fbc58634a62fe6d89732b5b66ac3b3a1b38cf8f2a173ec60c0d1",
    "AR-u5-ideal-gas-pressure-14": "467863dbd2cc935ebd2d940ced4016a5b13226af26b954b990720cbf11cf1227",
    "AR-u5-ideal-gas-pressure-15": "5dfddf52916b0e51cfe1bcf93208a24ce50c504ca4c56b603a4b1205331d4a80",
    "AR-u5-ideal-gas-pressure-16": "cb2a8e1520fa34e514f66bee06efdd662172de6c395876bbfa52c9da48db9ed9"
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

def physical_pressure(temperature,volume,amount_R=1):
    temperature,volume,amount_R=map(Fraction,(temperature,volume,amount_R))
    if min(temperature,volume,amount_R)<=0:raise ValueError("Positive absolute temperature, volume and fixed nR required")
    result=(SI.Quantity(amount_R,"joule/kelvin")*SI.Quantity(temperature,"kelvin")/SI.Quantity(volume,"liter")).to("kilopascal")
    return Fraction(result.magnitude)

def temperature_from_pressure(pressure,volume,amount_R=1):
    pressure,volume,amount_R=map(Fraction,(pressure,volume,amount_R))
    if min(pressure,volume,amount_R)<=0:raise ValueError("Positive absolute pressure, volume and fixed nR required")
    return Fraction((SI.Quantity(pressure,"kilopascal")*SI.Quantity(volume,"liter")/SI.Quantity(amount_R,"joule/kelvin")).to("kelvin").magnitude)

def volume_from_pressure(temperature,pressure,amount_R=1):
    temperature,pressure,amount_R=map(Fraction,(temperature,pressure,amount_R))
    if min(temperature,pressure,amount_R)<=0:raise ValueError("Positive absolute temperature, pressure and fixed nR required")
    return Fraction((SI.Quantity(amount_R,"joule/kelvin")*SI.Quantity(temperature,"kelvin")/SI.Quantity(pressure,"kilopascal")).to("liter").magnitude)

def redundant_state(coefficient,measured_pressure,amount_R=1):
    coefficient,measured_pressure,amount_R=map(Fraction,(coefficient,measured_pressure,amount_R))
    if min(coefficient,measured_pressure,amount_R)<=0:raise ValueError("Positive cross-state coefficient and pressure required")
    if measured_pressure!=amount_R*coefficient:raise ValueError("Incompatible redundant pressure measurement")
    return "infinite"

@lru_cache(maxsize=1)
def oracle():
    C,T,V,p,a,b=sp.symbols("C T V p a b",positive=True)
    law=C*T/V
    assert sp.solve(sp.Eq(p,law),T)[0]==p*V/C
    assert sp.solve(sp.Eq(p,law),V)[0]==C*T/p
    assert sp.cancel(law.subs({T:a*T,V:b*V},simultaneous=True)/law)==a/b
    first=sp.Rational(physical_pressure(300,3));second=sp.Rational(physical_pressure(400,2))
    assert (first,second)==(100,200)
    assert (SI.Quantity(1,"kilopascal")*SI.Quantity(1,"liter")).to("joule").magnitude==1
    assert (first+second)/2-physical_pressure(350,Fraction(5,2))==10
    gain,offset,decoded,affine=calibrate(first,second,300,600,201,401,401,"kilopascal")
    assert (gain,offset,decoded,affine)==(3,1,200,200)
    p0,v0,v=sp.symbols("p0 v0 v",positive=True)
    path1=sp.integrate(p0,(v,v0,2*v0));path2=sp.integrate(2*p0,(v,v0,2*v0))
    assert path2-path1==p0*v0
    assert redundant_state(100,100)=="infinite"
    assert physical_pressure(300,3)==physical_pressure(400,4)
    return [first,"kPa","No: il lavoro e quindi Q dipendono anche dal percorso","Da 100 a 200 kPa",sp.Rational(temperature_from_pressure(100,3)),sp.Rational(volume_from_pressure(300,100)),sp.Rational(physical_pressure(300,6))/first,
      "Volume molecolare e interazioni possono non essere più trascurabili","T = p V / (nR)","κ₁ / κ₂",second/first,(first+second)/2,sp.Rational(volume_from_pressure(400,2*first))/3,
      sp.Rational(temperature_from_pressure(decoded,2)),sp.Rational(temperature_from_pressure(affine,3)),"Infinite coppie: qualsiasi V>0 con T=kV"]

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    rects={tuple(Fraction(e.get(k,"0")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    pA=physical_pressure(300,3);pB=physical_pressure(400,2)
    required={(100,430-pA,100*3,pA),(100,1010-pB,100*2,pB),(100,1400,100*2,35),(100,1530,100*3,35)}
    if not required<=rects:raise ValueError("Independent physical scale of state-product rectangles changed")
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {"M100 430V220M100 430H510","M100 1010V770M100 1010H510"}<=paths:raise ValueError("Independent physical scale or state axes changed")
    return "Full XML and full-height Chrome image independently read. Common 100 px/L horizontal and 1 px/kPa vertical scales give rectangles 300x100 and 200x200 px, correctly encoding pV=300 and 400 J for states 300 K/3 L/100 kPa and 400 K/2 L/200 kPa. They are explicitly products of state variables, not work along a traced path. Task15 volume bars 200 and 300 px at 100 px/L compare equal pressure 200 kPa with distinct temperatures 400 and 600 K. Origins and labels read; no overlap or cropped geometry."

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
