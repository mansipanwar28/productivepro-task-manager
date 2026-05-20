
        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const taskInput = document.getElementById('task-input');
            const addBtn = document.getElementById('add-btn');
            const taskList = document.getElementById('task-list');
            const emptyState = document.getElementById('empty-state');
            const filterBtns = document.querySelectorAll('.filter-btn');
            const clearAllBtn = document.getElementById('clear-all');
            const totalTasksEl = document.getElementById('total-tasks');
            const completedTasksEl = document.getElementById('completed-tasks');
            
            // State variables
            let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            let currentFilter = 'all';
            
            // Initialize the app
            function init() {
                renderTasks();
                updateStats();
                
                // Event listeners
                addBtn.addEventListener('click', addTask);
                taskInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') addTask();
                });
                
                filterBtns.forEach(btn => {
                    btn.addEventListener('click', function() {
                        setFilter(this.dataset.filter);
                    });
                });
                
                clearAllBtn.addEventListener('click', clearCompletedTasks);
            }
            
            // Add a new task
            function addTask() {
                const text = taskInput.value.trim();
                if (text === '') return;
                
                const newTask = {
                    id: Date.now(),
                    text: text,
                    completed: false,
                    timestamp: new Date().toISOString()
                };
                
                tasks.push(newTask);
                saveTasks();
                renderTasks();
                updateStats();
                
                taskInput.value = '';
                taskInput.focus();
            }
            
            // Render tasks based on current filter
            function renderTasks() {
                // Filter tasks based on current selection
                let filteredTasks = tasks;
                if (currentFilter === 'active') {
                    filteredTasks = tasks.filter(task => !task.completed);
                } else if (currentFilter === 'completed') {
                    filteredTasks = tasks.filter(task => task.completed);
                }
                
                // Show empty state if no tasks
                if (filteredTasks.length === 0) {
                    emptyState.style.display = 'block';
                } else {
                    emptyState.style.display = 'none';
                }
                
                // Generate task list HTML
                taskList.innerHTML = '';
                filteredTasks.forEach(task => {
                    const taskItem = document.createElement('li');
                    taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
                    taskItem.dataset.id = task.id;
                    
                    taskItem.innerHTML = `
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                        <span class="task-text">${task.text}</span>
                        <div class="task-actions">
                            <button class="edit-btn"><i class="fas fa-edit"></i></button>
                            <button class="delete-btn"><i class="fas fa-trash"></i></button>
                        </div>
                    `;
                    
                    taskList.appendChild(taskItem);
                });
                
                // Add event listeners to new elements
                document.querySelectorAll('.task-checkbox').forEach(checkbox => {
                    checkbox.addEventListener('change', toggleTask);
                });
                
                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', deleteTask);
                });
                
                document.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.addEventListener('click', editTask);
                });
            }
            
            // Toggle task completion status
            function toggleTask(e) {
                const taskId = parseInt(e.target.closest('.task-item').dataset.id);
                tasks = tasks.map(task => {
                    if (task.id === taskId) {
                        return {...task, completed: !task.completed};
                    }
                    return task;
                });
                
                saveTasks();
                renderTasks();
                updateStats();
            }
            
            // Delete a task
            function deleteTask(e) {
                const taskId = parseInt(e.target.closest('.task-item').dataset.id);
                tasks = tasks.filter(task => task.id !== taskId);
                
                saveTasks();
                renderTasks();
                updateStats();
            }
            
            // Edit a task
            function editTask(e) {
                const taskItem = e.target.closest('.task-item');
                const taskId = parseInt(taskItem.dataset.id);
                const task = tasks.find(t => t.id === taskId);
                const taskText = taskItem.querySelector('.task-text');
                
                const editInput = document.createElement('input');
                editInput.type = 'text';
                editInput.className = 'edit-input';
                editInput.value = task.text;
                
                taskItem.replaceChild(editInput, taskText);
                editInput.focus();
                
                function saveEdit() {
                    task.text = editInput.value.trim();
                    if (task.text === '') {
                        tasks = tasks.filter(t => t.id !== taskId);
                    }
                    
                    saveTasks();
                    renderTasks();
                    updateStats();
                }
                
                editInput.addEventListener('blur', saveEdit);
                editInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        saveEdit();
                    }
                });
            }
            
            // Set current filter
            function setFilter(filter) {
                currentFilter = filter;
                
                // Update UI
                filterBtns.forEach(btn => {
                    if (btn.dataset.filter === filter) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
                
                renderTasks();
            }
            
            // Clear completed tasks
            function clearCompletedTasks() {
                tasks = tasks.filter(task => !task.completed);
                saveTasks();
                renderTasks();
                updateStats();
            }
            
            // Update task statistics
            function updateStats() {
                const total = tasks.length;
                const completed = tasks.filter(task => task.completed).length;
                
                totalTasksEl.textContent = `Total: ${total} task${total !== 1 ? 's' : ''}`;
                completedTasksEl.textContent = `Completed: ${completed}`;
            }
            
            // Save tasks to localStorage
            function saveTasks() {
                localStorage.setItem('tasks', JSON.stringify(tasks));
            }
            
            // Initialize the application
            init();
        });