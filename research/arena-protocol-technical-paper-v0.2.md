# ARENA: A Protocol for Bounded Institutional Coordination

Technical paper · Draft v0.2 · 17 November 2026

## Abstract

ARENA specifies a minimum institutional interface for coordinating participants and shared resources within a bounded physical or operational environment. Its primary object is not a token, DAO or smart contract, but an institution defined by a place or operating domain, an objective, a charter, named authority, membership obligations, an evidence process, and explicit renewal and termination conditions. A separate recognition registry records the status and version of participating institutions. Optional contracts can represent membership and verify signed dispute decisions.

The central technical problem is the consistency of authority across three different systems: the physical and legal environment in which obligations arise; off-chain documents and human decisions that define and interpret those obligations; and a digital record that may attest to or execute selected outcomes. ARENA cannot remove the trust boundary between them. Its proposed contribution is to make that boundary explicit, legible and testable.

This paper defines the protocol objects and trust assumptions, specifies candidate lifecycle invariants, documents the precise behaviour of three experimental Solidity contracts, analyses unimplemented guarantees, and sets out falsifiable criteria for evaluating the design. It reports a reference implementation and baseline contract tests, not a deployed institution, security audit or empirical performance result.

## 1. Problem and unit of analysis

Consider a temporary field station jointly used by an owner, an operator, researchers and equipment custodians. Access, maintenance, expenditure, safety and records are interdependent. A conventional online governance structure can record votes, but cannot by itself determine who controls the gate, owns the sensor, is qualified to suspend fieldwork or bears liability when an obligation is breached. An informal association may handle these questions without explicit rules until conflict exposes the missing authority structure.

ARENA takes the bounded operating environment as its initial unit. Its design claims are deliberately narrower than those of a network state. It does not claim sovereignty or propose that cryptographic state replaces property rights, contracts or public law. Nor does it require on-chain organisation: a well-kept charter and decision register can constitute the first operating layer.

Let an Arena instance be described by:

    A = (B, M, K, C, P, E, L)

where B is a declared boundary, M an observable mission, K a governance kernel, C a custody and resource model, P the participant and obligation set, E an evidence/dispute process, and L a lifecycle specification. The tuple is an analytical model, not an implemented canonical binary encoding. A valid operating instance must also identify the external legal or property authority enabling use of B. Its existence cannot be inferred from an on-chain record.

ARENA distinguishes two objects that must not be conflated:

1. The **Arena**, a local institutional arrangement operated by identifiable people within physical and legal constraints.
2. The **ARENA Registry**, a protocol-governed recognition record which expresses that an Arena has satisfied a stated structural standard at a particular review point.

Recognition is a statement about documented protocol conformity. It is not adjudication of title, a proof of consent, a safety certification, a jurisdiction or a licence.

## 2. Actors, authority and trust boundaries

An Arena may assign multiple roles to one person, although separation is preferable when the risk of unilateral action is material.

- **Site owner or lawful controller:** controls access and assets under applicable law. This power does not originate in ARENA.
- **Steward/operator:** has enumerated routine operational powers and, if expressly authorised, time-limited emergency powers.
- **Member:** has an explicit admission record, enumerated obligations and a defined right to withdraw from membership.
- **Custodian:** controls identified shared assets or a treasury under documented approval thresholds.
- **Dispute reviewer:** interprets evidence under a preselected procedure and issues a reasoned outcome; the independence conditions must be specified.
- **Registry registrar/status manager:** can record recognition and status in the reference registry. This is an administrative, not judicial, role.
- **Public observer:** can verify public record consistency without assuming that the underlying physical claims are accurate.

The **physical/legal layer** determines ownership, permission, safety and enforcement. The **institutional layer** determines charter obligations, authority delegations, review and exit. The **record layer** preserves selected hashes, versions, events and signatures. A valid cryptographic proof establishes only a proposition about a particular key, message or record. It does not bridge these layers without trusted observation and accepted decision procedures.

The v0.1 registry centralises registration, status changes and module records in role-bearing addresses. The resulting trust assumption is explicit: registry officers can make recognition decisions and overwrite certain current values. A future council or DAO is not evidence that v0.1 is decentralised.

## 3. Minimum institutional object

The public charter for an Arena must identify the following fields to enable a structural review. These requirements are drawn from the existing governance primitive, recognition standard and charter template.

| Field | Minimum contents | Unresolved implementation question |
|---|---|---|
| Boundary | Operating domain, exclusions, lawful access basis | Canonical boundary changes and private coordinates |
| Objective | Primary mission, observable success condition, time horizon | Material change threshold |
| Authority | Named operator; routine, reserved and emergency powers | Approval and override representation |
| Participants | Entry, role, contribution, suspension/removal, withdrawal | Identity verification and credential privacy |
| Custody | Asset controller, treasury authority, spending approval | Multisig quorum and recovery |
| Disputes | Intake, reviewer, evidence, remedy classes, appeal | Independent reviewer selection and enforcement |
| Lifecycle | Reporting, renewal gate, failure, dissolution | On-chain state machine and time enforcement |
| Records | Public charter version, private evidence retention, audit trail | Storage availability and access controls |

The charter must distinguish **powers** from **observations**. The operator may be authorised to close a facility for a safety reason; a record that the closure occurred does not prove the reason was true. Equally, a membership record establishes recorded status, not physical access or a guarantee of housing, employment or property use.

There must be an unambiguous rule for the precedence of charter provisions, legal agreements and emergency duties. The present source documents require this separation but do not define a universal conflict-resolution order, because applicable law and asset control vary by site.

## 4. Recognition and lifecycle semantics

The documentary status vocabulary is:

    Proposed | Active | UnderReview | Legacy | Revoked | Dissolved

The six values are already represented as the ArenaStatus enumeration in ArenaRegistry.sol. The recognition standard, however, specifies an off-chain review of boundary, authority, membership, disputes, exit, renewal and legal consistency before recognition. These semantics are not enforced by the reference contract.

### 4.1 Candidate normative transitions

The following is a **proposed protocol rule**, not a claim about the deployed Solidity interface:

| Transition | Required evidence or authority | Effect |
|---|---|---|
| Proposed → Active | Review receipt against identified standard and charter digest | Recognition begins |
| Active → UnderReview | Expired renewal or documented challenge by authorised reviewer | Recognition flagged; operation unaffected |
| UnderReview → Active | Resolution record and renewed evidence where relevant | Recognition restored |
| Active/UnderReview → Legacy | Explicit retirement from current standard or completed wind-down without dissolution | Historical status |
| Proposed/Active/UnderReview/Legacy → Revoked | Reasoned recognition decision with recorded basis | Recognition withdrawn |
| Active/UnderReview/Legacy → Dissolved | Institution's own dissolution record and settlement reference | Closure recorded |

An actual transition policy also needs rules for reopening, administrative error, appeal and terminal-state finality. No final policy has yet been agreed. In particular, **a recorded registry status must not directly seize a local asset, remove lawful occupants or dissolve a legal entity**.

For a robust recognition system the following invariants are required as design targets:

**R1 — No unreviewed activation.** A record cannot become Active solely because an applicant submits metadata.

**R2 — Traceable recognition.** An Active state references a known standard version, charter digest and review decision.

**R3 — Bounded administrative authority.** A status change has an authorised decision path and an inspectable reason or reason digest.

**R4 — Renewable recognition.** An expired renewal interval cannot silently continue as a current certification of protocol conformity.

**R5 — Historical reconstruction.** Observers can reconstruct changes to charter versions, operators and recognition state from an available event/archive history.

The reference contract **does not satisfy R1, R2, R3 and R4 as enforceable on-chain guarantees**. It provides role-restricted writes and events but does not validate review evidence, allowed transitions or expiry. R5 depends on preserving chain logs and off-chain document versions; current mutable storage alone is insufficient to reconstruct complete semantics.

### 4.2 Current registry behaviour

The Solidity registry uses a sequential uint256 id. registerArena() requires a non-empty name, metadata URI and protocol version, plus a nonzero operator. It immediately stores status Active. Registrar, status-manager and module-manager roles are governed by OpenZeppelin AccessControl; an initial admin receives all four roles. An authorised status manager can assign any enumerated status at any time.

Stored record fields are: id, name, metadataURI, charterHash, operator, status, protocolVersion, registeredAt, renewalDueAt, updatedAt. Optional modules are keyed by bytes32 module type and store an address, URI and active flag. updateArenaMetadata(), updateOperator(), updateRenewalDueAt(), updateArenaStatus() and setArenaModule() are role-restricted administrative mutations.

There is no on-chain predicate checking that a charter digest corresponds to a reviewed charter, that the operator controls the declared site, that renewal occurred, or that a module address implements any particular interface. This is intentional simplicity at the prototype stage, but it limits the meaning of a registry read.

## 5. Identity, versioning and historical continuity

The separate Arena Identity Specification proposes an identity derived from a canonical geographic description, mission, genesis timestamp, origin repository and optional chain anchor. It aims to preserve identity across key rotation and contract migration, subject to continuity of boundary, mission and governance kernel.

This proposal currently conflicts with the registry implementation in two ways. First, the registry allocates incremental numeric IDs rather than a hash of a canonical identity document. Second, the canonicalisation of geographic and mission descriptions, and the threshold for a “material” change, remain unspecified.

A serious interoperable identity standard must define byte-level canonicalisation, namespace/domain separation, versioning and collision handling. Without them, two implementers may hash semantically identical descriptions differently, while a strategically rewritten mission could retain a familiar name without institutional continuity.

The minimum public version trail therefore consists of an Arena identifier, successive charter digests, the protocol standard used for each recognition decision, timestamped transitions, and an archive of the documents to which the digests refer. Cryptographic digests provide integrity checks only if users can independently obtain the referenced bytes. A content-addressed URI without durable availability is not sufficient.

## 6. Membership, obligations and exit

The experimental ArenaMembership contract represents:

    NONE → ACTIVE → EXITED
                 ↘ REMOVED

The operator can add a non-active address, remove an active address with a nonzero enumerated reason, and transfer the operator role. An active member can invoke exit() without the operator's signature. activeMemberCount tracks addresses in ACTIVE state. An exited or removed address may be admitted again by the operator.

This establishes a **narrow on-chain permissionless exit property**: an ACTIVE wallet can set its own contract state to EXITED. It does not guarantee repayment, retrieval of property, physical departure, continued access to records, nor freedom from coercive real-world dependencies.

The contract does not store a charter agreement, a join signature, contribution obligations, bond balances, evidence of breach, an appeal period or operator removal limits. The operator can remove a member by specifying a reason enum; the enum is not evidence of the underlying conduct. No active Arena identity is stored in the membership contract, so its relationship to a specific registry record must be established externally.

A stronger membership protocol would distinguish four separate events: **acceptance of terms**, **entry into membership**, **withdrawal from membership**, and **settlement of residual obligations**. These events must not be collapsed into a single token transfer or boolean. Exit should be permissionless at the level of membership state; disputed liabilities and custody should follow precommitted, reviewable processes rather than indefinitely prevent exit.

The v0.1 specification permits optional bonds, but no bond-escrow contract is established by the three reference contracts reviewed for this paper. No fee, yield, penalty, refund or financial-protection claim follows from ARENA's current implementation.

## 7. Dispute outcomes: evidence, signatures and execution

Evidence is generated in physical settings and interpreted off-chain. The dispute payload specification defines an Arena ID, dispute ID, subject, outcome class, parameters, evidence hashes, narrative hash, effective time, expiry and authorised signer set. Example classes include WARN, REMOVE_MEMBER, SLASH_BOND, REFUND_BOND, FREEZE_ROLE and DISSOLVE_ARENA.

The existing DisputeOutcomeVerifier.sol implements a much narrower primitive. It stores one authorised signer and an immutable bytes32 arenaId. Its computeOutcomeId() computes:

    keccak256(abi.encode(
      arenaId, disputeId, subject, outcomeType,
      outcomeParametersHash, narrativeHash,
      effectiveTime, expiryTime
    ))

verifyOutcome() checks Arena ID equality, effective and expiry timestamps, and recovery of the designated signer from an Ethereum personal-sign signature over that outcome hash. executeOutcome() marks that exact outcome hash executed and emits an event.

**It does not call a membership, bond, treasury or dissolution contract.** The name executeOutcome denotes recording a verified outcome, not applying the remedy to Arena operations.

### 7.1 Security boundaries

There are four material limitations in the reference verifier.

**Domain separation.** The signed outcome does not include chain ID or verifying-contract address. Identical data may be replayable across verifier deployments that accept the same Arena ID and signer. Replay prevention is local to one deployed contract and one exact hash.

**Dispute uniqueness.** Replay protection is keyed to the entire outcome hash, not to an immutable dispute ID plus revision policy. A second outcome with different parameters can be recorded for the same dispute ID. Whether that represents an appeal, correction or conflict is undefined.

**Signer governance.** The authorised signer can unilaterally rotate the signer address. The implementation does not establish committee threshold rules, timelocked rotation, conflicted-reviewer handling or an independently verifiable authority delegation.

**Evidence and remedial execution.** Evidence hashes and narrative meaning are not checked by the verifier; indeed the current hash includes a narrativeHash but not a list of evidence hashes. No contract-level allowlist maps outcome classes to permissible remedies, and no cross-contract execution capability is implemented.

The following candidate invariant is therefore **not yet implemented**:

**D1 — A remedy is executable only if it is authorised by the applicable charter and outcome policy, bound to the intended chain and contract, associated with a single live dispute revision, signed by the required independent reviewer set, and still subject to the prescribed appeal and effective-time conditions.**

A future design must separately specify appeal windows, reversals, conflicting decisions, evidence availability, nonce policy and idempotent execution. Merely adding another digital signature does not solve factual error or biased adjudication.

## 8. Custody and economic mechanism

ARENA addresses recurrent coordination failures: contribution asymmetry, ambiguous authority, opportunistic control of common assets, mission drift and lock-in. These are economic and institutional hypotheses, not measured effects.

The decision log identifies multisignature custody as the preferred arrangement for shared funds, with optional bond escrow. It leaves signing thresholds, emergency spending, signer replacement and recovery unspecified. The reference registry's MODULE_MANAGER_ROLE can advertise a treasury or bond module, but a module reference is not proof that custody is secure or that any represented funds exist.

An operational charter must distinguish **title**, **possession**, **use permission**, **discretionary spending authority** and **recordkeeping responsibility**. These may be held by different entities. A tokenised treasury cannot allocate legal title to a physical asset by declaration.

Voluntary exit is a central constraint on the exercise of institutional power, but nominal withdrawal is insufficient. The relevant costs include unreturned deposits, lost accommodation or work, removal of personal property, data portability and access to dispute records. ARENA's empirical hypothesis is that ex ante disclosure of those obligations, along with explicit review and dissolution paths, may reduce bargaining ambiguity. It has not yet been tested against comparable projects with less formal governance.

No ARENA token, public minting mechanism, fee economy or tradable governance right is specified for v0.1. Future federation must not be represented as an implemented market or decentralised constitutional system.

## 9. Adversarial model

The design assumes neither perfect administrators nor perfect observers. The following attacks and failures must be considered before operational deployment.

| Failure mode | Attack or breakdown | Current boundary | Required additional control |
|---|---|---|---|
| Recognition capture | Registrar recognises an unreviewed site | Only a registrar role may register | Review attestation and auditable admission rule |
| Status rewriting | Status manager reactivates revoked/expired record | Role-restricted update and event | Restricted transitions, reason record, appeal |
| Charter equivocation | Operator presents different charter text to participants | Digest field exists | Signed version receipt, canonical content, archive |
| Arbitrary removal | Operator assigns removal reason without independent finding | Operator role and nonzero reason | Charter-linked authority, evidence and contestation |
| Double outcome | Distinct signed outcomes for one dispute | Hash-level replay check | Dispute revision and finality policy |
| Cross-deployment replay | Signature valid at multiple verifier instances | Arena ID and signer check | Chain/contract domain separation |
| Signer compromise | Key is stolen, lost or coerced | Unilateral signer rotation | Threshold and recovery governance |
| Evidence suppression | Custodian withholds off-chain records | Hashes can reference documents | Retention, availability and independent access |
| Nonrenewal | Active record remains active past due date | Deadline is stored | Explicit expiry/review semantics |
| Material exit barrier | Participant loses assets or safe accommodation | On-chain membership exit | Off-chain contractual and custody safeguards |

These controls are architectural requirements, not verified features. The most important trust boundary remains the one between **accurate recording of a decision** and **legitimate authority to make that decision**.

## 10. Reference implementation and verification status

The development repository contains three experimental Solidity contracts and Hardhat test files:

- ArenaRegistry.sol — role-based recognition record with mutable metadata, operator, status, renewal date and modules.
- ArenaMembership.sol — operator-managed membership with self-exit and active-count tracking.
- DisputeOutcomeVerifier.sol — single-signer outcome verification, time checks and local hash replay protection.

The repository also includes an operator guide, recognition standard, charter template, status model, identity specification, decision log, module standard and proposed DAO governance roadmap.

At the time of this paper, tests in the repository cover ordinary registration and updates, basic access restrictions, membership admission and exit, invalid calls, successful dispute verification, wrong Arena ID, invalid signer, exact-hash replay, early effective times and expiry. This paper has inspected source and test definitions; it does **not** report a fresh execution of the test suite, code coverage figures, formal verification or an external security audit.

The following matrix prevents document claims from being mistaken for contract guarantees.

| Protocol concern | Reference code state | Institutional or future dependency |
|---|---|---|
| Site boundary and objective | Not represented as verified fields | Public charter and lawful access review |
| Recognition | Role-restricted registration, initially Active | Review evidence and transition policy |
| Charter integrity | Mutable bytes32 charterHash | Canonical content, version acceptance, archival access |
| Membership self-exit | Implemented for ACTIVE address | Settlement and safe practical exit |
| Bond custody | No bond contract in reviewed core | Custody and remedial rules |
| Dispute signature | Single signer, personal-sign | Domain separation, committee logic, appeal |
| Dispute remedy | Records verified outcome only | Authorised remedy mapping and execution |
| Renewal | Stores uint64 deadline | Expiry and review enforcement |
| DAO federation | Not implemented in reviewed contracts | Identity, franchise, anti-capture rules |

A protocol conformance suite is not complete until it includes negative and adversarial tests against the desired invariants, not just successful calls to reference methods. Required test families include: attempted unreviewed recognition, forbidden status transitions, stale and conflicting charters, attempted early removal, repeated dispute revisions, signature replay across deployments, compromised signer recovery, missing evidence, renewal expiry and loss of access to the physical site.

## 11. Evaluation design

ARENA's claim of usefulness must be operationally testable. A controlled initial study can compare two hypothetical site operating agreements through a set of identical scenarios; it must then be followed by real, consent-based evaluation before claims of performance.

Candidate measures are:

- **Authority clarity:** proportion of scenario decisions for which participants identify the same authorised actor and escalation path.
- **Dispute handling:** number of unresolved decision points, time to a reviewable outcome, and frequency of contradictory interpretations.
- **Contribution asymmetry:** difference between documented obligations and verified completion, with attention to measurement error.
- **Exit friction:** costs and time required to leave, recover property and settle obligations, separately from on-chain status.
- **Record integrity:** proportion of decisions for which the applicable charter version and supporting evidence remain retrievable.
- **Authority concentration:** proportion of decisions made unilaterally, including emergency exceptions and later reversals.

A tabletop comparison tests **legibility and interpretability**, not behaviour in a live institution. Field comparisons require explicit consent, handling of sensitive records, local legal review where necessary, and acknowledgement of confounders such as site type, participant selection and dispute severity. No quantitative improvement is asserted at this stage.

## 12. Priority unresolved decisions

Before a production protocol can claim enforceable membership, reliable recognition or verifiable remedies, the following decisions require specification and implementation.

**Identity and charters.** Canonical Arena identifier, charter document encoding, revision acceptance, fork/continuity rules and archival guarantees.

**Recognition.** Independent review proof, status-transition policy, expiry and renewal behaviour, reason codes, appeal and correction.

**Authority and membership.** Admission consent, role assignment, restricted removals, emergency powers, re-entry and relation between local and registry identities.

**Dispute finality.** Typed and domain-separated signatures, dispute revision rules, committee thresholds, appeal intervals, authorised action map and atomic or reversible application.

**Custody and exit.** Treasury threshold and recovery, optional bond escrow, refund sequencing, outstanding liabilities and safe departure from a physical site.

**Evidence.** Hash and storage formats, retention, encrypted/private document access, deletion requirements and independent availability.

**Verification.** Contract property tests, conformance harnesses, independent review, adversarial tabletop studies and eventually a consenting site-level pilot.

These are not optional polishing tasks. They define whether ARENA's central design principles can be implemented without creating the very discretionary control and lock-in that the protocol seeks to limit.

## 13. Conclusion

ARENA proposes that coordination in a physical environment can be made more explicit by specifying its boundaries and decision rights before selecting digital governance machinery. The present reference implementation establishes three partial capabilities: a stewarded registry of mutable recognition records, a minimal membership state machine with self-exit, and signed outcome verification with local replay protection. None currently enforces the full institutional guarantees described in the source specifications.

The distinguishing question is not whether governance can be put on a blockchain. It is whether a formal institution can preserve accountable authority, evidence, reversible participation and practical exit when digital records and physical obligations diverge.

The protocol remains an open research and engineering problem. This paper identifies its testable interfaces, implemented limits and unresolved security and institutional decisions. A stronger claim must be earned through specification conformance, adversarial testing and observed use.

## Source basis

This paper is based on the ARENA repository's governance minimum primitive, identity and membership specifications, lifecycle and dispute payload specifications, recognition and status standards, charter template, operator guide, decision log, module standard and governance roadmap; plus ArenaRegistry.sol, ArenaMembership.sol, DisputeOutcomeVerifier.sol and their accompanying Hardhat tests. The original Registry DAO Whitepaper v0.1 is retained as an archived concept-stage source.

The development repository remains private. Public text does not constitute proof of deployment, title, legal compliance, solvency, safety, audited code or empirical effectiveness.
