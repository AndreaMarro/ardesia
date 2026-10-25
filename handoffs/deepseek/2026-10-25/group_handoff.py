"""Group editorial data for A's canonical CoursePack adapter, not a runtime."""
import hashlib
import json
from build_content import ROOT,dump
from diagnostics import diagnostics_for
from test_editorial_separation import check_separation

FORMULAS={
 'strumenti-meccanica':[
  ('Componenti','Ax=A cosθ; Ay=A sinθ','θ da+x; assi ortogonali'),
  ('Cinematica','v=v0+at; x=x0+v0t+at²/2','accelerazione costante; segni coerenti'),
  ('Circolare','a_c=v²/r','r>0; accelerazione verso il centro'),
  ('Newton e Hooke','ΣF=ma; F_el=−kx','riferimento inerziale; regime elastico ideale'),
  ('Attrito','|F_s|≤μsN; |F_d|≈μdN','la disuguaglianza statica non è sempre uguaglianza'),
  ('Energia','K=mv²/2; Ug=mgh; Ue=kx²/2; P=W/Δt','zero potenziale dichiarato;Δt>0'),
  ('Impulso','p=mv; J=Δp','conservazione p totale solo con impulso esterno nullo'),
  ('Leve','τ=r×F; xCM=Σmixi/Σmi','momento su polo dichiarato; masse positive')],
 'fluidi-termodinamica':[
  ('Fluido','ρ=m/V; p=Fn/A','V,A>0; pressione assoluta distinta da differenziale'),
  ('Idrostatica','p=p0+ρgh; F_A=ρfluido gVimmerso','fluido fermo omogeneo;h profondità'),
  ('Continuità','ρAv=costante','moto stazionario senza diramazioni; incomprimibile→Av=costante'),
  ('Bernoulli','p+ρv²/2+ρgh=costante','lungo linea di corrente; ideale stazionario incomprimibile,senza pompe/perdite'),
  ('Poiseuille','Q=πr^4Δp/(8ηL); Rh=Δp/Q','tubo lungo cilindrico;laminare,newtoniano,rigido,no-slip'),
  ('Gas ideale','pV=nRT; R=8,31446261815324J/(mol K)','p assoluta>0,T inK>0; gas ideale in equilibrio'),
  ('Calore','Q=mcΔT; Qtransizione=mL','condizioni e fase dichiarate; gasCp eCv distinti'),
  ('Bilancio','ΔU=Q−W','Qentrante,Wfatto dal gas; non cambiare convenzione'),
  ('Carnot ed entropia','ηC=1−Tf/Tc; ΔS=∫δQrev/T','temperatureK;Carnot limite reversibile;ΔStot≥0 per universo isolato')],
 'elettricita-magnetismo':[
  ('Campo','F=ke|q1q2|/r²; E=F/qtest','r>0; campo vettoriale;segni per direzioni'),
  ('Potenziale','ΔU=qΔV; ΔK=−qΔV','seconda relazione solo se unico lavoro elettrico'),
  ('Resistori','V=RI; R=ρL/A; P=VI=I²R=V²/R','ohmico,stazionario;R>0;condizioni al contorno dichiarate'),
  ('Reti','Rserie=ΣR; 1/Rpar=Σ1/R','corrente comune in serie,tensione comune in parallelo'),
  ('Condensatori','C=Q/V; Cpiano=εA/d; U=CV²/2','bordo trascurato;Qfissa eVfissa distinti'),
  ('Magnetismo','F=q v×B; Ffilo=I L×B; r=mv/(|q|B)','circolare solo vperpendicolare aB e regime non relativistico'),
  ('Induzione','Φ=BAcosθ; εmedia=−NΔΦ/Δt','θ dalla normale;Lenz oppone variazione del flusso')],
 'onde-ottica-radiazioni':[
  ('Onda','v=λf; T=1/f; ω=2πf; y=A sin(kx−ωt+φ)','v,f>0;direzione+x;modello armonico uniforme'),
  ('Intensità','I=P/area; Iisotropa=P/(4πr²)','area>0;r>0;sorgente puntiforme isotropa senza assorbimento'),
  ('Decibel','β=10log10(I/I0)','I,I0>0;somma intensità incoerenti prima del logaritmo'),
  ('Fotone','E=hf; c=λf nel vuoto','h=6,62607015·10^-34J s;c=299792458m/s'),
  ('Assorbimento','I=I0exp(−μx)','μ≥0,x≥0;μx adimensionale;modello omogeneo monocromatico'),
  ('Decadimento','N=N0exp(−λt); attività=λN; T1/2=ln2/λ','λ>0;valori medi;Bq non è dose'),
  ('Ottica','n1sinθ1=n2sinθ2; 1/f=1/p+1/q; m=−q/p','angoli dalla normale;f>0,p>0;virtuale q<0;p=f degenere')]
}

def main():
    baseline=json.loads((ROOT/'baseline.json').read_text())
    items=json.loads((ROOT/'content/final-assessment-200.json').read_text())['items']
    groups=[];coverage=[]
    for path,formulas in FORMULAS.items():
        families=[f for f in baseline['families'] if f['pathId']==path]
        lessons=[json.loads((ROOT/'content'/f"{f['id']}.json").read_text()) for f in families]
        atomic=[x for x in items if x['courseId']==path]
        compact=[next(x for x in atomic if x['familyId']==f['id']) for f in families]
        diagnostics=diagnostics_for(path)
        groups.append({'pathId':path,'editorialStatus':'DRAFT','humanApproval':False,'courseComplete':False,
          'lessons':lessons,'finalAssessment':compact,'atomicFinalAssessment':atomic,'diagnostic':diagnostics,
          'formulaSheet':[{'name':n,'expression':e,'domain':d} for n,e,d in formulas],
          'recoveryTargets':[{'itemId':x['id'],'objectiveId':x['objectiveId'],'lessonId':'ds-2026-'+x['familyId'].lower(),'feedback':x['feedback']} for x in atomic],
          'limits':['All content is original AI-authored DRAFT, not human approved.','Final questions are editorial short-answer prompts; no second scoring engine.','Target mapping is present, but suitability, sufficiency, accessibility and remote consumer remain to verify at integrated SHA.']})
        for x in atomic:
            coverage.append({'objectiveId':x['objectiveId'],'courseId':path,'familyId':x['familyId'],'authored':True,
              'lessonFile':'content/'+x['familyId']+'.json','finalItemId':x['id'],
              'explanationSufficiency':'NEEDS_HUMAN_REVIEW','assessmentCorrectness':'AI_CHECKED; HUMAN_REVIEW_PENDING',
              'runtimeReachability':'NOT_VERIFIED','audio':'TRANSCRIPT_ONLY','persistReopen':'NOT_VERIFIED',
              'remoteProof':'NOT_RUN','approved':False,'complete':False})
    dump('content/coursepack-handoff.json',{'courses':groups,'runtime':'Existing canonical CoursePack/Core only; adapter owner Codex A.','publicationApproval':False})
    dump('coverage-200.json',{'sourceBaseSha':baseline['baseSha'],'objectiveCount':len(coverage),'familyCount':38,'authoredTargets':len(coverage),'completedTargets':0,
      'meaning':'authored counts traceable content and final prompts, not mastery, completeness, approval, or remote function.','objectives':coverage})
    # Verify mapping, distinct questions, gate flags and exact target denominator.
    want={t['id'] for f in baseline['families'] for t in f['subtargets']}
    assert {x['objectiveId'] for x in items}==want
    assert len(items)==len(want)==200
    assert len({x['prompt'] for x in items})==200
    source_prompts=set()
    for g in groups:
        for l in g['lessons']:
            source_prompts.update([l['workedExample']['prompt'],l['practice']['prompt'],l['transfer']['prompt']])
    assert not ({x['prompt'] for x in items}&source_prompts)
    for g in groups:
        assert not g['humanApproval'] and not g['courseComplete']
    check_separation(groups)
    dump('evidence/coverage-validation.json',{'status':'PASS','assertions':8,'families':38,'atomicItems':200,'uniqueFinalPrompts':200,
      'finalPromptEqualsWorkedPracticeTransfer':0,'compactFinalCount':sum(len(g['finalAssessment']) for g in groups),'humanApproval':False,'completedObjectives':0,
      'diagnosticCount':12,'diagnosticFinalOrShownNormalizedPromptCollisions':0,'diagnosticFinalIdCollisions':0,
      'limits':'Structural traceability and normalized text separation only, not comprehensive scientific or pedagogical validation.'})
    print('4 courses;38 families;200 targets/final prompts; compact final38; no completed target claim')

if __name__=='__main__':main()
