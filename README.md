<div dir="rtl">

# Sallamat – Test Automation

مشروع أوتوميشن لاختبار منصة **سلامات (Sallamat)** على البيئة التجريبية `demo.sallamaat.com`.
المشروع مبني بـ **Playwright + TypeScript** وبيستخدم نمط **Page Object Model (POM)**، وبيغطي نوعين من الاختبارات:

- **UI (End-to-End):** بيفتح البراوزر ويعمل نفس اللي المستخدم بيعمله (تسجيل دخول، إنشاء حملة، رفع ملف، فلترة...).
- **API:** بيكلّم الـ APIs مباشرة من غير براوزر ويتأكد من الـ Response.

</div>

---

<div dir="rtl">

## فهرس

1. [المشروع بيختبر إيه؟](#المشروع-بيختبر-إيه)
2. [هيكل المشروع](#هيكل-المشروع)
3. [شرح كل فولدر بالتفصيل](#شرح-كل-فولدر-بالتفصيل)
4. [ملفات الإعدادات](#ملفات-الإعدادات)
5. [التسطيب](#التسطيب)
6. [تشغيل التستات](#تشغيل-التستات)
7. [إزاي التستات بتشتغل](#إزاي-التستات-بتشتغل)
8. [إزاي تضيف تيست جديد](#إزاي-تضيف-تيست-جديد)
9. [التقارير (reports/)](#التقارير-reports)

## المشروع بيختبر إيه؟

| الجزء في الموقع | التستات |
|---|---|
| **تسجيل الدخول** | فتح صفحة اللوجين، دخول صحيح، باسوورد غلط، حقول فاضية + نفس الحالات على مستوى الـ API |
| **الحملات اليدوية** | إنشاء حملة يدوية كاملة (اسم ← جمهور ← قالب ← إنشاء) |
| **فلاتر الحملات اليدوية** | مربع البحث + كل فلتر لوحده: الحالة، القالب، حالة القالب، المجموعة، نطاق التاريخ، الترتيب الزمني |
| **فلاتر الحملات التلقائية** | مربع البحث + كل فلتر لوحده: الحالة، الحدث، حالة القالب، نطاق التاريخ، الترتيب الزمني |
| **الحملات التلقائية** | إنشاء حملة تلقائية (اسم ← وصف ← حدث ← قالب ← تفعيل) |
| **القوالب** | إنشاء قالب بنص فقط / صورة / فيديو / ملف PDF + معاينة القالب وتعديله وإرساله للمراجعة + حذفه |
| **صندوق الإعلان** | إنشاء إعلان مع رفع صورة الإعلان ← الخطوات ← إطلاق الإعلان + البحث والتابات (الكل / مفعّلة / غير مفعّلة) |
| **العملاء** | تنزيل ملف الإكسل، ملؤه ببيانات عملاء، رفعه وتأكيد الرفع + البحث وكل الفلاتر (نوع العميل، التاريخ، الحملات، النوع، الترتيب، فلاتر مجمّعة) |
| **واتساب ودجت** | تعديل محتوى الرسائل، تخصيص المظهر (الموقع / الحجم / الإزاحة / اللون)، التفاعل (عند التمرير / عند الخمول)، إيقاف الودجت، رفع صورة الشعار، المعاينة اللايف + الـ validation (العنوان أقل من 5 حروف، الرقم فاضي) |
| **الإعدادات – تغيير كلمة السر** | تغيير ناجح ورجوع للقديم + حقول فاضية، تأكيد مش مطابق، باسوورد حالي غلط، إلغاء |

## هيكل المشروع

```
sallamat-official/
├── .github/workflows/
│   └── playwright.yml              # تشغيل التستات أوتوماتيك على GitHub
├── tests/
│   ├── specs/                      # ملفات التستات (مقسمة حسب الفيتشر)
│   │   ├── auth/
│   │   │   ├── login.spec.ts
│   │   │   └── login.api.spec.ts
│   │   ├── campaigns/
│   │   │   ├── manualCampaign.spec.ts
│   │   │   ├── autoCampaign.spec.ts
│   │   │   ├── manual-filters/         # فلاتر الحملات اليدوية
│   │   │   │   ├── 01-search.spec.ts
│   │   │   │   ├── 02-status.spec.ts
│   │   │   │   ├── 03-template.spec.ts
│   │   │   │   ├── 04-template-status.spec.ts
│   │   │   │   ├── 05-group.spec.ts
│   │   │   │   ├── 06-date-range.spec.ts
│   │   │   │   └── 07-sorting.spec.ts
│   │   │   └── auto-filters/           # فلاتر الحملات التلقائية
│   │   │       ├── 01-search.spec.ts
│   │   │       ├── 02-status.spec.ts
│   │   │       ├── 03-event.spec.ts
│   │   │       ├── 04-template-status.spec.ts
│   │   │       ├── 05-date-range.spec.ts
│   │   │       └── 06-sorting.spec.ts
│   │   ├── templates/
│   │   │   ├── createTemplate.text.spec.ts
│   │   │   ├── createTemplate.image.spec.ts
│   │   │   ├── createTemplate.video.spec.ts
│   │   │   ├── createTemplate.file.spec.ts
│   │   │   └── manage/                 # معاينة + تعديل + حذف القوالب
│   │   │       ├── 01-preview-edit.spec.ts
│   │   │       └── 02-delete.spec.ts
│   │   ├── ads/
│   │   │   ├── createAd.spec.ts
│   │   │   └── filters/                # البحث وتابات الإعلانات
│   │   │       ├── 01-search.spec.ts
│   │   │       ├── 02-all.spec.ts
│   │   │       ├── 03-active.spec.ts
│   │   │       └── 04-inactive.spec.ts
│   │   ├── customers/
│   │   │   ├── uploadCustomers.spec.ts
│   │   │   └── filters/                # فلاتر العملاء
│   │   │       ├── 01-search.spec.ts
│   │   │       ├── 02-customer-type.spec.ts
│   │   │       ├── 03-date-range.spec.ts
│   │   │       ├── 04-campaign.spec.ts
│   │   │       ├── 05-gender.spec.ts
│   │   │       ├── 06-sorting.spec.ts
│   │   │       └── 07-combined.spec.ts
│   │   ├── whatsapp-widget/            # واتساب ودجت – كل كيس في فايل
│   │   │   ├── 01-update-content.spec.ts
│   │   │   ├── 02-main-title-validation.spec.ts
│   │   │   ├── 03-phone-validation.spec.ts
│   │   │   ├── 04-appearance.spec.ts
│   │   │   ├── 05-interaction.spec.ts
│   │   │   ├── 06-deactivate.spec.ts
│   │   │   ├── 07-live-preview.spec.ts
│   │   │   └── 08-logo-upload.spec.ts
│   │   └── settings/
│   │       └── change-password/        # تغيير كلمة السر – كل كيس في فايل
│   │           ├── 01-change-password.spec.ts
│   │           ├── 02-empty-fields.spec.ts
│   │           ├── 03-mismatch-confirmation.spec.ts
│   │           ├── 04-wrong-current-password.spec.ts
│   │           └── 05-cancel.spec.ts
│   ├── pages/                      # Page Objects (اللوكيتورز والأكشنز لكل صفحة)
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   ├── ManualCampaignPage.ts
│   │   ├── CampaignsListPage.ts
│   │   ├── ManualCampaignsListPage.ts
│   │   ├── AutoCampaignsListPage.ts
│   │   ├── AutoCampaignPage.ts
│   │   ├── TemplatePage.ts
│   │   ├── TemplatesListPage.ts
│   │   ├── AdPage.ts
│   │   ├── AdsListPage.ts
│   │   ├── CustomersPage.ts
│   │   ├── CustomersListPage.ts
│   │   ├── WhatsAppWidgetPage.ts
│   │   └── SettingsPage.ts
│   ├── fixtures/                   # Playwright fixtures (تجهيز مشترك قبل التستات)
│   │   ├── campaignsList.fixture.ts
│   │   ├── adsList.fixture.ts
│   │   ├── customersList.fixture.ts
│   │   └── templatesList.fixture.ts
│   ├── utils/                      # أدوات مساعدة
│   │   ├── apiLogFormat.ts
│   │   ├── apiLogger.ts
│   │   ├── arabicTerminal.ts
│   │   ├── authResult.ts
│   │   └── excelHelper.ts
│   ├── testdata/
│   │   ├── testdata.json           # بيانات الدخول (محلي، مش في git)
│   │   └── testdata.example.json   # نموذج للملف ده
│   └── assets/                     # ملفات بتترفع أثناء التستات
│       ├── ad-image.png
│       ├── sample.png
│       ├── sample.mp4
│       └── sample.pdf
├── reports/                        # تقارير المشروع
│   ├── report.html                 # التقرير (HTML) – مصدر الـ PDF
│   └── Sallamat-Automation-Report.pdf
├── playwright.config.ts            # إعدادات Playwright
├── tsconfig.json                   # إعدادات TypeScript
├── package.json                    # المكتبات والأوامر (scripts)
├── RUN_COMMANDS.md                 # أوامر التشغيل بالتفصيل
└── README.md
```

## شرح كل فولدر بالتفصيل

### `tests/specs/` – ملفات التستات

ده المكان الوحيد اللي فيه التستات نفسها (`*.spec.ts`). Playwright بيدوّر على التستات هنا بس (`testDir: './tests/specs'`).
كل فولدر جواه = جزء من الموقع، وكل ملف بيوصف **السيناريو** بس (إيه اللي بيحصل وإيه المتوقع)، أما **إزاي** نضغط على الزراير فده موجود في `pages/`.

#### `specs/auth/` – تسجيل الدخول

| الملف | بيعمل إيه |
|---|---|
| `login.spec.ts` | **UI:** صفحة اللوجين بتفتح والفورم ظاهر، الدخول بإيميل وباسوورد صح، الدخول بباسوورد غلط يفضل في صفحة اللوجين، الدخول بحقول فاضية يفضل في صفحة اللوجين |
| `login.api.spec.ts` | **API:** بيجيب الـ CSRF token، بيعمل login صح ويتأكد إن الـ session اتعملت، باسوورد غلط ← 401، من غير CSRF ← رفض، حقول فاضية ← فشل. بيستخدم `sendAndLog` من `utils/apiLogger.ts` و`interpretAuth` من `utils/authResult.ts` |

#### `specs/campaigns/` – الحملات

| الملف | بيعمل إيه |
|---|---|
| `manualCampaign.spec.ts` | إنشاء حملة يدوية: الحملات اليدوية ← إنشاء حملة ← اسم عشوائي ← أول جمهور ← القالب `fffffffffffff` ← إنشاء الحملة ← التأكد إن اسم الحملة ظهر |
| `autoCampaign.spec.ts` | إنشاء حملة تلقائية: الحملات التلقائية ← إنشاء ← الاسم والوصف ← الحدث "تم إنشاء عميل" ← التالي ← القالب `fffffffffffff` + الشيك بوكس ← تفعيل الحملة |

#### `specs/campaigns/manual-filters/` – البحث والفلاتر في صفحة الحملات اليدوية

كل فلتر في ملف لوحده ومترقمين بالترتيب اللي ظاهر في الصفحة. كل تيست بيتأكد من 3 حاجات:
1. الـ API (`GET /api/campaign?filter[...]`) اتبعت صح ورجّع 200.
2. زرار الفلتر بيعرض القيمة اللي اخترناها.
3. **كل صف** في الجدول مطابق للفلتر.

| الملف | بيعمل إيه |
|---|---|
| `01-search.spec.ts` | البحث باسم حملة موجودة (كل النتايج فيها الكلمة)، اسم مش موجود (الجدول فاضي)، مسح البحث (الجدول يرجع زي ما كان) |
| `02-status.spec.ts` | قائمة الحالات صحيحة + تيست لكل حالة من الـ 8: مسودة، مكتملة، جاري الارسال، متوقفة، فشل الارسال، مجدولة، مؤجلة، قيد الانتظار |
| `03-template.spec.ts` | فلتر القالب `fffffffffffff` + مربع البحث اللي جوه الفلتر بيفلتر الاختيارات |
| `04-template-status.spec.ts` | قائمة حالات القالب صحيحة + تيست لكل حالة من الـ 5: معتمد، قيد الانتظار، متوقف مؤقتا، مرفوض، معطل |
| `05-group.spec.ts` | فلتر المجموعة `shady` (بيبعت `filter[group_ids][]`) |
| `06-date-range.spec.ts` | نطاق تاريخ من أول الشهر الحالي لحد النهارده – كل التواريخ في الجدول جوه النطاق |
| `07-sorting.spec.ts` | من الأقدم للأحدث (`sort=created_at`)، من الأحدث للأقدم هو الافتراضي (`sort=-created_at`)، والرجوع للأحدث بيرجّع نفس الترتيب الأصلي |

> لو حالة مفيهاش حملات في الداتا، التيست بينجح بس بيتكتب عليه ملاحظة **"No campaigns"** في الريبورت.

#### `specs/campaigns/auto-filters/` – البحث والفلاتر في صفحة الحملات التلقائية

نفس فكرة فلاتر الحملات اليدوية بالظبط (وبتستخدم نفس الكود المشترك)، بس على `GET /api/automated-campaigns?filter[...]`.
الفرق إن الصفحة دي فيها فلتر **الحدث** ومفيهاش فلتر القالب ولا المجموعة.

| الملف | بيعمل إيه |
|---|---|
| `01-search.spec.ts` | البحث باسم حملة موجودة، اسم مش موجود، مسح البحث |
| `02-status.spec.ts` | قائمة الحالات صحيحة + تيست لكل حالة من الـ 3. عمود الحالة في الجدول **زرار** مش نص، فبيتأكد من الاتنين: الـ API (`status`) والزرار في الجدول: مفعلة ← `active` وزرار **إيقاف**، غير مفعلة ← `inactive` وزرار **تشغيل**، متوقفة ← `stopped` وزرار **تشغيل** |
| `03-event.spec.ts` | قائمة الأحداث صحيحة + تيست لكل حدث من الـ 4: تم إنشاء عميل، إنشاء سلة مشتريات متروكة، تم إنشاء طلب، تحديث حالة الطلب (بيتأكد من `event_name` في الـ API وعمود الحدث في الجدول) |
| `04-template-status.spec.ts` | قائمة حالات القالب صحيحة + تيست لكل حالة من الـ 5 (لاحظ: هنا مكتوبة **متوقف مؤقتاً** بالتنوين، وفي اليدوية **متوقف مؤقتا** من غير تنوين) |
| `05-date-range.spec.ts` | نطاق تاريخ من أول الشهر لحد النهارده – على عمود **تاريخ الإنشاء** |
| `06-sorting.spec.ts` | من الأقدم للأحدث، الأحدث للأقدم هو الافتراضي، والرجوع للأحدث بيرجّع نفس الترتيب |

#### `specs/templates/` – القوالب

4 ملفات، كل واحد بينشئ قالب بنوع مرفق مختلف باستخدام `TemplatePage.createTemplate()`:

| الملف | نوع المرفق | الملف اللي بيترفع |
|---|---|---|
| `createTemplate.text.spec.ts` | نص فقط (هيدر نصي) | – |
| `createTemplate.image.spec.ts` | صورة | `assets/sample.png` |
| `createTemplate.video.spec.ts` | فيديو | `assets/sample.mp4` |
| `createTemplate.file.spec.ts` | ملف | `assets/sample.pdf` |

#### `specs/templates/manage/` – إدارة القوالب (معاينة / تعديل / حذف)

كل تيست بيشتغل على **قالب نصي جديد** بيعمله الـ fixture (`templatesList.fixture.ts`) باسم فريد، فمش بيلمس أي قالب حقيقي. ولو القالب لسه موجود بعد التيست بيتحذف أوتوماتيك.

| الملف | بيعمل إيه |
|---|---|
| `01-preview-edit.spec.ts` | **معاينة:** المعاينة بتعرض اسم القالب ومحتواه وبتتقفل. **تعديل:** فتح التعديل ← الحقول بتظهر بالداتا القديمة ← تعديل الهيدر والبودي والفوتر ← إرسال للمراجعة ← الـ request (PUT/PATCH/POST) يرجع أقل من 400 ← المحتوى الجديد يظهر في المعاينة |
| `02-delete.spec.ts` | **إلغاء** في نافذة الحذف يسيب القالب موجود، و**حذف** (السلة الحمرا) يشيل القالب من القائمة |

#### `specs/ads/` – صندوق الإعلان

| الملف | بيعمل إيه |
|---|---|
| `createAd.spec.ts` | صندوق الإعلان ← إنشاء إعلان ← رفع صورة الإعلان (`assets/ad-image.png` – 800×600) في مربع "صورة الإعلان" ← الخطوة القادمة ×4 ← إطلاق الإعلان |

#### `specs/ads/filters/` – البحث والتابات في صفحة الإعلانات

| الملف | بيعمل إيه |
|---|---|
| `01-search.spec.ts` | البحث بعنوان إعلان موجود (يظهر المطابق بس) وبعنوان غير موجود (مفيش نتايج) |
| `02-all.spec.ts` | تاب "الكل" يعرض المفعّلة وغير المفعّلة، والرجوع له يرجّع القائمة كاملة |
| `03-active.spec.ts` | تاب "مفعّلة" يعرض الإعلانات المفعّلة بس |
| `04-inactive.spec.ts` | تاب "غير مفعّلة" يعرض الإعلانات غير المفعّلة بس |

#### `specs/customers/` – العملاء

| الملف | بيعمل إيه |
|---|---|
| `uploadCustomers.spec.ts` | العملاء ← رفع البيانات يدويًا ← "اضغط للتنزيل" (بينزّل ملف الإكسل) ← يملاه بـ 3 عملاء بأرقام سعودية صحيحة ← يرفعه ← تأكيد ← يتأكد إن أول عميل ظهر في الجدول |

#### `specs/customers/filters/` – البحث والفلاتر في صفحة العملاء

| الملف | بيعمل إيه |
|---|---|
| `01-search.spec.ts` | البحث بالاسم / رقم الهاتف، حفظ النص في الـ URL، بحث بدون نتايج، ومسح البحث |
| `02-customer-type.spec.ts` | فلتر نوع العميل (الافتراضي "الكل" وكل الخيارات) |
| `03-date-range.spec.ts` | فلتر تاريخ آخر تعديل (من أول الشهر لحد النهارده، ويوم واحد) |
| `04-campaign.spec.ts` | فلتر الحملات (حملة واحدة وحملتين) |
| `05-gender.spec.ts` | فلتر النوع (ذكر / أنثى) |
| `06-sorting.spec.ts` | الترتيب الزمني (الأحدث للأقدم والعكس) بـ `updated_at` |
| `07-combined.spec.ts` | فلاتر مجمّعة (بحث + نوع + نوع عميل) واسترجاعها من الـ URL بعد reload |

#### `specs/whatsapp-widget/` – واتساب ودجت

كل كيس في فايل لوحده. التستات اللي بتحفظ بتتأكد من 3 حاجات:
1. `POST /api/whatsapp-widget` رجع نجاح + رسالة **"تم حفظ إعدادات ودجت واتساب بنجاح"**.
2. بعد الريفريش ➜ `GET /api/whatsapp-widget` بيرجّع القيم الجديدة (يعني اتحفظت فعلًا مش بس ظاهرة).
3. الفورم بعد الريفريش فيه القيم الجديدة.

> ⚠️ الفايلات اللي بتحفظ بتغيّر إعدادات الأكونت الحقيقية، فبتقرا القيم الأصلية في `beforeEach` وبترجّعها في `afterEach` **حتى لو التيست فشل**. شغّلهم واحد واحد أو بـ `--workers=1`.

| الملف | بيعمل إيه | بيحفظ؟ |
|---|---|---|
| `01-update-content.spec.ts` | تعديل العنوان الرئيسي + رسالة الترحيب + الرسالة الافتراضية ➜ حفظ ➜ التأكد إنها اتحفظت | ✅ وبيرجّع |
| `02-main-title-validation.spec.ts` | عنوان أقل من 5 حروف ➜ "العنوان الرئيسي لا يمكن أن يقل عن 5 أحرف" ومفيش request بيتبعت | ❌ |
| `03-phone-validation.spec.ts` | رقم الواتساب فاضي ➜ خطأ على الحقل ومفيش request بيتبعت | ❌ |
| `04-appearance.spec.ts` | موقع الأيقونة (عكس الحالي) + الحجم + الإزاحة من الأسفل + لون الشريط العلوي | ✅ وبيرجّع |
| `05-interaction.spec.ts` | عند التمرير (عكس الحالي) + عند الخمول ON + عدد الثواني | ✅ وبيرجّع |
| `06-deactivate.spec.ts` | إيقاف الودجت ➜ `is_active = false` | ✅ وبيرجّع |
| `07-live-preview.spec.ts` | المعاينة اللي على الشمال بتعرض النصوص وإنت بتكتب، ومن غير حفظ مفيش حاجة بتتغير | ❌ |
| `08-logo-upload.spec.ts` | حذف الشعار (X) ➜ رفع `assets/sample.png` ➜ المعاينة بتتغير ➜ حفظ ➜ `icon_logo` جديد. في الآخر بينزّل نسخة من الشعار الأصلي ويرفعها تاني (نفس الصورة بس بـ URL جديد على السيرفر) | ✅ وبيرجّع |

#### `specs/settings/change-password/` – تغيير كلمة السر

الإعدادات ← زرار **تغيير كلمة السر** ← بوب أب فيه: كلمة المرور الحالية، الجديدة، التأكيد ← **تأكيد** (`POST /api/auth/merchant/change-password`).

| الملف | بيعمل إيه |
|---|---|
| `01-change-password.spec.ts` | 3 خطوات مطبوعة في التيرمنال: **1)** تغيير الباسوورد (الحالي من `testdata.json` ➜ باسوورد مؤقت) **2)** الموقع بيقفل الـ session بعد التغيير ➜ لوجين بالباسوورد الجديد (الـ 401 المتوقعة هنا مش بتتطبع) **3)** رجوع الباسوورد القديم. لو الرجوع فشل، الباسوورد المؤقت بيتطبع في رسالة الخطأ |
| `02-empty-fields.spec.ts` | تأكيد والحقول فاضية ➜ "هذا الحقل مطلوب" (الموقع بيعرضها على أول حقل بس) |
| `03-mismatch-confirmation.spec.ts` | التأكيد مش مطابق للجديدة ➜ خطأ على حقل التأكيد والبوب أب يفضل مفتوح |
| `04-wrong-current-password.spec.ts` | باسوورد حالي غلط ➜ 422 "كلمة المرور القديمة غير صحيحة." |
| `05-cancel.spec.ts` | إلغاء ➜ البوب أب يتقفل من غير تغيير |

> ⚠️ `01` بيغيّر باسوورد الأكونت المشترك لثواني – لو تستات تانية عملت لوجين في نفس اللحظة هتفشل. شغّله لوحده أو بـ `--workers=1`.

---

### `tests/pages/` – الـ Page Objects

كل صفحة في الموقع ليها كلاس فيه:
- **Locators:** مكان كل عنصر في الصفحة (زرار، input، جدول...).
- **Actions:** الأفعال اللي بتتعمل في الصفحة (`fillName()`, `clickNext()`, `selectFilter()`...).
- **Flow كامل:** دالة واحدة بتعمل السيناريو كله (مثلًا `createAd()`).

الفايدة: لو لوكيتور اتغير في الموقع بنعدّله في مكان واحد بس، وكل التستات اللي بتستخدمه تتصلح.

| الملف | الصفحة | أهم الدوال |
|---|---|---|
| `BasePage.ts` | **الأساس** – كل الصفحات بتورث منه | `enableApiLogging()`: بيطبع كل API call في التيرمنال (Payload / Preview / Response) مرة واحدة. `muteApiLogging()` / `unmuteApiLogging()`: بيوقف الطباعة مؤقتًا لخطوات مش جزء من الأكشن (زي الـ 401 المتوقعة بعد تغيير الباسوورد) |
| `LoginPage.ts` | صفحة تسجيل الدخول | `goto()`, `login(email, password)`, `expectLoggedIn()`, `expectStillOnLogin()` |
| `ManualCampaignPage.ts` | إنشاء حملة يدوية | `openManualCampaigns()`, `fillCampaignName()`, `selectAudience()`, `selectTemplate()`, `clickCreateCampaign()` |
| `CampaignsListPage.ts` | **الأساس المشترك** لقوائم الحملات (اليدوية والتلقائية) – كل الكود بتاع البحث والفلاتر والجدول هنا، والصفحتين اللي تحت بيورثوا منه | `open()`, `search()`, `selectFilter(label, option)`, `getFilterOptions()`, `selectDateRange(from, to)`, `getColumnValues()`, `getNames()`, `expectAllRows()`, `printTable()` + `campaignsFrom(res)` بيقرا الحملات من الـ Response |
| `ManualCampaignsListPage.ts` | قائمة الحملات اليدوية | بيحدد الرابط والـ API ومربع البحث + ثابت `COLUMN` بأرقام أعمدة الجدول |
| `AutoCampaignsListPage.ts` | قائمة الحملات التلقائية | بيحدد الرابط والـ API ومربع البحث + `AUTO_COLUMN` (أرقام الأعمدة)، `AUTO_STATUS` (الحالة ← قيمة الـ API ونص الزرار)، `AUTO_EVENTS`، `AUTO_TEMPLATE_STATUSES` |
| `AutoCampaignPage.ts` | إنشاء حملة تلقائية | `createAutoCampaign()`, `selectTemplate()` (بيعلّم على الشيك بوكس), `activateCampaign()` |
| `TemplatePage.ts` | إنشاء قالب | `createTemplate({ type, filePath, ... })`, `selectAttachmentType()`, `submitTemplate()` |
| `TemplatesListPage.ts` | قائمة القوالب (إدارة) | `openFromSidebar()`, `search()`, `findTemplate()`, `openPreview()`, `closePreview()`, `openEdit()`, `editFields()`, `submitForReview()`, `clickDelete()`, `deleteTemplate()` |
| `AdPage.ts` | صندوق الإعلان | `createAd(imagePath)`, `uploadImage()`, `clickNextStep()`, `launchAd()` |
| `AdsListPage.ts` | قائمة الإعلانات | `openFromSidebar()`, `selectTab()` (الكل / مفعّلة / غير مفعّلة), `search()`, `clearSearch()`, `getCards()`, `getCardsCount()`, `printCards()` |
| `CustomersPage.ts` | العملاء (رفع الإكسل) | `openCustomers()`, `clickManualUpload()`, `downloadTemplate()`, `uploadFile()`, `confirm()` |
| `CustomersListPage.ts` | قائمة العملاء (بحث وفلاتر) | `open()`, `search()`, `clearSearch()`, `selectFilter()`, `getFilterOptions()`, `selectCampaigns()`, `selectDateRange()`, `getColumnValues()`, `getRowsCount()`, `printTable()` |
| `WhatsAppWidgetPage.ts` | واتساب ودجت | `goto()`, `readForm()` (كل القيم الحالية), `fillForm({...})`, `setSwitch()`, `setPosition()`, `uploadLogo()`, `downloadLogo()`, `save()`, `saveAndExpectSuccess()`, `reloadAndGetSaved()` (القيم المحفوظة من الـ API), `restore(original)`, `expectFieldError()` |
| `SettingsPage.ts` | الإعدادات – تغيير كلمة السر | `goto()`, `openChangePasswordDialog()`, `fillChangePasswordForm()`, `changePassword(old, new)` (بيرجّع الـ Response), `clickCancel()`, `expectDialogClosed()`, `expectFieldInvalid()` |

---

### `tests/fixtures/` – الـ Fixtures

الـ fixture هو تجهيز بيحصل **أوتوماتيك** قبل التيست وبعده، عشان ما نكررش نفس الكود في كل ملف.

| الملف | بيعمل إيه |
|---|---|
| `campaignsList.fixture.ts` | بيستخدمه ملفات `manual-filters/` و`auto-filters/`. **بيعمل login مرة واحدة بس لكل worker** ويحفظ الـ session (`storageState`) ويعيد استخدامها في كل التستات – لأن الموقع بيرفض logins كتير ورا بعض. بعدين بيفعّل طباعة الـ APIs ويفتح الصفحة من غير فلاتر، ويدّي التيست الصفحة جاهزة: `manualList` (الحملات اليدوية) أو `autoList` (الحملات التلقائية). بعد التيست بيعمل `page.pause()` (إلا لو `CI` أو `NO_PAUSE=1`) |
| `adsList.fixture.ts` | بيستخدمه `ads/filters/`. نفس الـ session المشتركة ← يفتح صفحة داخلية ← يضغط تاب "صندوق الإعلان" في السيدبار ← يطبع APIs الإعلانات. بيدّي التيست `adsList` |
| `customersList.fixture.ts` | بيستخدمه `customers/filters/`. نفس الـ session ← يفتح صفحة العملاء من غير فلاتر ← يطبع `GET /api/customers` لنتيجة الأكشن بس (مش تحميل الصفحة). بيدّي التيست `customersList` |
| `templatesList.fixture.ts` | بيستخدمه `templates/manage/`. نفس الـ session ← يعمل قالب نصي جديد (`template`) ← يفتح صفحة القوالب (`templatesList`). بعد التيست بيحذف القالب لو لسه موجود |

الاستخدام في التيست:
```ts
import { test, expect } from '../../../fixtures/campaignsList.fixture';

test('manual', async ({ manualList }) => {
    await manualList.selectFilter('الحالة', 'مكتملة');
});

test('auto', async ({ autoList }) => {
    await autoList.selectFilter('الحدث', 'تم إنشاء طلب');
});
```

---

### `tests/utils/` – أدوات مساعدة

| الملف | بيعمل إيه |
|---|---|
| `apiLogFormat.ts` | **الفورمات الموحّد** لطباعة أي API call في التيرمنال: **Payload** (الـ query params أو الـ body) – **Preview** (ملخص: المفاتيح وعدد العناصر) – **Response** (الـ JSON، بيتقص بعد 1200 حرف). بيمنع التكرار (نفس الـ call في 5 ثواني بيتطبع مرة)، وبيخفي الباسوورد والتوكن (أي حقل اسمه فيه `password` – زي `old_password` و`password_confirmation` – بيتخفي) |
| `apiLogger.ts` | `sendAndLog()` لتستات الـ API: بيبعت الـ request، يقيس الوقت، يطبع النتيجة بنفس الفورمات + سطر ✅ SUCCESS / ❌ FAILED، ويضيفها للريبورت |
| `arabicTerminal.ts` | بيصلّح العربي في التيرمنال (VS Code / Windows): بيوصّل الحروف ويكتب من اليمين للشمال. بيتفعّل من `playwright.config.ts` على التيرمنال بس (الريبورت بيفضل عربي عادي). `ARABIC_RAW=1` يطفيه، `ARABIC_SHAPING=1` يشغّله حتى لو الـ output رايح لملف |
| `authResult.ts` | `interpretAuth()`: بيفهم رد الـ login (next-auth بيرجّع 200 حتى لو فشل، فبيقرا الـ `error` من الـ URL ويحوّله لـ 401/403/...) |
| `excelHelper.ts` | `generateCustomers()`: بيولّد عملاء بأسماء وإيميلات وأرقام موبايل سعودية صحيحة (50/53/54/55/56/58/59). `fillCustomersTemplate()`: بيفتح ملف الإكسل اللي اتنزل، يقرا أسماء الأعمدة، ويملاها حسب اسم كل عمود (عربي أو إنجليزي). لو فيه عمود منفصل لكود الدولة بيكتب `966` فيه والرقم من غير الكود |

---

### `tests/testdata/` – بيانات الاختبار

| الملف | بيعمل إيه |
|---|---|
| `testdata.json` | بيانات الدخول (محلي، مش في git): `validUser` (حساب صحيح) و`invalidUser` (باسوورد غلط). كل التستات بتقرا منه، فلو الباسوورد اتغير بنعدّله هنا بس |
| `testdata.example.json` | نموذج للملف ده. انسخه باسم `testdata.json` واكتب بياناتك. في GitHub Actions بيتعمل من الـ secrets: `TEST_VALID_EMAIL` و`TEST_VALID_PASSWORD` و`TEST_INVALID_EMAIL` و`TEST_INVALID_PASSWORD` |

---

### `tests/assets/` – ملفات الرفع

ملفات ثابتة بتترفع أثناء التستات:

| الملف | مستخدم في |
|---|---|
| `ad-image.png` | صورة الإعلان (800×600 – المقاس الموصى بيه في الموقع) |
| `sample.png` | قالب بصورة + شعار واتساب ودجت |
| `sample.mp4` | قالب بفيديو |
| `sample.pdf` | قالب بملف |

---

### `.github/workflows/` – GitHub Actions

| الملف | بيعمل إيه |
|---|---|
| `playwright.yml` | **تشغيل يدوي بس** (`workflow_dispatch`) – مش بيشتغل مع كل push. الخطوات: يتأكد إن الـ secrets موجودة ← يسطّب المكتبات والبراوزرات ← يعمل `testdata.json` من الـ secrets ← يشغّل التستات ← يرفع الريبورت كـ artifact لمدة 30 يوم. على الـ CI البراوزر headless والتيست الفاشل بيتعاد مرتين (`retries: 2`) |

**إزاي تشغّله:** GitHub ← **Actions** ← **Playwright Tests** ← **Run workflow**. فيه خانة اختيارية `tests` تحط فيها مسار معين (مثلًا `tests/specs/customers`)، ولو سبتها فاضية بيشغّل كل التستات.

**الـ Secrets المطلوبة** (Settings ← Secrets and variables ← Actions ← Repository secrets):
`TEST_VALID_EMAIL` – `TEST_VALID_PASSWORD` – `TEST_INVALID_EMAIL` – `TEST_INVALID_PASSWORD`.
لو أي واحد ناقص أو فاضي، الرن بيقف من أول خطوة (**Check test secrets**) برسالة واضحة باسم الـ secret الناقص، بدل ما التستات تقع بـ 401 مش مفهوم.

---

### فولدرات بتتعمل أوتوماتيك (مش في git)

| الفولدر | فيه إيه |
|---|---|
| `playwright-report/` | ريبورت HTML لآخر رن |
| `test-results/` | لكل تيست فشل: سكرين شوت + فيديو + trace. وكمان ملفات الإكسل اللي اتنزلت واتملت |
| `node_modules/` | المكتبات |

## ملفات الإعدادات

| الملف | أهم الإعدادات |
|---|---|
| `playwright.config.ts` | `testDir: ./tests/specs` – الريبورتر `list` (بيطبع في التيرمنال) + `html` (بيفتح بعد كل رن) – `screenshot`/`video`/`trace` عند الفشل بس – البراوزر ظاهر إلا لو `HEADLESS=1` أو CI – Chromium |
| `tsconfig.json` | إعدادات TypeScript (strict، قراءة JSON، أنواع Node) |
| `package.json` | المكتبات (`@playwright/test`, `exceljs`, `typescript`) والأوامر المختصرة |

## التسطيب

```bash
npm ci
npx playwright install
```

بعدين اعمل ملف بيانات الدخول (مش موجود في git) واكتب فيه الإيميل والباسوورد بتوعك:
```powershell
Copy-Item tests/testdata/testdata.example.json tests/testdata/testdata.json
```

## تشغيل التستات

| الأمر | بيشغّل إيه |
|---|---|
| `npm test` | كل التستات |
| `npm run test:auth` | اللوجين (UI + API) |
| `npm run test:campaigns` | الحملات اليدوية والتلقائية والفلاتر |
| `npm run test:filters` | البحث والفلاتر (اليدوية + التلقائية) |
| `npm run test:filters:manual` | فلاتر الحملات اليدوية بس |
| `npm run test:filters:auto` | فلاتر الحملات التلقائية بس |
| `npm run test:templates` | كل أنواع القوالب (إنشاء + معاينة + تعديل + حذف) |
| `npm run test:templates:manage` | معاينة + تعديل + حذف القوالب |
| `npm run test:templates:edit` | معاينة القالب + تعديله ➜ إرسال للمراجعة |
| `npm run test:templates:delete` | حذف القالب (السلة الحمرا) |
| `npm run test:ads` | الإعلان (إنشاء + فلاتر) |
| `npm run test:ads:filters` | فلاتر الإعلانات بس |
| `npm run test:customers` | العملاء (رفع بالإكسل + فلاتر) |
| `npm run test:customers:filters` | فلاتر العملاء بس |
| `npm run test:widget` | واتساب ودجت (الـ 8 فايلات ورا بعض) |
| `npm run test:settings` | تغيير كلمة السر (الـ 5 فايلات ورا بعض) |
| `npm run test:api` | تستات الـ API بس |
| `npm run test:debug` | تشغيل مع الـ Inspector خطوة بخطوة |
| `npm run report` | فتح آخر ريبورت |
| `npm run typecheck` | فحص أخطاء TypeScript |

تشغيل ملف واحد:
```bash
npx playwright test tests/specs/campaigns/manualCampaign.spec.ts
```

تشغيل تيست واحد بالاسم:
```bash
npx playwright test -g "status = مكتملة"
```

### متغيرات اختيارية (PowerShell)

| المتغير | بيعمل إيه |
|---|---|
| `$env:HEADLESS="1"` | التستات تشتغل من غير ما البراوزر يظهر |
| `$env:NO_PAUSE="1"` | البراوزر ما يستناش Resume في آخر تستات الفلاتر |
| `$env:API_LOG_BODY="5000"` | يطبع Response أطول في التيرمنال |
| `$env:SHOW_SECRETS="1"` | يعرض الباسوورد والتوكن في اللوج بدل `********` |
| `$env:ARABIC_RAW="1"` | يطفي تصليح العربي في التيرمنال (لو التيرمنال بيدعم العربي أصلًا) |

مثال:
```powershell
$env:HEADLESS="1"; $env:NO_PAUSE="1"; npm run test:filters
```

## إزاي التستات بتشتغل

- **الـ APIs في التيرمنال:** كل call بيتطبع **مرة واحدة** بالشكل ده:
  ```
  ━━━ ✅ GET 200 OK · 856 ms ━━━
  https://api.demo.sallamaat.com/api/campaign?...
  ▸ Payload
    filter[name]: Auto Campaig
  ▸ Preview
    data: { data, statistics, pagination }
      data: Array(12)
  ▸ Response
    { ... }
  ```
- **البراوزر بيفضل مفتوح بعد الرن:** التستات بتعمل `page.pause()` في الآخر – اضغط **Resume** في نافذة Playwright Inspector عشان يخلص.
- **ريبورت بعد كل رن:** `playwright-report/index.html` بيفتح لوحده (نجاح أو فشل).
- **لو تيست فشل:** سكرين شوت + فيديو + trace بيتحفظوا ويظهروا جوه الريبورت.
- **بيانات عشوائية:** أسماء الحملات والقوالب والعملاء بتتولّد بـ `Date.now()` عشان كل رن يبقى فريد.

## إزاي تضيف تيست جديد

1. **لو الصفحة جديدة:** اعمل كلاس في `tests/pages/` بيورث من `BasePage`:
   ```ts
   import { expect, type Locator, type Page } from '@playwright/test';
   import { BasePage } from './BasePage';

   export class MyPage extends BasePage {
       readonly saveButton: Locator;

       constructor(page: Page) {
           super(page);
           this.saveButton = page.locator("//button[contains(text(),'حفظ')]");
       }

       async save() {
           await expect(this.saveButton).toBeEnabled();
           await this.saveButton.click();
       }
   }
   ```
2. **اعمل ملف التيست** في الفولدر المناسب جوه `tests/specs/<feature>/` – **كل كيس في فايل لوحده** ومترقّم (`01-....spec.ts`, `02-....spec.ts`).
3. في `beforeEach`: اعمل login من `LoginPage` وفعّل `enableApiLogging()`.
   لو التيست بيغيّر داتا حقيقية في الأكونت (باسوورد، إعدادات): اقرا القيم الأصلية في `beforeEach` ورجّعها في `afterEach`.
4. **الملفات اللي بتترفع** حطها في `tests/assets/`، و**البيانات الثابتة** في `tests/testdata/`.
5. شغّل `npm run typecheck` وبعدين التيست.

## التقارير (`reports/`)

| الملف | فيه إيه |
|---|---|
| `report.html` | تقرير الأتمتة (عربي، مقاس A4): ملخص تنفيذي، اللي اتعمل في كل وحدة وعدد التستات (88 تيست في 49 ملف)، بنية الإطار، تقييم أداة **e2e** كإضافة محتملة (مقارنة مع Playwright، الفوايد، المخاطر)، والتوصية بتجربة محدودة (PoC) |
| `Sallamat-Automation-Report.pdf` | نفس التقرير كـ PDF جاهز للإرسال |

لو عدّلت التقرير: عدّل `report.html` وافتحه في البراوزر ← Print ← Save as PDF عشان تطلّع الـ PDF من جديد.

</div>
