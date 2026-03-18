import { test, expect } from '@playwright/test';

test('user can register successfully', async ({ page }) => {
  // Log any failed network requests for debugging
  page.on('response', res => {
    if (!res.ok()) console.log('Failed request:', res.url(), res.status());
  });

  await page.goto('/register');

  // Use unique email to avoid "already registered" errors
  const email = `testuser_${Date.now()}@example.com`;

  await page.fill('input[name="name"]', 'Test User');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', '123456');

  await page.click('button[type="submit"]');

  // Wait for redirect THEN assert — gives the app time to navigate
  await page.waitForURL(/login/, { timeout: 10000 });
  await expect(page).toHaveURL(/login/);
});