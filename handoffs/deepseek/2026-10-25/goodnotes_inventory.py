"""Evidence-aware manual lab matrix; never launches or automates Goodnotes."""
import hashlib
from build_content import ROOT,dump

SOURCES={
 'terms':'https://www.goodnotes.com/terms-and-conditions',
 'audio':'https://support.goodnotes.com/hc/en-us/articles/7352688559631-Add-Audio-Recordings-to-your-documents',
 'export':'https://support.goodnotes.com/hc/en-us/articles/7353742824975-Export-documents-or-pages',
 'pdf':'https://support.goodnotes.com/hc/en-us/articles/8537070839183-Choose-Between-Editable-and-Flattened-PDF-Export',
 'shareAudio':'https://support.goodnotes.com/hc/en-us/articles/7352729730959-Can-I-Share-my-Audio-Recordings',
 'backup':'https://support.goodnotes.com/hc/en-us/articles/7352773502351-Back-up-documents-with-Audio-Recordings'
}
SCENARIOS=[
 ('GN01','Import PDF e ordine','DOCUMENTED_ONLY','export','Creare un quaderno nuovo e importare la sola fixture; verificare P01-P04.','Ordine e identita originali; nessun quaderno reale aperto.'),
 ('GN02','Zoom pan fit e dimensioni','NOT_RUN',None,'SuP01 usare zoom,pan efit; tornare al100%; confrontare ancore.','Coordinate e focus non saltano; registrare dimensione finestra.'),
 ('GN03','Penna e input','NOT_RUN',None,'Disegnare una freccia sintetica; variare spessore con mouse o trackpad effettivo.','Versione e input registrati; pressione non dedotta da marketingiPad.'),
 ('GN04','Evidenziatore','NOT_RUN',None,'SuP02 evidenziare testo e formula,poi sovrapporre due passaggi.','Formula leggibile; trasparenza osservata senza supposizioni.'),
 ('GN05','Gomma undo redo','NOT_RUN',None,'Cancellare parte di una freccia propria;undo,redo; confrontare perimetro.','Stessa geometria e ordine recuperati; granularita registrata.'),
 ('GN06','Lazo selezione mista','NOT_RUN',None,'Selezionare testo,ink e figura sintetici suP01; provare filtri disponibili.','Quali tipi inclusi/esclusi e trasformazione reversibile.'),
 ('GN07','Copia fra pagine','NOT_RUN',None,'Copiare soltanto annotazione propria daP01 aP03;undo.','Stile e posizione registrati; riferimento pagina distinto.'),
 ('GN08','Forme linee frecce','NOT_RUN',None,'Disegnare linea e rettangolo suP02; provare vincoli visibili.','Descrivere gesto e correzione osservata,nessuna parita presunta.'),
 ('GN09','Testo e formule','NOT_RUN',None,'Aggiungere testo originale pV=nRT e controllarlo a due zoom.','Leggibilita e modifica locale; nessunaAIcloud attivata.'),
 ('GN10','Immagine crop ordine','NOT_RUN',None,'Inserire una propria immagine sintetica;crop,spostamento,ordine eundo.','Dimensioni e stato prima/dopo recuperati.'),
 ('GN11','Riordino duplicazione rotazione','NOT_RUN',None,'Duplicare P02 e ruotare la copia;riordinare P03 prima diP01.','P01-P04 continuano a identificare le pagine originali;duplicato distinto.'),
 ('GN12','Miniature segnalibri ricerca','NOT_RUN',None,'Cercare P03-A;aggiungere segnalibro e raggiungerlo dalle miniature.','Ricerca disponibile e contesto di ritorno registrati.'),
 ('GN13','Link e ritorno','DOCUMENTED_ONLY','pdf','Seguire il link interno P04→P01;esportare editable eflattened,se disponibili.','Confrontare destinazione e ritorno; documentazione distingue perditePDF.'),
 ('GN14','Consenso audio','DOCUMENTED_ONLY','audio','Solo gesto umano,in stanza senza terzi:valutare permesso e indicatore.','Prima registrazione esplicita; revoca/negazione non aggirate.'),
 ('GN15','Annotazioni durante audio','DOCUMENTED_ONLY','audio','Durante take1 sintetica scrivere P03-B;annotare istante e pagina.','Riproduzione riconduce a tratto e take corretti; UIlocale resta non osservata.'),
 ('GN16','Due take pausa stop','DOCUMENTED_ONLY','audio','Registrare due take distinte del copione;provare pausa solo se visibile.','Take non fuse implicitamente;durata e stato leggibili.'),
 ('GN17','Replay e seek','DOCUMENTED_ONLY','audio','Riprodurre take sintetica;seek e modalita disponibili nel quaderno.','Guida corrente cita replayiOS/macOSneiNotebook;nessunaattestazione7.1.30locale.'),
 ('GN18','Audio dopo riordino','NOT_RUN',None,'Con due take proprie,cambiare pagina e riordinare la copia del quaderno.','Ancora legata all’identita pagina,non al solo indice;risultato da osservare.'),
 ('GN19','Eliminazione audio','NOT_RUN',None,'Solo sulla copia,eliminare take2 e verificare eventualeundo visibile.','Annotazioni residue e recuperabilita dichiarate,senza inventareundo.'),
 ('GN20','Revoca permesso','NOT_RUN',None,'Con gesto umano nelle impostazioni di sistema,revocare microfono durante test.','Stop/errore visibile e nessun riavvio implicito; nienteTCCbypass.'),
 ('GN21','Chiusura e cold reopen','NOT_RUN',None,'Chiudere normalmente la sola copia sintetica e riaprire.','Testo,ink,ordine,take e ancore verificati individualmente.'),
 ('GN22','Export PDF','DOCUMENTED_ONLY','pdf','Esportare tramite comandi ufficiali; confrontaretesto,link,ordine e annotazioni.','PDF non attestato come backupaudio; editable/flattened hanno perdite diverse.'),
 ('GN23','Formato nativo roundtrip','DOCUMENTED_ONLY','backup','Esportare solo quaderno sintetico in formatoGoodnotes e reimportare una copia.','Guida dice formato nativo conserva audio; roundtrip localeNOT_RUN.'),
 ('GN24','Export audio ufficiale','DOCUMENTED_ONLY','shareAudio','Controllare se esiste exportaudio ufficiale sulMac;seassente registrare limite.','Guida etichetta exportindividualeiOSOnly:non inferire supportoMac.'),
 ('GN25','Offline','NOT_RUN',None,'Su copia locale e senza cambiare syncglobale,osservare possibilita offline.','Nessuna sincronizzazione o ripresa di corpus reale indotta.'),
 ('GN26','Conflitto collaborazione','NOT_RUN',None,'Solo se esistono due accountdi test giaautorizzati,provare conflitto sintetico.','Nessun invito o condivisione pubblica;altrimentiNOT_RUN.'),
 ('GN27','Tastiera focus accessibilita','NOT_RUN',None,'Percorrere quaderno sintetico conTab e scorciatoie documentate.','Focus visibile,azioni raggiungibili;nessuna certificazioneaccessibilitaglobale.'),
 ('GN28','Documento sintetico lungo','NOT_RUN',None,'Duplicare una piccola copia sintetica fino a12pagine,solo con spazio disponibile.','Misurare tempi locali e dimensioni;non benchmarkuniversale.'),
 ('GN29','Errore export controllato','BLOCKED',None,'Non saturare disco reale;preparare destinazione isolata solo se meccanismo sicuro disponibile.','Dati integri e messaggio recuperabile;spazioData1.4Gi osservato,nessun testdistruttivo.'),
 ('GN30','Template ed elementi','NOT_RUN',None,'Usare soltanto schema originale di queste4pagine come template sintetico.','Riutilizzo geometrico concettuale;nessun assetproprietariocopiato.')
]

def main():
    metadata={'status':'OBSERVED','method':'read-only macOS plutil extract; no app launch or notebook access',
      'path':'/Applications/Goodnotes.app/Contents/Info.plist','CFBundleShortVersionString':'7.1.30','CFBundleVersion':'3962760.264631382','CFBundleIdentifier':'com.goodnotesapp.x',
      'sha256':'0d9638156fb47bbbd3f7e4ea0835a374161a7e4f582a8b3defef9893bee6809d','macOS':'26.0.1','macOSBuild':'25A362',
      'accountPlan':'NOT_READ','syncState':'NOT_READ','appLanguage':'NOT_READ','activeAppMode':'NOT_OBSERVED','inputDevice':'NOT_VERIFIED',
      'limit':'Installed bundle version is not proof of active Goodnotes6 mode or any UI feature.'}
    dump('evidence/goodnotes-metadata.json',metadata)
    rows=[]
    for ident,flow,status,source,actions,accept in SCENARIOS:
        rows.append({'id':ident,'flow':flow,'status':status,'localRun':'NOT_RUN','installedBundleVersion':'7.1.30',
          'documentedVersion':'current public help, not pinned to installed build','precondition':'New synthetic notebook only; manual operator within permitted interfaces; duplicate before recovery.',
          'actionsProposed':actions,'acceptance':accept,'observedLocalResult':None,'exportFile':None,'source':SOURCES.get(source),
          'limitation':'Documentation-only or proposed scenario; no Goodnotes app capture or export was performed.'})
    dump('goodnotes-matrix.json',{'metadata':metadata,'scenarioCount':30,'scenarios':rows,'automatedNativeUI':'BLOCKED_BY_UNESTABLISHED_PERMISSION_BASIS; terms3.4.4/3.4.9 reviewed',
      'termsUrl':SOURCES['terms'],'termsLastUpdated':'September2025','reaCostTotal':'UNKNOWN','studentDataAccessed':False,'audioRecorded':False})
    (ROOT/'fixtures/COPIONE_AUDIO.txt').write_text('COPIONE ORIGINALE SINTETICO - NON REGISTRATO\n\nTake1, P03-B: Prevedo la corrente di due resistori in serie. Dodici volt, quattro ohm e otto ohm. La resistenza equivalente e dodici ohm, la corrente e un ampere.\n\nTake2, P03-C: Controllo le due cadute: quattro volt e otto volt. La somma e dodici volt. La potenza totale e dodici watt. Le due take devono restare distinte e riferirsi a P03 anche se riordino la copia.\n\nSolo un operatore umano puo iniziare la registrazione con un gesto esplicito, in ambiente privo di terzi. Non attivare servizi di trascrizione cloud.\n')
    lines=['# Goodnotes: perimetro, prova e trasferimenti','',
      'Il bundle installato dichiara 7.1.30, build3962760.264631382, su macOS26.0.1/25A362. Questo e metadata osservato, non una prova di Goodnotes6 in esecuzione. Account,piano,sync e quaderni non sono stati letti.',
      '', 'I termini ufficiali consultati il25ottobre2026, aggiornati settembre2025, limitano reverse engineering e accesso automatizzato. Non e stata stabilita una deroga: nessuna UI nativa automatizzata,analisi binaria,lettura database o cattura di audio e stata eseguita. Uso manuale entro gli accessi consentiti e documentazione restano il percorso proposto.',
      '', 'REA6.7.0 risponde in questa sessione; identita del pacchetto,help e contratto locale inspect_plist sono stati letti. La chiamata inspect_plist conpath esplicito ha risposto target_unavailable per assenza di app aperta: e un tentativo fallito,non un’evidenza Goodnotes. Il fallback plutil ha letto soltanto i quattro campi metadata dichiarati. Nessuna apertura binaria per superare il limite. Costo totaleREAUNKNOWN.',
      '', 'La fixture originale ha4pagineP01-P04,4link interni,outline e testo ricercabile. Creato e ispezionato ilPDF; importGoodnotes,registrazione,export e reimport sonoNOT_RUN. Il file di copione contiene testo originale e nessuna registrazione.',
      '', '## Matrice dei30scenari','', '| ID | Flusso | Stato | Esecuzione locale |', '|---|---|---|---|']
    for r in rows:lines.append(f"| {r['id']} | {r['flow']} | {r['status']} | NOT_RUN |")
    lines += ['', 'I passi e criteri per ogni riga sono in goodnotes-matrix.json. DOCUMENTED_ONLY vale soltanto per la documentazione citata, non per la build installata. NOT_RUN non significa funzione assente. GN29 eBLOCKED per evitare un test di spazio potenzialmente dannoso sul disco quasi pieno. Nessuna nuova spesa o dispositivo.',
      '', '## Trasferimenti originali proposti ad Ardesia','',
      '1. Rendere esplicita la differenza fra exportPDF visivo e bundle completo della lezione: la guida Goodnotes distingue i formati che conservano audio. AccettazioneArdesia: bundle conserva revisioni,media e ancore; PDF descrive le perdite e non viene presentato come recovery completo. Non creare un secondo formato canonico.',
      '2. Riaprire una take tramite identita immutabile di lezione/revisione/pagina eclip,non indice corrente. La documentazioneNoteReplay descrive il contesto temporale; riordino/recovery restano proposte da verificare sul prodotto. Accettazione: due take,riordino pagina,cold reopen e revoca non riattivano il microfono.',
      '3. Trattare selezione/trasformazione/undo come un’azione reversibile nella lavagna esistente. Excalidraw e gia una dipendenza canonica: preferire il suo percorso di selezione/undo. Non introdurre tldrawSDK commerciale come prerequisito.',
      '', 'Queste sono specifiche originali e criteri di prova. Nessuna implementazione o cattura donor e dichiarata da questa ricerca. Il risultato didattico utilizzabile della sessione e consegnato separatamente nei4CoursePack DRAFT e negli oracoli numerici.',
      '', '## Fonti ufficiali consultate','']
    lines += ['- '+k+': '+u for k,u in SOURCES.items()]
    (ROOT/'protocolli/GOODNOTES.md').write_text('\n'.join(lines)+'\n')

if __name__=='__main__':main()
