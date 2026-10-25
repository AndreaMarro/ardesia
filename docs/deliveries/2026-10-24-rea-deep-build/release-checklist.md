# Artefatto e checklist operativa, non eseguita in produzione

1. Verificare head/base/CI della nuova draft e sourceTreeSha256 di `candidate-manifest.json` con il manifest dei sorgenti collaudati. Tutti gli asset del pacchetto devono combaciare, senza `.env`, token, database o symlink.
2. Servire solo `public/` con il server locale fornito per la review. `/esperienza/` è un mount reale: nessun fallback di `/study`, sorgenti e path inesistenti; CSP connectnone, microfono/camera negati, noindex. Il ramo è escluso dall'autodeploy.
3. Ripetere landing→Fluidi→previsione→raggio/vincolo→recupero→nuovo problema→contatto;360/390/820/1440, tastiera e reducedmotion. Non inviare messaggi durante il collaudo delle CTA.
4. La prova locale privata usa `beta/web` e `beta/studio` con API su loopback e dataset sintetico separato. L'artefatto non contiene quel dataset. Il link porta a media locali; nessun cloud sync o autorizzazione crossdevice impliciti.
5. Prima di un eventuale rilascio pubblico: review scientifica/editoriale della versione esatta, approvazione umana del target/asset/claim e autorizzazione specifica di pubblicazione. Conservare noindex finché si tratta di preview. Lo strumento di build rifiuta la combinazione interactivepreview con URL di produzione.
6. Una beta privata remota richiede test autonomi di auth/revoca/RLS, registrazione/invito e accesso edizione. Il contatto WhatsApp è interesse, non iscrizione. Nessun pagamento e nessun account sono creati da questa demo.
7. Rollback locale: rimuovere il nuovo artefatto e usare quello precedente; codice via revert dell'incremento. Nessuna migrazioneDB, DNS o release di produzione da annullare. Non usare consumer reader1 per bundle che richiedono reader2.

Questa checklist non costituisce un'approvazione di merge/deploy. Nessuna attività programmata creata.
