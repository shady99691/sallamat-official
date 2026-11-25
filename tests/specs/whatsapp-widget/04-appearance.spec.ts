import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { WhatsAppWidgetPage, type WidgetFormValues } from '../../pages/WhatsAppWidgetPage';
import testData from '../../testdata/testdata.json';

// ============================================================
//  واتساب ودجت – تخصيص المظهر
//  Flow: تسجيل دخول ➜ واتساب ودجت ➜ موقع الايقونه (عكس الحالي) + حجم + إزاحة + لون ➜
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

    test('Update appearance (position, size, offset, color) successfully', async () => {
        const appearance = {
            position: original!.position === 'left' ? 'right' as const : 'left' as const,
            iconSize: original!.iconSize === '80' ? '90' : '80',          // من 40 لـ 120
            bottomOffset: original!.bottomOffset === '40' ? '50' : '40',  // من 0 لـ 300
            headerColor: original!.headerColor.toUpperCase() === '#1E88E5' ? '#E53935' : '#1E88E5',
        };

        await widgetPage.fillForm(appearance);
        await widgetPage.saveAndExpectSuccess();

        const saved = await widgetPage.reloadAndGetSaved();
        expect(saved.icon_position).toBe(appearance.position);
        expect(String(saved.icon_size)).toBe(appearance.iconSize);
        expect(String(saved.icon_pending)).toBe(appearance.bottomOffset);
        expect(saved.background_color_header.toUpperCase()).toBe(appearance.headerColor);

        // الفورم بعد الريفريش فيه القيم الجديدة
        expect(await widgetPage.getPosition()).toBe(appearance.position);
        await expect(widgetPage.iconSizeInput).toHaveValue(appearance.iconSize);
        await expect(widgetPage.bottomOffsetInput).toHaveValue(appearance.bottomOffset);
    });
});
