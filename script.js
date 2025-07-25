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

    console.log("DOM Elements:", {
        toggleButton, statusElem, weatherInfoElem, currentWeatherElem, currentTempElem, hourlyForecastElem,
        todoForm, todoTimeInput, todoTextInput, todoPriorityInput, todoListElem, doneListElem,
        pomoTimerElem, pomoStatusElem, pomoStartPauseBtn, pomoResetBtn, pomoVisualTimerElem, pomoDigitalTimerElem,
        workTimeInput, breakTimeInput, setPomoTimeBtn,
        noteForm, noteInput, noteList, ttsToggle, todoTtsToggle,
        checkInBtn, checkOutBtn, statusSelect, applyStatusBtn, dailyAttendanceTableBody,
        monthlyTotalDays, monthlyLateCount, monthlyEarlyCount, monthlySickCount, monthlyAbsentCount, monthlyAnnualLeaveCount,
        showMonthlyViewBtn, monthlyCalendarView, prevMonthBtn, nextMonthBtn, currentMonthYear, calendarGrid,
        recordButton, recordingsList, recordingTagInput, recordingTimerElem,
        toggleWeatherCard, toggleNotesCard, toggleVoiceMemoCard, togglePomodoroCard, toggleTodoCard, toggleDoneCard, toggleAttendanceCard, toggleAttendanceSummaryCard, toggleCalculatorCard,
        calculatorDisplay, calculatorButtons
    });

    // --- Global State ---
    const API_KEY = 'SPoonI/4mUJxw4Vmxo4aGH3kaoUjNxNM8Ykjd8OpB/qRJ6M+Gd2+A5mIjSCN+YY6Fp1LIsACNnYlujeHw45E5A==';
    let isWeatherSystemActive = false;
    let minuteInterval = null;
    let weatherInterval = null;
    let userCoords = null;
    let todos = [];
    let notes = [];
    let attendanceRecords = {}; // Stores attendance data
    let holidays = {}; // Stores holidays fetched from API
    let currentCalendarDate = new Date(); // For monthly calendar view

    // Pomodoro State
    let pomoInterval = null;
    let pomoTimeLeft = 25 * 60;
    let isPomoRunning = false;
    let isPomoWorkSession = true;
    let workDuration = 25; // Default work duration in minutes
    let breakDuration = 5; // Default break duration in minutes

    // Card Visibility State
    let cardVisibility = {
        weather: true,
        notes: true,
        voiceMemo: true,
        pomodoro: true,
        todo: true,
        done: true,
        attendance: true,
        attendanceSummary: true,
        calculator: true,
        settings: true // Settings card itself is always visible
    };

    // Calculator State
    let expression = '0';

    // Voice Memo State
    let mediaRecorder;
    let audioChunks = [];
    let recordings = [];
    let recordingTimerInterval = null;

    // TTS State
    let isTtsEnabled = true; // Default to true
    let isTodoTtsEnabled = true; // Default to true

    // --- Utility Functions ---
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const base64toBlob = (base64, mimeType = 'audio/wav') => {
        const byteString = atob(base64.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeType });
    };

    const speak = (text) => {
        if (!isTtsEnabled) return;
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

    // --- Card Visibility Functions ---
    const updateCardVisibility = () => {
        document.getElementById('weather-card').style.display = cardVisibility.weather ? 'flex' : 'none';
        document.getElementById('notes-card').style.display = cardVisibility.notes ? 'flex' : 'none';
        document.getElementById('voice-memo-card').style.display = cardVisibility.voiceMemo ? 'flex' : 'none';
        document.getElementById('pomodoro-card').style.display = cardVisibility.pomodoro ? 'flex' : 'none';
        document.getElementById('todo-card').style.display = cardVisibility.todo ? 'flex' : 'none';
        document.getElementById('done-card').style.display = cardVisibility.done ? 'flex' : 'none';
        document.getElementById('attendance-card').style.display = cardVisibility.attendance ? 'flex' : 'none';
        document.getElementById('attendance-summary-card').style.display = cardVisibility.attendanceSummary ? 'flex' : 'none';
        document.getElementById('calculator-card').style.display = cardVisibility.calculator ? 'flex' : 'none';
        // Settings card is always visible

        saveData('cardVisibility', cardVisibility);
    };

    const setupCardVisibilityListeners = () => {
        toggleWeatherCard.addEventListener('change', (e) => { cardVisibility.weather = e.target.checked; updateCardVisibility(); });
        toggleNotesCard.addEventListener('change', (e) => { cardVisibility.notes = e.target.checked; updateCardVisibility(); });
        toggleVoiceMemoCard.addEventListener('change', (e) => { cardVisibility.voiceMemo = e.target.checked; updateCardVisibility(); });
        togglePomodoroCard.addEventListener('change', (e) => { cardVisibility.pomodoro = e.target.checked; updateCardVisibility(); });
        toggleTodoCard.addEventListener('change', (e) => { cardVisibility.todo = e.target.checked; updateCardVisibility(); });
        toggleDoneCard.addEventListener('change', (e) => { cardVisibility.done = e.target.checked; updateCardVisibility(); });
        toggleAttendanceCard.addEventListener('change', (e) => { cardVisibility.attendance = e.target.checked; updateCardVisibility(); });
        toggleAttendanceSummaryCard.addEventListener('change', (e) => { cardVisibility.attendanceSummary = e.target.checked; updateCardVisibility(); });
        toggleCalculatorCard.addEventListener('change', (e) => { cardVisibility.calculator = e.target.checked; updateCardVisibility(); });
    };

    // --- Calculator Functions ---
    const updateCalculatorDisplay = () => {
        calculatorDisplay.textContent = expression;
    };

    const handleNumberClick = (num) => {
        if (expression === '0') {
            expression = num;
        } else {
            expression += num;
        }
        updateCalculatorDisplay();
    };

    const handleOperatorClick = (op) => {
        // Prevent adding multiple operators consecutively
        const lastChar = expression.slice(-1);
        if (['+', '-', '×', '÷'].includes(lastChar)) {
            expression = expression.slice(0, -1) + op;
        } else {
            expression += op;
        }
        updateCalculatorDisplay();
    };

    const handleEqualsClick = () => {
        try {
            // Replace '×' and '÷' with '*' and '/' for evaluation
            const evalExpression = expression.replace(/×/g, '*').replace(/÷/g, '/');
            const result = eval(evalExpression);
            expression = result.toString();
            updateCalculatorDisplay();
        } catch (error) {
            expression = 'Error';
            updateCalculatorDisplay();
            setTimeout(() => {
                expression = '0';
                updateCalculatorDisplay();
            }, 1000);
        }
    };

    const handleClearClick = () => {
        expression = '0';
        updateCalculatorDisplay();
    };

    const handleDecimalClick = () => {
        // Prevent adding multiple decimals in one number segment
        const segments = expression.split(/[+\-×÷]/);
        const lastSegment = segments[segments.length - 1];
        if (!lastSegment.includes('.')) {
            expression += '.';
            updateCalculatorDisplay();
        }
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
            const data = await response.json();
            if (data.response.header.resultCode !== '00') throw new Error(`API Error: ${data.response.header.resultMsg}`);
            if (!data.response.body?.items?.item) throw new Error('API 응답에 날씨 정보가 없습니다.');

            const items = data.response.body.items.item;
            const currentHourStr = `${now.getHours().toString().padStart(2, '0')}00`;

            const findMostRecent = (category) => {
                return items.filter(item => item.category === category && item.fcstTime <= currentHourStr).sort((a, b) => b.fcstTime.localeCompare(a.fcstTime))[0];
            };

            const tempItem = findMostRecent('TMP') || items.find(i => i.category === 'T1H');
            const skyItem = findMostRecent('SKY');
            const ptyItem = findMostRecent('PTY');

            const skyState = { '1': '맑음', '3': '구름많음', '4': '흐림' }[skyItem?.fcstValue];
            const ptyState = { '0': '없음', '1': '비', '2': '비/눈', '3': '눈', '5': '빗방울', '6': '빗방울/눈날림', '7': '눈날림' }[ptyItem?.fcstValue];

            const currentWeather = ptyState !== '없음' ? ptyState : skyState;
            const currentTemp = tempItem?.fcstValue;

            const hourlyForecast = [];
            for (let i = 1; i <= 6; i++) {
                const forecastDate = new Date(now.getTime() + i * 60 * 60 * 1000);
                const forecastDateStr = `${forecastDate.getFullYear()}${(forecastDate.getMonth() + 1).toString().padStart(2, '0')}${forecastDate.getDate().toString().padStart(2, '0')}`;
                const forecastTimeStr = `${forecastDate.getHours().toString().padStart(2, '0')}00`;

                const hourlyTempItem = items.find(item => item.category === 'TMP' && item.fcstDate === forecastDateStr && item.fcstTime === forecastTimeStr);
                const hourlySkyItem = items.find(item => item.category === 'SKY' && item.fcstDate === forecastDateStr && item.fcstTime === forecastTimeStr);
                const hourlyPtyItem = items.find(item => item.category === 'PTY' && item.fcstDate === forecastDateStr && item.fcstTime === forecastTimeStr);

                if (hourlyTempItem && hourlySkyItem && hourlyPtyItem) {
                    const forecastSky = { '1': '맑음', '3': '구름많음', '4': '흐림' }[hourlySkyItem.fcstValue];
                    const forecastPty = { '0': '없음', '1': '비', '2': '비/눈', '3': '눈', '5': '빗방울', '6': '빗방울/눈날림', '7': '눈날림' }[hourlyPtyItem.fcstValue];
                    hourlyForecast.push({
                        time: `${forecastDate.getHours().toString().padStart(2, '0')}:00`,
                        weather: forecastPty !== '없음' ? forecastPty : forecastSky,
                        temp: hourlyTempItem.fcstValue
                    });
                }
            }
            return { currentWeather, currentTemp, hourlyForecast };
        } catch (error) {
            console.error('날씨 정보 조회 오류:', error);
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

    // --- To-Do Functions ---
    const renderTodos = () => {
        todoListElem.innerHTML = '';
        doneListElem.innerHTML = '';

        const sortedTodos = todos.sort((a, b) => {
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
        todos.push({ id: Date.now(), time, text, priority, completed: false });
        saveData('todos', todos);
        renderTodos();
    };

    const handleTodoAction = (e) => {
        const li = e.target.closest('li');
        if (!li) return;
        const id = Number(li.dataset.id);
        const todo = todos.find(t => t.id === id);

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
        const minutes = Math.floor(pomoTimeLeft / 60).toString().padStart(2, '0');
        const seconds = (pomoTimeLeft % 60).toString().padStart(2, '0');
        pomoDigitalTimerElem.textContent = `${minutes}:${seconds}`;

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
            if (pomoTimeLeft <= 0) {
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
        resetPomo(); // Reset timer with new settings
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
        notes.unshift({ id: Date.now(), content, timestamp }); // Add to the beginning
        saveData('notes', notes);
        renderNotes();
    };

    const deleteNote = (id) => {
        notes = notes.filter(note => note.id !== id);
        saveData('notes', notes);
        renderNotes();
    };

    // --- Attendance Functions ---
    const getTodayKey = () => {
        const today = new Date();
        return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    };

    const getDayOfWeek = (dateString) => {
        const date = new Date(dateString);
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return days[date.getDay()];
    };

    const getHolidayInfo = (year, month, date) => {
        const dateKey = `${year}-${month.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
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
                } else {
                    console.warn(`공휴일 정보 없음: ${year}년`);
                }
            } else {
                console.error(`공휴일 API 오류 (${year}년): ${data.response.header.resultCode} - ${data.response.header.resultMsg}`);
            }
        } catch (error) {
            console.error('공휴일 정보 조회 중 네트워크 또는 파싱 오류:', error);
        }
    };

    const renderAttendance = () => {
        console.log("Rendering attendance...");
        dailyAttendanceTableBody.innerHTML = '';
        const todayKey = getTodayKey();
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        let totalWorkingDays = 0;
        let lateCount = 0;
        let earlyCount = 0;
        let sickCount = 0;
        let absentCount = 0;
        let annualLeaveCount = 0;

        // Render last 5 working days
        let renderedDays = 0;
        for (let i = 0; renderedDays < 5 && i < 30; i++) { // Check up to last 30 days
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            const dayOfWeek = date.getDay();

            // Re-enabled: Skip weekends and holidays for daily view
            if (dayOfWeek === 0 || dayOfWeek === 6 || getHolidayInfo(date.getFullYear(), date.getMonth() + 1, date.getDate())) continue; 

            const record = attendanceRecords[dateKey] || { checkIn: '-', checkOut: '-', status: '-' };

            const row = dailyAttendanceTableBody.insertRow();
            row.innerHTML = `
                <td>${dateKey}</td>
                <td>${getDayOfWeek(dateKey)}</td>
                <td>${record.checkIn}</td>
                <td>${record.checkOut}</td>
                <td>${record.status}</td>
            `;
            renderedDays++;
        }

        // Calculate monthly summary for current month
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

        for (let d = new Date(firstDayOfMonth); d <= lastDayOfMonth; d.setDate(d.getDate() + 1)) {
            const dateKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
            const dayOfWeek = d.getDay();
            const isHoliday = getHolidayInfo(d.getFullYear(), d.getMonth() + 1, d.getDate());

            if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday) { // Only count working days
                totalWorkingDays++;
                const record = attendanceRecords[dateKey];
                if (record) {
                    if (record.status === '지각') lateCount++;
                    if (record.status === '조퇴') earlyCount++;
                    if (record.status === '병가') sickCount++;
                    if (record.status === '무단결근') absentCount++;
                    if (record.status === '월차') annualLeaveCount++;
                }
            }
        }

        monthlyTotalDays.textContent = totalWorkingDays;
        monthlyLateCount.textContent = lateCount;
        monthlyEarlyCount.textContent = earlyCount;
        monthlySickCount.textContent = sickCount;
        monthlyAbsentCount.textContent = absentCount;
        monthlyAnnualLeaveCount.textContent = annualLeaveCount;
        console.log("Attendance records after rendering:", attendanceRecords);
    };

    const checkIn = () => {
        const todayKey = getTodayKey();
        const now = new Date();
        const checkInTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        let status = '정상';

        // 자동 지각 판단 (9시 0분 초과)
        if (now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0)) {
            status = '지각';
        }

        attendanceRecords[todayKey] = { checkIn: checkInTime, checkOut: '-', status: status };
        saveData('attendanceRecords', attendanceRecords);
        renderAttendance();
        renderMonthlyCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
    };

    const checkOut = () => {
        const todayKey = getTodayKey();
        if (!attendanceRecords[todayKey]) {
            alert("먼저 출근을 기록해주세요.");
            return;
        }
        const now = new Date();
        const checkOutTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        let status = attendanceRecords[todayKey].status;

        // 자동 조퇴 판단 (18시 0분 미만, 단 이미 지각/병가/무단결근/월차이 아닌 경우에만)
        if ((now.getHours() < 18 || (now.getHours() === 18 && now.getMinutes() < 0)) && 
            status !== '지각' && status !== '병가' && status !== '무단결근' && status !== '월차') {
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

        // 병가, 무단결근, 월차만 수동 적용 가능
        if (selectedStatus === '병가' || selectedStatus === '무단결근' || selectedStatus === '월차') {
            if (!attendanceRecords[todayKey]) {
                attendanceRecords[todayKey] = { checkIn: '-', checkOut: '-', status: selectedStatus };
            } else {
                attendanceRecords[todayKey].status = selectedStatus;
            }
            saveData('attendanceRecords', attendanceRecords);
            renderAttendance();
            renderMonthlyCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
        } else {
            alert("'병가', '무단결근', '월차'만 수동으로 적용할 수 있습니다. 지각/조퇴는 출퇴근 시간에 따라 자동으로 판단됩니다.");
        }
    };

    // --- Monthly Calendar Functions ---
    const renderMonthlyCalendar = (year, month) => {
        currentMonthYear.textContent = `${year}년 ${month + 1}월`;
        calendarGrid.innerHTML = '';

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const startDay = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.

        // Fill leading empty days
        for (let i = 0; i < startDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('calendar-day', 'empty');
            calendarGrid.appendChild(emptyDay);
        }

        // Fill days of the month
        for (let date = 1; date <= lastDayOfMonth.getDate(); date++) {
            const dayElem = document.createElement('div');
            dayElem.classList.add('calendar-day');
            const fullDate = new Date(year, month, date);
            const dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
            const dayOfWeek = fullDate.getDay();

            // Add weekend class
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                dayElem.classList.add('weekend');
            }

            // Add holiday class
            const holidayName = getHolidayInfo(year, month + 1, date);
            if (holidayName) {
                dayElem.classList.add('holiday');
            }

            // Add today class
            const today = new Date();
            if (fullDate.getDate() === today.getDate() &&
                fullDate.getMonth() === today.getMonth() &&
                fullDate.getFullYear() === today.getFullYear()) {
                dayElem.classList.add('today');
            }

            dayElem.innerHTML = `<span class="date-number">${date}</span>`;

            const record = attendanceRecords[dateKey];
            if (record) {
                let statusText = record.status;
                let workTimeText = '';

                if (record.checkIn !== '-' && record.checkOut !== '-') {
                    workTimeText = `${record.checkIn} ~ ${record.checkOut}`;
                }

                // Display status icon/text
                if (statusText === '정상') {
                    dayElem.innerHTML += `<div class="status-icon status-정상">✅</div>`;
                } else if (statusText === '지각') {
                    dayElem.innerHTML += `<div class="status-icon status-지각">⏰</div>`;
                } else if (statusText === '조퇴') {
                    dayElem.innerHTML += `<div class="status-icon status-조퇴">🏃</div>`;
                } else if (statusText === '병가') {
                    dayElem.innerHTML += `<div class="status-icon status-병가">🤒</div>`;
                } else if (statusText === '무단결근') {
                    dayElem.innerHTML += `<div class="status-icon status-무단결근">🚫</div>`;
                } else if (statusText === '월차') {
                    dayElem.innerHTML += `<div class="status-icon status-월차">🌴</div>`;
                }

                if (workTimeText) {
                    dayElem.innerHTML += `<div class="work-time">${workTimeText}</div>`;
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
        const hour = now.getHours();
        const minute = now.getMinutes();
        const currentTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        // To-Do notifications
        if (isTodoTtsEnabled) {
            todos.filter(t => !t.completed && t.time === currentTime).forEach(todo => speak(todo.text));
        }

        // Scheduled notifications
        const notifications = {
            '11:48': "점심시간입니다. 맛있게 드세요",
            '17:30': "오늘의 업무를 정리하시고 퇴근준비를 해주세요"
        };
        if (notifications[currentTime]) speak(notifications[currentTime]);

        if (minute === 48 && hour >= 9 && hour < 18 && hour !== 11) {
            updateWeatherUI().then(() => {
                const weatherText = currentWeatherElem.textContent;
                if (weatherText !== '정보 없음') speak(`현재 날씨는 ${weatherText}입니다. 10분간 쉬는 시간입니다.`);
            });
        }
        if (minute === 0 && hour >= 9 && hour < 18 && hour !== 12) {
            speak("10분 휴식시간이 종료되었습니다. 화이팅!");
        }
    };

    const startSystem = () => {
        if (!('geolocation' in navigator) || !('speechSynthesis' in window)) {
            statusElem.textContent = '이 브라우저에서는 필요한 기능을 지원하지 않습니다.';
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
        }, error => {
            console.error('Geolocation error:', error);
            statusElem.textContent = '위치 정보를 가져오는 데 실패했습니다.';
            stopSystem();
        });
    };

    const stopSystem = () => {
        isWeatherSystemActive = false;
        clearInterval(weatherInterval);
        clearInterval(minuteInterval);
        userCoords = null;
        toggleButton.textContent = '알림 시작';
        statusElem.textContent = '알림이 멈췄습니다. 시작 버튼을 눌러주세요.';
        weatherInfoElem.classList.add('hidden');
    };

    // --- Event Listeners ---
    toggleButton.addEventListener('click', () => {
        isWeatherSystemActive ? stopSystem() : startSystem();
    });

    // Card Visibility Listeners
    setupCardVisibilityListeners();

    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const time = todoTimeInput.value;
        const text = todoTextInput.value;
        const priority = todoPriorityInput.value;
        if (time && text) {
            addTodo(time, text, priority);
            todoForm.reset();
        }
    });

    todoListElem.addEventListener('click', handleTodoAction);

    pomoStartPauseBtn.addEventListener('click', () => {
        isPomoRunning ? pausePomo() : startPomo();
    });
    pomoResetBtn.addEventListener('click', resetPomo);

    setPomoTimeBtn.addEventListener('click', setPomoTimes);

    noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const content = noteInput.value;
        if (content) {
            addNote(content);
            noteInput.value = '';
        }
    });

    noteList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-note-btn')) {
            const id = Number(e.target.closest('li').dataset.id);
            deleteNote(id);
        }
    });

    ttsToggle.addEventListener('change', (e) => {
        isTtsEnabled = e.target.checked;
        saveData('ttsEnabled', isTtsEnabled);
    });

    todoTtsToggle.addEventListener('change', (e) => {
        isTodoTtsEnabled = e.target.checked;
        saveData('todoTtsEnabled', isTodoTtsEnabled);
    });

    // Attendance Tracker Event Listeners
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

    // Calculator Event Listeners
    calculatorButtons.forEach(button => {
        button.addEventListener('click', () => {
            const buttonText = button.textContent;
            if (button.classList.contains('number')) {
                handleNumberClick(buttonText);
            } else if (button.classList.contains('operator')) {
                handleOperatorClick(buttonText);
            } else if (button.classList.contains('equals')) {
                handleEqualsClick();
            } else if (button.classList.contains('clear')) {
                handleClearClick();
            } else if (button.classList.contains('decimal')) {
                handleDecimalClick();
            }
        });
    });

    // --- Initialization ---
    const initialTodos = loadData('todos');
    if (initialTodos) {
        todos = initialTodos;
        renderTodos();
    }
    const initialNotes = loadData('notes');
    if (initialNotes) {
        notes = initialNotes;
        renderNotes();
    }
    const savedTtsSetting = loadData('ttsEnabled');
    if (savedTtsSetting !== null) {
        isTtsEnabled = savedTtsSetting;
        ttsToggle.checked = isTtsEnabled;
    }
    const savedTodoTtsSetting = loadData('todoTtsEnabled');
    if (savedTodoTtsSetting !== null) {
        isTodoTtsEnabled = savedTodoTtsSetting;
        todoTtsToggle.checked = isTodoTtsEnabled;
    }
    const savedPomoSettings = loadData('pomoSettings');
    if (savedPomoSettings) {
        workDuration = savedPomoSettings.work;
        breakDuration = savedPomoSettings.break;
        workTimeInput.value = workDuration;
        breakTimeInput.value = breakDuration;
    }
    const savedAttendanceRecords = loadData('attendanceRecords');
    if (savedAttendanceRecords) {
        attendanceRecords = savedAttendanceRecords;
    }

    // Load card visibility settings
    const savedCardVisibility = loadData('cardVisibility');
    if (savedCardVisibility) {
        cardVisibility = savedCardVisibility;
        // Update checkboxes based on loaded settings
        toggleWeatherCard.checked = cardVisibility.weather;
        toggleNotesCard.checked = cardVisibility.notes;
        toggleVoiceMemoCard.checked = cardVisibility.voiceMemo;
        togglePomodoroCard.checked = cardVisibility.pomodoro;
        toggleTodoCard.checked = cardVisibility.todo;
        toggleDoneCard.checked = cardVisibility.done;
        toggleAttendanceCard.checked = cardVisibility.attendance;
        toggleAttendanceSummaryCard.checked = cardVisibility.attendanceSummary;
        toggleCalculatorCard.checked = cardVisibility.calculator;
    }
    updateCardVisibility(); // Apply initial visibility
    
    // Drag and Drop Functionality
    const dashboardCards = document.querySelectorAll('.dashboard-card');
    const mainContainer = document.querySelector('.main-container');

    dashboardCards.forEach(card => {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', () => {
            card.classList.add('dragging');
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
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

    // Fetch holidays for current and next year
    fetchHolidays(new Date().getFullYear());
    fetchHolidays(new Date().getFullYear() + 1);

    renderAttendance(); // Initial render of daily attendance and monthly summary
    updatePomoTimer();
});

    