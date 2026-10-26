# Review mirata del raccordo installato

Revisore separato, contesto limitato al delta e ai contratti, lettura su checkout S06. Ispezionati App, SourceViewer, installer factory, test HTTP senza monkeypatch, SourceProjection, test reader promosso e confini Core/workspace.

Un P2: limiti unit/reasoning misurati in UTF16, in disaccordo con len Python. Riprodotto con2001simboli/4002unità. Corretto con conteggio code point; quattro test aggiunti (due al limite accettati, due oltre negati). Prima della correzione:2FAIL/10PASS; dopo:45Web S06+Shell PASS, build/typecheck PASS. Il revisore ha riletto il delta e il log RED, diff-check PASS, nessun finding residuo. Non ha eseguito suite/build/browser e non conferisce approvazione scientifica o umana.

Log originali compressi lossless in installed-evidence/, hash e round-trip nel manifest. Il browser finale e la CI sono prove distinte riferite alle rispettive SHA, registrate nella consegna successiva.
