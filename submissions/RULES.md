# Valid submission rules

After Season Zero the benchmark is open. Anyone, including the builders themselves, may submit a run.

A submission is valid only when it includes:

1. an uncut recording started before the exact initial prompt is submitted;
2. a fresh project state;
3. the exact prompt and complete correction transcript;
4. plan and visible agent/model disclosure;
5. timestamps, messages used, correction rounds, and quota exhaustion status;
6. a reachable app URL or preserved runnable artifact;
7. `run.json` that passes `schema/result.schema.json`;
8. automated browser evidence;
9. prompt-specific adapter code when used;
10. source commit/artifact metadata when source is available.

Invalid submissions include:

- edited recordings as the only evidence;
- hidden rescue prompts;
- paid upgrades in the free-default league;
- direct database edits used to make a test pass;
- result JSON that claims a pass while the published evidence shows failure;
- missing critical-failure disclosure.

A disputed result should be answered with a reproducible counter-run, not a private argument.
