// Day Planner Application
const STORAGE_KEY = 'dayPlannerTasks';

class DayPlanner {
    constructor() {
        this.tasks = [];
        this.currentSchedule = null;
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
        this.daysAheadInput = document.getElementById('days-ahead');
        this.generateBtnText = document.getElementById('generate-btn-text');
        
        // New UI Elements
        this.dayStartInput = document.getElementById('day-start');
        this.dayEndInput = document.getElementById('day-end');
        this.panelToggle = document.getElementById('panel-toggle');
        this.taskPanel = document.getElementById('task-panel');

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
        
        // Toggle Logic
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

        const task = {
            id: Date.now(),
            name, duration, priority,
            startTime: startTime || null,
            deadline: deadline || null,
            afterTaskId: afterTaskId || null
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.clearInputs();
        this.showStatus('Task added', 'success');
    }

    clearInputs() {
        this.taskNameInput.value = '';
        this.taskDurationInput.value = '';
        this.taskStartTimeInput.value = '';
        this.taskDeadlineInput.value = '';
        this.taskAfterSelect.value = '';
        this.taskNameInput.focus();
    }

    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    removeTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
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
            
            return `
                <div class="task-item">
                    <div class="task-priority-badge ${task.priority}"></div>
                    <div class="task-info">
                        <span class="task-name">${task.name}</span>
                        <div style="display:flex; gap:4px;">${badges}</div>
                    </div>
                    <span class="task-duration">${task.duration}m</span>
                    <button class="task-remove" onclick="planner.removeTask(${task.id})">✕</button>
                </div>
            `;
        }).join('');
    }

    generateSchedule() {
        if (this.tasks.length === 0) return this.showStatus('Add tasks first', 'error');

        const daysAhead = parseInt(this.daysAheadInput.value) || 1;
        
        // 1. Get Start/End Times from Inputs
        const startDayMin = this.timeToMinutes(this.dayStartInput.value);
        const endDayMin = this.timeToMinutes(this.dayEndInput.value);

        if (startDayMin >= endDayMin) {
            return this.showStatus('Start time must be before End time', 'error');
        }

        const minutesPerDay = endDayMin - startDayMin;
        const totalAvailable = minutesPerDay * daysAhead;
        const totalTaskDuration = this.tasks.reduce((sum, t) => sum + t.duration, 0);

        // 2. ERROR CHECK: Do tasks fit?
        if (totalTaskDuration > totalAvailable) {
            return this.showStatus(`Impossible! Tasks: ${totalTaskDuration}m. Available: ${totalAvailable}m.`, 'error');
        }

        // 3. Minimize Modal & Change Text
        this.taskPanel.classList.add('minimized');
        this.generateBtnText.textContent = "Regenerate Schedule";

        const schedules = [];
        for (let day = 0; day < daysAhead; day++) {
            const date = new Date();
            date.setDate(date.getDate() + day);
            
            // Calculate specific start time for Today vs Future days
            let dayStart = startDayMin;
            if (day === 0) {
                 // For today, ensure we don't schedule in the past if user left input as default
                 // But strictly respecting the input is better UX usually. 
                 // We use the input value provided.
            } else {
                // For future days, usually start at 9am, but let's stick to the user input for consistency
                // OR default to 9am if input is "now". 
                // Let's stick to the user's defined "Start Time" for all days for consistency.
            }

            const schedule = this.createDaySchedule(date, day, daysAhead, dayStart, endDayMin);
            schedules.push(schedule);
        }

        this.renderSchedule(schedules);
        this.showStatus('Schedule generated!', 'success');
    }

    createDaySchedule(date, dayIndex, totalDays, startOfDayMinutes, endOfDayMinutes) {
        const seed = Date.now() + dayIndex;
        
        // Distribute tasks
        const tasksPerDay = Math.ceil(this.tasks.length / totalDays);
        const startIndex = dayIndex * tasksPerDay;
        const endIndex = Math.min(startIndex + tasksPerDay, this.tasks.length);
        let dayTasks = this.tasks.slice(startIndex, endIndex);

        const fixedTimeTasks = dayTasks.filter(t => t.startTime);
        const deadlineTasks = dayTasks.filter(t => t.deadline && !t.startTime);
        const flexibleTasks = dayTasks.filter(t => !t.startTime && !t.deadline);

        // Sort flexible tasks
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        flexibleTasks.sort((a, b) => {
            const pDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
            return pDiff + ((this.seededRandom(seed + a.id) - 0.5) * 0.5);
        });

        const blocks = [];
        const scheduledTaskIds = new Set();
        const scheduledTaskEndTimes = new Map();

        const addBlock = (task, start) => {
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
            let candidateStart = Math.max(minStartTime, startOfDayMinutes);
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
        });

        // 2. Deadline Tasks
        deadlineTasks.forEach(task => {
            const deadline = this.timeToMinutes(task.deadline);
            const slot = findFirstSlot(task.duration, startOfDayMinutes);
            if (slot !== null && (slot + task.duration) <= deadline) addBlock(task, slot);
        });

        // 3. Flexible Tasks with Break Probability
        let tasksRemaining = [...flexibleTasks];
        let stuckCounter = 0;
        const BREAK_CHANCE = 0.3; // 30% chance to take a break before a task

        while (tasksRemaining.length > 0 && stuckCounter < tasksRemaining.length * 2) {
            const task = tasksRemaining.shift();
            let earliestStart = startOfDayMinutes;
            let dependencyMet = true;

            if (task.afterTaskId) {
                if (scheduledTaskIds.has(parseInt(task.afterTaskId))) {
                    earliestStart = scheduledTaskEndTimes.get(parseInt(task.afterTaskId));
                } else if (dayTasks.find(t => t.id == task.afterTaskId)) {
                    dependencyMet = false;
                }
            }

            if (!dependencyMet) {
                tasksRemaining.push(task);
                stuckCounter++;
                continue;
            }

            // --- BREAK LOGIC ---
            // Roll dice. If we want a break, try to schedule Task duration + 15 min buffer
            // If that fits, we add the task at (slot + 15).
            // If it doesn't fit, we fall back to normal scheduling.
            let scheduled = false;
            if (this.seededRandom(seed + task.id + stuckCounter) < BREAK_CHANCE) {
                const breakDuration = 15;
                const slotWithBreak = findFirstSlot(task.duration + breakDuration, earliestStart);
                
                if (slotWithBreak !== null) {
                    // Schedule task after the break
                    addBlock(task, slotWithBreak + breakDuration);
                    scheduled = true;
                }
            }

            if (!scheduled) {
                const slot = findFirstSlot(task.duration, earliestStart);
                if (slot !== null) {
                    addBlock(task, slot);
                    scheduled = true;
                }
            }

            if (scheduled) stuckCounter = 0;
            else console.log(`Skipped ${task.name}`);
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

        return { date, blocks: finalBlocks };
    }

    renderSchedule(schedules) {
        this.scheduleDisplay.innerHTML = schedules.map(schedule => {
            const dateStr = schedule.date.toLocaleDateString('en-US', { weekday: 'long' });
            
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

            return `
                <div class="day-schedule">
                    <div class="day-header">
                        <span>${dateStr}</span>
                    </div>
                    <div class="timeline">${blocksHTML}</div>
                </div>
            `;
        }).join('');
    }

    formatTime(hour, minute) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        const displayMin = minute.toString().padStart(2, '0');
        return `${displayHour}:${displayMin}${period}`;
    }

    seededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    showStatus(message, type) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type} visible`;
        setTimeout(() => this.statusMessage.classList.remove('visible'), 4000);
    }

    saveTasks() { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks)); }
    loadTasks() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) this.tasks = JSON.parse(saved);
    }
}

document.addEventListener('DOMContentLoaded', () => { planner = new DayPlanner(); });