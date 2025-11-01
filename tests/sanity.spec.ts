import { test, expect } from '@playwright/test';

test('loads dashboard index', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/index.html`);
  await expect(page.locator('.header-container h1')).toHaveText('업무 대시보드');
});
