# NO-RESCUE Benchmark — v1 Specification

**Status:** v1.0 candidate for Season Zero  
**Principle:** score the product that actually exists under rules that make the result reproducible, inspectable, and hard to game.

## 0. What this measures

NO-RESCUE measures whether an AI app builder can:

1. understand the requested product rather than generating a plausible lookalike;
2. implement the core workflow correctly;
3. reach a working result with few human correction rounds;
4. survive a meaningful later change without breaking prior behavior;
5. enforce security and data isolation in the running app;
6. remain usable and accessible.

It does not measure only visual polish, demo quality, or whether a builder can eventually succeed after unlimited rescue prompts.

## 1. Freeze entrants before prompt selection

Before the selected prompt in each category is known:

- WholeStack freezes a public commit SHA.
- Closed builders freeze product name, plan, visible agent/model label, and observation date.
- The frozen entrant manifest is committed before the selection beacon value exists.
- No entrant may be secretly changed for the selected prompt after the freeze.

A later product update requires a new dated benchmark run.

## 2. Same exact prompt

Every entrant receives byte-for-byte identical prompt text.

Forbidden advantages:

- rewriting or improving a prompt for one builder;
- screenshots or extra context supplied to only one entrant;
- plan mode for one entrant and instant build for another;
- a paid or premium model in the free-default league;
- private human debugging that is not counted as a correction round.

## 3. Public random selection

The 12-prompt pool is committed first: four categories × three candidates.

A future public beacon selects one prompt per category. The selection algorithm is deterministic and published in `selection/select.mjs`.

For category index `i` in canonical order A, B, C, D:

```text
byte_i = SHA-256(beacon_bytes || "NO-RESCUE-v1" || category_id)[0]
selected_index = byte_i mod 3
```

`selection.commit.json` names the future beacon before it exists. `selection.result.json` records the observed beacon value and resulting prompt IDs afterward.

## 4. Full screen recording

Recording starts before the first prompt is submitted and shows:

- fresh project state;
- exact prompt entry;
- every builder response;
- every correction;
- every build/runtime error;
- the final application.

Edited highlight reels may be published, but they are not primary evidence.

## 5. Free/default league

Season Zero uses the builder's legitimate free plan and default free agent/model.

Record:

- builder and product version/date;
- plan;
- visible agent/model label;
- start/end timestamps;
- messages used;
- correction rounds;
- visible credits/tokens consumed when exposed;
- whether the free quota was exhausted.

If the free quota is exhausted, stop and record it. Do not buy credits to rescue the run.

## 6. Test sequence

### Phase 1 — One-shot

Submit the initial prompt once. No rescue. Score what exists when the builder declares completion.

### Phase 2 — Self-repair

Give every builder the same follow-up:

> Test the application yourself. Fix anything that is broken or incomplete without removing existing requested functionality.

### Phase 3 — Acceptance-test repair

Give the entrant only the objectively failed acceptance checks. Maximum three correction rounds total across repair phases.

### Phase 4 — Change resilience

Apply the frozen later-change request for the selected prompt. Re-run original and new checks.

## 7. Scoring

Total: 100 points.

| Dimension | Max |
|---|---:|
| Intent fidelity | 20 |
| Core workflow correctness | 25 |
| Correction burden | 20 |
| Change resilience | 15 |
| Security and data isolation | 15 |
| Accessibility and responsive behavior | 5 |

The detailed rubric is in `scoring/scoring.md`.

## 8. Critical failures

Any confirmed critical failure caps the final total at 0 and forces NO_SHIP:

- cross-user or cross-tenant data leakage;
- authentication bypass;
- unauthorized destructive mutation;
- fake core functionality presented as working;
- fundamental wrong-product interpretation.

The raw dimension scores remain visible so readers can see what the app did well before the cap.

## 9. Correction burden

The published raw count always matters. Reference points:

| Separate correction rounds | Correction score |
|---|---:|
| 0 | 20 |
| 1 | 15 |
| 2 | 9 |
| 3 | 4 |
| still broken | 0 |

A "round" is one additional user instruction intended to repair one or more failures after initial generation.

## 10. Evidence package

Each valid run lives at:

```text
results/<builder>/<promptId>/
  run.json
  prompt-log.md
  recording.(mp4|webm) or a stable external evidence reference
  screenshots/
  playwright-report/ or test-results/
  security/
  source-metadata.json (when source is available)
  adapter.mjs (when prompt-specific browser automation is used)
```

## 11. Browser harness boundary

Generated apps do not share DOM structure. Therefore v1 separates:

- **assertions:** frozen centrally and identical for every builder;
- **adapters:** transparent per-builder code that only locates and operates the generated UI.

Adapters may not alter expected outcomes, skip checks, fabricate results, or directly mutate the app's backing data outside the user-visible workflow being tested.

## 12. Public submissions

After Season Zero, anyone may submit a run by pull request. Builders themselves are explicitly invited to challenge a result with a valid evidence package.

The answer to "your score is wrong" is:

> Run the protocol, publish the evidence, and submit the result.
