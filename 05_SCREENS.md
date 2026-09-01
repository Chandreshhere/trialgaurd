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
