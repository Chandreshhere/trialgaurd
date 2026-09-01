# TrialGuard

Screenshot your free trial. TrialGuard reminds you before it becomes paid.

An Expo / React Native app built to the specification in this repository —
`design.md` for the visual system, and `TRIALGUARD_MASTER_DOCUMENT.md` for the
PRD, SRS, screens, data model, AI extraction, notification engine and copy.

## Running it

```bash
npm install
npx expo start --ios      # or press i once Metro is up
```

Requires Xcode with an iOS 18 simulator. The app runs in Expo Go; a dev client
is only needed once RevenueCat lands.

```bash
npm test            # 98 unit tests
npm run typecheck   # tsc --noEmit
```

## Layout

```
src/
  app/          expo-router routes, one file per screen in 05_SCREENS.md
  components/   the design system — every token in design.md, nothing outside it
  features/     dashboard · extraction · cancellation · entitlements · notifications · onboarding
  lib/          the domain engine: money, dates, safe-cancel, reminders, urgency, metrics
  services/     Repository interface + on-device implementation
  validation/   Zod schemas, including the AI extraction contract
supabase/       schema, RLS and the extraction edge function (not yet deployed)
scripts/        simulator capture and input automation
```

### Where the rules live

The parts that must not be wrong are pure functions with tests, not screen code:

| Requirement | Implementation |
|---|---|
| FR-010 safe-cancel date | `src/lib/safeCancel.ts` |
| FR-012 adaptive reminder ladder | `src/lib/reminders.ts` |
| FR-014 / FR-021 money at risk and saved | `src/lib/metrics.ts` |
| 09_AI_EXTRACTION confidence thresholds | `src/validation/confidence.ts` |
| Free/Pro limits | `src/features/entitlements/entitlements.ts` |

Screens read those; they do not reimplement them.

## Working on this repo

The project lives on an **exFAT volume**, which has two consequences worth
knowing before you debug something strange:

- macOS stores extended attributes in `._name` sidecar files. Metro would parse
  them as source, so they are blocked in `metro.config.js` and excluded in
  `tsconfig.json`. `npm run clean` removes any that accumulate.
- Native builds (`expo prebuild`, CocoaPods) are untested here. Use EAS Build.

### Simulator automation

`scripts/` drives the simulator for screenshots and interaction tests:

```bash
scripts/ensure-sim.sh                     # boot, show a window, reconnect Expo Go
scripts/shoot.sh name /route              # capture, optionally deep-linking first
scripts/shoot-set.sh prefix a:/x b:/y     # capture several routes in one pass
python3 scripts/sim_input.py tap 201 400  # coordinates are DEVICE POINTS
python3 scripts/sim_input.py type "2026-09-20"
```

Two things these scripts exist to get right: taps go to whichever window is
topmost, so the Simulator window is raised first — otherwise a click lands in
another app and looks exactly like a dead button. And the Simulator ignores a
synthetic key event's unicode string, so typing is done with real key codes.

`/dev` holds internal review routes — a kitchen sink of every component, and a
readout of what the domain engine computes and what iOS has actually queued.

## Not done yet

- **Supabase** — schema, RLS and the edge function are written in `supabase/`
  but nothing is deployed. Needs a project URL and anon key.
- **Real AI extraction** — the flow runs against deterministic fixtures drawn
  from the spec's own rules. The edge function needs `ANTHROPIC_API_KEY`.
- **RevenueCat** — entitlements are recorded locally behind the interface that
  will front it.
- **Accounts** — the auth screen is deliberately inert rather than faking a
  session the app cannot honour.
