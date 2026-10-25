"""Four original synthetic pages, safe for a new manual Goodnotes notebook."""
from pathlib import Path
from math import sin,pi
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor,black
from pypdf import PdfReader
from build_content import ROOT,dump

W,H=A4
OUT=ROOT/'fixtures/GOODNOTES_LAB.pdf'
BLUE=HexColor('#245b87'); GREY=HexColor('#63717e')
c=canvas.Canvas(str(OUT),pagesize=A4,pageCompression=1)
c.setTitle('Ardesia - laboratorio sintetico quaderno e audio')
c.setAuthor('Ardesia - fixture originale sintetica')

def text(x,y,s,size=11,bold=False):
    c.setFont('Helvetica-Bold' if bold else 'Helvetica',size);c.drawString(x,y,s)
def header(pid,title):
    c.setFillColor(BLUE);text(44,H-48,'ARDESIA / LABORATORIO SINTETICO',11,True)
    c.setFillColor(black);text(44,H-82,pid+'  '+title,20,True)
    text(44,H-107,'Dati originali. Nessun nome, quaderno reale o audio personale.',10)
    c.bookmarkPage(pid);c.addOutlineEntry(pid+' - '+title,pid,level=0)
    c.setStrokeColor(GREY);c.line(44,H-124,W-44,H-124)
def box(x,y,w,h,title):
    c.setStrokeColor(GREY);c.roundRect(x,y,w,h,5)
    text(x+10,y+h-20,title,11,True)
def footer(pid,nextid):
    c.setFillColor(GREY);text(44,45,pid+' / identita pagina originale: '+pid+' / revisione fixture: 1',9)
    c.setFillColor(BLUE);text(44,28,'Vai a '+nextid+' (collegamento interno sintetico)',9)
    c.linkAbsolute('pagina '+nextid,nextid,(44,25,330,40),thickness=0)
    c.setFillColor(black);c.showPage()
def arrow(x1,y1,x2,y2,label):
    c.setStrokeColor(BLUE);c.setFillColor(BLUE);c.setLineWidth(2)
    c.line(x1,y1,x2,y2)
    dx=x2-x1;dy=y2-y1;l=(dx*dx+dy*dy)**.5;ux=dx/l;uy=dy/l
    p=c.beginPath();p.moveTo(x2,y2);p.lineTo(x2-9*ux+4*uy,y2-9*uy-4*ux);p.lineTo(x2-9*ux-4*uy,y2-9*uy+4*ux);p.close();c.drawPath(p,fill=1)
    text(x2+8,y2,label,10);c.setFillColor(black);c.setLineWidth(1)

header('P01','Vettori e azioni reversibili')
text(44,685,'P01-A / Somma a mano A=(3,0) N e B=(0,4) N.')
text(44,665,'P01-B / Seleziona soltanto il tratto sintetico; spostalo e annulla.')
c.setStrokeColor(GREY);c.line(100,390,100,600);c.line(65,430,365,430)
arrow(100,430,220,430,'A');arrow(100,430,100,590,'B')
text(285,415,'x');text(82,610,'y')
box(44,240,W-88,115,'P01-C / Previsione e spiegazione manoscritta')
text(58,305,'Quale risultante? Quali oggetti vengono ripristinati da undo?',10)
box(44,100,W-88,110,'P01-D / Dati del test manuale')
text(58,165,'Annota versione, input usato, azione, risultato e limite.',10)
footer('P01','P02')

header('P02','Gas ideale e identita delle pagine')
text(44,685,'P02-A / Modello: gas ideale, stato uniforme; p assoluta e T in kelvin.')
text(44,665,'P02-B / n=1 mol, T=300 K, p=100000 Pa; R=8.31446261815324.')
c.setStrokeColor(GREY);c.line(100,390,100,610);c.line(100,390,440,390)
text(76,620,'p');text(450,381,'V')
c.setStrokeColor(BLUE);c.rect(180,390,170,135);text(190,540,'area: lavoro nel modello quasi statico',10)
text(44,345,'P02-C / Duplica questa pagina e riordina: conserva il riferimento P02.')
box(44,200,W-88,115,'P02-D / Spazio per diagramma e ancore audio sintetiche')
text(58,270,'Scrivi il tempo della take e questa identita P02, non solo pagina 2.',10)
box(44,90,W-88,85,'P02-E / Esito export/reimport')
text(58,125,'Registra se ordine, link e annotazioni si conservano. Audio: verifica separata.',9)
footer('P02','P03')

header('P03','Circuito e due take distinte')
text(44,685,'P03-A / Generatore ideale 12 V; due resistori 4 ohm e 8 ohm in serie.')
c.setStrokeColor(BLUE);c.setLineWidth(2)
c.line(105,565,190,565);c.rect(190,550,85,30);c.line(275,565,320,565);c.rect(320,550,85,30);c.line(405,565,455,565);c.line(455,565,455,435);c.line(455,435,105,435);c.line(105,435,105,480);c.line(105,510,105,565)
c.line(85,510,125,510);c.line(92,480,118,480);c.setLineWidth(1)
text(206,592,'R1=4 ohm');text(329,592,'R2=8 ohm');text(50,492,'12 V')
text(44,390,'P03-B / Take 1: previsione I. Take 2: controllo V1+V2 e potenze.')
box(44,225,W-88,120,'P03-C / Annotazioni durante il copione sintetico')
text(58,298,'Nessun avvio automatico del microfono; solo gesto umano esplicito.',10)
box(44,90,W-88,105,'P03-D / Chiusura e riapertura normale')
text(58,145,'Annota quali take, tratti e link restano. Non simulare un crash dell app.',10)
footer('P03','P04')

header('P04','Onda e verifica delle perdite di export')
text(44,685,'P04-A / v=4 m/s, f=2 Hz, ampiezza=0.1 m; profilo al tempo t=0.')
c.setStrokeColor(GREY);c.line(70,500,520,500);c.line(90,420,90,600)
text(506,481,'x (m)');text(48,610,'y (m)')
c.setStrokeColor(BLUE);c.setLineWidth(2)
path=c.beginPath()
for i in range(401):
    x=90+i;y=500+60*sin(2*pi*i/200)
    if i==0:path.moveTo(x,y)
    else:path.lineTo(x,y)
c.drawPath(path);c.setLineWidth(1)
text(270,470,'2 m');text(465,470,'4 m')
box(44,265,W-88,125,'P04-B / Confronto esportazioni')
for i,s in enumerate(['PDF: ordine / testo ricercabile / link / annotazioni / audio verificato?', 'Formato nativo: riapertura delle due take e delle ancore?', 'Audio separato: durata e riferimento pagina conservato o perso?']):text(58,350-i*24,s,9)
box(44,100,W-88,125,'P04-C / Esito consentito')
text(58,180,'OBSERVED / DOCUMENTED_ONLY / NOT_AVAILABLE / NOT_RUN / BLOCKED',9)
text(58,155,'Non chiamare osservato cio che e stato soltanto preparato.',10)
footer('P04','P01')
c.save()
pdf=PdfReader(OUT)
assert len(pdf.pages)==4
for n,p in enumerate(pdf.pages,1):
    assert f'P0{n}' in p.extract_text()
    assert len(p.get('/Annots',[]))>=1
dump('evidence/fixture-validation.json',{'status':'PASS','pages':4,'allPageIdsPresent':True,'internalLinks':4,'layoutVisualReview':'PENDING','appImport':'NOT_RUN','audioRecorded':False})
print(OUT)
