"""Original authoring material for adaptation by the existing CoursePack owner.

No imported private knowledge text. Human scientific/editorial approval remains false.
"""
from build_content import ROOT, PATHS, SYLLABUS, dump

LESSONS = {}

def Q(prompt,answer,feedback):
    return {'prompt':prompt,'answer':answer,'feedback':feedback}

def L(ident,explanation,worked,steps,result,practice,transfer,errors,hints,checks):
    source=next(s for s in SYLLABUS if s[0]==ident)
    target_ids=[f'{ident}.{i:02d}' for i,_ in enumerate(source[3].split(';'),1)]
    LESSONS[ident]={'id':'ds-2026-'+ident.lower(),'familyId':ident,'pathId':PATHS[ident[:2]],'unitId':ident[:2],
      'title':source[2],'sourcePages':source[1] if isinstance(source[1],list) else [source[1]],
      'subtargetIds':target_ids,'editorialStatus':'DRAFT','scientificStatus':'AI_CHECKED','humanApproval':False,
      'provenance':'Original AI-authored proposal created 2026-10-25; no donor code/assets or private editorial-kit text copied.',
      'prerequisites':['Leggere dati e unità SI','Distinguere modello ideale da misura','Conservare segni e dominio delle formule'],
      'explanation':explanation,
      'workedExample':{'prompt':worked,'steps':steps,'result':result},
      'practice':practice,'transfer':transfer,'commonErrors':errors,'hintLadder':hints,
      'recap':checks[0],'transcript':explanation+' Esempio: '+worked+' '+ ' '.join(steps)+' Risultato: '+result,
      'scientificCounterchecks':checks,
      'assessmentCoverageStatus':'REQUIRES_SUBTARGET_REVIEW',
      'releaseStatus':'PROPOSAL_ONLY; A selects original demo or protected editorial review; no publication approval implied',
      'integrationStatus':'NOT_INTEGRATED','audioStatus':'TRANSCRIPT_ONLY; audio playback NOT_RUN'}

L('U1-04',
 'Un vettore descrive modulo, direzione e verso. In assi cartesiani ortogonali si scrive con componenti: il modulo è la radice della somma dei quadrati. Somma e differenza agiscono sulle componenti; non si sommano i moduli salvo casi allineati concordi. Il prodotto scalare A·B = AxBx + AyBy restituisce uno scalare, può essere negativo e vale zero per vettori ortogonali. Il prodotto vettoriale restituisce un vettore perpendicolare al piano: per due vettori nel piano xy la componente z è AxBy − AyBx, con segno dato dalla regola della mano destra. Scambiando i fattori il prodotto scalare resta uguale e quello vettoriale cambia segno. Le unità dei prodotti si moltiplicano. Una risultante nulla non impone che ciascuna forza sia nulla.',
 'Due forze nel piano sono A=(3,4) N e B=(−3,4) N. Trova A+B, A−B, A·B e A×B.',
 ['Somma: (3−3,4+4)=(0,8) N; modulo 8 N.', 'Differenza: (3+3,4−4)=(6,0) N.', 'Scalare: 3(−3)+4·4=7 N². Vettoriale: z=3·4−4(−3)=24 N², verso +z.'],
 'Risultante (0,8) N; differenza (6,0) N; scalare 7 N²; vettoriale (0,0,24) N².',
 Q('Per C=(6,0) m e D=(0,8) m calcola modulo della somma e prodotto scalare.', '10 m; 0 m²', 'La somma è (6,8) m: Pitagora dà 10 m. I vettori sono ortogonali, quindi il prodotto scalare è nullo.'),
 Q('Due spostamenti hanno componenti (2,−1) m e (−2,1) m. Un loro prodotto vettoriale nullo implica verso concorde? Motiva.', 'No: sono opposti; somma nulla, prodotto scalare −5 m², prodotto vettoriale nullo.', 'Il vettoriale nullo indica parallelismo, anche in verso opposto. Il segno dello scalare distingue questo caso.'),
 ['Sommare 5 N+5 N ottenendo sempre 10 N','Scrivere N invece di N² per prodotti fra forze','Invertire il segno di AxBy−AyBx'],
 ['Disegna gli assi e scrivi ogni coppia ordinata','Somma prima le x e poi le y','Controlla se il risultato rispetta le simmetrie'],
 ['Le operazioni sui vettori vanno verificate per componenti, verso e unità.','|A|=|B|=5 N; risultante verticale attesa per simmetria.','B×A=−A×B; A·B=B·A.'])

L('U5-04',
 'Scegliamo come sistema un gas chiuso e usiamo ΔU=Q−W: Q è positivo se entra calore e W se il gas compie lavoro sull’ambiente. Energia interna U è funzione di stato; Q e W descrivono trasferimenti e dipendono dal percorso. Per un gas ideale U dipende dalla temperatura. In un’isocora il volume resta fermo e W=0. In un’isobara quasi statica W=p(Vf−Vi), area sotto il grafico p-V. In un’isoterma ideale ΔU=0, quindi Q=W; non significa Q=0. In un’adiabatica Q=0 e un’espansione con W>0 riduce U e T. Un processo reversibile è un limite ideale che può essere invertito senza variazioni nette di sistema e ambiente; attrito e passaggi con differenze finite producono irreversibilità. La sola forma di un grafico non certifica reversibilità. Prima di usare l’area p-V occorre sapere che la pressione esterna coincide con quella del gas nel limite quasi statico.',
 'Un gas si espande quasi staticamente a 100 kPa da 2 L a 5 L e riceve 500 J di calore. Trova W e ΔU.',
 ['Converti: 100 kPa=100000 Pa e ΔV=3 L=0,003 m³.', 'Lavoro fatto dal gas: W=pΔV=300 J.', 'Bilancio: ΔU=500−300=200 J. Il gas conserva internamente parte del calore ricevuto.'],
 'W=+300 J; ΔU=+200 J.',
 Q('Un gas in recipiente rigido cede 80 J. Quanto valgono W e ΔU con la convenzione dichiarata?', 'W=0 J; ΔU=−80 J', 'Volume costante annulla il lavoro p dV. Il calore uscente ha Q negativo.'),
 Q('In una compressione adiabatica vengono compiuti 120 J sul gas ideale. Trova Q,W,ΔU e il verso della variazione di T.', 'Q=0 J; W=−120 J; ΔU=+120 J; T aumenta.', 'Il lavoro sul gas è negativo nella convenzione del lavoro fatto dal gas. Un’adiabatica non è necessariamente isoterma.'),
 ['Usare litri senza conversione in pΔV','Cambiare convenzione per W a metà soluzione','Confondere isoterma e adiabatica'],
 ['Scrivi per primo ΔU=Q−W e il sistema','Individua quale variabile resta costante','Controlla il segno guardando la direzione del trasferimento'],
 ['Dichiara sempre sistema, segni e ipotesi prima del bilancio.','Pa·m³=J; 10^5·3·10^-3=300.','Q=ΔU+W=200+300=500 J; in un ciclo ΔU totale è zero, non necessariamente Q e W.'])

L('U6-04',
 'La corrente convenzionale è carica netta per unità di tempo: ampere significa coulomb al secondo. Un generatore ideale mantiene la differenza di potenziale assegnata. Per un resistore ohmico a condizioni materiali costanti vale V=RI; per un filo uniforme R=ρL/A, dove la resistività ρ ha unità Ω m. In serie i resistori condividono la corrente e le cadute si sommano. In parallelo condividono la tensione e le correnti si sommano. La potenza dissipata è P=VI=I²R=V²/R, positiva per un resistore passivo anche invertendo la polarità. L’energia dissipata in tempo costante è Pt e si misura in joule, non watt. Passare da serie a parallelo cambia il circuito: non basta guardare la vicinanza delle forme nel disegno. Il modello a due resistori non comprende resistenza interna del generatore, riscaldamento o limiti reali di potenza.',
 'Un generatore ideale da 12 V alimenta resistori da 4 Ω e 8 Ω in parallelo. Trova correnti e potenze.',
 ['Ogni ramo ha 12 V: I1=12/4=3 A; I2=12/8=1,5 A.', 'I totale=4,5 A; R equivalente=12/4,5=8/3 Ω.', 'P1=36 W; P2=18 W; totale=54 W. Controlla VI totale=12·4,5=54 W.'],
 'I totale 4,5 A; R equivalente 8/3 Ω; P totale 54 W.',
 Q('Gli stessi due resistori sono ora in serie a 12 V: trova I, V1,V2 e P totale.', '1 A; 4 V; 8 V; 12 W', 'La serie ha 12 Ω. La stessa corrente percorre entrambi e le due cadute sommano 12 V.'),
 Q('Un filo ohmico raddoppia lunghezza e area, a ρ costante. Cambiano R e P a tensione fissata? Se invece raddoppia solo L?', 'R invariata e P invariata nel primo caso; R raddoppia e P si dimezza nel secondo.', 'Usa R=ρL/A e poi P=V²/R. A corrente fissata la conclusione sulla potenza sarebbe diversa.'),
 ['Sommare resistenze in parallelo','Pensare che una corrente negativa dia potenza Joule negativa','Confondere potenza ed energia'],
 ['Identifica i nodi equipotenziali','Scrivi quale grandezza è uguale sui due resistori','Verifica somma correnti e bilancio potenze'],
 ['Una rete passiva deve rispettare continuità della corrente e potenza dissipata non negativa.','In parallelo R equivalente è minore di 4 Ω: 8/3 Ω soddisfa il limite.','Invertendo V tutte le correnti cambiano segno e le potenze restano positive.'])

L('U7-07',
 'Nella riflessione l’angolo riflesso uguaglia l’angolo incidente, misurati dalla normale. Nella rifrazione n1 sinθ1=n2 sinθ2 e n=c/v; entrando in un mezzo con indice maggiore il raggio si avvicina alla normale. La frequenza resta fissata dalla sorgente, mentre velocità e lunghezza d’onda cambiano. Per una lente convergente sottile scegliamo f>0 e oggetto reale a distanza p>0; 1/f=1/p+1/q. Una soluzione q>0 descrive un’immagine reale dall’altro lato, q<0 un’immagine virtuale sul lato dell’oggetto. L’ingrandimento trasversale è m=−q/p. A p=f i raggi emergono paralleli e l’immagine non è a distanza finita. Per p<f l’immagine è virtuale, diritta e ingrandita: una lente convergente non forma sempre un’immagine reale. Tutte queste leggi richiedono il modello geometrico, lente sottile e raggi vicini all’asse.',
 'Una lente convergente ha f=10 cm; un oggetto è posto a p=30 cm. Determina q e m.',
 ['1/q=1/10−1/30=1/15 cm^-1.', 'q=15 cm>0: immagine reale oltre la lente.', 'm=−15/30=−0,5: immagine capovolta e alta metà dell’oggetto.'],
 'q=15 cm; m=−0,5; immagine reale e capovolta.',
 Q('La stessa lente ha un oggetto a 5 cm: calcola q e m.', 'q=−10 cm; m=+2', 'L’oggetto è dentro il fuoco: il segno negativo di q indica immagine virtuale sul lato dell’oggetto, non una distanza fisica impossibile.'),
 Q('Un raggio passa dall’aria n=1 a vetro n=1,5 con θi=30°. Quanto vale sinθt e quale angolo ha il raggio riflesso? Cambia la frequenza?', 'sinθt=1/3; θriflesso=30°; frequenza invariata.', 'Snell usa gli angoli dalla normale. Il vetro riduce velocità e lunghezza d’onda, non la frequenza.'),
 ['Misurare gli angoli dalla superficie','Trattare q negativa come errore numerico','Sostenere che nel vetro cambia la frequenza'],
 ['Disegna normale o asse ottico','Dichiara la convenzione dei segni','Confronta p con f prima del calcolo'],
 ['La natura dell’immagine richiede segno di q e ingrandimento, non il solo tipo di lente.','1/10=1/30+1/15 in cm^-1.','p=f è caso degenere senza q finita; per p→∞, q→f.'])

def write_lessons():
    for ident,lesson in LESSONS.items():
        dump('content/'+ident+'.json',lesson)
    dump('content/index.json',{'baseSha':'64f6206271b218683f4d45cf953d6ee4b9d5f414','familyCount':38,'authoredFamilyCount':len(LESSONS),'courseComplete':False,'humanApproval':False,'lessons':[{'id':v['id'],'familyId':k,'pathId':v['pathId'],'file':k+'.json'} for k,v in LESSONS.items()],'residualFamilies':[x[0] for x in SYLLABUS if x[0] not in LESSONS]})

if __name__=='__main__':
    write_lessons()
