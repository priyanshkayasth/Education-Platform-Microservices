// tests/e2e/admin.spec.ts
import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_PASS  = process.env.ADMIN_PASS!;
// ─── Helper ─────────────────────────────────────────────────────────────────

async function login(page: Page) {
    await page.goto('/login');
    await page.waitForSelector('input[name="email"]', { state: 'visible' });
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASS);

    const loginRes = page.waitForResponse(
        (res: any) => res.url().includes('/api/auth/login'),
        { timeout: 20000 }
    );
    await page.click('button[type="submit"]');
    await loginRes;
    await page.waitForURL(/\/admin/, { timeout: 20000 });
}

// ─── Suite ──────────────────────────────────────────────────────────────────

test.describe("Admin — Dashboard & User Management", () => {

    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    // ── Dashboard ────────────────────────────────────────────────────────────

    test.describe("Dashboard", () => {
        test("shows Admin Dashboard heading", async ({ page }) => {
            // Exact text from AdminHome.tsx h1
            await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
        });

        test("shows all 4 stat cards", async ({ page }) => {
            await expect(page.locator('.stat-title', { hasText: 'Total Users' })).toBeVisible();
            await expect(page.locator('.stat-title', { hasText: 'Students' })).toBeVisible();
            await expect(page.locator('.stat-title', { hasText: 'Instructors' })).toBeVisible();
            await expect(page.locator('.stat-title', { hasText: 'Courses' })).toBeVisible(); // ← scoped to stat card only
        });

        // Fix 2: stat cards — wait for them to load first
        test("stat cards show numeric values", async ({ page }) => {
            await page.waitForSelector('.stat-value', { state: 'visible', timeout: 10000 });
            const statValues = page.locator('.stat-value');
            const count = await statValues.count();
            expect(count).toBe(4);

            for (let i = 0; i < count; i++) {
                const text = await statValues.nth(i).textContent();
                expect(Number(text)).not.toBeNaN();
            }
        });



        test("shows Recent Users section", async ({ page }) => {
            // Exact text from AdminHome.tsx card-title
            await expect(page.getByRole('heading', { name: 'Recent Users' })).toBeVisible();
        });

        test("shows Recent Courses section", async ({ page }) => {
            // Exact text from AdminHome.tsx card-title
            await expect(page.getByRole('heading', { name: 'Recent Courses' })).toBeVisible();
        });
    });

    // ── Users Page ───────────────────────────────────────────────────────────

    test.describe("Users Management", () => {
        test.beforeEach(async ({ page }) => {
            // Navigate to users page
            await page.goto('/admin/users');
            await page.waitForSelector('table', { state: 'visible', timeout: 10000 });
        });


        // Exact headers from UsersPage.tsx thead
        test("shows Users table with correct headers", async ({ page }) => {
            await expect(page.getByRole('columnheader', { name: 'Name', exact: true })).toBeVisible();
            await expect(page.getByRole('columnheader', { name: 'Email', exact: true })).toBeVisible();
            await expect(page.getByRole('columnheader', { name: 'Role', exact: true })).toBeVisible();
            await expect(page.getByRole('columnheader', { name: 'Change Role', exact: true })).toBeVisible();
        });


        test("shows user rows with name, email and role badge", async ({ page }) => {
            const rows = page.locator('tbody tr');
            const count = await rows.count();

            if (count === 0 || await page.getByText('No users found').isVisible()) {
                test.skip();
                return;
            }

            const firstRow = rows.first();
            // Each row has name, email, role badge
            await expect(firstRow.locator('td').nth(0)).not.toBeEmpty();
            await expect(firstRow.locator('td').nth(1)).not.toBeEmpty();
            await expect(firstRow.locator('.badge-outline')).toBeVisible();
        });

        test("role dropdown is disabled for current admin user", async ({ page }) => {
            // Admin's own row should have disabled select — exact logic from UsersPage.tsx isSelf
            const rows = page.locator('tbody tr');
            const count = await rows.count();

            for (let i = 0; i < count; i++) {
                const row = rows.nth(i);
                const email = await row.locator('td').nth(1).textContent();

                if (email?.trim() === ADMIN_EMAIL) {
                    await expect(row.locator('select')).toBeDisabled();
                    return;
                }
            }
            test.skip(); // admin user not found in table
        });

        test("can change a user role and shows success toast", async ({ page }) => {
            const rows = page.locator('tbody tr');
            const count = await rows.count();

            // Find a non-admin, non-self user to change role
            for (let i = 0; i < count; i++) {
                const row = rows.nth(i);
                const email = await row.locator('td').nth(1).textContent();
                const select = row.locator('select');
                const isDisabled = await select.isDisabled();

                if (!isDisabled && email?.trim() !== ADMIN_EMAIL) {
                    const currentRole = await select.inputValue();
                    const newRole = currentRole === 'student' ? 'instructor' : 'student';

                    const roleRes = page.waitForResponse(
                        (res: any) => res.url().includes('/api/admin') || res.url().includes('/role'),
                        { timeout: 10000 }
                    );

                    await select.selectOption(newRole);
                    await roleRes;

                    // Exact toast from UsersPage.tsx
                    await expect(page.getByText('Role updated. User must re-login.')).toBeVisible({ timeout: 5000 });

                    // Revert role back to original
                    await select.selectOption(currentRole);
                    return;
                }
            }
            test.skip(); // no eligible user found
        });

        test("shows warning message about role changes", async ({ page }) => {
            // Exact text from UsersPage.tsx footer note
            await expect(
                page.getByText('⚠ Role changes apply after user logs in again.')
            ).toBeVisible();
        });
    });
});