"""Twelve original entry diagnostic cases, kept separate from final assessment."""
from decimal import Decimal
from build_content import dump

RAW={
 'strumenti-meccanica':[
  ('unit-speed','U1-02.03','Un nastro trasportatore avanza a18km/h. Converti questa velocità in m/s prima di usarla in un’equazione SI.',5.,'m/s','18·1000/3600=5m/s. Il fattore include sia la lunghezza sia il tempo.'),
  ('vector-sum','U1-04.02','Due forze hanno componenti F1=(4,−1)N e F2=(−2,6)N nello stesso riferimento. Scrivi la risultante per componenti.','(2,5)','N','Somma separatamente4−2 e−1+6: risultante(2,5)N,non la somma dei moduli.'),
  ('newton','U2-02.02','Un carrello di massa4kg subisce una forza risultante orizzontale10N. Qual è l’accelerazione in un riferimento inerziale?',2.5,'m/s²','a=F/m=10/4=2,5m/s²,nel verso della risultante.')],
 'fluidi-termodinamica':[
  ('density','U3-01.03','Un liquido omogeneo ha massa1,08kg e volume0,0009m³. Determina la densità in unità SI.',1200.,'kg/m³','ρ=m/V=1,08/0,0009=1200kg/m³. La densità non si ottiene moltiplicando massa e volume.'),
  ('hydrostatic','U3-02.01','In un fluido fermo di densità850kg/m³ si scende di0,4m. Con g=10m/s²,quanto aumenta la pressione rispetto al punto di partenza?',3400.,'Pa','Δp=ρgΔh=850·10·0,4=3400Pa. È un incremento,non la pressione assoluta.'),
  ('gas-state','U5-01.05','Un gas ideale ha n=0,25mol,T=350K e pressione assoluta80000Pa. ConR=8,31446261815324J/(mol K),trova il volume in m³.',float(Decimal('8.31446261815324')*Decimal('.25')*Decimal(350)/Decimal(80000)),'m³','V=nRT/p≈0,009093943488605106m³. Usa kelvin e pressione assoluta; il risultato è circa9,094L.')],
 'elettricita-magnetismo':[
  ('charge-rate','U6-04.02','Attraverso una sezione di filo passano0,45C in1,5s con verso convenzionale fissato. Qual è la corrente media?',.3,'A','I=Δq/Δt=0,45/1,5=0,3A. Un ampere è un coulomb al secondo.'),
  ('ohmic-load','U6-04.04','Un resistore ohmico ideale da18Ω è collegato a9V costanti. Qual è la corrente?',.5,'A','I=V/R=9/18=0,5A. Il valore riguarda il solo resistore e le condizioni ohmiche dichiarate.'),
  ('stored-charge','U6-05.01','Un condensatore ideale da3µF è mantenuto alla tensione8V. Quale modulo di carica ha ciascuna armatura in µC?',24.,'µC','Q=CV=3µF·8V=24µC,con segni opposti sulle due armature e carica totale del condensatore ideale nulla.')],
 'onde-ottica-radiazioni':[
  ('cycle-rate','U4-01.04','Un sensore registra7oscillazioni complete in2s di un segnale periodico. Determina la frequenza.',3.5,'Hz','f=N/Δt=7/2=3,5Hz. Il periodo sarebbe2/7s,una grandezza diversa.'),
  ('wavelength','U4-01.07','In un mezzo uniforme un’onda viaggia a10m/s con frequenza8Hz. Trova la distanza fra due creste consecutive.',1.25,'m','λ=v/f=10/8=1,25m. Le creste consecutive sono punti in fase a un istante fissato.'),
  ('half-life','U7-05.04','Un campione ha attività iniziale960Bq ed emivita4h. Senza produzione di nuovi nuclei,quale attività media è attesa dopo8h?',240.,'Bq','Sono due emivite:960→480→240Bq. È un valore medio di attività,non una dose.')]
}

def diagnostics_for(path):
    result=[]
    for suffix,obj,prompt,value,unit,feedback in RAW[path]:
        result.append({'id':'diag-'+path+'-'+suffix,'courseId':path,'objectiveId':obj,'prompt':prompt,
          'answer':{'value':value,'unit':unit},'feedback':feedback,
          'use':'diagnostic_without_score_claim','recoveryTarget':{'objectiveId':obj,'lessonId':'ds-2026-'+obj.split('.')[0].lower()},
          'scientificStatus':'AI_CHECKED','editorialStatus':'DRAFT','humanApproval':False,
          'provenance':'Original entry diagnostic authored after leakage finding; distinct data/prompt from final and shown cases.','suitability':'NEEDS_HUMAN_REVIEW'})
    return result

if __name__=='__main__':dump('content/diagnostic-12.json',{'courses':[{'pathId':p,'diagnostic':diagnostics_for(p)} for p in RAW],'humanApproval':False})
