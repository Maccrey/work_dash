// 간단한 북마크 매니저 테스트
import { test, expect } from '@playwright/test';

test('북마크 매니저 카드 표시 테스트', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // 설정 모달 열기
  await page.click('#settings-icon');
  await expect(page.locator('#settings-modal')).toBeVisible();
  
  // 도구 카테고리 클릭
  await page.click('[data-category="tools"]');
  
  // 북마크 관리 체크박스 찾기
  const bookmarkCheckbox = page.locator('#toggle-bookmark-manager-card');
  await expect(bookmarkCheckbox).toBeVisible();
  
  // 체크박스 상태 확인
  const isChecked = await bookmarkCheckbox.isChecked();
  console.log('북마크 체크박스 상태:', isChecked);
  
  // 체크박스 활성화
  if (!isChecked) {
    await bookmarkCheckbox.check();
  }
  
  // 설정 모달 닫기
  await page.click('#settings-modal .close-button');
  await expect(page.locator('#settings-modal')).not.toBeVisible();
  
  // 북마크 매니저 카드가 표시되는지 확인
  await expect(page.locator('#bookmark-manager-card')).toBeVisible();
  
  // 폼 요소들이 존재하는지 확인
  await expect(page.locator('#bookmark-form')).toBeVisible();
  await expect(page.locator('#bookmark-title')).toBeVisible();
  await expect(page.locator('#bookmark-url')).toBeVisible();
  await expect(page.locator('#bookmark-category')).toBeVisible();
  
  console.log('북마크 매니저 카드 성공적으로 표시됨');
});