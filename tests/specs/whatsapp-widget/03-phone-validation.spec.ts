import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { WhatsAppWidgetPage } from '../../pages/WhatsAppWidgetPage';
import testData from '../../testdata/testdata.json';

// ============================================================
//  واتساب ودجت – رقم الواتساب فاضي
//  Flow: تسجيل دخول ➜ واتساب ودجت ➜ مسح رقم واتس اب ➜ حفظ
//  المتوقع: خطأ على حقل الرقم ومفيش request بيتبعت
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

    test('Empty WhatsApp phone shows validation error', async ({ page }) => {
        let saveRequestSent = false;
        page.on('request', (r) => {
            if (widgetPage.apiUrl.test(r.url()) && r.method() === 'POST') saveRequestSent = true;
        });

        await widgetPage.fillForm({ phone: '' });
        await widgetPage.saveButton.click();

        await widgetPage.expectFieldError(widgetPage.phoneInput);
        expect(saveRequestSent, 'الفورم اتبعت والرقم فاضي').toBe(false);
    });
});
