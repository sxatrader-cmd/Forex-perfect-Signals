# 964FX

توصيات فوركس تعليمية من العراق. Saif Altamimi is an Introducing Broker for IC Markets. The public URL is `https://964fx.com` (`siteUrl` in `site.config.json`). The brand name is 964FX.

## Custom domain

The site is served at `https://964fx.com`. `siteUrl` in `site.config.json` is the one switch for canonical links, the sitemap, Open Graph, and the Pages base path (empty at the domain root). `public/CNAME` contains `964fx.com`.

DNS at GoDaddy: apex A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`; `www` CNAME to `sxatrader-cmd.github.io`.

Optional Search Console: set `gscVerification` in `site.config.json` to the verification token. It is empty until then.

Open signals receive a timestamped Arabic and English progress note every four hours. The hourly job appends one when at least four hours have passed since the last note. Closed signals, including that timeline, move to `/ar/archive/` and `/en/archive/` and are not edited afterward.

موقع تعليمي لسيف التميمي، وسيط معرّف لدى IC Markets. يعرض إشارات يومية لسبعة أزواج رئيسية وتقويم Forex Factory لهذا الأسبوع. التحليل آلي وتعليمي وليس نصيحة مالية.

Educational desk for Saif Altamimi, an Introducing Broker for IC Markets. The static site publishes a daily rules-based study of seven majors and this week's Forex Factory calendar. It is not financial advice.

The public site is served at `https://964fx.com/`.

## Run locally

```bash
npm install
python3 scripts/test_signals.py
npm run dev
```

Open `http://127.0.0.1:4317/ar/`. Language routes live at `/ar/`, `/en/`, and the other locale prefixes.

Refresh data before a production build if you want a newer snapshot:

```bash
python3 scripts/fetch_news.py
FORCE_ISSUE=1 python3 scripts/update_signals.py
npm run build
```

The static export is written to `out/`.

## GitHub Pages setup

1. Push this repository to `sxatrader-cmd/Forex-perfect-Signals` with `main` as the default branch. Scheduled workflows run only on the default branch.
2. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. Settings → Actions → General → Workflow permissions: **Read and write**. The data job commits JSON with `GITHUB_TOKEN`. A commit made with that token does not start another workflow, so `.github/workflows/pages.yml` deploys in the same run after the commit.
4. If `main` is protected, allow the GitHub Actions bot to push data commits, or the scheduled updates cannot land.
5. The first successful deploy creates the `github-pages` environment. Later deploys use it.

The Pages base path is derived from `siteUrl` in `site.config.json` (empty at the domain root). Do not set `NEXT_PUBLIC_BASE_PATH` unless you need to override that.

## What the workflow does

| Trigger | Work |
| --- | --- |
| Push to `main` | Run the Python unit tests, build, and deploy. |
| Every 15 minutes (`3,18,33,48`) | Refresh the calendar, track open signals, append a progress note when one is at least 4 hours old, and issue the daily scan when it is due. Commit only if JSON changed, then deploy. |
| Manual run | Same work. Check **issue** to force the daily pass. Always deploys. Check **news_only** to refresh the economic calendar without running signals, tests, or charts; that path deploys only if `data/news.json` changed. |
| Event-timed news | A box-side scheduler reads the Forex Factory week and, for each event time T, dispatches `news_only` at about T+30s, T+2m, T+5m, and T+15m so actuals land quickly. An hourly full run is the fallback. The 15-minute GitHub schedule stays as a backup. |

GitHub often delays or skips a `*/5` cron, so the schedule is one run every 15 minutes. The job does not depend on landing inside a particular hour: the first successful run at or after 08:00 UTC issues for that Baghdad date, hourly tracking runs whenever a signal is open, and a 4-hour note is appended from the last update timestamp.

GitHub can still throttle scheduled workflows. An optional free pinger such as [cron-job.org](https://cron-job.org) can call this workflow with `workflow_dispatch` if the built-in schedule stays quiet. It is not required. Create a fine-grained token with Actions read/write on the repository and POST `https://api.github.com/repos/sxatrader-cmd/Forex-perfect-Signals/actions/workflows/pages.yml/dispatches` with body `{"ref":"main","inputs":{"issue":"false"}}`. To refresh only the calendar, use `{"ref":"main","inputs":{"news_only":"true"}}`.

New signals stay off while the repository variable `PAUSE_ISSUE` is `1`. The workflow passes that variable into the signal job. Tracking of anything already open, and the calendar refresh, keep running. Set the variable to anything other than `1` when the owner wants issuing to resume. `FORCE_ISSUE` does not override the pause.

## Data

| File | Role |
| --- | --- |
| `data/news.json` | Forex Factory events, with released actuals matched from TradingView when the currency, time, and title agree. |
| `data/signals.json` | Open signals, the daily scan, and which sources responded. |
| `data/history.json` | Closed signals (target or stop, pips, close time). |

Price history is the Yahoo Finance chart API (`query1`, then `query2`): daily, 1h, and 4h, requested with an explicit end time so the daily series is not a stale cached range. The latest daily session is kept and filled from the 4-hour bars when Yahoo's daily candle is still forming. That is the endpoint the `yfinance` package reads; the jobs stay on the standard library so Actions does not install it. Stooq answered with a browser check and is not used.

`python3 scripts/update_macro.py` refreshes `data/policy_rates.json` and `data/macro_calendar.json` from TradingView's public calendar. The first run, or `--full`, loads 1 August 2025 onward. Later runs merge the last 21 days and the next 10. The workflow does this before the signal job. A failed refresh keeps the files already committed.

A new signal still needs the 4-hour pullback at or after 08:00 UTC, and the last 8 trading days of high-impact surprises (actual versus forecast) must favour that direction. The policy-rate gap and its 120-day change are written into the reasons. On the in-sample window, requiring the rate path as well as the news surprise left too few trades and a weaker result, so the rate path does not block. The 8-hour block before a high-impact release stays. `python3 scripts/backtest_signals.py` replays that path, charges 1 pip of spread on EUR, GBP, JPY, and AUD and 1.5 pips on NZD, CAD, and CHF, and prints profit factor in pips and in R. It does not write `data/history.json`. New signals stay paused while `PAUSE_ISSUE` is `1`. On the in-sample window the news surprise beat the rate filter and the combination of both. The holdout did not clear the bar: profit factor in R was above 1.3 and net R was positive, but profit factor in pips was about 1 and net pips were slightly negative.

Headline tone is requested from ForexLive, Investing.com (forex, economy, opinion), ActionForex, and FXStreet. A feed that returns an error is recorded and the last good calendar file is kept on HTTP 429 or a network failure.

A new signal needs a 4-hour trend (EMA20 versus EMA50, with MACD in the same direction) that the daily bias does not fully contradict. Pullbacks toward the 4-hour EMA20 are allowed. Headline tone only blocks a very strong contradiction. The market being closed also blocks a new signal. One pair holds at most one open signal, and at most one new signal per Baghdad day.

## Limits

- Forex Factory's public weekly file has forecast and previous, not the released actual. Actuals are filled only when a TradingView row matches safely.
- Yahoo candles are mid-price style quotes. Levels ignore broker spread, commission, and slippage.
- The weekend has no new signal even if the technical checks would pass.
- The 15-minute schedule is free on a public repository, but GitHub may delay or drop runs. Pages deploys are skipped when the JSON did not change. A cron-job.org ping is optional and not part of the site.
