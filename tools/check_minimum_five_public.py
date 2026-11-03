#!/usr/bin/env python3
"""Guard the public BHUAT/5FRE Minimum-Five foundation against silent drift.

This is a *publication-integrity* check. It does not independently prove any
theorem, certify the physical hypothesis, or validate LEVI hardware.
"""

from __future__ import annotations

import json
import pathlib
import re
import sys
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parent.parent
ERRORS: list[str] = []


def load(path: str) -> str:
    target = ROOT / path
    try:
        return target.read_text(encoding="utf-8")
    except OSError as exc:
        ERRORS.append(f"{path}: cannot read ({exc})")
        return ""


def expect(path: str, content: str, expected: str, why: str) -> None:
    if expected not in content:
        ERRORS.append(f"{path}: missing {why!r} (expected {expected!r})")


def forbid(path: str, content: str, pattern: str, why: str) -> None:
    if re.search(pattern, content, flags=re.IGNORECASE):
        ERRORS.append(f"{path}: {why}")


CORE = {
    "README.md": [
        "MINIMUM FIVE",
        "[REDACTED — PRIVATE HISTORY]",
        "field-notes/MINIMUM_FIVE.md",
        "assets/minimum-five-foundation.svg",
        "assets/khaotic-research-vault.svg",
        "field-notes/RESEARCH_ACCESS.md",
    ],
    "field-notes/MINIMUM_FIVE.md": [
        "MINIMUM FIVE",
        "[REDACTED · REGISTERED NONLINEAR OPERATOR]",
        "[REDACTED · JACOBIAN FACTORIZATION",
        "[REDACTED · LEAN THEOREM STATEMENT",
        "four-effective-support",
        "RESEARCH_ACCESS.md",
    ],
    "field-notes/LEVI.md": ["MINIMUM FIVE", "Xₙ = (ϕₙ, τₙ, ψₙ, χₙ, Λₙ)", "MINIMUM_FIVE.md"],
    "field-notes/COMPLEX_SYSTEMS.md": ["Minimum Five", "[REDACTED · CANONICAL RECURRENCE", "[REDACTED · EXACT JACOBIAN", "MINIMUM_FIVE.md"],
    "field-notes/RESEARCH.md": ["MINIMUM FIVE", "MINIMUM_FIVE.md", "RESEARCH_ACCESS.md"],
    "field-notes/ENGINEERING.md": ["[REDACTED — PRIVATE HISTORY]"],
    "field-notes/RESEARCH_ACCESS.md": ["THE PUBLIC THEOREM", "CURRENT-VIEW REDACTION", "PRIVATE", "Minimum Five"],
    "field-notes/AUTOPOIESIS.md": ["Minimum-Five", "MINIMUM_FIVE.md"],
    "field-notes/PROVENANCE.md": ["Minimum-Five", "MINIMUM_FIVE.md"],
    "field-notes/EMBODIMENT.md": ["Minimum Five", "MINIMUM_FIVE.md"],
    "field-notes/HOLARCHY_NEURONS.md": ["Minimum-Five", "MINIMUM_FIVE.md"],
    "docs/index.html": ["MINIMUM FIVE", "minimum-five-foundation.svg", "field-notes/MINIMUM_FIVE.md", "visualTempo", "CANONICAL UPDATE OPERATOR", "khaotic-research-vault.svg"],
    "docs/OPEN_LAB.md": ["Minimum Five", "MINIMUM_FIVE.md"],
    "docs/data/evidence.json": ["MIN5_OPERATOR", "MIN5_SUPPORT", "MIN5_REALIZER", "MIN5_V2"],
    "assets/levi-body-frontier.svg": ["MINIMUM FIVE", "ϕ", "τ", "ψ", "χ", "Λ"],
    "assets/minimum-five-foundation.svg": ["MINIMUM FIVE", "ϕ", "τ", "ψ", "χ", "Λ"],
    "assets/khaotic-research-vault.svg": ["PROPRIETARY", "ϕ", "τ", "ψ", "χ", "Λ"],
}

PUBLIC = {}
for name, tokens in CORE.items():
    body = load(name)
    PUBLIC[name] = body
    for token in tokens:
        expect(name, body, token, "Minimum-Five authority or link")

    if name.endswith(".md") or name.endswith(".html"):
        # The four-component *bookkeeping* shorthand must not be
        # misrepresented as the fundamental pentadic body state.
        forbid(
            name,
            body,
            r"Z\s*=\s*\(\s*X\s*,\s*H\s*,\s*C\s*,\s*E\s*\)",
            "four-component tuple used where the five-field law should be",
        )
        forbid(name, body, r"five-state theorem without a five-field mythology",
               "obsolete diminishing heading has returned")
        forbid(name, body, r"\*\*REDACTED\*(?!\*)",
               "malformed Markdown around a redaction marker")

# Public biography protection: preserve the intentional redaction itself.
# This check deliberately stores no identifying facts about the private period.
timeline_expected = "| **Earlier period** | **[REDACTED — PRIVATE HISTORY]** | Details intentionally withheld from this public résumé. |"
timeline_rows = [
    line for line in PUBLIC["README.md"].splitlines()
    if line.startswith("| **Earlier period** |")
]
if timeline_rows != [timeline_expected]:
    ERRORS.append("README.md: earlier-period public timeline must remain fully redacted")

engineering = PUBLIC["field-notes/ENGINEERING.md"]
private_section_start = engineering.find("### Earlier period | [REDACTED]")
private_section_end = engineering.find("\n## ", private_section_start + 1) if private_section_start >= 0 else -1
private_section_expected = (
    "### Earlier period | [REDACTED]\n\n"
    "**[REDACTED — PRIVATE HISTORY]** Details from this period are intentionally withheld from the public résumé."
)
if (private_section_start < 0 or private_section_end < 0 or
    engineering[private_section_start:private_section_end].strip() != private_section_expected):
    ERRORS.append("field-notes/ENGINEERING.md: earlier-period section must remain redacted")

for svg_name in ("assets/minimum-five-foundation.svg", "assets/levi-body-frontier.svg", "assets/khaotic-research-vault.svg"):
    try:
        root = ET.fromstring(PUBLIC[svg_name])
        if root.tag not in ("{http://www.w3.org/2000/svg}svg", "svg"):
            ERRORS.append(f"{svg_name}: root element is not SVG")
        labels = "".join(root.itertext())
        for field in ("ϕ", "τ", "ψ", "χ", "Λ"):
            if field not in labels:
                ERRORS.append(f"{svg_name}: missing visible field label {field}")
    except ET.ParseError as exc:
        ERRORS.append(f"{svg_name}: invalid XML ({exc})")

try:
    data = json.loads(PUBLIC["docs/data/evidence.json"])
    ids = [entry["id"] for entry in data["records"]]
    for expected_id in ("MIN5_OPERATOR", "MIN5_SUPPORT", "MIN5_REALIZER", "MIN5_V2"):
        if expected_id not in ids:
            ERRORS.append(f"docs/data/evidence.json: missing {expected_id}")
    if len(set(ids)) != len(ids):
        ERRORS.append("docs/data/evidence.json: duplicate evidence IDs")
    if data.get("comparison_status") == "NOT_RUN" and data.get("comparison_results"):
        ERRORS.append("docs/data/evidence.json: comparative results supplied while status remains NOT_RUN")
except (ValueError, KeyError, TypeError) as exc:
    ERRORS.append(f"docs/data/evidence.json: invalid structured evidence ({exc})")

if ERRORS:
    print("MINIMUM_FIVE_PUBLIC_CANON=FAIL")
    for err in ERRORS:
        print(" -", err)
    sys.exit(1)

print(f"MINIMUM_FIVE_PUBLIC_CANON=PASS; surfaces={len(CORE)}")
print("Scope: public text, SVG and evidence schema integrity (not mathematical or physical validation).")
