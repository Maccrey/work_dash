// 단위 변환기 카드 모듈
import { saveData, loadData } from '../core/utils.js';

let conversionTypeSelect, fromValueInput, fromUnitSelect, toValueInput, toUnitSelect, convertBtn;

// 변환 단위 정의
const conversionUnits = {
    length: {
        name: '길이',
        units: {
            mm: { name: '밀리미터', factor: 0.001 },
            cm: { name: '센티미터', factor: 0.01 },
            m: { name: '미터', factor: 1 },
            km: { name: '킬로미터', factor: 1000 },
            inch: { name: '인치', factor: 0.0254 },
            ft: { name: '피트', factor: 0.3048 },
            yard: { name: '야드', factor: 0.9144 },
            mile: { name: '마일', factor: 1609.34 }
        }
    },
    weight: {
        name: '무게',
        units: {
            mg: { name: '밀리그램', factor: 0.000001 },
            g: { name: '그램', factor: 0.001 },
            kg: { name: '킬로그램', factor: 1 },
            ton: { name: '톤', factor: 1000 },
            oz: { name: '온스', factor: 0.0283495 },
            lb: { name: '파운드', factor: 0.453592 }
        }
    },
    temperature: {
        name: '온도',
        units: {
            celsius: { name: '섭씨(°C)', factor: 1 },
            fahrenheit: { name: '화씨(°F)', factor: 1 },
            kelvin: { name: '켈빈(K)', factor: 1 }
        }
    },
    area: {
        name: '면적',
        units: {
            'mm2': { name: '제곱밀리미터', factor: 0.000001 },
            'cm2': { name: '제곱센티미터', factor: 0.0001 },
            'm2': { name: '제곱미터', factor: 1 },
            'km2': { name: '제곱킬로미터', factor: 1000000 },
            'in2': { name: '제곱인치', factor: 0.00064516 },
            'ft2': { name: '제곱피트', factor: 0.092903 },
            acre: { name: '에이커', factor: 4046.86 },
            pyeong: { name: '평', factor: 3.30579 }
        }
    }
};

// 환율 데이터 (실제 환경에서는 API에서 가져와야 함)
let currencyRates = {
    KRW: 1,
    USD: 0.00075,
    EUR: 0.00069,
    JPY: 0.11,
    CNY: 0.0054,
    GBP: 0.00059
};

function updateUnitOptions() {
    const selectedType = conversionTypeSelect.value;
    
    if (selectedType === 'currency') {
        updateCurrencyOptions();
        return;
    }
    
    const units = conversionUnits[selectedType]?.units || {};
    
    // 기존 옵션 제거
    fromUnitSelect.innerHTML = '';
    toUnitSelect.innerHTML = '';
    
    // 새 옵션 추가
    Object.entries(units).forEach(([key, unit]) => {
        const fromOption = new Option(unit.name, key);
        const toOption = new Option(unit.name, key);
        fromUnitSelect.add(fromOption);
        toUnitSelect.add(toOption);
    });
    
    // 기본 선택값 설정
    if (fromUnitSelect.options.length > 0) {
        fromUnitSelect.selectedIndex = 0;
        toUnitSelect.selectedIndex = Math.min(1, toUnitSelect.options.length - 1);
    }
}

function updateCurrencyOptions() {
    const currencies = [
        { code: 'KRW', name: '한국 원' },
        { code: 'USD', name: '미국 달러' },
        { code: 'EUR', name: '유로' },
        { code: 'JPY', name: '일본 엔' },
        { code: 'CNY', name: '중국 위안' },
        { code: 'GBP', name: '영국 파운드' }
    ];
    
    fromUnitSelect.innerHTML = '';
    toUnitSelect.innerHTML = '';
    
    currencies.forEach(currency => {
        const fromOption = new Option(`${currency.name} (${currency.code})`, currency.code);
        const toOption = new Option(`${currency.name} (${currency.code})`, currency.code);
        fromUnitSelect.add(fromOption);
        toUnitSelect.add(toOption);
    });
    
    // 기본값: KRW -> USD
    fromUnitSelect.value = 'KRW';
    toUnitSelect.value = 'USD';
}

function convert() {
    const fromValue = parseFloat(fromValueInput.value);
    if (isNaN(fromValue)) {
        alert('올바른 숫자를 입력해주세요.');
        fromValueInput.focus();
        return;
    }
    
    const conversionType = conversionTypeSelect.value;
    const fromUnit = fromUnitSelect.value;
    const toUnit = toUnitSelect.value;
    
    let result;
    
    switch (conversionType) {
        case 'temperature':
            result = convertTemperature(fromValue, fromUnit, toUnit);
            break;
        case 'currency':
            result = convertCurrency(fromValue, fromUnit, toUnit);
            break;
        default:
            result = convertStandardUnits(fromValue, fromUnit, toUnit, conversionType);
            break;
    }
    
    toValueInput.value = result.toFixed(6).replace(/\.?0+$/, '');
}

function convertTemperature(value, fromUnit, toUnit) {
    // 먼저 섭씨로 변환
    let celsius;
    switch (fromUnit) {
        case 'fahrenheit':
            celsius = (value - 32) * 5/9;
            break;
        case 'kelvin':
            celsius = value - 273.15;
            break;
        default:
            celsius = value;
            break;
    }
    
    // 섭씨에서 목표 단위로 변환
    switch (toUnit) {
        case 'fahrenheit':
            return celsius * 9/5 + 32;
        case 'kelvin':
            return celsius + 273.15;
        default:
            return celsius;
    }
}

function convertCurrency(value, fromCurrency, toCurrency) {
    // KRW를 기준으로 변환
    const fromRate = currencyRates[fromCurrency] || 1;
    const toRate = currencyRates[toCurrency] || 1;
    
    // 1. 입력값을 KRW로 변환
    const krwValue = value / fromRate;
    // 2. KRW에서 목표 통화로 변환
    return krwValue * toRate;
}

function convertStandardUnits(value, fromUnit, toUnit, type) {
    const units = conversionUnits[type]?.units || {};
    const fromFactor = units[fromUnit]?.factor || 1;
    const toFactor = units[toUnit]?.factor || 1;
    
    // 기준 단위로 변환한 후 목표 단위로 변환
    const baseValue = value * fromFactor;
    return baseValue / toFactor;
}

function handleConversionTypeChange() {
    updateUnitOptions();
    // 값이 있다면 자동 변환
    if (fromValueInput.value) {
        convert();
    }
}

function handleConvert(e) {
    e.preventDefault();
    convert();
}

function handleFromValueInput() {
    // 실시간 변환
    if (fromValueInput.value && !isNaN(parseFloat(fromValueInput.value))) {
        convert();
    } else {
        toValueInput.value = '';
    }
}

export function initUnitConverterCard() {
    conversionTypeSelect = document.getElementById('conversion-type');
    fromValueInput = document.getElementById('from-value');
    fromUnitSelect = document.getElementById('from-unit');
    toValueInput = document.getElementById('to-value');
    toUnitSelect = document.getElementById('to-unit');
    convertBtn = document.getElementById('convert-btn');

    if (!conversionTypeSelect || !fromValueInput) return;

    // 환율 데이터 로드 (저장된 데이터가 있다면)
    const savedRates = loadData('currencyRates');
    if (savedRates) {
        currencyRates = savedRates;
    }

    // 이벤트 리스너 등록
    conversionTypeSelect.addEventListener('change', handleConversionTypeChange);
    if (convertBtn) convertBtn.addEventListener('click', handleConvert);
    fromValueInput.addEventListener('input', handleFromValueInput);
    
    // 단위 변경시에도 자동 변환
    if (fromUnitSelect) fromUnitSelect.addEventListener('change', handleFromValueInput);
    if (toUnitSelect) toUnitSelect.addEventListener('change', handleFromValueInput);

    // 초기 단위 옵션 설정
    updateUnitOptions();
}

export function cleanupUnitConverterCard() {
    if (conversionTypeSelect) conversionTypeSelect.removeEventListener('change', handleConversionTypeChange);
    if (convertBtn) convertBtn.removeEventListener('click', handleConvert);
    if (fromValueInput) fromValueInput.removeEventListener('input', handleFromValueInput);
    if (fromUnitSelect) fromUnitSelect.removeEventListener('change', handleFromValueInput);
    if (toUnitSelect) toUnitSelect.removeEventListener('change', handleFromValueInput);
}

export { convert, updateUnitOptions };