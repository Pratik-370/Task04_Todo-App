const taskInput = document.getElementById('taskInput');
const taskDate = document.getElementById('taskDate');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');

// Initialize date picker
flatpickr(taskDate, {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    minDate: "today",
    time_24hr: true,
    placeholder: "Select date & time"
});

let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// Add new task
function addTask() {
    const taskText = taskInput.value.trim();
    const taskDateTime = taskDate.value.trim();
    
    if (!taskText) {
        alert('Please enter a task!');
        return;
    }
    
    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        date: taskDateTime,
        createdAt: new Date().toISOString()
    };
    
    todos.unshift(newTask);
    saveTodos();
    renderTodos();
    
    // Clear inputs
    taskInput.value = '';
    taskDate.value = '';
    taskInput.focus();
}

// Render todos based on filter
function renderTodos() {
    todoList.innerHTML = '';
    
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });
    
    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<div class="empty-state">No tasks found</div>';
        return;
    }
    
    filteredTodos.forEach(todo => {
        const todoItem = document.createElement('div');
        todoItem.className = 'todo-item';
        todoItem.dataset.id = todo.id;
        
        if (todo.completed) {
            todoItem.classList.add('completed');
        }
        
        // Check if task is overdue
        if (!todo.completed && todo.date) {
            const now = new Date();
            const taskDate = new Date(todo.date);
            
            if (taskDate < now) {
                todoItem.classList.add('overdue');
            }
        }
        
        todoItem.innerHTML = `
            <div class="task-header">
                <div class="task-title ${todo.completed ? 'completed' : ''}">${todo.text}</div>
                <div class="task-actions">
                    <button class="action-btn complete-btn">
                        <i class="fas fa-${todo.completed ? 'undo' : 'check'}"></i>
                    </button>
                    <button class="action-btn edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${todo.date ? `
            <div class="task-details">
                <div class="task-date">
                    <i class="far fa-calendar"></i>
                    ${formatDate(todo.date)}
                </div>
            </div>
            ` : ''}
        `;
        
        // Add animation
        todoItem.style.animation = 'slideIn 0.3s ease forwards';
        todoList.appendChild(todoItem);
        
        // Add event listeners
        const completeBtn = todoItem.querySelector('.complete-btn');
        const editBtn = todoItem.querySelector('.edit-btn');
        const deleteBtn = todoItem.querySelector('.delete-btn');
        const taskTitle = todoItem.querySelector('.task-title');
        
        completeBtn.addEventListener('click', () => toggleComplete(todo.id));
        deleteBtn.addEventListener('click', () => deleteTask(todo.id));
        editBtn.addEventListener('click', () => editTask(todo.id));
        taskTitle.addEventListener('click', () => editTask(todo.id));
    });
}

// Toggle task completion
function toggleComplete(id) {
    todos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodos();
}

// Delete task
function deleteTask(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

// Edit task
function editTask(id) {
    const todo = todos.find(todo => todo.id === id);
    if (!todo) return;
    
    const newText = prompt('Edit your task:', todo.text);
    if (newText !== null && newText.trim() !== '') {
        todo.text = newText.trim();
        saveTodos();
        renderTodos();
    }
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Set filter
function setFilter(filter) {
    currentFilter = filter;
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderTodos();
}

// Event listeners
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keyup', e => {
    if (e.key === 'Enter') addTask();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setFilter(btn.dataset.filter);
    });
});

// Initialize
renderTodos();

// Add CSS for animations
const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .empty-state {
        text-align: center;
        padding: 30px;
        font-size: 1.2rem;
        color: rgba(255, 255, 255, 0.7);
    }
`;
document.head.appendChild(style);