// 음성 메모 카드 모듈
import { 
    recordings, 
    updateRecordings, 
    addRecording, 
    removeRecording,
    mediaRecorder,
    updateMediaRecorder,
    audioChunks,
    updateAudioChunks,
    recordingTimerInterval
} from '../core/state.js';
import { formatTime, generateId } from '../core/utils.js';

// DOM 요소들
let recordButton, recordingsList, recordingTagInput, recordingTimerElem;

// 녹음 타이머 간격 ID (모듈에서 관리)
let currentRecordingTimerInterval = null;

// 녹음 목록 렌더링
function renderRecordings() {
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
}

// 녹음 저장
function saveRecording(audioURL) {
    const tag = recordingTagInput.value.trim() || '태그 없음';
    const timestamp = new Date().toLocaleString('ko-KR', { 
        dateStyle: 'short', 
        timeStyle: 'short' 
    });
    
    const newRecording = { 
        id: generateId(), 
        tag, 
        timestamp, 
        audioURL 
    };
    
    recordings.unshift(newRecording);
    updateRecordings(recordings);
    renderRecordings();
    recordingTagInput.value = '';
}

// 녹음 삭제
function deleteRecording(id) {
    const index = recordings.findIndex(rec => rec.id === id);
    if (index !== -1) {
        // 오디오 URL 해제 (메모리 절약)
        if (recordings[index].audioURL.startsWith('blob:')) {
            URL.revokeObjectURL(recordings[index].audioURL);
        }
        removeRecording(index);
        renderRecordings();
    }
}

// 녹음 시작
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        updateMediaRecorder(recorder);
        updateAudioChunks([]);
        
        recorder.addEventListener('dataavailable', e => {
            audioChunks.push(e.data);
            updateAudioChunks(audioChunks);
        });
        
        recorder.addEventListener('stop', () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result;
                saveRecording(base64data);
                stream.getTracks().forEach(track => track.stop());
            };
            reader.readAsDataURL(audioBlob);
        });
        
        recorder.start();
        recordButton.textContent = '녹음 중지';
        
        // 녹음 타이머 시작
        let seconds = 0;
        recordingTimerElem.textContent = '00:00';
        currentRecordingTimerInterval = setInterval(() => {
            seconds++;
            recordingTimerElem.textContent = formatTime(seconds);
        }, 1000);
        
    } catch (error) {
        console.error('Error starting recording:', error);
        alert('음성 녹음을 시작할 수 없습니다. 마이크 접근 권한을 확인해주세요.');
    }
}

// 녹음 중지
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        recordButton.textContent = '녹음 시작';
        
        // 녹음 타이머 중지
        if (currentRecordingTimerInterval) {
            clearInterval(currentRecordingTimerInterval);
            currentRecordingTimerInterval = null;
        }
        recordingTimerElem.textContent = '00:00';
    }
}

// 녹음 버튼 클릭 처리
function handleRecordButtonClick() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        stopRecording();
    } else {
        startRecording();
    }
}

// 녹음 삭제 버튼 클릭 처리
function handleDeleteClick(e) {
    if (e.target.classList.contains('delete-recording-btn')) {
        const id = e.target.dataset.id;
        if (confirm('이 녹음을 삭제하시겠습니까?')) {
            deleteRecording(id);
        }
    }
}

// 음성 메모 카드 초기화
export function initVoiceMemoCard() {
    // DOM 요소 가져오기
    recordButton = document.getElementById('record-button');
    recordingsList = document.getElementById('recordings-list');
    recordingTagInput = document.getElementById('recording-tag-input');
    recordingTimerElem = document.getElementById('recording-timer');

    // 이벤트 리스너 등록
    if (recordButton) {
        recordButton.addEventListener('click', handleRecordButtonClick);
    }
    
    if (recordingsList) {
        recordingsList.addEventListener('click', handleDeleteClick);
    }

    // 초기 녹음 목록 렌더링
    renderRecordings();
}

// 음성 메모 카드 정리
export function cleanupVoiceMemoCard() {
    // 진행 중인 녹음 중지
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        stopRecording();
    }
    
    // 타이머 정리
    if (currentRecordingTimerInterval) {
        clearInterval(currentRecordingTimerInterval);
        currentRecordingTimerInterval = null;
    }
}

// 외부에서 사용할 수 있는 함수들 내보내기
export { 
    renderRecordings, 
    saveRecording, 
    deleteRecording, 
    startRecording, 
    stopRecording 
};