import { test, expect } from '../../../fixtures/adsList.fixture';

// ============================================================
//  الإعلانات – مربع البحث (ابحث عن إعلان......)
// ============================================================
// التستات ورا بعض في worker واحد (براوزر واحد + login واحد) بدل 3 براوزرات بالتوازي
test.describe.configure({ mode: 'default' });

test.describe('Ads – Search', () => {

    test('search by an existing ad title shows only matching ads', async ({ adsList }) => {
        const [first] = await adsList.getCards();
        expect(first?.title, 'No ads to search for').toBeTruthy();
        const keyword = first.title.replace(/[^\p{L}\p{N}\s]/gu, '').trim().slice(0, 10).trim();

        await adsList.search(keyword);
        await expect(adsList.searchInput).toHaveValue(keyword);
        await expect.poll(() => adsList.getCardsCount()).toBeGreaterThan(0);
        for (const ad of await adsList.getCards()) {
            expect(ad.title, `Ad "${ad.title}" does not match "${keyword}"`).toContain(keyword);
        }
        await adsList.printCards(`Search "${keyword}"`);
    });

    test('search by a title that does not exist shows no ads', async ({ adsList }) => {
        await adsList.search(`no_such_ad_${Date.now()}`);
        await expect.poll(() => adsList.getCardsCount()).toBe(0);
    });
});
