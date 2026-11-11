import type { GuidePack } from "./types";

export const es: GuidePack = {
  nav: "Guías",
  index: {
    title: "Guías forex: oro XAUUSD, cuenta islámica, demo y apalancamiento | 964FX",
    description: "Guías forex claras de 964FX: análisis del oro XAUUSD, cuenta islámica sin swap, forex para principiantes, señales en Telegram, cuenta demo y apalancamiento.",
    h1: "Guías de forex",
    lede: "Guías cortas y prácticas junto a nuestras señales diarias y el calendario económico. Sin promesas de ganancias: cómo funcionan las cosas y qué revisar antes de arriesgar dinero.",
  },
  ui: {
    faq: "Preguntas frecuentes",
    next: "Sigue leyendo",
    signals: "Señales forex de hoy",
    calendar: "Calendario económico",
    telegram: "Canal de Telegram @Code964fx",
    method: "Cómo se construyen nuestras señales",
    liveChart: "Gráfico XAUUSD en vivo",
    liveChartNote: "Gráfico de TradingView (datos de OANDA). Los precios de tu broker pueden variar un poco.",
    disclosureTitle: "Aviso de Introducing Broker",
    disclosure: "964FX lo gestiona Saif Altamimi, Introducing Broker (IB) de IC Markets. El sitio ic.com lo opera Raw Trading Ltd, que según IC está regulada por la Financial Services Authority de Seychelles (licencia SD018). Si abres una cuenta desde un enlace de este sitio, Saif puede recibir una comisión del broker. IC no acepta clientes de algunos países, entre ellos Estados Unidos, Canadá e Irán: comprueba que el servicio esté permitido donde vives. En España puedes consultar las entidades autorizadas en la CNMV; en Latinoamérica, en el regulador de tu país.",
    riskTitle: "Advertencia de riesgo",
    risk: "El forex, el oro y los CFD son productos apalancados y puedes perder dinero rápidamente. Opera solo con dinero que puedas permitirte perder. Esta página es educativa y no es asesoramiento financiero, fiscal, legal ni religioso. Los resultados pasados no garantizan resultados futuros.",
    updated: "Última revisión",
    read: "Leer la guía",
    otherGuides: "Otras guías",
  },
  guides: {
    "xauusd-gold": {
      label: "Oro XAUUSD",
      title: "Oro XAUUSD: gráfico en vivo y análisis del precio del oro | 964FX",
      description: "Gráfico XAUUSD en vivo y guía práctica para analizar el oro: dólar, tipos de la Fed, inflación y NFP, tamaño de lote y apalancamiento. No es asesoramiento.",
      h1: "Oro (XAUUSD): gráfico en vivo y guía de análisis",
      lede: "XAUUSD es el precio de una onza troy de oro en dólares estadounidenses. El oro se mueve más rápido que la mayoría de pares de divisas: la preparación y el tamaño de la posición lo son todo.",
      sections: [
        {
          h: "¿Publicamos señales de oro?",
          p: [
            "Todavía no. Nuestras señales automáticas cubren solo los pares de divisas principales, y cada una espera a que el setup esté completo. Si añadimos el oro, lo anunciaremos primero en la página de señales y en el canal de Telegram. Mientras tanto, aquí tienes el gráfico en vivo y la lista que usamos para leer el oro.",
          ],
        },
        {
          h: "Qué mueve normalmente al oro",
          p: ["El oro no paga intereses y cotiza en dólares, así que unos pocos factores hacen casi todo el trabajo:"],
          list: [
            "El dólar estadounidense: un dólar fuerte suele presionar a XAUUSD y uno débil suele apoyarlo. La relación no es fija.",
            "Los tipos de EE. UU. y los rendimientos reales: tipos esperados más altos encarecen mantener un metal que no rinde.",
            "Los datos de EE. UU.: inflación (CPI), nóminas no agrícolas (NFP) y decisiones de la Fed pueden mover el oro con fuerza en minutos.",
            "El apetito por el riesgo: en momentos de tensión, algunos inversores compran oro como refugio.",
            "La demanda de bancos centrales y ETF: flujos más lentos que dibujan la tendencia de fondo.",
          ],
        },
        {
          h: "Una rutina simple antes de operar oro",
          p: [],
          list: [
            "Abre el calendario económico y marca los eventos del USD de alto impacto del día.",
            "Lee primero la tendencia en 4 horas y diario, luego busca la entrada en un marco menor.",
            "Coloca el stop detrás de un nivel real (máximo o mínimo), no en un número redondo.",
            "Calcula el tamaño a partir de la distancia del stop, no de tu confianza.",
            "Evita abrir una operación minutos antes del CPI, el NFP o la Fed, salvo que sea tu plan.",
          ],
        },
        {
          h: "Lote, pips, spread y apalancamiento en el oro",
          p: [
            "En muchos brokers un lote estándar de XAUUSD son 100 onzas: un movimiento de 1 dólar equivale a unos 100 dólares por lote. El tamaño del contrato, el lote mínimo y la definición de pip cambian según el broker, así que revisa las especificaciones. Para clientes minoristas en la Unión Europea el apalancamiento en oro está limitado a 20:1. El spread suele ampliarse en el rollover y durante noticias importantes.",
          ],
        },
      ],
      faq: [
        { q: "¿Qué significa XAUUSD?", a: "XAU es una onza troy de oro y USD el dólar estadounidense. XAUUSD en 2.000 significa que una onza cuesta 2.000 dólares." },
        { q: "¿Cuál es el mejor horario para operar oro?", a: "Suele haber más actividad en las sesiones de Londres y Nueva York y alrededor de los datos de EE. UU. La actividad no garantiza la dirección: revisa antes el calendario." },
        { q: "¿964FX da señales de XAUUSD?", a: "Por ahora no. Nuestras señales cubren los pares principales. Cualquier cambio se anunciará en la página de señales y en Telegram." },
        { q: "¿Por qué el oro se mueve tanto en días de noticias?", a: "El oro reacciona a las expectativas de tipos en EE. UU. y al dólar. La inflación, el empleo y la Fed cambian esas expectativas rápido: el precio salta y el spread puede ampliarse." },
      ],
    },
    "islamic-swap-free-account": {
      label: "Cuenta islámica",
      title: "Cuenta islámica forex: qué es y si el forex es halal | 964FX",
      description: "Qué es una cuenta islámica sin swap, qué cambia y qué no, qué preguntas plantean los eruditos y cómo funciona la opción swap-free de IC Markets.",
      h1: "Cuenta islámica en forex: qué es y si operar es halal",
      lede: "Muchos traders musulmanes se preguntan dos cosas: ¿es permisible operar divisas? ¿Resuelve una cuenta islámica el problema de los intereses? Esta guía explica los puntos con claridad. No es una fatwa.",
      sections: [
        {
          h: "Qué cambia una cuenta sin swap",
          p: [
            "En una cuenta normal, una posición mantenida después del rollover diario paga o cobra un swap, un ajuste ligado a los tipos de interés. La cuenta islámica (swap-free) elimina ese ajuste.",
            "Sin swap no siempre significa sin coste: algunos brokers cobran a cambio una comisión fija por mantener la posición. Lee las condiciones de la cuenta.",
          ],
        },
        {
          h: "Las preguntas que plantean los eruditos",
          p: ["Los eruditos y los comités de sharía no coinciden sobre el forex minorista. Los puntos que se discuten:"],
          list: [
            "Riba (interés): según quienes lo permiten, se resuelve eliminando el swap.",
            "Intercambio inmediato (de mano a mano): el cambio de divisas debe liquidarse al contado, por eso se debate la liquidación diferida.",
            "Apalancamiento: si el margen que da el broker es un préstamo que beneficia al prestamista.",
            "Gharar y maysir: incertidumbre excesiva y especulación parecida al juego, sobre todo con mucho apalancamiento y operaciones muy cortas.",
          ],
        },
        {
          h: "La opción sin swap de IC Markets",
          p: [
            "IC indica que ofrece cuentas sin swap a clientes que por sus creencias religiosas no pueden cobrar ni pagar intereses. Según ic.com, la opción está disponible en las cuentas Raw Spread y Standard en MetaTrader 4, MetaTrader 5 y cTrader. Estas cuentas no pagan ni cobran swap, pero IC señala que se aplica una comisión fija por mantener posiciones abiertas durante la noche, según sus condiciones swap-free.",
          ],
        },
        {
          h: "Cómo decidir con prudencia",
          p: [],
          list: [
            "Consulta a un erudito cualificado de tu confianza y muéstrale las condiciones reales de la cuenta.",
            "Prefiere poco o ningún apalancamiento y evita operaciones cortas tipo apuesta.",
            "Lee las condiciones swap-free del broker, incluida la comisión por mantener posiciones.",
            "Practica primero en una cuenta demo.",
          ],
        },
      ],
      faq: [
        { q: "¿El forex es halal o haram?", a: "No hay una única respuesta. Algunos eruditos permiten el cambio al contado en cuentas sin swap con condiciones; otros consideran no permisible el forex apalancado minorista. Consulta a un erudito cualificado." },
        { q: "¿Qué es una cuenta islámica?", a: "Una cuenta sin swap: las posiciones que pasan la noche no pagan ni cobran intereses. Algunos brokers cobran a cambio una comisión fija." },
        { q: "¿IC Markets tiene cuenta islámica?", a: "Sí. Según IC, la opción sin swap está disponible en sus cuentas Raw Spread y Standard en MT4, MT5 y cTrader, con una comisión fija por posiciones mantenidas durante la noche." },
        { q: "¿Una cuenta sin swap hace halal cualquier operación?", a: "No. Resuelve la cuestión del interés, pero los eruditos también analizan la liquidación, el apalancamiento y la especulación." },
      ],
    },
    "forex-for-beginners": {
      label: "Forex para principiantes",
      title: "Forex para principiantes: cómo leer una señal forex | 964FX",
      description: "Forex para principiantes desde cero: pares, pips, lotes, stop loss y take profit, cómo leer una señal forex, cómo evaluar canales de señales en Telegram y si el forex es legal.",
      h1: "Forex para principiantes: cómo leer una señal",
      lede: "El forex es el mercado donde las divisas se intercambian entre sí. Antes de seguir las señales de cualquiera, incluidas las nuestras, necesitas entender los pocos números sobre los que se construye cada operación.",
      sections: [
        {
          h: "Lo básico en cinco palabras",
          p: [],
          list: [
            "Par: EUR/USD es el precio del euro en dólares. Comprar significa que esperas que el euro suba frente al dólar.",
            "Pip: el paso de precio estándar, 0,0001 en EUR/USD y 0,01 en los pares con yen.",
            "Lote: el tamaño de la operación. Un lote estándar son 100.000 unidades de la primera divisa, un minilote 10.000 y un microlote 1.000.",
            "Spread: la diferencia entre precio de compra y venta, un coste en cada operación.",
            "Apalancamiento: exposición prestada que agranda ganancias y pérdidas.",
          ],
        },
        {
          h: "Cómo leer una señal de 964FX",
          p: ["Cada señal, en la página de señales y en Telegram, tiene las mismas partes:"],
          list: [
            "Par y dirección: por ejemplo EURUSD SELL.",
            "Entrada: el precio donde empieza la idea.",
            "Stop loss (SL): donde la idea es incorrecta y la operación se cierra con pérdida.",
            "Take profit (TP): el objetivo; cada señal muestra su relación beneficio/riesgo.",
            "Seis razones: tendencia, impulso, niveles y calendario, para que juzgues la idea tú mismo.",
            "Estado: la señal sigue abierta hasta tocar TP o SL, y no publicamos otra en el mismo par antes.",
          ],
        },
        {
          h: "Señales forex en Telegram: cómo evaluar un canal",
          p: ["Hay muchos canales de señales en Telegram. Antes de seguir uno, comprueba:"],
          list: [
            "Que publique stop loss y objetivo en cada señal, no solo «compra ahora».",
            "Que tenga un historial público con pérdidas incluidas, no solo capturas de ganancias.",
            "Que no prometa rentabilidades garantizadas ni pida que le envíes dinero o tus claves.",
            "Que diga claramente si cobra comisión de un broker.",
          ],
        },
        {
          h: "Reglas de riesgo para empezar",
          p: [
            "Una regla habitual es arriesgar una parte pequeña y fija de la cuenta por operación, por ejemplo el 1 %. Con 1.000 dólares son 10 dólares. Si el stop está a 20 pips, el tamaño debe ser tal que 20 pips valgan 10 dólares, unos 0,05 lotes en EUR/USD.",
          ],
          list: [
            "Usa siempre stop loss y nunca lo alejes.",
            "Revisa el calendario económico antes de entrar.",
            "Empieza en cuenta demo y luego con tamaños pequeños.",
            "Lleva un diario de cada operación.",
          ],
        },
      ],
      faq: [
        { q: "¿Cuánto dinero necesito para empezar en forex?", a: "Algunos brokers aceptan depósitos pequeños, pero la cantidad correcta es la que puedes permitirte perder. Empieza en demo y pasa a real con tamaños pequeños cuando cumplas tus reglas." },
        { q: "¿Qué es un pip?", a: "El paso de precio estándar: 0,0001 en la mayoría de pares y 0,01 en los pares con yen. En un lote estándar de EUR/USD un pip vale unos 10 dólares." },
        { q: "¿Es legal operar forex?", a: "En muchos países sí, a través de entidades autorizadas. En España consulta el registro de la CNMV; en México, Colombia, Argentina o Venezuela revisa lo que diga el regulador local. Las ganancias pueden tributar: consulta a un asesor fiscal." },
        { q: "¿Las señales forex están garantizadas?", a: "No. Nadie puede garantizar resultados. Nuestro archivo muestra todas las señales cerradas, ganadoras y perdedoras." },
      ],
    },
    "demo-account": {
      label: "Cuenta demo",
      title: "Cuenta demo forex gratis: practica con dinero virtual | 964FX",
      description: "Qué es una cuenta demo de forex gratis, cómo abrirla, cómo practicar nuestras señales en ella y la lista de comprobación antes de pasar a una cuenta real.",
      h1: "Cuenta demo de forex: la guía",
      lede: "Una cuenta demo te permite operar con precios reales del mercado y dinero virtual. Es la forma más barata de aprender la plataforma, probar un plan y cometer los primeros errores gratis.",
      sections: [
        {
          h: "Para qué sirve una cuenta demo",
          p: [],
          list: [
            "Aprender la plataforma: órdenes, stop loss, take profit y cierre.",
            "Entender lote, valor del pip y margen antes de usar dinero real.",
            "Seguir nuestras señales diarias y el calendario para ver cómo mueven el precio las noticias.",
            "Probar un plan escrito durante semanas y medirlo con honestidad.",
          ],
        },
        {
          h: "Lo que la demo no enseña",
          p: [
            "El dinero virtual no genera miedo ni codicia, y la ejecución en demo puede ser más limpia que en real durante noticias rápidas. La demo es entrenamiento, no prueba de que una estrategia gane.",
          ],
        },
        {
          h: "Abrir una demo en IC Markets",
          p: [
            "IC ofrece una cuenta demo gratuita desde el botón «Try a Free Demo» de ic.com tras un breve formulario de registro; después entras en MetaTrader u otra plataforma compatible con tus datos demo. Usa el mismo saldo y tamaños que usarías en real: un saldo demo enorme enseña malos hábitos.",
          ],
        },
        {
          h: "Lista antes de pasar a real",
          p: [],
          list: [
            "Al menos 30 a 50 operaciones demo anotadas en un diario.",
            "Siempre con stop loss y sin romper la regla de riesgo.",
            "Sabes qué eventos del calendario evitas.",
            "Empiezas en real con poco tamaño y aceptas que los resultados variarán.",
          ],
        },
      ],
      faq: [
        { q: "¿La cuenta demo de forex es gratis?", a: "Sí, las cuentas demo suelen ser gratuitas y usan dinero virtual; no hace falta depositar." },
        { q: "¿IC Markets tiene cuenta demo?", a: "Sí. IC ofrece una demo gratuita desde «Try a Free Demo» en ic.com tras un breve formulario." },
        { q: "¿Cuánto tiempo practicar en demo?", a: "No hay un plazo fijo. Muchos siguen en demo hasta tener un plan escrito y varias decenas de operaciones que lo respeten." },
        { q: "¿Puedo probar las señales de 964FX en demo?", a: "Sí, es un buen comienzo. Copia entrada, stop y objetivo exactamente y anota los resultados." },
      ],
    },
    leverage: {
      label: "Apalancamiento",
      title: "Apalancamiento en forex explicado con ejemplos (1:30, 1:500) | 964FX",
      description: "Qué es el apalancamiento y el margen en forex, ejemplos con números, margin call y stop out, límites para minoristas en la UE y cómo usarlo con prudencia.",
      h1: "El apalancamiento en forex, explicado",
      lede: "El apalancamiento te permite abrir una posición mayor que tu depósito. No cambia el valor del pip, solo el margen que bloquea el broker. Por eso es tan fácil abusar de él.",
      sections: [
        {
          h: "Apalancamiento y margen con ejemplos",
          p: [
            "Un lote estándar de EUR/USD a 1,1000 equivale a 110.000 dólares. Con apalancamiento 1:30 el broker bloquea unos 3.667 dólares de margen; con 1:100, unos 1.100; con 1:500, unos 220.",
            "En los tres casos un movimiento de 50 pips vale unos 500 dólares. Más apalancamiento solo permite abrir el mismo riesgo con menos dinero, y por eso es más fácil abrir demasiado.",
          ],
        },
        {
          h: "Margin call y stop out",
          p: [
            "Si las pérdidas acercan tu capital al margen usado, la plataforma te avisa (margin call) y después cierra posiciones automáticamente (stop out). Los niveles exactos están en las condiciones del broker.",
          ],
        },
        {
          h: "Apalancamiento máximo para minoristas",
          p: [
            "En la Unión Europea, incluida España bajo la supervisión de la CNMV, el apalancamiento para clientes minoristas está limitado a 30:1 en pares principales y 20:1 en oro y pares no principales, con protección frente a saldo negativo. En Latinoamérica y otras jurisdicciones las reglas varían; algunos brokers ofrecen mucho más. Cuanto mayor el apalancamiento, menor el movimiento que puede vaciar la cuenta.",
          ],
        },
        {
          h: "Usar el apalancamiento con prudencia",
          p: [],
          list: [
            "Define primero el riesgo por operación (por ejemplo, 1 %) y calcula el tamaño desde la distancia del stop.",
            "No uses todo el margen disponible; deja espacio para el spread y los picos de noticias.",
            "Ten especial cuidado con los eventos de alto impacto del calendario.",
            "IC indica que su apalancamiento es dinámico y puede cambiar, lo que puede afectar al margen de las posiciones abiertas.",
          ],
        },
      ],
      faq: [
        { q: "¿Qué significa apalancamiento 1:100?", a: "El broker bloquea el 1 % del valor de la posición como margen. Una posición de 100.000 dólares necesita unos 1.000 dólares de margen." },
        { q: "¿Qué apalancamiento usar si soy principiante?", a: "No hay un número ideal, pero menos es más seguro. Lo importante es el riesgo por operación, que depende del stop y del lote, no del ajuste de apalancamiento." },
        { q: "¿Puedo perder más que mi depósito?", a: "En algunos casos sí, si hay huecos de precio. Los minoristas en la UE tienen protección frente a saldo negativo; en otros lugares depende del broker." },
        { q: "¿El apalancamiento cambia el valor del pip?", a: "No. El valor del pip depende del tamaño del lote; el apalancamiento solo cambia el margen necesario." },
      ],
    },
  },
};
