# Harness architecture

The harness has four layers.

## 1. Neutral evidence collector

`harness/tests/evidence.spec.mjs` can run against any reachable app URL. It captures:

- initial HTTP status;
- final URL and page title;
- uncaught page errors;
- console errors;
- failed network requests;
- an inventory of visible interactive controls;
- screenshots, Playwright video, and trace.

This is intentionally builder-agnostic.

## 2. Frozen prompt contracts

Acceptance checks and later-change requests live in `prompts/pool.json`. The benchmark author cannot rewrite them after the selected cases are known.

## 3. Transparent UI adapters

Different generated apps need different UI locators. Per-builder adapters may navigate and operate the app but cannot define success. Assertions remain central.

## 4. Security/source layers

When source is available:

- Semgrep Community Edition scans the exported source;
- repository metadata records the exact commit/artifact;
- secrets and obvious insecure patterns are collected as evidence.

When a live URL is available:

- OWASP ZAP baseline scanning may be attached as supplemental evidence;
- authorization and tenant-isolation checks remain browser-driven and prompt-specific.

## Evidence path

```text
results/<builder>/<promptId>/
  run.json
  recording.webm
  prompt-log.md
  screenshots/
  test-results/
  playwright-report/
  security/
  adapter.mjs
```

## Why v1 does not pretend one selector script fits every builder

A generated Lovable app, Replit app, and WholeStack app will not expose identical DOM structures. Claiming one hard-coded test file can operate all of them would be fake rigor. v1 standardizes the **contract and assertion**, publishes the **adapter**, and preserves the full recording so locator code can be audited.
