# Authoring — collision-energy-loss-071

Letti tutti i 16 originali `u2-collision-energy-loss` alla fonte Git `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, `questions/U2-06.json`. Prompt, svolgimenti e SVG nuovi; solo pipeline canonica astra/1. DRAFT, revisione scientifica indipendente NOT_RUN, approvazione umana NOT_RUN. Queste sono note di calcolo dell’autore per il revisore distinto, non esiti scientifici.

Due masse uguali m per ciascun corpo, una inizialmente +u e l’altra ferma nel laboratorio inerziale. Moto classico, corpi uniti dopo l’urto, impulso e lavoro esterni trascurabili, nessuna energia lascia il sistema. mu=2mV→V=u/2. K_i=mu²/2,K_f=(2m)(u/2)²/2=mu²/4,E=K_i−K_f=mu²/4>0. L’energia cinetica diminuisce ma il totale si conserva tramite aumento interno E. Skill esistente C1-L009, prereq L001,L002,L005,L007,L008,L009 e reuse C6. E indica diminuzione positiva, ΔK=−E.

| ID | Calcolo e verifica manuale da rileggere |
|---|---|
|01|m2,u2:V1 m/s,K_i4 J,K_f2 J,E2 J.|
|02|mu²:kg·m²/s²=J.|
|03|Derivazione di V dal momento, poi E=mu²/4; massa finale2m.|
|04|m2→4 per entrambi i corpi,u2:E2→4 J,V invariata.|
|05|m=4E/u²=2 kg per ciascun corpo; gruppo4 kg.|
|06|u²4 m²/s²,radici±2 in blocchi distinti; solo2 rapidità.|
|07|u2→4 a m2:E2→8 J,rapporto4.|
|08|Proposto4−corretto2=+2 J;4 J era K_i.|
|09|m=4E/u²; nessuna confusione con inversa di K_i.|
|10|Rapportoκ₁κ₂²: massa lineare,rapidità quadratica.|
|11|A2 J,B16 J,rapporto8.|
|12|Media9 J; medie ingressi m3,u3 danno27/4 J,altra prova.|
|13|E_B16 J,m_B4→u_B4 m/s,rapporto2.|
|14|c3 J⁻¹,S48→E16 J,m4 kg.|
|15|c2 J⁻¹,d1,S9→E4 J,u2→m4 kg. Alternative2,3,5,8 kg danno S5,7,11,17.|
|16|m=(1 kg·s/m)u tra prove: E=cu³/4,u³8 m³/s³→u2 m/s,m2 kg. Cubica positiva,non coppia±2.|

Figura letta XML e rendering finale. Frecce velocità a60 px per m/s: u2→120 px,V1→60 px. Barre energia a40 px/J: iniziale4 J160 px; finale K2 J80 px e incremento interno2 J80 px. L’etichetta finale esplicita ΔU interna, non energia interna assoluta; geometria dei corpi schematica. Preview canonica16×3 larghezze1440,768,320:48 casi senza failure. Import tecnico temporaneo16 poi0 nuovi/16 invariati,991 pubblicati immutati e nessun live head. Nessuna modifica di CSS, guardie, registro o checkpoint.
