// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test';

const credentials: Record<string, { email: string; password: string }> = {
  chromium: { email: 'test-chromium@example.com', password: 'Test@123456' },
  firefox:  { email: 'test-firefox@example.com',  password: 'Test@123456' },
  webkit:   { email: 'test-webkit@example.com',   password: 'Test@123456' },
};

test('user can login successfully', async ({ page, browserName }) => {
  const { email, password } = credentials[browserName];

  await page.goto('/login');
  await page.waitForSelector('input[name="email"]', { state: 'visible' });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);

  const loginResponsePromise = page.waitForResponse(
    res => res.url().includes('/api/auth/login'),
    { timeout: 20000 }
  );

  await page.click('button[type="submit"]');
  const loginResponse = await loginResponsePromise;
  const body = await loginResponse.json();
  console.log(`[${browserName}] Login status:`, loginResponse.status());
  console.log(`[${browserName}] Login body:`, JSON.stringify(body));

  // Check what /me returns immediately after login
  const meResponse = await page.request.get('http://localhost:3000/api/auth/me');
  console.log(`[${browserName}] /me status:`, meResponse.status());
  console.log(`[${browserName}] /me body:`, await meResponse.text());

  // Check cookies
  const cookies = await page.context().cookies();
  console.log(`[${browserName}] cookies:`, JSON.stringify(cookies));

  // Check localStorage
  const token = await page.evaluate(() => localStorage.getItem('token'));
  console.log(`[${browserName}] localStorage token:`, token);

  await page.waitForTimeout(3000);
  console.log(`[${browserName}] URL after 3s:`, page.url());

  await page.waitForURL(/\/(student|instructor|admin)/, { timeout: 20000 });
  await expect(page).toHaveURL(/\/(student|instructor|admin)/);
});