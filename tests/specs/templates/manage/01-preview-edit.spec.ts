import { test, expect } from '../../../fixtures/templatesList.fixture';

// ============================================================
//  القوالب – معاينة القالب ➜ تعديل القالب ➜ إرسال للمراجعة
//  (كل تيست بيشتغل على قالب جديد بيعمله بنفسه)
// ============================================================
test.describe('Templates – Preview & Edit', () => {

    test('preview shows the template details and can be closed', async ({ templatesList, template }) => {
        await templatesList.findTemplate(template.name);
        await templatesList.openPreview(template.name);

        await expect(templatesList.previewDialog).toContainText(template.name);
        await expect(templatesList.previewDialog).toContainText(template.body);

        await templatesList.closePreview();
    });

    test('edit template data then send for review', async ({ page, templatesList, template }) => {
        const edited = { header: 'Edited Header', body: 'Edited Body', footer: 'Edited Footer' };

        await templatesList.findTemplate(template.name);
        await templatesList.openEdit(template.name);

        // الحقول الحالية بتظهر بالداتا القديمة
        await expect(templatesList.bodyTextarea).toHaveValue(template.body);

        await templatesList.editFields(edited);
        await expect(templatesList.bodyTextarea).toHaveValue(edited.body);

        // إرسال للمراجعة ➜ لازم يتبعت الـ request بنجاح
        const saved = page.waitForResponse(
            (r) => /template/i.test(r.url()) && ['PUT', 'PATCH', 'POST'].includes(r.request().method()),
            { timeout: 60000 },
        );
        await templatesList.submitForReview();
        expect((await saved).status()).toBeLessThan(400);

        // نرجع للقائمة ونتأكد إن المحتوى الجديد ظهر في المعاينة
        await templatesList.openFromSidebar();
        await templatesList.findTemplate(template.name);
        await templatesList.openPreview(template.name);
        await expect(templatesList.previewDialog).toContainText(edited.body);
    });
});
