/**
 * Generated translations of the catalogue copy. Regenerate rather than hand-edit
 * where possible; the shapes are enforced by src/data/copy.ts.
 *
 * Every number, weight, percentage and allergen in here was checked against the
 * English before it was committed. Brand names (Semers, App'Lite, Blum Baker's,
 * Maxima, Barbora) stay in Latin script on purpose.
 *
 * The names of the foods, the ingredient lists and the storage conditions use
 * the Russian and Latvian wording of the owner's product cards, with one
 * correction applied throughout: the sugar claim is always the regulated
 * "без добавленного сахара" / "bez pievienota cukura" that the packs print,
 * never the shorter form some cards used, which claims no sugar at all.
 *
 * Only words live here. Price, weight, EAN and nutrition stay in products.ts,
 * and the override type admits no other field, so a translation cannot change a
 * fact even by accident.
 */
import type { Locale } from "~/i18n/config";
import type { CollectionCopy, ProductCopy } from "./copy";

/** slug → copy */
export const PRODUCT_COPY: Partial<
  Record<Locale, Record<string, ProductCopy>>
> = {
  ru: {
    "apple-bar-35g": {
      name: "Яблочный батончик",
      title: "Яблочный батончик App'Lite, 35 г",
      legalName: "Яблочный батончик без добавленного сахара",
      legalNameByFlavour: {
        classic: "Яблочный батончик «Классический» без добавленного сахара",
        berry: "Яблочный батончик «Ягодный микс» без добавленного сахара",
      },
      hook: "99% печёных яблок. В этом вся идея.",
      summary:
        "Батончик 35 г, в котором 99% печёных яблок. Без добавленного сахара, без муки, без глютена. «Классический» или «Ягодный микс»; хранится 12 месяцев.",
      description: [
        "Достаньте из ящика стола шоколадный батончик. Положите туда вместо него этот. Тот же момент «нужно что-то съесть прямо сейчас», но состав «Классического» читается так: печёные яблоки, яичный белок. И всё.",
        "В «Ягодный микс» добавлены чёрная смородина, клюква, брусника и черника. Оба сделаны вручную, без муки и без добавленного сахара.",
      ],
      ingredients:
        "«Классический»: печёные яблоки (99%), яичный белок. «Ягодный микс»: печёные яблоки (99%), чёрная смородина, клюква, брусника, черника, яичный белок.",
      allergens: "Содержит яйцо. Может содержать следы орехов.",
    },
    "flourless-apple-bar-50g": {
      name: "Яблочное пирожное без муки",
      title: "Яблочное пирожное без муки Blum Baker's, 50 г",
      legalName: "Яблочное пирожное без добавленного сахара",
      legalNameByFlavour: {
        cranberry: "Яблочно-клюквенное пирожное без добавленного сахара",
        cinnamon: "Яблочное пирожное с корицей без добавленного сахара",
        blueberry: "Яблочно-черничное пирожное без добавленного сахара",
      },
      hook: "Яблочное пирожное без муки и без добавленного сахара.",
      summary:
        "Пирожное без муки, 50 г, из яблок и яичного белка, без добавленного сахара. Классическое, с клюквой, с корицей или с черникой.",
      description: [
        "Яблоки и яичный белок — пирожное 50 г без муки и без добавленного сахара. В пирожных с клюквой, корицей и черникой к этому добавлен ровно один ингредиент.",
      ],
      ingredients:
        "Классическое: яблоки, яичный белок. С клюквой: яблоки, клюква, яичный белок. С корицей: яблоки, яичный белок, корица. С черникой: яблоки, черника, яичный белок.",
      allergens: "Содержит яйцо. Может содержать следы орехов.",
      storage: "Хранить в сухом прохладном месте при температуре от +8 до +21 °C.",
    },
    "apple-meringue-35g": {
      name: "Яблочное безе",
      title: "Яблочное безе App'Lite, 35 г",
      legalName: "Яблочное безе без добавленного сахара",
      legalNameByFlavour: {
        classic: "Классическое яблочное безе без добавленного сахара",
        berry: "Яблочное безе с ягодами без добавленного сахара",
      },
      hook: "Хрустящее, воздушное и без добавленного сахара.",
      summary:
        "Хрустящее безе: 99% печёных яблок и яичный белок, без добавленного сахара. 3 ккал в штучке. Классическое или «Ягодный микс», баночка 35 г.",
      description: [
        "Обычное безе — это яичный белок и горка сахара. Наше — яичный белок и печёное яблоко. Оно запекается в такой же ломкий, растворяющийся на языке хруст, только сладость идёт от яблок, а не из сахарницы. В «Ягодный микс» добавлены чёрная смородина, клюква, брусника и черника.",
        "Достаточно лёгкое, чтобы съесть целую баночку, и достаточно сытное, чтобы вам этого, скорее всего, не понадобилось. Хорошо с кофе; можно покрошить в йогурт или положить в ланчбокс вместо десерта.",
      ],
      ingredients:
        "Классическое: печёные яблоки (99%), яичный белок. «Ягодный микс»: печёные яблоки и ягоды (99%: яблоки, чёрная смородина, клюква, брусника, черника), яичный белок.",
      allergens: "Содержит яйцо.",
      storage:
        "Хранить при температуре не выше 25 °C и относительной влажности не более 75%. Не хранить рядом с продуктами с сильным запахом.",
    },
    "applite-baked-apple-dessert-50g": {
      name: "Десерт App'Lite",
      title: "Десерт из печёных яблок App'Lite, 50 г",
      legalName: "Яблочный десерт без добавленного сахара",
      legalNameByFlavour: {
        berry: "Яблочный десерт с ягодами без добавленного сахара",
        cinnamon: "Яблочный десерт с корицей без добавленного сахара",
      },
      hook: "Начинка яблочного пирога — без самого пирога.",
      summary:
        "Десерт из печёных яблок, 50 г: 99% печёных яблок, без добавленного сахара, без муки, без глютена. Классический, «Ягодный микс» или с корицей.",
      description: [
        "Пятьдесят граммов слоёного печёного яблока — для тарелки, а не для кармана.",
        "Подавайте с ложкой йогурта, крошите в кашу или нарежьте тонко на сырную доску.",
      ],
      ingredients:
        "Классический: печёные яблоки (99%), яичный белок. «Ягодный микс»: печёные яблоки и ягоды (99%: яблоки, клюква, черника, чёрная смородина, брусника), яичный белок. С корицей: печёные яблоки (99%), яичный белок, корица.",
      allergens: "Содержит яйцо. Может содержать следы орехов.",
      storage:
        "9 месяцев при температуре от +8 до +10 °C; 4 месяца при температуре от +10 до +25 °C. Относительная влажность воздуха не должна превышать 75–80%.",
    },
    "applite-baked-apple-dessert-500g": {
      name: "Классический яблочный десерт",
      title: "Классический десерт из печёных яблок App'Lite, 500 г",
      legalName: "Классический яблочный десерт без добавленного сахара",
      hook: "Полкило, каждый кусочек в своей упаковке.",
      summary:
        "Коробка 500 г классического десерта из печёных яблок, каждый кусочек упакован отдельно. Яблоки и яичный белок, без добавленного сахара.",
      description: [
        "Классический десерт в коробке 500 г, каждый кусочек в собственной упаковке. Два ингредиента: яблоки и яичный белок.",
      ],
      ingredients: "Яблоки, яичный белок.",
      allergens: "Содержит яйцо.",
      storage: "18 месяцев при хранении от +8 до +25 °C.",
    },
    "tasting-box": {
      name: "Дегустационный набор",
      title: "Дегустационный набор Semers — батончики, безе и пирожные",
      hook: "Попробуйте всё по одному разу. Потом спорьте, что лучше.",
      summary:
        "Наш стартовый набор: яблочные батончики App'Lite, яблочное безе App'Lite и пирожные без муки Blum Baker's. Доставка бесплатно.",
      description: [
        "Коробка, чтобы попробовать ассортимент: яблочные батончики App'Lite, яблочное безе App'Lite и пирожные без муки Blum Baker's.",
        "Доставка бесплатная, подарок из него получается хороший, и он закрывает вопрос, что заказать в следующий раз.",
      ],
      ingredients:
        "См. отдельные товары. Все позиции: печёные яблоки, яичный белок, фрукты или специи.",
      allergens: "Содержит яйцо. Может содержать следы орехов.",
    },
    "apple-bar-12-pack": {
      name: "Яблочный батончик, набор 12 шт.",
      title: "Яблочный батончик App'Lite, 35 г — коробка из 12 шт.",
      legalName: "Яблочные батончики без добавленного сахара",
      hook: "Ящик стола, полный правильных решений.",
      summary:
        "Двенадцать яблочных батончиков App'Lite в одной коробке: «Классический», «Ягодный микс» или пополам. Экономия 11%. 99% печёных яблок, без добавленного сахара.",
      description: [
        "Эту коробку мы отправляем в офисы, спортзалы и всем, кто постоянно находит обёртки в карманах пальто. Двенадцать яблочных батончиков по 35 г, каждый в отдельной упаковке, в коробке, которая нормально встаёт на полку.",
        "Выберите один вкус или доверьте нам сложить шесть «Классических» и шесть «Ягодный микс».",
      ],
      ingredients:
        "«Классический»: печёные яблоки (99%), яичный белок. «Ягодный микс»: печёные яблоки (99%), чёрная смородина, клюква, брусника, черника, яичный белок.",
      allergens: "Содержит яйцо. Может содержать следы орехов.",
    },
  },
  lv: {
    "apple-bar-35g": {
      name: "Ābolu batoniņš",
      title: "App'Lite ābolu batoniņš, 35 g",
      legalName: "Ābolu batoniņš bez pievienota cukura",
      legalNameByFlavour: {
        classic: "«Ābolu» batoniņš bez pievienota cukura",
        berry: "«Ogu maisījums» ābolu batoniņš bez pievienota cukura",
      },
      hook: "99 % ceptu ābolu. Tāda ir visa doma.",
      summary:
        "35 g batoniņš, kurā ir 99 % ceptu ābolu. Bez pievienota cukura, bez miltiem, bez glutēna. Klasiskais vai «Ogu maisījums»; glabājas 12 mēnešus.",
      description: [
        'Izņemiet no atvilktnes šokolādes batoniņu. Ielieciet tā vietā šo. Tas pats „man kaut ko vajag tagad" mirklis, tikai Klasiskā batoniņa sastāvdaļu sarakstā rakstīts: cepti āboli, olu baltums. Un viss.',
        "«Ogu maisījumam» pievienotas upenes, dzērvenes, brūklenes un mellenes. Abi ir gatavoti ar rokām, bez miltiem un bez pievienota cukura.",
      ],
      ingredients:
        "Klasiskais: cepti āboli (99 %), olu baltums. «Ogu maisījums»: cepti āboli (99 %), upenes, dzērvenes, brūklenes, mellenes, olu baltums.",
      allergens: "Satur olas. Var saturēt riekstu pēdas.",
    },
    "flourless-apple-bar-50g": {
      name: "Ābolu kūciņa bez miltiem",
      title: "Blum Baker's ābolu kūciņa bez miltiem, 50 g",
      legalName: "Ābolu kūciņa bez pievienota cukura",
      legalNameByFlavour: {
        cranberry: "Ābolu un dzērveņu kūciņa bez pievienota cukura",
        cinnamon: "Ābolu kūciņa ar kanēli bez pievienota cukura",
        blueberry: "Ābolu un melleņu kūciņa bez pievienota cukura",
      },
      hook: "Ābolu kūciņa bez miltiem un bez pievienota cukura.",
      summary:
        "50 g ābolu kūciņa bez miltiem no āboliem un olu baltuma, bez pievienota cukura. Klasiskā, ar dzērvenēm, ar kanēli vai ar mellenēm.",
      description: [
        "Āboli un olu baltums — 50 g kūciņa bez miltiem un bez pievienota cukura. Kūciņām ar dzērvenēm, kanēli un mellenēm tam pievienota tieši viena sastāvdaļa.",
      ],
      ingredients:
        "Klasiskā: āboli, olu baltums. Ar dzērvenēm: āboli, dzērvenes, olu baltums. Ar kanēli: āboli, olu baltums, kanēlis. Ar mellenēm: āboli, mellenes, olu baltums.",
      allergens: "Satur olas. Var saturēt riekstu pēdas.",
      storage: "Uzglabāt sausā, vēsā vietā no +8 līdz +21 °C.",
    },
    "apple-meringue-35g": {
      name: "Ābolu bezē",
      title: "App'Lite ābolu bezē, 35 g",
      legalName: "Ābolu bezē bez pievienota cukura",
      legalNameByFlavour: {
        classic: "Klasisks ābolu bezē bez pievienota cukura",
        berry: "Ābolu bezē ar ogām bez pievienota cukura",
      },
      hook: "Kraukšķīgs, gaisīgs un bez pievienota cukura.",
      summary:
        "Kraukšķīgs bezē: 99 % ceptu ābolu un olu baltums, bez pievienota cukura. 3 kcal vienā gabaliņā. Klasiskais vai «Ogu maisījums», 35 g trauciņā.",
      description: [
        "Bezē parasti ir olu baltums un kalns cukura. Mūsu bezē ir olu baltums un cepts ābols. Tā izcepas tikpat plaisājoši kraukšķīga un mutē kūstoša — tikai saldums nāk no āboliem, nevis no cukurtrauka. «Ogu maisījumam» pievienotas upenes, dzērvenes, brūklenes un mellenes.",
        'Tik viegls, ka var apēst visu trauciņu, un tik sātīgs, ka droši vien nevajadzēs. Lieliski der kafijai, sadrupināts pār jogurtu vai kā „deserts" pusdienu kārbiņā.',
      ],
      ingredients:
        "Klasiskais: cepti āboli (99 %), olu baltums. «Ogu maisījums»: cepti āboli un ogas (99 %: āboli, upenes, dzērvenes, brūklenes, mellenes), olu baltums.",
      allergens: "Satur olas.",
      storage:
        "Uzglabāt temperatūrā līdz 25 °C un relatīvajā gaisa mitrumā līdz 75%. Neglabāt blakus produktiem ar spēcīgu smaržu.",
    },
    "applite-baked-apple-dessert-50g": {
      name: "App'Lite deserts",
      title: "App'Lite cepta ābola deserts, 50 g",
      legalName: "Ābolu deserts bez pievienota cukura",
      legalNameByFlavour: {
        berry: "Ābolu deserts ar ogām bez pievienota cukura",
        cinnamon: "Ābolu deserts ar kanēli bez pievienota cukura",
      },
      hook: "Ābolu pīrāga pildījums bez pīrāga.",
      summary:
        "50 g cepta ābola deserts: 99 % ceptu ābolu, bez pievienota cukura, bez miltiem, bez glutēna. Klasiskais, «Ogu maisījums» vai ar kanēli.",
      description: [
        "Piecdesmit grami kārtaina cepta ābola, domāti šķīvim, nevis kabatai.",
        "Pasniedziet to ar karoti jogurta, sadrupiniet pār putru vai sagrieziet plānās šķēlēs siera platei.",
      ],
      ingredients:
        "Klasiskais: cepti āboli (99 %), olu baltums. «Ogu maisījums»: cepti āboli un ogas (99 %: āboli, dzērvenes, mellenes, upenes, brūklenes), olu baltums. Ar kanēli: cepti āboli (99 %), olu baltums, kanēlis.",
      allergens: "Satur olas. Var saturēt riekstu pēdas.",
      storage:
        "9 mēneši, uzglabājot no +8 līdz +10 °C; 4 mēneši, uzglabājot no +10 līdz +25 °C. Relatīvais gaisa mitrums nedrīkst pārsniegt 75–80%.",
    },
    "applite-baked-apple-dessert-500g": {
      name: "Klasiskais ābolu deserts",
      title: "App'Lite klasiskais cepta ābola deserts, 500 g",
      legalName: "Klasisks ābolu deserts bez pievienota cukura",
      hook: "Puskilograms, katrs gabaliņš iepakots atsevišķi.",
      summary:
        "500 g kaste klasiskā cepta ābola deserta, katrs gabaliņš iepakots atsevišķi. Āboli un olu baltums, bez pievienota cukura.",
      description: [
        "Klasiskais deserts 500 g kastē, katrs gabaliņš savā iepakojumā. Divas sastāvdaļas: āboli un olu baltums.",
      ],
      ingredients: "Āboli, olu baltums.",
      allergens: "Satur olas.",
      storage: "18 mēneši, uzglabājot no +8 līdz +25 °C.",
    },
    "tasting-box": {
      name: "Degustācijas kaste",
      title: "Semers degustācijas kaste — batoniņi, bezē un kūciņas",
      hook: "Nogaršojiet visu vienu reizi. Pēc tam strīdieties par mīļāko.",
      summary:
        "Mūsu iesācēja kaste: App'Lite ābolu batoniņi, App'Lite ābolu bezē un Blum Baker's kūciņas bez miltiem. Bezmaksas piegāde.",
      description: [
        "Kaste, lai nogaršotu mūsu klāstu: App'Lite ābolu batoniņi, App'Lite ābolu bezē un Blum Baker's kūciņas bez miltiem.",
        "Piegāde ir bez maksas, dāvanai der lieliski, un tā atrisina jautājumu, ko pasūtīt vēlreiz.",
      ],
      ingredients:
        "Skatiet atsevišķos produktus. Visos produktos: cepti āboli, olu baltums, augļi vai garšvielas.",
      allergens: "Satur olas. Var saturēt riekstu pēdas.",
    },
    "apple-bar-12-pack": {
      name: "Ābolu batoniņi, 12 gab. iepakojums",
      title: "App'Lite ābolu batoniņi 35 g — kaste ar 12 gabaliem",
      legalName: "Ābolu batoniņi bez pievienota cukura",
      hook: "Atvilktne, pilna ar labiem lēmumiem.",
      summary:
        "Divpadsmit App’Lite ābolu batoniņi vienā kastē: Klasiskie, «Ogu maisījums» vai puse uz pusi. Ietaupa 11 %. 99 % ceptu ābolu, bez pievienota cukura.",
      description: [
        "Šo kasti mēs sūtām uz birojiem, sporta zālēm un ikvienam, kas mēteļa kabatās nemitīgi atrod papīriņus. Divpadsmit 35 g ābolu batoniņi, katrs atsevišķi iepakots, plauktam ērtā kastē.",
        "Izvēlieties vienu garšu vai ļaujiet mums salikt sešus Klasiskos un sešus ar ogu maisījumu.",
      ],
      ingredients:
        "Klasiskais: cepti āboli (99 %), olu baltums. «Ogu maisījums»: cepti āboli (99 %), upenes, dzērvenes, brūklenes, mellenes, olu baltums.",
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
        "Яблочные батончики App'Lite: снек 35 г, в котором 99% печёных яблок. Без добавленного сахара, без муки, без глютена. «Классический» и «Ягодный микс».",
    },
    "flourless-bars": {
      name: "Яблочные пирожные без муки",
      title:
        "Яблочные пирожные Blum Baker's, 50 г — без муки, без добавленного сахара",
      description:
        "Яблочные пирожные без муки Blum Baker's, 50 г: яблоки и яичный белок, без муки и без добавленного сахара. Классическое, с корицей, с черникой и с клюквой.",
    },
    meringues: {
      name: "Яблочное безе",
      title: "Яблочное безе App'Lite — хрустящее, без добавленного сахара",
      description:
        "Хрустящее безе App'Lite: 99% печёных яблок и яичный белок, без добавленного сахара. Классическое и «Ягодный микс», баночка 35 г.",
    },
    applite: {
      name: "Десерт App'Lite",
      title: "Десерт из печёных яблок App'Lite — без добавленного сахара",
      description:
        "Десерт из печёных яблок App'Lite без добавленного сахара: упаковки по 50 г — классический, «Ягодный микс» и с корицей — и коробка 500 г классического.",
    },
    "gift-sets": {
      name: "Подарочные наборы и боксы",
      title: "Подарочные наборы и дегустационные боксы с яблочными снеками",
      description:
        "Наборы яблочных батончиков, безе и пирожных без муки: дегустационный набор и коробка из 12 яблочных батончиков. Без добавленного сахара, из Риги.",
    },
  },
  lv: {
    "apple-bars": {
      name: "Ābolu batoniņi",
      title: "Ābolu batoniņi — 99% ceptu ābolu, bez pievienota cukura",
      description:
        "App'Lite ābolu batoniņi: 35 g uzkoda, kurā ir 99% ceptu ābolu. Bez pievienota cukura, bez miltiem, bez glutēna. Klasiskais un «Ogu maisījums».",
    },
    "flourless-bars": {
      name: "Ābolu kūciņas bez miltiem",
      title:
        "Blum Baker's ābolu kūciņas, 50 g — bez miltiem, bez pievienota cukura",
      description:
        "Blum Baker's ābolu kūciņas bez miltiem, 50 g: āboli un olu baltums, bez miltiem un bez pievienota cukura. Klasiskā, ar kanēli, ar mellenēm un ar dzērvenēm.",
    },
    meringues: {
      name: "Ābolu bezē",
      title: "App'Lite ābolu bezē — kraukšķīgs, bez pievienota cukura",
      description:
        "App'Lite kraukšķīgs bezē: 99% ceptu ābolu un olu baltums, bez pievienota cukura. Klasiskais un «Ogu maisījums», 35 g trauciņā.",
    },
    applite: {
      name: "App'Lite deserts",
      title: "App'Lite ceptu ābolu deserts — bez pievienota cukura",
      description:
        "App'Lite ceptu ābolu deserts bez pievienota cukura: 50 g iepakojumi — Klasiskais, «Ogu maisījums» un ar kanēli — un 500 g kaste Klasiskā.",
    },
    "gift-sets": {
      name: "Dāvanu komplekti un kārbas",
      title: "Ābolu uzkodu dāvanu komplekti un degustācijas kārbas",
      description:
        "Kastes ar ābolu batoniņiem, bezē un kūciņām bez miltiem: degustācijas kaste un 12 ābolu batoniņu kaste. Bez pievienota cukura, no Rīgas.",
    },
  },
};

/** English question → translated question and answer */
