"""Sixteen actual Snell DRAFT states plus eight setup/access checks."""
from pathlib import Path
import sys
APP=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(APP))
from tools.corpus_engineering import experiment_visibility_request as v
BASE=Path(__file__).resolve().parent

def main():
    parent=Path(sys.argv[1]);output=Path(sys.argv[2]);output.mkdir(exist_ok=False)
    request,request_sha=v.validate(BASE/'request.json');plan=v.load(parent)
    assert plan['sourceCommit']==request['candidateRef']=='64aef05bef5ca7ebff8491060762dd4cac0cbb34'
    assert plan['runtimeFingerprint']['sha256']==request['runtimeSha256']
    row=next(r for r in plan['records']if r['id']=='SIM-C5-L09-02'and r['variant']=='draft')
    grid=row['grid'];values=row['expectedValues'];row['grid']=[30,45];row['expectedValues']=[values[grid.index(x)]for x in row['grid']];row['clockCases']=[];row['auxiliaryCases']=[]
    plan.update({'records':[row],'scope':'INDEPENDENT_SNELL_16_GRID_PLUS8_SETUP_NOT_FULL139_ACCEPTANCE','parentPreparedSha256':v.sha(parent.read_bytes()),'requestSha256':request_sha,'course':'SNELL_CORRECTION','expectedOriginalGridInputs':0,'expectedDraftGridInputs':2,'expectedClockInteractions':0})
    keys=[]
    for p in plan['profiles']:
        stem='|'.join((row['id'],row['variant'],str(p['width']),p['view']));keys +=[stem+'|setup',stem+'|grid|0',stem+'|grid|1']
    assert len(keys)==24 and len(set(keys))==24;plan['expectedCaseKeys']=keys
    (output/'prepared.json').write_bytes(v.canonical(plan)+b'\n');app=Path(plan['packageFiles'][0]).parents[2]
    info={'candidateApp':str(app),'prepared':str(output/'prepared.json'),'output':str(output),'course':'SNELL_CORRECTION','requestSha256':request_sha,'scope':plan['scope']};(output/'prepared-info.json').write_bytes(v.canonical(info)+b'\n');v.run_prepared(output/'prepared-info.json')

if __name__=='__main__':main()
