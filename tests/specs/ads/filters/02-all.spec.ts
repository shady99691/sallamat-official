import { test, expect } from '../../../fixtures/adsList.fixture';

// ============================================================
//  الإعلانات – تاب "الكل"
// ============================================================
// التستات ورا بعض في worker واحد (براوزر واحد + login واحد) بدل 3 براوزرات بالتوازي
test.describe.configure({ mode: 'default' });

test.describe('Ads – Tab "الكل"', () => {

    test('"الكل" shows active and inactive ads together', async ({ adsList }) => {
        await adsList.selectTab('الكل');
        await expect.poll(() => adsList.getCardsCount()).toBeGreaterThan(0);
        const all = await adsList.getCards();

        // العدد = المفعّلة + غير المفعّلة
        await adsList.selectTab('مفعّلة');
        const activeCount = (await adsList.getCards()).length;
        await adsList.selectTab('غير مفعّلة');
        const inactiveCount = (await adsList.getCards()).length;

        expect(all.filter((a) => a.active)).toHaveLength(activeCount);
        expect(all.filter((a) => !a.active)).toHaveLength(inactiveCount);
        expect(all).toHaveLength(activeCount + inactiveCount);
        await adsList.selectTab('الكل');
        await adsList.printCards('Tab الكل');
    });

    test('going back to "الكل" restores the full list', async ({ adsList }) => {
        const before = await adsList.getCards();
        await adsList.selectTab('غير مفعّلة');
        await adsList.selectTab('الكل');
        await expect.poll(() => adsList.getCardsCount()).toBe(before.length);
        expect(await adsList.getCards()).toEqual(before);
    });
});
