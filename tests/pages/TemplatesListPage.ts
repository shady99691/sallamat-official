import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * صفحة "القوالب" (قائمة القوالب):
 * مربع البحث + كارت لكل قالب فيه: الاسم، معاينة القالب، تعديل القالب، وسلة حذف حمرا.
 * - "معاينة القالب" ➜ نافذة "تفاصيل القالب" (قراءة فقط)
 * - "تعديل القالب" ➜ صفحة /templates/edit-template/<id> فيها "إرسال للمراجعة"
 * - السلة الحمرا ➜ نافذة تأكيد "حذف القالب" ➜ "تأكيد الحذف"
 */
export class TemplatesListPage extends BasePage {

    // ============= Locators =============
    readonly templatesLink: Locator;        // القوالب (السيدبار)
    readonly searchInput: Locator;          // البحث باسم القالب...
    readonly previewDialog: Locator;        // تفاصيل القالب
    readonly deleteDialog: Locator;         // حذف القالب
    readonly confirmDeleteButton: Locator;  // تأكيد الحذف

    // حقول صفحة التعديل (نفس ids صفحة الإنشاء)
    readonly headerInput: Locator;
    readonly bodyTextarea: Locator;
    readonly footerInput: Locator;
    readonly submitButton: Locator;

    constructor(page: Page) {
        super(page);
        this.templatesLink = page.getByRole('tab', { name: 'القوالب' });
        this.searchInput = page.locator("input[placeholder^='البحث باسم القالب']");
        this.previewDialog = page.getByRole('dialog', { name: 'تفاصيل القالب' });
        this.deleteDialog = page.getByRole('dialog', { name: 'حذف القالب' });
        this.confirmDeleteButton = this.deleteDialog.getByRole('button', { name: 'تأكيد الحذف' });

        this.headerInput = page.locator('#header_text-input');
        this.bodyTextarea = page.locator('#content-textarea');
        this.footerInput = page.locator('#footer_text-input');
        this.submitButton = page.getByRole('button', { name: 'إرسال للمراجعة' });
    }

    /** كارت القالب باسمه (أقرب div حوالين الاسم فيه زرار "معاينة القالب") */
    card(name: string): Locator {
        return this.page.locator(
            `xpath=//h3[normalize-space(text())='${name}']/ancestor::div[.//button[contains(normalize-space(),'معاينة القالب')]][1]`
        );
    }

    previewButton(name: string): Locator {
        return this.card(name).getByRole('button', { name: 'معاينة القالب' });
    }

    editLink(name: string): Locator {
        return this.card(name).getByRole('link', { name: 'تعديل القالب' });
    }

    /** السلة الحمرا: الزرار الوحيد اللي من غير نص (غير السويتش) في الكارت */
    deleteButton(name: string): Locator {
        return this.card(name).locator("xpath=.//button[not(@role='switch')][not(normalize-space())]");
    }

    // ============= Navigation =============

    /** يضغط "القوالب" في السيدبار ويستنى مربع البحث */
    async openFromSidebar() {
        await expect(this.templatesLink).toBeVisible({ timeout: 45000 });
        await expect(async () => {
            await this.templatesLink.click();
            await expect(this.searchInput).toBeVisible({ timeout: 8000 });
        }).toPass({ timeout: 60000, intervals: [500, 1000, 2000] });
        await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    // ============= Search =============

    async search(text: string) {
        await this.searchInput.fill(text);
        await this.page.waitForLoadState('networkidle').catch(() => {});
        console.log(`🔎 Search "${text}"`);
    }

    /** يدوّر على القالب باسمه (يعيد البحث لو لسه ما ظهرش) ويستنى الكارت */
    async findTemplate(name: string) {
        await expect(async () => {
            await this.search(name);
            await expect(this.card(name)).toBeVisible({ timeout: 5000 });
        }).toPass({ timeout: 60000, intervals: [1000, 2000, 4000] });
    }

    // ============= Preview =============

    /** معاينة القالب ➜ نافذة التفاصيل (قراءة فقط) */
    async openPreview(name: string) {
        await this.previewButton(name).click();
        await expect(this.previewDialog).toBeVisible({ timeout: 15000 });
        console.log(`👁️ Preview [${name}]`);
    }

    async closePreview() {
        await this.page.keyboard.press('Escape');
        await expect(this.previewDialog).toBeHidden({ timeout: 10000 });
    }

    // ============= Edit =============

    /** تعديل القالب ➜ صفحة التعديل */
    async openEdit(name: string) {
        await this.editLink(name).click();
        await this.page.waitForURL(/\/templates\/edit-template\/\d+/, { timeout: 30000 });
        await expect(this.bodyTextarea).toBeVisible({ timeout: 30000 });
        console.log(`✏️ Edit [${name}]`);
    }

    /** يعدّل الهيدر / المحتوى / الفوتر (اللي اتبعت بس) */
    async editFields(fields: { header?: string; body?: string; footer?: string }) {
        if (fields.header !== undefined) await this.headerInput.fill(fields.header);
        if (fields.body !== undefined) await this.bodyTextarea.fill(fields.body);
        if (fields.footer !== undefined) await this.footerInput.fill(fields.footer);
    }

    /** إرسال للمراجعة */
    async submitForReview() {
        await expect(this.submitButton).toBeEnabled({ timeout: 10000 });
        await this.submitButton.click();
    }

    // ============= Delete =============

    /** السلة الحمرا ➜ نافذة التأكيد (من غير ما يأكّد) */
    async clickDelete(name: string) {
        await this.deleteButton(name).click();
        await expect(this.deleteDialog).toBeVisible({ timeout: 10000 });
    }

    /** السلة ➜ تأكيد الحذف */
    async deleteTemplate(name: string) {
        await this.clickDelete(name);
        await this.confirmDeleteButton.click();
        await expect(this.deleteDialog).toBeHidden({ timeout: 30000 });
        console.log(`🗑️ Deleted [${name}]`);
    }
}
