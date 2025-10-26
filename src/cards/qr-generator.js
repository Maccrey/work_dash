// QR코드 생성기 카드 모듈
import { generateId } from '../core/utils.js';

let qrTextInput, generateQrBtn, qrResult, qrCodeDisplay, downloadQrBtn;

function generateQRCode() {
    const text = qrTextInput.value.trim();
    
    if (!text) {
        alert('QR코드로 변환할 텍스트를 입력해주세요.');
        return;
    }

    if (text.length > 2048) {
        alert('텍스트가 너무 깁니다. 2048자 이하로 입력해주세요.');
        return;
    }

    // 기존 QR코드 제거
    qrCodeDisplay.innerHTML = '';
    downloadQrBtn.classList.add('hidden');

    try {
        // QR.js 라이브러리 사용 (CDN에서 로드해야 함)
        if (typeof QRCode === 'undefined') {
            // 간단한 QR코드 API 서비스 사용
            generateQRWithAPI(text);
        } else {
            // QR.js 라이브러리 사용
            const qr = new QRCode(qrCodeDisplay, {
                text: text,
                width: 200,
                height: 200,
                colorDark: '#000000',
                colorLight: '#ffffff'
            });
            downloadQrBtn.classList.remove('hidden');
        }
    } catch (error) {
        console.error('QR 코드 생성 오류:', error);
        generateQRWithAPI(text);
    }
}

function generateQRWithAPI(text) {
    // 무료 QR코드 API 서비스 사용
    const encodedText = encodeURIComponent(text);
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedText}`;
    
    const img = document.createElement('img');
    img.src = qrImageUrl;
    img.alt = 'QR Code';
    img.style.maxWidth = '100%';
    img.onload = () => {
        downloadQrBtn.classList.remove('hidden');
    };
    img.onerror = () => {
        qrCodeDisplay.innerHTML = '<p>QR코드 생성에 실패했습니다. 인터넷 연결을 확인해주세요.</p>';
    };
    
    qrCodeDisplay.appendChild(img);
}

function downloadQRCode() {
    const img = qrCodeDisplay.querySelector('img');
    if (!img) {
        alert('QR코드가 생성되지 않았습니다.');
        return;
    }

    // Canvas에 이미지를 그려서 다운로드
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 200;
    canvas.height = 200;
    
    const tempImg = new Image();
    tempImg.crossOrigin = 'anonymous';
    tempImg.onload = function() {
        ctx.drawImage(this, 0, 0, 200, 200);
        
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `qrcode_${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    };
    tempImg.src = img.src;
}

function handleGenerateQr(e) {
    e.preventDefault();
    generateQRCode();
}

function handleDownloadQr(e) {
    e.preventDefault();
    downloadQRCode();
}

function handleQrTextKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generateQRCode();
    }
}

export function initQrGeneratorCard() {
    qrTextInput = document.getElementById('qr-text');
    generateQrBtn = document.getElementById('generate-qr-btn');
    qrResult = document.getElementById('qr-result');
    qrCodeDisplay = document.getElementById('qr-code-display');
    downloadQrBtn = document.getElementById('download-qr-btn');

    if (!qrTextInput || !generateQrBtn) return;

    generateQrBtn.addEventListener('click', handleGenerateQr);
    if (downloadQrBtn) {
        downloadQrBtn.addEventListener('click', handleDownloadQr);
    }
    if (qrTextInput) {
        qrTextInput.addEventListener('keypress', handleQrTextKeyPress);
    }
}

export function cleanupQrGeneratorCard() {
    if (generateQrBtn) generateQrBtn.removeEventListener('click', handleGenerateQr);
    if (downloadQrBtn) downloadQrBtn.removeEventListener('click', handleDownloadQr);
    if (qrTextInput) qrTextInput.removeEventListener('keypress', handleQrTextKeyPress);
}

export { generateQRCode, downloadQRCode };