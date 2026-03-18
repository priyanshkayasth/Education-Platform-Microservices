// tests/e2e/student-flow.spec.ts
import { test, expect } from '@playwright/test';

const student = {
    name: 'Student Test',
    email: 'student-flow-test1@example.com',
    password: 'Test@123456',
};

async function login(page: any) {
    //Open login page
    await page.goto('/login');
    //Wait for form fields
    await page.waitForSelector('input[name="email"]', { state: 'visible' });
    //Fill credentials
    await page.fill('input[name="email"]', student.email);
    await page.fill('input[name="password"]', student.password);

    //Wait for login API call

    const loginRes = page.waitForResponse(
        (res: any) => res.url().includes('/api/auth/login'),
        { timeout: 20000 }
    );

    //Click login submit the form
    await page.click('button[type="submit"]');
    //wait for login response
    await loginRes;

    //Wait for redirect to dashboard
    await page.waitForURL(/\/student/, { timeout: 20000 });
}  

// Click the TAB specifically, not the "Browse Courses" btn in empty state
async function clickBrowseTab(page: any) {
    await page.locator('.tabs button.tab', { hasText: /Browse Courses/ }).click();
}

async function clickMyCoursesTab(page: any) {
    await page.locator('.tabs button.tab', { hasText: /My Courses/ }).click();
}

test('1. student can login and reach dashboard', async ({ page }) => {
    await login(page);
    //verify Url
    await expect(page).toHaveURL(/\/student/);
});

test('2. student dashboard shows My Learning and tabs', async ({ page }) => {
    await login(page);

    await expect(page.getByText('My Learning')).toBeVisible();
    await expect(page.locator('.tabs button.tab', { hasText: /My Courses/ })).toBeVisible();
    await expect(page.locator('.tabs button.tab', { hasText: /Browse Courses/ })).toBeVisible();
});

test('3. student can browse available courses', async ({ page }) => {
    await login(page);
    await clickBrowseTab(page);

    // Wait for either course cards OR empty state
    await expect(
        page.locator('.card.bg-base-100').first()
            .or(page.getByText('No Available Courses'))
    ).toBeVisible({ timeout: 10000 });
});

test('4. student can enroll in a course', async ({ page }) => {
    await login(page);
    await clickBrowseTab(page);

    await page.waitForSelector('button:has-text("Enroll to Unlock")', {
        state: 'visible',
        timeout: 10000,
    });

    const enrollRes = page.waitForResponse(
        (res: any) => res.url().includes('/enrollment') || res.url().includes('/enrollments'),
        { timeout: 15000 }
    );

    await page.locator('button:has-text("Enroll to Unlock")').first().click();

    await enrollRes;

    await page.waitForFunction(() => {
        const myCoursesTab = document.querySelector('.tabs button.tab');
        return myCoursesTab?.textContent?.includes('My Courses');
    }, { timeout: 5000 });

    await clickMyCoursesTab(page);

    await page.waitForSelector('.card.bg-base-100', {
        state: 'visible',
        timeout: 10000,
    });

    await expect(
        page.locator('button:has-text("Enrolled")').first()
    ).toBeVisible({ timeout: 10000 });
});

test('5. enrolled course appears in My Courses tab', async ({ page }) => {
    await login(page);

    // First enroll in a course
    await clickBrowseTab(page);
    const hasEnrollBtn = await page.locator('button:has-text("Enroll to Unlock")').count();

    if (hasEnrollBtn > 0) {
        const enrollRes = page.waitForResponse(
            (res: any) => res.url().includes('/enrollment') || res.url().includes('/enrollments'),
            { timeout: 10000 }
        );
        await page.locator('button:has-text("Enroll to Unlock")').first().click();
        await enrollRes;
    }

    // Now check My Courses tab
    await clickMyCoursesTab(page);

    await expect(
        page.locator('.card.bg-base-100').first()
    ).toBeVisible({ timeout: 10000 });

    await expect(
        page.locator('button:has-text("Enrolled")').first()
    ).toBeVisible({ timeout: 10000 });
});