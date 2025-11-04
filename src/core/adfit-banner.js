// Helper to manage the dashboard AdFit placements with unique units per slot
const DEFAULT_AD_UNIT_CONFIG = {
    desktop: {
        header: 'DAN-USxMZMHTgeVGaj1e',
        inline: []
    },
    mobile: {
        header: 'DAN-Ci1t1IxYYzeFjLyA',
        inline: []
    }
};

const AD_DIMENSIONS = {
    desktop: {
        width: 728,
        height: 90
    },
    mobile: {
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
let adUnitConfig = JSON.parse(JSON.stringify(DEFAULT_AD_UNIT_CONFIG));
let hasLoggedInsufficientInlineUnits = false;

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

function renderAdInto(container, layoutType, unit) {
    if (!container || !unit) return;

    const dimensions = AD_DIMENSIONS[layoutType] || AD_DIMENSIONS.desktop;

    container.innerHTML = '';
    container.dataset.adType = layoutType;
    container.dataset.adUnit = unit;

    const ins = document.createElement('ins');
    ins.className = 'kakao_ad_area';
    ins.style.display = 'none';
    ins.setAttribute('data-ad-unit', unit);
    ins.setAttribute('data-ad-width', dimensions.width.toString());
    ins.setAttribute('data-ad-height', dimensions.height.toString());
    container.appendChild(ins);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.charset = 'utf-8';
    script.src = SCRIPT_SRC;
    container.appendChild(script);
}

function refreshHeaderAd(layoutType) {
    const adContainer = document.getElementById('dashboard-ad-slot');
    if (!adContainer) return;

    const unit = adUnitConfig[layoutType]?.header;
    if (!unit) {
        console.warn(`[adfit-banner] ${layoutType} 헤더 광고 단위가 설정되지 않았습니다.`);
        adContainer.innerHTML = '';
        adContainer.removeAttribute('data-ad-unit');
        return;
    }

    if (
        layoutType === currentHeaderType &&
        adContainer.dataset.adType === layoutType &&
        adContainer.dataset.adUnit === unit
    ) {
        return;
    }

    currentHeaderType = layoutType;
    renderAdInto(adContainer, layoutType, unit);
}

function clearInlineAds() {
    inlineAdSlots.forEach(slot => {
        slot.remove();
    });
    inlineAdSlots = [];
}

function refreshInlineAds(layoutType) {
    if (!mainContainerRef) return;

    clearInlineAds();

    const inlineUnits = adUnitConfig[layoutType]?.inline || [];
    if (!inlineUnits.length) {
        hasLoggedInsufficientInlineUnits = false;
        return;
    }

    const cards = Array.from(
        mainContainerRef.querySelectorAll('.dashboard-card')
    ).filter(card => !card.classList.contains('hidden') && card.style.display !== 'none');

    if (cards.length === 0) return;

    const columnCount = determineColumnCount(mainContainerRef);
    const totalRows = Math.ceil(cards.length / columnCount);
    const maxInlineSlots = Math.min(inlineUnits.length, Math.max(totalRows - 1, 0));

    if (totalRows - 1 > inlineUnits.length && !hasLoggedInsufficientInlineUnits) {
        console.warn('[adfit-banner] 설정된 인라인 광고 단위보다 필요한 슬롯 수가 많아 일부 구간에는 광고가 표시되지 않습니다.');
        hasLoggedInsufficientInlineUnits = true;
    }

    for (let slotIndex = 0; slotIndex < maxInlineSlots; slotIndex += 1) {
        const unit = inlineUnits[slotIndex];
        if (!unit) {
            continue;
        }

        const insertIndex = (slotIndex + 1) * columnCount;
        const referenceNode = cards[insertIndex] || null;

        const slotContainer = document.createElement('div');
        slotContainer.className = INLINE_AD_CLASS;

        mainContainerRef.insertBefore(slotContainer, referenceNode);
        inlineAdSlots.push(slotContainer);

        renderAdInto(slotContainer, layoutType, unit);
    }
}

function refreshAds() {
    const layoutType = determineLayoutType(mainContainerRef || document.querySelector('.main-container'));
    refreshHeaderAd(layoutType);
    refreshInlineAds(layoutType);
}

function parseAdUnits(value) {
    if (!value) return [];
    return Array.from(new Set(
        value
            .split(',')
            .map(unit => unit.trim())
            .filter(Boolean)
    ));
}

function hydrateAdUnitConfig(headerSlot) {
    const dataset = headerSlot?.dataset || {};

    const desktopHeaderUnit = dataset.desktopHeaderUnit?.trim();
    const mobileHeaderUnit = dataset.mobileHeaderUnit?.trim();
    if (desktopHeaderUnit) {
        adUnitConfig.desktop.header = desktopHeaderUnit;
    }
    if (mobileHeaderUnit) {
        adUnitConfig.mobile.header = mobileHeaderUnit;
    }

    const desktopInlineUnits = parseAdUnits(dataset.inlineDesktopUnits);
    const mobileInlineUnits = parseAdUnits(dataset.inlineMobileUnits);

    if (desktopInlineUnits.length) {
        adUnitConfig.desktop.inline = desktopInlineUnits;
    }
    if (mobileInlineUnits.length) {
        adUnitConfig.mobile.inline = mobileInlineUnits;
    }
}

export function initializeHeaderAd() {
    const headerSlot = document.getElementById('dashboard-ad-slot');
    if (!headerSlot) {
        console.warn('대시보드 광고 컨테이너를 찾을 수 없습니다.');
        return;
    }

    mainContainerRef = document.querySelector('.main-container');
    hydrateAdUnitConfig(headerSlot);

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
    hasLoggedInsufficientInlineUnits = false;
    adUnitConfig = JSON.parse(JSON.stringify(DEFAULT_AD_UNIT_CONFIG));
}

export function refreshDashboardAds() {
    scheduleRefresh();
}
