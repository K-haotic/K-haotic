#!/usr/bin/env node
"use strict";
/* Offline source tests for AI Systems Circuit free classroom. No dependencies. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "../..");
const page = fs.readFileSync(path.join(root, "docs/ai-systems-circuit/learn/index.html"), "utf8");
const js = fs.readFileSync(path.join(root, "docs/ai-systems-circuit/learn/lesson.js"), "utf8");
const entrance = fs.readFileSync(path.join(root, "docs/ai-systems-circuit/index.html"), "utf8");
const ids = [...page.matchAll(/\bid="([^"]+)"/g)].map(x => x[1]);
assert.equal(ids.length, new Set(ids).size, "HTML duplicate ID");
assert.equal((page.match(/<article class="card"/g) || []).length, 8, "Eight lessons");
assert.equal((page.match(/<div class="exercise"/g) || []).length, 3, "Three activities");
assert.equal((page.match(/<main\b/g) || []).length, 1);
assert.equal((page.match(/<\/main>/g) || []).length, 1);
assert.equal((page.match(/<h1\b/g) || []).length, 1);
assert.equal((page.match(/<section\b/g) || []).length,
             (page.match(/<\/section>/g) || []).length);
assert(page.includes("script-src 'self'") && page.includes("connect-src 'none'"),
       "Unexpected outbound scripting privilege");
assert(page.includes('src="./lesson.js"'), "Relative JS missing");
assert(entrance.includes('href="./learn/"'), "No entrance link to free classroom");
assert(page.includes("No account, subscription, social follow, or connection required."));
assert(page.includes("proposed participation levels, not currently automated"));
assert(!/https?:\/\/[^\s"']+\.js\b/i.test(page), "Third-party script");
assert(!/\b(?:fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage|sendBeacon|eval)\s*\(/.test(js), "Outbound data/store/unsafe JS");
assert(!/\b(?:client_secret|api_key|bearer_token|khaotic_web_oidc_client_secret|private_telemetry)\b/i.test(page+js));

const events = {};
const elems = {};
function element(id) {
  return (elems[id] ||= {
    value:"", selectedIndex:0, textContent:"",
    addEventListener(type, cb){ (events[id] ||= {})[type] = cb; },
    click(){ const f=events[id]?.click; assert(f, "No click handler: " + id); f(); }
  });
}
const radios = {
  "evidence-answer":[{value:"a",checked:false},{value:"b",checked:false},{value:"c",checked:false}],
  "action-answer":[{value:"a",checked:false},{value:"b",checked:false},{value:"c",checked:false}],
};
const document = {
  getElementById(id){ assert(ids.includes(id),"Unexpected DOM ID: "+id); return element(id); },
  getElementsByName(name){ assert(radios[name], "Unknown radio group"); return radios[name]; },
};
element("audience").value="a beginner";
element("format").value="a short step-by-step checklist";
element("evidence").value="Flag unknown facts and ask for missing information. Do not invent sources.";
vm.runInNewContext(js, {
  document,
  fetch(){throw Error("UNEXPECTED_NETWORK");},
  XMLHttpRequest: class {constructor(){throw Error("UNEXPECTED_XHR");}},
  localStorage: new Proxy({}, {get(){throw Error("UNEXPECTED_STORAGE");}}),
  sessionStorage: new Proxy({}, {get(){throw Error("UNEXPECTED_STORAGE");}}),
  navigator: {sendBeacon(){throw Error("UNEXPECTED_BEACON");}},
}, {timeout:2000,filename:"lesson.js"});
let passed=0;
function test(label, body){body();console.log("PASS",label);passed++;}

test("missing task gives useful feedback without an output",()=>{
  element("build-prompt").click();
  assert.match(element("prompt-feedback").textContent, /Add a non-sensitive/);
  assert.match(element("prompt-output").textContent, /Nothing is sent/);
});
test("structured prompt uses declared audience, format and evidence",()=>{
  element("task").value="Plan   a fictional   3-day workshop\n schedule.";
  element("build-prompt").click();
  assert.match(element("prompt-output").textContent,/TASK: Plan a fictional 3-day workshop schedule\./);
  assert.match(element("prompt-output").textContent,/AUDIENCE: Explain the result for a beginner/);
  assert.match(element("prompt-output").textContent,/FORMAT: Return a short step-by-step checklist/);
  assert.match(element("prompt-output").textContent,/Do not invent sources/);
  assert.match(element("prompt-feedback").textContent,/nothing was transmitted/i);
});
test("user task is text, not injected HTML",()=>{
  element("task").value="<img src=x onerror=alert(1)>";
  element("build-prompt").click();
  assert.match(element("prompt-output").textContent, /<img src=x onerror=alert\(1\)>/);
  assert.equal(typeof element("prompt-output").innerHTML,"undefined");
});
test("unadmitted options rejected",()=>{
  element("audience").value="administrator";
  const prev=element("prompt-output").textContent;
  element("build-prompt").click();
  assert.match(element("prompt-feedback").textContent,/Select an available option/);
  assert.equal(element("prompt-output").textContent,prev);
  element("audience").value="a beginner";
});
test("prompt clear resets local values and output",()=>{
  element("task").value="anything";
  element("audience").selectedIndex=2;
  element("clear-prompt").click();
  assert.equal(element("task").value,"");
  assert.equal(element("audience").selectedIndex,0);
  assert.match(element("prompt-output").textContent,/Nothing is sent/);
});
function choose(group,choice){
  for(const r of radios[group])r.checked=(r.value===choice);
}
test("evidence quiz requires a selection",()=>{
  element("check-evidence").click();
  assert.match(element("evidence-feedback").textContent,/Choose one answer/);
});
test("evidence quiz rejects unsupported claims",()=>{
  choose("evidence-answer","a");
  element("check-evidence").click();
  assert.match(element("evidence-feedback").textContent,/Try again/);
});
test("evidence quiz accepts qualified source-grounded claim",()=>{
  choose("evidence-answer","b");
  element("check-evidence").click();
  assert.match(element("evidence-feedback").textContent,/Correct/);
});
test("action quiz requires a selection",()=>{
  element("check-action").click();
  assert.match(element("action-feedback").textContent,/Choose one answer/);
});
test("action quiz rejects fabricated send",()=>{
  choose("action-answer","a");
  element("check-action").click();
  assert.match(element("action-feedback").textContent,/Try again/);
});
test("action quiz accepts draft-only status",()=>{
  choose("action-answer","b");
  element("check-action").click();
  assert.match(element("action-feedback").textContent,/Correct/);
});
test("quizzes never transition membership or send data",()=>{
  assert(!js.includes("window.location"),"Unexpected redirect");
  assert(!js.includes("document.cookie"),"Unexpected cookie mutation");
  assert(!js.includes("innerHTML"),"Unsafe HTML assignment");
});
console.log("AI_SYSTEMS_FREE_CLASSROOM_PASS tests="+passed+" cards=8 activities=3 outbound=none");
