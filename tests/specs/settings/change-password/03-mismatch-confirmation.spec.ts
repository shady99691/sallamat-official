import { test } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import { SettingsPage } from '../../../pages/SettingsPage';
import testData from '../../../testdata/testdata.json';

// ============================================================
//  تغيير كلمة السر – التأكيد مش مطابق للجديدة
//  Flow: تسجيل دخول ➜ الإعدادات ➜ تغيير كلمة السر ➜
//        الحالية + جديدة + تأكيد مختلف ➜ تأكيد
//  المتوقع: خطأ على حقل التأكيد والبوب أب يفضل مفتوح (مفيش request بيتبعت)
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

    test('Mismatched confirmation shows validation error', async () => {
        await settingsPage.openChangePasswordDialog();
        await settingsPage.fillChangePasswordForm(testData.validUser.password, newPassword, newPassword + 'x');
        await settingsPage.clickConfirm();

        await settingsPage.expectFieldInvalid(settingsPage.confirmPasswordInput);
        await settingsPage.expectDialogStillOpen();
    });
});
