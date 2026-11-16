import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** تابات الفلترة فوق قائمة الإعلانات */
export type AdsTab = 'الكل' | 'مفعّلة' | 'غير مفعّلة';

/** الشدّة (ّ) ممكن تكون مكتوبة أو لأ ➜ بنقبل الاتنين */
const TAB_PATTERN: Record<AdsTab, RegExp> = {
    'الكل': /^\s*الكل\s*$/,
    'مفعّلة': /^\s*مفعّ?لة\s*$/,
    'غير مفعّلة': /^\s*غير\s+مفعّ?لة\s*$/,
};

/** إعلان زي ما هو ظاهر في الكارت */
export type AdCard = { title: string; date: string; active: boolean };

/**
 * صفحة "اختر الإعلانات" (صندوق الإعلان):
 * مربع البحث + تابات (الكل / مفعّلة / غير مفعّلة) + كروت الإعلانات.
 * كل كارت فيه: العنوان، التاريخ، سويتش "الحالة"، تعديل، حذف.
 */
export class AdsListPage extends BasePage {

    // ============= Locators =============
    readonly adBoxLink: Locator;      // صندوق الإعلان (السيدبار)
    readonly pageTitle: Locator;      // اختر الإعلانات
    readonly searchInput: Locator;    // ابحث عن إعلان......
    readonly cards: Locator;          // كروت الإعلانات (كارت لكل سويتش)

    constructor(page: Page) {
        super(page);
        this.adBoxLink = page.locator("//p[contains(text(),'صندوق الإعلان')]");
        this.pageTitle = page.locator("xpath=//*[normalize-space(text())='اختر الإعلانات']").first();
        this.searchInput = page.locator("input[placeholder^='ابحث عن إعلان']");
        // أقرب div للسويتش فيه زرار "حذف" = الكارت
        this.cards = page.locator(
            "xpath=//button[@role='switch']/ancestor::div[.//button[contains(normalize-space(),'حذف')]][1]"
        );
    }

    tab(name: AdsTab): Locator {
        return this.page.locator('button, [role="tab"]').filter({ hasText: TAB_PATTERN[name] }).first();
    }

    switchOf(card: Locator): Locator {
        return card.locator("button[role='switch']").first();
    }

    // ============= Navigation =============

    /** (بعد اللوجين) يضغط على تاب "صندوق الإعلان" في السيدبار ويستنى الكروت */
    async openFromSidebar() {
        await expect(this.adBoxLink).toBeVisible({ timeout: 45000 });
        // الكليك ممكن يضيع لو حصل قبل ما الصفحة تتهيأ (hydration) ➜ نعيده لحد ما صفحة الإعلانات تظهر
        await expect(async () => {
            await this.adBoxLink.click();
            await expect(this.searchInput).toBeVisible({ timeout: 8000 });
        }).toPass({ timeout: 60000, intervals: [500, 1000, 2000] });
        await expect(this.cards.first()).toBeVisible({ timeout: 45000 });
        await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    // ============= Tabs =============

    async selectTab(name: AdsTab) {
        const tab = this.tab(name);
        await expect(tab).toBeVisible({ timeout: 15000 });
        await tab.click();
        await this.page.waitForLoadState('networkidle').catch(() => {});
        console.log(`🧩 Tab [${name}]`);
    }

    // ============= Search =============

    async search(text: string) {
        await this.searchInput.fill(text);
        await this.page.waitForLoadState('networkidle').catch(() => {});
        console.log(`🔎 Search "${text}"`);
    }

    async clearSearch() {
        await this.searchInput.fill('');
        await expect(this.searchInput).toHaveValue('');
        await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    // ============= Cards =============

    async getCardsCount(): Promise<number> {
        return this.cards.count();
    }

    /** يقرا كل الكروت الظاهرة: العنوان (أول سطر) + التاريخ + حالة السويتش */
    async getCards(): Promise<AdCard[]> {
        // قراءة كل الكروت في call واحد (أسرع ومفيش stale elements لو القائمة اتعملها re-render)
        return this.cards.evaluateAll((els) => els.map((el) => {
            const lines = (el as HTMLElement).innerText.split('\n').map((l) => l.trim()).filter(Boolean);
            const sw = el.querySelector("button[role='switch']");
            const state = sw?.getAttribute('aria-checked') ?? sw?.getAttribute('data-state');
            return {
                title: lines[0] ?? '',
                date: lines.find((l) => /\d{4}-\d{2}-\d{2}/.test(l)) ?? '',
                active: state === 'true' || state === 'checked',
            };
        }));
    }

    /** يطبع الكروت في التيرمنال */
    async printCards(title: string) {
        const cards = await this.getCards();
        console.log(`\n📋 ${title} – ${cards.length} ad(s)`);
        if (cards.length) console.table(cards.map((c) => ({ ...c, active: c.active ? '✅' : '⛔' })));
    }
}
