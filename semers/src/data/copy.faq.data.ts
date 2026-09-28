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
      a: "Печёные яблоки (99%) и яичный белок. В «Ягодном миксе» добавлены чёрная смородина, клюква, брусника и черника. Это весь список. Сахар не добавлен, муки нет, батончик без глютена.",
    },
    "Is there really no added sugar?": {
      q: "Правда без добавленного сахара?",
      a: "Да — в яблочных батончиках, безе, десертах из печёных яблок и яблочных пирожных без муки. Вся сладость идёт от самих яблок: при запекании их природные сахара концентрируются. Поэтому сахар не добавлен, но в продукте есть сахара, которые естественным образом содержатся во фруктах.",
    },
    "Is it gluten free?": {
      q: "Это без глютена?",
      a: "Яблочные батончики, безе, десерты из печёных яблок по 50 г и яблочные пирожные без муки маркированы как продукты без глютена, и ни в одном из них нет муки. Яичный белок входит в состав каждого продукта, поэтому при аллергии на яйцо будьте осторожны.",
    },
    "Is it suitable for vegetarians, vegans, kids?": {
      q: "Подходит ли вегетарианцам, веганам, детям?",
      a: "Веганам — нет: в каждом продукте есть яичный белок. Для вегетарианской диеты полный состав есть на странице каждого товара: яблоки и яичный белок, а в некоторых вкусах ещё ягоды или корица. Детям — по сути это печёное яблоко в небольшой упаковке, а значит удобная сладость в ланчбокс.",
    },
    "How many calories?": {
      q: "Сколько калорий?",
      a: "На 100 г: 370 ккал в классическом безе, 360 ккал в безе «Ягодный микс», 276 ккал в десерте из печёных яблок 50 г и 320 ккал в яблочном пирожном без муки. Для всего остального ориентируйтесь на этикетку на упаковке.",
    },
    "How long does it keep and how should I store it?": {
      q: "Какой срок хранения и как хранить?",
      a: "Зависит от продукта, и верить нужно дате на упаковке. Яблочные батончики хранятся 12 месяцев в сухом прохладном месте при температуре от +8 до +21 °C. Безе и яблочные пирожные без муки хранятся 18 месяцев: безе — при температуре от +8 до +21 °C, пирожные без муки — в сухом прохладном месте при температуре от +8 до +21 °C. Десерт из печёных яблок 50 г хранится 9 месяцев при температуре от +8 до +10 °C или 4 месяца при температуре от +10 до +25 °C; упаковка 500 г — 18 месяцев при температуре от +8 до +25 °C.",
    },
    "Where do you ship?": {
      q: "Куда вы доставляете?",
      a: "По всей Европе. В Латвии, Литве и Эстонии доставляем в постаматы Omniva за 3,90 €; в остальные страны Европы — курьером, и его стоимость появится при оформлении заказа, как только будет установлена. До тех пор, если вы заказываете не из стран Балтии, напишите нам перед заказом. Заказы от 20 € доставляем бесплатно. Посылки уходят из Риги в течение 1–2 рабочих дней. Самовывоза нет.",
    },
    "How do I pay?": {
      q: "Как оплатить?",
      a: "Платежи проходят через Paysera. Пока онлайн-оплата в магазине не включена, вы оставляете заявку на заказ при оформлении, а мы в течение одного рабочего дня подтверждаем её по электронной почте и присылаем защищённую ссылку на оплату.",
    },
    "Can I return something?": {
      q: "Можно ли что-то вернуть?",
      a: "Да: неоткрытые товары в целой заводской упаковке можно вернуть в течение 14 дней после доставки, обратную пересылку оплачиваете вы. Сначала напишите нам и укажите номер заказа; возвраты отправляйте по адресу Pildas iela 10, Rīga, LV-1035. Если товар пришёл повреждённым или не тот, что вы заказывали, мы заменим его, а если попросите — вернём деньги.",
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
      a: "Cepti āboli (99%) un olu baltums. Ogu maisījumam ir pievienotas upenes, dzērvenes, brūklenes un mellenes. Tas arī ir viss saraksts. Cukurs nav pievienots, miltu nav, un batoniņš ir bez glutēna.",
    },
    "Is there really no added sugar?": {
      q: "Vai tiešām nav pievienota cukura?",
      a: "Jā, tas attiecas uz ābolu batoniņiem, bezē, cepto ābolu desertiem un ābolu kūciņām bez miltiem. Viss saldums nāk no pašiem āboliem: cepšana koncentrē to dabīgos cukurus. Tāpēc cukurs nav pievienots, taču produkts satur cukurus, kas augļos ir dabīgi.",
    },
    "Is it gluten free?": {
      q: "Vai tas ir bez glutēna?",
      a: "Ābolu batoniņi, bezē, 50 g cepto ābolu deserti un ābolu kūciņas bez miltiem ir marķēti kā produkti bez glutēna, un nevienā no tiem nav miltu. Olu baltums ir katra produkta sastāvā, tāpēc, ja jums ir alerģija pret olām, esiet uzmanīgi.",
    },
    "Is it suitable for vegetarians, vegans, kids?": {
      q: "Vai tas ir piemērots veģetāriešiem, vegāniem, bērniem?",
      a: "Vegāniem: nē, jo katrs produkts satur olu baltumu. Veģetāriešu uzturam pilns sastāvs ir katra produkta lapā: āboli un olu baltums, dažām garšām arī ogas vai kanēlis. Bērniem: pēc būtības tas ir cepts ābols uzkodas izmēra iepakojumā, un tas padara to par vienkāršu saldumu pusdienu kastītē.",
    },
    "How many calories?": {
      q: "Cik daudz kaloriju?",
      a: "Uz 100 g: 370 kcal klasiskajā bezē, 360 kcal bezē „Ogu maisījums”, 276 kcal 50 g cepto ābolu desertā un 320 kcal ābolu kūciņā bez miltiem. Visam pārējam uzticieties etiķetei uz iepakojuma.",
    },
    "How long does it keep and how should I store it?": {
      q: "Cik ilgi tas glabājas un kā to uzglabāt?",
      a: "Tas atkarīgs no produkta, un ticēt vajag datumam uz iepakojuma. Ābolu batoniņi glabājas 12 mēnešus sausā, vēsā vietā no +8 līdz +21 °C. Ābolu bezē un ābolu kūciņas bez miltiem glabājas 18 mēnešus: bezē — temperatūrā no +8 līdz +21 °C, kūciņas bez miltiem — sausā, vēsā vietā no +8 līdz +21 °C. 50 g cepto ābolu deserts glabājas 9 mēnešus no +8 līdz +10 °C vai 4 mēnešus no +10 līdz +25 °C; 500 g iepakojums — 18 mēnešus no +8 līdz +25 °C.",
    },
    "Where do you ship?": {
      q: "Kur jūs piegādājat?",
      a: "Visā Eiropā. Latvijā, Lietuvā un Igaunijā piegādājam uz Omniva pakomātiem par 3,90 €; uz pārējām Eiropas valstīm — ar kurjeru, un tā cenu redzēsiet pasūtījuma noformēšanā, tiklīdz tā būs noteikta. Līdz tam, ja pasūtāt ārpus Baltijas, pirms pasūtīšanas uzrakstiet mums. Pasūtījumiem no 20 € piegāde ir bez maksas. Sūtījumi izbrauc no Rīgas 1–2 darba dienu laikā. Saņemšanas uz vietas nav.",
    },
    "How do I pay?": {
      q: "Kā es varu samaksāt?",
      a: "Maksājumus apstrādā Paysera. Kamēr tiešsaistes maksājumi veikalā nav ieslēgti, jūs noformējat pasūtījuma pieteikumu, un mēs to vienas darba dienas laikā apstiprinām e-pastā ar drošu maksājuma saiti.",
    },
    "Can I return something?": {
      q: "Vai es varu kaut ko atgriezt?",
      a: "Jā: neatvērtas preces neskartā iepakojumā var atgriezt 14 dienu laikā pēc piegādes, un atpakaļsūtīšanu apmaksājat jūs. Vispirms uzrakstiet mums un norādiet pasūtījuma numuru; preces atgriež uz adresi Pildas iela 10, Rīga, LV-1035. Ja prece pienāk bojāta vai nav tā, ko pasūtījāt, mēs to nomainīsim vai, ja vēlaties, atmaksāsim naudu.",
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
