# Kimi Research — Cycle 35
Topic: accuratezza simulatore circuiti educativo KCL KVL MNA errori comuni
Date: 2026-03-26T12:26:19.049884

EDGE-CASE-1: Circuito con LED non funzionante
TEST-SUGGERITO: Collegare un LED in parallelo con una resistenza e verificare se il simulatore mostra la corretta illuminazione dell'LED.
SEVERITY: medium

EDGE-CASE-2: Cortocircuito in un circuito con resistenze
TEST-SUGGERITO: Creare un cortocircuito tra due nodi di un circuito con resistenze e verificare se il simulatore rileva il cortocircuito.
SEVERITY: high

EDGE-CASE-3: Circuito con paralleli e serie
TEST-SUGGERITO: Creare un circuito con resistenze in parallelo e serie e verificare se il simulatore calcola correttamente la resistenza equivalente.
SEVERITY: medium

EDGE-CASE-4: Circuito con KCL/KVL non rispettate
TEST-SUGGERITO: Creare un circuito dove le leggi di Kirchhoff non sono rispettate e verificare se il simulatore segnala l'errore.
SEVERITY: high

EDGE-CASE-5: Circuito con MNA solver non corretto
TEST-SUGGERITO: Creare un circuito con nodi e brani e verificare se il simulatore risolve correttamente la matrice di nodi.
SEVERITY: high
