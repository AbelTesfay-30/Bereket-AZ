// Configuration
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Gym workout schedule by day
const gymSchedule = {
    'Monday': 'Chest & Back',
    'Tuesday': 'Shoulders & Arms',
    'Wednesday': 'Legs',
    'Thursday': 'Chest & Back',
    'Friday': 'Shoulders & Arms',
    'Saturday': 'Legs',
    'Sunday': 'Total Rest / Recovery'
};

const tasks = [
    { id: 'gym', label: 'Gym Workout', icon: 'icons/gym.svg', expense: 0 },
    { id: 'study', label: 'Course Study', icon: 'icons/study.svg', expense: 0 },
    { id: 'python', label: 'Python Practice', icon: 'icons/python.svg', expense: 0 },
    { id: 'fx', label: 'FX Chart Analysis', icon: 'icons/fx.svg', expense: 0 },
    { id: 'expense', label: 'Daily Expense', icon: 'icons/expense.svg', expense: 150 }
];

// State
let routineData = {};
let historyData = [];

// Initialize
function init() {
    loadData();
    loadHistory();
    renderDays();
    updateStats();
    setupEventListeners();
}

// Load data from localStorage
function loadData() {
    const saved = localStorage.getItem('routineData');
    if (saved) {
        routineData = JSON.parse(saved);
        // Migrate existing data to include new "expense" task
        days.forEach(day => {
            if (!routineData[day]) {
                routineData[day] = {};
            }
            tasks.forEach(task => {
                if (routineData[day][task.id] === undefined) {
                    routineData[day][task.id] = false;
                }
            });
        });
    } else {
        // Initialize empty state
        days.forEach(day => {
            routineData[day] = {};
            tasks.forEach(task => {
                routineData[day][task.id] = false;
            });
        });
    }
}

// Load history from localStorage
function loadHistory() {
    const saved = localStorage.getItem('historyData');
    if (saved) {
        historyData = JSON.parse(saved);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('routineData', JSON.stringify(routineData));
}

// Save history to localStorage
function saveHistory() {
    localStorage.setItem('historyData', JSON.stringify(historyData));
}

// Render all days
function renderDays() {
    const container = document.getElementById('daysContainer');
    container.innerHTML = '';

    days.forEach(day => {
        const dayCard = createDayCard(day);
        container.appendChild(dayCard);
    });
}

// Create a single day card
function createDayCard(day) {
    const card = document.createElement('div');
    card.className = 'day-card fade-in bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700';

    const completedTasks = tasks.filter(task => routineData[day][task.id]).length;
    const dayProgress = (completedTasks / tasks.length) * 100;
    const dayExpense = routineData[day]['expense'] ? 150 : 0;

    card.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-gray-200">${day}</h3>
            <span class="text-sm font-medium ${dayProgress === 100 ? 'text-emerald-400' : 'text-gray-400'}">
                ${completedTasks}/${tasks.length}
            </span>
        </div>
        <div class="w-full bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
            <div class="progress-bar h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" style="width: ${dayProgress}%"></div>
        </div>
        <div class="space-y-3 mb-4">
            ${tasks.map(task => {
                const taskLabel = task.id === 'gym' ? gymSchedule[day] : task.label;
                const showExpense = task.id === 'expense' ? `${task.expense} Birr` : '';
                return `
                <label class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors">
                    <input 
                        type="checkbox" 
                        class="checkbox-custom" 
                        data-day="${day}" 
                        data-task="${task.id}"
                        ${routineData[day][task.id] ? 'checked' : ''}
                    >
                    <img src="${task.icon}" alt="${task.label}" class="w-8 h-8">
                    <span class="text-gray-300 flex-1">${taskLabel}</span>
                    ${showExpense ? `<span class="text-xs text-gray-500">${showExpense}</span>` : ''}
                </label>
                `;
            }).join('')}
        </div>
        <div class="flex items-center justify-between pt-3 border-t border-gray-700">
            <span class="text-sm text-gray-400">Day Expense:</span>
            <span class="text-lg font-bold text-purple-400">${dayExpense} Birr</span>
        </div>
        <button 
            class="add-to-history-btn w-full mt-3 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium text-sm hover:opacity-90 transition-opacity ${completedTasks === 0 ? 'opacity-50 cursor-not-allowed' : ''}"
            data-day="${day}"
            ${completedTasks === 0 ? 'disabled' : ''}
        >
            Add to History
        </button>
    `;

    return card;
}

// Update statistics
function updateStats() {
    let totalCompleted = 0;
    const totalTasks = days.length * tasks.length;
    let totalExpense = 0;

    days.forEach(day => {
        tasks.forEach(task => {
            if (routineData[day][task.id]) {
                totalCompleted++;
                totalExpense += task.expense;
            }
        });
    });

    const progress = Math.round((totalCompleted / totalTasks) * 100);

    document.getElementById('overallProgress').textContent = `${progress}%`;
    document.getElementById('completedCount').textContent = totalCompleted;
    document.getElementById('totalExpense').textContent = `${totalExpense} Birr`;
    document.getElementById('historyCount').textContent = historyData.length;
}

// Handle checkbox changes
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('checkbox-custom')) {
        const day = e.target.dataset.day;
        const task = e.target.dataset.task;
        
        routineData[day][task] = e.target.checked;
        saveData();
        
        // Re-render to update progress bars
        renderDays();
        updateStats();
    }
});

// Add to History button click handler
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-history-btn')) {
        const day = e.target.dataset.day;
        addToHistory(day);
    }
});

// Add day to history
function addToHistory(day) {
    const completedTasks = tasks.filter(task => routineData[day][task.id]);
    
    if (completedTasks.length === 0) return;

    const historyEntry = {
        id: Date.now(),
        date: new Date().toISOString(),
        day: day,
        tasks: completedTasks.map(task => task.id),
        taskLabels: completedTasks.map(task => task.id === 'gym' ? gymSchedule[day] : task.label),
        expense: routineData[day]['expense'] ? 150 : 0,
        completedCount: completedTasks.length
    };

    historyData.unshift(historyEntry);
    saveHistory();
    updateStats();

    // Reset the day's checkboxes
    tasks.forEach(task => {
        routineData[day][task.id] = false;
    });
    saveData();
    renderDays();
    updateStats();

    // Show success feedback
    showNotification('Added to history successfully!');
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 fade-in';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Setup event listeners
function setupEventListeners() {
    // History button
    document.getElementById('historyBtn').addEventListener('click', openHistoryModal);
    
    // Close modal
    document.getElementById('closeModal').addEventListener('click', closeHistoryModal);
    
    // Clear history
    document.getElementById('clearHistory').addEventListener('click', clearHistory);
    
    // Close modal on backdrop click
    document.getElementById('historyModal').addEventListener('click', (e) => {
        if (e.target.id === 'historyModal') {
            closeHistoryModal();
        }
    });

    // Export button
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
}

// Open history modal
function openHistoryModal() {
    const modal = document.getElementById('historyModal');
    modal.classList.remove('hidden');
    renderHistory();
}

// Close history modal
function closeHistoryModal() {
    const modal = document.getElementById('historyModal');
    modal.classList.add('hidden');
}

// Render history
function renderHistory() {
    const historyList = document.getElementById('historyList');
    const emptyHistory = document.getElementById('emptyHistory');

    if (historyData.length === 0) {
        historyList.innerHTML = '';
        emptyHistory.classList.remove('hidden');
        return;
    }

    emptyHistory.classList.add('hidden');
    historyList.innerHTML = historyData.map(entry => {
        const date = new Date(entry.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="history-item">
                <div class="history-date">${formattedDate}</div>
                <div class="history-tasks">
                    ${entry.taskLabels.map(label => `
                        <span class="history-task-badge">${label}</span>
                    `).join('')}
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-400">${entry.completedCount} tasks completed</span>
                    <span class="history-expense">${entry.expense} Birr</span>
                </div>
            </div>
        `;
    }).join('');
}

// Clear history
function clearHistory() {
    if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
        historyData = [];
        saveHistory();
        updateStats();
        renderHistory();
        showNotification('History cleared successfully!');
    }
}

// Export to CSV
function exportToCSV() {
    const headers = ['Day', 'Gym Schedule', 'Gym Workout', 'Course Study', 'Python Practice', 'FX Chart Analysis', 'Daily Expense', 'Completed', 'Progress', 'Expense'];
    const rows = [];
    let totalExpense = 0;

    days.forEach(day => {
        const row = [day, gymSchedule[day]];
        let completed = 0;
        let dayExpense = 0;

        tasks.forEach(task => {
            const isCompleted = routineData[day][task.id];
            row.push(isCompleted ? '✓' : '✗');
            if (isCompleted) completed++;
            if (task.id === 'expense' && isCompleted) {
                dayExpense = 150;
                totalExpense += 150;
            }
        });

        row.push(completed);
        row.push(`${Math.round((completed / tasks.length) * 100)}%`);
        row.push(`${dayExpense} Birr`);
        rows.push(row);
    });

    // Add summary row
    const totalCompleted = rows.reduce((sum, row) => sum + row[7], 0);
    const summaryRow = ['TOTAL', '', '', '', '', '', '', totalCompleted, `${Math.round((totalCompleted / (days.length * tasks.length)) * 100)}%`, `${totalExpense} Birr`];
    rows.push(summaryRow);

    // Create CSV content
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `routine-tracker-${date}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize on load
init();
