// Day Planner Application - Single Day Optimized
const STORAGE_KEY = 'dayPlannerTasks';

class DayPlanner {
    constructor() {
        this.tasks = [];
        this.currentSchedule = null;
        this.editingTaskId = null; 
        this.loadTasks();
        this.initializeUI();
    }

    initializeUI() {
        // DOM Elements
        this.taskNameInput = document.getElementById('task-name');
        this.taskDurationInput = document.getElementById('task-duration');
        this.taskPrioritySelect = document.getElementById('task-priority');
        this.taskStartTimeInput = document.getElementById('task-start-time');
        this.taskDeadlineInput = document.getElementById('task-deadline');
        this.taskAfterSelect = document.getElementById('task-after');
        this.addTaskBtn = document.getElementById('add-task-btn');
        this.tasksList = document.getElementById('tasks-list');
        this.generateScheduleBtn = document.getElementById('generate-schedule-btn');
        this.scheduleDisplay = document.getElementById('schedule-display');
        this.statusMessage = document.getElementById('status-message');
        this.generateBtnText = document.getElementById('generate-btn-text');
        
        // Time Layout Elements
        this.dayStartInput = document.getElementById('day-start');
        this.dayEndInput = document.getElementById('day-end');
        this.panelToggle = document.getElementById('panel-toggle');
        this.taskPanel = document.getElementById('task-panel');

        // Cleanup HTML elements if needed
        const multiDayElements = ['days-ahead', 'future-start-group', 'task-day-group'];
        multiDayElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.parentElement.style.display = 'none'; 
                if(el.classList.contains('c-group')) el.style.display = 'none';
            }
        });

        // Set Default Start Time to Current Time
        const now = new Date();
        const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        this.dayStartInput.value = currentTimeStr;

        // Event Listeners
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        this.generateScheduleBtn.addEventListener('click', () => this.generateSchedule());
        
        this.panelToggle.addEventListener('click', () => {
            this.taskPanel.classList.toggle('minimized');
        });

        this.renderTasks();
    }

    addTask() {
        const name = this.taskNameInput.value.trim();
        const duration = parseInt(this.taskDurationInput.value);
        const priority = this.taskPrioritySelect.value;
        const startTime = this.taskStartTimeInput.value;
        const deadline = this.taskDeadlineInput.value;
        const afterTaskId = this.taskAfterSelect.value;

        if (!name) return this.showStatus('Please enter a task name', 'error');
        if (!duration || duration < 5) return this.showStatus('Duration must be 5+ mins', 'error');

        if (startTime && deadline) {
            const s = this.timeToMinutes(startTime);
            const d = this.timeToMinutes(deadline);
            if (d <= s + duration) return this.showStatus('Deadline is too tight', 'error');
        }

        const taskData = {
            name, duration, priority,
            startTime: startTime || null,
            deadline: deadline || null,
            afterTaskId: afterTaskId || null
        };

        if (this.editingTaskId) {
            const index = this.tasks.findIndex(t => t.id === this.editingTaskId);
            if (index !== -1) {
                this.tasks[index] = { ...this.tasks[index], ...taskData };
                this.showStatus('Task updated', 'success');
            }
            this.editingTaskId = null;
            this.addTaskBtn.textContent = 'Add';
        } else {
            this.tasks.push({
                id: Date.now(),
                ...taskData
            });
            this.showStatus('Task added', 'success');
        }

        this.saveTasks();
        this.renderTasks();
        this.clearInputs();
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        this.taskNameInput.value = task.name;
        this.taskDurationInput.value = task.duration;
        this.taskPrioritySelect.value = task.priority;
        this.taskStartTimeInput.value = task.startTime || '';
        this.taskDeadlineInput.value = task.deadline || '';
        this.taskAfterSelect.value = task.afterTaskId || '';

        this.editingTaskId = id;
        this.addTaskBtn.textContent = 'Update';
        
        this.taskPanel.classList.remove('minimized');
        this.taskNameInput.focus();
    }

    clearInputs() {
        this.taskNameInput.value = '';
        this.taskDurationInput.value = '';
        this.taskStartTimeInput.value = '';
        this.taskDeadlineInput.value = '';
        this.taskAfterSelect.value = '';
        
        if (this.editingTaskId) {
            this.editingTaskId = null;
            this.addTaskBtn.textContent = 'Add';
        }
        this.taskNameInput.focus();
    }

    timeToMinutes(timeStr) {
        if (!timeStr) return 0;
        const parts = timeStr.split(':');
        if (parts.length < 2) return 0;
        
        const hours = Number(parts[0]);
        const minutes = Number(parts[1]);
        
        if (isNaN(hours) || isNaN(minutes)) return 0;
        return hours * 60 + minutes;
    }

    minutesToTime(minutes) {
        if (isNaN(minutes)) return "00:00"; 
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    removeTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        if (this.editingTaskId === id) this.clearInputs(); 
        this.saveTasks();
        this.renderTasks();
    }

    renderTasks() {
        this.taskAfterSelect.innerHTML = '<option value="">None</option>' + 
            this.tasks.map(task => `<option value="${task.id}">${task.name}</option>`).join('');

        if (this.tasks.length === 0) {
            this.tasksList.innerHTML = '<div style="text-align:center; color:#999; padding:10px;">No tasks yet.</div>';
            return;
        }

        this.tasksList.innerHTML = this.tasks.map(task => {
            let badges = '';
            if (task.startTime) badges += `<span class="constraint-badge">@${task.startTime}</span>`;
            if (task.deadline) badges += `<span class="constraint-badge"><${task.deadline}</span>`;
            
            const isEditing = this.editingTaskId === task.id ? 'style="border-color:var(--accent); background-color:var(--accent-soft);"' : '';

            return `
                <div class="task-item" ${isEditing}>
                    <div class="task-priority-badge ${task.priority}"></div>
                    <div class="task-info">
                        <span class="task-name">${task.name}</span>
                        <div style="display:flex; gap:4px; flex-wrap:wrap;">${badges}</div>
                    </div>
                    <span class="task-duration">${task.duration}m</span>
                    <button class="task-remove" style="color:var(--accent); border-color:var(--accent);" onclick="planner.editTask(${task.id})">✎</button>
                    <button class="task-remove" onclick="planner.removeTask(${task.id})">✕</button>
                </div>
            `;
        }).join('');
    }

    generateSchedule() {
        if (this.tasks.length === 0) return this.showStatus('Add tasks first', 'error');

        const generationSeed = Date.now();
        
        let startDayMin = this.timeToMinutes(this.dayStartInput.value);
        // Default to now if empty (avoid NaN)
        if (!this.dayStartInput.value) {
            const now = new Date();
            startDayMin = now.getHours() * 60 + now.getMinutes();
        }

        let endDayMin = this.timeToMinutes(this.dayEndInput.value);
        if (!this.dayEndInput.value) endDayMin = 18 * 60; 

        if (startDayMin >= endDayMin) {
            return this.showStatus('Start time must be before End time', 'error');
        }

        const totalAvailable = endDayMin - startDayMin;
        const totalTaskDuration = this.tasks.reduce((sum, t) => sum + (t.duration || 0), 0);

        let dailySlack = 0;
        let isCrunchMode = false;

        if (totalTaskDuration > totalAvailable) {
            isCrunchMode = true;
            dailySlack = 0;
        } else {
            dailySlack = totalAvailable - totalTaskDuration;
        }

        this.taskPanel.classList.add('minimized');
        const isRegen = this.generateBtnText.textContent.includes("Regenerate");
        this.generateBtnText.textContent = "Regenerate Schedule";

        const schedule = this.runScheduler(
            new Date(), 
            this.tasks, 
            startDayMin, 
            endDayMin, 
            dailySlack, 
            isCrunchMode,
            generationSeed
        );

        this.renderSchedule(schedule);

        if (schedule.droppedTasks.length > 0) {
            const names = schedule.droppedTasks.join(', ');
            this.showStatus(`Warning: Could not fit: ${names}`, 'warning', 6000);
        } else if (isCrunchMode) {
            this.showStatus('Tight schedule! Prioritized High Priority & Short tasks.', 'warning');
        } else {
            const msg = isRegen ? 'Schedule reshuffled!' : 'Schedule generated successfully!';
            this.showStatus(msg, 'success');
        }
    }

    runScheduler(date, allTasks, startOfDayMinutes, endOfDayMinutes, slackBudget, isCrunchMode, seed) {
        // Sanitize tasks
        const validTasks = allTasks.filter(t => t && !isNaN(t.duration) && t.duration > 0);

        const fixedTimeTasks = validTasks.filter(t => t.startTime);
        const deadlineTasks = validTasks.filter(t => t.deadline && !t.startTime);
        const flexibleTasks = validTasks.filter(t => !t.startTime && !t.deadline);

        const priorityWeight = { high: 3, medium: 2, low: 1 };
        
        flexibleTasks.sort((a, b) => {
            const pDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
            if (pDiff !== 0) return pDiff; 

            if (isCrunchMode) {
                return a.duration - b.duration;
            } else {
                return (this.seededRandom(seed + a.id) - 0.5);
            }
        });

        const blocks = [];
        const scheduledTaskIds = new Set();
        const scheduledTaskEndTimes = new Map();
        let droppedTasks = [];

        const addBlock = (task, start) => {
            // Safety check for start time
            if (isNaN(start)) {
                console.error("Attempted to add block with NaN start", task);
                return;
            }
            blocks.push({
                type: 'task', startTime: start, duration: task.duration,
                name: task.name, priority: task.priority
            });
            scheduledTaskIds.add(task.id);
            scheduledTaskEndTimes.set(task.id, start + task.duration);
            blocks.sort((a, b) => a.startTime - b.startTime);
        };

        const isRangeFree = (start, duration) => {
            const end = start + duration;
            if (end > endOfDayMinutes) return false;
            for (const block of blocks) {
                const blockEnd = block.startTime + block.duration;
                if ((start >= block.startTime && start < blockEnd) ||
                    (end > block.startTime && end <= blockEnd) ||
                    (start <= block.startTime && end >= blockEnd)) return false;
            }
            return true;
        };

        const findFirstSlot = (duration, minStartTime) => {
            let safeMin = isNaN(minStartTime) ? startOfDayMinutes : minStartTime;
            let candidateStart = Math.max(safeMin, startOfDayMinutes);
            
            if (isRangeFree(candidateStart, duration)) return candidateStart;
            
            for (const block of blocks) {
                const blockEnd = block.startTime + block.duration;
                if (blockEnd < candidateStart) continue;
                if (isRangeFree(blockEnd, duration)) return blockEnd;
            }
            return null;
        };

        // 1. Fixed Tasks
        fixedTimeTasks.forEach(task => {
            const start = this.timeToMinutes(task.startTime);
            if (start >= startOfDayMinutes) addBlock(task, start);
            else droppedTasks.push(task.name);
        });

        // 2. Deadline Tasks
        deadlineTasks.forEach(task => {
            const deadline = this.timeToMinutes(task.deadline);
            const slot = findFirstSlot(task.duration, startOfDayMinutes);
            if (slot !== null && (slot + task.duration) <= deadline) {
                addBlock(task, slot);
            } else {
                droppedTasks.push(task.name);
            }
        });

        // 3. Flexible Tasks
        let tasksRemaining = [...flexibleTasks];
        let stuckCounter = 0;
        const BREAK_CHANCE = 0.3; 
        let currentBudget = slackBudget;

        while (tasksRemaining.length > 0 && stuckCounter < tasksRemaining.length * 2) {
            const task = tasksRemaining.shift();
            let earliestStart = startOfDayMinutes;
            let dependencyMet = true;

            if (task.afterTaskId) {
                if (scheduledTaskIds.has(parseInt(task.afterTaskId))) {
                    earliestStart = scheduledTaskEndTimes.get(parseInt(task.afterTaskId));
                } else if (validTasks.find(t => t.id == task.afterTaskId)) {
                    dependencyMet = false;
                }
            }

            if (!dependencyMet) {
                tasksRemaining.push(task);
                stuckCounter++;
                continue;
            }

            let scheduled = false;
            
            // --- Break Scheduling ---
            const wantBreak = this.seededRandom(seed + task.id + stuckCounter) < BREAK_CHANCE;
            
            if (wantBreak && currentBudget >= 15) {
                const options = [];
                if (currentBudget >= 15) options.push(15);
                if (currentBudget >= 30) options.push(30);
                if (currentBudget >= 45) options.push(45);
                if (currentBudget >= 60) options.push(60);
                
                // FIX: Use numeric seed offset instead of string concatenation
                // "brk" string was causing NaN in seededRandom math
                const pickIndex = Math.floor(this.seededRandom(seed + task.id + 999) * options.length);
                const breakDur = options[pickIndex];
                
                const slotWithBreak = findFirstSlot(task.duration + breakDur, earliestStart);
                if (slotWithBreak !== null) {
                    addBlock(task, slotWithBreak + breakDur);
                    scheduled = true;
                    currentBudget -= breakDur;
                }
            }

            // Fallback
            if (!scheduled) {
                const slot = findFirstSlot(task.duration, earliestStart);
                if (slot !== null) {
                    addBlock(task, slot);
                    scheduled = true;
                }
            }

            if (scheduled) {
                stuckCounter = 0;
            } else {
                 tasksRemaining.push(task); 
                 stuckCounter++;
            }
        }
        
        if (tasksRemaining.length > 0) {
            droppedTasks = droppedTasks.concat(tasksRemaining.map(t => t.name));
        }

        // 4. Fill Free Time
        const finalBlocks = [];
        let lastEnd = startOfDayMinutes;
        blocks.sort((a, b) => a.startTime - b.startTime);
        
        for (const block of blocks) {
            if (block.startTime > lastEnd) {
                finalBlocks.push({
                    type: 'free', startTime: lastEnd,
                    duration: block.startTime - lastEnd, name: 'Break'
                });
            }
            finalBlocks.push(block);
            lastEnd = block.startTime + block.duration;
        }
        
        if (lastEnd < endOfDayMinutes) {
            finalBlocks.push({
                type: 'free', startTime: lastEnd,
                duration: endOfDayMinutes - lastEnd, name: 'Free Time'
            });
        }

        return { date, blocks: finalBlocks, droppedTasks };
    }

    renderSchedule(schedule) {
        const dateStr = schedule.date.toLocaleDateString('en-US', { 
            weekday: 'long', month: 'long', day: 'numeric' 
        });
        
        const blocksHTML = schedule.blocks.map(block => {
            const s = block.startTime;
            const e = block.startTime + block.duration;
            const timeLabel = `${this.formatTime(Math.floor(s/60), s%60)} - ${this.formatTime(Math.floor(e/60), e%60)}`;
            const pClass = block.type === 'task' ? `${block.priority}-priority` : 'free-time';

            return `
                <div class="time-block ${pClass}">
                    <div class="time-label">${timeLabel}</div>
                    <div style="flex:1; display:flex; justify-content:space-between;">
                        <span class="block-title">${block.name}</span>
                        <span class="block-duration">${block.duration}m</span>
                    </div>
                </div>
            `;
        }).join('');

        this.scheduleDisplay.innerHTML = `
            <div class="day-schedule">
                <div class="day-header">
                    <span>${dateStr}</span>
                </div>
                <div class="timeline">${blocksHTML}</div>
            </div>
        `;
    }

    formatTime(hour, minute) {
        if (isNaN(hour) || isNaN(minute)) return "--:--";
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        const displayMin = minute.toString().padStart(2, '0');
        return `${displayHour}:${displayMin}${period}`;
    }

    seededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    showStatus(message, type, duration = 4000) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type} visible`;
        setTimeout(() => this.statusMessage.classList.remove('visible'), duration);
    }

    saveTasks() { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks)); }
    
    loadTasks() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.tasks = parsed.map(t => ({
                    ...t,
                    duration: (typeof t.duration === 'number' && !isNaN(t.duration)) ? t.duration : 30,
                    priority: ['high', 'medium', 'low'].includes(t.priority) ? t.priority : 'medium',
                    startTime: t.startTime || null,
                    deadline: t.deadline || null
                }));
            } catch (e) {
                console.error("Data corruption detected, resetting tasks");
                this.tasks = [];
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => { planner = new DayPlanner(); });