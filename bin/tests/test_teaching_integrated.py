"""The integrated client is a protected preview, never an accidental public export."""
import hashlib
import base64
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
import threading
from http.server import ThreadingHTTPServer
from urllib.request import Request,urlopen
from urllib.error import HTTPError
from functools import partial
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'bin/web'))

def module(name,path):
 spec=importlib.util.spec_from_file_location(name,ROOT/path)
 value=importlib.util.module_from_spec(spec);spec.loader.exec_module(value);return value
build=module('integrated_build','bin/build_teaching_candidate.py')
preview=module('integrated_preview','bin/web/prepare_vercel_preview.py')
upload=module('integrated_upload','bin/web/prepare_vercel_upload.py')
serve=module('integrated_serve','bin/web/serve_teaching_candidate.py')

class IntegratedPreviewTest(unittest.TestCase):
 def fixture(self,root,*,editorial=False):
  for name in ('marketing','experience','web','studio'):
   (root/name/'assets').mkdir(parents=True)
   (root/name/'index.html').write_text('<!doctype html><title>'+name+'</title>')
  (root/'marketing/robots.txt').write_text('User-agent: *\nDisallow: /\n')
  (root/'marketing/source-manifest.json').write_text('{"examples":[]}')
  (root/'marketing/404.html').write_text('<h1>Not found</h1>')
  (root/'web/assets/client.js').write_text('/* original client fixture */')
  (root/'studio/assets/canvas.js').write_text('/* original canvas fixture */')
  empty=hashlib.sha256(b'').hexdigest()
  out=root/'candidate'
  build.assemble(out,root/'marketing',root/'experience',web=root/'web',studio=root/'studio',
   source={'commit':'b'*40,'sourceTreeSha256':empty,'trackedDiffSha256':empty,'sourceFileCount':0},
   course_manifest={'releaseScope':'PRIVATE_EDITORIAL_REVIEW' if editorial else 'PUBLIC_DEMONSTRATION'})
  (out/'source-manifest.json').write_text(json.dumps({'sha256':empty,'files':{}}))
  return out
 def prepare(self,source,target):
  return preview.prepare(source,target,private_integrated=True,main_sha='a'*40,head_sha='c'*40)
 def test_both_clients_and_distinct_lineage_are_exported_without_the_editorial_site(self):
  with tempfile.TemporaryDirectory() as directory:
   root=Path(directory);candidate=self.fixture(root);receipt=self.prepare(candidate,root/'prepared');static=root/'prepared/.vercel/output/static'
   self.assertEqual((static/'index.html').read_text(),(candidate/'beta/web/index.html').read_text())
   self.assertEqual((static/'studio/index.html').read_text(),(candidate/'beta/studio/index.html').read_text())
   self.assertFalse((static/'esperienza').exists())
   self.assertFalse((static/'courses-manifest.json').exists())
   self.assertTrue(receipt['privateBetaIncluded']);self.assertTrue(receipt['requiresProtectedPreview'])
   release=json.loads((static/'release-manifest.json').read_text())
   self.assertEqual(release['sourceProduct'],'b'*40);self.assertEqual(release['mainObserved'],'a'*40);self.assertEqual(release['integrationHead'],'c'*40)
   self.assertIsNone(release['deployment']);self.assertEqual(release['backend'],'NOT_CONFIGURED')
   self.assertIn('Sola anteprima privata',(static/'ops/release/index.html').read_text())
 def test_integrated_upload_requires_explicit_private_scope_and_never_targets_production(self):
  with tempfile.TemporaryDirectory() as directory:
   root=Path(directory);self.prepare(self.fixture(root),root/'prepared')
   with self.assertRaisesRegex(ValueError,'private_integrated_preview_required'):upload.prepare(root/'prepared')
   request=upload.prepare(root/'prepared',protected_integrated=True)
   self.assertNotIn('target',request['requestBody'])
   self.assertEqual(request['requestBody']['meta']['scope'],'PRIVATE_INTEGRATED_PREVIEW')
   self.assertTrue(any(f['file']=='public/studio/assets/canvas.js' for f in request['requestBody']['files']))
 def test_editorial_sidecar_cannot_be_smuggled_into_the_student_client(self):
  with tempfile.TemporaryDirectory() as directory:
   root=Path(directory)
   with self.assertRaisesRegex(ValueError,'separate_editorial_preview_required'):self.prepare(self.fixture(root,editorial=True),root/'prepared')
 def test_direct_api_requests_fail_closed_before_the_spa_and_unknown_paths_are_not_html200(self):
  with tempfile.TemporaryDirectory() as directory:
   root=Path(directory);self.prepare(self.fixture(root),root/'prepared')
   routes=json.loads((root/'prepared/.vercel/output/config.json').read_text())['routes']
   api=next(r for r in routes if r.get('src','').startswith('/study'))
   self.assertEqual(api['status'],503)
   self.assertEqual(routes[-1]['status'],404)
   self.assertEqual(json.loads((root/'prepared/.vercel/output/static/_integration/backend-unavailable.json').read_text())['error'],'backend_not_configured')
 def test_rehashed_private_mode_cannot_be_disguised_as_public(self):
  with tempfile.TemporaryDirectory() as directory:
   root=Path(directory);self.prepare(self.fixture(root),root/'prepared')
   path=root/'prepared/preview-manifest.json';value=json.loads(path.read_text());value['privateBetaIncluded']=False;path.write_text(json.dumps(value))
   with self.assertRaisesRegex(ValueError,'private_integrated_preview_required'):upload.prepare(root/'prepared')

 def test_real_http_has_clients_operator_status_and_explicit_api_failure(self):
  with tempfile.TemporaryDirectory() as directory:
   root=Path(directory);self.prepare(self.fixture(root),root/'prepared')
   server=ThreadingHTTPServer(('127.0.0.1',0),partial(serve.IntegratedCandidateHandler,directory=str(root/'prepared/.vercel/output/static')))
   thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start();origin='http://127.0.0.1:'+str(server.server_port)
   try:
    for path,text in [('/','web'),('/studio/','studio'),('/ops/release/','Sola anteprima privata')]:
     with urlopen(origin+path) as res:
      self.assertEqual(res.status,200);self.assertIn(text,res.read().decode());self.assertIn("connect-src 'self'",res.headers['Content-Security-Policy'])
    for method in ('GET','POST','PUT','DELETE'):
     with self.assertRaises(HTTPError) as error:urlopen(Request(origin+'/study/session',data=b'{}' if method!='GET' else None,method=method))
     self.assertEqual(error.exception.code,503);self.assertEqual(json.loads(error.exception.read())['error'],'backend_not_configured')
    for path in ('/courses-manifest.json','/esperienza/','/studio/unknown','/assets/','/%2e%2e/secret'):
     with self.assertRaises(HTTPError) as error:urlopen(origin+path)
     self.assertEqual(error.exception.code,404)
   finally:server.shutdown();server.server_close();thread.join()
 def test_rehashed_proxy_and_added_or_linked_files_are_rejected(self):
  with tempfile.TemporaryDirectory() as directory:
   root=Path(directory);self.prepare(self.fixture(root),root/'prepared');output=root/'prepared/.vercel/output'
   (output/'static/extra.js').write_text('unreviewed')
   with self.assertRaisesRegex(ValueError,'changed_public_assets'):upload.prepare(root/'prepared',protected_integrated=True)
   (output/'static/extra.js').unlink()
   config=json.loads((output/'config.json').read_text());config['routes'][1]['dest']='https://unreviewed.invalid/study'
   (output/'config.json').write_text(json.dumps(config));path=root/'prepared/preview-manifest.json';r=json.loads(path.read_text());r['configSha256']=hashlib.sha256((output/'config.json').read_bytes()).hexdigest();path.write_text(json.dumps(r))
   with self.assertRaisesRegex(ValueError,'integrated_host_policy_changed'):upload.prepare(root/'prepared',protected_integrated=True)

 def test_assets_added_after_verification_are_not_autoattested(self):
  for linked in (False, True):
   with self.subTest(linked=linked), tempfile.TemporaryDirectory() as directory:
    root=Path(directory);candidate=self.fixture(root)
    outside=root/'outside-private.txt';outside.write_text('synthetic private bytes')
    checked=preview.check
    def mutate_after_check(source):
     result=checked(source)
     new=source/'beta/web/unreviewed.txt'
     if linked:new.symlink_to(outside)
     else:new.write_text('unreviewed bytes')
     return result
    with patch.object(preview,'check',side_effect=mutate_after_check):
     with self.assertRaisesRegex(ValueError,'linked_integrated_asset|integrated_copy_changed'):
      self.prepare(candidate,root/'prepared')
    self.assertFalse((root/'prepared').exists())
    self.assertEqual(outside.read_text(),'synthetic private bytes')

 def test_upload_encodes_the_verified_snapshot_even_when_the_path_changes(self):
  with tempfile.TemporaryDirectory() as directory:
   root=Path(directory);self.prepare(self.fixture(root),root/'prepared')
   path=root/'prepared/.vercel/output/static/assets/client.js'
   original=path.read_bytes();parse=json.loads
   def mutate_after_inventory(content):
    value=parse(content)
    if isinstance(value,dict) and value.get('scope')=='PRIVATE_INTEGRATED_PREVIEW':
     path.write_text('changed after snapshot')
    return value
   with patch.object(upload.json,'loads',side_effect=mutate_after_inventory):
    payload=upload.prepare(root/'prepared',protected_integrated=True)
   encoded=next(f['data'] for f in payload['requestBody']['files'] if f['file']=='public/assets/client.js')
   self.assertEqual(base64.b64decode(encoded),original)
   self.assertNotEqual(path.read_bytes(),original)

 def test_removing_editorial_marker_after_snapshot_cannot_bypass_the_gate(self):
  with tempfile.TemporaryDirectory() as directory:
   root=Path(directory);candidate=self.fixture(root,editorial=True)
   preview.prepare(candidate,root/'prepared')
   marker=root/'prepared/.vercel/output/static/courses-manifest.json';parse=json.loads
   def remove_marker_after_snapshot(content):
    value=parse(content)
    if isinstance(value,dict) and value.get('examples')==[]:marker.unlink()
    return value
   with patch.object(upload.json,'loads',side_effect=remove_marker_after_snapshot):
    with self.assertRaisesRegex(ValueError,'protected_editorial_preview_required'):
     upload.prepare(root/'prepared')
