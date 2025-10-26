// 날씨 카드 모듈
import { 
    API_KEY, 
    isWeatherSystemActive, 
    updateWeatherSystemActive,
    userCoords, 
    updateUserCoords,
    previousHourlyForecast,
    updatePreviousHourlyForecast,
    minuteInterval,
    weatherInterval,
    isTtsEnabled
} from '../core/state.js';
import { toGrid, getWeatherIcon, speak } from '../core/utils.js';

// DOM 요소들
let toggleButton, locationButton, statusElem, weatherInfoElem, currentWeatherElem, currentTempElem, hourlyForecastElem;

// 날씨 데이터 가져오기
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
        const responseText = await response.text();
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
        
        // CORS 또는 API 오류 시 더 구체적인 메시지 표시
        if (error.message.includes('Invalid JSON')) {
            statusElem.textContent = 'API 응답 오류입니다. 잠시 후 다시 시도해주세요.';
        } else if (error.message.includes('fetch')) {
            statusElem.textContent = '네트워크 연결을 확인해주세요.';
        } else {
            statusElem.textContent = `날씨 정보 오류: ${error.message}`;
        }
        
        // 대체 날씨 정보 표시
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
        clearInterval(minuteInterval);
        clearInterval(weatherInterval);
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
        weatherInterval = setInterval(updateWeatherUI, 5 * 60 * 1000);
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
        weatherInterval = setInterval(updateWeatherUI, 5 * 60 * 1000);
    } else {
        // 알림이 비활성화된 상태에서는 위치 버튼 숨기기
        if (locationButton) locationButton.classList.add('hidden');
    }
}

// 날씨 카드 정리
export function cleanupWeatherCard() {
    if (minuteInterval) {
        clearInterval(minuteInterval);
    }
    if (weatherInterval) {
        clearInterval(weatherInterval);
    }
}