import importlib.util
import json
from pathlib import Path
import tempfile
import sys
import unittest
from unittest.mock import patch
from urllib.parse import parse_qs, urlsplit

HERE=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(HERE))
spec=importlib.util.spec_from_file_location('marketing_build',HERE/'build.py')
build=importlib.util.module_from_spec(spec);spec.loader.exec_module(build)

class BuildTests(unittest.TestCase):
    def test_real_canonical_composition_contact_and_preview_boundary(self):
        data,courses,identity=build.load_catalog()
        self.assertEqual([c['unitIds'] for c in courses],[['U1','U2'],['U3','U5'],['U6'],['U4','U7']])
        self.assertEqual(identity['sha256'],'3e502d4788440fbb0f82bc136537b42165c898e34b9741d64ad3985f5cbd247f')
        for c in courses:
            u=urlsplit(build.contact_url(data,c));text=parse_qs(u.query)['text'][0]
            self.assertEqual(u.netloc,'wa.me');self.assertEqual(u.path,'/393461653930')
            self.assertIn(c['title'],text);self.assertIn('Ardesia',text);self.assertIn('non vincolante',text)
        with tempfile.TemporaryDirectory() as tmp:
            out=build.build(Path(tmp));html=(out/'index.html').read_text()
            self.assertIn('noindex, nofollow',html);self.assertNotIn('<form',html)
            self.assertNotIn('proposte in preparazione',html.lower());self.assertIn('Nuovi gruppi in formazione.',html)
            self.assertIn('frame-ancestors', (out/'_headers').read_text())
            self.assertIn('immutable', (out/'_headers').read_text())
            self.assertRegex(html, r'site\.[0-9a-f]{12}\.js')
            self.assertNotIn('€/ora',html);self.assertNotIn('4.000',html)
            self.assertEqual(html.count('data-course='),len(courses))
            build.build(out, preview_url='https://preview.example.com/')
            preview = (out/'index.html').read_text()
            self.assertIn('noindex, nofollow', preview)
            self.assertIn('https://preview.example.com/assets/social-cover.', preview)
            self.assertNotIn('rel="canonical"', preview)
            build.build(out,'https://example.com/fisica/')
            self.assertNotIn('noindex, nofollow',(out/'index.html').read_text())
            self.assertIn('https://example.com/fisica/',(out/'sitemap.xml').read_text())
            build.build(out)
            self.assertFalse((out/'sitemap.xml').exists())

    def test_titles_and_additional_courses_are_data_not_renderer_constants(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve();(root/'composition.json').write_text(json.dumps({'id':'synthetic','version':2,'bankRef':{},'paths':[{'id':'analisi','title':'Analisi sintetica <nuova>','unitIds':['A1']},{'id':'algebra','title':'Algebra sintetica','unitIds':['A2']}]}))
            data={'teacherId':'andrea-marro','examLabel':'Prova di Matematica','examAuthority':'Ente sintetico','availability':'Gruppi di Matematica in formazione.','audience':'Pubblico sintetico di Matematica','subject':'Matematica','academicYear':'2026/27','composition':'composition.json','reference':{'url':'https://example.com/matematica','label':'Programma di Matematica'},'contact':{'whatsapp':'393461653930','email':'fixture@example.com','display':'346 165 3930'},'courses':{id:{'intro':'<test>','fit':'Test del percorso','topics':['Tema'],'outcomes':['Obiettivo']} for id in ['analisi','algebra']}}
            config=root/'catalog.json';config.write_text(json.dumps(data))
            with patch.object(build,'ROOT',root):
                loaded,courses,identity=build.load_catalog(config)
                html=build.render(loaded,courses,identity)
                self.assertEqual(html.count('data-course='),2)
                self.assertIn('Analisi sintetica &lt;nuova&gt;',html)
                self.assertIn('Microcorsi di Matematica 2026/27',html)
                self.assertIn('Due percorsi tematici.',html)
                self.assertIn('Matematica · 2026/27',html)
                self.assertNotIn('Fisica',html)
                self.assertNotIn('MUR',html)
                self.assertIn('Prova di Matematica',html)
                self.assertIn('Gruppi di Matematica in formazione.',html)
                self.assertIn('Ente sintetico',html)
                self.assertIn('https://example.com/matematica',html)
                self.assertNotIn('syllabus MUR',html)
                self.assertNotIn('>Strumenti e meccanica<',html)
                del data['courses']['algebra'];config.write_text(json.dumps(data))
                with self.assertRaisesRegex(ValueError,'must_match'):build.load_catalog(config)

    def test_bad_contact_and_production_url_are_rejected(self):
        data=json.loads((HERE/'catalog.json').read_text())
        with tempfile.TemporaryDirectory() as tmp:
            data['contact']['whatsapp']='not-a-phone'
            config=Path(tmp)/'catalog.json';config.write_text(json.dumps(data))
            with self.assertRaisesRegex(ValueError,'invalid_contact'):build.load_catalog(config)
        for u in ['http://example.com','javascript:alert(1)','https://user@example.com','https://example.com/?track=true']:
            with tempfile.TemporaryDirectory() as tmp:
                with self.assertRaises(ValueError):build.build(Path(tmp),u)

if __name__=='__main__':unittest.main()
