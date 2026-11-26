"""Independent source-only Cric C3 A50 models; no candidate/answer/options imported."""
from fractions import Fraction
import sympy as sp
import pint
SI=pint.UnitRegistry(non_int_type=Fraction)
def source_only_predictions():
 q=sp.Rational;R=q(4157,500)
 return {
 'C3-Q001':'sistema aperto, massa ed energia possono attraversare il confine',
 'C3-Q002':q(20)+q(27315,100)-311,
 'C3-Q003':'stato',
 'C3-Q004':'nessun flusso termico netto fra blocchi alla stessa temperatura; non uguaglianza di U',
 'C3-Q005':2*(q(2685,100)+q(27315,100))-q(27315,100),
 'C3-Q006':'pressione',
 'C3-Q007':'grandezza estensiva, per esempio n o massa; non unica senza opzioni',
 'C3-Q008':35-4-6,
 'C3-Q009':'attendere equilibrio meccanico, senza gradienti di pressione macroscopici',
 'C3-Q010':'adiabatica',
 'C3-Q011':100*(1-q(120,160)),
 'C3-Q012':'stesso numero di moli e di particelle, non massa necessariamente',
 'C3-Q013':q(180,100)*q(315,270),
 'C3-Q014':'pressione assoluta',
 'C3-Q015':q(100)*q(620,100)/(q(250,1000)*R),
 'C3-Q016':'densità alta o vicinanza alla condensazione richiedono cautela',
 'C3-Q017':90*q(2,3)*q(360,270),
 'C3-Q018':'R',
 'C3-Q019':'volume V ha pendenza doppia rispetto a volume 2V',
 'C3-Q020':q(100000)*q(280,10000)/(R*300),
 'C3-Q021':q(540)/(q(200,1000)*6),
 'C3-Q022':'capacità termica totale minore in A',
 'C3-Q023':'calore specifico',
 'C3-Q024':75*(32-48),
 'C3-Q025':q(300)*(30-20)/(70-30),
 'C3-Q026':'temperatura finale reale più bassa rispetto a ignorare recipiente freddo',
 'C3-Q027':R*15,
 'C3-Q028':'volume, e assenza di altri lavori nel riscaldamento isocoro',
 'C3-Q029':'temperatura finale deve stare fra 15 e45 Celsius',
 'C3-Q030':500-80*5,
 'C3-Q031':q(452,10)/q(2260)*1000,
 'C3-Q032':'aumentano frazione liquida ed energia interna durante fusione',
 'C3-Q033':'condensazione',
 'C3-Q034':q(40,1000)*334000/80,
 'C3-Q035':'evaporazione superficiale',
 'C3-Q036':q(60*150)/(q(30,1000)*1000),
 'C3-Q037':'solidificazione',
 'C3-Q038':100*q(120-45,120),
 'C3-Q039':'calore latente di condensazione oltre al raffreddamento liquido',
 'C3-Q040':(100*q(418,100)*20-10*334)/(110*q(418,100)),
 'C3-Q041':'convezione forzata',
 'C3-Q042':q(40,1000)*q(75,100)*20/12*100,
 'C3-Q043':'irraggiamento',
 'C3-Q044':9*q(2,2),
 'C3-Q045':'manico metallico a conducibilità maggiore',
 'C3-Q046':q(450,300)**4,
 'C3-Q047':'stazionario, non equilibrio necessariamente',
 'C3-Q048':'convezione naturale per instabilità di densità se superata la soglia',
 'C3-Q049':q(18)*q(20,1000)/(q(40,100)*15),
 'C3-Q050':'emissione e assorbimento non nulli, bilancio netto zero'}
def dimensional_crosschecks():
 u=SI.Quantity;q=Fraction
 return [
 u(q(540),'joule')/(u(q(1,5),'kilogram')*u(6,'kelvin')),
 u(q(620),'joule')/(u(q(1,4),'mole')*u(q(4157,500),'joule/mole/kelvin')),
 u(100000,'pascal')*u(q(7,250),'kilogram/mole')/(u(q(4157,500),'joule/mole/kelvin')*u(300,'kelvin')),
 u(1,'mole')*u(q(4157,500),'joule/mole/kelvin')*u(15,'kelvin'),
 u(q(45200),'joule')/u(2260000,'joule/kilogram'),
 u(q(1,25),'kilogram')*u(334000,'joule/kilogram')/u(80,'watt'),
 u(q(1,25),'watt/meter/kelvin')*u(q(3,4),'meter**2')*u(20,'kelvin')/u(12,'watt'),
 u(18,'watt')*u(q(1,50),'meter')/(u(q(2,5),'meter**2')*u(15,'kelvin'))]
def main():
 q=sp.Rational;values=source_only_predictions();assert len(values)==50
 expected={2:q(-357,20),5:q(6537,20),8:25,11:25,13:q(21,10),15:q(1240000,4157),17:80,20:q(14000,12471),21:450,24:-1200,25:75,27:q(12471,100),30:100,31:20,34:167,36:300,38:q(125,2),40:q(25100,2299),42:5,44:9,46:q(81,16),49:q(3,50)}
 for n,wanted in expected.items():assert sp.simplify(values[f'C3-Q{n:03}']-wanted)==0,(n,values[f'C3-Q{n:03}'],wanted)
 units=['joule/kilogram/kelvin','kelvin','kilogram/meter**3','joule','kilogram','second','meter','watt/meter/kelvin'];wanted=[Fraction(450),Fraction(1240000,4157),Fraction(14000,12471),Fraction(12471,100),Fraction(1,50),Fraction(167),Fraction(1,20),Fraction(3,50)]
 for quantity,unit,value in zip(dimensional_crosschecks(),units,wanted):assert quantity.to(unit).magnitude==value
 assert 100*q(418,100)*20>10*334 and 0<values['C3-Q040']<20
 assert values['C3-Q015']>0 and values['C3-Q020']>0
 print('SOURCE_ONLY_PRIMARY_MODELS 50 individual predictions;22 exact numeric checks;8 dimensional crosschecks; ice branch and positive absolute states checked; no candidate keys opened',flush=True)
if __name__=='__main__':main()
