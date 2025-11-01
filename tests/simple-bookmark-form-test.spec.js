// 간단한 북마크 폼 테스트
import { test, expect } from '@playwright/test';

test('북마크 폼 기본 동작 테스트', async ({ page }) => {
  // 콘솔 로그 수집
  const logs = [];
  page.on('console', msg => {
    logs.push(`${msg.type()}: ${msg.text()}`);
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // 기본 상태에서는 카드가 숨겨져 있어야 함
  const bookmarkCard = page.locator('#bookmark-manager-card');
  await expect(bookmarkCard).toBeHidden();

  // 설정 모달에서 카드 표시 설정
  await page.click('#settings-icon');
  await page.locator('.category-header[data-category="tools"]').click();
  await page.locator('#toggle-bookmark-manager-card').check();
  await page.click('#settings-modal .close-button');

  await expect(bookmarkCard).toBeVisible();
  
  // 잠시 대기
  await page.waitForTimeout(2000);
  
  // 폼 필드 확인
  await expect(page.locator('#bookmark-title')).toBeVisible();
  await expect(page.locator('#bookmark-url')).toBeVisible();
  await expect(page.locator('#bookmark-category')).toBeVisible();
  
  // 폼에 데이터 입력
  await page.fill('#bookmark-title', 'Test Site');
  await page.fill('#bookmark-url', 'https://test.com');
  
  // 입력된 값 확인
  const titleValue = await page.locator('#bookmark-title').inputValue();
  const urlValue = await page.locator('#bookmark-url').inputValue();
  
  console.log('입력된 값:', { title: titleValue, url: urlValue });
  
  // 폼 제출
  await page.click('#bookmark-form button[type="submit"]');
  
  // 잠시 대기
  await page.waitForTimeout(3000);
  
  console.log('수집된 로그:', logs.filter(log => log.includes('북마크')));
  
  // 결과 확인
  const bookmarksListText = await page.locator('#bookmarks-list').textContent();
  console.log('북마크 목록:', bookmarksListText);
});
