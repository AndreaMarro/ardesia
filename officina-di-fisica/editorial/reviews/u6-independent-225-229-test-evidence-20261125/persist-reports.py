from pathlib import Path
import importlib,json,hashlib
from tools.corpus_engineering.batches import assert_record_identity
A=Path.cwd();sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
families=[('dielectric_isolated_voltage','dielectric-isolated-voltage-225'),('dielectric_connected_charge','dielectric-connected-charge-226'),('isolated_plate_separation_energy','isolated-plate-separation-energy-227'),('connected_plate_separation_charge','connected-plate-separation-charge-228'),('lorentz_force','lorentz-force-229')]
for name,batch in families:
 m=importlib.import_module('tools.corpus_engineering.'+name+'_verifier');D=A/'editorial/reviews/u6-independent-225-229-fixtures-20261125'/batch;p=json.loads((D/'package.json').read_text());b=json.loads((D/'bindings.json').read_text());r=m.report(p,b,D)
 assert len(r['records'])==16 and all(v['ok']for v in r['records']),[(x['id'],x['errors'])for x in r['records']if not x['ok']]
 assert_record_identity(r['records'],m.EXPECTED_IDS,p,b);target=A/f'editorial/reviews/{batch}.json';target.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');saved=json.loads(target.read_text());assert saved==m.report(p,b,D);assert_record_identity(saved['records'],m.EXPECTED_IDS,p,b)
 note=f'''# Revisione indipendente {batch}

Tutti gli 80 prompt originali U6-04 B225–229 sono stati letti e risolti individualmente prima dei candidati, tramite allowlist id/prompt dal pin Git. Primaria SHA256 {m.PRIMARY_SHA256}, commit47cb9cbefc0def9db276d2ba106e3f2491b60e7f: copia immutata nella fixture. Nessuna opzione, chiave, solutionSteps, hint o modulo autore B era stato aperto. Nessuna primaria B è stata letta. Fonte {m.SOURCE_REF}:{m.SOURCE_PATH}, file SHA256179bf1cacfb83482e32bb41e99cb78296990faafba1fe9ce3b0e3cbc3a6a09cf.

Dopo la consegna iniziale di tutti gli 80 A220–224, durante la pausa per spazio insufficiente, ho letto tutti gli 80 prompt finali B tramite la sola allowlist id/prompt. I dati corrispondevano alla primaria. Ho poi scritto ed eseguito realmente i modelli prima di aprire le chiavi: model-run-1.json registra exit0, 80 derivazioni e 79.2844342909957 secondi, codice SHA25642da25a28a0f45351c833e9c583afeed5f0c615326404dc6ce4e2af1f8df61e9. La successiva correzione A22415 riguardava soltanto parentesi; nessuna chiave B era aperta durante quel fix. L’ulteriore correzione di metadata A220–224 a C4-L08 è stata fatta dopo la lettura B, ma non ha mutato leggi, scelte, numeri o asset A. Non viene attribuita alla primaria manuale la data della successiva preparazione del modello.

Solo dopo ho letto integralmente tutti i record finali B: prompt, tutte e cinque le alternative, risposta proposta, ciascun blocco e formula, hint, feedback, metadati, didascalie, source binding e asset. Edizione effettivamente letta {m.CANDIDATE_REF}. Nessun modulo autore è stato importato. I risultati sono derivati da Q=CV, capacità geometrica, energia Q²/(2C), carica libera isolata o generatore ideale, e forza vettoriale di Lorentz. Le lezioni reali C4-L07, C4-L08 e C4-L09 sono state rilette nel pin Cric5d1d: L07 tratta proprio il singolo condensatore e il dielettrico, L08 le reti distinte, L09 Lorentz. Pertanto225–228 restano correttamente L07 e229 L09.

Tutti i dati numerici sono esatti, reali e finiti prima dell’aritmetica; denominatori non nulli, κ≥1 e s≥1 anche nelle inverse. I fattori di confronto possono essere minori di uno purché gli stati rispettino il dominio. Il regime di piastre estese è una premessa distinta, non dedotta dalla sola positività. Il limite v<c del modello è necessario ma non certifica quantitativamente il regime non relativistico: quest’ultimo è una premessa esplicita letta nei candidati. Per Lorentz03 la potenza q(v×B)·v=0 è dimostrata anche con componente parallela; il modulo della velocità è distinto dal vettore.

Il modello pre-key è copiato byte per byte come dipendenza di review. Il suo docstring descrive l’istante storico prima delle chiavi; la presente nota documenta la successiva lettura completa e i test finali. Decoder AST esatto SHA256 {m.REVIEWED_LITERAL_CODEC_SHA256}; modello indipendente SHA256 {m.REVIEWED_MODEL_SHA256}. Entrambi sono controllati e riportati per ogni ID, senza eval né roundtrip attraverso float.

Tutti i cinque XML e i cinque PNG nativi indipendenti completi sono stati letti realmente, sotto mutex e guardia≥2 GiB. I processi sono terminati exit0; non è bastata la comparsa del PNG. Dimensioni640×1480 e bounds riportati nelle fixture, insieme alle osservazioni di processo. Nessun server o app aperto e nessun marker di UI prodotto creato. Non sono emersi finding testuali, matematici o grafici nei cinque finali dopo questa lettura.

## Prove individuali
'''
 for k,row in enumerate(r['records'],1):
  note+=f"\n### {row['id']}\n\nDerivazione primaria storica, conservata: {m.MANUAL[k-1]}\n\nIpotesi fisiche controllate: {m.ASSUMPTIONS[k-1]}\n\nSuccessiva lettura delle alternative e controprove indipendenti: {m.DISTRACTORS[k-1]}\n\nEsito esatto indipendente: {row['expectedExact']}. Modalità {row['verificationMode']}; ambito {row['calculationScope']}.\n"
 note+='\n## Figura e limiti\n\n'+m.SVG_REVIEW+'\n\nUI prodotto, layout responsive e approvazione umana NOT_RUN. Nessun marker UI inventato, copiato o aggiornato. Publication DRAFT, publicationAction NONE. Le identità fresh/saved sono confrontate con le fixture realmente lette e con i commit Git dei finali. Confronto canonico ROOT e integrazione restano PENDING_ROOT: nessun credito anticipato. Nessun candidato, registry, ledger, runtime o Git ROOT modificato.\n'
 note+=f'\nVerifier SHA256 {sha(A/f"tools/corpus_engineering/{name}_verifier.py")}. Package canonico SHA256 {m.REVIEWED_PACKAGE_SHA256}. Binding canonico SHA256 {m.REVIEWED_BINDINGS_SHA256}. Report SHA256 {sha(target)}.\n'
 (A/f'editorial/reviews/independent-{batch}.md').write_text(note.rstrip()+'\n');print(batch,'16/16',sha(target),flush=True)
