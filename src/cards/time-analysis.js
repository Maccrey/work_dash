// 업무 시간 분석 카드 모듈
import { saveData, loadData, generateId, formatDate } from '../core/utils.js';

// DOM 요소들
let projectNameInput, startTimeInput, endTimeInput, workDescriptionInput, addTimeEntryBtn;
let dailyTimeSummary, timeEntriesList;

// 시간 기록 데이터
let timeEntries = [];

// 시간 기록 목록 렌더링
function renderTimeEntries() {
    if (!timeEntriesList) return;

    const today = new Date().toDateString();
    const todayEntries = timeEntries.filter(entry => 
        new Date(entry.date).toDateString() === today
    );

    timeEntriesList.innerHTML = '';
    todayEntries.forEach((entry, index) => {
        const entryElement = document.createElement('div');
        entryElement.className = 'time-entry-item';
        entryElement.innerHTML = `
            <div class="entry-header">
                <h4>${entry.projectName}</h4>
                <span class="entry-duration">${calculateDuration(entry.startTime, entry.endTime)}</span>
            </div>
            <div class="entry-time">${entry.startTime} - ${entry.endTime}</div>
            <div class="entry-description">${entry.description || '설명 없음'}</div>
            <button class="delete-entry-btn" data-id="${entry.id}">삭제</button>
        `;
        timeEntriesList.appendChild(entryElement);
    });

    updateDailySummary();
}

// 일일 요약 업데이트
function updateDailySummary() {
    if (!dailyTimeSummary) return;

    const today = new Date().toDateString();
    const todayEntries = timeEntries.filter(entry => 
        new Date(entry.date).toDateString() === today
    );

    const projectSummary = {};
    let totalMinutes = 0;

    todayEntries.forEach(entry => {
        const duration = getDurationInMinutes(entry.startTime, entry.endTime);
        totalMinutes += duration;
        
        if (projectSummary[entry.projectName]) {
            projectSummary[entry.projectName] += duration;
        } else {
            projectSummary[entry.projectName] = duration;
        }
    });

    const totalHours = Math.floor(totalMinutes / 60);
    const totalMins = totalMinutes % 60;

    let summaryHTML = `<p><strong>총 근무시간:</strong> ${totalHours}시간 ${totalMins}분</p>`;
    summaryHTML += '<div class="project-breakdown">';
    
    Object.entries(projectSummary).forEach(([project, minutes]) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        summaryHTML += `<div class="project-time">${project}: ${hours}시간 ${mins}분</div>`;
    });
    
    summaryHTML += '</div>';
    dailyTimeSummary.innerHTML = summaryHTML;
}

// 시간 간격 계산 (문자열 반환)
function calculateDuration(startTime, endTime) {
    const duration = getDurationInMinutes(startTime, endTime);
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}시간 ${minutes}분`;
}

// 시간 간격 계산 (분 단위)
function getDurationInMinutes(startTime, endTime) {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;
    
    // 다음 날로 넘어간 경우 처리
    if (endMinutes < startMinutes) {
        endMinutes += 24 * 60;
    }
    
    return endMinutes - startMinutes;
}

// 새 시간 기록 추가
function addTimeEntry() {
    const projectName = projectNameInput.value.trim();
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;
    const description = workDescriptionInput.value.trim();

    if (!projectName || !startTime || !endTime) {
        alert('프로젝트명, 시작시간, 종료시간을 모두 입력해주세요.');
        return;
    }

    if (startTime >= endTime) {
        alert('종료시간은 시작시간보다 나중이어야 합니다.');
        return;
    }

    const newEntry = {
        id: generateId(),
        projectName,
        startTime,
        endTime,
        description,
        date: new Date().toISOString()
    };

    timeEntries.push(newEntry);
    saveData('timeEntries', timeEntries);
    renderTimeEntries();

    // 폼 리셋
    projectNameInput.value = '';
    startTimeInput.value = '';
    endTimeInput.value = '';
    workDescriptionInput.value = '';
}

// 시간 기록 삭제
function deleteTimeEntry(id) {
    if (confirm('이 시간 기록을 삭제하시겠습니까?')) {
        timeEntries = timeEntries.filter(entry => entry.id !== id);
        saveData('timeEntries', timeEntries);
        renderTimeEntries();
    }
}

// 시간 기록 추가 버튼 클릭 처리
function handleAddTimeEntry(e) {
    e.preventDefault();
    addTimeEntry();
}

// 삭제 버튼 클릭 처리
function handleDeleteEntry(e) {
    if (e.target.classList.contains('delete-entry-btn')) {
        const id = e.target.dataset.id;
        deleteTimeEntry(id);
    }
}

// 업무 시간 분석 카드 초기화
export function initTimeAnalysisCard() {
    projectNameInput = document.getElementById('project-name');
    startTimeInput = document.getElementById('start-time');
    endTimeInput = document.getElementById('end-time');
    workDescriptionInput = document.getElementById('work-description');
    addTimeEntryBtn = document.getElementById('add-time-entry-btn');
    dailyTimeSummary = document.getElementById('daily-time-summary');
    timeEntriesList = document.getElementById('time-entries-list');

    if (!projectNameInput || !addTimeEntryBtn) {
        console.error('Time analysis card elements not found');
        return;
    }

    // 데이터 로드
    timeEntries = loadData('timeEntries') || [];

    // 이벤트 리스너 등록
    addTimeEntryBtn.addEventListener('click', handleAddTimeEntry);
    if (timeEntriesList) {
        timeEntriesList.addEventListener('click', handleDeleteEntry);
    }

    // 초기 렌더링
    renderTimeEntries();
}

// 업무 시간 분석 카드 정리
export function cleanupTimeAnalysisCard() {
    if (addTimeEntryBtn) addTimeEntryBtn.removeEventListener('click', handleAddTimeEntry);
    if (timeEntriesList) timeEntriesList.removeEventListener('click', handleDeleteEntry);
}

export { renderTimeEntries, addTimeEntry, deleteTimeEntry };