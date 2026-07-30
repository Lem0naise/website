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

    function enrichEntry(entry) {
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
            timeBucket: timeBucket(entry.datetime.getHours()).key,
            normalisedTerms: allTerms,
            termBigrams: unique(bigrams),
            searchableText: entryText(entry).toLocaleLowerCase()
        };
    }

    function enrichEntries(entries) {
        return entries.map(enrichEntry);
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

    function isoWeekKey(date) {
        const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const day = (local.getDay() + 6) % 7;
        local.setDate(local.getDate() - day);
        return local.toISOString().slice(0, 10);
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
            .map(([key, values]) => ({
                key,
                entryCount: values.length,
                medianWords: median(values.map((entry) => entry.wordCount)),
                averageMood: average(values.map((entry) => entry.moodScore))
            }));
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
        const normalisedQuery = String(query || '').trim().toLocaleLowerCase();
        if (!normalisedQuery) return [];
        return entries.filter((entry) => entry.searchableText.includes(normalisedQuery));
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

    window.DaylioAnalysis = {
        WEEKDAYS,
        TIME_BUCKETS,
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
        tokenize
    };
})();
