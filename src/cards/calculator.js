// 계산기 카드 모듈
import { expression, updateExpression } from '../core/state.js';

// DOM 요소들
let calculatorDisplay, calculatorButtons;

// 계산기 디스플레이 업데이트
function updateCalculatorDisplay() {
    calculatorDisplay.textContent = expression;
}

// 숫자 버튼 클릭 처리
function handleNumberClick(num) {
    const newExpression = expression === '0' ? num : expression + num;
    updateExpression(newExpression);
    updateCalculatorDisplay();
}

// 연산자 버튼 클릭 처리
function handleOperatorClick(op) {
    const lastChar = expression.slice(-1);
    const operators = ['+', '-', '×', '÷'];
    const newExpression = operators.includes(lastChar) 
        ? expression.slice(0, -1) + op 
        : expression + op;
    updateExpression(newExpression);
    updateCalculatorDisplay();
}

// 등호(=) 버튼 클릭 처리
function handleEqualsClick() {
    try {
        // 수학 연산자를 JavaScript 연산자로 변환
        const evalExpression = expression
            .replace(/×/g, '*')
            .replace(/÷/g, '/');
        
        // eval 사용 (보안상 주의가 필요하지만 계산기 용도로는 적절)
        const result = String(eval(evalExpression));
        updateExpression(result);
    } catch (error) {
        console.error('Calculator error:', error);
        updateExpression('Error');
    }
    updateCalculatorDisplay();
}

// 클리어(C) 버튼 클릭 처리
function handleClearClick() {
    updateExpression('0');
    updateCalculatorDisplay();
}

// 소수점(.) 버튼 클릭 처리
function handleDecimalClick() {
    // 현재 입력 중인 숫자 부분을 찾기 위해 마지막 연산자 이후의 문자열 확인
    const lastSegment = expression.split(/[+\-×÷]/).pop();
    
    // 이미 소수점이 있는 경우 추가하지 않음
    if (!lastSegment.includes('.')) {
        const newExpression = expression + '.';
        updateExpression(newExpression);
        updateCalculatorDisplay();
    }
}

// 계산기 버튼 클릭 이벤트 처리
function handleButtonClick(e) {
    const button = e.target;
    if (!button.classList.contains('calculator-button')) return;

    const value = button.textContent;
    
    // 숫자 버튼
    if (/^[0-9]$/.test(value)) {
        handleNumberClick(value);
    }
    // 연산자 버튼
    else if (['+', '-', '×', '÷'].includes(value)) {
        handleOperatorClick(value);
    }
    // 등호 버튼
    else if (value === '=') {
        handleEqualsClick();
    }
    // 클리어 버튼
    else if (value === 'C') {
        handleClearClick();
    }
    // 소수점 버튼
    else if (value === '.') {
        handleDecimalClick();
    }
    // 백스페이스 버튼 (있는 경우)
    else if (value === '←' || value === 'Backspace') {
        handleBackspaceClick();
    }
}

// 백스페이스 기능 (선택적)
function handleBackspaceClick() {
    if (expression.length > 1) {
        const newExpression = expression.slice(0, -1);
        updateExpression(newExpression);
    } else {
        updateExpression('0');
    }
    updateCalculatorDisplay();
}

// 키보드 입력 처리
function handleKeydown(e) {
    // 숫자 키
    if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleNumberClick(e.key);
    }
    // 연산자 키
    else if (e.key === '+') {
        e.preventDefault();
        handleOperatorClick('+');
    }
    else if (e.key === '-') {
        e.preventDefault();
        handleOperatorClick('-');
    }
    else if (e.key === '*') {
        e.preventDefault();
        handleOperatorClick('×');
    }
    else if (e.key === '/') {
        e.preventDefault();
        handleOperatorClick('÷');
    }
    // Enter 또는 = 키
    else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEqualsClick();
    }
    // Escape 또는 C 키
    else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClearClick();
    }
    // 소수점 키
    else if (e.key === '.') {
        e.preventDefault();
        handleDecimalClick();
    }
    // 백스페이스 키
    else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspaceClick();
    }
}

// 계산기 카드 초기화
export function initCalculatorCard() {
    // DOM 요소 가져오기
    calculatorDisplay = document.getElementById('calculator-display');
    calculatorButtons = document.querySelectorAll('#calculator-card .calculator-button');

    // 이벤트 리스너 등록
    const calculatorCard = document.getElementById('calculator-card');
    if (calculatorCard) {
        calculatorCard.addEventListener('click', handleButtonClick);
    }

    // 키보드 이벤트 리스너 등록 (계산기 카드에 포커스가 있을 때만)
    document.addEventListener('keydown', handleKeydown);

    // 초기 디스플레이 업데이트
    updateCalculatorDisplay();
}

// 계산기 카드 정리
export function cleanupCalculatorCard() {
    document.removeEventListener('keydown', handleKeydown);
}

// 외부에서 사용할 수 있는 함수들 내보내기
export { 
    updateCalculatorDisplay, 
    handleNumberClick, 
    handleOperatorClick, 
    handleEqualsClick, 
    handleClearClick, 
    handleDecimalClick 
};