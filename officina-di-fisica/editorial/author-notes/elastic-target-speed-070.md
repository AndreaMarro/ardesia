# Authoring — elastic-target-speed-070

Letti singolarmente tutti i 16 originali `u2-elastic-target-speed` nel file Git `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605:packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-06.json`. Nuovi prompt e svolgimenti astra/1 attraverso il solo helper canonico. DRAFT, revisione scientifica indipendente NOT_RUN, approvazione umana NOT_RUN. Calcoli d’autore per la review, nessuna autocertificazione.

Sistema: due masse classiche costanti e positive, bersaglio M=2 kg a riposo nel laboratorio inerziale; impulso e lavoro esterni trascurabili, urto frontale elastico effettivo. Asse positivo incidente, velocità finale incidente w orientata, V bersaglio positiva. Quantità di moto mu=mw+MV; energia mu²/2=mw²/2+MV²/2. Nel ramo V>0: u+w=V e V=2mu/(m+M), w=(m−M)u/(m+M). Il ramo V=0,w=u non è un contatto con trasferimento. Skill e feedback L009 dal catalogo esistente; prereq L001,L002,L005,L007,L008,L009, reuse C6.

| ID | Calcolo e attenzione |
|---|---|
|01|m=M=2 kg,u=2→w=0,V=2 m/s; p=4 kg·m/s,K=4 J prima/dopo.|
|02|Rapporto masse puro, V in m/s.|
|03|Derivazione fattorizzando la differenza di quadrati e dividendo solo nel ramo V>0.|
|04|m4,u2→w2/3,V8/3 m/s; K iniziale8 J, finale8/9+64/9=8 J.|
|05|m=MV/(2u−V)=2 kg; dominio 0<V<2u.|
|06|u=V(m+M)/(2m)=2 m/s.|
|07|u2→4 a masse fisse dà V2→4, rapporto2.|
|08|4−2=+2 m/s; bersaglio a4 avrebbe16 J>4 iniziali.|
|09|Inversa positiva richiede 2u−V>0.|
|10|Rapporto κ₁κ₂S/S_B, S=m+M,S_B=κ₁m+M. M non scala.|
|11|V_A2,V_B16/3 m/s; rapporto8/3.|
|12|Media esiti11/3 m/s; medie ingressi danno18/5, differenza1/15 m/s.|
|13|Obiettivo16/3 m/s,m_B4→u_B4 m/s, rapporto2.|
|14|c3 s/m,S16→V16/3,2u−V8/3→m4 kg.|
|15|c2 s/m,d1,S19/3→V8/3,u2→m4 kg. Masse2,3,5,8 danno S5,29/5,47/7,37/5.|
|16|m=(1 kg·s/m)u fra prove. r=u/(1 m/s): r²−r−2=(r−2)(r+1); radici2 e−1, solo2 fisica. Non±2.|

SVG in tre pannelli letto XML e rendering completo: scala unica velocità60 px per m/s. Base freccia2 m/s120 px; prova diversa m4,u2 con w2/3→40 px,V8/3→160 px. Ogni vettore è un path separato con marker-end, anche le due frecce nell’ultimo pannello. Dimensioni dei corpi dichiarate schematiche. Preview canonica 16×3 larghezze1440,768,320: 48 casi senza failure. Import tecnico SQLite temporaneo16 poi0 nuovi/16 invariati, nessun live head e991 pubblicati immutati. Nessun cambiamento ai gate, CSS o registro.
