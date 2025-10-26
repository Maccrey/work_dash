// 간단한 백스페이스 테스트
import { test, expect } from '@playwright/test';

test('간단한 백스페이스 테스트', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // 북마크 매니저 카드 활성화
  await page.click('#settings-icon');
  await page.click('[data-category="tools"]');
  await page.check('#toggle-bookmark-manager-card');
  await page.click('#settings-modal .close-button');
  
  await expect(page.locator('#bookmark-manager-card')).toBeVisible();
  await expect(page.locator('#bookmark-title')).toBeVisible();
  
  // 제목 필드에 텍스트 입력
  await page.fill('#bookmark-title', 'Test Title');
  
  // 값이 제대로 입력되었는지 확인
  let titleValue = await page.locator('#bookmark-title').inputValue();
  expect(titleValue).toBe('Test Title');
  
  // 필드 클리어하고 다시 입력 (실제 사용자 동작 시뮬레이션)
  await page.locator('#bookmark-title').clear();
  await page.fill('#bookmark-title', 'New Title');
  
  titleValue = await page.locator('#bookmark-title').inputValue();
  expect(titleValue).toBe('New Title');
  
  // URL 필드도 동일하게 테스트
  await page.fill('#bookmark-url', '192.168.1.100:8080');
  let urlValue = await page.locator('#bookmark-url').inputValue();
  expect(urlValue).toBe('192.168.1.100:8080');
  
  // URL 필드 클리어하고 다시 입력
  await page.locator('#bookmark-url').clear();
  await page.fill('#bookmark-url', 'localhost:3000');
  
  urlValue = await page.locator('#bookmark-url').inputValue();
  expect(urlValue).toBe('localhost:3000');
  
  console.log('간단한 백스페이스 테스트 완료');
});

test('실제 키보드 입력 시뮬레이션 테스트', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // 북마크 매니저 카드 활성화
  await page.click('#settings-icon');
  await page.click('[data-category="tools"]');
  await page.check('#toggle-bookmark-manager-card');
  await page.click('#settings-modal .close-button');
  
  await expect(page.locator('#bookmark-manager-card')).toBeVisible();
  
  // 제목 필드 클릭하고 포커스
  await page.click('#bookmark-title');
  
  // 직접 타이핑
  await page.keyboard.type('Wrong Title');
  
  let titleValue = await page.locator('#bookmark-title').inputValue();
  expect(titleValue).toBe('Wrong Title');
  
  // 전체 선택 후 삭제
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Delete');
  
  titleValue = await page.locator('#bookmark-title').inputValue();
  expect(titleValue).toBe('');
  
  // 새로운 텍스트 입력
  await page.keyboard.type('Correct Title');
  
  titleValue = await page.locator('#bookmark-title').inputValue();
  expect(titleValue).toBe('Correct Title');
  
  console.log('실제 키보드 입력 시뮬레이션 테스트 완료');
});