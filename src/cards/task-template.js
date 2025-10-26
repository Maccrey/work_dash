// 업무 템플릿 카드 모듈
import { saveData, loadData, generateId } from '../core/utils.js';

let templateNameInput, templateTasksInput, addTemplateBtn, templatesList;
let templates = [];

function renderTemplates() {
    if (!templatesList) return;
    
    templatesList.innerHTML = '';
    templates.forEach((template) => {
        const templateElement = document.createElement('div');
        templateElement.className = 'template-item';
        templateElement.innerHTML = `
            <div class="template-header">
                <h4>${template.name}</h4>
                <div class="template-actions">
                    <button class="apply-template-btn" data-id="${template.id}">적용</button>
                    <button class="delete-template-btn" data-id="${template.id}">삭제</button>
                </div>
            </div>
            <div class="template-tasks">
                ${template.tasks.map(task => `<div class="task-item">• ${task}</div>`).join('')}
            </div>
        `;
        templatesList.appendChild(templateElement);
    });
}

function addTemplate() {
    const name = templateNameInput.value.trim();
    const tasksText = templateTasksInput.value.trim();

    if (!name || !tasksText) {
        alert('템플릿명과 작업 목록을 입력해주세요.');
        return;
    }

    const tasks = tasksText.split('\n').map(task => task.trim()).filter(task => task);
    
    if (tasks.length === 0) {
        alert('최소 하나 이상의 작업을 입력해주세요.');
        return;
    }

    const newTemplate = {
        id: generateId(),
        name,
        tasks,
        createdAt: new Date().toISOString()
    };

    templates.push(newTemplate);
    saveData('templates', templates);
    renderTemplates();

    templateNameInput.value = '';
    templateTasksInput.value = '';
}

function applyTemplate(templateId) {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    // 할 일 목록에 템플릿 작업들 추가
    if (confirm(`"${template.name}" 템플릿의 ${template.tasks.length}개 작업을 할 일 목록에 추가하시겠습니까?`)) {
        const todos = loadData('todos') || [];
        const today = new Date().toISOString().split('T')[0];
        
        template.tasks.forEach(taskText => {
            const newTodo = {
                id: generateId(),
                text: taskText,
                time: '',
                priority: 'medium',
                completed: false,
                date: today,
                createdAt: new Date().toISOString()
            };
            todos.push(newTodo);
        });
        
        saveData('todos', todos);
        alert(`${template.tasks.length}개의 작업이 할 일 목록에 추가되었습니다.`);
    }
}

function deleteTemplate(templateId) {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    if (confirm(`"${template.name}" 템플릿을 삭제하시겠습니까?`)) {
        templates = templates.filter(t => t.id !== templateId);
        saveData('templates', templates);
        renderTemplates();
    }
}

function handleAddTemplate(e) {
    e.preventDefault();
    addTemplate();
}

function handleTemplateAction(e) {
    if (e.target.classList.contains('apply-template-btn')) {
        applyTemplate(e.target.dataset.id);
    } else if (e.target.classList.contains('delete-template-btn')) {
        deleteTemplate(e.target.dataset.id);
    }
}

export function initTaskTemplateCard() {
    templateNameInput = document.getElementById('template-name');
    templateTasksInput = document.getElementById('template-tasks');
    addTemplateBtn = document.getElementById('add-template-btn');
    templatesList = document.getElementById('templates-list');

    if (!templateNameInput || !addTemplateBtn) return;

    templates = loadData('templates') || [];
    addTemplateBtn.addEventListener('click', handleAddTemplate);
    if (templatesList) templatesList.addEventListener('click', handleTemplateAction);
    renderTemplates();
}

export function cleanupTaskTemplateCard() {
    if (addTemplateBtn) addTemplateBtn.removeEventListener('click', handleAddTemplate);
    if (templatesList) templatesList.removeEventListener('click', handleTemplateAction);
}

export { renderTemplates, addTemplate, applyTemplate, deleteTemplate };