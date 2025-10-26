// 고급 카드 기능 테스트
import { test, expect } from '@playwright/test';

test.describe('고급 카드 기능', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('목표 추적기 카드', () => {
    test.beforeEach(async ({ page }) => {
      // 목표 추적기 카드 표시
      await page.click('#settings-icon');
      await page.click('[data-category="data"]');
      await page.check('#toggle-goal-tracker-card');
      await page.click('#settings-modal .close-button');
      await expect(page.locator('#goal-tracker-card')).toBeVisible();
    });

    test('새 목표 추가 기능', async ({ page }) => {
      await page.selectOption('#goal-period', 'daily');
      await page.fill('#goal-title', '물 8잔 마시기');
      await page.fill('#goal-target', '8');
      await page.fill('#goal-unit', '잔');
      await page.click('#add-goal-btn');

      await expect(page.locator('#goals-list')).toContainText('물 8잔 마시기');
      await expect(page.locator('#goals-list')).toContainText('0/8 잔');
    });

    test('목표 진행률 업데이트 기능', async ({ page }) => {
      // 목표 추가
      await page.fill('#goal-title', '운동하기');
      await page.fill('#goal-target', '5');
      await page.fill('#goal-unit', '회');
      await page.click('#add-goal-btn');

      // 진행률 업데이트 테스트 (prompt 처리 필요)
      page.on('dialog', dialog => {
        dialog.accept('3');
      });
      
      await page.click('.update-progress-btn');
      await expect(page.locator('#goals-list')).toContainText('3/5 회');
    });
  });

  test.describe('경비 관리 카드', () => {
    test.beforeEach(async ({ page }) => {
      // 경비 관리 카드 표시
      await page.click('#settings-icon');
      await page.click('[data-category="finance"]');
      await page.check('#toggle-expense-manager-card');
      await page.click('#settings-modal .close-button');
      await expect(page.locator('#expense-manager-card')).toBeVisible();
    });

    test('새 경비 추가 기능', async ({ page }) => {
      const today = new Date().toISOString().split('T')[0];
      
      await page.fill('#expense-date', today);
      await page.selectOption('#expense-category', '식비');
      await page.fill('#expense-amount', '12000');
      await page.fill('#expense-description', '점심 식사');
      await page.click('#add-expense-btn');

      await expect(page.locator('#expenses-list')).toContainText('점심 식사');
      await expect(page.locator('#expenses-list')).toContainText('12,000');
    });

    test('월간 경비 요약 기능', async ({ page }) => {
      // 여러 경비 추가
      const expenses = [
        { amount: '10000', description: '아침' },
        { amount: '15000', description: '점심' },
        { amount: '8000', description: '커피' }
      ];

      const today = new Date().toISOString().split('T')[0];

      for (const expense of expenses) {
        await page.fill('#expense-date', today);
        await page.selectOption('#expense-category', '식비');
        await page.fill('#expense-amount', expense.amount);
        await page.fill('#expense-description', expense.description);
        await page.click('#add-expense-btn');
      }

      // 총합이 표시되는지 확인 (33,000원)
      await expect(page.locator('#monthly-expense-summary')).toContainText('33,000');
    });
  });

  test.describe('급여 계산기 카드', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('#settings-icon');
      await page.click('[data-category="finance"]');
      await page.check('#toggle-salary-calculator-card');
      await page.click('#settings-modal .close-button');
      await expect(page.locator('#salary-calculator-card')).toBeVisible();
    });

    test('시급 계산 기능', async ({ page }) => {
      await page.selectOption('#salary-type', 'hourly');
      await page.fill('#salary-amount', '10000');
      await page.fill('#work-hours', '40');
      await page.click('#calculate-salary-btn');

      // 계산 결과가 표시되는지 확인
      await expect(page.locator('#gross-monthly')).not.toContainText('0원');
      await expect(page.locator('#net-monthly')).not.toContainText('0원');
    });

    test('월급 계산 기능', async ({ page }) => {
      await page.selectOption('#salary-type', 'monthly');
      await page.fill('#salary-amount', '3000000');
      await page.click('#calculate-salary-btn');

      await expect(page.locator('#gross-monthly')).toContainText('3,000,000');
      await expect(page.locator('#annual-salary')).toContainText('36,000,000');
    });
  });

  test.describe('비밀번호 생성기 카드', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('#settings-icon');
      await page.click('[data-category="tools"]');
      await page.check('#toggle-password-generator-card');
      await page.click('#settings-modal .close-button');
      await expect(page.locator('#password-generator-card')).toBeVisible();
    });

    test('비밀번호 생성 기능', async ({ page }) => {
      await page.fill('#password-length', '12');
      await page.check('#include-uppercase');
      await page.check('#include-lowercase');
      await page.check('#include-numbers');
      await page.click('#generate-password-btn');

      const password = await page.locator('#generated-password').inputValue();
      expect(password).toHaveLength(12);
      expect(password).toMatch(/[A-Z]/); // 대문자 포함
      expect(password).toMatch(/[a-z]/); // 소문자 포함
      expect(password).toMatch(/[0-9]/); // 숫자 포함
    });

    test('비밀번호 복사 기능', async ({ page }) => {
      await page.click('#generate-password-btn');
      
      // 복사 기능 테스트 (실제 클립보드 접근은 제한적이므로 버튼 클릭만 테스트)
      await page.click('#copy-password-btn');
      
      // 복사 완료 피드백 확인
      await expect(page.locator('#copy-password-btn')).toContainText('복사됨!');
    });
  });

  test.describe('학습 계획 카드', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('#settings-icon');
      await page.click('[data-category="growth"]');
      await page.check('#toggle-learning-plan-card');
      await page.click('#settings-modal .close-button');
      await expect(page.locator('#learning-plan-card')).toBeVisible();
    });

    test('학습 계획 추가 기능', async ({ page }) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];

      await page.fill('#learning-subject', 'JavaScript 심화 학습');
      await page.fill('#learning-target-date', tomorrowString);
      await page.selectOption('#learning-type', 'online');
      await page.fill('#learning-notes', '프로미스와 async/await 집중 학습');
      await page.click('#add-learning-btn');

      await expect(page.locator('#learning-list')).toContainText('JavaScript 심화 학습');
      await expect(page.locator('#learning-list')).toContainText('온라인 강의');
    });

    test('학습 완료 처리 기능', async ({ page }) => {
      // 학습 계획 추가
      const today = new Date().toISOString().split('T')[0];
      await page.fill('#learning-subject', '완료할 학습');
      await page.fill('#learning-target-date', today);
      await page.click('#add-learning-btn');

      // 완료 처리
      page.on('dialog', dialog => {
        expect(dialog.message()).toContain('완료 처리하시겠습니까?');
        dialog.accept();
      });
      
      await page.click('.complete-learning-btn');
      
      // 완료 표시 확인
      await expect(page.locator('.learning-item')).toHaveClass(/completed/);
    });
  });

  test.describe('팀 연락처 카드', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('#settings-icon');
      await page.click('[data-category="collaboration"]');
      await page.check('#toggle-team-contacts-card');
      await page.click('#settings-modal .close-button');
      await expect(page.locator('#team-contacts-card')).toBeVisible();
    });

    test('연락처 추가 기능', async ({ page }) => {
      await page.fill('#contact-name', '김개발');
      await page.fill('#contact-position', '프론트엔드 개발자');
      await page.fill('#contact-phone', '010-1234-5678');
      await page.fill('#contact-email', 'kim@example.com');
      await page.fill('#contact-department', '개발팀');
      await page.click('#add-contact-btn');

      await expect(page.locator('#contacts-list')).toContainText('김개발');
      await expect(page.locator('#contacts-list')).toContainText('프론트엔드 개발자');
      await expect(page.locator('#contacts-list')).toContainText('개발팀');
    });

    test('이메일 형식 검증', async ({ page }) => {
      await page.fill('#contact-name', '테스트');
      await page.fill('#contact-position', '테스트');
      await page.fill('#contact-phone', '010-1234-5678');
      await page.fill('#contact-email', '잘못된이메일');
      await page.fill('#contact-department', '테스트팀');
      
      page.on('dialog', dialog => {
        expect(dialog.message()).toContain('올바른 이메일 형식을 입력해주세요');
        dialog.accept();
      });
      
      await page.click('#add-contact-btn');
    });
  });
});