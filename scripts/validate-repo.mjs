import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { validateResultFile } from "./validate-result.mjs"
import { scoreResult } from "../scoring/score.mjs"

const root = resolve(new URL("..", import.meta.url).pathname)
const pool = JSON.parse(readFileSync(resolve(root, "prompts/pool.json"), "utf8"))
const expectedCategories = ["A", "B", "C", "D"]
const allIds = []

for (const category of expectedCategories) {
  const entries = pool.categories?.[category]
  if (!Array.isArray(entries) || entries.length !== 3) {
    throw new Error(`category ${category} must contain exactly 3 prompts`)
  }
  entries.forEach((entry, index) => {
    const expectedId = `${category}${index + 1}`
    if (entry.id !== expectedId) throw new Error(`expected ${expectedId}, received ${entry.id}`)
    if (!entry.prompt?.trim()) throw new Error(`${entry.id} has empty prompt text`)
    if (!Array.isArray(entry.acceptanceChecks) || entry.acceptanceChecks.length === 0) throw new Error(`${entry.id} has no acceptance checks`)
    if (!entry.changeRequest?.trim()) throw new Error(`${entry.id} has no change-resilience request`)
    allIds.push(entry.id)
  })
}

if (new Set(allIds).size !== 12) throw new Error("prompt IDs must be unique")

const shipPath = resolve(root, "results/EXAMPLE-ship/run.json")
const noShipPath = resolve(root, "results/EXAMPLE-noship/run.json")
for (const path of [shipPath, noShipPath]) {
  const result = validateResultFile(path)
  if (!result.valid) throw new Error(`${path} failed schema validation: ${JSON.stringify(result.errors)}`)
}

const ship = scoreResult(JSON.parse(readFileSync(shipPath, "utf8")))
const noShip = scoreResult(JSON.parse(readFileSync(noShipPath, "utf8")))
if (ship.decision !== "SHIP" || ship.total !== 88) throw new Error(`SHIP fixture drifted: ${JSON.stringify(ship)}`)
if (noShip.decision !== "NO_SHIP" || noShip.total !== 0 || noShip.uncapped !== 90) {
  throw new Error(`NO_SHIP fixture drifted: ${JSON.stringify(noShip)}`)
}

console.log("NO-RESCUE repository validation passed")
console.log(`- prompt pool: ${allIds.length}/12 valid`)
console.log("- result schema: 2/2 fixtures valid")
console.log("- scorer: SHIP fixture 88/100")
console.log("- critical cap: NO_SHIP fixture 90→0")
