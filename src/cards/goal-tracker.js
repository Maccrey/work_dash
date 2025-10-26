// 일일 목표 추적기 카드 모듈
import { saveData, loadData, generateId } from '../core/utils.js';

// DOM 요소들
let goalForm, goalPeriod, goalTitle, goalTarget, goalUnit, addGoalBtn, goalsList;

// 목표 데이터
let goals = [];

// 목표 목록 렌더링
function renderGoals() {
    if (!goalsList) return;
    
    goalsList.innerHTML = '';
    goals.forEach((goal, index) => {
        const goalElement = document.createElement('div');
        goalElement.className = 'goal-item';
        goalElement.innerHTML = `
            <div class="goal-header">
                <h4>${goal.title}</h4>
                <span class="goal-period ${goal.period}">${getPeriodLabel(goal.period)}</span>
            </div>
            <div class="goal-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${getProgressPercentage(goal)}%"></div>
                </div>
                <span class="progress-text">${goal.current}/${goal.target} ${goal.unit}</span>
            </div>
            <div class="goal-actions">
                <button class="update-progress-btn" data-index="${index}">진행률 업데이트</button>
                <button class="delete-goal-btn" data-index="${index}">삭제</button>
            </div>
        `;
        goalsList.appendChild(goalElement);
    });
}

// 기간 라벨 가져오기
function getPeriodLabel(period) {
    const labels = {
        'daily': '일일',
        'weekly': '주간',
        'monthly': '월간'
    };
    return labels[period] || period;
}

// 진행률 계산
function getProgressPercentage(goal) {
    return Math.min(100, Math.round((goal.current / goal.target) * 100));
}

// 새 목표 추가
function addGoal() {
    const titleValue = goalTitle.value.trim();
    const targetValue = parseInt(goalTarget.value);
    const unitValue = goalUnit.value.trim();
    const periodValue = goalPeriod.value;

    if (!titleValue || !targetValue || !unitValue) {
        alert('모든 필드를 입력해주세요.');
        return;
    }

    const newGoal = {
        id: generateId(),
        title: titleValue,
        target: targetValue,
        unit: unitValue,
        period: periodValue,
        current: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    goals.push(newGoal);
    saveData('goals', goals);
    renderGoals();

    // 폼 리셋
    goalTitle.value = '';
    goalTarget.value = '';
    goalUnit.value = '';
}

// 진행률 업데이트
function updateProgress(index) {
    const goal = goals[index];
    if (!goal) return;

    const newProgress = prompt(`현재 진행률을 입력하세요 (0-${goal.target}):`, goal.current);
    if (newProgress === null) return;

    const progressValue = parseInt(newProgress);
    if (isNaN(progressValue) || progressValue < 0 || progressValue > goal.target) {
        alert('올바른 숫자를 입력해주세요.');
        return;
    }

    goal.current = progressValue;
    goal.updatedAt = new Date().toISOString();
    saveData('goals', goals);
    renderGoals();

    // 목표 달성 알림
    if (progressValue >= goal.target) {
        alert(`축하합니다! "${goal.title}" 목표를 달성했습니다! 🎉`);
    }
}

// 목표 삭제
function deleteGoal(index) {
    if (confirm('이 목표를 삭제하시겠습니까?')) {
        goals.splice(index, 1);
        saveData('goals', goals);
        renderGoals();
    }
}

// 목표 추가 버튼 클릭 처리
function handleAddGoal(e) {
    e.preventDefault();
    addGoal();
}

// 목표 액션 버튼 클릭 처리
function handleGoalAction(e) {
    if (e.target.classList.contains('update-progress-btn')) {
        const index = parseInt(e.target.dataset.index);
        updateProgress(index);
    } else if (e.target.classList.contains('delete-goal-btn')) {
        const index = parseInt(e.target.dataset.index);
        deleteGoal(index);
    }
}

// 일일 목표 추적기 카드 초기화
export function initGoalTrackerCard() {
    // DOM 요소 가져오기
    goalPeriod = document.getElementById('goal-period');
    goalTitle = document.getElementById('goal-title');
    goalTarget = document.getElementById('goal-target');
    goalUnit = document.getElementById('goal-unit');
    addGoalBtn = document.getElementById('add-goal-btn');
    goalsList = document.getElementById('goals-list');

    if (!goalPeriod || !goalTitle || !goalTarget || !goalUnit || !addGoalBtn || !goalsList) {
        console.error('Goal tracker card elements not found');
        return;
    }

    // 데이터 로드
    goals = loadData('goals') || [];

    // 이벤트 리스너 등록
    addGoalBtn.addEventListener('click', handleAddGoal);
    goalsList.addEventListener('click', handleGoalAction);

    // 초기 목표 목록 렌더링
    renderGoals();
}

// 일일 목표 추적기 카드 정리
export function cleanupGoalTrackerCard() {
    if (addGoalBtn) addGoalBtn.removeEventListener('click', handleAddGoal);
    if (goalsList) goalsList.removeEventListener('click', handleGoalAction);
}

// 외부에서 사용할 수 있는 함수들 내보내기
export { renderGoals, addGoal, updateProgress, deleteGoal };