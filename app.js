// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// App State
let currentDate = new Date();
let selectedDate = new Date();
let todos = JSON.parse(localStorage.getItem('todos')) || {};

// DOM Elements
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const currentMonthEl = document.getElementById('currentMonth');
const calendarDaysEl = document.getElementById('calendar-days');
const selectedDateEl = document.getElementById('selectedDate');
const todoInput = document.getElementById('todoInput');
const addTodoBtn = document.getElementById('addTodo');
const todoList = document.getElementById('todoList');

// Calendar Functions
function updateCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    currentMonthEl.textContent = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    let calendarHTML = '';
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
        calendarHTML += '<div class="calendar-day"></div>';
    }
    
    // Add the days of the month
    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, month, day);
        const dateString = date.toISOString().split('T')[0];
        const isSelected = date.toDateString() === selectedDate.toDateString();
        const isToday = date.toDateString() === new Date().toDateString();
        const hasTodos = todos[dateString] && todos[dateString].length > 0;
        
        calendarHTML += `
            <div class="calendar-day${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}"
                 data-date="${dateString}"
                 onclick="selectDate('${dateString}')">
                ${day}
                ${hasTodos ? '<span class="todo-indicator">•</span>' : ''}
            </div>`;
    }
    
    calendarDaysEl.innerHTML = calendarHTML;
}

function selectDate(dateString) {
    selectedDate = new Date(dateString);
    selectedDateEl.textContent = selectedDate.toLocaleDateString('default', { 
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
    updateCalendar();
    renderTodos();
}

// Todo Functions
function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;
    
    const dateString = selectedDate.toISOString().split('T')[0];
    if (!todos[dateString]) {
        todos[dateString] = [];
    }
    
    todos[dateString].push({
        id: Date.now(),
        text,
        completed: false
    });
    
    saveTodos();
    todoInput.value = '';
    updateCalendar();
    renderTodos();
}

function toggleTodo(dateString, id) {
    const todo = todos[dateString].find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

function deleteTodo(dateString, id) {
    todos[dateString] = todos[dateString].filter(t => t.id !== id);
    if (todos[dateString].length === 0) {
        delete todos[dateString];
    }
    saveTodos();
    updateCalendar();
    renderTodos();
}

function renderTodos() {
    const dateString = selectedDate.toISOString().split('T')[0];
    const dayTodos = todos[dateString] || [];
    
    todoList.innerHTML = dayTodos.map(todo => `
        <li class="todo-item${todo.completed ? ' completed' : ''}">
            <input type="checkbox" 
                   ${todo.completed ? 'checked' : ''} 
                   onchange="toggleTodo('${dateString}', ${todo.id})">
            <span>${todo.text}</span>
            <button class="delete-btn" onclick="deleteTodo('${dateString}', ${todo.id})">×</button>
        </li>
    `).join('');
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Event Listeners
prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
});

addTodoBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// Initialize
updateCalendar();
selectDate(new Date().toISOString().split('T')[0]);