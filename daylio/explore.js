// Client-side journal explorer. Daylio data is kept in memory for this session only.

(() => {
    const elements = {
        upload: document.getElementById('explore-upload'),
        uploadForm: document.getElementById('explore-upload-form'),
        status: document.getElementById('explore-status'),
        shell: document.getElementById('explorer-shell'),
        range: document.getElementById('journal-range'),
        search: document.getElementById('entry-search'),
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
        connectionEmpty: document.getElementById('connection-empty'),
        connectionResults: document.getElementById('connection-results'),
        connectionProfile: document.getElementById('connection-profile'),
        connectionConstellation: document.getElementById('connection-constellation'),
        connectionMentions: document.getElementById('connection-mentions'),
        newJournal: document.getElementById('new-journal'),
        changeFile: document.getElementById('return-to-explorer-upload')
    };

    const state = {
        entries: [],
        query: '',
        mood: '',
        from: '',
        to: '',
        dreamsOnly: false,
        newestFirst: true,
        calendarYear: new Date().getFullYear(),
        calendarMetric: 'density',
        patternGrouping: 'month',
        activeView: 'journal',
        weekday: null,
        timeBucket: ''
    };

    const moodScore = {
        awful: 1, bad: 1, sad: 2, tired: 2, 'not good': 2,
        okay: 3, alright: 3, meh: 3, neutral: 3,
        good: 4, great: 5, excited: 5, rad: 5, amazing: 5
    };

    function scoreMood(mood) {
        return moodScore[String(mood).toLowerCase()] || 3;
    }

    function moodTone(mood) {
        const score = scoreMood(mood);
        return score <= 1 ? 'low' : score === 2 ? 'blue' : score === 3 ? 'steady' : score === 4 ? 'good' : 'bright';
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

    function entryMatches(entry) {
        const term = state.query.trim().toLocaleLowerCase();
        const searchable = entry.searchableText || [entry.mood, entry.noteTitle, entry.note, ...entry.activities].join(' ').toLocaleLowerCase();
        return (!term || searchable.includes(term))
            && (!state.mood || entry.mood === state.mood)
            && (!state.from || entry.date >= state.from)
            && (!state.to || entry.date <= state.to)
            && (!state.dreamsOnly || entry.activities.some((activity) => /dream/i.test(activity)))
            && (state.weekday === null || entry.weekday === state.weekday)
            && (!state.timeBucket || entry.timeBucket === state.timeBucket);
    }

    function getFilteredEntries() {
        return state.entries.filter(entryMatches);
    }

    function buildMoodOptions() {
        const currentValue = elements.mood.value;
        const moods = [...new Set(state.entries.map((entry) => entry.mood).filter(Boolean))]
            .sort((first, second) => first.localeCompare(second));
        elements.mood.replaceChildren(new Option('Every mood', ''));
        moods.forEach((mood) => elements.mood.add(new Option(mood, mood)));
        elements.mood.value = currentValue;
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
        return state.entries.filter((entry) => {
            const term = state.query.trim().toLocaleLowerCase();
            const searchable = entry.searchableText || [entry.mood, entry.noteTitle, entry.note, ...entry.activities].join(' ').toLocaleLowerCase();
            return (!term || searchable.includes(term))
                && (!state.mood || entry.mood === state.mood)
                && (!state.dreamsOnly || entry.activities.some((activity) => /dream/i.test(activity)))
                && (state.weekday === null || entry.weekday === state.weekday)
                && (!state.timeBucket || entry.timeBucket === state.timeBucket);
        });
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
                state.query = activity;
                elements.search.value = activity;
                render();
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

    function appendBarChart(container, items, options) {
        if (!items.length) {
            const empty = document.createElement('p');
            empty.className = 'insight-copy';
            empty.textContent = 'There is not enough data in this selection yet.';
            container.append(empty);
            return;
        }

        const width = Math.max(460, items.length * 34);
        const height = 188;
        const left = 28;
        const bottom = 31;
        const chartHeight = 124;
        const maxValue = Math.max(...items.map(options.value), 1);
        const step = (width - left - 12) / items.length;
        const barWidth = Math.max(4, step * 0.66);
        const svg = svgNode('svg', {
            class: 'pattern-chart',
            viewBox: `0 0 ${width} ${height}`,
            role: 'img',
            'aria-label': options.ariaLabel
        });
        svg.append(svgNode('line', { x1: left, y1: chartHeight, x2: width - 10, y2: chartHeight, class: 'chart-axis' }));

        items.forEach((item, index) => {
            const value = options.value(item);
            const barHeight = (value / maxValue) * (chartHeight - 8);
            const x = left + index * step + (step - barWidth) / 2;
            const y = chartHeight - barHeight;
            const bar = svgNode('rect', {
                x: x.toFixed(2),
                y: y.toFixed(2),
                width: barWidth.toFixed(2),
                height: Math.max(barHeight, 1).toFixed(2),
                class: `chart-bar ${options.className || ''}`,
                tabindex: options.onSelect ? '0' : '-1',
                role: options.onSelect ? 'button' : 'presentation',
                'aria-label': `${options.label(item)}: ${options.valueLabel(item)}`
            });
            const title = svgNode('title');
            title.textContent = `${options.label(item)}: ${options.valueLabel(item)}`;
            bar.append(title);
            if (options.onSelect) {
                const select = () => options.onSelect(item);
                bar.addEventListener('click', select);
                bar.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        select();
                    }
                });
            }
            svg.append(bar);

            const labelInterval = Math.ceil(items.length / 8);
            if (index % labelInterval === 0 || index === items.length - 1) {
                const label = svgNode('text', {
                    x: (left + index * step + step / 2).toFixed(2),
                    y: height - 11,
                    class: 'chart-label',
                    'text-anchor': 'middle'
                });
                label.textContent = options.label(item);
                svg.append(label);
            }
        });
        container.append(svg);
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

    function renderCadence(entries) {
        elements.cadenceInsight.replaceChildren();
        appendPatternHeading(elements.cadenceInsight, 'writing cadence', 'How much, and how often', 'Bars show median words per entry; the companion line shows the number of entries in each period.');
        const points = window.DaylioAnalysis.cadence(entries, state.patternGrouping);
        const lengthLabel = document.createElement('p');
        lengthLabel.className = 'chart-caption';
        lengthLabel.textContent = 'Median entry length';
        elements.cadenceInsight.append(lengthLabel);
        appendBarChart(elements.cadenceInsight, points, {
            ariaLabel: 'Median entry length over time',
            value: (point) => point.medianWords,
            label: (point) => point.key,
            valueLabel: (point) => `${point.medianWords.toFixed(0)} median words across ${point.entryCount} entries`,
            className: 'chart-bar-length',
            onSelect: (point) => selectEntries(() => {
                const range = periodRange(point.key, state.patternGrouping);
                state.from = range.from;
                state.to = range.to;
                elements.from.value = range.from;
                elements.to.value = range.to;
            })
        });
        const frequencyLabel = document.createElement('p');
        frequencyLabel.className = 'chart-caption';
        frequencyLabel.textContent = 'Number of entries';
        elements.cadenceInsight.append(frequencyLabel);
        appendBarChart(elements.cadenceInsight, points, {
            ariaLabel: 'Entry frequency over time',
            value: (point) => point.entryCount,
            label: (point) => point.key,
            valueLabel: (point) => pluralise(point.entryCount, 'entry'),
            className: 'chart-bar-frequency',
            onSelect: (point) => selectEntries(() => {
                const range = periodRange(point.key, state.patternGrouping);
                state.from = range.from;
                state.to = range.to;
                elements.from.value = range.from;
                elements.to.value = range.to;
            })
        });
    }

    function renderLengthMood(entries) {
        elements.lengthMoodInsight.replaceChildren();
        appendPatternHeading(elements.lengthMoodInsight, 'writing and mood', 'How much you wrote', 'Median word count for each mood. Click a bar to read those entries.');
        const groups = window.DaylioAnalysis.moodGroups(entries, (entry) => entry.mood || 'Unlabelled')
            .sort((first, second) => scoreMood(first.key) - scoreMood(second.key));
        appendBarChart(elements.lengthMoodInsight, groups, {
            ariaLabel: 'Entry length by mood',
            value: (group) => group.medianWords,
            label: (group) => group.key,
            valueLabel: (group) => `${group.medianWords.toFixed(0)} median words from ${group.count} entries`,
            className: 'chart-bar-mood',
            onSelect: (group) => selectEntries(() => {
                state.mood = group.key === 'Unlabelled' ? '' : group.key;
                elements.mood.value = state.mood;
            })
        });
    }

    function renderRoutineChart(container, entries, data, title, copy, keyName) {
        container.replaceChildren();
        appendPatternHeading(container, 'time and routine', title, copy);
        appendBarChart(container, data.filter((group) => group.count), {
            ariaLabel: title,
            value: (group) => group.averageMood,
            label: (group) => group.label,
            valueLabel: (group) => `average mood ${group.averageMood.toFixed(1)} out of 5 from ${group.count} entries`,
            className: 'chart-bar-routine',
            onSelect: (group) => selectEntries(() => {
                if (keyName === 'weekday') state.weekday = group.key;
                if (keyName === 'time') state.timeBucket = group.key;
            })
        });
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
        renderCadence(entries);
        renderLengthMood(entries);
        renderRoutineChart(
            elements.weekdayInsight,
            entries,
            window.DaylioAnalysis.moodByWeekday(entries),
            'Mood by day of week',
            'Average mood from the entries recorded on each day. Click a bar to filter the journal.',
            'weekday'
        );
        renderRoutineChart(
            elements.timeInsight,
            entries,
            window.DaylioAnalysis.moodByTimeOfDay(entries),
            'Mood by time of day',
            'Morning, afternoon, evening, and night are based on the time in each Daylio entry.',
            'time'
        );
        renderCorrelations(entries);
    }

    function getConnectionSource() {
        return state.entries.filter((entry) => {
            return (!state.mood || entry.mood === state.mood)
                && (!state.from || entry.date >= state.from)
                && (!state.to || entry.date <= state.to)
                && (!state.dreamsOnly || entry.activities.some((activity) => /dream/i.test(activity)))
                && (state.weekday === null || entry.weekday === state.weekday)
                && (!state.timeBucket || entry.timeBucket === state.timeBucket);
        });
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
        heading.append(title, summary);
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
        frequency.append(frequencyTitle);
        appendBarChart(frequency, profile.monthlyFrequency, {
            ariaLabel: `Monthly frequency of ${profile.query}`,
            value: (point) => point.count,
            label: (point) => point.key,
            valueLabel: (point) => pluralise(point.count, 'mention'),
            className: 'chart-bar-mention',
            onSelect: (point) => selectEntries(() => {
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
            const select = () => selectEntries(() => {
                if (node.type === 'mood') {
                    state.mood = node.label;
                    elements.mood.value = node.label;
                } else {
                    state.query = node.label;
                    elements.search.value = node.label;
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
            mention.className = 'mention-item';
            const date = document.createElement('time');
            date.dateTime = entry.date;
            date.textContent = prettyDate(entry.date);
            const excerpt = document.createElement('span');
            excerpt.textContent = (entry.noteTitle || entry.note || entry.activities.join(', ') || entry.mood).slice(0, 150);
            mention.append(date, excerpt);
            mention.addEventListener('click', () => selectEntries(() => {
                state.from = entry.date;
                state.to = entry.date;
                elements.from.value = entry.date;
                elements.to.value = entry.date;
            }));
            elements.connectionMentions.append(mention);
        });
    }

    function renderConnections() {
        const query = state.query.trim();
        if (!query) {
            elements.connectionEmpty.hidden = false;
            elements.connectionResults.hidden = true;
            return;
        }
        const profile = window.DaylioAnalysis.mentionProfile(getConnectionSource(), query);
        if (!profile.matches.length) {
            elements.connectionEmpty.hidden = false;
            elements.connectionEmpty.textContent = `No entries mention “${query}” within the current filters.`;
            elements.connectionResults.hidden = true;
            return;
        }
        elements.connectionEmpty.hidden = true;
        elements.connectionResults.hidden = false;
        renderConnectionProfile(profile);
        renderConstellation(profile);
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
        if (view === 'patterns') renderPatterns(getFilteredEntries());
        if (view === 'connections') renderConnections();
    }

    function updateClearButton() {
        const active = state.query || state.mood || state.from || state.to || state.dreamsOnly
            || state.weekday !== null || state.timeBucket;
        elements.clear.hidden = !active;
    }

    function render() {
        const filteredEntries = getFilteredEntries();
        renderTimeline(filteredEntries);
        renderCalendar();
        renderInsights(filteredEntries);
        renderPatterns(filteredEntries);
        renderConnections();
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
            state.entries = window.DaylioAnalysis.enrichEntries(window.parseDaylioCSV(await file.text()))
                .map((entry) => ({ ...entry, moodScore: scoreMood(entry.mood) }));
            state.calendarYear = Number.parseInt(state.entries.at(-1).date.slice(0, 4), 10);
            const first = state.entries[0].date;
            const last = state.entries.at(-1).date;
            elements.range.textContent = `${prettyDate(first)} — ${prettyDate(last)}`;
            buildMoodOptions();
            resetFilters();
            elements.uploadForm.hidden = true;
            elements.shell.hidden = false;
            elements.status.textContent = `${pluralise(state.entries.length, 'entry')} opened privately in this browser.`;
        } catch (error) {
            elements.status.textContent = error.message || 'This CSV could not be read.';
        } finally {
            event.target.value = '';
        }
    }

    let searchTimer;
    elements.upload.addEventListener('change', readJournal);
    elements.search.addEventListener('input', () => {
        window.clearTimeout(searchTimer);
        searchTimer = window.setTimeout(() => {
            state.query = elements.search.value;
            render();
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
        renderPatterns(getFilteredEntries());
    });
    elements.previousYear.addEventListener('click', () => { state.calendarYear -= 1; renderCalendar(); });
    elements.nextYear.addEventListener('click', () => { state.calendarYear += 1; renderCalendar(); });
    [elements.newJournal, elements.changeFile].forEach((button) => button.addEventListener('click', () => {
        elements.shell.hidden = true;
        elements.uploadForm.hidden = false;
        elements.status.textContent = '';
        elements.upload.click();
    }));
})();
