from pathlib import Path
from fractions import Fraction as F
import json,hashlib,xml.etree.ElementTree as ET,re
R=Path('/private/tmp/cric-author-b-resident/officina-di-fisica/editorial/reviews');p=R/'C4-two-fallback-1209-independent-b-20261127';o=R/'C4-five-unowned-7c-independent-b-20261127';J=lambda f:json.loads(f.read_text());H=lambda b:hashlib.sha256(b).hexdigest();a=J(p/'case-index.json');old={r['caseKey']:r for r in J(o/'verified-case-index.json')['records']};facts=[];count=0
for r in a['records']:
 c=J(p/r['caseFile']);assert H((p/r['caseFile']).read_bytes())==r['caseSha256'];assert c['sourceCommit']=='e7d8f7f19daef2567add741aeef4c80981600502';assert c['runtimeSha256']=='1209e136416cbed644b0c8731ca18a979c68cdfeddc385d45932e371d81b19be';assert c['protocolSha256']=='719beb3abc01cbf7607dc1d5d1710732cbc59c2aae91112fb6b680dbfbd22d15'
 for s in r['screenshots']:assert H((p/s['file']).read_bytes())==s['sha256']
 if r['model']:
  x=F(str(r['model']['x']));expected=F(90)/(x*x)if r['id'].endswith('01')else F(45,2)*(1-x);assert abs(float(expected)-r['model']['y'])<1e-12;count+=1
 if r['selected']and r['profile']['fallback']:
  oc=J(o/old[r['caseKey']]['caseFile']);svg=ET.fromstring(c['svg']);oo=ET.fromstring(oc['svg']);ns='{http://www.w3.org/2000/svg}'
  # serialized strings here are namespace-free
  paths=[e for e in svg.iter()if e.tag.endswith('path')];polys=[e for e in svg.iter()if e.tag.endswith('polygon')]
  fact={'caseKey':r['caseKey'],'svgUnchangedFrom7c':c['svg']==oc['svg'],'newSvgSha256':H(c['svg'].encode()),'oldSvgSha256':H(oc['svg'].encode())}
  if r['id'].endswith('01')and r['model']['x']==3:
   po=polys[0];xy=[float(v)for v in re.findall(r'[-\d.]+',po.attrib['points'])];half=abs(xy[3]-xy[5])/2;stroke=float(paths[0].attrib['stroke-width']);fact.update({'primaryHeadHalfWidth':half,'shaftHalfWidth':stroke/2,'headEntirelyWithinShaft':half<=stroke/2,'svgUnchangedFrom7c':c['svg']==oc['svg']});assert half<stroke/2 and fact['svgUnchangedFrom7c']
  if r['id'].endswith('01')and r['model']['x']==8:
   xy=[float(v)for v in re.findall(r'[-\d.]+',polys[-1].attrib['points'])];fact['detailHeadHalfWidth']=abs(xy[3]-xy[5])/2;assert fact['detailHeadHalfWidth']==4.5
  if r['id'].endswith('02')and r['model']['x']==-3:
   xy=[float(v)for v in re.findall(r'[-\d.]+',polys[-1].attrib['points'])];circles=[e for e in svg.iter()if e.tag.endswith('circle')];circle=circles[1];dist=(xy[0]-float(circle.attrib['cx']))**2+(xy[1]-float(circle.attrib['cy']))**2;fact.update({'tipDistanceSquaredFromRightCircle':dist,'rightRadiusSquared':float(circle.attrib['r'])**2,'tipOutsideRightCircle':dist>float(circle.attrib['r'])**2});assert fact['tipOutsideRightCircle']
  if r['id'].endswith('02')and r['model']['x']==1:assert not paths and not polys;fact['fieldArrowAbsentAtCancellation']=True
  facts.append(fact)
(p/'geometry-comparison.json').write_text(json.dumps({'caseHashesVerified':len(a['records']),'scalarComparisons':count,'facts':facts,'scope':'Geometry corroborates actual raster reading, not an independent visibility certificate.'},indent=2)+'\n');print('verified',len(a['records']),count,'comparisons',len(facts))
