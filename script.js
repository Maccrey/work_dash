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

    // --- Global State ---
    const API_KEY = 'SPoonI/4mUJxw4Vmxo4aGH3kaoUjNxNM8Ykjd8OpB/qRJ6M+Gd2+A5mIjSCN+YY6Fp1LIsACNnYlujeHw45E5A==';
    let isWeatherSystemActive = false;
    let minuteInterval = null;
    let weatherInterval = null;
    let userCoords = null;
    let todos = [];
    let notes = [];
    let attendanceRecords = {};
    let holidays = {};
    let currentCalendarDate = new Date();

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

    // --- Utility Functions ---
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
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
        Object.keys(cardVisibility).forEach(key => {
            const card = document.getElementById(`${key}-card`);
            if (card) {
                card.style.display = cardVisibility[key] ? 'flex' : 'none';
            }
        });
        saveData('cardVisibility', cardVisibility);
    };

    const setupCardVisibilityListeners = () => {
        document.querySelectorAll('#settings-card input[type="checkbox"]').forEach(checkbox => {
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
        todos.push({ id: Date.now(), time, text, priority, completed: false, notified: false });
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
                <audio controls src="${rec.audioURL}"></audio>
                <button class="delete-recording-btn" data-id="${rec.id}">❌</button>
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
                const audioUrl = URL.createObjectURL(audioBlob);
                saveRecording(audioUrl);
                stream.getTracks().forEach(track => track.stop());
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
            todos.forEach(todo => {
                if (!todo.completed && !todo.notified && todo.time <= currentTime) {
                    speak(todo.text);
                    todo.notified = true;
                    changed = true;
                }
            });
            if (changed) saveData('todos', todos);
        }

        const notifications = {
            '11:48': "점심시간입니다. 맛있게 드세요",
            '17:30': "오늘의 업무를 정리하시고 퇴근준비를 해주세요"
        };
        if (notifications[currentTime]) speak(notifications[currentTime]);

        if (now.getMinutes() === 48 && now.getHours() >= 9 && now.getHours() < 18 && now.getHours() !== 11) {
            updateWeatherUI().then(() => {
                if (currentWeatherElem.textContent !== '정보 없음') speak(`현재 날씨는 ${currentWeatherElem.textContent}입니다. 10분간 쉬는 시간입니다.`);
            });
        }
        if (now.getMinutes() === 0 && now.getHours() >= 9 && now.getHours() < 18 && now.getHours() !== 12) {
            speak("10분 휴식시간이 종료되었습니다. 화이팅!");
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
        toggleButton.textContent = '알림 시작';
        statusElem.textContent = '알림이 멈췄습니다. 시작 버튼을 눌러주세요.';
        weatherInfoElem.classList.add('hidden');
    };

    // --- Event Listeners ---
    toggleButton.addEventListener('click', () => isWeatherSystemActive ? stopSystem() : startSystem());
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (todoTimeInput.value && todoTextInput.value) {
            addTodo(todoTimeInput.value, todoTextInput.value, todoPriorityInput.value);
            todoForm.reset();
        }
    });
    todoListElem.addEventListener('click', handleTodoAction);
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
    todoTtsToggle.addEventListener('change', (e) => { isTodoTtsEnabled = e.target.checked; saveData('todoTtsEnabled', isTodoTtsEnabled); });
    checkInBtn.addEventListener('click', checkIn);
    checkOutBtn.addEventListener('click', checkOut);
    applyStatusBtn.addEventListener('click', applyStatus);
    showMonthlyViewBtn.addEventListener('click', () => {
        const monthlySummaryDiv = document.querySelector('.attendance-monthly-summary');
        const summaryCard = document.getElementById('attendance-summary-card');

        // Toggle classes to trigger animations and state changes
        summaryCard.classList.toggle('calendar-visible');
        monthlyCalendarView.classList.toggle('hidden');

        if (summaryCard.classList.contains('calendar-visible')) {
            // Calendar is now visible, collapse summary
            showMonthlyViewBtn.textContent = '달력 닫기';
            monthlySummaryDiv.style.maxHeight = '55px'; // Only show the title
            renderMonthlyCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
        } else {
            // Calendar is hidden, expand summary
            showMonthlyViewBtn.textContent = '월 현황';
            monthlySummaryDiv.style.maxHeight = '300px'; // Expand to show all content
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
    calculatorButtons.forEach(button => {
        button.addEventListener('click', () => {
            const text = button.textContent;
            if (button.classList.contains('number')) handleNumberClick(text);
            else if (button.classList.contains('operator')) handleOperatorClick(text);
            else if (button.classList.contains('equals')) handleEqualsClick();
            else if (button.classList.contains('clear')) handleClearClick();
            else if (button.classList.contains('decimal')) handleDecimalClick();
        });
    });
    recordButton.addEventListener('click', () => (mediaRecorder && mediaRecorder.state === 'recording') ? stopRecording() : startRecording());
    recordingsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-recording-btn')) {
            deleteRecording(Number(e.target.dataset.id));
        }
    });

    // --- Initialization & App Start ---
    async function initializeApp() {
        // 1. Load all data from localStorage and apply to state
        todos = loadData('todos') || [];
        notes = loadData('notes') || [];
        recordings = loadData('voiceRecordings') || [];
        attendanceRecords = loadData('attendanceRecords') || {};
        isTtsEnabled = loadData('ttsEnabled') ?? true;
        isTodoTtsEnabled = loadData('todoTtsEnabled') ?? true;
        const pomoSettings = loadData('pomoSettings');
        if (pomoSettings) {
            workDuration = pomoSettings.work;
            breakDuration = pomoSettings.break;
        }
        cardVisibility = loadData('cardVisibility') || {
            weather: true, notes: true, voiceMemo: true, pomodoro: true, todo: true,
            done: true, attendance: true, attendanceSummary: true, calculator: true
        };

        // 2. Fetch remote data
        await Promise.all([
            fetchHolidays(new Date().getFullYear()),
            fetchHolidays(new Date().getFullYear() + 1)
        ]);

        // 3. Render UI after all data is ready
        loadCardOrder();
        renderTodos();
        renderNotes();
        renderRecordings();
        renderAttendance();
        updatePomoTimer();
        updateCardVisibility();

        // 4. Update UI controls to reflect the loaded state
        ttsToggle.checked = isTtsEnabled;
        todoTtsToggle.checked = isTodoTtsEnabled;
        workTimeInput.value = workDuration;
        breakTimeInput.value = breakDuration;
        Object.keys(cardVisibility).forEach(key => {
            const checkbox = document.getElementById(`toggle-${key}-card`);
            if (checkbox) checkbox.checked = cardVisibility[key];
        });
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

    // Start the application
    setupCardVisibilityListeners();
    initializeApp();
});