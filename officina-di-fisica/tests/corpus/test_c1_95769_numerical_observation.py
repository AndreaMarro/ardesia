from pathlib import Path
import unittest,subprocess,json
APP=Path(__file__).resolve().parents[2];B=APP/'editorial/reviews/c1-five-closures-95769-renewal-20261126'
class NumericalObservation(unittest.TestCase):
 def test_real_acquired_adjacent_engine_witness_and_default_deny(self):
  code="""import assert from'node:assert/strict';import{valueWitness,assertValue}from'MODULE';const a=11.471528727020923,e=11.471528727020921;const w=valueWitness(a,e,'SIM-C1-L005-05',55);assertValue(w);assert.deepEqual(w.range,[e,a]);for(const [v,id,x]of[[11.471528727020925,'SIM-C1-L005-05',55],[a,'SIM-C1-L005-05',50],[a,'SIM-C1-L007-01',55]])assert.throws(()=>assertValue(valueWitness(v,e,id,x)));for(const v of[NaN,Infinity,-Infinity])assert.throws(()=>valueWitness(v,e,'SIM-C1-L005-05',55));assertValue(valueWitness(0,0,'SIM-C1-L004-02',0));assert.throws(()=>assertValue(valueWitness(7.347880794884119e-16,0,'SIM-C1-L007-01',90)));console.log(JSON.stringify(w));""".replace('MODULE',(B/'numerical-observation.mjs').as_uri())
  r=subprocess.run(['node','--input-type=module','-e',code],capture_output=True,text=True,timeout=15);self.assertEqual(r.returncode,0,r.stderr)
if __name__=='__main__':unittest.main()
