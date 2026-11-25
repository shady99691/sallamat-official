import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { WhatsAppWidgetPage, type WidgetFormValues } from '../../pages/WhatsAppWidgetPage';
import testData from '../../testdata/testdata.json';

// ============================================================
//  واتساب ودجت – رفع صورة شعار الأيقونة
//  Flow: تسجيل دخول ➜ واتساب ودجت ➜ حذف الشعار الحالي (X) ➜ رفع صورة جديدة ➜
//        المعاينة بتتغير ➜ حفظ ➜ ريفريش ➜ icon_logo اتغيّر
//  ⚠️ بيغيّر الشعار فعلًا ➜ في الآخر بيرفع نسخة من الشعار الأصلي تاني
//     (نفس الصورة – بس الـ URL على السيرفر بيبقى جديد)
// ============================================================
test.describe('WhatsApp widget', () => {

    const newLogo = 'tests/assets/sample.png';

    let loginPage: LoginPage;
    let widgetPage: WhatsAppWidgetPage;
    let original: WidgetFormValues | undefined;
    let originalLogoUrl: string | null = null;
    let originalLogoFile: string | undefined;

    test.beforeEach(async ({ page }, testInfo) => {
        // بدون timeout على الجهاز عشان البراوزر يفضل مفتوح بعد الرن – في الـ CI: 3 دقايق
        test.setTimeout(process.env.CI ? 180_000 : 0);

        loginPage = new LoginPage(page);
        widgetPage = new WhatsAppWidgetPage(page);

        // طباعة الـ APIs في التيرمنال – الداتا اللي التيست عملها بس
        widgetPage.enableApiLogging();

        await loginPage.goto();
        await loginPage.login(testData.validUser.email, testData.validUser.password);
        await loginPage.expectLoggedIn();

        await widgetPage.goto();
        original = await widgetPage.readForm();

        // نسخة من الشعار الأصلي عشان نرجّعه في الآخر
        originalLogoUrl = await widgetPage.logoPreviewImage.isVisible()
            ? await widgetPage.logoPreviewImage.getAttribute('src')
            : null;
        if (originalLogoUrl) {
            originalLogoFile = await widgetPage.downloadLogo(originalLogoUrl, testInfo.outputPath());
        }
    });

    // البراوزر يفضل مفتوح بعد الرن (نجح أو فشل) لحد ما تضغط Resume في الـ Inspector
    test.afterEach(async ({ page }) => {
        // رجوع الشعار الأصلي + باقي الإعدادات – حتى لو التيست فشل
        if (original) {
            await widgetPage.goto();
            if (originalLogoFile) await widgetPage.uploadLogo(originalLogoFile);
            await widgetPage.fillForm(original);
            await widgetPage.saveAndExpectSuccess();
            console.log('↩️  الشعار الأصلي رجع');
        }
        if (!process.env.CI && process.env.NO_PAUSE !== '1') await page.pause();
    });

    test('Upload icon logo successfully', async () => {
        await widgetPage.uploadLogo(newLogo);

        // المعاينة بتعرض الصورة الجديدة قبل الحفظ
        const previewSrc = await widgetPage.previewToggleButton.locator('img').getAttribute('src');
        expect(previewSrc, 'المعاينة لسه بتعرض الشعار القديم').not.toBe(originalLogoUrl);

        const response = await widgetPage.saveAndExpectSuccess();
        const body = await response.json();
        const uploadedUrl: string = (Array.isArray(body.data) ? body.data[0] : body.data).icon_logo;
        expect(uploadedUrl, 'الـ Response مفيهوش icon_logo').toBeTruthy();
        expect(uploadedUrl).not.toBe(originalLogoUrl);

        // بعد الريفريش ➜ الشعار الجديد هو المحفوظ والظاهر
        const saved = await widgetPage.reloadAndGetSaved();
        expect(saved.icon_logo).toBe(uploadedUrl);
        await expect(widgetPage.logoPreviewImage).toHaveAttribute('src', uploadedUrl);
        console.log(`✅ الشعار الجديد: ${uploadedUrl}`);
    });
});
