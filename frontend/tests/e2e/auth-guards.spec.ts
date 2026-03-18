// tests/e2e/auth-guards.spec.ts
import { test, expect } from '@playwright/test';

// ── Protected Route ─────────────────────────────────────
test('unauthenticated user is redirected to login', async ({ page }) => {
  // Try to access protected route without logging in
  await page.goto('/student');
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
});

test('unauthenticated user cannot access instructor page', async ({ page }) => {
  await page.goto('/instructor');
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
});


// ── Logout ───────────────────────────────────────────────
test('student can logout successfully', async ({ page }) => {
  // Login first
  await page.goto('/login');
  await page.waitForSelector('input[name="email"]', { state: 'visible' });
  await page.fill('input[name="email"]', 'student-flow-test1@example.com');  
  await page.fill('input[name="password"]', 'Test@123456');

  const loginRes = page.waitForResponse(
    res => res.url().includes('/api/auth/login'),
    { timeout: 20000 }
  );
  await page.click('button[type="submit"]');
  await loginRes;
  await page.waitForURL(/\/student/, { timeout: 20000 });

  // Logout
  const logoutRes = page.waitForResponse(
    res => res.url().includes('/api/auth/logout'),
    { timeout: 10000 }
  );

  await page.getByRole('button', { name: 'Logout' }).click();
  await logoutRes;
   
  // Should redirect to login
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
});

test('after logout protected routes redirect to login', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.waitForSelector('input[name="email"]', { state: 'visible' });
  await page.fill('input[name="email"]', 'student-flow-test1@example.com');
  await page.fill('input[name="password"]', 'Test@123456');

  const loginRes = page.waitForResponse(
    res => res.url().includes('/api/auth/login'),
    { timeout: 20000 } 
  );
  await page.click('button[type="submit"]');
  await loginRes;
  await page.waitForURL(/\/student/, { timeout: 20000 });

  // Logout
  const logoutRes = page.waitForResponse(
    res => res.url().includes('/api/auth/logout'),
    { timeout: 10000 }
  );
  await page.getByRole('button', { name: 'Logout' }).click();
  await logoutRes;
  await page.waitForURL(/\/login/, { timeout: 10000 });

  // Try accessing protected route after logout
  await page.goto('/student');
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
});

