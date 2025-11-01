// 출퇴근 카드 모듈
import {
    attendanceRecords,
    updateAttendanceRecords,
    addAttendanceRecord,
    holidays,
    currentCalendarDate,
    updateCurrentCalendarDate
} from '../core/state.js';

// DOM 요소들
let checkInBtn, checkOutBtn, statusSelect, applyStatusBtn;
let dailyAttendanceTableBody, monthlyLateCount, monthlyEarlyCount;
let monthlySickCount, monthlyAbsentCount, monthlyAnnualLeaveCount;
let showMonthlyViewBtn, monthlyCalendarView;
let prevMonthBtn, nextMonthBtn, currentMonthYear, calendarGrid;

// 오늘 날짜 키 생성
function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
}

// 요일 구하기
function getDayOfWeek(dateString) {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[new Date(dateString).getDay()];
}

// 공휴일 정보 가져오기
function getHolidayInfo(year, month, date) {
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return holidays[dateKey];
}

// 출퇴근 현황 렌더링
function renderAttendance() {
    dailyAttendanceTableBody.innerHTML = '';
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    let lateCount = 0, earlyCount = 0, sickCount = 0, absentCount = 0, annualLeaveCount = 0;

    // 최근 5개 업무일 렌더링
    let renderedDays = 0;
    for (let i = 0; renderedDays < 5 && i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayOfWeek = date.getDay();
        
        const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        const storedRecord = attendanceRecords[dateKey];
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isHoliday = Boolean(getHolidayInfo(date.getFullYear(), date.getMonth() + 1, date.getDate()));

        if (!storedRecord && (isWeekend || isHoliday)) continue;

        const record = storedRecord || { checkIn: '-', checkOut: '-', status: '-' };
        
        const row = dailyAttendanceTableBody.insertRow();
        row.innerHTML = `
            <td>${dateKey}</td>
            <td>${getDayOfWeek(dateKey)}</td>
            <td>${record.checkIn}</td>
            <td>${record.checkOut}</td>
            <td>${record.status}</td>
        `;
        renderedDays++;
    }

    // 월간 통계 계산
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    for (let d = new Date(firstDayOfMonth); d <= lastDayOfMonth; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        const dateKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
        const record = attendanceRecords[dateKey];
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isHoliday = Boolean(getHolidayInfo(d.getFullYear(), d.getMonth() + 1, d.getDate()));

        if (!record && (isWeekend || isHoliday)) {
            continue;
        }
        
        if (record) {
            switch (record.status) {
                case '지각': lateCount++; break;
                case '조퇴': earlyCount++; break;
                case '병가': sickCount++; break;
                case '무단결근': absentCount++; break;
                case '월차': annualLeaveCount++; break;
            }
        }
    }

    // 월간 통계 UI 업데이트
    monthlyLateCount.textContent = lateCount;
    monthlyEarlyCount.textContent = earlyCount;
    monthlySickCount.textContent = sickCount;
    monthlyAbsentCount.textContent = absentCount;
    monthlyAnnualLeaveCount.textContent = annualLeaveCount;
}

// 출근 처리
function checkIn() {
    const todayKey = getTodayKey();
    const now = new Date();
    const checkInTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // 9시 이후 출근시 지각 처리
    const status = (now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0)) ? '지각' : '정상';
    
    addAttendanceRecord(todayKey, { 
        checkIn: checkInTime, 
        checkOut: '-', 
        status 
    });
    
    renderAttendance();
    renderMonthlyCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
}

// 퇴근 처리
function checkOut() {
    const todayKey = getTodayKey();
    const existingRecord = attendanceRecords[todayKey];
    
    if (!existingRecord) {
        alert("먼저 출근을 기록해주세요.");
        return;
    }
    
    const now = new Date();
    const checkOutTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    let status = existingRecord.status;
    
    // 18시 이전 퇴근시 조퇴 처리 (정상 출근인 경우)
    if (now.getHours() < 18 && status === '정상') {
        status = '조퇴';
    }
    
    addAttendanceRecord(todayKey, {
        ...existingRecord,
        checkOut: checkOutTime,
        status
    });
    
    renderAttendance();
    renderMonthlyCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
}

// 상태 수동 적용
function applyStatus() {
    const todayKey = getTodayKey();
    const selectedStatus = statusSelect.value;
    
    if (!['병가', '무단결근', '월차'].includes(selectedStatus)) {
        alert("'병가', '무단결근', '월차'만 수동으로 적용할 수 있습니다.");
        return;
    }
    
    const existingRecord = attendanceRecords[todayKey] || {};
    addAttendanceRecord(todayKey, { 
        ...existingRecord,
        checkIn: '-', 
        checkOut: '-', 
        status: selectedStatus 
    });
    
    renderAttendance();
    renderMonthlyCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
}

// 월간 캘린더 렌더링
function renderMonthlyCalendar(year, month) {
    currentMonthYear.textContent = `${year}년 ${month + 1}월`;
    calendarGrid.innerHTML = '';
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDay = firstDayOfMonth.getDay();

    // 월 시작 전 빈 칸
    for (let i = 0; i < startDay; i++) {
        calendarGrid.insertAdjacentHTML('beforeend', '<div class="calendar-day empty"></div>');
    }

    // 일별 캘린더 생성
    for (let date = 1; date <= lastDayOfMonth.getDate(); date++) {
        const dayElem = document.createElement('div');
        dayElem.classList.add('calendar-day');
        
        const fullDate = new Date(year, month, date);
        const dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
        const dayOfWeek = fullDate.getDay();

        // 주말 표시
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            dayElem.classList.add('weekend');
        }
        
        // 공휴일 표시
        const holidayName = getHolidayInfo(year, month + 1, date);
        if (holidayName) {
            dayElem.classList.add('holiday');
        }
        
        // 오늘 날짜 표시
        if (fullDate.toDateString() === new Date().toDateString()) {
            dayElem.classList.add('today');
        }

        dayElem.innerHTML = `<span class="date-number">${date}</span>`;
        
        // 출퇴근 기록 표시
        const record = attendanceRecords[dateKey];
        if (record) {
            const statusIcons = { 
                '정상': '✅', 
                '지각': '⏰', 
                '조퇴': '🏃', 
                '병가': '🤒', 
                '무단결근': '🚫', 
                '월차': '🌴' 
            };
            
            if (statusIcons[record.status]) {
                dayElem.innerHTML += `<div class="status-icon status-${record.status}">${statusIcons[record.status]}</div>`;
            }
            
            if (record.checkIn !== '-' && record.checkOut !== '-') {
                dayElem.innerHTML += `<div class="work-time">${record.checkIn} ~ ${record.checkOut}</div>`;
            }
        } else if (holidayName) {
            dayElem.innerHTML += `<div class="holiday-name">${holidayName}</div>`;
        }
        
        calendarGrid.appendChild(dayElem);
    }
}

// 월 변경 (이전/다음)
function changeMonth(direction) {
    const newDate = new Date(currentCalendarDate);
    newDate.setMonth(newDate.getMonth() + direction);
    updateCurrentCalendarDate(newDate);
    renderMonthlyCalendar(newDate.getFullYear(), newDate.getMonth());
}

// 월간 보기 토글
function toggleMonthlyView() {
    if (!monthlyCalendarView) return;

    const isHidden = monthlyCalendarView.classList.contains('hidden');
    if (isHidden) {
        monthlyCalendarView.classList.remove('hidden');
        if (showMonthlyViewBtn) {
            showMonthlyViewBtn.textContent = '월 현황 숨기기';
        }
    } else {
        monthlyCalendarView.classList.add('hidden');
        if (showMonthlyViewBtn) {
            showMonthlyViewBtn.textContent = '월 현황 보기';
        }
    }
}

// 출퇴근 카드 초기화
export function initAttendanceCard() {
    // DOM 요소 가져오기
    checkInBtn = document.getElementById('check-in-btn');
    checkOutBtn = document.getElementById('check-out-btn');
    statusSelect = document.getElementById('status-select');
    applyStatusBtn = document.getElementById('apply-status-btn');
    dailyAttendanceTableBody = document.querySelector('#daily-attendance-table tbody');
    monthlyLateCount = document.getElementById('monthly-late-count');
    monthlyEarlyCount = document.getElementById('monthly-early-count');
    monthlySickCount = document.getElementById('monthly-sick-count');
    monthlyAbsentCount = document.getElementById('monthly-absent-count');
    monthlyAnnualLeaveCount = document.getElementById('monthly-annual-leave-count');
    showMonthlyViewBtn = document.getElementById('show-monthly-view-btn');
    monthlyCalendarView = document.getElementById('monthly-calendar-view');
    prevMonthBtn = document.getElementById('prev-month-btn');
    nextMonthBtn = document.getElementById('next-month-btn');
    currentMonthYear = document.getElementById('current-month-year');
    calendarGrid = document.getElementById('calendar-grid');

    // 이벤트 리스너 등록
    if (checkInBtn) {
        checkInBtn.addEventListener('click', checkIn);
    }
    
    if (checkOutBtn) {
        checkOutBtn.addEventListener('click', checkOut);
    }
    
    if (applyStatusBtn) {
        applyStatusBtn.addEventListener('click', applyStatus);
    }
    
    if (showMonthlyViewBtn) {
        showMonthlyViewBtn.addEventListener('click', toggleMonthlyView);
    }
    
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    }
    
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => changeMonth(1));
    }

    if (showMonthlyViewBtn && monthlyCalendarView) {
        const isHidden = monthlyCalendarView.classList.contains('hidden');
        showMonthlyViewBtn.textContent = isHidden ? '월 현황 보기' : '월 현황 숨기기';
    }

    // 초기 렌더링
    renderAttendance();
    renderMonthlyCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
}

// 출퇴근 카드 정리
export function cleanupAttendanceCard() {
    // 이벤트 리스너 정리 (필요시)
}

// 외부에서 사용할 수 있는 함수들 내보내기
export { 
    renderAttendance, 
    renderMonthlyCalendar, 
    checkIn, 
    checkOut, 
    applyStatus
};
