import { test, expect } from '../../../fixtures/templatesList.fixture';

// ============================================================
//  القوالب – حذف القالب (السلة الحمرا جنب كل قالب)
// ============================================================
test.describe('Templates – Delete', () => {

    test('cancel on the delete dialog keeps the template', async ({ templatesList, template }) => {
        await templatesList.findTemplate(template.name);
        await templatesList.clickDelete(template.name);

        await templatesList.deleteDialog.getByRole('button', { name: 'إلغاء' }).click();
        await expect(templatesList.deleteDialog).toBeHidden();
        await expect(templatesList.card(template.name)).toBeVisible();
    });

    test('delete button removes the template from the list', async ({ templatesList, template }) => {
        await templatesList.findTemplate(template.name);
        await templatesList.deleteTemplate(template.name);

        // بعد الحذف القالب يختفي من نتيجة البحث
        await templatesList.search(template.name);
        await expect(templatesList.card(template.name)).toHaveCount(0, { timeout: 30000 });
    });
});
