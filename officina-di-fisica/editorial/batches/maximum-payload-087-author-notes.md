# Note d’autore — maximum-payload-087

Letti individualmente i 16 originali U3-02 alla fonte 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605. Riletta C2-L004 per spinta, massa totale e volume esterno; primaria C2-L004, prerequisiti C2-L001/L002/L004 e riuso C6. Unico assembler, corso C2, unità u3 e source_path U3-02.

Piattaforma piena, omogenea, rigida e impermeabile, acqua in quiete a ρ = 1 kg/L, con 0 < ρ_p < ρ. Carico centrato in assetto stabile, senza appoggi; resta asciutto e non sposta liquido. Aria e capillarità trascurate. La quantità m_lim è la massa aggiuntiva limite teorica: sotto il limite resta emersione, al limite il volume esterno è tutto immerso e il margine emerso è nullo. Non è una massa totale né un carico operativo garantito. Oltre il limite non si conserva un equilibrio con il carico sempre asciutto e il solo volume V disponibile.

01: massa totale sostenibile ρV = 20 kg, propria ρ_pV = 10 kg, residua 10 kg; g si cancella fra le forze. 02: unità kg, non N. 03: m_lim = (ρ − ρ_p)V; i contributi ρV e ρ_pV sono totale e massa propria, non leggi generali alternative per la capacità. 04: ρ_p da 1/2 a 4/5 kg/L a V = 20 L porta la massa propria da 10 a 16 kg e la riserva da 10 a 4 kg.

05: ρ_p = ρ − m_lim/V = 1 − 10/20 = 1/2 kg/L; dominio inverso 0 < m_lim < ρV. 06: V = 10/(1/2) = 20 L. 07: a ρ_p costante, V da 20 a 50 L dà capacità 10→25 kg e rapporto 5/2. 08: proposta 20 meno corretto 10 = +10 kg; la proposta richiederebbe sostenere 30 kg complessivi con soli 20 kg equivalenti di acqua.

09: ρ_p = ρ − m_lim/V, dimensione di densità e risultato nel dominio. 10: D_A = ρ − ρ_p,A e D_B = ρ − κ₁ρ_p,A sono riserve di densità positive; rapporto κ₂D_B/D_A. 11: A offre 10 kg; B(4/5 kg/L,40 L) offre 8 kg, rapporto 4/5. 12: media 9 kg; ingressi medi 13/20 kg/L e 30 L danno 21/2 kg, differenza 3/2 kg.

13: bersaglio 8 kg con riserva 1/5 kg/L richiede 40 L, rapporto 2. 14: q = 3 kg⁻¹, S = 24 dà capacità 8 kg; a V = 40 L, ρ_p = 4/5 kg/L. Alternative 1/2 e 1/5 kg/L produrrebbero S = 60 e 96; densità uguale o maggiore dell’acqua viola il dominio della capacità aggiuntiva positiva.

15: q = 2 kg⁻¹, b = 1, S_C = 9 dà capacità 4 kg; con V = 20 L, ρ_p = 4/5 kg/L. Le alternative 1/2 e 1/5 kg/L danno letture 21 e 33; non si tratta una capacità algebrica negativa come un carico fisico ammissibile. 16: vincolo ρ_p = cV con c = 1/40 kg/L²; x = V/(1 L), dominio 0 < x < 40. Capacità (x − x²/40) kg; target 10 kg porta a x² − 40x + 400 = (x − 20)² = 0. Unica radice distinta x = 20, densità 1/2 kg/L. È il massimo della famiglia, perché la capacità vale [10 − (x − 20)²/40] kg. Formule alternative poste in blocchi distinti, nessuna catena di uguaglianze con disgiunzioni.

SVG 01/03: prisma 5 × 4 × 1 dm, volume 20 L e massa 10 kg. Fronte 200 × 40 px alla scala 40 px/dm; terza dimensione 4 dm dichiarata. Immersione senza carico 20 px per mezzo decimetro, a carico limite 10 kg immersione 40 px per un decimetro; carico fuori dall’acqua. Barre 100 + 100 = 200 px a 10 px/kg rappresentano massa propria e aggiuntiva nel totale sostenibile, non forze. XML e rendering completo letti.

Assembly e binding deterministici, metadati C2 controllati. Import canonico ROOT in SQLite temporaneo: 16 DRAFT, poi 0 nuove e 16 invariate; 991 pubblicati e storico invariati, SHA256 99c8d805004c82ba63a19f7ad8c0825666ca813d4f15471b8df4db5657b7c9ee. Package SHA256 110e2e9ac6a4aa757c2eaaace3b545519ab2ecb1a73696351a7c033bd9ee31f5. Controlli tecnici d’autore, independentReview NOT_RUN, human NOT_RUN, publication NONE.
