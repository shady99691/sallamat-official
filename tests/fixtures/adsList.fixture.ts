import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { AdsListPage } from '../pages/AdsListPage';
import testData from '../testdata/testdata.json';

/**
 * Fixture لتستات فلاتر الإعلانات:
 * - تسجيل دخول ➜ الضغط على تاب "صندوق الإعلان" في السيدبار ➜ تنفيذ التست
 * - طباعة API الإعلانات في التيرمنال – نتيجة أكشن التيست بس، مش تحميل الصفحة
 * - بعد التيست: البراوزر يفضل مفتوح (page.pause) إلا لو CI أو NO_PAUSE=1
 *
 * الاستخدام:
 *   test('...', async ({ adsList }) => { ... })
 */
export const test = base.extend<{ adsList: AdsListPage }>({

    adsList: async ({ page }, use, testInfo) => {
        // اللوجين + فتح الصفحة بياخدوا أكتر من الـ 30 ثانية الافتراضية ➜ من غير timeout
        testInfo.setTimeout(0);

        // 1) تسجيل دخول
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(testData.validUser.email, testData.validUser.password);
        await loginPage.expectLoggedIn();

        // 2) الضغط على تاب الإعلانات
        const listPage = new AdsListPage(page);
        await listPage.openFromSidebar();
        listPage.enableApiLogging({ urlFilter: /advert|announce|\/ads?(\/|\?|$)/i, newOnly: false });

        // 3) تنفيذ التست
        await use(listPage);

        if (!process.env.CI && process.env.NO_PAUSE !== '1') {
            await page.pause();
        }
    },
});

export { expect };
