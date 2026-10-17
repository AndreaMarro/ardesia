# CoursePack: Fisica, semestre aperto 2026/2027

**Stato: DRAFT_NOT_WIRED_NOT_CERTIFIED.** Manifest statico, non è una banca quiz, un corso vendibile o una release.

- Manifest: [physics.coursepack.json](physics.coursepack.json), formato applicativo di progetto **ardesia.course-pack/1**.
- Regolamento esame: [D.M. 941/2026](https://www.mur.gov.it/it/atti-e-normativa/decreto-ministeriale-n-941-del-10-7-2026); calendario [D.D. 249/2026](https://www.mur.gov.it/it/atti-e-normativa/decreto-direttoriale-n-249-del-13-7-2026); programmi [Syllabus Fisica 2026](https://www.mur.gov.it/sites/default/files/2026-06/Syllabus_FISICA_%20finale%202026.pdf).
- Le 7 unità riportano 0,2/1,4/1,2/0,4/1,0/1,2/0,6 CFU e le quote minime di esercitazione; **non sono percentuali dei quesiti d'esame**, né permettono di inferire la distribuzione degli item.
- La correzione nel formato in trentesimi, la lode, l'accettazione delle risposte a completamento e il funzionamento completo della graduatoria restano **PENDING FULL DECREE REVIEW**. Non dedurre la scala da 31 punti nominali.
- I tag sottoargomento sono un primo indice operativo, non una trascrizione riga per riga certificata. Prima del rilascio: PDF ufficiale acquisito con digest SHA-256, due revisioni disciplinari, matrice syllabus→esercizi, question bank autonoma/legale, oracoli e test negativi.
- I contenuti per Biologia e Chimica si aggiungono tramite ulteriori CoursePack e revisori; **non** mediante copie o fork del Core.

## Accettazione minima

1. Manifest parse/schema valid; 7 unità, somma CFU 6; unica identità di ogni unità, citazioni normative e versioni presenti.
2. Profile 2026/27: 31 item, 21 multiple e 10 completamento, 50 minuti, +1/−0,1/0; due appelli 10/12/2026 e 11/01/2027.
3. I modelli non possono trasformare un draft in prova verificata; lo stato e il provenance mostrati all'utente devono provenire da record revisionati.
4. Il CodePack non deve possedere storage studente, CRM, punteggi di abilità, login o memorie parallele.
5. L'export deve portare la versione di programma e source ID, non dichiarare affiliazioni ministeriali.

Prossimo lavoro: implementare un loader CoursePack e relativi oracoli con test che falsifichino alterazioni della normativa, **prima** di collegare UI e marketplace. Per la specifica trasversale vedi [RFC Ardesia Medicina](../../docs/product/ARDESIA-MEDICINA-2026-27-RFC.md).
