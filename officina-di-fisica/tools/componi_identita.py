"""Compose the Officina plates and web sprite from the two editable character drawings."""

from pathlib import Path
from xml.etree import ElementTree as ET

ART = Path(__file__).resolve().parents[1] / 'static' / 'identita'
NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', NS)
DRAWS = {
    'in-cammino': ('Cric arriva con la matita sulla spalla', 'osserva', 'copertina.svg'),
    'al-banco': ('Cric si china a tracciare una linea', 'riprendi', 'copertina-attiva.svg'),
}


def illustration(pose, *, attributes):
    source = ET.parse(ART / f'cric-{pose}.svg').getroot()
    layer = ET.Element(f'{{{NS}}}svg', {'viewBox': source.attrib['viewBox'], **attributes})
    for item in source.findall(f'{{{NS}}}path'):
        layer.append(item)
    return layer


def add(parent, name, **attributes):
    return ET.SubElement(parent, f'{{{NS}}}{name}', attributes)


def write(svg, name):
    ET.indent(svg)
    (ART / name).write_text(ET.tostring(svg, encoding='unicode') + '\n', encoding='utf-8')


def main():
    sprite = ET.Element(f'{{{NS}}}svg', {'viewBox': '0 0 240 96', 'role': 'img',
                                          'aria-label': 'Cric in cammino e al banco'})
    for index, (pose, (caption, role, filename)) in enumerate(DRAWS.items()):
        symbol = add(sprite, 'symbol', id=role, viewBox='0 0 120 96')
        symbol.append(illustration(pose, attributes={'x': '12', 'y': '1', 'width': '96', 'height': '94'}))
        add(sprite, 'use', href='#' + role, x=str(120 * index), y='0', width='120', height='96')

        plate = ET.Element(f'{{{NS}}}svg', {'viewBox': '0 0 1000 800', 'role': 'img',
                                            'aria-labelledby': 'titolo'})
        add(plate, 'title', id='titolo').text = caption
        defs = add(plate, 'defs')
        dots = add(defs, 'pattern', id='retino', width='10', height='10',
                   patternUnits='userSpaceOnUse', patternTransform='rotate(-12)')
        add(dots, 'circle', cx='3.7', cy='3.7', r='2.45', fill='#5936ae')
        add(plate, 'ellipse', cx='515', cy='413', rx='327', ry='292',
            fill='url(#retino)', transform='rotate(-13 515 413)')
        add(plate, 'ellipse', cx='485', cy='386', rx='327', ry='292',
            fill='#dced4d', transform='rotate(-13 485 386)')
        plate.append(illustration(pose, attributes={'x': '128', 'y': '35', 'width': '750', 'height': '730'}))
        if pose == 'in-cammino':
            marks = 'M199 592l-42 3m51 13-32 11m44 3-17 12'
        else:
            marks = 'M161 575l-34-17m31 34-46-7m49 23-26 4'
        add(plate, 'path', d=marks, fill='none', stroke='#5936ae',
            **{'stroke-width': '5', 'stroke-linecap': 'round'})
        write(plate, filename)
    write(sprite, 'gesti.svg')


if __name__ == '__main__':
    main()
