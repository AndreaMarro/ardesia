"""Typeset the private pack from the same records that the study API grades."""
import argparse
import base64
from html import escape
from pathlib import Path
import subprocess
import tempfile

from multidiscipline.pack import load_pack
from server.printing import chrome

ROOT = Path(__file__).resolve().parents[1]


def text(value):
    return escape(str(value), quote=True)


def paragraphs(parts):
    return "".join("<h4>"+text(p["title"])+"</h4><p>"+text(p["body"])+"</p>" for p in parts)


def question(item, number):
    options = "".join("<li>"+text(o["text"])+"</li>" for o in item["options"])
    reasons = "".join("<li><strong>"+text(o["text"])+"</strong> · "+text(item["feedback"][o["id"]])+"</li>"
                      for o in item["options"])
    correct = next(o["text"] for o in item["options"] if o["id"] == item["correctOptionId"])
    hints = "".join("<li>"+text(h)+"</li>" for h in item["hints"])
    return (f'<section class="problem" id="p-{text(item["id"])}"><h3>Quesito {number}</h3>'
            '<p class="prompt">'+text(item["prompt"])+'</p><ol type="A">'+options+'</ol>'
            + ('<h4>Indizi per iniziare</h4><ol>'+hints+'</ol>' if hints else '')
            + '<h4>Risposta</h4><p>'+text(correct)+'</p>'+paragraphs(item["solution"])
            + '<h4>Controllo delle alternative</h4><ul>'+reasons+'</ul>'
            + '<h4>Prova in un altro contesto</h4><p>'+text(item["transfer"]["prompt"])
            + '</p><p>'+text(item["transfer"]["answer"])+'</p></section>')


def build_html(path):
    catalog, units = load_pack(path)
    courses=catalog["courses"]
    skills={s["id"]:s for s in catalog["skills"]}
    sections=[]
    for number, c in enumerate(courses,1):
        title=text(c["title"])
        parts=[f'<section class="chapter" id="{text(c["id"])}"><p class="eyebrow">Microcorso {number}</p><h1>{title}</h1><p class="lead">{text(c.get("summary",""))}</p>']
        for index, u in enumerate(c["units"],1):
            unit=units[u["id"]]
            prereqs=", ".join(skills[k]["title"] for k in skills[unit["skillId"]].get("prerequisites",[]))
            parts.append(f'<section class="unit" id="u-{text(u["id"])}"><h2>{number}.{index} · {text(u["title"])}</h2>'
                         '<p class="goal">'+text(u["objective"])+'</p>'
                         + ('<p class="meta">Prerequisiti · '+text(prereqs)+'</p>' if prereqs else '')
                         + paragraphs(unit["lesson"]) + '<h3>Preparazione all’orale</h3><p class="prompt">'
                         + text(unit["oral"]["prompt"]) + '</p>'
                         + "".join("<p>"+text(s)+"</p>" for s in unit["oral"]["solution"]))
            for n,a in enumerate(unit["activities"],1):
                parts.append(question(a,f"{number}.{index}.{n}"))
            parts.append("</section>")
        if c.get("formulas"):
            parts.append('<h2>Formulario ragionato</h2>'+paragraphs(c["formulas"]))
        sections.append("".join(parts)+"</section>")
    directory="".join(f'<li><a href="#{text(c["id"])}">{text(c["title"])}</a></li>' for c in courses)
    symbols="".join("<tr><th>"+text(s["symbol"])+"</th><td>"+text(s["reading"])+"</td><td>"+text(s["meaning"])+"</td></tr>" for s in catalog["symbols"])
    extra = '<section class="chapter"><h1>Come leggere i simboli</h1><table><thead><tr><th>Simbolo</th><th>Lettura</th><th>Significato</th></tr></thead><tbody>'+symbols+'</tbody></table></section>' if symbols else ''
    def asset(p):
        return base64.b64encode((ROOT/"static"/p).read_bytes()).decode()
    style = """
      @page { size:A4; margin:21mm 21mm 22mm;
        @bottom-left {content:"CRIC  /  QUADERNO DI STUDIO"; color:#3a5551; font:8pt sans-serif}
        @bottom-right {content:counter(page);font:10pt serif} }
      * {box-sizing:border-box} html{color:#182c2c;font:11.6pt/1.48 Georgia,'STIX Two Math','Apple Symbols',serif}
      body{margin:0} .eyebrow,.meta,h4 {font-family:Work,Arial,sans-serif} .eyebrow {letter-spacing:.12em;text-transform:uppercase;font-size:9pt;color:#396359}
      h1,h2,h3,h4 {break-after:avoid} h1 {font-size:36pt;line-height:1.07;margin:8mm 0 4mm}
      h2 {font-size:22pt;line-height:1.14;margin:10mm 0 3mm} h3 {font-size:15pt;color:#24564e;margin:7mm 0 2mm}
      h4 {font-size:10.6pt;margin:4mm 0 1mm} p,li {orphans:3;widows:3} p {margin:0 0 3mm}
      .cover,.chapter {break-before:page} .cover {padding-top:18mm}.cover img{height:25mm;width:auto}
      .cover h1 {font-size:48pt;margin-top:16mm}.lead {font-size:14pt;line-height:1.38}
      .goal,.prompt {font-weight:bold}.meta {font-size:9.5pt;color:#375b54}
      .index {break-before:page}.index li {margin:2mm 0}a {color:#20554e}
      .problem h3 {border-top:1px solid #75968b;padding-top:4mm} ol,ul{padding-left:7mm;margin:1mm 0 4mm}
      li{padding-left:1mm;margin:1mm 0}table {border-collapse:collapse;width:100%} td,th{padding:2mm;text-align:left;border-bottom:1px solid #acbbb5}
    """
    return ('<!doctype html><html lang="it"><meta charset="utf-8"><title>'+text(catalog["title"])+'</title><style>'
            +"@font-face{font-family:Work;src:url(data:font/woff2;base64,"+asset("type/worksans2.woff2")+")}"+style
            + '</style><body><section class="cover"><img alt="Cric" src="data:image/svg+xml;base64,'+asset("identita/segno.svg")+'">'
            + '<h1>'+text(catalog["title"])+'</h1><p class="lead">'+text(catalog.get("summary",""))+'</p>'
            + '<p class="eyebrow">Quaderno di studio · Edizione '+text(catalog["version"])+'</p>'
            + '<p>Materiale di lavoro per la revisione privata.</p></section><section class="index"><h1>Indice dei microcorsi</h1>'
            + '<ol>'+directory+'</ol></section>'+"".join(sections)+extra+'</body></html>')


def build(path, target):
    with tempfile.TemporaryDirectory(prefix="cric-dispensa-") as tmp:
        tmp=Path(tmp)
        page=tmp/"quaderno.html";page.write_text(build_html(path),encoding="utf-8")
        rendered=tmp/"quaderno.pdf"
        subprocess.run([chrome(),"--headless","--disable-gpu","--disable-background-networking",
                        "--no-pdf-header-footer","--user-data-dir="+str(tmp/"profile"),"--print-to-pdf="+str(rendered),page.as_uri()],
                       stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,check=True,timeout=120)
        data=rendered.read_bytes()
        if not data.startswith(b"%PDF-"):
            raise ValueError("Il motore di stampa non ha restituito un documento PDF.")
        target.write_bytes(data)


if __name__=="__main__":
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("catalog",type=Path)
    parser.add_argument("pdf",type=Path)
    args=parser.parse_args()
    build(args.catalog,args.pdf)
