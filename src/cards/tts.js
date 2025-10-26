// TTS 알리미 카드 모듈
import { 
    ttsSchedules, 
    updateTtsSchedules, 
    addTtsSchedule as addTtsToState, 
    removeTtsSchedule,
    isTtsEnabled,
    updateTtsEnabled
} from '../core/state.js';
import { speak, generateId, getCurrentTime, compareTime, isValidTime } from '../core/utils.js';

// DOM 요소들
let ttsToggle, ttsTimeInput, ttsTextInput, addTtsScheduleBtn, ttsScheduleList;
let setupWorkBreakScheduleBtn, workBreakScheduleModal, closeBtn, saveWorkBreakScheduleBtn;

// TTS 스케줄 목록 렌더링
function renderTtsSchedules() {
    ttsScheduleList.innerHTML = '';
    const sortedSchedules = [...ttsSchedules].sort((a, b) => a.time.localeCompare(b.time));
    
    sortedSchedules.forEach(schedule => {
        const li = document.createElement('li');
        li.dataset.id = schedule.id;
        li.innerHTML = `
            <strong>${schedule.time}</strong>
            <span>${schedule.text}</span>
            <button class="delete-tts-btn" data-id="${schedule.id}">❌</button>
        `;
        ttsScheduleList.appendChild(li);
    });
}

// TTS 스케줄 추가
function addTtsSchedule(time, text) {
    if (!isValidTime(time) || !text.trim()) {
        alert('올바른 시간과 내용을 입력해주세요.');
        return false;
    }
    
    // 중복 방지
    const isDuplicate = ttsSchedules.some(s => s.time === time && s.text.trim() === text.trim());
    if (isDuplicate) {
        alert('이미 동일한 시간에 같은 내용의 알림이 있습니다.');
        return false;
    }
    
    const newSchedule = { 
        id: generateId(), 
        time, 
        text: text.trim(), 
        notified: false 
    };
    
    ttsSchedules.push(newSchedule);
    updateTtsSchedules(ttsSchedules);
    renderTtsSchedules();
    return true;
}

// TTS 스케줄 삭제
function deleteTtsSchedule(id) {
    const index = ttsSchedules.findIndex(s => s.id === id);
    if (index !== -1) {
        removeTtsSchedule(index);
        renderTtsSchedules();
    }
}

// 업무/휴식 스케줄 생성
function generateWorkBreakSchedules() {
    const workStartTime = document.getElementById('work-start-time')?.value;
    const workEndTime = document.getElementById('work-end-time')?.value;
    const workDuration = parseInt(document.getElementById('work-duration-input')?.value);
    const breakDuration = parseInt(document.getElementById('break-duration-input')?.value);
    const lunchStartTime = document.getElementById('lunch-start-time')?.value;
    const lunchEndTime = document.getElementById('lunch-end-time')?.value;

    if (!workStartTime || !workEndTime || isNaN(workDuration) || isNaN(breakDuration) || !lunchStartTime || !lunchEndTime) {
        alert('모든 값을 올바르게 입력해주세요.');
        return;
    }

    const timeToMinutes = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const minutesToTime = (minutes) => {
        const h = Math.floor(minutes / 60).toString().padStart(2, '0');
        const m = (minutes % 60).toString().padStart(2, '0');
        return `${h}:${m}`;
    };

    let currentTime = timeToMinutes(workStartTime);
    const endTime = timeToMinutes(workEndTime);
    const lunchStart = timeToMinutes(lunchStartTime);
    const lunchEnd = timeToMinutes(lunchEndTime);

    // 업무 시작 알림
    addTtsSchedule(workStartTime, '업무를 시작할 시간입니다. 화이팅!');

    // 업무/휴식 사이클 생성
    while (currentTime < endTime) {
        const breakTimeStart = currentTime + workDuration;
        if (breakTimeStart >= endTime) break;

        // 점심시간이 아닌 경우에만 휴식 알림
        if (!(breakTimeStart >= lunchStart && breakTimeStart < lunchEnd)) {
            addTtsSchedule(minutesToTime(breakTimeStart), `${breakDuration}분간 휴식시간입니다.`);
        }

        const workTimeStart = breakTimeStart + breakDuration;
        if (workTimeStart >= endTime) break;

        // 점심시간이 아닌 경우에만 업무 재개 알림
        if (!(workTimeStart >= lunchStart && workTimeStart < lunchEnd)) {
            addTtsSchedule(minutesToTime(workTimeStart), '휴식시간이 종료되었습니다.');
        }
        
        currentTime = workTimeStart;
    }

    // 기본 일정 알림
    addTtsSchedule(workEndTime, '업무를 종료할 시간입니다. 수고하셨습니다.');
    addTtsSchedule(lunchStartTime, '점심시간입니다. 맛있게 드세요.');
    addTtsSchedule(lunchEndTime, '점심시간이 종료되었습니다.');

    // 모달 닫기
    if (workBreakScheduleModal) {
        workBreakScheduleModal.style.display = 'none';
    }
    
    alert('업무/휴식 스케줄이 생성되었습니다.');
}

// TTS 알림 확인 (1분마다 실행)
function checkTtsNotifications() {
    if (!isTtsEnabled) return;
    
    const currentTime = getCurrentTime();
    
    const pendingNotifications = ttsSchedules.filter(schedule => 
        !schedule.notified && 
        compareTime(schedule.time, currentTime) <= 0
    );
    
    pendingNotifications.forEach(schedule => {
        speak(schedule.text, false, isTtsEnabled);
        schedule.notified = true;
    });
    
    if (pendingNotifications.length > 0) {
        updateTtsSchedules(ttsSchedules);
    }
    
    // 자정이 지나면 모든 알림을 리셋
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        ttsSchedules.forEach(schedule => schedule.notified = false);
        updateTtsSchedules(ttsSchedules);
    }
}

// TTS 토글 처리
function handleTtsToggle(e) {
    updateTtsEnabled(e.target.checked);
}

// TTS 스케줄 추가 버튼 클릭 처리
function handleAddTtsSchedule() {
    const time = ttsTimeInput.value;
    const text = ttsTextInput.value;
    
    if (addTtsSchedule(time, text)) {
        ttsTimeInput.value = '';
        ttsTextInput.value = '';
    }
}

// TTS 스케줄 삭제 버튼 클릭 처리
function handleDeleteTtsSchedule(e) {
    if (e.target.classList.contains('delete-tts-btn')) {
        const id = e.target.dataset.id;
        if (confirm('이 TTS 알림을 삭제하시겠습니까?')) {
            deleteTtsSchedule(id);
        }
    }
}

// 업무/휴식 스케줄 모달 열기
function handleSetupWorkBreakSchedule() {
    if (workBreakScheduleModal) {
        workBreakScheduleModal.style.display = 'block';
    }
}

// 모달 닫기
function handleCloseModal() {
    if (workBreakScheduleModal) {
        workBreakScheduleModal.style.display = 'none';
    }
}

// TTS 알리미 카드 초기화
export function initTtsCard() {
    // DOM 요소 가져오기
    ttsToggle = document.getElementById('tts-toggle');
    ttsTimeInput = document.getElementById('tts-time-input');
    ttsTextInput = document.getElementById('tts-text-input');
    addTtsScheduleBtn = document.getElementById('add-tts-schedule-btn');
    ttsScheduleList = document.getElementById('tts-schedule-list');
    setupWorkBreakScheduleBtn = document.getElementById('setup-work-break-schedule-btn');
    workBreakScheduleModal = document.getElementById('work-break-schedule-modal');
    closeBtn = workBreakScheduleModal?.querySelector('.close-button');
    saveWorkBreakScheduleBtn = document.getElementById('save-work-break-schedule-btn');

    // 이벤트 리스너 등록
    if (ttsToggle) {
        ttsToggle.checked = isTtsEnabled;
        ttsToggle.addEventListener('change', handleTtsToggle);
    }
    
    if (addTtsScheduleBtn) {
        addTtsScheduleBtn.addEventListener('click', handleAddTtsSchedule);
    }
    
    if (ttsScheduleList) {
        ttsScheduleList.addEventListener('click', handleDeleteTtsSchedule);
    }
    
    if (setupWorkBreakScheduleBtn) {
        setupWorkBreakScheduleBtn.addEventListener('click', handleSetupWorkBreakSchedule);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', handleCloseModal);
    }
    
    if (saveWorkBreakScheduleBtn) {
        saveWorkBreakScheduleBtn.addEventListener('click', generateWorkBreakSchedules);
    }
    
    // 모달 외부 클릭시 닫기
    if (workBreakScheduleModal) {
        workBreakScheduleModal.addEventListener('click', (e) => {
            if (e.target === workBreakScheduleModal) {
                handleCloseModal();
            }
        });
    }

    // 1분마다 TTS 알림 확인
    setInterval(checkTtsNotifications, 60000);

    // 초기 스케줄 목록 렌더링
    renderTtsSchedules();
}

// TTS 알리미 카드 정리
export function cleanupTtsCard() {
    // 이벤트 리스너 정리 (필요시)
}

// 외부에서 사용할 수 있는 함수들 내보내기
export { 
    renderTtsSchedules, 
    addTtsSchedule, 
    deleteTtsSchedule, 
    generateWorkBreakSchedules, 
    checkTtsNotifications 
};