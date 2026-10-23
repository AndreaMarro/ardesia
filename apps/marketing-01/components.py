"""Small, escaped HTML components shared by every subject catalog."""
from html import escape
from pathlib import Path
from string import Template

TEMPLATES = Path(__file__).parent / 'templates'

def icon(kind):
    paths = {
        'arrow': '<path d="M4 12h16m-6-6 6 6-6 6"/>',
        'external': '<path d="M6 18 18 6M6 6h12v12"/>',
        'chevron': '<path d="m6 9 6 6 6-6"/>',
    }
    return f'<svg class="icon icon-{kind}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{paths[kind]}</svg>'


def template(name, **values):
    return Template((TEMPLATES / name).read_text()).substitute(values)


def text(value):
    return escape(str(value), quote=True)


def items(values):
    return ''.join(f'<li>{text(value)}</li>' for value in values)


def external_link(link, label=None):
    return f'<a href="{text(link["url"])}" target="_blank" rel="noopener noreferrer">{text(label or link["label"])} {icon("external")}</a>'


def course_card(course, number, contact):
    return template('course.html', id=text(course['id']), number=f'{number:02}',
                    units=text(' + '.join(course['unitIds'])), title=text(course['title']),
                    intro=text(course['intro']), fit=text(course['fit']),
                    topics=items(course['topics']), outcomes=items(course['outcomes']),
                    contact_url=text(contact), external=icon('external'), chevron=icon('chevron'))


def path_link(course, number):
    return f'<li><a href="?percorso={text(course["id"])}#{text(course["id"])}"><span class="index-number">{number:02}</span><span>{text(course["title"])}</span>{icon("arrow")}</a></li>'


def choice(course, number, contact):
    return f'<label class="course-choice"><input type="radio" name="course" value="{text(course["id"])}" data-href="{text(contact)}" {"checked" if number == 1 else ""}><span>{text(course["title"])}</span></label>'


def review(value):
    return f'<figure><blockquote>“{text(value["quote"])}”</blockquote><figcaption>{text(value["name"])}<span>{text(value["context"])}</span>{external_link({"url": value["url"], "label": "Fonte: " + value["source"]})}</figcaption></figure>'


def faq(value, context, privacy):
    links = ''
    if value.get('privacyLinks'):
        links = '<p class="privacy-links">' + external_link({'url': privacy, 'label': 'Informativa di Andrea'}) + ' · ' + external_link({'url': 'https://www.whatsapp.com/legal/privacy-policy-eea', 'label': 'Informativa WhatsApp'}) + '</p>'
    return f'<details><summary>{text(value["question"])}{icon("chevron")}</summary><div class="faq-answer"><p>{text(value["answer"].format_map(context))}</p>{links}</div></details>'
