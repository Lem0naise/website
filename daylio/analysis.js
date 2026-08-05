// Privacy-preserving analysis helpers for the Daylio explorer.
// All calculations stay in the browser and return plain data structures.

(() => {
    const STOP_WORDS = new Set([
        'about', 'after', 'again', 'also', 'and', 'are', 'around', 'because', 'been', 'before',
        'being', 'but', 'can', 'could', 'day', 'did', 'didnt', 'doing', 'for', 'from', 'get',
        'got', 'had', 'has', 'have', 'here', 'into', 'its', 'just', 'like', 'little', 'more',
        'much', 'not', 'now', 'off', 'one', 'out', 'over', 'really', 'some', 'that', 'the',
        'then', 'there', 'they', 'this', 'today', 'very', 'was', 'were', 'what', 'when', 'with',
        'would', 'yeah', 'you', 'your', 'still', 'went', 'will', 'than', 'them', 'these'
    ]);
    const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const TIME_BUCKETS = [
        { key: 'night', label: 'Night', start: 0, end: 5 },
        { key: 'morning', label: 'Morning', start: 6, end: 11 },
        { key: 'afternoon', label: 'Afternoon', start: 12, end: 17 },
        { key: 'evening', label: 'Evening', start: 18, end: 23 }
    ];
    const MOOD_SCORES = {
        awful: 1, bad: 1, sad: 2, tired: 2, 'not good': 2,
        okay: 3, alright: 3, meh: 3, neutral: 3,
        good: 4, great: 5, excited: 5, rad: 5, amazing: 5
    };

    function scoreMood(mood) {
        return MOOD_SCORES[String(mood || '').toLocaleLowerCase()] || 3;
    }

    function moodTone(mood) {
        const score = scoreMood(mood);
        return score <= 1 ? 'low' : score === 2 ? 'blue' : score === 3 ? 'steady' : score === 4 ? 'good' : 'bright';
    }

    function normaliseToken(value) {
        return String(value || '').toLocaleLowerCase().replace(/[^\p{L}\p{N}']/gu, '').replace(/^'+|'+$/g, '');
    }

    function tokenize(value) {
        return String(value || '')
            .split(/[^\p{L}\p{N}']+/u)
            .map(normaliseToken)
            .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
    }

    function unique(values) {
        return [...new Set(values)];
    }

    function entryText(entry) {
        return [entry.noteTitle, entry.note, ...entry.activities].filter(Boolean).join(' ');
    }

    function getWeekday(datetime) {
        return (datetime.getDay() + 6) % 7;
    }

    function timeBucket(hour) {
        return TIME_BUCKETS.find((bucket) => hour >= bucket.start && hour <= bucket.end) || TIME_BUCKETS[0];
    }

    function escapeRegex(value) {
        return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function termMatchesBoundary(text, term) {
        const expression = new RegExp(`(?:^|[^\\p{L}\\p{N}])${escapeRegex(term)}(?=$|[^\\p{L}\\p{N}])`, 'iu');
        return expression.test(String(text || ''));
    }

    function countTermOccurrences(text, term) {
        const expression = new RegExp(`(?:^|[^\\p{L}\\p{N}])${escapeRegex(term)}(?=$|[^\\p{L}\\p{N}])`, 'giu');
        return [...String(text || '').matchAll(expression)].length;
    }

    function entryMatchesAnyTerm(entry, terms) {
        return terms.some((term) => entryMatchesQuery(entry, term));
    }

    function entryMatchesQuery(entry, query) {
        const term = String(query || '').trim();
        if (!term) return true;
        const lowered = term.toLocaleLowerCase();
        if (entry.activities.some((activity) => activity.toLocaleLowerCase() === lowered || termMatchesBoundary(activity, term))) {
            return true;
        }
        return termMatchesBoundary(entry.noteTitle, term)
            || termMatchesBoundary(entry.note, term)
            || termMatchesBoundary(entry.mood, term);
    }

    function socialMatches(entry, spheres) {
        const corpus = entryText(entry);
        return spheres
            .filter((sphere) => sphere.terms.some((term) => {
                return termMatchesBoundary(corpus, term);
            }))
            .map((sphere) => sphere.id);
    }

    function enrichEntry(entry, spheres = []) {
        const prose = [entry.noteTitle, entry.note].filter(Boolean).join(' ');
        const tokens = tokenize(prose);
        const activityTerms = entry.activities.flatMap((activity) => tokenize(activity));
        const allTerms = unique([...tokens, ...activityTerms]);
        const bigrams = [];
        for (let index = 0; index < tokens.length - 1; index += 1) {
            bigrams.push(`${tokens[index]} ${tokens[index + 1]}`);
        }

        return {
            ...entry,
            wordCount: prose.trim() ? prose.trim().split(/\s+/).length : 0,
            characterCount: prose.length,
            weekday: getWeekday(entry.datetime),
            weekdayName: WEEKDAYS[getWeekday(entry.datetime)],
            hour: entry.datetime.getHours(),
            moodScore: scoreMood(entry.mood),
            timeBucket: timeBucket(entry.datetime.getHours()).key,
            normalisedTerms: allTerms,
            termBigrams: unique(bigrams),
            searchableText: entryText(entry).toLocaleLowerCase(),
            socialMatches: socialMatches(entry, spheres)
        };
    }

    function enrichEntries(entries, spheres = []) {
        return entries.map((entry) => enrichEntry(entry, spheres));
    }

    function average(values) {
        return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
    }

    function median(values) {
        if (!values.length) return 0;
        const sorted = [...values].sort((first, second) => first - second);
        const middle = Math.floor(sorted.length / 2);
        return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
    }

    function formatLocalDate(date) {
        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, '0'),
            String(date.getDate()).padStart(2, '0')
        ].join('-');
    }

    function isoWeekKey(date) {
        const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const day = (local.getDay() + 6) % 7;
        local.setDate(local.getDate() - day);
        return formatLocalDate(local);
    }

    function timeKey(entry, grouping) {
        return grouping === 'week' ? isoWeekKey(entry.datetime) : entry.date.slice(0, 7);
    }

    function cadence(entries, grouping = 'month') {
        const groups = new Map();
        entries.forEach((entry) => {
            const key = timeKey(entry, grouping);
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(entry);
        });
        return [...groups.entries()]
            .sort(([first], [second]) => first.localeCompare(second))
            .map(([key, values]) => {
                const start = grouping === 'week' ? new Date(`${key}T12:00:00`) : new Date(`${key}-01T12:00:00`);
                const end = new Date(start);
                if (grouping === 'week') end.setDate(start.getDate() + 6);
                else end.setMonth(start.getMonth() + 1, 0);
                return {
                    key,
                    label: grouping === 'week'
                        ? `Week of ${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                        : start.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
                    from: formatLocalDate(start),
                    to: formatLocalDate(end),
                    entryCount: values.length,
                    medianWords: median(values.map((entry) => entry.wordCount)),
                    averageMood: average(values.map((entry) => entry.moodScore))
                };
            });
    }

    function moodGroups(entries, selector) {
        const groups = new Map();
        entries.forEach((entry) => {
            const key = selector(entry);
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(entry);
        });
        return [...groups.entries()].map(([key, values]) => ({
            key,
            count: values.length,
            averageMood: average(values.map((entry) => entry.moodScore)),
            medianWords: median(values.map((entry) => entry.wordCount))
        }));
    }

    function moodByWeekday(entries) {
        const groups = moodGroups(entries, (entry) => entry.weekday);
        const lookup = new Map(groups.map((group) => [Number(group.key), group]));
        return WEEKDAYS.map((label, index) => ({
            key: index,
            label,
            ...(lookup.get(index) || { count: 0, averageMood: 0, medianWords: 0 })
        }));
    }

    function moodByTimeOfDay(entries) {
        const groups = moodGroups(entries, (entry) => entry.timeBucket);
        const lookup = new Map(groups.map((group) => [group.key, group]));
        return TIME_BUCKETS.map((bucket) => ({
            key: bucket.key,
            label: bucket.label,
            ...(lookup.get(bucket.key) || { count: 0, averageMood: 0, medianWords: 0 })
        }));
    }

    function countTerms(entries) {
        const counts = new Map();
        entries.forEach((entry) => {
            unique(entry.normalisedTerms).forEach((term) => counts.set(term, (counts.get(term) || 0) + 1));
        });
        return counts;
    }

    function countActivities(entries) {
        const counts = new Map();
        entries.forEach((entry) => {
            unique(entry.activities.map((activity) => activity.trim()).filter(Boolean))
                .forEach((activity) => counts.set(activity, (counts.get(activity) || 0) + 1));
        });
        return counts;
    }

    function createComparison(label, family, matching, allEntries) {
        const matchingIds = new Set(matching);
        const comparison = allEntries.filter((entry) => !matchingIds.has(entry));
        if (matching.length < 5 || comparison.length < 5) return null;
        const matchMood = average(matching.map((entry) => entry.moodScore));
        const comparisonMood = average(comparison.map((entry) => entry.moodScore));
        return {
            label,
            family,
            count: matching.length,
            comparisonCount: comparison.length,
            averageMood: matchMood,
            comparisonMood,
            difference: matchMood - comparisonMood,
            medianWords: median(matching.map((entry) => entry.wordCount))
        };
    }

    function correlationCandidates(entries) {
        const candidates = [];
        const activityCounts = countActivities(entries);
        activityCounts.forEach((count, activity) => {
            if (count >= 5) candidates.push(createComparison(
                `Entries with ${activity}`,
                'activity',
                entries.filter((entry) => entry.activities.includes(activity)),
                entries
            ));
        });

        moodByWeekday(entries).forEach((group) => {
            if (group.count >= 5) candidates.push(createComparison(
                group.label,
                'weekday',
                entries.filter((entry) => entry.weekday === group.key),
                entries
            ));
        });

        moodByTimeOfDay(entries).forEach((group) => {
            if (group.count >= 5) candidates.push(createComparison(
                `${group.label} entries`,
                'time',
                entries.filter((entry) => entry.timeBucket === group.key),
                entries
            ));
        });

        const middleLength = median(entries.map((entry) => entry.wordCount));
        candidates.push(createComparison(
            'Longer entries',
            'writing',
            entries.filter((entry) => entry.wordCount > middleLength),
            entries
        ));

        const terms = countTerms(entries);
        terms.forEach((count, term) => {
            if (count >= 5) candidates.push(createComparison(
                `Entries mentioning “${term}”`,
                'term',
                entries.filter((entry) => entry.normalisedTerms.includes(term)),
                entries
            ));
        });

        return candidates
            .filter(Boolean)
            .sort((first, second) => {
                const scoreFirst = Math.abs(first.difference) * Math.log2(first.count + 1);
                const scoreSecond = Math.abs(second.difference) * Math.log2(second.count + 1);
                return scoreSecond - scoreFirst;
            })
            .filter((candidate, index, collection) => !collection.slice(0, index).some((existing) =>
                existing.family === candidate.family && existing.label === candidate.label
            ))
            .slice(0, 5);
    }

    function directMatches(entries, query) {
        return entries.filter((entry) => entryMatchesQuery(entry, query));
    }

    function mentionProfile(entries, query) {
        const matches = directMatches(entries, query).sort((first, second) => first.datetime - second.datetime);
        const months = cadence(matches, 'month').map((point) => ({ key: point.key, count: point.entryCount }));
        const queryTokens = new Set(tokenize(query));
        const terms = countTerms(matches);
        const activities = countActivities(matches);
        const moods = new Map();
        matches.forEach((entry) => moods.set(entry.mood || 'Unlabelled', (moods.get(entry.mood || 'Unlabelled') || 0) + 1));

        return {
            query: String(query || '').trim(),
            matches,
            first: matches[0] || null,
            last: matches.at(-1) || null,
            activeMonths: months.length,
            monthlyFrequency: months,
            activities: [...activities.entries()].sort((first, second) => second[1] - first[1]).slice(0, 5),
            moods: [...moods.entries()].sort((first, second) => second[1] - first[1]).slice(0, 4),
            terms: [...terms.entries()]
                .filter(([term, count]) => count >= 2 && !queryTokens.has(term) && !term.includes(String(query || '').toLocaleLowerCase()))
                .sort((first, second) => second[1] - first[1]).slice(0, 6)
        };
    }

    function rollingMood(entries, days = 14) {
        if (!entries.length) return [];
        const byDate = new Map();
        entries.forEach((entry) => {
            const values = byDate.get(entry.date) || [];
            values.push(entry.moodScore);
            byDate.set(entry.date, values);
        });

        const start = new Date(`${entries[0].date}T12:00:00`);
        const end = new Date(`${entries.at(-1).date}T12:00:00`);
        const points = [];
        for (const current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
            const date = [
                current.getFullYear(),
                String(current.getMonth() + 1).padStart(2, '0'),
                String(current.getDate()).padStart(2, '0')
            ].join('-');
            const windowStart = new Date(current);
            windowStart.setDate(current.getDate() - (days - 1));
            const values = [];
            for (const sample = new Date(windowStart); sample <= current; sample.setDate(sample.getDate() + 1)) {
                const sampleDate = [
                    sample.getFullYear(),
                    String(sample.getMonth() + 1).padStart(2, '0'),
                    String(sample.getDate()).padStart(2, '0')
                ].join('-');
                values.push(...(byDate.get(sampleDate) || []));
            }
            if (values.length) {
                points.push({
                    date,
                    value: average(values),
                    raw: byDate.has(date) ? average(byDate.get(date)) : null,
                    count: values.length
                });
            }
        }
        return points;
    }

    function socialShift(entries, spheres, mode = 'groups') {
        const sphereLookup = new Map(spheres.map((sphere) => [sphere.id, sphere]));
        const periods = new Map();
        const termLabels = new Map();
        entries.forEach((entry) => {
            const month = Number.parseInt(entry.date.slice(5, 7), 10);
            const period = `${entry.date.slice(0, 4)}-${month <= 6 ? 'P1' : 'P2'}`;
            if (!periods.has(period)) periods.set(period, new Map());
            const corpus = entryText(entry);
            if (mode === 'terms') {
                spheres.forEach((sphere) => sphere.terms.forEach((term) => {
                    const occurrences = countTermOccurrences(corpus, term);
                    if (!occurrences) return;
                    const id = `${sphere.id}:${term.toLocaleLowerCase()}`;
                    termLabels.set(id, term);
                    periods.get(period).set(id, (periods.get(period).get(id) || 0) + occurrences);
                }));
            } else {
                spheres.forEach((sphere) => {
                    const occurrences = sphere.terms.reduce((sum, term) => sum + countTermOccurrences(corpus, term), 0);
                    if (!occurrences) return;
                    periods.get(period).set(sphere.id, (periods.get(period).get(sphere.id) || 0) + occurrences);
                });
            }
        });

        const labels = [...periods.keys()].sort();
        const identifiers = mode === 'terms'
            ? [...termLabels.keys()]
            : spheres.map((sphere) => sphere.id);
        return {
            labels,
            datasets: identifiers.map((id) => ({
                id,
                label: mode === 'terms' ? termLabels.get(id) : sphereLookup.get(id).name,
                values: labels.map((label) => periods.get(label).get(id) || 0)
            })).filter((dataset) => dataset.values.some(Boolean))
        };
    }

    function hobbyProfile(entries, year, targets) {
        const selected = entries.filter((entry) => entry.date.startsWith(`${year}-`));
        return targets.map((target) => ({
            label: target.name,
            value: selected.filter((entry) => entryMatchesAnyTerm(entry, target.terms)).length
        }));
    }

    function annualSummary(entries, spheres, year) {
        const selected = entries.filter((entry) => entry.date.startsWith(`${year}-`));
        const activities = countActivities(selected);
        const monthly = cadence(selected, 'month');
        const social = socialShift(selected, spheres);
        const topActivity = [...activities.entries()].sort((first, second) => second[1] - first[1])[0];
        const topSphere = social.datasets
            .map((dataset) => ({ label: dataset.label, count: dataset.values.reduce((sum, value) => sum + value, 0) }))
            .sort((first, second) => second.count - first.count)[0];
        const moodMonths = monthly.filter((month) => month.entryCount);
        return {
            entries: selected,
            averageMood: average(selected.map((entry) => entry.moodScore)),
            topActivity,
            topSphere,
            longestMonth: [...monthly].sort((first, second) => second.medianWords - first.medianWords)[0],
            highestMonth: [...moodMonths].sort((first, second) => second.averageMood - first.averageMood)[0],
            lowestMonth: [...moodMonths].sort((first, second) => first.averageMood - second.averageMood)[0]
        };
    }

    window.DaylioAnalysis = {
        WEEKDAYS,
        TIME_BUCKETS,
        MOOD_SCORES,
        scoreMood,
        moodTone,
        enrichEntries,
        median,
        average,
        cadence,
        moodGroups,
        moodByWeekday,
        moodByTimeOfDay,
        correlationCandidates,
        directMatches,
        mentionProfile,
        tokenize,
        termMatchesBoundary,
        entryMatchesAnyTerm,
        entryMatchesQuery,
        countTermOccurrences,
        rollingMood,
        socialShift,
        hobbyProfile,
        annualSummary
    };
})();
