# OWN LANGUAGES / TAL / PROOF-CARRYING ACTIONS / CIPHER RESEARCH

[Front door](../README.md) | [Research program](RESEARCH.md) | [Native hardware](EMBODIMENT.md) | [Source ledger](PROVENANCE.md)

## Beyond prompts and scripts

The Khaotic research program investigates languages and protocols because state-changing work needs more than natural-language instructions. A program should declare *what it means, what it may touch, what evidence is required, which obligations survive, and what is recorded if it fails*. The repository has a broad family of typed grammars, message formats, operation classes, lifecycle contracts and historical compiler work -- not one magical universal programming language.

### TAL: Typed Assembly Language in the project's historical design

The October 2026 source recovery explicitly identifies **TAL as Typed Assembly Language** in Khaotic's historical work: typed roles, regimes, pre/postconditions, authority, provenance, resources, simulation before commitment, and proof-carrying operations. It also distinguishes **AST** (abstract syntax tree), historical Pentadic Score/Contract IR, ScrollLang and several future native compiler rungs. Not every historical design currently has an admitted compiler and runtime (R72-R75).

A representative *conceptual* command path is:

```text
parse expression
-> resolve semantic identity / types
-> bind source + body + authority
-> check preconditions, viability and resources
-> simulate or preflight if required
-> execute only an admitted operation
-> record result, refusal, compensation or fault
-> preserve lineage and witnesses
```

The source document *Proof-Carrying Body Operations* expresses the design as a typed transformation with precondition and a returned next state plus postcondition/evidence. Its own status is a **language/type-system draft**, not a claim that a complete compiler has been independently verified. Present-day narrower implementations and validators must be evaluated individually.

## A family of language and protocol research

| Area | Purpose | What not to confuse |
| --- | --- | --- |
| **5FRE state/operator vocabulary** | Specify exact five-state mathematics, update order, diagnostics and realizers | A symbol label is not a compiler or a physics proof. |
| **TAL / proof-carrying operations** | Convey typed effects, resources, identity, pre/postconditions and authority | A design grammar is not an already-operational secure shell. |
| **Pentadic AST, Score and IR** | Program representation, structured execution intent, backend-neutral conversion and proof profiles | Historical source and current reownership candidates vary in maturity. |
| **ScrollLang and semantic grammar** | Parse, bind, validate and seal descriptive statements | A sealed description is not an authorized device action. |
| **Observer / CHIRP / FLOCK / MURMURATION** | Structured signals, peer observations, acknowledgments and federation/message designs | Observation transport is not independent security or computation proof. |
| **N12 / N13 / N14 native language targets** | Bounded bytecode/VM, source language convergence and future compiler self-hosting | Future milestones are not implemented final self-hosting by name. |
| **KEEL and execution contracts** | Source generations, typed mutations, work placement, receipts and no-split-brain custody | A file being present on GitHub does not grant runtime authority. |

The language census explicitly documents multiple grammar families and dozens of protocol surfaces, and warns against collapsing them into one label. This is a *research and engineering estate*, not 40 production-ready networking standards.

## Cipher research: inventing is not certifying

The project maintains real, reviewed-standard cryptographic security surfaces in its broader operational stack while independently exploring project-native cipher designs. The experimental research outlines **KC-1 through KC-6** candidates and a deliberate cryptanalysis ladder: exact specifications, reference implementations, known-answer tests, statistical/structural attacks, key/nonce analysis, forgery/misuse cases, side-channel and fault work, cross-platform equivalence, and outside review.

One tangible source example is **KPP-320-v0**, a finite-bit five-lane permutation research implementation in Rust (R77). The source explicitly labels it experimental, unproven and *not production cryptography*. Mathematical novelty or a chaotic-looking state update is not a substitute for cryptographic security. Standard reviewed mechanisms remain the deployment baseline unless research survives separate expert scrutiny (R76-R79).

### Security spans more than a cipher

The security-maturity map separates evidence integrity, authenticated receipts, signatures, key lifecycle, replay protection, confidentiality, identity/authorization, transport admission, recovery, supply-chain hygiene, hardware attestation, side-channel exposure, and threshold custody. A correct primitive does not imply a safe protocol; a safe protocol does not imply an authorized operator; and an authorized command does not prove a physical machine executed it.

The proposed Jasmin/EasyCrypt research bridge is a candidate high-assurance toolchain, not an installed or already-proven Khaotic cryptographic system (R78).

## Why this matters beyond security

A system that can change itself, coordinate workers, call providers or operate physical hardware has to know **which transformations are allowed and how they are evidenced**. TAL, structured language, authentication, KEEL source-generation custody and the Arbiter/Witness/Executor distinction are attempts to make that accountability explicit. They are not claims of invulnerability, a sovereign operating system already completed, or permissionless autonomy.

My contribution is original inquiry and cross-domain systems architecture informed by industrial controls, careful failure analysis, mathematics and sustained implementation experiments. The public register makes each research claim and its limitations discoverable; underlying source-level review remains selectively available.

**Primary source families:** R37-R41, R43, R72-R79, R86. [Inspect the pinned documents and boundaries](PROVENANCE.md).
