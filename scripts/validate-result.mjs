import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import Ajv2020 from "ajv/dist/2020.js"
import addFormats from "ajv-formats"

const schema = JSON.parse(readFileSync(new URL("../schema/result.schema.json", import.meta.url), "utf8"))
const ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ajv)
const validate = ajv.compile(schema)

export function validateResultFile(path) {
  const absolute = resolve(path)
  const data = JSON.parse(readFileSync(absolute, "utf8"))
  const valid = validate(data)
  return { valid, data, errors: valid ? [] : validate.errors ?? [] }
}

if (process.argv[1] && import.meta.url === new URL(`file://${resolve(process.argv[1])}`).href) {
  const path = process.argv[2]
  if (!path) {
    console.error("usage: node scripts/validate-result.mjs <result.json>")
    process.exit(2)
  }
  const out = validateResultFile(path)
  if (!out.valid) {
    console.error(JSON.stringify(out.errors, null, 2))
    process.exit(1)
  }
  console.log(`valid: ${path}`)
}
