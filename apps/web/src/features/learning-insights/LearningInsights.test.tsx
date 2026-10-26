// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { LearningInsights } from "./LearningInsights";
import type { InsightData } from "./contracts";
import { activateStudySession, beginStudySessionCheck, endStudySession, studySessionEpoch } from "../../../../studio/src/study/sessionBoundary";

const data: InsightData = {schemaVersion:1, editionId:"fluidi", role:"student", attempts:[{
  receiptId:"receipt-1", activityId:"poiseuille-v1", studentId:"student-01", parentId:null, receivedAt:1000,
  modelVersion:1, packRef:{packId:"fluids",packVersion:1,packSha256:"abc"},sourceRefs:[{resourceId:"source-1",revisionId:"rev-1"}],
  sourceState:"CURRENT",supportUsed:["constraint-hint"],assistance:"SUPPORT_REQUESTED",outcome:"MISMATCH",provenance:"CANONICAL_RECEIPT"
}],suggestions:[],comparisons:[],recoveries:[],cohortSuppressed:false,summary:{attempts:1,checked:1,matched:0,assisted:1,observedCategories:{}},optionalEvents:[],
preferences:{enabled:false,consentId:null,noticeVersion:null,notice:{version:"notice-v1",purpose:"Uso facoltativo",retentionDays:30},essentialStudyAvailable:true}, limits:["Non certifica apprendimento."]};

afterEach(()=>{cleanup();vi.unstubAllGlobals();window.history.replaceState(null,"","/");});
function serve(value: InsightData = data) {vi.stubGlobal("fetch", vi.fn(async()=>new Response(JSON.stringify(value),{status:200})));}

it("shows receipt evidence and declared help without turning mismatch into a diagnosis",async()=>{
  serve();render(<LearningInsights me={{id:"student-01",role:"student"}} editionId="fluidi"/>);
  await screen.findByRole("heading",{name:"poiseuille-v1"});
  expect(within(screen.getByRole("heading",{name:"poiseuille-v1"}).closest("article")!).getByText("Aiuto richiesto")).toBeTruthy();
  expect(screen.getByText("Da confrontare con il modello")).toBeTruthy();
  fireEvent.click(screen.getByText("Mostra evidenza"));
  expect(screen.getByText(/receipt-1/)).toBeTruthy();
  expect(screen.getByText(/source-1/)).toBeTruthy();
});

it("withdraws optional analytics while preserving the essential receipt view",async()=>{
  serve({...data,preferences:{...data.preferences,enabled:true}});
  render(<LearningInsights me={{id:"student-01",role:"student"}} editionId="fluidi"/>);
  const box=await screen.findByRole("checkbox");fireEvent.click(box);
  await waitFor(()=>expect(vi.mocked(fetch).mock.calls.some(([,opts])=>opts?.method==="PUT")).toBe(true));
  expect(screen.getByRole("heading",{name:"poiseuille-v1"})).toBeTruthy();
});

it("removes old identity evidence while the next scope loads or fails",async()=>{
  serve();const view=render(<LearningInsights me={{id:"student-01",role:"student"}} editionId="fluidi"/>);
  await screen.findByRole("heading",{name:"poiseuille-v1"});
  vi.stubGlobal("fetch",vi.fn(async()=>new Response(JSON.stringify({error:"forbidden"}),{status:403})));
  view.rerender(<LearningInsights me={{id:"student-02",role:"student"}} editionId="fluidi"/>);
  expect(screen.queryByRole("heading",{name:"poiseuille-v1"})).toBeNull();
  await screen.findByRole("alert");
  expect(screen.queryByRole("button",{name:"Esporta i dati visibili"})).toBeNull();
});

it("clears evidence immediately when the canonical browser session ends",async()=>{
  activateStudySession(beginStudySessionCheck());serve();
  render(<LearningInsights me={{id:"student-01",role:"student"}} editionId="fluidi"/>);
  await screen.findByRole("heading",{name:"poiseuille-v1"});
  fireEvent.click(screen.getByRole("button",{name:"Aggiorna"}));
  endStudySession("logout",studySessionEpoch());
  await waitFor(()=>expect(screen.queryByRole("heading",{name:"poiseuille-v1"})).toBeNull());
});

it("suppresses small cohort metrics while preserving authorized teacher evidence",async()=>{
  serve({...data,role:"teacher",cohortSuppressed:true,summary:null});
  render(<LearningInsights me={{id:"tutor-test",role:"teacher"}} editionId="fluidi"/>);
  await screen.findByText(/Statistiche di gruppo nascoste/);
  expect(screen.queryByRole("checkbox")).toBeNull();
  expect(screen.getByRole("heading",{name:"poiseuille-v1"})).toBeTruthy();
});

it("removes evidence when the server reports its source was deleted",async()=>{
  vi.stubGlobal("fetch",vi.fn(async(_url,opts)=>new Response(JSON.stringify(opts?.method==="POST"?{error:"insight_source_unavailable"}:{...data,preferences:{...data.preferences,enabled:true,consentId:"consent-1"}}),{status:opts?.method==="POST"?409:200})));
  render(<LearningInsights me={{id:"student-01",role:"student"}} editionId="fluidi"/>);
  fireEvent.click(await screen.findByRole("button",{name:"Segnala difficoltà"}));
  await screen.findByRole("alert");
  expect(screen.queryByRole("heading",{name:"poiseuille-v1"})).toBeNull();
  expect(screen.queryByRole("button",{name:"Esporta i dati visibili"})).toBeNull();
});

it("separates observed comparisons and reviewed recoveries from actionable suggestions",async()=>{
  serve({...data,attempts:[
    {...data.attempts[0],receiptId:"before-receipt",sourceRefs:[{resourceId:"before-source",revisionId:"before-rev"},{resourceId:"original-source",revisionId:"original-rev"}]},
    {...data.attempts[0],receiptId:"after-receipt",parentId:"before-receipt",sourceRefs:[{resourceId:"after-source",revisionId:"after-rev"}]},
    {...data.attempts[0],receiptId:"transfer-receipt",sourceRefs:[{resourceId:"transfer-source",revisionId:"transfer-rev"}]}
  ],comparisons:[{beforeReceiptId:"before-receipt",afterReceiptId:"after-receipt",beforeOutcome:"MISMATCH",afterOutcome:"MATCH",beforeAssistance:"NO_SUPPORT_REQUESTED",afterAssistance:"SUPPORT_REQUESTED",scope:"SAME_MODEL_PARAMETERS",provenance:"CANONICAL_PARENT_RECEIPTS",causalInference:false}],recoveries:[{threadId:"verified-thread",category:"units",sourceRef:{resourceId:"original-source",revisionId:"original-rev"},verificationReceiptId:"transfer-receipt",verificationSourceRefs:[{resourceId:"transfer-source",revisionId:"transfer-rev"}],provenance:"CORE_REVIEWED_TRANSFER",scope:"Verifica circoscritta del tutor."}]});
  render(<LearningInsights me={{id:"student-01",role:"student"}} editionId="fluidi"/>);
  await screen.findByText("Tentativi collegati");
  expect(screen.getByText("Verificati su una prova diversa")).toBeTruthy();
  fireEvent.click(screen.getByText("Fonte della verifica"));
  expect(screen.getByText("Ricevuta della nuova prova: transfer-receipt")).toBeTruthy();
  expect(within(screen.getByRole("heading",{name:"Verificati su una prova diversa"}).closest("section")!).getByText("transfer-source · transfer-rev")).toBeTruthy();
  expect(screen.queryByRole("button",{name:"Contesta questa indicazione"})).toBeNull();
});

it("applies URL filters and browser navigation to authorized receipt evidence",async()=>{
  window.history.replaceState(null,"","/?insightModel=poiseuille-v1&insightOutcome=MATCH");
  serve({...data,attempts:[data.attempts[0],{...data.attempts[0],receiptId:"receipt-2",activityId:"bernoulli-v1",outcome:"MATCH"}]});
  render(<LearningInsights me={{id:"student-01",role:"student"}} editionId="fluidi"/>);
  await screen.findByText(/Nessuna prova corrisponde/);
  fireEvent.click(screen.getByRole("button",{name:"Azzera filtri"}));
  expect(await screen.findByRole("heading",{name:"poiseuille-v1"})).toBeTruthy();
  window.history.replaceState(null,"","/?insightModel=bernoulli-v1");
  fireEvent(window,new PopStateEvent("popstate"));
  expect(screen.queryByRole("heading",{name:"poiseuille-v1"})).toBeNull();
  expect(screen.getByRole("heading",{name:"bernoulli-v1"})).toBeTruthy();
});
