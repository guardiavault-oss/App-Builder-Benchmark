# Prompt-specific browser adapters

Generated apps do not share routes, labels, or DOM structure. NO-RESCUE therefore separates **frozen assertions** from **transparent adapters**.

## What an adapter may do

- navigate the generated UI;
- locate controls by visible label, role, or stable generated selector;
- create test users and test data through the app's normal user-facing workflow;
- return locators or observed values to the central assertion runner.

## What an adapter may not do

- change expected outcomes;
- skip a failed assertion;
- return a hard-coded `true` instead of observed application state;
- write directly to the database to make a test pass;
- use privileged backend access unavailable to a normal benchmark operator;
- hide an error from the evidence package.

Every adapter is committed with the run result so another person can replay it.

The next implementation layer is one assertion runner per selected Season Zero prompt. Those runners remain central and identical across builders; only the UI-location adapter differs.
