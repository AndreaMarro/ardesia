# Note d’autore — hydraulic-series-110

Letti individualmente i 16 originali U3-04 alla fonte 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, incluso il caso particolare 06. Rilette le lezioni reali C2-L005/L008/L009; primaria C2-L009, prerequisiti C2-L001/L005/L008/L009 e riuso C6. Assembler unico course C2, unit u3, source_path U3-04.

Due elementi lineari positivi in serie, regime stazionario incomprimibile, nessuna diramazione, fuga o accumulo intermedio. Le prese hanno uguale quota e uguali contributi cinetici; giunzioni ideali senza ulteriori perdite o macchine. La portata positiva è comune, le cadute positive si sommano. Le resistenze sono costanti entro una prova e possono cambiare fra apparati. Sono grandezze continue, non conteggi Ns/Np.

01: caduta totale (2+3)Q, dunque R_eq = 5 kPa·s/L. L’alternativa 6/5 appartiene al parallelo. 02: pressione divisa per portata dà ML⁻⁴T⁻¹ e kPa·s/L; Pa·s è viscosità, il reciproco è conduttanza. 03: la pressione intermedia si elimina in (p_a−p_b)+(p_b−p_c); dividere per Q restituisce R₁+R₂, non una media né un prodotto. 04: solo R₁ cambia 2→4, totale 5→7, non 10.

05: R₁ = 5−3 = 2 kPa·s/L; dominio R_eq>R₂. 06: R₁=2,R₂=4 danno totale 6; salto 12 kPa dà Q=2 L/s. La prima caduta è 4 kPa e la seconda 8, non due metà uguali. 07: R₂ da 3 a 6 porta totale 5→8, rapporto 8/5. 08: proposta meno corretta 10−5 = 5 kPa·s/L, con segno positivo. 09: sottrazione R₁=R_eq−R₂; quoziente puro e formula inversa parallela sono scartati per dimensione o dominio.

10: totale B κ₁R₁+κ₂R₂ diviso totale A R₁+R₂; con fattori uguali si recupera il fattore comune. 11: 4+6=10 contro 2+3=5, rapporto 2. 12: media dei totali (5+10)/2 = 15/2 kPa·s/L. La somma delle medie 3+9/2 coincide: il modello è lineare. 13: target 10 meno primo elemento B 4 lascia secondo elemento 6; rispetto ai 3 iniziali, rapporto 2.

14: display continuo adimensionale, q=15/5=3 L/(kPa·s). S_B=30 rappresenta totale 10; R₁,B=10−6=4. 15: q=(21−11)/(10−5)=2 L/(kPa·s), b=1. S_C=15 rappresenta totale 7; tolti 3, R₁,C=4. Alternative 8,2,5,3 generano letture 23,11,17,13, tutte diverse da 15. L’offset adimensionale si rimuove prima della sottrazione fra resistenze. 16: vincolo R₁=(2/3)R₂ dà (5/3)R₂=5, quindi R₂=3 e R₁=2; la verifica ricostruisce il totale e il rapporto.

SVG 01/03/06 letto in XML e rendering completo. Primo schema: R₁=2,R₂=3, Q=2 L/s; frecce separate lunghe 80 px a 40 px/(L/s). Pressioni assolute 110/106/100 kPa producono cadute 4/6, totale 10. Blocchi simbolici senza scala geometrica. Barre di R lunghe 60+90=150 px a 30 px/(kPa·s/L); barre di pressione 120+180=300 px a 30 px/kPa, scale dimensionalmente diverse esplicite. Terzo pannello distinto: R₁=2,R₂=4, totale 6, Q=2 a salto 12; barre 120+240=360 px a 30 px/kPa, prima quota un terzo.

Due assembly finali e binding riprodotti identici, package SHA256 4ece0e0ba11a501d11eb9926acff35d62c69e532dc5116ba7cd5c63fe1980593. Import canonico ROOT su SQLite temporaneo: 16 DRAFT, poi 0 nuove e 16 invariate; 991 pubblicati e storico conservati, SHA256 pubblicati 99c8d805004c82ba63a19f7ad8c0825666ca813d4f15471b8df4db5657b7c9ee. Anteprima tecnica autore 48 casi a 1440/768/320 px, zero failure. Il protocollo finale dell’integratore resta separato. Nessuna approvazione scientifica propria: independentReview NOT_RUN, human NOT_RUN, publication NONE.
