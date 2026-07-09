#!/usr/bin/env node

import { readFileSync } from "node:fs"
import { scoreResult } from "../scoring/score.mjs"
import { selectPrompts } from "../selection/select.mjs"

const readJson = (url) => JSON.parse(readFileSync(new URL(url, import.meta.url), "utf8"))
const shipFixture = readJson("../results/EXAMPLE-ship/run.json")
const noShipFixture = readJson("../results/EXAMPLE-noship/run.json")
const pool = readJson("../prompts/pool.json")

const demoBeacon = "000102030405060708090a0b0c0d0e0f"

function banner(title) {
  console.log(`\n${"═".repeat(68)}`)
  console.log(title)
  console.log("═".repeat(68))
}

function printScore(label, fixture) {
  const result = scoreResult(fixture)
  console.log(`\n${label}`)
  console.log(`  builder:              ${fixture.builder}`)
  console.log(`  prompt:               ${fixture.promptId}`)
  console.log(`  correction rounds:    ${fixture.run.correctionRounds}`)
  console.log(`  messages used:        ${fixture.run.messagesUsed}`)
  console.log(`  uncapped score:       ${result.uncapped}/100`)
  console.log(`  final score:          ${result.total}/100`)
  console.log(`  decision:             ${result.decision}`)
  if (result.confirmedCriticalFailures.length) {
    for (const failure of result.confirmedCriticalFailures) {
      console.log(`  critical failure:     ${failure.code}`)
      console.log(`  evidence:             ${failure.evidence}`)
    }
  }
}

banner("NO-RESCUE BENCHMARK — LIVE DEMO")
console.log("This demo runs the real scorer and deterministic prompt selector.")

banner("1) NORMAL RESULT")
printScore("A strong result with no critical failure", shipFixture)

banner("2) CRITICAL-FAILURE CAP")
printScore("A 90/100 app with cross-tenant leakage", noShipFixture)

banner("3) PUBLIC-BEACON PROMPT SELECTION")
console.log(`Demo beacon: ${demoBeacon}`)
const selections = selectPrompts(demoBeacon)
for (const selected of selections) {
  const prompt = pool.categories[selected.category][selected.index]
  console.log(`\n  ${selected.promptId} — ${prompt.title}`)
  console.log(`  ${prompt.prompt}`)
}

banner("WHAT A REAL BUILDER RUN DOES NEXT")
console.log("1. Paste each selected prompt into a fresh app-builder project.")
console.log("2. Record every message and correction round.")
console.log("3. Publish or run the generated app and provide APP_URL.")
console.log("4. Implement the transparent adapter for the frozen checks.")
console.log("5. Run the contract harness and save its evidence.")
console.log("6. Fill run.json and score it with the reference scorer.")
console.log("\nDemo complete.")
