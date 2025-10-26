// 경비 관리 카드 모듈
import { saveData, loadData, generateId } from '../core/utils.js';

// DOM 요소들
let expenseDateInput, expenseCategorySelect, expenseAmountInput, expenseDescriptionInput;
let addExpenseBtn, monthlyExpenseSummary, expensesList;

// 경비 데이터
let expenses = [];

// 경비 목록 렌더링
function renderExpenses() {
    if (!expensesList) return;

    // 최신순으로 정렬
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    expensesList.innerHTML = '';
    sortedExpenses.slice(0, 20).forEach((expense) => {
        const expenseElement = document.createElement('div');
        expenseElement.className = 'expense-item';
        expenseElement.innerHTML = `
            <div class="expense-header">
                <span class="expense-category ${expense.category}">${getCategoryLabel(expense.category)}</span>
                <span class="expense-amount">${formatCurrency(expense.amount)}</span>
            </div>
            <div class="expense-description">${expense.description}</div>
            <div class="expense-footer">
                <span class="expense-date">${formatDate(expense.date)}</span>
                <button class="delete-expense-btn" data-id="${expense.id}">삭제</button>
            </div>
        `;
        expensesList.appendChild(expenseElement);
    });

    updateMonthlySummary();
}

// 카테고리 라벨
function getCategoryLabel(category) {
    const labels = {
        '식비': '🍽️ 식비',
        '교통비': '🚗 교통비',
        '사무용품': '📋 사무용품',
        '회의비': '💼 회의비',
        '교육비': '📚 교육비',
        '기타': '📦 기타'
    };
    return labels[category] || category;
}

// 월간 요약 업데이트
function updateMonthlySummary() {
    if (!monthlyExpenseSummary) return;

    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const monthlyExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= monthStart && expenseDate <= monthEnd;
    });

    // 카테고리별 집계
    const categorySummary = {};
    let totalAmount = 0;

    monthlyExpenses.forEach(expense => {
        totalAmount += expense.amount;
        if (categorySummary[expense.category]) {
            categorySummary[expense.category] += expense.amount;
        } else {
            categorySummary[expense.category] = expense.amount;
        }
    });

    // HTML 생성
    let summaryHTML = `
        <div class="summary-header">
            <h4>${currentMonth.getFullYear()}년 ${currentMonth.getMonth() + 1}월 경비</h4>
            <div class="total-amount">${formatCurrency(totalAmount)}</div>
        </div>
        <div class="category-breakdown">
    `;

    Object.entries(categorySummary)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, amount]) => {
            const percentage = totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0;
            summaryHTML += `
                <div class="category-item">
                    <span class="category-name">${getCategoryLabel(category)}</span>
                    <span class="category-amount">${formatCurrency(amount)} (${percentage}%)</span>
                </div>
            `;
        });

    summaryHTML += '</div>';
    monthlyExpenseSummary.innerHTML = summaryHTML;
}

// 통화 포맷팅
function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW'
    }).format(amount);
}

// 날짜 포맷팅
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ko-KR');
}

// 새 경비 추가
function addExpense() {
    const date = expenseDateInput.value;
    const category = expenseCategorySelect.value;
    const amount = parseFloat(expenseAmountInput.value);
    const description = expenseDescriptionInput.value.trim();

    if (!date || !category || !amount || !description) {
        alert('모든 필드를 입력해주세요.');
        return;
    }

    if (amount <= 0) {
        alert('올바른 금액을 입력해주세요.');
        return;
    }

    const newExpense = {
        id: generateId(),
        date,
        category,
        amount,
        description,
        createdAt: new Date().toISOString()
    };

    expenses.push(newExpense);
    saveData('expenses', expenses);
    renderExpenses();

    // 폼 리셋
    expenseDateInput.value = new Date().toISOString().split('T')[0]; // 오늘 날짜로 리셋
    expenseCategorySelect.value = '식비';
    expenseAmountInput.value = '';
    expenseDescriptionInput.value = '';
}

// 경비 삭제
function deleteExpense(expenseId) {
    if (confirm('이 경비 기록을 삭제하시겠습니까?')) {
        expenses = expenses.filter(expense => expense.id !== expenseId);
        saveData('expenses', expenses);
        renderExpenses();
    }
}

// 경비 추가 버튼 클릭 처리
function handleAddExpense(e) {
    e.preventDefault();
    addExpense();
}

// 삭제 버튼 클릭 처리
function handleDeleteExpense(e) {
    if (e.target.classList.contains('delete-expense-btn')) {
        const expenseId = e.target.dataset.id;
        deleteExpense(expenseId);
    }
}

// 경비 관리 카드 초기화
export function initExpenseManagerCard() {
    expenseDateInput = document.getElementById('expense-date');
    expenseCategorySelect = document.getElementById('expense-category');
    expenseAmountInput = document.getElementById('expense-amount');
    expenseDescriptionInput = document.getElementById('expense-description');
    addExpenseBtn = document.getElementById('add-expense-btn');
    monthlyExpenseSummary = document.getElementById('monthly-expense-summary');
    expensesList = document.getElementById('expenses-list');

    if (!expenseDateInput || !addExpenseBtn) {
        console.error('Expense manager card elements not found');
        return;
    }

    // 데이터 로드
    expenses = loadData('expenses') || [];

    // 기본값 설정
    if (expenseDateInput) {
        expenseDateInput.value = new Date().toISOString().split('T')[0];
    }

    // 이벤트 리스너 등록
    addExpenseBtn.addEventListener('click', handleAddExpense);
    if (expensesList) {
        expensesList.addEventListener('click', handleDeleteExpense);
    }

    // 초기 렌더링
    renderExpenses();
}

// 경비 관리 카드 정리
export function cleanupExpenseManagerCard() {
    if (addExpenseBtn) addExpenseBtn.removeEventListener('click', handleAddExpense);
    if (expensesList) expensesList.removeEventListener('click', handleDeleteExpense);
}

export { renderExpenses, addExpense, deleteExpense };