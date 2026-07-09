import test from "node:test"
import assert from "node:assert/strict"
import { getContract, listContracts } from "./contracts.mjs"
import { validateAdapterCoverage } from "./contract-runner.mjs"

test("all 12 prompt entries compile into stable check IDs", () => {
  const contracts = listContracts()
  assert.equal(contracts.length, 12)
  for (const contract of contracts) {
    assert.equal(contract.checks.length, 5)
    contract.checks.forEach((check, index) => assert.equal(check.id, `${contract.id}.${index + 1}`))
  }
})

test("adapter coverage rejects a missing frozen check", () => {
  const contract = getContract("B1")
  const adapter = { checks: { [contract.checks[0].id]: async () => ({ passed: true, observed: "ok" }) } }
  assert.throws(() => validateAdapterCoverage(contract, adapter), /missing frozen checks/)
})

test("adapter coverage accepts exactly the frozen contract", () => {
  const contract = getContract("C1")
  const checks = Object.fromEntries(contract.checks.map((check) => [check.id, async () => ({ passed: true, observed: "observed" })]))
  assert.equal(validateAdapterCoverage(contract, { checks }), true)
})
