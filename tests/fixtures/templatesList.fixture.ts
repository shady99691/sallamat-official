import { test as base, expect } from './campaignsList.fixture';
import type { Page } from '@playwright/test';
import { TemplatesListPage } from '../pages/TemplatesListPage';
import { TemplatePage } from '../pages/TemplatePage';
import { CustomersListPage } from '../pages/CustomersListPage';

/**
 * Fixture لتستات إدارة القوالب (معاينة / تعديل / حذف):
 * - نفس الـ session المشتركة (login مرة واحدة لكل worker)
 * - بيعمل قالب نصي جديد باسم فريد ➜ التيست بيشتغل عليه هو بس (مش بيلمس قوالب حقيقية)
 * - بيفتح صفحة القوالب
 * - بعد التيست: لو القالب لسه موجود بيتحذف أوتوماتيك، وبعدها page.pause إلا لو CI أو NO_PAUSE=1
 *
 * الاستخدام:
 *   test('...', async ({ templatesList, template }) => { ... })
 */
type Fixtures = {
    templatesList: TemplatesListPage;
    template: { name: string; header: string; body: string; footer: string };
};

async function createTextTemplate(page: Page) {
    await page.goto(CustomersListPage.URL, { waitUntil: 'domcontentloaded' });
    const templatePage = new TemplatePage(page);
    const created = await templatePage.createTemplate({
        type: 'none',
        header: 'Manage Header',
        body: 'Manage Body',
        footer: 'Manage Footer',
    });
    await templatePage.submitTemplate();
    await page.waitForURL(/\/templates\/?(\?.*)?$/, { timeout: 60000 }).catch(() => {});
    return created;
}

export const test = base.extend<Fixtures>({

    template: async ({ page }, use, testInfo) => {
        testInfo.setTimeout(0);
        const created = await createTextTemplate(page);
        await use(created);
    },

    templatesList: async ({ page, template }, use, testInfo) => {
        testInfo.setTimeout(0);
        const list = new TemplatesListPage(page);
        await list.openFromSidebar();
        list.enableApiLogging({ urlFilter: /template/i });

        await use(list);

        // تنضيف: لو القالب لسه موجود نحذفه
        try {
            await page.goto(CustomersListPage.URL, { waitUntil: 'domcontentloaded' });
            await list.openFromSidebar();
            await list.search(template.name);
            if (await list.card(template.name).isVisible({ timeout: 5000 }).catch(() => false)) {
                await list.deleteTemplate(template.name);
            }
        } catch { /* التنضيف مش لازم يوقّع التيست */ }

        if (!process.env.CI && process.env.NO_PAUSE !== '1') {
            await page.pause();
        }
    },
});

export { expect };
