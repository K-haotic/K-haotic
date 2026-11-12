#!/usr/bin/env node
"use strict";
/* Public-only Khaotic portal checks. Never reads protected source. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "../..");
const read = file => fs.readFileSync(path.join(ROOT,file),"utf8");
const orgPath = "docs/organization/index.html";
const aiPath = "docs/ai-systems-circuit/index.html";
const coursePath = "docs/ai-systems-circuit/learn/index.html";
const rootPath = "docs/index.html";
const org = read(orgPath);
const ai = read(aiPath);
const course = read(coursePath);
const rootPage = read(rootPath);
const css = read("docs/experience/portal.css");
const js = read("docs/experience/portal.js");
const lab = read("docs/ai-systems-circuit/learn/circuit-lab.js");
let tests = 0;
const test = (name, predicate) => {
  assert(predicate,name); tests++; console.log("PASS",name);
};
const anchors = source => [...source.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const links = source => [...source.matchAll(/\b(?:href|src)="([^"]+)"/g)].map(m=>m[1]);
for(const [file,source] of [[orgPath,org],[aiPath,ai],[coursePath,course]]){
  test(file+" one main and one h1",()=> (source.match(/<main\b/g)||[]).length===1 &&
       (source.match(/<h1\b/g)||[]).length===1);
  const ids=anchors(source);
  test(file+" unique IDs",()=>ids.length===new Set(ids).size);
  test(file+" internal aria references",()=>{
    for(const m of source.matchAll(/\baria-labelledby="([^"]+)"/g))
      for(const id of m[1].split(/\s+/))if(!ids.includes(id))return false;
    return true;
  });
  test(file+" local resources exist",()=>{
    for(const item of links(source)){
      if(item.startsWith("#")||item.startsWith("https:")||item.startsWith("mailto:")||item.startsWith("data:"))continue;
      const abs=path.resolve(ROOT,path.dirname(file),item.split("#")[0]);
      if(!abs.startsWith(ROOT+path.sep) && abs!==ROOT)return false;
      if(!fs.existsSync(abs) && !fs.existsSync(path.join(abs,"index.html")))return false;
    }
    return true;
  });
  test(file+" no outbound scripts/connectors",()=>{
    return source.includes("connect-src 'none'") &&
       !/src="https?:\/\//i.test(source) &&
       !/fetch\(|api[_-]?key|client_secret|bearer.token|gpu_init/i.test(source);
  });
}
test("organization is discoverable from LEVI research",()=>rootPage.includes('href="./organization/"'));
test("organization connects public AI Systems Circuit",()=>org.includes('href="../ai-systems-circuit/"'));
test("AI Circuit connects organization",()=>ai.includes('href="../organization/"')&&course.includes('href="../organization/"'));
test("research themes remain on both public routes",()=>["dreamer","surveyor","burn-in","source graph","projection","magician"].every(x=>(ai+course).toLowerCase().includes(x)));
test("research lab includes working synthetic route",()=>course.includes('id="repair-edge"')&&course.includes('id="break-edge"')&&course.includes('./circuit-lab.js'));
test("research question compares typed retrieval and flat text",()=>course.includes("flat embedding retrieval")&&course.includes("source-anchored typed traversal"));
test("both Khaotic public gateways preserved",()=>ai.includes("https://github.com/K-haotic/K-haotic/tree/main/field-notes")&&ai.includes('href="../organization/"'));
test("route control updates map state",()=>lab.includes("verified.hidden = false")&&lab.includes("verified.hidden = true")&&lab.includes("A → B → C → D"));
test("decorative animation never claims live telemetry",()=>org.includes("not a claim")&&js.includes("NOT live LEVI telemetry"));
test("nontracking visualizer and constrained motion",()=>/prefers-reduced-motion/.test(js)&&/visibilitychange/.test(js)&&
  /cancelAnimationFrame/.test(js)&&!/\b(?:fetch|WebSocket|XMLHttpRequest|localStorage|sessionStorage|sendBeacon)\b/.test(js));
test("glass theme includes contrast and responsive motion controls",()=>/focus-visible/.test(css)&&/prefers-reduced-motion/.test(css)&&/@media\(max-width:430px\)/.test(css)&&/\[data-portal-sky\]/.test(css));
test("no inline external dependencies",()=>![org,ai].some(s=>s.includes("fonts.googleapis.com")||s.includes("cdn.")||s.includes("analytics.")));
console.log("KHAOTIC_PUBLIC_PORTAL_RESEARCH_PASS checks="+tests+" protected_source=none");
