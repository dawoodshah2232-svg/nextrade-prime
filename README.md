# NEXTRADE PRIME — Prop Trading Firm Website

Demo front-end for **NEXTRADE PRIME**, a prop trading firm. Cinematic dark-navy + gold design, built as a static multi-page site. The CRM and payment systems are connected separately — this repo is the public website + demo trader area only.

**Live demo:** https://dawoodshah2232-svg.github.io/nextrade-prime/
**Repo:** https://github.com/dawoodshah2232-svg/nextrade-prime

## Pages

| Page | What it is |
|---|---|
| `index.html` | Hero with animated candlestick chart + live ticker, stats, 3 funding routes, how-it-works, platforms (MT5 / cTrader / TradingView), FAQ, CTA |
| `challenges.html` | Full pricing with interactive account-size selector, comparison table, trading rules |
| `login.html` | Trader login (demo) |
| `signup.html` | Create account (demo) |
| `dashboard.html` | Demo trader dashboard — balance, equity curve, drawdown meter, payout card, challenge progress. All numbers are fixed sample data, labelled DEMO |

## The 3 funding routes (demo defaults)

All routes: 8% max loss, no time limit, 80% profit split. Account sizes: $10k / $25k / $50k / $100k / $200k.

| Route | Target | Daily loss | Leverage | Prices ($10k / $25k / $50k / $100k / $200k) |
|---|---|---|---|---|
| 2-Step Challenge | 7% then 5% | 5% | 1:100 | $49 / $99 / $199 / $349 / $549 |
| 1-Step Challenge | 8% (one phase) | 4% | 1:50 | $59 / $119 / $229 / $399 / $649 |
| Instant Funding | 8% growth target | 4% | 1:30 | $99 / $199 / $349 / $599 / $999 |

### How to change prices

Edit **one object** at the top of `assets/script.js` — `PRICING`. Every card, price and limit on the site reads from it. No other file needs editing.

## Logos — exact files, do not redraw or recolor

| File | Variant | Use on |
|---|---|---|
| `assets/logo-dark.png` | Navy N\|P + navy NEXTRADE + gold PRIME | Light backgrounds ONLY |
| `assets/logo-light.png` | Silver/white N\|P + white NEXTRADE + gold PRIME | Dark backgrounds ONLY |

The site is dark navy throughout, so the header, footer, login, signup and dashboard all use `logo-light.png`. The dark variant is shipped for any future light section — never put a white card/pill behind a logo to force contrast; swap the variant instead.

## CRM integration point

Login/signup are **demo only**: any valid email + 6+ character password opens the demo dashboard (localStorage key `ntp_demo_session`); the Google button is visual only.

When the CRM is ready, replace the submit handlers in `assets/script.js`:

- Login form: `#login-form` in `login.html` → `handleLogin()`
- Signup form: `#signup-form` in `signup.html` → `handleSignup()`

Point those handlers at the CRM endpoint. **No CRM URL is invented in this repo** — add the real one when it exists. The dashboard (`dashboard.html`) currently shows fixed sample data; wire it to real CRM data at the same time.

## Honesty rules built into the copy

- No fake Trustpilot score, no fake "paid out" totals, no invented trader testimonials.
- No regulation / licence claim anywhere.
- Footer carries a full risk disclaimer; funded accounts are described as simulated evaluation accounts.
- Market ticker is labelled indicative demo data.

## Tech

Static HTML/CSS/JS, no build step, no framework. Served from GitHub Pages (main branch, root). Images are real Unsplash photos (verified 200 at build time); the hero chart and dashboard equity curve are canvas-drawn. Mobile-first responsive (375px, no horizontal scroll), `prefers-reduced-motion` respected.
