// Client-side journal explorer. Daylio data is kept in memory for this session only.

(() => {
    const elements = {
        upload: document.getElementById('explore-upload'),
        uploadForm: document.getElementById('explore-upload-form'),
        status: document.getElementById('explore-status'),
        shell: document.getElementById('explorer-shell'),
        range: document.getElementById('journal-range'),
        search: document.getElementById('entry-search'),
        connectionSearch: document.getElementById('connection-search'),
        mood: document.getElementById('mood-filter'),
        from: document.getElementById('date-from'),
        to: document.getElementById('date-to'),
        dreams: document.getElementById('dream-toggle'),
        clear: document.getElementById('clear-filters'),
        calendar: document.getElementById('calendar-grid'),
        calendarYear: document.getElementById('calendar-year'),
        previousYear: document.getElementById('calendar-previous'),
        nextYear: document.getElementById('calendar-next'),
        calendarMetric: document.getElementById('calendar-metric'),
        timeline: document.getElementById('timeline'),
        count: document.getElementById('timeline-count'),
        sort: document.getElementById('sort-timeline'),
        moodInsight: document.getElementById('mood-insight'),
        trendInsight: document.getElementById('trend-insight'),
        activityInsight: document.getElementById('activity-insight'),
        associationInsight: document.getElementById('association-insight'),
        tabs: document.querySelectorAll('[data-explorer-view]'),
        panels: document.querySelectorAll('[data-panel]'),
        patternGrouping: document.getElementById('pattern-grouping'),
        cadenceInsight: document.getElementById('cadence-insight'),
        lengthMoodInsight: document.getElementById('length-mood-insight'),
        weekdayInsight: document.getElementById('weekday-insight'),
        timeInsight: document.getElementById('time-insight'),
        correlationInsight: document.getElementById('correlation-insight'),
        moodMovingChart: document.getElementById('mood-moving-chart'),
        socialShifterChart: document.getElementById('social-shifter-chart'),
        socialShifterCopy: document.getElementById('social-shifter-copy'),
        socialShifterMode: document.getElementById('social-shifter-mode'),
        downloadSocialData: document.getElementById('download-social-data'),
        cadenceChart: document.getElementById('cadence-chart'),
        lengthMoodChart: document.getElementById('length-mood-chart'),
        weekdayChart: document.getElementById('weekday-chart'),
        timeChart: document.getElementById('time-chart'),
        hobbyRadarChart: document.getElementById('hobby-radar-chart'),
        radarYearPicker: document.getElementById('radar-year-picker'),
        radarCopyGroups: document.getElementById('radar-copy-groups'),
        radarTargetList: document.getElementById('radar-target-list'),
        radarTargetForm: document.getElementById('radar-target-form'),
        radarTargetId: document.getElementById('radar-target-id'),
        radarTargetName: document.getElementById('radar-target-name'),
        radarTargetTerms: document.getElementById('radar-target-terms'),
        radarTargetSave: document.getElementById('radar-target-save'),
        connectionEmpty: document.getElementById('connection-empty'),
        connectionResults: document.getElementById('connection-results'),
        connectionProfile: document.getElementById('connection-profile'),
        connectionConstellation: document.getElementById('connection-constellation'),
        connectionMentions: document.getElementById('connection-mentions'),
        safeHarborChart: document.getElementById('safe-harbor-chart'),
        reviewYear: document.getElementById('review-year'),
        annualReport: document.getElementById('annual-report'),
        printReview: document.getElementById('print-review'),
        sphereDialog: document.getElementById('sphere-settings-dialog'),
        sphereOpen: document.getElementById('open-sphere-settings'),
        sphereClose: document.getElementById('close-sphere-settings'),
        sphereForm: document.getElementById('sphere-settings-form'),
        sphereName: document.getElementById('sphere-name'),
        sphereTerms: document.getElementById('sphere-terms'),
        sphereId: document.getElementById('sphere-id'),
        sphereSave: document.getElementById('save-sphere-settings'),
        sphereList: document.getElementById('sphere-settings-list'),
        sphereClear: document.getElementById('clear-sphere-settings'),
        sphereExport: document.getElementById('export-sphere-settings'),
        sphereImport: document.getElementById('import-sphere-settings'),
        newJournal: document.getElementById('new-journal'),
        changeFile: document.getElementById('return-to-explorer-upload')
    };

    const state = {
        rawEntries: [],
        entries: [],
        spheres: window.DaylioSettings.getAll(),
        radarTargets: window.DaylioSettings.getRadarTargets(),
        radarYears: [],
        query: '',
        mood: '',
        from: '',
        to: '',
        dreamsOnly: false,
        newestFirst: true,
        calendarYear: new Date().getFullYear(),
        calendarMetric: 'density',
        patternGrouping: 'month',
        activeView: 'patterns',
        socialShifterMode: 'groups',
        weekday: null,
        timeBucket: '',
        connectionQuery: '',
        connectionMood: '',
        connectionFocusDate: ''
    };

    function scoreMood(mood) {
        return window.DaylioAnalysis.scoreMood(mood);
    }

    function moodTone(mood) {
        return window.DaylioAnalysis.moodTone(mood);
    }

    function pluralise(count, singular, plural = `${singular}s`) {
        return `${count} ${count === 1 ? singular : plural}`;
    }

    function prettyDate(date) {
        return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
            .format(new Date(`${date}T12:00:00`));
    }

    function shortDate(date) {
        return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
            .format(new Date(`${date}T12:00:00`));
    }

    function setText(element, text, className) {
        const span = document.createElement('span');
        if (className) span.className = className;
        span.textContent = text;
        element.appendChild(span);
    }

    function appendHighlighted(element, text, query) {
        const value = String(text || '');
        const term = String(query || '').trim();
        if (!term) {
            element.append(value);
            return;
        }

        const lowerValue = value.toLocaleLowerCase();
        const lowerTerm = term.toLocaleLowerCase();
        let cursor = 0;
        let match = lowerValue.indexOf(lowerTerm, cursor);
        while (match !== -1) {
            element.append(value.slice(cursor, match));
            const marked = document.createElement('mark');
            marked.textContent = value.slice(match, match + term.length);
            element.append(marked);
            cursor = match + term.length;
            match = lowerValue.indexOf(lowerTerm, cursor);
        }
        element.append(value.slice(cursor));
    }

    function matchesEntry(entry, { includeQuery = true, includeDate = true } = {}) {
        return (!includeQuery || !state.query || window.DaylioAnalysis.entryMatchesQuery(entry, state.query))
            && (!state.mood || entry.mood === state.mood)
            && (!includeDate || !state.from || entry.date >= state.from)
            && (!includeDate || !state.to || entry.date <= state.to)
            && (!state.dreamsOnly || entry.activities.some((activity) => /dream/i.test(activity)))
            && (state.weekday === null || entry.weekday === state.weekday)
            && (!state.timeBucket || entry.timeBucket === state.timeBucket);
    }

    function getFilteredEntries() {
        return state.entries.filter((entry) => matchesEntry(entry));
    }

    function buildMoodOptions() {
        const currentValue = elements.mood.value;
        const moods = [...new Set(state.entries.map((entry) => entry.mood).filter(Boolean))]
            .sort((first, second) => first.localeCompare(second));
        elements.mood.replaceChildren(new Option('Every mood', ''));
        moods.forEach((mood) => elements.mood.add(new Option(mood, mood)));
        elements.mood.value = currentValue;
    }

    function renderSphereSettings() {
        elements.sphereList.replaceChildren();
        if (!state.spheres.length) {
            const empty = document.createElement('p');
            empty.className = 'sphere-empty';
            empty.textContent = 'No groups saved yet.';
            elements.sphereList.append(empty);
            return;
        }
        state.spheres.forEach((sphere) => {
            const row = document.createElement('div');
            row.className = 'sphere-row';
            const details = document.createElement('div');
            const name = document.createElement('strong');
            name.textContent = sphere.name;
            const terms = document.createElement('span');
            terms.textContent = sphere.terms.join(', ');
            details.append(name, terms);
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'text-button';
            remove.textContent = 'remove';
            remove.addEventListener('click', () => {
                state.spheres = window.DaylioSettings.remove(sphere.id);
                refreshEnrichedEntries();
                renderSphereSettings();
                render();
            });
            const actions = document.createElement('div');
            actions.className = 'sphere-row-actions';
            const edit = document.createElement('button');
            edit.type = 'button';
            edit.className = 'text-button';
            edit.textContent = 'edit';
            edit.addEventListener('click', () => {
                elements.sphereId.value = sphere.id;
                elements.sphereName.value = sphere.name;
                elements.sphereTerms.value = sphere.terms.join(', ');
                elements.sphereSave.textContent = 'Update group';
                elements.sphereName.focus();
            });
            [-1, 1].forEach((direction) => {
                const move = document.createElement('button');
                move.type = 'button';
                move.className = 'text-button';
                move.textContent = direction < 0 ? '↑' : '↓';
                move.setAttribute('aria-label', direction < 0 ? `Move ${sphere.name} up` : `Move ${sphere.name} down`);
                move.addEventListener('click', () => {
                    state.spheres = window.DaylioSettings.move(sphere.id, direction);
                    refreshEnrichedEntries();
                    renderSphereSettings();
                    render();
                });
                actions.append(move);
            });
            actions.append(edit, remove);
            row.append(details, actions);
            elements.sphereList.append(row);
        });
    }

    function refreshEnrichedEntries() {
        if (!state.rawEntries.length) return;
        state.entries = window.DaylioAnalysis.enrichEntries(state.rawEntries, state.spheres)
            .map((entry) => entry);
    }

    function renderRadarTargets() {
        elements.radarTargetList.replaceChildren();
        state.radarTargets.forEach((target) => {
            const row = document.createElement('div');
            row.className = 'radar-target-row';
            const details = document.createElement('div');
            const name = document.createElement('strong');
            const terms = document.createElement('span');
            name.textContent = target.name;
            terms.textContent = target.terms.join(', ');
            details.append(name, terms);
            const actions = document.createElement('div');
            const edit = document.createElement('button');
            edit.type = 'button';
            edit.className = 'text-button';
            edit.textContent = 'edit';
            edit.addEventListener('click', () => {
                elements.radarTargetId.value = target.id;
                elements.radarTargetName.value = target.name;
                elements.radarTargetTerms.value = target.terms.join(', ');
                elements.radarTargetSave.textContent = 'Update target';
            });
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'text-button';
            remove.textContent = 'remove';
            remove.addEventListener('click', () => {
                state.radarTargets = window.DaylioSettings.removeRadarTarget(target.id);
                renderRadarTargets();
                renderPatterns(getFilteredEntries());
            });
            actions.append(edit, remove);
            row.append(details, actions);
            elements.radarTargetList.append(row);
        });
    }

    function renderTimeline(entries) {
        const ordered = [...entries].sort((first, second) => (
            state.newestFirst ? second.datetime - first.datetime : first.datetime - second.datetime
        ));
        elements.timeline.replaceChildren();
        elements.count.textContent = `${pluralise(entries.length, 'entry')} shown`;

        if (!ordered.length) {
            const empty = document.createElement('p');
            empty.className = 'empty-state';
            empty.textContent = 'Nothing meets these filters. Try widening the search or clearing it.';
            elements.timeline.append(empty);
            return;
        }

        ordered.forEach((entry) => {
            const item = document.createElement('article');
            item.className = `journal-entry mood-${moodTone(entry.mood)}`;
            item.dataset.date = entry.date;

            const meta = document.createElement('div');
            meta.className = 'entry-meta';
            const date = document.createElement('time');
            date.dateTime = `${entry.date}T${entry.time}`;
            date.textContent = `${shortDate(entry.date)} · ${entry.time}`;
            meta.append(date);
            if (entry.mood) setText(meta, entry.mood, 'mood-name');
            item.append(meta);

            if (entry.noteTitle) {
                const title = document.createElement('h4');
                appendHighlighted(title, entry.noteTitle, state.query);
                item.append(title);
            }
            if (entry.note) {
                const note = document.createElement('p');
                note.className = 'entry-note';
                appendHighlighted(note, entry.note, state.query);
                item.append(note);
            }
            if (entry.activities.length) {
                const activities = document.createElement('div');
                activities.className = 'entry-activities';
                entry.activities.forEach((activity) => {
                    const activityNode = document.createElement('span');
                    appendHighlighted(activityNode, activity, state.query);
                    activities.append(activityNode);
                });
                item.append(activities);
            }
            if (!entry.note && !entry.noteTitle && !entry.activities.length) {
                const blank = document.createElement('p');
                blank.className = 'entry-empty';
                blank.textContent = 'A mood, without a note.';
                item.append(blank);
            }
            elements.timeline.append(item);
        });
    }

    function getCalendarEntries() {
        return state.entries.filter((entry) => matchesEntry(entry, { includeDate: false }));
    }

    function renderCalendar() {
        elements.calendar.replaceChildren();
        elements.calendarYear.textContent = state.calendarYear;
        const counts = new Map();
        getCalendarEntries()
            .filter((entry) => entry.date.startsWith(`${state.calendarYear}-`))
            .forEach((entry) => {
                const data = counts.get(entry.date) || { count: 0, score: 0 };
                data.count += 1;
                data.score += scoreMood(entry.mood);
                counts.set(entry.date, data);
            });

        for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
            const month = document.createElement('section');
            month.className = 'calendar-month';
            const name = document.createElement('h4');
            name.textContent = new Intl.DateTimeFormat('en-GB', { month: 'short' })
                .format(new Date(state.calendarYear, monthIndex, 1));
            month.append(name);

            const weekdays = document.createElement('div');
            weekdays.className = 'weekday-labels';
            ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((label) => {
                const day = document.createElement('span');
                day.textContent = label;
                weekdays.append(day);
            });
            month.append(weekdays);

            const days = document.createElement('div');
            days.className = 'month-days';
            const firstDay = new Date(state.calendarYear, monthIndex, 1);
            const offset = (firstDay.getDay() + 6) % 7;
            const dayCount = new Date(state.calendarYear, monthIndex + 1, 0).getDate();
            for (let blank = 0; blank < offset; blank += 1) days.append(document.createElement('span'));

            for (let dayNumber = 1; dayNumber <= dayCount; dayNumber += 1) {
                const date = `${state.calendarYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                const data = counts.get(date);
                const cell = document.createElement('button');
                cell.type = 'button';
                const metricClass = data
                    ? (state.calendarMetric === 'mood'
                        ? `mood-${moodToneByScore(data.score / data.count)}`
                        : `density-${Math.min(data.count, 4)}`)
                    : '';
                cell.className = `calendar-day${data ? ` has-entry ${metricClass}` : ''}`;
                cell.textContent = dayNumber;
                cell.title = data
                    ? `${prettyDate(date)} — ${pluralise(data.count, 'entry')}, average mood ${(data.score / data.count).toFixed(1)}/5`
                    : prettyDate(date);
                cell.disabled = !data;
                if (data) {
                    cell.addEventListener('click', () => {
                        state.from = date;
                        state.to = date;
                        elements.from.value = date;
                        elements.to.value = date;
                        render();
                        document.getElementById('timeline-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });
                }
                days.append(cell);
            }
            month.append(days);
            elements.calendar.append(month);
        }
    }

    function moodToneByScore(score) {
        return score <= 1.5 ? 'low' : score <= 2.5 ? 'blue' : score <= 3.5 ? 'steady' : score <= 4.5 ? 'good' : 'bright';
    }

    function makeInsightTitle(eyebrow, title) {
        const heading = document.createElement('div');
        heading.className = 'insight-heading';
        const label = document.createElement('p');
        label.className = 'eyebrow';
        label.textContent = eyebrow;
        const titleNode = document.createElement('h4');
        titleNode.textContent = title;
        heading.append(label, titleNode);
        return heading;
    }

    function renderMoodInsight(entries) {
        elements.moodInsight.replaceChildren(makeInsightTitle('moods', 'How the days felt'));
        const counts = new Map();
        entries.forEach((entry) => counts.set(entry.mood || 'Unlabelled', (counts.get(entry.mood || 'Unlabelled') || 0) + 1));
        const total = entries.length || 1;
        [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([mood, count]) => {
            const row = document.createElement('div');
            row.className = 'distribution-row';
            const label = document.createElement('span');
            label.textContent = mood;
            const bar = document.createElement('span');
            bar.className = `distribution-bar mood-${moodTone(mood)}`;
            bar.style.setProperty('--amount', `${(count / total) * 100}%`);
            const value = document.createElement('span');
            value.textContent = count;
            row.append(label, bar, value);
            elements.moodInsight.append(row);
        });
    }

    function renderTrendInsight(entries) {
        elements.trendInsight.replaceChildren(makeInsightTitle('mood through time', 'The long line'));
        const byMonth = new Map();
        entries.forEach((entry) => {
            const key = entry.date.slice(0, 7);
            const item = byMonth.get(key) || { score: 0, count: 0 };
            item.score += scoreMood(entry.mood);
            item.count += 1;
            byMonth.set(key, item);
        });
        const points = [...byMonth.entries()].sort(([first], [second]) => first.localeCompare(second)).slice(-18);
        if (points.length < 2) {
            const message = document.createElement('p');
            message.className = 'insight-copy';
            message.textContent = 'More than one month of entries will draw a mood line here.';
            elements.trendInsight.append(message);
            return;
        }
        const width = 300;
        const height = 76;
        const coordinates = points.map(([, item], index) => {
            const x = (index / (points.length - 1)) * width;
            const y = height - (((item.score / item.count) - 1) / 4) * height;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ');
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'trend-line');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', 'Average mood by month');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        path.setAttribute('points', coordinates);
        svg.append(path);
        elements.trendInsight.append(svg);
        const caption = document.createElement('p');
        caption.className = 'insight-copy';
        caption.textContent = `${points.length} months shown, from ${points[0][0]} to ${points.at(-1)[0]}.`;
        elements.trendInsight.append(caption);
    }

    function renderActivityInsight(entries) {
        elements.activityInsight.replaceChildren(makeInsightTitle('recurring details', 'What filled the days'));
        const counts = new Map();
        entries.forEach((entry) => entry.activities.forEach((activity) => {
            counts.set(activity, (counts.get(activity) || 0) + 1);
        }));
        const activities = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
        if (!activities.length) {
            const message = document.createElement('p');
            message.className = 'insight-copy';
            message.textContent = 'Activities will appear here once the selected entries include them.';
            elements.activityInsight.append(message);
            return;
        }
        const list = document.createElement('div');
        list.className = 'activity-list';
        activities.forEach(([activity, count]) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.textContent = `${activity} · ${count}`;
            item.addEventListener('click', () => {
                setEntryQuery(activity);
            });
            list.append(item);
        });
        elements.activityInsight.append(list);
    }

    function renderAssociationInsight(entries) {
        elements.associationInsight.replaceChildren(makeInsightTitle('a small association', 'What tended to lift or lower'));
        const activities = new Map();
        entries.forEach((entry) => entry.activities.forEach((activity) => {
            const data = activities.get(activity) || { score: 0, count: 0 };
            data.score += scoreMood(entry.mood);
            data.count += 1;
            activities.set(activity, data);
        }));
        const candidates = [...activities.entries()].filter(([, data]) => data.count >= 2)
            .map(([activity, data]) => ({ activity, count: data.count, average: data.score / data.count }));
        if (!candidates.length) {
            const message = document.createElement('p');
            message.className = 'insight-copy';
            message.textContent = 'When an activity occurs twice, its average mood association will appear here.';
            elements.associationInsight.append(message);
            return;
        }
        candidates.sort((first, second) => second.average - first.average);
        const high = candidates[0];
        const low = candidates.at(-1);
        const message = document.createElement('p');
        message.className = 'insight-copy';
        message.textContent = high.activity === low.activity
            ? `${high.activity} appears ${high.count} times, with an average mood of ${high.average.toFixed(1)} out of 5.`
            : `${high.activity} appears with the highest average mood (${high.average.toFixed(1)}/5); ${low.activity} with the lowest (${low.average.toFixed(1)}/5).`;
        elements.associationInsight.append(message);
    }

    function renderInsights(entries) {
        renderMoodInsight(entries);
        renderTrendInsight(entries);
        renderActivityInsight(entries);
        renderAssociationInsight(entries);
    }

    function svgNode(name, attributes = {}) {
        const node = document.createElementNS('http://www.w3.org/2000/svg', name);
        Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
        return node;
    }

    function appendPatternHeading(container, eyebrow, title, copy) {
        const heading = document.createElement('div');
        heading.className = 'pattern-heading';
        const label = document.createElement('p');
        label.className = 'eyebrow';
        label.textContent = eyebrow;
        const titleNode = document.createElement('h4');
        titleNode.textContent = title;
        heading.append(label, titleNode);
        if (copy) {
            const copyNode = document.createElement('p');
            copyNode.className = 'insight-copy';
            copyNode.textContent = copy;
            heading.append(copyNode);
        }
        container.append(heading);
    }

    function periodRange(key, grouping) {
        const start = grouping === 'week' ? new Date(`${key}T12:00:00`) : new Date(`${key}-01T12:00:00`);
        const end = new Date(start);
        if (grouping === 'week') {
            end.setDate(start.getDate() + 6);
        } else {
            end.setMonth(start.getMonth() + 1, 0);
        }
        const format = (date) => [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, '0'),
            String(date.getDate()).padStart(2, '0')
        ].join('-');
        return { from: format(start), to: format(end) };
    }

    function selectEntries(predicate) {
        predicate();
        activateView('journal');
        render();
        document.getElementById('timeline-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function selectConnection(update) {
        update();
        state.connectionFocusDate = '';
        if (state.activeView !== 'connections') activateView('connections');
        else renderConnections();
        document.getElementById('connections-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function selectConnectionEvidence(date) {
        state.connectionFocusDate = date;
        renderConnections();
    }

    function renderCorrelations(entries) {
        elements.correlationInsight.replaceChildren();
        appendPatternHeading(elements.correlationInsight, 'worth noticing', 'Patterns with enough evidence', 'These comparisons describe this journal; they do not explain mood or predict outcomes.');
        const correlations = window.DaylioAnalysis.correlationCandidates(entries);
        if (!correlations.length) {
            const empty = document.createElement('p');
            empty.className = 'insight-copy';
            empty.textContent = 'This needs at least five matching and five comparison entries before it makes a claim.';
            elements.correlationInsight.append(empty);
            return;
        }
        const list = document.createElement('ol');
        list.className = 'correlation-list';
        correlations.forEach((correlation) => {
            const item = document.createElement('li');
            const strong = document.createElement('strong');
            strong.textContent = correlation.label;
            const statement = document.createElement('span');
            const direction = correlation.difference >= 0 ? 'higher' : 'lower';
            statement.textContent = ` averaged ${Math.abs(correlation.difference).toFixed(1)} mood points ${direction} than the other ${correlation.comparisonCount} entries (${correlation.count} matching entries; ${correlation.averageMood.toFixed(1)}/5 vs ${correlation.comparisonMood.toFixed(1)}/5).`;
            item.append(strong, statement);
            list.append(item);
        });
        elements.correlationInsight.append(list);
    }

    function renderPatterns(entries) {
        const cadence = window.DaylioAnalysis.cadence(entries, state.patternGrouping);
        window.DaylioCharts.renderCadence('cadence-chart', cadence, (point) => selectEntries(() => {
            state.from = point.from;
            state.to = point.to;
            elements.from.value = point.from;
            elements.to.value = point.to;
        }));

        const moodGroups = window.DaylioAnalysis.moodGroups(entries, (entry) => entry.mood || 'Unlabelled')
            .sort((first, second) => scoreMood(first.key) - scoreMood(second.key));
        window.DaylioCharts.renderBar('length-mood-chart', moodGroups.map((group) => ({
            label: group.key,
            value: group.medianWords,
            group
        })), {
            label: 'Median words',
            colour: '#728293',
            tooltip: (item) => `${item.value.toFixed(0)} median words from ${item.group.count} entries`,
            onSelect: (item) => selectEntries(() => {
                state.mood = item.label === 'Unlabelled' ? '' : item.label;
                elements.mood.value = state.mood;
            })
        });

        const weekdays = window.DaylioAnalysis.moodByWeekday(entries).filter((group) => group.count);
        window.DaylioCharts.renderBar('weekday-chart', weekdays.map((group) => ({
            label: group.label,
            value: group.averageMood,
            group
        })), {
            label: 'Average mood',
            colour: '#a36d74',
            min: 1,
            max: 5,
            tooltip: (item) => `${item.value.toFixed(1)}/5 from ${item.group.count} entries`,
            onSelect: (item) => selectEntries(() => { state.weekday = item.group.key; })
        });

        const times = window.DaylioAnalysis.moodByTimeOfDay(entries).filter((group) => group.count);
        window.DaylioCharts.renderBar('time-chart', times.map((group) => ({
            label: group.label,
            value: group.averageMood,
            group
        })), {
            label: 'Average mood',
            colour: '#b18452',
            min: 1,
            max: 5,
            tooltip: (item) => `${item.value.toFixed(1)}/5 from ${item.group.count} entries`,
            onSelect: (item) => selectEntries(() => { state.timeBucket = item.group.key; })
        });

        const radarDatasets = state.radarYears.map((year) => ({
            label: String(year),
            values: window.DaylioAnalysis.hobbyProfile(state.entries, year, state.radarTargets)
        }));
        window.DaylioCharts.renderRadar('hobby-radar-chart', radarDatasets);
        renderCorrelations(entries);
    }

    function getConnectionSource() {
        return state.entries.filter((entry) => !state.connectionMood || entry.mood === state.connectionMood);
    }

    function renderConnectionProfile(profile) {
        elements.connectionProfile.replaceChildren();
        const heading = document.createElement('div');
        heading.className = 'connection-heading';
        const title = document.createElement('h4');
        title.textContent = `“${profile.query}”`;
        const summary = document.createElement('p');
        summary.className = 'insight-copy';
        summary.textContent = `appears in ${pluralise(profile.matches.length, 'entry')} across ${pluralise(profile.activeMonths, 'active month')}.`;
        const viewEntries = document.createElement('button');
        viewEntries.type = 'button';
        viewEntries.className = 'text-button';
        viewEntries.textContent = 'View matching entries';
        viewEntries.addEventListener('click', () => selectEntries(() => {
            state.query = state.connectionQuery;
            elements.search.value = state.connectionQuery;
            if (state.connectionMood) {
                state.mood = state.connectionMood;
                elements.mood.value = state.connectionMood;
            }
        }));
        heading.append(title, summary, viewEntries);
        elements.connectionProfile.append(heading);

        const details = document.createElement('dl');
        details.className = 'connection-details';
        [
            ['first mention', profile.first ? prettyDate(profile.first.date) : '—'],
            ['latest mention', profile.last ? prettyDate(profile.last.date) : '—'],
            ['times mentioned', profile.matches.length],
            ['active months', profile.activeMonths]
        ].forEach(([label, value]) => {
            const group = document.createElement('div');
            const term = document.createElement('dt');
            const description = document.createElement('dd');
            term.textContent = label;
            description.textContent = value;
            group.append(term, description);
            details.append(group);
        });
        elements.connectionProfile.append(details);

        const frequency = document.createElement('div');
        frequency.className = 'connection-frequency';
        const frequencyTitle = document.createElement('p');
        frequencyTitle.className = 'eyebrow';
        frequencyTitle.textContent = 'frequency by month';
        const chartWrap = document.createElement('div');
        chartWrap.className = 'chart-canvas-wrap connection-frequency-chart';
        const canvas = document.createElement('canvas');
        canvas.id = 'connection-frequency-chart';
        canvas.setAttribute('aria-label', `Monthly frequency of ${profile.query}`);
        chartWrap.append(canvas);
        frequency.append(frequencyTitle, chartWrap);
        window.DaylioCharts.renderBar('connection-frequency-chart', profile.monthlyFrequency.map((point) => ({
            label: point.key,
            value: point.count,
            point
        })), {
            label: 'Mentions',
            colour: '#8b5a83',
            tooltip: (item) => pluralise(item.value, 'mention'),
            onSelect: (item) => selectEntries(() => {
                const point = item.point;
                const range = periodRange(point.key, 'month');
                state.from = range.from;
                state.to = range.to;
                elements.from.value = range.from;
                elements.to.value = range.to;
            })
        });
        elements.connectionProfile.append(frequency);
    }

    function renderConstellation(profile) {
        elements.connectionConstellation.replaceChildren();
        const width = 680;
        const height = 430;
        const center = { x: width / 2, y: height / 2 };
        const inner = [
            ...profile.activities.map(([label, count]) => ({ label, count, type: 'activity', ring: 'inner' })),
            ...profile.moods.map(([label, count]) => ({ label, count, type: 'mood', ring: 'inner' }))
        ].slice(0, 7);
        const outer = profile.terms.map(([label, count]) => ({ label, count, type: 'term', ring: 'outer' })).slice(0, 6);
        const nodes = [...inner, ...outer];
        const svg = svgNode('svg', {
            class: 'constellation-svg',
            viewBox: `0 0 ${width} ${height}`,
            role: 'img',
            'aria-label': `Connections related to ${profile.query}`
        });
        const maxCount = Math.max(...nodes.map((node) => node.count), 1);

        nodes.forEach((node, index) => {
            const inInnerRing = node.ring === 'inner';
            const groupNodes = inInnerRing ? inner : outer;
            const localIndex = inInnerRing ? index : index - inner.length;
            const angle = (-Math.PI / 2) + (localIndex / Math.max(groupNodes.length, 1)) * Math.PI * 2;
            const radius = inInnerRing ? 116 : 184;
            node.x = center.x + Math.cos(angle) * radius;
            node.y = center.y + Math.sin(angle) * radius;
            svg.append(svgNode('line', {
                x1: center.x, y1: center.y, x2: node.x, y2: node.y,
                class: `constellation-edge edge-${node.type}`,
                'stroke-width': Math.max(1, (node.count / maxCount) * 5)
            }));
        });

        const centerGroup = svgNode('g', { class: 'constellation-node constellation-center' });
        centerGroup.append(svgNode('circle', { cx: center.x, cy: center.y, r: 44 }));
        const centerText = svgNode('text', { x: center.x, y: center.y + 4, 'text-anchor': 'middle' });
        centerText.textContent = profile.query.length > 14 ? `${profile.query.slice(0, 13)}…` : profile.query;
        centerGroup.append(centerText);
        svg.append(centerGroup);

        nodes.forEach((node) => {
            const group = svgNode('g', {
                class: `constellation-node constellation-${node.type}`,
                tabindex: '0',
                role: 'button',
                'aria-label': `${node.label}, shared by ${pluralise(node.count, 'entry')}`
            });
            const nodeRadius = 12 + (node.count / maxCount) * 12;
            group.append(svgNode('circle', { cx: node.x, cy: node.y, r: nodeRadius }));
            const label = svgNode('text', {
                x: node.x,
                y: node.y + nodeRadius + 13,
                'text-anchor': 'middle'
            });
            label.textContent = `${node.label} · ${node.count}`;
            group.append(label);
            const select = () => selectConnection(() => {
                if (node.type === 'mood') {
                    state.connectionMood = node.label;
                } else {
                    state.connectionQuery = node.label;
                    state.connectionMood = '';
                    elements.connectionSearch.value = node.label;
                }
            });
            group.addEventListener('click', select);
            group.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    select();
                }
            });
            svg.append(group);
        });
        elements.connectionConstellation.append(svg);
    }

    function renderMentions(profile) {
        elements.connectionMentions.replaceChildren();
        profile.matches.forEach((entry) => {
            const mention = document.createElement('button');
            mention.type = 'button';
            mention.className = `mention-item${entry.date === state.connectionFocusDate ? ' is-focused' : ''}`;
            const date = document.createElement('time');
            date.dateTime = entry.date;
            date.textContent = prettyDate(entry.date);
            const excerpt = document.createElement('span');
            excerpt.textContent = (entry.noteTitle || entry.note || entry.activities.join(', ') || entry.mood).slice(0, 150);
            mention.append(date, excerpt);
            mention.addEventListener('click', () => selectConnectionEvidence(entry.date));
            elements.connectionMentions.append(mention);
        });
    }

    function renderConnections() {
        const query = state.connectionQuery.trim();
        if (!query) {
            window.DaylioCharts.destroy('safe-harbor-chart');
            elements.connectionEmpty.hidden = false;
            elements.connectionResults.hidden = true;
            return;
        }
        const profile = window.DaylioAnalysis.mentionProfile(getConnectionSource(), query);
        if (!profile.matches.length) {
            window.DaylioCharts.destroy('safe-harbor-chart');
            elements.connectionEmpty.hidden = false;
            elements.connectionEmpty.textContent = `No entries mention “${query}”.`;
            elements.connectionResults.hidden = true;
            return;
        }
        elements.connectionEmpty.hidden = true;
        elements.connectionResults.hidden = false;
        renderConnectionProfile(profile);
        renderConstellation(profile);
        window.DaylioCharts.renderScatter('safe-harbor-chart', profile.matches, selectConnectionEvidence);
        renderMentions(profile);
    }

    function activateView(view) {
        state.activeView = view;
        elements.tabs.forEach((tab) => {
            const active = tab.dataset.explorerView === view;
            tab.classList.toggle('is-active', active);
            tab.setAttribute('aria-pressed', String(active));
        });
        elements.panels.forEach((panel) => {
            const active = panel.dataset.panel === view;
            panel.hidden = !active;
            panel.classList.toggle('is-active', active);
        });
        if (view === 'patterns') renderPatterns(state.entries);
        if (view === 'connections') renderConnections();
        if (view === 'review') renderAnnualReview();
    }

    function updateClearButton() {
        const active = state.query || state.mood || state.from || state.to || state.dreamsOnly
            || state.weekday !== null || state.timeBucket;
        elements.clear.hidden = !active;
    }

    function selectDate(date) {
        selectEntries(() => {
            state.from = date;
            state.to = date;
            elements.from.value = date;
            elements.to.value = date;
        });
    }

    function selectHalfYear(period) {
        const [year, part] = period.split('-');
        const from = `${year}-${part === 'P1' ? '01-01' : '07-01'}`;
        const to = `${year}-${part === 'P1' ? '06-30' : '12-31'}`;
        selectEntries(() => {
            state.from = from;
            state.to = to;
            elements.from.value = from;
            elements.to.value = to;
        });
    }

    function renderChartDashboard(entries) {
        const movingPoints = window.DaylioAnalysis.rollingMood(entries);
        const moodRendered = window.DaylioCharts.renderMoodMoving('mood-moving-chart', movingPoints, selectDate);
        if (!moodRendered) {
            elements.moodMovingChart.parentElement.classList.add('is-empty');
        } else {
            elements.moodMovingChart.parentElement.classList.remove('is-empty');
        }

        const socialData = window.DaylioAnalysis.socialShift(entries, state.spheres, state.socialShifterMode);
        const socialRendered = window.DaylioCharts.renderSocialShift('social-shifter-chart', socialData, selectHalfYear);
        if (!state.spheres.length) {
            elements.socialShifterCopy.textContent = 'Add local groups from “people & groups” to compare mentions across half-years.';
        } else if (!socialRendered) {
            elements.socialShifterCopy.textContent = 'None of the current entries match your saved group terms.';
        } else {
            elements.socialShifterCopy.textContent = state.socialShifterMode === 'groups'
                ? 'Each bar shows the share of matched group mentions. Hide a legend item to recalculate the remaining shares.'
                : 'Each bar shows individual configured terms. Hide a legend item to recalculate the remaining shares.';
        }
        elements.socialShifterChart.parentElement.classList.toggle('is-empty', !socialRendered);
    }

    function downloadSocialData() {
        const data = window.DaylioAnalysis.socialShift(state.entries, state.spheres, state.socialShifterMode);
        if (!data.labels.length || !data.datasets.length) return;
        const headers = ['Half Year', ...data.datasets.flatMap((dataset) => [`${dataset.label} raw`, `${dataset.label} %`])];
        const rows = data.labels.map((label, index) => {
            const total = data.datasets.reduce((sum, dataset) => sum + dataset.values[index], 0);
            return [label, ...data.datasets.flatMap((dataset) => {
                const value = dataset.values[index];
                return [value, total ? ((value / total) * 100).toFixed(2) : '0.00'];
            })];
        });
        const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `daylio-social-${state.socialShifterMode}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }

    function populateYearSelects() {
        const years = [...new Set(state.entries.map((entry) => entry.date.slice(0, 4)))].sort().reverse();
        const current = elements.reviewYear.value;
        elements.reviewYear.replaceChildren();
        years.forEach((year) => elements.reviewYear.add(new Option(year, year)));
        elements.reviewYear.value = years.includes(current) ? current : years[0];
        state.radarYears = state.radarYears.filter((year) => years.includes(String(year)));
        if (!state.radarYears.length && years[0]) state.radarYears = [Number(years[0])];
        elements.radarYearPicker.replaceChildren();
        years.forEach((year) => {
            const label = document.createElement('label');
            label.className = 'radar-year-option';
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.value = year;
            input.checked = state.radarYears.includes(Number(year));
            input.addEventListener('change', () => {
                const selected = [...elements.radarYearPicker.querySelectorAll('input:checked')].map((item) => Number(item.value));
                if (selected.length > 5) {
                    input.checked = false;
                    return;
                }
                state.radarYears = selected;
                renderPatterns(state.entries);
            });
            label.append(input, document.createTextNode(year));
            elements.radarYearPicker.append(label);
        });
    }

    function reviewStat(label, value) {
        const item = document.createElement('div');
        item.className = 'review-stat';
        const labelNode = document.createElement('dt');
        const valueNode = document.createElement('dd');
        labelNode.textContent = label;
        valueNode.textContent = value || '—';
        item.append(labelNode, valueNode);
        return item;
    }

    function renderAnnualReview() {
        const year = Number(elements.reviewYear.value);
        const summary = window.DaylioAnalysis.annualSummary(state.entries, state.spheres, year);
        elements.annualReport.replaceChildren();
        if (!summary.entries.length) {
            elements.annualReport.textContent = 'No entries from this year are available.';
            return;
        }
        const heading = document.createElement('header');
        heading.className = 'annual-report-heading';
        const title = document.createElement('h3');
        title.textContent = `${year}, in small days`;
        const copy = document.createElement('p');
        copy.textContent = `${pluralise(summary.entries.length, 'entry')} kept in this year.`;
        heading.append(title, copy);
        const stats = document.createElement('dl');
        stats.className = 'review-stats';
        stats.append(
            reviewStat('most-used group', summary.topSphere ? `${summary.topSphere.label} · ${summary.topSphere.count}` : 'Add people & groups'),
            reviewStat('top activity', summary.topActivity ? `${summary.topActivity[0]} · ${summary.topActivity[1]}` : '—'),
            reviewStat('longest writing month', summary.longestMonth?.key),
            reviewStat('highest mood month', summary.highestMonth ? `${summary.highestMonth.key} · ${summary.highestMonth.averageMood.toFixed(1)}/5` : '—'),
            reviewStat('lowest mood month', summary.lowestMonth ? `${summary.lowestMonth.key} · ${summary.lowestMonth.averageMood.toFixed(1)}/5` : '—'),
            reviewStat('average mood', `${summary.averageMood.toFixed(1)}/5`)
        );
        const chartGrid = document.createElement('div');
        chartGrid.className = 'review-chart-grid';
        const moodWrap = document.createElement('div');
        moodWrap.className = 'chart-canvas-wrap';
        const moodCanvas = document.createElement('canvas');
        moodCanvas.id = 'review-mood-chart';
        moodCanvas.setAttribute('aria-label', `Mood moving average for ${year}`);
        moodWrap.append(moodCanvas);
        const socialWrap = document.createElement('div');
        socialWrap.className = 'chart-canvas-wrap';
        const socialCanvas = document.createElement('canvas');
        socialCanvas.id = 'review-social-chart';
        socialCanvas.setAttribute('aria-label', `Social groups for ${year}`);
        socialWrap.append(socialCanvas);
        chartGrid.append(moodWrap, socialWrap);
        elements.annualReport.append(heading, stats, chartGrid);
        window.DaylioCharts.renderMoodMoving('review-mood-chart', window.DaylioAnalysis.rollingMood(summary.entries), selectDate);
        window.DaylioCharts.renderSocialShift('review-social-chart', window.DaylioAnalysis.socialShift(summary.entries, state.spheres), selectHalfYear);
    }

    function render() {
        const journalEntries = getFilteredEntries();
        renderTimeline(journalEntries);
        renderCalendar();
        renderInsights(journalEntries);
        renderPatterns(state.entries);
        renderChartDashboard(state.entries);
        renderConnections();
        if (state.activeView === 'review') renderAnnualReview();
        updateClearButton();
        elements.dreams.setAttribute('aria-pressed', String(state.dreamsOnly));
        elements.dreams.classList.toggle('is-active', state.dreamsOnly);
    }

    function resetFilters() {
        state.query = '';
        state.mood = '';
        state.from = '';
        state.to = '';
        state.dreamsOnly = false;
        state.weekday = null;
        state.timeBucket = '';
        elements.search.value = '';
        elements.mood.value = '';
        elements.from.value = '';
        elements.to.value = '';
        render();
    }

    async function readJournal(event) {
        const file = event.target.files[0];
        if (!file) return;
        elements.status.textContent = 'Reading your journal…';
        try {
            state.rawEntries = window.parseDaylioCSV(await file.text());
            refreshEnrichedEntries();
            state.calendarYear = Number.parseInt(state.entries.at(-1).date.slice(0, 4), 10);
            const first = state.entries[0].date;
            const last = state.entries.at(-1).date;
            elements.range.textContent = `${prettyDate(first)} — ${prettyDate(last)}`;
            buildMoodOptions();
            populateYearSelects();
            renderRadarTargets();
            resetFilters();
            elements.uploadForm.hidden = true;
            window.daylioShowMode('explore');
            elements.shell.hidden = false;
            activateView('patterns');
            window.dispatchEvent(new CustomEvent('daylio:entries-loaded', { detail: { entries: state.rawEntries } }));
            const warnings = window.getDaylioParseWarnings();
            elements.status.textContent = `${pluralise(state.entries.length, 'entry')} opened privately in this browser.${warnings.length ? ` ${pluralise(warnings.length, 'row')} skipped because it had no valid date.` : ''}`;
        } catch (error) {
            elements.status.textContent = error.message || 'This CSV could not be read.';
        } finally {
            event.target.value = '';
        }
    }

    let searchTimer;
    function setEntryQuery(value) {
        state.query = value;
        elements.search.value = value;
        render();
    }

    function setConnectionQuery(value) {
        state.connectionQuery = value;
        state.connectionMood = '';
        elements.connectionSearch.value = value;
        state.connectionFocusDate = '';
        renderConnections();
    }

    elements.upload.addEventListener('change', readJournal);
    elements.search.addEventListener('input', () => {
        window.clearTimeout(searchTimer);
        searchTimer = window.setTimeout(() => {
            setEntryQuery(elements.search.value);
        }, 120);
    });
    elements.connectionSearch.addEventListener('input', () => {
        window.clearTimeout(searchTimer);
        searchTimer = window.setTimeout(() => {
            setConnectionQuery(elements.connectionSearch.value);
        }, 120);
    });
    elements.mood.addEventListener('change', () => { state.mood = elements.mood.value; render(); });
    elements.from.addEventListener('change', () => { state.from = elements.from.value; render(); });
    elements.to.addEventListener('change', () => { state.to = elements.to.value; render(); });
    elements.dreams.addEventListener('click', () => { state.dreamsOnly = !state.dreamsOnly; render(); });
    elements.clear.addEventListener('click', resetFilters);
    elements.sort.addEventListener('click', () => {
        state.newestFirst = !state.newestFirst;
        elements.sort.textContent = state.newestFirst ? 'newest first' : 'oldest first';
        elements.sort.setAttribute('aria-pressed', String(state.newestFirst));
        renderTimeline(getFilteredEntries());
    });
    elements.tabs.forEach((tab) => tab.addEventListener('click', () => {
        activateView(tab.dataset.explorerView);
    }));
    elements.calendarMetric.addEventListener('change', () => {
        state.calendarMetric = elements.calendarMetric.value;
        renderCalendar();
    });
    elements.patternGrouping.addEventListener('change', () => {
        state.patternGrouping = elements.patternGrouping.value;
        renderPatterns(state.entries);
    });
    elements.socialShifterMode.addEventListener('change', () => {
        state.socialShifterMode = elements.socialShifterMode.value;
        renderChartDashboard(state.entries);
    });
    elements.downloadSocialData.addEventListener('click', downloadSocialData);
    elements.radarCopyGroups.addEventListener('click', () => {
        const copied = state.spheres.map((sphere) => ({
            id: `sphere-${sphere.id}`,
            name: sphere.name,
            terms: sphere.terms
        }));
        if (!copied.length) return;
        state.radarTargets = window.DaylioSettings.replaceRadarTargets(copied);
        renderRadarTargets();
        renderPatterns(state.entries);
    });
    elements.radarTargetForm.addEventListener('submit', (event) => {
        event.preventDefault();
        state.radarTargets = elements.radarTargetId.value
            ? window.DaylioSettings.updateRadarTarget(elements.radarTargetId.value, elements.radarTargetName.value, elements.radarTargetTerms.value)
            : window.DaylioSettings.addRadarTarget(elements.radarTargetName.value, elements.radarTargetTerms.value);
        elements.radarTargetId.value = '';
        elements.radarTargetName.value = '';
        elements.radarTargetTerms.value = '';
        elements.radarTargetSave.textContent = 'Save target';
        renderRadarTargets();
        renderPatterns(state.entries);
    });
    elements.reviewYear.addEventListener('change', renderAnnualReview);
    elements.printReview.addEventListener('click', () => {
        activateView('review');
        window.print();
    });
    function openSphereSettings() {
        renderSphereSettings();
        elements.sphereDialog.showModal();
    }
    elements.sphereOpen.addEventListener('click', openSphereSettings);
    elements.sphereClose.addEventListener('click', () => elements.sphereDialog.close());
    elements.sphereDialog.addEventListener('click', (event) => {
        if (event.target === elements.sphereDialog) elements.sphereDialog.close();
    });
    window.addEventListener('daylio:open-groups', openSphereSettings);
    window.addEventListener('daylio:status', (event) => {
        elements.status.textContent = event.detail;
    });
    elements.sphereForm.addEventListener('submit', (event) => {
        event.preventDefault();
        state.spheres = elements.sphereId.value
            ? window.DaylioSettings.update(elements.sphereId.value, elements.sphereName.value, elements.sphereTerms.value)
            : window.DaylioSettings.add(elements.sphereName.value, elements.sphereTerms.value);
        elements.sphereId.value = '';
        elements.sphereName.value = '';
        elements.sphereTerms.value = '';
        elements.sphereSave.textContent = 'Save group';
        refreshEnrichedEntries();
        renderSphereSettings();
        render();
    });
    elements.sphereClear.addEventListener('click', () => {
        state.spheres = window.DaylioSettings.clear();
        refreshEnrichedEntries();
        renderSphereSettings();
        render();
    });
    elements.sphereExport.addEventListener('click', () => {
        const blob = new Blob([window.DaylioSettings.exportJson()], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'daylio-people-and-groups.json';
        link.click();
        URL.revokeObjectURL(url);
    });
    elements.sphereImport.addEventListener('change', async () => {
        const file = elements.sphereImport.files[0];
        if (!file) return;
        try {
            state.spheres = window.DaylioSettings.importJson(await file.text());
            refreshEnrichedEntries();
            renderSphereSettings();
            render();
        } catch {
            elements.status.textContent = 'That settings file could not be imported.';
        } finally {
            elements.sphereImport.value = '';
        }
    });
    elements.previousYear.addEventListener('click', () => { state.calendarYear -= 1; renderCalendar(); });
    elements.nextYear.addEventListener('click', () => { state.calendarYear += 1; renderCalendar(); });
    [elements.newJournal, elements.changeFile].forEach((button) => button.addEventListener('click', () => {
        elements.shell.hidden = true;
        elements.uploadForm.hidden = false;
        elements.status.textContent = '';
        window.DaylioCharts.destroyAll();
        window.daylioShowMode('landing');
        elements.upload.click();
    }));
})();
