// 북마크 추가 기능 테스트
import { test, expect } from '@playwright/test';

test('북마크 추가 기능 상세 테스트', async ({ page }) => {
  // 콘솔 로그 수집
  const logs = [];
  page.on('console', msg => {
    logs.push(`${msg.type()}: ${msg.text()}`);
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // 북마크 매니저 카드 활성화
  await page.click('#settings-icon');
  await page.click('[data-category="tools"]');
  await page.check('#toggle-bookmark-manager-card');
  await page.click('#settings-modal .close-button');
  
  await expect(page.locator('#bookmark-manager-card')).toBeVisible();
  
  // 폼이 준비될 때까지 대기
  await expect(page.locator('#bookmark-form')).toBeVisible();
  await expect(page.locator('#bookmark-title')).toBeVisible();
  await expect(page.locator('#bookmark-url')).toBeVisible();
  
  // 폼 필드에 데이터 입력
  await page.fill('#bookmark-title', 'Google');
  await page.fill('#bookmark-url', 'https://www.google.com');
  await page.selectOption('#bookmark-category', 'tools');
  await page.fill('#bookmark-description', '구글 검색 엔진');
  
  // 직접 폼 제출 메서드 호출
  await page.evaluate(() => {
    const form = document.getElementById('bookmark-form');
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  });
  
  // 잠시 대기하여 처리가 완료되도록 함
  await page.waitForTimeout(2000);
  
  // 결과 확인
  const bookmarksList = page.locator('#bookmarks-list');
  // 북마크가 추가되었는지 확인
  await expect(bookmarksList).toContainText('Google');
});