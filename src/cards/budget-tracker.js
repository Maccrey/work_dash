// 예산 추적 카드 모듈
import { saveData, loadData, generateId } from '../core/utils.js';

// DOM 요소들
let budgetCategoryInput, budgetLimitInput, addBudgetBtn, budgetsList;

// 예산 데이터
let budgets = [];
let expenses = []; // expense-manager에서 가져온 데이터

// 예산 목록 렌더링
function renderBudgets() {
    if (!budgetsList) return;

    // 경비 데이터 로드 (expense-manager에서)
    expenses = loadData('expenses') || [];
    
    budgetsList.innerHTML = '';
    budgets.forEach((budget) => {
        const currentMonth = new Date();
        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        // 해당 카테고리의 이번 달 지출 계산
        const categoryExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expense.category === budget.category &&
                   expenseDate >= monthStart && 
                   expenseDate <= monthEnd;
        });

        const totalSpent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const remaining = budget.limit - totalSpent;
        const percentage = budget.limit > 0 ? Math.round((totalSpent / budget.limit) * 100) : 0;
        const statusClass = getStatusClass(percentage);

        const budgetElement = document.createElement('div');
        budgetElement.className = `budget-item ${statusClass}`;
        budgetElement.innerHTML = `
            <div class="budget-header">
                <h4>${budget.category}</h4>
                <span class="budget-percentage">${percentage}%</span>
            </div>
            <div class="budget-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
            </div>
            <div class="budget-details">
                <div class="budget-spent">사용: ${formatCurrency(totalSpent)}</div>
                <div class="budget-limit">한도: ${formatCurrency(budget.limit)}</div>
                <div class="budget-remaining ${remaining >= 0 ? 'positive' : 'negative'}">
                    ${remaining >= 0 ? '잔액' : '초과'}: ${formatCurrency(Math.abs(remaining))}
                </div>
            </div>
            <div class="budget-actions">
                <button class="edit-budget-btn" data-id="${budget.id}">수정</button>
                <button class="delete-budget-btn" data-id="${budget.id}">삭제</button>
            </div>
        `;
        budgetsList.appendChild(budgetElement);
    });

    // 전체 예산 요약 표시
    renderBudgetSummary();
}

// 예산 상태 클래스
function getStatusClass(percentage) {
    if (percentage >= 100) return 'over-budget';
    if (percentage >= 80) return 'warning';
    if (percentage >= 50) return 'moderate';
    return 'safe';
}

// 전체 예산 요약 렌더링
function renderBudgetSummary() {
    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const monthlyExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= monthStart && expenseDate <= monthEnd;
    });

    const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0);
    const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalRemaining = totalBudget - totalSpent;

    // 요약 정보를 budgetsList 상단에 추가
    const existingSummary = document.querySelector('.budget-summary');
    if (existingSummary) {
        existingSummary.remove();
    }

    if (budgets.length > 0) {
        const summaryElement = document.createElement('div');
        summaryElement.className = 'budget-summary';
        summaryElement.innerHTML = `
            <h4>이번 달 예산 요약</h4>
            <div class="summary-grid">
                <div class="summary-item">
                    <span class="summary-label">총 예산:</span>
                    <span class="summary-value">${formatCurrency(totalBudget)}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">총 지출:</span>
                    <span class="summary-value">${formatCurrency(totalSpent)}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">잔여 예산:</span>
                    <span class="summary-value ${totalRemaining >= 0 ? 'positive' : 'negative'}">
                        ${formatCurrency(Math.abs(totalRemaining))}
                    </span>
                </div>
            </div>
        `;
        budgetsList.insertBefore(summaryElement, budgetsList.firstChild);
    }
}

// 통화 포맷팅
function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW',
        maximumFractionDigits: 0
    }).format(amount);
}

// 새 예산 추가
function addBudget() {
    const category = budgetCategoryInput.value.trim();
    const limit = parseFloat(budgetLimitInput.value);

    if (!category || !limit || limit <= 0) {
        alert('카테고리명과 올바른 예산 한도를 입력해주세요.');
        return;
    }

    // 동일한 카테고리가 이미 있는지 확인
    if (budgets.find(budget => budget.category === category)) {
        alert('이미 해당 카테고리의 예산이 설정되어 있습니다.');
        return;
    }

    const newBudget = {
        id: generateId(),
        category,
        limit,
        createdAt: new Date().toISOString()
    };

    budgets.push(newBudget);
    saveData('budgets', budgets);
    renderBudgets();

    // 폼 리셋
    budgetCategoryInput.value = '';
    budgetLimitInput.value = '';
}

// 예산 수정
function editBudget(budgetId) {
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) return;

    const newLimit = prompt(`"${budget.category}"의 새 예산 한도를 입력하세요:`, budget.limit);
    if (newLimit === null) return;

    const limitValue = parseFloat(newLimit);
    if (isNaN(limitValue) || limitValue <= 0) {
        alert('올바른 예산 한도를 입력해주세요.');
        return;
    }

    budget.limit = limitValue;
    budget.updatedAt = new Date().toISOString();
    saveData('budgets', budgets);
    renderBudgets();
}

// 예산 삭제
function deleteBudget(budgetId) {
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) return;

    if (confirm(`"${budget.category}" 예산을 삭제하시겠습니까?`)) {
        budgets = budgets.filter(b => b.id !== budgetId);
        saveData('budgets', budgets);
        renderBudgets();
    }
}

// 예산 추가 버튼 클릭 처리
function handleAddBudget(e) {
    e.preventDefault();
    addBudget();
}

// 예산 액션 처리
function handleBudgetAction(e) {
    if (e.target.classList.contains('edit-budget-btn')) {
        const budgetId = e.target.dataset.id;
        editBudget(budgetId);
    } else if (e.target.classList.contains('delete-budget-btn')) {
        const budgetId = e.target.dataset.id;
        deleteBudget(budgetId);
    }
}

// 예산 추적 카드 초기화
export function initBudgetTrackerCard() {
    budgetCategoryInput = document.getElementById('budget-category');
    budgetLimitInput = document.getElementById('budget-limit');
    addBudgetBtn = document.getElementById('add-budget-btn');
    budgetsList = document.getElementById('budgets-list');

    if (!budgetCategoryInput || !addBudgetBtn) {
        console.error('Budget tracker card elements not found');
        return;
    }

    // 데이터 로드
    budgets = loadData('budgets') || [];

    // 이벤트 리스너 등록
    addBudgetBtn.addEventListener('click', handleAddBudget);
    if (budgetsList) {
        budgetsList.addEventListener('click', handleBudgetAction);
    }

    // 초기 렌더링
    renderBudgets();
}

// 예산 추적 카드 정리
export function cleanupBudgetTrackerCard() {
    if (addBudgetBtn) addBudgetBtn.removeEventListener('click', handleAddBudget);
    if (budgetsList) budgetsList.removeEventListener('click', handleBudgetAction);
}

export { renderBudgets, addBudget, editBudget, deleteBudget };