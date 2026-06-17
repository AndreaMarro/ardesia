# Kimi Research — Cycle 59
Topic: accuratezza simulatore circuiti educativo KCL KVL MNA errori comuni
Metric:  = 0.00%
Date: 2026-03-24T18:16:21.762602

EDGE-CASE-1: Accuratezza del solver MNA in circuiti con componenti non lineari come diodi e transistor.
TEST-SUGGERITO: Creare circuiti con diodi e transistor in configurazioni diverse (ON/OFF, saturation, cut-off) per testare la capacità del solver di gestire le transizioni tra stati differenti.
SEVERITY: high

EDGE-CASE-2: Modello LED non accurato che non riflette correttamente la caratteristica di corrente-voltage.
TEST-SUGGERITO: Connettere un LED in serie con una resistenza e variare la tensione di alimentazione per vedere se il simulatore può rappresentare correttamente la corrente che scorre attraverso il LED.
SEVERITY: medium

EDGE-CASE-3: Gestione parallela di componenti con valori di resistenza molto diversi.
TEST-SUGGERITO: Creare un circuito con resistenze in parallelo con valori molto diversi (es. 1 ohm e 1k ohm) per testare se il simulatore calcola correttamente la resistenza equivalente.
SEVERITY: medium

EDGE-CASE-4: Rilevamento e gestione di cortocircuiti.
TEST-SUGGERITO: Creare un circuito con un cortocircuito intenzionale tra due nodi di tensione differente per vedere se il simulatore rileva e gestisce correttamente il cortocircuito.
SEVERITY: high
