"""Five new practice families. Assemble one astra/1 package without source credit."""
import base64
import hashlib
import json
from html import escape
from pathlib import Path

HERE = Path(__file__).resolve().parent
APP = HERE.parents[2]


def diagram(symbol, caption, diagram_body):
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 216" '
        'role="img" aria-labelledby="title desc">'
        f'<title id="title">{escape(symbol)}</title><desc id="desc">{escape(caption)}</desc>'
        '<rect x="0" y="0" width="460" height="216" rx="9" fill="#faf8ee"/>'
        '<g fill="#172644" stroke="#172644" stroke-width="2" '
        'font-family="sans-serif" font-size="17">'
        f'{diagram_body}</g></svg>\n'
    )


def line(x, y, xend, yend, extra=''):
    return f'<path d="M{x} {y} L{xend} {yend}" fill="none" {extra}/>'


def label(x, y, text):
    return f'<text x="{x}" y="{y}" stroke="none">{escape(text)}</text>'


def arrow(x, y, end):
    return line(x, y, end, y) + f'<path d="M{end-8} {y-5} L{end} {y} L{end-8} {y+5}" fill="none"/>'


def text(value):
    return {'type': 'text', 'text': value}


def formula(value):
    return {'type': 'formula', 'text': value}


TASKS = [
    dict(
        number=2, title='La stessa potenza su una faccia più piccola', family='densita-flusso-termico-faccia',
        prompt='In regime stazionario, 18 W attraversano uniformemente una lastra di area 600 cm². Un secondo esperimento usa una faccia dimezzata e regola le sorgenti perché attraverso la lastra passino ancora 18 W. Quali sono le due densità di flusso termico, nell’ordine, in W/m²?',
        options=['300 e 600', '300 e 150', '0,03 e 0,06', '600 e 600'],
        reason='300 e 150 farebbe variare il flusso come l’area a potenza fissata. 0,03 e 0,06 sono valori in W/cm², non in W/m². 600 e 600 attribuisce la prima densità alla faccia già dimezzata.',
        hint='La portata energetica è 18 J ogni secondo in entrambe le prove. Su quale area si distribuisce in ciascuna?',
        blocks=[
            text('La potenza conta l’energia che attraversa l’intera faccia ogni secondo. Per la densità di flusso dividiamo questa potenza per l’area perché il passaggio è uniforme. Il confronto è possibile anche se per mantenere la stessa potenza bisogna regolare le sorgenti.'),
            formula(r'600\,\mathrm{cm^2}=\frac{600}{10\,000}\,\mathrm{m^2}=\frac{3}{50}\,\mathrm{m^2}'),
            formula(r'j_1=\frac{P}{A_1}=18\cdot\frac{50}{3}=300\,\mathrm{W/m^2}'),
            formula(r'j_2=\frac{P}{A_1/2}=2j_1=600\,\mathrm{W/m^2}'),
            text('Controllo inverso. Moltiplicando ciascuna densità per la sua area si ritrovano 18 W. La stessa quantità di energia al secondo è concentrata su una superficie più piccola.'),
        ],
        caption='Due facce affiancate con uguale freccia di potenza. La prima ha larghezza doppia della seconda. L’area più piccola riceve il doppio della potenza per metro quadrato.',
        art=label(25,28,'Potenza fissata in entrambe le prove') + arrow(25,79,128) + arrow(25,163,128)
            + '<rect x="151" y="62" width="146" height="36" fill="#bddded"/><rect x="151" y="146" width="73" height="36" fill="#bddded"/>'
            + label(314,86,'600 cm²') + label(244,171,'300 cm²'),
    ),
    dict(
        number=3, title='Quanto rimane nell’accumulatore', family='accumulo-energetico-potenza-netta',
        prompt='Per 5 s un alimentatore eroga a un accumulatore 12 W costanti. Nello stesso intervallo l’accumulatore cede all’ambiente calore alla potenza costante di 3 W. Trascurando ogni altro scambio, di quanti joule aumenta l’energia interna?',
        options=['45 J', '60 J', '15 J', '75 J'],
        reason='60 J è l’energia in ingresso. 15 J è l’energia uscita sotto forma di calore. 75 J si ottiene sommando la perdita all’ingresso.',
        hint='Prendi l’accumulatore come sistema. Conta separatamente il lavoro elettrico in entrata e il calore in uscita.',
        blocks=[
            text('Il contorno racchiude il solo accumulatore. L’alimentatore gli trasferisce energia per via elettrica e il calore ne sottrae una parte verso l’ambiente. Poiché le potenze sono costanti, a ogni secondo entrano 12 J ed escono 3 J.'),
            formula(r'P_{\mathrm{netta}}=12-3=9\,\mathrm W'),
            formula(r'\Delta U=P_{\mathrm{netta}}\,\Delta t=9\cdot 5=45\,\mathrm J'),
            text('Il saldo è positivo. Si può ricostruire l’ingresso aggiungendo al saldo i 15 J di calore ceduto. I 60 J ottenuti coincidono con il prodotto di 12 W per 5 s.'),
        ],
        caption='Una freccia da 12 J al secondo entra nel contorno dell’accumulatore e una da 3 J al secondo ne esce. Il contorno delimita l’energia da contabilizzare.',
        art=label(25,28,'Bilancio per un secondo') + '<rect x="150" y="68" width="154" height="72" fill="#bddded"/>'
            + arrow(30,104,150) + arrow(304,104,418) + label(25,85,'12 J entrano')
            + label(315,85,'3 J escono') + label(159,110,'accumulatore') + label(150,181,'Saldo: +9 J'),
    ),
    dict(
        number=4, title='Due strati uguali in serie', family='trasmissione-singola-da-prodotto-strati',
        prompt='Un fascio attraversa due filtri identici in serie. Si trascurano riflessioni multiple e ciascun filtro lascia passare una frazione costante dell’intensità che riceve. Dopo entrambi rimane 1/16 dell’intensità iniziale. Quale frazione passa attraverso un solo filtro?',
        options=['1/4', '1/8', '1/16', '3/4'],
        reason='Con T = 1/8, due filtri lascerebbero passare (1/8)² = 1/64, mentre l’osservazione dà 1/16. 1/16 è la frazione composta. 3/4 è la frazione tolta da un filtro, non quella trasmessa.',
        hint='All’uscita del primo filtro c’è già meno intensità. Applica la stessa frazione alla nuova intensità.',
        blocks=[
            text('Chiamiamo T la frazione trasmessa da un filtro. Il fascio entra nel secondo strato con l’intensità già ridotta dal primo. Nelle ipotesi della consegna, il secondo opera con lo stesso T sulla propria intensità in ingresso.'),
            formula(r'I_1=T I_0,\qquad I_2=T I_1=T^2 I_0'),
            formula(r'T^2=\frac{1}{16}=\left(\frac14\right)^2'),
            text('Prendiamo la radice positiva perché una frazione di intensità trasmessa è compresa fra zero e uno. Da 16 parti iniziali ne passano 4 dopo il primo filtro e una dopo il secondo. Questo verifica direttamente il fattore 1/4.'),
        ],
        caption='Tre misure sullo stesso fascio: intensità iniziale, quella dopo il primo filtro e quella dopo il secondo. A ciascuna interfaccia si moltiplica per T.',
        art=label(25,28,'Applica T al fascio che arriva') + arrow(31,110,140) + arrow(160,110,284) + arrow(304,110,422)
            + '<rect x="145" y="60" width="10" height="94" fill="#734e81"/><rect x="290" y="60" width="10" height="94" fill="#734e81"/>'
            + label(56,145,'I₀') + label(191,145,'T I₀') + label(347,145,'T² I₀'),
    ),
    dict(
        number=5, title='Lavoro sotto un tratto inclinato', family='lavoro-forza-posizione-trapezio',
        prompt='Tra x = 0 m e x = 6 m, la componente della forza lungo il moto cresce linearmente da 2 N a 6 N. Il corpo si sposta nel verso positivo. Quanto lavoro compie questa forza nel tratto?',
        options=['24 J', '36 J', '12 J', '4 J'],
        reason='36 J userebbe per tutto il percorso la forza misurata alla fine. 12 J è la sola area del rettangolo da 2 N e manca la parte crescente. 4 J copia il valore numerico della forza media, 4 N, senza moltiplicarlo per i 6 m percorsi.',
        hint='In un grafico forza-posizione ciascuna striscia ha unità N·m. Che figura formano tutte le strisce?',
        blocks=[
            text('La forza è positiva e varia con la posizione. Il lavoro lungo il tratto è l’area sotto il grafico di quella componente, perché somma prodotti forza per piccoli spostamenti. L’area qui è un trapezio.'),
            formula(r'W_1=2\cdot 6=12\,\mathrm{N\,m}'),
            formula(r'W_2=\frac{(6-2)\cdot6}{2}=12\,\mathrm{N\,m}'),
            formula(r'W=W_1+W_2=24\,\mathrm J'),
            text('Il rettangolo è il contributo della forza di 2 N presente per tutto il tragitto. Il triangolo è il contributo dell’aumento lineare. Il controllo per forza media dà 4 N per 6 m, ancora 24 J.'),
        ],
        caption='Grafico con x orizzontale e forza verticale. Il segmento da (0 m, 2 N) a (6 m, 6 N) delimita un rettangolo e un triangolo, la cui somma è il lavoro.',
        art=label(25,24,'F (N)') + '<path d="M75 134 L343 134 L343 62 Z" fill="#b0daba"/><rect x="75" y="134" width="268" height="36" fill="#bddded"/>'
            + line(75,170,393,170) + line(75,170,75,41) + line(75,134,343,62)
            + label(39,139,'2') + label(39,67,'6') + label(69,195,'0') + label(335,195,'6') + label(385,196,'x (m)'),
    ),
    dict(
        number=6, title='Il fondo nel confronto fra due sorgenti sonore', family='stima-ampiezza-sottrazione-fondo-incoerente',
        prompt='In un confronto fra due prove sonore alla stessa frequenza e con la stessa geometria, il fonometro lineare misura intensità totali di 8 e 20 nW/m². Il fondo costante, misurato da solo, vale 4 nW/m² ed è incoerente con il suono di prova, quindi le intensità si sommano. Se l’intensità del suono utile è proporzionale al quadrato dell’ampiezza, quanto vale il rapporto ampiezza della seconda prova / ampiezza della prima?',
        options=['2', '4', '5/2', '√(5/2)'],
        reason='4 è il rapporto fra le intensità utili e va estratta la radice. 5/2 è il rapporto fra le intensità totali. √(5/2) applica la radice prima di isolare il segnale dal fondo.',
        hint='Isola prima la parte che dipende dalla sorgente. Poi usa il rapporto fra intensità e ampiezza.',
        blocks=[
            text('Vogliamo confrontare il suono prodotto nelle due prove. Il dato complessivo del fonometro contiene anche il fondo. Essendo incoerente con il suono utile, il fondo può essere sottratto come intensità e non come ampiezza.'),
            formula(r'I_1=8-4=4\,\mathrm{nW/m^2}'),
            formula(r'I_2=20-4=16\,\mathrm{nW/m^2}'),
            formula(r'\frac{A_2}{A_1}=\sqrt{\frac{I_2}{I_1}}=\sqrt{\frac{16}{4}}=2'),
            text('La seconda ampiezza è doppia. Le unità di intensità si cancellano nel rapporto. Il controllo inverso produce un’intensità utile quattro volte maggiore, 16 nW/m², che con il fondo torna a 20 nW/m².'),
        ],
        caption='Due barre di intensità contengono lo stesso tratto di fondo. Tolto quel tratto, la seconda parte utile è quattro volte la prima. Il confronto delle ampiezze richiede la radice del rapporto.',
        art=label(25,27,'Sottrai il fondo in entrambe le prove') + label(25,91,'Prima') + label(25,156,'Seconda')
            + '<rect x="110" y="64" width="50" height="40" fill="#d5a66d"/><rect x="160" y="64" width="50" height="40" fill="#bddded"/>'
            + '<rect x="110" y="129" width="50" height="40" fill="#d5a66d"/><rect x="160" y="129" width="200" height="40" fill="#bddded"/>'
            + label(104,200,'fondo') + label(184,200,'segnale utile'),
    ),
]


def package():
    lessons = {r['id']: r for r in json.loads((APP / 'content/C6.json').read_bytes()) if r['kind'] == 'lesson'}
    records = []
    assets = []
    for task, answer_index in zip(TASKS, [2, 0, 3, 1, 2], strict=True):
        number = task['number']
        skill = f'C6-L{number:02d}'
        code = f'C6-TR{number:02d}'
        raw = diagram(task['title'], task['caption'], task['art']).encode()
        digest = hashlib.sha256(raw).hexdigest()
        name = f'{code.lower()}.svg'
        (HERE / name).write_bytes(raw)
        assets.append({'id': digest, 'name': name, 'mime': 'image/svg+xml', 'data': base64.b64encode(raw).decode()})
        blocks = [task['blocks'][0], {'type': 'figure', 'src': '/asset/' + digest, 'text': task['caption']},
                  *task['blocks'][1:], text(task['reason'])]
        correct, *distractors = task['options']
        distractors.insert(answer_index, correct)
        records.append({'id': code, 'kind': 'question', 'course': 'C6', 'section': lessons[skill]['title'],
                        'order': 200 + number, 'title': task['title'], 'skill': skill,
                        'prerequisites': lessons[skill]['prerequisites'], 'family': task['family'],
                        'difficulty': 2, 'version': 1, 'baseVersion': 0, 'prompt': task['prompt'],
                        'blocks': blocks, 'answer': {'type': 'choice', 'value': correct, 'options': distractors},
                        'hints': [task['hint']], 'error': {'category': 'modello', 'message': task['reason'], 'target': skill},
                        'review': 'DRAFT; autore; verifica indipendente e approvazione umana NOT_RUN'})
    return {'schema': 'astra/1', 'records': records, 'assets': assets}


if __name__ == '__main__':
    (HERE / 'package.json').write_text(json.dumps(package(), ensure_ascii=False, indent=2) + '\n')
