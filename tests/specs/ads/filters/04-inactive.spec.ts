import { test, expect } from '../../../fixtures/adsList.fixture';

// ============================================================
//  الإعلانات – تاب "غير مفعّلة" (السويتش OFF)
// ============================================================
// التستات ورا بعض في worker واحد (براوزر واحد + login واحد) بدل 3 براوزرات بالتوازي
test.describe.configure({ mode: 'default' });

test.describe('Ads – Tab "غير مفعّلة"', () => {

    test('"غير مفعّلة" shows only inactive ads', async ({ adsList }) => {
        const expected = (await adsList.getCards()).filter((a) => !a.active).length;

        await adsList.selectTab('غير مفعّلة');
        await expect.poll(() => adsList.getCardsCount()).toBe(expected);
        for (const ad of await adsList.getCards()) {
            expect(ad.active, `Ad "${ad.title}" (${ad.date}) is active`).toBe(false);
        }
        await adsList.printCards('Tab غير مفعّلة');
    });
});
