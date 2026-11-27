from independent_math import SPECS,value,inverse,exact
import json
rows=[]
for ident,(lo,hi,step,points,answers,unit)in SPECS.items():
 lo,hi,step=map(exact,(lo,hi,step));states=[]
 for i in range(int((hi-lo)/step)+1):
  x=lo+i*step;y=value(ident,x,True);states.append({'x':str(x),'exactY':str(y)})
 for x,y in zip(points,answers):assert value(ident,x,True)==exact(y);assert inverse(ident,y)==exact(x)
 rows.append({'id':ident,'unit':unit,'manual':list(zip(points,answers)),'states':states})
assert sum(len(r['states'])for r in rows)==72
print(json.dumps({'phase':'SOURCE_ONLY_PREKEY','consumerImports':[],'records':5,'gridStates':72,'manualTasks':10,'results':rows},indent=2))
