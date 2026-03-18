// tests/e2e/instructor.spec.ts
import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";


const INSTRUCTOR_EMAIL = "rman@gmail.com";
const INSTRUCTOR_PASS = "12345";

// ─── Helpers ────────────────────────────────────────────────────────────────

async function login(page: Page) {
  await page.goto('/login');
  await page.waitForSelector('input[name="email"]', { state: 'visible' });
  await page.fill('input[name="email"]', INSTRUCTOR_EMAIL);
  await page.fill('input[name="password"]', INSTRUCTOR_PASS);

  const loginRes = page.waitForResponse(
    (res: any) => res.url().includes('/api/auth/login'),
    { timeout: 20000 }
  );
  await page.click('button[type="submit"]');
  await loginRes;
  await page.waitForURL(/\/instructor/, { timeout: 20000 });
}

async function createTestCourse(page: Page, title: string) {
  //Navigates to /instructor/add-course

  await page.getByRole('button', { name: '+ Create Course' }).click();
  await page.waitForURL(/\/instructor\/add-course/, { timeout: 10000 });

  //Wait for page load
  await page.waitForSelector('input[placeholder="Course Title"]', { state: 'visible' });

  //Fill Details title and description
  await page.fill('input[placeholder="Course Title"]', title);
  await page.fill('textarea[placeholder="Course Description"]', 'A test course description');

  //Add lesson
  await page.getByRole('button', { name: '+ Add Lesson' }).click();

  //Fill lesson fields
  await page.fill('input[placeholder="Lesson title"]', 'Test Lesson');
  await page.fill('input[placeholder="YouTube Video ID"]', 'dQw4w9WgXcQ');

  //Wait for API
  const addRes = page.waitForResponse(
    (res: any) => res.url().includes('/api/course') || res.url().includes('/courses'),
    { timeout: 10000 }
  );
  //Submit course
  await page.getByRole('button', { name: 'Add Course' }).click();
  await addRes;

  //Verify Success
  await expect(page.getByText('Course added successfully')).toBeVisible({ timeout: 5000 });

  //  Navigate back manually since AddCourse doesn't redirect
  await page.goto('/instructor');
  await page.waitForURL(/\/instructor/, { timeout: 10000 });

  //  Wait for courses to load
  await page.waitForSelector('.card.bg-base-100', { state: 'visible', timeout: 10000 });
}

// ─── Suite ──────────────────────────────────────────────────────────────────

test.describe("Instructor — Course Management", () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // ── View ────────────────────────────────────────────────────────────────

  test.describe("View", () => {
    test("shows dashboard heading and Create Course button", async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Instructor Dashboard' })).toBeVisible();
      await expect(page.getByRole('button', { name: '+ Create Course' })).toBeVisible();
    });

    test("shows empty state or course cards", async ({ page }) => {
      const empty = page.getByText('No courses created yet.');
      const cards = page.locator('.card.bg-base-100').first();
      await expect(empty.or(cards)).toBeVisible({ timeout: 10000 });
    });

    test("shows course cards with title and status badge", async ({ page }) => {
      const card = page.locator('.card.bg-base-100').first();
      const hasCards = await card.isVisible().catch(() => false);
      if (!hasCards) { test.skip(); return; }

      await expect(card.locator('.card-title')).not.toBeEmpty();
      await expect(card.locator('.badge')).toBeVisible();
    });

    test("published course shows green badge; draft shows yellow", async ({ page }) => {
      const hasCards = await page.locator('.card.bg-base-100').first().isVisible().catch(() => false);
      if (!hasCards) { test.skip(); return; }

      //  Use CSS comma selector instead of .or() to avoid strict mode violation
      await expect(
        page.locator('.badge-success, .badge-warning').first()
      ).toBeVisible({ timeout: 10000 });
    });
  });

  // ── Add ─────────────────────────────────────────────────────────────────

  test.describe("Add", () => {
    test("navigates to Add Course page", async ({ page }) => {
      await page.getByRole('button', { name: '+ Create Course' }).click();
      await expect(page).toHaveURL(/\/instructor\/add-course/);
      await expect(page.getByRole('heading', { name: 'Add Course' })).toBeVisible();
    });

    test("shows validation error when submitting empty form", async ({ page }) => {
      await page.goto('/instructor/add-course');
      await page.getByRole('button', { name: 'Add Course' }).click();
      //  Exact toast from CourseForm.tsx handleSubmit
      await expect(page.getByText('Title and description are required')).toBeVisible({ timeout: 5000 });
    });

    test("shows validation error when no lessons added", async ({ page }) => {
      await page.goto('/instructor/add-course');
      await page.fill('input[placeholder="Course Title"]', 'Test');
      await page.fill('textarea[placeholder="Course Description"]', 'Test desc');
      await page.getByRole('button', { name: 'Add Course' }).click();
      //  Exact toast from CourseForm.tsx handleSubmit
      await expect(page.getByText('Add at least one lesson')).toBeVisible({ timeout: 5000 });
    });

    test("creates a course and shows success toast", async ({ page }) => {
      const title = `Test Course ${Date.now()}`;
      await createTestCourse(page, title);
      await expect(page.getByText(title)).toBeVisible({ timeout: 10000 });
    });
  });

  // ── Edit ─────────────────────────────────────────────────────────────────

  test.describe("Edit", () => {
    test("navigates to Edit Course page from dashboard", async ({ page }) => {
      const hasCards = await page.locator('.card.bg-base-100').first().isVisible().catch(() => false);
      if (!hasCards) { test.skip(); return; }

      await page.getByRole('button', { name: 'Edit' }).first().click();
      await expect(page).toHaveURL(/\/instructor\/edit-course\/.+/);
      await expect(page.getByRole('heading', { name: 'Edit Course' })).toBeVisible();
    });

    test("pre-populates form with existing course data", async ({ page }) => {
      const hasCards = await page.locator('.card.bg-base-100').first().isVisible().catch(() => false);
      if (!hasCards) { test.skip(); return; }

      await page.getByRole('button', { name: 'Edit' }).first().click();
      await expect(page).toHaveURL(/\/instructor\/edit-course\/.+/);

      //  Use placeholder selector
      await expect(
        page.locator('input[placeholder="Course Title"]')
      ).not.toHaveValue('', { timeout: 5000 });
    });

    test("saves updated title and shows success toast", async ({ page }) => {
      const original = `Edit Me ${Date.now()}`;
      await createTestCourse(page, original);

      await page.locator('.card.bg-base-100')
        .filter({ hasText: original })
        .getByRole('button', { name: 'Edit' })
        .click();

      await expect(page).toHaveURL(/\/instructor\/edit-course\/.+/);

      const titleInput = page.locator('input[placeholder="Course Title"]');
      await titleInput.clear();
      await titleInput.fill(`Updated ${Date.now()}`);

      const updateRes = page.waitForResponse(
        (res: any) => res.url().includes('/api/course') || res.url().includes('/courses'),
        { timeout: 10000 }
      );
      await page.getByRole('button', { name: 'Update Course' }).click();
      await updateRes;

      //  Exact toast from EditCourse.tsx
      await expect(page.getByText('Course updated')).toBeVisible({ timeout: 5000 });
      await expect(page).toHaveURL(/\/instructor\/view-course/, { timeout: 10000 });
    });
  });

  // ── Delete ───────────────────────────────────────────────────────────────

  test.describe("Delete", () => {
    test("Delete button is disabled for published courses", async ({ page }) => {
      const publishedCard = page.locator('.card.bg-base-100')
        .filter({ has: page.locator('.badge-success') })
        .first();
      const hasPublished = await publishedCard.isVisible().catch(() => false);
      if (!hasPublished) { test.skip(); return; }

      await expect(publishedCard.getByRole('button', { name: 'Delete' })).toBeDisabled();
    });

    test("Delete button is enabled for draft courses", async ({ page }) => {
      const draftCard = page.locator('.card.bg-base-100')
        .filter({ has: page.locator('.badge-warning') })
        .first();
      const hasDraft = await draftCard.isVisible().catch(() => false);
      if (!hasDraft) { test.skip(); return; }

      await expect(draftCard.getByRole('button', { name: 'Delete' })).toBeEnabled();
    });

    test("cancelling confirm dialog keeps the course", async ({ page }) => {
      const title = `Keep Me ${Date.now()}`;
      await createTestCourse(page, title);

      page.on('dialog', d => d.dismiss());
      await page.locator('.card.bg-base-100')
        .filter({ hasText: title })
        .getByRole('button', { name: 'Delete' })
        .click();

      await expect(page.getByText(title)).toBeVisible();
    });

    test("confirming dialog deletes course and shows success toast", async ({ page }) => {
      const title = `Delete Me ${Date.now()}`;
      await createTestCourse(page, title);

      page.on('dialog', d => d.accept());
      await page.locator('.card.bg-base-100')
        .filter({ hasText: title })
        .getByRole('button', { name: 'Delete' })
        .click();

      //  Exact toast from InstructorHome.tsx
      await expect(page.getByText('Course deleted')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText(title)).not.toBeVisible({ timeout: 5000 });
    });
  });

  // ── Publish / Unpublish ──────────────────────────────────────────────────

  test.describe("Publish toggle", () => {
    test("Publish button appears on draft courses", async ({ page }) => {
      const draftCard = page.locator('.card.bg-base-100')
        .filter({ has: page.locator('.badge-warning') })
        .first();
      const hasDraft = await draftCard.isVisible().catch(() => false);
      if (!hasDraft) { test.skip(); return; }

      await expect(draftCard.getByRole('button', { name: 'Publish' })).toBeVisible();
    });

    test("clicking Publish updates badge to Published", async ({ page }) => {
      const title = `Publish Me ${Date.now()}`;
      await createTestCourse(page, title);

      const card = page.locator('.card.bg-base-100').filter({ hasText: title });
      await card.getByRole('button', { name: 'Publish' }).click();

      //  Exact toast from InstructorHome.tsx
      await expect(page.getByText('Course published')).toBeVisible({ timeout: 5000 });
      await expect(card.locator('.badge-success')).toBeVisible({ timeout: 5000 });
    });

    test("clicking Unpublish updates badge to Draft", async ({ page }) => {
      const title = `Unpublish Me ${Date.now()}`;
      await createTestCourse(page, title);

      const card = page.locator('.card.bg-base-100').filter({ hasText: title });

      // Publish first
      await card.getByRole('button', { name: 'Publish' }).click();
      await expect(page.getByText('Course published')).toBeVisible({ timeout: 5000 });

      // Then unpublish
      await card.getByRole('button', { name: 'Unpublish' }).click();
      //  Exact toast from InstructorHome.tsx
      await expect(page.getByText('Course unpublished')).toBeVisible({ timeout: 5000 });
      await expect(card.locator('.badge-warning')).toBeVisible({ timeout: 5000 });
    });
  });
});