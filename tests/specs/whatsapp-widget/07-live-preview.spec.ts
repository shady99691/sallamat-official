import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { WhatsAppWidgetPage } from '../../pages/WhatsAppWidgetPage';
import testData from '../../testdata/testdata.json';

// ============================================================
//  واتساب ودجت – المعاينة بتتحدث لايف
//  Flow: تسجيل دخول ➜ واتساب ودجت ➜ كتابة عنوان + ترحيب + رسالة افتراضية (من غير حفظ)
//  المتوقع: المعاينة اللي على الشمال بتعرض النصوص الجديدة على طول – ومفيش حاجة بتتحفظ
// ============================================================
test.describe('WhatsApp widget', () => {

    const stamp = Date.now().toString().slice(-5);
    const typed = {
        mainTitle: `معاينة ${stamp}`,
        welcomeMessage: `ترحيب للمعاينة ${stamp}`,
        defaultMessage: `افتراضية للمعاينة ${stamp}`,
    };

    let loginPage: LoginPage;
    let widgetPage: WhatsAppWidgetPage;

    test.beforeEach(async ({ page }) => {
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
    });

    // البراوزر يفضل مفتوح بعد الرن (نجح أو فشل) لحد ما تضغط Resume في الـ Inspector
    test.afterEach(async ({ page }) => {
        if (!process.env.CI && process.env.NO_PAUSE !== '1') await page.pause();
    });

    test('Preview updates live while typing (without saving)', async () => {
        await expect(widgetPage.previewToggleButton).toBeVisible();

        await widgetPage.fillForm(typed);

        await expect(widgetPage.previewTitle).toHaveText(typed.mainTitle);
        await expect(widgetPage.previewWelcome).toHaveText(typed.welcomeMessage);
        await expect(widgetPage.previewDefault).toHaveText(typed.defaultMessage);

        // من غير حفظ ➜ بعد الريفريش القيم القديمة لسه زي ما هي
        const saved = await widgetPage.reloadAndGetSaved();
        expect(saved.text_header).not.toBe(typed.mainTitle);
        await expect(widgetPage.mainTitleInput).toHaveValue(saved.text_header);
    });
});
