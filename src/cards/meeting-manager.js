// 회의 일정 관리 카드 모듈
import { saveData, loadData, generateId } from '../core/utils.js';

let meetingTitleInput, meetingDatetimeInput, meetingParticipantsInput, meetingAgendaInput;
let addMeetingBtn, meetingsList;
let meetings = [];

function renderMeetings() {
    if (!meetingsList) return;
    
    const sortedMeetings = [...meetings].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    
    meetingsList.innerHTML = '';
    sortedMeetings.forEach((meeting) => {
        const meetingDate = new Date(meeting.datetime);
        const isUpcoming = meetingDate > new Date();
        
        const meetingElement = document.createElement('div');
        meetingElement.className = `meeting-item ${isUpcoming ? 'upcoming' : 'past'}`;
        meetingElement.innerHTML = `
            <div class="meeting-header">
                <h4>${meeting.title}</h4>
                <span class="meeting-time">${meetingDate.toLocaleString('ko-KR')}</span>
            </div>
            <div class="meeting-participants">참석자: ${meeting.participants}</div>
            <div class="meeting-agenda">${meeting.agenda || '안건 없음'}</div>
            <button class="delete-meeting-btn" data-id="${meeting.id}">삭제</button>
        `;
        meetingsList.appendChild(meetingElement);
    });
}

function addMeeting() {
    const title = meetingTitleInput.value.trim();
    const datetime = meetingDatetimeInput.value;
    const participants = meetingParticipantsInput.value.trim();
    const agenda = meetingAgendaInput.value.trim();

    if (!title || !datetime || !participants) {
        alert('회의 제목, 일시, 참석자를 입력해주세요.');
        return;
    }

    const newMeeting = {
        id: generateId(),
        title, datetime, participants, agenda,
        createdAt: new Date().toISOString()
    };

    meetings.push(newMeeting);
    saveData('meetings', meetings);
    renderMeetings();

    meetingTitleInput.value = '';
    meetingDatetimeInput.value = '';
    meetingParticipantsInput.value = '';
    meetingAgendaInput.value = '';
}

function deleteMeeting(meetingId) {
    if (confirm('이 회의를 삭제하시겠습니까?')) {
        meetings = meetings.filter(m => m.id !== meetingId);
        saveData('meetings', meetings);
        renderMeetings();
    }
}

function handleAddMeeting(e) {
    e.preventDefault();
    addMeeting();
}

function handleDeleteMeeting(e) {
    if (e.target.classList.contains('delete-meeting-btn')) {
        deleteMeeting(e.target.dataset.id);
    }
}

export function initMeetingManagerCard() {
    meetingTitleInput = document.getElementById('meeting-title');
    meetingDatetimeInput = document.getElementById('meeting-datetime');
    meetingParticipantsInput = document.getElementById('meeting-participants');
    meetingAgendaInput = document.getElementById('meeting-agenda');
    addMeetingBtn = document.getElementById('add-meeting-btn');
    meetingsList = document.getElementById('meetings-list');

    if (!meetingTitleInput || !addMeetingBtn) return;

    meetings = loadData('meetings') || [];
    addMeetingBtn.addEventListener('click', handleAddMeeting);
    if (meetingsList) meetingsList.addEventListener('click', handleDeleteMeeting);
    renderMeetings();
}

export function cleanupMeetingManagerCard() {
    if (addMeetingBtn) addMeetingBtn.removeEventListener('click', handleAddMeeting);
    if (meetingsList) meetingsList.removeEventListener('click', handleDeleteMeeting);
}

export { renderMeetings, addMeeting, deleteMeeting };