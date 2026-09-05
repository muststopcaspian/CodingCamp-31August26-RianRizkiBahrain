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
        apiKey: ''
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
                apiKey: ''
            };
        } catch (error) {
            console.error('Error loading settings:', error);
            return {
                userName: 'User',
                theme: 'light',
                pomodoroTime: 25,
                apiKey: ''
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
    
    // Render UI components (will be implemented in next tasks)
    updateTaskStats();
    
    console.log('✅ App ready!');
}

// Run on page load
document.addEventListener('DOMContentLoaded', init);
