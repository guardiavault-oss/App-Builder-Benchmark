import { readFileSync } from "node:fs"

const pool = JSON.parse(readFileSync(new URL("../prompts/pool.json", import.meta.url), "utf8"))

export function getContract(promptId) {
  const category = promptId?.[0]
  const entry = pool.categories?.[category]?.find((item) => item.id === promptId)
  if (!entry) throw new Error(`unknown prompt contract: ${String(promptId)}`)

  return {
    ...entry,
    checks: entry.acceptanceChecks.map((assertion, index) => ({
      id: `${entry.id}.${index + 1}`,
      assertion,
    })),
  }
}

export function listContracts() {
  return Object.values(pool.categories).flat().map((entry) => getContract(entry.id))
}
