// 피드백 수집 카드 모듈
import { saveData, loadData, generateId } from '../core/utils.js';

let feedbackTypeSelect, feedbackTitleInput, feedbackContentInput, feedbackPrioritySelect;
let addFeedbackBtn, feedbacksList;
let feedbacks = [];

function renderFeedbacks() {
    if (!feedbacksList) return;
    
    // 우선순위와 최신순으로 정렬
    const sortedFeedbacks = [...feedbacks].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    feedbacksList.innerHTML = '';
    sortedFeedbacks.forEach((feedback) => {
        const feedbackElement = document.createElement('div');
        feedbackElement.className = `feedback-item type-${feedback.type} priority-${feedback.priority}`;
        feedbackElement.innerHTML = `
            <div class="feedback-header">
                <div class="feedback-title">${feedback.title}</div>
                <div class="feedback-meta">
                    <span class="feedback-type">${getTypeLabel(feedback.type)}</span>
                    <span class="feedback-priority priority-${feedback.priority}">${getPriorityLabel(feedback.priority)}</span>
                </div>
            </div>
            <div class="feedback-content">${feedback.content}</div>
            <div class="feedback-footer">
                <span class="feedback-date">${formatDate(feedback.createdAt)}</span>
                <div class="feedback-actions">
                    <button class="resolve-feedback-btn ${feedback.resolved ? 'resolved' : ''}" data-id="${feedback.id}">
                        ${feedback.resolved ? '✅ 해결됨' : '해결 처리'}
                    </button>
                    <button class="delete-feedback-btn" data-id="${feedback.id}">삭제</button>
                </div>
            </div>
        `;
        feedbacksList.appendChild(feedbackElement);
    });
}

function getTypeLabel(type) {
    const labels = {
        suggestion: '💡 개선 제안',
        issue: '⚠️ 문제점',
        praise: '👏 칭찬',
        complaint: '😞 불만'
    };
    return labels[type] || type;
}

function getPriorityLabel(priority) {
    const labels = { high: '높음', medium: '보통', low: '낮음' };
    return labels[priority] || priority;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function addFeedback() {
    const type = feedbackTypeSelect.value;
    const title = feedbackTitleInput.value.trim();
    const content = feedbackContentInput.value.trim();
    const priority = feedbackPrioritySelect.value;

    if (!title || !content) {
        alert('제목과 내용을 입력해주세요.');
        return;
    }

    const newFeedback = {
        id: generateId(),
        type, title, content, priority,
        resolved: false,
        createdAt: new Date().toISOString()
    };

    feedbacks.push(newFeedback);
    saveData('feedbacks', feedbacks);
    renderFeedbacks();

    // 폼 리셋
    feedbackTitleInput.value = '';
    feedbackContentInput.value = '';
    feedbackTypeSelect.value = 'suggestion';
    feedbackPrioritySelect.value = 'medium';
}

function toggleFeedbackResolution(feedbackId) {
    const feedback = feedbacks.find(f => f.id === feedbackId);
    if (!feedback) return;

    feedback.resolved = !feedback.resolved;
    feedback.updatedAt = new Date().toISOString();
    
    saveData('feedbacks', feedbacks);
    renderFeedbacks();

    if (feedback.resolved) {
        alert('피드백이 해결 처리되었습니다.');
    }
}

function deleteFeedback(feedbackId) {
    if (confirm('이 피드백을 삭제하시겠습니까?')) {
        feedbacks = feedbacks.filter(f => f.id !== feedbackId);
        saveData('feedbacks', feedbacks);
        renderFeedbacks();
    }
}

function handleAddFeedback(e) {
    e.preventDefault();
    addFeedback();
}

function handleFeedbackAction(e) {
    if (e.target.classList.contains('resolve-feedback-btn')) {
        toggleFeedbackResolution(e.target.dataset.id);
    } else if (e.target.classList.contains('delete-feedback-btn')) {
        deleteFeedback(e.target.dataset.id);
    }
}

export function initFeedbackCollectorCard() {
    feedbackTypeSelect = document.getElementById('feedback-type');
    feedbackTitleInput = document.getElementById('feedback-title');
    feedbackContentInput = document.getElementById('feedback-content');
    feedbackPrioritySelect = document.getElementById('feedback-priority');
    addFeedbackBtn = document.getElementById('add-feedback-btn');
    feedbacksList = document.getElementById('feedbacks-list');

    if (!feedbackTitleInput || !addFeedbackBtn) return;

    feedbacks = loadData('feedbacks') || [];
    addFeedbackBtn.addEventListener('click', handleAddFeedback);
    if (feedbacksList) feedbacksList.addEventListener('click', handleFeedbackAction);
    renderFeedbacks();
}

export function cleanupFeedbackCollectorCard() {
    if (addFeedbackBtn) addFeedbackBtn.removeEventListener('click', handleAddFeedback);
    if (feedbacksList) feedbacksList.removeEventListener('click', handleFeedbackAction);
}

export { renderFeedbacks, addFeedback, toggleFeedbackResolution, deleteFeedback };