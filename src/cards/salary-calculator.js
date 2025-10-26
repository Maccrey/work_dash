// 급여 계산기 카드 모듈
import { saveData, loadData } from '../core/utils.js';

// DOM 요소들
let salaryTypeSelect, salaryAmountInput, workHoursInput, calculateSalaryBtn;
let grossMonthly, estimatedTax, netMonthly, annualSalary;

// 급여 계산 결과 업데이트
function updateSalaryResults(results) {
    if (grossMonthly) grossMonthly.textContent = formatCurrency(results.grossMonthly);
    if (estimatedTax) estimatedTax.textContent = formatCurrency(results.tax);
    if (netMonthly) netMonthly.textContent = formatCurrency(results.netMonthly);
    if (annualSalary) annualSalary.textContent = formatCurrency(results.annualSalary);
}

// 급여 계산
function calculateSalary() {
    const salaryType = salaryTypeSelect.value;
    const amount = parseFloat(salaryAmountInput.value);
    const workHours = parseFloat(workHoursInput.value) || 0;

    if (!amount || amount <= 0) {
        alert('올바른 금액을 입력해주세요.');
        return;
    }

    let grossMonthlyAmount = 0;

    switch (salaryType) {
        case 'hourly':
            if (!workHours || workHours <= 0) {
                alert('시급인 경우 근무 시간을 입력해주세요.');
                return;
            }
            // 시급 * 시간 * 주 4.33주 (월평균)
            grossMonthlyAmount = amount * workHours * 4.33;
            break;
        case 'monthly':
            grossMonthlyAmount = amount;
            break;
        case 'annual':
            grossMonthlyAmount = amount / 12;
            break;
        default:
            alert('급여 유형을 선택해주세요.');
            return;
    }

    // 세금 계산 (간단한 추정)
    const tax = calculateEstimatedTax(grossMonthlyAmount * 12);
    const monthlyTax = tax / 12;
    const netMonthlyAmount = grossMonthlyAmount - monthlyTax;
    const annualSalaryAmount = grossMonthlyAmount * 12;

    const results = {
        grossMonthly: grossMonthlyAmount,
        tax: monthlyTax,
        netMonthly: netMonthlyAmount,
        annualSalary: annualSalaryAmount
    };

    updateSalaryResults(results);
    
    // 계산 결과 저장 (선택사항)
    saveCalculationHistory({
        type: salaryType,
        amount,
        workHours,
        results,
        date: new Date().toISOString()
    });
}

// 간단한 세금 추정 계산 (2024년 기준 근사치)
function calculateEstimatedTax(annualIncome) {
    // 소득세 + 지방소득세 + 국민연금 + 건강보험 + 고용보험 등의 간단한 추정
    let totalTax = 0;
    
    // 국민연금 (4.5%, 상한 482만원)
    const pensionBase = Math.min(annualIncome, 482 * 12 * 10000);
    totalTax += pensionBase * 0.045;
    
    // 건강보험 (3.545%)
    totalTax += annualIncome * 0.03545;
    
    // 고용보험 (0.9%)
    totalTax += annualIncome * 0.009;
    
    // 소득세 (누진세율 간단 적용)
    let incomeTax = 0;
    if (annualIncome > 88000000) {
        incomeTax = annualIncome * 0.42;
    } else if (annualIncome > 46000000) {
        incomeTax = annualIncome * 0.38;
    } else if (annualIncome > 30000000) {
        incomeTax = annualIncome * 0.35;
    } else if (annualIncome > 14000000) {
        incomeTax = annualIncome * 0.24;
    } else if (annualIncome > 5000000) {
        incomeTax = annualIncome * 0.15;
    } else {
        incomeTax = annualIncome * 0.06;
    }
    
    totalTax += incomeTax;
    
    // 지방소득세 (소득세의 10%)
    totalTax += incomeTax * 0.1;
    
    return totalTax;
}

// 통화 포맷팅
function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW',
        maximumFractionDigits: 0
    }).format(Math.round(amount));
}

// 계산 기록 저장
function saveCalculationHistory(calculation) {
    const history = loadData('salaryCalculationHistory') || [];
    history.push(calculation);
    
    // 최근 10개만 유지
    if (history.length > 10) {
        history.splice(0, history.length - 10);
    }
    
    saveData('salaryCalculationHistory', history);
}

// 급여 유형 변경 처리
function handleSalaryTypeChange() {
    const salaryType = salaryTypeSelect.value;
    const workHoursContainer = workHoursInput?.parentElement;
    
    if (workHoursContainer) {
        workHoursContainer.style.display = salaryType === 'hourly' ? 'block' : 'none';
    }
    
    // 플레이스홀더 업데이트
    if (salaryAmountInput) {
        switch (salaryType) {
            case 'hourly':
                salaryAmountInput.placeholder = '시급 (원)';
                break;
            case 'monthly':
                salaryAmountInput.placeholder = '월급 (원)';
                break;
            case 'annual':
                salaryAmountInput.placeholder = '연봉 (원)';
                break;
        }
    }
}

// 계산 버튼 클릭 처리
function handleCalculateSalary(e) {
    e.preventDefault();
    calculateSalary();
}

// 급여 계산기 카드 초기화
export function initSalaryCalculatorCard() {
    salaryTypeSelect = document.getElementById('salary-type');
    salaryAmountInput = document.getElementById('salary-amount');
    workHoursInput = document.getElementById('work-hours');
    calculateSalaryBtn = document.getElementById('calculate-salary-btn');
    grossMonthly = document.getElementById('gross-monthly');
    estimatedTax = document.getElementById('estimated-tax');
    netMonthly = document.getElementById('net-monthly');
    annualSalary = document.getElementById('annual-salary');

    if (!salaryTypeSelect || !calculateSalaryBtn) {
        console.error('Salary calculator card elements not found');
        return;
    }

    // 이벤트 리스너 등록
    calculateSalaryBtn.addEventListener('click', handleCalculateSalary);
    salaryTypeSelect.addEventListener('change', handleSalaryTypeChange);

    // 초기 상태 설정
    handleSalaryTypeChange();
}

// 급여 계산기 카드 정리
export function cleanupSalaryCalculatorCard() {
    if (calculateSalaryBtn) calculateSalaryBtn.removeEventListener('click', handleCalculateSalary);
    if (salaryTypeSelect) salaryTypeSelect.removeEventListener('change', handleSalaryTypeChange);
}

export { calculateSalary, updateSalaryResults };