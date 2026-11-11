# NEXTRADE PRIME — Prop Trading Firm Website

Demo front-end for **NEXTRADE PRIME**, a prop trading firm. Liberty Markets-style design — near-black, deep charcoal panels, white serif headings, one gold accent matching the NexTrade logo — built as a static multi-page site. The CRM and payment systems are connected separately — this repo is the public website + demo trader area only.

**Live demo:** https://dawoodshah2232-svg.github.io/nextrade-prime/
**Repo:** https://github.com/dawoodshah2232-svg/nextrade-prime

## Pages

| Page | What it is |
|---|---|
| `index.html` | Split-photo collage hero with floating glass stat cards, live price dashboard, 3 funding routes with tabbed comparison, market snapshot, financial profiles, products, ambition cards, challenge configurator, MT5-only platform section, 5-step how-it-works, count-up stats band, FAQ, CTA |
| `challenges.html` | Full pricing with interactive account-size selector, tabbed comparison, 2-Step fee breakdown, trading rules |
| `login.html` | Trader login (demo) |
| `signup.html` | Create account (demo) |
| `dashboard.html` | Demo trader dashboard — balance, equity curve, drawdown meter, payout card, challenge progress. All numbers are fixed sample data, labelled DEMO |

## The 3 funding routes (Liberty-style rules)

All routes: 8% max loss, 4% daily loss, min 3 trading days, no time limit, 100% fee refund, up to 80% profit split. Account sizes: $5k / $10k / $25k / $50k / $100k / $150k / $200k.

| Route | Target | Leverage | Prices ($5k / $10k / $25k / $50k / $100k / $150k / $200k) |
|---|---|---|---|
| 2-Step Challenge | 8% then 5% | 1:100 | $20 / $35 / $55 / $85 / $125 / $175 / $225 (Phase 1 $10 flat + Phase 2 $10/$25/$45/$75/$115/$165/$215) |
| 1-Step Challenge | 8% (one phase) | 1:50 | $39 / $59 / $129 / $229 / $419 / $649 / $849 |
| Instant Funding | 8% growth target | 1:30 | $95 / $155 / $255 / $395 / $595 / $795 / $995 |

### How to change prices

Edit **one object** at the top of `assets/script.js` — `PRICING`. Every card, price, limit, comparison table and the configurator read from it. No other file needs editing.

## Platforms — MT5 only

The site names one platform only: **MetaTrader 5**. The platform section uses the official MetaTrader 5 logo hotlinked from MetaQuotes (`https://www.metatrader5.com/i/metatrader-5-logo.png`, verified 200) plus a real MT5 terminal photo. No other platform is named anywhere on the site.

## Logos — exact files, do not redraw or recolor

| File | Variant | Use on |
|---|---|---|
| `assets/logo-dark.png` | Navy N\|P + navy NEXTRADE + gold PRIME | Light backgrounds ONLY |
| `assets/logo-light.png` | Silver/white N\|P + white NEXTRADE + gold PRIME | Dark backgrounds ONLY |

The site is near-black throughout, so the header, footer, login, signup and dashboard all use `logo-light.png`. The dark variant is shipped for any future light section — never put a white card/pill behind a logo to force contrast; swap the variant instead.

## CRM integration point

Login/signup are **demo only**: any valid email + 6+ character password opens the demo dashboard (localStorage key `ntp_demo_session`); the Google button is visual only.

When the CRM is ready, replace the submit handlers in `assets/script.js`:

- Login form: `#login-form` in `login.html` → `handleLogin()`
- Signup form: `#signup-form` in `signup.html` → `handleSignup()`

Point those handlers at the CRM endpoint. **No CRM URL is invented in this repo** — add the real one when it exists. The dashboard (`dashboard.html`) currently shows fixed sample data; wire it to real CRM data at the same time.

## Honesty rules built into the copy

- No fake Trustpilot score, no fake "paid out" totals, no invented trader testimonials, no payout screenshots.
- No regulation / licence claim anywhere — footer states the accounts are simulated and the firm is not a regulated broker.
- No promo discount, no countdown.
- Market ticker / snapshot / price dashboard are labelled indicative demo data.

## Tech

Static HTML/CSS/JS, no build step, no framework. Served from GitHub Pages (main branch, root). Images are real Unsplash photos (verified 200 at build time); the dashboard equity curve is canvas-drawn. Mobile-first responsive (375px, no horizontal scroll), `prefers-reduced-motion` respected, fast fade-in (no dim first paint).
