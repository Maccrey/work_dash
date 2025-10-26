// 뽀모도로 카드 모듈
import { 
    pomoInterval,
    pomoTimeLeft,
    updatePomoTimeLeft,
    isPomoRunning,
    updatePomoRunning,
    isPomoWorkSession,
    updatePomoWorkSession,
    workDuration,
    breakDuration,
    updatePomoDurations
} from '../core/state.js';
import { formatTime, speak } from '../core/utils.js';

// DOM 요소들
let pomoTimerElem, pomoStatusElem, pomoStartPauseBtn, pomoResetBtn;
let pomoVisualTimerElem, pomoDigitalTimerElem;
let workTimeInput, breakTimeInput, setPomoTimeBtn;

// 타이머 간격 ID (모듈에서 관리)
let currentPomoInterval = null;

// 뽀모도로 타이머 UI 업데이트
function updatePomoTimer() {
    pomoDigitalTimerElem.textContent = formatTime(pomoTimeLeft);
    const totalTime = (isPomoWorkSession ? workDuration : breakDuration) * 60;
    const percentage = (pomoTimeLeft / totalTime) * 100;
    pomoVisualTimerElem.style.background = `conic-gradient(red ${percentage}%, #eee ${percentage}% 100%)`;
}

// 뽀모도로 타이머 시작
function startPomo() {
    if (isPomoRunning) return;
    
    updatePomoRunning(true);
    pomoStartPauseBtn.textContent = '일시정지';
    
    currentPomoInterval = setInterval(() => {
        const newTimeLeft = pomoTimeLeft - 1;
        updatePomoTimeLeft(newTimeLeft);
        updatePomoTimer();
        
        if (newTimeLeft < 0) {
            clearInterval(currentPomoInterval);
            currentPomoInterval = null;
            
            // 세션 전환
            const newWorkSession = !isPomoWorkSession;
            updatePomoWorkSession(newWorkSession);
            
            const newTime = (newWorkSession ? workDuration : breakDuration) * 60;
            updatePomoTimeLeft(newTime);
            
            const message = newWorkSession 
                ? "휴식 끝, 집중할 시간입니다!" 
                : "집중 시간이 끝났습니다. 5분간 휴식하세요.";
            const statusMessage = message.split(', ')[1] || (newWorkSession ? "집중할 시간!" : "휴식 시간!");
            
            pomoStatusElem.textContent = statusMessage;
            speak(message);
            updatePomoTimer();
            pomoStartPauseBtn.textContent = '시작';
            updatePomoRunning(false);
        }
    }, 1000);
}

// 뽀모도로 타이머 일시정지
function pausePomo() {
    updatePomoRunning(false);
    pomoStartPauseBtn.textContent = '재개';
    if (currentPomoInterval) {
        clearInterval(currentPomoInterval);
        currentPomoInterval = null;
    }
}

// 뽀모도로 타이머 리셋
function resetPomo() {
    pausePomo();
    updatePomoWorkSession(true);
    updatePomoTimeLeft(workDuration * 60);
    pomoStatusElem.textContent = "집중할 시간!";
    pomoStartPauseBtn.textContent = '시작';
    updatePomoTimer();
}

// 뽀모도로 시간 설정
function setPomoTimes() {
    const newWorkTime = parseInt(workTimeInput.value);
    const newBreakTime = parseInt(breakTimeInput.value);
    
    if (isNaN(newWorkTime) || newWorkTime <= 0 || isNaN(newBreakTime) || newBreakTime <= 0) {
        alert("유효한 시간을 입력해주세요.");
        return;
    }
    
    updatePomoDurations(newWorkTime, newBreakTime);
    resetPomo();
}

// 시작/멈춤 버튼 클릭 처리
function handleStartPauseClick() {
    if (isPomoRunning) {
        pausePomo();
    } else {
        startPomo();
    }
}

// 리셋 버튼 클릭 처리
function handleResetClick() {
    resetPomo();
}

// 시간 설정 버튼 클릭 처리
function handleSetTimeClick() {
    setPomoTimes();
}

// 뽀모도로 카드 초기화
export function initPomodoroCard() {
    // DOM 요소 가져오기
    pomoTimerElem = document.getElementById('pomodoro-timer');
    pomoStatusElem = document.getElementById('pomodoro-status');
    pomoStartPauseBtn = document.getElementById('pomo-start-pause');
    pomoResetBtn = document.getElementById('pomo-reset');
    pomoVisualTimerElem = document.getElementById('pomodoro-visual-timer');
    pomoDigitalTimerElem = document.getElementById('pomodoro-digital-timer');
    workTimeInput = document.getElementById('work-time');
    breakTimeInput = document.getElementById('break-time');
    setPomoTimeBtn = document.getElementById('set-pomo-time');

    // 이벤트 리스너 등록
    if (pomoStartPauseBtn) {
        pomoStartPauseBtn.addEventListener('click', handleStartPauseClick);
    }
    
    if (pomoResetBtn) {
        pomoResetBtn.addEventListener('click', handleResetClick);
    }
    
    if (setPomoTimeBtn) {
        setPomoTimeBtn.addEventListener('click', handleSetTimeClick);
    }

    // 초기 설정 값 표시
    if (workTimeInput) {
        workTimeInput.value = workDuration;
    }
    if (breakTimeInput) {
        breakTimeInput.value = breakDuration;
    }

    // 초기 상태 설정
    pomoStatusElem.textContent = isPomoWorkSession ? "집중할 시간!" : "휴식 시간!";
    pomoStartPauseBtn.textContent = isPomoRunning ? '일시정지' : '시작';
    
    // 초기 타이머 업데이트
    updatePomoTimer();
}

// 뽀모도로 카드 정리
export function cleanupPomodoroCard() {
    if (currentPomoInterval) {
        clearInterval(currentPomoInterval);
        currentPomoInterval = null;
    }
    updatePomoRunning(false);
}

// 외부에서 사용할 수 있는 함수들 내보내기
export { 
    updatePomoTimer, 
    startPomo, 
    pausePomo, 
    resetPomo, 
    setPomoTimes 
};
