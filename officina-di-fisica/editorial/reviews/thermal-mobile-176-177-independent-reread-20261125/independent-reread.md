# Rilettura indipendente mobile 176/177

Primaria fonte-only ea13a6d7b6eca676daa520594e324f8c84aaabe64114d375dc3eabf35f47e2d9 e precedente review distinta degli 80 ID preservate. Sono stati letti integralmente i quattro record finali del commit e6e35298f6e3e5d5f3a1be75924e523eb77fee8c, poi confrontati tutti i campi e tutti i binding con l’edizione 5579fe21 già revisionata. Nessun authoring importato, nessun candidato o runtime modificato da questo revisore.

## AR-u5-warm-water-and-ice-01

Il prompt e i dati restano quelli già risolti: 4 g di acqua a 50 °C, 1 g di ghiaccio a 0 °C, c_l=4 J/(g K) e L_f=300 J/g. Il bilancio indipendente dà Θ=(800−300)/20=25 K. Nuove definizioni: Q_h è il modulo ceduto dal caldo, Q_m la fusione e Q_w il riscaldamento dell’acqua fusa. Al risultato Q_h=4·4·25=400 J, Q_m=300 J e Q_w=4·1·25=100 J: 400=300+100. Sono energie omogenee e i segni sono corretti. La disponibilità massima800 J fino a 0 °C resta distinta dal calore effettivo 400 J; la figura e la sua didascalia invariata mantengono questa distinzione. Tutti i nuovi blocchi sono letti, compresi prosa, formule, hint e distrattori.

## AR-u5-warm-water-and-ice-03

La derivazione resta c_lm_a(50 K−Θ)=m_iL_f+c_lm_iΘ. Si definiscono E_h=c_lm_a·50 K, energia che il caldo cederebbe arrivando a 0 °C; E_m=m_iL_f; C_t=c_l(m_a+m_i). Quindi E_r=E_h−E_m=C_tΘ e Θ=E_r/C_t. Nei dati illustrativi E_h=800 J, E_m=300 J, E_r=500 J e C_t=20 J/K: Θ=25 K. E_h non è confuso con Q_h del record 01, perché è esplicitamente una disponibilità fino al riferimento. La formula selezionata e tutte le alternative restano identiche. Il ramo 0<Θ<50 K è conservato.

## AR-u5-warm-water-and-ice-09

Le nuove abbreviazioni e_h=c_l(50 K−Θ) ed e_i=L_f+c_lΘ sono energie per unità di massa, entrambe in J/g. Per 0<Θ<50 K sono positive. Il bilancio m_ae_h=m_ie_i implica m_a=m_i(e_i/e_h); sostituire le definizioni restituisce la stessa inversa originariamente derivata. Nel controllo Θ=25 K, e_h=100 J/g ed e_i=400 J/g: con un grammo di ghiaccio servono 4 g caldi. Il rapporto è puro; non è un rapporto di calori specifici. Prompt, chiave, dominio, hint e feedback sono byte identici. Nessun finding matematico.

## AR-u5-freezing-time-11

Cambia solo il titolo, ora «Più massa e meno potenza». Sono stati riletti anche tutti gli altri campi del record finale: massa 1 g e potenza 10 W danno 380 J/10 W=38 s; massa 2 g e potenza 1 W danno 760 s. Il rapporto resta 760/38=20, prodotto del fattore 2 della massa e 10 della potenza inversa. Potenza termica netta costante, stato finale ghiaccio a 0 °C e arresto a completa solidificazione rimangono espliciti. Nessuna formula o chiave è cambiata.

## Scope e gate ancora da eseguire

Le definizioni sono matematicamente equivalenti e non emerge un nuovo difetto scientifico nella rilettura manuale. Il confronto strutturale stdlib ha controllato solo i quattro delta attesi, risposte/domini/SVG invariati e 28 record non cambiati. È stata eseguita soltanto aritmetica esatta Fraction sui bilanci sopra; nessun modulo scientifico, SymPy, database, browser o suite è stato avviato localmente. Tutte le funzioni degli oracoli e tutte le altre costanti dei due verificatori sono AST identiche; si aggiornano soltanto pin, firme e nota di provenienza.

I report, i transcript e le firme della precedente esecuzione sono conservati byte per byte in prior/. Gli attuali JSON di report non vengono riscritti o ritaggati. Nuova automazione locale NOT_RUN; nuova UI NOT_RUN. L’integratore farà rieseguire i veri verificatori, assert_record_identity e suite sul runner remoto prima di generare i nuovi report e il compilatore. La larghezza dei blocchi deve ancora essere provata nel renderer reale: questa rilettura non dichiara risolto il finding UI per un semplice cambio di hash.

Human NOT_RUN; publication DRAFT; publicationAction NONE. Nessun nuovo ID e nessuna pubblicazione.
