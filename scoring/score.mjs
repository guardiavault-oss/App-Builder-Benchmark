#!/usr/bin/env node

import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const DIMENSIONS = Object.freeze({
  intentFidelity: 20,
  coreWorkflows: 25,
  correctionBurden: 20,
  changeResilience: 15,
  security: 15,
  accessibility: 5,
})

function fail(message) {
  console.error(`NO-RESCUE scorer error: ${message}`)
  process.exit(2)
}

function readResult(path) {
  try {
    return JSON.parse(readFileSync(resolve(path), "utf8"))
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error))
  }
}

export function scoreResult(result) {
  const scoring = result?.scoring ?? {}
  const dimensions = {}

  for (const [key, max] of Object.entries(DIMENSIONS)) {
    const value = scoring[key]
    if (!Number.isInteger(value) || value < 0 || value > max) {
      throw new Error(`${key} must be an integer from 0 to ${max}; received ${String(value)}`)
    }
    dimensions[key] = value
  }

  const uncapped = Object.values(dimensions).reduce((sum, value) => sum + value, 0)
  const confirmedCriticalFailures = (result.criticalFailures ?? []).filter((failure) => failure?.present === true)
  const capped = confirmedCriticalFailures.length > 0
  const total = capped ? 0 : uncapped

  return {
    dimensions,
    uncapped,
    total,
    decision: capped ? "NO_SHIP" : "SHIP",
    confirmedCriticalFailures,
  }
}

function receipt(result, out) {
  const run = result.run ?? {}
  const d = out.dimensions
  const line = (label, value, max) => `${label.padEnd(24)}${String(value).padStart(3)}/${max}`
  const failureLines = out.confirmedCriticalFailures.length
    ? out.confirmedCriticalFailures.map((failure) => `- ${failure.code}: ${failure.evidence || "evidence not described"}`)
    : ["- none"]

  return [
    "NO-RESCUE BENCHMARK",
    "────────────────────────────────",
    `Builder:                 ${result.builder ?? "—"}`,
    `Benchmark version:       ${result.benchmarkVersion ?? "—"}`,
    `Run date:                ${result.runDate ?? "—"}`,
    `Free/Paid:               ${String(result.plan ?? "—").toUpperCase()}`,
    `Prompt:                  ${result.promptId ?? "—"}`,
    `Initial build:           ${result.initialBuild ?? "—"}`,
    "",
    line("Intent fidelity", d.intentFidelity, 20),
    line("Core workflows", d.coreWorkflows, 25),
    line("Correction burden", d.correctionBurden, 20),
    line("Change resilience", d.changeResilience, 15),
    line("Security", d.security, 15),
    line("Accessibility", d.accessibility, 5),
    "",
    `UNCAPPED:                ${out.uncapped}/100`,
    `TOTAL:                   ${out.total}/100`,
    "",
    `Correction rounds:       ${run.correctionRounds ?? "—"}`,
    `Messages used:           ${run.messagesUsed ?? "—"}`,
    `Build errors:            ${run.buildErrors ?? "—"}`,
    `Regressions introduced:  ${run.regressionsIntroduced ?? "—"}`,
    `Free quota exhausted:    ${run.freeQuotaExhausted === true ? "YES" : run.freeQuotaExhausted === false ? "NO" : "—"}`,
    `Critical failures:       ${out.confirmedCriticalFailures.length}`,
    "",
    ...failureLines,
    "",
    `DECISION: ${out.decision}`,
  ].join("\n")
}

if (process.argv[1] && import.meta.url === new URL(`file://${resolve(process.argv[1])}`).href) {
  const path = process.argv[2]
  if (!path) fail("usage: node scoring/score.mjs <result.json>")

  try {
    const result = readResult(path)
    const out = scoreResult(result)
    console.log(receipt(result, out))
    process.exit(out.decision === "SHIP" ? 0 : 1)
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error))
  }
}
