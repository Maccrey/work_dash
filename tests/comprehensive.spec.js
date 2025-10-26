// 전체 기능 종합 테스트
import { test, expect } from '@playwright/test';

test.describe('업무 대시보드 종합 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // localStorage 초기화
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('전체 페이지 로드 및 기본 구조 테스트', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page).toHaveTitle('업무 대시보드');

    // 헤더 확인
    const header = page.locator('.header-container h1');
    await expect(header).toBeVisible();
    await expect(header).toHaveText('업무 대시보드');

    // 설정 아이콘 확인
    await expect(page.locator('#settings-icon')).toBeVisible();

    // 메인 컨테이너 확인
    await expect(page.locator('.main-container')).toBeVisible();
  });

  test('모든 기본 카드 표시 테스트', async ({ page }) => {
    const basicCards = [
      { id: '#weather-card', name: '날씨 알리미' },
      { id: '#tts-notifier-card', name: 'TTS 알리미' },
      { id: '#notes-card', name: '메모장' },
      { id: '#voice-memo-card', name: '음성 메모' },
      { id: '#pomodoro-card', name: '뽀모도로 타이머' },
      { id: '#todo-card', name: '할 일' },
      { id: '#calculator-card', name: '계산기' },
      { id: '#attendance-card', name: '출퇴근부' },
      { id: '#attendance-summary-card', name: '월간 출퇴근 요약' }
    ];

    for (const card of basicCards) {
      const element = page.locator(card.id);
      await expect(element).toBeVisible();
    }
  });

  test('설정 모달 전체 기능 테스트', async ({ page }) => {
    // 설정 아이콘 클릭
    await page.click('#settings-icon');

    // 모달 표시 확인
    const modal = page.locator('#settings-modal');
    await expect(modal).toBeVisible();

    // 모든 카테고리 헤더 확인
    const categories = [
      'basic', 'data', 'finance', 'planning',
      'collaboration', 'growth', 'tools'
    ];

    for (const category of categories) {
      await expect(page.locator(`[data-category="${category}"]`)).toBeVisible();
    }

    // 닫기 버튼으로 모달 닫기
    await page.click('#settings-modal .close-button');
    await expect(modal).toBeHidden();
  });

  test('카테고리 접기/펴기 기능 테스트', async ({ page }) => {
    await page.click('#settings-icon');

    // 데이터 관리 카테고리 테스트
    const dataCategory = page.locator('[data-category="data"]');
    const dataControls = page.locator('#category-data');

    // 초기 상태는 접혀있음
    await expect(dataControls).toHaveClass(/collapsed/);

    // 클릭해서 펴기
    await dataCategory.click();
    await expect(dataControls).not.toHaveClass(/collapsed/);

    // 다시 클릭해서 접기
    await dataCategory.click();
    await expect(dataControls).toHaveClass(/collapsed/);
  });

  test('메모장 전체 기능 테스트', async ({ page }) => {
    const testNotes = [
      '첫 번째 메모',
      '두 번째 메모',
      '세 번째 메모'
    ];

    // 메모 추가
    for (const note of testNotes) {
      await page.fill('#note-input', note);
      await page.click('#note-form button[type="submit"]');
      await expect(page.locator('#note-list')).toContainText(note);
    }

    // 메모 개수 확인
    const noteItems = await page.locator('#note-list li').count();
    expect(noteItems).toBe(3);

    // 메모 삭제 (첫 번째 삭제 버튼 클릭)
    page.on('dialog', dialog => dialog.accept());
    await page.click('.delete-note-btn');

    const remainingNotes = await page.locator('#note-list li').count();
    expect(remainingNotes).toBe(2);
  });

  test('계산기 기본 연산 테스트', async ({ page }) => {
    const display = page.locator('#calculator-display');

    // 초기값 확인
    await expect(display).toHaveText('0');

    // 덧셈 테스트: 7 + 3 = 10
    await page.click('.calculator-button:has-text("7")');
    await page.click('.calculator-button.operator:has-text("+")');
    await page.click('.calculator-button:has-text("3")');
    await page.click('.calculator-button.equals');
    await expect(display).toHaveText('10');

    // 클리어
    await page.click('.calculator-button.clear');
    await expect(display).toHaveText('0');

    // 곱셈 테스트: 5 × 4 = 20
    await page.click('.calculator-button:has-text("5")');
    await page.click('.calculator-button.operator:has-text("×")');
    await page.click('.calculator-button:has-text("4")');
    await page.click('.calculator-button.equals');
    await expect(display).toHaveText('20');
  });

  test('할 일 추가 및 완료 테스트', async ({ page }) => {
    const testTodo = {
      time: '14:30',
      text: '회의 참석',
      priority: 'high'
    };

    // 할 일 추가
    await page.fill('#todo-time', testTodo.time);
    await page.fill('#todo-text', testTodo.text);
    await page.selectOption('#todo-priority', testTodo.priority);
    await page.click('#todo-form button[type="submit"]');

    // 할 일 목록에 추가되었는지 확인
    const todoList = page.locator('#todo-list');
    await expect(todoList).toContainText(testTodo.time);
    await expect(todoList).toContainText(testTodo.text);

    // 할 일 완료 처리 (complete-btn 클래스 사용)
    await page.click('.complete-btn');

    // 완료 목록으로 이동했는지 확인
    const doneList = page.locator('#done-list');
    await expect(doneList).toContainText(testTodo.text);
  });

  test('날짜 탐색 기능 테스트', async ({ page }) => {
    const currentDateElement = page.locator('#current-todo-date');
    const initialDate = await currentDateElement.textContent();

    // 다음 날짜로 이동
    await page.click('#next-date-btn');
    const nextDate = await currentDateElement.textContent();
    expect(nextDate).not.toBe(initialDate);

    // 이전 날짜로 이동
    await page.click('#prev-date-btn');
    const prevDate = await currentDateElement.textContent();
    expect(prevDate).toBe(initialDate);
  });

  test('TTS 스케줄 추가 테스트', async ({ page }) => {
    const schedule = {
      time: '15:00',
      text: '휴식 시간입니다'
    };

    // TTS 스케줄 추가
    await page.fill('#tts-time-input', schedule.time);
    await page.fill('#tts-text-input', schedule.text);
    await page.click('#add-tts-schedule-btn');

    // 스케줄 목록에 추가되었는지 확인
    const scheduleList = page.locator('#tts-schedule-list');
    await expect(scheduleList).toContainText(schedule.time);
    await expect(scheduleList).toContainText(schedule.text);
  });

  test('카드 표시/숨김 기능 테스트', async ({ page }) => {
    // 설정 열기
    await page.click('#settings-icon');

    // 메모장 카드 숨기기
    await page.uncheck('#toggle-notes-card');
    await page.click('#settings-modal .close-button');
    await expect(page.locator('#notes-card')).toBeHidden();

    // 다시 표시
    await page.click('#settings-icon');
    await page.check('#toggle-notes-card');
    await page.click('#settings-modal .close-button');
    await expect(page.locator('#notes-card')).toBeVisible();
  });

  test('새 카드 활성화 테스트', async ({ page }) => {
    // 북마크 관리 카드는 기본적으로 숨겨져 있음
    await expect(page.locator('#bookmark-manager-card')).toBeHidden();

    // 설정에서 활성화
    await page.click('#settings-icon');

    // 도구 카테고리 클릭 (collapsed 상태이므로 펼치기)
    const toolsCategory = page.locator('[data-category="tools"]');
    await toolsCategory.click();

    // 잠시 대기 (애니메이션)
    await page.waitForTimeout(300);

    // 체크박스 활성화
    await page.check('#toggle-bookmark-manager-card');

    // 모달 닫기
    await page.click('#settings-modal .close-button');

    // 카드가 표시되는지 확인
    await expect(page.locator('#bookmark-manager-card')).toBeVisible();
  });

  test('localStorage 데이터 지속성 테스트', async ({ page }) => {
    const testNote = '지속성 테스트 메모';

    // 메모 추가
    await page.fill('#note-input', testNote);
    await page.click('#note-form button[type="submit"]');
    await expect(page.locator('#note-list')).toContainText(testNote);

    // 페이지 새로고침
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 메모가 유지되는지 확인
    await expect(page.locator('#note-list')).toContainText(testNote);
  });

  test('출퇴근 기능 테스트', async ({ page }) => {
    // 출근 버튼 존재 확인
    await expect(page.locator('#check-in-btn')).toBeVisible();
    await expect(page.locator('#check-out-btn')).toBeVisible();

    // 주간 현황 테이블이 존재하는지 확인
    const attendanceTable = page.locator('#daily-attendance-table');
    await expect(attendanceTable).toBeVisible();

    // 출근 버튼 클릭
    await page.click('#check-in-btn');

    // 잠시 대기 (DOM 업데이트)
    await page.waitForTimeout(500);

    // 퇴근 버튼 클릭
    await page.click('#check-out-btn');

    // 잠시 대기 (DOM 업데이트)
    await page.waitForTimeout(500);
  });

  test('뽀모도로 타이머 설정 테스트', async ({ page }) => {
    const workTime = '30';
    const breakTime = '10';

    // 타이머 설정
    await page.fill('#work-time', workTime);
    await page.fill('#break-time', breakTime);
    await page.click('#set-pomo-time');

    // 디지털 타이머 표시 확인
    const timerDisplay = page.locator('#pomodoro-digital-timer');
    await expect(timerDisplay).toContainText('30:00');
  });

  test('다중 카드 동시 숨기기 테스트', async ({ page }) => {
    await page.click('#settings-icon');

    const cardsToHide = [
      '#toggle-weather-card',
      '#toggle-calculator-card',
      '#toggle-voice-memo-card'
    ];

    for (const checkbox of cardsToHide) {
      await page.uncheck(checkbox);
    }

    await page.click('#settings-modal .close-button');

    // 모든 카드가 숨겨졌는지 확인
    await expect(page.locator('#weather-card')).toBeHidden();
    await expect(page.locator('#calculator-card')).toBeHidden();
    await expect(page.locator('#voice-memo-card')).toBeHidden();
  });

  test('카드 설정 localStorage 지속성 테스트', async ({ page }) => {
    // 설정 변경
    await page.click('#settings-icon');
    await page.uncheck('#toggle-pomodoro-card');
    await page.click('#settings-modal .close-button');

    // 카드가 숨겨졌는지 확인
    await expect(page.locator('#pomodoro-card')).toBeHidden();

    // 페이지 새로고침
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 설정이 유지되는지 확인
    await expect(page.locator('#pomodoro-card')).toBeHidden();

    // 설정 모달에서도 체크 해제 상태 유지 확인
    await page.click('#settings-icon');
    await expect(page.locator('#toggle-pomodoro-card')).not.toBeChecked();
  });

  test('TTS 토글 기능 테스트', async ({ page }) => {
    const ttsToggle = page.locator('#tts-toggle');

    // 초기 상태 확인 (체크됨)
    await expect(ttsToggle).toBeChecked();

    // 토글 해제
    await ttsToggle.uncheck();
    await expect(ttsToggle).not.toBeChecked();

    // 다시 토글
    await ttsToggle.check();
    await expect(ttsToggle).toBeChecked();
  });

  test('Todo TTS 토글 기능 테스트', async ({ page }) => {
    const todoTtsToggle = page.locator('#todo-tts-toggle');

    // 초기 상태 확인 (체크됨)
    await expect(todoTtsToggle).toBeChecked();

    // 토글 해제
    await todoTtsToggle.uncheck();
    await expect(todoTtsToggle).not.toBeChecked();

    // 다시 토글
    await todoTtsToggle.check();
    await expect(todoTtsToggle).toBeChecked();
  });

  test('월간 출퇴근 요약 표시 테스트', async ({ page }) => {
    const summaryCard = page.locator('#attendance-summary-card');
    await expect(summaryCard).toBeVisible();

    // 요약 정보 요소들 확인
    await expect(page.locator('#monthly-total-days')).toBeVisible();
    await expect(page.locator('#monthly-late-count')).toBeVisible();
    await expect(page.locator('#monthly-early-count')).toBeVisible();
    await expect(page.locator('#monthly-sick-count')).toBeVisible();
    await expect(page.locator('#monthly-absent-count')).toBeVisible();
  });

  test('월 현황 버튼 및 캘린더 테스트', async ({ page }) => {
    // 월 현황 버튼이 존재하는지 확인
    const showMonthlyBtn = page.locator('#show-monthly-view-btn');
    await expect(showMonthlyBtn).toBeVisible();

    // 캘린더가 초기에는 숨겨져 있는지 확인
    const calendar = page.locator('#monthly-calendar-view');
    await expect(calendar).toBeHidden();

    // 월 현황 버튼 클릭
    await showMonthlyBtn.click();

    // 캘린더가 표시되는지 확인
    await expect(calendar).toBeVisible();

    // 캘린더 요소들 확인
    await expect(page.locator('#current-month-year')).toBeVisible();
    await expect(page.locator('#prev-month-btn')).toBeVisible();
    await expect(page.locator('#next-month-btn')).toBeVisible();
    await expect(page.locator('#calendar-grid')).toBeVisible();
  });

  test('모든 데이터 삭제 기능 테스트', async ({ page }) => {
    // 테스트 데이터 추가
    await page.fill('#note-input', '삭제될 메모');
    await page.click('#note-form button[type="submit"]');

    await page.fill('#todo-time', '10:00');
    await page.fill('#todo-text', '삭제될 할 일');
    await page.click('#todo-form button[type="submit"]');

    // 데이터가 추가되었는지 확인
    await expect(page.locator('#note-list')).toContainText('삭제될 메모');
    await expect(page.locator('#todo-list')).toContainText('삭제될 할 일');

    // 설정 모달 열기
    await page.click('#settings-icon');

    // 다이얼로그 처리 - 순서대로 처리
    let dialogCount = 0;
    page.on('dialog', async dialog => {
      if (dialogCount === 0) {
        expect(dialog.message()).toContain('정말로 모든 데이터를 삭제하시겠습니까?');
      }
      await dialog.accept();
      dialogCount++;
    });

    // 모든 데이터 삭제 버튼 클릭
    await page.click('#clear-all-data-btn');

    // 다이얼로그 처리 대기
    await page.waitForTimeout(1000);

    // 데이터가 삭제되었는지 확인
    const noteList = page.locator('#note-list li');
    const noteCount = await noteList.count();
    expect(noteCount).toBe(0);
  });

  test('뽀모도로 시작/일시정지 버튼 테스트', async ({ page }) => {
    const startPauseBtn = page.locator('#pomo-start-pause');

    // 초기 버튼 텍스트 확인
    await expect(startPauseBtn).toContainText('시작');

    // 시작 버튼 클릭
    await startPauseBtn.click();
    await expect(startPauseBtn).toContainText('일시정지');

    // 일시정지 버튼 클릭
    await startPauseBtn.click();
    await expect(startPauseBtn).toContainText('재개');
  });

  test('뽀모도로 리셋 버튼 테스트', async ({ page }) => {
    const startPauseBtn = page.locator('#pomo-start-pause');
    const resetBtn = page.locator('#pomo-reset');
    const timerDisplay = page.locator('#pomodoro-digital-timer');

    // 타이머 시작
    await startPauseBtn.click();

    // 잠시 대기
    await page.waitForTimeout(1000);

    // 리셋 버튼 클릭
    await resetBtn.click();

    // 타이머가 초기값으로 돌아갔는지 확인
    await expect(timerDisplay).toContainText('25:00');
    await expect(startPauseBtn).toContainText('시작');
  });

  test('상태 적용 버튼 테스트 (출퇴근)', async ({ page }) => {
    // 상태 선택
    await page.selectOption('#status-select', '월차');

    // 상태 적용 버튼 클릭
    await page.click('#apply-status-btn');

    // 주간 현황에 월차가 표시되는지 확인
    await expect(page.locator('#daily-attendance-table')).toContainText('월차');
  });
});
