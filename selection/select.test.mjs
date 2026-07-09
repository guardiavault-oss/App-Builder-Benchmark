import test from "node:test"
import assert from "node:assert/strict"
import { selectPrompts } from "./select.mjs"

test("selection is deterministic", () => {
  const beacon = "000102030405060708090a0b0c0d0e0f"
  assert.deepEqual(selectPrompts(beacon), selectPrompts(beacon))
})

test("selection returns exactly one valid prompt per category", () => {
  const selected = selectPrompts("deadbeef")
  assert.equal(selected.length, 4)
  assert.deepEqual(selected.map((item) => item.category), ["A", "B", "C", "D"])
  for (const item of selected) assert.match(item.promptId, new RegExp(`^${item.category}[123]$`))
})
