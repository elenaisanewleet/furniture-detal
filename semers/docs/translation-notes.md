# Translation notes

Questions the translators raised while putting the Semers pages into Russian
and Latvian. They are recorded rather than resolved: each one is a choice
someone with the business — or, for the legal pages, a lawyer — should confirm.

Nothing here is a known error. Every number, date, deadline and allergen
statement was checked against the English before the translation was
committed, and none differ. These are the places where two defensible
renderings exist and one was picked.

**To change any of these**, edit the value in `src/i18n/prose.ru.json` or
`src/i18n/prose.lv.json` — the files are keyed by the English sentence, so the
"English" line below is the key to search for. Then rebuild.

375 notes.

### Russian — privacy

**English:** A privacy policy

**Russian:** Политика конфиденциальности,

Added a comma at the end of this fragment («Политика конфиденциальности,») because Russian grammar requires it before the subordinate clause in i=3 («которую…»). The English fragment has no punctuation. If the two fragments are rendered on separate lines with no visual join, the comma can be dropped.

---

**English:** Who is responsible

**Russian:** Кто несёт ответственность

Heading «Who is responsible» rendered as «Кто несёт ответственность». If the heading is meant to name the GDPR controller specifically, «Кто отвечает за ваши данные» may be clearer to a reader.

---

**English:** The controller of your personal data is

**Russian:** Контролёром ваших персональных данных является

TERM CHOICE: GDPR 'controller' translated as «контролёр» (the wording used in Russian-language GDPR commentary and EU materials). Russian domestic law (152-ФЗ) uses «оператор персональных данных», which a Russian reader may find more familiar but which is a different legal regime. Confirm which the lawyer prefers; the same choice is used at i=60.

---

**English:** . We are a small company and do not have a separate data protection officer; write to the same address and the person who runs the shop will answer.

**Russian:** . Мы небольшая компания, и у нас нет отдельного специалиста по защите данных; напишите на тот же адрес, и вам ответит человек, который ведёт магазин.

'data protection officer' rendered as «специалист по защите данных» (DPO). Some Russian texts use «должностное лицо по защите данных» or keep «DPO». Flagging for consistency across the site.

---

**English:** Your name, e-mail address, phone number (optional, for the courier), delivery address or parcel locker, country, the items and quantities in your box, any gift message or note, and whether you ticked the newsletter box. We use this to check stock, send you a confirmation with a payment link, deliver the parcel, answer questions about the order, and keep the accounting records the law requires.

**Russian:** Ваше имя, адрес электронной почты, номер телефона (по желанию, для курьера), адрес доставки или постамат, страну, товары и их количество в вашей коробке, поздравительное сообщение или примечание, если они есть, а также отметку о подписке на рассылку, если вы её поставили. Мы используем эти данные, чтобы проверить наличие товара, отправить вам подтверждение со ссылкой на оплату, доставить посылку, ответить на вопросы о заказе и вести бухгалтерские записи, которых требует закон.

'parcel locker' rendered as «постамат». In the Baltics «пакомат» (Omniva's own Russian wording) is also widespread. Same word reused at i=58 («коды от постамата»). Please align with whatever the shipping page uses.

---

**English:** performance of a contract with you, including the steps before it, under Article 6(1)(b); and compliance with our legal obligations under Article 6(1)(c) for the invoicing and accounting side.

**Russian:** исполнение договора с вами, включая действия, предшествующие его заключению, согласно статье 6(1)(b); и соблюдение наших юридических обязанностей согласно статье 6(1)(c) в части выставления счетов и бухгалтерского учёта.

Article citations kept in the English numeric form (статья 6(1)(b), 6(1)(c), 6(1)(a), 6(1)(f)) rather than expanded to «подпункт (b) пункта 1 статьи 6». This keeps the numbers identical and traceable; expanding them is possible if house style requires, with no change of meaning.

---

**English:** When online card payment goes live, you will enter card details on the payment provider’s pages, not on ours. We receive a confirmation that payment succeeded and a reference, never your full card number.

**Russian:** Когда заработает онлайн-оплата картой, вы будете вводить данные карты на страницах поставщика платёжных услуг, а не на наших. Мы получаем подтверждение об успешном платеже и идентификатор операции, но никогда — полный номер вашей карты.

'a reference' rendered as «идентификатор операции» (a transaction reference). Alternatives: «референс платежа», «номер операции». No number involved.

---

**English:** , the

**Russian:** ,

The English fragment is «, the» — a pure connective before the second link. Russian needs no article, so it is returned as a bare comma «,». Check that the surrounding markup still reads «Через контактную форму, оптовую форму или обычное электронное письмо…» when the fragments are joined.

---

**English:** wholesale form

**Russian:** оптовую форму

'wholesale form' rendered as «оптовую форму» in the accusative so it fits after «Через» in i=33. If this string is reused elsewhere as a standalone label, it would need the nominative «оптовая форма» — please check for reuse.

---

**English:** We do not run analytics at the moment. If we add it, we will use a cookieless, privacy-friendly tool that counts page views in aggregate without identifying you, and we will update this section.

**Russian:** Сейчас мы не используем аналитику. Если мы её добавим, это будет инструмент без файлов cookie, бережно относящийся к приватности, который считает просмотры страниц в совокупности, не идентифицируя вас, и мы обновим этот раздел.

'privacy-friendly' rendered as «бережно относящийся к приватности». A tighter alternative is «щадящий приватность» or «уважающий приватность»; no legal content is affected.

---

**English:** Some of the providers above run their infrastructure outside the European Economic Area, mainly in the United States. Where that happens we rely on the safeguards the GDPR allows: an adequacy decision of the European Commission, such as the EU–US Data Privacy Framework for certified companies, or the Commission’s standard contractual clauses together with any additional measures needed. Ask us if you would like details of the safeguards used for a specific provider.

**Russian:** Некоторые из перечисленных выше поставщиков услуг размещают свою инфраструктуру за пределами Европейской экономической зоны, в основном в Соединённых Штатах. В таких случаях мы опираемся на гарантии, допускаемые GDPR: решение Европейской комиссии об адекватном уровне защиты, например EU–US Data Privacy Framework для сертифицированных компаний, либо стандартные договорные положения Комиссии вместе с любыми необходимыми дополнительными мерами. Напишите нам, если хотите узнать подробности о гарантиях, применяемых к конкретному поставщику.

'standard contractual clauses' rendered as «стандартные договорные положения». «Стандартные договорные условия» is equally current in Russian GDPR texts. 'EU–US Data Privacy Framework' left in English, as it is the official name of the framework and a reader needs it to find the adequacy decision. 'adequacy decision' rendered by its full descriptive Russian equivalent «решение… об адекватном уровне защиты».

---

**English:** Five years after the end of the financial year in which you ordered, as Latvian accounting law requires.

**Russian:** Пять лет после окончания финансового года, в котором вы сделали заказ, как того требует латвийский закон о бухгалтерском учёте.

'financial year' rendered as «финансового года». Latvian accounting law calls it 'pārskata gads' (reporting year), often «отчётный год» in Russian. The five-year period is unchanged.

---

**English:** Under the GDPR you can ask us, at any time, to:

**Russian:** Согласно GDPR вы можете в любой момент обратиться к нам, чтобы:

Restructured from «ask us to:» into «обратиться к нам, чтобы:» so the infinitive list items (i=83, 85, 87, 89, 91, 93, 95) are grammatical in Russian. The obligation and the list of rights are unchanged.

---

**English:** to processing based on legitimate interest, and to direct marketing at any time, no reason needed.

**Russian:** против обработки, основанной на законном интересе, и против прямого маркетинга — в любой момент и без объяснения причин.

Added a dash before «в любой момент и без объяснения причин» for readability; the scope is unchanged — the objection right applies to processing based on legitimate interest and, at any time and without a reason, to direct marketing.

---

**English:** If you think we have handled your data wrongly, we would like to hear it from you first. You also have the right to complain to a supervisory authority. For us that is the Data State Inspectorate of Latvia (

**Russian:** Если вы считаете, что мы неправильно обошлись с вашими данными, мы хотели бы сначала услышать об этом от вас. Вы также имеете право подать жалобу в надзорный орган. Для нас это Государственная инспекция данных Латвии — Datu valsts inspekcija (

ADDITION: the Latvian original name «Datu valsts inspekcija» was inserted alongside the Russian «Государственная инспекция данных Латвии», because the Russian name alone will not let a reader find the authority. The parenthesis still contains only the URL, so the surrounding markup ( i=100, i=101 ) is unaffected. Remove if the addition is unwanted.

---

**English:** Our hosting platform, or a future payment provider during checkout, may set a cookie that is essential for security or to complete a payment. Such cookies need no consent under the ePrivacy rules. We will list them here if and when they appear.

**Russian:** Наша хостинг-платформа или будущий поставщик платёжных услуг при оформлении заказа могут установить файл cookie, необходимый для безопасности или для завершения платежа. Такие файлы cookie не требуют согласия согласно правилам ePrivacy. Мы перечислим их здесь, если и когда они появятся.

'ePrivacy rules' left as «правилам ePrivacy» — the Directive has no settled short Russian name and the English label is what a reader needs to find it. Could be expanded to «правилам Директивы ePrivacy (2002/58/EC)» if the lawyer wants the citation, but the English does not give a number and I did not add one.

---

**English:** Apple bars, meringues and Belyov pastila, shipped from Riga across the EU. Free shipping over €25.

**Russian:** Яблочные батончики, безе и белёвская пастила с доставкой из Риги по всему ЕС. Бесплатная доставка при заказе от 25 €.

Price kept as the same amount but written in Russian typographic order: «25 €» instead of «€25». Number unchanged. Say if the euro sign must stay before the figure. Also: 'Belyov pastila' rendered as «белёвская пастила», the standard Russian name of the product (from the town Белёв).

---

**English:** and the

**Russian:** и

«and the» rendered as «и»; Russian has no article and the following link label will carry its own case. Please verify the joined sentence reads correctly once the link text is in place, since I could not see the linked labels in this batch.

---

### Latvian — privacy

**English:** This privacy policy explains what SIA Semers Group collects when you order apple bars and pastila from semers.org, write to us or subscribe to our e-mails: why we collect it, how long we keep it, and the rights the GDPR gives you.

**Latvian:** Šī privātuma politika skaidro, kādus datus SIA Semers Group vāc, kad jūs pasūtāt ābolu batoniņus un pastilu vietnē semers.org, rakstāt mums vai abonējat mūsu e-pasta vēstules: kāpēc mēs tos vācam, cik ilgi tos glabājam un kādas tiesības jums piešķir VDAR.

GDPR is rendered throughout as VDAR (Vispārīgā datu aizsardzības regula), the settled Latvian term used in law and in every Latvian privacy notice. The English source never spells out "Regulation (EU) 2016/679", so I did not add it. If the lawyer wants maximum findability, the first mention here could be expanded to "VDAR (Vispārīgā datu aizsardzības regula, Regula (ES) 2016/679)" — please confirm.

---

**English:** A privacy policy

**Latvian:** Privātuma politika,

Fragments 2+3 form one headline ("A privacy policy you can actually read."). Latvian grammar requires a comma before the subordinate clause, so I placed it at the end of fragment 2 ("Privātuma politika," / "kuru tiešām var izlasīt."). This is the one place I added punctuation the English does not have; it cannot be avoided without rewriting the headline.

---

**English:** contact form

**Latvian:** saziņas formu

Link labels "contact form" (34) and "wholesale form" (36) are inside the sentence that starts with fragment 33 "Through the" → "Izmantojot", which governs the accusative. I therefore used accusative forms ("saziņas formu", "vairumtirdzniecības formu"). If these same strings are reused anywhere as a standalone label or button, they will need the nominative "saziņas forma" / "vairumtirdzniecības forma" instead — please check reuse.

---

**English:** , the

**Latvian:** ,

Fragment 35 ", the" has no Latvian equivalent inside this list; it becomes a bare comma ",". Fragment 112 "and the" likewise becomes just "un". Check the surrounding markup renders spacing correctly (I did not add leading/trailing spaces).

---

**English:** performance of a contract with you, including the steps before it, under Article 6(1)(b); and compliance with our legal obligations under Article 6(1)(c) for the invoicing and accounting side.

**Latvian:** līguma ar jums izpilde, tostarp pasākumi pirms līguma noslēgšanas, saskaņā ar 6. panta 1. punkta b) apakšpunktu; un mūsu juridisko pienākumu izpilde saskaņā ar 6. panta 1. punkta c) apakšpunktu attiecībā uz rēķinu izrakstīšanu un grāmatvedību.

GDPR article citations use the official Latvian form: "6. panta 1. punkta b) apakšpunkts" for Article 6(1)(b), and likewise (a), (c), (f) at i=38, 41, 45. Article numbers and letters are unchanged.

---

**English:** . We are a small company and do not have a separate data protection officer; write to the same address and the person who runs the shop will answer.

**Latvian:** . Mēs esam neliels uzņēmums, un mums nav atsevišķa datu aizsardzības speciālista; rakstiet uz to pašu adresi, un jums atbildēs cilvēks, kas vada veikalu.

"data protection officer" → "datu aizsardzības speciālists", the term used in the Latvian text of the GDPR (not the literal "datu aizsardzības virsnieks").

---

**English:** Five years after the end of the financial year in which you ordered, as Latvian accounting law requires.

**Latvian:** Piecus gadus pēc tā finanšu gada beigām, kurā veicāt pasūtījumu, kā to prasa Latvijas grāmatvedības normatīvie akti.

"Latvian accounting law" → "Latvijas grāmatvedības normatīvie akti" (generic), because the English is generic. If the intention is the specific statute, this should read "Grāmatvedības likums". Retention "Five years" is kept as "Piecus gadus" (spelled out, as in the English).

---

**English:** No advertising trackers, no social media pixels, no retargeting.

**Latvian:** Nekādu reklāmas izsekotāju, nekādu sociālo tīklu pikseļu, nekādas atkārtotas mērķēšanas.

"retargeting" → "atkārtota mērķēšana". Latvian marketing copy often keeps the English "retargeting" in brackets; I did not add it, to avoid inserting words. Flagging in case the client prefers "atkārtotas mērķēšanas (retargeting)".

---

**English:** Parcel carriers.

**Latvian:** Sūtījumu pārvadātāji.

"Parcel carriers" → "Sūtījumu pārvadātāji"; "parcel locker" → "pakomāts" (i=27, 58), the standard Latvian term.

---

**English:** Your name, address, phone number and e-mail go to the carrier that delivers your parcel, for example Omniva, DPD or DHL depending on where you live, so they can deliver it and send you locker codes or delivery notices. Carriers also process this data under their own privacy policies.

**Latvian:** Jūsu vārds, adrese, tālruņa numurs un e-pasta adrese tiek nodoti pārvadātājam, kas piegādā jūsu sūtījumu, piemēram, Omniva, DPD vai DHL, atkarībā no jūsu dzīvesvietas, lai tas varētu sūtījumu piegādāt un nosūtīt jums pakomāta kodus vai paziņojumus par piegādi. Pārvadātāji šos datus apstrādā arī saskaņā ar savām privātuma politikām.

The English names DHL here, which is not in the approved brand list (Omniva, DPD, Venipak). I kept DHL exactly as written because the English governs, but the reviewer may want to check whether Venipak was intended.

---

**English:** Some of the providers above run their infrastructure outside the European Economic Area, mainly in the United States. Where that happens we rely on the safeguards the GDPR allows: an adequacy decision of the European Commission, such as the EU–US Data Privacy Framework for certified companies, or the Commission’s standard contractual clauses together with any additional measures needed. Ask us if you would like details of the safeguards used for a specific provider.

**Latvian:** Daži no iepriekš minētajiem pakalpojumu sniedzējiem uztur savu infrastruktūru ārpus Eiropas Ekonomikas zonas, galvenokārt Amerikas Savienotajās Valstīs. Šādos gadījumos mēs paļaujamies uz garantijām, ko pieļauj VDAR: Eiropas Komisijas lēmumu par aizsardzības līmeņa pietiekamību, piemēram, ES–ASV datu privātuma regulējumu (EU–US Data Privacy Framework) attiecībā uz sertificētiem uzņēmumiem, vai Komisijas standarta līguma klauzulām kopā ar visiem nepieciešamajiem papildu pasākumiem. Jautājiet mums, ja vēlaties uzzināt sīkāku informāciju par konkrētam pakalpojumu sniedzējam izmantotajām garantijām.

Legal terms: "adequacy decision" → "lēmums par aizsardzības līmeņa pietiekamību"; "standard contractual clauses" → "standarta līguma klauzulas". I kept the English name "EU–US Data Privacy Framework" in brackets after the Latvian rendering so a reader can find the source instrument; remove the bracket if the client prefers no English.

---

**English:** to processing based on legitimate interest, and to direct marketing at any time, no reason needed.

**Latvian:** pret apstrādi, kas pamatota ar leģitīmajām interesēm, un jebkurā brīdī pret tiešo tirgvedību, nenorādot iemeslu.

"direct marketing" → "tiešā tirgvedība", the term used in the Latvian GDPR text (Art. 21(2)). "legitimate interest" is rendered as "leģitīmās intereses" (plural), as required.

---

**English:** If you think we have handled your data wrongly, we would like to hear it from you first. You also have the right to complain to a supervisory authority. For us that is the Data State Inspectorate of Latvia (

**Latvian:** Ja uzskatāt, ka esam nepareizi rīkojušies ar jūsu datiem, mēs vēlētos to vispirms dzirdēt no jums. Jums ir arī tiesības iesniegt sūdzību uzraudzības iestādei. Mūsu gadījumā tā ir Latvijas Datu valsts inspekcija (

"the Data State Inspectorate of Latvia" → "Latvijas Datu valsts inspekcija". The authority's own official name is simply "Datu valsts inspekcija"; I kept "Latvijas" because the English has it and it helps a non-Latvian reader. The URL dvi.gov.lv is unchanged.

---

**English:** Strictly necessary storage.

**Latvian:** Obligāti nepieciešamā krātuve.

"Strictly necessary storage" → "Obligāti nepieciešamā krātuve". Note the English heading says "storage" while the ePrivacy term of art ("strictly necessary cookies" = "obligāti nepieciešamās sīkdatnes") is about cookies; I translated the heading as written rather than correcting it.

---

**English:** The site is served over HTTPS. Order data travels encrypted to our providers, access to our inbox and tools is limited to the people who need it, and we hold no card data at all. No system is perfectly secure. If a breach ever affects your data, we will tell you and the supervisory authority as the GDPR requires.

**Latvian:** Vietne tiek nodrošināta, izmantojot HTTPS. Pasūtījumu dati mūsu pakalpojumu sniedzējiem tiek pārsūtīti šifrētā veidā, piekļuve mūsu e-pasta kastītei un rīkiem ir tikai tiem cilvēkiem, kuriem tā nepieciešama, un mēs vispār neglabājam karšu datus. Neviena sistēma nav pilnībā droša. Ja datu aizsardzības pārkāpums kādreiz skars jūsu datus, mēs par to paziņosim jums un uzraudzības iestādei, kā to prasa VDAR.

"breach" → "datu aizsardzības pārkāpums" (short form of the GDPR term "personas datu aizsardzības pārkāpums"). Expand to the full term if the lawyer prefers the exact statutory wording.

---

**English:** Apple bars, meringues and Belyov pastila, shipped from Riga across the EU. Free shipping over €25.

**Latvian:** Ābolu batoniņi, bezē un Beļovas pastila, ko piegādājam no Rīgas visā ES. Bezmaksas piegāde virs €25.

"Belyov pastila" → "Beļovas pastila" (the town name transliterated into Latvian; the brand Belevini is untouched elsewhere). The price is kept exactly as the English token "€25" — Latvian typography would normally write "25 €", so confirm whether the symbol position should be normalised site-wide.

---

**English:** We do not run analytics at the moment. If we add it, we will use a cookieless, privacy-friendly tool that counts page views in aggregate without identifying you, and we will update this section.

**Latvian:** Pašlaik mēs neizmantojam analītiku. Ja to pievienosim, mēs izmantosim bezsīkdatņu, privātumu saudzējošu rīku, kas apkopotā veidā skaita lapu skatījumus, jūs neidentificējot, un mēs atjaunināsim šo sadaļu.

Possible inconsistency in the English source, not a translation issue: this section says no analytics is used, while Plausible appears in the project's brand list; likewise i=31 and i=60 say the payment provider is not yet named, while Stripe appears in the brand list. Translated exactly as written.

---

**English:** Your name, e-mail address, phone number (optional, for the courier), delivery address or parcel locker, country, the items and quantities in your box, any gift message or note, and whether you ticked the newsletter box. We use this to check stock, send you a confirmation with a payment link, deliver the parcel, answer questions about the order, and keep the accounting records the law requires.

**Latvian:** Jūsu vārds, e-pasta adrese, tālruņa numurs (neobligāts, kurjeram), piegādes adrese vai pakomāts, valsts, jūsu kastē esošās preces un to daudzums, dāvanas ziņojums vai piezīme, ja tāda ir, un tas, vai atzīmējāt jaunumu vēstuļu izvēles rūtiņu. Mēs to izmantojam, lai pārbaudītu preču pieejamību, nosūtītu jums apstiprinājumu ar maksājuma saiti, piegādātu sūtījumu, atbildētu uz jautājumiem par pasūtījumu un uzturētu likumā prasīto grāmatvedības uzskaiti.

"box" (the assembled order) → "kaste" here and at i=104, matching the product concept. Confirm this matches the wording used on the shop pages.

---

### Russian — terms

**English:** Every product we make contains

**Russian:** Каждый產

CORRECTION — the value for i=67 in this call is corrupted; the correct translation is: «Каждый产» is wrong. Use: Каждый производимый нами продукт содержит

---

### Latvian — terms

**English:** App’Lite Apple Bar

**Latvian:** App’Lite Apple Bar

Left "App’Lite Apple Bar" untranslated and uninflected as a product name (brand rule covers App’Lite; "Apple Bar" appears to be part of the fixed product name used elsewhere on the site). If the site elsewhere uses a Latvian product name (e.g. "App’Lite ābolu batoniņš"), this string must be aligned with it. Note the typographic apostrophe in App’Lite was kept exactly.

---

**English:** Ingredient lists, allergen statements and typical nutrition values are published on every product page, for example the

**Latvian:** Sastāvdaļu saraksti, alergēnu norādes un vidējās uzturvērtības ir publicētas katra produkta lapā, piemēram,

Segment 30 now ends with "piemēram," so the linked product name (i=31) follows as an uninflected apposition: "...katra produkta lapā, piemēram, App’Lite Apple Bar." Grammatical only because the name stays uninflected; if the link text is localised and declined, segment 30 may need rewording.

---

**English:** All prices are shown in euro (EUR) and include Latvian value added tax at the applicable rate. Shipping is charged separately and shown in the cart, at checkout and in our confirmation e-mail: free for orders over €25, otherwise a flat €3.90 in Latvia, Lithuania and Estonia, and for other EU countries a courier rate that we quote in the confirmation. Full details are on the

**Latvian:** Visas cenas ir norādītas eiro (EUR) un ietver Latvijas pievienotās vērtības nodokli pēc piemērojamās likmes. Piegāde tiek aprēķināta atsevišķi un ir redzama grozā, pasūtījuma noformēšanas laikā un mūsu apstiprinājuma e-pastā: pasūtījumiem virs €25 tā ir bez maksas, pretējā gadījumā Latvijā, Lietuvā un Igaunijā tā ir vienota — €3,90, bet uz citām ES valstīm — kurjera tarifs, ko norādām apstiprinājumā. Pilnīga informācija ir pieejama

Price written with the Latvian decimal comma: €3.90 → €3,90 (same amount). €25 unchanged. Flag if the reviewer wants the English punctuation kept verbatim. Latvian typography would normally put the symbol after the figure (3,90 €); I kept the English symbol-first placement to stay close to the source.

---

**English:** We sell food: baked-apple bars, apple meringues, Belyov pastila, zephyr and boxes that combine them, made in Riga from Antonovka apples and egg white. Because it is a natural product, colour, texture and exact weight vary a little from batch to batch, and the colour on your screen will never be quite the colour in your hand. Photographs are illustrative; the weights, pack sizes and flavour lists on each product page describe what you are buying.

**Latvian:** Mēs pārdodam pārtiku: ceptu ābolu batoniņus, ābolu bezē, Beļovas pastilu, zefīru un kastes, kurās tie apvienoti; tie tiek gatavoti Rīgā no Antonovkas āboliem un olu baltuma. Tā kā tas ir dabīgs produkts, krāsa, tekstūra un precīzs svars nedaudz atšķiras no partijas uz partiju, un krāsa jūsu ekrānā nekad nebūs gluži tāda pati kā rokā. Fotoattēli ir ilustratīvi; svars, iepakojuma izmēri un garšu saraksti katra produkta lapā apraksta to, ko jūs pērkat.

"Belyov pastila" rendered as "Beļovas pastila" (Latvian transliteration of the town Belyov, the standard designation for this pastila type). If the shop markets it under a fixed brand string, that string should be used instead. "Antonovka apples" → "Antonovkas āboli" (cultivar name).

---

**English:** ; it is what makes pastila light. The Pine Nut pastila contains nuts, and all our products may contain traces of nuts because they are made in the same facility. The chocolate-covered zephyr contains soy and may contain milk. The full allergen statement is on each product page and on the pack.

**Latvian:** ; tieši tas padara pastilu vieglu. Ciedru riekstu pastila satur riekstus, un visi mūsu produkti var saturēt riekstu pēdas, jo tie tiek ražoti vienā un tajā pašā ražotnē. Šokolādē glazētais zefīrs satur soju un var saturēt pienu. Pilna alergēnu norāde ir pieejama katra produkta lapā un uz iepakojuma.

"The Pine Nut pastila" translated descriptively as "Ciedru riekstu pastila". If "Pine Nut" is a fixed product/SKU name on the site, it should stay in English for findability. Also: English says "contains nuts" — pine nuts are botanically seeds but are declared as nuts in the source, so I kept "satur riekstus" literally; do not adjust without a food-law check.

---

**English:** In practice: you can return products that are still sealed and in the condition in which you received them. An opened bar, bag, box or loaf cannot be returned. Products with a short remaining shelf life may fall under the second exception; we will tell you if that is the case.

**Latvian:** Praksē tas nozīmē: jūs varat atdot atpakaļ produktus, kuru iepakojums nav atvērts un kuri ir tādā stāvoklī, kādā tos saņēmāt. Atvērtu batoniņu, maisiņu, kārbu vai klaipu atdot atpakaļ nevar. Uz produktiem ar īsu atlikušo derīguma termiņu var attiekties otrais izņēmums; ja tā būs, mēs jums to pateiksim.

"loaf" → "klaipu" (pastila loaf). Confirm this matches the pack format name used elsewhere on the site.

---

**English:** By placing an order you accept these terms. The version published at the time of your order is the one that applies to it. Nothing in these terms limits the rights you have under the Latvian Consumer Rights Protection Law or under mandatory consumer law in the EU country where you live.

**Latvian:** Veicot pasūtījumu, jūs piekrītat šiem noteikumiem. Uz pasūtījumu attiecas tā redakcija, kas bija publicēta pasūtījuma veikšanas brīdī. Nekas šajos noteikumos neierobežo tiesības, kas jums ir saskaņā ar Patērētāju tiesību aizsardzības likumu vai saskaņā ar imperatīvajām patērētāju tiesību normām tajā ES valstī, kurā jūs dzīvojat.

"the Latvian Consumer Rights Protection Law" rendered by its official Latvian name "Patērētāju tiesību aizsardzības likums", which contains no "Latvijas". Same choice at i=64. If the page is read by consumers outside Latvia, the lawyer may prefer "Latvijas Patērētāju tiesību aizsardzības likums" for identifiability, at the cost of not being the exact statute name.

---

**English:** A consumer is a natural person acting for purposes outside their trade, business or profession. If you are a retailer, café, office or distributor, please go through our

**Latvian:** Patērētājs ir fiziska persona, kas rīkojas nolūkos, kuri nav saistīti ar tās amatniecisko, saimniecisko vai profesionālo darbību. Ja esat mazumtirgotājs, kafejnīca, birojs vai izplatītājs, lūdzu, izmantojiet mūsu

Consumer definition follows the statutory wording of the Patērētāju tiesību aizsardzības likums ("nolūkos, kuri nav saistīti ar tās ... darbību"). English lists three: trade, business, profession → "amatniecisko, saimniecisko vai profesionālo". If the lawyer prefers the statute's shorter pair ("saimniecisko vai profesionālo"), one of the three drops out — I kept all three to avoid narrowing.

---

**English:** sealed goods which are not suitable for return for health protection or hygiene reasons and were unsealed after delivery; and

**Latvian:** aizzīmogotām precēm, kuras nav derīgas atdošanai atpakaļ veselības aizsardzības vai higiēnas apsvērumu dēļ un kuru iepakojums pēc piegādes ir atvērts; un

Wording of both exceptions taken from the Latvian implementing rules (MK noteikumi Nr. 255, distances līgums) rather than a literal rendering: "aizzīmogotas preces, kuras nav derīgas atdošanai atpakaļ veselības aizsardzības vai higiēnas apsvērumu dēļ". Same for i=56 ("preces, kas ātri bojājas").

---

**English:** As a consumer in the EU, you may withdraw from the contract within

**Latvian:** Kā patērētājs Eiropas Savienībā jūs varat atteikties no līguma

Split across an inline element: i=51 ends before the highlighted "14 days" and i=52 resumes after it. In Latvian the inline fragment must read "14 dienu laikā" for the sentence to be grammatical ("...atteikties no līguma" + "14 dienu laikā" + "no dienas, kad..."). The same applies at i=64/65, where the inline fragment must read "48 stundu laikā" ("...pasūtījuma numuru" + "48 stundu laikā" + "no piegādes."). Please verify those inline strings are being translated in another batch with exactly that wording.

---

**English:** of the day on which you, or a person you nominated other than the carrier, received the goods, without giving any reason. For an order delivered in several parcels the period runs from the last parcel. This right comes from Directive 2011/83/EU on consumer rights and the Latvian rules that implement it.

**Latvian:** no dienas, kad jūs vai jūsu norādīta persona, kas nav pārvadātājs, saņēmāt preces, nenorādot nekādu iemeslu. Ja pasūtījums tiek piegādāts vairākos sūtījumos, termiņu skaita no pēdējā sūtījuma. Šīs tiesības izriet no Direktīvas 2011/83/ES par patērētāju tiesībām un Latvijas normatīvajiem aktiem, kas to ievieš.

English says "a person you nominated other than the carrier"; the directive's own formula is "trešā persona, kas nav pārvadātājs". I kept the source's "jūsu norādīta persona, kas nav pārvadātājs" to avoid adding "trešā".

---

**English:** We are liable, as the law requires, for damage caused intentionally or through gross negligence, for death or personal injury caused by our fault, and for defective products under product liability law. Beyond that, our liability for a consumer order is limited to the value of that order, and we are not liable for indirect or unforeseeable loss, or for delays and failures caused by events outside our reasonable control, such as carrier strikes, extreme weather or border delays. Nothing in this section limits rights that cannot be limited under the law of the country where you live.

**Latvian:** Mēs atbildam, kā to prasa likums, par zaudējumiem, kas nodarīti ar nodomu vai rupjas neuzmanības dēļ, par personas nāvi vai veselības kaitējumu, kas nodarīts mūsu vainas dēļ, un par precēm ar trūkumiem saskaņā ar tiesību aktiem par atbildību par preces trūkumiem. Papildus tam mūsu atbildība par patērētāja pasūtījumu ir ierobežota ar attiecīgā pasūtījuma vērtību, un mēs neatbildam par netiešiem vai neparedzamiem zaudējumiem, kā arī par kavējumiem un saistību neizpildi, ko izraisījuši notikumi ārpus mūsu saprātīgas kontroles, piemēram, pārvadātāju streiki, ekstremāli laikapstākļi vai kavējumi uz robežas. Nekas šajā sadaļā neierobežo tiesības, kuras nevar ierobežot saskaņā ar tās valsts tiesību aktiem, kurā jūs dzīvojat.

"under product liability law" → "saskaņā ar tiesību aktiem par atbildību par preces trūkumiem" (Latvia's statute is "Par atbildību par preces un pakalpojuma trūkumiem"). Left generic because the English is generic; a lawyer may want the statute named. "gross negligence" → "rupja neuzmanība"; "death or personal injury" → "personas nāve vai veselības kaitējums". The limitation is kept exactly to the value of that order, with no widening.

---

**English:** ) and the Consumer Dispute Resolution Commission that works alongside it. Consumers in other EU countries can get help with a cross-border complaint from their national European Consumer Centre (ECC-Net). The European Commission’s online dispute resolution (ODR) platform was discontinued in July 2025 and no longer accepts new complaints.

**Latvian:** ) un tā paspārnē darbojošajā Patērētāju strīdu risināšanas komisijā. Patērētāji citās ES valstīs var saņemt palīdzību pārrobežu sūdzības gadījumā savas valsts Eiropas Patērētāju informēšanas centrā (European Consumer Centre, ECC-Net). Eiropas Komisijas strīdu izšķiršanas tiešsaistē (ODR) platforma 2025. gada jūlijā tika slēgta un vairs nepieņem jaunas sūdzības.

ECC-Net: the Latvian body's own name is "Eiropas Patērētāju informēšanas centrs" (EPIC), so I used that plus the English "European Consumer Centre" in brackets so a reader in another Member State can find their own national centre. "Consumer Dispute Resolution Commission" → "Patērētāju strīdu risināšanas komisija" (its statutory Latvian name). ODR platform → "strīdu izšķiršanas tiešsaistē (ODR) platforma", ODR kept as an abbreviation since the reader may search for it; the 2025 discontinuation statement is carried over unchanged and unhedged — please confirm it is still factually current at publication.

---

**English:** The terms are long. The ingredient list isn’t.

**Latvian:** Noteikumi ir gari. Sastāvdaļu saraksts — nē.

English relies on an elliptical "The ingredient list isn’t." A bare Latvian "...saraksts nav." would read as "the ingredient list does not exist", so I used "Sastāvdaļu saraksts — nē." An alternative that spells the ellipsis out is "Sastāvdaļu saraksts nav garš."

---

**English:** Fill your box

**Latvian:** Piepildiet savu kasti

"Fill your box" → "Piepildiet savu kasti" — read as the physical mixed box of products, matching the cart flow. If "box" here means the on-site cart rather than the product box, "grozu" would be better.

---

**English:** Damaged or defective goods

**Latvian:** Bojātas preces vai preces ar trūkumiem

"Damaged or defective goods" → "Bojātas preces vai preces ar trūkumiem". Latvian has no single word covering both; "prece ar trūkumiem" is the statutory term for defective goods, so the heading is longer than the English. A shorter but less precise option: "Bojātas vai nekvalitatīvas preces".

---

**English:** You are entitled to goods that conform to the contract, under the Latvian Consumer Rights Protection Law and EU law. If something arrives damaged, spoiled, wrong or missing, e-mail us a photo of the parcel and the product, together with your order reference, within

**Latvian:** Saskaņā ar Patērētāju tiesību aizsardzības likumu un ES tiesību aktiem jums ir tiesības saņemt līgumam atbilstošu preci. Ja kaut kas pienāk bojāts, sabojājies, nepareizs vai trūkst, nosūtiet mums pa e-pastu sūtījuma un produkta fotoattēlu kopā ar pasūtījuma numuru

"goods that conform to the contract" → "līgumam atbilstoša prece" (the statutory conformity term). Note the source itself says "including any shipping you paid" only in the replacement/refund sentence (i=65) — I did not extend it to the withdrawal refund at i=63, which keeps the narrower "standarta izejošās piegādes izmaksas, bet ne ... dārgākās piegādes iespējas".

---

**English:** The contract of sale is concluded when your payment reaches us. The parcel then leaves Riga within 1–2 business days. If the payment link is not used within seven days, the request lapses quietly and nothing is owed.

**Latvian:** Pirkuma līgums ir noslēgts brīdī, kad jūsu maksājums nonāk pie mums. Pēc tam sūtījums tiek nosūtīts no Rīgas 1–2 darba dienu laikā. Ja maksājuma saite netiek izmantota septiņu dienu laikā, pieteikums klusi zaudē spēku un nekas nav jāmaksā.

"the request lapses quietly" → "pieteikums klusi zaudē spēku": kept the source's informal register, but if a lawyer objects, "zaudē spēku bez atsevišķa paziņojuma" states the same effect more formally. Seven days and 1–2 business days carried over exactly.

---

**English:** , Riga, Latvia (“Semers”, “we”).

**Latvian:** , Rīga, Latvija („Semers”, „mēs”).

Kept the address in the nominative (", Rīga, Latvija") because it follows the company name in the preceding link and reads as part of the registered address, not as a locative adverbial. Quotation marks converted to Latvian „ ”.

---

### Russian — shipping

**English:** Shipping &amp; returns: costs, times, damaged parcels — Semers

**Russian:** Доставка и возврат: стоимость, сроки, повреждённые посылки — Semers

The HTML entity "&amp;" is rendered as the word «и» — Russian does not use "&" between words. Same in i=2 and i=80. If the template needs a literal ampersand there, it can be restored, but «и» is the correct Russian reading.

---

**English:** Semers shipping and returns: free delivery over €25, €3.90 flat in the Baltics, dispatch from Riga in 1–2 business days, tracking, damage and returns.

**Russian:** Доставка и возврат Semers: бесплатно свыше €25, фиксированные €3,90 в странах Балтии, отправка из Риги за 1–2 рабочих дня, отслеживание, повреждения, возврат.

Decimal separator: I wrote €3,90 (Russian convention) — the value is unchanged from €3.90. Same choice in i=21 and i=30. If the site keeps a dot on all localised pages, change these three back to €3.90 for consistency. Currency symbol position kept as in the English (€25, €3,90) rather than the Russian norm "25 €"; flagging in case the shop has a house rule.

---

**English:** Semers shipping and returns: free delivery over €25, €3.90 flat in the Baltics, dispatch from Riga in 1–2 business days, tracking, damage and returns.

**Russian:** Доставка и возврат Semers: бесплатно свыше €25, фиксированные €3,90 в странах Балтии, отправка из Риги за 1–2 рабочих дня, отслеживание, повреждения, возврат.

Meta description length: 157 characters, close to the English (155) and inside the usual snippet limit.

---

**English:** Damaged, wrong or missing

**Russian:** Повреждено, не то или отсутствует

Section heading "Damaged, wrong or missing" rendered as three adjectival predicates «Повреждено, не то или отсутствует». If the nav needs it shorter, «Повреждения и ошибки» would lose "missing" — I kept all three.

---

**English:** flat rate below it in the Baltics

**Russian:** фиксированный тариф ниже этого порога, в странах Балтии

"below it" refers back to the €25 threshold in the previous stat, not to the €3.90 shown above this fragment. I made that explicit with «ниже этого порога» to avoid the ambiguity a bare «ниже этой суммы» would create next to the €3.90 figure. Confirm the layout still reads correctly.

---

**English:** Baltics

**Russian:** Страны Балтии

"Baltics" as a shipping-zone name rendered «Страны Балтии» (the standard Russian designation for LV/LT/EE). Same in i=53, i=55 and in the running text; a bare «Балтия» would also be understood but is less usual in commercial copy.

---

**English:** Parcel locker (Omniva, DPD) or courier to the door

**Russian:** Постамат (Omniva, DPD) или курьер до двери

"Parcel locker" rendered «постамат», the general Russian term. Omniva's own Russian-language materials in the Baltics use «пакомат» for its own machines. If the shop wants to match Omniva's wording exactly, use «пакомат» when Omniva is named — but «постамат» is safe as the generic term covering both Omniva and DPD. Same choice in i=53, 54, 61, 62.

---

**English:** Collect in person

**Russian:** Забрать лично

"Collect in person" sits in the Countries column of the Riga row; rendered «Забрать лично». Should be kept distinct from the checkout option label in i=9/i=60 («Самовывоз в Риге»).

---

**English:** . Businesses order by the case through

**Russian:** . Компании заказывают коробками через

"order by the case" rendered «заказывают коробками» (by the carton/case). If the wholesale page uses a fixed Russian term for the trade unit (ящик / короб / упаковка), align this fragment with it.

---

**English:** 1–2 business days

**Russian:** 1–2 рабочих дней

This fragment is inserted after i=49 «…в течение», which governs the genitive, so it reads «1–2 рабочих дней». Note this differs from the standalone stat in i=18 («1–2 дня») and from the table cells i=31/i=36 — the case is correct for each position, so please do not unify them.

---

**English:** Everything is packed in a sturdy box with paper padding. Pastila does not need a fridge: it keeps for up to 12 months at room temperature, so there are no ice packs and no cold-chain worries, in July or in January. Zephyr has a shorter shelf life and is shipped from fresh stock, with the date printed on the box.

**Russian:** Всё упаковано в прочную коробку с бумажным наполнителем. Пастиле не нужен холодильник: она хранится до 12 месяцев при комнатной температуре, поэтому никаких хладоэлементов и никаких забот о холодовой цепи — ни в июле, ни в январе. У зефира срок годности короче, он отправляется из свежих партий, а дата напечатана на коробке.

"Pastila" and "Zephyr" are ordinary Russian food nouns and are translated as «пастила» and «зефир» (lower case). If these are used on the site as product-line names rather than as the confection categories, they would need capitalisation or the Latin form instead — please confirm.

---

**English:** Everything is packed in a sturdy box with paper padding. Pastila does not need a fridge: it keeps for up to 12 months at room temperature, so there are no ice packs and no cold-chain worries, in July or in January. Zephyr has a shorter shelf life and is shipped from fresh stock, with the date printed on the box.

**Russian:** Всё упаковано в прочную коробку с бумажным наполнителем. Пастиле не нужен холодильник: она хранится до 12 месяцев при комнатной температуре, поэтому никаких хладоэлементов и никаких забот о холодовой цепи — ни в июле, ни в январе. У зефира срок годности короче, он отправляется из свежих партий, а дата напечатана на коробке.

"cold-chain worries" rendered «забот о холодовой цепи» — «холодовая цепь» is the term used in Russian food-safety regulation. "12 months" and "room temperature" kept exactly.

---

**English:** If tracking shows “delivered” but there is no parcel, check with neighbours, the building’s reception and the locker, then write to us within 48 hours. We will open a trace with the carrier and, if the parcel does not turn up, send a replacement.

**Russian:** Если отслеживание показывает «доставлено», а посылки нет, проверьте у соседей, на ресепшене здания и в постамате, а затем напишите нам в течение 48 часов. Мы откроем розыск у перевозчика и, если посылка не найдётся, отправим замену.

"open a trace with the carrier" rendered «откроем розыск у перевозчика» — «розыск отправления» is the standard carrier term. The 48-hour deadline is kept as an obligation on the customer, exactly as in the English.

---

**English:** within

**Russian:** в течение

This fragment «в течение» governs the genitive case, so the duration injected between i=64 and i=65 must appear in the genitive («48 часов», «14 дней»), not the nominative. Same for i=68 «…в течение» + duration + i=69. If those durations come from another batch or from a template variable, please check the form used.

---

**English:** of delivery. We replace the affected items or refund them, including any shipping you paid; your choice. You do not need to send damaged food back unless we ask.

**Russian:** с момента доставки. Мы заменим пострадавшие товары или вернём за них деньги, включая оплаченную вами доставку, — на ваш выбор. Возвращать повреждённые продукты не нужно, если мы об этом не попросим.

"including any shipping you paid" rendered «включая оплаченную вами доставку» — kept as a full reimbursement of the shipping the customer actually paid, matching the English. Distinct from i=73, where the English deliberately limits the refund to the *standard* outbound shipping; that limitation is preserved there («стандартную стоимость доставки к вам»).

---

**English:** of receiving them, no reason needed, as long as they are unopened and still sealed. Food that has been opened cannot be returned, for hygiene reasons, and products with a short remaining shelf life may be excluded. This follows the legal exceptions for sealed goods and perishable goods in the EU Consumer Rights Directive; the full wording is in our

**Russian:** с момента её получения, без объяснения причин, при условии, что она не вскрыта и остаётся запечатанной. Вскрытые продукты питания возврату не подлежат по соображениям гигиены, а товары с коротким оставшимся сроком годности могут быть исключены. Это соответствует установленным законом исключениям для запечатанных товаров и скоропортящихся товаров в Директиве ЕС о правах потребителей (EU Consumer Rights Directive); полная формулировка приведена в наших

The English describes the 14-day return without using the term of art "right of withdrawal", so I did not introduce «право на отказ от договора» either — the plain wording «вернуть … без объяснения причин» is kept. If the terms page (linked at the end of this sentence) uses the term of art, a lawyer may prefer to add it here for consistency.

---

**English:** of receiving them, no reason needed, as long as they are unopened and still sealed. Food that has been opened cannot be returned, for hygiene reasons, and products with a short remaining shelf life may be excluded. This follows the legal exceptions for sealed goods and perishable goods in the EU Consumer Rights Directive; the full wording is in our

**Russian:** с момента её получения, без объяснения причин, при условии, что она не вскрыта и остаётся запечатанной. Вскрытые продукты питания возврату не подлежат по соображениям гигиены, а товары с коротким оставшимся сроком годности могут быть исключены. Это соответствует установленным законом исключениям для запечатанных товаров и скоропортящихся товаров в Директиве ЕС о правах потребителей (EU Consumer Rights Directive); полная формулировка приведена в наших

"EU Consumer Rights Directive" rendered «Директива ЕС о правах потребителей» with the English name in brackets so a reader can find Directive 2011/83/EU. The English text gives no directive number, so I did not add one. Remove the bracketed English if house style forbids it. The two statutory exceptions (sealed goods / perishable goods) are kept as two separate grounds, and the "may be excluded" for short-shelf-life products is kept as a possibility, not an absolute rule.

---

**English:** We refund the price and the standard outbound shipping within 14 days of your notice, to the same payment method. We may wait until the goods arrive or you show proof of posting.

**Russian:** Мы возвращаем стоимость товара и стандартную стоимость доставки к вам в течение 14 дней с момента вашего уведомления, тем же способом оплаты. Мы вправе подождать, пока товар не поступит к нам или пока вы не предъявите доказательство отправки.

"or you show proof of posting" rendered «или пока вы не предъявите доказательство отправки» — this is the Art. 13(3) Consumer Rights Directive retention right, kept as a right («вправе подождать»), not an obligation.

---

**English:** Tasting Box

**Russian:** Tasting Box

"Tasting Box" left in Latin script unchanged: it reads as a product/SKU name and is almost certainly a link to the product page. If the Russian shop sells it under a translated name, this should become that name (e.g. «Дегустационный набор») — please confirm against the product catalogue.

---

**English:** . Quick answers about storage, calories and ingredients are in the

**Russian:** . Быстрые ответы о хранении, калорийности и составе — в

Fragment ends with the bare preposition «в», which requires the following link text to be in the prepositional case (e.g. «в разделе «Вопросы и ответы»» / «в FAQ»). Same for i=78, where the following link is presumably the privacy policy («в Политике конфиденциальности»). Please check the link labels from the other batches agree.

---

**English:** Fill a box. We’ll have it on its way in a day or two.

**Russian:** Наполните коробку. Через день-два она уже будет в пути.

"Fill a box" rendered «Наполните коробку» (build-your-own box). If this CTA refers to a specific configurator feature with its own name on the site, align the wording with it.

---

### Latvian — shipping

**English:** Shipping &amp; returns: costs, times, damaged parcels — Semers

**Latvian:** Piegāde un atgriešana: izmaksas, termiņi, bojāti sūtījumi — Semers

The English strings 0, 2 and 80 contain the HTML entity "&amp;". Latvian headings do not idiomatically use "&", so I rendered it as the word "un" and the entity is therefore gone from the Latvian. If the build pipeline expects the entity to survive verbatim (e.g. a string-diff check), tell me and I will restore "&amp;" in all three.

---

**English:** Semers shipping and returns: free delivery over €25, €3.90 flat in the Baltics, dispatch from Riga in 1–2 business days, tracking, damage and returns.

**Latvian:** Semers piegāde un atgriešana: bezmaksas piegāde virs €25, vienota maksa €3.90 Baltijā, nosūtīšana no Rīgas 1–2 darba dienās, izsekošana, bojājumi un atgriešana.

PRICE FORMAT — decide once for the whole site. I kept the English glyphs exactly: "€25" and "€3.90". Latvian typographic convention is "25 €" and "3,90 €" (comma decimal separator, symbol after the number). The amount is identical either way; I chose not to change it because the brief says a price stays the same price. Affects i=1, 21, 30, 35. Lawyer/editor should confirm which form the Latvian page uses.

---

**English:** to return sealed products

**Latvian:** lai atgrieztu neatvērtus produktus

"sealed" — Latvian consumer law (Patērētāju tiesību aizsardzības likums / MK noteikumi Nr. 255) uses "aizzīmogotas preces". In this short stat card I wrote "neatvērtus produktus" (unopened) because "aizzīmogotus produktus" reads as jargon in a one-line card. The full legal wording with "aizzīmogotas" is preserved in i=69, which is the clause that actually creates the exclusion. Flagging in case you want the statutory word in the card too: "lai atgrieztu aizzīmogotus produktus".

---

**English:** Typical delivery

**Latvian:** Parastais piegādes laiks

Table column "Typical delivery" rendered as "Parastais piegādes laiks" (typical delivery time). Alternative if column width is tight: "Piegāde parasti".

---

**English:** United Kingdom, Switzerland, Norway and beyond

**Latvian:** Apvienotā Karaliste, Šveice, Norvēģija un tālāk

"and beyond" rendered literally as "un tālāk". If the register feels too casual for a table cell, "un citas valstis" (and other countries) is the neutral alternative — same meaning, no change to the listed countries.

---

**English:** Prefer a shop? In Latvia you will find us at Maxima and on Barbora, and in selected stores across Europe; see

**Latvian:** Labāk veikalā? Latvijā mūs atradīsiet Maxima un Barbora, kā arī atsevišķos veikalos visā Eiropā; skatiet

"at Maxima and on Barbora" — English distinguishes physical stores from the online platform. Latvian "Maxima un Barbora" drops that distinction because adding "veikalos" / "platformā" would be words the English does not have. Say the word and I will add "Maxima veikalos un Barbora platformā".

---

**English:** . Businesses order by the case through

**Latvian:** . Uzņēmumi pasūta pa kastēm, izmantojot

"Businesses order by the case through …" — the fragment ends before a link. I used "izmantojot" (through/using), which governs the accusative and composes with a link label such as "vairumtirdzniecību". If the link label is a noun in the nominative (e.g. "Vairumtirdzniecība"), the phrase will be grammatically loose; check against the actual link text.

---

**English:** 1–2 business days

**Latvian:** 1–2 darba dienu laikā

"within" has no separate word in Latvian: it is carried by "laikā" placed AFTER the time expression. So i=49 ends without it and i=50 reads "1–2 darba dienu laikā" (within 1–2 business days), with i=51 continuing "pēc tam, kad saņemam jūsu maksājumu". The number 1–2 is unchanged. Verify the three fragments still concatenate in this order in the template.

---

**English:** Everything is packed in a sturdy box with paper padding. Pastila does not need a fridge: it keeps for up to 12 months at room temperature, so there are no ice packs and no cold-chain worries, in July or in January. Zephyr has a shorter shelf life and is shipped from fresh stock, with the date printed on the box.

**Latvian:** Viss tiek iepakots izturīgā kastē ar papīra pildījumu. Pastilai ledusskapis nav vajadzīgs: istabas temperatūrā tā saglabājas līdz 12 mēnešiem, tāpēc nav ne aukstuma elementu, ne rūpju par aukstuma ķēdi — ne jūlijā, ne janvārī. Zefīram derīguma termiņš ir īsāks, un to sūtām no svaigas partijas, ar datumu, kas uzdrukāts uz kastes.

"Pastila" and "Zephyr" are treated here as food names, not brands (they are not in the protected brand list, which covers Semers, App'Lite, PastiLite, Belevini etc.). Translated as "pastila" and "zefīrs", the normal Latvian names for these confections. If "Zephyr" is in fact a product line name that must stay in Latin script as written, revert i=52 to "Zephyr".

---

**English:** Everything is packed in a sturdy box with paper padding. Pastila does not need a fridge: it keeps for up to 12 months at room temperature, so there are no ice packs and no cold-chain worries, in July or in January. Zephyr has a shorter shelf life and is shipped from fresh stock, with the date printed on the box.

**Latvian:** Viss tiek iepakots izturīgā kastē ar papīra pildījumu. Pastilai ledusskapis nav vajadzīgs: istabas temperatūrā tā saglabājas līdz 12 mēnešiem, tāpēc nav ne aukstuma elementu, ne rūpju par aukstuma ķēdi — ne jūlijā, ne janvārī. Zefīram derīguma termiņš ir īsāks, un to sūtām no svaigas partijas, ar datumu, kas uzdrukāts uz kastes.

Food wording kept literal: "keeps for up to 12 months at room temperature" = "istabas temperatūrā tā saglabājas līdz 12 mēnešiem"; "12" unchanged. "shelf life" = "derīguma termiņš" (the term used on Latvian food labels).

---

**English:** within

**Latvian:** ne vēlāk kā

IMPORTANT, same issue as i=50. The English splits "within [14 days] of delivery" across fragments 63/64/65, and the bolded number itself is NOT in this batch. Latvian cannot place "within" before the number the way English does, so I translated i=64 as "ne vēlāk kā" (no later than). It composes correctly as "ne vēlāk kā 14 dienas pēc piegādes" if the missing bold string is "14 dienas", and acceptably if it is "14 dienu laikā". Please tell me how the "14 days" string is translated in the other batch so I can make 64 agree with it. Same construction used at i=68.

---

**English:** of delivery. We replace the affected items or refund them, including any shipping you paid; your choice. You do not need to send damaged food back unless we ask.

**Latvian:** pēc piegādes. Mēs vai nu aizstājam attiecīgās preces, vai atmaksājam par tām naudu, tostarp jūsu samaksāto piegādes maksu; izvēle ir jūsu. Bojātu pārtiku nav jāsūta atpakaļ, ja vien mēs to nelūdzam.

"We replace the affected items or refund them, including any shipping you paid; your choice." — I kept the customer's choice explicit ("izvēle ir jūsu") and kept the refund covering the shipping the customer paid ("tostarp jūsu samaksāto piegādes maksu"). The last sentence keeps the exact condition: no return of damaged food is required UNLESS we ask ("ja vien mēs to nelūdzam") — not softened to "generally not required".

---

**English:** If the box is visibly crushed when the courier hands it over, you can refuse it or ask the courier to note the damage; either one helps us claim from the carrier. Wrong item or something missing from the box? Same e-mail, same fix.

**Latvian:** Ja brīdī, kad kurjers nodod kasti, tā ir redzami saspiesta, jūs varat to nepieņemt vai lūgt kurjeram fiksēt bojājumu; abi varianti palīdz mums pieteikt prasību pārvadātājam. Nepareiza prece vai kaut kas kastē trūkst? Tas pats e-pasts, tas pats risinājums.

"claim from the carrier" = "pieteikt prasību pārvadātājam". "either one helps us" kept as "abi varianti palīdz mums" — it states that both options help, matching the English, and does not promise the claim succeeds.

---

**English:** You may return products within

**Latvian:** Preces varat atgriezt ne vēlāk kā

i=68 + missing bold number + i=69 must read: "Preces varat atgriezt ne vēlāk kā 14 dienas pēc to saņemšanas, neminot iemeslu, …". See the note on i=64.

---

**English:** of receiving them, no reason needed, as long as they are unopened and still sealed. Food that has been opened cannot be returned, for hygiene reasons, and products with a short remaining shelf life may be excluded. This follows the legal exceptions for sealed goods and perishable goods in the EU Consumer Rights Directive; the full wording is in our

**Latvian:** pēc to saņemšanas, neminot iemeslu, ja vien tās ir neatvērtas un joprojām aizzīmogotas. Atvērtu pārtiku higiēnas apsvērumu dēļ atgriezt nevar, un preces ar īsu atlikušo derīguma termiņu var tikt izslēgtas. Tas atbilst likumā noteiktajiem izņēmumiem attiecībā uz aizzīmogotām precēm un precēm, kas ātri bojājas, ES Patērētāju tiesību direktīvā; pilns formulējums ir mūsu

Three term choices here, all worth a lawyer's eye. (1) The English never names the right of withdrawal, so I did not insert "atteikuma tiesības" — I used "neminot iemeslu" (without giving a reason), which is the phrasing the Latvian statute pairs with that right. If the page should name the right, this is where it belongs. (2) "perishable goods" = "preces, kas ātri bojājas", tracking MK noteikumi Nr. 255 ("preces, kuras ātri bojājas vai kurām drīz beidzas derīguma termiņš"). (3) "sealed goods" = "aizzīmogotas preces", the statutory term.

---

**English:** of receiving them, no reason needed, as long as they are unopened and still sealed. Food that has been opened cannot be returned, for hygiene reasons, and products with a short remaining shelf life may be excluded. This follows the legal exceptions for sealed goods and perishable goods in the EU Consumer Rights Directive; the full wording is in our

**Latvian:** pēc to saņemšanas, neminot iemeslu, ja vien tās ir neatvērtas un joprojām aizzīmogotas. Atvērtu pārtiku higiēnas apsvērumu dēļ atgriezt nevar, un preces ar īsu atlikušo derīguma termiņu var tikt izslēgtas. Tas atbilst likumā noteiktajiem izņēmumiem attiecībā uz aizzīmogotām precēm un precēm, kas ātri bojājas, ES Patērētāju tiesību direktīvā; pilns formulējums ir mūsu

"the EU Consumer Rights Directive" rendered as "ES Patērētāju tiesību direktīvā", the standard Latvian name (formally Direktīva 2011/83/ES par patērētāju tiesībām). The English gives no number, so I added none. If the terms page cites the number, consider adding "(2011/83/ES)" here for findability — that would be an addition to the English, so I left it out.

---

**English:** of receiving them, no reason needed, as long as they are unopened and still sealed. Food that has been opened cannot be returned, for hygiene reasons, and products with a short remaining shelf life may be excluded. This follows the legal exceptions for sealed goods and perishable goods in the EU Consumer Rights Directive; the full wording is in our

**Latvian:** pēc to saņemšanas, neminot iemeslu, ja vien tās ir neatvērtas un joprojām aizzīmogotas. Atvērtu pārtiku higiēnas apsvērumu dēļ atgriezt nevar, un preces ar īsu atlikušo derīguma termiņu var tikt izslēgtas. Tas atbilst likumā noteiktajiem izņēmumiem attiecībā uz aizzīmogotām precēm un precēm, kas ātri bojājas, ES Patērētāju tiesību direktīvā; pilns formulējums ir mūsu

"products with a short remaining shelf life may be excluded" — kept as a possibility ("var tikt izslēgtas"), not a statement that they ARE excluded. This is a weaker obligation than the surrounding sentences, deliberately preserved.

---

**English:** We refund the price and the standard outbound shipping within 14 days of your notice, to the same payment method. We may wait until the goods arrive or you show proof of posting.

**Latvian:** Preces cenu un standarta izejošās piegādes maksu atmaksājam 14 dienu laikā pēc jūsu paziņojuma uz to pašu maksājuma līdzekli. Mēs varam gaidīt, līdz preces ir saņemtas vai līdz jūs uzrādāt nosūtīšanas apliecinājumu.

"the standard outbound shipping" = "standarta izejošās piegādes maksu". This matches the EU rule that the trader refunds the standard delivery cost, not an upgraded one. Also preserved: the refund runs from the consumer's NOTICE ("pēc jūsu paziņojuma"), and the trader MAY withhold until goods arrive or proof of posting is shown ("varam gaidīt"), not must.

---

**English:** Tasting Box

**Latvian:** Tasting Box

"Tasting Box" left in English as a product name, on the same footing as the protected brand names. If Semers sells it under a Latvian name (e.g. "Degustācijas kaste"), replace it — but it must then match the product listing exactly, so I did not guess.

---

**English:** , can be returned whole and unopened, but not in parts.

**Latvian:** , ir atgriežami veseli un neatvērti, bet ne pa daļām.

Grammar rework across i=74/75/76: English "Gift boxes and bundles, such as the Tasting Box, can be returned whole and unopened, but not in parts." Latvian needs a nominative subject plus "ir atgriežami", so i=76 begins ", ir atgriežami veseli un neatvērti, bet ne pa daļām." I deliberately did NOT add "tikai" (only), which would strengthen the restriction beyond the English.

---

**English:** Pick up in Riga

**Latvian:** Saņemšana Rīgā

"Pick up in Riga" is both a section heading (i=9) and a checkout option quoted in i=60. I used the same string, „Saņemšana Rīgā”, in both. Please make sure the actual checkout label on the Latvian site is worded identically, otherwise i=60 quotes an option the customer cannot find.

---

**English:** with your order reference. A person in Riga replies within one business day.

**Latvian:** norādot pasūtījuma numuru. Cilvēks Rīgā atbild vienas darba dienas laikā.

"order reference" translated consistently as "pasūtījuma numurs" (order number) throughout — i=15, 60, 63, 67, 70. The alternative "pasūtījuma atsauce" is more literal but is not what Latvian shops call it. In i=71 the return "reference to write on the parcel" is "atsauces numurs" to avoid implying it is the same number as the order number — confirm that is the intent.

---

**English:** If you are in Riga, you can collect your order and skip the shipping cost. Choose “Pick up in Riga” at checkout; we reply with the address and the times that work, usually the next business day after payment. Bring your order reference.

**Latvian:** Ja atrodaties Rīgā, varat saņemt pasūtījumu klātienē un nemaksāt par piegādi. Pasūtījuma noformēšanā izvēlieties „Saņemšana Rīgā”; mēs atbildam ar adresi un piemērotiem laikiem, parasti nākamajā darba dienā pēc maksājuma. Ņemiet līdzi pasūtījuma numuru.

Quotation marks: used „…” per instruction (i=60, i=62). Note the closing mark is the right-hand curly quote ” — if the house style is „…“ tell me and I will switch.

---

**English:** Damaged, wrong or missing

**Latvian:** Bojāts, nepareizs vai trūkstošs

Heading "Damaged, wrong or missing" = "Bojāts, nepareizs vai trūkstošs" — adjectives left in the masculine singular as a headline fragment, matching the English's lack of a noun. Reads naturally with an implied "sūtījums".

---

**English:** These are the carriers’ estimates, not promises. The odd parcel takes longer around public holidays and in the December rush. If yours is seriously late, write to us and we will chase it or send a replacement.

**Latvian:** Tās ir pārvadātāju aplēses, nevis solījumi. Retumis kāds sūtījums aizkavējas svētku dienu laikā un decembra steigā. Ja jūsu sūtījums ievērojami kavējas, rakstiet mums, un mēs to meklēsim vai nosūtīsim jaunu.

"These are the carriers' estimates, not promises" kept exactly — the disclaimer is not softened. "If yours is seriously late" = "ja jūsu sūtījums ievērojami kavējas"; the remedy stays alternative ("meklēsim vai nosūtīsim jaunu"), not cumulative.

---

### Russian — shared

**English:** Shipping &amp; returns

**Russian:** Доставка и возврат

The English uses the HTML entity &amp; for the ampersand. Russian joins the two nouns with «и», so no ampersand and no entity is needed in the output. If the build pipeline expects the entity to survive verbatim, flag it — I dropped it deliberately, not by accident. Same applies to i=15.

---

**English:** Write to

**Russian:** Пишите на

Fragment «Пишите на» is written to be followed immediately by an e-mail address, which is the prepositional/accusative object («Пишите на info@…»). If in the markup this fragment is followed by something other than an address (e.g. a person's name or a form), the case will need adjusting.

---

**English:** . A person in Riga replies within one business day.

**Russian:** . Человек в Риге отвечает в течение одного рабочего дня.

Leading «. » preserved exactly as in the English, so the fragment still closes the sentence begun at i=9. «A person in Riga» rendered literally as «Человек в Риге» — it is a deliberate claim that a human, not a bot, answers; I did not smooth it to «Мы отвечаем». «within one business day» = «в течение одного рабочего дня» (deadline unchanged).

---

**English:** Prefer a form? Use the

**Russian:** Предпочитаете форму? Воспользуйтесь

Grammatical dependency across two strings: i=13 ends in «Воспользуйтесь», which governs the instrumental case, so i=14 is given in the instrumental («страницей контактов»). If these two strings are ever reused apart from each other, or if the link text at i=14 is reused in another sentence, the case will be wrong. A case-neutral alternative pair would be i=13 «Предпочитаете форму? Откройте» + i=14 «страницу контактов» (accusative). Please confirm the two are always adjacent.

---

**English:** shipping &amp; returns

**Russian:** доставка и возврат

Lowercase inline link, so it sits inside a host sentence that is NOT in this batch (it lives in the per-page /privacy/ and /terms/ files). I returned the nominative «доставка и возврат», matching the nav label at i=6. Russian will require a different case in most host sentences (e.g. «см. раздел о доставке и возврате», «в условиях доставки и возврата»). Whoever translates the surrounding sentence should either build it around the nominative or the case here must be changed to match. Same issue at i=16, i=20, i=22, i=23.

---

**English:** wholesale

**Russian:** оптовые продажи

«wholesale» — translated as «оптовые продажи». Alternatives depending on what the linked page actually offers: «опт» (terse, common on RU shop navs) or «оптовые закупки» (buyer's perspective). Please confirm against the wholesale page's own heading so the link text and the page title agree.

---

**English:** FAQ

**Russian:** частые вопросы

«FAQ» — I translated it as «частые вопросы» rather than leaving the acronym. «FAQ» is also widely used and understood on Russian sites; if the FAQ page's own title is kept as «FAQ» elsewhere in the translation, change this to «FAQ» so the link text matches the destination page. This is a consistency decision that should be made once across all batches.

---

**English:** Ready when you are

**Russian:** Всё готово — дело за вами

«Ready when you are» is an idiom with no literal Russian equivalent; a word-for-word rendering («Готовы, когда готовы вы») reads awkwardly. I used «Всё готово — дело за вами». Purely marketing copy in the footer CTA — no legal content — so a free rendering seemed safe, but replace it if the brand voice guide has a set phrase.

---

**English:** Apple bars, meringues and Belyov pastila, made in Riga and shipped across the EU. Free shipping over €25.

**Russian:** Яблочные батончики, безе и белёвская пастила — произведено в Риге, доставка по всему ЕС. Бесплатная доставка при заказе свыше 25 €.

Three choices to review. (1) «meringues» → «безе»; «меренги» is the other standard term and is the one used when the product is a piped/French-style meringue — pick whichever matches the product name used elsewhere in the catalogue. (2) «Belyov pastila» → «белёвская пастила», the established Russian name of that regional product (with «ё» as required); note this is the generic product name, distinct from the brand «Belevini», which stays in Latin script. (3) «Free shipping over €25» → «при заказе свыше 25 €», i.e. strictly above 25, matching «over». If the shop's actual rule is 25 or more (inclusive), the English is wrong and both versions should read «от 25 €» — worth checking against the checkout logic. Price and currency unchanged; «25 €» follows the Russian convention of the symbol after the number, the amount itself is untouched.

---

### Latvian — shared

**English:** Shipping &amp; returns

**Latvian:** Piegāde un atgriešana

The English carries the HTML entity "&amp;". Latvian joins the two nouns with "un", so no ampersand (and no entity) is needed. If the build pipeline expects an entity in this string, confirm that a plain word is acceptable here.

---

**English:** Prefer a form? Use the

**Latvian:** Vēlaties veidlapu? Izmantojiet

Word order choice: the English fragment ends with the article "the", which Latvian has no equivalent for. I ended the fragment with the verb "Izmantojiet" (= "Use"), which governs the accusative — so the following link text (i=14) must be accusative. Alternative if the designer wants a shorter chip: "Labāk veidlapu? Dodieties uz" (then the link would need to stay accusative too).

---

**English:** contact page

**Latvian:** saziņas lapu

Rendered in the accusative ("saziņas lapu") because it is the object of "Izmantojiet" in i=13. If this same string is ever reused standalone (e.g. as a nav item or a button label), it must be nominative "saziņas lapa" instead — Latvian cannot use one form for both. Please confirm this string is only used inside that sentence.

---

**English:** shipping &amp; returns

**Latvian:** piegāde un atgriešana

CASE RISK — I do not have the surrounding sentence. I returned the nominative page-name form "piegāde un atgriešana". If this link sits inside a sentence such as "see our shipping & returns", Latvian will need the accusative "piegādi un atgriešanu" (or a genitive/locative depending on the verb). Please send me the full sentence, or let the reviewer adjust the ending in place.

---

**English:** terms of sale

**Latvian:** pārdošanas noteikumi

Same case risk as i=15. Nominative "pārdošanas noteikumi" returned; inside a sentence it may need accusative "pārdošanas noteikumus" (identical spelling only in the nominative). This is the standard Latvian term for terms of sale in a B2C distance contract.

---

**English:** 14 days

**Latvian:** 14 dienas

Case risk: "14 dienas" is both nominative and accusative plural, so it is safe as a standalone fragment and after most prepositions, but a phrase like "within 14 days" is "14 dienu laikā" (genitive) in Latvian. If this fragment is spliced into a running sentence about the withdrawal period, the reviewer should check the ending. The number 14 is unchanged.

---

**English:** 48 hours

**Latvian:** 48 stundas

Same case note as i=19: "48 stundas" is nominative/accusative; "within 48 hours" would be "48 stundu laikā". Number unchanged.

---

**English:** FAQ

**Latvian:** BUJ

TERM CHOICE: "BUJ" (biežāk uzdotie jautājumi) is the established Latvian abbreviation and is what I used, to keep the label as short as the English. Many Latvian e-commerce sites nonetheless leave "FAQ" in English because it is widely recognised. If Semers prefers the unabbreviated form, use "Biežāk uzdotie jautājumi" — but it is much longer and may not fit the same slot.

---

**English:** Ready when you are

**Latvian:** Esam gatavi, kad esat gatavi

Marketing line, not a legal obligation. "Ready when you are" has no idiomatic Latvian equivalent; "Esam gatavi, kad esat gatavi" ("We are ready when you are ready") is the closest natural rendering. Alternatives if a punchier CTA heading is wanted: "Gaidām jūsu pasūtījumu" ("We are waiting for your order" — adds a meaning the English does not have) or "Sāksim, kad būsiet gatavi".

---

**English:** Apple bars, meringues and Belyov pastila, made in Riga and shipped across the EU. Free shipping over €25.

**Latvian:** Ābolu batoniņi, bezē un Beļovas pastila, ražoti Rīgā un piegādāti visā ES. Bezmaksas piegāde pasūtījumiem virs 25 €.

"Belyov pastila" was NOT on the do-not-translate list (that list covers App'Lite, PastiLite, Belevini), so I read it as a product type, not a brand, and transliterated the place name per Latvian usage: "Beļovas pastila" (Белёв → Beļova). Please confirm — if the company treats "Belyov pastila" as a fixed product designation on labels or in food-law documentation, it should stay exactly as written in English instead.

---

**English:** Apple bars, meringues and Belyov pastila, made in Riga and shipped across the EU. Free shipping over €25.

**Latvian:** Ābolu batoniņi, bezē un Beļovas pastila, ražoti Rīgā un piegādāti visā ES. Bezmaksas piegāde pasūtījumiem virs 25 €.

Currency formatting: Latvian (and the Latvian State Language Centre) puts the symbol after the amount with a non-breaking space, so "€25" became "25 €". The amount 25 is unchanged. If the site's style guide requires the symbol before the number for visual consistency across languages, change it back to "€25" — that is a formatting decision, not a translation one.

---

**English:** Apple bars, meringues and Belyov pastila, made in Riga and shipped across the EU. Free shipping over €25.

**Latvian:** Ābolu batoniņi, bezē un Beļovas pastila, ražoti Rīgā un piegādāti visā ES. Bezmaksas piegāde pasūtījumiem virs 25 €.

"Free shipping over €25" is rendered "Bezmaksas piegāde pasūtījumiem virs 25 €" — explicitly "for orders over €25", because Latvian needs a noun for what the threshold applies to and "virs 25 €" alone would be ungrammatical here. Please confirm the threshold really applies to the order value (not, say, the goods value excluding shipping); if it is the goods subtotal, say so and I will use "preču summai virs 25 €".

---

**English:** Last updated: September 2026

**Latvian:** Pēdējoreiz atjaunināts: 2026. gada septembris

Date written as "2026. gada septembris" (nominative, matching the English label form). If the line reads more naturally to the reviewer as "atjaunināts 2026. gada septembrī" (locative, "in September 2026"), that is equally correct Latvian; I kept the nominative to mirror the English colon-list format. Year and month unchanged.

---

**English:** . A person in Riga replies within one business day.

**Latvian:** . Cilvēks Rīgā atbild vienas darba dienas laikā.

The leading ". " of the English fragment is preserved, since this string is concatenated after an e-mail address. "A person in Riga" is rendered literally as "Cilvēks Rīgā" to keep the human-not-a-bot claim the English makes; "one business day" is "vienas darba dienas laikā", the standard Latvian phrase.

---

**English:** Legal pages

**Latvian:** Juridiskās lapas

aria-label kept short: "Juridiskās lapas". A fuller "Juridiskās informācijas lapas" is more formal but long for a screen-reader nav label.

---

**English:** Legal

**Latvian:** Juridiskā informācija

"Legal" as a section/nav heading has no one-word Latvian equivalent; "Juridiskā informācija" is the standard Latvian website heading for this group of pages. Note it is longer than the English — check it fits the nav slot.

---

**English:** Shop the range

**Latvian:** Apskatīt sortimentu

"Shop the range" is a CTA; "Apskatīt sortimentu" ("View the range") is the natural Latvian button text. A more transactional alternative is "Iepirkties" ("Shop") if the button should push toward purchase rather than browsing.

---

**English:** wholesale

**Latvian:** vairumtirdzniecība

"vairumtirdzniecība" is the settled Latvian term for wholesale. Returned in the nominative as a standalone fragment; if it is a link inside a sentence it may need another case (e.g. "vairumtirdzniecību").

---

### Russian — wholesale

**English:** Request the line sheet

**Russian:** Запросить каталог

"line sheet" is translated as «каталог» everywhere (i=5, 55, 70, 71, 99, 110, 121, 128, 129, 138, 140). «Прайс-лист» was rejected because the English pairs "line sheet" with "trade prices" in i=71/110/128, which would read as a tautology in Russian. «Прайс-лист» is used only in i=15, where the English itself says "price list". If the client prefers «прайс-лист» for line sheet, i=71/110/128 need rewording too.

---

**English:** Private label

**Russian:** Собственная торговая марка

"Private label" is rendered as «Собственная торговая марка» (heading), shortened to «собственная марка» / «под вашей маркой» in running text (i=26, 44, 124, 133, 141). The Latin "private label" and the abbreviation СТМ are both current in Russian retail — say the word if you want either instead; it affects six strings.

---

**English:** 1,000–10,000 units a month

**Russian:** 1 000–10 000 штук в месяц

Thousands separator changed from the English comma to a space (1,000 -> 1 000, 10,000 -> 10 000) — Russian typography, digits unchanged. Same in i=8 and i=9.

---

**English:** App&#39;Lite Apple Bar 35 g

**Russian:** Яблочный батончик App&#39;Lite 35 г

The HTML entity &#39; in "App&#39;Lite" is reproduced verbatim, as is the curly apostrophe in "App’Lite" in i=81. Product descriptors (Apple Bar, Flourless Bar, Baked Apple Dessert, Apple Meringues, Apple Zephyr, Apple Pastila) are treated as descriptions and translated; only the brands App'Lite, PastiLite, Belevini stay in Latin. If any of these are registered pack names, they should be restored to Latin in i=24, 25, 29, 30, 31, 54, 93 and in the running text of i=6, 59, 81, 123.

---

**English:** export markets in the EU

**Russian:** экспортных рынков в ЕС

Fragment. Assumed it follows a numeral of 5 or more (i=77 says "5 export markets"), so genitive plural «экспортных рынков в ЕС». If the number in the layout is 2, 3 or 4, this must become «экспортных рынка в ЕС».

---

**English:** months on an ambient shelf

**Russian:** месяцев на полке при комнатной температуре

Fragment. Assumed it follows 12 (genitive plural «месяцев»). Correct only if the figure stays 12 or another number that takes the genitive plural.

---

**English:** I agree that Semers stores this enquiry to reply to it. Read the

**Russian:** Соглашаюсь, что Semers сохранит этот запрос, чтобы на него ответить. Читайте

Ends mid-sentence before a link. «Читайте» requires the link text that follows to be in the accusative — «политику конфиденциальности», not «политика конфиденциальности». Also used the gender-neutral «Соглашаюсь» so the checkbox works for any signer.

---

**English:** with your company name and country and we will send the line sheet the same way.

**Russian:** с названием вашей компании и страной, и мы пришлём каталог тем же способом.

Fragment that continues an e-mail link. It assumes the preceding text reads «Напишите на <адрес>» — i.e. the link is followed by «с названием вашей компании…». A comma before «и мы пришлём» is required by Russian grammar even though the English has none.

---

**English:** You are a

**Russian:** Вы —

Form label before a select ("You are a" + Retail chain / Café or HoReCa / …). Rendered as «Вы —»; the dash stands in for the missing copula, which Russian requires. If it looks bare in the layout, «Тип компании» is the safe alternative but drops the sentence-completion effect.

---

**English:** Put a 99% apple snack

**Russian:** Поставьте снек из 99% яблока

Split sentence: i=97 + i=87 concatenate to «Поставьте снек из 99% яблока на вашу полку.» i=87 is therefore in the accusative (direction), not the prepositional. If anything sits between the two fragments in the markup, check the join.

---

**English:** Order a Tasting Box today. Talk wholesale tomorrow.

**Russian:** Закажите дегустационный набор сегодня. Об опте поговорим завтра.

"Tasting Box" is translated as «дегустационный набор» (also i=123). It is not on the protected brand list; if it is a shop SKU name that must stay in Latin, both strings need changing.

---

**English:** Café or HoReCa

**Russian:** Кафе или HoReCa

HoReCa, SKU, EAN, B2B are kept in Latin script — all are standard as-is in Russian trade copy. Also i=12, 17, 21, 33, 43, 46, 47, 57, 89, 135, 138, 140.

---

**English:** Wholesale apple bars &amp; pastila for shops and cafés — Semers

**Russian:** Яблочные батончики и пастила оптом для магазинов и кафе — Semers

The HTML entity &amp; is resolved into the word «и» in i=3, 33 and 135, since Russian has no idiomatic ampersand in body copy. If the source pipeline re-escapes these strings, no entity is needed in the output.

---

**English:** A snack drawer that does not end in a four o’clock slump. Boxes of bars for kitchens, meetings and welcome packs.

**Russian:** Ящик со снеками, после которого не наступает упадок сил к четырём часам. Коробки батончиков для кухни, переговорных и приветственных наборов.

"a four o'clock slump" is rendered as «упадок сил к четырём часам» — the hour is kept as a word, as in the English.

---

**English:** Same bars, same pastila, packed for the way you sell. Pick the line that sounds like you.

**Russian:** Те же батончики, та же пастила — упакованы под то, как продаёте вы. Выберите пункт, который про вас.

"Pick the line that sounds like you" — "line" read as a row in the list of buyer types above, not a product line. Translated «Выберите пункт, который про вас».

---

### Latvian — wholesale

**English:** Request the line sheet

**Latvian:** Pieprasīt sortimenta lapu

"Line sheet" has no settled Latvian equivalent. I used „sortimenta lapa” consistently everywhere it appears (5, 55, 70, 71, 110, 121, 128, 129, 137, 138) and kept it distinct from „cenrādis” (price list, i=15), because the English lists them as separate documents. If the company already uses another in-house term (e.g. „sortimenta katalogs”), swap it in all ten places.

---

**English:** 1,000–10,000 units a month

**Latvian:** 1000–10 000 vienību mēnesī

English uses a comma as the thousands separator (1,000). Latvian convention is a thin/space separator, so this is rendered 1000–10 000; every digit is preserved. Same in 8 and 9.

---

**English:** Wholesale apple bars &amp; pastila for shops and cafés — Semers

**Latvian:** Ābolu batoniņu un pastilas vairumtirdzniecība veikaliem un kafejnīcām — Semers

The source contains the HTML entity &amp;. I rendered the conjunction as the Latvian word „un” instead of keeping an ampersand, since „&” between two nouns is not idiomatic in Latvian running text. Same decision in 33 and 135. If the entity must survive for a markup-integrity check, tell me and I will restore it.

---

**English:** App&#39;Lite Apple Bar 35 g

**Latvian:** App&#39;Lite ābolu batoniņš 35 g

Kept the HTML entity &#39; inside App&#39;Lite exactly as in the source (same in 25). In 81 the source uses the typographic apostrophe App’Lite, and that form is preserved there.

---

**English:** App&#39;Lite Apple Bar 35 g

**Latvian:** App&#39;Lite ābolu batoniņš 35 g

Formats-table SKU names: brand tokens (App'Lite, PastiLite, Belevini) stay in Latin script, but the descriptive part is translated, since the brief itself directs "Belyov pastila" → „Beļovas pastila”. This affects 24, 25, 29, 30, 31, 54, 93. If these names are locked catalogue strings that must match the labels on the packs, they should be left in English instead — flagging so a human can confirm against the actual packaging.

---

**English:** Order a Tasting Box today. Talk wholesale tomorrow.

**Latvian:** Pasūtiet Degustācijas kasti šodien. Par vairumtirdzniecību parunāsim rīt.

"Tasting Box" is not in the protected-name list, so I translated it as a product name: „Degustācijas kaste” (also in 123). Confirm this matches whatever the Latvian web shop calls that SKU.

---

**English:** Malta

**Latvian:** Malta

"Malta" is unchanged — the country name is identical in Latvian.

---

**English:** 7 formats · 29 SKUs ·

**Latvian:** 7 formāti · 29 SKU ·

SKU, EAN, HoReCa and B2B are left as-is; all four are used untranslated in Latvian trade copy. Affects 12, 17, 32, 33, 43, 46, 47, 89, 135, 138, 140.

---

**English:** Put a 99% apple snack

**Latvian:** Nolieciet 99% ābolu uzkodu

97 and 87 are the two halves of one sentence. Concatenated they read „Nolieciet 99% ābolu uzkodu jūsu plauktā.” — the word order was chosen so the join works with whatever markup sits between them.

---

**English:** with your company name and country and we will send the line sheet the same way.

**Latvian:** norādot uzņēmuma nosaukumu un valsti, un mēs nosūtīsim sortimenta lapu tāpat.

This fragment follows an e-mail link ("Prefer e-mail? Write to <address> with your company name…"). I started it with the participle „norādot” rather than a preposition, because Latvian cannot begin the clause with a bare „ar” after a linked address without reading as a broken sentence. It still starts lowercase and adds no punctuation the English lacks.

---

**English:** I agree that Semers stores this enquiry to reply to it. Read the

**Latvian:** Piekrītu, ka Semers saglabā šo pieprasījumu, lai uz to atbildētu. Izlasiet

Fragment ends before a link (presumably „privātuma politiku”). The Latvian „Izlasiet” expects the linked noun in the accusative — please make sure the link text in the other batch is „privātuma politiku”, not the nominative „privātuma politika”.

---

**English:** In Latvia at Maxima and on Barbora, and through selected retailers in Germany, Poland, Lithuania, Austria and Bulgaria. See the Where to buy page for the list.

**Latvian:** Latvijā — Maxima veikalos un Barbora, kā arī pie atsevišķiem mazumtirgotājiem Vācijā, Polijā, Lietuvā, Austrijā un Bulgārijā. Sarakstu skatiet lapā „Kur nopirkt”.

„Kur nopirkt” and (in 141) „Vairumtirdzniecība” are page names quoted with Latvian „ ” marks. They should match the actual Latvian navigation labels; if those pages are named differently, align them.

---

**English:** A snack drawer that does not end in a four o’clock slump. Boxes of bars for kitchens, meetings and welcome packs.

**Latvian:** Uzkodu atvilktne, kas nebeidzas ar enerģijas kritumu pulksten četros. Batoniņu kastes virtuvēm, sanāksmēm un sveiciena komplektiem.

"a four o'clock slump" has no fixed Latvian idiom; rendered literally as „enerģijas kritums pulksten četros”, which keeps the plain, unhurried register without adding a marketing claim.

---

**English:** Same bars, same pastila, packed for the way you sell. Pick the line that sounds like you.

**Latvian:** Tie paši batoniņi, tā pati pastila, iepakoti tā, kā jūs pārdodat. Izvēlieties to rindu, kas ir par jums.

"Pick the line that sounds like you" — "line" read as a row in the preceding audience list, not a product line. Translated as „rindu”. If it means a product range here, it should be „sortimenta līniju” instead.

---

### Russian — story

**English:** App&#39;Lite

**Russian:** App&#39;Lite

Left unchanged: brand name. The source carries the HTML entity &#39; for the apostrophe, so I returned the entity verbatim rather than a literal apostrophe. Same in i=5. Note that i=28 and i=75 use a curly ’ instead — that inconsistency is in the English source, and I preserved each form as given.

---

**English:** Flourless

**Russian:** Без муки

"Flourless" is one of the five line names on the packs (alongside App'Lite, PastiLite, Belyov Pastila, Belevini), but it is an English word rather than a Latin-script brand, and it is not on the protected list. I translated it as «Без муки», matching i=10 and i=24. If the pack itself prints "Flourless" in Latin script, revert this one string.

---

**English:** Maxima &amp; Barbora

**Russian:** Maxima &amp; Barbora

Left unchanged: two retailer brand names. The &amp; entity is preserved as written.

---

**English:** . Questions about ordering are answered in the

**Russian:** . Ответы на вопросы о заказе — в разделе

Fragment ending in an open preposition. I used «...— в разделе» so the following link text lands in the prepositional case. If the link reads «FAQ» or «Часто задаваемые вопросы», it works; if the link is a verb phrase, this needs a rewrite. Please check against the linked string.

---

**English:** A sour apple, an old recipe and a bakery in

**Russian:** Кислое яблоко, старый рецепт и пекарня в

Fragment ends with the preposition «в», which in Russian requires the following place name in the prepositional case («в Риге», not «в Рига»). If "Riga" is a separate highlighted string translated elsewhere as «Рига», this sentence will break. It should be «Риге» in that slot.

---

**English:** Apple zephyr, the soft marshmallow of the east, set with agar. The one line in our range that does contain sugar, and the pack says so.

**Russian:** Яблочный зефир, мягкий маршмеллоу востока, застывший на агаре. Единственная линейка в нашем ассортименте, где сахар всё-таки есть, — и на упаковке это написано.

"the soft marshmallow of the east" is kept literally as «мягкий маршмеллоу востока». A Russian reader needs no explanation of what zephyr is, so the gloss reads slightly oddly; I left it because cutting it would drop content. Flagging in case you want it dropped for the RU version.

---

**English:** Belyov pastila first sold

**Russian:** Белёвская пастила впервые в продаже

i=39 and i=40 are near-duplicates in the English ("first sold" vs "is first sold"). I kept them as two distinct strings — a compact label and a present-tense timeline line — matching the English distinction.

---

**English:** Gift sets, tasting boxes and the box of twelve live under

**Russian:** Подарочные наборы, дегустационные коробки и коробка из двенадцати живут в разделе

Same open-preposition issue as i=13: «...живут в разделе» expects the following link (i=48, «подарочные наборы») as a section name. It reads acceptably as a label but is not fully inflected. Worth checking on the rendered page.

---

**English:** keeps the sweetness honest

**Russian:** не даёт сладости стать приторной

"keeps the sweetness honest" became «не даёт сладости стать приторной» (keeps the sweetness from turning cloying) — the literal «честная сладость» is not idiomatic in Russian. The same wording is used inside i=27 so the label and the paragraph match. Note this deliberately differs from «Честные этикетки» (i=51), where "honest" is literal and does work.

---

**English:** Parcels leave Riga in 1–2 business days and ship across the EU; orders over €25 ship free. Retailer, café or office? We pack cases as happily as parcels.

**Russian:** Посылки уходят из Риги за 1–2 рабочих дня и доставляются по всему ЕС; заказы дороже 25 € отправляем бесплатно. Магазин, кафе или офис? Короба мы пакуем так же охотно, как посылки.

€25 is written as «25 €» per Russian typography (symbol after the number). The digits are unchanged. The en dash in «1–2» is preserved.

---

**English:** The front of the pack says what the back of the pack says. No “natural flavouring”, no E-numbers, no claims we cannot stand behind. Where a product does contain sugar, as our Belevini zephyr does, the label says so plainly.

**Russian:** На лицевой стороне упаковки написано то же, что и на обороте. Никаких «натуральных ароматизаторов», никаких Е-добавок, никаких обещаний, за которые мы не можем отвечать. Если в продукте всё же есть сахар — как в нашем зефире Belevini, — на этикетке об этом сказано прямо.

"E-numbers" rendered as «Е-добавок» with a Cyrillic Е, which is how additive codes are written on Russian-language labels. If your label copy uses the Latin E (E322 etc.), switch this letter for consistency.

---

**English:** The original loaf, in the shape it has had since 1888. The 100 g is the one to try first; the 180 g is for the table.

**Russian:** Тот самый брусок, в той же форме, что и с 1888 года. С 100 г стоит начать; 180 г — для стола.

"loaf" is translated as «брусок» throughout (i=0, 15, 17, 41, 46, 71, 87, 91) — the rectangular block you slice. I avoided «пласт» because the English uses "sheets" for the individual dried layers that get stacked into the loaf, and «пласт» is the natural word for those (used in i=50, 94).

---

### Russian — how-its-made

**English:** added sugar

**Russian:** добавленного сахара

Fragment. Translated genitive («добавленного сахара») so it concatenates after i=4 «0 г» → «0 г добавленного сахара». If it is ever used standalone as a label it would need the nominative «добавленный сахар».

---

**English:** How apple pastila is made: baked apples &amp; egg white — Semers

**Russian:** Как делают яблочную пастилу: печёные яблоки и яичный белок — Semers

The source contains the HTML entity &amp;. An ampersand is not idiomatic in a Russian page title, so it is rendered as «и». If the entity must survive literally in the markup, replace «и» with &amp;.

---

**English:** baked Antonovka apples

**Russian:** печёных яблок антоновки

Ambiguous fragment. Rendered genitive («печёных яблок антоновки»), which fits both «99% baked Antonovka apples» and «made from baked Antonovka apples». If it actually stands alone as a nominative label it should be «печёные яблоки антоновки» (cf. i=41, which is the capitalised nominative form).

---

**English:** Cut &amp; pack

**Russian:** Режем и пакуем

Source contains &amp;; rendered as «и» for the same reason as i=10.

---

**English:** Bake

**Russian:** Печём

Stage chips (i=13 Bake, 18 Whip, 51 Dry, 67 Layer, 87 Spread, 15 Cut & pack) are rendered as short 1st-person-plural verbs (Печём / Взбиваем / Сушим / Собираем / Наносим / Режем и пакуем), matching the English verb-stem form; i=40 Apples and i=79 Purée stay nouns, as in English. All are the same length or shorter than the English.

---

**English:** Layer

**Russian:** Собираем

«Layer» as a verb has no one-word Russian equivalent; «Собираем» (assemble) is used. The layer sense is carried by the full stage name i=68 «Сборка слоёв и прессование».

---

**English:** Allergens: contains egg. May contain traces of nuts, and the Pine Nut loaf contains them outright. The full allergen line is on each product page.

**Russian:** Аллергены: содержит яйцо. Может содержать следы орехов, а брусок с кедровым орехом содержит их в составе. Полная строка аллергенов указана на странице каждого продукта.

Allergen line kept literal and complete. Two judgement calls: «Pine Nut loaf» is not on the keep-in-Latin list, so it is translated as «брусок с кедровым орехом» — if this is a fixed product name it should be restored to Latin script. «contains them outright» is rendered «содержит их в составе» (i.e. as a declared ingredient, not as traces); please confirm this is the intended legal reading.

---

**English:** Antonovka, and only Antonovka. It is a tart, aromatic northern apple with plenty of pectin and acid, which is what lets the purée set without gelatine and taste of fruit rather than sugar. Sweet dessert apples make a flat, sticky pastila; sour ones make it sing.

**Russian:** Антоновка, и только антоновка. Это кислое ароматное северное яблоко с большим запасом пектина и кислоты — именно поэтому пюре застывает без желатина и на вкус остаётся фруктом, а не сахаром. Из сладких десертных яблок пастила выходит плоской и липкой; из кислых — она звучит.

«make it sing» is an idiom; rendered «из кислых — она звучит», which keeps the same plain register. Alternative if it reads too literary: «из кислых — живая».

---

**English:** Colours

**Russian:** Красители

Read as «colourings» (the never-add list, cf. i=30) rather than «colours» in the visual sense: «Красители».

---

**English:** Dried sheets are brushed with a little of the same apple foam, stacked several high and pressed into a block. The foam glues the layers together, and the whole block goes back into the warmth to set. This layering is the Belyov signature, and the reason a cut face looks like the pages of a book.

**Russian:** Высушенные пласты промазываются той же яблочной пеной, складываются в несколько слоёв и прессуются в блок. Пена склеивает слои, и весь блок снова уходит в тепло, чтобы схватиться. Эта сборка слоёв — фирменная черта белёвской пастилы и причина, по которой срез похож на страницы книги.

«block» is rendered «блок» and «loaf» «брусок» throughout (i=50, 89, 96, 97, 106) so the two do not collapse into one word — i=96 lists both in the same sentence.

---

**English:** For bars, dessert squares and pastila, in a cool, dry cupboard. Meringues and zephyr keep for less; the date on the pack is the one to trust.

**Russian:** Для батончиков, десертных квадратиков и пастилы — в прохладном сухом шкафу. Меренги и зефир хранятся меньше; доверять стоит дате на упаковке.

«dessert squares» rendered «десертные квадратики» (also i=107, 96). If the product has an established Russian name on the packaging, use that instead.

---

**English:** Taste the twelve hours

**Russian:** Попробуйте эти двенадцать часов

«Taste the twelve hours» is a heading; rendered «Попробуйте эти двенадцать часов». Deliberately kept short for the CTA block — it loses a little of the English wordplay.

---

**English:** This is the recipe for our pastila, Apple Bars, Flourless Bars, meringues and dessert squares. Belevini zephyr is a different confection: it is set with agar and does contain sugar, which is why it does not carry the no-added-sugar mark. Full ingredient lines are on every product page and every pack.

**Russian:** Это рецепт нашей пастилы, яблочных батончиков, батончиков без муки, меренг и десертных квадратиков. Зефир Belevini — другое кондитерское изделие: он застывает на агаре и содержит сахар, поэтому на нём нет отметки «без добавленного сахара». Полные составы указаны на каждой странице продукта и на каждой упаковке.

«Apple Bars» and «Flourless Bars» are capitalised like product names but are not on the keep-in-Latin list, so they are translated («яблочных батончиков, батончиков без муки»). If they are official product line names alongside App'Lite / PastiLite, they should stay in Latin script. Belevini kept in Latin as instructed.

---

**English:** — the gold is caramelised apple

**Russian:** — золотистый цвет даёт карамелизованное яблоко

English is «the gold IS caramelised apple»; rendered «золотистый цвет даёт карамелизованное яблоко» to avoid a second dash inside a line that already opens with one. A literal version would be «— золотистый цвет — это карамелизованное яблоко».

---

**English:** No fridge, ever

**Russian:** Холодильник не нужен никогда

«No fridge, ever» rendered «Холодильник не нужен никогда» (4 words). If it sits in a narrow stat tile, «Без холодильника» is the shorter fallback.

---

### Latvian — how-its-made

**English:** How apple pastila is made: baked apples &amp; egg white — Semers

**Latvian:** Kā top ābolu pastila: cepti āboli un olu baltums — Semers

The HTML entity &amp; was rendered as the Latvian word „un“ rather than kept as an ampersand entity — an ampersand between two nouns reads as a design tic in Latvian. If the pipeline compares entity counts, restore "&amp;" here and in i=15. Title length is 56 characters, still inside the SEO limit.

---

**English:** baked Antonovka apples

**Latvian:** cepti Antonovkas āboli

AMBIGUOUS. Lowercase fragment. Translated in the nominative ("cepti Antonovkas āboli"), which fits an ingredient or spec line. If this fragment is actually concatenated after a percentage (e.g. "99% " + this string, mirroring the 0 g / added sugar pair at i=4 and i=8), Latvian requires the genitive and it must become "ceptu Antonovkas ābolu". Please check the /wholesale/ markup.

---

**English:** added sugar

**Latvian:** pievienota cukura

Translated as a genitive ("pievienota cukura") on the assumption it concatenates after i=4 "0 g" into "0 g pievienota cukura". If it stands alone as its own label, it should be the nominative "pievienotais cukurs".

---

**English:** Bake

**Latvian:** Cepšana

The eight stage chips (i=40 Āboli, 13 Cepšana, 79 Biezenis, 18 Putošana, 87 Klāšana, 51 Žāvēšana, 67 Slāņošana, 15 Griešana un pakošana) are rendered as verbal nouns, not imperatives. Latvian imperatives ("Cep", "Puto") would read as instructions addressed to the reader, which clashes with the formal-plural voice used in the body copy. The nouns are 3–4 characters longer than the English; i=15 is the worst case (20 chars vs 10) — worth eyeballing in the chip row.

---

**English:** Allergens: contains egg. May contain traces of nuts, and the Pine Nut loaf contains them outright. The full allergen line is on each product page.

**Latvian:** Alergēni: satur olu. Var saturēt riekstu pēdas, un Pine Nut klaips tos satur kā sastāvdaļu. Pilnā alergēnu informācija ir norādīta katra produkta lapā.

"Pine Nut loaf" — kept "Pine Nut" in Latin script as a product-variant name, since it is capitalised here while the generic "pine nuts" at i=115 is lowercase and was translated ("ciedru rieksti"). If Pine Nut is NOT a fixed product name, this should be "ciedru riekstu klaips". Also: "contains them outright" was rendered "tos satur kā sastāvdaļu" (contains them as an ingredient) — a literal Latvian rendering of "outright" is not idiomatic, and this keeps the allergen distinction between traces and a declared ingredient explicit. Nothing was softened or dropped.

---

**English:** This is the recipe for our pastila, Apple Bars, Flourless Bars, meringues and dessert squares. Belevini zephyr is a different confection: it is set with agar and does contain sugar, which is why it does not carry the no-added-sugar mark. Full ingredient lines are on every product page and every pack.

**Latvian:** Šī ir mūsu pastilas, Ābolu batoniņu, Bezmiltu batoniņu, bezē un deserta kvadrātiņu recepte. Belevini zefīrs ir cits konditorejas izstrādājums: to sastingdina ar agaru un tas satur cukuru, tāpēc tam nav „bez pievienota cukura“ marķējuma. Pilni sastāvdaļu saraksti ir norādīti katrā produkta lapā un uz katra iepakojuma.

"Apple Bars" and "Flourless Bars" were translated ("Ābolu batoniņi", "Bezmiltu batoniņi") because they are not in the protected brand list (Semers, App'Lite, PastiLite, Belevini). If they are registered product-line names that appear untranslated on the Latvian packaging, revert them to English. "Belevini" kept as given.

---

**English:** Batch code and best-before date, printed at packing, so any pack can be traced back to the batch it came from.

**Latvian:** Partijas kods un ieteicamais izlietošanas datums, uzdrukāti iepakošanas brīdī, lai jebkuru iepakojumu varētu izsekot līdz partijai, no kuras tas nācis.

"best-before date" rendered as "ieteicamais izlietošanas datums", the Latvian food-labelling term matching EU "best before" (as opposed to "izlietot līdz" = use by). Confirm which of the two the packs actually print.

---

**English:** For bars, dessert squares and pastila, in a cool, dry cupboard. Meringues and zephyr keep for less; the date on the pack is the one to trust.

**Latvian:** Batoniņiem, deserta kvadrātiņiem un pastilai — vēsā, sausā skapī. Bezē un zefīrs glabājas mazāk; ticēt vajag datumam uz iepakojuma.

"bezē" (meringue) is indeclinable in Latvian, so it stays unchanged in every case throughout the batch (also i=53, i=107).

---

**English:** From Belyov, 1888, to Riga

**Latvian:** No Beļovas 1888. gadā līdz Rīgai

The bare year "1888" required ". gadā" to be grammatical in Latvian; the digits are untouched. Same at i=106.

---

**English:** Antonovka, and only Antonovka. It is a tart, aromatic northern apple with plenty of pectin and acid, which is what lets the purée set without gelatine and taste of fruit rather than sugar. Sweet dessert apples make a flat, sticky pastila; sour ones make it sing.

**Latvian:** Antonovka un tikai Antonovka. Tas ir skābens, aromātisks ziemeļu ābols ar daudz pektīna un skābes, un tieši tas ļauj biezenim sastingt bez želatīna un garšot pēc augļa, nevis pēc cukura. No saldiem deserta āboliem sanāk plakana, lipīga pastila; no skābajiem tā atdzīvojas.

"make it sing" is an idiom with no Latvian equivalent that keeps the plain register; rendered as "tā atdzīvojas" (it comes alive). No exclamation or superlative added.

---

**English:** ~12 h

**Latvian:** ~12 h

"~12 h" returned unchanged — the tilde, the digits and the unit abbreviation "h" are all identical in Latvian.

---

**English:** Colours

**Latvian:** Krāsvielas

"Colours" read as colourings (food additives) from the paired fragment at i=30, hence "Krāsvielas" not "Krāsas".

---

**English:** Transparency

**Latvian:** Atklātība

"Transparency" translated as "Atklātība" (openness/candour), not "Caurspīdīgums" (optical transparency), which is the sense the section actually carries.

---

**English:** Why that matters for what you eat

**Latvian:** Kāpēc tas ir svarīgi tam, ko ēdat

Second person is rendered with the formal plural (Jūs form) throughout — "ēdat", "neatradīsiet" (i=112), "Sāciet" (i=89), "turiet" (i=83), "Pārgrieziet" (i=49), "Nogaršojiet" (i=94). If the Latvian site elsewhere uses the informal singular, all of these need switching together.

---

### Russian — why-pastila

**English:** apples

**Russian:** яблок

Ambiguous fragment. Translated as the genitive «яблок», which fits the most likely context (a stat like "99% apples" → «99% яблок»). If it is actually a standalone chart legend or an ingredient-list item, it should be nominative «яблоки». Please confirm where it sits.

---

**English:** ours

**Russian:** наш

«ours» rendered as masculine «наш», assuming it labels our bar (батончик, masc.) in the comparison chart. If the label refers to пастила (fem.) or to значения (pl.), it needs «наша» / «наши».

---

**English:** Ingredients

**Russian:** Ингредиенты

Rendered as «Ингредиенты» (works as a chart metric next to "10 or more"). If this heads the food label itself rather than a count, Russian would normally say «Состав».

---

**English:** journal

**Russian:** журнале

Link text rendered in the prepositional case «журнале» so it concatenates with i=28 («…— в журнале»). If the link label is used standalone anywhere, it should read «журнал».

---

**English:** Chocolate, granola and dried-apple figures are typical values for mainstream products in each category, rounded. An Apple Bar still contains about 20 g of sugars, all of them the apple’s own; we would rather you knew. Apple Bar values are typical for the recipe; see the pack for the batch label. More on reading labels in the

**Russian:** Данные по шоколаду, граноле и сушёному яблоку — это округлённые типичные значения для массовых продуктов каждой категории. В яблочном батончике всё же около 20 г сахаров, и все они — собственные, яблочные; нам важно, чтобы вы это знали. Значения яблочного батончика типичны для рецептуры; данные конкретной партии — на упаковке. Подробнее о том, как читать этикетки, — в

"see the pack for the batch label" rendered as «данные конкретной партии — на упаковке», i.e. the pack carries the batch's own figures. Numbers 20 g kept.

---

**English:** App’Lite Dessert

**Russian:** Десерт App’Lite

"App'Lite Dessert": brand App'Lite kept in Latin, the generic word translated → «Десерт App’Lite», capitalised because English capitalises it as a product name. If it must stay fully in Latin as a registered product name, revert to "App'Lite Dessert".

---

**English:** About 97 kcal per 35 g Apple Bar, around 140 kcal per 50 g Flourless Bar and roughly 278 kcal per 100 g of pastila. A typical 45 g milk chocolate bar is around 240 kcal.

**Russian:** Около 97 ккал в яблочном батончике 35 г, примерно 140 ккал в батончике без муки 50 г и порядка 278 ккал в 100 г пастилы. В типичной плитке молочного шоколада 45 г — около 240 ккал.

"Apple Bar" and "Flourless Bar" are not in the protected brand list, so they are translated as descriptors: «яблочный батончик», «батончик без муки». Applied consistently at i=14, 28, 33, 73, 84. Revert if they are registered product names.

---

**English:** Baked apples and egg white. About 1.8 g fibre from the whole fruit; the sweetness is the apple’s own.

**Russian:** Печёные яблоки и яичный белок. Около 1,8 г клетчатки из целого плода; сладость — собственная, яблочная.

Decimal point converted to the Russian decimal comma: 1.8 g → «1,8 г». Digits unchanged; flagging because it touches a number.

---

**English:** 180 g Belyov loaf

**Russian:** Белёвский брусок 180 г

"loaf" rendered as «брусок» throughout (i=6, 11, 12, 67, 70, 87) for consistency. «Пласт» is the more traditional term for Belyov pastila but reads as a thin sheet, which clashes with the 180 g sliceable block; the drying sheets at i=62 are «пласты».

---

**English:** Weighs 35 g, lies flat in a jersey pocket, does not melt, and keeps for months without a fridge.

**Russian:** Весит 35 г, лежит плашмя в кармане спортивной формы, не тает и хранится месяцами без холодильника.

"jersey pocket" rendered as «карман спортивной формы» — «карман джерси» would only be read correctly by cyclists, and the audience card is hikers and runners.

---

**English:** What comes out is neither a fruit leather nor a cake. It is soft, fibrous and slightly springy, and it tastes of baked apple and very little else. The loaf becomes a bar when we cut it, a meringue when we bake it, a dessert square when we press it thicker. The ingredient list does not change on the way.

**Russian:** То, что получается, — не фруктовый лаваш и не пирожное. Она мягкая, волокнистая, слегка пружинит, и на вкус это печёное яблоко и почти ничего больше. Брусок становится батончиком, когда мы его режем, меренгой — когда запекаем, десертным квадратиком — когда прессуем толще. Состав по дороге не меняется.

"fruit leather" rendered as «фруктовый лаваш», the closest common Russian term. If you prefer, «фруктовые чипсы» is more widely understood but less accurate.

---

**English:** Try the Tasting Box

**Russian:** Попробовать дегустационный набор

"Tasting Box" translated («дегустационный набор») as it is not in the protected brand list. If it is a product name, it should stay in Latin. The Russian button is longer than the English — consider «Дегустационный набор» alone if the control is tight.

---

**English:** you’re holding.

**Russian:** у вас в руках.

Fragment restructured to «у вас в руках.» so it concatenates without a relative pronoun and stays gender-neutral for whatever noun precedes it (i=34 + i=22 + i=97 reads «Не для кармана, а для тарелки: Десерт App’Lite у вас в руках.»). A literal «который вы держите» would have forced a gender guess and an extra comma.

---

**English:** 30 g · typical

**Russian:** 30 г · типично

"typical" in the chip labels (i=7, 9, 10) rendered as «типично» to stay as short as the English and consistent with «Типичные значения» at i=84.

---

**English:** Desk snackers

**Russian:** Те, кто перекусывает за столом

Audience headings (i=30, 36, 38, 49, 64) kept parallel in Russian. «Те, кто перекусывает за столом» and «Родители со школьными ланчбоксами» are noticeably longer than the English; if these are fixed-width cards, «Перекус за столом» and «Родители школьников» are shorter fallbacks.

---

### Latvian — why-pastila

**English:** App’Lite Dessert

**Latvian:** App’Lite Dessert

Left in English unchanged: „App’Lite Dessert“ is a product name built on the App’Lite brand. If the site elsewhere translates the word „Dessert“, this should follow that choice.

---

**English:** apples

**Latvian:** ābolu

Ambiguous bare fragment. I assumed it follows a figure (e.g. „99%“) and used the genitive „ābolu“, which is what Latvian requires after a percentage or quantity. If it is a standalone nominative label sitting on its own, it must be „āboli“ instead. Please confirm the surrounding markup.

---

**English:** Baked apples and egg white. About 1.8 g fibre from the whole fruit; the sweetness is the apple’s own.

**Latvian:** Cepti āboli un olu baltums. Ap 1,8 g šķiedrvielu no vesela augļa; saldums ir paša ābola.

„1.8 g“ rendered with the Latvian decimal comma as „1,8 g“ — digits unchanged, only the separator follows Latvian convention. Revert to a full stop if the build compares the string literally.

---

**English:** Chocolate, granola and dried-apple figures are typical values for mainstream products in each category, rounded. An Apple Bar still contains about 20 g of sugars, all of them the apple’s own; we would rather you knew. Apple Bar values are typical for the recipe; see the pack for the batch label. More on reading labels in the

**Latvian:** Šokolādes, granolas un žāvēto ābolu skaitļi ir noapaļotas tipiskas vērtības katras kategorijas populārākajiem produktiem. Ābolu batoniņā joprojām ir ap 20 g cukuru, un visi tie ir paša ābola; mēs gribam, lai jūs to zinātu. Ābolu batoniņa vērtības ir tipiskas šai receptei; partijas marķējumu skatiet uz iepakojuma. Vairāk par etiķešu lasīšanu

Trailing fragment reworded so the link text in entry 48 completes it: „Vairāk par etiķešu lasīšanu“ + „žurnālā“ + „.“ = „Vairāk par etiķešu lasīšanu žurnālā.“ The English „in the“ has no Latvian equivalent word; the case ending on the link text carries it.

---

**English:** journal

**Latvian:** žurnālā

Link text put in the locative („žurnālā“) so it reads correctly inside the sentence from entry 28. If this string is ever reused as a standalone nav label, it would need the nominative „žurnāls“.

---

**English:** ours

**Latvian:** mūsu

Bare „ours“, lowercase. Translated as „mūsu“ on the assumption it labels the Semers row/series in the comparison chart. If it completes a sentence instead, the form may need to change (e.g. „mūsējie“ / „mūsējās“).

---

**English:** Pastila is a traditional confection from the town of Belyov, first made commercially in 1888 by the merchant Amvrosy Prokhorov. The method has barely changed since. Sour Antonovka apples are baked whole until their sugars caramelise. The purée is whipped with egg white until it holds air, spread in thin sheets and dried for hours at low heat. The sheets are stacked, pressed and dried again.

**Latvian:** Pastila ir tradicionāls saldums no Beļovas pilsētas; pirmoreiz to komerciāli ražoja 1888. gadā tirgotājs Amvrosijs Prohorovs. Kopš tā laika metode gandrīz nav mainījusies. Skābos Antonovkas ābolus cep veselus, līdz to cukuri karamelizējas. Biezeni saputo ar olu baltumu, līdz tas notur gaisu, izklāj plānās kārtās un vairākas stundas žāvē zemā temperatūrā. Kārtas sakrauj, saspiež un žāvē vēlreiz.

The personal name is transliterated to Latvian as „Amvrosijs Prohorovs“, consistent with the required „Beļovas“ for Belyov. It is not on the do-not-translate brand list; say the word if you want it kept as „Amvrosy Prokhorov“.

---

**English:** you’re holding.

**Latvian:** ko turat rokās.

Latvian grammar requires a comma before this relative clause („…batoniņu, ko turat rokās.“). I did not add one, per the rule against introducing punctuation the English lacks, because the fragments appear to be joined with a space and a leading comma would render as „batoniņu , ko…“. Either the preceding fragment must end with a comma, or this fragment should be merged into the full sentence.

---

**English:** About 97 kcal per 35 g Apple Bar, around 140 kcal per 50 g Flourless Bar and roughly 278 kcal per 100 g of pastila. A typical 45 g milk chocolate bar is around 240 kcal.

**Latvian:** Ap 97 kcal 35 g ābolu batoniņā, ap 140 kcal 50 g bezmiltu batoniņā un aptuveni 278 kcal 100 g pastilas. Tipiskā 45 g piena šokolādes tāfelītē ir ap 240 kcal.

„Apple Bar“ and „Flourless Bar“ treated as descriptive product names and translated („ābolu batoniņš“, „bezmiltu batoniņš“). Same choice applied at i=28, 33, 73, 84. If these are fixed catalogue names that must stay in English, they should be reverted everywhere at once.

---

**English:** Try the Tasting Box

**Latvian:** Izmēģināt degustācijas kasti

„Tasting Box“ translated as „degustācijas kaste“. If it is a fixed product name in the shop, keep it in English. Button length is close to the English.

---

**English:** 30 g · typical

**Latvian:** 30 g · tipiski

„typical“ rendered as the neutral adverbial „tipiski“ so the same string works after any product gender (chocolate = feminine tāfelīte, granola bar = masculine batoniņš, dried apple = masculine ābols). Same at i=9 and i=10.

---

**English:** months, no fridge

**Latvian:** mēneši, bez ledusskapja

Fragment „months, no fridge“ assumed to follow the numeral 12; „mēneši“ is the correct nominative plural after 12 in Latvian („12 mēneši“). If the preceding number is 11 or 21, Latvian would need the singular „mēnesis“ — confirm the number is fixed at 12.

---

**English:** Desk snackers

**Latvian:** Uzkodu ēdāji birojā

„Desk snackers“ has no compact Latvian equivalent. Used „Uzkodu ēdāji birojā“, taking the office reading from the paired description at i=75 (vending machine, four o'clock).

---

**English:** One bar in the corner of the box. It does not leak, melt or crumble, and it is still good at three.

**Latvian:** Viens batoniņš kastītes stūrī. Tas netek, nekūst un nedrūp, un pulksten trijos tas joprojām ir labs.

„still good at three“ read as three o'clock (school pickup) and rendered „pulksten trijos tas joprojām ir labs“, not as „three days“.

---

### Russian — product-pages

**English:** 0.1 g

**Russian:** 0.1 г

Decimal separator: I kept the English decimal point in every number (0.1 г, 3.6 г, €3.55) because the brief says the number must survive exactly and never change. Russian house style would normally be a comma (0,1 г) and prices as «3,55 €». If the reviewer wants Russian number typography, it is a single global pass over indices 3, 41-46, 64, 65, 68, 73, 79-92, 103, 105 — please decide once and apply everywhere, not per string.

---

**English:** Add to box

**Russian:** Добавить в коробку

'Add to box' — translated literally as «Добавить в коробку», keeping the site's 'box' metaphor for the cart (it also appears in i=19 «коробка останется у вас»). If the shop UI elsewhere calls it «корзина», this button should follow that instead.

---

**English:** 2 — poor

**Russian:** 2 — не очень

'poor' on the 1-5 scale: I used «не очень», which keeps the plain spoken register between «плохо» and «нормально». Alternatives if the register feels too casual: «слабо» or «посредственно» (the latter reads like a school grade).

---

**English:** Fibre

**Russian:** Клетчатка

'Fibre' in the nutrition table: I used «Клетчатка» (short, consumer-facing, matches i=37). The regulated EU/RU label term is «Пищевые волокна» — if this table has to match the printed pack wording, both i=14 and i=37 should switch to it.

---

**English:** Source of fibre from the whole fruit

**Russian:** Источник клетчатки из цельного фрукта

'Source of fibre from the whole fruit' is a regulated nutrition claim. Kept literal: «Источник клетчатки из цельного фрукта». It is slightly stiff in Russian; a smoother «Клетчатка из цельного фрукта» would drop the 'source of' claim wording, so I did not do it without approval.

---

**English:** EAN for the selected flavour:

**Russian:** EAN выбранного вкуса:

'EAN' left in Latin — it is the same abbreviation in Russian and it labels a barcode number.

---

**English:** each

**Russian:** за штуку

'each' — «за штуку», deliberately vague like the English. The variants it sits next to are packs (1 pack / 3 packs / 6 packs), so if the price is really per pack, «за упаковку» is more accurate but longer and would need the same change in i=57 and i=58.

---

**English:** Open kraft box with twelve App'Lite Apple Bars in Classic and Berry Mix wrappers, a green apple and blueberries

**Russian:** Открытая крафтовая коробка с двенадцатью батончиками App'Lite Apple Bar в обёртках Classic и Berry Mix, зелёное яблоко и черника

'App'Lite Apple Bars', 'Classic' and 'Berry Mix' kept in Latin script as product and flavour names. The straight apostrophe in App'Lite is reproduced exactly as in the source.

---

**English:** Open box of pink and ivory apple zephyr swirls next to a cup of tea and a green apple

**Russian:** Открытая коробка с розовыми и кремовыми завитками яблочного зефира рядом с чашкой чая и зелёным яблоком

'ivory' rendered as «кремовыми». The literal «цвета слоновой кости» is accurate but too long for an alt description read aloud; flagging in case the exact shade matters.

---

**English:** 278 kcal per 100 g piece

**Russian:** 278 ккал в штуке 100 г

'278 kcal per 100 g piece' — read as 'one piece weighing 100 g', hence «278 ккал в штуке 100 г». Same reading applied to i=113 ('97 kcal per 35 g piece') and inside i=117 and i=121. Confirm that a 'piece' in the pastila discovery set really is one 100 g pack.

---

**English:** 300 g · 3 pcs

**Russian:** 300 г · 3 шт.

'pcs' → «шт.» — Russian abbreviation normally carries a full stop, so this adds a period the English does not have. Same in i=104. Say the word if the design needs «шт» with no dot.

---

**English:** Yes. Belevini zephyr is a traditional recipe made with apple purée, egg white, agar and sugar, and the pack says so. Our bars, meringues, dessert squares and Belyov pastila are the no-added-sugar range.

**Russian:** Да. Зефир Belevini — традиционный рецепт из яблочного пюре, яичного белка, агара и сахара, и на упаковке это указано. Наши батончики, безе, десертные квадратики и белёвская пастила — линейка без добавленного сахара.

'dessert squares' → «десертные квадратики» (the App'Lite 50 g dessert). If that product has a fixed Russian name on the site, it should be used here instead.

---

**English:** Zephyr is set with agar rather than gelatine and, unlike the rest of our range, it is made with sugar. We start it from the same Antonovka purée as our pastila, and the pack says exactly what is in it.

**Russian:** Зефир застывает на агаре, а не на желатине, и, в отличие от остальной линейки, делается с сахаром. Мы начинаем его с того же пюре из антоновки, что и пастилу, и на упаковке точно написано, что внутри.

'the pack says exactly what is in it' kept complete and literal («на упаковке точно написано, что внутри»), since it is a label/composition statement rather than a marketing line.

---

**English:** Image 1 of 3

**Russian:** Изображение 1 из 3

Gallery aria-labels («Изображение 1 из 3» etc.) use the neutral screen-reader wording. If a shorter form is preferred for consistency with other controls, «Фото 1 из 3» works and is 6 characters shorter — it would need to change across i=49-51 and i=130-135 together.

---

### Latvian — product-pages

**English:** 0.1 g

**Latvian:** 0.1 g

Decimal separator left exactly as in the English (dot) across every numeric string in this batch — 0.1 g, 3.6 g, €3.55, €3.90 etc. Latvian typography would normally write 0,1 g and 3,55 € (euro sign after the number). I did not convert, because the brief requires numbers and prices to survive exactly; this should be a single global decision by the reviewer, applied to all number/price strings at once (i 3, 41-46, 64-69, 73, 79-92, 103, 105, and every €-price).

---

**English:** each

**Latvian:** gabalā

"each" translated as „gabalā". It sits next to prices in the 1 pack / 3 packs / 6 packs picker, so strictly it means "per pack" (par iepakojumu), but that is roughly twice as long and would break the picker. „gabalā" reads naturally in Latvian retail pricing and works on all four listed pages. Same choice applies to i 57, 58, and to "per piece" in i 79 and i 85.

---

**English:** Open kraft box with twelve App'Lite Apple Bars in Classic and Berry Mix wrappers, a green apple and blueberries

**Latvian:** Atvērta kraftpapīra kaste ar divpadsmit App'Lite Apple Bar batoniņiem Classic un Berry Mix iesaiņojumos, zaļš ābols un mellenes

"App'Lite Apple Bar", "Classic" and "Berry Mix" kept in Latin script — brand and flavour names printed on the wrapper. English says "App'Lite Apple Bars" (plural); Latvian takes the plural on the following noun (batoniņiem), so the brand name stays in its base form.

---

**English:** 278 kcal per 100 g piece

**Latvian:** 278 kcal 100 g gabalā

"per 100 g piece" (and i 113 "per 35 g piece") rendered as „100 g gabalā" — per piece weighing 100 g, not per 100 g of product. The two readings differ here only cosmetically because the piece happens to be 100 g, but for i 113 (35 g piece) the distinction matters and the same wording is used for consistency.

---

**English:** 300 g · 3 pcs

**Latvian:** 300 g · 3 gab.

"pcs" rendered as the standard Latvian abbreviation „gab." — the period belongs to the abbreviation, not to sentence punctuation. Same in i 104.

---

**English:** 3 — fine

**Latvian:** 3 — viduvēji

Rating ladder rendered as slikti / vāji / viduvēji / labi / izcili. "3 — fine" became „3 — viduvēji" (mediocre) rather than a positive word, to keep the five steps evenly spaced; flag if the intended tone of "fine" is neutral-positive rather than middling.

---

**English:** Set with agar, not gelatine

**Latvian:** Recināts ar agaru, nevis želatīnu

"Set with agar" translated as „Recināts ar agaru" — the food-technology verb for setting/gelling. Same verb reused in i 143 for consistency.

---

**English:** The no-added-sugar range

**Latvian:** Klāsts bez pievienota cukura

"The no-added-sugar range" → „Klāsts bez pievienota cukura". Reused verbatim inside i 142 so the two strings read as the same phrase.

---

**English:** Energy

**Latvian:** Enerģētiskā vērtība

"Energy" kept as the full regulated label term „Enerģētiskā vērtība" (kind is "text", a nutrition-table row, not a fixed-width control). If the table column is narrow, „Enerģija" is the shorter fallback.

---

### Russian — shop-and-home

**English:** More in the

**Russian:** Больше — в разделе

Fragment that runs into a link ("More in the [FAQ/Journal]"). Translated as «Больше — в разделе» so it reads correctly with a nominative link label after it ("Больше — в разделе FAQ"). If the link label is inflected in Russian, this needs re-checking.

---

**English:** Baked apple snacks from Riga: Apple Bars, Flourless Bars, meringues and Belyov pastila. 99% apples, egg white, no added sugar, about 97 kcal a bar.

**Russian:** Снеки из печёных яблок из Риги: Apple Bars, Flourless Bars, меренги и белёвская пастила. 99% яблок, яичный белок, без добавленного сахара, около 97 ккал в батончике.

"Apple Bars" and "Flourless Bars" kept in Latin script as product-line names — they are capitalised in the English and sit alongside App'Lite / PastiLite / Belevini (see i=24, where generic "meringues" is lowercase but "Apple Bars" is not). Same decision applied at i=24, 25, 26, 27, 89, 109. Lowercase generic "apple bar" (i=11, 35) is translated normally. Flag if the Russian site is meant to localise the collection names.

---

**English:** App'Lite Apple Bar packs in Classic and Berry Mix with an unwrapped baked-apple bar and fresh apple

**Russian:** Упаковки App'Lite Apple Bar в вариантах Classic и Berry Mix, рядом развёрнутый батончик из печёного яблока и свежее яблоко

"Classic" and "Berry Mix" left in Latin as printed pack-variant names. This is alt text read aloud, so a screen reader will read them in English — confirm that is intended.

---

**English:** Semers — Apple bars &amp; pastila. 99% apples, no added sugar

**Russian:** Semers — яблочные батончики &amp; пастила. 99% яблок, без добавленного сахара

"&amp;" left as the HTML entity rather than replaced with «и», so the markup survives. Same at i=36, 85, 106. If these are plain-text fields rather than HTML, «и» would read better in Russian.

---

**English:** A pastila apple split open beside half a fresh green apple, showing the golden layered inside

**Russian:** Разломленная пополам яблочная пастила рядом с половинкой свежего зелёного яблока — видна золотистая слоистая середина

"A pastila apple" is ambiguous in the English — read as a piece of apple pastila broken open, not an apple-shaped item. Translated on that reading.

---

**English:** A snack bar that is

**Russian:** Батончик, в котором

Paired with i=68: «Батончик, в котором» + «99% яблока.» = "Батончик, в котором 99% яблока." This mirrors the English fragment pair ("A snack bar that is" / "99% apple."). If the two are not adjacent on the page, i=72 will read as an incomplete phrase — exactly as the English does.

---

**English:** Same recipe as every Semers bar and loaf.

**Russian:** Тот же рецепт, что у любого батончика и пласта Semers.

"loaf" rendered as «пласт» throughout (i=14, 82, 83, 131, 137, 145, 148, 154) — the standard term for a slab of белёвская пастила. «буханка» would be wrong.

---

**English:** Build your box

**Russian:** Соберите свой набор

"box" rendered as «набор» for the build-your-own product (i=23, 25, 26, 27, 32, 33, 34, 139, 140, 141), which is how Russian e-commerce names this; the literal «коробка» is kept at i=109 where the physical shipping box is meant.

---

**English:** Dietary filters

**Russian:** Фильтры по питанию

aria-label "Dietary filters" — «Фильтры по питанию». «Диетические фильтры» would misread as "diet-food filters". If the filters are things like gluten-free / no added sugar, «Фильтры по составу» may be more accurate; kept generic because the filter set is not visible in this batch.

---

**English:** Retailer, café, office or distributor? We ship pallets as happily as parcels, and we do private label.

**Russian:** Магазин, кафе, офис или дистрибьютор? Мы одинаково охотно отправляем и паллеты, и посылки, а ещё работаем по private label.

"private label" kept in English — it is the term used in Russian B2B copy. The full Russian equivalent «собственная торговая марка (СТМ)» is longer and more retail-specific; swap if the wholesale page uses СТМ elsewhere.

---

**English:** The heartier bar. Fifty grams of baked apple pressed with whole berries for a chewier bite and longer energy. Everything a flapjack wants to be, without the flour.

**Russian:** Батончик посытнее. Пятьдесят граммов печёного яблока, спрессованного с целыми ягодами: плотнее на укус и дольше держит энергию. Всё, чем хочет быть овсяный батончик, только без муки.

"flapjack" (British oat bar) has no exact Russian equivalent; rendered as «овсяный батончик», which carries the intended comparison.

---

**English:** Whipped into the purée to trap air. It is why pastila is light and springy instead of a dense fruit leather.

**Russian:** Взбивается в пюре, чтобы удержать воздух. Именно поэтому пастила лёгкая и упругая, а не плотный фруктовый лаваш.

"fruit leather" rendered as «фруктовый лаваш» — the usual Russian name. «фруктовая пастила» was avoided because it would collide with пастила itself and invert the sentence's meaning.

---

**English:** 50 g · 142 kcal · €1.95

**Russian:** 50 г · 142 ккал · €1.95

Prices left in the English format (€1.95, €3.90, €5.51 …) at i=4, 5, 6, 28, 37, 38, 97, 139, 140, 141 so every digit and the decimal point survive exactly. If the Russian site should use the local format (1,95 €), that is a global formatting decision, not a translation one.

---

**English:** vs

**Russian:** против

"vs" translated as «против» for the comparison block. If it sits in a narrow badge between two columns, the Latin "vs" is also idiomatic in Russian and shorter — flagging in case of layout constraints.

---

**English:** Things people ask before their first box.

**Russian:** О чём спрашивают перед первым заказом.

"before their first box" rendered as «перед первым заказом» (before their first order) — «перед первой коробкой» is not idiomatic. Slight shift from box to order.

---

### Latvian — shop-and-home

**English:** More in the

**Latvian:** Vairāk sadaļā

„More in the” is a fragment that runs into a link (probably the FAQ) and then into #0/#1: rendered as „Vairāk sadaļā” so the chain reads „Vairāk sadaļā BUJ, vai rakstiet mums”. If the link that follows is not a section name (e.g. it is a verb phrase), this fragment needs rechecking.

---

**English:** 50 g · 142 kcal · €1.95

**Latvian:** 50 g · 142 kcal · €1.95

Prices kept exactly as in the English, decimal point and €-before-number (€1.95), so no digit changes. Latvian house style would normally be „1,95 €”; if the site wants that convention, it should be applied globally by a formatter, not per string. Same applies to #5, #6, #28, #37, #38, #97, #139, #140, #141.

---

**English:** Baked apple snacks from Riga: Apple Bars, Flourless Bars, meringues and Belyov pastila. 99% apples, egg white, no added sugar, about 97 kcal a bar.

**Latvian:** Ceptu ābolu uzkodas no Rīgas: ābolu batoniņi, batoniņi bez miltiem, bezē un Beļovas pastila. 99% ābolu, olu baltums, bez pievienota cukura, aptuveni 97 kcal batoniņā.

Collection names „Apple Bars” and „Flourless Bars” are not in the protected brand list, so they are translated descriptively („ābolu batoniņi”, „batoniņi bez miltiem”) and used consistently in #24, #25, #26, #27, #89, #109. If these are to be treated as untranslatable product names, all six strings must be changed together.

---

**English:** App'Lite Apple Bar packs in Classic and Berry Mix with an unwrapped baked-apple bar and fresh apple

**Latvian:** App'Lite ābolu batoniņu iepakojumi Classic un Berry Mix garšā, izsaiņots ceptu ābolu batoniņš un svaigs ābols

„Classic” and „Berry Mix” are pack variant names printed on the packaging, so they are left in Latin script.

---

**English:** Semers — Apple bars &amp; pastila. 99% apples, no added sugar

**Latvian:** Semers — ābolu batoniņi un pastila. 99% ābolu, bez pievienota cukura

The HTML entity &amp; is rendered as the Latvian word „un” rather than an ampersand — Latvian titles do not use „&” between nouns. Same in #36 and #85.

---

**English:** 5 min read

**Latvian:** 5 min lasīšanai

„5 min read” rendered as „5 min lasīšanai” (reading time label). Kept short for the card layout.

---

**English:** ~24 g sugar, mostly added

**Latvian:** ~24 g cukura, lielākoties pievienotais

„mostly added” rendered as „lielākoties pievienotais” (i.e. mostly added sugar); the noun is left implied as in the English.

---

**English:** 99% apple.

**Latvian:** 99% ābolu.

#72 + #68 are concatenated on the page: „Uzkodu batoniņš, kas ir” + „99% ābolu.” — reads as one sentence, lowercase and punctuation as in the English.

---

**English:** Belevini zephyr is the traditional apple marshmallow: Antonovka apple purée, egg white, agar and sugar. It is the only product here that is not a no-added-sugar recipe, and we say so on every pack.

**Latvian:** Belevini zefīrs ir tradicionālais ābolu zefīrs: Antonovkas ābolu biezenis, olu baltums, agars un cukurs. Tas ir vienīgais produkts mūsu klāstā, kura receptē ir pievienots cukurs, un mēs to norādām uz katra iepakojuma.

English distinguishes „zephyr” from „marshmallow”, but Latvian uses „zefīrs” for both, so „traditional apple marshmallow” became „tradicionālais ābolu zefīrs”. In #157 the English word „marshmallow” is kept in Latin script precisely to preserve that contrast (it is understood in Latvian as the American sweet); flag if leaving an English word there is unacceptable.

---

**English:** Crispy apple meringues piled in a ceramic bowl

**Latvian:** Kraukšķīgi ābolu bezē cepumi sakrauti keramikas bļodā

„bezē” is indeclinable in Latvian and cannot take an agreeing adjective on its own, so in the alt text and in #138 it is paired with a noun („bezē cepumi”). Where no adjective is needed, plain „bezē” is used (#22, #24, #36, #82, #109, #139–141, #154).

---

**English:** Layer &amp; dry

**Latvian:** Kārtošana un žāvēšana

„Layer & dry” is a process-step label; rendered as a noun pair „Kārtošana un žāvēšana” so it does not read as a command to the reader. If the neighbouring step labels (not in this batch) use verb forms, this should be aligned with them.

---

**English:** Retailer, café, office or distributor? We ship pallets as happily as parcels, and we do private label.

**Latvian:** Mazumtirgotājs, kafejnīca, birojs vai izplatītājs? Sūtām paletes tikpat labprāt kā pakas, un piedāvājam privātā zīmola ražošanu.

„private label” rendered as „privātā zīmola ražošana”. The English term is also used in the Latvian trade; if the wholesale page keeps „private label” elsewhere, align.

---

**English:** The heartier bar. Fifty grams of baked apple pressed with whole berries for a chewier bite and longer energy. Everything a flapjack wants to be, without the flour.

**Latvian:** Sātīgākais batoniņš. Piecdesmit grami ceptu ābolu, saspiesti kopā ar veselām ogām — košļājamāks kumoss un ilgāka enerģija. Viss, par ko auzu batoniņš grib kļūt, tikai bez miltiem.

„flapjack” has no Latvian equivalent; rendered as „auzu batoniņš” (oat bar), which is the closest recognisable product.

---

**English:** vs

**Latvian:** pret

„vs” rendered as „pret” for the comparison table. „vs” is also readable in Latvian — keep whichever fits the column width better.

---

**English:** Whipped into the purée to trap air. It is why pastila is light and springy instead of a dense fruit leather.

**Latvian:** Iekults biezenī, lai noturētu gaisu. Tāpēc pastila ir viegla un atsperīga, nevis blīva žāvētu augļu plāksne.

„fruit leather” rendered as „žāvētu augļu plāksne”; there is no settled Latvian term, and „plātsmaize” would wrongly suggest a cake.

---

**English:** Build your box

**Latvian:** Izveidojiet savu kasti

Voice/formality: the whole batch uses formal plural („jūs”) for sentences addressed to the customer, and bare infinitives for buttons and controls („Notīrīt filtrus”, „Meklēt…”, „Sākt veidot”, „Pirkt batoniņus”) to keep them short. If the rest of the site uses informal „tu”, these need to be switched together.

---

### Russian — contact-and-journal

**English:** SIA Semers Group

**Russian:** SIA Semers Group

Left in English unchanged: legal entity name (SIA Semers Group) on the brand-name list.

---

**English:** Hand reaching for a Berry Mix Apple Bar on a desk beside a laptop and coffee

**Russian:** Рука тянется к яблочному батончику Berry Mix на столе рядом с ноутбуком и кофе

"Berry Mix" kept in Latin script as a flavour/SKU name, matching the Semers / App'Lite / PastiLite convention. If flavour names are translated elsewhere in the project, this needs to match that decision. "Apple Bar" itself is translated descriptively (яблочный батончик) since it is not on the protected-names list.

---

**English:** full FAQ

**Russian:** полный раздел вопросов и ответов

"full FAQ" rendered as «полный раздел вопросов и ответов» rather than «полный FAQ», to match the plain voice. Check the concatenated sentence with 93 + 86 + 95 + 0 + 80: «Если ваш вопрос здесь, ответ у вас уже есть. Если нет, форма находится на один экран выше, а полный раздел вопросов и ответов отвечает на остальное, от яичного белка до срока хранения.» If «FAQ» is used in the nav elsewhere, entries 0, 107 and 116 should be aligned with it.

---

**English:** If yours is here, you have your answer already. If not, the

**Russian:** Если ваш вопрос здесь, ответ у вас уже есть. Если нет,

English "If yours is here" has no noun; Russian «ваш» cannot stand alone, so «ваш вопрос» is used. This is the only word added.

---

**English:** is one scroll up, and the

**Russian:** находится на один экран выше, а

Used «находится на один экран выше» rather than a dash construction so that no punctuation is added to the fragment.

---

**English:** I agree that Semers stores this message in order to reply to it. Read the

**Russian:** Я согласен, чтобы Semers хранил это сообщение для ответа на него. Читайте

Fragment ends with «Читайте» and is followed by a link whose text is in another batch. If that link text is nominative («Политика конфиденциальности»), the case will not agree. The link text should be «политику конфиденциальности» (accusative), or this fragment needs rewording once the link string is known.

---

**English:** I agree to receive occasional e-mails from SIA Semers Group. See our

**Russian:** Я согласен получать редкие письма от SIA Semers Group. Смотрите

Same case-agreement risk as 91: «Смотрите» + link. English "See our" — the possessive was dropped because its gender depends on the linked noun. Please check against the actual link text.

---

**English:** Latvia, Lithuania, Estonia and the rest of the European Union. Orders over €25 ship free; below that we charge a flat €3.90 in the Baltics and confirm courier rates for the rest of the EU by e-mail. Parcels leave Riga within 1–2 business days.

**Russian:** Латвия, Литва, Эстония и остальной Европейский союз. Заказы от €25 доставляем бесплатно; ниже этой суммы берём фиксированные €3.90 по Балтии, а тарифы курьера для остального ЕС подтверждаем по электронной почте. Посылки уходят из Риги за 1–2 рабочих дня.

Price kept exactly as €3.90 with a decimal point, not converted to the Russian «3,90», so the figure survives byte-for-byte. Same in 112. Flag if the house style wants a comma.

---

**English:** Free shipping over €25

**Russian:** Бесплатная доставка от €25

"over €25" rendered as «от €25» here and in 24, 52, 72 for a natural Russian offer line; strictly «свыше €25» would be the literal reading of "over". Currency symbol kept before the number as in the English.

---

**English:** Shipping &amp; returns

**Russian:** Доставка и возврат

The HTML entity &amp; is rendered as the Russian word «и» (also in 32, 59, 97). No ampersand remains in the Russian string.

---

**English:** Keep

**Russian:** Читать

"Keep" + 38 "reading." concatenate to «Читать дальше.» — the emphasised final fragment is «дальше.» rather than a word meaning "reading". Meaning and length hold, but the highlighted word changes.

---

**English:** Say

**Russian:** Скажите

"Say" + 89 "hello." concatenate to «Скажите привет.» This is a fairly literal calque; the idiomatic Russian contact heading would be «Напишите нам», but that is already used for entry 65, so the literal reading was kept to avoid two identical headings.

---

**English:** Send message

**Russian:** Отправить

Button shortened to «Отправить» (not «Отправить сообщение») to stay near the English width. The form field label above it is «Сообщение» (55), so the object is clear.

---

**English:** Order a Tasting Box

**Russian:** Заказать дегустационный набор

"Tasting Box" translated descriptively as «дегустационный набор» (also in 71) — it is not on the protected-names list. If it is in fact a product name that stays in Latin, both entries need changing.

---

**English:** A Tasting Box holds four Apple Bars, two Flourless Bars, two bags of apple meringues and a 100 g loaf of Belyov pastila. It ships free from Riga in 1–2 business days.

**Russian:** В дегустационный набор входят четыре яблочных батончика, два батончика без муки, два пакетика яблочного безе и брусок белёвской пастилы 100 г. Отправляем его из Риги бесплатно за 1–2 рабочих дня.

"Flourless Bars" translated as «батончики без муки» (also in 72), matching the /shop/flourless-bars/ page. "loaf" of pastila rendered as «брусок» — the usual Russian word for a Belyov pastila block. 100 g kept as «100 г».

---

**English:** Choose one

**Russian:** Выберите одно

"Choose one" is a bare fragment with no visible noun; «Выберите одно» keeps it short and neutral. If it sits under the «Тема» select, «Выберите тему» would read better — depends on the markup.

---

**English:** guide

**Russian:** гид

Tag "guide" rendered as «гид», which is how Russian food and lifestyle media tag this kind of piece. «Инструкция» or «разбор» are alternatives if the tag list has a house style.

---

**English:** Wholesale replies come with the line sheet and prices.

**Russian:** В ответ на оптовый запрос присылаем каталог ассортимента и цены.

"line sheet" (the wholesale assortment sheet) rendered as «каталог ассортимента»; there is no single settled Russian term. «Прайс-лист» would fold it together with "prices", which the English keeps separate.

---

**English:** 1 Sep 2026

**Russian:** 1 сентября 2026

Dates 5, 6, 7 expanded to full Russian month names («1 сентября 2026») rather than the abbreviated English form, since Russian abbreviations («сент.») read as clipped. All digits preserved.

---

**English:** Reading about apples is the slow way to find out.

**Russian:** Читать о яблоках — медленный способ это выяснить.

"is the slow way to find out" — the English leaves the object of "find out" implicit (the taste). Russian keeps it equally implicit: «медленный способ это выяснить». Reads dry, in line with the surrounding block (42, 43).

---

**English:** In Latvia you will find us at Maxima and on Barbora. We are also in selected stores in Germany, Poland, Lithuania, Austria and Bulgaria — see the Where to buy page.

**Russian:** В Латвии нас можно найти в Maxima и на Barbora. Мы также есть в отдельных магазинах Германии, Польши, Литвы, Австрии и Болгарии — смотрите страницу «Где купить».

Added « » around the page name «Где купить» — Russian needs the quotes to mark a page title inside running text; the English gets by on capitalisation.

---

### Latvian — contact-and-journal

**English:** full FAQ

**Latvian:** pilnā BUJ sadaļa

FAQ rendered as „BUJ” (biežāk uzdotie jautājumi) here and in 107, 116 — it is the standard Latvian abbreviation and keeps the labels short. If the site's FAQ page is titled in full („Biežāk uzdotie jautājumi”), swap all three for consistency. Also: 0 is the link inside the sentence 93 + 0 + 80, so it is a nominative noun phrase that becomes the subject of „aptver pārējo…”.

---

**English:** Free shipping over €25

**Latvian:** Bezmaksas piegāde virs €25

Currency kept exactly as in the English (€25, and €3.90 in 52/112). Latvian typographic convention would be „25 €” and „3,90 €” (symbol after the number, decimal comma). Left unchanged so no price token is altered; a reviewer may want to localise the format sitewide.

---

**English:** 1 Sep 2026

**Latvian:** 2026. gada 1. septembris

Dates written in the standard Latvian long form (2026. gada 1. septembris) rather than an abbreviated month, so no digits are added or padded. Same for 6 and 7.

---

**English:** Contact Semers, maker of baked-apple bars and pastila in Riga, about an order, wholesale or press. Write to us and a person replies within a business day.

**Latvian:** Sazinies ar Semers — ceptu ābolu batoniņu un pastilas ražotāju Rīgā — par pasūtījumu, vairumtirdzniecību vai presi. Uzraksti mums, un atbildēs cilvēks vienas darba dienas laikā.

„Semers” is left uninflected everywhere („ar Semers”, „Seko Semers…”), per the rule that brand names stay exactly as written. Natural Latvian would decline it (ar Semeru, Semera ceptuve). Flagging in case the client prefers declension.

---

**English:** Hand reaching for a Berry Mix Apple Bar on a desk beside a laptop and coffee

**Latvian:** Roka sniedzas pēc Berry Mix ābolu batoniņa uz darbagalda blakus klēpjdatoram un kafijai

„Berry Mix” kept in Latin script as a flavour/product name; „Apple Bar” translated descriptively as „ābolu batoniņš” since it is not on the protected brand list. Same decision in 35, 53, 71.

---

**English:** · 5 min read

**Latvian:** · 5 min lasīšanas

„min read” rendered as „min lasīšanas”; the fragment starts with „· ” exactly as the English does, so it concatenates after the date.

---

**English:** 99% baked Antonovka apples, 1% egg white

**Latvian:** 99% ceptu Antonovkas ābolu, 1% olu baltuma

Percent signs left tight against the digit (99%, 1%) as in the English. Latvian typography would use a thin space („99 %”); not changed so the number tokens stay identical.

---

**English:** Keep

**Latvian:** Turpini

33 + 38 reconstructs „Keep reading.” as „Turpini” + „lasīt.” — the emphasised second half stays the verb, as in the English. Same split logic for 121 + 89 („Saki” + „sveiki.”) and 102 + 74 („Piezīmes no” + „ceptuves.”).

---

**English:** Latvia, Lithuania, Estonia and the rest of the European Union. Orders over €25 ship free; below that we charge a flat €3.90 in the Baltics and confirm courier rates for the rest of the EU by e-mail. Parcels leave Riga within 1–2 business days.

**Latvian:** Uz Latviju, Lietuvu, Igauniju un pārējo Eiropas Savienību. Pasūtījumiem virs €25 piegāde ir bez maksas; zem šīs summas Baltijā piemērojam vienotu €3.90 maksu, bet kurjera cenas pārējā ES apstiprinām e-pastā. Sūtījumi izceļo no Rīgas 1–2 darba dienu laikā.

The English answers „Where do you ship?” with a bare nominative list. Latvian needs a direction, so the list is in the accusative with „Uz” („Uz Latviju, Lietuvu, Igauniju…”). No content added beyond that preposition.

---

**English:** Order a Tasting Box

**Latvian:** Pasūti degustācijas kasti

„Tasting Box” translated as „degustācijas kaste” (lowercase inside sentences, capitalised sentence-initially in 71). It is capitalised in English like a product name but is not on the protected list — confirm whether it should stay English.

---

**English:** 99% baked Antonovka apples and egg white, no added sugar, no flour, no gluten

**Latvian:** 99% ceptu Antonovkas ābolu un olu baltums, bez pievienotā cukura, bez miltiem, bez lipekļa

The English is ambiguous: „99% baked Antonovka apples and egg white” can read as 99% of both, though 20 says apples are 99% and egg white 1%. The Latvian keeps the same ambiguity („99% ceptu Antonovkas ābolu un olu baltums”). If the intended sense is „99% apples, the rest egg white”, the line should be rephrased in both languages.

---

**English:** A Tasting Box holds four Apple Bars, two Flourless Bars, two bags of apple meringues and a 100 g loaf of Belyov pastila. It ships free from Riga in 1–2 business days.

**Latvian:** Degustācijas kastē ir četri ābolu batoniņi, divi batoniņi bez miltiem, divi maisiņi ābolu bezē un 100 g Beļovas pastilas klaips. Tā no Rīgas tiek nosūtīta bez maksas 1–2 darba dienu laikā.

„Flourless Bars” translated as „batoniņi bez miltiem” (also in 72). Capitalised as a product name in English; not on the protected list.

---

**English:** directly.

**Latvian:** tieši.

Unclear fragment. It appears to end a sentence built from 86 („veidlapa”) + 95 („ir vienu ritinājumu augstāk, un”) + an unseen link + this word. Translated as the adverb „tieši.”; if the missing middle is e.g. a WhatsApp or e-mail link, the reviewer should check that „…tieši.” still reads correctly in the assembled sentence.

---

**English:** I agree that Semers stores this message in order to reply to it. Read the

**Latvian:** Piekrītu, ka Semers saglabā šo ziņu, lai uz to atbildētu. Izlasi

Ends with the verb „Izlasi”, so the link text that follows must be in the accusative („privātuma politiku”), not the nominative („Privātuma politika”). Same for 92 („Skati mūsu” + accusative).

---

**English:** Shipping &amp; returns

**Latvian:** Piegāde un atgriešana

The HTML entity „&amp;” is rendered as the word „un”, which is how Latvian joins these pairs; no ampersand remains. Same in 32, 59 and inside the quoted option in 97.

---

**English:** In Latvia you will find us at Maxima and on Barbora. We are also in selected stores in Germany, Poland, Lithuania, Austria and Bulgaria — see the Where to buy page.

**Latvian:** Latvijā mūs atradīsi Maxima veikalos un Barbora e-veikalā. Esam arī atsevišķos veikalos Vācijā, Polijā, Lietuvā, Austrijā un Bulgārijā — skati sadaļu Kur nopirkt.

„at Maxima and on Barbora” needed a noun to attach to, since the brand names are not declined: „Maxima veikalos un Barbora e-veikalā”. Same construction in 73.

---

**English:** Reading done

**Latvian:** Izlasīts

„Reading done” translated as the heading „Izlasīts” (the reading is finished, now go to the shop). If it is meant as a status label rather than a heading, „Lasīšana pabeigta” would be the alternative.

---

**English:** Taste the subject

**Latvian:** Nogaršo tēmu

„Taste the subject” kept as the literal, slightly playful „Nogaršo tēmu”, matching the plain voice of the pair-line 43.

---

**English:** Writing about apples? We can help.

**Latvian:** Vai raksti par āboliem? Mēs varam palīdzēt.

„Vai” added at the front so the Latvian reads unambiguously as a question („Vai raksti par āboliem?”) — without it, „Raksti par āboliem?” would look like an imperative.

---

### Russian — where-faq-checkout

**English:** E-mail

**Russian:** E-mail

Left as "E-mail" — it is the standard label on Russian sites and sits in a footer contact row where «Электронная почта» would be more than twice as wide. Change to «Эл. почта» if the house style forbids Latin.

---

**English:** €4.14 / 100 g

**Russian:** €4.14 / 100 г

Decimal separator kept as in English (€4.14, not €4,14) per the rule that digits and prices survive exactly. Same for i=12, 13. Flag if the RU site normally uses a comma — it would be a global price-format decision, not a translation one.

---

**English:** privacy policy

**Russian:** политику конфиденциальности

CASE CHOICE, please check. This one string is shared by /checkout/ (concatenated as i=139 + i=199 + i=56 + i=21 → «Я принимаю условия и политику конфиденциальности») and by /contact/, /journal/, /legal/shipping-returns/. I picked the accusative «политику конфиденциальности» because it also fits «см. / читайте политику конфиденциальности». If on those other pages the link sits after a preposition («в политике конфиденциальности», «согласно политике конфиденциальности»), the sentence will read wrong there and the string needs splitting.

---

**English:** FAQ

**Russian:** FAQ

Kept "FAQ" — «Вопросы и ответы» is five times longer and this is a nav/footer link in a fixed row. FAQ is fully idiomatic in Russian. Same choice carried into the page title (i=39) and the aria-label (i=122).

---

**English:** wholesale

**Russian:** опт

Inline lowercase link, appears mid-sentence on three different pages, so I used the caseless nominative «опт». If the surrounding sentence on any of those pages requires an oblique case, it will read stiffly. Same situation for i=185 «доставка» and i=84 «где купить».

---

**English:** , the

**Russian:** ,

UNSURE. The English ", the" is a pure list joiner between two links (…apple bars, the meringues…). Russian has no article, so nothing is left but the comma; I returned "," with no trailing space, since the English string had none. If the markup relies on the string carrying the space before the next link, this needs ", " instead.

---

**English:** and the

**Russian:** и

"and the" reduces to «и» in Russian for the same reason as i=53 — no article. Note that i=56 ("and") and i=57 ("and the") therefore become identical strings.

---

**English:** App’Lite Apple Bar

**Russian:** App’Lite Apple Bar

Unchanged: "App’Lite Apple Bar" is the product name. Note it uses a curly apostrophe here while i=7 uses a straight one — I preserved each exactly as given rather than normalising.

---

**English:** Subtotal

**Russian:** Сумма

"Subtotal" → «Сумма» and "Total" (i=83) → «Итого», the standard Russian cart pair. «Подытог» is a literal calque and reads badly.

---

**English:** 02 · Nutrition

**Russian:** 02 · Пищевая ценность

Jump-chip label. «Пищевая ценность» is noticeably longer than "Nutrition" (16 vs 9 chars). If the chip row wraps, «02 · Состав» is the short fallback, but it loses the calories/sugar sense.

---

**English:** answered.

**Russian:** на которые есть ответы.

HEADING SPLIT, please check. i=175 + i=104 is "Questions, answered." A literal Russian split would give «Вопросы, ответы.» which is not a sentence, so I rendered the second half as «на которые есть ответы.» — the pair concatenates to «Вопросы, на которые есть ответы.» This makes the second span longer than the English; if it is styled as a short emphasised word, the design may need a look.

---

**English:** For retailers, cafés, offices and distributors. Pallets, private label, and who to write to.

**Russian:** Для магазинов, кафе, офисов и дистрибьюторов. Паллеты, private label и кому писать.

"private label" left in Latin here and in i=210. It is the usual term in Russian B2B/retail writing; «собственная торговая марка» (or СТМ) is the full Russian equivalent but doubles the length of both sentences. Easy to swap if the brand prefers no English in body copy.

---

**English:** Free shipping over €25; €3.90 flat below that in the Baltics

**Russian:** Бесплатная доставка от €25; при меньшей сумме — €3.90 по Балтии

i=127 and i=128 are the same statement in English with the clauses reordered; I mirrored that in Russian so the two strings stay distinct, but they could safely be merged into one string if the source ever gets deduplicated.

---

**English:** Parcel locker

**Russian:** Постамат

"Parcel locker" → «Постамат», the standard Baltic/Russian term (Omniva/DPD lockers). Used consistently in i=190 and the placeholder i=191.

---

**English:** pastila loaves

**Russian:** бруски пастилы

UNSURE. "pastila loaves" → «бруски пастилы». Belyov pastila is sold as a loaf/block, and «брусок» is how it is normally described in Russian; «булка пастилы» would be wrong. Worth a check against how the product pages name this format.

---

**English:** Place order

**Russian:** Отправить заказ

i=61 "Checkout" → «Оформить заказ» (the cart button) and i=172 "Place order" → «Отправить заказ» (the submit button). Kept different so the two buttons do not read identically; «Отправить заказ» also matches the copy, since no payment is taken at that step.

---

**English:** Summary

**Russian:** Сводка

"Summary" → «Сводка». Deliberately not «Итог», which would collide with «Итого» for "Total" (i=83) two rows below it.

---

**English:** Your reference is

**Russian:** Номер вашего заказа —

«Номер вашего заказа —» : the dash is the Russian copula standing in for "is", not added punctuation. It is required before the reference value that follows; without it the line is ungrammatical.

---

### Latvian — where-faq-checkout

**English:** €4.14 / 100 g

**Latvian:** €4.14 / 100 g

Price format left exactly as in the English (€4.14 / 100 g) to satisfy the hard rule on numbers surviving unchanged. Latvian convention would be „4,14 €/100 g" (comma decimal, euro sign after the number). Same decision applies to i 12, 13, 127, 128, 129, 130, 131, 136, 161.

---

**English:** privacy policy

**Latvian:** privātuma politikai

Case chosen for the checkout consent sentence: i 139 + i 199 + i 56 + i 21 concatenates to „Piekrītu noteikumiem un privātuma politikai" (dative). If this same string is also used as a standalone footer link on /contact/, /journal/ or /legal/shipping-returns/, it should read „Privātuma politika" (nominative) there — Latvian cannot cover both with one form. Flagging for the reviewer to check how the link is used on those pages.

---

**English:** FAQ

**Latvian:** BUJ

„BUJ" (bieži uzdotie jautājumi) is the standard Latvian abbreviation for FAQ and keeps the label as short as the English. Used consistently in i 39 and i 122. If the client prefers the full form, it would be „Bieži uzdotie jautājumi", which is far too long for a nav item.

---

**English:** wholesale

**Latvian:** vairumtirdzniecība

Lowercase inline link, and the surrounding sentence is not in the batch. Left in the nominative („vairumtirdzniecība"); if the sentence on /faq/ or /legal/terms/ reads e.g. „see wholesale", the link text would need the accusative „vairumtirdzniecību". Worth checking in context.

---

**English:** , the

**Latvian:** , 

Latvian has no articles, so ", the" becomes just a comma. Returned as ", " (comma + space) so the spacing before the following link survives; if the pipeline trims trailing whitespace, verify a space still separates the comma from the next link.

---

**English:** and the

**Latvian:** un

"and the" → "un" — the article disappears in Latvian, so this fragment and i 56 ("and") get the same translation. Both are correct in their sentences; no way to distinguish them in Latvian.

---

**English:** App’Lite Apple Bar

**Latvian:** App’Lite Apple Bar

Left unchanged: „App’Lite Apple Bar" is the product name and stays in Latin script. The curly apostrophe of the source is preserved (i 7 uses a straight apostrophe — that difference is in the English source, left as found).

---

**English:** Barbora

**Latvian:** Barbora

Left unchanged — brand name (Barbora). Same for Maxima (i 71), Omniva and DPD/DHL (i 117, 152), Semers and SIA Semers Group.

---

**English:** Checkout

**Latvian:** Noformēt pasūtījumu

„Noformēt pasūtījumu" is longer than the English "Checkout" (19 vs 8 characters). Latvian has no accepted short equivalent that also works as the /checkout/ page heading; the shorter alternative „Uz kasi" reads wrong as a heading. Please check the button does not wrap.

---

**English:** Shipping

**Latvian:** Piegāde

"Shipping" (i 76) and "Delivery" (i 25) both translate to „Piegāde" — Latvian does not distinguish them in this context. They appear on different surfaces (cart/checkout summary line vs section heading), so the duplication should not be visible in one place, but flagging it.

---

**English:** 99% baked Antonovka apples, egg white, no added sugar

**Latvian:** 99% cepti Antonovkas āboli, olu baltums, bez pievienota cukura

Rendered as a nominative label list („99% cepti Antonovkas āboli, …"). Kept „99%" without a space; Latvian typography would normally write „99 %", but the number rule takes precedence.

---

**English:** answered.

**Latvian:** atbildēti.

i 175 + i 104 concatenates to „Jautājumi, atbildēti." — a literal mirror of "Questions, answered." It works but is a slightly unusual construction in Latvian; a native rewrite would be „Jautājumi un atbildes.", which would require changing both fragments together.

---

**English:** near you.

**Latvian:** jums tuvumā.

Fragment with no visible sentence in the batch. Translated as „jums tuvumā." assuming a sentence like "[apple bars] … near you." If the surrounding sentence has a different structure, the word order may need adjusting.

---

**English:** Search for “App’Lite” or “Semers” on the site

**Latvian:** Meklējiet vietnē „App’Lite“ vai „Semers“

Quotation marks converted to Latvian „…“ as instructed; the brand names inside („App’Lite“, „Semers“) are unchanged and the curly apostrophe of the source is preserved.

---

**English:** Your reference is

**Latvian:** Jūsu atsauces numurs ir

"Your reference is" translated as „Jūsu atsauces numurs ir" on the assumption that an order reference code follows. If the value that follows is not a number, „Jūsu atsauce ir" would be safer.

---

**English:** zephyr

**Latvian:** zefīrs

"zephyr" is the confection, translated as „zefīrs" (the standard Latvian name for it), not the wind.

---

### Latvian — story

**English:** App&#39;Lite

**Latvian:** App&#39;Lite

Returned unchanged: brand name. The HTML entity &#39; is kept exactly as in the source (it is the apostrophe in App'Lite).

---

**English:** Retail cases of App'Lite Apple Bars stacked for a wholesale delivery

**Latvian:** App'Lite ābolu batoniņu tirdzniecības kastes, sakrautas vairumtirdzniecības piegādei

Source uses a plain ASCII apostrophe here (App'Lite), unlike indices 1/5 (&#39;) and 28/75 (’); kept as written.

---

**English:** App&#39;Lite Dessert · 50 g

**Latvian:** App&#39;Lite deserts · 50 g

Brand part unchanged with its &#39; entity; only the word 'Dessert' translated ('deserts'). Weight 50 g and the · separator preserved.

---

**English:** Belevini

**Latvian:** Belevini

Returned unchanged: brand name (Belevini).

---

**English:** Maxima &amp; Barbora

**Latvian:** Maxima &amp; Barbora

Returned unchanged: two retailer names. The &amp; entity is kept exactly as in the source.

---

**English:** PastiLite

**Latvian:** PastiLite

Returned unchanged: brand name (PastiLite).

---

**English:** . Questions about ordering are answered in the

**Latvian:** . Atbildes uz jautājumiem par pasūtīšanu atrodamas sadaļā

Sentence fragment that continues into a link whose text is not in this batch. 'sadaļā' (= 'in the section') expects a section name after it; if the following link reads e.g. 'FAQ' or 'BUJ' it fits, but confirm the stitched sentence.

---

**English:** A sour apple, an old recipe and a bakery in

**Latvian:** Skābs ābols, veca recepte un ceptuve

Fragment ends with the preposition 'in', which Latvian expresses as a case ending on the place name, not a separate word. The translation therefore ends with 'ceptuve' and the following place-name span must be in the locative ('Rīgā') for the sentence to read correctly.

---

**English:** All apple meringues

**Latvian:** Visi ābolu bezē

'bezē' is an indeclinable loanword in Latvian, so singular and plural look identical; 'Visi ābolu bezē' is the natural filter label.

---

**English:** All belyov pastila

**Latvian:** Visa Beļovas pastila

English has lowercase 'belyov', but Beļova is a proper place name and Latvian orthography requires the capital, so 'Beļovas' is capitalised even though the label is otherwise lowercase-free.

---

**English:** Apple zephyr, the soft marshmallow of the east, set with agar. The one line in our range that does contain sugar, and the pack says so.

**Latvian:** Ābolu zefīrs — austrumu mīkstais saldums, sarecināts ar agaru. Vienīgā līnija mūsu klāstā, kurā ir cukurs, un uz iepakojuma tas arī ir rakstīts.

'the soft marshmallow of the east' rendered as 'austrumu mīkstais saldums' — Latvian already calls this product 'zefīrs', so a literal 'marshmallow' would be tautological in the same sentence.

---

**English:** Belyov is a small town in orchard country south of Moscow. Its apples are Antonovka: sour, aromatic, and impossible to keep fresh through a winter. Baking, whipping and drying them was the local answer, and in 1888 the merchant Amvrosy Prokhorov turned that answer into a business. Belyov pastila was sold for the first time.

**Latvian:** Beļova ir maza pilsēta ābeļdārzu novadā uz dienvidiem no Maskavas. Tās āboli ir antonovkas: skābi, aromātiski un neiespējami visu ziemu saglabājami svaigi. Vietējā atbilde bija tos cept, putot un žāvēt, un 1888. gadā tirgotājs Amvrosijs Prohorovs šo atbildi pārvērta uzņēmumā. Beļovas pastila tika pārdota pirmoreiz.

Personal name transliterated per Latvian convention: 'Amvrosy Prokhorov' → 'Amvrosijs Prohorovs'. Person names were not in the do-not-translate list; if it must stay in the English spelling, change indices 38 and 59 together.

---

**English:** gift sets

**Latvian:** dāvanu komplekti

Link label paired with index 49. Latvian 'sadaļā' + a section name is idiomatic with the nominative ('sadaļā Dāvanu komplekti'), so the label stays 'dāvanu komplekti'; if the link is instead stitched as a bare object, the locative 'dāvanu komplektos' would be needed.

---

**English:** Gift sets, tasting boxes and the box of twelve live under

**Latvian:** Dāvanu komplekti, degustācijas kastes un divpadsmit gabalu kaste ir apkopoti sadaļā

'the box of twelve' rendered as 'divpadsmit gabalu kaste'. Ends in 'sadaļā' to lead into the index 48 link — check the joined sentence in place.

---

**English:** Merchant Amvrosy Prokhorov puts baked-apple pastila into commercial production in the town of Belyov. Antonovka apples, egg white, thin layers, patience.

**Latvian:** Tirgotājs Amvrosijs Prohorovs Beļovas pilsētā sāk ceptu ābolu pastilas rūpniecisko ražošanu. Antonovkas āboli, olu baltums, plānas kārtas, pacietība.

Same personal-name transliteration as index 38 ('Amvrosijs Prohorovs').

---

**English:** Parcels leave Riga in 1–2 business days and ship across the EU; orders over €25 ship free. Retailer, café or office? We pack cases as happily as parcels.

**Latvian:** Sūtījumi no Rīgas izceļo 1–2 darbdienu laikā un tiek piegādāti visā ES; pasūtījumiem virs €25 piegāde ir bez maksas. Veikals, kafejnīca vai birojs? Kastes pakojam tikpat labprāt kā sūtījumus.

Kept verbatim: the en dash in 1–2 and the price €25 with its symbol and digits.

---

**English:** The front of the pack says what the back of the pack says. No “natural flavouring”, no E-numbers, no claims we cannot stand behind. Where a product does contain sugar, as our Belevini zephyr does, the label says so plainly.

**Latvian:** Iepakojuma priekšpuse saka to pašu, ko aizmugure. Nekādu „dabīgo aromatizētāju”, nekādu E numuru, nekādu apgalvojumu, par kuriem nevaram galvot. Ja produktā ir cukurs, kā mūsu Belevini zefīrā, etiķete to pasaka tieši.

Curly English quotes converted to Latvian „ ”. 'E-numbers' rendered as 'E numuri' (Latvian food labelling writes E followed by a space or the number, not a hyphen).

---

**English:** What pastila is, in full

**Latvian:** Kas ir pastila — pilnais stāsts

'in full' has no compact Latvian equivalent as a heading; rendered as 'pilnais stāsts' ('the full story'). If the heading must stay literal, 'Kas ir pastila, pilnībā' is the alternative.

---

**English:** Why Antonovka apples, in the journal

**Latvian:** Kāpēc Antonovkas āboli — žurnālā

'in the journal' rendered as 'žurnālā', assuming this links to the site's journal/blog section.

---
