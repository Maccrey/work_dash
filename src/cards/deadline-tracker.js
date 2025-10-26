// 마감일 추적기 카드 모듈
import { saveData, loadData, generateId } from '../core/utils.js';

let deadlineTaskInput, deadlineDatetimeInput, deadlinePrioritySelect, addDeadlineBtn, deadlinesList;
let deadlines = [];

function renderDeadlines() {
    if (!deadlinesList) return;
    
    const sortedDeadlines = [...deadlines].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    
    deadlinesList.innerHTML = '';
    sortedDeadlines.forEach((deadline) => {
        const deadlineDate = new Date(deadline.datetime);
        const now = new Date();
        const timeRemaining = deadlineDate - now;
        const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
        
        let statusClass = 'normal';
        if (daysRemaining < 0) statusClass = 'overdue';
        else if (daysRemaining <= 1) statusClass = 'urgent';
        else if (daysRemaining <= 3) statusClass = 'warning';
        
        const deadlineElement = document.createElement('div');
        deadlineElement.className = `deadline-item priority-${deadline.priority} ${statusClass}`;
        deadlineElement.innerHTML = `
            <div class="deadline-header">
                <h4>${deadline.task}</h4>
                <span class="deadline-priority">${getPriorityLabel(deadline.priority)}</span>
            </div>
            <div class="deadline-time">
                ${deadlineDate.toLocaleString('ko-KR')}
                <span class="time-remaining">${getTimeRemainingText(daysRemaining)}</span>
            </div>
            <button class="delete-deadline-btn" data-id="${deadline.id}">삭제</button>
        `;
        deadlinesList.appendChild(deadlineElement);
    });
}

function getPriorityLabel(priority) {
    const labels = { high: '높음', medium: '보통', low: '낮음' };
    return labels[priority] || priority;
}

function getTimeRemainingText(daysRemaining) {
    if (daysRemaining < 0) return `${Math.abs(daysRemaining)}일 지남`;
    if (daysRemaining === 0) return '오늘';
    if (daysRemaining === 1) return '내일';
    return `${daysRemaining}일 남음`;
}

function addDeadline() {
    const task = deadlineTaskInput.value.trim();
    const datetime = deadlineDatetimeInput.value;
    const priority = deadlinePrioritySelect.value;

    if (!task || !datetime) {
        alert('작업명과 마감일시를 입력해주세요.');
        return;
    }

    const newDeadline = {
        id: generateId(),
        task, datetime, priority,
        createdAt: new Date().toISOString()
    };

    deadlines.push(newDeadline);
    saveData('deadlines', deadlines);
    renderDeadlines();

    deadlineTaskInput.value = '';
    deadlineDatetimeInput.value = '';
    deadlinePrioritySelect.value = 'medium';
}

function deleteDeadline(deadlineId) {
    if (confirm('이 마감일을 삭제하시겠습니까?')) {
        deadlines = deadlines.filter(d => d.id !== deadlineId);
        saveData('deadlines', deadlines);
        renderDeadlines();
    }
}

function handleAddDeadline(e) {
    e.preventDefault();
    addDeadline();
}

function handleDeleteDeadline(e) {
    if (e.target.classList.contains('delete-deadline-btn')) {
        deleteDeadline(e.target.dataset.id);
    }
}

export function initDeadlineTrackerCard() {
    deadlineTaskInput = document.getElementById('deadline-task');
    deadlineDatetimeInput = document.getElementById('deadline-datetime');
    deadlinePrioritySelect = document.getElementById('deadline-priority');
    addDeadlineBtn = document.getElementById('add-deadline-btn');
    deadlinesList = document.getElementById('deadlines-list');

    if (!deadlineTaskInput || !addDeadlineBtn) return;

    deadlines = loadData('deadlines') || [];
    addDeadlineBtn.addEventListener('click', handleAddDeadline);
    if (deadlinesList) deadlinesList.addEventListener('click', handleDeleteDeadline);
    renderDeadlines();
}

export function cleanupDeadlineTrackerCard() {
    if (addDeadlineBtn) addDeadlineBtn.removeEventListener('click', handleAddDeadline);
    if (deadlinesList) deadlinesList.removeEventListener('click', handleDeleteDeadline);
}

export { renderDeadlines, addDeadline, deleteDeadline };