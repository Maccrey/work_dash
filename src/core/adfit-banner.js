// Helper to manage the dashboard AdFit placements
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
const INLINE_AD_CLASS = 'dashboard-inline-ad';

let hasInitialized = false;
let currentHeaderType = null;
let mainContainerRef = null;
let resizeObserver = null;
let refreshTimer = null;
let inlineAdSlots = [];

const scheduleRefresh = (immediate = false) => {
    if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
    }

    if (immediate) {
        refreshAds();
        return;
    }

    refreshTimer = setTimeout(() => {
        refreshTimer = null;
        refreshAds();
    }, 120);
};

const handleResize = () => scheduleRefresh();

function determineLayoutType(container) {
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

function determineColumnCount(container) {
    if (!container) return 1;
    const columnsDefinition = window.getComputedStyle(container).gridTemplateColumns;
    if (!columnsDefinition) return 1;
    const columns = columnsDefinition
        .split(' ')
        .map(part => part.trim())
        .filter(part => part && part !== '/')
        .length;
    return columns && Number.isFinite(columns) ? columns : 1;
}

function renderAdInto(container, type) {
    if (!container) return;

    const slot = AD_SLOTS[type];
    if (!slot) return;

    container.innerHTML = '';
    container.dataset.adType = type;

    const ins = document.createElement('ins');
    ins.className = 'kakao_ad_area';
    ins.style.display = 'none';
    ins.setAttribute('data-ad-unit', slot.unit);
    ins.setAttribute('data-ad-width', slot.width.toString());
    ins.setAttribute('data-ad-height', slot.height.toString());
    container.appendChild(ins);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.charset = 'utf-8';
    script.src = SCRIPT_SRC;
    container.appendChild(script);
}

function refreshHeaderAd(type) {
    const adContainer = document.getElementById('dashboard-ad-slot');
    if (!adContainer) return;

    if (type === currentHeaderType && adContainer.dataset.adType === type) {
        return;
    }

    currentHeaderType = type;
    renderAdInto(adContainer, type);
}

function clearInlineAds() {
    inlineAdSlots.forEach(slot => {
        slot.remove();
    });
    inlineAdSlots = [];
}

function refreshInlineAds(type) {
    if (!mainContainerRef) return;

    clearInlineAds();

    const cards = Array.from(
        mainContainerRef.querySelectorAll('.dashboard-card')
    ).filter(card => !card.classList.contains('hidden') && card.style.display !== 'none');

    if (cards.length === 0) return;

    const columnCount = determineColumnCount(mainContainerRef);
    const totalRows = Math.ceil(cards.length / columnCount);

    for (let row = 1; row < totalRows; row += 1) {
        const insertIndex = row * columnCount;
        const referenceNode = cards[insertIndex] || null;

        const slotContainer = document.createElement('div');
        slotContainer.className = INLINE_AD_CLASS;

        mainContainerRef.insertBefore(slotContainer, referenceNode);
        inlineAdSlots.push(slotContainer);

        renderAdInto(slotContainer, type);
    }
}

function refreshAds() {
    const type = determineLayoutType(mainContainerRef || document.querySelector('.main-container'));
    refreshHeaderAd(type);
    refreshInlineAds(type);
}

export function initializeHeaderAd() {
    const headerSlot = document.getElementById('dashboard-ad-slot');
    if (!headerSlot) {
        console.warn('대시보드 광고 컨테이너를 찾을 수 없습니다.');
        return;
    }

    mainContainerRef = document.querySelector('.main-container');

    refreshAds();

    if (hasInitialized) {
        return;
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    if (mainContainerRef && 'ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(() => scheduleRefresh());
        resizeObserver.observe(mainContainerRef);
    }

    hasInitialized = true;
}

export function cleanupHeaderAd() {
    if (resizeObserver && mainContainerRef) {
        resizeObserver.unobserve(mainContainerRef);
        resizeObserver.disconnect();
        resizeObserver = null;
    }

    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);

    clearInlineAds();

    hasInitialized = false;
    currentHeaderType = null;
    mainContainerRef = null;
}

export function refreshDashboardAds() {
    scheduleRefresh();
}
