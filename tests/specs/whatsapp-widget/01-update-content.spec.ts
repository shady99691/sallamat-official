import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { WhatsAppWidgetPage, type WidgetFormValues } from '../../pages/WhatsAppWidgetPage';
import testData from '../../testdata/testdata.json';

// ============================================================
//  واتساب ودجت – تعديل محتوى الرسائل
//  Flow: تسجيل دخول ➜ واتساب ودجت ➜ العنوان الرئيسي + رسالة الترحيب + الرسالة الافتراضية ➜
//        حفظ ➜ "تم حفظ إعدادات ودجت واتساب بنجاح" ➜ ريفريش ➜ القيم الجديدة محفوظة
//  ⚠️ بيغيّر إعدادات الأكونت فعلًا ➜ وفي الآخر بيرجّعها للقيم الأصلية
// ============================================================
test.describe('WhatsApp widget', () => {

    const stamp = Date.now().toString().slice(-5);
    const newContent = {
        mainTitle: `QA عنوان ${stamp}`,
        welcomeMessage: `QA رسالة ترحيب ${stamp}`,
        defaultMessage: `QA رسالة افتراضية ${stamp}`,
    };

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

    test('Update messages content successfully', async () => {
        await widgetPage.fillForm(newContent);
        await widgetPage.saveAndExpectSuccess();

        const saved = await widgetPage.reloadAndGetSaved();
        expect(saved.text_header).toBe(newContent.mainTitle);
        expect(saved.welcome_message).toBe(newContent.welcomeMessage);
        expect(saved.default_message).toBe(newContent.defaultMessage);

        // الفورم بعد الريفريش فيه القيم الجديدة
        await expect(widgetPage.mainTitleInput).toHaveValue(newContent.mainTitle);
        await expect(widgetPage.welcomeMessageInput).toHaveValue(newContent.welcomeMessage);
        await expect(widgetPage.defaultMessageInput).toHaveValue(newContent.defaultMessage);
    });
});
