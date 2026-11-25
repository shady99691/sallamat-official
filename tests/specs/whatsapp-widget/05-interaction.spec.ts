import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { WhatsAppWidgetPage, type WidgetFormValues } from '../../pages/WhatsAppWidgetPage';
import testData from '../../testdata/testdata.json';

// ============================================================
//  واتساب ودجت – التفاعل مع الودجت
//  Flow: تسجيل دخول ➜ واتساب ودجت ➜ عند التمرير (عكس الحالي) + عند الخمول ON + بعد عدد ثواني ➜
//        حفظ ➜ ريفريش ➜ القيم الجديدة محفوظة
//  ⚠️ بيغيّر إعدادات الأكونت فعلًا ➜ وفي الآخر بيرجّعها للقيم الأصلية
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

    test('Update interaction settings (on scroll, on idle, idle seconds) successfully', async () => {
        const interaction = {
            onScroll: !original!.onScroll,
            onIdle: true,
            idleSeconds: original!.idleSeconds === '12' ? '15' : '12',
        };

        await widgetPage.fillForm(interaction);
        await expect(widgetPage.idleSecondsInput).toHaveValue(interaction.idleSeconds);
        await widgetPage.saveAndExpectSuccess();

        const saved = await widgetPage.reloadAndGetSaved();
        expect(saved.show_chat).toBe(interaction.onScroll);
        expect(saved.open_chat).toBe(true);
        expect(String(saved.after_open_chat_seconds)).toBe(interaction.idleSeconds);

        // الفورم بعد الريفريش فيه القيم الجديدة
        await expect(widgetPage.onScrollSwitch).toHaveAttribute('aria-checked', String(interaction.onScroll));
        await expect(widgetPage.onIdleSwitch).toHaveAttribute('aria-checked', 'true');
        await expect(widgetPage.idleSecondsInput).toHaveValue(interaction.idleSeconds);
    });
});
