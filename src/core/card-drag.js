import { saveCardOrder } from './card-manager.js';

const LONG_PRESS_DURATION = 2000;
const MOVE_CANCEL_THRESHOLD = 12;

let container = null;
let pointerMoveListener = null;
let pointerUpListener = null;
let pointerCancelListener = null;

const dragState = {
    timerId: null,
    pointerId: null,
    startX: 0,
    startY: 0,
    card: null,
    placeholder: null,
    isDragging: false,
    offsetX: 0,
    offsetY: 0
};

function resetDragState() {
    if (dragState.timerId) {
        clearTimeout(dragState.timerId);
    }

    dragState.timerId = null;
    dragState.pointerId = null;
    dragState.startX = 0;
    dragState.startY = 0;
    dragState.card = null;
    dragState.placeholder = null;
    dragState.isDragging = false;
    dragState.offsetX = 0;
    dragState.offsetY = 0;
}

function createPlaceholder(card) {
    const placeholder = document.createElement('div');
    placeholder.className = 'dashboard-card-placeholder';
    placeholder.style.height = `${card.offsetHeight}px`;
    placeholder.style.width = `${card.offsetWidth}px`;
    return placeholder;
}

function beginDrag(event) {
    const { card } = dragState;
    if (!card) return;

    dragState.isDragging = true;
    card.classList.add('dragging');
    card.style.width = `${card.offsetWidth}px`;
    card.style.height = `${card.offsetHeight}px`;
    card.style.position = 'fixed';
    card.style.zIndex = '999';
    card.style.pointerEvents = 'none';
    card.style.transition = 'none';

    const rect = card.getBoundingClientRect();
    dragState.offsetX = event.clientX - rect.left;
    dragState.offsetY = event.clientY - rect.top;

    dragState.placeholder = createPlaceholder(card);
    card.parentNode.insertBefore(dragState.placeholder, card);
    container.appendChild(card);

    updateCardPosition(event);

    try {
        card.setPointerCapture(dragState.pointerId);
    } catch (_) {
        // Ignore pointer capture errors (e.g., unsupported browsers)
    }
}

function updateCardPosition(event) {
    const { card, offsetX, offsetY } = dragState;
    if (!card) return;

    const left = event.clientX - offsetX;
    const top = event.clientY - offsetY;

    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
}

function updatePlaceholder(event) {
    const { placeholder, card } = dragState;
    if (!placeholder || !container) return;

    const element = document.elementFromPoint(event.clientX, event.clientY);
    if (!element) return;

    const targetCard = element.closest('.dashboard-card');
    if (!targetCard || targetCard === card || targetCard === placeholder) {
        return;
    }

    const targetRect = targetCard.getBoundingClientRect();
    const shouldInsertAfter = event.clientY > targetRect.top + targetRect.height / 2;

    if (shouldInsertAfter) {
        targetCard.after(placeholder);
    } else {
        targetCard.before(placeholder);
    }
}

function finalizeDrag() {
    const { card, placeholder } = dragState;
    if (!card) return;

    if (placeholder) {
        placeholder.replaceWith(card);
    }

    card.classList.remove('dragging');
    card.style.position = '';
    card.style.left = '';
    card.style.top = '';
    card.style.width = '';
    card.style.height = '';
    card.style.zIndex = '';
    card.style.pointerEvents = '';
    card.style.transition = '';

    try {
        card.releasePointerCapture(dragState.pointerId);
    } catch (_) {
        // Ignore release errors
    }

    saveCardOrder();
}

function cancelDragInProgress() {
    const { card, placeholder } = dragState;
    if (card) {
        card.classList.remove('dragging');
        card.style.position = '';
        card.style.left = '';
        card.style.top = '';
        card.style.width = '';
        card.style.height = '';
        card.style.zIndex = '';
        card.style.pointerEvents = '';
        card.style.transition = '';
    }

    if (placeholder) {
        if (card && placeholder.isConnected) {
            placeholder.replaceWith(card);
        } else {
            placeholder.remove();
        }
    }
}

function cleanupPointerListeners() {
    if (pointerMoveListener) {
        window.removeEventListener('pointermove', pointerMoveListener);
        pointerMoveListener = null;
    }
    if (pointerUpListener) {
        window.removeEventListener('pointerup', pointerUpListener);
        pointerUpListener = null;
    }
    if (pointerCancelListener) {
        window.removeEventListener('pointercancel', pointerCancelListener);
        pointerCancelListener = null;
    }
}

function cancelLongPress() {
    if (dragState.timerId) {
        clearTimeout(dragState.timerId);
        dragState.timerId = null;
    }
}

function onPointerMove(event) {
    if (event.pointerId !== dragState.pointerId) return;

    if (!dragState.isDragging) {
        const deltaX = Math.abs(event.clientX - dragState.startX);
        const deltaY = Math.abs(event.clientY - dragState.startY);
        if (deltaX > MOVE_CANCEL_THRESHOLD || deltaY > MOVE_CANCEL_THRESHOLD) {
            cancelLongPress();
            cleanupPointerListeners();
            resetDragState();
        }
        return;
    }

    event.preventDefault();
    updateCardPosition(event);
    updatePlaceholder(event);
}

function endDrag(event) {
    if (event.pointerId !== dragState.pointerId) return;

    cleanupPointerListeners();
    cancelLongPress();

    if (dragState.isDragging) {
        finalizeDrag();
    }

    resetDragState();
}

function onPointerDown(event) {
    if (!container) return;
    if (event.button !== 0 && event.pointerType !== 'touch') return;

    const card = event.target.closest('.dashboard-card');
    if (!card || card.classList.contains('hidden')) return;

    dragState.pointerId = event.pointerId;
    dragState.card = card;
    dragState.startX = event.clientX;
    dragState.startY = event.clientY;

    dragState.timerId = setTimeout(() => {
        beginDrag(event);
    }, LONG_PRESS_DURATION);

    pointerMoveListener = onPointerMove;
    pointerUpListener = endDrag;
    pointerCancelListener = endDrag;

    window.addEventListener('pointermove', pointerMoveListener, { passive: false });
    window.addEventListener('pointerup', pointerUpListener);
    window.addEventListener('pointercancel', pointerCancelListener);
}

function onPointerUpBeforeLongPress(event) {
    if (event.pointerId !== dragState.pointerId) return;
    if (dragState.isDragging) return;
    cleanupPointerListeners();
    cancelLongPress();
    resetDragState();
}

function onPointerLeave(event) {
    if (event.pointerId !== dragState.pointerId) {
        return;
    }

    if (!dragState.isDragging) {
        cleanupPointerListeners();
        cancelLongPress();
        resetDragState();
    }
}

export function initializeCardDrag() {
    container = document.querySelector('.main-container');
    if (!container) return;

    container.querySelectorAll('.dashboard-card-placeholder').forEach(placeholder => placeholder.remove());

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointerup', onPointerUpBeforeLongPress);
    container.addEventListener('pointerleave', onPointerLeave);
}

export function cleanupCardDrag() {
    if (!container) return;

    container.removeEventListener('pointerdown', onPointerDown);
    container.removeEventListener('pointerup', onPointerUpBeforeLongPress);
    container.removeEventListener('pointerleave', onPointerLeave);

    cleanupPointerListeners();
    cancelDragInProgress();
    resetDragState();

    container = null;
}
