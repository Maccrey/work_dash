// 날씨 카드 모듈
import {
    isWeatherSystemActive,
    updateWeatherSystemActive,
    userCoords,
    updateUserCoords,
    previousHourlyForecast,
    updatePreviousHourlyForecast,
    minuteInterval,
    weatherInterval,
    isTtsEnabled,
    setMinuteInterval,
    setWeatherInterval
} from '../core/state.js';
import { toGrid, getWeatherIcon, speak } from '../core/utils.js';

const WEATHER_PROXY_ENDPOINT = 'https://dashboard-worker.m01071630214.workers.dev/weather';
const BASE_RELEASE_HOURS = [2, 5, 8, 11, 14, 17, 20, 23];
const MAX_BASE_ATTEMPTS = 4;
const HOUR_IN_MS = 60 * 60 * 1000;
const DAY_IN_MS = 24 * HOUR_IN_MS;
const KST_OFFSET_MS = 9 * HOUR_IN_MS;
const KST_TIMEZONE = 'Asia/Seoul';
const kstDateTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
    timeZone: KST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
});

const getKstComponents = (date) => {
    const parts = kstDateTimeFormatter.formatToParts(date);
    const componentMap = {};
    for (const part of parts) {
        if (part.type !== 'literal') {
            componentMap[part.type] = part.value;
        }
    }
    return {
        date: `${componentMap.year}${componentMap.month}${componentMap.day}`,
        hour: Number(componentMap.hour),
        minute: Number(componentMap.minute)
    };
};

const buildBaseParamCandidates = (referenceDate, maxAttempts = MAX_BASE_ATTEMPTS) => {
    const candidates = [];
    const descendingHours = [...BASE_RELEASE_HOURS].reverse();
    let cursor = referenceDate;
    let { date, hour } = getKstComponents(cursor);
    let startIndex = descendingHours.findIndex((value) => value <= hour);

    if (startIndex === -1) {
        cursor = new Date(cursor.getTime() - DAY_IN_MS);
        ({ date } = getKstComponents(cursor));
        startIndex = 0;
    }

    let index = startIndex;
    while (candidates.length < maxAttempts) {
        const baseHour = descendingHours[index];
        candidates.push({
            baseDate: date,
            baseTime: `${baseHour.toString().padStart(2, '0')}00`
        });
        index += 1;
        if (index >= descendingHours.length) {
            cursor = new Date(cursor.getTime() - DAY_IN_MS);
            ({ date } = getKstComponents(cursor));
            index = 0;
        }
    }

    return candidates;
};

const toForecastDate = (forecastDate, forecastTime) => {
    const year = Number(forecastDate.slice(0, 4));
    const month = Number(forecastDate.slice(4, 6)) - 1;
    const day = Number(forecastDate.slice(6, 8));
    const hour = Number(forecastTime.slice(0, 2));
    const minute = Number(forecastTime.slice(2, 4));
    const utcMillis = Date.UTC(year, month, day, hour, minute) - KST_OFFSET_MS;
    return new Date(utcMillis);
};

// DOM 요소들
let toggleButton, locationButton, statusElem, weatherInfoElem, currentWeatherElem, currentTempElem, hourlyForecastElem;

// 날씨 데이터 가져오기
async function getWeatherData(x, y) {
    try {
        const now = new Date();
        const baseCandidates = buildBaseParamCandidates(now);
        let lastError = null;

        for (const { baseDate, baseTime } of baseCandidates) {
            const proxyUrl = new URL(WEATHER_PROXY_ENDPOINT);
            proxyUrl.searchParams.set('base_date', baseDate);
            proxyUrl.searchParams.set('base_time', baseTime);
            proxyUrl.searchParams.set('nx', x);
            proxyUrl.searchParams.set('ny', y);
            proxyUrl.searchParams.set('pageNo', '1');
            proxyUrl.searchParams.set('numOfRows', '290');

            try {
                const response = await fetch(proxyUrl.toString());
                const responseText = await response.text();
                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (jsonError) {
                    console.error('JSON parsing error:', jsonError);
                    console.error('Raw API response:', responseText);
                    const parseError = new Error('Invalid JSON response from API');
                    parseError.retryable = true;
                    throw parseError;
                }

                if (data?.ok === false) {
                    const status = Number(data?.status);
                    const apiError = new Error(data?.error || `API Error ${status || ''}`.trim());
                    apiError.status = status;
                    apiError.retryable = status >= 500;
                    throw apiError;
                }

                if (!data?.response?.header) {
                    const structureError = new Error('Weather proxy returned unexpected structure');
                    structureError.retryable = false;
                    throw structureError;
                }

                const { header, body } = data.response;
                if (header.resultCode !== '00') {
                    const headerError = new Error(`API Error: ${header.resultMsg}`);
                    headerError.resultCode = header.resultCode;
                    headerError.retryable = header.resultCode === '03';
                    throw headerError;
                }

                if (!body?.items?.item || body.items.item.length === 0) {
                    const emptyError = new Error('No weather data in API response.');
                    emptyError.retryable = true;
                    throw emptyError;
                }

                const items = body.items.item;
                const skyLabels = { '1': '맑음', '3': '구름많음', '4': '흐림' };
                const ptyLabels = { '0': '없음', '1': '비', '2': '비/눈', '3': '눈', '5': '빗방울', '6': '빗방울/눈날림', '7': '눈날림' };

                const slotMap = new Map();
                for (const item of items) {
                    const key = `${item.fcstDate}-${item.fcstTime}`;
                    if (!slotMap.has(key)) {
                        slotMap.set(key, {
                            date: item.fcstDate,
                            time: item.fcstTime,
                            dateTime: toForecastDate(item.fcstDate, item.fcstTime)
                        });
                    }
                    slotMap.get(key)[item.category] = item.fcstValue;
                }

                const slots = Array.from(slotMap.values())
                    .filter(slot => slot.TMP !== undefined && slot.SKY !== undefined)
                    .sort((a, b) => a.dateTime - b.dateTime);

                if (slots.length === 0) {
                    const noSlotError = new Error('No usable weather slots available.');
                    noSlotError.retryable = true;
                    throw noSlotError;
                }

                const currentSlot = [...slots].reverse().find(slot => slot.dateTime <= now) || slots[0];
                let upcomingSlots = slots.filter(slot => slot.dateTime > now);
                if (upcomingSlots.length < 6) {
                    const remaining = 6 - upcomingSlots.length;
                    const previousSlots = slots.filter(slot => slot.dateTime <= now).slice(-remaining);
                    upcomingSlots = upcomingSlots.concat(previousSlots);
                }
                const selectedSlots = upcomingSlots.slice(0, 6).sort((a, b) => a.dateTime - b.dateTime);

                const resolveSky = (value) => skyLabels[String(value)] || '정보 없음';
                const resolvePrecip = (value) => {
                    const code = value === undefined || value === null ? '0' : String(value);
                    return ptyLabels[code] || '없음';
                };

                const currentSky = resolveSky(currentSlot?.SKY);
                const currentPty = resolvePrecip(currentSlot?.PTY);
                const currentWeather = currentPty && currentPty !== '없음' ? currentPty : currentSky;
                const currentTemp = currentSlot?.TMP !== undefined ? Number(currentSlot.TMP) : null;

                const hourlyForecast = selectedSlots.map(slot => {
                    const precip = resolvePrecip(slot.PTY);
                    const forecastWeather = precip !== '없음' ? precip : resolveSky(slot.SKY);
                    return {
                        time: `${slot.time.slice(0, 2)}:${slot.time.slice(2, 4)}`,
                        weather: forecastWeather,
                        temp: Number(slot.TMP)
                    };
                });

                return { currentWeather, currentTemp, hourlyForecast };
            } catch (error) {
                console.warn(`Weather fetch failed for base_date=${baseDate}, base_time=${baseTime}`, error);
                lastError = error;
                if (!error.retryable) {
                    break;
                }
            }
        }

        if (lastError) {
            throw lastError;
        }

        throw new Error('날씨 데이터를 찾을 수 없습니다.');
    } catch (error) {
        console.error('Error fetching weather data:', error);

        if (error.status === 504 || error.status === 503 || error.status === 502) {
            statusElem.textContent = '기상청 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.resultCode === '03') {
            statusElem.textContent = '기상청 예보가 아직 공개되지 않았습니다. 잠시 후 다시 시도해주세요.';
        } else if (typeof error.status === 'number' && error.status >= 500) {
            statusElem.textContent = '기상청 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.message.includes('Invalid JSON')) {
            statusElem.textContent = 'API 응답 오류입니다. 잠시 후 다시 시도해주세요.';
        } else if (error.message.includes('fetch')) {
            statusElem.textContent = '네트워크 연결을 확인해주세요.';
        } else {
            statusElem.textContent = `날씨 정보 오류: ${error.message}`;
        }

        displayFallbackWeather();
        return null;
    }
}

// 대체 날씨 정보 표시 (API 실패 시)
function displayFallbackWeather() {
    weatherInfoElem.classList.remove('hidden');
    currentWeatherElem.textContent = '날씨 정보 없음 ❓';
    currentTempElem.textContent = '--';
    
    hourlyForecastElem.innerHTML = '<div class="fallback-message">날씨 API 연결 실패</div>';
    
    // 5분 후 재시도
    setTimeout(() => {
        if (isWeatherSystemActive && userCoords) {
            statusElem.textContent = '날씨 정보를 다시 가져오는 중...';
            updateWeatherUI();
        }
    }, 5 * 60 * 1000);
}

// 날씨 UI 업데이트
async function updateWeatherUI() {
    if (!userCoords) return;
    const { latitude, longitude } = userCoords;
    const { x, y } = toGrid(latitude, longitude);
    statusElem.textContent = '⏳ 날씨 정보를 업데이트하는 중입니다...';
    const weatherData = await getWeatherData(x, y);

    if (weatherData) {
        const { currentWeather, currentTemp, hourlyForecast } = weatherData;

        // 이전 예보와 비교하여 변경된 경우 알림
        if (previousHourlyForecast.length > 0) {
            for (let i = 0; i < hourlyForecast.length; i++) {
                if (i < previousHourlyForecast.length && hourlyForecast[i].weather !== previousHourlyForecast[i].weather) {
                    const changedForecast = hourlyForecast[i];
                    const message = `날씨가 변경되었습니다. ${changedForecast.time}부터 ${changedForecast.weather}입니다.`;
                    speak(message, true, isTtsEnabled);
                    break;
                }
            }
        }

        updatePreviousHourlyForecast(hourlyForecast);

        weatherInfoElem.classList.remove('hidden');
        currentWeatherElem.textContent = `${currentWeather || '정보 없음'} ${getWeatherIcon(currentWeather)}`;
        currentTempElem.textContent = (currentTemp !== null && currentTemp !== undefined) ? currentTemp : '정보 없음';

        hourlyForecastElem.innerHTML = '';
        if (hourlyForecast.length > 0) {
            const temps = hourlyForecast.map(f => f.temp);
            const minTemp = Math.min(...temps) - 2;
            const maxTemp = Math.max(...temps) + 2;
            const tempRange = Math.max(1, maxTemp - minTemp);

            hourlyForecast.forEach(forecast => {
                const forecastItem = document.createElement('div');
                forecastItem.classList.add('forecast-item');
                const value = Number(forecast.temp);
                const barHeight = Math.max(0, ((value - minTemp) / tempRange) * 100);
                forecastItem.innerHTML = `
                    <div class="forecast-icon">${getWeatherIcon(forecast.weather)}</div>
                    <div class="bar-wrapper"><div class="temp-bar" style="height: ${barHeight}%;"></div></div>
                    <div class="temp-label">${forecast.temp}℃</div>
                    <div class="forecast-time">${forecast.time}</div>
                `;
                hourlyForecastElem.appendChild(forecastItem);
            });
        } else {
            hourlyForecastElem.innerHTML = '<div class="forecast-empty">예보 데이터를 불러오지 못했습니다.</div>';
        }

        const updatedAt = new Date();
        const formattedTime = updatedAt.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        statusElem.textContent = `✅ ${formattedTime} 기준 최신 날씨를 표시합니다.`;
    } else {
        statusElem.textContent = '⚠️ 최신 날씨 정보를 가져오지 못했습니다. 잠시 후 다시 시도합니다.';
    }
}

// 위치 권한 요청 및 좌표 가져오기
function requestLocation() {
    if ('geolocation' in navigator) {
        statusElem.textContent = '📍 위치 권한을 확인 중입니다...';
        
        // 위치 권한 상태를 먼저 확인 (Chrome 등에서 지원)
        if ('permissions' in navigator) {
            navigator.permissions.query({name: 'geolocation'}).then((result) => {
                if (result.state === 'granted') {
                    statusElem.textContent = '✅ 위치 권한이 허용되었습니다. 위치를 가져오는 중...';
                } else if (result.state === 'prompt') {
                    statusElem.textContent = '📍 브라우저에서 위치 권한 허용을 클릭해주세요.';
                } else {
                    statusElem.textContent = '❌ 위치 권한이 차단되었습니다.';
                }
            });
        } else {
            statusElem.textContent = '📍 브라우저에서 위치 권한 허용을 클릭해주세요.';
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                updateUserCoords({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                statusElem.textContent = '✅ 현재 위치 기준으로 날씨 데이터를 불러오는 중...';
                updateWeatherUI();
            },
            (error) => {
                console.error('위치 정보 오류:', error);
                
                let errorMessage = '';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = '❌ 위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = '📍 위치 정보를 사용할 수 없습니다.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = '⏰ 위치 요청 시간이 초과되었습니다.';
                        break;
                    default:
                        errorMessage = '❓ 위치 정보를 가져올 수 없습니다.';
                        break;
                }
                
                statusElem.textContent = `${errorMessage} 서울 기준으로 표시합니다.`;
                
                // 3초 후 기본 위치로 설정
                setTimeout(() => {
                    updateUserCoords({
                        latitude: 37.5665,  // 서울시청
                        longitude: 126.9780
                    });
                    statusElem.textContent = '🏢 서울 기준으로 날씨를 표시합니다.';
                    updateWeatherUI();
                }, 3000);
            },
            {
                timeout: 15000,  // 15초 타임아웃 (조금 더 여유있게)
                enableHighAccuracy: true,  // 더 정확한 위치 요청
                maximumAge: 300000  // 5분 동안 캐시된 위치 사용 가능
            }
        );
    } else {
        // 지오로케이션을 지원하지 않는 브라우저의 경우 기본 위치 설정
        statusElem.textContent = '⚠️ 이 브라우저는 위치 서비스를 지원하지 않습니다.';
        setTimeout(() => {
            updateUserCoords({
                latitude: 37.5665,
                longitude: 126.9780
            });
            statusElem.textContent = '🏢 서울 기준으로 날씨를 표시합니다.';
            updateWeatherUI();
        }, 2000);
    }
}

// 위치 권한 요청 확인 다이얼로그
function showLocationPermissionDialog() {
    const message = `🌤️ 정확한 날씨 정보를 위해 현재 위치를 사용하시겠습니까?

✅ 허용: 현재 위치의 정확한 날씨 정보
❌ 거부: 서울 기준 날씨 정보

브라우저에서 위치 권한 요청이 나타나면 '허용'을 클릭해주세요.`;

    return confirm(message);
}

// 날씨 알림 시스템 토글
function toggleWeatherSystem() {
    if (isWeatherSystemActive) {
        // 알림 중지
        if (minuteInterval) {
            clearInterval(minuteInterval);
            setMinuteInterval(null);
        }
        if (weatherInterval) {
            clearInterval(weatherInterval);
            setWeatherInterval(null);
        }
        updateWeatherSystemActive(false);
        toggleButton.textContent = '알림 시작';
        statusElem.textContent = '날씨 알림이 중지되었습니다.';
        
        // 날씨 정보 숨기기
        weatherInfoElem.classList.add('hidden');
        if (locationButton) locationButton.classList.add('hidden');
    } else {
        // 알림 시작
        updateWeatherSystemActive(true);
        toggleButton.textContent = '알림 중지';
        
        // 위치 버튼 표시
        if (locationButton) locationButton.classList.remove('hidden');

        // 위치 정보가 없으면 사용자에게 확인 후 요청
        if (!userCoords) {
            if (showLocationPermissionDialog()) {
                statusElem.textContent = '🔄 위치 권한을 요청하고 있습니다...';
                requestLocation();
            } else {
                // 사용자가 거부한 경우 바로 서울로 설정
                updateUserCoords({
                    latitude: 37.5665,
                    longitude: 126.9780
                });
                statusElem.textContent = '🏢 서울 기준으로 날씨 알림을 시작합니다.';
                updateWeatherUI();
            }
        } else {
            // 이미 위치가 있으면 바로 날씨 정보 업데이트
            statusElem.textContent = '🔄 날씨 정보를 불러오는 중...';
            updateWeatherUI();
        }

        // 5분마다 날씨 데이터 업데이트
        setWeatherInterval(setInterval(updateWeatherUI, 5 * 60 * 1000));
    }
}

// 날씨 카드 초기화
export function initWeatherCard() {
    // DOM 요소 가져오기
    toggleButton = document.getElementById('toggleButton');
    locationButton = document.getElementById('locationButton');
    statusElem = document.getElementById('status');
    weatherInfoElem = document.getElementById('weather-info');
    currentWeatherElem = document.getElementById('current-weather');
    currentTempElem = document.getElementById('current-temp');
    hourlyForecastElem = document.getElementById('hourly-forecast');

    // 이벤트 리스너 등록
    toggleButton.addEventListener('click', toggleWeatherSystem);
    
    // 위치 버튼이 존재하면 이벤트 리스너 추가
    if (locationButton) {
        locationButton.addEventListener('click', () => {
            if (showLocationPermissionDialog()) {
                statusElem.textContent = '🔄 새로운 위치 정보를 요청하고 있습니다...';
                requestLocation();
            }
        });
    }

    // 초기 상태 설정
    if (isWeatherSystemActive) {
        toggleButton.textContent = '알림 중지';
        statusElem.textContent = '날씨 알림이 활성화되어 있습니다.';
        if (locationButton) locationButton.classList.remove('hidden');
        updateWeatherUI();
        setWeatherInterval(setInterval(updateWeatherUI, 5 * 60 * 1000));
    } else {
        // 알림이 비활성화된 상태에서는 위치 버튼 숨기기
        if (locationButton) locationButton.classList.add('hidden');
    }
}

// 날씨 카드 정리
export function cleanupWeatherCard() {
    if (minuteInterval) {
        clearInterval(minuteInterval);
        setMinuteInterval(null);
    }
    if (weatherInterval) {
        clearInterval(weatherInterval);
        setWeatherInterval(null);
    }
}
