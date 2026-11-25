# أوامر الرن – Sallamat

انسخ الأمر اللي عايزه وشغله في التيرمنال من فولدر المشروع.

---

## 🔁 كل التستات

```bash
npx playwright test
```

---

## 🔐 Auth

```bash
# الفولدر كله
npx playwright test tests/specs/auth

# Login (UI)
npx playwright test tests/specs/auth/login.spec.ts

# Login (API)
npx playwright test tests/specs/auth/login.api.spec.ts
```

---

## 📣 Campaigns

```bash
# الفولدر كله (الحملات + الفلاتر)
npx playwright test tests/specs/campaigns

# إنشاء حملة يدوية
npx playwright test tests/specs/campaigns/manualCampaign.spec.ts

# إنشاء حملة تلقائية
npx playwright test tests/specs/campaigns/autoCampaign.spec.ts
```

### 🔎 Manual Filters (فلاتر الحملات اليدوية)

```bash
# الفولدر كله
npx playwright test tests/specs/campaigns/manual-filters

# Search
npx playwright test tests/specs/campaigns/manual-filters/01-search.spec.ts

# Status
npx playwright test tests/specs/campaigns/manual-filters/02-status.spec.ts

# Template
npx playwright test tests/specs/campaigns/manual-filters/03-template.spec.ts

# Template status
npx playwright test tests/specs/campaigns/manual-filters/04-template-status.spec.ts

# Group
npx playwright test tests/specs/campaigns/manual-filters/05-group.spec.ts

# Date range
npx playwright test tests/specs/campaigns/manual-filters/06-date-range.spec.ts

# Sorting
npx playwright test tests/specs/campaigns/manual-filters/07-sorting.spec.ts
```

### 🔎 Auto Filters (فلاتر الحملات التلقائية)

```bash
# الفولدر كله
npx playwright test tests/specs/campaigns/auto-filters

# Search
npx playwright test tests/specs/campaigns/auto-filters/01-search.spec.ts

# Status
npx playwright test tests/specs/campaigns/auto-filters/02-status.spec.ts

# Event
npx playwright test tests/specs/campaigns/auto-filters/03-event.spec.ts

# Template status
npx playwright test tests/specs/campaigns/auto-filters/04-template-status.spec.ts

# Date range
npx playwright test tests/specs/campaigns/auto-filters/05-date-range.spec.ts

# Sorting
npx playwright test tests/specs/campaigns/auto-filters/06-sorting.spec.ts
```

---

## 📝 Templates

```bash
# الفولدر كله
npx playwright test tests/specs/templates

# قالب نصي
npx playwright test tests/specs/templates/createTemplate.text.spec.ts

# قالب صورة
npx playwright test tests/specs/templates/createTemplate.image.spec.ts

# قالب فيديو
npx playwright test tests/specs/templates/createTemplate.video.spec.ts

# قالب ملف
npx playwright test tests/specs/templates/createTemplate.file.spec.ts
```

### 🛠️ Templates Manage (معاينة + تعديل + حذف)

```bash
# الفولدر كله (معاينة + تعديل + حذف)
npx playwright test tests/specs/templates/manage

# معاينة القالب + تعديل القالب ➜ إرسال للمراجعة
npx playwright test tests/specs/templates/manage/01-preview-edit.spec.ts

# حذف القالب (السلة الحمرا) + إلغاء الحذف
npx playwright test tests/specs/templates/manage/02-delete.spec.ts

# تيست واحد بالاسم
npx playwright test tests/specs/templates/manage -g "edit template"
npx playwright test tests/specs/templates/manage -g "delete button"
```

---

## 📢 Ads

```bash
npx playwright test tests/specs/ads/createAd.spec.ts
```

### 🔎 Ads Filters (فلاتر الإعلانات + البحث)

```bash
# الفولدر كله
npx playwright test tests/specs/ads/filters

# Search
npx playwright test tests/specs/ads/filters/01-search.spec.ts

# الكل
npx playwright test tests/specs/ads/filters/02-all.spec.ts

# مفعّلة
npx playwright test tests/specs/ads/filters/03-active.spec.ts

# غير مفعّلة
npx playwright test tests/specs/ads/filters/04-inactive.spec.ts
```

---

## 👥 Customers

```bash
# رفع عملاء من Excel (بيطبع Payload / Preview / Response كاملين)
npx playwright test tests/specs/customers/uploadCustomers.spec.ts
```

### 🔎 Customers Filters (فلاتر العملاء + البحث)

```bash
# الفولدر كله
npx playwright test tests/specs/customers/filters

# Search (اسم العميل / رقم الهاتف)
npx playwright test tests/specs/customers/filters/01-search.spec.ts

# العملاء (نوع العميل)
npx playwright test tests/specs/customers/filters/02-customer-type.spec.ts

# تاريخ آخر تعديل
npx playwright test tests/specs/customers/filters/03-date-range.spec.ts

# الحملات
npx playwright test tests/specs/customers/filters/04-campaign.spec.ts

# النوع (ذكر / أنثى)
npx playwright test tests/specs/customers/filters/05-gender.spec.ts

# الترتيب الزمني
npx playwright test tests/specs/customers/filters/06-sorting.spec.ts

# أكتر من فلتر مع بعض
npx playwright test tests/specs/customers/filters/07-combined.spec.ts
```

---

## 💬 WhatsApp Widget (واتساب ودجت)

```bash
# الفولدر كله – الفايلات ورا بعض (--workers=1) عشان ما يبوّظوش بعض
npx playwright test tests/specs/whatsapp-widget --workers=1

# تعديل محتوى الرسائل (العنوان + الترحيب + الافتراضية) ➜ حفظ ➜ يرجّع القديم
npx playwright test tests/specs/whatsapp-widget/01-update-content.spec.ts

# العنوان الرئيسي أقل من 5 حروف ➜ خطأ
npx playwright test tests/specs/whatsapp-widget/02-main-title-validation.spec.ts

# رقم الواتساب فاضي ➜ خطأ
npx playwright test tests/specs/whatsapp-widget/03-phone-validation.spec.ts

# تخصيص المظهر (موقع + حجم + إزاحة + لون) ➜ حفظ ➜ يرجّع القديم
npx playwright test tests/specs/whatsapp-widget/04-appearance.spec.ts

# التفاعل (عند التمرير + عند الخمول + عدد الثواني) ➜ حفظ ➜ يرجّع القديم
npx playwright test tests/specs/whatsapp-widget/05-interaction.spec.ts

# إيقاف الودجت ➜ حفظ ➜ يرجّع القديم
npx playwright test tests/specs/whatsapp-widget/06-deactivate.spec.ts

# المعاينة بتتحدث لايف وإنت بتكتب (من غير حفظ)
npx playwright test tests/specs/whatsapp-widget/07-live-preview.spec.ts

# رفع صورة شعار الأيقونة ➜ حفظ ➜ يرفع الشعار الأصلي تاني
npx playwright test tests/specs/whatsapp-widget/08-logo-upload.spec.ts
```

> ⚠️ شغّل كل فايل لوحده. `01` و`04` و`05` و`06` و`08` بيغيّروا إعدادات الودجت فعلًا، وبيرجّعوها للقيم الأصلية في آخر التيست حتى لو التيست فشل.

---

## ⚙️ Settings (الإعدادات)

```bash
# الفولدر كله – الفايلات ورا بعض (--workers=1) عشان ما يبوّظوش بعض
npx playwright test tests/specs/settings --workers=1

# تغيير كلمة السر – تغيير ناجح (الحالي ➜ جديد ➜ يرجع للحالي)
npx playwright test tests/specs/settings/change-password/01-change-password.spec.ts

# الحقول فاضية ➜ "هذا الحقل مطلوب"
npx playwright test tests/specs/settings/change-password/02-empty-fields.spec.ts

# التأكيد مش مطابق للجديدة
npx playwright test tests/specs/settings/change-password/03-mismatch-confirmation.spec.ts

# الباسوورد الحالي غلط ➜ 422
npx playwright test tests/specs/settings/change-password/04-wrong-current-password.spec.ts

# إلغاء
npx playwright test tests/specs/settings/change-password/05-cancel.spec.ts
```

> ⚠️ شغّل كل فايل لوحده. `01` بيغيّر باسوورد الأكونت فعلًا وبعدين يرجّعه للقديم. لو اتشغّل مع الفايلات التانية في نفس الوقت، اللوجين بتاعها هيفشل. لو الرجوع فشل، الباسوورد المؤقت بيتطبع في رسالة الخطأ.

---

## ⚙️ إضافات تحطها في آخر أي أمر

| الإضافة | بتعمل إيه |
|---|---|
| `--headed` | البراوزر يظهر (هو أصلًا ظاهر افتراضيًا) |
| `--debug` | تمشي خطوة بخطوة بالـ Inspector |
| `--ui` | واجهة Playwright التفاعلية |
| `-g "اسم التست"` | تشغل تست واحد بالاسم بس |
| `--reporter=line` | لوج أقصر في التيرمنال |
| `--repeat-each=3` | تكرر التست 3 مرات |
| `--workers=1` | التستات تمشي ورا بعض مش مع بعض |

**مثال:**
```bash
npx playwright test tests/specs/campaigns/auto-filters/02-status.spec.ts -g "status filter lists" --debug
```

---

## 🖥️ متغيرات التشغيل (PowerShell)

```powershell
# من غير ما البراوزر يظهر
$env:HEADLESS="1"; npx playwright test tests/specs/campaigns/auto-filters

# Response أطول في التيرمنال (الافتراضي 1200 حرف)
$env:API_LOG_BODY="100000"; npx playwright test tests/specs/campaigns/auto-filters/01-search.spec.ts

# إظهار الباسوورد والتوكن في اللوج
$env:SHOW_SECRETS="1"; npx playwright test tests/specs/auth/login.spec.ts

# العربي بالشكل الأصلي (لو التيرمنال بتاعك بيدعم العربي من نفسه)
$env:ARABIC_RAW="1"; npx playwright test tests/specs/customers/uploadCustomers.spec.ts
```

> المتغيرات دي بتفضل شغالة في نفس نافذة التيرمنال. عشان تلغيها:
> `Remove-Item Env:HEADLESS, Env:API_LOG_BODY, Env:SHOW_SECRETS, Env:ARABIC_RAW -ErrorAction SilentlyContinue`

---

## 🧾 الداتا اللي بتتطبع في التيرمنال

- **تستات الأكشن** (create حملة / قالب / إعلان / رفع عملاء): بيتطبع **الداتا اللي التيست عملها بس**
  - طلب الأكشن نفسه (POST / PUT / DELETE) بالـ Payload والـ Response كاملين
  - الملفات اللي بتتحمل
  - العناصر الجديدة بس من أي list بعد الأكشن
  - أي request فشل (4xx / 5xx)
- **تستات الفلاتر**: بيتطبع كل request بنتايجه (عشان تشوف الفلتر رجّع إيه)
- عايز كل الـ APIs في تيست أكشن؟ غيّر `enableApiLogging()` لـ `enableApiLogging({ newOnly: false })`

---

## ☁️ تشغيل على GitHub Actions (CI/CD)

الـ workflow يدوي بس. من GitHub: **Actions ← Playwright Tests ← Run workflow**، وفي خانة المسار اكتب المسار من الأوامر اللي فوق (من غير `npx playwright test`). سيبها فاضية لتشغيل الكل.

| عايز تشغّل | اكتب في الخانة |
|---|---|
| الكل | *(فاضي)* |
| Auth | `tests/specs/auth` |
| Login UI | `tests/specs/auth/login.spec.ts` |
| Login API | `tests/specs/auth/login.api.spec.ts` |
| الحملات كلها | `tests/specs/campaigns` |
| حملة يدوية | `tests/specs/campaigns/manualCampaign.spec.ts` |
| حملة تلقائية | `tests/specs/campaigns/autoCampaign.spec.ts` |
| فلاتر الحملات اليدوية | `tests/specs/campaigns/manual-filters` |
| فلاتر الحملات التلقائية | `tests/specs/campaigns/auto-filters` |
| القوالب كلها | `tests/specs/templates` |
| إدارة القوالب | `tests/specs/templates/manage` |
| الإعلانات | `tests/specs/ads` |
| فلاتر الإعلانات | `tests/specs/ads/filters` |
| العملاء | `tests/specs/customers` |
| فلاتر العملاء | `tests/specs/customers/filters` |
| واتساب ودجت (كله) | `tests/specs/whatsapp-widget` |
| واتساب ودجت (تعديل المحتوى) | `tests/specs/whatsapp-widget/01-update-content.spec.ts` |
| الإعدادات (تغيير كلمة السر كله) | `tests/specs/settings` |
| تغيير كلمة السر (ناجح) | `tests/specs/settings/change-password/01-change-password.spec.ts` |
| ملف معين | `tests/specs/customers/filters/04-campaign.spec.ts` |

> على الـ CI الفايلات بتشتغل ورا بعض أصلًا (`workers: 1`)، فواتساب ودجت والإعدادات آمنين هناك.
> ممكن تكتب أكتر من مسار بمسافة بينهم، مثال: `tests/specs/ads tests/specs/customers`
> التقرير بيتحمّل من آخر الرن في Artifacts باسم `playwright-report`.

---

## 📊 التقرير

```bash
npx playwright show-report
```
//  asmaa_fadel@azzrk.com   هنا لو  هنشتغل  اتوميت كامبين 
//123456789