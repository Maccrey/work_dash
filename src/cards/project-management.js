// 프로젝트 관리 카드 모듈
import { saveData, loadData, generateId } from '../core/utils.js';

// DOM 요소들
let projectTitleInput, projectDeadlineInput, projectStatusSelect, projectDescriptionInput;
let addProjectBtn, projectsList;

// 프로젝트 데이터
let projects = [];

// 프로젝트 목록 렌더링
function renderProjects() {
    if (!projectsList) return;

    projectsList.innerHTML = '';
    
    // 상태별로 정렬 (진행 중 > 기획 중 > 검토 중 > 완료)
    const statusOrder = ['in-progress', 'planning', 'review', 'completed'];
    const sortedProjects = [...projects].sort((a, b) => {
        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
    });

    sortedProjects.forEach((project, index) => {
        const projectElement = document.createElement('div');
        projectElement.className = `project-item status-${project.status}`;
        
        const daysRemaining = calculateDaysRemaining(project.deadline);
        const urgencyClass = getUrgencyClass(daysRemaining, project.status);
        
        projectElement.innerHTML = `
            <div class="project-header">
                <h4>${project.title}</h4>
                <span class="project-status ${project.status}">${getStatusLabel(project.status)}</span>
            </div>
            <div class="project-deadline ${urgencyClass}">
                마감: ${formatDeadline(project.deadline)} ${getDaysRemainingText(daysRemaining)}
            </div>
            <div class="project-description">${project.description || '설명 없음'}</div>
            <div class="project-actions">
                <select class="project-status-update" data-id="${project.id}">
                    <option value="planning" ${project.status === 'planning' ? 'selected' : ''}>기획 중</option>
                    <option value="in-progress" ${project.status === 'in-progress' ? 'selected' : ''}>진행 중</option>
                    <option value="review" ${project.status === 'review' ? 'selected' : ''}>검토 중</option>
                    <option value="completed" ${project.status === 'completed' ? 'selected' : ''}>완료</option>
                </select>
                <button class="delete-project-btn" data-id="${project.id}">삭제</button>
            </div>
        `;
        projectsList.appendChild(projectElement);
    });
}

// 상태 라벨 가져오기
function getStatusLabel(status) {
    const labels = {
        'planning': '기획 중',
        'in-progress': '진행 중',
        'review': '검토 중',
        'completed': '완료'
    };
    return labels[status] || status;
}

// 마감일까지 남은 일수 계산
function calculateDaysRemaining(deadline) {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// 긴급도 클래스 가져오기
function getUrgencyClass(daysRemaining, status) {
    if (status === 'completed') return 'completed';
    if (daysRemaining < 0) return 'overdue';
    if (daysRemaining <= 3) return 'urgent';
    if (daysRemaining <= 7) return 'warning';
    return 'normal';
}

// 남은 일수 텍스트
function getDaysRemainingText(daysRemaining) {
    if (daysRemaining < 0) return `(${Math.abs(daysRemaining)}일 지남)`;
    if (daysRemaining === 0) return '(오늘)';
    if (daysRemaining === 1) return '(내일)';
    return `(${daysRemaining}일 남음)`;
}

// 마감일 포맷팅
function formatDeadline(deadline) {
    return new Date(deadline).toLocaleDateString('ko-KR');
}

// 새 프로젝트 추가
function addProject() {
    const title = projectTitleInput.value.trim();
    const deadline = projectDeadlineInput.value;
    const status = projectStatusSelect.value;
    const description = projectDescriptionInput.value.trim();

    if (!title || !deadline) {
        alert('프로젝트명과 마감일을 입력해주세요.');
        return;
    }

    const newProject = {
        id: generateId(),
        title,
        deadline,
        status,
        description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    projects.push(newProject);
    saveData('projects', projects);
    renderProjects();

    // 폼 리셋
    projectTitleInput.value = '';
    projectDeadlineInput.value = '';
    projectStatusSelect.value = 'planning';
    projectDescriptionInput.value = '';
}

// 프로젝트 상태 업데이트
function updateProjectStatus(projectId, newStatus) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        project.status = newStatus;
        project.updatedAt = new Date().toISOString();
        saveData('projects', projects);
        renderProjects();

        // 완료 시 축하 메시지
        if (newStatus === 'completed') {
            alert(`🎉 "${project.title}" 프로젝트가 완료되었습니다!`);
        }
    }
}

// 프로젝트 삭제
function deleteProject(projectId) {
    if (confirm('이 프로젝트를 삭제하시겠습니까?')) {
        projects = projects.filter(p => p.id !== projectId);
        saveData('projects', projects);
        renderProjects();
    }
}

// 프로젝트 추가 버튼 클릭 처리
function handleAddProject(e) {
    e.preventDefault();
    addProject();
}

// 프로젝트 액션 처리
function handleProjectAction(e) {
    if (e.target.classList.contains('project-status-update')) {
        const projectId = e.target.dataset.id;
        const newStatus = e.target.value;
        updateProjectStatus(projectId, newStatus);
    } else if (e.target.classList.contains('delete-project-btn')) {
        const projectId = e.target.dataset.id;
        deleteProject(projectId);
    }
}

// 프로젝트 관리 카드 초기화
export function initProjectManagementCard() {
    projectTitleInput = document.getElementById('project-title');
    projectDeadlineInput = document.getElementById('project-deadline');
    projectStatusSelect = document.getElementById('project-status');
    projectDescriptionInput = document.getElementById('project-description');
    addProjectBtn = document.getElementById('add-project-btn');
    projectsList = document.getElementById('projects-list');

    if (!projectTitleInput || !addProjectBtn) {
        console.error('Project management card elements not found');
        return;
    }

    // 데이터 로드
    projects = loadData('projects') || [];

    // 이벤트 리스너 등록
    addProjectBtn.addEventListener('click', handleAddProject);
    if (projectsList) {
        projectsList.addEventListener('change', handleProjectAction);
        projectsList.addEventListener('click', handleProjectAction);
    }

    // 초기 렌더링
    renderProjects();
}

// 프로젝트 관리 카드 정리
export function cleanupProjectManagementCard() {
    if (addProjectBtn) addProjectBtn.removeEventListener('click', handleAddProject);
    if (projectsList) {
        projectsList.removeEventListener('change', handleProjectAction);
        projectsList.removeEventListener('click', handleProjectAction);
    }
}

export { renderProjects, addProject, updateProjectStatus, deleteProject };