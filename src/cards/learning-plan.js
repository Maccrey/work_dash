// 학습 계획 카드 모듈
import { saveData, loadData, generateId } from '../core/utils.js';

let learningSubjectInput, learningTargetDateInput, learningTypeSelect, learningNotesInput;
let addLearningBtn, learningList;
let learningPlans = [];

function renderLearning() {
    if (!learningList) return;
    
    const sortedPlans = [...learningPlans].sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate));
    
    learningList.innerHTML = '';
    sortedPlans.forEach((plan) => {
        const targetDate = new Date(plan.targetDate);
        const now = new Date();
        const daysRemaining = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
        
        let statusClass = 'normal';
        if (plan.completed) statusClass = 'completed';
        else if (daysRemaining < 0) statusClass = 'overdue';
        else if (daysRemaining <= 7) statusClass = 'urgent';
        
        const planElement = document.createElement('div');
        planElement.className = `learning-item ${statusClass}`;
        planElement.innerHTML = `
            <div class="learning-header">
                <h4>${plan.subject}</h4>
                <span class="learning-type">${getTypeLabel(plan.type)}</span>
            </div>
            <div class="learning-target">목표: ${targetDate.toLocaleDateString('ko-KR')} ${getTimeRemainingText(daysRemaining, plan.completed)}</div>
            <div class="learning-notes">${plan.notes || '메모 없음'}</div>
            <div class="learning-actions">
                ${!plan.completed ? `
                    <button class="complete-learning-btn" data-id="${plan.id}">완료 처리</button>
                ` : ''}
                <button class="delete-learning-btn" data-id="${plan.id}">삭제</button>
            </div>
        `;
        learningList.appendChild(planElement);
    });
}

function getTypeLabel(type) {
    const labels = {
        online: '🎥 온라인 강의',
        book: '📚 도서',
        workshop: '🛠️ 워크샵',
        conference: '🎪 컨퍼런스',
        certification: '🏆 자격증'
    };
    return labels[type] || type;
}

function getTimeRemainingText(daysRemaining, completed) {
    if (completed) return '(완료)';
    if (daysRemaining < 0) return `(${Math.abs(daysRemaining)}일 지남)`;
    if (daysRemaining === 0) return '(오늘)';
    if (daysRemaining === 1) return '(내일)';
    return `(${daysRemaining}일 남음)`;
}

function addLearning() {
    const subject = learningSubjectInput.value.trim();
    const targetDate = learningTargetDateInput.value;
    const type = learningTypeSelect.value;
    const notes = learningNotesInput.value.trim();

    if (!subject || !targetDate) {
        alert('학습 주제와 목표 날짜를 입력해주세요.');
        return;
    }

    const newPlan = {
        id: generateId(),
        subject, targetDate, type, notes,
        completed: false,
        createdAt: new Date().toISOString()
    };

    learningPlans.push(newPlan);
    saveData('learningPlans', learningPlans);
    renderLearning();

    learningSubjectInput.value = '';
    learningTargetDateInput.value = '';
    learningTypeSelect.value = 'online';
    learningNotesInput.value = '';
}

function completeLearning(planId) {
    const plan = learningPlans.find(p => p.id === planId);
    if (!plan) return;

    if (confirm(`"${plan.subject}" 학습을 완료 처리하시겠습니까?`)) {
        plan.completed = true;
        plan.completedAt = new Date().toISOString();
        saveData('learningPlans', learningPlans);
        renderLearning();
        alert('학습이 완료 처리되었습니다! 🎉');
    }
}

function deleteLearning(planId) {
    if (confirm('이 학습 계획을 삭제하시겠습니까?')) {
        learningPlans = learningPlans.filter(p => p.id !== planId);
        saveData('learningPlans', learningPlans);
        renderLearning();
    }
}

function handleAddLearning(e) {
    e.preventDefault();
    addLearning();
}

function handleLearningAction(e) {
    if (e.target.classList.contains('complete-learning-btn')) {
        completeLearning(e.target.dataset.id);
    } else if (e.target.classList.contains('delete-learning-btn')) {
        deleteLearning(e.target.dataset.id);
    }
}

export function initLearningPlanCard() {
    learningSubjectInput = document.getElementById('learning-subject');
    learningTargetDateInput = document.getElementById('learning-target-date');
    learningTypeSelect = document.getElementById('learning-type');
    learningNotesInput = document.getElementById('learning-notes');
    addLearningBtn = document.getElementById('add-learning-btn');
    learningList = document.getElementById('learning-list');

    if (!learningSubjectInput || !addLearningBtn) return;

    learningPlans = loadData('learningPlans') || [];
    addLearningBtn.addEventListener('click', handleAddLearning);
    if (learningList) learningList.addEventListener('click', handleLearningAction);
    renderLearning();
}

export function cleanupLearningPlanCard() {
    if (addLearningBtn) addLearningBtn.removeEventListener('click', handleAddLearning);
    if (learningList) learningList.removeEventListener('click', handleLearningAction);
}

export { renderLearning, addLearning, completeLearning, deleteLearning };