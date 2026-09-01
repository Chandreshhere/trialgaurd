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
