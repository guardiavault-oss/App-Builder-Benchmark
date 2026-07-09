import test from "node:test"
import assert from "node:assert/strict"
import { scoreResult } from "../scoring/score.mjs"

test("sums dimensions for a shippable result", () => {
  const out = scoreResult({
    scoring: {
      intentFidelity: 20,
      coreWorkflows: 20,
      correctionBurden: 15,
      changeResilience: 12,
      security: 15,
      accessibility: 5,
    },
    criticalFailures: [],
  })
  assert.equal(out.uncapped, 87)
  assert.equal(out.total, 87)
  assert.equal(out.decision, "SHIP")
})

test("one confirmed critical failure caps an otherwise strong app to zero", () => {
  const out = scoreResult({
    scoring: {
      intentFidelity: 20,
      coreWorkflows: 25,
      correctionBurden: 20,
      changeResilience: 15,
      security: 0,
      accessibility: 5,
    },
    criticalFailures: [{ code: "cross_tenant_leakage", present: true, evidence: "Owner A read Owner B data" }],
  })
  assert.equal(out.uncapped, 85)
  assert.equal(out.total, 0)
  assert.equal(out.decision, "NO_SHIP")
})

test("rejects out-of-range dimension scores", () => {
  assert.throws(() => scoreResult({ scoring: {
    intentFidelity: 21,
    coreWorkflows: 25,
    correctionBurden: 20,
    changeResilience: 15,
    security: 15,
    accessibility: 5,
  }, criticalFailures: [] }), /intentFidelity/)
})
