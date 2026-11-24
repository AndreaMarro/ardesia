"""Independent reading of six catalog wrappers and ten unchanged method activities.

No source generator imports. Constants below were independently derived from each
read statement; frozen source hashes prevent reusing this reading for another edition.
The catalog wrappers do not certify their linked lessons or questions.
"""
from fractions import Fraction
from pathlib import Path
import json

import pint
import sympy as sp

from .pipeline import canonical,digest,sha,exact

SI=pint.UnitRegistry(non_int_type=Fraction)
REVIEWED_SOURCES={
 "C1":"8b8860fde273941100c3823ac6eca63f7d3b67b1b4f253f615f6c236a8960818",
 "C2":"60354190758f3fc70d3172601032c3db8e453a32c1607d447d162efef453d38c",
 "C3":"081004ec961106e931a24719e3abadd6c3b2af6d191a6d437c26eb0bb0416f1a",
 "C4":"f6dd8fca626d0443794f0dab3461eb7329e64e7dd80895ecafb471d85ee9b29b",
 "C5":"b3312859efe7a58493bb24b2c9edc273f617ef004982a36b8f80ac41930ef2d0",
 "C6":"81d573b0496aab14d097136a9b9c0aff04416c13f987ef522c8ce8150b20b594",
 "C1-M-formula":"4b18d96898f97a82c33d5b1d9fd440214828316f47b1e9f6669c206c68e84cd2",
 "C1-M-graph":"01466978f7ed2751bca6bcf6bb92a2b75c0d29e89be035e55013285112344947",
 "C2-M-formula":"207259f0d12e84a11359006b591a409f8c5b8473f9488a62c6cf2aca44a2236a",
 "C2-M-graph":"eacb0f47c56f7213e1f55f6362d01c023497d19a980c832f5ef2b2c8e826d3e8",
 "C3-M-formula":"7aa799dbffd68ae4741fed701ee2fb82ea5f683786bb267560e8074394168af0",
 "C3-M-graph":"90a7f03b3907947a06dda97a8b4caa57860756e7ee0b355521b45d565ef80b46",
 "C4-M-formula":"c6c0ae272e9dcca6856d9d53d558a4e6fc9e8705071b54adab083e136b1523b1",
 "C4-M-graph":"f318e3c48f2a4c8236286a7edc23cbfac9d989b2553902b2a82dba967965f6e0",
 "C5-M-formula":"80bf905e0c752af2079486b7b01bfa1b61ae4eac09ba14710a8772d9d9264c3c",
 "C5-M-graph":"80dfd1d7dffc2dbd68d090a44868e760a96eaefce50c2d4c6daea98a64ecd626"
}

# A separate physical model supplies each numeric result, including intermediate steps.
def independent_models():
    Q=SI.Quantity
    mass=(Q(12,'newton')/Q(3,'m/s**2')).to('kg')
    depth=((Q(130,'kPa')-Q(100,'kPa'))/(Q(1000,'kg/m**3')*Q(10,'m/s**2'))).to('m')
    temperature=(Q(200,'kPa')*Q(Fraction(831,100),'liter')/(Q(2,'mole')*Q(Fraction(831,100),'J/(mol*K)'))).to('K')
    work=(Q(3,'kPa')*(Q(6,'liter')-Q(2,'liter'))).to('J')
    resistance=(Q(6,'V')/Q(Fraction(3,10),'A')).to('ohm')
    wavelength=(Q(12,'m/s')/Q(3,'Hz')).to('m')
    acceleration=((Q(6,'m/s')-Q(2,'m/s'))/Q(4,'s')).to('m/s**2')
    displacement=(Q(2,'m/s')*Q(4,'s')+(Q(6,'m/s')-Q(2,'m/s'))*Q(4,'s')/2).to('m')
    slope=(Q(30,'kPa')/Q(3,'m')).to('kPa/m')
    absolute=(Q(100,'kPa')+slope*Q(4,'m')).to('kPa')
    conductance=(Q(3,'A')/Q(6,'V')).to('siemens')
    inverse_slope=(1/conductance).to('ohm')
    speed=(Q(5-1,'m')/Q(Fraction(5,2)-Fraction(1,2),'s')).to('m/s')
    return {
     'C1-M-formula':mass,'C2-M-formula':depth,'C3-M-formula':temperature,
     'C4-M-formula':resistance,'C5-M-formula':wavelength,
     'C1-M-graph':displacement,'C2-M-graph':absolute,'C3-M-graph':work,
     'C4-M-graph':inverse_slope,'C5-M-graph':speed,
     '_acceleration':acceleration,'_slope':slope,'_conductance':conductance}


def symbolic_inverses():
    F,m,a,p,p0,rho,g,h,n,R,T,V,I,U,v,lam,f=sp.symbols('F m a p p0 rho g h n R T V I U v lam f',positive=True)
    systems=[('C1-M-formula',sp.Eq(F,m*a),m,F/a),
      ('C2-M-formula',sp.Eq(p,p0+rho*g*h),h,(p-p0)/(rho*g)),
      ('C3-M-formula',sp.Eq(p,n*R*T/V),T,p*V/(n*R)),
      ('C4-M-formula',sp.Eq(I,U/R),R,U/I),
      ('C5-M-formula',sp.Eq(v,lam*f),lam,v/f)]
    return {key:sp.simplify(sp.solve(eq,target)[0]-expected)==0 for key,eq,target,expected in systems}


MANUAL={
 'C1-M-formula':'12/3=4; (kg·m/s²)/(m/s²)=kg; 4·3=12 ricostruisce la forza.',
 'C1-M-graph':'v(4)=6; (6−2)/4=1; rettangolo 2·4=8 e triangolo (6−2)·4/2=8; 8+8=16 m.',
 'C2-M-formula':'130−100=30 kPa=30000 Pa; 1000·10=10000 Pa/m; 30000/10000=3 m.',
 'C2-M-graph':'Il punto letto è (3,30); 30/3=10 kPa/m; 100+4·10=140 kPa assoluti.',
 'C3-M-formula':'kPa·L=10³·10⁻³ Pa·m³=J; (200·8,31)/(2·8,31)=200/2=100 K, senza moltiplicare i decimali.',
 'C3-M-graph':'p=3 kPa, ΔV=6−2=4 L; W=3·4=12 kPa·L=12 J, positivo per espansione.',
 'C4-M-formula':'6/(3/10)=60/3=20 Ω; 20·3/10=6 V.',
 'C4-M-graph':'I(6)=3; ΔI/ΔU=3/6=1/2=0,5 S; invertendo gli assi 6/3=2 Ω.',
 'C5-M-formula':'Tre cicli in un secondo ripartiscono 12 m: 12/3=4 m; Hz=s⁻¹.',
 'C5-M-graph':'Ampiezza 2 cm; λ=5−1=4 m; T=2,5−0,5=2 s; v=4/2=2 m/s.'}
ASSUMPTIONS={
 'C1-M-formula':'Forza risultante, massa costante e riferimento inerziale; accelerazione non nulla.',
 'C1-M-graph':'Segmento rettilineo v(t) fra gli estremi; velocità positiva. L’area è spostamento; coincide qui con distanza.',
 'C2-M-formula':'Acqua ferma e densità uniforme; g dichiarata costante; pressione superficiale sottratta prima della divisione.',
 'C2-M-graph':'Retta di pressione relativa contro profondità; stessa densità e g nel prolungamento. Non confondere p−p0 con p.',
 'C3-M-formula':'Gas ideale esplicitamente assunto, quantità positiva, volume e pressione assoluta positivi; kelvin, non Celsius.',
 'C3-M-graph':'Lavoro nel modello quasistatico rappresentato dal diagramma p−V; convenzione dichiarata positiva per espansione.',
 'C4-M-formula':'Resistore ohmico, tensione e corrente della medesima misura; corrente diversa da zero.',
 'C4-M-graph':'Retta ohmica attraverso l’origine; ascissa tensione e ordinata corrente. Pendenza è conduttanza, non resistenza.',
 'C5-M-formula':'Onda periodica in propagazione uniforme; creste consecutive e frequenza positiva.',
 'C5-M-graph':'Stessa onda periodica; fotografia spaziale e misura temporale dello stesso punto. λ e T distinti dall’ampiezza.'}
PEDAGOGY={
 'C1-M-formula':'Eliminazione dello stesso fattore su entrambi i membri e controllo inverso; gli errori proposti confondono divisore e incognita.',
 'C1-M-graph':'Scale, punto, pendenza e area sono quattro compiti distinti; il rettangolo iniziale impedisce di scambiare il trapezio per il solo triangolo.',
 'C2-M-formula':'Due operazioni inverse in sequenza; parentesi sulla differenza e conversione kPa→Pa sono esplicitate prima del calcolo.',
 'C2-M-graph':'L’asse specifica la pressione relativa; il passo finale chiede esplicitamente quella assoluta e riaggiunge il riferimento.',
 'C3-M-formula':'Prodotto e divisione sono isolati prima della sostituzione; il fattore8,31 comune evita un calcolo decimale superfluo.',
 'C3-M-graph':'Si sottrae V iniziale prima di misurare l’area; il segno del lavoro è dichiarato. Non si integra da V=0.',
 'C4-M-formula':'Liberazione del denominatore e divisione per I separati; il controllo con RI distingue resistenza da conduttanza.',
 'C4-M-graph':'Lettura degli assi precede il rapporto; lo scambio degli assi rende esplicita la relazione inversa fra le due pendenze.',
 'C5-M-formula':'Cicli al secondo e distanza per ciclo motivano λ=v/f; le alternative dimensionali separano periodo, frequenza e lunghezza.',
 'C5-M-graph':'I due grafici hanno unità orizzontali diverse; i passi separano ampiezza, lunghezza d’onda e periodo prima di calcolare la velocità.'}


def verify(sources):
    missing=set(REVIEWED_SOURCES)-set(sources)
    if missing:raise ValueError('Missing individually read activities: '+','.join(sorted(missing)))
    models=independent_models();inverses=symbolic_inverses()
    expected={
     'C1-M-formula':['m','Dividi per a','F/a',models['C1-M-formula'].magnitude,'N/(m/s²) = kg'],
     'C1-M-graph':['Velocità in m/s',6,models['_acceleration'].magnitude,models['C1-M-graph'].magnitude],
     'C2-M-formula':['h','Sottrai p0','Dividi per rho · g','(p-p0)/(rho*g)',models['C2-M-formula'].magnitude,'Pa/(Pa/m)'],
     'C2-M-graph':['Rispetto alla superficie in kPa',30,models['_slope'].magnitude,models['C2-M-graph'].magnitude],
     'C3-M-formula':['T','Moltiplica per V','Dividi per n · R','p*V/(n*R)',models['C3-M-formula'].magnitude,'J/(J/K) = K'],
     'C3-M-graph':['Volume in L',3,6-2,models['C3-M-graph'].magnitude],
     'C4-M-formula':['R','Moltiplica per R','Dividi per I','U/I',models['C4-M-formula'].magnitude,'V/A'],
     'C4-M-graph':['V, A',3,models['_conductance'].magnitude,models['C4-M-graph'].magnitude],
     'C5-M-formula':['lambda','Dividi per f','v/f',models['C5-M-formula'].magnitude,'(m/s)/Hz'],
     'C5-M-graph':['Una lunghezza in m',2,5-1,Fraction(5,2)-Fraction(1,2),models['C5-M-graph'].magnitude]}
    results=[]
    for key in sorted(REVIEWED_SOURCES):
        row=sources[key];errors=[];checks=[]
        if digest(row)!=REVIEWED_SOURCES[key]:errors.append('Source differs from independently read edition')
        if key not in expected:
            if any(row.get(field) for field in ('steps','blocks','prompt','answer','diagram')):
                errors.append('Catalog wrapper unexpectedly contains an activity')
            if key=='C6' and row.get('includes')!=['C1','C2','C3','C4','C5']:errors.append('Integrated course references changed')
            manual='Nessun calcolo richiesto da questo record: solo titolo e navigazione del corso. Le attività collegate richiedono prove proprie.'
            assumption='Metadati di navigazione; nessuna legge fisica o dato quantitativo da applicare.'
            pedagogy='Titolo e descrizione corrispondono all’ambito; il contenitore non certifica i contenuti che include.'
            dimension={};scope='NO_STUDENT_CALCULATION'
        else:
            wants=expected[key];steps=row.get('steps',[])
            if len(steps)!=len(wants):errors.append('Independent step count mismatch')
            for index,(step,want) in enumerate(zip(steps,wants)):
                got=step.get('answer');ok=(got==want) if isinstance(want,str) else (exact(got)==sp.Rational(want))
                if not ok:errors.append(f'Independent step {index+1} mismatch')
                if step['kind']=='choice' and (step.get('options',[]).count(got)!=1 or len(set(step['options']))!=len(step['options'])):
                    errors.append(f'Independent step {index+1} choice ambiguity')
                checks.append({'step':index+1,'kind':step['kind'],'independentExact':str(want),'ok':ok})
            if key in inverses and not inverses[key]:errors.append('Symbolic inverse failed')
            manual=MANUAL[key];assumption=ASSUMPTIONS[key];pedagogy=PEDAGOGY[key]
            dimension={str(k):str(v) for k,v in models[key].dimensionality.items()};scope='EXACT_MANUAL_CALCULATION'
        results.append({'id':key,'sourceSha256':digest(row),'ok':not errors,'errors':errors,'checks':checks,
         'calculationScope':scope,'manualArithmetic':manual,'dimension':dimension,'physicalAssumptions':assumption,
         'pedagogicalReview':pedagogy,'verificationMode':'INDEPENDENT_EXISTING_EDITION',
         'originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE'})
    return results


def report(sources):
    return {'schemaVersion':'1.0.0','batch':'methods-activities-001','records':verify(sources),
            'verifierSha256':sha(Path(__file__).read_bytes()),'humanApproval':'NOT_RUN','publicationAction':'NONE'}
