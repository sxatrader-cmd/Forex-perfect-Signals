import type { GuidePack } from "./types";

export const en: GuidePack = {
  nav: "Guides",
  index: {
    title: "Forex guides: gold, Islamic accounts, demo, leverage | 964FX",
    description: "Plain-language forex guides from 964FX: XAUUSD gold analysis, Islamic swap-free accounts, forex for beginners, demo accounts and leverage.",
    h1: "Forex guides",
    lede: "Short, practical guides that sit next to our daily signals and economic calendar. No promises, no hype: just how things work and what to check before you risk money.",
  },
  ui: {
    faq: "Frequently asked questions",
    next: "Keep going",
    signals: "Today's forex signals",
    calendar: "Economic calendar",
    telegram: "Telegram channel @Code964fx",
    method: "How our signals are built",
    liveChart: "Live XAUUSD chart",
    liveChartNote: "Chart by TradingView (OANDA feed). Broker prices can differ slightly.",
    disclosureTitle: "Introducing broker disclosure",
    disclosure: "964FX is run by Saif Altamimi, an Introducing Broker (IB) for IC Markets. The ic.com website is operated by Raw Trading Ltd, which IC states is regulated by the Seychelles Financial Services Authority (licence SD018). If you open an account through a link on this site, Saif may receive a commission from the broker. IC does not accept clients from some countries, including the United States, Canada and Iran, so check that the service is allowed where you live.",
    riskTitle: "Risk warning",
    risk: "Forex, gold and CFDs are leveraged products and you can lose money quickly. Only trade money you can afford to lose. This page is education, not financial, tax, legal or religious advice, and past results do not guarantee future results.",
    updated: "Last reviewed",
    read: "Read the guide",
    otherGuides: "Other guides",
  },
  guides: {
    "xauusd-gold": {
      label: "XAUUSD gold",
      title: "XAUUSD gold analysis & live chart: what moves gold | 964FX",
      description: "Live XAUUSD chart plus a practical guide to gold analysis: the dollar, interest rates, CPI and NFP, sessions, lot size and risk. Educational, not advice.",
      h1: "XAUUSD (gold): live chart and analysis guide",
      lede: "XAUUSD is the price of one troy ounce of gold in US dollars. It moves faster than most currency pairs, so it rewards preparation and punishes oversized positions.",
      sections: [
        {
          h: "Do we publish gold signals?",
          p: [
            "Not yet. Our automated signals currently cover the major currency pairs only, and each one waits until the setup is complete. If gold is added, it will appear on the signals page and in our Telegram channel first. Until then, this page gives you the live chart and the checklist we use to read gold.",
          ],
        },
        {
          h: "What usually moves gold",
          p: ["Gold has no yield and is priced in dollars, so a few drivers do most of the work:"],
          list: [
            "The US dollar: a stronger dollar often weighs on XAUUSD, and a weaker dollar often supports it. The link is not fixed.",
            "US interest rates and real yields: higher expected rates raise the cost of holding a metal that pays nothing.",
            "US data: CPI (inflation), Non-Farm Payrolls and Fed decisions can move gold by large amounts within minutes.",
            "Risk sentiment: in periods of stress, some investors buy gold as a safe haven.",
            "Central bank and ETF demand: slower, longer-term flows that shape the bigger trend.",
          ],
        },
        {
          h: "A simple routine before trading XAUUSD",
          p: [],
          list: [
            "Open the economic calendar and mark every high-impact USD event for the day.",
            "Read the 4-hour and daily trend first, then look for an entry on a lower timeframe.",
            "Place the stop beyond a real level (a swing high or low), not at a round number of dollars.",
            "Size the position from the stop distance, not from how confident you feel.",
            "Avoid opening a new trade a few minutes before CPI, NFP or a Fed decision unless that is your plan.",
          ],
        },
        {
          h: "Lot size, pips and spreads on gold",
          p: [
            "At many brokers one standard lot of XAUUSD is 100 ounces, so a 1 dollar move in price equals about 100 dollars per lot. Contract size, minimum lot and pip definition vary between brokers, so check the contract specifications before your first trade. Spreads usually widen around the daily rollover and during major news.",
          ],
        },
      ],
      faq: [
        { q: "What does XAUUSD mean?", a: "XAU is the code for one troy ounce of gold and USD is the US dollar. XAUUSD at 2,000 means one ounce costs 2,000 dollars." },
        { q: "What is the best time to trade gold?", a: "Gold is usually most active during the London and New York sessions and around major US data. Activity is not a guarantee of direction, so check the economic calendar first." },
        { q: "Does 964FX give XAUUSD signals?", a: "Not at the moment. Our signals cover the major currency pairs. Any change will be announced on the signals page and on our Telegram channel." },
        { q: "Why does gold move so much on news days?", a: "Gold reacts to expectations for US interest rates and the dollar. Inflation, jobs data and Fed decisions change those expectations quickly, so prices can jump and spreads can widen." },
      ],
    },
    "islamic-swap-free-account": {
      label: "Islamic account",
      title: "Is forex halal? Islamic swap-free accounts explained | 964FX",
      description: "Is forex trading halal? What an Islamic swap-free account changes, what it does not, the questions scholars raise, and how IC Markets' swap-free option works.",
      h1: "Is forex halal? A guide to Islamic swap-free accounts",
      lede: "Many Muslim traders ask two questions: is forex trading permissible, and does a swap-free account solve the problem of interest? This guide explains the issues clearly. It is not a fatwa.",
      sections: [
        {
          h: "What a swap-free account changes",
          p: [
            "On a normal account, positions held past the daily rollover pay or receive a swap, which is an interest-rate adjustment. A swap-free (Islamic) account removes that interest adjustment.",
            "Removing swap does not always mean holding is free. Some brokers replace it with a fixed fee or adjust costs elsewhere, so read the account terms.",
          ],
        },
        {
          h: "The questions scholars raise",
          p: ["Scholars and Shariah boards differ on retail forex. The points they usually discuss are:"],
          list: [
            "Riba (interest): addressed by removing swaps, according to those who permit swap-free trading.",
            "Immediate exchange (hand-to-hand): currency exchange should be settled on the spot, so delayed settlement is a concern.",
            "Leverage: whether the broker's margin facility counts as a loan that brings a benefit to the lender.",
            "Gharar and maysir: excessive uncertainty and gambling-like speculation, especially with very high leverage and very short trades.",
          ],
        },
        {
          h: "How IC Markets' swap-free option works",
          p: [
            "IC states that it offers swap-free accounts for clients who cannot earn or pay interest because of their religious beliefs. According to ic.com, the option is available on its Raw Spread and Standard accounts on MetaTrader 4, MetaTrader 5 and cTrader. Swap-free accounts do not pay or earn swap, but IC says a flat holding fee applies to positions kept open overnight, and its swap-free terms and conditions apply.",
          ],
        },
        {
          h: "A careful way to decide",
          p: [],
          list: [
            "Ask a qualified scholar you trust, and show them the actual account terms.",
            "Prefer low or no leverage and avoid gambling-style short trades.",
            "Read the broker's swap-free conditions, including any holding fee.",
            "Practise first on a demo account so you understand the costs.",
          ],
        },
      ],
      faq: [
        { q: "Is forex trading halal?", a: "There is no single answer. Some scholars allow spot currency trading on swap-free accounts with conditions, and others consider retail leveraged forex impermissible. Ask a qualified scholar about your situation." },
        { q: "What is an Islamic account in forex?", a: "It is a swap-free account: positions held overnight do not pay or receive interest. Some brokers charge a fixed holding fee instead." },
        { q: "Does IC Markets offer an Islamic account?", a: "Yes. IC states that a swap-free option is available on its Raw Spread and Standard accounts on MT4, MT5 and cTrader, with a flat holding fee for positions held overnight." },
        { q: "Does a swap-free account make every trade halal?", a: "No. It addresses interest, but scholars also look at settlement, leverage and speculation. The account type alone does not answer those questions." },
      ],
    },
    "forex-for-beginners": {
      label: "Forex for beginners",
      title: "Forex for beginners: how to read a forex signal | 964FX",
      description: "Forex trading for beginners: pairs, pips, lots, stop loss and take profit, how to read a forex signal step by step, and the rules that protect a small account.",
      h1: "Forex for beginners: how to read a signal",
      lede: "Forex is the market where currencies are exchanged against each other. Before you follow anyone's signals, ours included, you need to understand the few numbers every trade is built on.",
      sections: [
        {
          h: "The basics in five words",
          p: [],
          list: [
            "Pair: EUR/USD means euros priced in dollars. Buying it means you expect the euro to rise against the dollar.",
            "Pip: the standard price step. For EUR/USD one pip is 0.0001; for pairs with the yen it is 0.01.",
            "Lot: the trade size. A standard lot is 100,000 units of the first currency, a mini lot 10,000 and a micro lot 1,000.",
            "Spread: the gap between the buy and sell price. It is a cost you pay on every trade.",
            "Leverage: borrowed exposure that makes both gains and losses bigger.",
          ],
        },
        {
          h: "How to read a 964FX signal",
          p: ["Every signal on our signals page and in our Telegram channel has the same parts:"],
          list: [
            "Pair and direction: for example EURUSD SELL.",
            "Entry: the price where the idea starts.",
            "Stop loss (SL): where the idea is wrong and the trade closes with a loss.",
            "Take profit (TP): the target. Each signal shows its reward-to-risk ratio.",
            "Six reasons: trend, momentum, levels and the news calendar, so you can judge the idea yourself.",
            "Status: a signal stays open until price touches TP or SL, and we do not open another one on the same pair before that.",
          ],
        },
        {
          h: "Risk rules that protect a beginner",
          p: [
            "A common rule is to risk a small, fixed share of the account per trade, such as 1%. On a 1,000 dollar account that is 10 dollars. If the stop is 20 pips away, the size must be small enough that 20 pips equals 10 dollars, which on EUR/USD is about 0.05 lots.",
          ],
          list: [
            "Always use the stop loss, and never move it further away.",
            "Check the economic calendar before entering.",
            "Start on a demo account, then trade small.",
            "Keep a journal of every trade and why you took it.",
          ],
        },
      ],
      faq: [
        { q: "How much money do I need to start forex?", a: "Some brokers allow small deposits, but the right amount is money you can afford to lose. Start on a demo account and move to small real trades only when you follow your rules consistently." },
        { q: "What is a pip?", a: "A pip is the standard price step: 0.0001 for most pairs and 0.01 for yen pairs. On one standard lot of EUR/USD, one pip is worth about 10 dollars." },
        { q: "Can I copy signals without understanding them?", a: "You can, but it is risky. Signals lose sometimes. Knowing why a signal exists and where it is wrong helps you size it properly and stay calm." },
        { q: "Are forex signals guaranteed?", a: "No. No signal provider can guarantee results. Our archive shows every closed signal, wins and losses, so you can judge for yourself." },
      ],
    },
    "demo-account": {
      label: "Demo account",
      title: "Forex demo account: how to practise with virtual money | 964FX",
      description: "What a free forex demo account is, how to open one, how to practise our forex signals on it, and the checklist before you move to a real account.",
      h1: "Forex demo account guide",
      lede: "A demo account lets you trade real market prices with virtual money. It is the cheapest way to learn the platform, test a plan and make your first mistakes for free.",
      sections: [
        {
          h: "What a demo account is good for",
          p: [],
          list: [
            "Learning the platform: placing orders, setting stop loss and take profit, closing trades.",
            "Understanding lot size, pip value and margin before real money is involved.",
            "Following our daily signals and the economic calendar to see how news moves prices.",
            "Testing a written plan for several weeks and measuring the results honestly.",
          ],
        },
        {
          h: "What a demo cannot teach you",
          p: [
            "Virtual money does not create fear or greed, and fills on a demo can be cleaner than on a live account during fast news. Treat the demo as training, not as proof that a strategy will make money.",
          ],
        },
        {
          h: "Opening a demo with IC Markets",
          p: [
            "IC offers a free demo account, opened from the \"Try a Free Demo\" button on ic.com with a short registration form. You can then log in to MetaTrader or another supported platform with the demo login. Use the same balance and lot sizes you would really use; a huge demo balance teaches bad habits.",
          ],
        },
        {
          h: "Checklist before going live",
          p: [],
          list: [
            "At least 30 to 50 demo trades recorded in a journal.",
            "You always used a stop loss and never broke your risk rule.",
            "You know which calendar events you avoid.",
            "You start live with a small size and accept that results will vary.",
          ],
        },
      ],
      faq: [
        { q: "Is a forex demo account free?", a: "Yes, demo accounts are normally free and use virtual money. You do not deposit funds to open one." },
        { q: "Does IC Markets have a demo account?", a: "Yes. IC offers a free demo account from the \"Try a Free Demo\" button on ic.com after a short registration form." },
        { q: "How long should I trade on a demo?", a: "There is no fixed rule. Many traders stay on demo until they have a written plan and a few dozen trades that follow it." },
        { q: "Can I use 964FX signals on a demo account?", a: "Yes, and it is a good way to start. Follow the entry, stop and target exactly and record the results." },
      ],
    },
    leverage: {
      label: "Leverage",
      title: "Leverage in forex explained with examples (1:30, 1:500) | 964FX",
      description: "What leverage and margin mean in forex, worked examples, margin call and stop out, retail limits in the EU, UK and US, and how to use leverage safely.",
      h1: "Leverage in forex, explained",
      lede: "Leverage lets you open a position larger than your deposit. It does not change how much a pip is worth, it only changes how much margin the broker holds. That is why it is easy to misuse.",
      sections: [
        {
          h: "Leverage and margin with numbers",
          p: [
            "One standard lot of EUR/USD at 1.1000 is worth 110,000 dollars. At 1:30 leverage the broker holds about 3,667 dollars of margin; at 1:100 about 1,100 dollars; at 1:500 about 220 dollars.",
            "In all three cases a 50-pip move is worth about 500 dollars. Higher leverage only lets you open the same risk with less money, which makes it easier to open too much.",
          ],
        },
        {
          h: "Margin call and stop out",
          p: [
            "If losses reduce your equity close to the margin used, the platform warns you (margin call) and then starts closing positions automatically (stop out). The exact levels are in your broker's terms.",
          ],
        },
        {
          h: "Retail leverage limits",
          p: [
            "In the European Union and the United Kingdom, regulators limit retail leverage to 30:1 on major currency pairs and 20:1 on gold and non-major pairs, and require negative balance protection. In the United States the limit is 50:1 on major currency pairs and 20:1 on other currency pairs. Brokers in other jurisdictions may offer more; higher leverage means a smaller move can wipe out the account.",
          ],
        },
        {
          h: "Using leverage safely",
          p: [],
          list: [
            "Decide the risk per trade first (for example 1% of the account), then size the position from the stop distance.",
            "Do not use all available margin; leave room for spreads and news spikes.",
            "Be extra careful around high-impact events in the economic calendar.",
            "Remember that IC states its leverage is dynamic and may change, which can affect margin on open positions.",
          ],
        },
      ],
      faq: [
        { q: "What is 1:100 leverage?", a: "It means the broker holds 1% of the position value as margin. A 100,000 dollar position needs about 1,000 dollars of margin." },
        { q: "What leverage is best for beginners?", a: "There is no best number, but lower is safer. Most important is the risk per trade, which comes from the stop distance and lot size, not from the leverage setting." },
        { q: "Can I lose more than my deposit?", a: "In some cases, yes, if the market gaps. EU and UK retail clients have negative balance protection; elsewhere it depends on the broker's terms." },
        { q: "Does leverage change the pip value?", a: "No. Pip value depends on lot size. Leverage only changes the margin needed to open the position." },
      ],
    },
  },
};
