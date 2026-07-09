#!/usr/bin/env node

import { createHash } from "node:crypto"
import { writeFileSync } from "node:fs"
import { resolve } from "node:path"

const DOMAIN = Buffer.from("NO-RESCUE-v1", "utf8")
const CATEGORIES = ["A", "B", "C", "D"]

function normalizeBeacon(value) {
  const cleaned = value.trim().toLowerCase().replace(/^0x/, "")
  if (!/^[0-9a-f]+$/.test(cleaned) || cleaned.length % 2 !== 0) {
    throw new Error("beacon must be an even-length hexadecimal string")
  }
  return Buffer.from(cleaned, "hex")
}

export function selectPrompts(beaconHex) {
  const beacon = normalizeBeacon(beaconHex)
  return CATEGORIES.map((category) => {
    const digest = createHash("sha256").update(beacon).update(DOMAIN).update(category).digest()
    const index = digest[0] % 3
    return { category, index, promptId: `${category}${index + 1}`, selectorByte: digest[0] }
  })
}

function arg(name) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}

if (process.argv[1] && import.meta.url === new URL(`file://${resolve(process.argv[1])}`).href) {
  try {
    const beacon = arg("--beacon")
    if (!beacon) throw new Error("usage: node selection/select.mjs --beacon <hex> [--output selection.result.json] [--dry-run]")
    const selections = selectPrompts(beacon)
    const output = {
      benchmarkVersion: "1.0",
      algorithm: "sha256(beacon_bytes || NO-RESCUE-v1 || category_id)[0] mod 3",
      beacon,
      selectedAt: new Date().toISOString(),
      selections,
    }
    const text = `${JSON.stringify(output, null, 2)}\n`
    if (process.argv.includes("--dry-run")) {
      process.stdout.write(text)
    } else {
      const path = arg("--output") ?? "selection.result.json"
      writeFileSync(path, text)
      console.log(`wrote ${path}`)
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(2)
  }
}
