#!/usr/bin/env node
"use strict";
/* Source-only DOM simulation for Khaotic's voluntary local Learning Passport. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const root = path.resolve(__dirname, "../..");
const html = fs.readFileSync(path.join(root, "docs/ai-systems-circuit/learn/index.html"), "utf8");
const moduleText = fs.readFileSync(path.join(root, "docs/ai-systems-circuit/learn/passport.js"), "utf8");
const exerciseText = fs.readFileSync(path.join(root, "docs/ai-systems-circuit/learn/lesson.js"), "utf8");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length, new Set(ids).size,"Duplicated ID");
const expected = ["system","prompting","context","tools","privacy","verification","experiments","workflows"];
const controls = [...html.matchAll(/<input type="checkbox" data-lesson="([^"]+)"/g)].map(m=>m[1]);
assert.deepEqual(controls,expected);
assert.match(html,/src="\.\/passport\.js"/);
assert.match(html,/id="passport-meter" class="passport-meter" max="11"/);
assert.match(html,/No task text, account information or other personal details enter the record/);
assert.match(html,/Nothing is saved automatically/);
assert.match(html,/not linked to your Khaotic account/);
assert(!/fetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|navigator\.clipboard|document\.cookie|innerHTML/.test(moduleText),"no network / HTML execution / device sharing");
assert(!/https?:\/\//.test(moduleText),"passport code must be self-contained");

class El {
  constructor(id){this.id=id;this.value="";this.textContent="";this.checked=false;this.selectedIndex=0;this.events={};this.dataset={};}
  addEventListener(name,handler){this.events[name]=handler;}
  event(name){assert(this.events[name],"missing "+name+" handler on "+this.id);this.events[name]({target:this});}
}
const elements=new Map(ids.map(id=>[id,new El(id)]));
const lessons=controls.map(id=>{const x=new El("lesson-"+id);x.dataset.lesson=id;return x;});
const listeners=new Map();
const radios={
 "evidence-answer":[{value:"a",checked:false},{value:"b",checked:false},{value:"c",checked:false}],
 "action-answer":[{value:"a",checked:false},{value:"b",checked:false},{value:"c",checked:false}]
};
const storage=new Map();
const storageLog=[];
let storeFail=false;
const localStorage={
 getItem(k){storageLog.push(["get",k]);if(storeFail)throw Error("BLOCKED");return storage.has(k)?storage.get(k):null;},
 setItem(k,v){storageLog.push(["set",k]);if(storeFail)throw Error("BLOCKED");storage.set(k,v);},
 removeItem(k){storageLog.push(["remove",k]);if(storeFail)throw Error("BLOCKED");storage.delete(k);}
};
const document={
 getElementById(id){assert(elements.has(id),"Unexpected DOM reference "+id);return elements.get(id);},
 querySelectorAll(selector){assert.equal(selector,'input[data-lesson]');return lessons;},
 getElementsByName(group){assert(radios[group]);return radios[group];},
 addEventListener(type,listener){listeners.set(type,listener);},
 dispatchEvent(event){const fn=listeners.get(event.type);if(fn)fn(event);return true;},
};
class CustomEvent {constructor(type,{detail}){this.type=type;this.detail=detail;}}
const context=vm.createContext({document,window:{localStorage},CustomEvent,
 fetch(){throw Error("UNEXPECTED_NETWORK");},
 XMLHttpRequest:class{constructor(){throw Error("UNEXPECTED_XHR");}},
 navigator:{sendBeacon(){throw Error("UNEXPECTED_BEACON");}}});
const prep=(id)=>elements.get(id);
prep("audience").value="a beginner";
prep("format").value="a short step-by-step checklist";
prep("evidence").value="Flag unknown facts and ask for missing information. Do not invent sources.";
vm.runInContext(moduleText,context,{filename:"passport.js",timeout:2000});
vm.runInContext(exerciseText,context,{filename:"lesson.js",timeout:2000});
let n=0;
function test(label,cb){cb();n++;console.log("PASS",label);}
function choose(group,selected){for(const a of radios[group])a.checked=(a.value===selected);}
function progress(){return prep("passport-progress").textContent;}
function value(){return prep("passport-meter").value;}
const KEY="khaotic.ai.systems_circuit.learning_passport.v1";
function snapshot(){return JSON.parse(storage.get(KEY));}
test("default 0/11 and no implicit storage reads or writes",()=>{
 assert.equal(value(),0);assert.match(progress(),/0 of 11/);assert.equal(storageLog.length,0);assert.equal(storage.size,0);
});
test("two optional self-assessed lessons only update in-memory state",()=>{
 lessons[0].checked=true;lessons[0].event("change");
 lessons[1].checked=true;lessons[1].event("change");
 assert.equal(value(),2);assert.equal(storageLog.length,0);
});
test("empty prompt is not an earned practice milestone",()=>{
 prep("build-prompt").event("click");
 assert.equal(value(),2);
});
test("nonempty prompt records only prompt milestone",()=>{
 prep("task").value="Plan a fictional project";
 prep("build-prompt").event("click");
 assert.equal(value(),3);
});
test("incorrect evidence response does not record practice",()=>{
 choose("evidence-answer","a");prep("check-evidence").event("click");assert.equal(value(),3);
});
test("correct evidence response records milestone",()=>{
 choose("evidence-answer","b");prep("check-evidence").event("click");assert.equal(value(),4);
});
test("correct action response records milestone",()=>{
 choose("action-answer","b");prep("check-action").event("click");assert.equal(value(),5);
});
test("repeat quiz and prompt events do not double-credit",()=>{
 prep("check-action").event("click");prep("check-evidence").event("click");
 prep("build-prompt").event("click");assert.equal(value(),5);
});
test("explicit Save stores only allowed IDs and no prompt/PII",()=>{
 prep("passport-save").event("click");
 assert.equal(storageLog.filter(x=>x[0]==="set").length,1);
 const r=snapshot();
 assert.deepEqual(r,{
  schema:"khaotic.learning_passport.v1",
  kind:"SELF_ASSESSED_PROGRESS_ONLY",
  authority:"NONE",lessons:["system","prompting"],activities:["prompt","evidence","action"]
 });
 assert(!storage.get(KEY).includes("fictional project"));
 assert(!storage.get(KEY).includes("user_id"));
 assert(!storage.get(KEY).includes("secret"));
 assert.match(prep("passport-status").textContent,/Khaotic received nothing/);
});
test("progress may diverge from saved record until explicit restore",()=>{
 lessons[0].checked=false;lessons[0].event("change");
 assert.equal(value(),4);assert.equal(snapshot().lessons.length,2);
 prep("passport-restore").event("click");
 assert.equal(value(),5);assert(lessons[0].checked);
});
test("export is portable JSON and performs no storage/network call",()=>{
 const before=storageLog.length;
 prep("passport-export").event("click");
 const exported=JSON.parse(prep("passport-transfer").value);
 assert.deepEqual(exported,snapshot());
 assert.equal(storageLog.length,before);
});
test("import round-trip after clear, without implicit save",()=>{
 const portable=prep("passport-transfer").value;
 prep("passport-clear").event("click");assert.equal(value(),0);assert.equal(storage.size,0);
 prep("passport-transfer").value=portable;
 const before=storageLog.length;
 prep("passport-import").event("click");
 assert.equal(value(),5);assert.equal(prep("passport-transfer").value,"");
 assert.equal(storageLog.length,before);
});
test("malformed, unknown and privilege-bearing imports are rejected",()=>{
 const original=JSON.parse(prep("passport-export").events.click?"{}":"{}");
 prep("passport-export").event("click");
 const good=JSON.parse(prep("passport-transfer").value);
 const cases=[
 "not-json",
 JSON.stringify({...good, schema:"unrecognized.v2"}),
 JSON.stringify({...good,authority:"ADMIN"}),
 JSON.stringify({...good,member_level:"RESEARCH_PARTNER"}),
 JSON.stringify({...good,lessons:["system","system"]}),
 JSON.stringify({...good,lessons:["owner-root"]}),
 JSON.stringify({...good,activities:["physical-actuation"]}),
 JSON.stringify({...good,activities:["prompt",1]}),
 JSON.stringify({...good,lessons:"system"}),
 JSON.stringify({...good,__proto__:"any",research_access:true}),
 JSON.stringify({...good,activities:[...good.activities,"prompt"]}),
 "x".repeat(2049)
 ];
 for(const bad of cases){
  prep("passport-transfer").value=bad;
  prep("passport-import").event("click");
  assert.equal(value(),5);
  assert.match(prep("passport-status").textContent,/Invalid or unsupported/);
 }
 void original;
});
test("manually crafted valid self-assessed record can import all 11",()=>{
 const r={schema:"khaotic.learning_passport.v1",kind:"SELF_ASSESSED_PROGRESS_ONLY",
          authority:"NONE",lessons:expected,activities:["prompt","evidence","action"]};
 prep("passport-transfer").value=JSON.stringify(r);
 prep("passport-import").event("click");
 assert.equal(value(),11);assert.match(progress(),/11 of 11/);
});
test("rejected stored JSON leaves in-memory state intact",()=>{
 storage.set(KEY,JSON.stringify({...snapshot(),authority:"ADMIN"}));
 prep("passport-restore").event("click");
 assert.equal(value(),11);assert.match(prep("passport-status").textContent,/invalid/);
});
test("site storage unavailable is handled without sacrificing progress",()=>{
 storeFail=true;
 prep("passport-save").event("click");assert.equal(value(),11);
 assert.match(prep("passport-status").textContent,/storage is unavailable/);
 prep("passport-clear").event("click");assert.equal(value(),0);
 assert.match(prep("passport-status").textContent,/could not be reached/);
 storeFail=false;
});
test("no member grant, OAuth, social metric or developer access present",()=>{
 for(const denied of ["role_token","issuer_secret","member_approved","gitHub_access_token","gpu_init",
                       "fetch(","navigator.sendBeacon","Authorization: Bearer"]){
  assert(!moduleText.toLowerCase().includes(denied.toLowerCase()),denied);
 }
 assert(!html.includes('name="api_key"'));
});
console.log("AI_CLUB_LEARNING_PASSPORT_PASS tests="+n+" lessons=8 activities=3 network=none storage=opt-in");
