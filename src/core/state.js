// 전역 상태 관리
import { saveData, loadData } from './utils.js';

// API 키 (한국 기상청 공공데이터 API)
export const API_KEY = 'SPoonI/4mUJxw4Vmxo4aGH3kaoUjNxNM8Ykjd8OpB/qRJ6M+Gd2+A5mIjSCN+YY6Fp1LIsACNnYlujeHw45E5A==';

// 날씨 시스템 상태
export let isWeatherSystemActive = false;
export let minuteInterval = null;
export let weatherInterval = null;
export let userCoords = null;
export let previousHourlyForecast = [];

// 데이터 배열들
export let todos = [];
export let notes = [];
export let recordings = [];
export let ttsSchedules = [];
export let attendanceRecords = {};
export let holidays = {};

// 날짜 상태
export let currentCalendarDate = new Date();
export let currentTodoDate = new Date();

// 뽀모도로 타이머 상태
export let pomoInterval = null;
export let pomoTimeLeft = 25 * 60; // 기본 25분
export let isPomoRunning = false;
export let isPomoWorkSession = true;
export let workDuration = 25;
export let breakDuration = 5;

// 카드 표시/숨김 상태
export let cardVisibility = {};

// 계산기 상태
export let expression = '0';

// 음성 메모 상태
export let mediaRecorder;
export let audioChunks = [];
export let recordingTimerInterval = null;

// TTS 상태
export let isTtsEnabled = true;
export let isTodoTtsEnabled = true;

// 상태 업데이트 함수들
export const updateWeatherSystemActive = (value) => {
    isWeatherSystemActive = value;
};

export const updateUserCoords = (coords) => {
    userCoords = coords;
};

export const updatePreviousHourlyForecast = (forecast) => {
    previousHourlyForecast = forecast;
    saveData('previousHourlyForecast', forecast);
};

export const updateTodos = (newTodos) => {
    todos = newTodos;
    saveData('todos', todos);
};

export const addTodo = (todo) => {
    todos.push(todo);
    saveData('todos', todos);
};

export const removeTodo = (index) => {
    todos.splice(index, 1);
    saveData('todos', todos);
};

export const updateNotes = (newNotes) => {
    notes = newNotes;
    saveData('notes', notes);
};

export const addNote = (note) => {
    notes.push(note);
    saveData('notes', notes);
};

export const removeNote = (index) => {
    notes.splice(index, 1);
    saveData('notes', notes);
};

export const updateRecordings = (newRecordings) => {
    recordings = newRecordings;
    saveData('voiceRecordings', recordings);
};

export const addRecording = (recording) => {
    recordings.push(recording);
    saveData('voiceRecordings', recordings);
};

export const removeRecording = (index) => {
    recordings.splice(index, 1);
    saveData('voiceRecordings', recordings);
};

export const updateTtsSchedules = (newSchedules) => {
    ttsSchedules = newSchedules;
    saveData('ttsSchedules', ttsSchedules);
};

export const addTtsSchedule = (schedule) => {
    ttsSchedules.push(schedule);
    saveData('ttsSchedules', ttsSchedules);
};

export const removeTtsSchedule = (index) => {
    ttsSchedules.splice(index, 1);
    saveData('ttsSchedules', ttsSchedules);
};

export const updateAttendanceRecords = (newRecords) => {
    attendanceRecords = newRecords;
    saveData('attendanceRecords', attendanceRecords);
};

export const addAttendanceRecord = (date, record) => {
    attendanceRecords[date] = record;
    saveData('attendanceRecords', attendanceRecords);
};

export const updateHolidays = (newHolidays) => {
    holidays = newHolidays;
};

export const updateCurrentCalendarDate = (date) => {
    currentCalendarDate = date;
};

export const updateCurrentTodoDate = (date) => {
    currentTodoDate = date;
};

export const updatePomoTimeLeft = (time) => {
    pomoTimeLeft = time;
};

export const updatePomoRunning = (running) => {
    isPomoRunning = running;
};

export const updatePomoWorkSession = (isWork) => {
    isPomoWorkSession = isWork;
};

export const updatePomoDurations = (work, breakTime) => {
    workDuration = work;
    breakDuration = breakTime;
    const pomoSettings = { workDuration, breakDuration };
    saveData('pomoSettings', pomoSettings);
};

export const updateCardVisibility = (newVisibility) => {
    cardVisibility = newVisibility;
    saveData('cardVisibility', cardVisibility);
};

export const updateExpression = (newExpression) => {
    expression = newExpression;
};

export const updateMediaRecorder = (recorder) => {
    mediaRecorder = recorder;
};

export const updateAudioChunks = (chunks) => {
    audioChunks = chunks;
};

export const updateTtsEnabled = (enabled) => {
    isTtsEnabled = enabled;
    saveData('ttsEnabled', enabled);
};

export const updateTodoTtsEnabled = (enabled) => {
    isTodoTtsEnabled = enabled;
    saveData('todoTtsEnabled', enabled);
};

// 데이터 초기화 및 로드 함수
export const loadAllData = () => {
    todos = loadData('todos') || [];
    notes = loadData('notes') || [];
    recordings = loadData('voiceRecordings') || [];
    ttsSchedules = loadData('ttsSchedules') || [];
    attendanceRecords = loadData('attendanceRecords') || {};
    previousHourlyForecast = loadData('previousHourlyForecast') || [];
    
    // 설정 로드
    const ttsEnabled = loadData('ttsEnabled');
    if (ttsEnabled !== null) isTtsEnabled = ttsEnabled;
    
    const todoTtsEnabled = loadData('todoTtsEnabled');
    if (todoTtsEnabled !== null) isTodoTtsEnabled = todoTtsEnabled;
    
    const pomoSettings = loadData('pomoSettings');
    if (pomoSettings) {
        workDuration = pomoSettings.workDuration || 25;
        breakDuration = pomoSettings.breakDuration || 5;
    }
    
    cardVisibility = loadData('cardVisibility') || {};
};

// 모든 데이터 클리어 함수
export const clearAllData = () => {
    const keysToClear = [
        'todos', 'notes', 'voiceRecordings', 'ttsSchedules', 'previousHourlyForecast',
        'attendanceRecords', 'ttsEnabled', 'todoTtsEnabled', 'pomoSettings',
        'cardVisibility', 'cardOrder'
    ];
    
    keysToClear.forEach(key => localStorage.removeItem(key));
    
    // 상태 초기화
    todos = [];
    notes = [];
    recordings = [];
    ttsSchedules = [];
    attendanceRecords = {};
    previousHourlyForecast = [];
    isTtsEnabled = true;
    isTodoTtsEnabled = true;
    workDuration = 25;
    breakDuration = 5;
    cardVisibility = {};
    expression = '0';
    currentTodoDate = new Date();
    currentCalendarDate = new Date();
};