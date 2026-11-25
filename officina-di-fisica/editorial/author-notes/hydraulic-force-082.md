# Authoring — hydraulic-force-082

Letti tutti16 originali `u3-hydraulic-force` della fonte5cfbdcb055ba3ba136f97fb56e997f06e6cf3605,questions/U3-01.json. CourseC2 verificato su tutti16, skill esistenteC2-L003, prereqC2-L001/L002/L003 e reuseC6; unica pipeline astra/1. DRAFT, review scientifica indipendente NOT_RUN e approvazione umana NOT_RUN. Note di calcolo dell’autore per la revisione distinta.

Si confrontano stati di equilibrio con contatti liquido-pistone alla stessa quota, stessa atmosfera esterna, pesi/attriti/inerzia trascurati. F_i e F_o sono carichi incrementali netti dell’atmosfera, non risultanti non nulle sui pistoni fermi. A_i=1cm² fisica, A_o>A_i. Δp=F_i/A_i=F_o/A_o→F_o=F_i A_o/A_i. Non si estende automaticamente questo bilancio di forze istantaneo a corse verticali finite; quote, pressioni e potenziale del liquido possono cambiare. ID03 chiede spostamenti infinitesimi nell’istante di pari quota e usa solo continuità per il rapporto geometrico.

|ID|Calcolo manuale e punti da rileggere|
|---|---|
|01|Fi2N,Ao5cm²→Fo10N;Δp20kPa.|
|02|Rapporto aree puro;1cm²=1/10000m²,non1/100m².|
|03|Vantaggio locale10→Ao/Ai10;Ai ds_i=Ao ds_o→ds_o=ds_i/10. Nessuna uguaglianza automatica di lavori finiti.|
|04|Fi2→3 aAo5:Fo10→15N,stati separati pariquota.|
|05|Fi=Fo Ai/Ao=2N;Ai non cancellata dimensionalmente perché valore numerico1.|
|06|Ao=Ai Fo/Fi=5cm²,non raggio5cm.|
|07|Ao5→4 aFi2:Fo10→8N,rapporto4/5.|
|08|20−10=+10N.|
|09|Fi=Fo Ai/Ao;Fo/Ao da solo è pressione.|
|10|Rapportoκ₁κ₂,scalature già di aree,non raggi.|
|11|Fo,A10,Fo,B12N,rapporto6/5.|
|12|Media11N; ingressi mediFi5/2,Ao9/2 danno45/4N,diverso di1/4.|
|13|Target12N,Fi3→Ao4cm²,rapporto4/5.|
|14|c3N⁻¹,S36→Fo12N,Ao4→Fi3N.|
|15|c2N⁻¹,d1,S31→Fo15N,Ao5→Fi3N. AlternativeFi6,3/2,4,2 danno S61,16,41,21.|
|16|Fi=(2/5N/cm²)Ao fra stati→Ao²=Fo Ai/c=25cm⁴;radici±5cm² in blocchi distinti,solo5 positiva;Fi2N.|

Figura finale letta completa XML e PNG: superfici rettangolari1×1 e5×1cm a40px/cm (40×40 e200×40px). Profilo separato schematico con contatti alla stessaquota, larghezze40 e200px coerenti ma aree definite nel primo pannello. Vettori Fi2N40px eFo10N200px a20px/N,marker separati. Terzo pannello è un esempio diverso con rapporto10 e spostamenti infinitesimi10δ/δ,200/20px a20px/δ. Non mescola il rapporto5 del primo esempio con il rapporto10 del terzo. Nessun CSS o harness modificato; i report tecnici sono separati dal giudizio scientifico.

Preview finale seriale48/48 alle larghezze1440/768/320,con exit0. Una precedente esecuzione aveva completato48 casi ma era rimasta aperta senza figli in teardown: terminato solo quel processo dell’autore e rifatta tutta la prova,sulla nuova versione finale. Import SQLite temporaneo16 poi0 nuovi/16 invariati;991 pubblicati e nessun live head modificati. Nessun cambiamento al test per ottenere l’esito.
