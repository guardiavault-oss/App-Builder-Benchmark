import { test, expect } from "@playwright/test"
import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

const appUrl = process.env.APP_URL
const builder = process.env.BUILDER ?? "unknown-builder"
const promptId = process.env.PROMPT_ID ?? "unknown-prompt"

if (!appUrl) throw new Error("APP_URL is required")

const outDir = resolve("test-results", builder, promptId)

test("collect neutral runtime evidence", async ({ page }) => {
  const consoleErrors = []
  const pageErrors = []
  const failedRequests = []

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text())
  })
  page.on("pageerror", (error) => pageErrors.push(error.message))
  page.on("requestfailed", (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? "unknown" }))

  const response = await page.goto(appUrl, { waitUntil: "domcontentloaded" })
  expect(response, "initial navigation returned no response").not.toBeNull()
  expect(response?.status(), "initial page returned an HTTP error").toBeLessThan(400)

  await page.waitForTimeout(1500)
  await mkdir(outDir, { recursive: true })
  await page.screenshot({ path: resolve(outDir, "landing.png"), fullPage: true })

  const inventory = await page.locator("a,button,input,textarea,select,[role=button],[role=link]").evaluateAll((nodes) =>
    nodes.slice(0, 500).map((node) => ({
      tag: node.tagName.toLowerCase(),
      role: node.getAttribute("role"),
      text: (node.innerText || node.getAttribute("aria-label") || node.getAttribute("placeholder") || "").trim().slice(0, 200),
      href: node.getAttribute("href"),
      type: node.getAttribute("type"),
      disabled: "disabled" in node ? Boolean(node.disabled) : false,
    }))
  )

  const evidence = {
    builder,
    promptId,
    appUrl,
    capturedAt: new Date().toISOString(),
    title: await page.title(),
    finalUrl: page.url(),
    consoleErrors,
    pageErrors,
    failedRequests,
    interactiveInventory: inventory,
  }

  await writeFile(resolve(outDir, "runtime-evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`)

  expect(pageErrors, `uncaught page errors: ${pageErrors.join(" | ")}`).toEqual([])
})
