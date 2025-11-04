// Helper to manage the header banner ad lifecycle
const AD_SLOTS = {
    desktop: {
        unit: 'DAN-USxMZMHTgeVGaj1e',
        width: 728,
        height: 90
    },
    mobile: {
        unit: 'DAN-Ci1t1IxYYzeFjLyA',
        width: 320,
        height: 50
    }
};

const SCRIPT_SRC = 'https://t1.daumcdn.net/kas/static/ba.min.js';

let hasInitialized = false;
let currentAdType = null;
let resizeObserver = null;

const handleResize = () => refreshAd();

function determineAdType(container) {
    if (!container) {
        return window.innerWidth <= 600 ? 'mobile' : 'desktop';
    }

    const columnsDefinition = window.getComputedStyle(container).gridTemplateColumns;
    if (!columnsDefinition) {
        return window.innerWidth <= 600 ? 'mobile' : 'desktop';
    }

    const columns = columnsDefinition
        .split(' ')
        .map(part => part.trim())
        .filter(part => part && part !== '/')
        .length;

    if (!columns || !Number.isFinite(columns)) {
        return window.innerWidth <= 600 ? 'mobile' : 'desktop';
    }

    return columns <= 1 ? 'mobile' : 'desktop';
}

function createAdMarkup(type) {
    const adContainer = document.getElementById('dashboard-ad-slot');
    if (!adContainer) {
        return;
    }

    const slot = AD_SLOTS[type];
    if (!slot) {
        return;
    }

    adContainer.innerHTML = '';

    const ins = document.createElement('ins');
    ins.className = 'kakao_ad_area';
    ins.style.display = 'none';
    ins.setAttribute('data-ad-unit', slot.unit);
    ins.setAttribute('data-ad-width', slot.width.toString());
    ins.setAttribute('data-ad-height', slot.height.toString());
    adContainer.appendChild(ins);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.charset = 'utf-8';
    script.src = SCRIPT_SRC;
    adContainer.appendChild(script);
}

function refreshAd() {
    const cardsContainer = document.querySelector('.main-container');
    const nextType = determineAdType(cardsContainer);

    if (nextType === currentAdType) {
        return;
    }

    currentAdType = nextType;
    createAdMarkup(nextType);
}

export function initializeHeaderAd() {
    const adContainer = document.getElementById('dashboard-ad-slot');
    if (!adContainer) {
        console.warn('대시보드 광고 컨테이너를 찾을 수 없습니다.');
        return;
    }

    refreshAd();

    if (hasInitialized) {
        return;
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    const cardsContainer = document.querySelector('.main-container');
    if (cardsContainer && 'ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(() => refreshAd());
        resizeObserver.observe(cardsContainer);
    }

    hasInitialized = true;
}

export function cleanupHeaderAd() {
    if (resizeObserver) {
        const cardsContainer = document.querySelector('.main-container');
        if (cardsContainer) {
            resizeObserver.unobserve(cardsContainer);
        }
        resizeObserver.disconnect();
        resizeObserver = null;
    }

    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);

    hasInitialized = false;
    currentAdType = null;
}
