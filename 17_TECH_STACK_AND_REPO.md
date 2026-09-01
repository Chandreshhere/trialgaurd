# Technical Stack & Repository Structure

## Recommended Stack

### Mobile
- React Native
- Expo
- TypeScript
- Expo Router

### UI
- Native components with a small internal design system
- React Hook Form
- Zod validation

### State / Data
- TanStack Query for server state
- Zustand or equivalent only for small local UI state if needed

### Backend
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Supabase Edge Functions

### Payments
- RevenueCat
- Apple StoreKit / Google Play Billing through RevenueCat

### Notifications
- Expo Notifications
- native local scheduling
- optional server push fallback

### AI
- server-side multimodal extraction function
- schema-validated JSON output

### Analytics
- PostHog / Amplitude / Mixpanel

### Monitoring
- Sentry

### CI/CD
- GitHub Actions
- EAS Build/Submit

## Suggested Monorepo

```text
trialguard/
├── apps/
│   └── mobile/
├── packages/
│   ├── ui/
│   ├── types/
│   ├── validation/
│   └── config/
├── supabase/
│   ├── migrations/
│   ├── functions/
│   │   ├── extract-trial/
│   │   ├── activate-trial/
│   │   ├── cancellation-proof/
│   │   └── revenuecat-webhook/
│   └── seed/
├── docs/
├── scripts/
└── .github/
```

## Suggested Mobile Feature Structure

```text
src/
├── app/
├── components/
├── features/
│   ├── onboarding/
│   ├── auth/
│   ├── trials/
│   ├── extraction/
│   ├── reminders/
│   ├── cancellation/
│   ├── history/
│   ├── paywall/
│   └── settings/
├── lib/
├── services/
├── hooks/
├── store/
├── types/
└── constants/
```

## Environment Separation
- development
- staging
- production

Never use production AI/storage/payment keys locally.

## Feature Flags
Recommended for:
- AI extraction version;
- paywall variant;
- lifetime plan;
- aggressive reminder defaults;
- provider guide experiments.

## Database Migration Discipline
All schema changes must be migration-based and version controlled.

## Test Strategy
- unit: parsing, date math, money math;
- integration: API/Supabase;
- E2E: core protect/cancel/paywall flows;
- physical-device notification tests.

## Build Order
1. navigation/design system;
2. auth;
3. manual trial CRUD;
4. date/reminder engine;
5. dashboard;
6. cancellation decisions;
7. AI import;
8. proof storage;
9. paywall;
10. analytics/monitoring;
11. polish/accessibility;
12. store release.
