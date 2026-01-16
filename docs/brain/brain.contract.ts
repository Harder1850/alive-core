/**
 * ALIVE Brain — Architectural Contract (Phase 16)
 * =================================================
 *
 * IMPORTANT (Binding):
 * - Architecture-only. Interfaces + types + comments only.
 * - This file is NOT imported, NOT compiled, and must contain NO execution logic.
 * - Do NOT add runtime behavior, schedulers, plugins, background loops, or heuristics.
 * - Do NOT modify /spine. The Spine remains supreme and authoritative.
 *
 * Location rule:
 * - Phase 16 requires a single neutral file: `docs/brain/brain.contract.ts`
 * - This file is the canonical code-form contract; we will later move/split if ratified.
 *
 * Source of truth:
 * - docs/brain/BRAIN.md (Phase 16 Brain Contract)
 * - “mapping report gaps” are represented as TODO notes and explicit boundary types.
 */

// ============================================================================
// Shared contract primitives (interface-only; no imports)
// ============================================================================

/**
 * Contract version for Phase 16.
 *
 * Architectural intent:
 * - Enables future migration/versioning without changing authority boundaries.
 */
export type BrainContractVersion = "phase-16";

/**
 * Opaque identifier helpers.
 *
 * NOTE:
 * - These are branded string types to convey intent only.
 * - They provide no runtime validation.
 */
export type BrandedId<TBrand extends string> = string & { readonly __brand: TBrand };
export type TickId = BrandedId<"TickId">;
export type IntentId = BrandedId<"IntentId">;
export type GoalId = BrandedId<"GoalId">;
export type ExperienceId = BrandedId<"ExperienceId">;
export type FailureId = BrandedId<"FailureId">;

/**
 * Minimal failure artifact.
 *
 * Brain Contract references:
 * - docs/brain/BRAIN.md §7 Failure Semantics
 *
 * Requirements:
 * - Explicit, attributable, non-fatal.
 * - Must be recordable as experience by downstream systems.
 */
export interface BrainFailureArtifact {
  readonly id: FailureId;
  readonly subsystem: BrainSubsystemId;
  /** Machine-readable code for aggregation and future policy. */
  readonly code: string;
  /** Human-readable description for inspection/debugging. */
  readonly message: string;
  /** Optional structured details (opaque to the contract). */
  readonly details?: unknown;
  /**
   * Whether the subsystem can continue this tick.
   *
   * IMPORTANT:
   * - Even if `recoverable: false`, the Spine must not halt.
   */
  readonly recoverable: boolean;
  /** Optional causal chain. */
  readonly causedBy?: BrainFailureArtifact;
}

/**
 * Subsystem identifiers for traceability.
 */
export type BrainSubsystemId =
  | "B1:CognitiveLoop"
  | "B2:ConsciousWorkspace"
  | "B3:IntentGeneration"
  | "B4:GoalSystem"
  | "B5:ExperienceInterpreter"
  | "B6:MemoryDerivation"
  | "B7:SelfModel";

/**
 * A structured, immutable snapshot.
 *
 * This contract uses snapshot types to enforce read-only boundaries.
 * No mutation methods are permitted.
 */
export interface ImmutableSnapshot<T> {
  readonly value: Readonly<T>;
}

/**
 * A total ordering indicator.
 * 0 is highest relevance (most salient).
 */
export type RelevanceRank = number;

/** 0..1 inclusive, by convention. */
export type NormalizedScore = number;

// ============================================================================
// B2 — Conscious Workspace (Read Boundary Only)
// ============================================================================

/**
 * B2 — Conscious Workspace (Read Boundary Only)
 *
 * Brain Contract references:
 * - docs/brain/BRAIN.md §4 B2 — Conscious Workspace
 * - docs/brain/SPINE.md §7 Tick Lifecycle (workspace update is Spine-owned)
 *
 * Binding constraints:
 * - The Brain may only READ a snapshot.
 * - Workspace logic (admission, eviction, constraints) is Spine-owned and is not redefined here.
 */
export interface B2ConsciousWorkspaceSnapshot {
  /** Identifies the Spine tick this snapshot corresponds to. */
  readonly tickId: TickId;

  /**
   * Capacity and boundedness metadata.
   *
   * “capacity-limited”, “relevance-selected”, “resettable per tick”, “not persistent”.
   */
  readonly capacity: {
    /** Maximum number of items the workspace may contain this tick. */
    readonly maxItems: number;
    /** Current number of items available in the snapshot. */
    readonly currentItems: number;
    /** Optional byte/char/token budget metadata if available. */
    readonly budgetHint?: {
      readonly unit: "bytes" | "chars" | "tokens" | "items";
      readonly max: number;
      readonly current: number;
    };
  };

  /**
   * The ordered contents the Brain is allowed to see.
   *
   * Ordering:
   * - Must be relevance-ordered (most relevant first).
   * - The Brain must not assume completeness outside this set.
   */
  readonly items: ReadonlyArray<B2WorkspaceItem>;
}

/**
 * A single unit of conscious content admitted by the Spine.
 *
 * NOTE:
 * - This is intentionally generic/opaque: the Brain Contract needs a read boundary,
 *   not a full schema.
 * - Downstream implementers may carry structured payloads.
 */
export interface B2WorkspaceItem {
  readonly id: BrandedId<"WorkspaceItemId">;
  /**
   * High-level kind to allow coarse routing.
   *
   * TODO(mapping-report): refine kinds once the mapping report enumerates workspace content types.
   */
  readonly kind:
    | "salient-experience"
    | "goal"
    | "question"
    | "conflict"
    | "reflection"
    | "system"
    | "opaque";
  /** Relevance score/rank as provided by Spine-owned selection. */
  readonly relevance: {
    readonly rank: RelevanceRank;
    readonly score?: NormalizedScore;
  };
  /** Opaque payload; must be treated as immutable by Brain code. */
  readonly payload: unknown;
  /** Optional provenance metadata for attribution/inspection. */
  readonly provenance?: {
    readonly source: string;
    readonly timestampMs?: number;
  };
}

// ============================================================================
// B3 — Intent Generation Interface
// ============================================================================

/**
 * B3 — Intent Generation Interface
 *
 * Brain Contract references:
 * - docs/brain/BRAIN.md §4 B3 — Intent Generation
 *
 * Binding constraints:
 * - Intent generation is never authoritative.
 * - No arbitration, constraint enforcement, or execution lives here.
 */
export type IntentSource =
  | "reactive"
  | "reflective"
  | "goal-driven"
  | "self-model"
  | "external-suggestion"
  | "unknown";

/**
 * Candidate intent proposed by the Brain.
 *
 * IMPORTANT:
 * - This is a candidate only; the Spine arbitrates deterministically.
 */
export interface IntentCandidate {
  readonly id: IntentId;
  readonly source: IntentSource;

  /**
   * Confidence indicates how strongly the generator believes this intent should survive.
   * Convention: 0..1
   */
  readonly confidence: NormalizedScore;

  /**
   * Priority is an *input signal* to arbitration, not authority.
   * Convention: higher means more urgent; scale is implementation-defined.
   */
  readonly priority: number;

  /**
   * Opaque intent payload for downstream translation.
   *
   * TODO(mapping-report): align with the project’s existing runtime intent schema(s)
   * without importing them here.
   */
  readonly payload: unknown;

  /** Optional explanation used for introspection and future policy. */
  readonly rationale?: string;
}

/**
 * Lifecycle hooks for intent candidates.
 *
 * Contract requirement:
 * - propose / revise / withdraw exist as interface boundaries.
 * - No arbitration logic lives here.
 */
export interface B3IntentLifecycle {
  propose(intent: IntentCandidate): void;
  revise(intentId: IntentId, updated: Partial<IntentCandidate>): void;
  withdraw(intentId: IntentId, reason?: string): void;
}

/**
 * Intent generation output:
 * - a set of candidates
 * - optional lifecycle surface for revisions/withdrawals within the Brain’s own tick scope
 */
export interface B3IntentGenerationOutput {
  readonly candidates: ReadonlyArray<IntentCandidate>;
  readonly lifecycle?: B3IntentLifecycle;
}

// ============================================================================
// B4 — Goal System Interface
// ============================================================================

/**
 * B4 — Goal System Interface
 *
 * Brain Contract references:
 * - docs/brain/BRAIN.md §4 B4 — Goal System
 *
 * Binding constraints:
 * - Goals persist across ticks.
 * - Goals influence intent generation.
 * - Goals may decay/strengthen/terminate.
 * - Do NOT implement goal logic here.
 */
export type GoalStatus = "active" | "suspended" | "dormant" | "completed" | "failed" | "abandoned";

/**
 * A goal is not a command; it is an enduring preference signal.
 */
export interface Goal {
  readonly id: GoalId;
  readonly title: string;
  readonly description?: string;
  readonly status: GoalStatus;

  /**
   * Persistence and temporal metadata.
   *
   * NOTE:
   * - All fields are metadata only; no logic is implied.
   */
  readonly persistence: {
    /** The tick the goal was introduced/activated. */
    readonly createdAtTick?: TickId;
    /** The last tick where the goal was reaffirmed/updated. */
    readonly lastUpdatedAtTick?: TickId;
  };

  /**
   * Strength/decay signals. No enforcement.
   *
   * Convention: 0..1 (but may be implementation-defined).
   */
  readonly strength: {
    readonly current: NormalizedScore;
    readonly decayRatePerTick?: NormalizedScore;
    readonly strengtheningRatePerTick?: NormalizedScore;
  };

  /** Opaque structured target/success criteria. */
  readonly target?: unknown;

  /** Optional linkage to other goals. */
  readonly relationships?: {
    readonly parentGoalId?: GoalId;
    readonly childGoalIds?: ReadonlyArray<GoalId>;
    readonly blockedByGoalIds?: ReadonlyArray<GoalId>;
  };
}

/**
 * Read-only view of the goal system.
 *
 * NOTE:
 * - The Brain contract requires the Brain "maintains" goals, but Phase 16 is architecture-only.
 * - This interface is a boundary surface; downstream implementations may provide mutation APIs
 *   elsewhere, but are not specified here.
 */
export interface B4GoalSystemView {
  readonly goals: ReadonlyArray<Goal>;
  /** Convenience summaries for B7 self-model and B1 loop. */
  readonly summary?: {
    readonly activeCount: number;
    readonly dormantCount: number;
    readonly suspendedCount: number;
  };
}

// ============================================================================
// B5 — Experience Interpreter Interface (Outputs only)
// ============================================================================

/**
 * B5 — Experience Interpreter Interface
 *
 * Brain Contract references:
 * - docs/brain/BRAIN.md §4 B5 — Experience Interpreter
 *
 * Binding constraints:
 * - Input is immutable experience.
 * - Outputs only: tags, relevance scores, goal impact, memory signals.
 * - No storage, no summarization of history.
 */
export interface ImmutableExperience {
  readonly id: ExperienceId;
  /** The tick where this experience crossed the boundary (if known). */
  readonly tickId?: TickId;
  /** Opaque experience payload, append-only and immutable by invariant. */
  readonly payload: unknown;
  /** Optional provenance/trace metadata. */
  readonly provenance?: {
    readonly source: string;
    readonly timestampMs?: number;
  };
}

/** Tag emitted by the interpreter. */
export interface ExperienceTag {
  readonly tag: string;
  readonly confidence?: NormalizedScore;
  readonly notes?: string;
}

/**
 * Interpreter output shape (no methods; no storage implied).
 */
export interface B5ExperienceInterpretation {
  readonly experienceId: ExperienceId;

  /** Meaning/labels for downstream cognition/memory derivation. */
  readonly tags: ReadonlyArray<ExperienceTag>;

  /** Relevance/salience scoring for goals and future attention. */
  readonly relevance: {
    readonly overall: NormalizedScore;
    /** Optional breakdown by dimension (implementation-defined). */
    readonly dimensions?: Readonly<Record<string, NormalizedScore>>;
  };

  /**
   * Estimated impact on goals.
   *
   * NOTE:
   * - This is informational; it does not mutate goals.
   */
  readonly goalImpact: ReadonlyArray<{
    readonly goalId: GoalId;
    readonly deltaStrength?: number;
    readonly impactScore: NormalizedScore;
    readonly explanation?: string;
  }>;

  /**
   * Memory signals for B6 derivation.
   *
   * Examples: “store episodic”, “update semantic”, “consolidate”, etc.
   * The contract does not prescribe semantics—only that signals are explicit.
   */
  readonly memorySignals: ReadonlyArray<{
    readonly kind: string;
    readonly strength: NormalizedScore;
    readonly payload?: unknown;
  }>;
}

// ============================================================================
// B6 — Memory Derivation Interface (Invocation boundary; opaque outputs)
// ============================================================================

/**
 * B6 — Memory Derivation Interface
 *
 * Brain Contract references:
 * - docs/brain/BRAIN.md §4 B6 — Memory Derivation Interface
 * - docs/brain/SPINE.md §9 Memory (derived, not stored)
 *
 * Critical binding constraints:
 * - Inputs: immutable experience stream (append-only).
 * - Outputs: derived representations (opaque to this contract).
 * - Invocation boundary is explicit:
 *   - when derivation is triggered
 *   - and who owns the trigger (Brain-owned, not runtime, not plugin).
 * - Do NOT implement remember/recall logic.
 * - Do NOT move existing memory code.
 */

/**
 * Opaque derived memory representation.
 *
 * Rationale:
 * - Prevents this contract from coupling to any current or future memory implementation.
 */
export type DerivedMemoryRepresentation = unknown;

/**
 * Immutable experience stream boundary.
 *
 * NOTE:
 * - This is not a background loop.
 * - It is a structural type describing the input surface.
 */
export interface ImmutableExperienceStream {
  /**
   * The experiences to consider for derivation.
   * Must be treated as immutable/append-only.
   */
  readonly experiences: ReadonlyArray<ImmutableExperience>;
}

/**
 * Specifies why/when derivation is being invoked.
 *
 * Ownership:
 * - The Brain decides and initiates invocation.
 * - This must not be delegated to a plugin, scheduler, or runtime background agent.
 */
export type MemoryDerivationTrigger =
  | {
      readonly kind: "per-tick";
      readonly tickId: TickId;
    }
  | {
      readonly kind: "manual";
      readonly reason: string;
      readonly requestedBy: string;
    }
  | {
      readonly kind: "batch";
      readonly reason: string;
      readonly range?: {
        readonly fromExperienceId?: ExperienceId;
        readonly toExperienceId?: ExperienceId;
      };
    };

/**
 * Result of a memory derivation attempt.
 *
 * Failure semantics:
 * - Non-fatal
 * - Explicit failure artifacts
 */
export interface B6MemoryDerivationResult {
  readonly trigger: MemoryDerivationTrigger;
  readonly derived: ReadonlyArray<DerivedMemoryRepresentation>;
  readonly failures: ReadonlyArray<BrainFailureArtifact>;
}

/**
 * Invocation boundary for memory derivation.
 *
 * This interface does not define *who stores* derived memory.
 * It only defines the derivation transform boundary.
 */
export interface B6MemoryDeriver {
  derive(
    input: {
      readonly trigger: MemoryDerivationTrigger;
      readonly stream: ImmutableExperienceStream;
      /** Optional interpreter outputs, if available to derivation. */
      readonly interpretations?: ReadonlyArray<B5ExperienceInterpretation>;
    }
  ): B6MemoryDerivationResult;
}

// ============================================================================
// B7 — Self-Model (Minimal; operational self-awareness)
// ============================================================================

/**
 * B7 — Self-Model (Minimal)
 *
 * Brain Contract references:
 * - docs/brain/BRAIN.md §4 B7 — Self-Model (Minimal)
 *
 * Binding constraints:
 * - Operational self-awareness, not personality.
 * - Read-only view of capabilities, limits, active goals (summary), recent failures.
 */

/**
 * A minimal capability descriptor.
 *
 * NOTE:
 * - This is intentionally not tied to any runtime capability registry.
 */
export interface SelfKnownCapability {
  readonly name: string;
  readonly available: boolean;
  readonly description?: string;
  /** Optional constraints/limits for this capability (opaque). */
  readonly limits?: unknown;
}

export interface SelfCurrentLimit {
  readonly kind: string;
  readonly description: string;
  readonly severity?: "low" | "medium" | "high";
}

export interface SelfGoalSummary {
  readonly goalId: GoalId;
  readonly title: string;
  readonly status: GoalStatus;
  readonly strength?: NormalizedScore;
}

/**
 * Recent failure summary (non-fatal; inspectable).
 */
export interface SelfRecentFailureSummary {
  readonly failureId: FailureId;
  readonly subsystem: BrainSubsystemId;
  readonly code: string;
  readonly message: string;
  readonly tickId?: TickId;
}

/**
 * The minimal operational self-model.
 */
export interface B7SelfModel {
  readonly contractVersion: BrainContractVersion;

  /** Known capabilities (read-only view). */
  readonly capabilities: ReadonlyArray<SelfKnownCapability>;

  /** Current limits (resource, permissions, missing capability, etc.). */
  readonly limits: ReadonlyArray<SelfCurrentLimit>;

  /** Active goals at a summary level (not the full goal graph). */
  readonly activeGoals: ReadonlyArray<SelfGoalSummary>;

  /** Recent failures for operational adaptation and inspection. */
  readonly recentFailures: ReadonlyArray<SelfRecentFailureSummary>;

  /**
   * Explicit statement of scope.
   *
   * This must remain operational, not personality.
   */
  readonly scope: "operational-self-awareness";
}

// ============================================================================
// B1 — Cognitive Loop (Non-Authoritative)
// ============================================================================

/**
 * B1 — Cognitive Loop (Non-Authoritative)
 *
 * Brain Contract references:
 * - docs/brain/BRAIN.md §4 B1 — Cognitive Loop (Non-Authoritative)
 * - docs/brain/BRAIN.md §7 Failure Semantics
 *
 * Binding constraints:
 * - Runs once per Spine tick (conceptually).
 * - Consumes a read-only snapshot of the conscious workspace.
 * - Produces candidate intents + reflections.
 * - Has no execution power and no authority.
 * - May stall or fail without halting the Spine.
 *
 * NOTE:
 * - This is NOT a scheduler. This is a callable contract boundary.
 */

/**
 * Reflection artifacts emitted by the Brain.
 *
 * NOTE:
 * - Reflections are informational artifacts for downstream inspection, self-model updates,
 *   or later memory derivation.
 * - This contract does not prescribe where reflections are stored.
 */
export interface BrainReflection {
  readonly id: BrandedId<"ReflectionId">;
  readonly tickId: TickId;
  readonly kind: "note" | "hypothesis" | "plan" | "warning" | "unknown";
  readonly content: string;
  readonly tags?: ReadonlyArray<string>;
}

/**
 * B1 loop input: explicit read-only snapshot.
 */
export interface B1CognitiveLoopInput {
  /** The conscious workspace snapshot the Brain is allowed to see (B2 boundary). */
  readonly workspace: ImmutableSnapshot<B2ConsciousWorkspaceSnapshot>;

  /** Optional: read-only view of the goal system (B4 boundary). */
  readonly goals?: ImmutableSnapshot<B4GoalSystemView>;

  /** Optional: minimal operational self-model (B7 boundary). */
  readonly selfModel?: ImmutableSnapshot<B7SelfModel>;

  /** Optional: recent immutable experience(s) for interpretation (B5/B6 boundaries). */
  readonly recentExperience?: ImmutableSnapshot<ReadonlyArray<ImmutableExperience>>;
}

/**
 * B1 loop output: candidate intents + reflections + explicit failures.
 */
export interface B1CognitiveLoopOutput {
  readonly tickId: TickId;
  readonly intents: B3IntentGenerationOutput;
  readonly reflections: ReadonlyArray<BrainReflection>;
  /** Explicit, non-fatal failures for recording and inspection. */
  readonly failures: ReadonlyArray<BrainFailureArtifact>;
}

/**
 * The B1 cognitive loop contract.
 *
 * IMPORTANT:
 * - No authority. No execution.
 * - Implementations must return failures explicitly instead of throwing.
 */
export interface B1CognitiveLoop {
  readonly id: "B1:CognitiveLoop";
  tick(input: B1CognitiveLoopInput): B1CognitiveLoopOutput;
}

// ============================================================================
// Optional: Brain “composition” surface (interfaces only)
// ============================================================================

/**
 * A complete Brain (architecturally) is composed of B1–B7.
 *
 * Brain Contract references:
 * - docs/brain/BRAIN.md §4 Required Subsystems (Non-Optional)
 * - docs/brain/BRAIN.md §10 Completion Criteria (Phase 16 Exit)
 *
 * NOTE:
 * - This is a purely structural shape that future implementations can satisfy.
 * - It introduces no runtime wiring.
 */
export interface AliveBrainArchitecture {
  readonly contractVersion: BrainContractVersion;

  readonly B1: B1CognitiveLoop;
  readonly B2: {
    /** Read-only boundary; the Spine owns updates and selection. */
    readonly readSnapshot: () => B2ConsciousWorkspaceSnapshot;
  };
  readonly B3: {
    /**
     * Intent generation boundary.
     *
     * NOTE:
     * - Actual generation typically occurs inside B1.tick; this exists for architectural clarity.
     */
    readonly types: {
      readonly IntentCandidate: IntentCandidate;
    };
  };
  readonly B4: B4GoalSystemView;
  readonly B5: {
    /** Outputs-only transform boundary. */
    readonly interpret: (experience: ImmutableExperience) => B5ExperienceInterpretation;
  };
  readonly B6: B6MemoryDeriver;
  readonly B7: B7SelfModel;
}

/**
 * TODO(mapping-report):
 * - Add explicit cross-references to existing downstream implementers once the mapping report
 *   is available in-repo (file path, module name) without importing them here.
 */

