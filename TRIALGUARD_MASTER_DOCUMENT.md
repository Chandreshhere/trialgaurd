# TrialGuard — Complete Product Documentation

---

# Source: 01_PRD.md

# Product Requirements Document (PRD)

## 1. Product Name
TrialGuard

## 2. Product Vision
Create the simplest global consumer utility for preventing accidental charges caused by forgotten free trials.

## 3. Problem Statement
Consumers increasingly start free trials for software, streaming, AI tools, fitness, productivity, gaming, education, media, and other digital services. The user often intends to evaluate the service and cancel before billing, but forgets the exact renewal date or fails to create a reminder. A small lapse can cause an unwanted annual or monthly charge.

Existing approaches fail because they often require one or more of the following:

- manually creating a calendar event;
- manually entering subscription details;
- connecting a bank account;
- granting email access;
- using a large personal-finance application;
- remembering the trial exists before a charge occurs.

TrialGuard reduces setup friction by making the primary input a **screenshot, pasted text, camera capture, or manual form**.

## 4. Product Goal
Enable a user to go from a trial confirmation screenshot to a protected, reminder-backed trial record in less than 30 seconds.

## 5. Core Value Proposition
**Screenshot your free trial. We will make sure you decide before it charges.**

## 6. Target Platforms

### MVP
- iOS
- Android

### Later
- Browser extension
- Lightweight web account portal

## 7. Target Markets
Initial launch priority:

1. United States
2. Canada
3. United Kingdom
4. Australia
5. English-speaking users in Europe

## 8. Target User
A digitally active consumer who regularly tries apps/services and wants to avoid unintended renewals.

Typical characteristics:
- age 18–45;
- uses multiple digital subscriptions;
- comfortable installing apps;
- starts free trials at least several times per year;
- has previously forgotten a trial, fears forgetting one, or already creates manual reminders.

## 9. Jobs To Be Done

### Primary JTBD
When I start a free trial, I want to capture the renewal details immediately so I can decide whether to keep or cancel it before I am charged.

### Secondary JTBD
- Tell me how much money is currently at risk.
- Remind me more than once.
- Make the cancellation path easy to find.
- Let me prove I cancelled.
- Show how much money I have avoided spending.

## 10. Core MVP Features

### F1. User onboarding
- Introduce product promise.
- Explain notification requirement.
- Allow account creation or trial mode if product strategy permits.

### F2. Add trial
Input methods:
- screenshot/image import;
- camera capture;
- paste text;
- manual entry.

### F3. AI extraction
Extract:
- service/provider;
- plan name where available;
- trial start date if available;
- trial/renewal date;
- renewal amount;
- currency;
- billing period;
- cancellation deadline if explicitly stated.

### F4. Confirmation step
Never schedule reminders solely from AI output without user confirmation.

### F5. Trial Shield
- Save active trial.
- Create safe-cancel date.
- Schedule reminders.
- Show amount at risk.

### F6. Reminder ladder
Default reminder sequence:
- 7 days before;
- 3 days before;
- 24 hours before;
- 6 hours before.

System must adapt if trial is shorter than this sequence.

### F7. Keep or Cancel decision
User can:
- keep subscription;
- cancel subscription;
- snooze decision.

### F8. Cancellation assistant
- direct cancellation URL where known;
- concise step-by-step instructions;
- system-level deep link for Apple/Google subscriptions where applicable;
- no password collection in MVP.

### F9. Cancellation proof
- upload screenshot;
- record timestamp;
- optional confirmation/reference number;
- mark verified by user or extraction where appropriate.

### F10. Money saved
Calculate avoided renewal amount only when user confirms cancellation before renewal.

### F11. History
States:
- active;
- kept;
- cancelled;
- expired;
- charged/unknown;
- archived.

### F12. Paywall
Free vs Pro limits defined in subscription specification.

## 11. MVP User Promise Boundaries
TrialGuard must not promise:
- guaranteed cancellation;
- automatic cancellation for every provider;
- guaranteed prevention of charges;
- legal/refund guarantees;
- financial advice.

Suggested language:
> TrialGuard helps you track and act before renewal. Cancellation terms and billing rules are controlled by each service provider.

## 12. KPIs

### Activation
- % onboarding users who protect first trial.
- median time to first protected trial.
- screenshot import success rate.

### Engagement
- active trials/user;
- notification open rate;
- decision completion rate;
- return sessions caused by reminders.

### Value
- total declared money saved;
- % trials cancelled before renewal;
- % users who upload cancellation proof.

### Monetization
- free-to-paid conversion;
- annual vs lifetime split if lifetime is offered;
- trial-to-paid conversion for TrialGuard itself;
- churn/refund rate.

### Reliability
- AI date extraction accuracy;
- notification delivery/scheduling success;
- crash-free sessions;
- duplicate trial rate.

## 13. Product Principles
1. **Capture fast.** Setup must feel lighter than making a calendar reminder.
2. **Confirm critical data.** Dates and amounts are too important to trust blindly.
3. **Be visibly on the user's side.** No dark patterns.
4. **Escalate reminders.** One silent notification is insufficient.
5. **Avoid financial-account access in MVP.** Simplicity and trust are advantages.
6. **Make saved money visible.** Users should feel tangible ROI.
7. **Do not overbuild.** Trial protection is the product.

---

# Source: 02_SRS.md

# Software Requirements Specification (SRS)

## 1. Purpose
This document defines the functional and non-functional requirements for TrialGuard MVP.

## 2. Scope
TrialGuard is a mobile application that captures free-trial renewal information, schedules reminders before billing, assists users with cancellation, records cancellation proof, and calculates avoided renewal value.

## 3. Actors

### A1. Guest User
User who has installed but not completed account creation.

### A2. Registered Free User
Authenticated user with free-plan limits.

### A3. Pro User
Authenticated user with active paid entitlement.

### A4. Admin/Operations User
Internal staff member managing supported service metadata and cancellation guidance.

## 4. Functional Requirements

### FR-001 Account Creation
The system shall allow a user to create an account using supported authentication methods.

### FR-002 Sign In
The system shall authenticate returning users and restore their protected trial records.

### FR-003 Notification Permission
The system shall request notification permission only after explaining why reminders are core to product value.

### FR-004 Create Trial Manually
User shall be able to manually enter a trial record.

Mandatory fields:
- service name;
- renewal date/time;
- renewal amount OR explicit unknown;
- currency OR explicit unknown.

Optional:
- plan name;
- billing interval;
- trial start date;
- cancellation URL;
- notes.

### FR-005 Import Screenshot
The system shall allow image selection from the device photo library/share sheet when platform capabilities permit.

### FR-006 Camera Capture
The system shall allow user to capture trial confirmation content using the camera.

### FR-007 Paste Text
The system shall allow user to paste trial confirmation text.

### FR-008 AI Extraction
The system shall attempt structured extraction from supported input.

Output fields:
- provider/service;
- plan;
- renewal timestamp/date;
- amount;
- currency;
- billing period;
- confidence per field;
- raw evidence snippet where useful.

### FR-009 Extraction Review
The system shall display detected values for confirmation before protection is activated.

### FR-010 Safe-Cancel Date
The system shall calculate a recommended safe-cancel deadline earlier than the provider renewal timestamp.

Default buffer:
- 24 hours before renewal where exact time is known;
- 48 hours before renewal where only date is known;
- user-configurable later.

### FR-011 Trial Protection Activation
When user confirms, the system shall:
- persist the trial;
- calculate reminder schedule;
- create local/push reminders;
- show active protection state.

### FR-012 Adaptive Reminder Schedule
If fewer than 7 days remain, the system shall automatically create only meaningful future reminders.

Example for 48 hours remaining:
- 24 hours;
- 6 hours;
- optional 1 hour if enabled.

### FR-013 Active Trial Dashboard
The system shall show active trials sorted by urgency.

### FR-014 Money at Risk
The system shall calculate the sum of known upcoming renewal amounts across active trials.

### FR-015 Keep Decision
User shall be able to mark a trial as intentionally kept.

### FR-016 Cancel Decision
User shall be able to enter cancellation assistance flow.

### FR-017 Cancellation Guidance
The system shall display:
- provider name;
- cancellation route;
- direct URL/deep link where available;
- concise step sequence;
- warning about provider-specific terms if relevant.

### FR-018 Mark Cancelled
User shall be able to mark a trial cancelled.

### FR-019 Proof Upload
User shall be able to upload a screenshot/image as cancellation proof.

### FR-020 Confirmation Extraction
The system may extract cancellation confirmation text/date/reference number from uploaded proof, but user remains final authority.

### FR-021 Money Saved Calculation
When a user confirms cancellation before the recorded renewal, the system shall add the avoided renewal amount to user value metrics.

### FR-022 History
The system shall display historical trial records with status and outcome.

### FR-023 Edit Trial
The user shall be able to correct provider, amount, date, currency, billing interval, notes, and reminder settings.

### FR-024 Delete/Archive Trial
User shall be able to remove or archive records.

### FR-025 Notification Tap Routing
Tapping a notification shall deep-link to the relevant trial decision screen.

### FR-026 Snooze
The system shall allow limited snooze options that do not exceed the safe-cancel deadline without warning.

### FR-027 Subscription Entitlements
The system shall enforce Free/Pro entitlements.

### FR-028 Restore Purchases
Paid users shall be able to restore App Store/Play purchases.

### FR-029 Account Deletion
The system shall support account deletion and data deletion request flow.

### FR-030 Export/Delete Proof
User shall be able to remove stored proof images.

## 5. Non-Functional Requirements

### NFR-001 Performance
- app launch target: < 3 seconds on supported modern devices;
- dashboard interaction perceived response: < 300 ms for local state;
- AI extraction target: < 8 seconds typical, excluding network failure.

### NFR-002 Availability
Backend target for MVP: 99.5% monthly availability or better.

### NFR-003 Reliability
Critical renewal dates shall be stored server-side and mirrored locally where appropriate.

### NFR-004 Notification Resilience
Where platform permits, reminders should be scheduled locally after confirmation so they are not solely dependent on server push delivery.

### NFR-005 Security
- TLS in transit;
- encrypted managed storage at rest;
- row-level access control;
- no plaintext passwords;
- no storage of third-party service credentials.

### NFR-006 Privacy
Only data necessary for trial protection should be collected.

### NFR-007 Accessibility
Target WCAG 2.1 AA principles for contrast, labels, dynamic text, touch targets, and screen-reader support.

### NFR-008 Localization
Architecture shall support multiple locales/currencies/date formats even if MVP UI is English-only.

### NFR-009 Timezones
All critical renewal timestamps shall use timezone-aware representations. If provider gives only a date, system shall make ambiguity visible.

### NFR-010 Offline Behavior
Users should be able to view existing protected trials offline. New AI extraction may require connectivity.

### NFR-011 Auditability
Changes to renewal date, status, and cancellation completion should be timestamped.

### NFR-012 App Store Compliance
Billing and permissions must comply with current Apple/Google policies at release.

## 6. Supported Status Model

`draft`
`active`
`kept`
`cancellation_in_progress`
`cancelled`
`renewed_or_charged`
`expired`
`archived`

## 7. Error Handling Requirements

The system shall provide recoverable errors for:
- unreadable screenshot;
- missing date;
- ambiguous amount;
- multiple prices in one screenshot;
- provider not recognized;
- notification permission denied;
- AI timeout;
- network unavailable;
- subscription validation failure.

The user must always be able to finish setup manually if AI extraction fails.

---

# Source: 03_USER_PERSONAS_AND_JOBS.md

# User Personas, Jobs, Pain Points

## Persona 1 — The Trial Explorer
**Age:** 20–35

Frequently tests:
- AI tools;
- design software;
- streaming;
- productivity apps;
- education platforms;
- fitness apps.

### Pain
Starts trials impulsively, trusts memory, and occasionally gets charged.

### Desired Outcome
A five-second way to protect the trial immediately after signup.

---

## Persona 2 — The Cost-Conscious Professional
**Age:** 25–45

Has disposable income but dislikes waste. May intentionally try expensive annual products before deciding.

### Pain
A forgotten $80–$200 annual renewal feels avoidable and frustrating.

### Desired Outcome
Clear visibility into upcoming trial charges and easy cancellation paths.

---

## Persona 3 — The Forgetful / Overloaded User
Has many competing tasks and reminders.

### Pain
A normal calendar reminder is easy to dismiss, forget, or never create.

### Desired Outcome
Escalating reminders with strong monetary context.

---

## Persona 4 — The Subscription Skeptic
Avoids subscription-management apps that require bank or inbox access.

### Pain
Does not want to hand over financial credentials or email permissions.

### Desired Outcome
A privacy-light product that works from screenshots and manual input.

---

# Jobs To Be Done

## Functional Jobs
1. Capture trial renewal details quickly.
2. Know exactly when a charge is expected.
3. Remember in time.
4. Decide to keep or cancel.
5. Find the cancellation path.
6. Keep proof of cancellation.
7. Understand how much money was avoided.

## Emotional Jobs
1. Reduce anxiety about forgetting.
2. Feel in control of subscriptions.
3. Avoid the regret of an unnecessary charge.
4. Trust that the app is working for the user, not against them.

## Social Jobs
Low priority in MVP. Product should not require social interaction.

# Pain Severity Triggers

### High Pain
- renewal is annual;
- amount > $50;
- trial ends in < 72 hours;
- provider has difficult cancellation path;
- user has already been charged accidentally before.

### Medium Pain
- small monthly renewal;
- user still evaluating product;
- cancellation is straightforward.

# Anti-Personas
Do not optimize MVP for:
- enterprise procurement teams;
- businesses managing employee subscriptions;
- finance/accounting departments;
- people seeking full bank-level subscription detection;
- users expecting TrialGuard to cancel services automatically without action.

---

# Source: 04_USER_FLOWS.md

# User Flows

## Flow 1 — First Launch to First Protected Trial

1. Open app.
2. See value proposition.
3. Continue onboarding.
4. Explain notification benefit.
5. User grants/declines notification permission.
6. User taps **Protect My First Trial**.
7. Choose input method.
8. Import screenshot.
9. App uploads/processes image.
10. Extraction returns detected fields.
11. User reviews detected provider/date/amount/currency.
12. User corrects if necessary.
13. System calculates safe-cancel date.
14. User taps **Protect This Trial**.
15. System persists trial and schedules reminders.
16. Confirmation screen shows `$X protected`.
17. User enters dashboard.

### Success Criteria
- user finishes in < 30 seconds after image selection in normal conditions;
- no critical field is silently assumed when confidence is low.

---

## Flow 2 — Add Trial Manually

Dashboard → Add → Manual → enter service → renewal date → amount → currency → billing interval → review reminders → protect.

---

## Flow 3 — Reminder to Cancel

1. Reminder notification fires.
2. Notification copy includes provider, amount, and time remaining.
3. User taps notification.
4. App opens Trial Decision screen.
5. User taps **Cancel**.
6. App shows cancellation guide/deep link.
7. User opens provider.
8. User completes cancellation externally.
9. User returns to TrialGuard.
10. User taps **I Cancelled It**.
11. App asks for optional confirmation screenshot.
12. User uploads proof or skips.
13. Trial status becomes `cancelled`.
14. Money Saved increases.
15. Future reminders are cancelled.

---

## Flow 4 — Reminder to Keep

1. Notification opens trial.
2. User taps **Keep It**.
3. Confirm modal: `You are choosing to continue at $X / period.`
4. User confirms.
5. Status becomes `kept`.
6. Trial-specific cancellation reminders stop.
7. Record moves to History.

---

## Flow 5 — Snooze

1. User taps **Decide Later**.
2. App displays only safe snooze options.
3. User selects e.g. `Remind me tonight`.
4. New reminder scheduled.
5. If chosen time is too close/after safe-cancel deadline, app warns and requires explicit confirmation or blocks option.

---

## Flow 6 — AI Extraction Failure

1. Screenshot selected.
2. AI returns incomplete/low-confidence output.
3. App highlights uncertain fields.
4. User manually supplies missing values.
5. App continues normally.

Never trap the user in a retry-only loop.

---

## Flow 7 — Notification Permission Denied

1. User denies permission.
2. App clearly states that reminders are limited.
3. Trial can still be added.
4. Dashboard displays `Notifications Off` banner.
5. User can open system settings.
6. App may use in-app urgency states but must not falsely claim active protection.

---

## Flow 8 — Cancellation Proof Verification

1. User uploads cancellation confirmation screenshot.
2. System extracts likely provider, cancellation confirmation, end-of-access date, reference ID if present.
3. User reviews extracted proof metadata.
4. User confirms.
5. Proof attached to record.

---

## Flow 9 — Paywall Trigger

Examples:
- free user attempts 4th active protected trial;
- user tries Pro-only AI import after free allowance;
- user requests proof storage beyond free allowance.

Flow:
feature attempt → contextual paywall → choose annual/lifetime if offered → native checkout → entitlement confirmed → return to intended action.

---

## Flow 10 — Account Deletion

Profile → Privacy & Data → Delete Account → explain consequences → re-authenticate if necessary → final confirmation → delete user data per retention policy → sign out.

---

# Source: 05_SCREENS.md

# Complete Screen Specification

## Screen Count
**MVP core screens: 24**

Some are full screens; some may be implemented as modal sheets.

---

## S01 — Splash / Launch
### Purpose
Brand load, session restoration.

### Elements
- logo/wordmark;
- loading indicator only if needed.

### Rules
Avoid artificial delay.

---

## S02 — Welcome
### Headline
**Never pay for a trial you forgot.**

### Body
Add a free trial in seconds. TrialGuard reminds you before it becomes paid.

### CTA
`Get Started`

Secondary: `I already have an account`

---

## S03 — How It Works
Three concise cards:
1. Import confirmation.
2. We detect renewal details.
3. We remind you before the charge.

CTA: `Continue`

---

## S04 — Notification Education
### Headline
**The reminder is the protection.**

Explain 7d/3d/24h reminder concept.

Primary CTA: `Enable Notifications`

Secondary: `Not Now`

Only after primary CTA should OS permission prompt appear.

---

## S05 — Authentication
Options per final auth strategy:
- Apple;
- Google;
- email magic link / OTP.

Avoid password-heavy signup if possible.

---

## S06 — Empty Shield Dashboard
### Header
`Shield`

### Hero
**No trials protected yet.**

CTA: `Protect a Trial`

Show simple sample card to explain result.

---

## S07 — Add Trial Method
Cards:
- `Import Screenshot` — Recommended
- `Take Photo`
- `Paste Confirmation`
- `Enter Manually`

---

## S08 — Image Picker / Camera Capture
Platform-native image capture/selection.

Post-selection:
- preview;
- crop/retake optional;
- CTA `Analyze Trial`.

---

## S09 — AI Processing
### Copy
`Looking for the renewal date and charge…`

Show subtle progress state.

Timeout path: manual entry option.

---

## S10 — Detected Trial Review
### Fields
- service;
- plan;
- renewal date;
- renewal time if known;
- amount;
- currency;
- billing interval.

### Confidence UI
Low-confidence fields display warning icon or `Please check`.

### Footer
`Protected amount: $79.99`

CTA: `Protect This Trial`

---

## S11 — Reminder Schedule Review
May be combined with S10 for MVP.

Show:
- safe-cancel date;
- scheduled reminders.

Examples:
- 7 days before;
- 3 days before;
- 24 hours before;
- 6 hours before.

CTA: `Activate Shield`

---

## S12 — Protection Success
### Hero
`$79.99 protected ✓`

### Body
`We’ll remind you before Adobe can renew.`

Show next reminder time.

CTA: `Done`

Secondary: `Add Another Trial`

---

## S13 — Shield Dashboard
### Header Metrics
- `Money at risk`;
- active trial count.

### Trial Cards
Each card:
- provider icon/name;
- amount;
- renewal countdown;
- billing period;
- urgency color/state;
- CTA or chevron.

Sort by nearest safe-cancel deadline.

FAB/button: `+ Add Trial`

---

## S14 — Trial Detail
### Header
Provider + status.

### Content
- renewal amount;
- renewal date;
- safe-cancel date;
- reminder schedule;
- original screenshot thumbnail;
- notes.

### Actions
`Keep It`
`Cancel It`
`Edit`

---

## S15 — Decision Sheet
Triggered from reminder or trial detail.

### Prompt
`Adobe may charge $79.99 in 3 days.`

Actions:
- `Cancel It`
- `Keep It`
- `Decide Later`

---

## S16 — Cancellation Guide
### Elements
- provider name;
- cancellation difficulty/notes if maintained;
- step list;
- primary CTA `Open Adobe` / `Manage Apple Subscriptions` etc.;
- secondary `I Cancelled It`.

Disclaimer that service terms control cancellation.

---

## S17 — Mark Cancelled
### Prompt
`Did you successfully cancel?`

Options:
- `Yes, cancelled`
- `Not yet`

If yes:
Optional `Add proof`.

---

## S18 — Add Cancellation Proof
Image upload/camera.

Show:
- proof preview;
- extracted reference/status if detected;
- confirmation checkbox.

CTA: `Save Proof`

---

## S19 — Cancellation Success
Hero:
`You avoided $79.99`

Show:
- cancelled timestamp;
- proof stored yes/no;
- total saved lifetime.

CTA: `Back to Shield`

---

## S20 — Saved Tab
### Hero
`Money you saved`

Metrics:
- lifetime avoided amount;
- current year;
- trials cancelled.

List cancelled items.

Avoid gamifying with misleading savings claims.

---

## S21 — History Tab
Filter chips:
- All
- Cancelled
- Kept
- Expired

History cards show provider, amount, decision, date.

---

## S22 — Edit Trial
Editable fields:
- service;
- date/time;
- amount;
- currency;
- interval;
- safe buffer;
- reminder preferences;
- notes.

Important: editing renewal time reschedules reminders.

---

## S23 — Paywall
### Headline example
`Protect every trial.`

Benefits:
- unlimited protected trials;
- AI screenshot detection;
- aggressive reminders;
- cancellation proof;
- advanced reminder schedule.

Primary pricing emphasis: annual.

Buttons:
- purchase;
- restore purchases;
- legal links.

---

## S24 — Profile / Settings
Sections:

### Account
- account/email;
- sign out.

### Protection
- default safe buffer;
- aggressive alerts;
- default currency;
- timezone.

### Subscription
- plan;
- manage subscription;
- restore purchase.

### Privacy & Data
- export if supported;
- delete proof;
- delete account;
- privacy policy.

### Support
- contact;
- FAQ;
- report extraction issue.

---

# Bottom Navigation
Recommended MVP tabs:

1. **Shield**
2. **Saved**
3. **History**
4. **Profile**

`Add Trial` should be highly visible from Shield.

# Global Screen States
Every relevant screen should specify:
- loading;
- empty;
- offline;
- error;
- permission denied;
- Pro locked;
- low confidence;
- destructive confirmation.

---

# Source: 06_DESIGN_SYSTEM.md

# Design System & UX Direction

## Brand Character
TrialGuard should feel:
- protective;
- calm;
- trustworthy;
- direct;
- consumer-friendly;
- financially aware without looking like a banking app.

Avoid:
- crypto/fintech aesthetics;
- aggressive fear-mongering;
- excessive red;
- dark patterns;
- cluttered dashboards.

## Core Visual Metaphor
**Shield / Protection**

Use sparingly in:
- protected state;
- trial protection activation;
- active shield dashboard.

## Information Hierarchy
The most important data is always:
1. amount at risk;
2. time until renewal/safe-cancel deadline;
3. provider;
4. current decision/status.

## Typography
Use a modern sans-serif with excellent mobile readability.

Recommended type scale:
- Display: 32–40
- H1: 28–32
- H2: 22–24
- H3: 18–20
- Body: 16
- Small: 13–14

## Spacing
Use 4/8-point spacing system.

## Touch Targets
Minimum 44x44pt equivalent.

## Cards
Active trial card must show:
- provider;
- amount;
- countdown;
- urgency;
- status.

Do not hide amount behind a details view.

## Urgency States
Recommended semantic levels:
- Safe: > 7 days
- Upcoming: 3–7 days
- Urgent: 24–72 hours
- Critical: < 24 hours

Do not rely on color alone; include icon/text.

## Motion
Use subtle motion for:
- Shield activation;
- successful cancellation;
- dashboard metric transitions.

Avoid confetti for financial-risk events unless testing proves appropriate.

## Accessibility
- dynamic text support;
- semantic labels;
- screen reader descriptions for countdowns;
- high contrast;
- reduce-motion support;
- never encode urgency only by color.

## Copy Style
Short, concrete, money-aware.

Prefer:
`Adobe may charge $79.99 tomorrow.`

Avoid:
`Your Adobe subscription renewal event is approaching.`

## Trust UX
- show original extracted screenshot in detail view;
- show editable detected fields;
- state when date/time is uncertain;
- make cancel links transparent;
- make TrialGuard's own subscription cancellation easy to find.

---

# Source: 07_DATA_MODEL.md

# Data Model

## General Rules
- Use UUID primary keys.
- Store timestamps in UTC with timezone metadata when source timezone matters.
- Use integer minor units for money where practical (e.g. cents) to avoid floating-point errors.
- Use ISO 4217 currency codes.

## Table: profiles

| Field | Type | Notes |
|---|---|---|
| id | uuid | same as auth user id |
| display_name | text nullable | optional |
| default_currency | char(3) | e.g. USD |
| timezone | text | IANA timezone |
| default_safe_buffer_hours | int | default 48 if date-only |
| aggressive_alerts | bool | default true |
| created_at | timestamptz | |
| updated_at | timestamptz | |

## Table: trials

| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK |
| provider_id | uuid nullable | known provider |
| service_name | text | confirmed display name |
| plan_name | text nullable | |
| status | enum | see statuses |
| trial_start_at | timestamptz nullable | |
| renewal_at | timestamptz nullable | exact time if known |
| renewal_date_only | date nullable | use if source only gives date |
| source_timezone | text nullable | |
| safe_cancel_at | timestamptz | calculated |
| renewal_amount_minor | bigint nullable | cents/pence etc. |
| currency | char(3) nullable | |
| billing_interval | enum nullable | month/year/week/other |
| source_type | enum | screenshot/camera/paste/manual |
| source_asset_id | uuid nullable | |
| ai_extraction_id | uuid nullable | |
| user_confirmed | bool | must be true before active |
| notes | text nullable | |
| kept_at | timestamptz nullable | |
| cancelled_at | timestamptz nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

## Enum: trial_status
- draft
- active
- kept
- cancellation_in_progress
- cancelled
- renewed_or_charged
- expired
- archived

## Enum: billing_interval
- week
- month
- quarter
- year
- one_time_after_trial
- other
- unknown

## Table: reminder_schedules

| Field | Type |
|---|---|
| id | uuid |
| trial_id | uuid |
| user_id | uuid |
| remind_at | timestamptz |
| reminder_type | enum |
| status | enum |
| local_notification_id | text nullable |
| push_notification_id | text nullable |
| opened_at | timestamptz nullable |
| acted_at | timestamptz nullable |
| created_at | timestamptz |

Reminder types:
- seven_day
- three_day
- one_day
- six_hour
- custom
- snooze
- final

Status:
- scheduled
- delivered
- opened
- cancelled
- failed

## Table: source_assets

| Field | Type |
|---|---|
| id | uuid |
| user_id | uuid |
| trial_id | uuid nullable |
| asset_type | enum |
| storage_path | text |
| mime_type | text |
| created_at | timestamptz |
| deleted_at | timestamptz nullable |

Asset types:
- trial_screenshot
- camera_capture
- cancellation_proof

## Table: ai_extractions

| Field | Type |
|---|---|
| id | uuid |
| user_id | uuid |
| source_asset_id | uuid nullable |
| raw_text | text nullable |
| extracted_json | jsonb |
| provider_confidence | numeric |
| date_confidence | numeric |
| amount_confidence | numeric |
| currency_confidence | numeric |
| model_version | text |
| extraction_status | enum |
| created_at | timestamptz |

## Table: cancellation_proofs

| Field | Type |
|---|---|
| id | uuid |
| trial_id | uuid |
| user_id | uuid |
| source_asset_id | uuid |
| reference_number | text nullable |
| access_end_date | date nullable |
| extracted_confirmation | bool nullable |
| user_confirmed | bool |
| created_at | timestamptz |

## Table: providers

| Field | Type |
|---|---|
| id | uuid |
| canonical_name | text |
| domain | text nullable |
| logo_url | text nullable |
| cancellation_url | text nullable |
| apple_managed | bool |
| google_play_managed | bool |
| guide_version | int |
| active | bool |
| updated_at | timestamptz |

## Table: provider_cancel_steps

| Field | Type |
|---|---|
| id | uuid |
| provider_id | uuid |
| step_order | int |
| instruction | text |
| deep_link | text nullable |
| region | text nullable |
| active | bool |

## Table: entitlements

| Field | Type |
|---|---|
| user_id | uuid |
| plan | enum |
| source | enum |
| product_id | text nullable |
| expires_at | timestamptz nullable |
| updated_at | timestamptz |

## Computed Metrics
### Money at Risk
Sum of known renewal amounts for active trials not past renewal.

### Money Saved
Sum of renewal amounts for trials explicitly marked cancelled before renewal.

Do not count:
- unknown amounts;
- expired trials without cancellation confirmation;
- estimated multi-year future savings.

---

# Source: 08_API_AND_BACKEND.md

# API & Backend Specification

## Architecture
Recommended MVP architecture:

Mobile App
→ Supabase Auth
→ Postgres + RLS
→ Edge Functions / backend API
→ AI extraction provider
→ RevenueCat webhook sync
→ notification scheduling service where needed

## Core Backend Modules

1. Authentication
2. Trial CRUD
3. AI extraction orchestration
4. Provider metadata/cancellation guides
5. Reminder scheduling
6. Proof storage
7. Entitlement sync
8. Analytics hooks
9. Admin provider-guide maintenance

## Suggested Endpoints / Functions

### POST `/trial-extractions`
Input:
```json
{
  "source_type": "screenshot",
  "asset_id": "uuid",
  "locale": "en-US",
  "timezone": "America/New_York"
}
```

Output:
```json
{
  "extraction_id": "uuid",
  "service_name": "Adobe Creative Cloud",
  "plan_name": null,
  "renewal_date": "2026-09-14",
  "renewal_time": null,
  "amount_minor": 7999,
  "currency": "USD",
  "billing_interval": "year",
  "confidence": {
    "service": 0.96,
    "renewal_date": 0.91,
    "amount": 0.88,
    "currency": 0.99
  },
  "warnings": ["Exact billing time was not shown."]
}
```

### POST `/trials`
Creates confirmed trial.

Server validates:
- user owns data;
- required fields present;
- renewal date is plausible;
- amount >= 0 if provided;
- timezone valid.

### PATCH `/trials/:id`
Editable fields only. Recalculate reminders if critical data changes.

### POST `/trials/:id/activate`
- verifies user confirmation;
- calculates safe cancel timestamp;
- creates reminder schedule;
- returns schedule.

### POST `/trials/:id/decision`
Body:
```json
{ "decision": "cancel" }
```
or
```json
{ "decision": "keep" }
```

### POST `/trials/:id/cancelled`
Marks cancelled with optional proof metadata.

### POST `/trials/:id/proof`
Creates proof record after upload.

### GET `/providers/search?q=`
Search known providers.

### GET `/providers/:id/cancel-guide`
Returns current cancellation steps.

### GET `/me/summary`
Returns:
- active count;
- money at risk;
- money saved;
- next urgent trial.

## Row Level Security
Every user-owned table must enforce:
`user_id = auth.uid()`

No mobile client should be able to read another user's records.

## Service Role Usage
Use service-role access only in trusted server/edge execution.

## Idempotency
Activation and reminder creation should be idempotent to avoid duplicated notifications.

## Provider Guide Updates
Cancellation links can change. Store:
- guide version;
- updated date;
- active/inactive status.

Admin should be able to modify provider guidance without mobile app release.

## Background Jobs
Potential jobs:
- check stale active trials past renewal;
- reconcile failed push registrations;
- entitlement sync;
- notify user when provider cancellation guide materially changes if necessary.

## Offline Strategy
Cache active trial records locally.
Server remains source of truth for account data, but scheduled local notifications should survive intermittent connectivity where platform permits.

---

# Source: 09_AI_EXTRACTION_SPEC.md

# AI Extraction Specification

## Goal
Convert user-provided trial confirmation content into reliable structured fields while minimizing hallucination risk.

## Supported Inputs
- screenshot;
- photo;
- pasted text;
- later: share-sheet webpage snippets.

## Required Output Schema

```json
{
  "service_name": "string|null",
  "plan_name": "string|null",
  "trial_start_date": "YYYY-MM-DD|null",
  "renewal_date": "YYYY-MM-DD|null",
  "renewal_time": "HH:mm:ss|null",
  "timezone": "IANA|string|null",
  "renewal_amount": "number|null",
  "currency": "ISO4217|null",
  "billing_interval": "week|month|quarter|year|other|unknown|null",
  "explicit_cancel_by_date": "YYYY-MM-DD|null",
  "confidence": {
    "service_name": 0.0,
    "renewal_date": 0.0,
    "renewal_amount": 0.0,
    "currency": 0.0,
    "billing_interval": 0.0
  },
  "warnings": []
}
```

## Extraction Rules

### Rule 1 — Never invent missing values
If renewal amount is not visible, return null.

### Rule 2 — Separate trial end vs billing date
If content says:
`Free until Sep 10, then billed Sep 11`
renewal date is Sep 11.

### Rule 3 — Distinguish promotional pricing
If screenshot includes:
`$0 today, then $9.99/month`
renewal amount = 9.99.

### Rule 4 — Distinguish annual equivalent text
If screenshot says:
`$8.33/month billed annually at $99.99`
renewal amount should be 99.99 and interval year if that is the actual next charge.

### Rule 5 — Multiple prices
If multiple plans/options are visible and the selected plan cannot be identified, return warning and require user selection.

### Rule 6 — Date ambiguity
`09/10/2026` is locale-sensitive. Use device locale plus nearby language/context. If still ambiguous, flag it.

### Rule 7 — Relative dates
For `7-day free trial`, calculate end only if a trustworthy trial start timestamp is known. Otherwise request user confirmation.

### Rule 8 — Exact time uncertainty
If only a date is shown, do not invent midnight/11:59 as provider billing time. Store date-only and use conservative safe buffer.

### Rule 9 — Cancellation confirmation
For proof screenshots, detect phrases such as:
- cancelled;
- subscription ends on;
- auto-renew off;
- you will not be charged;
- cancellation confirmation.

But always let user confirm.

## Confidence Thresholds
Suggested:
- >= 0.90: normal display;
- 0.70–0.89: show `Please check`;
- < 0.70: highlight and require explicit edit/confirmation.

Renewal date should always require confirmation regardless of confidence.

## Prompting Principle
Extraction model should be instructed to behave as a structured parser, not an advisor.

## Validation Layer
After AI response:
- validate currency code;
- validate date syntax;
- reject impossible dates;
- check renewal date not implausibly far in past;
- normalize money to minor units;
- strip unsupported HTML/text.

## Privacy
Do not use user screenshots for model training unless user explicitly opts in under a documented policy.

## Cost Controls
- resize/compress images before upload while preserving text readability;
- use low-cost vision-capable model where accuracy is sufficient;
- avoid repeated extraction once user confirmed;
- cache extraction result.

---

# Source: 10_NOTIFICATION_ENGINE.md

# Notification Engine Specification

## Product Principle
Notifications are not a secondary feature. They are the core mechanism of protection.

## Default Reminder Ladder
For a trial with enough time remaining:

1. 7 days before renewal
2. 3 days before
3. 24 hours before
4. 6 hours before

Optional later:
- 1 hour before safe-cancel deadline;
- custom user schedule.

## Safe-Cancel Logic

### Exact renewal timestamp known
Default safe buffer: 24 hours.

### Only renewal date known
Default safe buffer: 48 hours before assumed start of renewal date in user/provider-local context.

### Explicit provider cancellation deadline known
Use earlier of:
- provider deadline;
- conservative calculated safe deadline.

## Adaptive Schedule Examples

### Trial has 12 days remaining
Use all four reminders.

### Trial has 5 days remaining
Use:
- 3 days;
- 24h;
- 6h.

### Trial has 30 hours remaining
Use:
- 24h;
- 6h.

### Trial has 4 hours remaining
Use immediate warning and a final reminder if safe.

### Trial is already inside safe-cancel buffer
Display critical warning:
`This trial may be too close to renewal. Cancel now if you do not want to continue.`

## Notification Content Requirements
Every critical reminder should contain:
- provider name;
- amount if known;
- time remaining;
- clear action context.

## Copy Examples

### 7 days
`Adobe may charge $79.99 next week. Decide whether you still want it.`

### 3 days
`$79.99 at risk in 3 days — Adobe is still set to renew.`

### 24 hours
`Adobe may charge $79.99 tomorrow. Cancel now if you do not want it.`

### 6 hours
`Final TrialGuard reminder: Adobe's $79.99 renewal is approaching.`

## Actions
Where platform supports notification actions:
- `Cancel`
- `Keep`
- `Later`

All actions should open app into correct flow unless safe direct action is possible.

## Reminder Cancellation
Cancel future reminders immediately when trial becomes:
- cancelled;
- kept;
- archived.

## Editing Renewal Date
When critical dates change:
1. cancel existing reminders;
2. regenerate schedule;
3. schedule new reminders;
4. confirm success.

## Timezone Changes
On device timezone change:
- preserve absolute provider time if known;
- adjust display appropriately;
- re-evaluate date-only records conservatively.

## Reliability Strategy
Prefer redundant protection where platform allows:
- local scheduled notifications;
- optional server push fallback.

## Permission-Off State
App must never display `Protected` without qualification if notifications are disabled.

Recommended status:
`Tracked — notifications off`

CTA:
`Enable reminders`

---

# Source: 11_SUBSCRIPTION_AND_PAYWALL.md

# Subscription, Pricing & Entitlements

## Pricing Strategy for Initial Test

### Free
- up to 3 active protected trials;
- manual entry;
- basic reminders;
- limited screenshot AI scans per month or trial period.

### Pro — Test Variant A
- $19.99/year

### Pro — Test Variant B
- $24.99/year

### Optional Lifetime Test
- $29.99–49.99 one-time, only if unit economics support it.

Do not finalize pricing without A/B testing and store-economics review.

## Pro Entitlements
- unlimited active trials;
- AI screenshot import;
- advanced/aggressive reminders;
- cancellation proof storage;
- advanced reminder customization;
- full Money Saved history;
- priority provider guides.

## Paywall Principles
1. User should understand value before paywall.
2. Prefer contextual paywall after user successfully protects at least one trial.
3. Avoid fake countdowns.
4. Clearly show billing period and renewal.
5. Include restore purchase.
6. Make cancellation/manage-subscription pathway easy to find.

## TrialGuard's Own Renewal Ethics
Recommended trust differentiator:
- send a clear renewal reminder for TrialGuard itself;
- make manage/cancel subscription accessible from Profile;
- avoid manipulative retention steps.

## RevenueCat
Use RevenueCat as entitlement abstraction layer.

Recommended entitlement:
`pro`

Suggested product IDs:
- `trialguard_pro_annual`
- `trialguard_lifetime` if used.

## Entitlement State
App must handle:
- active;
- grace period;
- billing retry;
- expired;
- revoked/refunded;
- lifetime.

## Free Limit Behavior
If user exceeds free active trial limit:
- existing active trials remain visible and reminders continue;
- block adding additional protected trials until upgrade or old trial resolved;
- never disable an already-scheduled critical reminder just because entitlement changed.

## Restore Purchases
Mandatory accessible action from Paywall and Settings.

---

# Source: 12_ANALYTICS_AND_EVENTS.md

# Analytics & Event Taxonomy

## Objectives
Measure:
- acquisition quality;
- activation;
- trial-protection success;
- reminder effectiveness;
- cancellation outcomes;
- monetization;
- extraction reliability.

## Core Funnel
Install
→ onboarding_started
→ onboarding_completed
→ add_trial_started
→ source_selected
→ extraction_completed
→ trial_confirmed
→ protection_activated
→ reminder_opened
→ decision_made
→ cancellation_confirmed
→ paywall_viewed
→ purchase_completed

## Event List

### Acquisition / Onboarding
- `app_first_open`
- `onboarding_started`
- `onboarding_step_viewed`
- `notification_education_viewed`
- `notification_permission_granted`
- `notification_permission_denied`
- `signup_completed`

### Trial Creation
- `add_trial_started`
- `trial_source_selected`
Properties: screenshot/camera/paste/manual
- `image_selected`
- `extraction_started`
- `extraction_succeeded`
- `extraction_failed`
- `extraction_field_corrected`
Properties: field name
- `trial_confirmed`
- `protection_activated`

### Dashboard
- `trial_card_opened`
- `add_trial_tapped`

### Notifications
- `reminder_scheduled`
- `reminder_opened`
- `reminder_action_cancel`
- `reminder_action_keep`
- `reminder_snoozed`

### Decisions
- `cancel_flow_started`
- `provider_cancel_link_opened`
- `trial_marked_cancelled`
- `trial_marked_kept`
- `cancellation_proof_added`

### Monetization
- `paywall_viewed`
- `paywall_cta_tapped`
- `purchase_started`
- `purchase_completed`
- `purchase_failed`
- `purchase_restored`

### Data & Settings
- `trial_edited`
- `trial_archived`
- `account_delete_started`
- `account_deleted`

## Important Properties
Avoid storing raw sensitive screenshot text in analytics.

Useful properties:
- country/locale;
- source method;
- days until renewal bucket;
- amount bucket;
- billing interval;
- provider known/unknown;
- AI confidence bucket;
- free/pro;
- notification permission state.

## Primary Metrics

### Activation Rate
Users protecting first trial / users completing onboarding.

### Extraction Success Rate
Successful structured extraction / extraction attempts.

### Confirmation Correction Rate
% extraction records where user edits detected date/amount.

High correction rate means model/system is unreliable.

### Reminder Action Rate
Users taking keep/cancel action after reminder.

### Prevented-Renewal Rate
Cancelled-before-renewal / resolved active trials.

### Paid Conversion
Paid users / eligible activated users.

## North-Star Candidate
**Protected Trials Resolved Before Renewal**

This is better than DAU because the product is episodic.

---

# Source: 13_SECURITY_PRIVACY_COMPLIANCE.md

# Security, Privacy & Compliance Requirements

## Security Objective
TrialGuard handles screenshots that may contain names, email addresses, prices, account fragments, and other personal information. The app must minimize collection and isolate user data.

## Data Minimization
Collect only what is needed to:
- identify the service;
- identify renewal terms;
- schedule reminders;
- support cancellation proof.

Do not request:
- bank credentials;
- service passwords;
- payment card numbers;
- full email inbox access;
- browser history.

## Authentication
Recommended:
- Apple sign-in on iOS;
- Google sign-in where appropriate;
- passwordless email/magic link.

## Authorization
Use row-level security on every user-owned table.

## Storage
Screenshots/proofs should be private objects, never public URLs.

Use time-limited signed URLs for viewing.

## Encryption
- HTTPS/TLS in transit;
- managed encryption at rest;
- secrets in server-side environment variables only.

## API Keys
Never embed privileged service keys in mobile client.

## Image Retention
Offer user control:
- keep screenshot;
- delete original after extraction;
- delete proof.

Consider default option:
`Delete source screenshot after details are confirmed`.

## AI Provider Privacy
Document:
- which data is sent to AI provider;
- retention configuration;
- whether data is used for training;
- deletion behavior.

Prefer API configuration with no-training/default enterprise privacy protections where available.

## Logging
Do not log:
- raw screenshots;
- cancellation proof contents;
- auth tokens;
- full pasted confirmation text unless needed and properly protected.

## Account Deletion
Deletion should cover:
- profile;
- trials;
- reminders;
- screenshots;
- proof images;
- extraction records where legally/operationally permitted.

## Privacy UX
Provide plain-English explanation before image upload:
`We analyze this image only to detect trial details.`

## Legal Pages Required Before Public Launch
- Privacy Policy
- Terms of Use
- Subscription/Billing Terms
- AI Processing Disclosure
- Support Contact

## Disclaimers
TrialGuard should not claim:
- guaranteed cancellation;
- guaranteed refund;
- guaranteed notification delivery;
- provider affiliation where none exists.

Suggested:
`TrialGuard is an independent reminder and organization tool. Service providers control their own billing and cancellation terms.`

## Children
Unless explicitly designed otherwise, set product age rating/terms for general adult consumer use and avoid collecting children's data.

## Regional Privacy
Architecture should be capable of supporting relevant rights such as:
- access;
- correction;
- deletion;
- export where required;
- consent/opt-out mechanisms depending on applicable law.

Obtain jurisdiction-specific legal review before launch at scale.

---

# Source: 14_QA_TEST_PLAN.md

# QA & Test Plan

## 1. Test Categories
- unit tests;
- integration tests;
- UI/E2E tests;
- notification tests;
- timezone/date tests;
- AI extraction tests;
- subscription tests;
- security/access tests;
- accessibility tests;
- device matrix tests;
- regression tests.

## 2. Critical Path Tests

### TC-001 Screenshot to Protected Trial
Given valid screenshot with service/date/amount,
when user imports and confirms,
then active trial is created and reminders scheduled.

### TC-002 Incorrect AI Date
Given wrong detected date,
when user edits it,
then corrected date is stored and reminders use corrected date.

### TC-003 Missing Amount
Given screenshot without amount,
system must allow unknown amount without hallucinating one.

### TC-004 Short Trial
Given renewal in 36 hours,
system must not schedule a 7-day reminder in the past.

### TC-005 Notification Permission Denied
User can create trial but UI clearly indicates reminders are disabled.

### TC-006 Cancelled Trial
When marked cancelled,
all future reminders are cancelled.

### TC-007 Kept Trial
When marked kept,
all cancellation reminders stop.

### TC-008 Edit Renewal Date
Changing date reschedules reminders and removes old schedule.

### TC-009 Duplicate Activation
Tapping activate twice must not create duplicate reminders.

### TC-010 Paywall Limit
Free user over limit cannot add new protected trial but existing trial protections remain active.

## 3. AI Extraction Test Dataset
Create anonymized test set covering:
- Apple trial receipts;
- Google Play trials;
- Adobe-like annual plans;
- monthly plans;
- 3-day/7-day/14-day/30-day trials;
- multiple prices in one screenshot;
- multiple dates;
- discounts;
- currencies USD/GBP/EUR/CAD/AUD;
- ambiguous MM/DD vs DD/MM;
- dark mode/light mode;
- low-resolution screenshots;
- cropped screenshots;
- screenshots with no trial information.

Measure per-field accuracy separately.

## 4. Date/Timezone Tests
Test:
- DST start/end;
- travel across timezones;
- date-only renewal;
- exact provider time;
- midnight renewals;
- leap day;
- year boundary;
- locale date formats.

## 5. Notification Tests
On physical iOS and Android devices:
- app foreground;
- app background;
- app killed;
- device restarted;
- timezone changed;
- notification permission toggled;
- battery saver modes where relevant.

## 6. Subscription Tests
Use Apple/Google sandbox:
- purchase success;
- purchase cancel;
- restore;
- renewal;
- expiry;
- refund/revoke;
- grace period;
- offline entitlement cache.

## 7. Security Tests
- RLS blocks cross-user reads;
- signed URLs expire;
- deleted account cannot retrieve assets;
- no service-role key in client bundle;
- unauthorized provider-guide admin updates blocked.

## 8. Accessibility Tests
- screen reader order;
- dynamic type;
- contrast;
- large text clipping;
- reduced motion;
- buttons have accessible labels.

## 9. Device Matrix
At minimum:
- current iPhone generation;
- older supported iPhone;
- small-screen iPhone;
- current Pixel/Android reference;
- Samsung common device class;
- lower-memory Android device.

## 10. Release Blockers
Do not ship if:
- confirmed renewal dates create incorrect reminders;
- notifications frequently fail in supported flows;
- cross-user data access is possible;
- purchase/restore is broken;
- account deletion is broken;
- screenshot extraction silently hallucinates dates/amounts without review.

---

# Source: 15_RELEASE_AND_ROADMAP.md

# Release Plan & Roadmap

## Phase 0 — Validation Before Full Build
Create:
- landing page;
- prototype/Figma flow;
- 15–20 second product demo;
- waitlist.

Validation questions:
- do users understand screenshot → protection instantly?
- will users trust notifications without bank/email access?
- is annual pricing acceptable?

## Phase 1 — Internal Alpha
Scope:
- auth;
- manual trial creation;
- active dashboard;
- local reminders;
- keep/cancel states;
- history.

Purpose:
Validate reminder engine before AI.

## Phase 2 — AI Beta
Add:
- screenshot import;
- structured extraction;
- field confidence;
- correction flow;
- source-image storage.

## Phase 3 — Cancellation Beta
Add:
- provider database;
- cancellation URL/deep links;
- instructions;
- cancellation proof;
- money saved.

## Phase 4 — Monetization Beta
Add:
- RevenueCat;
- Free/Pro limits;
- paywall;
- restore purchase;
- entitlement analytics.

## Phase 5 — Public MVP
Launch gates:
- crash-free target met;
- extraction date accuracy validated;
- notification reliability validated;
- legal/privacy pages live;
- store screenshots/metadata complete;
- support path operational.

## Post-MVP Roadmap

### V1.1
- provider logos;
- smarter provider matching;
- improved notification actions;
- better history insights.

### V1.2
- share sheet integration;
- automatic parsing of copied confirmation text;
- region-aware cancellation guide variants.

### V1.3
- optional browser extension;
- sync extension-created trials to mobile.

### V1.4
- family/shared household mode if validated.

### V2 Candidates — Only After Validation
- email forwarding address for trial confirmations;
- renewal tracking beyond trial period;
- receipt/warranty extensions;
- refund evidence workflow;
- desktop web portal.

## Explicitly Deferred
- bank connection;
- automatic cancellation with credentials;
- subscription marketplace;
- budgeting;
- financial advice.

---

# Source: 16_CONTENT_AND_COPY.md

# Product Content & Copy Library

## Positioning
### Primary
**Never pay for a trial you forgot.**

### Supporting
**Screenshot your free trial. TrialGuard reminds you before it becomes paid.**

## Onboarding

### Screen 1
**Never pay for a trial you forgot.**

Free trials are easy to start and surprisingly easy to forget.

CTA: `Get Started`

### Screen 2
**Protect it in seconds.**

Import a screenshot. We detect the renewal date and amount. You confirm the details.

### Screen 3
**We keep asking before they charge.**

Get reminders before the renewal so you can keep it or cancel it on purpose.

## Add Trial
### Empty dashboard
**Nothing at risk right now.**

Protect your next free trial before you forget it.

CTA: `Protect a Trial`

### Source method
**How do you want to add it?**

Recommended: `Import Screenshot`

## AI Processing
**Finding the renewal date and charge…**

Fallback:
`We couldn't read everything clearly. You can fill in the missing details.`

## Review
**Check this before we protect it.**

Helper:
`TrialGuard never relies on AI alone for billing dates.`

## Success
**$79.99 protected ✓**

`We’ll remind you before Adobe is expected to renew.`

## Dashboard
### Metric
**Money at risk**

Helper:
`Upcoming charges from active trials.`

### Saved metric
**Money you saved**

Helper:
`Renewals you marked cancelled before billing.`

## Decision Screen
**Adobe may charge $79.99 in 3 days.**

`Do you still want it?`

Buttons:
- `Cancel It`
- `Keep It`
- `Decide Later`

## Cancel Flow
**Cancel Adobe**

`We’ll take you to Adobe. Complete cancellation there, then come back and confirm it here.`

CTA: `Open Adobe`

Secondary: `I Cancelled It`

## Proof
**Save proof of cancellation?**

`Keep the confirmation screenshot with this trial in case you need it later.`

## Saved
**You avoided $79.99.**

`Nice. That trial is no longer set as an upcoming risk in TrialGuard.`

## Paywall
**Protect every trial.**

Pro includes:
- unlimited protected trials;
- screenshot detection;
- stronger reminder controls;
- cancellation proof;
- full saved-money history.

CTA example:
`Get Pro — $19.99/year`

## Notification Copy

### 7d
`Adobe may charge $79.99 next week.`
`Still want it?`

### 3d
`$79.99 at risk in 3 days.`
`Adobe is still set to renew.`

### 24h
`Adobe may charge $79.99 tomorrow.`
`Cancel now if you don't want it.`

### 6h
`Final TrialGuard reminder.`
`Adobe's $79.99 renewal is approaching.`

## Errors
### No date detected
`We couldn't find a clear renewal date.`
`Add it manually so we don't guess.`

### Multiple prices
`We found more than one price.`
`Choose the amount you'll actually be charged.`

### Notifications disabled
**Reminders are off.**
`Your trial is saved, but TrialGuard can't alert you until notifications are enabled.`

### Offline
`You're offline.`
`Your saved trials are still available. Screenshot analysis will resume when you're connected.`

---

# Source: 17_TECH_STACK_AND_REPO.md

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

---

# Source: 18_ACCEPTANCE_CRITERIA.md

# MVP Acceptance Criteria

## A. Onboarding
- [ ] New user can understand product purpose without external explanation.
- [ ] Notification permission is preceded by explanatory screen.
- [ ] User can complete signup/sign-in.

## B. Add Trial
- [ ] User can add trial manually.
- [ ] User can add via screenshot.
- [ ] User can add via camera/photo if supported.
- [ ] User can paste confirmation text.
- [ ] AI output is editable.
- [ ] App never activates protection until user confirms renewal date.

## C. Trial Protection
- [ ] System calculates safe-cancel date.
- [ ] Reminder schedule is visible.
- [ ] Past reminder times are excluded.
- [ ] Activating twice does not create duplicates.

## D. Dashboard
- [ ] Active trials sorted by urgency.
- [ ] Money at Risk is mathematically correct for known amounts.
- [ ] Unknown amounts do not break totals.

## E. Reminders
- [ ] Reminder appears at configured time on supported physical device.
- [ ] Notification tap opens correct trial.
- [ ] Cancelled/kept trial stops future reminders.
- [ ] Permission-off state is clearly visible.

## F. Cancel/Keep
- [ ] User can mark Keep.
- [ ] User can enter Cancel flow.
- [ ] Known provider guide opens correct destination.
- [ ] User can mark cancellation complete.
- [ ] User can optionally store proof.

## G. Money Saved
- [ ] Only confirmed cancelled-before-renewal trials count.
- [ ] Amount uses correct currency.
- [ ] App does not project speculative future savings.

## H. History
- [ ] Cancelled, kept, and archived records are retrievable.
- [ ] History reflects correct decision timestamps.

## I. Payments
- [ ] Paywall displays correct product.
- [ ] Purchase activates Pro.
- [ ] Restore purchase works.
- [ ] Entitlement expiry behaves correctly.
- [ ] Existing protected reminders are not intentionally disabled merely because plan expires.

## J. Security
- [ ] User A cannot query User B trials/assets.
- [ ] Screenshots are private.
- [ ] No privileged keys ship in client bundle.
- [ ] Account deletion removes user-accessible data per policy.

## K. Reliability
- [ ] No known P0/P1 bug in protect → remind → decide → cancel path.
- [ ] Crash-free session target met during beta.
- [ ] Date/time edge cases tested.

## L. Store Readiness
- [ ] Privacy policy live.
- [ ] Terms live.
- [ ] Support contact works.
- [ ] Store subscription disclosure complete.
- [ ] Permission descriptions are accurate.
- [ ] App screenshots and metadata prepared.
