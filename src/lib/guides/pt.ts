import type { GuidePack } from "./types";

export const pt: GuidePack = {
  nav: "Guias",
  brokerCta: false,
  index: {
    title: "Guias de forex: ouro, conta islâmica, demo, alavancagem | 964FX",
    description: "Guias de forex em português: o que é forex, se forex é legal no Brasil, ouro XAUUSD, conta islâmica, conta demo e alavancagem, sem promessas.",
    h1: "Guias de forex para iniciantes",
    lede: "Guias curtos e práticos que acompanham nossos sinais diários e o calendário econômico. Sem promessas de lucro: só como as coisas funcionam e o que conferir antes de arriscar dinheiro.",
  },
  ui: {
    faq: "Perguntas frequentes",
    next: "Continue lendo",
    signals: "Sinais forex de hoje",
    calendar: "Calendário econômico",
    telegram: "Canal no Telegram @Code964fx",
    method: "Como nossos sinais são feitos",
    liveChart: "Gráfico XAUUSD ao vivo",
    liveChartNote: "Gráfico da TradingView (cotação OANDA). O preço da sua corretora pode ser um pouco diferente.",
    disclosureTitle: "Aviso de Introducing Broker",
    disclosure: "O 964FX é mantido por Saif Altamimi, Introducing Broker (IB) da IC Markets. O site ic.com é operado pela Raw Trading Ltd, que a IC informa ser regulada pela Financial Services Authority das Seychelles (licença SD018). Se alguém abrir conta por um link deste site, Saif pode receber comissão da corretora. A IC não aceita clientes de alguns países, entre eles Estados Unidos, Canadá e Irã. No Brasil, a CVM informa que não há instituição autorizada a ofertar Forex ou CFD; por isso este conteúdo é apenas educacional e não é uma oferta dirigida a residentes no Brasil.",
    riskTitle: "Aviso de risco",
    risk: "Forex, ouro e CFDs são produtos alavancados e você pode perder dinheiro rapidamente. Opere apenas com dinheiro que pode perder. Esta página é educação, não é recomendação financeira, tributária, jurídica ou religiosa, e resultados passados não garantem resultados futuros.",
    updated: "Revisado em",
    read: "Ler o guia",
    otherGuides: "Outros guias",
  },
  guides: {
    "xauusd-gold": {
      label: "Ouro XAUUSD",
      title: "XAUUSD gráfico ao vivo e análise: o que move o ouro | 964FX",
      description: "Gráfico XAUUSD ao vivo e guia prático: o que é XAUUSD, como dólar, juros, CPI e payroll movem o ouro, melhor horário e tamanho do lote. Educacional.",
      h1: "XAUUSD (ouro): gráfico ao vivo e guia de análise",
      lede: "XAUUSD é o preço de uma onça troy de ouro em dólares americanos. O ouro se move mais rápido que a maioria dos pares de moedas, então premia quem se prepara e pune posições grandes demais.",
      sections: [
        {
          h: "Vocês publicam sinais de ouro?",
          p: [
            "Ainda não. Nossos sinais automáticos cobrem por enquanto só os principais pares de moedas, e cada um espera o setup ficar completo. Se o ouro entrar, ele aparece primeiro na página de sinais e no nosso canal do Telegram. Até lá, esta página traz o gráfico ao vivo e o checklist que usamos para ler o ouro.",
          ],
        },
        {
          h: "O que costuma mover o ouro",
          p: ["O ouro não paga juros e é cotado em dólar, então poucos fatores fazem a maior parte do trabalho:"],
          list: [
            "O dólar americano: dólar forte costuma pesar sobre o XAUUSD e dólar fraco costuma ajudar. A relação não é fixa.",
            "Juros americanos e juros reais: juros mais altos aumentam o custo de segurar um metal que não rende nada.",
            "Dados dos EUA: inflação (CPI), payroll (Non-Farm Payrolls) e decisões do Fed podem mover o ouro muito em poucos minutos.",
            "Apetite a risco: em momentos de tensão, parte dos investidores compra ouro como proteção.",
            "Demanda de bancos centrais e ETFs: fluxos mais lentos que formam a tendência maior.",
          ],
        },
        {
          h: "Rotina simples antes de operar XAUUSD",
          p: [],
          list: [
            "Abra o calendário econômico e marque todos os eventos de alto impacto do dólar no dia (no horário de Brasília, eles costumam sair de manhã).",
            "Leia primeiro a tendência no gráfico de 4 horas e no diário; depois procure a entrada num tempo menor.",
            "Coloque o stop além de um nível real (topo ou fundo), não num número redondo.",
            "Calcule o lote pela distância do stop, não pela confiança que você sente.",
            "Evite abrir operação minutos antes do CPI, do payroll ou do Fed, a não ser que isso esteja no seu plano.",
          ],
        },
        {
          h: "Lote, pips e spread no ouro",
          p: [
            "Em muitas corretoras, um lote padrão de XAUUSD equivale a 100 onças, então cada 1 dólar de variação no preço vale cerca de 100 dólares por lote. Tamanho do contrato, lote mínimo e definição de pip mudam entre corretoras, então confira a especificação do contrato antes da primeira operação. O spread costuma abrir na virada do dia e em notícias fortes.",
          ],
        },
      ],
      faq: [
        { q: "O que é XAUUSD?", a: "XAU é o código de uma onça troy de ouro e USD é o dólar americano. XAUUSD a 2.000 significa que uma onça custa 2.000 dólares." },
        { q: "Ouro é forex?", a: "O XAUUSD é negociado nas mesmas plataformas e com a mesma lógica de par que as moedas, por isso muita gente chama de forex. Tecnicamente é uma commodity cotada em dólar, e costuma ser mais volátil que os pares principais." },
        { q: "Qual o melhor horário para operar ouro?", a: "O ouro costuma ter mais movimento nas sessões de Londres e Nova York e perto dos dados americanos. Movimento não garante direção, então confira o calendário econômico antes." },
        { q: "O 964FX dá sinais de XAUUSD?", a: "No momento, não. Nossos sinais cobrem os principais pares de moedas. Qualquer mudança será anunciada na página de sinais e no canal do Telegram." },
      ],
    },
    "islamic-swap-free-account": {
      label: "Conta islâmica",
      title: "Conta islâmica no forex: o que é a conta sem swap | 964FX",
      description: "O que é conta islâmica (swap free) no forex, o que ela muda e o que não muda, as dúvidas dos estudiosos sobre forex halal e como funciona a opção da IC Markets.",
      h1: "Conta islâmica (sem swap) no forex: guia simples",
      lede: "Muitos traders muçulmanos fazem duas perguntas: operar forex é permitido, e uma conta sem swap resolve a questão dos juros? Este guia explica os pontos com clareza. Não é uma fatwa.",
      sections: [
        {
          h: "O que a conta sem swap muda",
          p: [
            "Numa conta normal, posições que passam da virada do dia pagam ou recebem swap, que é um ajuste de juros. A conta sem swap (conta islâmica) retira esse ajuste de juros.",
            "Sem swap não significa sempre custo zero para manter a posição. Algumas corretoras cobram uma taxa fixa no lugar ou ajustam custos em outro ponto, então leia as condições da conta.",
          ],
        },
        {
          h: "As questões que os estudiosos discutem",
          p: ["Estudiosos e conselhos de Sharia divergem sobre o forex de varejo. Os pontos mais discutidos são:"],
          list: [
            "Riba (juros): resolvido com a retirada do swap, segundo quem permite operar em conta sem swap.",
            "Troca imediata (mão a mão): a troca de moedas deve ser liquidada na hora, então a liquidação adiada é uma preocupação.",
            "Alavancagem: se a margem da corretora conta como empréstimo que traz benefício a quem empresta.",
            "Gharar e maysir: incerteza excessiva e especulação parecida com aposta, principalmente com alavancagem muito alta e operações muito curtas.",
          ],
        },
        {
          h: "Como funciona a opção sem swap da IC Markets",
          p: [
            "A IC informa que oferece contas sem swap para clientes que não podem receber nem pagar juros por motivo religioso. Segundo o ic.com, a opção existe nas contas Raw Spread e Standard, no MetaTrader 4, MetaTrader 5 e cTrader. Contas sem swap não pagam nem recebem swap, mas a IC diz que uma taxa fixa de manutenção se aplica a posições abertas de um dia para o outro, e valem os termos e condições da conta sem swap.",
          ],
        },
        {
          h: "Um jeito cuidadoso de decidir",
          p: [],
          list: [
            "Consulte um estudioso qualificado de sua confiança e mostre a ele as condições reais da conta.",
            "Prefira alavancagem baixa ou nenhuma e evite operações curtas com cara de aposta.",
            "Leia as condições sem swap da corretora, incluindo qualquer taxa de manutenção.",
            "Pratique antes numa conta demo para entender os custos.",
          ],
        },
      ],
      faq: [
        { q: "Forex é halal?", a: "Não existe uma resposta única. Alguns estudiosos permitem operar câmbio à vista em conta sem swap com condições, e outros consideram o forex alavancado de varejo não permitido. Consulte um estudioso qualificado sobre o seu caso." },
        { q: "O que é conta islâmica no forex?", a: "É uma conta sem swap: posições mantidas de um dia para o outro não pagam nem recebem juros. Algumas corretoras cobram uma taxa fixa de manutenção no lugar." },
        { q: "A IC Markets tem conta islâmica?", a: "Sim. A IC informa que a opção sem swap existe nas contas Raw Spread e Standard no MT4, MT5 e cTrader, com taxa fixa de manutenção para posições que passam a noite." },
        { q: "A conta sem swap torna toda operação halal?", a: "Não. Ela trata dos juros, mas os estudiosos também olham a liquidação, a alavancagem e a especulação. O tipo de conta sozinho não responde a essas questões." },
      ],
    },
    "forex-for-beginners": {
      label: "Forex para iniciantes",
      title: "O que é forex? Guia para iniciantes e se é legal no Brasil | 964FX",
      description: "Forex para iniciantes: o que é forex, pares, pips, lotes, stop loss e take profit, como ler um sinal, se forex é legal no Brasil e como evitar golpes.",
      h1: "O que é forex: guia para iniciantes",
      lede: "Forex é o mercado onde moedas são trocadas umas pelas outras. Antes de seguir sinais de qualquer pessoa, inclusive os nossos, você precisa entender os poucos números em que toda operação se apoia, e as regras do país onde você mora.",
      sections: [
        {
          h: "O básico em cinco palavras",
          p: [],
          list: [
            "Par: EUR/USD é o euro cotado em dólar. Comprar o par significa esperar que o euro suba frente ao dólar.",
            "Pip: o passo padrão do preço. No EUR/USD um pip é 0,0001; nos pares com iene é 0,01.",
            "Lote: o tamanho da operação. Um lote padrão são 100.000 unidades da primeira moeda, um minilote 10.000 e um microlote 1.000.",
            "Spread: a diferença entre o preço de compra e o de venda. É um custo pago em toda operação.",
            "Alavancagem: exposição emprestada que aumenta tanto os ganhos quanto as perdas.",
          ],
        },
        {
          h: "Forex é legal no Brasil?",
          p: [
            "Segundo a CVM, derivativos como o CFD de forex são valores mobiliários, e até agora não há instituição autorizada pela CVM a ofertar Forex ou CFD no Brasil. A CVM afirma que instituições estrangeiras não podem captar investidores brasileiros sem autorização, e que usar sites na internet para isso, em regra, caracteriza oferta pública irregular. Ela também diz que residentes podem investir no exterior por livre procura, seguindo as regras da Receita Federal e do Banco Central.",
            "Na prática: não existe corretora de forex autorizada pela CVM, e quem promete o contrário merece desconfiança. Confira a situação no Portal do Investidor da CVM antes de enviar qualquer dinheiro.",
          ],
        },
        {
          h: "Forex é golpe?",
          p: ["O mercado de câmbio é real, mas muitos golpes usam o nome forex. Sinais de alerta comuns:"],
          list: [
            "Promessa de lucro fixo, garantido ou \"renda passiva\" com robô.",
            "Alguém que pede para você depositar dinheiro na conta dele ou numa \"gestora\" para operar por você.",
            "Pressão para trazer amigos e família, ou bônus em troca de indicações.",
            "Empresa que aparece nos alertas (stop orders) da CVM.",
            "Dificuldade ou taxas surpresa na hora de sacar.",
          ],
        },
        {
          h: "Como ler um sinal do 964FX",
          p: ["Todo sinal na nossa página de sinais e no canal do Telegram tem as mesmas partes:"],
          list: [
            "Par e direção: por exemplo EURUSD SELL (venda).",
            "Entrada: o preço onde a ideia começa.",
            "Stop loss (SL): onde a ideia está errada e a operação fecha com perda.",
            "Take profit (TP): o alvo. Cada sinal mostra a relação risco-retorno.",
            "Seis motivos: tendência, momento, níveis e calendário de notícias, para você julgar a ideia.",
            "Status: o sinal fica aberto até o preço tocar o TP ou o SL, e não abrimos outro no mesmo par antes disso.",
          ],
        },
        {
          h: "Regras de risco que protegem o iniciante",
          p: [
            "Uma regra comum é arriscar uma parte pequena e fixa da conta por operação, como 1%. Numa conta de 1.000 dólares isso é 10 dólares. Se o stop está a 20 pips, o lote precisa ser pequeno o bastante para que 20 pips valham 10 dólares, o que no EUR/USD dá cerca de 0,05 lote.",
          ],
          list: [
            "Use sempre o stop loss e nunca o afaste.",
            "Confira o calendário econômico antes de entrar.",
            "Comece numa conta demo.",
            "Anote cada operação e o motivo dela num diário.",
          ],
        },
      ],
      faq: [
        { q: "Forex é legal no Brasil?", a: "A CVM informa que não há instituição autorizada a ofertar Forex ou CFD no Brasil e que a captação de brasileiros por corretoras estrangeiras sem autorização é irregular. Residentes podem investir no exterior por livre procura, seguindo as regras da Receita e do Banco Central. Confira o Portal do Investidor da CVM." },
        { q: "Forex é golpe?", a: "O mercado de câmbio existe, mas muitos golpes usam o nome forex. Desconfie de lucro garantido, de quem quer operar o seu dinheiro e de empresas nos alertas da CVM." },
        { q: "O que é um pip?", a: "Um pip é o passo padrão do preço: 0,0001 na maioria dos pares e 0,01 nos pares com iene. Num lote padrão de EUR/USD, um pip vale cerca de 10 dólares." },
        { q: "Sinais de forex são garantidos?", a: "Não. Nenhum fornecedor de sinais pode garantir resultado. Nosso arquivo mostra todos os sinais fechados, com ganhos e perdas, para você julgar." },
      ],
    },
    "demo-account": {
      label: "Conta demo",
      title: "Conta demo forex: como treinar com dinheiro virtual | 964FX",
      description: "O que é uma conta demo de forex grátis, como usar no MetaTrader, como treinar nossos sinais nela e o checklist antes de pensar em conta real.",
      h1: "Conta demo de forex: guia prático",
      lede: "A conta demo permite operar com preços reais de mercado usando dinheiro virtual. É o jeito mais barato de aprender a plataforma, testar um plano e cometer os primeiros erros sem pagar por eles.",
      sections: [
        {
          h: "Para que serve uma conta demo",
          p: [],
          list: [
            "Aprender a plataforma: abrir ordens, colocar stop loss e take profit, fechar operações.",
            "Entender lote, valor do pip e margem antes de envolver dinheiro de verdade.",
            "Acompanhar nossos sinais diários e o calendário econômico para ver como as notícias movem o preço.",
            "Testar um plano escrito por várias semanas e medir os resultados com honestidade.",
          ],
        },
        {
          h: "O que a demo não ensina",
          p: [
            "Dinheiro virtual não gera medo nem ganância, e as execuções na demo podem ser mais limpas que numa conta real durante notícias rápidas. Trate a demo como treino, não como prova de que uma estratégia vai dar lucro.",
          ],
        },
        {
          h: "Conta demo da IC Markets",
          p: [
            "A IC oferece conta demo grátis, aberta pelo botão \"Try a Free Demo\" no ic.com com um cadastro curto. Depois você entra no MetaTrader ou em outra plataforma suportada com o login demo. Use o mesmo saldo e os mesmos lotes que usaria de verdade; um saldo demo enorme ensina maus hábitos.",
          ],
        },
        {
          h: "Checklist antes de pensar em conta real",
          p: [],
          list: [
            "Pelo menos 30 a 50 operações demo registradas num diário.",
            "Você sempre usou stop loss e nunca quebrou sua regra de risco.",
            "Você sabe quais eventos do calendário evita.",
            "Você conferiu se operar com corretora estrangeira é permitido onde mora; no Brasil, leia antes os alertas da CVM.",
          ],
        },
      ],
      faq: [
        { q: "Conta demo de forex é grátis?", a: "Sim, contas demo normalmente são grátis e usam dinheiro virtual. Não é preciso depositar para abrir." },
        { q: "A IC Markets tem conta demo?", a: "Sim. A IC oferece conta demo grátis pelo botão \"Try a Free Demo\" no ic.com, depois de um cadastro curto." },
        { q: "Quanto tempo devo ficar na demo?", a: "Não há regra fixa. Muitos traders ficam na demo até ter um plano escrito e algumas dezenas de operações que seguem esse plano." },
        { q: "Posso usar os sinais do 964FX na conta demo?", a: "Sim, e é um bom começo. Siga exatamente entrada, stop e alvo e anote os resultados." },
      ],
    },
    leverage: {
      label: "Alavancagem",
      title: "Alavancagem no forex explicada com exemplos (1:30, 1:500) | 964FX",
      description: "O que são alavancagem e margem no forex, exemplos com números, margin call e stop out, limites para varejo na UE, Reino Unido e EUA e como usar com segurança.",
      h1: "Alavancagem no forex, explicada",
      lede: "A alavancagem permite abrir uma posição maior que o seu depósito. Ela não muda quanto vale um pip, só muda quanta margem a corretora segura. Por isso é tão fácil usar mal.",
      sections: [
        {
          h: "Alavancagem e margem com números",
          p: [
            "Um lote padrão de EUR/USD a 1,1000 vale 110.000 dólares. Com alavancagem 1:30 a corretora segura cerca de 3.667 dólares de margem; com 1:100 cerca de 1.100 dólares; com 1:500 cerca de 220 dólares.",
            "Nos três casos, um movimento de 50 pips vale cerca de 500 dólares. Alavancagem maior só permite abrir o mesmo risco com menos dinheiro, o que facilita abrir demais.",
          ],
        },
        {
          h: "Margin call e stop out",
          p: [
            "Se as perdas aproximam o seu patrimônio da margem usada, a plataforma avisa (margin call) e depois começa a fechar posições automaticamente (stop out). Os níveis exatos estão nos termos da sua corretora.",
          ],
        },
        {
          h: "Limites de alavancagem para varejo",
          p: [
            "Na União Europeia e no Reino Unido, os reguladores limitam a alavancagem do cliente de varejo a 30:1 nos pares principais e 20:1 no ouro e nos pares não principais, e exigem proteção contra saldo negativo. Nos Estados Unidos o limite é 50:1 nos pares principais e 20:1 nos outros pares. Corretoras de outras jurisdições podem oferecer mais; alavancagem maior significa que um movimento menor pode zerar a conta.",
          ],
        },
        {
          h: "Usando alavancagem com segurança",
          p: [],
          list: [
            "Defina primeiro o risco por operação (por exemplo 1% da conta) e depois calcule o lote pela distância do stop.",
            "Não use toda a margem disponível; deixe espaço para spread e picos de notícia.",
            "Tenha cuidado extra perto de eventos de alto impacto no calendário econômico.",
            "Lembre que a IC informa que sua alavancagem é dinâmica e pode mudar, o que pode afetar a margem de posições abertas.",
          ],
        },
      ],
      faq: [
        { q: "O que é alavancagem 1:100?", a: "Significa que a corretora segura 1% do valor da posição como margem. Uma posição de 100.000 dólares precisa de cerca de 1.000 dólares de margem." },
        { q: "Qual a melhor alavancagem para iniciantes?", a: "Não existe número ideal, mas menor é mais seguro. O mais importante é o risco por operação, que vem da distância do stop e do lote, não da alavancagem escolhida." },
        { q: "Posso perder mais do que depositei?", a: "Em alguns casos, sim, se o mercado abrir com gap. Clientes de varejo na UE e no Reino Unido têm proteção contra saldo negativo; em outros lugares depende dos termos da corretora." },
        { q: "A alavancagem muda o valor do pip?", a: "Não. O valor do pip depende do tamanho do lote. A alavancagem só muda a margem necessária para abrir a posição." },
      ],
    },
  },
};
