Design and build the complete UI system for a premium mobile app called “TrialGuard”.

PRODUCT PURPOSE:
TrialGuard helps users track free trials and prevents them from accidentally getting charged. Users can upload or share a screenshot of a free-trial confirmation, the app extracts the service name, trial end date, renewal price and billing cycle, then schedules escalating reminders before the charge happens.

IMPORTANT VISUAL REFERENCE:
Use the attached reference image as the PRIMARY visual inspiration.

Do not create a generic SaaS dashboard.
Do not create a typical “AI-generated” mobile app.
Do not use random gradients, oversized text, excessive pills, excessive icons, neon colors, generic purple gradients, or arbitrary card layouts.

The visual language should closely follow the reference:
- premium iOS-style interface
- predominantly white / very light cool-grey background
- soft powder-blue ambient gradient glows
- translucent / frosted blue surfaces selectively
- clean white cards
- extremely subtle cool-grey borders
- large rounded corners
- minimal shadows
- blue gradient primary actions
- strong typography hierarchy
- generous but controlled whitespace
- refined spacing
- sophisticated depth
- visually calm
- polished enough to look like a professionally funded consumer app

The result should feel like:
Apple-quality consumer fintech × premium AI utility × modern personal finance app.

Do NOT make it look like a template or vibe-coded app.

--------------------------------------------------
TYPOGRAPHY
--------------------------------------------------

Typography is extremely important.

Preferred font stack:

iOS:
SF Pro Display / SF Pro Text

Alternative premium stack:
Helvetica Now
Helvetica Neue
Inter

Fallback:
system-ui, -apple-system, BlinkMacSystemFont

Do not use Poppins.
Do not use Montserrat.
Do not use overly rounded or playful fonts.

Typography should feel neutral, contemporary and expensive.

Use approximately:

Display / Hero:
28–30px
weight: 600
line-height: 34–38px
letter-spacing: -0.5px

Screen title:
22–24px
weight: 600
line-height: 28–30px

Section heading:
18–20px
weight: 600
line-height: 24–26px

Card title:
15–17px
weight: 600

Body:
14–16px
weight: 400
line-height: 20–22px

Secondary text:
13–14px
weight: 400
cool grey

Caption:
11–12px
weight: 500

Button:
15–16px
weight: 600

Numbers representing money should feel especially strong:
28–34px
weight: 600–700
tabular numbers where possible.

Avoid excessive font-weight variation.

Use 400 / 500 / 600 primarily.

--------------------------------------------------
COLOR SYSTEM
--------------------------------------------------

Primary background:
#F8FBFD

Secondary surface:
#FFFFFF

Soft cool surface:
#F4F8FB

Primary blue:
#159DF7

Bright blue:
#36B7FF

Light blue:
#DDF3FF

Very light blue:
#EFF9FF

Text primary:
#101418

Text secondary:
#66717C

Text tertiary:
#98A2AC

Border:
rgba(20, 50, 70, 0.08)

Strong border:
rgba(20, 50, 70, 0.12)

Success:
#20B77A

Warning:
#F4A340

Danger:
#F05E5E

Do not let danger/red dominate the app.
TrialGuard should feel protective and calm, not alarming.

Use danger color only when a charge is genuinely imminent.

--------------------------------------------------
GRADIENTS
--------------------------------------------------

Blue gradients must be sophisticated and subtle.

Primary CTA gradient example:

linear-gradient(
  135deg,
  #169DF7 0%,
  #56C4FF 100%
)

Ambient background glow:

radial-gradient(
  circle,
  rgba(64, 183, 255, 0.20),
  rgba(64, 183, 255, 0.00) 65%
)

Do not put gradients on every element.

Gradient should primarily appear on:
- hero protection card
- primary CTA
- selected important states
- ambient background glow

Most cards must remain clean white.

--------------------------------------------------
SPACING SYSTEM
--------------------------------------------------

Use an 8pt spacing system.

Base units:
4
8
12
16
20
24
32
40
48

Standard horizontal screen padding:
18–20px

Card internal padding:
16–20px

Section spacing:
24–32px

Spacing between related controls:
8–12px

Spacing between separate content groups:
20–28px

Do not arbitrarily use different spacing values.

Everything should visually align to a consistent grid.

--------------------------------------------------
CORNER RADII
--------------------------------------------------

Small controls:
10–12px

Inputs:
14px

Normal cards:
18–20px

Major cards:
22–24px

Hero card:
24–28px

Buttons:
14–16px

Large floating CTA:
18px

Avoid using fully rounded pills everywhere.

Pills should be reserved for:
- status
- countdowns
- small filters
- tags

--------------------------------------------------
SHADOWS
--------------------------------------------------

Shadows must be almost invisible.

Example:

0px 4px 16px rgba(20, 60, 90, 0.05)

Hero cards:

0px 8px 28px rgba(38, 157, 230, 0.10)

Avoid black shadows.

Avoid strong Material Design elevation.

Depth should come from:
- layered surfaces
- subtle borders
- blur
- ambient gradient
- spacing

--------------------------------------------------
BORDERS
--------------------------------------------------

Use 1px borders:

rgba(25, 55, 75, 0.06–0.10)

Cards should NOT have obvious grey boxes.

Cards should blend naturally into the environment.

--------------------------------------------------
GLASS / BLUR
--------------------------------------------------

Use glassmorphism VERY selectively.

Example for blue-tinted hero surfaces:

background:
rgba(235, 248, 255, 0.72)

backdrop-filter:
blur(18px)

border:
1px solid rgba(255,255,255,0.65)

Do not turn the entire app into glassmorphism.

--------------------------------------------------
ICONOGRAPHY
--------------------------------------------------

Use:
SF Symbols style
Lucide
Phosphor
or another clean monoline icon family.

Stroke:
1.7–2px

Icons should generally be:
18–22px

Navigation icons:
22–24px

Avoid mixed icon styles.

Avoid emojis for core interface components.

Icons should sit inside subtle 34–40px containers when necessary.

--------------------------------------------------
APP NAVIGATION
--------------------------------------------------

Use a minimal 4-tab bottom navigation:

Shield
Saved
History
Profile

Tab bar should resemble premium iOS navigation:

height around 72–80px including safe-area
white / translucent background
very subtle top border
optional backdrop blur

Active icon:
primary blue

Inactive:
muted grey

Do not put oversized floating navigation elements.

--------------------------------------------------
SCREEN 1 — HOME / SHIELD
--------------------------------------------------

This is the most important screen.

Top region:

small avatar or profile circle on left

Greeting:
“Good morning, Alex”

small secondary text:
“Your trials are protected.”

Optional premium button on right:
small blue gradient button
“Go Pro”

Below:

Hero card inspired by the blue AI Assistant card in the reference.

But adapt it to TrialGuard.

Large card:

“Money at risk”

$247.97

Subtext:
“Across 3 active trials”

Include a small shield visual/icon.

Use subtle blue atmospheric background and soft decorative light streaks.

Primary CTA:

“Protect a new trial”

Secondary tiny action:
“Import screenshot”

Do NOT overpopulate hero card.

--------------------------------------------------
ACTIVE TRIALS SECTION
--------------------------------------------------

Heading:

“Needs your attention”

Show trial cards vertically.

Example:

Adobe Creative Cloud

$79.99 / year

Charges in:
3 days

Progress/countdown visual

Status:
“Decision needed”

Actions:

Keep
Cancel

Card should have:

service icon
service name
price
countdown
small status
one clear primary action

Do not create huge cards.

Use approximately 104–128px height.

When charge is >7 days:
neutral / blue

3–7 days:
light amber indication

<24h:
small red urgency indicator

Do not make entire card red.

--------------------------------------------------
QUICK ACTION GRID
--------------------------------------------------

Similar to the Image / Video cards in the supplied reference.

2-column compact grid.

Card 1:
Import Screenshot

Card 2:
Add Manually

Card 3:
Scan Confirmation

Card 4:
Paste Trial Details

Each:
white card
18px radius
small icon
short label
small circular arrow/action button bottom-right

No excessive description text.

--------------------------------------------------
MONEY SAVED SECTION
--------------------------------------------------

Use a visually calm wide card.

Heading:
“Money saved”

Large:
$428.73

Subtext:
“6 unwanted renewals avoided”

Add a tiny upward graph or shield indicator.

Avoid generic analytics graphs.

--------------------------------------------------
RECENT ACTIVITY
--------------------------------------------------

Minimal rows like the Recent Chat section in the reference.

Example:

Adobe cancelled
Saved $79.99

Canva protected
14 days remaining

Spotify kept
Renewal accepted

Rows should be:
48–56px

No large borders.

Use separators:
rgba(..., 0.05)

--------------------------------------------------
SCREEN 2 — IMPORT SCREENSHOT
--------------------------------------------------

Top navigation:
Back
center title:
“Protect a Trial”

Main heading:

“Add your trial”

Secondary:
“Upload the confirmation and we’ll find the important details.”

Large upload area:
rounded 22px
soft blue/white surface

Options:

Photos
Camera
Paste Text

Use clear icons.

After screenshot selection:

show image preview inside a premium floating card.

While processing:

subtle blue animation

Text:
“Finding trial details…”

Do not show fake AI robot visuals.

--------------------------------------------------
SCREEN 3 — TRIAL DETECTED
--------------------------------------------------

Show clear confirmation card.

Heading:
“Trial detected”

Service:
Adobe Creative Cloud

Free until:
September 14

Then:
$79.99 / year

Safe cancel date:
September 13

Visually highlight:
“$79.99 at risk”

Primary button:

“Protect $79.99”

Secondary:
“Edit details”

Include confidence / detected information discreetly.

Do NOT make user trust extracted data blindly.

Every extracted field should be editable.

--------------------------------------------------
SCREEN 4 — PROTECTION CONFIRMATION
--------------------------------------------------

Success screen.

Centered shield animation.

Text:

“You’re protected.”

$79.99

“TrialGuard will remind you before Adobe renews.”

Show reminder sequence:

7 days
3 days
24 hours
6 hours

Use a subtle vertical timeline.

Primary:
Done

Secondary:
Customize reminders

--------------------------------------------------
SCREEN 5 — TRIAL DETAILS
--------------------------------------------------

Large header:

Adobe Creative Cloud

$79.99/year

“3 days remaining”

Hero progress indicator.

Sections:

Trial details

Start date
End date
Renewal price
Billing cycle

Reminder schedule

7 days
3 days
1 day
6 hours

Cancellation

“Cancel Adobe”

This should be the strongest actionable button after protection.

History

Screenshot saved
Trial detected
Reminder scheduled

--------------------------------------------------
SCREEN 6 — CANCEL FLOW
--------------------------------------------------

Heading:

“Cancel Adobe”

Subheading:

“We’ll guide you through it.”

Step card system:

1.
Open Adobe account

button:
Open Adobe

2.
Choose Manage Plan

3.
Select Cancel Plan

After:

“Did you cancel successfully?”

Yes, cancelled
Not yet

When Yes:

Ask:

“Save cancellation proof?”

Upload screenshot

AI extracts confirmation date where possible.

Success:

“You saved $79.99”

--------------------------------------------------
SCREEN 7 — SAVED
--------------------------------------------------

Hero:

“You’ve protected”

$428.73

Secondary:
“from unwanted renewals”

Then saved events:

Adobe
$79.99

Canva
$119.99

VPN
$49.99

Use clean white list cards.

Could include:

This month
$129

This year
$428

Do not add unnecessary charts.

--------------------------------------------------
SCREEN 8 — HISTORY
--------------------------------------------------

Segmented control:

All
Cancelled
Kept
Expired

Rows:

Adobe
Cancelled
Saved $79.99

Spotify
Kept
$11.99 monthly

Canva
Cancelled
Saved $119.99

Use a very polished segmented control with subtle background.

--------------------------------------------------
SCREEN 9 — PROFILE
--------------------------------------------------

Clean settings screen.

Sections:

Account

Notifications

Reminder preferences

Default safe-cancel buffer

Currency

Subscription

Privacy

Export Data

Delete Account

Support

Use iOS-style grouped settings but retain TrialGuard visual identity.

--------------------------------------------------
PAYWALL
--------------------------------------------------

Do not use a generic giant subscription-paywall template.

Design a premium minimal paywall.

Heading:

“Protect every trial.”

Visual:
large translucent shield
soft blue glow

Show only 3–4 benefits:

Unlimited protected trials
AI screenshot detection
Aggressive reminders
Cancellation proof

Price:

$19.99/year

Small text:
Less than the cost of one forgotten trial.

Primary CTA:
“Protect My Money”

Secondary:
Continue Free

Include:
Restore Purchase
Terms
Privacy

No fake countdowns.
No dark patterns.

--------------------------------------------------
MICROINTERACTIONS
--------------------------------------------------

Add subtle premium interaction design.

Buttons:
scale 0.98 on press
120–160ms

Cards:
slight lift when tapped
no dramatic movement

Screen transitions:
220–280ms
ease-out

Shield activation:
soft glow pulse

Trial protected:
small haptic success feedback

Trial nearing renewal:
subtle countdown change

Money saved:
animated number count-up

Do not over-animate.

--------------------------------------------------
UX PRINCIPLES
--------------------------------------------------

Follow:

Jakob’s usability heuristics

Hick’s Law:
limit the number of visible decisions

Fitts’s Law:
primary touch targets at least 44×44px

Gestalt:
clear grouping and visual hierarchy

Progressive disclosure:
show advanced information only when needed

Recognition over recall:
show service logos, dates and monetary impact

Error prevention:
user MUST confirm extracted trial information before reminders activate

Visibility of system status:
clearly show when trial is:
protected
needs decision
cancelled
kept
expired

User control:
nothing should be automatically cancelled.

Consistency:
same card structure, CTA hierarchy, spacing and typography across screens.

--------------------------------------------------
ACCESSIBILITY
--------------------------------------------------

Minimum touch target:
44×44px

Body text:
minimum 14px

Do not rely on color alone for urgency.

Support:
Dynamic Type where possible

WCAG AA contrast for meaningful content.

Respect:
Reduce Motion

Support:
dark mode later, but build light mode first.

--------------------------------------------------
EMPTY STATES
--------------------------------------------------

Empty states must feel intentional.

Example Shield screen:

Shield illustration

“No trials at risk.”

“Start a free trial? Add it here and we’ll make sure you decide before it renews.”

CTA:
Protect a Trial

Do not fill empty screens with unnecessary graphics.

--------------------------------------------------
LOADING STATES
--------------------------------------------------

Use skeleton placeholders.

Do not use generic spinners everywhere.

For screenshot analysis:

animated subtle blue glow
+
“Reading your trial details…”

--------------------------------------------------
ERROR STATES
--------------------------------------------------

Avoid technical errors.

Instead of:

“Extraction failed.”

Say:

“We couldn’t confidently find the renewal date.”

CTA:
Enter it manually

Show partially extracted information if available.

--------------------------------------------------
CONTENT STYLE
--------------------------------------------------

Copy should be:

short
direct
calm
human
protective

Avoid:
AI jargon
financial jargon
marketing language
exclamation marks everywhere

Good:

“$79.99 may be charged tomorrow.”

Bad:

“URGENT!!! Your subscription is about to renew!”

Good:

“Do you still want Adobe?”

Bad:

“Manage Subscription.”

--------------------------------------------------
DESIGN QUALITY REQUIREMENTS
--------------------------------------------------

Before considering any screen complete, check:

1. Is spacing systematic?
2. Is typography hierarchical?
3. Are cards necessary?
4. Is the primary action immediately obvious?
5. Is there too much text?
6. Are there too many borders?
7. Does the screen have enough whitespace?
8. Are repeated components visually identical?
9. Are icons from one family?
10. Does the screen feel designed rather than generated?
11. Is the layout aligned to a grid?
12. Is every element serving a purpose?

Avoid “card soup”.

Not every piece of information requires its own card.

Use sections, rows, whitespace and typography whenever possible.

--------------------------------------------------
ANTI-VIBE-CODE RULES
--------------------------------------------------

STRICTLY AVOID:

random Tailwind spacing values
inconsistent corner radii
random shadows
different icon packs
unnecessary gradients
giant 40–50px headings
excessive cards
every section inside a container
multiple competing CTA colors
overuse of pills
overuse of glassmorphism
purple/blue generic AI gradients
floating decorative blobs everywhere
emoji as interface icons
fake analytics
random graphs
unnecessary dashboards
overpacked home screen
excessive explanation text
generic stock illustrations
template-looking onboarding screens

Every screen must feel intentionally art-directed.

--------------------------------------------------
IMPLEMENTATION GRID
--------------------------------------------------

Design baseline:

390 × 844px iPhone viewport

Horizontal padding:
20px

Content max-width:
mobile full width minus 40px

Use a consistent 8pt grid.

Respect:
safe areas
Dynamic Island
home indicator

All important controls should remain reachable with one hand where practical.

--------------------------------------------------
FINAL VISUAL TARGET
--------------------------------------------------

The finished TrialGuard interface should visually feel extremely close to the supplied reference in:

soft blue atmospheric lighting
premium white surfaces
rounded geometry
subtle glass effects
clean iPhone-native visual density
refined typography
compact cards
minimal shadows
bright blue primary actions

However, adapt the visual language specifically to TrialGuard.

The app must feel like it was designed by a senior product designer and implemented by a mature product engineering team.

It should NOT look like:
a hackathon app,
a no-code template,
a generic AI-generated dashboard,
or an amateur finance application.

Prioritize restraint, typography, spacing and interaction quality over decorative complexity.