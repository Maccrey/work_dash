// 스킬 매트릭스 카드 모듈
import { saveData, loadData, generateId } from '../core/utils.js';

let skillNameInput, skillCategorySelect, skillLevelSelect, addSkillBtn, skillsMatrix;
let skills = [];

function renderSkillsMatrix() {
    if (!skillsMatrix) return;
    
    // 카테고리별로 그룹핑
    const skillsByCategory = skills.reduce((groups, skill) => {
        if (!groups[skill.category]) groups[skill.category] = [];
        groups[skill.category].push(skill);
        return groups;
    }, {});

    skillsMatrix.innerHTML = '';
    
    Object.entries(skillsByCategory).forEach(([category, categorySkills]) => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'skill-category';
        
        // 레벨순으로 정렬 (높은 레벨부터)
        const sortedSkills = categorySkills.sort((a, b) => b.level - a.level);
        
        let categoryHTML = `
            <h4 class="category-title">${getCategoryLabel(category)}</h4>
            <div class="category-skills">
        `;
        
        sortedSkills.forEach(skill => {
            categoryHTML += `
                <div class="skill-item level-${skill.level}">
                    <div class="skill-info">
                        <span class="skill-name">${skill.name}</span>
                        <div class="skill-level">
                            ${generateStars(skill.level)}
                            <span class="level-text">Level ${skill.level}</span>
                        </div>
                    </div>
                    <button class="delete-skill-btn" data-id="${skill.id}">삭제</button>
                </div>
            `;
        });
        
        categoryHTML += '</div>';
        categoryElement.innerHTML = categoryHTML;
        skillsMatrix.appendChild(categoryElement);
    });
    
    // 통계 표시
    renderSkillStats();
}

function getCategoryLabel(category) {
    const labels = {
        technical: '🛠️ 기술',
        communication: '💬 소통',
        leadership: '👑 리더십',
        project: '📊 프로젝트 관리',
        language: '🌐 언어'
    };
    return labels[category] || category;
}

function generateStars(level) {
    return '★'.repeat(level) + '☆'.repeat(5 - level);
}

function renderSkillStats() {
    const statsElement = document.createElement('div');
    statsElement.className = 'skill-stats';
    
    const totalSkills = skills.length;
    const avgLevel = skills.length > 0 ? 
        (skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length).toFixed(1) : 0;
    const expertSkills = skills.filter(skill => skill.level >= 4).length;
    
    statsElement.innerHTML = `
        <h4>스킬 통계</h4>
        <div class="stats-grid">
            <div class="stat-item">
                <span class="stat-label">총 스킬:</span>
                <span class="stat-value">${totalSkills}개</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">평균 레벨:</span>
                <span class="stat-value">${avgLevel}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">전문 스킬:</span>
                <span class="stat-value">${expertSkills}개</span>
            </div>
        </div>
    `;
    
    skillsMatrix.insertBefore(statsElement, skillsMatrix.firstChild);
}

function addSkill() {
    const name = skillNameInput.value.trim();
    const category = skillCategorySelect.value;
    const level = parseInt(skillLevelSelect.value);

    if (!name) {
        alert('스킬명을 입력해주세요.');
        return;
    }

    // 동일한 스킬이 이미 있는지 확인
    if (skills.find(skill => skill.name.toLowerCase() === name.toLowerCase())) {
        alert('이미 등록된 스킬입니다.');
        return;
    }

    const newSkill = {
        id: generateId(),
        name, category, level,
        createdAt: new Date().toISOString()
    };

    skills.push(newSkill);
    saveData('skills', skills);
    renderSkillsMatrix();

    skillNameInput.value = '';
    skillCategorySelect.value = 'technical';
    skillLevelSelect.value = '3';
}

function deleteSkill(skillId) {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return;

    if (confirm(`"${skill.name}" 스킬을 삭제하시겠습니까?`)) {
        skills = skills.filter(s => s.id !== skillId);
        saveData('skills', skills);
        renderSkillsMatrix();
    }
}

function handleAddSkill(e) {
    e.preventDefault();
    addSkill();
}

function handleDeleteSkill(e) {
    if (e.target.classList.contains('delete-skill-btn')) {
        deleteSkill(e.target.dataset.id);
    }
}

export function initSkillMatrixCard() {
    skillNameInput = document.getElementById('skill-name');
    skillCategorySelect = document.getElementById('skill-category');
    skillLevelSelect = document.getElementById('skill-level');
    addSkillBtn = document.getElementById('add-skill-btn');
    skillsMatrix = document.getElementById('skills-matrix');

    if (!skillNameInput || !addSkillBtn) return;

    skills = loadData('skills') || [];
    addSkillBtn.addEventListener('click', handleAddSkill);
    if (skillsMatrix) skillsMatrix.addEventListener('click', handleDeleteSkill);
    renderSkillsMatrix();
}

export function cleanupSkillMatrixCard() {
    if (addSkillBtn) addSkillBtn.removeEventListener('click', handleAddSkill);
    if (skillsMatrix) skillsMatrix.removeEventListener('click', handleDeleteSkill);
}

export { renderSkillsMatrix, addSkill, deleteSkill };