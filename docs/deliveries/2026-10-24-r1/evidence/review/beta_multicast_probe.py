from pathlib import Path
import sys,socket,json,ipaddress
from unittest.mock import patch
sys.path.insert(0,str(Path.cwd()/'services/study-api'))
from study_api.beta_probe import ProbeTarget,ProbeFailure,public_addresses
rows=[]
for address in ['224.0.0.1','239.255.255.250','ff02::1','ff05::1','93.184.216.34']:
 a=ipaddress.ip_address(address);origin='https://'+('['+address+']'if':'in address else address);target={'schema':'ardesia.beta-readiness-target.v1','origin':origin,'expectedCommit':'6f19b1956cedbebf36a5cf097af66e47ed8acecd'}
 try:ProbeTarget.parse(target,[origin]);accepted=True
 except ProbeFailure:accepted=False
 family=socket.AF_INET6 if':'in address else socket.AF_INET
 with patch('socket.getaddrinfo',return_value=[(family,socket.SOCK_STREAM,6,'',(address,443))]):
  try:dest=public_addresses('approved.example.org');dns_accepted=True
  except ProbeFailure:dest=();dns_accepted=False
 rows.append({'address':address,'is_global':a.is_global,'is_multicast':a.is_multicast,'originAccepted':accepted,'approvedNameDNSAccepted':dns_accepted,'destinations':dest})
p=Path(__file__).resolve().parent/'beta-multicast-probe.json';p.write_text(json.dumps({'python':sys.version,'networkCalls':0,'cases':rows},indent=2)+'\n');print(json.dumps(rows,indent=2))
