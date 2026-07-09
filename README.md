# NO-RESCUE Benchmark

**An independent, adversarial benchmark for AI application builders.**

Lovable · Bolt · Replit · v0 · Base44 · Firebase Studio · Bubble · WholeStack · …

> A gorgeous app that lets User A read User B's private data did not score 84/100. It failed.

Most AI-builder comparisons score screenshots. NO-RESCUE refuses to. Every entrant receives the same frozen prompt, the real running app is exercised in a browser, every correction round is counted, and critical failures cannot be averaged away by polish.

## Season Zero

- 8 builders
- 4 applications selected from a frozen 12-prompt pool
- 1 meaningful change-resilience test per selected application
- free/default agent only
- full uncut recording
- public evidence receipt

## Core rule

A critical failure forces:

```text
TOTAL: 0/100
DECISION: NO_SHIP
```

Critical failures include cross-user or cross-tenant data leakage, authentication bypass, unauthorized destructive mutations, fake core functionality presented as real, and a fundamental wrong-product interpretation.

## Repository map

```text
SPEC.md                         benchmark protocol
prompts/pool.json              frozen 12-prompt machine source of truth
selection/select.mjs           deterministic public-beacon selector
schema/result.schema.json      result contract
scoring/score.mjs              dependency-free reference scorer
scripts/validate-repo.mjs      repository + example validation
harness/                       Playwright evidence collection + adapter contract
results/EXAMPLE-*              proof that SHIP and critical-cap NO_SHIP both work
submissions/RULES.md           public submission requirements
```

## Local validation

```bash
npm ci
npm run validate
npm test
npm run score:ship
npm run score:noship   # exits 1 by design because the example is NO_SHIP
```

## Run browser evidence collection

```bash
APP_URL=https://example-builder-app.test \
BUILDER=example-builder \
PROMPT_ID=B1 \
npm run evidence
```

The generic collector records console/page errors, accessibility-visible controls, screenshots, and basic runtime metadata. Prompt-specific acceptance checks are defined by the frozen contract and implemented through transparent per-builder adapters; adapters may locate and operate controls, but they do not define or alter the assertions.

## Independence

WholeStack is an entrant, not the judge. This repository is deliberately separate from every builder being tested.
