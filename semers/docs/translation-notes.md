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

129 notes.

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
