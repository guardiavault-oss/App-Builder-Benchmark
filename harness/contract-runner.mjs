#!/usr/bin/env node

import { chromium } from "@playwright/test"
import { mkdir, writeFile } from "node:fs/promises"
import { pathToFileURL } from "node:url"
import { resolve } from "node:path"
import { getContract } from "./contracts.mjs"

export function validateAdapterCoverage(contract, adapter) {
  if (!adapter || typeof adapter !== "object") throw new Error("adapter must export a default object")
  if (!adapter.checks || typeof adapter.checks !== "object") throw new Error("adapter must define a checks object")

  const missing = contract.checks.filter((check) => typeof adapter.checks[check.id] !== "function").map((check) => check.id)
  if (missing.length) throw new Error(`adapter is missing frozen checks: ${missing.join(", ")}`)
  return true
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value
}

function normalizeCheckResult(check, value) {
  if (!value || typeof value !== "object") throw new Error(`${check.id} returned no evidence object`)
  if (typeof value.passed !== "boolean") throw new Error(`${check.id} must return { passed: boolean, observed: string }`)
  if (typeof value.observed !== "string" || !value.observed.trim()) throw new Error(`${check.id} must describe what was observed`)
  return {
    id: check.id,
    assertion: check.assertion,
    passed: value.passed,
    observed: value.observed,
    evidence: Array.isArray(value.evidence) ? value.evidence : [],
  }
}

async function main() {
  const appUrl = requireEnv("APP_URL")
  const promptId = requireEnv("PROMPT_ID")
  const adapterPath = requireEnv("ADAPTER_PATH")
  const builder = process.env.BUILDER ?? "unknown-builder"
  const contract = getContract(promptId)
  const adapterModule = await import(pathToFileURL(resolve(adapterPath)).href)
  const adapter = adapterModule.default
  validateAdapterCoverage(contract, adapter)

  const outputDir = resolve("test-results", builder, promptId, "contract")
  await mkdir(outputDir, { recursive: true })

  const browser = await chromium.launch()
  const context = await browser.newContext({ recordVideo: { dir: outputDir } })
  const page = await context.newPage()
  const consoleErrors = []
  const pageErrors = []
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text())
  })
  page.on("pageerror", (error) => pageErrors.push(error.message))

  const results = []
  try {
    await page.goto(appUrl, { waitUntil: "domcontentloaded" })
    if (typeof adapter.setup === "function") await adapter.setup({ page, contract, builder, outputDir })

    for (const check of contract.checks) {
      const started = Date.now()
      let normalized
      try {
        const value = await adapter.checks[check.id]({ page, check, contract, builder, outputDir })
        normalized = normalizeCheckResult(check, value)
      } catch (error) {
        normalized = {
          id: check.id,
          assertion: check.assertion,
          passed: false,
          observed: `adapter/test error: ${error instanceof Error ? error.message : String(error)}`,
          evidence: [],
        }
      }
      normalized.durationMs = Date.now() - started
      const screenshot = resolve(outputDir, `${check.id.replaceAll(".", "-")}.png`)
      await page.screenshot({ path: screenshot, fullPage: true })
      normalized.screenshot = screenshot
      results.push(normalized)
    }
  } finally {
    if (typeof adapter.teardown === "function") await adapter.teardown({ page, contract, builder, outputDir }).catch(() => {})
    await context.close()
    await browser.close()
  }

  const report = {
    benchmarkVersion: "1.0",
    builder,
    promptId,
    appUrl,
    generatedAt: new Date().toISOString(),
    contractTitle: contract.title,
    results,
    consoleErrors,
    pageErrors,
    passed: results.every((result) => result.passed),
  }

  await writeFile(resolve(outputDir, "contract-results.json"), `${JSON.stringify(report, null, 2)}\n`)
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.passed ? 0 : 1)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error))
    process.exit(2)
  })
}
