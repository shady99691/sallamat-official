import { test, expect } from '../../../fixtures/adsList.fixture';

// ============================================================
//  الإعلانات – تاب "مفعّلة" (السويتش ON)
// ============================================================
// التستات ورا بعض في worker واحد (براوزر واحد + login واحد) بدل 3 براوزرات بالتوازي
test.describe.configure({ mode: 'default' });

test.describe('Ads – Tab "مفعّلة"', () => {

    test('"مفعّلة" shows only active ads', async ({ adsList }) => {
        const expected = (await adsList.getCards()).filter((a) => a.active).length;

        await adsList.selectTab('مفعّلة');
        await expect.poll(() => adsList.getCardsCount()).toBe(expected);
        for (const ad of await adsList.getCards()) {
            expect(ad.active, `Ad "${ad.title}" (${ad.date}) is not active`).toBe(true);
        }
        await adsList.printCards('Tab مفعّلة');
    });
});
