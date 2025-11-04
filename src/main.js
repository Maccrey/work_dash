// 메인 애플리케이션 진입점 (새로운 카드 관리 시스템 사용)
import { loadAllData, clearAllData } from './core/state.js';
import { registerAllCards } from './cards/index.js';
import { 
    initializeAllCards, 
    cleanupAllCards, 
    initializeSettingsModal,
    applyCardVisibilitySettings 
} from './core/card-manager.js';
import { initializeHeaderAd, cleanupHeaderAd } from './core/adfit-banner.js';
import { initializeCardDrag, cleanupCardDrag } from './core/card-drag.js';

// 애플리케이션 초기화
async function initializeApp() {
    console.log('업무 대시보드 시작 중...');
    
    try {
        // 1. 데이터 로드
        loadAllData();
        
        // 2. 모든 카드 등록
        registerAllCards();
        
        // 2-1. 헤더 광고 초기화
        initializeHeaderAd();
        
        // 3. 설정 모달 초기화 
        initializeSettingsModal();
        
        // 4. 모든 카드 초기화
        await initializeAllCards();
        
        // 5. 카드 표시/숨김 설정 적용
        applyCardVisibilitySettings();

        // 6. 기타 UI 초기화
        initDataManagement();

        // 7. 카드 드래그 앤 드롭 초기화
        initializeCardDrag();
        
        console.log('업무 대시보드 초기화 완료');
        
    } catch (error) {
        console.error('앱 초기화 중 오류 발생:', error);
        alert('애플리케이션 초기화 중 오류가 발생했습니다. 페이지를 새로고침 해주세요.');
    }
}

// 추가 설정 UI 초기화 (card-manager에서 기본 설정 모달 처리)
function initAdditionalSettings() {
    const clearAllDataBtn = document.getElementById('clear-all-data-btn');
    
    if (clearAllDataBtn) {
        clearAllDataBtn.addEventListener('click', () => {
            if (confirm('정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                clearAllData();
                // 앱 재초기화
                cleanupApp();
                initializeApp();
                alert('모든 데이터가 성공적으로 삭제되었습니다.');
            }
        });
    }
}

// 데이터 관리 기능 초기화
function initDataManagement() {
    // 추가 설정 UI 초기화
    initAdditionalSettings();
    
    // 업무/휴식 스케줄 모달 초기화
    initWorkBreakScheduleModal();
    
    // 카드 드래그 앤 드롭 기능 (향후 구현 예정)
    // initCardDragAndDrop();
}

// 업무/휴식 스케줄 모달 초기화
function initWorkBreakScheduleModal() {
    const modal = document.getElementById('work-break-schedule-modal');
    const openBtn = document.getElementById('setup-work-break-schedule-btn');
    const closeBtn = modal?.querySelector('.close-button');
    const saveBtn = document.getElementById('save-work-break-schedule-btn');

    if (!modal || !openBtn) return;

    openBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const workStart = document.getElementById('work-start-time')?.value || '09:00';
            const workEnd = document.getElementById('work-end-time')?.value || '18:00';
            const workDuration = parseInt(document.getElementById('work-duration-input')?.value) || 50;
            const breakDuration = parseInt(document.getElementById('break-duration-input')?.value) || 10;
            const lunchStart = document.getElementById('lunch-start-time')?.value || '12:00';
            const lunchEnd = document.getElementById('lunch-end-time')?.value || '13:00';

            // TTS 스케줄 생성 (기존 TTS 카드 기능 활용)
            const schedules = generateWorkBreakSchedules(workStart, workEnd, workDuration, breakDuration, lunchStart, lunchEnd);
            
            // TTS 카드에서 스케줄 추가 (기존 TTS 카드 기능과 통합)
            // addMultipleTtsSchedules(schedules);
            
            modal.style.display = 'none';
            alert(`업무/휴식 스케줄이 설정되었습니다. (${schedules.length}개 알림)`);
        });
    }

    // 모달 외부 클릭시 닫기
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// 업무/휴식 스케줄 생성
function generateWorkBreakSchedules(workStart, workEnd, workDuration, breakDuration, lunchStart, lunchEnd) {
    const schedules = [];
    const startTime = parseTime(workStart);
    const endTime = parseTime(workEnd);
    const lunchStartTime = parseTime(lunchStart);
    const lunchEndTime = parseTime(lunchEnd);
    
    let currentTime = startTime;
    let sessionCount = 1;
    
    while (currentTime < endTime) {
        // 작업 시간 종료 알림
        const workEndTime = addMinutes(currentTime, workDuration);
        if (workEndTime <= endTime) {
            // 점심시간과 겹치지 않는지 확인
            if (!(workEndTime >= lunchStartTime && workEndTime <= lunchEndTime)) {
                schedules.push({
                    time: formatTime(workEndTime),
                    text: `${sessionCount}차 작업 시간 종료! ${breakDuration}분 휴식하세요. 🎯`
                });
            }
        }
        
        // 휴식 시간 종료 알림
        const breakEndTime = addMinutes(workEndTime, breakDuration);
        if (breakEndTime <= endTime) {
            // 점심시간과 겹치지 않는지 확인
            if (!(breakEndTime >= lunchStartTime && breakEndTime <= lunchEndTime)) {
                schedules.push({
                    time: formatTime(breakEndTime),
                    text: `휴식 종료! ${sessionCount + 1}차 작업을 시작하세요. ⚡`
                });
            }
        }
        
        currentTime = breakEndTime;
        sessionCount++;
        
        // 무한 루프 방지
        if (sessionCount > 20) break;
    }
    
    return schedules;
}

// 시간 파싱 함수
function parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

// 분 추가 함수
function addMinutes(time, minutes) {
    return time + minutes;
}

// 시간 포맷팅 함수
function formatTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// 애플리케이션 정리
function cleanupApp() {
    try {
        cleanupCardDrag();
        cleanupHeaderAd();
        cleanupAllCards();
        console.log('앱 정리 완료');
    } catch (error) {
        console.error('앱 정리 중 오류 발생:', error);
    }
}

// DOM 로드 완료시 애플리케이션 시작
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// 페이지 언로드시 정리
window.addEventListener('beforeunload', () => {
    cleanupApp();
});

// 에러 핸들링
window.addEventListener('error', (event) => {
    console.error('전역 에러 발생:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('처리되지 않은 Promise 거부:', event.reason);
});

// 외부에서 사용할 수 있는 함수들 내보내기
export { initializeApp, cleanupApp };
