// IP 주소 및 백스페이스 테스트
import { test, expect } from '@playwright/test';

test('IP 주소 및 백스페이스 기능 테스트', async ({ page }) => {
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
  
  // 백스페이스 테스트 - 텍스트 입력하고 지워보기
  await page.fill('#bookmark-title', 'Test Wrong Title');
  await page.focus('#bookmark-title');
  
  // 백스페이스로 일부 텍스트 삭제
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Backspace');
  }
  
  // 올바른 제목으로 수정
  await page.fill('#bookmark-title', 'Local Server');
  
  // IP 주소 테스트
  await page.fill('#bookmark-url', '192.168.1.100:8080');
  await page.selectOption('#bookmark-category', 'tools');
  await page.fill('#bookmark-description', '로컬 서버');
  
  // 폼 제출
  await page.evaluate(() => {
    const form = document.getElementById('bookmark-form');
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  });
  
  await page.waitForTimeout(1000);
  
  // IP 주소가 http:// 프로토콜과 함께 저장되었는지 확인
  await expect(page.locator('#bookmarks-list')).toContainText('Local Server');
  await expect(page.locator('#bookmarks-list')).toContainText('http://192.168.1.100:8080');
  
  // 다른 IP 주소도 테스트 (localhost)
  await page.fill('#bookmark-title', 'Localhost Dev');
  await page.fill('#bookmark-url', 'localhost:3000/admin');
  await page.selectOption('#bookmark-category', 'development');
  await page.fill('#bookmark-description', '개발서버');
  
  // 폼 제출
  await page.evaluate(() => {
    const form = document.getElementById('bookmark-form');
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  });
  
  await page.waitForTimeout(1000);
  
  // localhost URL이 올바르게 저장되었는지 확인
  await expect(page.locator('#bookmarks-list')).toContainText('Localhost Dev');
  await expect(page.locator('#bookmarks-list')).toContainText('http://localhost:3000/admin');
  
  // 127.0.0.1 IP 주소 테스트
  await page.fill('#bookmark-title', 'Loopback Server');
  await page.fill('#bookmark-url', '127.0.0.1:8000');
  await page.selectOption('#bookmark-category', 'tools');
  
  // 폼 제출
  await page.evaluate(() => {
    const form = document.getElementById('bookmark-form');
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  });
  
  await page.waitForTimeout(1000);
  
  // 127.0.0.1 URL이 올바르게 저장되었는지 확인
  await expect(page.locator('#bookmarks-list')).toContainText('Loopback Server');
  await expect(page.locator('#bookmarks-list')).toContainText('http://127.0.0.1:8000');
  
  console.log('IP 주소 및 백스페이스 테스트 완료');
});

test('URL 입력 필드에서 백스페이스 동작 테스트', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // 북마크 매니저 카드 활성화
  await page.click('#settings-icon');
  await page.click('[data-category="tools"]');
  await page.check('#toggle-bookmark-manager-card');
  await page.click('#settings-modal .close-button');
  
  await expect(page.locator('#bookmark-manager-card')).toBeVisible();
  await expect(page.locator('#bookmark-url')).toBeVisible();
  
  // URL 필드에 잘못된 값 입력
  await page.fill('#bookmark-url', 'wrong-url-test');
  
  // 포커스 설정 후 백스페이스로 개별 문자 삭제 테스트
  await page.focus('#bookmark-url');
  
  // 커서를 끝으로 이동
  await page.keyboard.press('End');
  
  // 백스페이스로 문자를 하나씩 삭제
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Backspace');
  }
  
  // 현재 값 확인 ('wrong-url')이 되어야 함
  let currentValue = await page.locator('#bookmark-url').inputValue();
  expect(currentValue).toBe('wrong-url');
  
  // 전체 선택 후 삭제
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Backspace');
  
  // 비어있는지 확인
  currentValue = await page.locator('#bookmark-url').inputValue();
  expect(currentValue).toBe('');
  
  // 새로운 값 입력
  await page.type('#bookmark-url', 'google.com');
  
  const finalValue = await page.locator('#bookmark-url').inputValue();
  expect(finalValue).toBe('google.com');
  
  console.log('URL 필드 백스페이스 테스트 완료');
});

test('모든 입력 필드에서 백스페이스 기능 테스트', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // 북마크 매니저 카드 활성화
  await page.click('#settings-icon');
  await page.click('[data-category="tools"]');
  await page.check('#toggle-bookmark-manager-card');
  await page.click('#settings-modal .close-button');
  
  await expect(page.locator('#bookmark-manager-card')).toBeVisible();
  
  // 모든 입력 필드 테스트
  const fields = [
    { selector: '#bookmark-title', testText: 'Wrong Title' },
    { selector: '#bookmark-url', testText: 'wrong-url.com' },
    { selector: '#bookmark-description', testText: 'Wrong description text' }
  ];
  
  for (const field of fields) {
    // 필드에 텍스트 입력
    await page.fill(field.selector, field.testText);
    
    // 포커스 설정
    await page.focus(field.selector);
    
    // 끝으로 이동 후 백스페이스로 일부 문자 삭제
    await page.keyboard.press('End');
    
    // 3글자 삭제
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Backspace');
    }
    
    // 값이 변경되었는지 확인
    const currentValue = await page.locator(field.selector).inputValue();
    expect(currentValue).toBe(field.testText.slice(0, -3));
    
    // 전체 삭제
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Backspace');
    
    const emptyValue = await page.locator(field.selector).inputValue();
    expect(emptyValue).toBe('');
    
    console.log(`${field.selector} 백스페이스 테스트 통과`);
  }
  
  console.log('모든 입력 필드 백스페이스 테스트 완료');
});