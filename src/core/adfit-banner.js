// Manages AdFit placements for the dashboard (header + footer)
const PLACEMENTS = [
    {
        id: 'dashboard-ad-slot',
        slots: {
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
        }
    },
    {
        id: 'dashboard-footer-ad-slot',
        slots: {
            desktop: {
                unit: 'DAN-tjU7BD6s2MmGb57Z',
                width: 728,
                height: 90
            },
            mobile: {
                unit: 'DAN-EZjVwrdFY5AsNsTK',
                width: 320,
                height: 100
            }
        }
    }
];

const SCRIPT_SRC = 'https://t1.daumcdn.net/kas/static/ba.min.js';

let hasInitialized = false;
const placementStates = new Map();

const determineLayoutType = () => (window.innerWidth <= 600 ? 'mobile' : 'desktop');

function renderPlacement(placement, layoutType) {
    const container = document.getElementById(placement.id);
    if (!container) {
        console.warn(`광고 컨테이너를 찾을 수 없습니다: ${placement.id}`);
        return;
    }

    const slot = placement.slots[layoutType] || placement.slots.desktop;
    if (!slot) {
        console.warn(`지원되지 않는 광고 레이아웃 타입입니다: ${layoutType}`);
        return;
    }

    const stateKey = `${layoutType}:${slot.unit}`;
    if (placementStates.get(placement.id) === stateKey && container.dataset.adUnit === slot.unit) {
        return;
    }

    placementStates.set(placement.id, stateKey);
    container.innerHTML = '';
    container.dataset.adUnit = slot.unit;
    container.style.minHeight = `${slot.height}px`;

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

function refreshPlacements() {
    const layoutType = determineLayoutType();
    PLACEMENTS.forEach(placement => renderPlacement(placement, layoutType));
}

export function initializeHeaderAd() {
    refreshPlacements();

    if (hasInitialized) {
        return;
    }

    window.addEventListener('resize', refreshPlacements);
    window.addEventListener('orientationchange', refreshPlacements);
    hasInitialized = true;
}

export function cleanupHeaderAd() {
    if (!hasInitialized) {
        return;
    }

    window.removeEventListener('resize', refreshPlacements);
    window.removeEventListener('orientationchange', refreshPlacements);

    PLACEMENTS.forEach(placement => {
        const container = document.getElementById(placement.id);
        if (container) {
            container.innerHTML = '';
            container.style.minHeight = '';
            delete container.dataset.adUnit;
        }
    });

    placementStates.clear();
    hasInitialized = false;
}

export function refreshDashboardAds() {
    refreshPlacements();
}
