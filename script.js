document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const toggleButton = document.getElementById('toggleButton');
    const statusElem = document.getElementById('status');
    const weatherInfoElem = document.getElementById('weather-info');
    const currentWeatherElem = document.getElementById('current-weather');
    const currentTempElem = document.getElementById('current-temp');
    const hourlyForecastElem = document.getElementById('hourly-forecast');

    // Productivity Tools Elements
    const todoForm = document.getElementById('todo-form');
    const todoTimeInput = document.getElementById('todo-time');
    const todoTextInput = document.getElementById('todo-text');
    const todoPriorityInput = document.getElementById('todo-priority');
    const todoListElem = document.getElementById('todo-list');
    const doneListElem = document.getElementById('done-list');
    const currentTodoDateElem = document.getElementById('current-todo-date');
    const prevDateBtn = document.getElementById('prev-date-btn');
    const nextDateBtn = document.getElementById('next-date-btn');
    const pomoTimerElem = document.getElementById('pomodoro-timer');
    const pomoStatusElem = document.getElementById('pomodoro-status');
    const pomoStartPauseBtn = document.getElementById('pomo-start-pause');
    const pomoResetBtn = document.getElementById('pomo-reset');
    const pomoVisualTimerElem = document.getElementById('pomodoro-visual-timer');
    const pomoDigitalTimerElem = document.getElementById('pomodoro-digital-timer');
    const workTimeInput = document.getElementById('work-time');
    const breakTimeInput = document.getElementById('break-time');
    const setPomoTimeBtn = document.getElementById('set-pomo-time');
    const noteForm = document.getElementById('note-form');
    const noteInput = document.getElementById('note-input');
    const noteList = document.getElementById('note-list');
    const ttsToggle = document.getElementById('tts-toggle');
    const todoTtsToggle = document.getElementById('todo-tts-toggle');
    const ttsTimeInput = document.getElementById('tts-time-input');
    const ttsTextInput = document.getElementById('tts-text-input');
    const addTtsScheduleBtn = document.getElementById('add-tts-schedule-btn');
    const ttsScheduleList = document.getElementById('tts-schedule-list');
    const ttsPresetButtons = document.querySelector('.tts-preset-buttons');
    const workBreakScheduleModal = document.getElementById('work-break-schedule-modal');
    const setupWorkBreakScheduleBtn = document.getElementById('setup-work-break-schedule-btn');
    const closeBtn = workBreakScheduleModal.querySelector('.close-button');
    const saveWorkBreakScheduleBtn = document.getElementById('save-work-break-schedule-btn');

    // Settings Modal Elements
    const settingsIcon = document.getElementById('settings-icon');
    const settingsModal = document.getElementById('settings-modal');
    const settingsCloseBtn = settingsModal.querySelector('.close-button');
    const settingsCheckboxes = document.querySelectorAll('#settings-modal .settings-controls input[type="checkbox"]');
    const clearAllDataBtn = document.getElementById('clear-all-data-btn');

    // Attendance Tracker Elements
    const checkInBtn = document.getElementById('check-in-btn');
    const checkOutBtn = document.getElementById('check-out-btn');
    const statusSelect = document.getElementById('status-select');
    const applyStatusBtn = document.getElementById('apply-status-btn');
    const dailyAttendanceTableBody = document.querySelector('#daily-attendance-table tbody');
    const monthlyTotalDays = document.getElementById('monthly-total-days');
    const monthlyLateCount = document.getElementById('monthly-late-count');
    const monthlyEarlyCount = document.getElementById('monthly-early-count');
    const monthlySickCount = document.getElementById('monthly-sick-count');
    const monthlyAbsentCount = document.getElementById('monthly-absent-count');
    const monthlyAnnualLeaveCount = document.getElementById('monthly-annual-leave-count');
    const showMonthlyViewBtn = document.getElementById('show-monthly-view-btn');
    const monthlyCalendarView = document.getElementById('monthly-calendar-view');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const currentMonthYear = document.getElementById('current-month-year');
    const calendarGrid = document.getElementById('calendar-grid');

    // Voice Memo Elements
    const recordButton = document.getElementById('record-button');
    const recordingsList = document.getElementById('recordings-list');
    const recordingTagInput = document.getElementById('recording-tag-input');
    const recordingTimerElem = document.getElementById('recording-timer');

    // Card Visibility Settings Elements
    const toggleWeatherCard = document.getElementById('toggle-weather-card');
    const toggleNotesCard = document.getElementById('toggle-notes-card');
    const toggleVoiceMemoCard = document.getElementById('toggle-voice-memo-card');
    const togglePomodoroCard = document.getElementById('toggle-pomodoro-card');
    const toggleTodoCard = document.getElementById('toggle-todo-card');
    const toggleDoneCard = document.getElementById('toggle-done-card');
    const toggleAttendanceCard = document.getElementById('toggle-attendance-card');
    const toggleAttendanceSummaryCard = document.getElementById('toggle-attendance-summary-card');
    const toggleCalculatorCard = document.getElementById('toggle-calculator-card');

    // Calculator Elements
    const calculatorDisplay = document.getElementById('calculator-display');
    const calculatorButtons = document.querySelectorAll('#calculator-card .calculator-button');

    // --- Global State ---
    const API_KEY = 'SPoonI/4mUJxw4Vmxo4aGH3kaoUjNxNM8Ykjd8OpB/qRJ6M+Gd2+A5mIjSCN+YY6Fp1LIsACNnYlujeHw45E5A==';
    let isWeatherSystemActive = false;
    let minuteInterval = null;
    let weatherInterval = null;
    let userCoords = null;
    let previousHourlyForecast = [];
    let todos = [];
    let notes = [];
    let attendanceRecords = {};
    let holidays = {};
    let currentCalendarDate = new Date();
    let currentTodoDate = new Date();

    // Pomodoro State
    let pomoInterval = null;
    let pomoTimeLeft = 25 * 60;
    let isPomoRunning = false;
    let isPomoWorkSession = true;
    let workDuration = 25;
    let breakDuration = 5;

    // Card Visibility State
    let cardVisibility = {};

    // Calculator State
    let expression = '0';

    // Voice Memo State
    let mediaRecorder;
    let audioChunks = [];
    let recordings = [];
    let recordingTimerInterval = null;

    // TTS State
    let isTtsEnabled = true;
    let isTodoTtsEnabled = true;
    let ttsSchedules = [];

    // --- Utility Functions ---
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const speak = (text, force = false) => {
        if (!isTtsEnabled && !force) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        speechSynthesis.speak(utterance);
    };

    const toGrid = (lat, lon) => {
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

    const getWeatherIcon = (weather) => {
        const icons = { '맑음': '☀️', '구름많음': '☁️', '흐림': '☁️', '비': '🌧️', '비/눈': '🌨️', '눈': '❄️', '빗방울': '💧', '빗방울/눈날림': '🌨️', '눈날림': '🌨️' };
        return icons[weather] || '❔';
    };

    // --- LocalStorage Functions ---
    const saveData = (key, data) => localStorage.setItem(key, JSON.stringify(data));
    const loadData = (key) => JSON.parse(localStorage.getItem(key));

    const clearAllData = () => {
        const keysToClear = [
            'todos', 'notes', 'voiceRecordings', 'ttsSchedules', 'previousHourlyForecast',
            'attendanceRecords', 'ttsEnabled', 'todoTtsEnabled', 'pomoSettings',
            'cardVisibility', 'cardOrder', 'goals', 'timeEntries', 'achievements', 'projects', 'focusTime',
            'expenses', 'budgets', 'meetings', 'deadlines', 'taskTemplates', 'leaves',
            'contacts', 'feedbacks', 'handovers', 'learningPlans', 'skills', 'books'
        ];
        keysToClear.forEach(key => localStorage.removeItem(key));

        // Reset global state variables
        todos = [];
        notes = [];
        recordings = [];
        ttsSchedules = [];
        previousHourlyForecast = [];
        attendanceRecords = {};
        isTtsEnabled = true;
        isTodoTtsEnabled = true;
        workDuration = 25;
        breakDuration = 5;
        cardVisibility = {};
        expression = '0';
        currentTodoDate = new Date();
        goals = [];
        timeEntries = [];
        achievements = [];
        projects = [];
        focusStartTime = null;
        totalFocusTime = 0;
        expenses = [];
        budgets = [];
        meetings = [];
        deadlines = [];
        taskTemplates = [];
        leaves = [];
        contacts = [];
        feedbacks = [];
        handovers = [];
        learningPlans = [];
        skills = [];
        books = [];

        // Re-initialize and re-render UI
        initializeApp();
        alert('모든 데이터가 성공적으로 삭제되었습니다.');
    };

    // --- Card Visibility Functions ---
    const updateCardVisibility = () => {
        Object.keys(cardVisibility).forEach(key => {
            const card = document.getElementById(`${key}-card`);
            if (card) {
                card.style.display = cardVisibility[key] ? 'flex' : 'none';
            }
        });
        saveData('cardVisibility', cardVisibility);
    };

    const setupCardVisibilityListeners = () => {
        settingsCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const cardName = e.target.id.replace('toggle-', '').replace('-card', '');
                cardVisibility[cardName] = e.target.checked;
                updateCardVisibility();
            });
        });
    };

    // --- Calculator Functions ---
    const updateCalculatorDisplay = () => { calculatorDisplay.textContent = expression; };
    const handleNumberClick = (num) => {
        expression = expression === '0' ? num : expression + num;
        updateCalculatorDisplay();
    };
    const handleOperatorClick = (op) => {
        const lastChar = expression.slice(-1);
        expression = ['+', '-', '×', '÷'].includes(lastChar) ? expression.slice(0, -1) + op : expression + op;
        updateCalculatorDisplay();
    };
    const handleEqualsClick = () => {
        try {
            const evalExpression = expression.replace(/×/g, '*').replace(/÷/g, '/');
            expression = String(eval(evalExpression));
        } catch {
            expression = 'Error';
        }
        updateCalculatorDisplay();
    };
    const handleClearClick = () => { expression = '0'; updateCalculatorDisplay(); };
    const handleDecimalClick = () => {
        const lastSegment = expression.split(/[+\-×÷]/).pop();
        if (!lastSegment.includes('.')) {
            expression += '.';
            updateCalculatorDisplay();
        }
    };

    // --- TTS Schedule Functions ---
    const renderTtsSchedules = () => {
        ttsScheduleList.innerHTML = '';
        const sortedSchedules = ttsSchedules.sort((a, b) => a.time.localeCompare(b.time));
        sortedSchedules.forEach(schedule => {
            const li = document.createElement('li');
            li.dataset.id = schedule.id;
            li.innerHTML = `
                <strong>${schedule.time}</strong>
                <span>${schedule.text}</span>
                <button class="delete-tts-btn">❌</button>
            `;
            ttsScheduleList.appendChild(li);
        });
    };

    const addTtsSchedule = (time, text) => {
        if (ttsSchedules.some(s => s.time === time && s.text === text)) return; // Prevent duplicates
        ttsSchedules.push({ id: Date.now(), time, text, notified: false });
        saveData('ttsSchedules', ttsSchedules);
        renderTtsSchedules();
    };

    const deleteTtsSchedule = (id) => {
        ttsSchedules = ttsSchedules.filter(s => s.id !== id);
        saveData('ttsSchedules', ttsSchedules);
        renderTtsSchedules();
    };

    const generateWorkBreakSchedules = () => {
        const workStartTime = document.getElementById('work-start-time').value;
        const workEndTime = document.getElementById('work-end-time').value;
        const workDuration = parseInt(document.getElementById('work-duration-input').value);
        const breakDuration = parseInt(document.getElementById('break-duration-input').value);
        const lunchStartTime = document.getElementById('lunch-start-time').value;
        const lunchEndTime = document.getElementById('lunch-end-time').value;

        if (!workStartTime || !workEndTime || isNaN(workDuration) || isNaN(breakDuration) || !lunchStartTime || !lunchEndTime) {
            alert('모든 값을 올바르게 입력해주세요.');
            return;
        }

        const timeToMinutes = (time) => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        };

        const minutesToTime = (minutes) => {
            const h = Math.floor(minutes / 60).toString().padStart(2, '0');
            const m = (minutes % 60).toString().padStart(2, '0');
            return `${h}:${m}`;
        };

        let currentTime = timeToMinutes(workStartTime);
        const endTime = timeToMinutes(workEndTime);
        const lunchStart = timeToMinutes(lunchStartTime);
        const lunchEnd = timeToMinutes(lunchEndTime);

        addTtsSchedule(workStartTime, '업무를 시작할 시간입니다. 화이팅!');

        while (currentTime < endTime) {
            const breakTimeStart = currentTime + workDuration;
            if (breakTimeStart >= endTime) break;

            if (!(breakTimeStart >= lunchStart && breakTimeStart < lunchEnd)) {
                addTtsSchedule(minutesToTime(breakTimeStart), `${breakDuration}분간 휴식시간입니다.`);
            }

            const workTimeStart = breakTimeStart + breakDuration;
            if (workTimeStart >= endTime) break;

            if (!(workTimeStart >= lunchStart && workTimeStart < lunchEnd)) {
                addTtsSchedule(minutesToTime(workTimeStart), '휴식시간이 종료되었습니다.');
            }
            currentTime = workTimeStart;
        }

        addTtsSchedule(workEndTime, '업무를 종료할 시간입니다. 수고하셨습니다.');
        addTtsSchedule(lunchStartTime, '점심시간입니다. 맛있게 드세요.');
        addTtsSchedule(lunchEndTime, '점심시간이 종료되었습니다.');

        workBreakScheduleModal.classList.add('hidden');
    };

    // --- Weather Functions ---
    async function getWeatherData(x, y) {
        const now = new Date();
        let base_date = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
        const availableTimes = [2, 5, 8, 11, 14, 17, 20, 23];
        let currentHour = now.getHours();
        let base_hour = availableTimes.slice().reverse().find(hour => hour <= currentHour);

        if (base_hour === undefined) {
            now.setDate(now.getDate() - 1);
            base_date = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
            base_hour = 23;
        }

        const base_time = `${base_hour.toString().padStart(2, '0')}00`;
        const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${encodeURIComponent(API_KEY)}&pageNo=1&numOfRows=290&dataType=JSON&base_date=${base_date}&base_time=${base_time}&nx=${x}&ny=${y}`;

        try {
            const response = await fetch(url);
            const responseText = await response.text(); // Read as text first
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (jsonError) {
                console.error('JSON parsing error:', jsonError);
                console.error('Raw API response:', responseText);
                throw new Error('Invalid JSON response from API');
            }

            if (data.response.header.resultCode !== '00') throw new Error(`API Error: ${data.response.header.resultMsg}`);
            if (!data.response.body?.items?.item) throw new Error('No weather data in API response.');

            const items = data.response.body.items.item;
            const currentHourStr = `${now.getHours().toString().padStart(2, '0')}00`;

            const findMostRecent = (category) => items.filter(item => item.category === category && item.fcstTime <= currentHourStr).sort((a, b) => b.fcstTime.localeCompare(a.fcstTime))[0];

            const tempItem = findMostRecent('TMP') || items.find(i => i.category === 'T1H');
            const skyItem = findMostRecent('SKY');
            const ptyItem = findMostRecent('PTY');

            const skyState = { '1': '맑음', '3': '구름많음', '4': '흐림' }[skyItem?.fcstValue];
            const ptyState = { '0': '없음', '1': '비', '2': '비/눈', '3': '눈', '5': '빗방울', '6': '빗방울/눈날림', '7': '눈날림' }[ptyItem?.fcstValue];

            const currentWeather = ptyState !== '없음' ? ptyState : skyState;
            const currentTemp = tempItem?.fcstValue;

            const hourlyForecast = Array.from({ length: 6 }, (_, i) => {
                const forecastDate = new Date(now.getTime() + (i + 1) * 60 * 60 * 1000);
                const forecastDateStr = `${forecastDate.getFullYear()}${(forecastDate.getMonth() + 1).toString().padStart(2, '0')}${forecastDate.getDate().toString().padStart(2, '0')}`;
                const forecastTimeStr = `${forecastDate.getHours().toString().padStart(2, '0')}00`;

                const hourlyTempItem = items.find(item => item.category === 'TMP' && item.fcstDate === forecastDateStr && item.fcstTime === forecastTimeStr);
                const hourlySkyItem = items.find(item => item.category === 'SKY' && item.fcstDate === forecastDateStr && item.fcstTime === forecastTimeStr);
                const hourlyPtyItem = items.find(item => item.category === 'PTY' && item.fcstDate === forecastDateStr && item.fcstTime === forecastTimeStr);

                if (!hourlyTempItem || !hourlySkyItem || !hourlyPtyItem) return null;

                const forecastSky = { '1': '맑음', '3': '구름많음', '4': '흐림' }[hourlySkyItem.fcstValue];
                const forecastPty = { '0': '없음', '1': '비', '2': '비/눈', '3': '눈', '5': '빗방울', '6': '빗방울/눈날림', '7': '눈날림' }[hourlyPtyItem.fcstValue];
                return {
                    time: `${forecastDate.getHours().toString().padStart(2, '0')}:00`,
                    weather: forecastPty !== '없음' ? forecastPty : forecastSky,
                    temp: hourlyTempItem.fcstValue
                };
            }).filter(Boolean);

            return { currentWeather, currentTemp, hourlyForecast };
        } catch (error) {
            console.error('Error fetching weather data:', error);
            statusElem.textContent = '날씨 정보를 가져오는 데 실패했습니다.';
            return null;
        }
    }

    async function updateWeatherUI() {
    if (!userCoords) return;
    const { latitude, longitude } = userCoords;
    const { x, y } = toGrid(latitude, longitude);
    const weatherData = await getWeatherData(x, y);

    if (weatherData) {
        const { currentWeather, currentTemp, hourlyForecast } = weatherData;

        // Compare with previous forecast and notify if changed
        if (previousHourlyForecast.length > 0) {
            for (let i = 0; i < hourlyForecast.length; i++) {
                if (i < previousHourlyForecast.length && hourlyForecast[i].weather !== previousHourlyForecast[i].weather) {
                    const changedForecast = hourlyForecast[i];
                    const message = `날씨가 변경되었습니다. ${changedForecast.time}부터 ${changedForecast.weather}입니다.`;
                    speak(message, true); // Force speak for weather change
                    break; // Notify only for the first change
                }
            }
        }

        previousHourlyForecast = [...hourlyForecast]; // Update previous forecast
        saveData('previousHourlyForecast', previousHourlyForecast);

        weatherInfoElem.classList.remove('hidden');
        currentWeatherElem.textContent = `${currentWeather || '정보 없음'} ${getWeatherIcon(currentWeather)}`;
        currentTempElem.textContent = currentTemp || '정보 없음';

        hourlyForecastElem.innerHTML = '';
        if (hourlyForecast.length > 0) {
            const temps = hourlyForecast.map(f => f.temp);
            const minTemp = Math.min(...temps) - 2;
            const maxTemp = Math.max(...temps) + 2;

            hourlyForecast.forEach(forecast => {
                const forecastItem = document.createElement('div');
                forecastItem.classList.add('forecast-item');
                const barHeight = ((forecast.temp - minTemp) / (maxTemp - minTemp)) * 100;
                forecastItem.innerHTML = `
                    <div class="forecast-icon">${getWeatherIcon(forecast.weather)}</div>
                    <div class="bar-wrapper"><div class="temp-bar" style="height: ${barHeight}%;"></div></div>
                    <div class="temp-label">${forecast.temp}℃</div>
                    <div class="forecast-time">${forecast.time}</div>
                `;
                hourlyForecastElem.appendChild(forecastItem);
            });
        }
    }
}

    // --- Date Functions ---
    const formatDateString = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}.${month}.${day}`;
    };

    const getDateKey = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const updateCurrentTodoDate = () => {
        currentTodoDateElem.textContent = formatDateString(currentTodoDate);
    };

    const navigateDate = (direction) => {
        currentTodoDate.setDate(currentTodoDate.getDate() + direction);
        updateCurrentTodoDate();
        renderTodos();
    };

    // --- To-Do Functions ---
    const renderTodos = () => {
        todoListElem.innerHTML = '';
        doneListElem.innerHTML = '';
        const currentDateKey = getDateKey(currentTodoDate);
        
        const todaysItems = todos.filter(todo => todo.date === currentDateKey);
        const sortedTodos = todaysItems.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return a.time.localeCompare(b.time);
        });
        
        sortedTodos.forEach(todo => {
            const li = document.createElement('li');
            li.dataset.id = todo.id;
            if (todo.completed) {
                li.innerHTML = `<span>${todo.time} - ${todo.text}</span>`;
                doneListElem.appendChild(li);
            } else {
                li.innerHTML = `
                    <div class="priority-tag priority-${todo.priority}"></div>
                    <strong>${todo.time}</strong>
                    <span class="todo-item-text">${todo.text}</span>
                    <div class="todo-actions">
                        <button class="complete-btn">✔️</button>
                        <button class="delete-btn">❌</button>
                    </div>
                `;
                todoListElem.appendChild(li);
            }
        });
    };

    const addTodo = (time, text, priority) => {
        const dateKey = getDateKey(currentTodoDate);
        todos.push({ 
            id: Date.now(), 
            time, 
            text, 
            priority, 
            completed: false, 
            notified: false,
            date: dateKey 
        });
        saveData('todos', todos);
        renderTodos();
    };

    const handleTodoAction = (e) => {
        const li = e.target.closest('li');
        if (!li) return;
        const id = Number(li.dataset.id);
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        if (e.target.classList.contains('complete-btn')) {
            todo.completed = true;
        } else if (e.target.classList.contains('delete-btn')) {
            todos = todos.filter(t => t.id !== id);
        }
        saveData('todos', todos);
        renderTodos();
    };

    // --- Pomodoro Functions ---
    const updatePomoTimer = () => {
        pomoDigitalTimerElem.textContent = formatTime(pomoTimeLeft);
        const totalTime = (isPomoWorkSession ? workDuration : breakDuration) * 60;
        const percentage = (pomoTimeLeft / totalTime) * 100;
        pomoVisualTimerElem.style.background = `conic-gradient(red ${percentage}%, #eee ${percentage}% 100%)`;
    };

    const startPomo = () => {
        if (isPomoRunning) return;
        isPomoRunning = true;
        pomoStartPauseBtn.textContent = '멈춤';
        pomoInterval = setInterval(() => {
            pomoTimeLeft--;
            updatePomoTimer();
            if (pomoTimeLeft < 0) {
                clearInterval(pomoInterval);
                isPomoWorkSession = !isPomoWorkSession;
                pomoTimeLeft = (isPomoWorkSession ? workDuration : breakDuration) * 60;
                const message = isPomoWorkSession ? "휴식 끝, 집중할 시간입니다!" : "집중 시간이 끝났습니다. 5분간 휴식하세요.";
                pomoStatusElem.textContent = message.split(', ')[1];
                speak(message);
                updatePomoTimer();
                pomoStartPauseBtn.textContent = '시작';
                isPomoRunning = false;
            }
        }, 1000);
    };

    const pausePomo = () => {
        isPomoRunning = false;
        pomoStartPauseBtn.textContent = '계속';
        clearInterval(pomoInterval);
    };

    const resetPomo = () => {
        pausePomo();
        isPomoWorkSession = true;
        pomoTimeLeft = workDuration * 60;
        pomoStatusElem.textContent = "집중할 시간!";
        updatePomoTimer();
    };

    const setPomoTimes = () => {
        const newWorkTime = parseInt(workTimeInput.value);
        const newBreakTime = parseInt(breakTimeInput.value);
        if (isNaN(newWorkTime) || newWorkTime <= 0 || isNaN(newBreakTime) || newBreakTime <= 0) {
            alert("유효한 시간을 입력해주세요.");
            return;
        }
        workDuration = newWorkTime;
        breakDuration = newBreakTime;
        saveData('pomoSettings', { work: workDuration, break: breakDuration });
        resetPomo();
    };

    // --- Notes Functions ---
    const renderNotes = () => {
        noteList.innerHTML = '';
        notes.forEach(note => {
            const li = document.createElement('li');
            li.dataset.id = note.id;
            li.innerHTML = `
                <span class="note-content">${note.content}</span>
                <span class="note-timestamp">${note.timestamp}</span>
                <button class="delete-note-btn">❌</button>
            `;
            noteList.appendChild(li);
        });
    };

    const addNote = (content) => {
        const timestamp = new Date().toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
        notes.unshift({ id: Date.now(), content, timestamp });
        saveData('notes', notes);
        renderNotes();
    };

    const deleteNote = (id) => {
        notes = notes.filter(note => note.id !== id);
        saveData('notes', notes);
        renderNotes();
    };

    // --- Voice Memo Functions ---
    const renderRecordings = () => {
        recordingsList.innerHTML = '';
        recordings.forEach(rec => {
            const recElement = document.createElement('div');
            recElement.className = 'recording-item';
            recElement.innerHTML = `
                <div class="recording-info">
                    <span class="recording-tag">${rec.tag}</span>
                    <span class="recording-timestamp">${rec.timestamp}</span>
                </div>
                <div class="audio-controls">
                    <audio controls src="${rec.audioURL}"></audio>
                    <button class="delete-recording-btn" data-id="${rec.id}">❌</button>
                </div>
            `;
            recordingsList.appendChild(recElement);
        });
    };

    const saveRecording = (audioURL) => {
        const tag = recordingTagInput.value || '태그 없음';
        const timestamp = new Date().toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' });
        const newRecording = { id: Date.now(), tag, timestamp, audioURL };
        recordings.unshift(newRecording);
        saveData('voiceRecordings', recordings);
        renderRecordings();
        recordingTagInput.value = '';
    };

    const deleteRecording = (id) => {
        recordings = recordings.filter(rec => rec.id !== id);
        saveData('voiceRecordings', recordings);
        renderRecordings();
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            mediaRecorder.addEventListener('dataavailable', e => audioChunks.push(e.data));
            mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result;
                    saveRecording(base64data);
                    stream.getTracks().forEach(track => track.stop());
                };
                reader.readAsDataURL(audioBlob);
            });
            mediaRecorder.start();
            recordButton.textContent = '녹음 중지';
            let seconds = 0;
            recordingTimerElem.textContent = '00:00';
            recordingTimerInterval = setInterval(() => {
                seconds++;
                recordingTimerElem.textContent = formatTime(seconds);
            }, 1000);
        } catch (error) {
            console.error('Error starting recording:', error);
            alert('음성 녹음을 시작할 수 없습니다. 마이크 접근 권한을 확인해주세요.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            recordButton.textContent = '녹음 시작';
            clearInterval(recordingTimerInterval);
            recordingTimerElem.textContent = '00:00';
        }
    };

    // --- Attendance Functions ---
    const getTodayKey = () => {
        const today = new Date();
        return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    };

    const getDayOfWeek = (dateString) => {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return days[new Date(dateString).getDay()];
    };

    const getHolidayInfo = (year, month, date) => {
        const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
        return holidays[dateKey];
    };

    const fetchHolidays = async (year) => {
        const url = `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?serviceKey=${encodeURIComponent(API_KEY)}&solYear=${year}&_type=json&numOfRows=100`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.response.header.resultCode === '00') {
                const items = data.response.body?.items?.item;
                if (items) {
                    const holidayArray = Array.isArray(items) ? items : [items];
                    holidayArray.forEach(item => {
                        const dateStr = String(item.locdate);
                        const formattedDate = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
                        holidays[formattedDate] = item.dateName;
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching holiday data:', error);
        }
    };

    const renderAttendance = () => {
        dailyAttendanceTableBody.innerHTML = '';
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        let lateCount = 0, earlyCount = 0, sickCount = 0, absentCount = 0, annualLeaveCount = 0;

        // Render last 5 working days for daily view
        let renderedDays = 0;
        for (let i = 0; renderedDays < 5 && i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6 || getHolidayInfo(date.getFullYear(), date.getMonth() + 1, date.getDate())) continue;

            const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            const record = attendanceRecords[dateKey] || { checkIn: '-', checkOut: '-', status: '-' };
            const row = dailyAttendanceTableBody.insertRow();
            row.innerHTML = `<td>${dateKey}</td><td>${getDayOfWeek(dateKey)}</td><td>${record.checkIn}</td><td>${record.checkOut}</td><td>${record.status}</td>`;
            renderedDays++;
        }

        // Calculate monthly summary
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
        for (let d = firstDayOfMonth; d <= lastDayOfMonth; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6 || getHolidayInfo(d.getFullYear(), d.getMonth() + 1, d.getDate())) continue;
            const dateKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
            const record = attendanceRecords[dateKey];
            if (record) {
                if (record.status === '지각') lateCount++;
                if (record.status === '조퇴') earlyCount++;
                if (record.status === '병가') sickCount++;
                if (record.status === '무단결근') absentCount++;
                if (record.status === '월차') annualLeaveCount++;
            }
        }

        monthlyLateCount.textContent = lateCount;
        monthlyEarlyCount.textContent = earlyCount;
        monthlySickCount.textContent = sickCount;
        monthlyAbsentCount.textContent = absentCount;
        monthlyAnnualLeaveCount.textContent = annualLeaveCount;
    };

    const checkIn = () => {
        const todayKey = getTodayKey();
        const now = new Date();
        const checkInTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        let status = (now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0)) ? '지각' : '정상';
        attendanceRecords[todayKey] = { checkIn: checkInTime, checkOut: '-', status };
        saveData('attendanceRecords', attendanceRecords);
        renderAttendance();
        renderMonthlyCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
    };

    const checkOut = () => {
        const todayKey = getTodayKey();
        if (!attendanceRecords[todayKey]) return alert("먼저 출근을 기록해주세요.");
        const now = new Date();
        const checkOutTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        let status = attendanceRecords[todayKey].status;
        if (now.getHours() < 18 && status === '정상') {
            status = '조퇴';
        }
        attendanceRecords[todayKey].checkOut = checkOutTime;
        attendanceRecords[todayKey].status = status;
        saveData('attendanceRecords', attendanceRecords);
        renderAttendance();
        renderMonthlyCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
    };

    const applyStatus = () => {
        const todayKey = getTodayKey();
        const selectedStatus = statusSelect.value;
        if (!['병가', '무단결근', '월차'].includes(selectedStatus)) return alert("'병가', '무단결근', '월차'만 수동으로 적용할 수 있습니다.");
        attendanceRecords[todayKey] = { ...attendanceRecords[todayKey], checkIn: '-', checkOut: '-', status: selectedStatus };
        saveData('attendanceRecords', attendanceRecords);
        renderAttendance();
        renderMonthlyCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
    };

    // --- Monthly Calendar Functions ---
    const renderMonthlyCalendar = (year, month) => {
        currentMonthYear.textContent = `${year}년 ${month + 1}월`;
        calendarGrid.innerHTML = '';
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const startDay = firstDayOfMonth.getDay();

        for (let i = 0; i < startDay; i++) {
            calendarGrid.insertAdjacentHTML('beforeend', '<div class="calendar-day empty"></div>');
        }

        for (let date = 1; date <= lastDayOfMonth.getDate(); date++) {
            const dayElem = document.createElement('div');
            dayElem.classList.add('calendar-day');
            const fullDate = new Date(year, month, date);
            const dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
            const dayOfWeek = fullDate.getDay();

            if (dayOfWeek === 0 || dayOfWeek === 6) dayElem.classList.add('weekend');
            const holidayName = getHolidayInfo(year, month + 1, date);
            if (holidayName) dayElem.classList.add('holiday');
            if (fullDate.toDateString() === new Date().toDateString()) dayElem.classList.add('today');

            dayElem.innerHTML = `<span class="date-number">${date}</span>`;
            const record = attendanceRecords[dateKey];
            if (record) {
                const statusIcons = { '정상': '✅', '지각': '⏰', '조퇴': '🏃', '병가': '🤒', '무단결근': '🚫', '월차': '🌴' };
                if (statusIcons[record.status]) {
                    dayElem.innerHTML += `<div class="status-icon status-${record.status}">${statusIcons[record.status]}</div>`;
                }
                if (record.checkIn !== '-' && record.checkOut !== '-') {
                    dayElem.innerHTML += `<div class="work-time">${record.checkIn} ~ ${record.checkOut}</div>`;
                }
            } else if (holidayName) {
                dayElem.innerHTML += `<div class="holiday-name">${holidayName}</div>`;
            }
            calendarGrid.appendChild(dayElem);
        }
    };

    // --- Main Notification System ---
    const checkTimeAndNotify = () => {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        if (isTodoTtsEnabled) {
            let changed = false;
            const todayKey = getDateKey(new Date());
            todos.forEach(todo => {
                if (!todo.completed && !todo.notified && todo.time <= currentTime && todo.date === todayKey) {
                    speak(todo.text);
                    todo.notified = true;
                    changed = true;
                }
            });
            if (changed) saveData('todos', todos);
        }

        if (isTtsEnabled) {
            let changed = false;
            ttsSchedules.forEach(schedule => {
                if (!schedule.notified && schedule.time === currentTime) {
                    speak(schedule.text, true);
                    schedule.notified = true; // Mark as notified for today
                    changed = true;
                }
            });
            if (changed) saveData('ttsSchedules', ttsSchedules);

            // Reset notification status at midnight
            if (currentTime === '00:00') {
                ttsSchedules.forEach(schedule => schedule.notified = false);
                saveData('ttsSchedules', ttsSchedules);
            }
        }
    };

    const startSystem = () => {
        if (!('geolocation' in navigator) || !('speechSynthesis' in window)) {
            statusElem.textContent = 'This browser does not support required features.';
            return;
        }
        isWeatherSystemActive = true;
        toggleButton.textContent = '알림 멈춤';
        navigator.geolocation.getCurrentPosition(position => {
            userCoords = position.coords;
            updateWeatherUI();
            checkTimeAndNotify();
            weatherInterval = setInterval(updateWeatherUI, 10 * 60 * 1000);
            minuteInterval = setInterval(checkTimeAndNotify, 60 * 1000);
        }, () => {
            statusElem.textContent = 'Failed to get location.';
            stopSystem();
        });
    };

    const stopSystem = () => {
        isWeatherSystemActive = false;
        clearInterval(weatherInterval);
        clearInterval(minuteInterval);
        userCoords = null;
        previousHourlyForecast = []; // Reset previous forecast
        saveData('previousHourlyForecast', []); // Clear from storage
        toggleButton.textContent = '알림 시작';
        statusElem.textContent = '알림이 멈췄습니다. 시작 버튼을 눌러주세요.';
        weatherInfoElem.classList.add('hidden');
    };

    // --- Event Listeners ---
    toggleButton.addEventListener('click', () => isWeatherSystemActive ? stopSystem() : startSystem());
    checkInBtn.addEventListener('click', checkIn);
    checkOutBtn.addEventListener('click', checkOut);
    applyStatusBtn.addEventListener('click', applyStatus);
    showMonthlyViewBtn.addEventListener('click', () => {
        monthlyCalendarView.classList.toggle('hidden');
        if (!monthlyCalendarView.classList.contains('hidden')) {
            renderMonthlyCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
        }
    });
    prevMonthBtn.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderMonthlyCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
    });
    nextMonthBtn.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderMonthlyCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
    });
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (todoTimeInput.value && todoTextInput.value) {
            addTodo(todoTimeInput.value, todoTextInput.value, todoPriorityInput.value);
            todoForm.reset();
        }
    });
    todoListElem.addEventListener('click', handleTodoAction);
    prevDateBtn.addEventListener('click', () => navigateDate(-1));
    nextDateBtn.addEventListener('click', () => navigateDate(1));
    pomoStartPauseBtn.addEventListener('click', () => isPomoRunning ? pausePomo() : startPomo());
    pomoResetBtn.addEventListener('click', resetPomo);
    setPomoTimeBtn.addEventListener('click', setPomoTimes);
    noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (noteInput.value) {
            addNote(noteInput.value);
            noteInput.value = '';
        }
    });
    noteList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-note-btn')) {
            deleteNote(Number(e.target.closest('li').dataset.id));
        }
    });
    ttsToggle.addEventListener('change', (e) => { isTtsEnabled = e.target.checked; saveData('ttsEnabled', isTtsEnabled); });
    addTtsScheduleBtn.addEventListener('click', () => {
        if (ttsTimeInput.value && ttsTextInput.value) {
            addTtsSchedule(ttsTimeInput.value, ttsTextInput.value);
            ttsTimeInput.value = '';
            ttsTextInput.value = '';
        }
    });
    ttsScheduleList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-tts-btn')) {
            deleteTtsSchedule(Number(e.target.closest('li').dataset.id));
        }
    });
    ttsPresetButtons.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const preset = e.target.dataset.preset;
            if (preset) {
                // addPresetTtsSchedules(preset); // Removed as per user request
            }
        }
    });

    setupWorkBreakScheduleBtn.addEventListener('click', () => {
        workBreakScheduleModal.classList.remove('hidden');
    });

    closeBtn.addEventListener('click', () => {
        workBreakScheduleModal.classList.add('hidden');
    });

    saveWorkBreakScheduleBtn.addEventListener('click', generateWorkBreakSchedules);

    window.addEventListener('click', (e) => {
        if (e.target === workBreakScheduleModal) {
            workBreakScheduleModal.classList.add('hidden');
        }
    });

    // Settings Modal Event Listeners
    settingsIcon.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
    });

    settingsCloseBtn.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.add('hidden');
        }
    });

    clearAllDataBtn.addEventListener('click', () => {
        if (confirm('정말로 모든 데이터를 지우시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            clearAllData();
        }
    });

    // Voice Memo Event Listeners
    recordButton.addEventListener('click', () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            stopRecording();
        } else {
            startRecording();
        }
    });

    recordingsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-recording-btn')) {
            const id = Number(e.target.dataset.id);
            deleteRecording(id);
        }
    });

    // Initialize card visibility listeners
    settingsCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const cardName = e.target.id.replace('toggle-', '').replace('-card', '');
            cardVisibility[cardName] = e.target.checked;
            updateCardVisibility();
        });
    });

    // --- 새로운 카드들 State ---
    let goals = [];
    let timeEntries = [];
    let achievements = [];
    let projects = [];
    let focusStartTime = null;
    let totalFocusTime = 0;
    
    // 재무 관리
    let expenses = [];
    let budgets = [];
    
    // 업무 조직
    let meetings = [];
    let deadlines = [];
    let taskTemplates = [];
    let leaves = [];
    let annualLeaveTotal = 15;
    
    // 협업 소통
    let contacts = [];
    let feedbacks = [];
    let handovers = [];
    
    // 성장 학습
    let learningPlans = [];
    let skills = [];
    let books = [];
    
    // 유틸리티
    const unitConversions = {
        length: {
            mm: 1, cm: 10, m: 1000, km: 1000000, inch: 25.4, ft: 304.8, yard: 914.4, mile: 1609344
        },
        weight: {
            mg: 1, g: 1000, kg: 1000000, ton: 1000000000, oz: 28349.5, lb: 453592
        },
        temperature: {},
        area: {
            'mm²': 1, 'cm²': 100, 'm²': 1000000, 'km²': 1000000000000, 'in²': 645.16, 'ft²': 92903.04
        }
    };

    // --- 데이터 관리 및 분석 카드 Functions ---
    
    // Goal Tracker Functions
    const addGoal = () => {
        const period = document.getElementById('goal-period').value;
        const title = document.getElementById('goal-title').value.trim();
        const target = parseInt(document.getElementById('goal-target').value);
        const unit = document.getElementById('goal-unit').value.trim();
        
        if (!title || !target || !unit) return;
        
        const goal = {
            id: Date.now(),
            period,
            title,
            target,
            unit,
            current: 0,
            createdAt: new Date().toISOString()
        };
        
        goals.push(goal);
        saveData('goals', goals);
        renderGoals();
        
        document.getElementById('goal-title').value = '';
        document.getElementById('goal-target').value = '';
        document.getElementById('goal-unit').value = '';
    };

    const updateGoalProgress = (goalId, increment = 1) => {
        const goal = goals.find(g => g.id === goalId);
        if (goal) {
            goal.current = Math.min(goal.current + increment, goal.target);
            saveData('goals', goals);
            renderGoals();
        }
    };

    const renderGoals = () => {
        const goalsList = document.getElementById('goals-list');
        if (!goalsList) return;
        
        goalsList.innerHTML = goals.map(goal => {
            const progress = Math.round((goal.current / goal.target) * 100);
            return `
                <div class="goal-item">
                    <div class="goal-header">
                        <span class="goal-title">${goal.title}</span>
                        <span class="goal-period">${goal.period === 'daily' ? '일일' : goal.period === 'weekly' ? '주간' : '월간'}</span>
                    </div>
                    <div class="goal-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span class="progress-text">${goal.current}/${goal.target} ${goal.unit} (${progress}%)</span>
                    </div>
                    <div class="goal-actions">
                        <button onclick="updateGoalProgress(${goal.id}, 1)">+1</button>
                        <button onclick="updateGoalProgress(${goal.id}, -1)">-1</button>
                        <button onclick="deleteGoal(${goal.id})" class="delete-btn">삭제</button>
                    </div>
                </div>
            `;
        }).join('');
    };

    const deleteGoal = (goalId) => {
        goals = goals.filter(g => g.id !== goalId);
        saveData('goals', goals);
        renderGoals();
    };

    // Time Analysis Functions
    const addTimeEntry = () => {
        const projectName = document.getElementById('project-name').value.trim();
        const startTime = document.getElementById('start-time').value;
        const endTime = document.getElementById('end-time').value;
        const description = document.getElementById('work-description').value.trim();
        
        if (!projectName || !startTime || !endTime) return;
        
        const entry = {
            id: Date.now(),
            project: projectName,
            startTime,
            endTime,
            description,
            date: new Date().toISOString().split('T')[0],
            duration: calculateDuration(startTime, endTime)
        };
        
        timeEntries.push(entry);
        saveData('timeEntries', timeEntries);
        renderTimeEntries();
        updateTimeSummary();
        
        document.getElementById('project-name').value = '';
        document.getElementById('start-time').value = '';
        document.getElementById('end-time').value = '';
        document.getElementById('work-description').value = '';
    };

    const calculateDuration = (start, end) => {
        const startDate = new Date(`2000-01-01T${start}`);
        const endDate = new Date(`2000-01-01T${end}`);
        return Math.round((endDate - startDate) / (1000 * 60));
    };

    const renderTimeEntries = () => {
        const entriesList = document.getElementById('time-entries-list');
        if (!entriesList) return;
        
        const today = new Date().toISOString().split('T')[0];
        const todayEntries = timeEntries.filter(entry => entry.date === today);
        
        entriesList.innerHTML = todayEntries.map(entry => `
            <div class="time-entry-item">
                <div class="entry-header">
                    <span class="project-name">${entry.project}</span>
                    <span class="duration">${Math.floor(entry.duration / 60)}h ${entry.duration % 60}m</span>
                </div>
                <div class="entry-time">${entry.startTime} - ${entry.endTime}</div>
                <div class="entry-description">${entry.description}</div>
                <button onclick="deleteTimeEntry(${entry.id})" class="delete-btn">삭제</button>
            </div>
        `).join('');
    };

    const updateTimeSummary = () => {
        const summaryDiv = document.getElementById('daily-time-summary');
        if (!summaryDiv) return;
        
        const today = new Date().toISOString().split('T')[0];
        const todayEntries = timeEntries.filter(entry => entry.date === today);
        
        const projectSummary = {};
        todayEntries.forEach(entry => {
            if (!projectSummary[entry.project]) {
                projectSummary[entry.project] = 0;
            }
            projectSummary[entry.project] += entry.duration;
        });
        
        summaryDiv.innerHTML = Object.entries(projectSummary).map(([project, duration]) => `
            <div class="project-summary">
                <span class="project-name">${project}</span>
                <span class="project-time">${Math.floor(duration / 60)}h ${duration % 60}m</span>
            </div>
        `).join('');
    };

    const deleteTimeEntry = (entryId) => {
        timeEntries = timeEntries.filter(entry => entry.id !== entryId);
        saveData('timeEntries', timeEntries);
        renderTimeEntries();
        updateTimeSummary();
    };

    // Productivity Metrics Functions
    const startFocusSession = () => {
        if (focusStartTime) {
            const duration = Math.floor((Date.now() - focusStartTime) / (1000 * 60));
            totalFocusTime += duration;
            saveData('focusTime', { total: totalFocusTime, date: new Date().toISOString().split('T')[0] });
            focusStartTime = null;
            document.getElementById('start-focus-session').textContent = '집중 세션 시작';
        } else {
            focusStartTime = Date.now();
            document.getElementById('start-focus-session').textContent = '집중 세션 종료';
        }
        updateProductivityMetrics();
    };

    const logAchievement = () => {
        const description = prompt('오늘의 성과를 입력하세요:');
        if (description && description.trim()) {
            const achievement = {
                id: Date.now(),
                description: description.trim(),
                timestamp: new Date().toISOString()
            };
            achievements.push(achievement);
            saveData('achievements', achievements);
            renderAchievements();
        }
    };

    const updateProductivityMetrics = () => {
        const completionRate = document.getElementById('today-completion-rate');
        const weekAvg = document.getElementById('week-avg-completion');
        const focusTimeElem = document.getElementById('focus-time-today');
        
        if (completionRate && weekAvg && focusTimeElem) {
            const today = new Date().toISOString().split('T')[0];
            const todayTodos = todos.filter(todo => todo.date === today);
            const completedTodos = todayTodos.filter(todo => todo.completed);
            const rate = todayTodos.length > 0 ? Math.round((completedTodos.length / todayTodos.length) * 100) : 0;
            
            completionRate.textContent = `${rate}%`;
            weekAvg.textContent = `${rate}%`;
            focusTimeElem.textContent = `${Math.floor(totalFocusTime / 60)}시간 ${totalFocusTime % 60}분`;
        }
    };

    const renderAchievements = () => {
        const achievementsLog = document.getElementById('achievements-log');
        if (!achievementsLog) return;
        
        const today = new Date().toISOString().split('T')[0];
        const todayAchievements = achievements.filter(a => a.timestamp.startsWith(today));
        
        achievementsLog.innerHTML = todayAchievements.map(achievement => `
            <div class="achievement-item">
                <div class="achievement-text">${achievement.description}</div>
                <div class="achievement-time">${new Date(achievement.timestamp).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}</div>
                <button onclick="deleteAchievement(${achievement.id})" class="delete-btn">삭제</button>
            </div>
        `).join('');
    };

    const deleteAchievement = (achievementId) => {
        achievements = achievements.filter(a => a.id !== achievementId);
        saveData('achievements', achievements);
        renderAchievements();
    };

    // Project Management Functions
    const addProject = () => {
        const title = document.getElementById('project-title').value.trim();
        const deadline = document.getElementById('project-deadline').value;
        const status = document.getElementById('project-status').value;
        const description = document.getElementById('project-description').value.trim();
        
        if (!title || !deadline) return;
        
        const project = {
            id: Date.now(),
            title,
            deadline,
            status,
            description,
            createdAt: new Date().toISOString()
        };
        
        projects.push(project);
        saveData('projects', projects);
        renderProjects();
        
        document.getElementById('project-title').value = '';
        document.getElementById('project-deadline').value = '';
        document.getElementById('project-description').value = '';
    };

    const updateProjectStatus = (projectId, newStatus) => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            project.status = newStatus;
            saveData('projects', projects);
            renderProjects();
        }
    };

    const renderProjects = () => {
        const projectsList = document.getElementById('projects-list');
        if (!projectsList) return;
        
        projectsList.innerHTML = projects.map(project => {
            const deadline = new Date(project.deadline);
            const today = new Date();
            const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
            const isOverdue = daysLeft < 0;
            
            const statusLabels = {
                'planning': '기획 중',
                'in-progress': '진행 중',
                'review': '검토 중',
                'completed': '완료'
            };
            
            return `
                <div class="project-item ${project.status}">
                    <div class="project-header">
                        <span class="project-title">${project.title}</span>
                        <span class="project-deadline ${isOverdue ? 'overdue' : ''}">${isOverdue ? `${Math.abs(daysLeft)}일 지연` : `${daysLeft}일 남음`}</span>
                    </div>
                    <div class="project-description">${project.description}</div>
                    <div class="project-actions">
                        <select onchange="updateProjectStatus(${project.id}, this.value)" value="${project.status}">
                            <option value="planning" ${project.status === 'planning' ? 'selected' : ''}>기획 중</option>
                            <option value="in-progress" ${project.status === 'in-progress' ? 'selected' : ''}>진행 중</option>
                            <option value="review" ${project.status === 'review' ? 'selected' : ''}>검토 중</option>
                            <option value="completed" ${project.status === 'completed' ? 'selected' : ''}>완료</option>
                        </select>
                        <button onclick="deleteProject(${project.id})" class="delete-btn">삭제</button>
                    </div>
                    <div class="project-status-badge ${project.status}">${statusLabels[project.status]}</div>
                </div>
            `;
        }).join('');
    };

    const deleteProject = (projectId) => {
        projects = projects.filter(p => p.id !== projectId);
        saveData('projects', projects);
        renderProjects();
    };

    // --- 재무 및 비용 관리 Functions ---
    
    const addExpense = () => {
        const date = document.getElementById('expense-date').value;
        const category = document.getElementById('expense-category').value;
        const amount = parseInt(document.getElementById('expense-amount').value);
        const description = document.getElementById('expense-description').value.trim();
        
        if (!date || !amount || !description) return;
        
        const expense = {
            id: Date.now(),
            date,
            category,
            amount,
            description,
            createdAt: new Date().toISOString()
        };
        
        expenses.push(expense);
        saveData('expenses', expenses);
        renderExpenses();
        updateExpenseSummary();
        
        document.getElementById('expense-date').value = '';
        document.getElementById('expense-amount').value = '';
        document.getElementById('expense-description').value = '';
    };

    const renderExpenses = () => {
        const expensesList = document.getElementById('expenses-list');
        if (!expensesList) return;
        
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthlyExpenses = expenses.filter(expense => expense.date.startsWith(currentMonth));
        
        expensesList.innerHTML = monthlyExpenses.map(expense => `
            <div class="expense-item">
                <div class="expense-header">
                    <span class="expense-category">${expense.category}</span>
                    <span class="expense-amount">${expense.amount.toLocaleString()}원</span>
                </div>
                <div class="expense-description">${expense.description}</div>
                <div class="expense-date">${expense.date}</div>
                <button onclick="deleteExpense(${expense.id})" class="delete-btn">삭제</button>
            </div>
        `).join('');
    };

    const updateExpenseSummary = () => {
        const summaryDiv = document.getElementById('monthly-expense-summary');
        if (!summaryDiv) return;
        
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthlyExpenses = expenses.filter(expense => expense.date.startsWith(currentMonth));
        
        const categoryTotals = {};
        let totalAmount = 0;
        
        monthlyExpenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
            totalAmount += expense.amount;
        });
        
        summaryDiv.innerHTML = `
            <div class="summary-total">총 지출: ${totalAmount.toLocaleString()}원</div>
            ${Object.entries(categoryTotals).map(([category, amount]) => `
                <div class="category-total">
                    <span>${category}:</span>
                    <span>${amount.toLocaleString()}원</span>
                </div>
            `).join('')}
        `;
    };

    const deleteExpense = (expenseId) => {
        expenses = expenses.filter(expense => expense.id !== expenseId);
        saveData('expenses', expenses);
        renderExpenses();
        updateExpenseSummary();
    };

    const calculateSalary = () => {
        const type = document.getElementById('salary-type').value;
        const amount = parseFloat(document.getElementById('salary-amount').value);
        const hours = parseFloat(document.getElementById('work-hours').value) || 0;
        
        if (!amount) return;
        
        let monthlyGross = 0;
        
        switch (type) {
            case 'hourly':
                monthlyGross = amount * hours * 4.33; // 평균 주당 근무시간 * 월평균 주수
                break;
            case 'monthly':
                monthlyGross = amount;
                break;
            case 'annual':
                monthlyGross = amount / 12;
                break;
        }
        
        const taxRate = 0.08; // 간단한 세율 계산 (실제로는 더 복잡)
        const estimatedTax = monthlyGross * taxRate;
        const netMonthly = monthlyGross - estimatedTax;
        const annualSalary = monthlyGross * 12;
        
        document.getElementById('gross-monthly').textContent = `${Math.round(monthlyGross).toLocaleString()}원`;
        document.getElementById('estimated-tax').textContent = `${Math.round(estimatedTax).toLocaleString()}원`;
        document.getElementById('net-monthly').textContent = `${Math.round(netMonthly).toLocaleString()}원`;
        document.getElementById('annual-salary').textContent = `${Math.round(annualSalary).toLocaleString()}원`;
    };

    const addBudget = () => {
        const category = document.getElementById('budget-category').value.trim();
        const limit = parseInt(document.getElementById('budget-limit').value);
        
        if (!category || !limit) return;
        
        const budget = {
            id: Date.now(),
            category,
            limit,
            spent: 0,
            createdAt: new Date().toISOString()
        };
        
        budgets.push(budget);
        saveData('budgets', budgets);
        renderBudgets();
        
        document.getElementById('budget-category').value = '';
        document.getElementById('budget-limit').value = '';
    };

    const renderBudgets = () => {
        const budgetsList = document.getElementById('budgets-list');
        if (!budgetsList) return;
        
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthlyExpenses = expenses.filter(expense => expense.date.startsWith(currentMonth));
        
        budgetsList.innerHTML = budgets.map(budget => {
            const spent = monthlyExpenses
                .filter(expense => expense.category === budget.category)
                .reduce((sum, expense) => sum + expense.amount, 0);
            
            const percentage = Math.min((spent / budget.limit) * 100, 100);
            const isOverBudget = spent > budget.limit;
            
            return `
                <div class="budget-item ${isOverBudget ? 'over-budget' : ''}">
                    <div class="budget-header">
                        <span class="budget-category">${budget.category}</span>
                        <span class="budget-amount">${spent.toLocaleString()} / ${budget.limit.toLocaleString()}원</span>
                    </div>
                    <div class="budget-progress">
                        <div class="progress-bar">
                            <div class="progress-fill ${isOverBudget ? 'over-budget' : ''}" style="width: ${percentage}%"></div>
                        </div>
                        <span class="progress-text">${Math.round(percentage)}%</span>
                    </div>
                    <button onclick="deleteBudget(${budget.id})" class="delete-btn">삭제</button>
                </div>
            `;
        }).join('');
    };

    const deleteBudget = (budgetId) => {
        budgets = budgets.filter(budget => budget.id !== budgetId);
        saveData('budgets', budgets);
        renderBudgets();
    };

    // --- 업무 조직 및 계획 Functions ---
    
    const addMeeting = () => {
        const title = document.getElementById('meeting-title').value.trim();
        const datetime = document.getElementById('meeting-datetime').value;
        const participants = document.getElementById('meeting-participants').value.trim();
        const agenda = document.getElementById('meeting-agenda').value.trim();
        
        if (!title || !datetime || !participants) return;
        
        const meeting = {
            id: Date.now(),
            title,
            datetime,
            participants: participants.split(',').map(p => p.trim()),
            agenda,
            createdAt: new Date().toISOString()
        };
        
        meetings.push(meeting);
        saveData('meetings', meetings);
        renderMeetings();
        
        document.getElementById('meeting-title').value = '';
        document.getElementById('meeting-datetime').value = '';
        document.getElementById('meeting-participants').value = '';
        document.getElementById('meeting-agenda').value = '';
    };

    const renderMeetings = () => {
        const meetingsList = document.getElementById('meetings-list');
        if (!meetingsList) return;
        
        const sortedMeetings = meetings.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        
        meetingsList.innerHTML = sortedMeetings.map(meeting => {
            const meetingDate = new Date(meeting.datetime);
            const isPast = meetingDate < new Date();
            
            return `
                <div class="meeting-item ${isPast ? 'past-meeting' : ''}">
                    <div class="meeting-header">
                        <span class="meeting-title">${meeting.title}</span>
                        <span class="meeting-date">${meetingDate.toLocaleString('ko-KR')}</span>
                    </div>
                    <div class="meeting-participants">참석자: ${meeting.participants.join(', ')}</div>
                    ${meeting.agenda ? `<div class="meeting-agenda">${meeting.agenda}</div>` : ''}
                    <button onclick="deleteMeeting(${meeting.id})" class="delete-btn">삭제</button>
                </div>
            `;
        }).join('');
    };

    const deleteMeeting = (meetingId) => {
        meetings = meetings.filter(meeting => meeting.id !== meetingId);
        saveData('meetings', meetings);
        renderMeetings();
    };

    const addDeadline = () => {
        const task = document.getElementById('deadline-task').value.trim();
        const datetime = document.getElementById('deadline-datetime').value;
        const priority = document.getElementById('deadline-priority').value;
        
        if (!task || !datetime) return;
        
        const deadline = {
            id: Date.now(),
            task,
            datetime,
            priority,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        deadlines.push(deadline);
        saveData('deadlines', deadlines);
        renderDeadlines();
        
        document.getElementById('deadline-task').value = '';
        document.getElementById('deadline-datetime').value = '';
    };

    const renderDeadlines = () => {
        const deadlinesList = document.getElementById('deadlines-list');
        if (!deadlinesList) return;
        
        const sortedDeadlines = deadlines.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        
        deadlinesList.innerHTML = sortedDeadlines.map(deadline => {
            const deadlineDate = new Date(deadline.datetime);
            const now = new Date();
            const timeLeft = deadlineDate - now;
            const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
            const isOverdue = timeLeft < 0;
            
            return `
                <div class="deadline-item ${deadline.priority} ${isOverdue ? 'overdue' : ''} ${deadline.completed ? 'completed' : ''}">
                    <div class="deadline-header">
                        <span class="deadline-task">${deadline.task}</span>
                        <span class="deadline-time ${isOverdue ? 'overdue' : ''}">${isOverdue ? `${Math.abs(daysLeft)}일 지연` : `${daysLeft}일 남음`}</span>
                    </div>
                    <div class="deadline-date">${deadlineDate.toLocaleString('ko-KR')}</div>
                    <div class="deadline-actions">
                        <button onclick="toggleDeadlineComplete(${deadline.id})" class="complete-btn">${deadline.completed ? '미완료로 변경' : '완료'}</button>
                        <button onclick="deleteDeadline(${deadline.id})" class="delete-btn">삭제</button>
                    </div>
                </div>
            `;
        }).join('');
    };

    const toggleDeadlineComplete = (deadlineId) => {
        const deadline = deadlines.find(d => d.id === deadlineId);
        if (deadline) {
            deadline.completed = !deadline.completed;
            saveData('deadlines', deadlines);
            renderDeadlines();
        }
    };

    const deleteDeadline = (deadlineId) => {
        deadlines = deadlines.filter(deadline => deadline.id !== deadlineId);
        saveData('deadlines', deadlines);
        renderDeadlines();
    };

    const addTaskTemplate = () => {
        const name = document.getElementById('template-name').value.trim();
        const tasks = document.getElementById('template-tasks').value.trim();
        
        if (!name || !tasks) return;
        
        const template = {
            id: Date.now(),
            name,
            tasks: tasks.split('\n').filter(task => task.trim()),
            createdAt: new Date().toISOString()
        };
        
        taskTemplates.push(template);
        saveData('taskTemplates', taskTemplates);
        renderTaskTemplates();
        
        document.getElementById('template-name').value = '';
        document.getElementById('template-tasks').value = '';
    };

    const renderTaskTemplates = () => {
        const templatesList = document.getElementById('templates-list');
        if (!templatesList) return;
        
        templatesList.innerHTML = taskTemplates.map(template => `
            <div class="template-item">
                <div class="template-header">
                    <span class="template-name">${template.name}</span>
                    <span class="template-count">${template.tasks.length}개 작업</span>
                </div>
                <div class="template-tasks">
                    ${template.tasks.map(task => `<div class="template-task">• ${task}</div>`).join('')}
                </div>
                <div class="template-actions">
                    <button onclick="useTemplate(${template.id})" class="use-btn">사용하기</button>
                    <button onclick="deleteTemplate(${template.id})" class="delete-btn">삭제</button>
                </div>
            </div>
        `).join('');
    };

    const useTemplate = (templateId) => {
        const template = taskTemplates.find(t => t.id === templateId);
        if (template) {
            // TODO: 템플릿을 할 일 목록에 추가하는 로직
            alert(`"${template.name}" 템플릿이 할 일 목록에 추가되었습니다.`);
        }
    };

    const deleteTemplate = (templateId) => {
        taskTemplates = taskTemplates.filter(template => template.id !== templateId);
        saveData('taskTemplates', taskTemplates);
        renderTaskTemplates();
    };

    const addLeave = () => {
        const startDate = document.getElementById('leave-start-date').value;
        const endDate = document.getElementById('leave-end-date').value;
        const type = document.getElementById('leave-type').value;
        const reason = document.getElementById('leave-reason').value.trim();
        
        if (!startDate || !endDate) return;
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        
        const leave = {
            id: Date.now(),
            startDate,
            endDate,
            type,
            reason,
            days,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        leaves.push(leave);
        saveData('leaves', leaves);
        renderLeaves();
        updateLeaveStats();
        
        document.getElementById('leave-start-date').value = '';
        document.getElementById('leave-end-date').value = '';
        document.getElementById('leave-reason').value = '';
    };

    const renderLeaves = () => {
        const leavesList = document.getElementById('leaves-list');
        if (!leavesList) return;
        
        leavesList.innerHTML = leaves.map(leave => `
            <div class="leave-item ${leave.type}">
                <div class="leave-header">
                    <span class="leave-type">${leave.type === 'annual' ? '연차' : leave.type === 'sick' ? '병가' : leave.type === 'personal' ? '개인사유' : '휴가'}</span>
                    <span class="leave-days">${leave.days}일</span>
                </div>
                <div class="leave-period">${leave.startDate} ~ ${leave.endDate}</div>
                ${leave.reason ? `<div class="leave-reason">${leave.reason}</div>` : ''}
                <div class="leave-status status-${leave.status}">${leave.status === 'pending' ? '대기중' : leave.status === 'approved' ? '승인' : '거절'}</div>
                <button onclick="deleteLeave(${leave.id})" class="delete-btn">삭제</button>
            </div>
        `).join('');
    };

    const updateLeaveStats = () => {
        const usedAnnualLeave = leaves
            .filter(leave => leave.type === 'annual' && leave.status === 'approved')
            .reduce((sum, leave) => sum + leave.days, 0);
        
        const remainingLeave = Math.max(0, annualLeaveTotal - usedAnnualLeave);
        
        const usedSpan = document.getElementById('used-annual-leave');
        const remainingSpan = document.getElementById('remaining-annual-leave');
        
        if (usedSpan) usedSpan.textContent = `${usedAnnualLeave}일`;
        if (remainingSpan) remainingSpan.textContent = `${remainingLeave}일`;
    };

    const deleteLeave = (leaveId) => {
        leaves = leaves.filter(leave => leave.id !== leaveId);
        saveData('leaves', leaves);
        renderLeaves();
        updateLeaveStats();
    };

    // --- 협업 및 소통 Functions ---
    
    const addContact = () => {
        const name = document.getElementById('contact-name').value.trim();
        const position = document.getElementById('contact-position').value.trim();
        const phone = document.getElementById('contact-phone').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const department = document.getElementById('contact-department').value.trim();
        
        if (!name || !position || !phone || !email || !department) return;
        
        const contact = {
            id: Date.now(),
            name,
            position,
            phone,
            email,
            department,
            createdAt: new Date().toISOString()
        };
        
        contacts.push(contact);
        saveData('contacts', contacts);
        renderContacts();
        
        document.getElementById('contact-name').value = '';
        document.getElementById('contact-position').value = '';
        document.getElementById('contact-phone').value = '';
        document.getElementById('contact-email').value = '';
        document.getElementById('contact-department').value = '';
    };

    const renderContacts = () => {
        const contactsList = document.getElementById('contacts-list');
        if (!contactsList) return;
        
        contactsList.innerHTML = contacts.map(contact => `
            <div class="contact-item">
                <div class="contact-header">
                    <span class="contact-name">${contact.name}</span>
                    <span class="contact-department">${contact.department}</span>
                </div>
                <div class="contact-position">${contact.position}</div>
                <div class="contact-info">
                    <div class="contact-phone">📞 ${contact.phone}</div>
                    <div class="contact-email">📧 ${contact.email}</div>
                </div>
                <button onclick="deleteContact(${contact.id})" class="delete-btn">삭제</button>
            </div>
        `).join('');
    };

    const deleteContact = (contactId) => {
        contacts = contacts.filter(contact => contact.id !== contactId);
        saveData('contacts', contacts);
        renderContacts();
    };

    const addFeedback = () => {
        const type = document.getElementById('feedback-type').value;
        const title = document.getElementById('feedback-title').value.trim();
        const content = document.getElementById('feedback-content').value.trim();
        const priority = document.getElementById('feedback-priority').value;
        
        if (!title || !content) return;
        
        const feedback = {
            id: Date.now(),
            type,
            title,
            content,
            priority,
            status: 'open',
            createdAt: new Date().toISOString()
        };
        
        feedbacks.push(feedback);
        saveData('feedbacks', feedbacks);
        renderFeedbacks();
        
        document.getElementById('feedback-title').value = '';
        document.getElementById('feedback-content').value = '';
    };

    const renderFeedbacks = () => {
        const feedbacksList = document.getElementById('feedbacks-list');
        if (!feedbacksList) return;
        
        feedbacksList.innerHTML = feedbacks.map(feedback => {
            const typeLabels = {
                'suggestion': '개선 제안',
                'issue': '문제점',
                'praise': '칭찬',
                'complaint': '불만'
            };
            
            return `
                <div class="feedback-item ${feedback.priority} ${feedback.type}">
                    <div class="feedback-header">
                        <span class="feedback-title">${feedback.title}</span>
                        <span class="feedback-type">${typeLabels[feedback.type]}</span>
                    </div>
                    <div class="feedback-content">${feedback.content}</div>
                    <div class="feedback-meta">
                        <span class="feedback-priority">우선순위: ${feedback.priority}</span>
                        <span class="feedback-status">상태: ${feedback.status === 'open' ? '미해결' : '해결'}</span>
                        <span class="feedback-date">${new Date(feedback.createdAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                    <div class="feedback-actions">
                        <button onclick="toggleFeedbackStatus(${feedback.id})" class="status-btn">${feedback.status === 'open' ? '해결됨으로 변경' : '미해결로 변경'}</button>
                        <button onclick="deleteFeedback(${feedback.id})" class="delete-btn">삭제</button>
                    </div>
                </div>
            `;
        }).join('');
    };

    const toggleFeedbackStatus = (feedbackId) => {
        const feedback = feedbacks.find(f => f.id === feedbackId);
        if (feedback) {
            feedback.status = feedback.status === 'open' ? 'resolved' : 'open';
            saveData('feedbacks', feedbacks);
            renderFeedbacks();
        }
    };

    const deleteFeedback = (feedbackId) => {
        feedbacks = feedbacks.filter(feedback => feedback.id !== feedbackId);
        saveData('feedbacks', feedbacks);
        renderFeedbacks();
    };

    const addHandover = () => {
        const project = document.getElementById('handover-project').value.trim();
        const from = document.getElementById('handover-from').value.trim();
        const to = document.getElementById('handover-to').value.trim();
        const details = document.getElementById('handover-details').value.trim();
        const deadline = document.getElementById('handover-deadline').value;
        
        if (!project || !from || !to || !details || !deadline) return;
        
        const handover = {
            id: Date.now(),
            project,
            from,
            to,
            details,
            deadline,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        handovers.push(handover);
        saveData('handovers', handovers);
        renderHandovers();
        
        document.getElementById('handover-project').value = '';
        document.getElementById('handover-from').value = '';
        document.getElementById('handover-to').value = '';
        document.getElementById('handover-details').value = '';
        document.getElementById('handover-deadline').value = '';
    };

    const renderHandovers = () => {
        const handoversList = document.getElementById('handovers-list');
        if (!handoversList) return;
        
        handoversList.innerHTML = handovers.map(handover => {
            const deadlineDate = new Date(handover.deadline);
            const isOverdue = deadlineDate < new Date() && handover.status !== 'completed';
            
            return `
                <div class="handover-item ${handover.status} ${isOverdue ? 'overdue' : ''}">
                    <div class="handover-header">
                        <span class="handover-project">${handover.project}</span>
                        <span class="handover-status status-${handover.status}">${handover.status === 'pending' ? '대기중' : handover.status === 'in-progress' ? '진행중' : '완료'}</span>
                    </div>
                    <div class="handover-people">
                        <span class="handover-from">인계자: ${handover.from}</span>
                        <span class="handover-to">인수자: ${handover.to}</span>
                    </div>
                    <div class="handover-details">${handover.details}</div>
                    <div class="handover-deadline ${isOverdue ? 'overdue' : ''}">마감일: ${handover.deadline}</div>
                    <div class="handover-actions">
                        <select onchange="updateHandoverStatus(${handover.id}, this.value)" value="${handover.status}">
                            <option value="pending" ${handover.status === 'pending' ? 'selected' : ''}>대기중</option>
                            <option value="in-progress" ${handover.status === 'in-progress' ? 'selected' : ''}>진행중</option>
                            <option value="completed" ${handover.status === 'completed' ? 'selected' : ''}>완료</option>
                        </select>
                        <button onclick="deleteHandover(${handover.id})" class="delete-btn">삭제</button>
                    </div>
                </div>
            `;
        }).join('');
    };

    const updateHandoverStatus = (handoverId, newStatus) => {
        const handover = handovers.find(h => h.id === handoverId);
        if (handover) {
            handover.status = newStatus;
            saveData('handovers', handovers);
            renderHandovers();
        }
    };

    const deleteHandover = (handoverId) => {
        handovers = handovers.filter(handover => handover.id !== handoverId);
        saveData('handovers', handovers);
        renderHandovers();
    };

    // --- 성장 및 학습 Functions ---
    
    const addLearningPlan = () => {
        const subject = document.getElementById('learning-subject').value.trim();
        const targetDate = document.getElementById('learning-target-date').value;
        const type = document.getElementById('learning-type').value;
        const notes = document.getElementById('learning-notes').value.trim();
        
        if (!subject || !targetDate) return;
        
        const learning = {
            id: Date.now(),
            subject,
            targetDate,
            type,
            notes,
            progress: 0,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        learningPlans.push(learning);
        saveData('learningPlans', learningPlans);
        renderLearningPlans();
        
        document.getElementById('learning-subject').value = '';
        document.getElementById('learning-target-date').value = '';
        document.getElementById('learning-notes').value = '';
    };

    const renderLearningPlans = () => {
        const learningList = document.getElementById('learning-list');
        if (!learningList) return;
        
        learningList.innerHTML = learningPlans.map(learning => {
            const targetDate = new Date(learning.targetDate);
            const isOverdue = targetDate < new Date() && !learning.completed;
            
            const typeLabels = {
                'online': '온라인 강의',
                'book': '도서',
                'workshop': '워크샵',
                'conference': '컨퍼런스',
                'certification': '자격증'
            };
            
            return `
                <div class="learning-item ${learning.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}">
                    <div class="learning-header">
                        <span class="learning-subject">${learning.subject}</span>
                        <span class="learning-type">${typeLabels[learning.type]}</span>
                    </div>
                    <div class="learning-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${learning.progress}%"></div>
                        </div>
                        <span class="progress-text">${learning.progress}%</span>
                    </div>
                    <div class="learning-target">목표일: ${learning.targetDate}</div>
                    ${learning.notes ? `<div class="learning-notes">${learning.notes}</div>` : ''}
                    <div class="learning-actions">
                        <input type="range" min="0" max="100" value="${learning.progress}" onchange="updateLearningProgress(${learning.id}, this.value)">
                        <button onclick="toggleLearningComplete(${learning.id})" class="complete-btn">${learning.completed ? '미완료로 변경' : '완료'}</button>
                        <button onclick="deleteLearningPlan(${learning.id})" class="delete-btn">삭제</button>
                    </div>
                </div>
            `;
        }).join('');
    };

    const updateLearningProgress = (learningId, progress) => {
        const learning = learningPlans.find(l => l.id === learningId);
        if (learning) {
            learning.progress = parseInt(progress);
            if (learning.progress >= 100) {
                learning.completed = true;
            }
            saveData('learningPlans', learningPlans);
            renderLearningPlans();
        }
    };

    const toggleLearningComplete = (learningId) => {
        const learning = learningPlans.find(l => l.id === learningId);
        if (learning) {
            learning.completed = !learning.completed;
            if (learning.completed) {
                learning.progress = 100;
            }
            saveData('learningPlans', learningPlans);
            renderLearningPlans();
        }
    };

    const deleteLearningPlan = (learningId) => {
        learningPlans = learningPlans.filter(learning => learning.id !== learningId);
        saveData('learningPlans', learningPlans);
        renderLearningPlans();
    };

    const addSkill = () => {
        const name = document.getElementById('skill-name').value.trim();
        const category = document.getElementById('skill-category').value;
        const level = parseInt(document.getElementById('skill-level').value);
        
        if (!name) return;
        
        const skill = {
            id: Date.now(),
            name,
            category,
            level,
            createdAt: new Date().toISOString()
        };
        
        skills.push(skill);
        saveData('skills', skills);
        renderSkills();
        
        document.getElementById('skill-name').value = '';
    };

    const renderSkills = () => {
        const skillsMatrix = document.getElementById('skills-matrix');
        if (!skillsMatrix) return;
        
        const categories = [...new Set(skills.map(skill => skill.category))];
        
        skillsMatrix.innerHTML = categories.map(category => {
            const categorySkills = skills.filter(skill => skill.category === category);
            const categoryLabels = {
                'technical': '기술',
                'communication': '소통',
                'leadership': '리더십',
                'project': '프로젝트 관리',
                'language': '언어'
            };
            
            return `
                <div class="skill-category">
                    <h4>${categoryLabels[category]}</h4>
                    <div class="skills-list">
                        ${categorySkills.map(skill => `
                            <div class="skill-item level-${skill.level}">
                                <div class="skill-header">
                                    <span class="skill-name">${skill.name}</span>
                                    <span class="skill-level">레벨 ${skill.level}</span>
                                </div>
                                <div class="skill-bar">
                                    <div class="skill-fill" style="width: ${(skill.level / 5) * 100}%"></div>
                                </div>
                                <button onclick="deleteSkill(${skill.id})" class="delete-btn">삭제</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    };

    const deleteSkill = (skillId) => {
        skills = skills.filter(skill => skill.id !== skillId);
        saveData('skills', skills);
        renderSkills();
    };

    const addBook = () => {
        const title = document.getElementById('book-title').value.trim();
        const author = document.getElementById('book-author').value.trim();
        const status = document.getElementById('reading-status').value;
        const pages = parseInt(document.getElementById('book-pages').value) || 0;
        const currentPage = parseInt(document.getElementById('current-page').value) || 0;
        
        if (!title || !author) return;
        
        const book = {
            id: Date.now(),
            title,
            author,
            status,
            pages,
            currentPage,
            createdAt: new Date().toISOString()
        };
        
        books.push(book);
        saveData('books', books);
        renderBooks();
        updateReadingStats();
        
        document.getElementById('book-title').value = '';
        document.getElementById('book-author').value = '';
        document.getElementById('book-pages').value = '';
        document.getElementById('current-page').value = '';
    };

    const renderBooks = () => {
        const booksList = document.getElementById('books-list');
        if (!booksList) return;
        
        booksList.innerHTML = books.map(book => {
            const progress = book.pages > 0 ? Math.round((book.currentPage / book.pages) * 100) : 0;
            
            const statusLabels = {
                'to-read': '읽을 예정',
                'reading': '읽는 중',
                'completed': '완료'
            };
            
            return `
                <div class="book-item ${book.status}">
                    <div class="book-header">
                        <span class="book-title">${book.title}</span>
                        <span class="book-status">${statusLabels[book.status]}</span>
                    </div>
                    <div class="book-author">저자: ${book.author}</div>
                    ${book.pages > 0 ? `
                        <div class="book-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progress}%"></div>
                            </div>
                            <span class="progress-text">${book.currentPage}/${book.pages} 페이지 (${progress}%)</span>
                        </div>
                        <input type="number" value="${book.currentPage}" onchange="updateBookProgress(${book.id}, this.value)" placeholder="현재 페이지" min="0" max="${book.pages}">
                    ` : ''}
                    <select onchange="updateBookStatus(${book.id}, this.value)" value="${book.status}">
                        <option value="to-read" ${book.status === 'to-read' ? 'selected' : ''}>읽을 예정</option>
                        <option value="reading" ${book.status === 'reading' ? 'selected' : ''}>읽는 중</option>
                        <option value="completed" ${book.status === 'completed' ? 'selected' : ''}>완료</option>
                    </select>
                    <button onclick="deleteBook(${book.id})" class="delete-btn">삭제</button>
                </div>
            `;
        }).join('');
    };

    const updateBookProgress = (bookId, currentPage) => {
        const book = books.find(b => b.id === bookId);
        if (book) {
            book.currentPage = parseInt(currentPage);
            if (book.currentPage >= book.pages && book.pages > 0) {
                book.status = 'completed';
            }
            saveData('books', books);
            renderBooks();
            updateReadingStats();
        }
    };

    const updateBookStatus = (bookId, newStatus) => {
        const book = books.find(b => b.id === bookId);
        if (book) {
            book.status = newStatus;
            if (newStatus === 'completed' && book.pages > 0) {
                book.currentPage = book.pages;
            }
            saveData('books', books);
            renderBooks();
            updateReadingStats();
        }
    };

    const updateReadingStats = () => {
        const totalBooks = books.length;
        const completedBooks = books.filter(book => book.status === 'completed').length;
        const readingBooks = books.filter(book => book.status === 'reading').length;
        
        const totalElem = document.getElementById('total-books');
        const completedElem = document.getElementById('completed-books');
        const readingElem = document.getElementById('reading-books');
        
        if (totalElem) totalElem.textContent = `${totalBooks}권`;
        if (completedElem) completedElem.textContent = `${completedBooks}권`;
        if (readingElem) readingElem.textContent = `${readingBooks}권`;
    };

    const deleteBook = (bookId) => {
        books = books.filter(book => book.id !== bookId);
        saveData('books', books);
        renderBooks();
        updateReadingStats();
    };

    // --- 도구 및 유틸리티 Functions ---
    
    const generatePassword = () => {
        const length = parseInt(document.getElementById('password-length').value);
        const includeUppercase = document.getElementById('include-uppercase').checked;
        const includeLowercase = document.getElementById('include-lowercase').checked;
        const includeNumbers = document.getElementById('include-numbers').checked;
        const includeSymbols = document.getElementById('include-symbols').checked;
        
        let charset = '';
        if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (includeNumbers) charset += '0123456789';
        if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        if (!charset) return;
        
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        document.getElementById('generated-password').value = password;
        updatePasswordStrength(password);
    };

    const updatePasswordStrength = (password) => {
        let strength = 0;
        const checks = [
            password.length >= 8,
            /[a-z]/.test(password),
            /[A-Z]/.test(password),
            /[0-9]/.test(password),
            /[^A-Za-z0-9]/.test(password)
        ];
        
        strength = checks.filter(check => check).length;
        
        const strengthLabels = ['매우 약함', '약함', '보통', '강함', '매우 강함'];
        const strengthColors = ['#dc3545', '#fd7e14', '#ffc107', '#198754', '#0d6efd'];
        
        const indicator = document.getElementById('password-strength-indicator');
        if (indicator) {
            indicator.textContent = strengthLabels[strength - 1] || '매우 약함';
            indicator.style.color = strengthColors[strength - 1] || '#dc3545';
        }
    };

    const copyPassword = () => {
        const passwordField = document.getElementById('generated-password');
        if (passwordField && passwordField.value) {
            navigator.clipboard.writeText(passwordField.value).then(() => {
                alert('비밀번호가 클립보드에 복사되었습니다.');
            });
        }
    };

    const generateQRCode = () => {
        const text = document.getElementById('qr-text').value.trim();
        if (!text) return;
        
        // Simple QR code generation (would need a real QR library in production)
        const qrDisplay = document.getElementById('qr-code-display');
        const downloadBtn = document.getElementById('download-qr-btn');
        
        qrDisplay.innerHTML = `
            <div class="qr-placeholder">
                <div class="qr-grid">
                    ${Array(25).fill().map(() => `<div class="qr-cell ${Math.random() > 0.5 ? 'filled' : ''}"></div>`).join('')}
                </div>
                <p>QR 코드 (실제 구현시 QR 라이브러리 필요)</p>
            </div>
        `;
        
        downloadBtn.classList.remove('hidden');
    };

    const updateUnitOptions = () => {
        const conversionType = document.getElementById('conversion-type').value;
        const fromUnit = document.getElementById('from-unit');
        const toUnit = document.getElementById('to-unit');
        
        let units = [];
        
        switch (conversionType) {
            case 'length':
                units = ['mm', 'cm', 'm', 'km', 'inch', 'ft', 'yard', 'mile'];
                break;
            case 'weight':
                units = ['mg', 'g', 'kg', 'ton', 'oz', 'lb'];
                break;
            case 'temperature':
                units = ['C', 'F', 'K'];
                break;
            case 'currency':
                units = ['KRW', 'USD', 'EUR', 'JPY', 'CNY'];
                break;
            case 'area':
                units = ['mm²', 'cm²', 'm²', 'km²', 'in²', 'ft²'];
                break;
        }
        
        fromUnit.innerHTML = units.map(unit => `<option value="${unit}">${unit}</option>`).join('');
        toUnit.innerHTML = units.map(unit => `<option value="${unit}">${unit}</option>`).join('');
    };

    const convertUnits = () => {
        const conversionType = document.getElementById('conversion-type').value;
        const fromValue = parseFloat(document.getElementById('from-value').value);
        const fromUnit = document.getElementById('from-unit').value;
        const toUnit = document.getElementById('to-unit').value;
        const toValueField = document.getElementById('to-value');
        
        if (!fromValue || !fromUnit || !toUnit) return;
        
        let result = 0;
        
        if (conversionType === 'temperature') {
            result = convertTemperature(fromValue, fromUnit, toUnit);
        } else if (conversionType === 'currency') {
            // 간단한 환율 (실제로는 API 호출 필요)
            const rates = { KRW: 1, USD: 1300, EUR: 1400, JPY: 9, CNY: 180 };
            result = (fromValue / rates[fromUnit]) * rates[toUnit];
        } else {
            const conversions = unitConversions[conversionType];
            if (conversions && conversions[fromUnit] && conversions[toUnit]) {
                result = (fromValue * conversions[fromUnit]) / conversions[toUnit];
            }
        }
        
        toValueField.value = result.toFixed(6);
    };

    const convertTemperature = (value, from, to) => {
        let celsius = value;
        
        if (from === 'F') celsius = (value - 32) * 5/9;
        if (from === 'K') celsius = value - 273.15;
        
        if (to === 'C') return celsius;
        if (to === 'F') return (celsius * 9/5) + 32;
        if (to === 'K') return celsius + 273.15;
        
        return value;
    };

    // --- Initialization & App Start ---
    async function initializeApp() {
        // 1. Load all data from localStorage and apply to state
        todos = loadData('todos') || [];
        notes = loadData('notes') || [];
        recordings = loadData('voiceRecordings') || [];
        ttsSchedules = loadData('ttsSchedules') || [];
        previousHourlyForecast = loadData('previousHourlyForecast') || [];
        attendanceRecords = loadData('attendanceRecords') || {};
        isTtsEnabled = loadData('ttsEnabled') ?? true;
        isTodoTtsEnabled = loadData('todoTtsEnabled') ?? true;
        goals = loadData('goals') || [];
        timeEntries = loadData('timeEntries') || [];
        achievements = loadData('achievements') || [];
        projects = loadData('projects') || [];
        const focusData = loadData('focusTime');
        if (focusData && focusData.date === new Date().toISOString().split('T')[0]) {
            totalFocusTime = focusData.total || 0;
        }
        expenses = loadData('expenses') || [];
        budgets = loadData('budgets') || [];
        meetings = loadData('meetings') || [];
        deadlines = loadData('deadlines') || [];
        taskTemplates = loadData('taskTemplates') || [];
        leaves = loadData('leaves') || [];
        contacts = loadData('contacts') || [];
        feedbacks = loadData('feedbacks') || [];
        handovers = loadData('handovers') || [];
        learningPlans = loadData('learningPlans') || [];
        skills = loadData('skills') || [];
        books = loadData('books') || [];
        const pomoSettings = loadData('pomoSettings');
        if (pomoSettings) {
            workDuration = pomoSettings.work;
            breakDuration = pomoSettings.break;
        }
        cardVisibility = loadData('cardVisibility') || {};
        // Ensure all cards are in cardVisibility with a default true value
        const allCardIds = [
            'weather', 'tts-notifier', 'notes', 'voiceMemo', 'pomodoro', 
            'todo', 'done', 'calculator', 'attendance', 'attendanceSummary',
            'goal-tracker', 'time-analysis', 'productivity-metrics', 'project-management',
            'expense-manager', 'salary-calculator', 'budget-tracker',
            'meeting-manager', 'deadline-tracker', 'task-template', 'leave-manager',
            'team-contacts', 'feedback-collector', 'handover-manager',
            'learning-plan', 'skill-matrix', 'reading-list',
            'password-generator', 'qr-generator', 'unit-converter'
        ];
        allCardIds.forEach(id => {
            if (cardVisibility[id] === undefined) {
                cardVisibility[id] = true;
            }
        });

        // 2. Fetch remote data
        await Promise.all([
            fetchHolidays(new Date().getFullYear()),
            fetchHolidays(new Date().getFullYear() + 1)
        ]);

        // 3. Render UI after all data is ready
        loadCardOrder();
        updateCurrentTodoDate();
        renderTodos();
        renderNotes();
        renderRecordings();
        renderTtsSchedules();
        renderAttendance();
        updatePomoTimer();
        updateCardVisibility();
        renderGoals();
        renderTimeEntries();
        updateTimeSummary();
        renderAchievements();
        updateProductivityMetrics();
        renderProjects();
        renderExpenses();
        updateExpenseSummary();
        renderBudgets();
        renderMeetings();
        renderDeadlines();
        renderTaskTemplates();
        renderLeaves();
        updateLeaveStats();
        renderContacts();
        renderFeedbacks();
        renderHandovers();
        renderLearningPlans();
        renderSkills();
        renderBooks();
        updateReadingStats();
        updateUnitOptions();

        // 4. Update UI controls to reflect the loaded state
        ttsToggle.checked = isTtsEnabled;
        todoTtsToggle.checked = isTodoTtsEnabled;
        workTimeInput.value = workDuration;
        breakTimeInput.value = breakDuration;
        // Initialize settings modal checkboxes
        settingsCheckboxes.forEach(checkbox => {
            const cardName = checkbox.id.replace('toggle-', '').replace('-card', '');
            checkbox.checked = cardVisibility[cardName] ?? true;
        });

        // Setup card visibility listeners after initialization
        setupCardVisibilityListeners();
    }

    // --- Drag and Drop & Card Order ---
    const mainContainer = document.querySelector('.main-container');
    const dashboardCards = document.querySelectorAll('.dashboard-card');

    dashboardCards.forEach(card => {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', () => card.classList.add('dragging'));
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            saveCardOrder();
        });
    });

    mainContainer.addEventListener('dragover', e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(mainContainer, e.clientY);
        const draggingCard = document.querySelector('.dragging');
        if (afterElement == null) {
            mainContainer.appendChild(draggingCard);
        } else {
            mainContainer.insertBefore(draggingCard, afterElement);
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.dashboard-card:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    const saveCardOrder = () => {
        const cardOrder = [...document.querySelectorAll('.main-container .dashboard-card')].map(card => card.id);
        saveData('cardOrder', cardOrder);
    };

    const loadCardOrder = () => {
        const savedOrder = loadData('cardOrder');
        if (savedOrder) {
            savedOrder.forEach(cardId => {
                const card = document.getElementById(cardId);
                if (card) {
                    mainContainer.appendChild(card);
                }
            });
        }
    };

    // Event Listeners for new cards
    document.addEventListener('click', (e) => {
        // 데이터 관리 및 분석
        if (e.target.id === 'add-goal-btn') addGoal();
        if (e.target.id === 'add-time-entry-btn') addTimeEntry();
        if (e.target.id === 'start-focus-session') startFocusSession();
        if (e.target.id === 'log-achievement') logAchievement();
        if (e.target.id === 'add-project-btn') addProject();
        
        // 재무 및 비용 관리
        if (e.target.id === 'add-expense-btn') addExpense();
        if (e.target.id === 'calculate-salary-btn') calculateSalary();
        if (e.target.id === 'add-budget-btn') addBudget();
        
        // 업무 조직 및 계획
        if (e.target.id === 'add-meeting-btn') addMeeting();
        if (e.target.id === 'add-deadline-btn') addDeadline();
        if (e.target.id === 'add-template-btn') addTaskTemplate();
        if (e.target.id === 'add-leave-btn') addLeave();
        
        // 협업 및 소통
        if (e.target.id === 'add-contact-btn') addContact();
        if (e.target.id === 'add-feedback-btn') addFeedback();
        if (e.target.id === 'add-handover-btn') addHandover();
        
        // 성장 및 학습
        if (e.target.id === 'add-learning-btn') addLearningPlan();
        if (e.target.id === 'add-skill-btn') addSkill();
        if (e.target.id === 'add-book-btn') addBook();
        
        // 도구 및 유틸리티
        if (e.target.id === 'generate-password-btn') generatePassword();
        if (e.target.id === 'copy-password-btn') copyPassword();
        if (e.target.id === 'generate-qr-btn') generateQRCode();
        if (e.target.id === 'convert-btn') convertUnits();
    });

    // Additional event listeners
    document.addEventListener('change', (e) => {
        if (e.target.id === 'conversion-type') updateUnitOptions();
        if (e.target.id === 'from-value' || e.target.id === 'from-unit' || e.target.id === 'to-unit') convertUnits();
    });

    // Category dropdown functionality
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-header') || e.target.closest('.category-header')) {
            const header = e.target.classList.contains('category-header') ? e.target : e.target.closest('.category-header');
            const categoryId = header.dataset.category;
            const controls = document.getElementById(`category-${categoryId}`);
            
            if (controls) {
                const isCollapsed = controls.classList.contains('collapsed');
                
                if (isCollapsed) {
                    // Expand - calculate dynamic height
                    controls.style.maxHeight = 'none';
                    const scrollHeight = controls.scrollHeight;
                    controls.style.maxHeight = '0px';
                    
                    // Force reflow then animate
                    controls.offsetHeight;
                    controls.classList.remove('collapsed');
                    controls.style.maxHeight = scrollHeight + 'px';
                    header.classList.add('expanded');
                } else {
                    // Collapse
                    controls.style.maxHeight = controls.scrollHeight + 'px';
                    // Force reflow then animate
                    controls.offsetHeight;
                    controls.style.maxHeight = '0px';
                    controls.classList.add('collapsed');
                    header.classList.remove('expanded');
                }
            }
        }
    });

    // Start the application
    initializeApp();
});