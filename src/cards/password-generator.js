// 비밀번호 생성기 카드 모듈
import { generateId } from '../core/utils.js';

let passwordLengthInput, includeUppercaseCheck, includeLowercaseCheck, includeNumbersCheck, includeSymbolsCheck;
let generatePasswordBtn, generatedPasswordInput, copyPasswordBtn, passwordStrengthIndicator;

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

function generatePassword() {
    const length = parseInt(passwordLengthInput.value);
    const includeUpper = includeUppercaseCheck.checked;
    const includeLower = includeLowercaseCheck.checked;
    const includeNums = includeNumbersCheck.checked;
    const includeSyms = includeSymbolsCheck.checked;

    if (length < 4 || length > 50) {
        alert('비밀번호 길이는 4-50자 사이여야 합니다.');
        return;
    }

    if (!includeUpper && !includeLower && !includeNums && !includeSyms) {
        alert('최소 하나 이상의 문자 유형을 선택해주세요.');
        return;
    }

    let charset = '';
    let requiredChars = [];
    
    if (includeLower) {
        charset += LOWERCASE;
        requiredChars.push(LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)]);
    }
    if (includeUpper) {
        charset += UPPERCASE;
        requiredChars.push(UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)]);
    }
    if (includeNums) {
        charset += NUMBERS;
        requiredChars.push(NUMBERS[Math.floor(Math.random() * NUMBERS.length)]);
    }
    if (includeSyms) {
        charset += SYMBOLS;
        requiredChars.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    }

    let password = '';
    
    // 필수 문자를 먼저 추가
    requiredChars.forEach(char => password += char);
    
    // 나머지 길이만큼 랜덤 문자 추가
    for (let i = password.length; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // 문자 순서 섞기
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    generatedPasswordInput.value = password;
    updatePasswordStrength(password);
    
    // 복사 버튼 활성화
    if (copyPasswordBtn) {
        copyPasswordBtn.disabled = false;
    }
}

function updatePasswordStrength(password) {
    if (!passwordStrengthIndicator) return;

    const strength = calculatePasswordStrength(password);
    const strengthLevels = ['매우 약함', '약함', '보통', '강함', '매우 강함'];
    const strengthColors = ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997'];
    
    passwordStrengthIndicator.textContent = strengthLevels[strength.level];
    passwordStrengthIndicator.style.color = strengthColors[strength.level];
}

function calculatePasswordStrength(password) {
    let score = 0;
    
    // 길이 점수
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    
    // 문자 유형 점수
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // 다양성 점수
    const uniqueChars = new Set(password).size;
    if (uniqueChars >= password.length * 0.7) score += 1;
    
    const level = Math.min(Math.floor(score / 2), 4);
    return { score, level };
}

function copyPassword() {
    if (!generatedPasswordInput.value) {
        alert('먼저 비밀번호를 생성해주세요.');
        return;
    }

    navigator.clipboard.writeText(generatedPasswordInput.value).then(() => {
        alert('비밀번호가 클립보드에 복사되었습니다.');
        
        // 복사 버튼 임시 피드백
        const originalText = copyPasswordBtn.textContent;
        copyPasswordBtn.textContent = '복사됨!';
        copyPasswordBtn.style.backgroundColor = '#28a745';
        
        setTimeout(() => {
            copyPasswordBtn.textContent = originalText;
            copyPasswordBtn.style.backgroundColor = '';
        }, 2000);
    }).catch(() => {
        // 클립보드 API 실패 시 폴백
        generatedPasswordInput.select();
        document.execCommand('copy');
        alert('비밀번호가 복사되었습니다.');
    });
}

function handleGeneratePassword(e) {
    e.preventDefault();
    generatePassword();
}

function handleCopyPassword(e) {
    e.preventDefault();
    copyPassword();
}

function handleLengthChange() {
    const length = parseInt(passwordLengthInput.value);
    if (length < 4) passwordLengthInput.value = 4;
    if (length > 50) passwordLengthInput.value = 50;
}

export function initPasswordGeneratorCard() {
    passwordLengthInput = document.getElementById('password-length');
    includeUppercaseCheck = document.getElementById('include-uppercase');
    includeLowercaseCheck = document.getElementById('include-lowercase');
    includeNumbersCheck = document.getElementById('include-numbers');
    includeSymbolsCheck = document.getElementById('include-symbols');
    generatePasswordBtn = document.getElementById('generate-password-btn');
    generatedPasswordInput = document.getElementById('generated-password');
    copyPasswordBtn = document.getElementById('copy-password-btn');
    passwordStrengthIndicator = document.getElementById('password-strength-indicator');

    if (!passwordLengthInput || !generatePasswordBtn) return;

    generatePasswordBtn.addEventListener('click', handleGeneratePassword);
    if (copyPasswordBtn) {
        copyPasswordBtn.addEventListener('click', handleCopyPassword);
        copyPasswordBtn.disabled = true; // 초기에는 비활성화
    }
    
    if (passwordLengthInput) {
        passwordLengthInput.addEventListener('input', handleLengthChange);
    }

    // 초기 비밀번호 생성
    generatePassword();
}

export function cleanupPasswordGeneratorCard() {
    if (generatePasswordBtn) generatePasswordBtn.removeEventListener('click', handleGeneratePassword);
    if (copyPasswordBtn) copyPasswordBtn.removeEventListener('click', handleCopyPassword);
    if (passwordLengthInput) passwordLengthInput.removeEventListener('input', handleLengthChange);
}

export { generatePassword, copyPassword, updatePasswordStrength };