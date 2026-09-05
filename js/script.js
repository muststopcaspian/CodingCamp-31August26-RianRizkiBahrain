// ============================================
// To-Do List Life Dashboard
// Main JavaScript File
// ============================================

// ============================================
// Global State Management
// ============================================

const appState = {
    tasks: [],
    quickLinks: [],
    settings: {
        userName: 'User',
        theme: 'light',
        pomodoroTime: 25,
        apiKey: '',
        profilePic: '' // Base64 encoded image
    },
    timer: {
        isRunning: false,
        isPaused: false,
        timeLeft: 1500, // 25 minutes in seconds
        interval: null
    },
    editingTaskId: null,
    editingLinkId: null
};

// ============================================
// Local Storage Handler
// ============================================

const StorageHandler = {
    // Storage Keys
    KEYS: {
        TASKS: 'todoapp_tasks',
        LINKS: 'todoapp_quicklinks',
        SETTINGS: 'todoapp_settings'
    },

    // Save tasks to local storage
    saveTasks(tasks) {
        try {
            localStorage.setItem(this.KEYS.TASKS, JSON.stringify(tasks));
            return true;
        } catch (error) {
            console.error('Error saving tasks:', error);
            showToast('Failed to save tasks', 'error');
            return false;
        }
    },

    // Load tasks from local storage
    loadTasks() {
        try {
            const tasksJSON = localStorage.getItem(this.KEYS.TASKS);
            if (tasksJSON) {
                return JSON.parse(tasksJSON);
            }
            return [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    },

    // Save quick links to local storage
    saveLinks(links) {
        try {
            localStorage.setItem(this.KEYS.LINKS, JSON.stringify(links));
            return true;
        } catch (error) {
            console.error('Error saving links:', error);
            showToast('Failed to save links', 'error');
            return false;
        }
    },

    // Load quick links from local storage
    loadLinks() {
        try {
            const linksJSON = localStorage.getItem(this.KEYS.LINKS);
            if (linksJSON) {
                return JSON.parse(linksJSON);
            }
            return [];
        } catch (error) {
            console.error('Error loading links:', error);
            return [];
        }
    },

    // Save settings to local storage
    saveSettings(settings) {
        try {
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            showToast('Failed to save settings', 'error');
            return false;
        }
    },

    // Load settings from local storage
    loadSettings() {
        try {
            const settingsJSON = localStorage.getItem(this.KEYS.SETTINGS);
            if (settingsJSON) {
                return JSON.parse(settingsJSON);
            }
            return {
                userName: 'User',
                theme: 'light',
                pomodoroTime: 25,
                apiKey: '',
                profilePic: ''
            };
        } catch (error) {
            console.error('Error loading settings:', error);
            return {
                userName: 'User',
                theme: 'light',
                pomodoroTime: 25,
                apiKey: '',
                profilePic: ''
            };
        }
    },

    // Clear all data (for testing or reset)
    clearAll() {
        try {
            localStorage.removeItem(this.KEYS.TASKS);
            localStorage.removeItem(this.KEYS.LINKS);
            localStorage.removeItem(this.KEYS.SETTINGS);
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }
};

// ============================================
// Utility Functions
// ============================================

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format time for display (seconds to MM:SS)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Get current date and time information
function getDateTimeInfo() {
    const now = new Date();
    const hours = now.getHours();
    
    // Determine greeting based on time
    let greeting = 'Good Evening';
    if (hours >= 5 && hours < 12) {
        greeting = 'Good Morning';
    } else if (hours >= 12 && hours < 18) {
        greeting = 'Good Afternoon';
    }
    
    // Format date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('en-US', options);
    
    // Format time
    const timeString = now.toLocaleTimeString('en-US', { hour12: false });
    
    return {
        greeting,
        date: dateString,
        time: timeString,
        hours
    };
}

// Validate URL format
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// ============================================
// Task Management Functions
// ============================================

// Add a new task
function addTask(text, priority = 'medium') {
    // Validate input
    if (!text || text.trim() === '') {
        showToast('Please enter a task description', 'error');
        return false;
    }

    // Check for duplicates
    const trimmedText = text.trim();
    const isDuplicate = appState.tasks.some(
        task => task.text.toLowerCase() === trimmedText.toLowerCase() && !task.completed
    );

    if (isDuplicate) {
        showToast('This task already exists!', 'warning');
        return false;
    }

    // Create new task
    const newTask = {
        id: generateId(),
        text: trimmedText,
        priority: priority,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
    };

    appState.tasks.push(newTask);
    StorageHandler.saveTasks(appState.tasks);
    renderTasks();
    updateTaskStats();
    showToast('Task added successfully!', 'success');
    
    return true;
}

// Edit a task
function editTask(taskId, newText, newPriority) {
    const task = appState.tasks.find(t => t.id === taskId);
    if (!task) {
        showToast('Task not found', 'error');
        return false;
    }

    // Validate input
    if (!newText || newText.trim() === '') {
        showToast('Please enter a task description', 'error');
        return false;
    }

    // Check for duplicates (excluding current task)
    const trimmedText = newText.trim();
    const isDuplicate = appState.tasks.some(
        t => t.id !== taskId && 
        t.text.toLowerCase() === trimmedText.toLowerCase() && 
        !t.completed
    );

    if (isDuplicate) {
        showToast('This task already exists!', 'warning');
        return false;
    }

    task.text = trimmedText;
    task.priority = newPriority;
    StorageHandler.saveTasks(appState.tasks);
    renderTasks();
    showToast('Task updated successfully!', 'success');
    
    return true;
}

// Toggle task completion
function toggleTask(taskId) {
    const task = appState.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;
    
    StorageHandler.saveTasks(appState.tasks);
    renderTasks();
    updateTaskStats();
    
    const message = task.completed ? 'Task completed! 🎉' : 'Task reopened';
    showToast(message, task.completed ? 'success' : 'warning');
}

// Delete a task
function deleteTask(taskId) {
    const taskIndex = appState.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    appState.tasks.splice(taskIndex, 1);
    StorageHandler.saveTasks(appState.tasks);
    renderTasks();
    updateTaskStats();
    showToast('Task deleted', 'success');
}

// Clear completed tasks
function clearCompletedTasks() {
    const completedCount = appState.tasks.filter(t => t.completed).length;
    if (completedCount === 0) {
        showToast('No completed tasks to clear', 'warning');
        return;
    }

    appState.tasks = appState.tasks.filter(t => !t.completed);
    StorageHandler.saveTasks(appState.tasks);
    renderTasks();
    updateTaskStats();
    showToast(`Cleared ${completedCount} completed task(s)`, 'success');
}

// Sort tasks
function sortTasks(sortBy = 'default') {
    switch (sortBy) {
        case 'priority':
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            appState.tasks.sort((a, b) => {
                if (a.completed !== b.completed) {
                    return a.completed ? 1 : -1;
                }
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            });
            break;
        case 'date':
            appState.tasks.sort((a, b) => {
                if (a.completed !== b.completed) {
                    return a.completed ? 1 : -1;
                }
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            break;
        case 'status':
            appState.tasks.sort((a, b) => a.completed - b.completed);
            break;
        case 'default':
        default:
            // Sort by creation date (newest first) but keep completed at bottom
            appState.tasks.sort((a, b) => {
                if (a.completed !== b.completed) {
                    return a.completed ? 1 : -1;
                }
                return new Date(a.createdAt) - new Date(b.createdAt);
            });
            break;
    }
    renderTasks();
}

// Update task statistics
function updateTaskStats() {
    const total = appState.tasks.length;
    const completed = appState.tasks.filter(t => t.completed).length;
    const active = total - completed;

    document.getElementById('totalTasks').textContent = total;
    document.getElementById('activeTasks').textContent = active;
    document.getElementById('completedTasks').textContent = completed;
}

// ============================================
// Quick Links Management Functions
// ============================================

// Add a new quick link
function addQuickLink(name, url) {
    // Validate input
    if (!name || name.trim() === '') {
        showToast('Please enter a link name', 'error');
        return false;
    }

    if (!url || !isValidUrl(url)) {
        showToast('Please enter a valid URL', 'error');
        return false;
    }

    // Check for duplicates
    const isDuplicate = appState.quickLinks.some(
        link => link.url.toLowerCase() === url.toLowerCase()
    );

    if (isDuplicate) {
        showToast('This link already exists!', 'warning');
        return false;
    }

    const newLink = {
        id: generateId(),
        name: name.trim(),
        url: url.trim()
    };

    appState.quickLinks.push(newLink);
    StorageHandler.saveLinks(appState.quickLinks);
    renderQuickLinks();
    showToast('Link added successfully!', 'success');
    
    return true;
}

// Edit a quick link
function editQuickLink(linkId, newName, newUrl) {
    const link = appState.quickLinks.find(l => l.id === linkId);
    if (!link) {
        showToast('Link not found', 'error');
        return false;
    }

    // Validate input
    if (!newName || newName.trim() === '') {
        showToast('Please enter a link name', 'error');
        return false;
    }

    if (!newUrl || !isValidUrl(newUrl)) {
        showToast('Please enter a valid URL', 'error');
        return false;
    }

    // Check for duplicates (excluding current link)
    const isDuplicate = appState.quickLinks.some(
        l => l.id !== linkId && l.url.toLowerCase() === newUrl.toLowerCase()
    );

    if (isDuplicate) {
        showToast('This link already exists!', 'warning');
        return false;
    }

    link.name = newName.trim();
    link.url = newUrl.trim();
    StorageHandler.saveLinks(appState.quickLinks);
    renderQuickLinks();
    showToast('Link updated successfully!', 'success');
    
    return true;
}

// Delete a quick link
function deleteQuickLink(linkId) {
    const linkIndex = appState.quickLinks.findIndex(l => l.id === linkId);
    if (linkIndex === -1) return;

    appState.quickLinks.splice(linkIndex, 1);
    StorageHandler.saveLinks(appState.quickLinks);
    renderQuickLinks();
    showToast('Link deleted', 'success');
}

// ============================================
// Settings Management Functions
// ============================================

// Update settings
function updateSettings(newSettings) {
    appState.settings = { ...appState.settings, ...newSettings };
    StorageHandler.saveSettings(appState.settings);
    applySettings();
    showToast('Settings saved successfully!', 'success');
}

// Apply settings to UI
function applySettings() {
    // Apply theme
    document.documentElement.setAttribute('data-theme', appState.settings.theme);
    
    // Update theme icon
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.textContent = appState.settings.theme === 'dark' ? '☀️' : '🌙';
    }
    
    // Update user name display
    const userNameDisplay = document.getElementById('userName');
    if (userNameDisplay) {
        userNameDisplay.textContent = appState.settings.userName;
    }
    
    // Update profile picture display
    updateProfilePicDisplay();
    
    // Update timer with new pomodoro time
    if (!appState.timer.isRunning) {
        appState.timer.timeLeft = appState.settings.pomodoroTime * 60;
        updateTimerDisplay();
    }
}

// Toggle theme
function toggleTheme() {
    const newTheme = appState.settings.theme === 'light' ? 'dark' : 'light';
    updateSettings({ theme: newTheme });
}

// ============================================
// Quick Links UI Render Functions
// ============================================

// Render all quick links
function renderQuickLinks() {
    const quicklinksList = document.getElementById('quicklinksList');
    if (!quicklinksList) return;

    // Clear current list
    quicklinksList.innerHTML = '';

    // Check if there are links
    if (appState.quickLinks.length === 0) {
        quicklinksList.innerHTML = '<p class="empty-state">No quick links yet. Add your favorites!</p>';
        return;
    }

    // Render each link
    appState.quickLinks.forEach(link => {
        const linkElement = createQuickLinkElement(link);
        quicklinksList.appendChild(linkElement);
    });
}

// Create quick link element
function createQuickLinkElement(link) {
    const linkItem = document.createElement('div');
    linkItem.className = 'quicklink-item';

    linkItem.innerHTML = `
        <div class="quicklink-name">${escapeHtml(link.name)}</div>
        <div class="quicklink-actions">
            <button class="btn btn-small btn-primary open-link-btn" data-link-id="${link.id}">
                Open
            </button>
            <button class="btn btn-small btn-secondary edit-link-btn" data-link-id="${link.id}">
                Edit
            </button>
            <button class="btn btn-small btn-danger-outline delete-link-btn" data-link-id="${link.id}">
                Delete
            </button>
        </div>
    `;

    // Add event listeners
    const openBtn = linkItem.querySelector('.open-link-btn');
    openBtn.addEventListener('click', () => openQuickLink(link.id));

    const editBtn = linkItem.querySelector('.edit-link-btn');
    editBtn.addEventListener('click', () => openEditLinkModal(link.id));

    const deleteBtn = linkItem.querySelector('.delete-link-btn');
    deleteBtn.addEventListener('click', () => confirmDeleteLink(link.id));

    return linkItem;
}

// Open quick link in new tab
function openQuickLink(linkId) {
    const link = appState.quickLinks.find(l => l.id === linkId);
    if (!link) return;

    window.open(link.url, '_blank', 'noopener,noreferrer');
    showToast(`Opening ${link.name}...`, 'success');
}

// Open add link modal
function openAddLinkModal() {
    appState.editingLinkId = null;

    const modal = document.getElementById('linkModal');
    const modalTitle = document.getElementById('linkModalTitle');
    const linkName = document.getElementById('linkName');
    const linkUrl = document.getElementById('linkUrl');

    if (modal && modalTitle && linkName && linkUrl) {
        modalTitle.textContent = '🔗 Add Quick Link';
        linkName.value = '';
        linkUrl.value = 'https://';
        modal.classList.remove('hidden');
        linkName.focus();
    }
}

// Open edit link modal
function openEditLinkModal(linkId) {
    const link = appState.quickLinks.find(l => l.id === linkId);
    if (!link) return;

    appState.editingLinkId = linkId;

    const modal = document.getElementById('linkModal');
    const modalTitle = document.getElementById('linkModalTitle');
    const linkName = document.getElementById('linkName');
    const linkUrl = document.getElementById('linkUrl');

    if (modal && modalTitle && linkName && linkUrl) {
        modalTitle.textContent = '✏️ Edit Quick Link';
        linkName.value = link.name;
        linkUrl.value = link.url;
        modal.classList.remove('hidden');
        linkName.focus();
    }
}

// Close link modal
function closeLinkModal() {
    const modal = document.getElementById('linkModal');
    if (modal) {
        modal.classList.add('hidden');
        appState.editingLinkId = null;
    }
}

// Save link (add or edit)
function saveLink() {
    const linkName = document.getElementById('linkName');
    const linkUrl = document.getElementById('linkUrl');

    if (!linkName || !linkUrl) return;

    const name = linkName.value.trim();
    const url = linkUrl.value.trim();

    let success = false;

    if (appState.editingLinkId) {
        // Edit existing link
        success = editQuickLink(appState.editingLinkId, name, url);
    } else {
        // Add new link
        success = addQuickLink(name, url);
    }

    if (success) {
        closeLinkModal();
    }
}

// Confirm delete link
function confirmDeleteLink(linkId) {
    const link = appState.quickLinks.find(l => l.id === linkId);
    if (!link) return;

    if (confirm(`Are you sure you want to delete this link?\n\n"${link.name}"`)) {
        deleteQuickLink(linkId);
    }
}

// ============================================
// To-Do List UI Render Functions
// ============================================

// Render all tasks
function renderTasks() {
    const tasksList = document.getElementById('tasksList');
    if (!tasksList) return;

    // Clear current list
    tasksList.innerHTML = '';

    // Check if there are tasks
    if (appState.tasks.length === 0) {
        tasksList.innerHTML = '<p class="empty-state">No tasks yet. Add one to get started!</p>';
        return;
    }

    // Render each task
    appState.tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        tasksList.appendChild(taskElement);
    });
}

// Create task element
function createTaskElement(task) {
    const taskItem = document.createElement('div');
    taskItem.className = `task-item priority-${task.priority}`;
    if (task.completed) {
        taskItem.classList.add('completed');
    }

    // Format date
    const createdDate = new Date(task.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    taskItem.innerHTML = `
        <input 
            type="checkbox" 
            class="task-checkbox" 
            ${task.completed ? 'checked' : ''}
            data-task-id="${task.id}"
        >
        <div class="task-content">
            <div class="task-text">${escapeHtml(task.text)}</div>
            <div class="task-meta">
                <span class="priority-badge">${task.priority.toUpperCase()}</span> • 
                <span>${createdDate}</span>
            </div>
        </div>
        <div class="task-actions">
            <button class="btn btn-small btn-secondary edit-task-btn" data-task-id="${task.id}">
                Edit
            </button>
            <button class="btn btn-small btn-danger-outline delete-task-btn" data-task-id="${task.id}">
                Delete
            </button>
        </div>
    `;

    // Add event listeners
    const checkbox = taskItem.querySelector('.task-checkbox');
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const editBtn = taskItem.querySelector('.edit-task-btn');
    editBtn.addEventListener('click', () => openEditTaskModal(task.id));

    const deleteBtn = taskItem.querySelector('.delete-task-btn');
    deleteBtn.addEventListener('click', () => confirmDeleteTask(task.id));

    return taskItem;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Open edit task modal
function openEditTaskModal(taskId) {
    const task = appState.tasks.find(t => t.id === taskId);
    if (!task) return;

    appState.editingTaskId = taskId;

    const modal = document.getElementById('editTaskModal');
    const editTaskInput = document.getElementById('editTaskInput');
    const editTaskPriority = document.getElementById('editTaskPriority');

    if (modal && editTaskInput && editTaskPriority) {
        editTaskInput.value = task.text;
        editTaskPriority.value = task.priority;
        modal.classList.remove('hidden');
        editTaskInput.focus();
    }
}

// Close edit task modal
function closeEditTaskModal() {
    const modal = document.getElementById('editTaskModal');
    if (modal) {
        modal.classList.add('hidden');
        appState.editingTaskId = null;
    }
}

// Save edited task
function saveEditedTask() {
    if (!appState.editingTaskId) return;

    const editTaskInput = document.getElementById('editTaskInput');
    const editTaskPriority = document.getElementById('editTaskPriority');

    if (editTaskInput && editTaskPriority) {
        const newText = editTaskInput.value.trim();
        const newPriority = editTaskPriority.value;

        if (editTask(appState.editingTaskId, newText, newPriority)) {
            closeEditTaskModal();
        }
    }
}

// Confirm delete task
function confirmDeleteTask(taskId) {
    const task = appState.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (confirm(`Are you sure you want to delete this task?\n\n"${task.text}"`)) {
        deleteTask(taskId);
    }
}

// Handle add task from form
function handleAddTask() {
    const taskInput = document.getElementById('taskInput');
    const taskPriority = document.getElementById('taskPriority');

    if (taskInput && taskPriority) {
        const text = taskInput.value.trim();
        const priority = taskPriority.value;

        if (addTask(text, priority)) {
            // Clear input
            taskInput.value = '';
            taskPriority.value = 'medium';
            taskInput.focus();
        }
    }
}

// Handle sort tasks
function handleSortTasks() {
    const sortSelect = document.getElementById('sortTasks');
    if (sortSelect) {
        sortTasks(sortSelect.value);
    }
}

// ============================================
// Focus Timer (Pomodoro) Functions
// ============================================

// Update timer display
function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
        timerDisplay.textContent = formatTime(appState.timer.timeLeft);
    }
}

// Update timer status message
function updateTimerStatus(message) {
    const timerStatus = document.getElementById('timerStatus');
    if (timerStatus) {
        timerStatus.textContent = message;
    }
}

// Start timer
function startTimer() {
    if (appState.timer.isRunning) return;

    appState.timer.isRunning = true;
    appState.timer.isPaused = false;
    
    // Update UI
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('resetBtn').disabled = false;
    updateTimerStatus('Focus time! Stay concentrated 🎯');

    // Start countdown
    appState.timer.interval = setInterval(() => {
        if (appState.timer.timeLeft > 0) {
            appState.timer.timeLeft--;
            updateTimerDisplay();
        } else {
            // Timer finished
            timerComplete();
        }
    }, 1000);

    showToast('Timer started! Focus mode activated 🎯', 'success');
}

// Pause timer
function pauseTimer() {
    if (!appState.timer.isRunning) return;

    appState.timer.isRunning = false;
    appState.timer.isPaused = true;
    
    // Clear interval
    if (appState.timer.interval) {
        clearInterval(appState.timer.interval);
        appState.timer.interval = null;
    }
    
    // Update UI
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('startBtn').textContent = 'Resume';
    updateTimerStatus('Timer paused. Take a breath ⏸️');

    showToast('Timer paused', 'warning');
}

// Reset timer
function resetTimer() {
    // Clear interval if running
    if (appState.timer.interval) {
        clearInterval(appState.timer.interval);
        appState.timer.interval = null;
    }
    
    // Reset state
    appState.timer.isRunning = false;
    appState.timer.isPaused = false;
    appState.timer.timeLeft = appState.settings.pomodoroTime * 60;
    
    // Update UI
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('startBtn').textContent = 'Start';
    updateTimerDisplay();
    updateTimerStatus('Ready to focus!');

    showToast('Timer reset', 'success');
}

// Timer complete
function timerComplete() {
    // Clear interval
    if (appState.timer.interval) {
        clearInterval(appState.timer.interval);
        appState.timer.interval = null;
    }
    
    // Reset state
    appState.timer.isRunning = false;
    appState.timer.isPaused = false;
    
    // Update UI
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('startBtn').textContent = 'Start';
    updateTimerStatus('🎉 Great job! Time for a break!');

    // Show notification
    showToast('🎉 Focus session complete! Great work!', 'success');
    
    // Try to show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Focus Timer Complete!', {
            body: 'Great job! Time for a break.',
            icon: '🎉'
        });
    }
    
    // Play a subtle sound effect (optional - using alert as fallback)
    // In a real app, you'd use an audio element
    
    // Reset timer to default time
    appState.timer.timeLeft = appState.settings.pomodoroTime * 60;
    updateTimerDisplay();
}

// Request notification permission (call on first load)
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// ============================================
// Greeting and Clock Functions
// ============================================

// Update greeting and date/time display
function updateGreetingAndClock() {
    const dateTimeInfo = getDateTimeInfo();
    
    // Update greeting
    const greetingElement = document.getElementById('greeting');
    if (greetingElement) {
        greetingElement.textContent = dateTimeInfo.greeting;
    }
    
    // Update time
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = dateTimeInfo.time;
    }
    
    // Update date
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = dateTimeInfo.date;
    }
}

// Start clock - update every second
function startClock() {
    // Update immediately
    updateGreetingAndClock();
    
    // Then update every second
    setInterval(updateGreetingAndClock, 1000);
}

// ============================================
// Initialization Functions
// ============================================

// Load all data from storage
function loadAllData() {
    appState.tasks = StorageHandler.loadTasks();
    appState.quickLinks = StorageHandler.loadLinks();
    appState.settings = StorageHandler.loadSettings();
}

// Initialize app
function init() {
    console.log('🚀 To-Do List Life Dashboard Initialized');
    
    // Load data from local storage
    loadAllData();
    
    // Apply settings (theme, user name, etc.)
    applySettings();
    
    // Start the clock
    startClock();
    
    // Initialize timer display
    updateTimerDisplay();
    
    // Setup event listeners
    setupEventListeners();
    
    // Request notification permission
    requestNotificationPermission();
    
    // Render UI components
    renderTasks();
    renderQuickLinks();
    updateTaskStats();
    
    console.log('✅ App ready!');
    console.log(`📊 Loaded ${appState.tasks.length} tasks, ${appState.quickLinks.length} links`);
    
    // OPTIONAL: Uncomment below to load demo data for first-time users
    // loadDemoDataIfEmpty();
}

// ============================================
// Demo Data (Optional - for testing/demo)
// ============================================

function loadDemoDataIfEmpty() {
    // Only load demo data if storage is completely empty
    if (appState.tasks.length === 0 && appState.quickLinks.length === 0) {
        console.log('🎨 Loading demo data...');
        
        // Demo tasks
        const demoTasks = [
            { text: 'Complete project documentation', priority: 'high' },
            { text: 'Review pull requests', priority: 'medium' },
            { text: 'Update dependencies', priority: 'low' },
            { text: 'Plan next sprint', priority: 'high' },
            { text: 'Coffee break ☕', priority: 'medium' }
        ];
        
        demoTasks.forEach(task => {
            addTask(task.text, task.priority);
        });
        
        // Demo quick links
        const demoLinks = [
            { name: 'Google', url: 'https://google.com' },
            { name: 'GitHub', url: 'https://github.com' },
            { name: 'Stack Overflow', url: 'https://stackoverflow.com' }
        ];
        
        demoLinks.forEach(link => {
            addQuickLink(link.name, link.url);
        });
        
        showToast('Demo data loaded! Feel free to modify or delete.', 'success');
    }
}

// ============================================
// Event Listeners Setup
// ============================================

function setupEventListeners() {
    // Timer controls
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    if (startBtn) {
        startBtn.addEventListener('click', startTimer);
    }
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', pauseTimer);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetTimer);
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Settings modal
    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettingsModal);
    }
    
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', closeSettingsModal);
    }
    
    // To-Do List controls
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskInput = document.getElementById('taskInput');
    const sortTasksSelect = document.getElementById('sortTasks');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');
    
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', handleAddTask);
    }
    
    if (taskInput) {
        // Allow Enter key to add task
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleAddTask();
            }
        });
    }
    
    if (sortTasksSelect) {
        sortTasksSelect.addEventListener('change', handleSortTasks);
    }
    
    if (clearCompletedBtn) {
        clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    }
    
    // Edit Task Modal
    const closeEditTaskBtn = document.getElementById('closeEditTaskBtn');
    const saveEditTaskBtn = document.getElementById('saveEditTaskBtn');
    
    if (closeEditTaskBtn) {
        closeEditTaskBtn.addEventListener('click', closeEditTaskModal);
    }
    
    if (saveEditTaskBtn) {
        saveEditTaskBtn.addEventListener('click', saveEditedTask);
    }
    
    // Allow Enter key in edit modal
    const editTaskInput = document.getElementById('editTaskInput');
    if (editTaskInput) {
        editTaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveEditedTask();
            }
        });
    }
    
    // Quick Links controls
    const addLinkBtn = document.getElementById('addLinkBtn');
    const closeLinkBtn = document.getElementById('closeLinkBtn');
    const saveLinkBtn = document.getElementById('saveLinkBtn');
    
    if (addLinkBtn) {
        addLinkBtn.addEventListener('click', openAddLinkModal);
    }
    
    if (closeLinkBtn) {
        closeLinkBtn.addEventListener('click', closeLinkModal);
    }
    
    if (saveLinkBtn) {
        saveLinkBtn.addEventListener('click', saveLink);
    }
    
    // Allow Enter key in link modal
    const linkNameInput = document.getElementById('linkName');
    const linkUrlInput = document.getElementById('linkUrl');
    
    if (linkNameInput) {
        linkNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                linkUrlInput?.focus();
            }
        });
    }
    
    if (linkUrlInput) {
        linkUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveLink();
            }
        });
    }
    
    // Close modals on backdrop click
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
                if (modal.id === 'editTaskModal') {
                    appState.editingTaskId = null;
                } else if (modal.id === 'linkModal') {
                    appState.editingLinkId = null;
                }
            }
        });
    });
    
    // Settings modal
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettingsFromModal);
    }
    
    // Profile picture controls
    const profilePicInput = document.getElementById('profilePicInput');
    const removeProfilePicBtn = document.getElementById('removeProfilePicBtn');
    const profilePicBtn = document.getElementById('profilePicBtn');
    
    if (profilePicInput) {
        profilePicInput.addEventListener('change', handleProfilePicUpload);
    }
    
    if (removeProfilePicBtn) {
        removeProfilePicBtn.addEventListener('click', removeProfilePic);
    }
    
    if (profilePicBtn) {
        profilePicBtn.addEventListener('click', openSettingsModal);
    }
    
    // AI Chatbot
    const sendChatBtn = document.getElementById('sendChatBtn');
    const chatInput = document.getElementById('chatInput');
    
    if (sendChatBtn) {
        sendChatBtn.addEventListener('click', sendChatMessage);
    }
    
    if (chatInput) {
        // Allow Enter to send (Shift+Enter for new line)
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }
    
    // Allow Enter key in settings modal inputs
    const userNameInput = document.getElementById('userNameInput');
    const pomodoroTimeInput = document.getElementById('pomodoroTimeInput');
    
    if (userNameInput) {
        userNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                pomodoroTimeInput?.focus();
            }
        });
    }
    
    if (pomodoroTimeInput) {
        pomodoroTimeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveSettingsFromModal();
            }
        });
    }
    
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape key closes any open modal
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal:not(.hidden)');
            openModals.forEach(modal => {
                modal.classList.add('hidden');
                // Clear editing states
                if (modal.id === 'editTaskModal') {
                    appState.editingTaskId = null;
                } else if (modal.id === 'linkModal') {
                    appState.editingLinkId = null;
                }
            });
        }
    });
}

// ============================================
// AI Chatbot Functions
// ============================================

// Chat conversation history
const chatHistory = [];

// Send chat message
async function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendChatBtn');
    
    if (!chatInput || !sendBtn) return;
    
    const message = chatInput.value.trim();
    
    if (!message) {
        showToast('Please enter a message', 'warning');
        return;
    }
    
    // Check if API key is set
    if (!appState.settings.apiKey || appState.settings.apiKey.trim() === '') {
        showToast('Please set your API key in Settings first', 'error');
        openSettingsModal();
        return;
    }
    
    // Add user message to chat
    addChatMessage('user', message);
    
    // Clear input and disable button
    chatInput.value = '';
    sendBtn.disabled = true;
    sendBtn.textContent = 'THINKING...';
    
    try {
        // Get AI response
        const response = await getChatbotResponse(message);
        
        // Add assistant response to chat
        addChatMessage('assistant', response);
        
    } catch (error) {
        console.error('Error getting chatbot response:', error);
        addChatMessage('assistant', `❌ Error: ${error.message}\n\nPlease check your API key in Settings.`);
        showToast('Failed to get response', 'error');
    } finally {
        // Re-enable button
        sendBtn.disabled = false;
        sendBtn.textContent = 'SEND';
        chatInput.focus();
    }
}

// Add message to chat UI
function addChatMessage(role, text) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    // Remove empty state if present
    const emptyState = chatMessages.querySelector('.chat-empty');
    if (emptyState) {
        emptyState.remove();
    }
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;
    
    const messageText = document.createElement('div');
    messageText.className = 'chat-message-text';
    messageText.textContent = text;
    
    messageDiv.appendChild(messageText);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add to history
    chatHistory.push({ role, content: text });
    
    // Keep only last 10 messages in history to manage token usage
    if (chatHistory.length > 10) {
        chatHistory.shift();
    }
}

// Get chatbot response from LLM
async function getChatbotResponse(userMessage) {
    const apiKey = appState.settings.apiKey;
    
    // Prepare context about current tasks
    const taskContext = prepareTaskContext();
    
    // Prepare messages for API
    const messages = [
        {
            role: 'system',
            content: `You are a helpful AI assistant integrated into a to-do list app. Your role is to:
1. Help users understand and manage their tasks better
2. Provide productivity insights and suggestions
3. Evaluate task priorities and workload
4. Offer motivational support
5. Answer questions about their task list

Current Task Context:
${taskContext}

Keep responses concise (max 200 words), friendly, and actionable. Use emojis occasionally for a friendly tone.`
        }
    ];
    
    // Add recent chat history for context
    chatHistory.slice(-6).forEach(msg => {
        messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
        });
    });
    
    // Add current user message
    messages.push({
        role: 'user',
        content: userMessage
    });
    
    // Call OpenAI API
    const apiEndpoint = 'https://api.openai.com/v1/chat/completions';
    
    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: messages,
                max_tokens: 300,
                temperature: 0.8
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content.trim();
        } else {
            throw new Error('Invalid response format from API');
        }
        
    } catch (error) {
        // If API call fails, provide helpful local response
        if (error.message.includes('API') || error.message.includes('fetch')) {
            return getLocalChatbotResponse(userMessage, taskContext);
        }
        throw error;
    }
}

// Prepare task context for chatbot
function prepareTaskContext() {
    const totalTasks = appState.tasks.length;
    const completedTasks = appState.tasks.filter(t => t.completed).length;
    const activeTasks = totalTasks - completedTasks;
    const highPriorityTasks = appState.tasks.filter(t => t.priority === 'high' && !t.completed).length;
    const mediumPriorityTasks = appState.tasks.filter(t => t.priority === 'medium' && !t.completed).length;
    const lowPriorityTasks = appState.tasks.filter(t => t.priority === 'low' && !t.completed).length;
    
    const activeTasksList = appState.tasks
        .filter(t => !t.completed)
        .slice(0, 10) // Limit to 10 tasks to manage token usage
        .map(t => `- [${t.priority.toUpperCase()}] ${t.text}`)
        .join('\n');
    
    return `Total Tasks: ${totalTasks}
Active Tasks: ${activeTasks}
Completed Tasks: ${completedTasks}
High Priority: ${highPriorityTasks}
Medium Priority: ${mediumPriorityTasks}
Low Priority: ${lowPriorityTasks}

Active Tasks List:
${activeTasksList || '(No active tasks)'}`;
}

// Local chatbot response (fallback when API unavailable)
function getLocalChatbotResponse(userMessage, taskContext) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Parse task stats from context
    const stats = parseTaskStats(taskContext);
    
    // Pattern matching for common queries
    if (lowerMessage.includes('evaluate') || lowerMessage.includes('how am i doing') || lowerMessage.includes('assessment')) {
        return generateEvaluationResponse(stats);
    }
    
    if (lowerMessage.includes('priority') || lowerMessage.includes('priorities')) {
        return generatePriorityResponse(stats);
    }
    
    if (lowerMessage.includes('tip') || lowerMessage.includes('advice') || lowerMessage.includes('suggest')) {
        return generateTipsResponse(stats);
    }
    
    if (lowerMessage.includes('motivat') || lowerMessage.includes('encourage')) {
        return generateMotivationResponse(stats);
    }
    
    if (stats.activeTasks === 0) {
        return `🎉 You have no active tasks! Great job staying on top of everything. Time to add some new goals or take a well-deserved break!`;
    }
    
    // Default response
    return `📊 Quick Stats:
• ${stats.activeTasks} active task(s)
• ${stats.completedTasks} completed
• ${stats.highPriority} high-priority pending

${stats.highPriority > 0 ? '⚠️ Focus on high-priority tasks first!' : '✅ Great job managing priorities!'}

Ask me for tips, evaluation, or motivation! 💪`;
}

// Helper functions for local responses
function parseTaskStats(context) {
    const lines = context.split('\n');
    return {
        totalTasks: parseInt(lines.find(l => l.startsWith('Total Tasks:'))?.split(':')[1]) || 0,
        activeTasks: parseInt(lines.find(l => l.startsWith('Active Tasks:'))?.split(':')[1]) || 0,
        completedTasks: parseInt(lines.find(l => l.startsWith('Completed Tasks:'))?.split(':')[1]) || 0,
        highPriority: parseInt(lines.find(l => l.startsWith('High Priority:'))?.split(':')[1]) || 0,
        mediumPriority: parseInt(lines.find(l => l.startsWith('Medium Priority:'))?.split(':')[1]) || 0,
        lowPriority: parseInt(lines.find(l => l.startsWith('Low Priority:'))?.split(':')[1]) || 0
    };
}

function generateEvaluationResponse(stats) {
    const completionRate = stats.totalTasks > 0 
        ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
        : 0;
    
    let response = `📊 Task Evaluation:\n\n`;
    
    if (completionRate >= 80) {
        response += `🌟 Excellent! ${completionRate}% completion rate. You're crushing it!\n\n`;
    } else if (completionRate >= 50) {
        response += `👍 Good progress! ${completionRate}% completed. Keep the momentum!\n\n`;
    } else if (completionRate > 0) {
        response += `💪 ${completionRate}% complete. Every step counts!\n\n`;
    } else {
        response += `🚀 Ready to start! ${stats.activeTasks} task(s) waiting.\n\n`;
    }
    
    if (stats.highPriority > 0) {
        response += `⚠️ ${stats.highPriority} high-priority task(s) need attention!\n`;
    }
    
    response += `\n💡 Keep going! Use the Pomodoro timer for focused work sessions.`;
    
    return response;
}

function generatePriorityResponse(stats) {
    if (stats.highPriority > 0) {
        return `🎯 Priority Check:\n\n⚠️ You have ${stats.highPriority} HIGH priority task(s)!\n\nThese should be your focus. Tackle them first using the Pomodoro timer for 25-minute focused sessions.\n\nBreak large tasks into smaller chunks if needed. You got this! 💪`;
    } else if (stats.mediumPriority > 0) {
        return `✅ Priority Status: Good!\n\nNo high-priority tasks pending.\n${stats.mediumPriority} medium-priority task(s) to work on.\n\nYou're managing your workload well! Keep it up! 🌟`;
    } else if (stats.lowPriority > 0) {
        return `🎉 Priorities Looking Great!\n\nOnly ${stats.lowPriority} low-priority task(s) remaining. You're doing awesome! Time to add new goals or take a break! ☕`;
    } else {
        return `✨ All clear! No tasks pending. Perfect time to plan ahead or celebrate your productivity! 🎊`;
    }
}

function generateTipsResponse(stats) {
    const tips = [
        '🍅 Use the Pomodoro timer: 25 min focus + 5 min break',
        '🎯 Tackle high-priority tasks first thing in the morning',
        '✂️ Break large tasks into smaller, manageable steps',
        '✅ Celebrate small wins - mark tasks done immediately',
        '📱 Minimize distractions during focus sessions',
        '🔄 Review and update your tasks every morning',
        '💡 Limit yourself to 3-5 main tasks per day'
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    return `💡 Productivity Tip:\n\n${randomTip}\n\nCurrent Status: ${stats.activeTasks} active task(s)\n\nYou're doing great! Keep pushing forward! 🚀`;
}

function generateMotivationResponse(stats) {
    if (stats.completedTasks > stats.activeTasks) {
        return `🌟 You're Crushing It!\n\nYou've completed ${stats.completedTasks} tasks! That's more than half your list! 🎉\n\nYour productivity is inspiring. Keep this momentum going! Every completed task is a step toward your goals. You got this! 💪✨`;
    } else if (stats.activeTasks > 10) {
        return `💪 You've Got This!\n\nI know ${stats.activeTasks} tasks feels like a lot, but remember: \n\n"A journey of a thousand miles begins with a single step."\n\nPick ONE high-priority task and crush it. Then the next. You're capable of amazing things! 🚀`;
    } else if (stats.activeTasks > 0) {
        return `✨ You're Making Progress!\n\n${stats.activeTasks} task(s) to go! You've already shown up today - that's half the battle!\n\nStay focused, take breaks, and remember why you started. Every small step matters. Keep going! 🌟`;
    } else {
        return `🎉 You're a Productivity Champion!\n\nAll tasks completed! That takes dedication and hard work. Take a moment to celebrate this win! 🏆\n\nReady for the next challenge? Let's set some new goals! 🚀`;
    }
}

// ============================================
// Profile Picture Functions
// ============================================

// Handle profile picture upload
function handleProfilePicUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        showToast('Image must be less than 2MB', 'error');
        return;
    }

    // Read file and convert to base64
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Image = e.target.result;
        appState.settings.profilePic = base64Image;
        updateProfilePicDisplay();
        showToast('Profile picture updated!', 'success');
    };
    reader.onerror = function() {
        showToast('Failed to read image', 'error');
    };
    reader.readAsDataURL(file);
}

// Remove profile picture
function removeProfilePic() {
    if (confirm('Remove your profile picture?')) {
        appState.settings.profilePic = '';
        updateProfilePicDisplay();
        showToast('Profile picture removed', 'success');
    }
}

// Update profile picture display in all locations
function updateProfilePicDisplay() {
    const headerPic = document.getElementById('headerProfilePic');
    const headerPlaceholder = document.getElementById('headerProfilePlaceholder');
    const previewPic = document.getElementById('profilePreview');
    const previewPlaceholder = document.getElementById('profilePlaceholder');
    const removeBtn = document.getElementById('removeProfilePicBtn');

    if (appState.settings.profilePic) {
        // Show profile pic in header
        if (headerPic && headerPlaceholder) {
            headerPic.src = appState.settings.profilePic;
            headerPic.classList.remove('hidden');
            headerPlaceholder.classList.add('hidden');
        }

        // Show profile pic in settings modal
        if (previewPic && previewPlaceholder) {
            previewPic.src = appState.settings.profilePic;
            previewPic.classList.remove('hidden');
            previewPlaceholder.classList.add('hidden');
        }

        // Show remove button
        if (removeBtn) {
            removeBtn.classList.remove('hidden');
        }
    } else {
        // Show placeholder in header
        if (headerPic && headerPlaceholder) {
            headerPic.classList.add('hidden');
            headerPlaceholder.classList.remove('hidden');
        }

        // Show placeholder in settings modal
        if (previewPic && previewPlaceholder) {
            previewPic.classList.add('hidden');
            previewPlaceholder.classList.remove('hidden');
        }

        // Hide remove button
        if (removeBtn) {
            removeBtn.classList.add('hidden');
        }
    }
}

// ============================================
// Settings Modal Functions
// ============================================

function openSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.classList.remove('hidden');
        
        // Pre-fill current settings
        const userNameInput = document.getElementById('userNameInput');
        const pomodoroTimeInput = document.getElementById('pomodoroTimeInput');
        const llmApiKeyInput = document.getElementById('llmApiKey');
        
        if (userNameInput) userNameInput.value = appState.settings.userName;
        if (pomodoroTimeInput) pomodoroTimeInput.value = appState.settings.pomodoroTime;
        if (llmApiKeyInput) llmApiKeyInput.value = appState.settings.apiKey || '';
        
        // Update profile picture display in modal
        updateProfilePicDisplay();
        
        // Focus on first input
        if (userNameInput) userNameInput.focus();
    }
}

function closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function saveSettingsFromModal() {
    const userNameInput = document.getElementById('userNameInput');
    const pomodoroTimeInput = document.getElementById('pomodoroTimeInput');
    const llmApiKeyInput = document.getElementById('llmApiKey');
    
    if (!userNameInput || !pomodoroTimeInput) return;
    
    const userName = userNameInput.value.trim();
    const pomodoroTime = parseInt(pomodoroTimeInput.value, 10);
    const apiKey = llmApiKeyInput ? llmApiKeyInput.value.trim() : '';
    
    // Validate inputs
    if (!userName || userName.length === 0) {
        showToast('Please enter your name', 'error');
        userNameInput.focus();
        return;
    }
    
    if (isNaN(pomodoroTime) || pomodoroTime < 1 || pomodoroTime > 60) {
        showToast('Pomodoro time must be between 1 and 60 minutes', 'error');
        pomodoroTimeInput.focus();
        return;
    }
    
    // Check if pomodoro time changed
    const pomodoroTimeChanged = pomodoroTime !== appState.settings.pomodoroTime;
    
    // Update settings
    updateSettings({
        userName: userName,
        pomodoroTime: pomodoroTime,
        apiKey: apiKey
    });
    
    // If timer is not running and pomodoro time changed, reset timer
    if (pomodoroTimeChanged && !appState.timer.isRunning) {
        resetTimer();
    }
    
    closeSettingsModal();
}

// Run on page load
document.addEventListener('DOMContentLoaded', init);
