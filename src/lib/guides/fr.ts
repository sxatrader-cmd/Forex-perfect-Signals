import type { GuidePack } from "./types";

export const fr: GuidePack = {
  nav: "Guides",
  index: {
    title: "Guides forex : or XAUUSD, compte islamique, démo, levier | 964FX",
    description: "Guides forex clairs de 964FX : analyse de l'or XAUUSD, compte islamique sans swap, trading forex pour débutant, compte démo et effet de levier.",
    h1: "Guides forex",
    lede: "Des guides courts et concrets, à côté de nos signaux quotidiens et du calendrier économique. Pas de promesse de gains : le fonctionnement réel et ce qu'il faut vérifier avant de risquer de l'argent.",
  },
  ui: {
    faq: "Questions fréquentes",
    next: "Pour aller plus loin",
    signals: "Signaux forex du jour",
    calendar: "Calendrier économique",
    telegram: "Canal Telegram @Code964fx",
    method: "Comment nos signaux sont construits",
    liveChart: "Graphique XAUUSD en direct",
    liveChartNote: "Graphique TradingView (flux OANDA). Les prix de votre courtier peuvent légèrement différer.",
    disclosureTitle: "Transparence : apporteur d'affaires",
    disclosure: "964FX est géré par Saif Altamimi, Introducing Broker (IB, apporteur d'affaires) d'IC Markets. Le site ic.com est exploité par Raw Trading Ltd, qui selon IC est régulée par la Financial Services Authority des Seychelles (licence SD018). Si vous ouvrez un compte via un lien de ce site, Saif peut recevoir une commission du courtier. IC n'accepte pas les clients de certains pays, dont les États-Unis, le Canada et l'Iran : vérifiez que le service est autorisé là où vous vivez. En France, la liste des prestataires autorisés est publiée par l'AMF.",
    riskTitle: "Avertissement sur les risques",
    risk: "Le forex, l'or et les CFD sont des produits à effet de levier : vous pouvez perdre de l'argent rapidement. N'investissez que ce que vous pouvez vous permettre de perdre. Cette page est pédagogique et ne constitue pas un conseil financier, fiscal, juridique ou religieux. Les performances passées ne préjugent pas des performances futures.",
    updated: "Dernière relecture",
    read: "Lire le guide",
    otherGuides: "Autres guides",
  },
  guides: {
    "xauusd-gold": {
      label: "Or XAUUSD",
      title: "Or XAUUSD : graphique en direct et analyse du cours de l'or | 964FX",
      description: "Graphique XAUUSD en direct et guide pratique pour analyser l'or : dollar, taux de la Fed, inflation et NFP, taille de lot et effet de levier. Pas un conseil.",
      h1: "Or (XAUUSD) : graphique en direct et guide d'analyse",
      lede: "XAUUSD est le prix d'une once troy d'or en dollars américains. L'or bouge plus vite que la plupart des paires de devises : la préparation compte, la taille de position encore plus.",
      sections: [
        {
          h: "Publions-nous des signaux sur l'or ?",
          p: [
            "Pas pour l'instant. Nos signaux automatiques couvrent uniquement les paires de devises majeures, et chacun attend que la configuration soit complète. Si l'or est ajouté, ce sera annoncé d'abord sur la page des signaux et sur notre canal Telegram. En attendant, voici le graphique en direct et la grille de lecture que nous utilisons.",
          ],
        },
        {
          h: "Ce qui fait bouger l'or",
          p: ["L'or ne verse pas d'intérêt et se négocie en dollars ; quelques facteurs font l'essentiel du travail :"],
          list: [
            "Le dollar américain : un dollar fort pèse souvent sur XAUUSD, un dollar faible le soutient souvent. Le lien n'est pas fixe.",
            "Les taux américains et les taux réels : des taux attendus plus élevés rendent plus coûteux le fait de détenir un métal sans rendement.",
            "Les statistiques américaines : l'inflation (CPI), l'emploi (NFP) et les décisions de la Fed peuvent faire bouger l'or fortement en quelques minutes.",
            "Le climat de risque : en période de tension, certains investisseurs achètent l'or comme valeur refuge.",
            "La demande des banques centrales et des ETF : des flux plus lents qui dessinent la tendance de fond.",
          ],
        },
        {
          h: "Une routine simple avant de trader l'or",
          p: [],
          list: [
            "Ouvrez le calendrier économique et repérez les annonces USD à fort impact du jour.",
            "Lisez d'abord la tendance en H4 et en journalier, puis cherchez une entrée sur une unité de temps plus courte.",
            "Placez le stop au-delà d'un vrai niveau (plus haut ou plus bas), pas sur un chiffre rond.",
            "Calculez la taille de position à partir de la distance du stop, pas de votre conviction.",
            "Évitez d'ouvrir une position juste avant le CPI, le NFP ou la Fed, sauf si c'est votre plan.",
          ],
        },
        {
          h: "Lot, pips, spread et levier sur l'or",
          p: [
            "Chez de nombreux courtiers, un lot standard de XAUUSD vaut 100 onces : un mouvement de 1 dollar représente environ 100 dollars par lot. Taille de contrat, lot minimum et définition du pip varient selon le courtier : lisez les spécifications. Pour les clients particuliers dans l'Union européenne, le levier sur l'or est plafonné à 20:1. Le spread s'élargit souvent au rollover et pendant les annonces.",
          ],
        },
      ],
      faq: [
        { q: "Que signifie XAUUSD ?", a: "XAU désigne une once troy d'or et USD le dollar américain. XAUUSD à 2 000 signifie qu'une once vaut 2 000 dollars." },
        { q: "Quand trader l'or ?", a: "L'or est généralement plus actif pendant les sessions de Londres et de New York et autour des statistiques américaines. L'activité ne garantit pas la direction : consultez d'abord le calendrier." },
        { q: "964FX publie-t-il des signaux XAUUSD ?", a: "Pas pour le moment. Nos signaux couvrent les paires majeures. Tout changement sera annoncé sur la page des signaux et sur Telegram." },
        { q: "Pourquoi l'or est-il si volatil les jours d'annonce ?", a: "L'or réagit aux anticipations de taux américains et au dollar. Inflation, emploi et décisions de la Fed modifient vite ces anticipations : le prix saute et le spread peut s'élargir." },
      ],
    },
    "islamic-swap-free-account": {
      label: "Compte islamique",
      title: "Forex halal ou haram ? Le compte islamique sans swap expliqué | 964FX",
      description: "Le trading forex est-il halal ou haram ? Ce que change un compte islamique sans swap, les questions des savants, le cas du Maghreb et l'option swap-free d'IC Markets.",
      h1: "Forex halal ou haram ? Guide du compte islamique",
      lede: "Beaucoup de traders musulmans, en France comme au Maghreb, se posent deux questions : le trading de devises est-il permis, et un compte islamique règle-t-il la question de l'intérêt ? Ce guide explique les enjeux. Ce n'est pas une fatwa.",
      sections: [
        {
          h: "Ce que change un compte sans swap",
          p: [
            "Sur un compte classique, une position conservée après le rollover quotidien paie ou reçoit un swap, c'est-à-dire un ajustement lié aux taux d'intérêt. Le compte islamique (swap-free) supprime cet ajustement.",
            "Sans swap ne veut pas toujours dire sans frais : certains courtiers appliquent à la place des frais fixes de détention. Lisez les conditions du compte.",
          ],
        },
        {
          h: "Les questions soulevées par les savants",
          p: ["Les avis des savants et des comités de charia divergent sur le forex de détail. Les points discutés :"],
          list: [
            "Le riba (intérêt) : réglé par la suppression du swap selon ceux qui autorisent le swap-free.",
            "L'échange immédiat (de main à main) : le change doit être réglé au comptant, d'où le débat sur le règlement différé.",
            "L'effet de levier : la marge accordée par le courtier est-elle un prêt qui profite au prêteur ?",
            "Le gharar et le maysir : incertitude excessive et spéculation proche du jeu, surtout avec un fort levier et des trades très courts.",
          ],
        },
        {
          h: "L'option sans swap chez IC Markets",
          p: [
            "IC indique proposer des comptes sans swap aux clients qui ne peuvent ni percevoir ni payer d'intérêts pour des raisons religieuses. Selon ic.com, l'option est disponible sur les comptes Raw Spread et Standard sous MetaTrader 4, MetaTrader 5 et cTrader. Ces comptes ne paient ni ne reçoivent de swap, mais IC précise que des frais de détention forfaitaires s'appliquent aux positions gardées pendant la nuit, selon ses conditions swap-free.",
            "Au Maghreb, la réglementation des changes de chaque pays peut encadrer les transferts vers un courtier étranger : renseignez-vous sur la règle locale avant d'ouvrir un compte.",
          ],
        },
        {
          h: "Décider avec prudence",
          p: [],
          list: [
            "Interrogez un savant qualifié en qui vous avez confiance, conditions du compte à l'appui.",
            "Préférez un levier faible ou nul et évitez les allers-retours spéculatifs.",
            "Lisez les conditions swap-free du courtier, y compris les frais de détention.",
            "Entraînez-vous d'abord sur un compte démo.",
          ],
        },
      ],
      faq: [
        { q: "Le forex est-il halal ou haram ?", a: "Il n'y a pas de réponse unique. Certains savants autorisent le change au comptant sur un compte sans swap sous conditions, d'autres jugent le forex à levier pour particuliers non permis. Consultez un savant qualifié." },
        { q: "Qu'est-ce qu'un compte islamique en trading ?", a: "Un compte sans swap : les positions gardées la nuit ne paient ni ne reçoivent d'intérêts. Certains courtiers prélèvent à la place des frais fixes." },
        { q: "IC Markets propose-t-il un compte islamique ?", a: "Oui. IC indique que l'option sans swap est disponible sur ses comptes Raw Spread et Standard sous MT4, MT5 et cTrader, avec des frais forfaitaires pour les positions gardées la nuit." },
        { q: "Un compte sans swap rend-il chaque trade halal ?", a: "Non. Il traite la question de l'intérêt, mais les savants examinent aussi le règlement, le levier et la spéculation." },
      ],
    },
    "forex-for-beginners": {
      label: "Forex pour débutant",
      title: "Trading forex pour débutant : comment lire un signal forex | 964FX",
      description: "Formation forex pour débutant : paires, pips, lots, stop loss et take profit, lire un signal forex pas à pas et les règles qui protègent un petit compte.",
      h1: "Forex pour débutant : comment lire un signal",
      lede: "Le forex est le marché où les devises s'échangent entre elles. Avant de suivre les signaux de qui que ce soit, y compris les nôtres, il faut comprendre les quelques chiffres sur lesquels repose chaque trade.",
      sections: [
        {
          h: "Les bases en cinq mots",
          p: [],
          list: [
            "Paire : EUR/USD est le prix de l'euro en dollars. Acheter, c'est parier sur la hausse de l'euro face au dollar.",
            "Pip : le pas de prix standard, 0,0001 pour EUR/USD et 0,01 pour les paires en yen.",
            "Lot : la taille du trade. Un lot standard vaut 100 000 unités de la première devise, un mini-lot 10 000, un micro-lot 1 000.",
            "Spread : l'écart entre prix d'achat et de vente, un coût payé à chaque trade.",
            "Effet de levier : une exposition empruntée qui grossit gains et pertes.",
          ],
        },
        {
          h: "Lire un signal 964FX",
          p: ["Chaque signal, sur la page des signaux comme sur Telegram, a la même structure :"],
          list: [
            "Paire et sens : par exemple EURUSD SELL.",
            "Entrée : le prix où l'idée commence.",
            "Stop loss (SL) : le niveau où l'idée est invalidée et le trade coupé en perte.",
            "Take profit (TP) : l'objectif ; chaque signal affiche son ratio gain/risque.",
            "Six raisons : tendance, momentum, niveaux et calendrier, pour juger l'idée vous-même.",
            "Statut : le signal reste ouvert jusqu'au TP ou au SL, et aucun autre n'est publié sur la même paire avant.",
          ],
        },
        {
          h: "Des règles de risque pour débuter",
          p: [
            "Une règle répandue consiste à risquer une petite part fixe du capital par trade, par exemple 1 %. Sur 1 000 dollars, cela fait 10 dollars. Si le stop est à 20 pips, la taille doit être telle que 20 pips valent 10 dollars, soit environ 0,05 lot sur EUR/USD.",
          ],
          list: [
            "Toujours un stop loss, jamais déplacé plus loin.",
            "Vérifier le calendrier économique avant d'entrer.",
            "Commencer sur compte démo, puis petite taille.",
            "Tenir un journal de chaque trade. Vous pouvez aussi imprimer cette page en PDF comme aide-mémoire.",
          ],
        },
      ],
      faq: [
        { q: "Combien faut-il pour commencer le forex ?", a: "Certains courtiers acceptent de petits dépôts, mais le bon montant est celui que vous pouvez perdre. Commencez en démo et passez au réel en petite taille quand vous respectez vos règles." },
        { q: "Qu'est-ce qu'un pip ?", a: "Le pas de prix standard : 0,0001 pour la plupart des paires, 0,01 pour les paires en yen. Sur un lot standard EUR/USD, un pip vaut environ 10 dollars." },
        { q: "Peut-on copier des signaux sans les comprendre ?", a: "C'est possible mais risqué. Les signaux perdent parfois ; comprendre la logique et le point d'invalidation aide à dimensionner et à rester calme." },
        { q: "Les signaux forex sont-ils garantis ?", a: "Non. Aucun fournisseur ne peut garantir de résultat. Notre archive montre tous les signaux clôturés, gagnants et perdants." },
      ],
    },
    "demo-account": {
      label: "Compte démo",
      title: "Compte démo forex gratuit : s'entraîner sans risque | 964FX",
      description: "Ce qu'est un compte démo forex gratuit, comment l'ouvrir, comment s'entraîner sur nos signaux et la checklist avant de passer sur un compte réel.",
      h1: "Compte démo forex : le guide",
      lede: "Un compte démo permet de trader aux prix réels du marché avec de l'argent virtuel. C'est le moyen le moins cher d'apprendre la plateforme, tester un plan et faire ses premières erreurs gratuitement.",
      sections: [
        {
          h: "À quoi sert un compte démo",
          p: [],
          list: [
            "Apprendre la plateforme : ordres, stop loss, take profit, clôture.",
            "Comprendre lot, valeur du pip et marge avant d'engager de l'argent réel.",
            "Suivre nos signaux quotidiens et le calendrier pour voir l'effet des annonces.",
            "Tester un plan écrit pendant plusieurs semaines et mesurer honnêtement.",
          ],
        },
        {
          h: "Ce que la démo n'apprend pas",
          p: [
            "L'argent virtuel ne crée ni peur ni avidité, et l'exécution en démo peut être plus propre qu'en réel lors des annonces rapides. La démo est un entraînement, pas une preuve qu'une stratégie gagne.",
          ],
        },
        {
          h: "Ouvrir une démo chez IC Markets",
          p: [
            "IC propose un compte démo gratuit, accessible via le bouton « Try a Free Demo » sur ic.com après un court formulaire d'inscription ; vous vous connectez ensuite à MetaTrader ou à une autre plateforme prise en charge avec vos identifiants démo. Utilisez le même solde et les mêmes tailles que dans la réalité : un solde démo énorme donne de mauvaises habitudes.",
          ],
        },
        {
          h: "Checklist avant le compte réel",
          p: [],
          list: [
            "Au moins 30 à 50 trades démo notés dans un journal.",
            "Toujours un stop loss, jamais de règle de risque enfreinte.",
            "Vous savez quelles annonces du calendrier vous évitez.",
            "Vous démarrez petit et acceptez que les résultats varient.",
          ],
        },
      ],
      faq: [
        { q: "Un compte démo forex est-il gratuit ?", a: "Oui, les comptes démo sont en général gratuits et utilisent de l'argent virtuel, sans dépôt." },
        { q: "IC Markets propose-t-il un compte démo ?", a: "Oui. IC propose une démo gratuite via le bouton « Try a Free Demo » sur ic.com, après un court formulaire." },
        { q: "Combien de temps rester en démo ?", a: "Pas de durée fixe. Beaucoup restent en démo jusqu'à avoir un plan écrit et quelques dizaines de trades qui le respectent." },
        { q: "Puis-je tester les signaux 964FX en démo ?", a: "Oui, c'est un bon début. Reprenez exactement l'entrée, le stop et l'objectif et notez les résultats." },
      ],
    },
    leverage: {
      label: "Effet de levier",
      title: "Effet de levier forex expliqué avec exemples (1:30, 1:500) | 964FX",
      description: "Effet de levier et marge en forex : exemples chiffrés, appel de marge et stop out, plafonds ESMA/AMF pour les particuliers et bonnes pratiques.",
      h1: "L'effet de levier en forex, expliqué",
      lede: "Le levier permet d'ouvrir une position plus grande que votre dépôt. Il ne change pas la valeur du pip, seulement la marge bloquée par le courtier. C'est pourquoi il est si facile d'en abuser.",
      sections: [
        {
          h: "Levier et marge en chiffres",
          p: [
            "Un lot standard EUR/USD à 1,1000 représente 110 000 dollars. Avec un levier de 1:30, le courtier bloque environ 3 667 dollars de marge ; à 1:100, environ 1 100 ; à 1:500, environ 220.",
            "Dans les trois cas, un mouvement de 50 pips vaut environ 500 dollars. Un levier plus élevé permet seulement d'ouvrir le même risque avec moins d'argent, et donc d'en ouvrir trop.",
          ],
        },
        {
          h: "Appel de marge et stop out",
          p: [
            "Si les pertes rapprochent vos fonds propres de la marge utilisée, la plateforme vous alerte (appel de marge) puis clôture automatiquement des positions (stop out). Les niveaux exacts figurent dans les conditions du courtier.",
          ],
        },
        {
          h: "Les plafonds pour les particuliers en Europe",
          p: [
            "Dans l'Union européenne, les mesures de l'ESMA, appliquées en France par l'AMF, plafonnent le levier des clients particuliers à 30:1 sur les paires majeures, 20:1 sur l'or et les paires non majeures, et imposent la protection contre le solde négatif. D'autres juridictions autorisent davantage ; plus le levier est élevé, plus un petit mouvement peut vider le compte.",
          ],
        },
        {
          h: "Utiliser le levier prudemment",
          p: [],
          list: [
            "Fixez d'abord le risque par trade (par exemple 1 %), puis la taille selon la distance du stop.",
            "N'utilisez pas toute la marge disponible : gardez de la place pour le spread et les pics d'annonce.",
            "Redoublez de prudence autour des annonces à fort impact du calendrier.",
            "IC indique que son levier est dynamique et peut changer, ce qui peut affecter la marge des positions ouvertes.",
          ],
        },
      ],
      faq: [
        { q: "Que veut dire un levier de 1:100 ?", a: "Le courtier bloque 1 % de la valeur de la position en marge. Une position de 100 000 dollars demande environ 1 000 dollars de marge." },
        { q: "Quel levier pour un débutant ?", a: "Il n'y a pas de chiffre idéal, mais plus bas est plus sûr. L'essentiel est le risque par trade, défini par le stop et la taille, pas par le réglage du levier." },
        { q: "Peut-on perdre plus que son dépôt ?", a: "Parfois, en cas de gap. Les particuliers dans l'UE bénéficient de la protection contre le solde négatif ; ailleurs, cela dépend du courtier." },
        { q: "Le levier change-t-il la valeur du pip ?", a: "Non. La valeur du pip dépend de la taille du lot ; le levier ne change que la marge nécessaire." },
      ],
    },
  },
};
