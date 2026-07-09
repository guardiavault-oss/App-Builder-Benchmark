# Scoring — NO-RESCUE v1

100 points across six dimensions. A critical failure caps the total at 0 (`NO_SHIP`) no matter how high the uncapped dimension score is.

| Dimension | Max | Guidance |
|---|---:|---|
| Intent fidelity | 20 | correct product archetype (10), no domain contamination (6), requested core capabilities represented honestly (4) |
| Core workflows | 25 | frozen acceptance checks pass in the real app |
| Correction burden | 20 | 0 rounds=20, 1=15, 2=9, 3=4, unresolved=0 |
| Change resilience | 15 | later change works (8), original checks still pass (5), no duplicate/parallel system introduced (2) |
| Security | 15 | authorization, tenant isolation, mutation protection, no exposed secrets |
| Accessibility | 5 | keyboard reachability, labels/names, responsive behavior, no blocking critical a11y failures |

## Critical-failure cap

Supported v1 critical failure codes:

- `cross_tenant_leakage`
- `cross_user_leakage`
- `authentication_bypass`
- `unauthorized_destructive_mutation`
- `fake_core_functionality`
- `fundamental_wrong_product`

Any confirmed entry with `present: true` forces:

```text
TOTAL: 0/100
DECISION: NO_SHIP
```

## Raw evidence remains visible

The scorer always prints both:

- `UNCAPPED`: sum of dimensions before the critical cap;
- `TOTAL`: final score after the cap.

This prevents a critical failure from hiding the app's other strengths while refusing to call an unsafe app shippable.
