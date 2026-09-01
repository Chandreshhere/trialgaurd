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
