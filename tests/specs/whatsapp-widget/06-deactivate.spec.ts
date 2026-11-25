import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { WhatsAppWidgetPage, type WidgetFormValues } from '../../pages/WhatsAppWidgetPage';
import testData from '../../testdata/testdata.json';

// ============================================================
//  واتساب ودجت – إيقاف الودجت
//  Flow: تسجيل دخول ➜ واتساب ودجت ➜ تفعيل واتس اب ودجت = OFF ➜ حفظ ➜ ريفريش ➜ is_active = false
//  ⚠️ بيقفل الودجت فعلًا ➜ وفي الآخر بيرجّعه زي ما كان
// ============================================================
test.describe('WhatsApp widget', () => {

    let loginPage: LoginPage;
    let widgetPage: WhatsAppWidgetPage;
    let original: WidgetFormValues | undefined;

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
        original = await widgetPage.readForm();
    });

    // البراوزر يفضل مفتوح بعد الرن (نجح أو فشل) لحد ما تضغط Resume في الـ Inspector
    test.afterEach(async ({ page }) => {
        // رجوع الإعدادات الأصلية – حتى لو التيست فشل
        if (original) await widgetPage.restore(original);
        if (!process.env.CI && process.env.NO_PAUSE !== '1') await page.pause();
    });

    test('Deactivate widget successfully', async () => {
        await widgetPage.setSwitch(widgetPage.activeSwitch, false);
        await widgetPage.saveAndExpectSuccess();

        const saved = await widgetPage.reloadAndGetSaved();
        expect(saved.is_active).toBe(false);
        await expect(widgetPage.activeSwitch).toHaveAttribute('aria-checked', 'false');
    });
});
