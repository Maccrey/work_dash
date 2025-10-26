// 북마크 관리 카드 모듈
import { saveData, loadData } from '../core/utils.js';

// 북마크 데이터 저장 키
const BOOKMARKS_KEY = 'workBookmarks';

// 북마크 데이터 구조
let bookmarks = [];

// DOM 요소들
let bookmarkForm, titleInput, urlInput, categorySelect, descriptionInput;
let bookmarksList, searchInput, categoryFilter, clearAllBtn;

// 기본 카테고리
const DEFAULT_CATEGORIES = [
    { value: 'work', label: '업무' },
    { value: 'development', label: '개발' },
    { value: 'design', label: '디자인' },
    { value: 'documentation', label: '문서/위키' },
    { value: 'tools', label: '도구' },
    { value: 'communication', label: '소통' },
    { value: 'project', label: '프로젝트' },
    { value: 'learning', label: '학습' },
    { value: 'other', label: '기타' }
];

// 북마크 데이터 로드
function loadBookmarks() {
    const savedBookmarks = loadData(BOOKMARKS_KEY);
    bookmarks = savedBookmarks || [];
}

// 북마크 데이터 저장
function saveBookmarks() {
    saveData(BOOKMARKS_KEY, bookmarks);
}

// URL 유효성 검사 (IP 주소 포함)
function isValidUrl(string) {
    try {
        // URL 객체로 검증 시도
        new URL(string);
        return true;
    } catch (_) {
        // URL 객체 생성 실패 시, IP 주소나 도메인 패턴 직접 검증
        return isValidUrlPattern(string);
    }
}

// URL 패턴 검사 (IP 주소, 도메인, 포트 번호 포함)
function isValidUrlPattern(url) {
    // 기본적인 URL 패턴 검사
    const urlPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-\.]*[a-zA-Z0-9])?(\:[0-9]+)?(\/.*)?$/;
    
    // IP 주소 패턴 (IPv4)
    const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\:[0-9]+)?(\/.*)?$/;
    
    // localhost 패턴
    const localhostPattern = /^localhost(\:[0-9]+)?(\/.*)?$/i;
    
    return urlPattern.test(url) || ipPattern.test(url) || localhostPattern.test(url);
}

// URL에 프로토콜 추가
function addProtocol(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        // IP 주소나 localhost인 경우 http를 기본으로 사용
        if (isIPAddress(url) || url.startsWith('localhost') || url.startsWith('127.0.0.1') || url.startsWith('192.168.') || url.startsWith('10.') || url.startsWith('172.')) {
            return 'http://' + url;
        }
        return 'https://' + url;
    }
    return url;
}

// IP 주소인지 확인
function isIPAddress(url) {
    const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\:[0-9]+)?$/;
    return ipPattern.test(url.split('/')[0]); // 경로 제거하고 IP만 검사
}

// 파비콘 URL 생성
function getFaviconUrl(url) {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
    } catch {
        return '🔗';
    }
}

// 새 북마크 추가
function addBookmark(title, url, category, description = '') {
    if (!title.trim() || !url.trim()) {
        alert('제목과 URL을 입력해주세요.');
        return false;
    }

    const fullUrl = addProtocol(url.trim());
    
    if (!isValidUrl(fullUrl)) {
        alert('올바른 URL 형식을 입력해주세요.');
        return false;
    }

    const newBookmark = {
        id: Date.now().toString(),
        title: title.trim(),
        url: fullUrl,
        category: category || 'other',
        description: description.trim(),
        createdAt: new Date().toISOString(),
        clickCount: 0
    };

    bookmarks.unshift(newBookmark);
    saveBookmarks();
    renderBookmarks();
    return true;
}

// 북마크 삭제
function deleteBookmark(id) {
    if (confirm('이 북마크를 삭제하시겠습니까?')) {
        bookmarks = bookmarks.filter(bookmark => bookmark.id !== id);
        saveBookmarks();
        renderBookmarks();
    }
}

// 북마크 클릭 카운트 증가
function incrementClickCount(id) {
    const bookmark = bookmarks.find(b => b.id === id);
    if (bookmark) {
        bookmark.clickCount++;
        saveBookmarks();
    }
}

// 북마크 편집
function editBookmark(id) {
    const bookmark = bookmarks.find(b => b.id === id);
    if (!bookmark) return;

    const newTitle = prompt('제목을 수정하세요:', bookmark.title);
    if (newTitle === null) return;

    const newUrl = prompt('URL을 수정하세요:', bookmark.url);
    if (newUrl === null) return;

    const newDescription = prompt('설명을 수정하세요:', bookmark.description || '');
    if (newDescription === null) return;

    if (!newTitle.trim() || !newUrl.trim()) {
        alert('제목과 URL은 필수입니다.');
        return;
    }

    const fullUrl = addProtocol(newUrl.trim());
    
    if (!isValidUrl(fullUrl)) {
        alert('올바른 URL 형식을 입력해주세요.');
        return;
    }

    bookmark.title = newTitle.trim();
    bookmark.url = fullUrl;
    bookmark.description = newDescription.trim();
    bookmark.updatedAt = new Date().toISOString();

    saveBookmarks();
    renderBookmarks();
}

// 북마크 필터링
function filterBookmarks() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;

    let filteredBookmarks = bookmarks;

    // 카테고리 필터
    if (selectedCategory && selectedCategory !== 'all') {
        filteredBookmarks = filteredBookmarks.filter(bookmark => 
            bookmark.category === selectedCategory
        );
    }

    // 검색 필터
    if (searchTerm) {
        filteredBookmarks = filteredBookmarks.filter(bookmark =>
            bookmark.title.toLowerCase().includes(searchTerm) ||
            bookmark.url.toLowerCase().includes(searchTerm) ||
            bookmark.description.toLowerCase().includes(searchTerm)
        );
    }

    renderBookmarksList(filteredBookmarks);
}

// 북마크 목록 렌더링
function renderBookmarksList(bookmarksToRender = bookmarks) {
    if (bookmarksToRender.length === 0) {
        bookmarksList.innerHTML = '<div class="no-bookmarks">저장된 북마크가 없습니다.</div>';
        return;
    }

    // 클릭 수와 최신 순으로 정렬
    const sortedBookmarks = [...bookmarksToRender].sort((a, b) => {
        // 클릭 수가 같으면 생성일 순
        if (b.clickCount === a.clickCount) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return b.clickCount - a.clickCount;
    });

    bookmarksList.innerHTML = sortedBookmarks.map(bookmark => {
        const categoryLabel = DEFAULT_CATEGORIES.find(cat => cat.value === bookmark.category)?.label || '기타';
        const createdDate = new Date(bookmark.createdAt).toLocaleDateString('ko-KR');
        const faviconUrl = getFaviconUrl(bookmark.url);
        
        return `
            <div class="bookmark-item" data-category="${bookmark.category}">
                <div class="bookmark-header">
                    <div class="bookmark-favicon">
                        <img src="${faviconUrl}" alt="favicon" onerror="this.style.display='none'; this.parentNode.innerHTML='🔗';">
                    </div>
                    <div class="bookmark-info">
                        <h4 class="bookmark-title">
                            <a href="${bookmark.url}" target="_blank" onclick="incrementClickCount('${bookmark.id}')">${bookmark.title}</a>
                        </h4>
                        <div class="bookmark-meta">
                            <span class="bookmark-category">${categoryLabel}</span>
                            <span class="bookmark-date">${createdDate}</span>
                            ${bookmark.clickCount > 0 ? `<span class="bookmark-clicks">클릭 ${bookmark.clickCount}회</span>` : ''}
                        </div>
                    </div>
                    <div class="bookmark-actions">
                        <button class="edit-bookmark-btn" onclick="editBookmark('${bookmark.id}')" title="편집">✏️</button>
                        <button class="delete-bookmark-btn" onclick="deleteBookmark('${bookmark.id}')" title="삭제">🗑️</button>
                    </div>
                </div>
                ${bookmark.description ? `<div class="bookmark-description">${bookmark.description}</div>` : ''}
                <div class="bookmark-url">${bookmark.url}</div>
            </div>
        `;
    }).join('');
}

// 전체 북마크 렌더링
function renderBookmarks() {
    renderBookmarksList();
    
    // 통계 업데이트
    const totalCount = bookmarks.length;
    const categoryCount = {};
    
    bookmarks.forEach(bookmark => {
        categoryCount[bookmark.category] = (categoryCount[bookmark.category] || 0) + 1;
    });

    // 카테고리 필터 옵션 업데이트
    const currentValue = categoryFilter.value;
    categoryFilter.innerHTML = '<option value="all">전체 카테고리</option>';
    
    DEFAULT_CATEGORIES.forEach(category => {
        const count = categoryCount[category.value] || 0;
        if (count > 0) {
            categoryFilter.innerHTML += `<option value="${category.value}">${category.label} (${count})</option>`;
        }
    });
    
    categoryFilter.value = currentValue;

    // 통계 정보 업데이트
    const statsElement = document.getElementById('bookmark-stats');
    if (statsElement) {
        statsElement.textContent = `총 ${totalCount}개의 북마크`;
    }
}

// 모든 북마크 삭제
function clearAllBookmarks() {
    if (bookmarks.length === 0) {
        alert('삭제할 북마크가 없습니다.');
        return;
    }

    if (confirm(`정말로 모든 북마크(${bookmarks.length}개)를 삭제하시겠습니까?`)) {
        bookmarks = [];
        saveBookmarks();
        renderBookmarks();
        alert('모든 북마크가 삭제되었습니다.');
    }
}

// 북마크 내보내기 (JSON)
function exportBookmarks() {
    if (bookmarks.length === 0) {
        alert('내보낼 북마크가 없습니다.');
        return;
    }

    const dataStr = JSON.stringify(bookmarks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `bookmarks_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// 북마크 가져오기
function importBookmarks(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedBookmarks = JSON.parse(e.target.result);
            
            if (!Array.isArray(importedBookmarks)) {
                alert('올바른 북마크 파일 형식이 아닙니다.');
                return;
            }

            // 중복 확인
            let duplicateCount = 0;
            let addedCount = 0;

            importedBookmarks.forEach(bookmark => {
                if (bookmark.title && bookmark.url) {
                    const exists = bookmarks.some(existing => 
                        existing.url === bookmark.url || existing.title === bookmark.title
                    );

                    if (!exists) {
                        bookmarks.push({
                            ...bookmark,
                            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                            createdAt: bookmark.createdAt || new Date().toISOString(),
                            clickCount: bookmark.clickCount || 0
                        });
                        addedCount++;
                    } else {
                        duplicateCount++;
                    }
                }
            });

            saveBookmarks();
            renderBookmarks();
            
            alert(`북마크 가져오기 완료!\n추가된 북마크: ${addedCount}개\n중복으로 제외된 북마크: ${duplicateCount}개`);
            
        } catch (error) {
            alert('파일을 읽는 중 오류가 발생했습니다.');
        }
    };

    reader.readAsText(file);
    event.target.value = ''; // 파일 input 초기화
}

// 폼 제출 처리
function handleFormSubmit(e) {
    e.preventDefault();
    
    const title = titleInput.value;
    const url = urlInput.value;
    const category = categorySelect.value;
    const description = descriptionInput.value;

    if (addBookmark(title, url, category, description)) {
        // 폼 초기화
        bookmarkForm.reset();
    }
}

// 북마크 매니저 카드 초기화
export function initBookmarkManagerCard() {
    // DOM 요소 가져오기
    bookmarkForm = document.getElementById('bookmark-form');
    titleInput = document.getElementById('bookmark-title');
    urlInput = document.getElementById('bookmark-url');
    categorySelect = document.getElementById('bookmark-category');
    descriptionInput = document.getElementById('bookmark-description');
    
    bookmarksList = document.getElementById('bookmarks-list');
    searchInput = document.getElementById('bookmark-search');
    categoryFilter = document.getElementById('category-filter');
    clearAllBtn = document.getElementById('clear-all-bookmarks-btn');

    // 카테고리 옵션 설정
    if (categorySelect) {
        categorySelect.innerHTML = DEFAULT_CATEGORIES
            .map(cat => `<option value="${cat.value}">${cat.label}</option>`)
            .join('');
    }

    // 이벤트 리스너 등록
    if (bookmarkForm) {
        bookmarkForm.addEventListener('submit', handleFormSubmit);
    }

    // 입력 필드들에 대한 강력한 백스페이스 문제 해결
    const inputFields = [titleInput, urlInput, descriptionInput];
    inputFields.forEach(field => {
        if (field) {
            // 필드 속성을 확실히 설정
            field.readOnly = false;
            field.disabled = false;
            field.contentEditable = false;
            field.spellcheck = false;
            
            // 필드 스타일을 확실히 설정
            field.style.userSelect = 'text';
            field.style.webkitUserSelect = 'text';
            field.style.mozUserSelect = 'text';
            field.style.msUserSelect = 'text';
            field.style.pointerEvents = 'auto';
            field.style.cursor = 'text';
            field.style.outline = 'none';
            
            // 포커스 이벤트에서 확실히 편집 가능하게 설정
            field.addEventListener('focus', function() {
                this.readOnly = false;
                this.disabled = false;
                this.style.userSelect = 'text';
                this.style.pointerEvents = 'auto';
                
                // 강제로 선택 가능하게 만들기
                setTimeout(() => {
                    this.setSelectionRange(this.value.length, this.value.length);
                }, 10);
            });
            
            // 모든 키보드 이벤트 허용
            field.addEventListener('keydown', function(e) {
                // 모든 편집 키가 정상 작동하도록 허용
                e.stopPropagation();
                return true;
            });
            
            field.addEventListener('keyup', function(e) {
                e.stopPropagation();
                return true;
            });
            
            field.addEventListener('keypress', function(e) {
                e.stopPropagation();
                return true;
            });
            
            // input 이벤트도 정상 작동하도록 보장
            field.addEventListener('input', function(e) {
                e.stopPropagation();
                return true;
            });
            
            // paste 이벤트 허용
            field.addEventListener('paste', function(e) {
                e.stopPropagation();
                return true;
            });
            
            // cut 이벤트 허용
            field.addEventListener('cut', function(e) {
                e.stopPropagation();
                return true;
            });
        }
    });

    if (searchInput) {
        searchInput.addEventListener('input', filterBookmarks);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterBookmarks);
    }

    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllBookmarks);
    }

    // 내보내기/가져오기 버튼
    const exportBtn = document.getElementById('export-bookmarks-btn');
    const importInput = document.getElementById('import-bookmarks-input');
    const importBtn = document.getElementById('import-bookmarks-btn');

    if (exportBtn) {
        exportBtn.addEventListener('click', exportBookmarks);
    }

    if (importBtn && importInput) {
        importBtn.addEventListener('click', () => importInput.click());
        importInput.addEventListener('change', importBookmarks);
    }

    // 전역 함수 등록 (HTML에서 사용하기 위해)
    window.deleteBookmark = deleteBookmark;
    window.editBookmark = editBookmark;
    window.incrementClickCount = incrementClickCount;

    // 데이터 로드 및 초기 렌더링
    loadBookmarks();
    renderBookmarks();
}

// 북마크 매니저 카드 정리
export function cleanupBookmarkManagerCard() {
    // 전역 함수 제거
    delete window.deleteBookmark;
    delete window.editBookmark;
    delete window.incrementClickCount;
}