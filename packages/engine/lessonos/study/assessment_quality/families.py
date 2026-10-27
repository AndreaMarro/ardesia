"""Original bounded authoring proposals. No student response grader or ledger.

These previews supplement a reviewer dossier. They are not new bank records,
Core activities or publications, and their seed tests are not human approval.
"""
from fractions import Fraction
import hashlib
import json

FAMILIES=(
 ('mru','strumenti-meccanica','U2-uniform-displacement','u2-uniform-displacement-01','Moto rettilineo uniforme'),
 ('continuity','fluidi-termodinamica','U3-constriction-velocity','u3-constriction-velocity-01','Continuità del flusso'),
 ('ohm','elettricita-magnetismo','U6-ohmic-current','u6-ohmic-current-01','Corrente nel resistore ohmico'),
 ('wave','onde-ottica-radiazioni','U4-wave-wavelength','u4-wave-wavelength-01','Lunghezza d’onda'),
)


def family_variants(seed):
    if type(seed) is not int or not 0<=seed<=31:raise ValueError('seed must be an integer in [0,31]')
    speed=seed%5+2;seconds=seed%4+2
    area=seed%4+2;outlet=seed%3+1;inlet_speed=seed%5+1
    voltage=seed%9+6;resistance=seed%4+2
    wave_speed=seed%7+12;frequency=seed%4+2
    return [
      {'id':'mru','status':'DRAFT','humanApproval':False,'unit':'m',
       'parameters':{'speed':speed,'seconds':seconds},
       'prompt':f'Un carrello su guida rettilinea si muove lungo +x a velocità costante {speed} m/s per {seconds} s. Qual è lo spostamento in metri?',
       'answer':str(speed*seconds),'domain':'Riferimento inerziale; velocità costante, tempo positivo. Spostamento distinto dalla posizione finale.',
       'steps':['Scegli +x lungo il moto e considera solo l’intervallo assegnato.',
                f'In ciascun secondo lo spostamento è {speed} m; gli intervalli sono {seconds}.',
                f'La somma degli intervalli dà Δx={speed*seconds} m. (m/s)·s=m.'],
       'distractors':[{'answer':str(speed),'feedback':'Hai usato la distanza di un solo secondo; l’intervallo assegnato dura più secondi.'},
                      {'answer':str(Fraction(speed,seconds)),'feedback':'Dividere ancora per il tempo produce m/s², non uno spostamento.'}],
       'transfer':{'prompt':f'Lo stesso carrello percorre prima {speed*seconds} m lungo +x e poi {speed} m lungo −x. Qual è lo spostamento totale e quale il cammino?',
                   'answer':f'Δx={speed*(seconds-1)} m; cammino={speed*(seconds+1)} m.',
                   'feedback':'Somma gli spostamenti con segno; somma i moduli per il cammino. Non applicare una sola velocità costante all’intero viaggio.'}},
      {'id':'continuity','status':'DRAFT','humanApproval':False,'unit':'cm/s',
       'parameters':{'inletArea':area,'outletArea':outlet,'inletSpeed':inlet_speed},
       'prompt':f'Liquido incomprimibile, flusso stazionario in un tubo senza perdite né ramificazioni: A₁={area} cm², v₁={inlet_speed} cm/s, A₂={outlet} cm². Qual è v₂?',
       'answer':str(Fraction(area*inlet_speed,outlet)),
       'domain':'Velocità medie di sezione; aree positive; regime stazionario e densità costante. Nessuna ipotesi sulla pressione.',
       'steps':[f'In un secondo entra un volume A₁v₁={area*inlet_speed} cm³.',
                'Nel regime indicato non può accumularsi liquido tra le sezioni: lo stesso volume deve uscire.',
                f'Dividendo per A₂ si ottiene v₂={Fraction(area*inlet_speed,outlet)} cm/s. cm³/s diviso cm² dà cm/s.'],
       'distractors':[{'answer':str(Fraction(2*area*inlet_speed,outlet)),'feedback':'Hai raddoppiato la portata senza un secondo ingresso: in regime stazionario uscirebbe più liquido di quanto ne entra.'},
                      {'answer':str(Fraction(area*inlet_speed,2*outlet)),'feedback':'Hai dimezzato la portata pur senza una biforcazione: il liquido si accumulerebbe nel tratto intermedio.'}],
       'transfer':{'prompt':f'La portata {area*inlet_speed} cm³/s si divide in due rami identici, ciascuno di area {outlet} cm². Qual è la velocità media in ogni ramo?',
                   'answer':f'{Fraction(area*inlet_speed,2*outlet)} cm/s',
                   'feedback':'Prima dimezza la portata per simmetria; poi dividi per l’area di un singolo ramo. Una biforcazione richiede il bilancio delle due portate.'}},
      {'id':'ohm','status':'DRAFT','humanApproval':False,'unit':'A',
       'parameters':{'voltage':voltage,'resistance':resistance},
       'prompt':f'Un resistore ohmico ideale da {resistance} Ω è collegato a {voltage} V continui. Quale corrente lo attraversa?',
       'answer':str(Fraction(voltage,resistance)),
       'domain':'Resistenza positiva e costante; tensione continua; convenzione passiva. Il modello non descrive diodi o variazioni termiche.',
       'steps':['La resistenza è il rapporto tra tensione e corrente, R=V/I.',
                f'Isola I e dividi {voltage} V per {resistance} Ω: I={Fraction(voltage,resistance)} A.',
                f'Controlla la potenza: VI={Fraction(voltage**2,resistance)} W e RI² ha lo stesso valore, positivo.'],
       'distractors':[{'answer':str(voltage*resistance),'feedback':'V·Ω non ha dimensione di corrente. Per trovare I occorre dividere per la resistenza.'},
                      {'answer':str(Fraction(resistance,voltage)),'feedback':'Hai calcolato il reciproco della corrente, con unità A⁻¹.'}],
       'transfer':{'prompt':f'Due resistori identici da {resistance} Ω sono ora in serie sul generatore da {voltage} V. Trova la corrente e la potenza totale.',
                   'answer':f'I={Fraction(voltage,2*resistance)} A; P={Fraction(voltage**2,2*resistance)} W.',
                   'feedback':'Le resistenze in serie si sommano; usa la stessa corrente in entrambi. La potenza del generatore è la somma delle dissipazioni.'}},
      {'id':'wave','status':'DRAFT','humanApproval':False,'unit':'m',
       'parameters':{'speed':wave_speed,'frequency':frequency},
       'prompt':f'Un’onda periodica avanza a {wave_speed} m/s in un mezzo omogeneo. La sorgente compie {frequency} oscillazioni al secondo. Qual è la lunghezza d’onda?',
       'answer':str(Fraction(wave_speed,frequency)),
       'domain':'Onda periodica e velocità di fase dichiarata; frequenza positiva. Nessun passaggio implicito a un altro mezzo.',
       'steps':[f'Un ciclo dura T=1/f={Fraction(1,frequency)} s.',
                'Durante un ciclo un fronte avanza di una lunghezza d’onda.',
                f'La distanza vT è {Fraction(wave_speed,frequency)} m. Sommando {frequency} lunghezze d’onda si ricostruiscono {wave_speed} m in un secondo.'],
       'distractors':[{'answer':str(wave_speed*frequency),'feedback':'Il prodotto v·f ha unità m/s²; la distanza di un ciclo si ottiene moltiplicando per il periodo.'},
                      {'answer':str(Fraction(frequency,wave_speed)),'feedback':'f/v ha unità m⁻¹ e rappresenta il reciproco della lunghezza d’onda.'}],
       'transfer':{'prompt':f'La stessa sorgente da {frequency} Hz eccita un secondo mezzo in cui la velocità è {2*wave_speed} m/s. Quali sono frequenza e nuova lunghezza d’onda?',
                   'answer':f'f={frequency} Hz; λ={Fraction(2*wave_speed,frequency)} m.',
                   'feedback':'La frequenza è imposta dalla sorgente; cambia la distanza percorsa in un ciclo. Una velocità doppia dà una lunghezza d’onda doppia.'}}
    ]


def batch_dossiers(bank):
    variants={variant['id']:variant for variant in family_variants(0)}
    parameter_sets={identifier:set() for identifier,*_ in FAMILIES}
    for seed in range(32):
        for variant in family_variants(seed):
            parameter_sets[variant['id']].add(json.dumps(variant['parameters'],sort_keys=True))
    return [{'id':identifier,'courseId':course,'familyId':family,'questionId':question,'title':title,
             'questionVersion':bank.question_version(question),'contentSha256':bank.approval_content_sha256(question),
             'seedRange':[0,31],'seedEvaluations':32,'distinctParameterSets':len(parameter_sets[identifier]),'preview':variants[identifier],'previewVersion':1,
             'previewSha256':hashlib.sha256(json.dumps(variants[identifier],ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest(),
             'limits':'Bozza editoriale per revisore; varianti e transfer non sono record pubblicati né attività consegnabili.'}
            for identifier,course,family,question,title in FAMILIES if question in bank._by_id]
