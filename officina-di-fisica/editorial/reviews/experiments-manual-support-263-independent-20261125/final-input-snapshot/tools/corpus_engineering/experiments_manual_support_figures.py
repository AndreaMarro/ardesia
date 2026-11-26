"""Original progressive SVG constructions for the eight manual editions.

Build-time illustrations only, not expected-value or acceptance code.
"""
from html import escape
from pathlib import Path
import math

INK='#172033'; BLUE='#1d4ed8'; GREEN='#047857'; ORANGE='#9a3412'
def text(x,y,value,size=26,color=INK,anchor='start'):
    return f'<text x="{x:g}" y="{y:g}" font-size="{size}" fill="{color}" text-anchor="{anchor}" font-family="sans-serif">{escape(str(value))}</text>'
def line(x1,y1,x2,y2,color=INK,width=3,dashed=False):
    dash=' stroke-dasharray="8 6"' if dashed else ''
    return f'<line x1="{x1:g}" y1="{y1:g}" x2="{x2:g}" y2="{y2:g}" stroke="{color}" stroke-width="{width}"{dash}/>'
def rect(x,y,w,h,fill,stroke=INK):
    return f'<rect x="{x:g}" y="{y:g}" width="{w:g}" height="{h:g}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>'
def circle(x,y,r,fill,stroke=INK):
    return f'<circle cx="{x:g}" cy="{y:g}" r="{r:g}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>'
def arrow(x1,y1,x2,y2,color=INK,width=4):
    dx,dy=x2-x1,y2-y1;n=math.hypot(dx,dy)
    if n==0:return ''
    ux,uy=dx/n,dy/n;px,py=-uy,ux
    points=[(x2,y2),(x2-14*ux+6*px,y2-14*uy+6*py),(x2-14*ux-6*px,y2-14*uy-6*py)]
    return line(x1,y1,x2-8*ux,y2-8*uy,color,width)+f'<polygon points="{" ".join(f"{x:g},{y:g}" for x,y in points)}" fill="{color}"/>'
def panel(index,title,body):
    y=90+index*340
    return f'<g transform="translate(0 {y})">'+rect(20,0,600,320,'#ffffff','#a6afbd')+text(42,38,title,28)+body+'</g>'
def document(title,description,panels):
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="1140" viewBox="0 0 640 1140" role="img" aria-labelledby="title description">'
            +'<title id="title">'+escape(title)+'</title><desc id="description">'+escape(description)+'</desc>'
            +rect(0,0,640,1140,'#ffffff','#ffffff')+text(24,45,title,30)+''.join(panels)+'</svg>\n')

def build():
    figures={}
    panels=[]
    for i,(r,p,temp) in enumerate([(1,'100','1'),(2.25,'800/27','2/3'),(4,'25/2','1/2')]):
        width=90*r;body=rect(80,105,width,100,'#dbeafe',BLUE)+rect(80+width,99,12,112,'#d1d5db')
        body+=text(80,85,'V/V₀ = '+['1','9/4','4'][i])+text(52,250,'p = '+p+' kPa')+text(52,292,'T/T₀ = '+temp)
        panels.append(panel(i,['1. Stato iniziale','2. Radice e poi cubo','3. Volume quadruplicato'][i],body))
    figures['adiabatic-manual-paths.svg']=document('Espansione adiabatica', 'Sezione costante: la larghezza del gas è proporzionale al volume. Stesso gas, γ=3/2; tre stati a V/V0=1,9/4,4, con pressioni100,800/27,25/2 kPa.',panels)
    panels=[]
    for i,theta in enumerate([0,30,90]):
        a=math.radians(theta);ex,ey=110+140*math.cos(a),210-140*math.sin(a)
        body=arrow(110,210,230,210,INK,7)+arrow(110,210,ex,ey,BLUE,3)+circle(110,210,8,'#ffedd5',ORANGE)
        body+=text(202,248,'v',26)+text(ex+12,ey-8,'B',26,BLUE)+text(58,290,'q > 0; θ = '+str(theta)+'°',24)
        if theta:
            body+=circle(450,165,30,'#ffffff',GREEN)+circle(450,165,5,GREEN,GREEN)+text(450,225,'uscente',24,GREEN,'middle')
        else:body+=text(450,180,'F = 0',28,INK,'middle')
        body+=text(450,280,'F = '+str([0,3,6][i])+' µN',26,INK,'middle')
        panels.append(panel(i,['1. Moto parallelo','2. Componente perpendicolare','3. Moto perpendicolare'][i],body))
    figures['lorentz-manual-angles.svg']=document('Geometria della forza magnetica','Carica positiva; v=3m/s, B=1T, q=2µC. Le frecce v e B hanno scale proprie. Cerchio con punto: forza uscente. La dimensione del simbolo non codifica il modulo.',panels)
    panels=[]
    for i,(pos,when) in enumerate([(4,'0'),(0,'1/2'),(-4,'1')]):
        x=320+45*pos;body=arrow(100,210,560,210)+line(320,130,320,240,INK,2,True)
        for value in [-4,0,4]:body+=line(320+45*value,203,320+45*value,217)+text(320+45*value,255,str(value),24,INK,'middle')
        body+=rect(x-18,155,36,48,'#ffedd5',ORANGE)+line(x,195,x,210,ORANGE,3)
        body+=text(65,95,'t = '+when+' s')+text(65,295,'x = '+str(pos)+' cm; T = 2 s')+text(565,200,'x',24)
        panels.append(panel(i,['1. Estremo positivo','2. Equilibrio dopo T/4','3. Estremo opposto dopo T/2'][i],body))
    figures['oscillator-manual-quarter-period.svg']=document('Posizione e frazioni di periodo','Asse orizzontale in centimetri con medesima origine e scala. Posizioni+4,0,-4cm agli istanti0,1/2,1s. La massa trasla lungo l’asse, non percorre un cerchio.',panels)
    panels=[]
    for i,(t,when,value) in enumerate([(0,'0',0),(.25,'1/4',3),(.75,'3/4',-3)]):
        body=arrow(65,180,580,180)+line(155,95,155,255,INK,2,True)+text(155,280,'x = 0',24,INK,'middle')+text(574,210,'x (m)',22,INK,'end')
        pts=[]
        for n in range(101):
            x=-.25+n*.02;pts.append((100+(x+.25)*220,180-60*math.sin(2*math.pi*t-math.pi*x)))
        body+=f'<polyline points="{" ".join(f"{x:.4f},{y:.4f}" for x,y in pts)}" fill="none" stroke="{BLUE}" stroke-width="4"/>'
        body+=circle(155,180-value*20,7,'#ffffff',ORANGE)+arrow(350,85,470,85,GREEN)+text(260,72,'propagazione +x',23,GREEN)
        body+=text(55,304,'t = '+when+' s; y(0,t) = '+str(value)+' cm',24)
        panels.append(panel(i,['1. Passaggio per l’equilibrio','2. Sonda al massimo','3. Sonda al minimo'][i],body))
    figures['travelling-wave-manual-probe.svg']=document('Una sonda ferma, tre istanti','y=3sin(2πt−πx)cm. Le tre curve sono profili spaziali agli istanti0,1/4,3/4s. L’asse x è in metri, lo spostamento y in centimetri. La sonda rimane inx0.',panels)
    panels=[]
    for i,(r,y2,total) in enumerate([('0',2,4),('1/2',-2,0),('1',2,4)]):
        body=line(70,190,570,190,INK,2)+text(72,95,'cm',22)
        for x,value,label,color in [(140,2,'y₁',BLUE),(300,y2,'y₂',ORANGE),(470,total,'somma',GREEN)]:
            if value:body+=rect(x-22,min(190,190-30*value),44,30*abs(value),color,color)
            else:body+=line(x-22,190,x+22,190,color,5)
            body+=text(x,180-30*max(value,0),('+' if value>0 else '')+str(value),24,INK,'middle')+text(x,277,label,24,INK,'middle')
        body+=text(50,310,'Δs/λ = '+r+'; ampiezza = '+str(total)+' cm',23)
        panels.append(panel(i,['1. Arrivo in fase','2. Opposizione di fase','3. Un ciclo di ritardo'][i],body))
    figures['interference-manual-half-full-path.svg']=document('Sovrapposizione alla sonda','I pannelli scelgono l’istante in cui y1=+2cm; y2 è+2,-2,+2cm per differenze di cammino0,1/2,1onda. Barre: spostamenti con segno; ampiezze della somma4,0,4cm.',panels)
    panels=[]
    for i,(n,value) in enumerate([(0,100),(2,25),(3,12.5)]):
        body=arrow(60,165,410,165,ORANGE)
        for j in range(n):body+=rect(130+80*j,115,24,100,'#e2e8f0')
        h=1.5*value;body+=rect(470,255-h,70,h,GREEN,GREEN)+line(450,255,570,255,INK,2)
        body+=text(55,92,'n = '+str(n))+text(505,285,str(value).replace('.',',')+'%',26,INK,'middle')+text(55,305,'Altezza della barra ∝ intensità',23)
        panels.append(panel(i,['1. Fascio iniziale','2. Due dimezzamenti','3. Un ulteriore dimezzamento'][i],body))
    figures['beer-manual-successive-halves.svg']=document('Strati emivalenti in successione','Intensità100%,25%,12,5% a0,2,3strati. Le barre usano identica scala dell’intensità, non dell’ampiezza del campo; le frecce identificano la propagazione, non il flusso numerico.',panels)
    panels=[]
    for i,(n,count) in enumerate([(0,64),(2,16),(4,4)]):
        body=text(52,87,'t/T₁/₂ = '+str(n))
        for j in range(64):
            x=125+(j%16)*26;y=125+(j//16)*32
            body+=circle(x,y,8,GREEN if j<count else '#ffffff',GREEN if j<count else '#64748b')
        body+=text(55,290,'Numero medio previsto: '+str(count),25)
        panels.append(panel(i,['1. Popolazione iniziale','2. Due emivite','3. Quattro emivite'][i],body))
    figures['decay-manual-expected-population.svg']=document('Dimezzamento del valore medio','Sessantaquattro simboli di cui64,16,4colorati. È una rappresentazione del numero medio previsto, non una sequenza osservata di eventi individuali né una garanzia sul singolo campione.',panels)
    panels=[]
    for i,theta in enumerate([0,30,45]):
        t=math.radians(theta);r=math.asin(math.sin(t)/1.5);cx,cy=325,165
        body=rect(45,165,550,105,'#dbeafe','#93a8c4')+line(45,165,595,165,INK,2)
        body+=arrow(cx-105*math.sin(t),cy-105*math.cos(t),cx,cy,ORANGE)+arrow(cx,cy,cx+95*math.sin(r),cy+95*math.cos(r),BLUE)
        body+=line(cx,50,cx,285,INK,2,True)
        body+=text(60,95,'aria n₁ = 1',24)+text(60,250,'vetro n₂ = 3/2',24)+text(390,95,'normale',23)
        body+=text(55,309,'θ₁ = '+str(theta)+'°; θ₂ '+['= 0°','≈ 19,5°','≈ 28,1°'][i],25)
        panels.append(panel(i,['1. Incidenza normale','2. Incidenza di 30°','3. Incidenza di 45°'][i],body))
    figures['snell-manual-bounded-angles.svg']=document('Rifrazione verso la normale','La superficie è orizzontale, la normale verticale tratteggiata. Raggi incidenti0,30,45gradi, rifratti0,arcsin(1/3),arcsin(√2/3); stime19,5e28,1gradi esplicitamente approssimate.',panels)
    return figures

if __name__=='__main__':
    home=Path(__file__).resolve().parents[2]/'editorial/assets'
    home.mkdir(parents=True,exist_ok=True)
    for name,svg in build().items():(home/name).write_text(svg)
