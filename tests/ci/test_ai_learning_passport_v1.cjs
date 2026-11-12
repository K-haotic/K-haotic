#!/usr/bin/env node
"use strict";
/* Source-only checks for the public AI Systems Circuit research lab. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../..");
const html = fs.readFileSync(path.join(root, "docs/ai-systems-circuit/learn/index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "docs/ai-systems-circuit/learn/circuit-lab.js"), "utf8");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length, new Set(ids).size, "Duplicated ID");
for (const id of ["model","burn-in","dreamer","source-graph","projection","harness","route-status","repair-edge","break-edge","verified-route"]) {
  assert(ids.includes(id), "Missing research lab element: " + id);
}
assert.match(html, /dreamer/);
assert.match(html, /surveyor/);
assert.match(html, /source-anchored typed traversal/);
assert.match(html, /same corpus and questions/);
assert.match(html, /magician’s trick/);
assert.match(html, /AI Systems Circuit/);
assert(!/passport|member level|participation ladder|authorized action quiz/i.test(html));
assert(!/fetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|document\.cookie|innerHTML/.test(script), "no network or HTML injection");
assert(!/https?:\/\//.test(script), "script must be self-contained");
assert.match(script, /verified.hidden = false/);
assert.match(script, /verified.hidden = true/);
assert.match(script, /A → B → C → D/);
console.log("AI_SYSTEMS_CIRCUIT_RESEARCH_PASS ids=" + ids.length + " network=none");
