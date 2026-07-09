/**
 * Copy this file to results/<builder>/<promptId>/adapter.mjs and implement every
 * frozen check for that prompt. The central contract runner refuses missing checks.
 *
 * Each check must operate the real app through Playwright and return:
 *   { passed: boolean, observed: string, evidence?: string[] }
 *
 * Do not hard-code success. Describe what was actually observed.
 */
export default {
  async setup({ page }) {
    // Optional: sign in or create test data through the app's visible workflow.
  },

  checks: {
    // "B1.1": async ({ page, check }) => ({
    //   passed: true,
    //   observed: "Created and reopened two individually tracked assets.",
    //   evidence: ["asset list showed separate serial numbers"],
    // }),
  },

  async teardown({ page }) {
    // Optional cleanup through the app's normal workflow.
  },
}
