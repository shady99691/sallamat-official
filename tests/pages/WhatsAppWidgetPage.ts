import { expect, type Locator, type Page, type Response } from '@playwright/test';
import { BasePage } from './BasePage';
import fs from 'fs';
import path from 'path';

/** إعدادات الودجت زي ما الـ API بيرجّعها (GET /api/whatsapp-widget) */
export interface SavedWidget {
    is_active: boolean;
    whatsapp_phone: string;
    icon_position: 'left' | 'right';
    icon_size: string;
    icon_pending: string;              // إزاحة الايقونه من الأسفل
    background_color_header: string;
    icon_logo: string | null;          // صورة شعار الايقونه (URL)
    text_header: string;               // العنوان الرئيسي
    welcome_message: string;
    default_message: string;
    show_chat: boolean;                // عند التمرير
    open_chat: boolean;                // عند الخمول
    after_open_chat_seconds: number;   // بعد عدد ثواني
}

/** قيم الفورم – بنقراها في الأول عشان نرجّعها في آخر التيست */
export interface WidgetFormValues {
    active: boolean;
    phone: string;
    mainTitle: string;
    welcomeMessage: string;
    defaultMessage: string;
    position: 'left' | 'right';
    iconSize: string;
    bottomOffset: string;
    headerColor: string;
    onScroll: boolean;
    onIdle: boolean;
    idleSeconds: string;
}

export class WhatsAppWidgetPage extends BasePage {
    //============= variables =============
    readonly url = 'https://demo.sallamaat.com/whatsapp-widget';
    readonly apiUrl = /\/api\/whatsapp-widget(\?|$)/;
    readonly successMessage = 'تم حفظ إعدادات ودجت واتساب بنجاح';

    //============= locators ==============
    // إعدادات الودجت
    readonly activeSwitch: Locator;          // تفعيل واتس اب ودجت
    readonly phoneInput: Locator;            // رقم واتس اب
    // محتوى الرسائل
    readonly mainTitleInput: Locator;        // العنوان الرئيسي
    readonly welcomeMessageInput: Locator;   // رسالة الترحيب
    readonly defaultMessageInput: Locator;   // الرساله الافتراضيه
    // تخصيص المظهر
    readonly positionRightButton: Locator;   // موقع الايقونه – يمين (أول زرار في RTL)
    readonly positionLeftButton: Locator;    // موقع الايقونه – شمال (تاني زرار في RTL)
    readonly iconSizeInput: Locator;         // حجم الايقونه (40 – 120)
    readonly bottomOffsetInput: Locator;     // إزاحة الايقونه من الأسفل (0 – 300)
    readonly headerColorInput: Locator;      // لون خلفية الشريط العلوي (#HEX)
    readonly logoFileInput: Locator;         // صورة شعار الايقونه ( اختياري ) – PNG / JPG
    readonly logoPreviewImage: Locator;      // الصورة اللي ظاهرة في مربع الشعار
    readonly removeLogoButton: Locator;      // حذف الملف (X الحمرا)
    // التفاعل مع الودجت
    readonly onScrollSwitch: Locator;        // عند التمرير
    readonly onIdleSwitch: Locator;          // عند الخمول
    readonly idleSecondsInput: Locator;      // بعد عدد ثواني
    readonly saveButton: Locator;            // حفظ
    // المعاينة (الشمال)
    readonly previewTitle: Locator;
    readonly previewWelcome: Locator;
    readonly previewDefault: Locator;
    readonly previewToggleButton: Locator;   // أيقونة الواتساب في المعاينة

    //============= constructor ===========
    constructor(page: Page) {
        super(page);
        const switchFor = (title: string) =>
            page.locator(`//p[normalize-space()='${title}']/parent::div/following-sibling::button[@role='switch']`);

        this.activeSwitch = switchFor('تفعيل واتس اب ودجت');
        this.phoneInput = page.locator("//input[@id='phoneNumber-input']");
        this.mainTitleInput = page.locator("//input[@id='mainTitle-input']");
        this.welcomeMessageInput = page.locator("//textarea[@id='welcomeMessage-textarea']");
        this.defaultMessageInput = page.locator("//input[@id='defaultMessage-input']");

        const positionButtons = page.locator("//p[normalize-space()='موقع الايقونه']/following-sibling::div[1]/button");
        this.positionRightButton = positionButtons.nth(0);
        this.positionLeftButton = positionButtons.nth(1);
        this.iconSizeInput = page.locator("//input[@id='iconSize-input']");
        this.bottomOffsetInput = page.locator("//input[@id='bottomOffset-input']");
        this.headerColorInput = page.locator("//p[normalize-space()='لون خلفية الشريط العلوي']/following-sibling::div[1]//input");
        this.logoFileInput = page.locator("//input[@id='logoUrl-file']");
        // الصورة نفسها بس – مش أيقونات مربع الرفع الفاضي (uploadIcon / imageGallery)
        this.logoPreviewImage = page.locator("//label[@for='logoUrl-file']//img[contains(@alt,'شعار')]");
        this.removeLogoButton = page.locator("//label[@for='logoUrl-file']//button[@aria-label='حذف الملف']");

        this.onScrollSwitch = switchFor('عند التمرير');
        this.onIdleSwitch = switchFor('عند الخمول');
        this.idleSecondsInput = page.locator("//input[@id='idleDelaySeconds-input']");
        this.saveButton = page.locator("//form//button[@type='submit']");

        // صندوق الودجت في المعاينة (أقرب div[dir=rtl] لزرار الإغلاق – مش الـ root بتاع الصفحة)
        const preview = page.locator("//button[@aria-label='Close widget']/ancestor::div[@dir='rtl'][1]");
        this.previewTitle = preview.locator("xpath=./div[1]//span").first();
        this.previewWelcome = preview.locator('xpath=./div[2]/div').first();
        this.previewDefault = preview.locator("xpath=.//button[@aria-label='Send default message']/preceding-sibling::div").first();
        this.previewToggleButton = page.locator("//button[@aria-label='Toggle WhatsApp Widget']");
    }

    //============= actions ===============
    async goto() {
        await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
        await expect(this.phoneInput).toBeVisible({ timeout: 15000 });
        // الفورم بيتملى من الـ API بعد ما الصفحة تفتح
        await expect(this.mainTitleInput).not.toHaveValue('', { timeout: 15000 });
    }

    async isSwitchOn(sw: Locator) {
        return (await sw.getAttribute('aria-checked')) === 'true';
    }

    /** يقلب السويتش لو مش على الحالة المطلوبة */
    async setSwitch(sw: Locator, on: boolean) {
        await expect(sw).toBeVisible({ timeout: 15000 });
        if ((await this.isSwitchOn(sw)) !== on) await sw.click();
        await expect(sw).toHaveAttribute('aria-checked', String(on));
    }

    async setPosition(position: 'left' | 'right') {
        await (position === 'left' ? this.positionLeftButton : this.positionRightButton).click();
    }

    async getPosition(): Promise<'left' | 'right'> {
        // الزرار المختار عليه border أخضر
        const leftSelected = /border-\[#3DAE49\]/i.test((await this.positionLeftButton.getAttribute('class')) ?? '');
        return leftSelected ? 'left' : 'right';
    }

    async setHeaderColor(hex: string) {
        await this.headerColorInput.fill(hex);
        await this.headerColorInput.press('Tab');
    }

    /**
     * رفع صورة شعار الأيقونة (PNG / JPG).
     * لو فيه شعار قديم ➜ بنمسحه الأول بالـ X عشان مربع الرفع يرجع.
     */
    async uploadLogo(filePath: string) {
        const absolutePath = path.resolve(filePath);
        if (await this.removeLogoButton.isVisible()) {
            await this.removeLogoButton.click();
            await expect(this.logoPreviewImage).toBeHidden({ timeout: 10000 });
        }
        await this.logoFileInput.setInputFiles(absolutePath);
        this.rememberUpload(absolutePath);   // عشان اسم الملف يظهر في الـ Payload في التيرمنال
        await expect(this.logoPreviewImage).toBeVisible({ timeout: 15000 });
        console.log(`🖼️  Uploaded logo: ${absolutePath}`);
    }

    /** نسخة من الشعار الحالي على الجهاز – عشان نقدر نرفعه تاني في الآخر ونرجّع الأصلي */
    async downloadLogo(url: string, destDir: string): Promise<string> {
        const response = await this.page.request.get(url);
        expect(response.ok(), `تحميل الشعار الأصلي فشل: ${url}`).toBe(true);
        const ext = path.extname(new URL(url).pathname) || '.png';
        const dest = path.join(destDir, `original-logo${ext}`);
        fs.mkdirSync(destDir, { recursive: true });
        fs.writeFileSync(dest, await response.body());
        return dest;
    }

    /** قراية كل قيم الفورم الحالية */
    async readForm(): Promise<WidgetFormValues> {
        return {
            active: await this.isSwitchOn(this.activeSwitch),
            phone: await this.phoneInput.inputValue(),
            mainTitle: await this.mainTitleInput.inputValue(),
            welcomeMessage: await this.welcomeMessageInput.inputValue(),
            defaultMessage: await this.defaultMessageInput.inputValue(),
            position: await this.getPosition(),
            iconSize: await this.iconSizeInput.inputValue(),
            bottomOffset: await this.bottomOffsetInput.inputValue(),
            headerColor: await this.headerColorInput.inputValue(),
            onScroll: await this.isSwitchOn(this.onScrollSwitch),
            onIdle: await this.isSwitchOn(this.onIdleSwitch),
            idleSeconds: await this.idleSecondsInput.isVisible() ? await this.idleSecondsInput.inputValue() : '',
        };
    }

    /** ملء الفورم بقيم (اللي مش مبعوت بيفضل زي ما هو) */
    async fillForm(values: Partial<WidgetFormValues>) {
        if (values.active !== undefined) await this.setSwitch(this.activeSwitch, values.active);
        if (values.phone !== undefined) await this.phoneInput.fill(values.phone);
        if (values.mainTitle !== undefined) await this.mainTitleInput.fill(values.mainTitle);
        if (values.welcomeMessage !== undefined) await this.welcomeMessageInput.fill(values.welcomeMessage);
        if (values.defaultMessage !== undefined) await this.defaultMessageInput.fill(values.defaultMessage);
        if (values.position !== undefined) await this.setPosition(values.position);
        if (values.iconSize !== undefined) await this.iconSizeInput.fill(values.iconSize);
        if (values.bottomOffset !== undefined) await this.bottomOffsetInput.fill(values.bottomOffset);
        if (values.headerColor !== undefined) await this.setHeaderColor(values.headerColor);
        if (values.onScroll !== undefined) await this.setSwitch(this.onScrollSwitch, values.onScroll);
        if (values.onIdle !== undefined) await this.setSwitch(this.onIdleSwitch, values.onIdle);
        if (values.idleSeconds && await this.idleSecondsInput.isVisible()) await this.idleSecondsInput.fill(values.idleSeconds);
    }

    /** حفظ ➜ بيرجّع الـ Response بتاع POST /api/whatsapp-widget */
    async save(): Promise<Response> {
        await expect(this.saveButton).toBeEnabled({ timeout: 15000 });
        const [response] = await Promise.all([
            this.page.waitForResponse((r) => this.apiUrl.test(r.url()) && r.request().method() === 'POST', { timeout: 20000 }),
            this.saveButton.click(),
        ]);
        return response;
    }

    /** حفظ + التأكد من النجاح (status + رسالة "تم حفظ إعدادات ودجت واتساب بنجاح") */
    async saveAndExpectSuccess() {
        const response = await this.save();
        expect(response.status(), 'حفظ الودجت فشل').toBeLessThan(400);
        await expect(this.page.getByText(this.successMessage).first()).toBeVisible({ timeout: 10000 });
        return response;
    }

    /** ريفريش للصفحة ➜ بيرجّع الإعدادات المحفوظة فعلًا من الـ API */
    async reloadAndGetSaved(): Promise<SavedWidget> {
        // الصفحة ساعات بتطلب الإعدادات مرتين وقت الريفريش – الأولانية بتتلغي وجسمها مش بيتقري
        // ➜ بناخد أول response نقدر نقرا الـ body بتاعه
        let saved: SavedWidget | undefined;
        const onResponse = async (r: Response) => {
            if (saved || !this.apiUrl.test(r.url()) || r.request().method() !== 'GET') return;
            try {
                const json = await r.json();
                saved = (Array.isArray(json.data) ? json.data[0] : json.data) as SavedWidget;
            } catch { /* response اتلغى – نستنى اللي بعده */ }
        };
        this.page.on('response', onResponse);
        try {
            await this.page.reload({ waitUntil: 'domcontentloaded' });
            await expect.poll(() => saved !== undefined, { timeout: 20000, message: 'GET /api/whatsapp-widget ماجاش' }).toBe(true);
        } finally {
            this.page.off('response', onResponse);
        }
        await expect(this.mainTitleInput).not.toHaveValue('', { timeout: 15000 });
        return saved!;
    }

    /** رجوع القيم الأصلية + حفظ (بيتنادى في آخر التستات اللي بتغيّر الإعدادات) */
    async restore(original: WidgetFormValues) {
        await this.goto();
        await this.fillForm(original);
        await this.saveAndExpectSuccess();
        console.log('↩️  إعدادات الودجت رجعت للقيم الأصلية');
    }

    //============= assertions ============
    /** خطأ validation على الحقل + رسالة الخطأ */
    async expectFieldError(input: Locator, message?: string | RegExp) {
        await expect(input).toHaveAttribute('aria-invalid', 'true', { timeout: 10000 });
        if (message) {
            const field = input.locator("xpath=ancestor::*[@data-slot='field'][1]");
            await expect(field).toContainText(message);
        }
    }
}
