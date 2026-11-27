from pathlib import Path
import runpy,json,xml.etree.ElementTree as ET
D=Path(__file__).resolve().parent
m=runpy.run_path(str(D/'test_composed_focus.py'));rows=[]
colors={'SIM-C1-L006-03':'#147979','SIM-C1-L007-02':'#7350b0','SIM-C4-L01-02':'#7350b0','SIM-C5-L07-03':'#147979'}
for c in m['cases']():
 if not c['profile']['fallback']or c['id']not in colors:continue
 root=ET.fromstring(c['observed']['svg']);vb=list(map(float,root.attrib['viewBox'].split()));assert vb[2]==460
 scale=c['observed']['canvas']['width']/vb[2]
 ps=m['svgheads'](c['observed']['svg'],colors[c['id']]);ds=m['svgheads'](c['observed']['svg'],'#d49332')
 rows.append({'key':c['key'],'id':c['id'],'width':c['width'],'effectiveX':c['observed']['sourceReplayedX'],'intrinsicToCssScale':scale,'primaryHeads':[{**p,'axisCss':p['axisLength']*scale,'positiveHeadExtensionPerSideCss':(p['headHalfWidth']-1.35)*scale}for p in ps],'detailHeads':[{**p,'axisCss':p['axisLength']*scale,'positiveHeadExtensionPerSideCss':(p['headHalfWidth']-1.35)*scale}for p in ds],'imageSha256':c['imageSha256']})
(D/'actual-fallback-head-margins.json').write_text(json.dumps(rows,indent=2)+'\n')
print(json.dumps([r for r in rows if r['width']==320 and ((r['id']in['SIM-C1-L006-03','SIM-C4-L01-02']and r['effectiveX']==2)or(r['id']=='SIM-C1-L007-02'and r['effectiveX']==1))],indent=2))
