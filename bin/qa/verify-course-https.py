#!/usr/bin/env python3
"""Read-only exact HTTPS verification; access files stay private, URLs never logged."""
import argparse,base64,hashlib,json,pathlib
from urllib.request import Request,build_opener,HTTPCookieProcessor,HTTPRedirectHandler
from urllib.error import HTTPError
from http.cookiejar import CookieJar
class NoRedirect(HTTPRedirectHandler):
 def redirect_request(self,*a,**k):return None
p=argparse.ArgumentParser();p.add_argument('--prepared',required=True);p.add_argument('--origin',required=True);p.add_argument('--out',required=True);p.add_argument('--headers');p.add_argument('--access');a=p.parse_args()
headers=json.loads(pathlib.Path(a.headers).read_text()) if a.headers else {}
origin=a.origin.rstrip('/');opener=build_opener(NoRedirect,HTTPCookieProcessor(CookieJar()))
if a.access:
 access=json.loads(pathlib.Path(a.access).read_text())['url']
 from urllib.parse import urlsplit
 assert urlsplit(access).netloc==urlsplit(origin).netloc
 jar=CookieJar(); auth=build_opener(HTTPCookieProcessor(jar))
 try:
  with auth.open(access,timeout=30) as response:assert response.status==200
 except Exception:raise RuntimeError('Temporary preview access failed, URL omitted') from None
 opener=build_opener(NoRedirect,HTTPCookieProcessor(jar))
manifest=json.loads((pathlib.Path(a.prepared)/'preview-manifest.json').read_text())
r={'origin':origin,'files':[],'routes':[],'public':not bool(headers or a.access),'passed':False}
def get(path,auth=True):
 try:res=(opener if auth else build_opener(NoRedirect)).open(Request(origin+path,headers=headers if auth else {}),timeout=30)
 except HTTPError as e:res=e
 with res:return res.status,dict(res.headers),res.read()
for name,digest in manifest['publicAssetsSha256'].items():
 code,h,data=get('/'+name);assert code==200,(name,code);assert hashlib.sha256(data).hexdigest()==digest,name
 mime=next((v for k,v in h.items() if k.lower()=='content-type'),'')
 if name.endswith('.js'):assert 'javascript' in mime
 if name.endswith('.css'):assert 'text/css' in mime
 if name.endswith('.wav'):assert 'audio/' in mime
 r['files'].append({'path':name,'status':code,'sha256':digest,'mime':mime,'bytes':len(data)})
for path in ['/', '/corsi/', '/corsi/strumenti-meccanica/', '/corsi/fluidi-termodinamica/', '/corsi/elettricita-magnetismo/', '/corsi/onde-ottica-radiazioni/', '/esperienza/?modello=molla','/esperienza/?modello=idrostatica','/esperienza/?modello=poiseuille']:
 code,h,data=get(path);lower={k.lower():v for k,v in h.items()};assert code==200
 assert "connect-src 'none'" in lower['content-security-policy'];assert "media-src 'self'" in lower['content-security-policy'];assert lower['x-content-type-options']=='nosniff';assert 'microphone=()' in lower['permissions-policy']
 r['routes'].append({'path':path,'status':code,'headers':{k:lower[k] for k in ['content-security-policy','x-content-type-options','permissions-policy','x-robots-tag','cache-control']}})
for path in ['/esempi/strumenti-meccanica/','/esempi/fluidi-termodinamica/','/esempi/elettricita-magnetismo/','/esempi/onde-ottica-radiazioni/','/study/me','/study/session','/studio/','/beta/','/esperienza/unknown-page']:
 code,h,data=get(path);assert code==404,(path,code);r['routes'].append({'path':path,'status':code})
code,_,_=get('/',False);r['anonymousRootStatus']=code;assert code==200 if not (headers or a.access) else code in [302,307,401,403]
r['audioRanges']=[]
for item in r['files']:
 if item['path'].endswith('.wav'):
  with opener.open(Request(origin+'/'+item['path'],headers={'Range':'bytes=0-43'}),timeout=30) as res:
   data=res.read();r['audioRanges'].append({'path':item['path'],'status':res.status,'bytes':len(data),'contentRange':res.headers.get('Content-Range')})
   assert res.status==206 and len(data)==44,'byte_range_unavailable'
r['passed']=True;pathlib.Path(a.out).write_text(json.dumps(r,indent=2)+'\n');print('PASS HTTPS bytes/MIME/routes/policy,',len(r['files']),'exact assets; anonymous',code)
