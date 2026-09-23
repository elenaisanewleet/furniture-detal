/**
 * Translated FAQ copy. Split out of copy.data.ts so the catalogue translations
 * and the FAQ translations can be edited independently; the shape is still
 * enforced by src/data/copy.ts.
 */
import type { Locale } from "~/i18n/config";
import type { FaqCopy } from "./copy";

export const FAQ_COPY: Partial<Record<Locale, Record<string, FaqCopy>>> = {
  ru: {
    "What is pastila?": {
      q: "Что такое пастила?",
      a: "Пастила — традиционное лакомство из печёных яблок. Яблоки запекают, протирают в пюре, взбивают с яичным белком, выкладывают тонкими слоями и медленно сушат, пока слои не схватятся в мягкий воздушный брусок. Наши батончики, меренги и десерты сделаны на этой же основе.",
    },
    "What is in an Apple Bar?": {
      q: "Что входит в состав яблочного батончика?",
      a: "Печёные яблоки (99%) и яичный белок. В «Ягодном миксе» добавлены чёрная смородина, клюква, брусника и черника. Это весь список: без добавленного сахара, без муки, без масел, без консервантов.",
    },
    "Is there really no added sugar?": {
      q: "Правда без добавленного сахара?",
      a: "Да — в яблочных батончиках, безе, десертах из печёных яблок и яблочных пирожных без муки. Вся сладость идёт от самих яблок: при запекании их природные сахара концентрируются. Поэтому на упаковке написано и «без добавленного сахара», и «содержит природные сахара».",
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
      a: "На 100 г: 370 ккал в классическом безе, 360 ккал в безе «Ягодный микс», 276 ккал в десерте из печёных яблок 50 г и 320 ккал в яблочном пирожном без муки. Для всего остального ориентируйтесь на этикетку на упаковке.",
    },
    "How long does it keep and how should I store it?": {
      q: "Какой срок хранения и как хранить?",
      a: "Зависит от продукта, и верить нужно дате на упаковке. Яблочные батончики хранятся 12 месяцев. Десерт из печёных яблок 50 г хранится 9 месяцев при температуре от +8 до +10 °C или 4 месяца при температуре от +10 до +25 °C; упаковка 500 г — 18 месяцев при температуре от +8 до +25 °C. Безе храните при температуре не выше 25 °C, вдали от продуктов с сильным запахом, а яблочные пирожные без муки — в сухом прохладном месте при температуре от +8 до +21 °C. После открытия держите упаковку закрытой и съешьте в течение нескольких дней: продукт скорее медленно подсохнет, чем испортится.",
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
      a: "Pastila ir tradicionāls saldums no ceptiem āboliem. Ābolus izcep, saberž biezenī, saputo ar olu baltumu, izklāj plānās kārtās un lēni žāvē, līdz tie sastingst mīkstā, gaisīgā klaipā. Visi mūsu batoniņi, marengas un deserti ir gatavoti no tās pašas pamatmasas.",
    },
    "What is in an Apple Bar?": {
      q: "Kas ir Ābolu batoniņā?",
      a: "Cepti āboli (99%) un olu baltums. Ogu maisījumam ir pievienotas upenes, dzērvenes, brūklenes un mellenes. Tas arī ir viss saraksts — bez pievienota cukura, bez miltiem, bez eļļām, bez konservantiem.",
    },
    "Is there really no added sugar?": {
      q: "Vai tiešām nav pievienota cukura?",
      a: "Jā, tas attiecas uz ābolu batoniņiem, bezē, cepto ābolu desertiem un ābolu kūciņām bez miltiem. Viss saldums nāk no pašiem āboliem: cepšana koncentrē to dabīgos cukurus. Tāpēc uz iepakojuma ir rakstīts gan „bez pievienota cukura”, gan „satur dabīgi sastopamus cukurus”.",
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
      a: "Uz 100 g: 370 kcal klasiskajā bezē, 360 kcal bezē „Ogu maisījums”, 276 kcal 50 g cepto ābolu desertā un 320 kcal ābolu kūciņā bez miltiem. Visam pārējam uzticieties etiķetei uz iepakojuma.",
    },
    "How long does it keep and how should I store it?": {
      q: "Cik ilgi tas glabājas un kā to uzglabāt?",
      a: "Tas atkarīgs no produkta, un ticēt vajag datumam uz iepakojuma. Ābolu batoniņi glabājas 12 mēnešus. 50 g cepto ābolu deserts glabājas 9 mēnešus no +8 līdz +10 °C vai 4 mēnešus no +10 līdz +25 °C; 500 g iepakojums — 18 mēnešus no +8 līdz +25 °C. Bezē uzglabājiet temperatūrā līdz 25 °C, ne blakus produktiem ar spēcīgu smaržu, bet ābolu kūciņas bez miltiem — sausā, vēsā vietā no +8 līdz +21 °C. Pēc atvēršanas turiet to iesaiņotu un izbaudiet dažu dienu laikā; tas drīzāk lēni izžūs, nevis sabojāsies.",
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
