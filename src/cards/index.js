// 모든 카드 모듈들을 등록하는 메인 파일
import { registerCard, CardCategories } from '../core/card-manager.js';

// 기본 카드들 import
import { initWeatherCard, cleanupWeatherCard } from './weather.js';
import { initNotesCard, cleanupNotesCard } from './notes.js';
import { initCalculatorCard, cleanupCalculatorCard } from './calculator.js';
import { initTodoCard, cleanupTodoCard } from './todo.js';
import { initPomodoroCard, cleanupPomodoroCard } from './pomodoro.js';
import { initVoiceMemoCard, cleanupVoiceMemoCard } from './voice-memo.js';
import { initAttendanceCard, cleanupAttendanceCard } from './attendance.js';
import { initTtsCard, cleanupTtsCard } from './tts.js';

// 새 카드들 import
import { initGoalTrackerCard, cleanupGoalTrackerCard } from './goal-tracker.js';
import { initTimeAnalysisCard, cleanupTimeAnalysisCard } from './time-analysis.js';
import { initProductivityMetricsCard, cleanupProductivityMetricsCard } from './productivity-metrics.js';
import { initProjectManagementCard, cleanupProjectManagementCard } from './project-management.js';
import { initExpenseManagerCard, cleanupExpenseManagerCard } from './expense-manager.js';
import { initSalaryCalculatorCard, cleanupSalaryCalculatorCard } from './salary-calculator.js';
import { initBudgetTrackerCard, cleanupBudgetTrackerCard } from './budget-tracker.js';
import { initMeetingManagerCard, cleanupMeetingManagerCard } from './meeting-manager.js';
import { initDeadlineTrackerCard, cleanupDeadlineTrackerCard } from './deadline-tracker.js';
import { initTaskTemplateCard, cleanupTaskTemplateCard } from './task-template.js';
import { initLeaveManagerCard, cleanupLeaveManagerCard } from './leave-manager.js';
import { initTeamContactsCard, cleanupTeamContactsCard } from './team-contacts.js';
import { initFeedbackCollectorCard, cleanupFeedbackCollectorCard } from './feedback-collector.js';
import { initHandoverManagerCard, cleanupHandoverManagerCard } from './handover-manager.js';
import { initLearningPlanCard, cleanupLearningPlanCard } from './learning-plan.js';
import { initSkillMatrixCard, cleanupSkillMatrixCard } from './skill-matrix.js';
import { initReadingListCard, cleanupReadingListCard } from './reading-list.js';
import { initBookmarkManagerCard, cleanupBookmarkManagerCard } from './bookmark-manager.js';
import { initPasswordGeneratorCard, cleanupPasswordGeneratorCard } from './password-generator.js';
import { initQrGeneratorCard, cleanupQrGeneratorCard } from './qr-generator.js';
import { initUnitConverterCard, cleanupUnitConverterCard } from './unit-converter.js';

// 모든 카드 등록
export function registerAllCards() {
    console.log('카드 등록 시작...');

    // 기본 기능 카드들
    registerCard('weather-card', '날씨 알리미', CardCategories.BASIC, '🌤️', initWeatherCard, cleanupWeatherCard);
    registerCard('tts-notifier-card', 'TTS 알리미', CardCategories.BASIC, '🔊', initTtsCard, cleanupTtsCard);
    registerCard('notes-card', '메모장', CardCategories.BASIC, '📝', initNotesCard, cleanupNotesCard);
    registerCard('voice-memo-card', '음성 메모', CardCategories.BASIC, '🎤', initVoiceMemoCard, cleanupVoiceMemoCard);
    registerCard('pomodoro-card', '뽀모도로 타이머', CardCategories.BASIC, '🍅', initPomodoroCard, cleanupPomodoroCard);
    registerCard('todo-card', '오늘의 할 일', CardCategories.BASIC, '✅', initTodoCard, cleanupTodoCard);
    registerCard('attendance-card', '출퇴근부', CardCategories.BASIC, '📋', initAttendanceCard, cleanupAttendanceCard);
    registerCard('attendance-summary-card', '월간 출퇴근 요약', CardCategories.BASIC, '📊', 
        () => { /* attendance.js에서 처리 */ }, () => {});
    registerCard('calculator-card', '계산기', CardCategories.BASIC, '🔢', initCalculatorCard, cleanupCalculatorCard);

    // 데이터 관리 및 분석 카드들
    registerCard('goal-tracker-card', '일일 목표 추적기', CardCategories.DATA, '📊', initGoalTrackerCard, cleanupGoalTrackerCard);
    registerCard('time-analysis-card', '업무 시간 분석', CardCategories.DATA, '⏱️', initTimeAnalysisCard, cleanupTimeAnalysisCard);
    registerCard('productivity-metrics-card', '생산성 지표', CardCategories.DATA, '📈', initProductivityMetricsCard, cleanupProductivityMetricsCard);
    registerCard('project-management-card', '프로젝트 관리', CardCategories.DATA, '📋', initProjectManagementCard, cleanupProjectManagementCard);

    // 재무 및 비용 관리 카드들
    registerCard('expense-manager-card', '경비 관리', CardCategories.FINANCE, '💰', initExpenseManagerCard, cleanupExpenseManagerCard);
    registerCard('salary-calculator-card', '급여 계산기', CardCategories.FINANCE, '💵', initSalaryCalculatorCard, cleanupSalaryCalculatorCard);
    registerCard('budget-tracker-card', '예산 추적', CardCategories.FINANCE, '📊', initBudgetTrackerCard, cleanupBudgetTrackerCard);

    // 업무 조직 및 계획 카드들
    registerCard('meeting-manager-card', '회의 일정 관리', CardCategories.PLANNING, '📅', initMeetingManagerCard, cleanupMeetingManagerCard);
    registerCard('deadline-tracker-card', '마감일 추적기', CardCategories.PLANNING, '⏰', initDeadlineTrackerCard, cleanupDeadlineTrackerCard);
    registerCard('task-template-card', '업무 템플릿', CardCategories.PLANNING, '📋', initTaskTemplateCard, cleanupTaskTemplateCard);
    registerCard('leave-manager-card', '연차/휴가 관리', CardCategories.PLANNING, '🏖️', initLeaveManagerCard, cleanupLeaveManagerCard);

    // 협업 및 소통 카드들
    registerCard('team-contacts-card', '팀 연락처', CardCategories.COLLABORATION, '👥', initTeamContactsCard, cleanupTeamContactsCard);
    registerCard('feedback-collector-card', '피드백 수집', CardCategories.COLLABORATION, '💬', initFeedbackCollectorCard, cleanupFeedbackCollectorCard);
    registerCard('handover-manager-card', '업무 인수인계', CardCategories.COLLABORATION, '🔄', initHandoverManagerCard, cleanupHandoverManagerCard);

    // 성장 및 학습 카드들
    registerCard('learning-plan-card', '학습 계획', CardCategories.GROWTH, '📚', initLearningPlanCard, cleanupLearningPlanCard);
    registerCard('skill-matrix-card', '스킬 매트릭스', CardCategories.GROWTH, '🎯', initSkillMatrixCard, cleanupSkillMatrixCard);
    registerCard('reading-list-card', '독서 목록', CardCategories.GROWTH, '📖', initReadingListCard, cleanupReadingListCard);

    // 도구 및 유틸리티 카드들
    registerCard('bookmark-manager-card', '북마크 관리', CardCategories.TOOLS, '🔖', initBookmarkManagerCard, cleanupBookmarkManagerCard);
    registerCard('password-generator-card', '비밀번호 생성기', CardCategories.TOOLS, '🔐', initPasswordGeneratorCard, cleanupPasswordGeneratorCard);
    registerCard('qr-generator-card', 'QR코드 생성기', CardCategories.TOOLS, '📱', initQrGeneratorCard, cleanupQrGeneratorCard);
    registerCard('unit-converter-card', '단위 변환기', CardCategories.TOOLS, '🔄', initUnitConverterCard, cleanupUnitConverterCard);

    console.log('카드 등록 완료');
}