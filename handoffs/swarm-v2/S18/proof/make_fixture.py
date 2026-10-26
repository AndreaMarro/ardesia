"""Original authorized S18 test document. No copyrighted textbook or student data."""
from pathlib import Path
from io import BytesIO
from pypdf import PdfWriter
from pypdf.generic import DictionaryObject, NameObject, DecodedStreamObject

def fixture(revision=1):
    w=PdfWriter()
    font=w._add_object(DictionaryObject({NameObject('/Type'):NameObject('/Font'),NameObject('/Subtype'):NameObject('/Type1'),NameObject('/BaseFont'):NameObject('/Helvetica')}))
    page=w.add_blank_page(width=540,height=720)
    page[NameObject('/Resources')]=DictionaryObject({NameObject('/Font'):DictionaryObject({NameObject('/F1'):font})})
    content=DecodedStreamObject()
    lines=['Idrostatica: dal disegno alla relazione','Fluido in quiete, densita costante e gravita uniforme.','La pressione aumenta con la profondita.','p = p0 + rho g h','Considera una colonna con area A e altezza h.','La forza peso vale rho g A h.','Equilibrio verticale: (p - p0) A = rho g A h.','Dividendo per A si ottiene p - p0 = rho g h.','Spiega perche il risultato non dipende da A.',f'Fixture originale Ardesia S18 - versione {revision}.']
    ops=['BT /F1 22 Tf 40 660 Td ('+lines[0]+') Tj /F1 13 Tf']
    for line in lines[1:]:ops+=['0 -38 Td ('+line+') Tj']
    ops+=['ET','0.2 0.4 0.3 RG 2 w 80 80 380 110 re S 80 130 m 460 130 l S']
    content.set_data('\n'.join(ops).encode());page[NameObject('/Contents')]=w._add_object(content)
    page=w.add_blank_page(width=540,height=720)
    stream=DecodedStreamObject();stream.set_data(b'0.85 0.93 0.96 rg 120 140 300 340 re f 0.15 0.35 0.5 RG 3 w 120 560 m 120 140 l 420 140 l 420 560 l S 120 480 m 420 480 l S 270 480 m 270 220 l S 260 235 m 270 220 l 280 235 l S 140 220 m 400 220 l S 250 510 m 290 510 l S')
    page[NameObject('/Contents')]=w._add_object(stream)
    if revision==2:
        from pypdf.annotations import Link
        w.add_js('globalThis.__s18MacroExecuted = true;')
        w.add_annotation(page_number=0,annotation=Link(rect=(40,40,250,70),url='https://s18-document.invalid/never-fetch'))
    w.add_outline_item('Equilibrio idrostatico',0);w.add_outline_item('Colonna di fluido: figura',1)
    out=BytesIO();w.write(out);return out.getvalue()
if __name__=='__main__':
    root=Path(__file__).parent
    for revision in [1,2]:(root/f'idrostatica-v{revision}.pdf').write_bytes(fixture(revision))
