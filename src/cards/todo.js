// 할 일 카드 모듈
import { 
    todos, 
    updateTodos, 
    addTodo as addTodoToState, 
    removeTodo,
    currentTodoDate,
    updateCurrentTodoDate,
    isTodoTtsEnabled,
    updateTodoTtsEnabled
} from '../core/state.js';
import { formatDate, parseDate, generateId, speak, getCurrentTime, compareTime } from '../core/utils.js';

// DOM 요소들
let todoForm, todoTimeInput, todoTextInput, todoPriorityInput;
let todoListElem, doneListElem, currentTodoDateElem;
let prevDateBtn, nextDateBtn, todoTtsToggle;

// 날짜를 저장 키 형식으로 변환
function getDateKey(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 할 일 목록 렌더링
function renderTodos() {
    todoListElem.innerHTML = '';
    doneListElem.innerHTML = '';
    const currentDateKey = getDateKey(currentTodoDate);
    
    const todaysItems = todos.filter(todo => todo.date === currentDateKey);
    const sortedTodos = todaysItems.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return a.time.localeCompare(b.time);
    });
    
    sortedTodos.forEach(todo => {
        const li = document.createElement('li');
        li.dataset.id = todo.id;
        if (todo.completed) {
            li.innerHTML = `<span>${todo.time} - ${todo.text}</span>`;
            doneListElem.appendChild(li);
        } else {
            li.innerHTML = `
                <div class="priority-tag priority-${todo.priority}"></div>
                <strong>${todo.time}</strong>
                <span class="todo-item-text">${todo.text}</span>
                <div class="todo-actions">
                    <button class="complete-btn">✔️</button>
                    <button class="delete-btn">❌</button>
                </div>
            `;
            todoListElem.appendChild(li);
        }
    });
}

// 새 할 일 추가
function addTodo(time, text, priority) {
    if (!time || !text.trim()) return;
    
    const dateKey = getDateKey(currentTodoDate);
    const newTodo = { 
        id: generateId(),
        time, 
        text: text.trim(), 
        priority, 
        completed: false, 
        notified: false,
        date: dateKey 
    };
    
    todos.push(newTodo);
    updateTodos(todos);
    renderTodos();
}

// 할 일 액션 처리 (완료/삭제)
function handleTodoAction(e) {
    const li = e.target.closest('li');
    if (!li) return;
    
    const id = li.dataset.id;
    const todoIndex = todos.findIndex(t => t.id === id);
    if (todoIndex === -1) return;

    if (e.target.classList.contains('complete-btn')) {
        todos[todoIndex].completed = true;
        updateTodos(todos);
        renderTodos();
    } else if (e.target.classList.contains('delete-btn')) {
        if (confirm('이 할 일을 삭제하시겠습니까?')) {
            todos.splice(todoIndex, 1);
            updateTodos(todos);
            renderTodos();
        }
    }
}

// 할 일 폼 제출 처리
function handleTodoSubmit(e) {
    e.preventDefault();
    
    const time = todoTimeInput.value;
    const text = todoTextInput.value;
    const priority = todoPriorityInput.value;
    
    if (time && text.trim()) {
        addTodo(time, text, priority);
        todoTimeInput.value = '';
        todoTextInput.value = '';
        todoPriorityInput.value = 'medium';
    }
}

// 현재 할 일 날짜 업데이트
function updateCurrentTodoDateDisplay() {
    currentTodoDateElem.textContent = formatDate(currentTodoDate);
}

// 날짜 탐색 (이전/다음)
function navigateDate(direction) {
    const newDate = new Date(currentTodoDate);
    newDate.setDate(newDate.getDate() + direction);
    updateCurrentTodoDate(newDate);
    updateCurrentTodoDateDisplay();
    renderTodos();
}

// 할 일 시간 알림 확인
function checkTodoNotifications() {
    if (!isTodoTtsEnabled) return;
    
    const now = new Date();
    const currentTime = getCurrentTime();
    const currentDateKey = getDateKey(now);
    
    const todaysNotPendingTodos = todos.filter(todo => 
        todo.date === currentDateKey && 
        !todo.completed && 
        !todo.notified &&
        compareTime(todo.time, currentTime) <= 0
    );
    
    todaysNotPendingTodos.forEach(todo => {
        const message = `할 일 알림: ${todo.text}`;
        speak(message, false, isTodoTtsEnabled);
        todo.notified = true;
    });
    
    if (todaysNotPendingTodos.length > 0) {
        updateTodos(todos);
    }
}

// TTS 토글 처리
function handleTodoTtsToggle(e) {
    updateTodoTtsEnabled(e.target.checked);
}

// 할 일 카드 초기화
export function initTodoCard() {
    // DOM 요소 가져오기
    todoForm = document.getElementById('todo-form');
    todoTimeInput = document.getElementById('todo-time');
    todoTextInput = document.getElementById('todo-text');
    todoPriorityInput = document.getElementById('todo-priority');
    todoListElem = document.getElementById('todo-list');
    doneListElem = document.getElementById('done-list');
    currentTodoDateElem = document.getElementById('current-todo-date');
    prevDateBtn = document.getElementById('prev-date-btn');
    nextDateBtn = document.getElementById('next-date-btn');
    todoTtsToggle = document.getElementById('todo-tts-toggle');

    // 이벤트 리스너 등록
    if (todoForm) {
        todoForm.addEventListener('submit', handleTodoSubmit);
    }
    
    if (todoListElem) {
        todoListElem.addEventListener('click', handleTodoAction);
    }
    
    if (doneListElem) {
        doneListElem.addEventListener('click', handleTodoAction);
    }
    
    if (prevDateBtn) {
        prevDateBtn.addEventListener('click', () => navigateDate(-1));
    }
    
    if (nextDateBtn) {
        nextDateBtn.addEventListener('click', () => navigateDate(1));
    }
    
    if (todoTtsToggle) {
        todoTtsToggle.checked = isTodoTtsEnabled;
        todoTtsToggle.addEventListener('change', handleTodoTtsToggle);
    }

    // 1분마다 할 일 알림 확인
    setInterval(checkTodoNotifications, 60000);

    // 초기 렌더링
    updateCurrentTodoDateDisplay();
    renderTodos();
}

// 할 일 카드 정리
export function cleanupTodoCard() {
    // 이벤트 리스너 정리 (필요시)
}

// 외부에서 사용할 수 있는 함수들 내보내기
export { 
    renderTodos, 
    addTodo, 
    handleTodoAction, 
    navigateDate, 
    checkTodoNotifications 
};