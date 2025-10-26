// 연차/휴가 관리 카드 모듈
import { saveData, loadData, generateId } from '../core/utils.js';

let leaveStartDateInput, leaveEndDateInput, leaveTypeSelect, leaveReasonInput, addLeaveBtn;
let remainingAnnualLeave, usedAnnualLeave, leavesList;
let leaves = [];
let leaveSettings = { totalAnnualLeave: 15 };

function renderLeaves() {
    if (!leavesList) return;
    
    const sortedLeaves = [...leaves].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    
    leavesList.innerHTML = '';
    sortedLeaves.forEach((leave) => {
        const days = calculateDays(leave.startDate, leave.endDate);
        const startDate = new Date(leave.startDate).toLocaleDateString('ko-KR');
        const endDate = new Date(leave.endDate).toLocaleDateString('ko-KR');
        
        const leaveElement = document.createElement('div');
        leaveElement.className = `leave-item leave-type-${leave.type}`;
        leaveElement.innerHTML = `
            <div class="leave-header">
                <span class="leave-type">${getLeaveTypeLabel(leave.type)}</span>
                <span class="leave-days">${days}일</span>
            </div>
            <div class="leave-period">${startDate} ~ ${endDate}</div>
            <div class="leave-reason">${leave.reason || '사유 없음'}</div>
            <button class="delete-leave-btn" data-id="${leave.id}">삭제</button>
        `;
        leavesList.appendChild(leaveElement);
    });
    
    updateLeaveSummary();
}

function getLeaveTypeLabel(type) {
    const labels = {
        annual: '연차',
        sick: '병가',
        personal: '개인사유',
        vacation: '휴가'
    };
    return labels[type] || type;
}

function calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

function updateLeaveSummary() {
    const currentYear = new Date().getFullYear();
    const annualLeaves = leaves.filter(leave => 
        leave.type === 'annual' && 
        new Date(leave.startDate).getFullYear() === currentYear
    );
    
    const usedDays = annualLeaves.reduce((total, leave) => 
        total + calculateDays(leave.startDate, leave.endDate), 0
    );
    
    const remaining = leaveSettings.totalAnnualLeave - usedDays;
    
    if (remainingAnnualLeave) remainingAnnualLeave.textContent = `${remaining}일`;
    if (usedAnnualLeave) usedAnnualLeave.textContent = `${usedDays}일`;
}

function addLeave() {
    const startDate = leaveStartDateInput.value;
    const endDate = leaveEndDateInput.value;
    const type = leaveTypeSelect.value;
    const reason = leaveReasonInput.value.trim();

    if (!startDate || !endDate) {
        alert('시작일과 종료일을 입력해주세요.');
        return;
    }

    if (new Date(startDate) > new Date(endDate)) {
        alert('종료일은 시작일보다 나중이어야 합니다.');
        return;
    }

    const newLeave = {
        id: generateId(),
        startDate, endDate, type, reason,
        createdAt: new Date().toISOString()
    };

    leaves.push(newLeave);
    saveData('leaves', leaves);
    renderLeaves();

    leaveStartDateInput.value = '';
    leaveEndDateInput.value = '';
    leaveTypeSelect.value = 'annual';
    leaveReasonInput.value = '';
}

function deleteLeave(leaveId) {
    if (confirm('이 휴가 기록을 삭제하시겠습니까?')) {
        leaves = leaves.filter(l => l.id !== leaveId);
        saveData('leaves', leaves);
        renderLeaves();
    }
}

function handleAddLeave(e) {
    e.preventDefault();
    addLeave();
}

function handleDeleteLeave(e) {
    if (e.target.classList.contains('delete-leave-btn')) {
        deleteLeave(e.target.dataset.id);
    }
}

export function initLeaveManagerCard() {
    leaveStartDateInput = document.getElementById('leave-start-date');
    leaveEndDateInput = document.getElementById('leave-end-date');
    leaveTypeSelect = document.getElementById('leave-type');
    leaveReasonInput = document.getElementById('leave-reason');
    addLeaveBtn = document.getElementById('add-leave-btn');
    remainingAnnualLeave = document.getElementById('remaining-annual-leave');
    usedAnnualLeave = document.getElementById('used-annual-leave');
    leavesList = document.getElementById('leaves-list');

    if (!leaveStartDateInput || !addLeaveBtn) return;

    leaves = loadData('leaves') || [];
    leaveSettings = loadData('leaveSettings') || { totalAnnualLeave: 15 };
    
    addLeaveBtn.addEventListener('click', handleAddLeave);
    if (leavesList) leavesList.addEventListener('click', handleDeleteLeave);
    renderLeaves();
}

export function cleanupLeaveManagerCard() {
    if (addLeaveBtn) addLeaveBtn.removeEventListener('click', handleAddLeave);
    if (leavesList) leavesList.removeEventListener('click', handleDeleteLeave);
}

export { renderLeaves, addLeave, deleteLeave };