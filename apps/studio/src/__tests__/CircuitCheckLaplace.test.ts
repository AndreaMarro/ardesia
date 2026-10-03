import {describe,expect,it} from 'vitest'
import {readCircuitProof,readCircuitState,circuitConventionsLabel} from '../toolhost/circuitCheckAdapter'
import {circuitProofSha256,circuitProofEvent} from '../lessonos/circuitCheckEvent'
import rc from './fixtures/circuitcheck-laplace-rc-response.json'
import rl from './fixtures/circuitcheck-laplace-rl-response.json'

describe('Laplace: real served payloads and portable evidence',()=>{
 for(const wire of [rc,rl])it(`preserves ${wire.title} through JSON restore`,async()=>{
  const proof=readCircuitProof(wire,wire.netlist)
  expect(proof.scope).toBe('laplace_algebra_crosschecked')
  expect(proof.answer.laplace_transform).toEqual(wire.answer.laplace_transform)
  expect(proof.answer.math).toEqual(wire.answer.math)
  expect(proof.laplaceInputs).toEqual(wire.laplace_inputs)
  expect(proof.laplaceOutput).toEqual(wire.laplace_output)
  expect(circuitConventionsLabel(proof)).toContain('stato iniziale')
  const state={kind:'circuitcheck-proof-v1',netlist:wire.netlist,method:'auto',proof,selectedStep:1,selectedFocus:null,trace:[],diagnosis:null}
  expect(readCircuitState(JSON.parse(JSON.stringify(state))).proof).toEqual(proof)
  const event=await circuitProofEvent(proof,'circuit-reasoning',123)
  expect(event).toMatchObject({verificationScope:'laplace_algebra_crosschecked',proofSha256:await circuitProofSha256(proof)})
  expect(await circuitProofSha256({...proof,laplaceOutput:{time_domain_evaluated:false,contains_impulse_terms:true,polynomial_part_degree:0}})).not.toBe(await circuitProofSha256(proof))
 })
 it('rejects changed answer, reference, units, state, source waveform and assurance',()=>{
  const variants=[
   {...rc,answer:{...rc.answer,quantity:'current'}},
   {...rc,answer:{...rc.answer,unit:'V'}},
   {...rc,answer:{...rc.answer,reference:'0 → a'}},
   {...rc,answer:{...rc.answer,laplace_transform:{...rc.answer.laplace_transform,numerator:['16','4']}}},
   {...rc,answer:{...rc.answer,math:{kind:'number',coefficients:['4','0','0','0']}}},
   {...rc,laplace_inputs:{...rc.laplace_inputs,capacitor_voltages:[]}},
   {...rc,laplace_inputs:{...rc.laplace_inputs,capacitor_voltages:[{component:'C1',exact:'-4',unit:'V'}]}},
   {...rc,laplace_inputs:{...rc.laplace_inputs,sources:[{...rc.laplace_inputs.sources[0],waveform:'impulse'}]}},
   {...rc,verification:{...rc.verification,product_verified:true}},
   {...rc,verification:{...rc.verification,electrical_claim:'VERIFIED'}},
   {...rc,verification:{...rc.verification,checks:rc.verification.checks.slice(1)}},
   {...rc,conventions:{...rc.conventions,amplitude:'rms'}},
   {...rc,laplace_output:undefined},
   {...rc,laplace_output:{...rc.laplace_output,time_domain_evaluated:true}},
   {...rc,laplace_output:{...rc.laplace_output,contains_impulse_terms:true,polynomial_part_degree:0}},
  ]
  for(const variant of variants)expect(()=>readCircuitProof(variant,rc.netlist)).toThrow()
 })
})
