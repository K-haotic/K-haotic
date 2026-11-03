#!/usr/bin/env python3
"""Fail closed when exact BHUAT/5FRE mathematical implementation reappears in public.

This is a publication hygiene check, not a proof of secrecy: older Git commits,
forks, archives and caches may still retain previously published contents.
"""

from __future__ import annotations

import json
import pathlib
import re
import sys
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parent.parent
ERR: list[str] = []

# Deliberately generic structural signatures: do not embed confidential
# coefficients or full proprietary equations in the guard itself.
BLOCK_PATTERNS = {
    "public registered operator identifier": re.compile(r"\bOP-5F-SEQ-QUAD(?:-[A-Za-z0-9_-]+)?\b", re.I),
    "formal recurrence update": re.compile(r"\\(?:phi|tau|psi|chi|Lambda)_\{?n\+1", re.I),
    "published Jacobian factorization": re.compile(r"\\?det\s*DF\s*=", re.I),
    "exposed formal support predicate": re.compile(r"\bCompleteIndependentCoverage\s*\(", re.I),
    "script with field-specific update assignment": re.compile(r"\bconst\s+(?:phi|tau|psi|chi|lambda)\s*=\s*(?:\d|\.|[A-Za-z_]+\*)", re.I),
    "direct textual field-update rule": re.compile(r"(?m)^\s*(?:phi|tau|psi|chi|lambda)\s*['′]\s*=", re.I),
    "inline field-update equation": re.compile(r"[ϕφτψχΛ]\s*[′']\s*=", re.I),
    "canonical coupling term": re.compile(r"\b(?:k1\s*\*\s*Lambda|c1\s*\*\s*phi)\b", re.I),
}

def public_sources():
    yield ROOT / "README.md"
    for folder, suffixes in (("field-notes", {".md"}),
                            ("docs", {".md", ".html", ".js", ".json"}),
                            ("assets", {".svg"})):
        for path in sorted((ROOT / folder).rglob("*")):
            if path.is_file() and path.suffix.lower() in suffixes:
                yield path

examined = 0
for path in public_sources():
    name = path.relative_to(ROOT).as_posix()
    if not path.exists():
        ERR.append(f"{name}: file missing")
        continue
    try:
        content = path.read_text(encoding="utf-8")
    except UnicodeError as exc:
        ERR.append(f"{name}: not UTF-8 ({exc})")
        continue
    examined += 1
    for reason, regex in BLOCK_PATTERNS.items():
        if regex.search(content):
            ERR.append(f"{name}: {reason}")

main = (ROOT / "README.md").read_text(encoding="utf-8")
math = (ROOT / "field-notes/MINIMUM_FIVE.md").read_text(encoding="utf-8")
hybrid = (ROOT / "field-notes/COMPLEX_SYSTEMS.md").read_text(encoding="utf-8")
site = (ROOT / "docs/index.html").read_text(encoding="utf-8")
policy = (ROOT / "field-notes/RESEARCH_ACCESS.md").read_text(encoding="utf-8")

for name, body, fragments in (
    ("README.md", main, ("khaotic-research-vault.svg", "RESEARCH_ACCESS.md", "MINIMUM FIVE")),
    ("field-notes/MINIMUM_FIVE.md", math, ("[REDACTED", "RESEARCH_ACCESS.md", "ϕ", "τ", "ψ", "χ", "Λ")),
    ("field-notes/COMPLEX_SYSTEMS.md", hybrid, ("[REDACTED", "MINIMUM_FIVE.md", "RESEARCH_ACCESS.md")),
    ("docs/index.html", site, ("renderConcept", "visualTempo", "generic", "CANONICAL UPDATE OPERATOR")),
    ("field-notes/RESEARCH_ACCESS.md", policy, ("CURRENT-VIEW REDACTION", "history", "Minimum Five")),
):
    for fragment in fragments:
        if fragment not in body:
            ERR.append(f"{name}: missing {fragment!r}")

if "function simulate(" in site or "parameterA" in site or "initialPhi" in site:
    ERR.append("docs/index.html: legacy exact-operator simulator remains")

for image in (ROOT / "assets/khaotic-research-vault.svg",
              ROOT / "assets/minimum-five-foundation.svg"):
    try:
        root = ET.parse(image).getroot()
        if not root.tag.endswith("svg"):
            ERR.append(f"{image.name}: incorrect SVG root")
    except ET.ParseError:
        ERR.append(f"{image.name}: malformed SVG")

try:
    evidence = json.loads((ROOT / "docs/data/evidence.json").read_text(encoding="utf-8"))
    if evidence.get("comparison_status") == "NOT_RUN" and evidence.get("comparison_results"):
        ERR.append("Public benchmark results cannot exist while comparative status is NOT_RUN")
except (ValueError, TypeError, KeyError) as exc:
    ERR.append(f"evidence.json: invalid evidence ({exc})")

if ERR:
    print("PUBLIC_IP_REDACTION=FAIL")
    for problem in ERR:
        print(" -", problem)
    sys.exit(1)

print(f"PUBLIC_IP_REDACTION=PASS; audited_files={examined}")
print("Scope: current public HEAD disclosure only; does not erase historical Git exposure.")
