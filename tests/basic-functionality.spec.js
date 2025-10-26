// 기본 기능 테스트
import { test, expect } from '@playwright/test';

test.describe('업무 대시보드 기본 기능', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForLoadState('networkidle');
  });

  test('페이지가 정상적으로 로드되는지 확인', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page).toHaveTitle('업무 대시보드');
    
    // 페이지 헤더 확인 (특정적으로)
    await expect(page.locator('.header-container h1')).toContainText('업무 대시보드');
    
    // 설정 아이콘 확인
    await expect(page.locator('#settings-icon')).toBeVisible();
  });

  test('기본 카드들이 표시되는지 확인', async ({ page }) => {
    // 기본 카드들이 존재하는지 확인
    const basicCards = [
      '#weather-card',
      '#tts-notifier-card', 
      '#notes-card',
      '#voice-memo-card',
      '#pomodoro-card',
      '#todo-card',
      '#calculator-card',
      '#attendance-card'
    ];

    for (const cardSelector of basicCards) {
      await expect(page.locator(cardSelector)).toBeVisible();
    }
  });

  test('설정 모달이 정상적으로 작동하는지 확인', async ({ page }) => {
    // 설정 아이콘 클릭
    await page.click('#settings-icon');
    
    // 설정 모달이 나타나는지 확인
    await expect(page.locator('#settings-modal')).toBeVisible();
    
    // 카테고리 헤더들이 존재하는지 확인
    const categories = ['basic', 'data', 'finance', 'planning', 'collaboration', 'growth', 'tools'];
    
    for (const category of categories) {
      await expect(page.locator(`[data-category="${category}"]`)).toBeVisible();
    }
    
    // 모달 닫기
    await page.click('#settings-modal .close-button');
    await expect(page.locator('#settings-modal')).not.toBeVisible();
  });

  test('카드 표시/숨김 기능이 작동하는지 확인', async ({ page }) => {
    // 설정 모달 열기
    await page.click('#settings-icon');
    
    // 날씨 카드 체크박스 찾기 및 해제
    const weatherCheckbox = page.locator('#toggle-weather-card');
    await expect(weatherCheckbox).toBeChecked();
    
    await weatherCheckbox.uncheck();
    
    // 설정 모달 닫기
    await page.click('#settings-modal .close-button');
    
    // 날씨 카드가 숨겨졌는지 확인
    await expect(page.locator('#weather-card')).toBeHidden();
    
    // 다시 설정 열어서 체크
    await page.click('#settings-icon');
    await weatherCheckbox.check();
    await page.click('#settings-modal .close-button');
    
    // 날씨 카드가 다시 보이는지 확인
    await expect(page.locator('#weather-card')).toBeVisible();
  });

  test('메모장 기능이 작동하는지 확인', async ({ page }) => {
    const testNote = '테스트 메모입니다';
    
    // 메모 입력
    await page.fill('#note-input', testNote);
    await page.click('#note-form button[type="submit"]');
    
    // 메모가 목록에 추가되었는지 확인
    await expect(page.locator('#note-list')).toContainText(testNote);
    
    // 삭제 확인 대화상자 처리를 먼저 설정
    page.on('dialog', dialog => dialog.accept());
    
    // 메모 삭제
    await page.click('#note-list .delete-note-btn');
    
    // 메모가 삭제되었는지 확인
    await expect(page.locator('#note-list')).not.toContainText(testNote);
  });

  test('계산기 기능이 작동하는지 확인', async ({ page }) => {
    // 계산기 숫자 입력 테스트
    await page.click('#calculator-card .calculator-button:has-text("2")');
    await page.click('#calculator-card .calculator-button:has-text("+")');
    await page.click('#calculator-card .calculator-button:has-text("3")');
    await page.click('#calculator-card .calculator-button:has-text("=")');
    
    // 결과 확인
    await expect(page.locator('#calculator-display')).toContainText('5');
    
    // 클리어 테스트
    await page.click('#calculator-card .calculator-button:has-text("C")');
    await expect(page.locator('#calculator-display')).toContainText('0');
  });

  test('할 일 추가 기능이 작동하는지 확인', async ({ page }) => {
    const testTodo = '테스트 할 일';
    
    // 할 일 입력
    await page.fill('#todo-time', '14:30');
    await page.fill('#todo-text', testTodo);
    await page.selectOption('#todo-priority', 'high');
    await page.click('#todo-form button[type="submit"]');
    
    // 할 일이 목록에 추가되었는지 확인
    await expect(page.locator('#todo-list')).toContainText(testTodo);
    await expect(page.locator('#todo-list')).toContainText('14:30');
  });

  test('날씨 카드 위치 요청 기능이 작동하는지 확인', async ({ page }) => {
    // 날씨 카드의 요소들이 존재하는지 확인
    await expect(page.locator('#weather-card')).toBeVisible();
    await expect(page.locator('#toggleButton')).toBeVisible();
    await expect(page.locator('#status')).toBeVisible();
    
    // 알림 시작 버튼의 텍스트 확인
    const toggleButtonText = await page.locator('#toggleButton').textContent();
    expect(toggleButtonText).toContain('알림');
  });
});