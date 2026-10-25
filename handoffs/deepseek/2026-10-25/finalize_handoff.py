"""Create portable receipts and a reviewable prose companion, without deployment."""
import hashlib
import json
import subprocess
from datetime import datetime,timezone
from pathlib import Path
from build_content import ROOT,dump

def main():
    baseline=json.loads((ROOT/'baseline.json').read_text())
    report=json.loads((ROOT/'evidence/science-verification-A.json').read_text())
    stamp=datetime.now(timezone.utc).isoformat()
    source={'retrievedAt':stamp,'year':'2026/27','murUrl':'https://www.mur.gov.it/sites/default/files/2026-06/Syllabus_FISICA_%20finale%202026.pdf','murStatus':'HTTP403',
      'mirrorPage':'https://medicina.unicz.it/insegnamento/485/39599','mirrorLinkLabel':'Syllabus_FISICA_ finale 2026.pdf',
      'mirrorUrl':'https://medicina.unicz.it/private/uploaded/temp/syllabus/5832da235ca08d88b763b61d183f60b8.pdf',
      'pdfBytes':(ROOT/'sources/syllabus-unicz-2026.pdf').stat().st_size,'pdfSha256':hashlib.sha256((ROOT/'sources/syllabus-unicz-2026.pdf').read_bytes()).hexdigest(),
      'crosscheck':baseline['source']['crosscheck'],'MURByteEquality':'NOT_VERIFIED','sourcePageObserved':'Primary university page links exact filename with2026 label; ordinary curl downloaded PDF.'}
    dump('sources/provenance.json',source)
    findings=[
      {'id':'DS-01','severity':'P2','finding':'Rounded R in proposed consumer differed from precise CoreR','reportedBy':'CodexA','status':'FIXED_SOURCE_AND_NUMERICALLY_RETESTED','sourceCommit':'e623651f','proof':'evidence/science-verification-A.json','remaining':'Integrated UI and release gate belong toA.'},
      {'id':'DS-02','severity':'P2','finding':'Wave phase residual at exactly1e6periods','reportedBy':'CodexB','status':'B_FIX_RETESTED_ON_ACTUAL_SOURCES','upstreamCommit':'55dcc3d689db342c11c28c083d939f4d6ad7b413','proof':'wave/million_periods_zero and quarter_phase in science-verification-A.json'},
      {'id':'DS-03','severity':'P2','finding':'Six practice/transfer prompts depended on a closed worked example','reportedBy':'CodexB','status':'FIXED_SOURCE_PENDING_INTEGRATED_CONSUMER_VERIFICATION','sourceCommit':'2b0f5850c3aee56caac4798ffd65f3ba1493405c','families':['U1-03','U5-03','U6-04','U6-05','U7-04','U7-07']},
      {'id':'DS-04','severity':'P2','finding':'Stationary flow wording did not distinguish instantaneous vs statistical','reportedBy':'DeepSeek','status':'FIXED_SOURCE_PENDING_IMPORT','item':'final-U3-03.02'},
      {'id':'DS-05','severity':'P2','finding':'Kinematics model consumer renderer absent during intermediateAworktree read','reportedBy':'DeepSeek','status':'PENDING_OWNER_WIRING_VERIFICATION','owner':'CodexA/B','remaining':'Do not treat an intermediate missing branch as a verified final defect.'},
      {'id':'DS-06','severity':'P1','finding':'Full200targetreleaseacceptance absent','reportedBy':'Sharedscope','status':'OPEN','remaining':'Human editorial review, full consumer reachability, per-target assessment suitability, persistence/reopen and remote proof.'},
      {'id':'DS-07','severity':'P2','finding':'Goodnotes6 requested; installed bundle7.1.30 observed','reportedBy':'DeepSeek','status':'OBSERVED_VERSION_LIMIT','remaining':'Active app mode and actual30local flows remain not observed.'},
      {'id':'DS-08','severity':'P1','finding':'Initial diagnostics reused the first final prompts,leaking the proposed final assessment','reportedBy':'CodexA','status':'FIXED_SOURCE_PENDING_OWNER_IMPORT_AND_CONSUMER_VERIFICATION','fix':'Twelve original diagnostic prompts/ids/data,three per course,distinct from200final items and114shown lesson prompts.','proof':'evidence/diagnostic-separation-red.log then green.log;5tests include final-copy and punctuation-disguise negatives.','remaining':'Text normalization detects duplicates,not all semantic teaching leakage; human suitability review remains pending.'},
      {'id':'DS-09','severity':'P2','finding':'Four final items needed tighter target alignment or atomic wording','reportedBy':'CodexB','status':'FIXED_SOURCE_PENDING_OWNER_IMPORT','items':['final-U1-01.03','final-U1-03.02','final-U4-01.03','final-U7-02.07'],'fix':'Explicit logarithmic power-of-ten convention; self-contained3-4-5triangle; minimum positive repetition interval; gamma spectral comparison/origin rather than duplicated nuclear bookkeeping.','explanationsUpdated':['U1-01','U7-02'],'remaining':'Human suitability review and integrated review data to verify.'}
    ]
    dump('findings.json',{'updatedAt':stamp,'findings':findings,'humanApproval':False})
    head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    dump('evidence/handoff-receipt.json',{'generatedAt':stamp,'role':'DeepSeek','branch':'codex/deepseek-content-20261025','baseSha':baseline['baseSha'],'lastCommittedContentSha':head,
      'scope':'handoffs/deepseek only','familiesAuthored':38,'targetsMapped':200,'finalPrompts':200,'completedObjectives':0,'humanApproval':False,
      'scienceChecks':report['count'],'scienceStatus':report['status'],'sourceHashes':report['engineSourceHashes'],
      'newDeploymentExecuted':False,'newPRCreated':False,'mergeExecuted':False,'remoteNewIncrementProof':'NOT_RUN','integrationOwner':'CodexA','coordination':'Explicit messages sent to existing CodexA and CodexB chats.'})
    lines=['# Fisica Ardesia - contenuti originali DRAFT','',
      'Documento di revisione, non un secondo prodotto o motore didattico. Tutti i contenuti sono proposte originali AI_CHECKED con approvazione umana assente.38famiglie e200sotto-obiettivi sono una mappa editoriale del syllabus universitario verificato: nessuna certificazione di corso completo.',
      '','Le risposte di verifica sono nel pacchettoJSON; nel prodotto l’adattamento usa i contrattiCore esistenti.','']
    groups=json.loads((ROOT/'content/coursepack-handoff.json').read_text())['courses']
    for g in groups:
        lines += ['# '+g['pathId'],'',f"Famiglie: {len(g['lessons'])}; sotto-obiettivi con domanda finale: {len(g['atomicFinalAssessment'])}; stato DRAFT.",'']
        for l in g['lessons']:
            lines += ['## '+l['familyId']+' - '+l['title'],'',l['explanation'],'','**Esempio svolto.** '+l['workedExample']['prompt'],'']
            lines += [str(i)+'. '+x for i,x in enumerate(l['workedExample']['steps'],1)]
            lines += ['', '**Risultato:** '+l['workedExample']['result'],'','**Prova autonoma:** '+l['practice']['prompt'],'','**Risposta e feedback:** '+l['practice']['answer']+' '+l['practice']['feedback'],'','**Trasferimento:** '+l['transfer']['prompt'],'','**Risposta e feedback:** '+l['transfer']['answer']+' '+l['transfer']['feedback'],'','**Errori tipici:** '+'; '.join(l['commonErrors']),'','**Aiuti progressivi:** '+' / '.join(l['hintLadder']),'','**Ripasso:** '+l['recap'],'']
        lines += ['## Verifica finale per ogni sotto-obiettivo','']
        for item in g['atomicFinalAssessment']:
            lines += ['**'+item['objectiveId']+'** '+item['prompt'],'','Risposta proposta: '+item['answer'],'']
    (ROOT/'CONTENUTI-FISICA-DRAFT.md').write_text('\n'.join(lines)+'\n')
    manifest=[]
    for p in sorted(ROOT.rglob('*')):
        if p.is_file() and '__pycache__' not in p.parts and p.name!='manifest.sha256':
            manifest.append(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+p.relative_to(ROOT).as_posix())
    (ROOT/'manifest.sha256').write_text('\n'.join(manifest)+'\n')
    print('Receipt,provenance,findings,prosecompanion and',len(manifest),'file digests written')

if __name__=='__main__':main()
