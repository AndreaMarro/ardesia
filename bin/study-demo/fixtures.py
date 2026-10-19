"""Generate original synthetic media; no human recording or private source."""
from pathlib import Path
import subprocess
from PIL import Image,ImageDraw
from pypdf import PdfWriter
from pypdf.generic import DictionaryObject,NameObject,DecodedStreamObject


def generate(directory:Path):
    directory.mkdir(parents=True,exist_ok=True)
    image=Image.new('RGB',(480,240),'white');ImageDraw.Draw(image).text((24,60),'SYNTHETIC EXAMPLE: Q ~ r^2. Check this hypothesis.',fill='black');image.save(directory/'source.png')
    writer=PdfWriter();page=writer.add_blank_page(400,300)
    stream=DecodedStreamObject();stream.set_data(b'BT /F1 16 Tf 30 180 Td (Synthetic example: Q/Q0 = 5.0625.) Tj ET')
    page[NameObject('/Contents')]=writer._add_object(stream)
    page[NameObject('/Resources')]=DictionaryObject({NameObject('/Font'):DictionaryObject({NameObject('/F1'):DictionaryObject({NameObject('/Type'):NameObject('/Font'),NameObject('/Subtype'):NameObject('/Type1'),NameObject('/BaseFont'):NameObject('/Helvetica')})})})
    writer.write(directory/'source.pdf')
    subprocess.run(['ffmpeg','-v','error','-y','-f','lavfi','-i','sine=frequency=440:duration=1','-codec:a','libmp3lame',str(directory/'tone.mp3')],check=True)

if __name__=='__main__':
    import sys
    generate(Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).resolve().parents[2]/'.study-demo/fixtures')
