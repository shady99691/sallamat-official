import { test, expect } from '../../../fixtures/campaignsList.fixture';
import { campaignsFrom } from '../../../pages/CampaignsListPage';
import { AUTO_COLUMN, AUTO_EVENTS, AUTO_ORDER_STATUSES, type AutoCampaign } from '../../../pages/AutoCampaignsListPage';

// التستات ورا بعض في worker واحد (براوزر واحد + login واحد) بدل براوزر لكل تيست بالتوازي
test.describe.configure({ mode: 'default' });

// ============================================================
//  الحملات التلقائية – فلتر "الحدث"
//  تيست لكل حدث: كل الصفوف لازم الحدث بتاعها = الحدث المختار
// ============================================================
test.describe('Auto Campaigns – Event filter', () => {

    test('event filter lists all expected options', async ({ autoList }) => {
        expect(await autoList.getFilterOptions('الحدث')).toEqual([...AUTO_EVENTS, ...AUTO_ORDER_STATUSES]);
    });

    for (const event of AUTO_EVENTS) {
        test(`event = ${event}`, async ({ autoList }) => {
            const res = await autoList.selectFilter('الحدث', event);
            expect(res.status()).toBe(200);
            await expect(autoList.filterTrigger('الحدث')).toContainText(event);

            // الـ API
            for (const c of await campaignsFrom<AutoCampaign>(res)) {
                expect(c.event_name, `"${c.name}" has event "${c.event_name}"`).toBe(event);
            }

            // الجدول
            await autoList.printTable(`Event = ${event}`);
            const hasRows = await autoList.expectAllRows(AUTO_COLUMN.event, event);
            if (!hasRows) test.info().annotations.push({ type: 'note', description: `No campaigns with event "${event}"` });
        });
    }
});
