# Authoring — vertical-wall-force-081

Letti tutti16 originali `u3-vertical-wall-force` nella fonte5cfbdcb055ba3ba136f97fb56e997f06e6cf3605,questions/U3-01.json. Nuovi svolgimenti per ID e figura progressiva, unica pipeline astra/1. Tutti16 courseC2, skill realeC2-L002, prereqC2-L001/L002 e reuseC6. DRAFT; scientific review indipendente NOT_RUN; human approval NOT_RUN. Note di calcolo dell’autore, non esiti scientifici.

Parete verticale rettangolare con bordo bagnato superiore al pelo libero, stesso p_atm su entrambe le facce, acquaρ1000kg/m³ e g10m/s². Con z profondità positiva, p_net=ρgz cresce da0 aρgh, mediaρgh/2. Forza netta F=ρgbh²/2; in unità SI il coefficienteρg/2=5000N/m³,non un5 privo di dimensioni. Non si applica la pressione massima a tutta l’area; la risultante è orizzontale. La proiezione della forza in SVG non è collocata alla profondità della pressione media e non pretende di assegnare il punto di applicazione.

|ID|Calcoli e controlli manuali|
|---|---|
|01|b2,h2→p_fondo20kPa,p_media10kPa,A4m²,F40kN.|
|02|Pa·m²=N,kN1000N.|
|03|Profilo triangolare,pressione massima sul fondo non uniforme;atmosfera comune si cancella.|
|04|b2→1 a h2: F40→20kN.|
|05|b=2F/(ρgh²)=2m; coefficiente20kN/m.|
|06|h²4m²,radici±2 in blocchi distinti,solo2 positiva.|
|07|h2→4 a b2:F40→160kN,rapporto4 per area×pressione.|
|08|80−40=+40kN.|
|09|b=2F/(ρgh²),dimensioni lunghezza; h non al quadrato darebbe area.|
|10|Rapportoκ₁κ₂².|
|11|b1,h4→F80kN,rapporto2 su40. AreeA/B entrambe4m² ma pressione media diversa.|
|12|Media60kN; ingressi medi b3/2,h3 danno135/2kN,non60.|
|13|Target80,b1→h²16,h4m,rapporto2.|
|14|c3kN⁻¹,S240→F80,h4→b1m.|
|15|c2kN⁻¹,d1,S41→F20,h2→b1m;alternativeb2 e1/2 dannoS81 e21; b0 e−1 fuori dominio.|
|16|b=h→F=ρgh³/2,h³8m³→h2m,unica radice fisica;non±2.|

Figura letta completa XML e PNG finale: frontale200×200px a100px/m per2×2m; profilo laterale con stessa profondità100px/m e pressioni0,5,10,15,20kPa rappresentate da segmenti0,20,40,60,80px a4px/kPa,ciascun vettore con marker separato. Forza40kN proiettata separatamente200px a5px/kN. Etichetta pelo libero allontanata dalla tacca prima del commit finale. Preview finale48/48 alle larghezze1440/768/320 con exit0; prima esecuzione aveva chiusura tardiva ma è terminata anch’essa0. Harness della worktree rimasto invariato,nessun CSS o gate modificato. Import SQLite temporaneo16 poi0 nuovi/16 invariati;991 pubblicati e live heads immutati.
