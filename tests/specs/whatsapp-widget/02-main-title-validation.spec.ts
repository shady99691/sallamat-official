import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { WhatsAppWidgetPage } from '../../pages/WhatsAppWidgetPage';
import testData from '../../testdata/testdata.json';

// ============================================================
//  واتساب ودجت – العنوان الرئيسي أقل من 5 حروف
//  Flow: تسجيل دخول ➜ واتساب ودجت ➜ العنوان الرئيسي = "abc" ➜ حفظ
//  المتوقع: "العنوان الرئيسي لا يمكن أن يقل عن 5 أحرف" ومفيش request بيتبعت
// ============================================================
test.describe('WhatsApp widget', () => {

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

    test('Main title shorter than 5 characters shows validation error', async ({ page }) => {
        let saveRequestSent = false;
        page.on('request', (r) => {
            if (widgetPage.apiUrl.test(r.url()) && r.method() === 'POST') saveRequestSent = true;
        });

        await widgetPage.fillForm({ mainTitle: 'abc' });
        await widgetPage.saveButton.click();

        await widgetPage.expectFieldError(widgetPage.mainTitleInput, 'العنوان الرئيسي لا يمكن أن يقل عن 5 أحرف');
        expect(saveRequestSent, 'الفورم اتبعت رغم إن العنوان غلط').toBe(false);
    });
});
