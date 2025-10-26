// 업무 인수인계 카드 모듈
import { saveData, loadData, generateId } from '../core/utils.js';

let handoverProjectInput, handoverFromInput, handoverToInput, handoverDetailsInput, handoverDeadlineInput;
let addHandoverBtn, handoversList;
let handovers = [];

function renderHandovers() {
    if (!handoversList) return;
    
    const sortedHandovers = [...handovers].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    
    handoversList.innerHTML = '';
    sortedHandovers.forEach((handover) => {
        const deadlineDate = new Date(handover.deadline);
        const now = new Date();
        const isOverdue = deadlineDate < now && !handover.completed;
        const isUpcoming = deadlineDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const handoverElement = document.createElement('div');
        handoverElement.className = `handover-item ${handover.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''} ${isUpcoming ? 'upcoming' : ''}`;
        handoverElement.innerHTML = `
            <div class="handover-header">
                <h4>${handover.project}</h4>
                <span class="handover-status">${handover.completed ? '✅ 완료' : '⏳ 진행중'}</span>
            </div>
            <div class="handover-parties">
                <span class="handover-from">👤 ${handover.from}</span>
                <span class="handover-arrow">→</span>
                <span class="handover-to">👤 ${handover.to}</span>
            </div>
            <div class="handover-details">${handover.details}</div>
            <div class="handover-deadline">
                📅 마감: ${deadlineDate.toLocaleDateString('ko-KR')}
                ${isOverdue ? ' (지연)' : isUpcoming ? ' (임박)' : ''}
            </div>
            <div class="handover-actions">
                ${!handover.completed ? `
                    <button class="complete-handover-btn" data-id="${handover.id}">완료 처리</button>
                ` : ''}
                <button class="delete-handover-btn" data-id="${handover.id}">삭제</button>
            </div>
        `;
        handoversList.appendChild(handoverElement);
    });
}

function addHandover() {
    const project = handoverProjectInput.value.trim();
    const from = handoverFromInput.value.trim();
    const to = handoverToInput.value.trim();
    const details = handoverDetailsInput.value.trim();
    const deadline = handoverDeadlineInput.value;

    if (!project || !from || !to || !details || !deadline) {
        alert('모든 필드를 입력해주세요.');
        return;
    }

    const newHandover = {
        id: generateId(),
        project, from, to, details, deadline,
        completed: false,
        createdAt: new Date().toISOString()
    };

    handovers.push(newHandover);
    saveData('handovers', handovers);
    renderHandovers();

    // 폼 리셋
    handoverProjectInput.value = '';
    handoverFromInput.value = '';
    handoverToInput.value = '';
    handoverDetailsInput.value = '';
    handoverDeadlineInput.value = '';
}

function completeHandover(handoverId) {
    const handover = handovers.find(h => h.id === handoverId);
    if (!handover) return;

    if (confirm(`"${handover.project}" 인수인계를 완료 처리하시겠습니까?`)) {
        handover.completed = true;
        handover.completedAt = new Date().toISOString();
        saveData('handovers', handovers);
        renderHandovers();
        
        alert('인수인계가 완료 처리되었습니다.');
    }
}

function deleteHandover(handoverId) {
    const handover = handovers.find(h => h.id === handoverId);
    if (!handover) return;

    if (confirm(`"${handover.project}" 인수인계를 삭제하시겠습니까?`)) {
        handovers = handovers.filter(h => h.id !== handoverId);
        saveData('handovers', handovers);
        renderHandovers();
    }
}

function handleAddHandover(e) {
    e.preventDefault();
    addHandover();
}

function handleHandoverAction(e) {
    if (e.target.classList.contains('complete-handover-btn')) {
        completeHandover(e.target.dataset.id);
    } else if (e.target.classList.contains('delete-handover-btn')) {
        deleteHandover(e.target.dataset.id);
    }
}

export function initHandoverManagerCard() {
    handoverProjectInput = document.getElementById('handover-project');
    handoverFromInput = document.getElementById('handover-from');
    handoverToInput = document.getElementById('handover-to');
    handoverDetailsInput = document.getElementById('handover-details');
    handoverDeadlineInput = document.getElementById('handover-deadline');
    addHandoverBtn = document.getElementById('add-handover-btn');
    handoversList = document.getElementById('handovers-list');

    if (!handoverProjectInput || !addHandoverBtn) return;

    handovers = loadData('handovers') || [];
    addHandoverBtn.addEventListener('click', handleAddHandover);
    if (handoversList) handoversList.addEventListener('click', handleHandoverAction);
    renderHandovers();
}

export function cleanupHandoverManagerCard() {
    if (addHandoverBtn) addHandoverBtn.removeEventListener('click', handleAddHandover);
    if (handoversList) handoversList.removeEventListener('click', handleHandoverAction);
}

export { renderHandovers, addHandover, completeHandover, deleteHandover };