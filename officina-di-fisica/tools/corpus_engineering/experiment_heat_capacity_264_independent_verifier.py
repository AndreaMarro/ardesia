"""Independent content/math only; no UI, activity credit or publication."""
from fractions import Fraction
from pathlib import Path
import hashlib,json

KEY='SIM-C3-L03-02'
REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_SHA='c8f54de1efba88f0cb8bc8901a2650925c1b34786fa809c60469b5f072237eb2'
REVIEWED_CANDIDATE='54e65f2095ff5dc179514e0443e1db9d6819b9e087e0522494b91fddfc7dc01e'
PROBE_CANONICAL='7eeee68d1076b26a087c1c9054310b2114151ec71627da9afaeed86dca6a537d'
PRIMARY_SHA='c87e8e0db9b84ae2fe58cd1bf0bb81185806521b3e8953aff63d7dd6dc7cbcf2'

def _encoded(x):return json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False).encode()
def _digest(x):return hashlib.sha256(_encoded(x)).hexdigest()
def _positive_exact(value):
 if type(value)not in(int,Fraction)or value<=0:raise ValueError('A finite exact positive rational is required')
 return Fraction(value)
def capacity(mass):return Fraction(2,5)*_positive_exact(mass)
def inverse_capacity(value):return Fraction(5,2)*_positive_exact(value)

def report(sources,package,bindings,probe):
 if type(package)is not dict or set(package)!={'schema','records','assets'}or package['schema']!='astra/1' or package['assets']!=[]:raise ValueError('Expected the exact asset-free experiment package')
 if type(package['records'])is not list or len(package['records'])!=1 or type(bindings)is not list or len(bindings)!=1:raise ValueError('Exactly one experiment and binding required')
 row=package['records'][0];binding=bindings[0];source=sources.get(KEY)
 if not isinstance(source,dict)or _digest(source)!=SOURCE_SHA:raise ValueError('The frozen original source differs')
 if row.get('id')!=KEY or _digest(row)!=REVIEWED_CANDIDATE:raise ValueError('Candidate differs from individually read edition')
 if set(binding)!={'id','sourceId','sourceRef','sourceSha256','candidateSha256','assetChecksums'}or binding['id']!=KEY or binding['sourceId']!=KEY or binding['sourceRef']!=REF or binding['sourceSha256']!=SOURCE_SHA or binding['candidateSha256']!=_digest(row)or binding['assetChecksums']!={}:raise ValueError('Original/candidate identity or asset binding changed')
 if type(row.get('baseVersion'))is not int or row['baseVersion']!=1 or type(row.get('version'))is not int or row['version']!=2:raise ValueError('Expected additive version2/base1')
 allowed={'blocks','interpretation','anchor','review','version','baseVersion'}
 if _encoded({k:v for k,v in row.items()if k not in allowed})!=_encoded({k:v for k,v in source.items()if k not in allowed}):raise ValueError('Immutable physical or source metadata changed')
 explanation=row.get('interpretation','')
 if '5/2'not in explanation or '40 J con 100 g'not in explanation or '100 J con 250 g'not in explanation or 'raddoppia'in explanation:raise ValueError('The actual 5/2 comparison is not explained correctly')
 if row.get('kind')!='experiment' or row.get('measure',{}).get('unit')!='J/K' or row.get('control',{}).get('unit')!='g':raise ValueError('Heat capacity and mass units changed')
 if _digest(probe)!=PROBE_CANONICAL or probe.get('id')!=KEY or probe.get('packageSha256')!='b390aff5fa543893d606be517f069267d6c2ccc32be8e3b9cef7621185c9d5cb' or probe.get('UI')!='NOT_RUN':raise ValueError('Actual-code observation differs')
 grid=probe.get('grid',[])
 if len(grid)!=11:raise ValueError('Actual installed grid incomplete')
 for mass,case in zip(range(50,301,25),grid):
  if type(case.get('x'))is not int or case['x']!=mass or type(case.get('solve',{}).get('y'))not in(int,float)or Fraction(str(case['solve']['y']))!=capacity(mass):raise ValueError('Actual engine differs from independent exact C=2m/5')
 tasks=probe.get('assessment',[])
 if len(tasks)!=2:raise ValueError('Actual assigned controls incomplete')
 for task,mass in zip(tasks,(250,175)):
  if type(task.get('value'))not in(int,float)or Fraction(str(task['value']))!=capacity(mass)or task.get('unit')!='J/K' or f'{mass} g'not in task.get('prompt',''):raise ValueError('Actual assigned task differs in value/unit/input')
 if probe.get('prediction',{}).get('correct')!=2 or type(probe['prediction']['correct'])is not int or probe.get('steps',[[]])[0][1]!=explanation:raise ValueError('Actual guidance differs from read physical interpretation')
 checks=[{'mass_g':str(m),'capacity_J_per_K':str(capacity(m))}for m in (100,250,175)]
 signature=_digest({'record':row,'assets':{},'source':{'id':KEY,'ref':REF,'sha256':SOURCE_SHA}})
 original={'sourceSha256':SOURCE_SHA,'ok':False,'mathematicalLawCorrect':True,'pedagogicalReview':'FAIL_UNQUALIFIED_DOUBLING_CLAIM_FOR_100_TO_250_G','actualCapacityRatio':'5/2','originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
 record={'id':KEY,'sourceRef':REF,'sourceSha256':SOURCE_SHA,'sourceVersion':1,'candidateSha256':_digest(row),'candidateVersion':2,'baseVersion':1,'reviewedSignature':signature,'assetChecksums':{},'verificationMode':'EXACT_ORACLE','candidateTextMathManualReview':{'ok':True,'checks':checks,'ratio':'5/2','inverseMass_g':str(inverse_capacity(70)),'heatFor250gAnd1K_J':'100','actualTasks':[{'mass_g':str(m),'capacity_J_per_K':str(capacity(m)),'finiteNumericInput':str(capacity(m))}for m in (250,175)],'units':'c=2/5 J/(g K); C=mc in J/K; C/c in g; C deltaT in J','physicalAssumptions':'Same material; assigned c constant in the small interval; Q denotes heat absorbed by sample; no inference about heater loss or unchanged specific heat from doubled sample mass.','pedagogy':'The first250g and transfer175g questions, integer division by5 and multiplication by2, inverse and actual5/2 ratio were read individually. The retained summary is an interrogative, not a claim that specific heat doubles.'},'publishedEditionReview':original,'independentPrimarySha256':PRIMARY_SHA,'actualCodeProbeCanonicalSha256':PROBE_CANONICAL,'newProductUiReview':'NOT_RUN','candidateState':'DRAFT','overallAcceptance':'NOT_GRANTED_PENDING_CURRENT_ACTIVITY_UI','ok':False,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
 return {'schemaVersion':'1.0.0','phase':'DRAFT264_TEXT_MATH_MANUAL_REVIEW_NOT_ACTIVITY_ACCEPTANCE','verifierSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'records':[record],'candidateTextMathManualPassCount':1,'overallAcceptanceGranted':False,'newUiCases':0,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
