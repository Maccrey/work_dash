// 팀 연락처 카드 모듈
import { saveData, loadData, generateId } from '../core/utils.js';

let contactNameInput, contactPositionInput, contactPhoneInput, contactEmailInput, contactDepartmentInput;
let addContactBtn, contactsList;
let contacts = [];

function renderContacts() {
    if (!contactsList) return;
    
    // 부서별로 그룹핑하여 표시
    const contactsByDepartment = contacts.reduce((groups, contact) => {
        const dept = contact.department || '기타';
        if (!groups[dept]) groups[dept] = [];
        groups[dept].push(contact);
        return groups;
    }, {});

    contactsList.innerHTML = '';
    Object.entries(contactsByDepartment).forEach(([department, deptContacts]) => {
        const departmentElement = document.createElement('div');
        departmentElement.className = 'department-group';
        
        let departmentHTML = `
            <h4 class="department-header">${department}</h4>
            <div class="department-contacts">
        `;
        
        deptContacts.forEach(contact => {
            departmentHTML += `
                <div class="contact-item">
                    <div class="contact-info">
                        <div class="contact-name">${contact.name}</div>
                        <div class="contact-position">${contact.position}</div>
                        <div class="contact-details">
                            <a href="tel:${contact.phone}" class="contact-phone">📞 ${contact.phone}</a>
                            <a href="mailto:${contact.email}" class="contact-email">📧 ${contact.email}</a>
                        </div>
                    </div>
                    <button class="delete-contact-btn" data-id="${contact.id}">삭제</button>
                </div>
            `;
        });
        
        departmentHTML += '</div>';
        departmentElement.innerHTML = departmentHTML;
        contactsList.appendChild(departmentElement);
    });
}

function addContact() {
    const name = contactNameInput.value.trim();
    const position = contactPositionInput.value.trim();
    const phone = contactPhoneInput.value.trim();
    const email = contactEmailInput.value.trim();
    const department = contactDepartmentInput.value.trim();

    if (!name || !position || !phone || !email) {
        alert('이름, 직책, 전화번호, 이메일을 입력해주세요.');
        return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('올바른 이메일 형식을 입력해주세요.');
        return;
    }

    // 전화번호 형식 정리
    const cleanPhone = phone.replace(/[^\d-]/g, '');
    
    const newContact = {
        id: generateId(),
        name, position, 
        phone: cleanPhone, 
        email: email.toLowerCase(), 
        department: department || '기타',
        createdAt: new Date().toISOString()
    };

    contacts.push(newContact);
    saveData('contacts', contacts);
    renderContacts();

    // 폼 리셋
    contactNameInput.value = '';
    contactPositionInput.value = '';
    contactPhoneInput.value = '';
    contactEmailInput.value = '';
    contactDepartmentInput.value = '';
}

function deleteContact(contactId) {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    if (confirm(`${contact.name} 연락처를 삭제하시겠습니까?`)) {
        contacts = contacts.filter(c => c.id !== contactId);
        saveData('contacts', contacts);
        renderContacts();
    }
}

function handleAddContact(e) {
    e.preventDefault();
    addContact();
}

function handleDeleteContact(e) {
    if (e.target.classList.contains('delete-contact-btn')) {
        deleteContact(e.target.dataset.id);
    }
}

export function initTeamContactsCard() {
    contactNameInput = document.getElementById('contact-name');
    contactPositionInput = document.getElementById('contact-position');
    contactPhoneInput = document.getElementById('contact-phone');
    contactEmailInput = document.getElementById('contact-email');
    contactDepartmentInput = document.getElementById('contact-department');
    addContactBtn = document.getElementById('add-contact-btn');
    contactsList = document.getElementById('contacts-list');

    if (!contactNameInput || !addContactBtn) return;

    contacts = loadData('contacts') || [];
    addContactBtn.addEventListener('click', handleAddContact);
    if (contactsList) contactsList.addEventListener('click', handleDeleteContact);
    renderContacts();
}

export function cleanupTeamContactsCard() {
    if (addContactBtn) addContactBtn.removeEventListener('click', handleAddContact);
    if (contactsList) contactsList.removeEventListener('click', handleDeleteContact);
}

export { renderContacts, addContact, deleteContact };