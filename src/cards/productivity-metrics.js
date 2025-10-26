// 생산성 지표 카드 모듈
import { saveData, loadData, generateId } from '../core/utils.js';
import { todos } from '../core/state.js';

// DOM 요소들
let todayCompletionRate, weekAvgCompletion, focusTimeToday;
let startFocusSessionBtn, logAchievementBtn, achievementsLog;

// 생산성 데이터
let productivityData = {
    focusSessions: [],
    achievements: [],
    dailyStats: {}
};

let currentFocusSession = null;
let focusStartTime = null;

// 생산성 지표 업데이트
function updateProductivityMetrics() {
    updateTodayCompletionRate();
    updateWeeklyAverage();
    updateFocusTime();
    renderAchievements();
}

// 오늘 완료율 계산
function updateTodayCompletionRate() {
    if (!todayCompletionRate) return;

    const today = new Date().toDateString();
    const todayTodos = todos.filter(todo => 
        new Date(todo.date || new Date()).toDateString() === today
    );

    if (todayTodos.length === 0) {
        todayCompletionRate.textContent = '0%';
        return;
    }

    const completedTodos = todayTodos.filter(todo => todo.completed);
    const completionRate = Math.round((completedTodos.length / todayTodos.length) * 100);
    
    todayCompletionRate.textContent = `${completionRate}%`;
    
    // 색상 변경
    if (completionRate >= 80) {
        todayCompletionRate.style.color = '#28a745';
    } else if (completionRate >= 50) {
        todayCompletionRate.style.color = '#ffc107';
    } else {
        todayCompletionRate.style.color = '#dc3545';
    }
}

// 주간 평균 계산
function updateWeeklyAverage() {
    if (!weekAvgCompletion) return;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyStats = Object.entries(productivityData.dailyStats)
        .filter(([date]) => new Date(date) >= oneWeekAgo)
        .map(([, stats]) => stats.completionRate)
        .filter(rate => rate !== undefined);

    if (weeklyStats.length === 0) {
        weekAvgCompletion.textContent = '0%';
        return;
    }

    const average = Math.round(weeklyStats.reduce((sum, rate) => sum + rate, 0) / weeklyStats.length);
    weekAvgCompletion.textContent = `${average}%`;
}

// 집중 시간 업데이트
function updateFocusTime() {
    if (!focusTimeToday) return;

    const today = new Date().toDateString();
    const todayFocus = productivityData.focusSessions
        .filter(session => new Date(session.date).toDateString() === today)
        .reduce((total, session) => total + session.duration, 0);

    const hours = Math.floor(todayFocus / 60);
    const minutes = todayFocus % 60;
    focusTimeToday.textContent = `${hours}시간 ${minutes}분`;
}

// 성과 목록 렌더링
function renderAchievements() {
    if (!achievementsLog) return;

    const recentAchievements = productivityData.achievements
        .slice(-10)
        .reverse();

    achievementsLog.innerHTML = '';
    recentAchievements.forEach(achievement => {
        const achievementElement = document.createElement('div');
        achievementElement.className = 'achievement-item';
        achievementElement.innerHTML = `
            <div class="achievement-content">${achievement.content}</div>
            <div class="achievement-time">${formatDate(new Date(achievement.date))}</div>
        `;
        achievementsLog.appendChild(achievementElement);
    });
}

// 집중 세션 시작/종료
function toggleFocusSession() {
    if (currentFocusSession) {
        // 집중 세션 종료
        const endTime = new Date();
        const duration = Math.floor((endTime - focusStartTime) / (1000 * 60)); // 분 단위

        if (duration > 0) {
            productivityData.focusSessions.push({
                id: generateId(),
                startTime: focusStartTime.toISOString(),
                endTime: endTime.toISOString(),
                duration: duration,
                date: new Date().toISOString()
            });

            // 성과 자동 기록
            if (duration >= 25) {
                logAchievement(`${duration}분 집중 세션 완료! 🎯`);
            }
        }

        currentFocusSession = null;
        focusStartTime = null;
        startFocusSessionBtn.textContent = '집중 세션 시작';
        startFocusSessionBtn.classList.remove('active');

    } else {
        // 집중 세션 시작
        currentFocusSession = generateId();
        focusStartTime = new Date();
        startFocusSessionBtn.textContent = '집중 세션 종료';
        startFocusSessionBtn.classList.add('active');
    }

    saveData('productivityData', productivityData);
    updateProductivityMetrics();
}

// 성과 기록
function logAchievement(content = null) {
    const achievementContent = content || prompt('달성한 성과를 입력하세요:');
    if (!achievementContent || !achievementContent.trim()) return;

    const newAchievement = {
        id: generateId(),
        content: achievementContent.trim(),
        date: new Date().toISOString()
    };

    productivityData.achievements.push(newAchievement);
    saveData('productivityData', productivityData);
    renderAchievements();
}

// 일일 통계 업데이트
function updateDailyStats() {
    const today = new Date().toDateString();
    const todayTodos = todos.filter(todo => 
        new Date(todo.date || new Date()).toDateString() === today
    );

    if (todayTodos.length > 0) {
        const completedTodos = todayTodos.filter(todo => todo.completed);
        const completionRate = Math.round((completedTodos.length / todayTodos.length) * 100);
        
        productivityData.dailyStats[today] = {
            totalTodos: todayTodos.length,
            completedTodos: completedTodos.length,
            completionRate: completionRate,
            date: new Date().toISOString()
        };

        saveData('productivityData', productivityData);
    }
}

// 날짜 포맷팅
function formatDate(date) {
    return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 집중 세션 버튼 클릭 처리
function handleFocusSession(e) {
    e.preventDefault();
    toggleFocusSession();
}

// 성과 기록 버튼 클릭 처리
function handleLogAchievement(e) {
    e.preventDefault();
    logAchievement();
}

// 생산성 지표 카드 초기화
export function initProductivityMetricsCard() {
    todayCompletionRate = document.getElementById('today-completion-rate');
    weekAvgCompletion = document.getElementById('week-avg-completion');
    focusTimeToday = document.getElementById('focus-time-today');
    startFocusSessionBtn = document.getElementById('start-focus-session');
    logAchievementBtn = document.getElementById('log-achievement');
    achievementsLog = document.getElementById('achievements-log');

    if (!todayCompletionRate || !startFocusSessionBtn) {
        console.error('Productivity metrics card elements not found');
        return;
    }

    // 데이터 로드
    productivityData = loadData('productivityData') || {
        focusSessions: [],
        achievements: [],
        dailyStats: {}
    };

    // 이벤트 리스너 등록
    startFocusSessionBtn.addEventListener('click', handleFocusSession);
    if (logAchievementBtn) {
        logAchievementBtn.addEventListener('click', handleLogAchievement);
    }

    // 초기 업데이트
    updateProductivityMetrics();
    updateDailyStats();

    // 주기적으로 업데이트 (1분마다)
    setInterval(() => {
        updateProductivityMetrics();
        updateDailyStats();
    }, 60000);
}

// 생산성 지표 카드 정리
export function cleanupProductivityMetricsCard() {
    if (startFocusSessionBtn) startFocusSessionBtn.removeEventListener('click', handleFocusSession);
    if (logAchievementBtn) logAchievementBtn.removeEventListener('click', handleLogAchievement);
}

export { updateProductivityMetrics, toggleFocusSession, logAchievement };