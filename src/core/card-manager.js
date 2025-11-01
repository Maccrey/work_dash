// 카드 관리 시스템
import { cardVisibility, updateCardVisibility } from './state.js';
import { saveData, loadData } from './utils.js';

// 카드 메타데이터 타입 정의
export const CardCategories = {
    BASIC: 'basic',
    DATA: 'data', 
    FINANCE: 'finance',
    PLANNING: 'planning',
    COLLABORATION: 'collaboration',
    GROWTH: 'growth',
    TOOLS: 'tools'
};

// 등록된 모든 카드들
const registeredCards = new Map();

// 카드 클래스 정의
export class Card {
    constructor(id, name, category, icon, initFn, cleanupFn, dependencies = []) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.icon = icon;
        this.initFn = initFn;
        this.cleanupFn = cleanupFn;
        this.dependencies = dependencies;
        this.isInitialized = false;
        this.domElement = null;
        const initialElement = document.getElementById(id);
        const defaultVisibleAttr = initialElement?.dataset?.defaultVisible;
        if (defaultVisibleAttr !== undefined) {
            this.defaultVisible = defaultVisibleAttr !== 'false';
        } else {
            const hasHiddenClass = initialElement?.classList.contains('hidden');
            const hasInlineHidden = initialElement?.style.display === 'none';
            this.defaultVisible = !(hasHiddenClass || hasInlineHidden);
            if (initialElement) {
                initialElement.dataset.defaultVisible = this.defaultVisible ? 'true' : 'false';
            }
        }
    }

    async initialize() {
        if (this.isInitialized) return;
        
        this.domElement = document.getElementById(this.id);
        if (!this.domElement) {
            console.warn(`Card DOM element not found: ${this.id}`);
            return;
        }

        try {
            if (this.initFn) {
                await this.initFn();
            }
            this.isInitialized = true;
            this.applyVisibility();
        } catch (error) {
            console.error(`Error initializing card ${this.id}:`, error);
        }
    }

    cleanup() {
        if (!this.isInitialized) return;
        
        try {
            if (this.cleanupFn) {
                this.cleanupFn();
            }
        } catch (error) {
            console.error(`Error cleaning up card ${this.id}:`, error);
        } finally {
            this.isInitialized = false;
        }
    }

    setVisible(visible, { persist = true } = {}) {
        if (!this.domElement) return;
        
        if (visible) {
            this.domElement.classList.remove('hidden');
            this.domElement.style.display = '';
        } else {
            this.domElement.classList.add('hidden');
            this.domElement.style.display = 'none';
        }
        
        // 카드가 표시될 때 초기화
        if (visible && !this.isInitialized) {
            this.initialize();
        }
        
        if (persist) {
            const newVisibility = { ...cardVisibility };
            newVisibility[this.id] = visible;
            updateCardVisibility(newVisibility);
        }
    }

    getVisibilityPreference(savedVisibility = cardVisibility) {
        const hasSavedValue = Object.prototype.hasOwnProperty.call(savedVisibility, this.id);
        if (hasSavedValue) {
            return savedVisibility[this.id] !== false;
        }
        return this.defaultVisible;
    }

    applyVisibility(savedVisibility = cardVisibility) {
        const visible = this.getVisibilityPreference(savedVisibility);
        this.setVisible(visible);
    }

    isVisible() {
        return this.getVisibilityPreference();
    }
}

// 카드 등록 함수
export function registerCard(id, name, category, icon, initFn, cleanupFn, dependencies = []) {
    const card = new Card(id, name, category, icon, initFn, cleanupFn, dependencies);
    registeredCards.set(id, card);
    return card;
}

// 카드 가져오기
export function getCard(id) {
    return registeredCards.get(id);
}

// 모든 카드 가져오기
export function getAllCards() {
    return Array.from(registeredCards.values());
}

// 카테고리별 카드 가져오기
export function getCardsByCategory(category) {
    return Array.from(registeredCards.values()).filter(card => card.category === category);
}

// 모든 카드 초기화
export async function initializeAllCards() {
    console.log('초기화할 카드 수:', registeredCards.size);
    
    for (const card of registeredCards.values()) {
        await card.initialize();
    }
    
    // 카드 표시상태 복원
    applyCardVisibilitySettings();
}

// 모든 카드 정리
export function cleanupAllCards() {
    for (const card of registeredCards.values()) {
        card.cleanup();
    }
}

// 카드 표시상태 설정 적용
export function applyCardVisibilitySettings() {
    // localStorage에서 카드 표시 설정 로드
    const savedVisibility = loadData('cardVisibility') || {};
    
    // 설정 모달의 체크박스 상태 동기화
    for (const card of registeredCards.values()) {
        const desiredVisibility = card.getVisibilityPreference(savedVisibility);
        const checkbox = document.getElementById(`toggle-${card.id}`);
        
        if (checkbox) {
            checkbox.checked = desiredVisibility;
        }
        
        card.setVisible(desiredVisibility);
    }
}

// 설정 모달 초기화
export function initializeSettingsModal() {
    const settingsIcon = document.getElementById('settings-icon');
    const settingsModal = document.getElementById('settings-modal');
    const settingsCloseBtn = settingsModal?.querySelector('.close-button');
    
    if (!settingsModal) {
        console.error('Settings modal not found');
        return;
    }

    // 설정 아이콘 클릭 이벤트
    if (settingsIcon) {
        settingsIcon.addEventListener('click', () => {
            settingsModal.style.display = 'block';
        });
    }

    // 모달 닫기 이벤트
    if (settingsCloseBtn) {
        settingsCloseBtn.addEventListener('click', () => {
            settingsModal.style.display = 'none';
        });
    }

    // 모달 외부 클릭시 닫기
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    // 카테고리별로 체크박스 생성
    const categories = {
        [CardCategories.BASIC]: { name: '기본 기능', icon: '📊' },
        [CardCategories.DATA]: { name: '데이터 관리 및 분석', icon: '📊' },
        [CardCategories.FINANCE]: { name: '재무 및 비용 관리', icon: '💰' },
        [CardCategories.PLANNING]: { name: '업무 조직 및 계획', icon: '📋' },
        [CardCategories.COLLABORATION]: { name: '협업 및 소통', icon: '🤝' },
        [CardCategories.GROWTH]: { name: '성장 및 학습', icon: '📈' },
        [CardCategories.TOOLS]: { name: '도구 및 유틸리티', icon: '🔧' }
    };

    const categoryContainers = new Map();

    const recalcCategoryHeight = (container) => {
        if (!container || !container.classList.contains('expanded')) return;
        container.style.maxHeight = `${container.scrollHeight}px`;
    };

    const setCategoryExpansion = (container, arrow, expand, header) => {
        if (!container) return;

        if (expand) {
            container.classList.add('expanded');
            container.classList.remove('collapsed');
            container.style.visibility = 'visible';
            container.style.opacity = '1';
            container.style.maxHeight = `${container.scrollHeight}px`;
            if (header) header.classList.add('expanded');
        } else {
            const currentHeight = container.scrollHeight;
            container.style.maxHeight = `${currentHeight}px`;
            requestAnimationFrame(() => {
                container.classList.add('collapsed');
                container.classList.remove('expanded');
                container.style.maxHeight = '0px';
                container.style.opacity = '0';
                container.style.visibility = 'hidden';
                if (header) header.classList.remove('expanded');
            });
        }
    };

    Object.entries(categories).forEach(([categoryKey]) => {
        const categoryCards = getCardsByCategory(categoryKey);
        if (categoryCards.length === 0) return;

        const categoryContainer = document.getElementById(`category-${categoryKey}`);
        if (!categoryContainer) {
            console.warn(`Category container not found: category-${categoryKey}`);
            return;
        }

        categoryContainers.set(categoryKey, categoryContainer);

        // 기존 카드 체크박스 제거
        categoryContainer.innerHTML = '';

        // 카드 체크박스 생성
        categoryCards.forEach(card => {
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `toggle-${card.id}`;

            const cardElement = document.getElementById(card.id);
            const hasSavedValue = Object.prototype.hasOwnProperty.call(cardVisibility, card.id);
            const defaultVisible = cardElement 
                ? (!cardElement.classList.contains('hidden') && cardElement.style.display !== 'none')
                : true;
            checkbox.checked = hasSavedValue ? cardVisibility[card.id] !== false : defaultVisible;

            const nameSpan = document.createElement('span');
            nameSpan.textContent = card.name;

            label.appendChild(checkbox);
            label.appendChild(nameSpan);
            categoryContainer.appendChild(label);

            checkbox.addEventListener('change', (e) => {
                card.setVisible(e.target.checked);

                requestAnimationFrame(() => {
                    recalcCategoryHeight(categoryContainer);
                });
            });
        });
    });

    categoryContainers.forEach((container, categoryKey) => {
        const header = document.querySelector(`.category-header[data-category="${categoryKey}"]`);
        const arrow = header?.querySelector('.dropdown-arrow');

        if (header) {
            header.style.cursor = 'pointer';
            if (!header.dataset.toggleInitialized) {
                header.addEventListener('click', () => {
                    const willExpand = container.classList.contains('collapsed');
                    setCategoryExpansion(container, arrow, willExpand, header);
                });
                header.dataset.toggleInitialized = 'true';
            }
        }

        const shouldStartExpanded = categoryKey === CardCategories.BASIC;
        setCategoryExpansion(container, arrow, shouldStartExpanded, header);
    });

    // 설정 적용
    applyCardVisibilitySettings();
    categoryContainers.forEach(container => recalcCategoryHeight(container));
}

// 카드별 드래그 앤 드롭 순서 저장/복원 (향후 구현 예정)
export function saveCardOrder() {
    const cards = document.querySelectorAll('.dashboard-card');
    const order = Array.from(cards).map(card => card.id);
    saveData('cardOrder', order);
}

export function applyCardOrder() {
    const savedOrder = loadData('cardOrder');
    if (!savedOrder) return;

    const container = document.querySelector('.main-container');
    if (!container) return;

    savedOrder.forEach(cardId => {
        const cardElement = document.getElementById(cardId);
        if (cardElement) {
            container.appendChild(cardElement);
        }
    });
}
