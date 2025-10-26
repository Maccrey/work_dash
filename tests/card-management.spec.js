// 카드 관리 시스템 테스트
import { test, expect } from '@playwright/test';

test.describe('카드 관리 시스템', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('모든 카드 카테고리가 설정에 표시되는지 확인', async ({ page }) => {
    await page.click('#settings-icon');
    
    const categories = [
      { key: 'basic', name: '기본 기능' },
      { key: 'data', name: '데이터 관리 및 분석' },
      { key: 'finance', name: '재무 및 비용 관리' },
      { key: 'planning', name: '업무 조직 및 계획' },
      { key: 'collaboration', name: '협업 및 소통' },
      { key: 'growth', name: '성장 및 학습' },
      { key: 'tools', name: '도구 및 유틸리티' }
    ];
    
    for (const category of categories) {
      const categoryHeader = page.locator(`[data-category="${category.key}"]`);
      await expect(categoryHeader).toBeVisible();
      await expect(categoryHeader).toContainText(category.name);
    }
  });

  test('카테고리 접기/펴기 기능이 작동하는지 확인', async ({ page }) => {
    await page.click('#settings-icon');
    
    // 기본 기능 카테고리 테스트
    const basicCategory = page.locator('[data-category="basic"]');
    const basicControls = page.locator('#category-basic');
    
    await expect(basicControls).toBeVisible();
    
    // 카테고리 접기
    await basicCategory.click();
    await expect(basicControls).toHaveClass(/collapsed/);
    
    // 카테고리 펴기
    await basicCategory.click();
    await expect(basicControls).not.toHaveClass(/collapsed/);
  });

  test('기본 카드들의 체크박스가 모두 존재하는지 확인', async ({ page }) => {
    await page.click('#settings-icon');
    
    const basicCards = [
      'toggle-weather-card',
      'toggle-tts-notifier-card', 
      'toggle-notes-card',
      'toggle-voice-memo-card',
      'toggle-pomodoro-card',
      'toggle-todo-card',
      'toggle-calculator-card',
      'toggle-attendance-card',
      'toggle-attendance-summary-card'
    ];

    for (const cardToggle of basicCards) {
      const checkbox = page.locator(`#${cardToggle}`);
      await expect(checkbox).toBeVisible();
      await expect(checkbox).toBeChecked();
    }
  });

  test('카드 숨김/표시 기능이 localStorage에 저장되는지 확인', async ({ page }) => {
    // 설정 모달 열기
    await page.click('#settings-icon');
    
    // 메모장 카드 숨기기
    await page.uncheck('#toggle-notes-card');
    await page.click('#settings-modal .close-button');
    
    // 카드가 숨겨졌는지 확인
    await expect(page.locator('#notes-card')).toBeHidden();
    
    // 페이지 새로고침
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 설정이 유지되는지 확인
    await expect(page.locator('#notes-card')).toBeHidden();
    
    // 설정에서도 체크해제 상태가 유지되는지 확인
    await page.click('#settings-icon');
    await expect(page.locator('#toggle-notes-card')).not.toBeChecked();
    
    // 다시 표시
    await page.check('#toggle-notes-card');
    await page.click('#settings-modal .close-button');
    await expect(page.locator('#notes-card')).toBeVisible();
  });

  test('여러 카드를 동시에 숨기고 표시할 수 있는지 확인', async ({ page }) => {
    await page.click('#settings-icon');
    
    // 여러 카드 숨기기
    const cardsToHide = ['#toggle-weather-card', '#toggle-calculator-card', '#toggle-voice-memo-card'];
    
    for (const cardToggle of cardsToHide) {
      await page.uncheck(cardToggle);
    }
    
    await page.click('#settings-modal .close-button');
    
    // 카드들이 숨겨졌는지 확인
    await expect(page.locator('#weather-card')).toBeHidden();
    await expect(page.locator('#calculator-card')).toBeHidden();
    await expect(page.locator('#voice-memo-card')).toBeHidden();
    
    // 다시 설정에서 표시
    await page.click('#settings-icon');
    
    for (const cardToggle of cardsToHide) {
      await page.check(cardToggle);
    }
    
    await page.click('#settings-modal .close-button');
    
    // 카드들이 다시 보이는지 확인
    await expect(page.locator('#weather-card')).toBeVisible();
    await expect(page.locator('#calculator-card')).toBeVisible();
    await expect(page.locator('#voice-memo-card')).toBeVisible();
  });

  test('새로운 카테고리 카드들이 숨겨진 상태로 시작하는지 확인', async ({ page }) => {
    // 새로 추가된 카드들은 기본적으로 hidden 클래스를 가져야 함
    const newCards = [
      '#goal-tracker-card',
      '#time-analysis-card', 
      '#productivity-metrics-card',
      '#expense-manager-card',
      '#password-generator-card'
    ];
    
    for (const cardSelector of newCards) {
      const card = page.locator(cardSelector);
      await expect(card).toBeHidden();
    }
    
    // 설정에서 표시로 변경 테스트
    await page.click('#settings-icon');
    
    // 데이터 관리 카테고리 열기
    await page.click('[data-category="data"]');
    
    // 목표 추적기 카드 표시
    await page.check('#toggle-goal-tracker-card');
    await page.click('#settings-modal .close-button');
    
    // 카드가 보이는지 확인
    await expect(page.locator('#goal-tracker-card')).toBeVisible();
  });

  test('모든 데이터 지우기 기능이 작동하는지 확인', async ({ page }) => {
    // 먼저 일부 데이터 추가
    await page.fill('#note-input', '테스트 데이터');
    await page.click('#note-form button[type="submit"]');
    await expect(page.locator('#note-list')).toContainText('테스트 데이터');

    // 일부 카드 숨기기
    await page.click('#settings-icon');
    await page.uncheck('#toggle-weather-card');
    await page.click('#settings-modal .close-button');
    await expect(page.locator('#weather-card')).toBeHidden();

    // 데이터 지우기
    await page.click('#settings-icon');

    // 다이얼로그 처리 - 순서대로 처리
    let dialogCount = 0;
    page.on('dialog', async dialog => {
      if (dialogCount === 0) {
        expect(dialog.message()).toContain('정말로 모든 데이터를 삭제하시겠습니까?');
      } else {
        expect(dialog.message()).toContain('모든 데이터가 성공적으로 삭제되었습니다');
      }
      await dialog.accept();
      dialogCount++;
    });

    await page.click('#clear-all-data-btn');

    // 다이얼로그 처리 대기
    await page.waitForTimeout(1000);

    // 데이터가 지워졌는지 확인
    await expect(page.locator('#note-list')).not.toContainText('테스트 데이터');

    // 카드 설정도 초기화되었는지 확인
    await expect(page.locator('#weather-card')).toBeVisible();
  });
});