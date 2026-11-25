import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class SettingsPage extends BasePage {
    //============= variables =============
    readonly url = 'https://demo.sallamaat.com/settings';

    //============= locators ==============
    readonly settingsTab: Locator;                  // الإعدادات (التاب اللي فوق)
    readonly changePasswordButton: Locator;         // تغيير كلمة السر
    readonly changePasswordDialog: Locator;         // بوب أب "تغيير كلمة السر"
    readonly oldPasswordInput: Locator;             // كلمة المرور الحالية
    readonly newPasswordInput: Locator;             // كلمة المرور الجديدة
    readonly confirmPasswordInput: Locator;         // تأكيد كلمة المرور
    readonly confirmButton: Locator;                // تأكيد
    readonly cancelButton: Locator;                 // إلغاء

    //============= constructor ===========
    constructor(page: Page) {
        super(page);
        this.settingsTab = page.locator("//a[contains(.,'الإعدادات')]").first();
        this.changePasswordButton = page.getByRole('button', { name: 'تغيير كلمة السر' });
        this.changePasswordDialog = page.getByRole('dialog', { name: 'تغيير كلمة السر' });
        this.oldPasswordInput = this.changePasswordDialog.locator("//input[@id='old_password-password']");
        this.newPasswordInput = this.changePasswordDialog.locator("//input[@id='password-password']");
        this.confirmPasswordInput = this.changePasswordDialog.locator("//input[@id='password_confirmation-password']");
        this.confirmButton = this.changePasswordDialog.getByRole('button', { name: 'تأكيد', exact: true });
        this.cancelButton = this.changePasswordDialog.getByRole('button', { name: 'إلغاء', exact: true });
    }

    //============= actions ===============
    async goto() {
        await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
        await expect(this.changePasswordButton).toBeVisible({ timeout: 15000 });
    }

    /** فتح بوب أب تغيير كلمة السر */
    async openChangePasswordDialog() {
        await expect(this.changePasswordButton).toBeVisible({ timeout: 15000 });
        await this.changePasswordButton.click();
        await expect(this.changePasswordDialog).toBeVisible({ timeout: 15000 });
    }

    /** ملء الحقول التلاتة (اللي بيتبعت undefined بيتساب فاضي) */
    async fillChangePasswordForm(oldPassword?: string, newPassword?: string, confirmPassword?: string) {
        if (oldPassword !== undefined) await this.oldPasswordInput.fill(oldPassword);
        if (newPassword !== undefined) await this.newPasswordInput.fill(newPassword);
        if (confirmPassword !== undefined) await this.confirmPasswordInput.fill(confirmPassword);
    }

    async clickConfirm() {
        await expect(this.confirmButton).toBeEnabled({ timeout: 15000 });
        await this.confirmButton.click();
    }

    async clickCancel() {
        await this.cancelButton.click();
    }

    /**
     * Flow كامل: تغيير كلمة السر ➜ بوب أب ➜ الحالية + الجديدة + التأكيد ➜ تأكيد
     * بيرجع الـ Response بتاع الـ API عشان التيست يتأكد من الـ status
     */
    async changePassword(oldPassword: string, newPassword: string, confirmPassword = newPassword) {
        await this.openChangePasswordDialog();
        await this.fillChangePasswordForm(oldPassword, newPassword, confirmPassword);
        const [response] = await Promise.all([
            this.page.waitForResponse(
                (r) => /password/i.test(r.url()) && !['GET', 'HEAD', 'OPTIONS'].includes(r.request().method()),
                { timeout: 15000 },
            ),
            this.clickConfirm(),
        ]);
        return response;
    }

    //============= assertions ============
    async expectDialogClosed() {
        await expect(this.changePasswordDialog).toBeHidden({ timeout: 15000 });
    }

    async expectDialogStillOpen() {
        await expect(this.changePasswordDialog).toBeVisible();
    }

    /** الحقل عليه خطأ validation (aria-invalid="true") */
    async expectFieldInvalid(input: Locator) {
        await expect(input).toHaveAttribute('aria-invalid', 'true', { timeout: 10000 });
    }
}
