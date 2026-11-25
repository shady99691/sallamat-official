import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import { SettingsPage } from '../../../pages/SettingsPage';
import testData from '../../../testdata/testdata.json';

// ============================================================
//  تغيير كلمة السر – الباسوورد الحالي غلط
//  Flow: تسجيل دخول ➜ الإعدادات ➜ تغيير كلمة السر ➜
//        حالية غلط + جديدة + تأكيد ➜ تأكيد
//  المتوقع: السيرفر يرفض (422 "كلمة المرور القديمة غير صحيحة.") والبوب أب يفضل مفتوح
// ============================================================
test.describe('Change password', () => {

    const newPassword = 'Qa@Temp123456';

    let loginPage: LoginPage;
    let settingsPage: SettingsPage;

    test.beforeEach(async ({ page }) => {
        // بدون timeout على الجهاز عشان البراوزر يفضل مفتوح بعد الرن – في الـ CI: 3 دقايق
        test.setTimeout(process.env.CI ? 180_000 : 0);

        loginPage = new LoginPage(page);
        settingsPage = new SettingsPage(page);

        // طباعة الـ APIs في التيرمنال – الداتا اللي التيست عملها بس
        settingsPage.enableApiLogging();

        await loginPage.goto();
        await loginPage.login(testData.validUser.email, testData.validUser.password);
        await loginPage.expectLoggedIn();

        await settingsPage.goto();
    });

    // البراوزر يفضل مفتوح بعد الرن (نجح أو فشل) لحد ما تضغط Resume في الـ Inspector
    test.afterEach(async ({ page }) => {
        if (!process.env.CI && process.env.NO_PAUSE !== '1') await page.pause();
    });

    test('Wrong current password is rejected', async () => {
        const response = await settingsPage.changePassword('Wrong@Pass999', newPassword);
        expect(response.status(), 'السيرفر قبل باسوورد حالي غلط!').toBeGreaterThanOrEqual(400);
        await settingsPage.expectDialogStillOpen();
    });
});
