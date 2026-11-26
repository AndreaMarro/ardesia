# Revisione indipendente — drop-detachment-128

Revisore distinto dall’autore. Tutti gli 80 prompt originali B125–129 di U3-05 letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605; derivazioni salvate prima di aprire i pacchetti candidati. Gli handoff dell’autore fornivano SHA, file e ipotesi generali, senza anticipare risultati numerici o chiavi. Nessuna chiave originale usata per la derivazione. Successivamente letti tutti i 16 record di questo lotto, ogni opzione, blocco, formula, hint, feedback, didascalia e metadato. Nessuna importazione di authoring e nessuna modifica ai candidati.

La competenza primaria C2-L010 è reale e tratta tensione superficiale, Laplace, capillarità ed energia di superficie. I prerequisiti C2-L001/L002/L004 appartengono al corso; non sono competenze inventate. Le ipotesi ideali esplicite delle schede delimitano ciascuna applicazione.

Edizione finale riletta: c6cc7dc06c70c2780168a32fb6400a5f5f487987. Package SHA256 ba9c341e271aaa540fa1f287555c9cb759adc23d1fc00e0115228fe3148198f1; binding SHA256 5e00c4efed5def756eb9a506c7ce7e485596ab3881e8ba1f77073ae627cc9fc8. Oracolo indipendente SymPy, unità esatte con Pint e Fraction; aritmetica di risposta con AST limitato, senza eval né sympify di testo candidato. π e radicali restano simbolici. Valori del contratto: EXACT_ORACLE e AI_CONCEPTUAL; il secondo conserva la specifica prova fisica e non equivale ad assenza di ragionamento.

Ipotesi del lotto: Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.

Figura: XML e rendering completo letti. Raggio del bordo 40 px a 40 px/mm, goccia dichiarata senza scala volumetrica. Frecce 100 px uguali e opposte per F₀=π/25 mN=4π·10⁻⁵ N. Barre da zero 160/400 px a 40 px per π µL rappresentano 4π/10π µL; non r³. Nessun raggio della goccia dedotto dal profilo schematico.

## AR-u3-drop-detachment-01

V_lim=2πrγ/(ρg). r=10⁻³ m,γ=1/50 N/m danno F_max=4π·10⁻⁵ N; V=4π·10⁻⁹ m³=4π µL. π rimane esatto.

Ipotesi applicate: Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.

Alternative e feedback: 8π raddoppia di nuovo la forza, 2π perde il due, 4 perde π, π/4 rovescia il fattore. La geometria del volume non è quella del bordo.

Esito AI: PASS_AI. Risultato esatto: 4*pi. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 5507317bdb5ba4a733c44ca3be4a91a575c13a42c993cce47661b6cc3e822cab; candidato SHA256 f6bc44a36a800cd67494e12aa0a73bf94dd3021fb047539d9c5ebf9f806dc048; firma di lettura 863d8dd2e83f8eb9003321589298f253f2496a4efce9b594ea705ef37ee7bf92.

## AR-u3-drop-detachment-02

1 µL=10⁻⁶ L=10⁻⁹ m³=1 mm³. [F/(ρg)]=L³. Nessun calcolo numerico autonomo richiesto, conversione giustificata esattamente.

Ipotesi applicate: Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.

Alternative e feedback: mm lunghezza, mm² area, mN forza, Pa pressione. Densità e gravità convertono peso in volume.

Esito AI: PASS_AI. Risultato esatto: µL. Ambito del calcolo: NO_STUDENT_CALCULATION. Source SHA256 be23fabe161f5bffb2afe4a9ca8c6dfc940ec8338258055e3b86c93fc455dd3c; candidato SHA256 826e4682d6de0a818cabe6f595404285ffb2a45eb99493606b1b882a46b0e66a; firma di lettura 90b04571bc4808d655e7794aa40cffec58a8d11c22629f19d4ed7362e1e83e7c.

## AR-u3-drop-detachment-03

Alla soglia ρgV_lim=2πrγ. Dividere per ρg dà V_lim=2πrγ/(ρg), senza assegnare forma sferica alla goccia.

Ipotesi applicate: Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.

Alternative e feedback: 4π aggiunge interfaccia non assegnata; r² trasforma perimetro in area; reciproco volume inverso; senza ρg resta forza.

Esito AI: PASS_AI. Risultato esatto: V_lim = 2 π r γ / (ρ g). Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 0da9fc08f42363cc4099c3aa282efca32c95303973e0662dbeed6a263f064116; candidato SHA256 26d5c7f03f0f4b06ef6afc66fb2f108511c6da7bc5686a7e6a291cdbe73bc38f; firma di lettura 114d63791ce3773eff743ded97d4d0110178f36cc70b13e4e377762325a70a24.

## AR-u3-drop-detachment-04

r da 1 a 2 mm con γ=20: V passa da 4π a 8π µL, fattore due dal perimetro.

Ipotesi applicate: Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.

Alternative e feedback: 16π usa r²,32π usa r³,2π inversa,4π ignora il nuovo bordo.

Esito AI: PASS_AI. Risultato esatto: Da 4π a 8π µL. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 0eab0e8941a3cf7c194f0313c9ffc5521e77d4b3bb72abb05838e6172c1bd735; candidato SHA256 a9750cc2c0705e28eeb5b45ea9b04f5cb26591adbd5fa1d90cf07004e46ef7e4; firma di lettura 56e81ee2667cf46c7522ad50d841b8b8ee8fc065b18dfb8b0ed75acd3f2c3dc0.

## AR-u3-drop-detachment-05

r=ρgV/(2πγ). I π si cancellano: (4π·10⁻⁵ N)/(4π·10⁻² N/m)=10⁻³ m=1 mm.

Ipotesi applicate: Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.

Alternative e feedback: Un raggio ricavato dal volume di sfera risolverebbe un altro modello e non il raggio del sostegno.

Esito AI: PASS_AI. Risultato esatto: 1. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 245a7ae5319b6de944f955b3167543f72568912d7754260374b0b7666f30091d; candidato SHA256 0f4075c847e53c060baf30e8b5fdca55d941ca56366850c2051e121704feba7b; firma di lettura ba655ab79da2ef5e10902c9742a5aa589d84e8acecab57adbb151b231984904e.

## AR-u3-drop-detachment-06

γ=ρgV/(2πr)=1/50 N/m=20 mN/m. Non richiede π decimale né raggio sferico equivalente.

Ipotesi applicate: Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.

Alternative e feedback: Omettere π lascerebbe un π spurio; dividere per area darebbe pressione invece di tensione.

Esito AI: PASS_AI. Risultato esatto: 20. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 0c16013c65c18eb2cc215afbc6f2902bcbb4e7c329566707750993f038df2e83; candidato SHA256 5ea6f183669a3008da00c53d927bcc73aefc6f21ee46de9f539da003a8a20506; firma di lettura 8d45b5f1c521ba2f31fc2bd661a8c8adc2bd3994ded48f2e375274486f72455c.

## AR-u3-drop-detachment-07

γ da 20 a 25 a r fisso: volumi 4π e 5π µL, rapporto 25/20=5/4.

Ipotesi applicate: Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.

Alternative e feedback: 4/5 reciproco,25 copia γ,5/2 introduce anche bordo doppio,1 ignora la modifica.

Esito AI: PASS_AI. Risultato esatto: 5/4. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 01eb11eb2801ffcb6d7696dfad0e4a926807d12ab8263519646b5ad6804fd290; candidato SHA256 71ca8f212a560354f23c0e952de33509558496ae7f644bab2a8a643917b1f42c; firma di lettura adec587677129ed5b2a8890a0dce8466dde64ea0cf2158f0a54ef7ed93ef92de.

## AR-u3-drop-detachment-08

Proposta 8π meno corretto 4π dà +4π µL. A 8π µL il peso sarebbe doppio del sostegno massimo assegnato.

Ipotesi applicate: Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.

Alternative e feedback: −4π inverte ordine,8π proposta,12π somma,zero accetta un peso doppio della soglia.

Esito AI: PASS_AI. Risultato esatto: 4*pi. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 4161a8bf826972d029e5c6827c2efe1c9889a07a46e2fc02c97d9df9432d0b66; candidato SHA256 4fbe13564c4cee1556b6608a0dd74dcb87e949a570215af0f2a1ec1201060d7b; firma di lettura c2eeabd05336518e4efec4d89f85c6af2fa04fc1fede79276c7babecec572102.

## AR-u3-drop-detachment-09

r=ρgV_lim/(2πγ). Forza divisa per tensione N/(N/m) dà m; r entra linearmente e non richiede radice.

Ipotesi applicate: Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.

Alternative e feedback: Reciproco lunghezza inversa; senza 2π coefficiente geometrico errato; V al denominatore o assenza di g altera unità.

Esito AI: PASS_AI. Risultato esatto: r = ρ g V_lim / (2 π γ). Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 e99916c8c024fb7cf836aa3e5e3672aefcf177ed064ed9434db4406170cd0dc3; candidato SHA256 22bf6be6f7d1f7d8381c8d41e9f06458bc915c30dc018bdac28813895dd04165; firma di lettura 8ec8650ee109bf93ac59673aafd2f3270d6ff1be0fe648bf37f30ee3aa2f96a9.

## AR-u3-drop-detachment-10

Con r_B=κ₁r_A,γ_B=κ₂γ_A, coefficiente 2π/(ρg) comune: rapporto κ₁κ₂.

Ipotesi applicate: Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.

Alternative e feedback: Quozienti rendono inversi fattori diretti; κ₁² usa area, somma dà due per prove identiche.

Esito AI: PASS_AI. Risultato esatto: κ₁ κ₂. Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 93fda5f94050a6b72f109c929d82357c75f86ca6a783eedff6df47586e5a1d2d; candidato SHA256 c2f30feeda9633b509be0f84fc3770c58f3abee72b5e7a19364c7017210a03e2; firma di lettura 424632f5a9856eba85604b28b2ff96b35769bac79b2de88f81c9d03da3e31b3a.

## AR-u3-drop-detachment-11

B r=2,γ=25 dà V=π·2·25/5=10π µL; rapporto 10π/(4π)=5/2.

Ipotesi applicate: Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.

Alternative e feedback: 2/5 reciproco,2 solo r,5/4 solo γ,10π volume numerico non rapporto.

Esito AI: PASS_AI. Risultato esatto: 5/2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 4a1539991b581f2dbffb46afa38b81b13f8705c7d6d63cc92ec204e26041c83a; candidato SHA256 b55cbb1409030db135b6dc2ca639257c181eb4446ffc83349ec6c03656dab9f8; firma di lettura 1398f9520483ed51a578b3209dbf3bcc3ca7b6a5c2fdb4e95b23830e3a6a20d9.

## AR-u3-drop-detachment-12

Media (4π+10π)/2=7π µL. Ingressi medi r=3/2,γ=45/2 danno 27π/4; differenza π/4 µL.

Ipotesi applicate: Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.

Alternative e feedback: 14π somma,3π semidifferenza,10π sola B;27π/4 modello agli ingressi medi.

Esito AI: PASS_AI. Risultato esatto: 7*pi. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 3c9e3865ff7c35d0ce322040e03db6abd292795de262831d3f07c843ca298ab0; candidato SHA256 8de293b1ca22f1cd0440af242b6207f04b5afaa36cb1764e12bf7fa1bea4fd54; firma di lettura 277f5f0204c739c0906ac4bb30a7738e80047221919a85fbc0ad676d001a659c.

## AR-u3-drop-detachment-13

B volume target 10π, r=2: γ=25. Rapporto γ_B/γ_A=25/20=5/4, dopo rimozione del fattore due del bordo.

Ipotesi applicate: Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.

Alternative e feedback: 5/2 trascura r,2 copia r,4/5 reciproco,1/2 manterrebbe volume iniziale.

Esito AI: PASS_AI. Risultato esatto: 5/4. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 36bb0a2506a36ccf8abd63b21cf07a0fc89997f27542ac385c98c61dbb3454e7; candidato SHA256 ac4d49e5d462539acfe368623de3e22eff9dadc88cd8755840963bf5786806a0; firma di lettura 398e3496ffd63713a420f14e946528ff2ff11781cff2fbf4a049d876649ed1f7.

## AR-u3-drop-detachment-14

A V=4π,S=12π: q=3 µL⁻¹. B S=30π dà V=10π; γ=25 porta r=2 mm. Lettura continua non intera.

Ipotesi applicate: Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.

Alternative e feedback: Il rapporto fra letture identifica volumi, non direttamente raggi quando cambia γ. π si cancella dopo la taratura, senza approssimazioni.

Esito AI: PASS_AI. Risultato esatto: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 a48711845c93980fec8caa6efb90012a9878eb5d21c5613d17a5159befc43c98; candidato SHA256 3cf05d1872d356d8395ca914d7ed50a23c6d408ff94341c2229429240a459c47; firma di lettura 9f087fc07beb3ed3a9faae7c743fa29ffb6c96abe77a6edc5e1ba858c2a5d60a.

## AR-u3-drop-detachment-15

A/B V=4π,10π e S=1+8π,1+20π: q=2 µL⁻¹,z=1. C S=1+16π dà V=8π; γ=20 implica r=2 mm.

Ipotesi applicate: Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.

Alternative e feedback: r=1,4,1/2,5/2 con γ=20 darebbero S=1+8π,1+32π,1+4π,1+20π, non S_C.

Esito AI: PASS_AI. Risultato esatto: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 1a4b98ba6e805833579385f70e14eae5c8e931b080495a7bdea8bd8d10120c72; candidato SHA256 6c116a4e41ca63ab8416279df31ffce28662226f8b2930c11f8df797a4951957; firma di lettura 55ff659a9639ab4de16e95938ad2ff014ee32c3e94c1f339f0c73e1fb1668ab1.

## AR-u3-drop-detachment-16

r=cγ con c=1/20 m²/N: V=2πcγ²/(ρg). V=4π µL dà γ²=1/2500 N²/m²; ramo positivo γ=1/50 N/m=20 mN/m e r=1 mm.

Ipotesi applicate: Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.

Alternative e feedback: Radice negativa viola sia γ>0 sia r>0; c è dimensionato e il vincolo fra prove non una legge universale del bordo.

Esito AI: PASS_AI. Risultato esatto: 20. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 e65118fadf78c25c42b905d3bf1dde212eb7c35db8a4c502d85d477c001cb7ac; candidato SHA256 aa2ab8f29d52bc35923b6c58a6c178777671693d665b101a3e101916722087ba; firma di lettura 393e79f67688e61b8d7b0a35dfc28dec2ed37699dd62b1f26c8649f987183e45.

Controprove riproducibili: 24 per questo lotto. Tutte le 16 chiavi errate sono respinte anche dopo rinnovo del binding, dei token e di ogni guardia d’edizione esclusivamente in memoria nel test: resta attivo l’oracolo distinto. Prove aggiuntive coprono fonte falsa, unità errata, lotti vuoti/parziali/duplicati, testo fisico falso a chiave corretta e SVG incorporato o locale mutato. Le guardie di testo/figura certificano l’edizione letta, non una comprensione semantica universale delle mutazioni.

Identità canonica verificata con assert_record_identity sui report fresh e salvati contro package e binding reali ROOT. I test Hypothesis esplorano ulteriori configurazioni dei cinque modelli; i controlli geometrici leggono i cinque XML. La suite generale e le anteprime finali spettano all’integratore. DRAFT, human NOT_RUN, publicationAction NONE. Nessuna approvazione umana o pubblicazione simulata.
