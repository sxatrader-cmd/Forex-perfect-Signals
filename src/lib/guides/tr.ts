import type { GuidePack } from "./types";

export const tr: GuidePack = {
  nav: "Rehberler",
  brokerCta: false,
  index: {
    title: "Forex rehberleri: forex nedir, altın, demo hesap, kaldıraç | 964FX",
    description: "Türkçe forex (foreks) rehberleri: forex nedir, yasal mı, caiz mi, XAUUSD altın, islami hesap, demo hesap ve kaldıraç. Vaat yok, sade anlatım.",
    h1: "Forex rehberleri",
    lede: "Günlük sinyallerimizin ve ekonomik takvimin yanında duran kısa, pratik rehberler. Kazanç vaadi yok: sadece işlerin nasıl yürüdüğü ve para riske atmadan önce neye bakmanız gerektiği.",
  },
  ui: {
    faq: "Sık sorulan sorular",
    next: "Devam edin",
    signals: "Bugünün forex sinyalleri",
    calendar: "Ekonomik takvim",
    telegram: "Telegram kanalı @Code964fx",
    method: "Sinyallerimiz nasıl oluşturulur",
    liveChart: "Canlı XAUUSD grafiği",
    liveChartNote: "Grafik TradingView'den (OANDA fiyatı). Aracı kurumunuzun fiyatı biraz farklı olabilir.",
    disclosureTitle: "Introducing Broker açıklaması",
    disclosure: "964FX, IC Markets'ın Introducing Broker'ı (IB) olan Saif Altamimi tarafından yürütülür. ic.com sitesini Raw Trading Ltd işletir; IC bu şirketin Seyşeller Financial Services Authority tarafından düzenlendiğini (lisans SD018) belirtir. Bu sitedeki bir bağlantıyla hesap açılırsa Saif aracı kurumdan komisyon alabilir. IC, aralarında ABD, Kanada ve İran'ın da bulunduğu bazı ülkelerden müşteri kabul etmez. Türkiye'de yerleşik kişilere kaldıraçlı işlem hizmeti yalnızca SPK yetkili kuruluşlarca sunulabilir; bu içerik eğitim amaçlıdır ve Türkiye'de yerleşik kişilere yönelik bir hesap açma teklifi değildir.",
    riskTitle: "Risk uyarısı",
    risk: "Forex, altın ve CFD'ler kaldıraçlı ürünlerdir ve hızla para kaybedebilirsiniz. Yalnızca kaybetmeyi göze alabileceğiniz parayla işlem yapın. Bu sayfa eğitimdir; yatırım, vergi, hukuk veya dini danışmanlık değildir ve geçmiş sonuçlar gelecek sonuçları garanti etmez.",
    updated: "Son gözden geçirme",
    read: "Rehberi oku",
    otherGuides: "Diğer rehberler",
  },
  guides: {
    "xauusd-gold": {
      label: "Forex altın XAUUSD",
      title: "XAUUSD canlı grafik ve forex altın analizi | 964FX",
      description: "Canlı XAUUSD grafiği ve forex altın rehberi: XAUUSD nedir, doları, faizi, enflasyonu ve tarım dışı istihdamı nasıl etkiler, işlem saatleri ve lot.",
      h1: "Forex altın (XAUUSD): canlı grafik ve analiz rehberi",
      lede: "XAUUSD, bir ons altının ABD doları cinsinden fiyatıdır. Altın çoğu pariteden daha hızlı hareket eder; hazırlığı ödüllendirir, büyük pozisyonları cezalandırır.",
      sections: [
        {
          h: "Altın sinyali veriyor musunuz?",
          p: [
            "Henüz değil. Otomatik sinyallerimiz şimdilik yalnızca majör pariteleri kapsıyor ve her biri kurulum tamamlanana kadar bekliyor. Altın eklenirse önce sinyaller sayfasında ve Telegram kanalımızda görünecek. O zamana kadar bu sayfada canlı grafik ve altını okurken kullandığımız kontrol listesi var.",
          ],
        },
        {
          h: "Altını genelde ne hareket ettirir",
          p: ["Altın faiz getirmez ve dolarla fiyatlanır; bu yüzden işin çoğunu birkaç etken yapar:"],
          list: [
            "ABD doları: güçlü dolar çoğu zaman XAUUSD'yi baskılar, zayıf dolar destekler. Bu ilişki sabit değildir.",
            "ABD faizleri ve reel getiriler: beklenen faiz yükseldikçe hiçbir getiri sağlamayan metali tutmanın maliyeti artar.",
            "ABD verileri: TÜFE (CPI), tarım dışı istihdam (NFP) ve Fed kararları altını dakikalar içinde sert hareket ettirebilir.",
            "Risk iştahı: gergin dönemlerde bazı yatırımcılar altını güvenli liman olarak alır.",
            "Merkez bankası ve ETF talebi: büyük trendi şekillendiren daha yavaş akışlar.",
          ],
        },
        {
          h: "XAUUSD işleminden önce basit bir rutin",
          p: [],
          list: [
            "Ekonomik takvimi açın ve günün tüm yüksek etkili USD verilerini işaretleyin (Türkiye saatiyle çoğu öğleden sonra açıklanır).",
            "Önce 4 saatlik ve günlük trendi okuyun, sonra daha küçük zaman diliminde giriş arayın.",
            "Stopu yuvarlak bir rakama değil, gerçek bir seviyenin (tepe ya da dip) ötesine koyun.",
            "Lotu ne kadar emin hissettiğinize göre değil, stop mesafesine göre hesaplayın.",
            "Planınızda yoksa CPI, NFP ya da Fed kararından birkaç dakika önce yeni işlem açmayın.",
          ],
        },
        {
          h: "Altında lot, pip ve spread",
          p: [
            "Birçok aracı kurumda bir standart lot XAUUSD 100 onstur; fiyattaki 1 dolarlık hareket lot başına yaklaşık 100 dolar eder. Kontrat büyüklüğü, minimum lot ve pip tanımı kurumdan kuruma değişir; ilk işlemden önce kontrat özelliklerine bakın. Spread genelde gün dönümünde ve büyük haberlerde açılır.",
          ],
        },
      ],
      faq: [
        { q: "XAUUSD nedir?", a: "XAU bir ons altının kodu, USD ise ABD dolarıdır. XAUUSD 2.000 ise bir ons altın 2.000 dolardır." },
        { q: "Forex altın işlem saatleri nedir?", a: "Altın genelde Londra ve New York seanslarında ve büyük ABD verilerinin çevresinde en hareketlidir. Hareket yön garantisi değildir; önce ekonomik takvime bakın." },
        { q: "964FX XAUUSD sinyali veriyor mu?", a: "Şu an vermiyor. Sinyallerimiz majör pariteleri kapsıyor. Bir değişiklik olursa sinyaller sayfasında ve Telegram kanalında duyurulur." },
        { q: "Altın haber günlerinde neden bu kadar oynak?", a: "Altın, ABD faizleri ve dolarla ilgili beklentilere tepki verir. Enflasyon, istihdam verileri ve Fed kararları bu beklentileri hızla değiştirir; fiyat sıçrayabilir, spread açılabilir." },
      ],
    },
    "islamic-swap-free-account": {
      label: "Forex caiz mi?",
      title: "Forex caiz mi, haram mı? İslami (swapsız) hesap rehberi | 964FX",
      description: "Forex caiz mi, haram mı? İslami swapsız hesabın neyi değiştirdiği, neyi değiştirmediği, âlimlerin tartıştığı konular ve IC Markets'ın swapsız seçeneği.",
      h1: "Forex caiz mi? İslami (swapsız) hesap rehberi",
      lede: "Birçok Müslüman yatırımcı iki soru sorar: forex işlemi caiz mi, ve swapsız hesap faiz meselesini çözer mi? Bu rehber konuları açıkça anlatır. Fetva değildir.",
      sections: [
        {
          h: "Swapsız hesap neyi değiştirir",
          p: [
            "Normal hesapta gün dönümünden sonra açık kalan pozisyonlar swap öder ya da alır; swap bir faiz düzeltmesidir. Swapsız (islami) hesap bu faiz düzeltmesini kaldırır.",
            "Swapın kalkması her zaman pozisyon taşımanın bedava olduğu anlamına gelmez. Bazı kurumlar yerine sabit bir ücret alır ya da maliyeti başka yerde ayarlar; hesap koşullarını okuyun.",
          ],
        },
        {
          h: "Âlimlerin tartıştığı konular",
          p: ["Âlimler ve fıkıh kurulları bireysel forex konusunda farklı görüşlere sahiptir. Genelde tartışılan noktalar şunlardır:"],
          list: [
            "Riba (faiz): swapsız işleme izin verenlere göre swapın kaldırılmasıyla giderilir.",
            "Peşin teslim (elden ele): döviz değişimi anında tamamlanmalıdır; teslimin ertelenmesi bir endişedir.",
            "Kaldıraç: kurumun teminat imkânının, borç verene fayda sağlayan bir borç sayılıp sayılmadığı.",
            "Garar ve meysir: özellikle çok yüksek kaldıraç ve çok kısa işlemlerde aşırı belirsizlik ve kumara benzeyen spekülasyon.",
          ],
        },
        {
          h: "IC Markets'ın swapsız seçeneği nasıl işler",
          p: [
            "IC, dini inançları nedeniyle faiz alamayan ya da ödeyemeyen müşteriler için swapsız hesap sunduğunu belirtir. ic.com'a göre bu seçenek Raw Spread ve Standard hesaplarda, MetaTrader 4, MetaTrader 5 ve cTrader'da mevcuttur. Swapsız hesaplar swap ödemez ve almaz; ancak IC, gece boyunca açık tutulan pozisyonlara sabit bir taşıma ücreti uygulandığını ve swapsız hesap şartlarının geçerli olduğunu söyler.",
          ],
        },
        {
          h: "Dikkatli bir karar yolu",
          p: [],
          list: [
            "Güvendiğiniz ehil bir âlime danışın ve ona gerçek hesap koşullarını gösterin.",
            "Düşük kaldıraç ya da kaldıraçsız işlemi tercih edin, kumar gibi kısa işlemlerden uzak durun.",
            "Kurumun swapsız koşullarını, varsa taşıma ücretiyle birlikte okuyun.",
            "Maliyetleri anlamak için önce demo hesapta pratik yapın.",
          ],
        },
      ],
      faq: [
        { q: "Forex caiz mi, haram mı?", a: "Tek bir cevap yok. Bazı âlimler swapsız hesapta spot döviz işlemine şartlarla izin verir, bazıları ise kaldıraçlı bireysel forexi caiz görmez. Kendi durumunuz için ehil bir âlime danışın." },
        { q: "Forex islami hesap nedir?", a: "Swapsız hesaptır: gece taşınan pozisyonlar faiz ödemez ve almaz. Bazı kurumlar bunun yerine sabit taşıma ücreti alır." },
        { q: "IC Markets'ta islami hesap var mı?", a: "Evet. IC, swapsız seçeneğin MT4, MT5 ve cTrader'da Raw Spread ve Standard hesaplarda bulunduğunu, gece tutulan pozisyonlara sabit taşıma ücreti uygulandığını belirtir." },
        { q: "Swapsız hesap her işlemi helal yapar mı?", a: "Hayır. Faiz konusunu ele alır, ama âlimler teslim, kaldıraç ve spekülasyona da bakar. Hesap türü tek başına bu soruları cevaplamaz." },
      ],
    },
    "forex-for-beginners": {
      label: "Forex nedir?",
      title: "Forex nedir, yasal mı? Yeni başlayanlar için foreks rehberi | 964FX",
      description: "Forex (foreks) nedir, nasıl yapılır, Türkiye'de yasal mı, SPK ne der? Parite, pip, lot, stop loss ve take profit, sinyal okuma ve küçük hesabı koruyan kurallar.",
      h1: "Forex nedir? Yeni başlayanlar için rehber",
      lede: "Forex (foreks), para birimlerinin birbirine karşı alınıp satıldığı piyasadır. Bizimkiler dahil kimsenin sinyalini takip etmeden önce, her işlemin dayandığı birkaç rakamı ve yaşadığınız ülkenin kurallarını bilmeniz gerekir.",
      sections: [
        {
          h: "Beş kelimeyle temel bilgiler",
          p: [],
          list: [
            "Parite: EUR/USD, euronun dolar cinsinden fiyatıdır. Almak, euronun dolara karşı yükselmesini beklemek demektir.",
            "Pip: standart fiyat adımı. EUR/USD'de bir pip 0,0001; yen paritelerinde 0,01'dir.",
            "Lot: işlem büyüklüğü. Standart lot ilk para biriminden 100.000 birim, mini lot 10.000, mikro lot 1.000'dir.",
            "Spread: alış ile satış fiyatı arasındaki fark. Her işlemde ödenen bir maliyettir.",
            "Kaldıraç: hem kazancı hem zararı büyüten borçlu pozisyon gücü.",
          ],
        },
        {
          h: "Forex Türkiye'de yasal mı?",
          p: [
            "Türkiye'de yerleşik kişilere kaldıraçlı işlem (forex) hizmeti yalnızca SPK'dan yetki almış aracı kurumlar sunabilir; yurt dışından alınmış bir lisans bu yetkinin yerine geçmez. SPK, Türkiye'de yerleşiklere izinsiz kaldıraçlı işlem sunan yurt dışı sitelere erişim engeli getirilmesi için işlem başlatmaktadır.",
            "Kısacası: kurumun SPK yetkisini SPK'nın internet sitesindeki listelerden kontrol edin, \"SPK onaylı\" iddiasına körü körüne güvenmeyin.",
          ],
        },
        {
          h: "964FX sinyali nasıl okunur",
          p: ["Sinyaller sayfamızdaki ve Telegram kanalımızdaki her sinyal aynı parçalardan oluşur:"],
          list: [
            "Parite ve yön: örneğin EURUSD SELL (satış).",
            "Giriş: fikrin başladığı fiyat.",
            "Stop loss (SL): fikrin yanlış çıktığı ve işlemin zararla kapandığı yer.",
            "Take profit (TP): hedef. Her sinyal risk-ödül oranını gösterir.",
            "Altı gerekçe: trend, momentum, seviyeler ve haber takvimi; fikri kendiniz değerlendirebilesiniz diye.",
            "Durum: sinyal fiyat TP'ye ya da SL'ye değene kadar açık kalır ve o zamana kadar aynı paritede yeni sinyal açmayız.",
          ],
        },
        {
          h: "Yeni başlayanı koruyan risk kuralları",
          p: [
            "Yaygın bir kural, her işlemde hesabın küçük ve sabit bir kısmını, örneğin %1'ini riske atmaktır. 1.000 dolarlık hesapta bu 10 dolardır. Stop 20 pip uzaktaysa lot, 20 pip 10 dolar edecek kadar küçük olmalıdır; EUR/USD'de bu yaklaşık 0,05 lottur.",
          ],
          list: [
            "Stop loss'u her zaman kullanın ve asla uzaklaştırmayın.",
            "Girişten önce ekonomik takvime bakın.",
            "Demo hesapla başlayın.",
            "Her işlemi ve nedenini bir günlüğe yazın.",
          ],
        },
      ],
      faq: [
        { q: "Forex yasal mı?", a: "Türkiye'de yerleşik kişilere kaldıraçlı işlem hizmeti yalnızca SPK yetkili kuruluşlar tarafından sunulabilir ve SPK izinsiz yurt dışı sitelere erişim engeli için işlem başlatır. Başka ülkelerde kurallar farklıdır; yaşadığınız yerin düzenleyicisine bakın." },
        { q: "Forex nasıl yapılır?", a: "Önce parite, pip, lot ve spread kavramlarını öğrenin, demo hesapta stop loss ile pratik yapın ve ekonomik takvimi takip edin. Gerçek parayla işlem yapacaksanız kurumun yaşadığınız ülkede yetkili olduğundan emin olun." },
        { q: "Pip nedir?", a: "Pip standart fiyat adımıdır: çoğu paritede 0,0001, yen paritelerinde 0,01. Bir standart lot EUR/USD'de bir pip yaklaşık 10 dolar eder." },
        { q: "Forex sinyalleri garantili mi?", a: "Hayır. Hiçbir sinyal sağlayıcı sonuç garanti edemez. Arşivimiz kazanan ve kaybeden tüm kapanmış sinyalleri gösterir; kendiniz değerlendirebilirsiniz." },
      ],
    },
    "demo-account": {
      label: "Forex demo hesap",
      title: "Forex demo hesap nedir? Sanal parayla pratik rehberi | 964FX",
      description: "Ücretsiz forex demo hesap nedir, MetaTrader'da nasıl kullanılır, sinyallerimizle demo hesapta nasıl pratik yapılır ve gerçek hesaptan önce kontrol listesi.",
      h1: "Forex demo hesap rehberi",
      lede: "Demo hesap, gerçek piyasa fiyatlarıyla sanal parayla işlem yapmanızı sağlar. Platformu öğrenmenin, bir planı test etmenin ve ilk hataları ücretsiz yapmanın en ucuz yoludur.",
      sections: [
        {
          h: "Demo hesap ne işe yarar",
          p: [],
          list: [
            "Platformu öğrenmek: emir vermek, stop loss ve take profit koymak, işlem kapatmak.",
            "Gerçek para devreye girmeden lot, pip değeri ve teminatı anlamak.",
            "Haberlerin fiyatı nasıl oynattığını görmek için günlük sinyallerimizi ve ekonomik takvimi takip etmek.",
            "Yazılı bir planı birkaç hafta test edip sonuçları dürüstçe ölçmek.",
          ],
        },
        {
          h: "Demonun öğretemedikleri",
          p: [
            "Sanal para korku ya da açgözlülük yaratmaz; hızlı haberlerde demodaki gerçekleşmeler gerçek hesaptakinden daha temiz olabilir. Demoyu bir stratejinin para kazandıracağının kanıtı değil, antrenman olarak görün.",
          ],
        },
        {
          h: "IC Markets demo hesabı",
          p: [
            "IC, ic.com'daki \"Try a Free Demo\" düğmesinden kısa bir formla açılan ücretsiz demo hesap sunar. Ardından demo girişinizle MetaTrader'a ya da desteklenen başka bir platforma bağlanırsınız. Gerçekte kullanacağınız bakiye ve lotlarla çalışın; dev bir demo bakiyesi kötü alışkanlık öğretir.",
          ],
        },
        {
          h: "Gerçek hesabı düşünmeden önce kontrol listesi",
          p: [],
          list: [
            "Günlüğe kaydedilmiş en az 30-50 demo işlem.",
            "Her zaman stop loss kullandınız ve risk kuralınızı hiç bozmadınız.",
            "Hangi takvim olaylarından kaçındığınızı biliyorsunuz.",
            "Kurumun yaşadığınız ülkede yetkili olduğunu kontrol ettiniz (Türkiye'de SPK yetkisi).",
          ],
        },
      ],
      faq: [
        { q: "Forex demo hesap ücretsiz mi?", a: "Evet, demo hesaplar normalde ücretsizdir ve sanal para kullanır. Açmak için para yatırmanız gerekmez." },
        { q: "IC Markets'ta demo hesap var mı?", a: "Evet. IC, ic.com'daki \"Try a Free Demo\" düğmesinden kısa bir kayıt formuyla ücretsiz demo hesap sunar." },
        { q: "Demo hesapta ne kadar kalmalıyım?", a: "Sabit bir kural yok. Birçok yatırımcı yazılı bir planı ve bu plana uyan birkaç düzine işlemi olana kadar demoda kalır." },
        { q: "964FX sinyallerini demo hesapta kullanabilir miyim?", a: "Evet, başlamak için iyi bir yol. Giriş, stop ve hedefi aynen uygulayın ve sonuçları kaydedin." },
      ],
    },
    leverage: {
      label: "Forex kaldıraç",
      title: "Forex kaldıraç nedir? Örneklerle 1:10, 1:30, 1:500 | 964FX",
      description: "Forex kaldıraç ve teminat nedir, rakamlarla örnekler, margin call ve stop out, AB, İngiltere ve ABD'de bireysel limitler ve kaldıracı güvenli kullanma.",
      h1: "Forex kaldıraç nedir? Örneklerle anlatım",
      lede: "Kaldıraç, yatırdığınız paradan büyük bir pozisyon açmanızı sağlar. Bir pipin değerini değiştirmez, yalnızca kurumun ne kadar teminat tuttuğunu değiştirir. Yanlış kullanmanın bu kadar kolay olmasının sebebi budur.",
      sections: [
        {
          h: "Rakamlarla kaldıraç ve teminat",
          p: [
            "1,1000'den bir standart lot EUR/USD 110.000 dolar eder. 1:30 kaldıraçta kurum yaklaşık 3.667 dolar teminat tutar; 1:100'de yaklaşık 1.100 dolar; 1:500'de yaklaşık 220 dolar.",
            "Üç durumda da 50 piplik hareket yaklaşık 500 dolar eder. Yüksek kaldıraç aynı riski daha az parayla açmanızı sağlar; bu da fazla açmayı kolaylaştırır.",
          ],
        },
        {
          h: "Margin call ve stop out",
          p: [
            "Zararlar özsermayenizi kullanılan teminata yaklaştırırsa platform uyarır (margin call), sonra pozisyonları otomatik kapatmaya başlar (stop out). Kesin seviyeler kurumunuzun şartlarında yazar.",
          ],
        },
        {
          h: "Bireysel kaldıraç limitleri",
          p: [
            "Avrupa Birliği ve Birleşik Krallık'ta düzenleyiciler bireysel müşteri kaldıracını majör paritelerde 30:1, altın ve majör olmayan paritelerde 20:1 ile sınırlar ve negatif bakiye koruması ister. ABD'de limit majör paritelerde 50:1, diğer paritelerde 20:1'dir. Türkiye'de kaldıraç oranlarını SPK belirler; güncel oranları SPK düzenlemelerinden kontrol edin. Başka bölgelerdeki kurumlar daha fazlasını sunabilir; yüksek kaldıraç, daha küçük bir hareketin hesabı silebileceği anlamına gelir.",
          ],
        },
        {
          h: "Kaldıracı güvenli kullanmak",
          p: [],
          list: [
            "Önce işlem başına riski belirleyin (örneğin hesabın %1'i), sonra lotu stop mesafesinden hesaplayın.",
            "Kullanılabilir teminatın tamamını kullanmayın; spread ve haber sıçramalarına pay bırakın.",
            "Ekonomik takvimdeki yüksek etkili olaylarda ekstra dikkatli olun.",
            "IC'nin kaldıracının dinamik olduğunu ve değişebileceğini belirttiğini unutmayın; bu, açık pozisyonların teminatını etkileyebilir.",
          ],
        },
      ],
      faq: [
        { q: "1:100 kaldıraç ne demek?", a: "Kurumun pozisyon değerinin %1'ini teminat olarak tuttuğu anlamına gelir. 100.000 dolarlık pozisyon yaklaşık 1.000 dolar teminat ister." },
        { q: "Yeni başlayanlar için en iyi kaldıraç hangisi?", a: "En iyi sayı yok, ama düşük olan daha güvenlidir. Asıl önemli olan işlem başına risktir; bu da kaldıraç ayarından değil, stop mesafesi ve lottan gelir." },
        { q: "Yatırdığımdan fazlasını kaybedebilir miyim?", a: "Piyasa boşlukla açılırsa bazı durumlarda evet. AB ve İngiltere'deki bireysel müşterilerin negatif bakiye koruması vardır; başka yerlerde kurumun şartlarına bağlıdır." },
        { q: "Kaldıraç pip değerini değiştirir mi?", a: "Hayır. Pip değeri lot büyüklüğüne bağlıdır. Kaldıraç yalnızca pozisyonu açmak için gereken teminatı değiştirir." },
      ],
    },
  },
};
