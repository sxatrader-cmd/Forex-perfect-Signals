# 964FX

توصيات فوركس تعليمية من العراق. Saif Altamimi is an Introducing Broker for IC Markets. The public URL is the `siteUrl` value in `site.config.json` (today the GitHub Pages project site). The brand name is 964FX.

## Switching to 964fx.com

The domain is not purchased yet. When it is:

1. Change `siteUrl` in `site.config.json` to `https://964fx.com`. The Pages base path is derived from that URL, so this is the one switch for canonical links, the sitemap, Open Graph, and asset prefixes.
2. Add a `public/CNAME` file whose only line is `964fx.com`, then redeploy. GitHub Pages reads that file as the custom domain. Do not add it before the DNS records exist, or the `github.io` address stops serving the site.
3. Point the domain at GitHub Pages (A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, or a CNAME to `sxatrader-cmd.github.io`).
4. Optional Search Console: set `gscVerification` in `site.config.json` to the verification token. It is empty until then.

Open signals receive a timestamped Arabic and English progress note every four hours. The hourly job appends one when at least four hours have passed since the last note. Closed signals, including that timeline, move to `/ar/archive/` and `/en/archive/` and are not edited afterward.

موقع تعليمي لسيف التميمي، وسيط معرّف لدى IC Markets. يعرض إشارات يومية لسبعة أزواج رئيسية وتقويم Forex Factory لهذا الأسبوع. التحليل آلي وتعليمي وليس نصيحة مالية.

Educational desk for Saif Altamimi, an Introducing Broker for IC Markets. The static site publishes a daily rules-based study of seven majors and this week's Forex Factory calendar. It is not financial advice.

The public site is meant to be served at `https://sxatrader-cmd.github.io/Forex-perfect-Signals/`.

## Run locally

```bash
npm install
python3 scripts/test_signals.py
npm run dev
```

Open `http://127.0.0.1:4317/Forex-perfect-Signals/ar/`. Arabic and English are separate URLs (`/ar/`, `/en/`).

Refresh data before a production build if you want a newer snapshot:

```bash
python3 scripts/fetch_news.py
FORCE_ISSUE=1 python3 scripts/update_signals.py
NEXT_PUBLIC_BASE_PATH=/Forex-perfect-Signals npm run build
```

The static export is written to `out/`.

## GitHub Pages setup

1. Push this repository to `sxatrader-cmd/Forex-perfect-Signals` with `main` as the default branch. Scheduled workflows run only on the default branch.
2. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. Settings → Actions → General → Workflow permissions: **Read and write**. The data job commits JSON with `GITHUB_TOKEN`. A commit made with that token does not start another workflow, so `.github/workflows/pages.yml` deploys in the same run after the commit.
4. If `main` is protected, allow the GitHub Actions bot to push data commits, or the scheduled updates cannot land.
5. The first successful deploy creates the `github-pages` environment. Later deploys use it.

`NEXT_PUBLIC_BASE_PATH` is `/Forex-perfect-Signals` in the workflow and in `next.config.ts`. Change both if the repository name changes. Asset URLs are prefixed with that path so they resolve on the project site.

## What the workflow does

| Trigger | Work |
| --- | --- |
| Push to `main` | Run the Python unit tests, build, and deploy. |
| Every 5 minutes | Fetch the calendar. Commit `data/news.json` only when events change, then deploy. |
| Hourly at minute 7 | Track open signals. Once per Baghdad day, from 05:00 UTC onward, try to issue a new signal. Commit only if JSON changed, then deploy. |
| Manual run | Refresh the calendar and track signals. Check **issue** to force the daily pass. Always deploys. |

GitHub can start a cron later than the listed minute. The signal job does not depend on the run landing inside the 05:00 hour: the first successful run at or after 05:00 UTC issues for that Baghdad date, and later runs only track.

## Data

| File | Role |
| --- | --- |
| `data/news.json` | Forex Factory events, with released actuals matched from TradingView when the currency, time, and title agree. |
| `data/signals.json` | Open signals, the daily scan, and which sources responded. |
| `data/history.json` | Closed signals (target or stop, pips, close time). |

Price history is the Yahoo Finance chart API (`query1`, then `query2`): daily, 1h, and 4h. That is the endpoint the `yfinance` package reads; the jobs stay on the standard library so Actions does not install it. Stooq answered with a browser check and is not used.

Headline tone is requested from ForexLive, Investing.com (forex, economy, opinion), ActionForex, and FXStreet. A feed that returns an error is recorded and the last good calendar file is kept on HTTP 429 or a network failure.

A pair is skipped when the daily EMA stack, 4H RSI/MACD, distance from the 4H average, upcoming high-impact news, or headline tone does not qualify. The market being closed also blocks a new signal. One pair holds at most one open signal, and at most one new signal per Baghdad day.

## Limits

- Forex Factory's public weekly file has forecast and previous, not the released actual. Actuals are filled only when a TradingView row matches safely.
- Yahoo candles are mid-price style quotes. Levels ignore broker spread, commission, and slippage.
- The weekend has no new signal even if the technical checks would pass.
- Five-minute and hourly schedules are free on a public repository, but GitHub may delay them, and Pages deploys are skipped when the JSON did not change.
