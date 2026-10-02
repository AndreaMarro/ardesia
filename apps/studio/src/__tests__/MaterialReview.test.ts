import { describe, expect, it } from "vitest"
import { createEventEnvelopeV2 } from "../core/contracts/eventEnvelope"
import { assertLessonOsEnvelopePayload } from "../lessonos/eventlog"
import { recapRevisionSha256, recapReviewStatus } from "../lessonos/materialReview"

const sha = "a".repeat(64)
const producer = {id:"test.material",version:"1.0.0",commitSha:"b".repeat(40)}
const event = (lessonId:string, action:string, revisionSha256:string, index:number, reviewer="docente-test") =>
  createEventEnvelopeV2({lessonId,sessionId:"11111111-1111-4111-8111-111111111111",
    kind:"material.reviewed",actor:{type:"teacher" as const,id:reviewer},producer,
    causationId:null,idempotencyKey:null,evidence:[{ref:`material:recap:${lessonId}`,resolution:"verified" as const}],
    payload:{materialId:`recap:${lessonId}`,revisionSha256,action,reviewer,comment:"",labels:{it:"Revisione docente"}},
  },{eventId:()=>`70000000-0000-4000-8000-${String(index).padStart(12,"0")}`,
    now:()=>new Date(1000)})

describe("revisione del recap Ardesia", () => {
  it("usa lo stesso SHA-256 dei byte e del nome file del contratto Engine", async () => {
    expect(await recapRevisionSha256("<p>R=10</p>")).toBe(
      "201867aef96bdd299603b5649522e924b5912ad75611c4ae6bf24653e320e129")
    expect(await recapRevisionSha256("<p>R=11</p>")).not.toBe(
      "201867aef96bdd299603b5649522e924b5912ad75611c4ae6bf24653e320e129")
  })

  it("una vecchia approvazione non approva contenuto o lezione diversi", () => {
    const approved = event("lesson-a","approve",sha,1)
    expect(recapReviewStatus([approved],"lesson-a",sha)).toEqual(
      expect.objectContaining({approved:true,reviewer:"docente-test"}))
    expect(recapReviewStatus([approved],"lesson-a","c".repeat(64)).approved).toBe(false)
    expect(recapReviewStatus([approved],"lesson-b",sha).approved).toBe(false)
    expect(recapReviewStatus([approved,event("lesson-a","revise",sha,2)],"lesson-a",sha).approved).toBe(false)
    expect(recapReviewStatus([approved,event("lesson-a","flag",sha,3)],"lesson-a",sha).approved).toBe(true)
    expect(recapReviewStatus([approved,event("lesson-a","flag",sha,3)],"lesson-a",sha).flagged).toBe(true)
    expect(recapReviewStatus([approved,event("lesson-a","flag",sha,3)],"lesson-a","c".repeat(64)).flagged).toBe(false)
    expect(recapReviewStatus([{...approved,actor:{type:"teacher",id:"altro"}}],"lesson-a",sha).approved).toBe(false)
    expect(recapReviewStatus([{...approved,evidence:[{ref:"material:recap:lesson-a",resolution:"missing"}]}],
      "lesson-a",sha).approved).toBe(false)
  })

  it("rifiuta review anonime, digest malformati e azioni non registrabili", () => {
    const base = {materialId:"recap:lesson-a",revisionSha256:sha,
      action:"approve",reviewer:"docente-test",comment:"",labels:{it:"Revisione docente"}}
    expect(() => assertLessonOsEnvelopePayload("material.reviewed",{...base,revisionSha256:"bad"}))
      .toThrow(/revisione materiale/)
    expect(() => assertLessonOsEnvelopePayload("material.reviewed",{...base,reviewer:""}))
      .toThrow(/revisione materiale/)
    expect(() => assertLessonOsEnvelopePayload("material.reviewed",{...base,action:"auto"}))
      .toThrow(/revisione materiale/)
  })
})
