# LEVI / THE BODY COMES FIRST — INTERACTIVE EXPLORER

A public responsive static research experience. The source lives in the public GitHub profile repository. It uses **no external JavaScript libraries, API keys, external telemetry, model calls, cookies or analytics trackers**.

GitHub's README view cannot execute custom JavaScript. This explorer is a normal static site designed for **GitHub Pages** or equivalent hosting.

## Implemented

- Cinematic authentic chassis photo and clearly labeled illustrated motion storyboard; no fabricated live footage.
- Filterable evidence ledger: recorded vs active frontier vs proposed, including **Minimum-Five exact theorem, Lean support, realizer-invariance and challenger records**, with dated public source links.
- Five-field browser laboratory: adjustable recurrence parameters, locally calculated chart and step inspector. Explicit simulation, never live LEVI telemetry.
- Benchmark preregistration: choose evaluation family, baseline, trial count and test substrate, then export a JSON proposal with no fake results.
- Open Lab: interdisciplinary critique, mentor invitation and independent evaluation challenges.
- Responsive design, keyboard controls, alt text, reduced-motion support and no external script dependencies.

## Source file map

- index.html — HTML, CSS, JS bundled in one static page.
- data/evidence.json — dated, typed evidence snapshot; empty comparison result array.
- MEDIA_CAPTURE.md — actual footage, captions, provenance and release plan.

Technical support:
- [MINIMUM FIVE — the BHUAT foundation, mathematical proof and physical hypothesis](../field-notes/MINIMUM_FIVE.md)
- [LEVI — The Body Comes First](../field-notes/LEVI.md)
- [Engineering journal](../field-notes/LEVI_JOURNAL.md)
- [Progress ledger](../field-notes/LEVI_PROGRESS.md)
- [Independent benchmark protocol](../field-notes/LEVI_BENCHMARKS.md)

## Publishing under GitHub Pages

Once this branch is merged into main:

1. Open the K-haotic/K-haotic repository's **Settings** tab, then **Pages**.
2. Under Build and deployment, choose **Deploy from a branch**.
3. Choose **main**, then the **/docs** folder and Save.
4. Use the **Visit site** link GitHub provides to verify actual hosting.
5. A typical GitHub Pages project path is https://k-haotic.github.io/K-haotic/ but do not advertise it as live until that URL is reachable and the app works.

The current authenticated GitHub connector can publish repository files but **cannot change the Pages setting**. If Pages is not enabled, the repository contains completed source but the public interactive site is not yet deployed.

## Testing

Serve the folder with a local static webserver:

    python3 -m http.server --directory docs 8080

Then open http://localhost:8080 and verify:

1. Authentic photo is visible and storyboard is labeled **illustrated**.
2. Play, pause and next-frame buttons work.
3. Evidence stage filters update correctly and render thirteen public source entries, including four Minimum-Five theorem/challenger records.
4. Sliders recalculate the example 5FRE recurrence and canvas.
5. Export creates a JSON preregistration with status PROPOSAL_NOT_RUN and results null.
6. Desktop, narrow mobile and reduced-motion versions remain usable.
7. No network request reaches a live LEVI endpoint or takes hardware action.
8. All public research source links resolve.

## Maintaining the research record

Version the source data from dated evidence. Update the evidence snapshot, journal and public narrative only when reviewed. Distinguish the hardware boot, source revision and measurement conditions. Do not expose boot identity secrets or unpublished IP in the static site.

**[Public GitHub profile](https://github.com/K-haotic)** · **[Research contact](mailto:admin@khaotic.ai?subject=LEVI%20Independent%20Evaluation)**
