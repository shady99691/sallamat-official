import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import { SettingsPage } from '../../../pages/SettingsPage';
import testData from '../../../testdata/testdata.json';

// ============================================================
//  تغيير كلمة السر – تغيير ناجح
//  Flow: تسجيل دخول ➜ الإعدادات ➜ تغيير كلمة السر ➜
//        الحالية (من testdata.json) + الجديدة + التأكيد ➜ تأكيد ➜ نجاح
//
//  ⚠️ بيغيّر باسوورد الأكونت فعلًا ➜ وفي الآخر بيرجّعه للقديم عشان باقي التستات تفضل شغالة
// ============================================================
test.describe('Change password', () => {

    const originalPassword = testData.validUser.password;
    // باسوورد جديد كل رن (حروف كبيرة + صغيرة + رقم + رمز)
    const newPassword = `Qa@Temp${Date.now().toString().slice(-6)}`;

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
        await loginPage.login(testData.validUser.email, originalPassword);
        await loginPage.expectLoggedIn();

        await settingsPage.goto();
    });

    // البراوزر يفضل مفتوح بعد الرن (نجح أو فشل) لحد ما تضغط Resume في الـ Inspector
    test.afterEach(async ({ page }) => {
        if (!process.env.CI && process.env.NO_PAUSE !== '1') await page.pause();
    });

    test('Change password successfully', async () => {
        const step = (n: number, title: string) => console.log(`\n══════════ الخطوة ${n}/3: ${title} ══════════`);

        // 1) تغيير الباسوورد: القديم ➜ الجديد (الـ request بيتطبع بالـ Payload والـ Response)
        step(1, 'تغيير الباسوورد (القديم ➜ الجديد)');
        const response = await settingsPage.changePassword(originalPassword, newPassword);
        expect(response.status(), 'تغيير كلمة السر فشل').toBeLessThan(400);
        await settingsPage.expectDialogClosed();
        console.log(`✅ الباسوورد اتغيّر بنجاح (${response.status()})`);

        // 2) الموقع بيقفل الـ session بعد التغيير ➜ لوجين بالباسوورد الجديد
        //    (الـ 401 "غير مصرح" هنا متوقعة ➜ مش بنطبعها)
        step(2, 'لوجين بالباسوورد الجديد');
        settingsPage.muteApiLogging();
        await loginPage.goto();
        const sessionClosed = await loginPage.emailInput
            .waitFor({ state: 'visible', timeout: 8000 })
            .then(() => true, () => false);
        if (sessionClosed) {
            await loginPage.login(testData.validUser.email, newPassword);
            await loginPage.expectLoggedIn();
            console.log('✅ الـ session اتقفلت بعد التغيير (متوقع) ➜ اللوجين بالباسوورد الجديد نجح');
        } else {
            console.log('ℹ️  الـ session لسه شغالة بعد التغيير');
        }
        await settingsPage.goto();
        settingsPage.unmuteApiLogging();

        // 3) رجوع الباسوورد القديم عشان باقي التستات تفضل شغالة
        step(3, 'رجوع الباسوورد القديم (الجديد ➜ القديم)');
        const revert = await settingsPage.changePassword(newPassword, originalPassword);
        expect(revert.status(), '⚠️ رجوع الباسوورد القديم فشل – الباسوورد الحالي: ' + newPassword).toBeLessThan(400);
        await settingsPage.expectDialogClosed();
        console.log(`🔐 الباسوورد رجع للقديم (${revert.status()})\n`);
    });
});
