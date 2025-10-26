// 독서 목록 카드 모듈
import { saveData, loadData, generateId } from '../core/utils.js';

let bookTitleInput, bookAuthorInput, readingStatusSelect, bookPagesInput, currentPageInput, addBookBtn;
let totalBooksSpan, completedBooksSpan, readingBooksSpan, booksList;
let books = [];

function renderBooks() {
    if (!booksList) return;
    
    // 상태별로 정렬 (읽는 중 > 읽을 예정 > 완료)
    const statusOrder = ['reading', 'to-read', 'completed'];
    const sortedBooks = [...books].sort((a, b) => {
        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
    });
    
    booksList.innerHTML = '';
    sortedBooks.forEach((book) => {
        const progress = book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0;
        
        const bookElement = document.createElement('div');
        bookElement.className = `book-item status-${book.status}`;
        bookElement.innerHTML = `
            <div class="book-header">
                <h4 class="book-title">${book.title}</h4>
                <span class="book-status ${book.status}">${getStatusLabel(book.status)}</span>
            </div>
            <div class="book-author">저자: ${book.author}</div>
            ${book.totalPages > 0 ? `
                <div class="book-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="progress-text">${book.currentPage}/${book.totalPages} 페이지 (${progress}%)</span>
                </div>
                <div class="book-actions">
                    ${book.status === 'reading' ? `
                        <button class="update-progress-btn" data-id="${book.id}">진행률 업데이트</button>
                    ` : ''}
                    <select class="book-status-update" data-id="${book.id}">
                        <option value="to-read" ${book.status === 'to-read' ? 'selected' : ''}>읽을 예정</option>
                        <option value="reading" ${book.status === 'reading' ? 'selected' : ''}>읽는 중</option>
                        <option value="completed" ${book.status === 'completed' ? 'selected' : ''}>완료</option>
                    </select>
                    <button class="delete-book-btn" data-id="${book.id}">삭제</button>
                </div>
            ` : `
                <div class="book-actions">
                    <select class="book-status-update" data-id="${book.id}">
                        <option value="to-read" ${book.status === 'to-read' ? 'selected' : ''}>읽을 예정</option>
                        <option value="reading" ${book.status === 'reading' ? 'selected' : ''}>읽는 중</option>
                        <option value="completed" ${book.status === 'completed' ? 'selected' : ''}>완료</option>
                    </select>
                    <button class="delete-book-btn" data-id="${book.id}">삭제</button>
                </div>
            `}
        `;
        booksList.appendChild(bookElement);
    });
    
    updateReadingStats();
}

function getStatusLabel(status) {
    const labels = {
        'to-read': '📚 읽을 예정',
        'reading': '📖 읽는 중',
        'completed': '✅ 완료'
    };
    return labels[status] || status;
}

function updateReadingStats() {
    const total = books.length;
    const completed = books.filter(book => book.status === 'completed').length;
    const reading = books.filter(book => book.status === 'reading').length;
    
    if (totalBooksSpan) totalBooksSpan.textContent = `${total}권`;
    if (completedBooksSpan) completedBooksSpan.textContent = `${completed}권`;
    if (readingBooksSpan) readingBooksSpan.textContent = `${reading}권`;
}

function addBook() {
    const title = bookTitleInput.value.trim();
    const author = bookAuthorInput.value.trim();
    const status = readingStatusSelect.value;
    const totalPages = parseInt(bookPagesInput.value) || 0;
    const currentPage = parseInt(currentPageInput.value) || 0;

    if (!title || !author) {
        alert('책 제목과 저자를 입력해주세요.');
        return;
    }

    if (totalPages > 0 && currentPage > totalPages) {
        alert('현재 페이지가 총 페이지수를 초과할 수 없습니다.');
        return;
    }

    const newBook = {
        id: generateId(),
        title, author, status,
        totalPages: totalPages || 0,
        currentPage: currentPage || 0,
        createdAt: new Date().toISOString()
    };

    books.push(newBook);
    saveData('books', books);
    renderBooks();

    // 폼 리셋
    bookTitleInput.value = '';
    bookAuthorInput.value = '';
    readingStatusSelect.value = 'to-read';
    bookPagesInput.value = '';
    currentPageInput.value = '';
}

function updateBookStatus(bookId, newStatus) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    book.status = newStatus;
    book.updatedAt = new Date().toISOString();
    
    // 완료 상태로 변경 시 현재 페이지를 총 페이지로 설정
    if (newStatus === 'completed' && book.totalPages > 0) {
        book.currentPage = book.totalPages;
    }
    
    saveData('books', books);
    renderBooks();

    if (newStatus === 'completed') {
        alert(`🎉 "${book.title}" 독서를 완료했습니다!`);
    }
}

function updateBookProgress(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book || book.totalPages === 0) return;

    const newPage = prompt(`현재 읽은 페이지를 입력하세요 (1-${book.totalPages}):`, book.currentPage);
    if (newPage === null) return;

    const pageNumber = parseInt(newPage);
    if (isNaN(pageNumber) || pageNumber < 0 || pageNumber > book.totalPages) {
        alert('올바른 페이지 번호를 입력해주세요.');
        return;
    }

    book.currentPage = pageNumber;
    book.updatedAt = new Date().toISOString();
    
    // 마지막 페이지까지 읽었으면 완료 처리
    if (pageNumber === book.totalPages) {
        book.status = 'completed';
    }
    
    saveData('books', books);
    renderBooks();

    if (pageNumber === book.totalPages) {
        alert('축하합니다! 책을 모두 읽으셨습니다! 🎉');
    }
}

function deleteBook(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    if (confirm(`"${book.title}"를 삭제하시겠습니까?`)) {
        books = books.filter(b => b.id !== bookId);
        saveData('books', books);
        renderBooks();
    }
}

function handleAddBook(e) {
    e.preventDefault();
    addBook();
}

function handleBookAction(e) {
    if (e.target.classList.contains('book-status-update')) {
        const bookId = e.target.dataset.id;
        const newStatus = e.target.value;
        updateBookStatus(bookId, newStatus);
    } else if (e.target.classList.contains('update-progress-btn')) {
        const bookId = e.target.dataset.id;
        updateBookProgress(bookId);
    } else if (e.target.classList.contains('delete-book-btn')) {
        const bookId = e.target.dataset.id;
        deleteBook(bookId);
    }
}

export function initReadingListCard() {
    bookTitleInput = document.getElementById('book-title');
    bookAuthorInput = document.getElementById('book-author');
    readingStatusSelect = document.getElementById('reading-status');
    bookPagesInput = document.getElementById('book-pages');
    currentPageInput = document.getElementById('current-page');
    addBookBtn = document.getElementById('add-book-btn');
    totalBooksSpan = document.getElementById('total-books');
    completedBooksSpan = document.getElementById('completed-books');
    readingBooksSpan = document.getElementById('reading-books');
    booksList = document.getElementById('books-list');

    if (!bookTitleInput || !addBookBtn) return;

    books = loadData('books') || [];
    addBookBtn.addEventListener('click', handleAddBook);
    if (booksList) {
        booksList.addEventListener('click', handleBookAction);
        booksList.addEventListener('change', handleBookAction);
    }
    renderBooks();
}

export function cleanupReadingListCard() {
    if (addBookBtn) addBookBtn.removeEventListener('click', handleAddBook);
    if (booksList) {
        booksList.removeEventListener('click', handleBookAction);
        booksList.removeEventListener('change', handleBookAction);
    }
}

export { renderBooks, addBook, updateBookStatus, updateBookProgress, deleteBook };