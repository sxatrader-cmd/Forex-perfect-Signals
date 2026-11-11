import type { GuidePack } from "./types";

export const de: GuidePack = {
  nav: "Ratgeber",
  index: {
    title: "Forex-Ratgeber: Gold, islamisches Konto, Demokonto, Hebel | 964FX",
    description: "Verständliche Forex-Ratgeber von 964FX: Gold XAUUSD analysieren, islamisches Konto ohne Swap, Devisenhandel für Anfänger, Demokonto und Hebel.",
    h1: "Forex-Ratgeber",
    lede: "Kurze, praktische Ratgeber neben unseren täglichen Signalen und dem Wirtschaftskalender. Keine Gewinnversprechen: nur wie es funktioniert und was Sie prüfen sollten, bevor Sie Geld riskieren.",
  },
  ui: {
    faq: "Häufige Fragen",
    next: "Weiterlesen",
    signals: "Forex-Signale heute",
    calendar: "Wirtschaftskalender",
    telegram: "Telegram-Kanal @Code964fx",
    method: "So entstehen unsere Signale",
    liveChart: "XAUUSD-Chart live",
    liveChartNote: "Chart von TradingView (OANDA-Daten). Kurse beim Broker können leicht abweichen.",
    disclosureTitle: "Hinweis zum Introducing Broker",
    disclosure: "964FX wird von Saif Altamimi betrieben, Introducing Broker (IB) für IC Markets. Die Website ic.com wird von der Raw Trading Ltd betrieben, die laut IC von der Financial Services Authority der Seychellen reguliert wird (Lizenz SD018). Wenn Sie über einen Link auf dieser Website ein Konto eröffnen, kann Saif eine Provision vom Broker erhalten. IC nimmt keine Kunden aus einigen Ländern an, darunter die USA, Kanada und Iran. Prüfen Sie, ob der Dienst in Ihrem Land zulässig ist; in Deutschland führt die BaFin eine Unternehmensdatenbank zugelassener Anbieter.",
    riskTitle: "Risikohinweis",
    risk: "Forex, Gold und CFDs sind gehebelte Produkte, mit denen Sie schnell Geld verlieren können. Handeln Sie nur mit Geld, dessen Verlust Sie verkraften können. Diese Seite dient der Bildung und ist keine Anlage-, Steuer-, Rechts- oder religiöse Beratung. Vergangene Ergebnisse sind keine Garantie für die Zukunft.",
    updated: "Zuletzt geprüft",
    read: "Ratgeber lesen",
    otherGuides: "Weitere Ratgeber",
  },
  guides: {
    "xauusd-gold": {
      label: "Gold XAUUSD",
      title: "Gold XAUUSD: Live-Chart und Goldpreis-Analyse | 964FX",
      description: "XAUUSD-Chart live und praktischer Leitfaden zur Goldanalyse: US-Dollar, Fed-Zinsen, Inflation und NFP, Lotgröße und Hebel. Keine Anlageberatung.",
      h1: "Gold (XAUUSD): Live-Chart und Analyse-Leitfaden",
      lede: "XAUUSD ist der Preis einer Feinunze Gold in US-Dollar. Gold bewegt sich schneller als die meisten Währungspaare – Vorbereitung und Positionsgröße entscheiden.",
      sections: [
        {
          h: "Gibt es bei uns Gold-Signale?",
          p: [
            "Noch nicht. Unsere automatischen Signale decken derzeit nur die Major-Währungspaare ab, und jedes wartet, bis das Setup vollständig ist. Falls Gold hinzukommt, kündigen wir es zuerst auf der Signalseite und im Telegram-Kanal an. Bis dahin finden Sie hier den Live-Chart und unsere Checkliste für Gold.",
          ],
        },
        {
          h: "Was den Goldpreis meist bewegt",
          p: ["Gold wirft keine Zinsen ab und wird in Dollar gehandelt, deshalb erledigen wenige Faktoren den Großteil:"],
          list: [
            "Der US-Dollar: ein starker Dollar belastet XAUUSD oft, ein schwacher stützt es oft. Der Zusammenhang ist nicht fest.",
            "US-Zinsen und Realrenditen: höhere erwartete Zinsen verteuern das Halten eines Metalls ohne Ertrag.",
            "US-Daten: Inflation (CPI), Arbeitsmarkt (NFP) und Fed-Entscheidungen können Gold binnen Minuten stark bewegen.",
            "Risikostimmung: in Stressphasen kaufen manche Anleger Gold als sicheren Hafen.",
            "Nachfrage von Zentralbanken und ETFs: langsamere Ströme, die den großen Trend prägen.",
          ],
        },
        {
          h: "Eine einfache Routine vor dem Gold-Trade",
          p: [],
          list: [
            "Öffnen Sie den Wirtschaftskalender und markieren Sie alle wichtigen USD-Termine des Tages.",
            "Lesen Sie zuerst den Trend im 4-Stunden- und Tageschart, dann suchen Sie den Einstieg im kleineren Zeitrahmen.",
            "Setzen Sie den Stop hinter ein echtes Niveau (Hoch oder Tief), nicht auf eine runde Zahl.",
            "Berechnen Sie die Positionsgröße aus dem Stop-Abstand, nicht aus dem Bauchgefühl.",
            "Eröffnen Sie keinen neuen Trade kurz vor CPI, NFP oder der Fed, wenn das nicht Ihr Plan ist.",
          ],
        },
        {
          h: "Lot, Pips, Spread und Hebel bei Gold",
          p: [
            "Bei vielen Brokern entspricht ein Standardlot XAUUSD 100 Unzen; eine Kursbewegung von 1 Dollar sind dann etwa 100 Dollar pro Lot. Kontraktgröße, Mindestlot und Pip-Definition unterscheiden sich je Broker – prüfen Sie die Kontraktspezifikation. Für Privatkunden in der EU ist der Hebel auf Gold auf 20:1 begrenzt. Spreads weiten sich oft zum Rollover und bei wichtigen Nachrichten.",
          ],
        },
      ],
      faq: [
        { q: "Was bedeutet XAUUSD?", a: "XAU steht für eine Feinunze Gold, USD für den US-Dollar. XAUUSD bei 2.000 heißt: eine Unze kostet 2.000 Dollar." },
        { q: "Wann ist Gold am aktivsten?", a: "Meist in der Londoner und New Yorker Sitzung sowie rund um wichtige US-Daten. Aktivität garantiert keine Richtung – prüfen Sie zuerst den Kalender." },
        { q: "Bietet 964FX XAUUSD-Signale an?", a: "Derzeit nicht. Unsere Signale decken die Major-Paare ab. Änderungen kündigen wir auf der Signalseite und im Telegram-Kanal an." },
        { q: "Warum schwankt Gold an Nachrichtentagen so stark?", a: "Gold reagiert auf Erwartungen zu US-Zinsen und Dollar. Inflation, Arbeitsmarktdaten und Fed-Entscheidungen ändern diese Erwartungen schnell; der Kurs springt, und Spreads können sich weiten." },
      ],
    },
    "islamic-swap-free-account": {
      label: "Islamisches Konto",
      title: "Islamisches Konto (swapfrei): Ist Forex halal? | 964FX",
      description: "Ist Forex-Handel halal? Was ein islamisches, swapfreies Konto ändert und was nicht, welche Fragen Gelehrte stellen und wie die Swap-free-Option von IC Markets funktioniert.",
      h1: "Islamisches Konto im Forex: Ist Devisenhandel halal?",
      lede: "Viele muslimische Trader fragen zweierlei: Ist Devisenhandel erlaubt, und löst ein islamisches Konto das Zinsproblem? Dieser Ratgeber erklärt die Punkte sachlich. Er ist keine Fatwa.",
      sections: [
        {
          h: "Was ein swapfreies Konto ändert",
          p: [
            "Auf einem normalen Konto zahlt oder erhält eine Position, die über den täglichen Rollover gehalten wird, einen Swap – eine zinsbezogene Anpassung. Das islamische (swapfreie) Konto streicht diese Anpassung.",
            "Swapfrei heißt nicht immer kostenlos: Manche Broker erheben stattdessen eine feste Haltegebühr. Lesen Sie die Kontobedingungen.",
          ],
        },
        {
          h: "Welche Fragen Gelehrte diskutieren",
          p: ["Gelehrte und Scharia-Gremien sind beim Privatkunden-Forex uneins. Diskutiert werden vor allem:"],
          list: [
            "Riba (Zins): nach Ansicht der Befürworter durch den Wegfall des Swaps gelöst.",
            "Sofortiger Austausch (Hand zu Hand): Währungstausch soll sofort abgewickelt werden; verzögerte Abwicklung ist umstritten.",
            "Hebel: Ist die Margin-Fazilität des Brokers ein Darlehen mit Vorteil für den Geber?",
            "Gharar und Maysir: übermäßige Unsicherheit und glücksspielähnliche Spekulation, besonders bei hohem Hebel und sehr kurzen Trades.",
          ],
        },
        {
          h: "Die swapfreie Option bei IC Markets",
          p: [
            "IC gibt an, swapfreie Konten für Kunden anzubieten, die aus religiösen Gründen keine Zinsen zahlen oder erhalten können. Laut ic.com ist die Option für die Kontotypen Raw Spread und Standard auf MetaTrader 4, MetaTrader 5 und cTrader verfügbar. Diese Konten zahlen und erhalten keinen Swap; laut IC fällt für über Nacht gehaltene Positionen jedoch eine pauschale Haltegebühr an, und es gelten die Swap-free-Bedingungen.",
          ],
        },
        {
          h: "Besonnen entscheiden",
          p: [],
          list: [
            "Fragen Sie einen qualifizierten Gelehrten Ihres Vertrauens und zeigen Sie ihm die tatsächlichen Kontobedingungen.",
            "Bevorzugen Sie wenig oder keinen Hebel und meiden Sie glücksspielartige Kurztrades.",
            "Lesen Sie die Swap-free-Bedingungen des Brokers inklusive Haltegebühren.",
            "Üben Sie zuerst auf einem Demokonto.",
          ],
        },
      ],
      faq: [
        { q: "Ist Forex halal oder haram?", a: "Es gibt keine einheitliche Antwort. Manche Gelehrte erlauben Kassa-Devisenhandel auf swapfreien Konten unter Bedingungen, andere halten gehebelten Privatkunden-Forex für unzulässig. Fragen Sie einen qualifizierten Gelehrten." },
        { q: "Was ist ein islamisches Konto?", a: "Ein swapfreies Konto: über Nacht gehaltene Positionen zahlen und erhalten keine Zinsen. Manche Broker berechnen stattdessen eine feste Gebühr." },
        { q: "Hat IC Markets ein islamisches Konto?", a: "Ja. Laut IC ist die swapfreie Option für Raw Spread und Standard auf MT4, MT5 und cTrader verfügbar, mit einer pauschalen Gebühr für über Nacht gehaltene Positionen." },
        { q: "Macht ein swapfreies Konto jeden Trade halal?", a: "Nein. Es betrifft die Zinsfrage; Gelehrte prüfen aber auch Abwicklung, Hebel und Spekulation." },
      ],
    },
    "forex-for-beginners": {
      label: "Forex für Anfänger",
      title: "Forex für Anfänger: Devisenhandel lernen & Signale lesen | 964FX",
      description: "Devisenhandel für Anfänger: Währungspaare, Pips, Lots, Stop-Loss und Take-Profit, Forex-Signale Schritt für Schritt lesen – plus: Ist Forex legal, und was ist mit Steuern?",
      h1: "Forex für Anfänger: So lesen Sie ein Signal",
      lede: "Forex ist der Markt, auf dem Währungen gegeneinander getauscht werden. Bevor Sie fremden Signalen folgen – auch unseren –, sollten Sie die wenigen Zahlen verstehen, auf denen jeder Trade beruht.",
      sections: [
        {
          h: "Die Grundlagen in fünf Begriffen",
          p: [],
          list: [
            "Währungspaar: EUR/USD ist der Euro in Dollar. Kaufen heißt, Sie erwarten einen steigenden Euro.",
            "Pip: der Standard-Kursschritt, 0,0001 bei EUR/USD und 0,01 bei Yen-Paaren.",
            "Lot: die Positionsgröße. Ein Standardlot sind 100.000 Einheiten der ersten Währung, ein Minilot 10.000, ein Mikrolot 1.000.",
            "Spread: die Differenz zwischen Kauf- und Verkaufskurs – Kosten bei jedem Trade.",
            "Hebel: geliehenes Exposure, das Gewinne und Verluste vergrößert.",
          ],
        },
        {
          h: "So lesen Sie ein 964FX-Signal",
          p: ["Jedes Signal auf der Signalseite und im Telegram-Kanal hat denselben Aufbau:"],
          list: [
            "Paar und Richtung: zum Beispiel EURUSD SELL.",
            "Einstieg: der Kurs, an dem die Idee beginnt.",
            "Stop-Loss (SL): wo die Idee falsch ist und der Trade mit Verlust schließt.",
            "Take-Profit (TP): das Ziel; jedes Signal zeigt sein Chance-Risiko-Verhältnis.",
            "Sechs Gründe: Trend, Momentum, Marken und Kalender, damit Sie die Idee selbst beurteilen.",
            "Status: ein Signal bleibt offen, bis TP oder SL erreicht ist; vorher gibt es kein neues auf demselben Paar.",
          ],
        },
        {
          h: "Risikoregeln für Einsteiger",
          p: [
            "Eine verbreitete Regel: pro Trade einen kleinen, festen Anteil des Kontos riskieren, etwa 1 %. Bei 1.000 Dollar sind das 10 Dollar. Liegt der Stop 20 Pips entfernt, muss die Größe so klein sein, dass 20 Pips 10 Dollar entsprechen – bei EUR/USD etwa 0,05 Lot.",
          ],
          list: [
            "Immer einen Stop-Loss setzen und ihn nie weiter wegschieben.",
            "Vor dem Einstieg den Wirtschaftskalender prüfen.",
            "Mit einem Demokonto beginnen, dann klein handeln.",
            "Ein Trading-Tagebuch führen.",
          ],
        },
        {
          h: "Ist Forex legal, und was gilt bei Steuern?",
          p: [
            "Devisenhandel über zugelassene Anbieter ist in Deutschland erlaubt; ob ein Anbieter zugelassen ist, zeigt die Unternehmensdatenbank der BaFin. Gewinne aus dem Handel können steuerpflichtig sein. Die Details hängen von Ihrer persönlichen Situation ab – lassen Sie sich von einem Steuerberater beraten. In Österreich und der Schweiz gelten eigene Regeln und Aufsichtsbehörden.",
          ],
        },
      ],
      faq: [
        { q: "Wie viel Geld brauche ich für den Einstieg?", a: "Manche Broker akzeptieren kleine Einzahlungen, aber der richtige Betrag ist Geld, dessen Verlust Sie verkraften. Starten Sie im Demokonto und wechseln Sie klein ins Echtgeld, wenn Sie Ihre Regeln einhalten." },
        { q: "Was ist ein Pip?", a: "Der Standard-Kursschritt: 0,0001 bei den meisten Paaren, 0,01 bei Yen-Paaren. Bei einem Standardlot EUR/USD ist ein Pip etwa 10 Dollar wert." },
        { q: "Ist Forex-Handel in Deutschland legal?", a: "Ja, über zugelassene Anbieter. Prüfen Sie die Zulassung in der BaFin-Datenbank und klären Sie steuerliche Fragen mit einem Steuerberater." },
        { q: "Sind Forex-Signale eine Gewinngarantie?", a: "Nein. Kein Anbieter kann Ergebnisse garantieren. Unser Archiv zeigt alle geschlossenen Signale, Gewinner und Verlierer." },
      ],
    },
    "demo-account": {
      label: "Demokonto",
      title: "Forex Demokonto kostenlos: Üben mit virtuellem Geld | 964FX",
      description: "Was ein kostenloses Forex-Demokonto ist, wie Sie es eröffnen, wie Sie unsere Signale damit üben und was Sie vor dem Echtgeldkonto prüfen sollten.",
      h1: "Forex-Demokonto: der Leitfaden",
      lede: "Mit einem Demokonto handeln Sie zu echten Marktkursen mit virtuellem Geld. Das ist der günstigste Weg, die Plattform zu lernen, einen Plan zu testen und die ersten Fehler kostenlos zu machen.",
      sections: [
        {
          h: "Wofür ein Demokonto gut ist",
          p: [],
          list: [
            "Die Plattform lernen: Orders, Stop-Loss, Take-Profit, Schließen.",
            "Lotgröße, Pip-Wert und Margin verstehen, bevor echtes Geld im Spiel ist.",
            "Unsere täglichen Signale und den Kalender verfolgen und sehen, wie Nachrichten Kurse bewegen.",
            "Einen schriftlichen Plan über Wochen testen und ehrlich auswerten.",
          ],
        },
        {
          h: "Was ein Demokonto nicht lehrt",
          p: [
            "Virtuelles Geld erzeugt weder Angst noch Gier, und Ausführungen im Demo können bei schnellen Nachrichten sauberer sein als live. Das Demokonto ist Training, kein Beweis, dass eine Strategie Geld verdient.",
          ],
        },
        {
          h: "Demokonto bei IC Markets",
          p: [
            "IC bietet ein kostenloses Demokonto über die Schaltfläche „Try a Free Demo“ auf ic.com nach einem kurzen Registrierungsformular an; danach melden Sie sich mit den Demo-Zugangsdaten bei MetaTrader oder einer anderen unterstützten Plattform an. Nutzen Sie denselben Kontostand und dieselben Lotgrößen wie später live – ein riesiges Demoguthaben erzieht schlechte Gewohnheiten.",
          ],
        },
        {
          h: "Checkliste vor dem Echtgeld",
          p: [],
          list: [
            "Mindestens 30 bis 50 Demo-Trades im Tagebuch.",
            "Immer mit Stop-Loss, Risikoregel nie gebrochen.",
            "Sie wissen, welche Kalendertermine Sie meiden.",
            "Sie starten live klein und akzeptieren schwankende Ergebnisse.",
          ],
        },
      ],
      faq: [
        { q: "Ist ein Forex-Demokonto kostenlos?", a: "Ja, Demokonten sind in der Regel kostenlos und nutzen virtuelles Geld; eine Einzahlung ist nicht nötig." },
        { q: "Hat IC Markets ein Demokonto?", a: "Ja. IC bietet ein kostenloses Demokonto über „Try a Free Demo“ auf ic.com nach einem kurzen Formular." },
        { q: "Wie lange sollte ich demo handeln?", a: "Es gibt keine feste Dauer. Viele bleiben im Demo, bis sie einen schriftlichen Plan und einige Dutzend regelkonforme Trades haben." },
        { q: "Kann ich 964FX-Signale im Demokonto testen?", a: "Ja, ein guter Start. Übernehmen Sie Einstieg, Stop und Ziel exakt und notieren Sie die Ergebnisse." },
      ],
    },
    leverage: {
      label: "Hebel",
      title: "Hebel im Forex erklärt: Beispiele, Margin, ESMA-Grenzen | 964FX",
      description: "Forex-Hebel einfach erklärt: Hebel und Margin mit Rechenbeispielen, Margin Call und Stop-out, ESMA- und BaFin-Grenzen für Privatkunden und sicherer Umgang.",
      h1: "Der Hebel im Forex, einfach erklärt",
      lede: "Der Hebel erlaubt eine Position, die größer ist als Ihre Einzahlung. Er ändert nicht den Wert eines Pips, nur die Margin, die der Broker blockiert. Genau deshalb wird er so leicht missbraucht.",
      sections: [
        {
          h: "Hebel und Margin in Zahlen",
          p: [
            "Ein Standardlot EUR/USD bei 1,1000 entspricht 110.000 Dollar. Bei Hebel 1:30 blockiert der Broker rund 3.667 Dollar Margin, bei 1:100 rund 1.100, bei 1:500 rund 220.",
            "In allen drei Fällen sind 50 Pips etwa 500 Dollar wert. Ein höherer Hebel erlaubt nur, dasselbe Risiko mit weniger Kapital zu eröffnen – und damit leichter zu viel.",
          ],
        },
        {
          h: "Margin Call und Stop-out",
          p: [
            "Bringen Verluste das Eigenkapital nahe an die genutzte Margin, warnt die Plattform (Margin Call) und schließt dann automatisch Positionen (Stop-out). Die genauen Stufen stehen in den Bedingungen des Brokers.",
          ],
        },
        {
          h: "Grenzen für Privatkunden",
          p: [
            "In der EU – in Deutschland umgesetzt durch die BaFin – ist der Hebel für Privatkunden auf 30:1 bei Major-Paaren und 20:1 bei Gold und Nicht-Major-Paaren begrenzt; zudem gilt ein Schutz vor negativem Kontostand. Andere Rechtsordnungen erlauben mehr. Je höher der Hebel, desto kleiner die Bewegung, die das Konto leeren kann.",
          ],
        },
        {
          h: "Hebel sicher nutzen",
          p: [],
          list: [
            "Erst das Risiko pro Trade festlegen (z. B. 1 %), dann die Größe aus dem Stop-Abstand berechnen.",
            "Nicht die gesamte verfügbare Margin nutzen; Puffer für Spreads und Nachrichtenspitzen lassen.",
            "Rund um wichtige Kalendertermine besonders vorsichtig sein.",
            "IC gibt an, dass der Hebel dynamisch ist und sich ändern kann, was die Margin offener Positionen beeinflussen kann.",
          ],
        },
      ],
      faq: [
        { q: "Was bedeutet Hebel 1:100?", a: "Der Broker blockiert 1 % des Positionswerts als Margin. Eine Position über 100.000 Dollar benötigt rund 1.000 Dollar Margin." },
        { q: "Welcher Hebel ist für Anfänger richtig?", a: "Es gibt keine ideale Zahl, aber niedriger ist sicherer. Entscheidend ist das Risiko pro Trade aus Stop-Abstand und Lotgröße, nicht die Hebel-Einstellung." },
        { q: "Kann ich mehr als meine Einzahlung verlieren?", a: "Bei Kurslücken teils ja. Privatkunden in der EU haben einen Schutz vor negativem Kontostand; anderswo hängt es vom Broker ab." },
        { q: "Ändert der Hebel den Pip-Wert?", a: "Nein. Der Pip-Wert hängt von der Lotgröße ab; der Hebel ändert nur die benötigte Margin." },
      ],
    },
  },
};
