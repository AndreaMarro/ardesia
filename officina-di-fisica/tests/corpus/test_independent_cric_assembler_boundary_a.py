"""Distinct technical falsification of canonical Cric assembly; no SCI credit."""
from copy import deepcopy
import base64
import hashlib
import json
from pathlib import Path
import subprocess
import unittest
import tempfile
import importlib.util
from unittest.mock import patch
from tools.corpus_engineering import vector_geometry_authoring as assembly
from tools.corpus_engineering.pipeline import digest
APP=Path(__file__).resolve().parents[2]
REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
PATCH_REF='07c49c98221afb1f700f11a7e084450d076e536c'
HISTORICAL_REF='23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5'
PROOF=Path(__file__).resolve().parents[2]/'editorial/reviews/cric-assembler-section-independent-a-20261127'
ASSET='lens-magnification-progressive.svg'
TASK=('Synthetic boundary fixture','Somma una unità e una unità.',2,'Sono due unità.','1+1=2','Tre non è la somma.','Conta le due unità.')
COUNT={}
def source(i,version=1,exam=None):
    return {'id':f'C1-Q{i:03}','kind':'question','course':'C1','skill':'C1-L001','order':i,'version':version,'family':f'original-family-{i}','difficulty':(i%3)+1,'prerequisites':['C1-L001'],'exam':deepcopy(exam),'originalExtra':{'nested':[i]},'prompt':'Old synthetic prompt','promptBlocks':[{'type':'text','text':'Old supplement must not leak'}],'answer':{'type':'numeric','value':0,'unit':'1','tolerance':0}}
def build(rows,ids=None,**kw):
    ids=[r['id']for r in rows]if ids is None else ids
    with patch.object(assembly,'git_bytes',return_value=json.dumps(rows).encode())as read:
        result=assembly.assemble_family(APP.parent,REF,'cric-c1-l001',[TASK]*len(ids),{}, {},ASSET,{},0,source_path='officina-di-fisica/content/C1.json',source_origin='cric',source_ids=ids,**kw)
        read.assert_called_once_with(APP.parent,REF,'officina-di-fisica/content/C1.json')
        return result
class IndependentCricAssemblyBoundary(unittest.TestCase):
    def test_canonical_bytes_are_exactly_the_read_followup(self):
        for name in['tools/corpus_engineering/vector_geometry_authoring.py','tests/corpus/test_cric_question_assembly.py']:
            raw=subprocess.check_output(['git','show',PATCH_REF+':officina-di-fisica/'+name],cwd=APP.parent);self.assertEqual(raw,(APP/name).read_bytes())

    def test_historical_strict_byte_guard_executes_against_verbatim_historical_files(self):
        # Run the untouched prior guard in a separate historical fixture, not
        # against the new live assembler and not with an alternative hash.
        path=PROOF/'historical-independent-target.py.txt'
        spec=importlib.util.spec_from_loader('frozen_independent_boundary_a',loader=None)
        old=importlib.util.module_from_spec(spec)
        old.__file__=str(APP/'tests/corpus/test_independent_cric_assembler_boundary_a.py')
        exec(compile(path.read_bytes(),str(APP/'tests/corpus/test_independent_cric_assembler_boundary_a.py'),'exec'),old.__dict__)
        with tempfile.TemporaryDirectory(prefix='.historical-assembler-boundary-',dir=APP)as tmp:
            shadow=Path(tmp)/'app'
            for name in ['tools/corpus_engineering/vector_geometry_authoring.py','tests/corpus/test_cric_question_assembly.py']:
                p=shadow/name;p.parent.mkdir(parents=True,exist_ok=True)
                p.write_bytes((PROOF/('historical-'+p.name+'.txt')).read_bytes())
            with patch.object(old,'APP',shadow):
                old.IndependentCricAssemblyBoundary('test_canonical_bytes_are_exactly_the_read_followup').test_canonical_bytes_are_exactly_the_read_followup()
        self.assertEqual(old.PATCH_REF,HISTORICAL_REF)

    def test_individual_sections_preserved_and_no_source_field_invented(self):
        originals=[source(1),source(2,2)];originals[0]['section']='Misure e riferimenti';originals[1]['section']='Moto e leggi'
        snapshot=deepcopy(originals);p,b=build(originals,section='Wrong cohort heading')
        self.assertEqual(originals,snapshot)
        for old,row,link in zip(originals,p['records'],b):
            self.assertEqual(row['section'],old['section']);self.assertEqual(link['sourceSha256'],digest(old));self.assertEqual(link['candidateSha256'],digest(row))
        # Legacy synthetic sources lacking section keep the caller's normal
        # heading; absence is not an invented identity requirement.
        p,_=build([source(1)],section='Legacy synthetic heading')
        self.assertEqual(p['records'][0]['section'],'Legacy synthetic heading')
        p,_=build([source(1)],overrides={1:{'section':'Explicit synthetic heading'}})
        self.assertEqual(p['records'][0]['section'],'Explicit synthetic heading')

    def test_section_override_rejected_with_strict_type_but_same_value_allowed(self):
        row=source(1);row['section']='Original section'
        for wrong in ['Other section','',None,False,0,{},[]]:
            with self.subTest(wrong=wrong),self.assertRaises(ValueError):build([row],overrides={1:{'section':wrong}})
        p,_=build([row],overrides={1:{'section':row['section']}})
        self.assertEqual(p['records'][0]['section'],row['section'])
        typed=source(1);typed['section']=0
        with self.assertRaises(ValueError):build([typed],overrides={1:{'section':False}})
        COUNT['section_override_rejections']=8

    def test_mixed_versions_identity_family_difficulty_and_binding(self):
        originals=[source(1,1),source(2,2)];snapshot=deepcopy(originals);package,bindings=build(originals)
        self.assertEqual(originals,snapshot);self.assertEqual(len(package['records']),2)
        for old,row,link in zip(originals,package['records'],bindings):
            for key in['id','kind','course','skill','order','family','difficulty','prerequisites','exam','originalExtra']:self.assertEqual(row.get(key),old.get(key))
            self.assertEqual((row['baseVersion'],row['version']),(old['version'],old['version']+1));self.assertEqual(row['error']['target'],row['skill']);self.assertNotIn('promptBlocks',row)
            self.assertEqual(link['sourceSha256'],digest(old));self.assertEqual(link['candidateSha256'],digest(row));self.assertEqual(link['sourceId'],old['id']);self.assertEqual(link['sourceRef'],REF);self.assertEqual(link['provenance']['sourcePath'],'officina-di-fisica/content/C1.json');self.assertEqual(link['provenance']['sourceOrigin'],'cric');self.assertEqual(link['provenance']['sourceVersion'],old['version']);self.assertEqual(link['provenanceSha256'],digest(link['provenance']))
        self.assertEqual([r['family']for r in package['records']],['original-family-1','original-family-2'])
        self.assertEqual(hashlib.sha256(base64.b64decode(package['assets'][0]['data'])).hexdigest(),package['assets'][0]['id'])

    def test_identity_and_protected_exam_rebinding_rejected_even_equal_wrong_types(self):
        exam={'id':'C1-exam-fixture','protected':True,'section':'old'};row=source(1,2,exam);count=0
        changes=[{'id':'C1-Q002'},{'kind':'lesson'},{'course':'C2'},{'skill':'C1-L002'},{'version':2},{'version':True},{'version':3.0},{'baseVersion':0},{'baseVersion':True},{'baseVersion':2.0},{'exam':None},{'exam':{}},{'exam':{'id':'other','protected':True,'section':'old'}},{'exam':{'id':'C1-exam-fixture','protected':False,'section':'old'}}]
        for change in changes:
            with self.subTest(change=change),self.assertRaises(ValueError):build([row],overrides={1:change})
            count+=1
        COUNT['identity_exam_rejections']=count
        package,_=build([row]);self.assertEqual(package['records'][0]['exam'],exam);self.assertEqual(row['exam'],exam)

    def test_source_and_cardinality_falsifications(self):
        good=source(1);count=0
        for ids in[[],['C1-Q001','C1-Q001'],['C1-Q999'],[True],[1],['C1-L001'],[f'C1-Q{i:03}'for i in range(1,102)]]:
            with self.subTest(ids=ids[:2]),self.assertRaises(ValueError):build([good],ids)
            count+=1
        for version in[0,-1,True,1.0,None,'1']:
            with self.subTest(version=version),self.assertRaises(ValueError):build([source(1,version)])
            count+=1
        bad=source(1);bad['kind']='lesson'
        with self.assertRaises(ValueError):build([bad])
        count+=1
        for n in[1,10,100]:
            rows=[source(i,(i%2)+1)for i in range(1,n+1)];p,b=build(rows);self.assertEqual(len(p['records']),n);self.assertEqual(len(b),n);self.assertEqual(len({r['id']for r in p['records']}),n)
        COUNT['source_size_rejections']=count
        # Caller cannot smuggle explicit stable IDs into default Ardesia mode.
        with self.assertRaises(ValueError):assembly.assemble_family(APP.parent,REF,'fixture',[TASK],{}, {},ASSET,{},0,source_ids=['C1-Q001'])
        with self.assertRaises(ValueError):assembly.assemble_family(APP.parent,REF,'fixture',[TASK],{}, {},ASSET,{},0,source_origin='foreign')

    def test_explicit_per_record_taxonomy_override_keeps_identity(self):
        p,b=build([source(1)],overrides={1:{'family':'reviewed-different-family','difficulty':3}});r=p['records'][0]
        self.assertEqual(r['family'],'reviewed-different-family');self.assertEqual(r['difficulty'],3);self.assertEqual(r['id'],'C1-Q001');self.assertEqual(r['skill'],'C1-L001');self.assertEqual(b[0]['candidateSha256'],digest(r))

    def test_two_legacy_ardesia_packages_remain_byte_equivalent(self):
        from tools.corpus_engineering.wavelength_in_medium_authoring import assemble as wavelength
        from tools.corpus_engineering.lens_magnification_authoring import assemble as magnification
        for fn,batch in[(wavelength,'wavelength-in-medium-240'),(magnification,'lens-magnification-260')]:
            p,b=fn(APP.parent,'5cfbdcb055ba3ba136f97fb56e997f06e6cf3605')
            self.assertEqual(p,json.loads((APP/f'editorial/batches/{batch}.json').read_bytes()));self.assertEqual(b,json.loads((APP/f'editorial/batches/{batch}-bindings.json').read_bytes()))
            self.assertEqual((json.dumps(p,ensure_ascii=False,indent=2)+'\n').encode(),(APP/f'editorial/batches/{batch}.json').read_bytes());self.assertEqual((assembly.canonical(b)+'\n').encode(),(APP/f'editorial/batches/{batch}-bindings.json').read_bytes())
if __name__=='__main__':unittest.main()
