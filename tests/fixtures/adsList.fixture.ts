import { test as base, expect } from './campaignsList.fixture';
import { AdsListPage } from '../pages/AdsListPage';
import { CustomersListPage } from '../pages/CustomersListPage';

/**
 * Fixture لتستات فلاتر الإعلانات:
 * - نفس الـ session بتاع فلاتر الحملات (login مرة واحدة لكل worker عن طريق storageState)
 *   قبل كده كل تيست كان بيعمل login لوحده وبالتوازي بنفس اليوزر ➜ الموقع بيرفض ويقفل الصفحات
 * - فتح أي صفحة داخلية ➜ الضغط على تاب "صندوق الإعلان" في السيدبار ➜ تنفيذ التست
 * - طباعة API الإعلانات في التيرمنال – نتيجة أكشن التيست بس، مش تحميل الصفحة
 * - بعد التيست: البراوزر يفضل مفتوح (page.pause) إلا لو CI أو NO_PAUSE=1
 *
 * الاستخدام:
 *   test('...', async ({ adsList }) => { ... })
 */
export const test = base.extend<{ adsList: AdsListPage }>({

    adsList: async ({ page }, use, testInfo) => {
        // فتح الصفحة بياخد أكتر من الـ 30 ثانية الافتراضية ➜ من غير timeout
        testInfo.setTimeout(process.env.CI ? 180_000 : 0);

        // 1) صفحة داخلية (اليوزر داخل بالفعل من الـ storageState)
        await page.goto(CustomersListPage.URL, { waitUntil: 'domcontentloaded' });

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
