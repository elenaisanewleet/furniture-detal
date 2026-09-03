/**
 * Generated translations of the catalogue copy. Regenerate rather than hand-edit
 * where possible; the shapes are enforced by src/data/copy.ts.
 *
 * Every number, weight, percentage and allergen in here was checked against the
 * English before it was committed. Brand names (Semers, App'Lite, PastiLite,
 * Belevini, Maxima, Barbora) stay in Latin script on purpose.
 *
 * Only words live here. Price, weight, EAN and nutrition stay in products.ts,
 * and the override type admits no other field, so a translation cannot change a
 * fact even by accident.
 */
import type { Locale } from "~/i18n/config";
import type { CollectionCopy, FaqCopy, ProductCopy } from "./copy";

/** slug → copy */
export const PRODUCT_COPY: Partial<
  Record<Locale, Record<string, ProductCopy>>
> = {
  ru: {
    "apple-bar-35g": {
      name: "Яблочный батончик",
      title: "Яблочный батончик App'Lite, 35 г",
      hook: "99% печёных яблок. В этом вся идея.",
      summary:
        "Батончик 35 г из взбитой печёной антоновки, высушенной слоями. Без добавленного сахара, без муки, без глютена — около 97 ккал. Сделано в Риге, хранится 12 месяцев.",
      description: [
        "Достаньте из ящика стола шоколадный батончик. Положите туда вместо него этот. Тот же размер, тот же момент «нужно что-то съесть прямо сейчас», но состав читается так: печёные яблоки, яичный белок. И всё.",
        "Мы печём антоновку, пока она не станет мягкой и карамельно-сладкой, взбиваем пюре с яичным белком, размазываем тонким слоем и медленно сушим слой за слоем. Получается батончик — мягкий, чуть тягучий, со вкусом сердцевины печёного яблока.",
        "Около 97 ккал на батончик, сладость только от фруктов, клетчатка — из яблочной кожуры. Хранится месяцами без консервантов: всю работу делает медленная сушка.",
      ],
      ingredients:
        "Печёные яблоки (99%), яичный белок. Ягодный микс: печёные яблоки, яичный белок, черника, клюква. Корица: печёные яблоки, яичный белок, корица.",
      allergens: "Содержит яйцо. Может содержать следы орехов.",
    },
    "flourless-apple-bar-50g": {
      name: "Яблочный батончик без муки",
      title: "Яблочный батончик без муки, 50 г",
      hook: "Батончик поплотнее. Целые ягоды, ноль муки.",
      summary:
        "Плотный батончик 50 г из печёного яблока, спрессованного с целыми ягодами. Без муки, без глютена, без добавленного сахара. Оригинальный, Клюква, Корица, Черника.",
      description: [
        "Пятьдесят граммов пастилы из печёных яблок, спрессованной с настоящими сушёными ягодами — так получается плотнее и фруктовее. Это тот батончик, который мы берём с собой на долгие прогулки и долгие совещания.",
        "Как и всё, что мы делаем, он сладкий только за счёт самих яблок. Без муки, без сиропов, без «натуральных ароматизаторов» — только фрукты, яичный белок и время.",
      ],
      ingredients:
        "Печёные яблоки, яичный белок, сушёные ягоды (клюква, черника) или корица — в зависимости от вкуса.",
      allergens: "Содержит яйцо. Может содержать следы орехов.",
    },
    "apple-meringue-35g": {
      name: "Яблочное безе",
      title: "Яблочное безе PastiLite, 35 г",
      hook: "Хрустящее, воздушное и сладкое без единой крупинки сахара.",
      summary:
        "Хрустящие безе из печёных яблок, яичного белка и ягод. Три ингредиента, без добавленного сахара, 35 г воздуха и хруста.",
      description: [
        "Обычное безе — это яичный белок и горка сахара. Наше — яичный белок и печёное яблоко. Оно запекается в такой же ломкий, растворяющийся на языке хруст, только сладость идёт от антоновки, а не из сахарницы.",
        "Достаточно лёгкое, чтобы съесть целый пакет, и достаточно сытное, чтобы вам этого, скорее всего, не понадобилось. Хорошо с кофе; можно покрошить в йогурт или положить в ланчбокс вместо десерта.",
      ],
      ingredients:
        "Печёные яблоки, яичный белок. Ягодный микс: печёные яблоки, яичный белок, ягоды (черника, клюква).",
      allergens: "Содержит яйцо.",
    },
    "applite-baked-apple-dessert-50g": {
      name: "Десерт App'Lite",
      title: "Десерт из печёных яблок App'Lite, 50 г",
      hook: "Начинка яблочного пирога — без самого пирога.",
      summary:
        "Толстый квадратик пастилы из печёных яблок, 50 г, без добавленного сахара. Классический, Ягодный микс или Корица. К чаю, кофе или йогурту.",
      description: [
        "Десертная нарезка нашей пастилы: толще, мягче, для тарелки, а не для кармана. Пятьдесят граммов слоёного печёного яблока со вкусом тёплой начинки яблочного пирога.",
        "Подавайте с ложкой йогурта, крошите в кашу или нарежьте тонко на сырную доску. Сладко, но никогда не приторно.",
      ],
      ingredients:
        "Печёные яблоки (99%), яичный белок. В «Ягодный микс» добавлены черника и клюква; в «Корицу» добавлена корица.",
      allergens: "Содержит яйцо. Может содержать следы орехов.",
    },
    "belyov-apple-pastila-100g": {
      name: "Белёвская яблочная пастила",
      title: "Белёвская яблочная пастила, 100 г",
      hook: "Тот самый рецепт 1888 года, в карманном формате.",
      summary:
        "Брусок 100 г традиционной белёвской яблочной пастилы без добавленного сахара: печёная антоновка и яичный белок, взбитые и высушенные слоями.",
      description: [
        "Белёвская пастила — прабабушка всех яблочных снеков, которые мы делаем. Печёную антоновку взбивают с яичным белком, размазывают тонкими слоями, часами сушат, а потом складывают друг на друга и сушат снова.",
        "Получается воздушный слоёный брусок с текстурой где-то между бисквитом и сушёными фруктами — и честный, чуть кисловатый вкус печёного яблока. Брусок 100 г — тот, с которого стоит начать.",
      ],
      ingredients:
        "Печёные яблоки, яичный белок. Во вкусовые версии добавлены ягоды (брусника, вишня, черника, чёрная смородина) или корица.",
      allergens: "Содержит яйцо. Может содержать следы орехов.",
    },
    "belyov-apple-pastila-180g": {
      name: "Белёвская яблочная пастила",
      title: "Белёвская яблочная пастила, 180 г",
      hook: "Брусок для всей семьи. Семь вкусов, ноль добавленного сахара.",
      summary:
        "Полный брусок белёвской яблочной пастилы 180 г без добавленного сахара, семь вкусов — от классического до кедрового ореха. Нарежьте и подайте на стол.",
      description: [
        "Тот самый брусок, с которого всё началось, в размере для компании. Сто восемьдесят граммов слоёного печёного яблока, высушенного медленно — до мягкости и воздушности, и хранится он месяцами без консервантов.",
        "«Классический» — чистая антоновка. «Корица» — вкус осени. «Вишня» и «Чёрная смородина» яркие и кислые, «Черника» и «Брусника» — лесные и сладкие, а «Кедровый орех» добавляет между слоями маслянистый хруст.",
      ],
      ingredients:
        "Печёные яблоки, яичный белок. Во вкусовые версии добавлены ягоды, корица или кедровые орехи.",
      allergens:
        "Содержит яйцо. Вариант «Кедровый орех» содержит орехи. Может содержать следы орехов.",
    },
    "belevini-zephyr-250g": {
      name: "Зефир Belevini",
      title: "Яблочный зефир Belevini, 250 г",
      hook: "Яблочный зефир, мягкий как облако, на агаре.",
      summary:
        "Мягкий яблочный зефир из пюре антоновки, яичного белка, сахара и агара. Классический яблочный, клюквенный, ассорти и в тёмном шоколаде. Коробка 250 г.",
      description: [
        "Зефир — восточноевропейский родственник маршмеллоу: делается на фруктовом пюре и застывает на агаре, а не на желатине. Наш начинается с той же антоновки, что и наша пастила, и, в отличие от всего остального, что мы делаем, готовится с сахаром; на упаковке так и написано.",
        "Мягкий как облако, деликатно сладкий, с яблочной кислинкой в основе. Версия в шоколаде — та, что исчезает со стола первой.",
      ],
      ingredients:
        "Яблочное пюре, сахар, яичный белок, агар. В шоколаде: плюс тёмный шоколад (какао-масса, сахар, какао-масло, эмульгатор: соевый лецитин).",
      allergens:
        "Содержит яйцо. Вариант в шоколаде содержит сою; может содержать молоко и следы орехов.",
    },
    "tasting-box": {
      name: "Дегустационный набор",
      title: "Дегустационный набор Semers — батончики, безе и пастила",
      hook: "Попробуйте всё по одному разу. Потом спорьте, что лучше.",
      summary:
        "Наш стартовый набор: 4 яблочных батончика, 2 батончика без муки, 2 пакета яблочного безе и брусок белёвской пастилы 100 г. Доставка бесплатно.",
      description: [
        "Всё, что мы делаем, в одной коробке: четыре яблочных батончика App'Lite (два классических, два с ягодным миксом), два батончика без муки, два пакета безе PastiLite и брусок белёвской пастилы 100 г.",
        "Доставка бесплатная, подарок из него получается хороший, и он закрывает вопрос, что заказать в следующий раз.",
      ],
      ingredients:
        "См. отдельные товары. Все позиции: печёные яблоки, яичный белок, фрукты или специи.",
      allergens: "Содержит яйцо. Может содержать следы орехов.",
    },
    "apple-bar-12-pack": {
      name: "Яблочный батончик, набор 12 шт.",
      title: "Яблочный батончик App'Lite, 35 г — коробка из 12 шт.",
      hook: "Ящик стола, полный правильных решений.",
      summary:
        "Двенадцать яблочных батончиков App'Lite в одной коробке — классические, с ягодным миксом или пополам. Экономия 14% по сравнению с покупкой по одному. 99% печёных яблок, без добавленного сахара.",
      description: [
        "Эту коробку мы отправляем в офисы, спортзалы и всем, кто постоянно находит обёртки в карманах пальто. Двенадцать яблочных батончиков по 35 г, каждый в отдельной упаковке, в коробке, которая нормально встаёт на полку.",
        "Выберите один вкус или доверьте нам сложить шесть классических и шесть с ягодным миксом.",
      ],
      ingredients:
        "Печёные яблоки (99%), яичный белок; в «Ягодный микс» добавлены черника и клюква.",
      allergens: "Содержит яйцо. Может содержать следы орехов.",
    },
    "pastila-discovery-set": {
      name: "Набор для знакомства с пастилой",
      title: "Набор для знакомства с белёвской пастилой — 3 × 100 г",
      hook: "Классическая, вишня, брусника. Святая троица.",
      summary:
        "Три бруска белёвской яблочной пастилы по 100 г — классическая, вишня и брусника — в подарочной обёртке. Печёная антоновка и яичный белок, без добавленного сахара.",
      description: [
        "Три бруска, которые мы поставили бы перед человеком, никогда не пробовавшим пастилу: чистая классическая, яркая вишнёвая и лесная сладкая брусничная.",
        "Упаковано в подарочную обёртку из крафта. Добавьте пожелание при оформлении заказа — и мы перенесём его на открытку.",
      ],
      ingredients:
        "Печёные яблоки, яичный белок, вишня или брусника — в зависимости от бруска.",
      allergens: "Содержит яйцо. Может содержать следы орехов.",
    },
  },
  lv: {
    "apple-bar-35g": {
      name: "Ābolu batoniņš",
      title: "App'Lite ābolu batoniņš, 35 g",
      hook: "99 % ceptu ābolu. Tāda ir visa doma.",
      summary:
        "35 g batoniņš no saputota, kārtās klāta cepta Antonovka ābola. Bez pievienota cukura, bez miltiem, bez glutēna — apmēram 97 kcal. Ražots Rīgā, glabājas 12 mēnešus.",
      description: [
        'Izņemiet no atvilktnes šokolādes batoniņu. Ielieciet tā vietā šo. Tāds pats izmērs, tas pats „man kaut ko vajag tagad" mirklis, tikai sastāvdaļu sarakstā rakstīts: cepti āboli, olu baltums. Un viss.',
        "Antonovka ābolus cepam, līdz tie ir mīksti un karameļsaldi, biezeni saputojam ar olu baltumu, izklājam plānā kārtā un lēni žāvējam kārtu pēc kārtas. Rezultāts ir batoniņš, kas ir mīksts, nedaudz košļājams un garšo pēc cepta ābola iekšpuses.",
        "Apmēram 97 kcal vienā batoniņā, dabīgi salds no pašiem augļiem, ar šķiedrvielām no ābolu mizām. Glabājas mēnešiem ilgi bez konservantiem, jo darbu izdara lēnā žāvēšana.",
      ],
      ingredients:
        "Cepti āboli (99 %), olu baltums. Ogu mikss: cepti āboli, olu baltums, mellenes, dzērvenes. Kanēlis: cepti āboli, olu baltums, kanēlis.",
      allergens: "Satur olas. Var saturēt riekstu pēdas.",
    },
    "flourless-apple-bar-50g": {
      name: "Ābolu batoniņš bez miltiem",
      title: "Ābolu batoniņš bez miltiem, 50 g",
      hook: "Sātīgākais batoniņš. Veselas ogas, nulle miltu.",
      summary:
        "Blīvs 50 g batoniņš no cepta ābola, kas saspiests kopā ar veselām ogām. Bez miltiem, bez glutēna, bez pievienota cukura. Oriģinālais, Dzērvene, Kanēlis, Mellene.",
      description: [
        "Piecdesmit grami ceptu ābolu pastilas, saspiestas ar īstām žāvētām ogām, lai kodums būtu košļājamāks un ogaināks. Šo batoniņu mēs ņemam līdzi garās pastaigās un garās sapulcēs.",
        'Tāpat kā viss, ko mēs gatavojam, tas ir salds tikai no pašiem āboliem. Bez miltiem, bez sīrupiem, bez „dabīgiem aromatizētājiem" — tikai augļi, olu baltums un laiks.',
      ],
      ingredients:
        "Cepti āboli, olu baltums, žāvētas ogas (dzērvenes, mellenes) vai kanēlis atkarībā no garšas.",
      allergens: "Satur olas. Var saturēt riekstu pēdas.",
    },
    "apple-meringue-35g": {
      name: "Ābolu bezē",
      title: "PastiLite ābolu bezē, 35 g",
      hook: "Kraukšķīgs, gaisīgs un salds bez neviena cukura graudiņa.",
      summary:
        "Kraukšķīgas bezē kūciņas no ceptiem āboliem, olu baltuma un ogām. Trīs sastāvdaļas, bez pievienota cukura, 35 g gaisa un kraukšķa.",
      description: [
        "Bezē parasti ir olu baltums un kalns cukura. Mūsu bezē ir olu baltums un cepts ābols. Tā izcepas tikpat plaisājoši kraukšķīga un mutē kūstoša — tikai saldums nāk no Antonovka āboliem, nevis no cukurtrauka.",
        'Tik viegls, ka var apēst visu maisiņu, un tik sātīgs, ka droši vien nevajadzēs. Lieliski der kafijai, sadrupināts pār jogurtu vai kā „deserts" pusdienu kārbiņā.',
      ],
      ingredients:
        "Cepti āboli, olu baltums. Ogu mikss: cepti āboli, olu baltums, ogas (mellenes, dzērvenes).",
      allergens: "Satur olas.",
    },
    "applite-baked-apple-dessert-50g": {
      name: "App'Lite deserts",
      title: "App'Lite cepta ābola deserts, 50 g",
      hook: "Ābolu pīrāga pildījums bez pīrāga.",
      summary:
        "Biezs 50 g ceptu ābolu pastilas kvadrāts bez pievienota cukura. Klasiskais, Ogu mikss vai Kanēlis. Ēdiet ar tēju, kafiju vai jogurtu.",
      description: [
        "Mūsu pastilas deserta griezums: biezāks, mīkstāks, domāts šķīvim, nevis kabatai. Piecdesmit grami kārtās klāta cepta ābola, kas garšo pēc silta ābolu pīrāga pildījuma.",
        "Pasniedziet to ar karoti jogurta, sadrupiniet pār putru vai sagrieziet plānās šķēlēs siera platei. Tas ir salds, bet nekad ne cukurots.",
      ],
      ingredients:
        "Cepti āboli (99 %), olu baltums. Ogu miksam pievienotas mellenes un dzērvenes; Kanēlim pievienots kanēlis.",
      allergens: "Satur olas. Var saturēt riekstu pēdas.",
    },
    "belyov-apple-pastila-100g": {
      name: "Beļovas ābolu pastila",
      title: "Beļovas ābolu pastila, 100 g",
      hook: "Oriģinālā 1888. gada recepte kabatas izmērā.",
      summary:
        "100 g klaips tradicionālās Beļovas ābolu pastilas bez pievienota cukura: cepti Antonovka āboli un olu baltums, saputoti un žāvēti kārtās.",
      description: [
        "Beļovas pastila ir vecvecmāmiņa visiem mūsu ābolu kārumiem. Ceptus Antonovka ābolus saputo ar olu baltumu, izklāj plānās kārtās, žāvē stundām ilgi, pēc tam saliek kopā un žāvē vēlreiz.",
        "Rezultātā top gaisīgs, kārtains klaips ar tekstūru starp biskvītu un žāvētiem augļiem — un ar godīgu, nedaudz skābenu cepta ābola garšu. 100 g klaips ir tas, ar kuru sākt.",
      ],
      ingredients:
        "Cepti āboli, olu baltums. Garšu versijām pievienotas ogas (brūklenes, ķirši, mellenes, upenes) vai kanēlis.",
      allergens: "Satur olas. Var saturēt riekstu pēdas.",
    },
    "belyov-apple-pastila-180g": {
      name: "Beļovas ābolu pastila",
      title: "Beļovas ābolu pastila, 180 g",
      hook: "Klaips visai ģimenei. Septiņas garšas, nulle pievienota cukura.",
      summary:
        "Pilnais 180 g Beļovas ābolu pastilas klaips bez pievienota cukura, septiņās garšās — no Klasiskās līdz Ciedru riekstiem. Sagrieziet to un lieciet galdā.",
      description: [
        "Klaips, ar kuru viss sākās, izmērā, kas domāts dalīšanai. Simt astoņdesmit grami kārtaina cepta ābola, lēni žāvēta, līdz tas ir mīksts, gaisīgs un glabājas mēnešiem ilgi bez konservantiem.",
        "Klasiskā ir tīra Antonovka. Kanēlis garšo tā, kā garšo rudens. Ķirsis un Upene ir spilgti un skābeni, Mellene un Brūklene ir meža saldas, bet Ciedru rieksti starp kārtām pievieno sviestainu kraukšķi.",
      ],
      ingredients:
        "Cepti āboli, olu baltums. Garšu versijām pievienotas ogas, kanēlis vai ciedru rieksti.",
      allergens:
        "Satur olas. Variants ar ciedru riekstiem satur riekstus. Var saturēt riekstu pēdas.",
    },
    "belevini-zephyr-250g": {
      name: "Belevini zefīrs",
      title: "Belevini ābolu zefīrs, 250 g",
      hook: "Mākoņmīksts ābolu zefīrs, sabiezēts ar agaru.",
      summary:
        "Mīksts ābolu zefīrs no Antonovka ābolu biezeņa, olu baltuma, cukura un agara. Klasiskais ābolu, dzērveņu, jauktais un tumšajā šokolādē mērktais. 250 g kastīte.",
      description: [
        "Zefīrs ir marshmallow austrumeiropas brālēns: gatavots no augļu biezeņa un sabiezēts ar agaru, nevis želatīnu. Mūsu zefīrs sākas ar tiem pašiem Antonovka āboliem kā mūsu pastila un, atšķirībā no visa pārējā, ko mēs gatavojam, ir gatavots ar cukuru; tā arī rakstīts uz iepakojuma.",
        "Mākoņmīksts, smalki salds, ar svaigu ābola skābenumu pamatā. Šokolādē mērktā versija ir tā, kas no galda pazūd pirmā.",
      ],
      ingredients:
        "Ābolu biezenis, cukurs, olu baltums, agars. Šokolādē mērktajam papildus tumšā šokolāde (kakao masa, cukurs, kakao sviests, emulgators: sojas lecitīns).",
      allergens:
        "Satur olas. Šokolādē mērktais satur soju; var saturēt pienu un riekstu pēdas.",
    },
    "tasting-box": {
      name: "Degustācijas kaste",
      title: "Semers degustācijas kaste — batoniņi, bezē un pastila",
      hook: "Nogaršojiet visu vienu reizi. Pēc tam strīdieties par mīļāko.",
      summary:
        "Mūsu iesācēja kaste: 4 ābolu batoniņi, 2 batoniņi bez miltiem, 2 maisiņi ābolu bezē un 100 g Beļovas pastilas klaips. Bezmaksas piegāde.",
      description: [
        "Viss, ko mēs gatavojam, vienā kastē: četri App’Lite ābolu batoniņi (divi Klasiskie, divi ar Ogu miksu), divi batoniņi bez miltiem, divi maisiņi PastiLite bezē un 100 g Beļovas pastilas klaips.",
        "Piegāde ir bez maksas, dāvanai der lieliski, un tā atrisina jautājumu, ko pasūtīt vēlreiz.",
      ],
      ingredients:
        "Skatiet atsevišķos produktus. Visos produktos: cepti āboli, olu baltums, augļi vai garšvielas.",
      allergens: "Satur olas. Var saturēt riekstu pēdas.",
    },
    "apple-bar-12-pack": {
      name: "Ābolu batoniņi, 12 gab. iepakojums",
      title: "App'Lite ābolu batoniņi 35 g — kaste ar 12 gabaliem",
      hook: "Atvilktne, pilna ar labiem lēmumiem.",
      summary:
        "Divpadsmit App’Lite ābolu batoniņi vienā kastē — Klasiskie, Ogu mikss vai puse uz pusi. Ietaupa 14 % salīdzinājumā ar atsevišķiem batoniņiem. 99 % ceptu ābolu, bez pievienota cukura.",
      description: [
        "Šo kasti mēs sūtām uz birojiem, sporta zālēm un ikvienam, kas mēteļa kabatās nemitīgi atrod papīriņus. Divpadsmit 35 g ābolu batoniņi, katrs atsevišķi iepakots, plauktam ērtā kastē.",
        "Izvēlieties vienu garšu vai ļaujiet mums salikt sešus Klasiskos un sešus ar Ogu miksu.",
      ],
      ingredients:
        "Cepti āboli (99 %), olu baltums; Ogu miksam pievienotas mellenes un dzērvenes.",
      allergens: "Satur olas. Var saturēt riekstu pēdas.",
    },
    "pastila-discovery-set": {
      name: "Pastilas atklāšanas komplekts",
      title: "Beļovas pastilas atklāšanas komplekts — 3 × 100 g",
      hook: "Klasiskā, Ķirsis, Brūklene. Svētā trīsvienība.",
      summary:
        "Trīs 100 g Beļovas ābolu pastilas klaipi — Klasiskā, Ķirsis un Brūklene — dāvanu apvalkā. Cepti Antonovka āboli un olu baltums, bez pievienota cukura.",
      description: [
        "Trīs klaipi, ko mēs noliktu priekšā cilvēkam, kas pastilu nekad nav garšojis: tīro Klasisko, spilgto Ķirsi un meža saldo Brūkleni.",
        "Iepakots kraftpapīra dāvanu apvalkā. Pievienojiet piezīmi, noformējot pasūtījumu, un mēs to uzrakstīsim uz kartītes.",
      ],
      ingredients:
        "Cepti āboli, olu baltums, ķirši vai brūklenes atkarībā no klaipa.",
      allergens: "Satur olas. Var saturēt riekstu pēdas.",
    },
  },
};

/** collection key → copy */
export const COLLECTION_COPY: Partial<
  Record<Locale, Record<string, CollectionCopy>>
> = {
  ru: {
    "apple-bars": {
      name: "Яблочные батончики",
      title: "Яблочные батончики — 99% печёных яблок, без добавленного сахара",
      description:
        "Яблочные батончики App'Lite: снек 35 г из 99% печёных яблок антоновка и яичного белка. Без добавленного сахара, без муки, без глютена. Около 97 ккал в одном батончике.",
    },
    "flourless-bars": {
      name: "Батончики без муки",
      title: "Яблочные батончики без муки 50 г — плотные, фруктовые, без муки",
      description:
        "Батончики без муки 50 г из печёных яблок, яичного белка и настоящих фруктов. Без муки, без глютена, без добавленного сахара. Оригинальный, клюква, корица и черника.",
    },
    meringues: {
      name: "Яблочные меренги",
      title: "Яблочные меренги PastiLite — хрустящие, без добавленного сахара",
      description:
        "Хрустящие меренги PastiLite из печёных яблок, яичного белка и ягод. Три ингредиента, без добавленного сахара. Лёгкий пакетик 35 г, который тает во рту.",
    },
    applite: {
      name: "Десерт App'Lite",
      title: "Десерт из печёных яблок App'Lite — без добавленного сахара",
      description:
        "Десерт из печёных яблок App'Lite: квадратик пастилы 50 г из 99% печёных яблок, без добавленного сахара. Классический, ягодный микс и корица.",
    },
    pastila: {
      name: "Белёвская пастила",
      title:
        "Белёвская яблочная пастила 100 г и 180 г — без добавленного сахара",
      description:
        "Традиционная белёвская яблочная пастила без добавленного сахара: печёные яблоки антоновка и яичный белок, взбитые и высушенные слоями. Батоны 100 г и 180 г.",
    },
    zephyr: {
      name: "Зефир",
      title: "Зефир Belevini — мягкий яблочный маршмеллоу",
      description:
        "Зефир Belevini: мягкий яблочный маршмеллоу Восточной Европы, из пюре яблок антоновка, яичного белка, сахара и агара. Четыре вида, коробки 250 г.",
    },
    "gift-sets": {
      name: "Подарочные наборы и боксы",
      title: "Подарочные наборы и дегустационные боксы с яблочными снеками",
      description:
        "Подобранные наборы яблочных батончиков, меренг и пастилы. Дегустационные боксы, наборы по 12 штук и наборы для знакомства без добавленного сахара, упакованы и отправлены из Риги.",
    },
  },
  lv: {
    "apple-bars": {
      name: "Ābolu batoniņi",
      title: "Ābolu batoniņi — 99% ceptu ābolu, bez pievienota cukura",
      description:
        "App'Lite ābolu batoniņi: 35 g uzkoda no 99% ceptu Antonovka ābolu un olu baltuma. Bez pievienota cukura, bez miltiem, bez glutēna. Apmēram 97 kcal vienā batoniņā.",
    },
    "flourless-bars": {
      name: "Batoniņi bez miltiem",
      title: "Ābolu batoniņi bez miltiem, 50 g — blīvi, augļaini, bez miltiem",
      description:
        "50 g batoniņi bez miltiem, gatavoti no ceptiem āboliem, olu baltuma un īstiem augļiem. Bez miltiem, bez glutēna, bez pievienota cukura. Oriģinālie, dzērveņu, kanēļa un melleņu.",
    },
    meringues: {
      name: "Ābolu bezē",
      title: "PastiLite ābolu bezē — kraukšķīgs, bez pievienota cukura",
      description:
        "PastiLite kraukšķīgs bezē no ceptiem āboliem, olu baltuma un ogām. Trīs sastāvdaļas, bez pievienota cukura. Viegls 35 g maisiņš, kas kūst mutē.",
    },
    applite: {
      name: "App'Lite deserts",
      title: "App'Lite ceptu ābolu deserts — bez pievienota cukura",
      description:
        "App'Lite ceptu ābolu deserts: 50 g pastilas kvadrātiņš no 99% ceptu ābolu, bez pievienota cukura. Klasiskais, Ogu maisījums un Kanēlis.",
    },
    pastila: {
      name: "Beļovas pastila",
      title: "Beļovas ābolu pastila 100 g un 180 g — bez pievienota cukura",
      description:
        "Tradicionālā Beļovas ābolu pastila bez pievienota cukura: cepti Antonovka āboli un olu baltums, saputoti un žāvēti kārtās. 100 g un 180 g klaipi.",
    },
    zephyr: {
      name: "Zefīrs",
      title: "Belevini zefīrs — mīkstais ābolu zefīrs",
      description:
        "Belevini zefīrs: Austrumeiropas mīkstais ābolu zefīrs, gatavots no Antonovka ābolu biezeņa, olu baltuma, cukura un agara. Četri veidi, 250 g kārbās.",
    },
    "gift-sets": {
      name: "Dāvanu komplekti un kārbas",
      title: "Ābolu uzkodu dāvanu komplekti un degustācijas kārbas",
      description:
        "Rūpīgi saliktas kārbas ar ābolu batoniņiem, bezē un pastilu. Degustācijas kārbas, 12 gabalu iepakojumi un iepazīšanās komplekti bez pievienota cukura, iepakoti un nosūtīti no Rīgas.",
    },
  },
};

/** English question → translated question and answer */
export const FAQ_COPY: Partial<Record<Locale, Record<string, FaqCopy>>> = {
  ru: {
    "What is pastila?": {
      q: "Что такое пастила?",
      a: "Пастила — традиционное лакомство из печёных яблок из города Белёв, впервые появившееся в продаже в 1888 году. Яблоки запекают, протирают в пюре, взбивают с яичным белком, выкладывают тонкими слоями и медленно сушат, пока слои не схватятся в мягкий воздушный брусок. Наши батончики, меренги и десерты сделаны на этой же основе.",
    },
    "What is in an Apple Bar?": {
      q: "Что входит в состав яблочного батончика?",
      a: "Печёные яблоки антоновка (99%) и яичный белок. В «Ягодном миксе» добавлены черника и клюква, в «Корице» — корица. Это весь список: без сахара, без муки, без масел, без консервантов.",
    },
    "Is there really no added sugar?": {
      q: "Правда без добавленного сахара?",
      a: "Да — в батончиках, меренгах, десертных квадратиках и белёвской пастиле. Вся сладость идёт от самих яблок: при запекании их природная фруктоза концентрируется, поэтому батончик на вкус как десерт, хотя в нём всего около 97 ккал. Единственное исключение — зефир Belevini, традиционный рецепт с сахаром и агаром, и на упаковке это написано.",
    },
    "Is it gluten free?": {
      q: "Это без глютена?",
      a: "Да. В рецепте нет ни одного ингредиента с глютеном, мука не используется. Наша продукция производится на предприятии, где работают с яйцом; если у вас аллергия на яйцо, учтите, что яичный белок — один из основных ингредиентов.",
    },
    "Is it suitable for vegetarians, vegans, kids?": {
      q: "Подходит ли вегетарианцам, веганам, детям?",
      a: "Вегетарианцам — да. Веганам — нет, из-за яичного белка. Детям — по сути это печёное яблоко, запакованное так, чтобы выдержать школьный рюкзак, а значит удобная сладость в ланчбокс.",
    },
    "How many calories?": {
      q: "Сколько калорий?",
      a: "Около 97 ккал в яблочном батончике 35 г, около 140 ккал в батончике без муки 50 г и примерно 278 ккал в 100 г пастилы. В обычной плитке молочного шоколада 45 г — около 240 ккал.",
    },
    "How long does it keep and how should I store it?": {
      q: "Какой срок хранения и как хранить?",
      a: "12 месяцев в прохладном сухом месте, в закрытой упаковке — это про батончики, десертные квадратики и белёвскую пастилу. Меренги и зефир хранятся меньше, и верить нужно дате на упаковке. Холодильник не нужен ничему. После открытия держите упаковку закрытой и съешьте в течение нескольких дней: продукт скорее медленно подсохнет, чем испортится.",
    },
    "Where do you ship?": {
      q: "Куда вы доставляете?",
      a: "Латвия, Литва, Эстония и остальные страны Европейского союза. Заказы свыше 25 € доставляем бесплатно; если сумма меньше, доставка по Балтии стоит фиксированные 3,90 €, а тарифы курьера по остальным странам ЕС мы подтверждаем по электронной почте. Посылки уходят из Риги в течение 1–2 рабочих дней.",
    },
    "How do I pay?": {
      q: "Как оплатить?",
      a: "Онлайн-оплату мы как раз сейчас подключаем. Пока её нет, вы оставляете заявку на заказ при оформлении, а мы в течение одного рабочего дня подтверждаем её по электронной почте и присылаем защищённую ссылку на оплату.",
    },
    "Can I return something?": {
      q: "Можно ли что-то вернуть?",
      a: "Открытые продукты питания возврату не подлежат, но если посылка пришла повреждённой или с заказом что-то не так, пришлите нам фотографию в течение 48 часов — мы заменим товар или вернём деньги.",
    },
    "Where can I buy in a shop?": {
      q: "Где купить в магазине?",
      a: "В Латвии нас можно найти в Maxima и на Barbora. Мы также есть в отдельных магазинах Германии, Польши, Литвы, Австрии и Болгарии — смотрите страницу «Где купить».",
    },
    "Do you sell wholesale or private label?": {
      q: "Есть ли опт и private label?",
      a: "Да. Мы поставляем продукцию розничным сетям, кафе, офисам и дистрибьюторам по всей Европе, а для больших объёмов есть варианты private label. Напишите нам через страницу «Опт» — ответим в течение одного рабочего дня.",
    },
  },
  lv: {
    "What is pastila?": {
      q: "Kas ir pastila?",
      a: "Pastila ir tradicionāls saldums no ceptiem āboliem, kura izcelsme ir Beļovas pilsētā un ko komerciāli sāka pārdot 1888. gadā. Ābolus izcep, saberž biezenī, saputo ar olu baltumu, izklāj plānās kārtās un lēni žāvē, līdz tie sastingst mīkstā, gaisīgā klaipā. Visi mūsu batoniņi, marengas un deserti ir gatavoti no tās pašas pamatmasas.",
    },
    "What is in an Apple Bar?": {
      q: "Kas ir Ābolu batoniņā?",
      a: "Cepti Antonovka āboli (99%) un olu baltums. Ogu miksam ir pievienotas mellenes un dzērvenes; Kanēlim — kanēlis. Tas arī ir viss saraksts — bez cukura, bez miltiem, bez eļļām, bez konservantiem.",
    },
    "Is there really no added sugar?": {
      q: "Vai tiešām nav pievienota cukura?",
      a: "Jā, tas attiecas uz batoniņiem, marengām, desertu kvadrātiņiem un Beļovas pastilu. Viss saldums nāk no pašiem āboliem: cepšana koncentrē to dabīgo fruktozi, tāpēc batoniņš garšo kā deserts, lai gan tajā ir tikai ap 97 kcal. Vienīgais izņēmums ir Belevini zefīrs — tradicionāla recepte, kas gatavota ar cukuru un agaru, un uz iepakojuma tas ir norādīts.",
    },
    "Is it gluten free?": {
      q: "Vai tas ir bez glutēna?",
      a: "Jā. Neviena receptes sastāvdaļa nesatur glutēnu, un milti netiek izmantoti. Mūsu produkti tiek ražoti ražotnē, kurā tiek izmantotas olas; ja jums ir alerģija pret olu, ņemiet vērā, ka olu baltums ir viena no galvenajām sastāvdaļām.",
    },
    "Is it suitable for vegetarians, vegans, kids?": {
      q: "Vai tas ir piemērots vegetāriešiem, vegāniem, bērniem?",
      a: "Vegetāriešiem: jā. Vegāniem: nē, olu baltuma dēļ. Bērniem: pēc būtības tas ir cepts ābols, iepakots tā, lai izturētu skolas somu, un tas padara to par vienkāršu saldumu pusdienu kastītē.",
    },
    "How many calories?": {
      q: "Cik daudz kaloriju?",
      a: "Aptuveni 97 kcal vienā 35 g Ābolu batoniņā, apmēram 140 kcal vienā 50 g batoniņā bez miltiem un ap 278 kcal uz 100 g pastilas. Tipiskā 45 g piena šokolādes tāfelītē ir apmēram 240 kcal.",
    },
    "How long does it keep and how should I store it?": {
      q: "Cik ilgi tas glabājas un kā to uzglabāt?",
      a: "12 mēnešus vēsā, sausā vietā neatvērtā iepakojumā — batoniņi, desertu kvadrātiņi un Beļovas pastila. Marengas un zefīrs glabājas mazāk, un ticēt vajag datumam uz iepakojuma. Ledusskapis nav vajadzīgs nevienam no tiem. Pēc atvēršanas turiet to iesaiņotu un izbaudiet dažu dienu laikā; tas drīzāk lēni izžūs, nevis sabojāsies.",
    },
    "Where do you ship?": {
      q: "Kur jūs piegādājat?",
      a: "Latvijā, Lietuvā, Igaunijā un pārējā Eiropas Savienībā. Pasūtījumiem virs 25 € piegāde ir bez maksas; ja summa ir mazāka, Baltijā piemērojam vienotu 3,90 € maksu, bet pārējai ES kurjera tarifus apstiprinām e-pastā. Sūtījumi izbrauc no Rīgas 1–2 darba dienu laikā.",
    },
    "How do I pay?": {
      q: "Kā es varu samaksāt?",
      a: "Tiešsaistes maksājumi pašlaik tiek pieslēgti. Līdz tam jūs noformējat pasūtījuma pieteikumu, un mēs to apstiprinām e-pastā ar drošu maksājuma saiti vienas darba dienas laikā.",
    },
    "Can I return something?": {
      q: "Vai es varu kaut ko atgriezt?",
      a: "Pārtiku pēc atvēršanas atgriezt nevar, taču, ja sūtījums pienāk bojāts vai ar jūsu pasūtījumu kaut kas nav kārtībā, 48 stundu laikā atsūtiet mums fotogrāfiju, un mēs to nomainīsim vai atmaksāsim naudu.",
    },
    "Where can I buy in a shop?": {
      q: "Kur var nopirkt veikalā?",
      a: "Latvijā jūs mūs atradīsiet Maxima veikalos un Barbora e-veikalā. Mēs esam arī atsevišķos veikalos Vācijā, Polijā, Lietuvā, Austrijā un Bulgārijā — skatiet lapu „Kur nopirkt”.",
    },
    "Do you sell wholesale or private label?": {
      q: "Vai jūs pārdodat vairumtirdzniecībā vai ar privāto zīmolu?",
      a: "Jā. Mēs apgādājam mazumtirgotājus, kafejnīcas, birojus un izplatītājus visā Eiropā, bet lielākiem apjomiem piedāvājam privātā zīmola risinājumus. Atsūtiet ziņu caur lapu „Vairumtirdzniecība”, un mēs atbildēsim vienas darba dienas laikā.",
    },
  },
};
