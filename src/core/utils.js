// 공통 유틸리티 함수들

// 시간 포맷팅 함수 (초를 MM:SS 형태로 변환)
export const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

// TTS 음성 출력 함수
export const speak = (text, force = false, isTtsEnabled = true) => {
    if (!isTtsEnabled && !force) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    speechSynthesis.speak(utterance);
};

// 위도/경도를 한국 기상청 격자 좌표로 변환하는 함수
export const toGrid = (lat, lon) => {
    const RE = 6371.00877, GRID = 5.0, SLAT1 = 30.0, SLAT2 = 60.0, OLON = 126.0, OLAT = 38.0;
    const XO = 43, YO = 136, DEGRAD = Math.PI / 180.0;
    const re = RE / GRID, slat1 = SLAT1 * DEGRAD, slat2 = SLAT2 * DEGRAD, olon = OLON * DEGRAD, olat = OLAT * DEGRAD;
    let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
    let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
    let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
    ro = re * sf / Math.pow(ro, sn);
    let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
    ra = re * sf / Math.pow(ra, sn);
    let theta = lon * DEGRAD - olon;
    if (theta > Math.PI) theta -= 2.0 * Math.PI;
    if (theta < -Math.PI) theta += 2.0 * Math.PI;
    theta *= sn;
    const x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
    const y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
    return { x, y };
};

// 날씨 아이콘 반환 함수
export const getWeatherIcon = (weather) => {
    const icons = {
        '맑음': '☀️',
        '구름많음': '☁️',
        '흐림': '☁️',
        '비': '🌧️',
        '비/눈': '🌨️',
        '눈': '❄️',
        '빗방울': '💧',
        '빗방울/눈날림': '🌨️',
        '눈날림': '🌨️'
    };
    return icons[weather] || '❔';
};

// localStorage 저장 함수
export const saveData = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// localStorage 로드 함수
export const loadData = (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
};

// 날짜 포맷팅 함수 (YYYY.MM.DD 형태)
export const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}.${month}.${day}`;
};

// 날짜 문자열을 Date 객체로 변환
export const parseDate = (dateString) => {
    const [year, month, day] = dateString.split('.');
    return new Date(year, month - 1, day);
};

// 시간 문자열 (HH:MM) 유효성 검사
export const isValidTime = (timeString) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeString);
};

// 현재 시간을 HH:MM 형태로 반환
export const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

// 두 시간 문자열 비교 (HH:MM 형태)
export const compareTime = (time1, time2) => {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    const totalMinutes1 = h1 * 60 + m1;
    const totalMinutes2 = h2 * 60 + m2;
    return totalMinutes1 - totalMinutes2;
};

// 오디오 재생 함수
export const playAudio = (audioBlob) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    return audio.play();
};

// 파일 크기를 읽기 쉬운 형태로 변환
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 랜덤 ID 생성 함수
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};