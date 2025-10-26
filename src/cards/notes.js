// 메모장 카드 모듈
import { notes, updateNotes, addNote as addNoteToState, removeNote } from '../core/state.js';
import { generateId } from '../core/utils.js';

// DOM 요소들
let noteForm, noteInput, noteList;

// 메모 목록 렌더링
function renderNotes() {
    noteList.innerHTML = '';
    notes.forEach((note, index) => {
        const li = document.createElement('li');
        li.dataset.id = note.id;
        li.innerHTML = `
            <span class="note-content">${note.content}</span>
            <span class="note-timestamp">${note.timestamp}</span>
            <button class="delete-note-btn" data-index="${index}">❌</button>
        `;
        noteList.appendChild(li);
    });
}

// 새 메모 추가
function addNote(content) {
    if (!content.trim()) return;
    
    const timestamp = new Date().toLocaleString('ko-KR', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
    });
    
    const newNote = {
        id: generateId(),
        content: content.trim(),
        timestamp
    };
    
    // 최신 메모가 위에 오도록 앞에 추가
    notes.unshift(newNote);
    updateNotes(notes);
    renderNotes();
}

// 메모 삭제
function deleteNote(index) {
    removeNote(index);
    renderNotes();
}

// 메모 폼 제출 처리
function handleNoteSubmit(e) {
    e.preventDefault();
    const content = noteInput.value;
    if (content.trim()) {
        addNote(content);
        noteInput.value = '';
    }
}

// 메모 삭제 버튼 클릭 처리
function handleDeleteClick(e) {
    if (e.target.classList.contains('delete-note-btn')) {
        const index = parseInt(e.target.dataset.index);
        if (confirm('이 메모를 삭제하시겠습니까?')) {
            deleteNote(index);
        }
    }
}

// 메모장 카드 초기화
export function initNotesCard() {
    // DOM 요소 가져오기
    noteForm = document.getElementById('note-form');
    noteInput = document.getElementById('note-input');
    noteList = document.getElementById('note-list');

    // 이벤트 리스너 등록
    noteForm.addEventListener('submit', handleNoteSubmit);
    noteList.addEventListener('click', handleDeleteClick);

    // 초기 메모 목록 렌더링
    renderNotes();
}

// 메모장 카드 정리
export function cleanupNotesCard() {
    // 이벤트 리스너 정리 (필요시)
}

// 외부에서 사용할 수 있는 함수들 내보내기
export { renderNotes, addNote, deleteNote };