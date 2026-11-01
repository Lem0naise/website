// Browser-compatible Daylio parser and AI-log formatter.
// Exposes window.parseDaylioCSV(text) => Entry[] and
// window.cleanDaylioCSV(text) => { "2023-P1.txt": string, ... }.

function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        const next = text[index + 1];

        if (char === '"') {
            if (inQuotes && next === '"') {
                field += '"';
                index += 1;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            row.push(field);
            field = '';
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
            if (char === '\r' && next === '\n') index += 1;
            row.push(field);
            if (row.some((value) => value.trim() !== '')) rows.push(row);
            row = [];
            field = '';
        } else {
            field += char;
        }
    }

    row.push(field);
    if (row.some((value) => value.trim() !== '')) rows.push(row);
    return rows;
}

function normaliseHeader(value) {
    return value.replace(/^\uFEFF/, '').trim().toLowerCase().replace(/[\s-]/g, '_');
}

function to24Hour(timeRaw) {
    const raw = String(timeRaw || '').trim();
    if (!raw) return null;

    const match = raw.match(/^(\d{1,2}):(\d{2})(?:\s*([ap]m))?$/i);
    if (!match) return null;

    let hour = Number.parseInt(match[1], 10);
    const minute = Number.parseInt(match[2], 10);
    const suffix = match[3] ? match[3].toUpperCase() : '';

    if (suffix === 'PM' && hour < 12) hour += 12;
    if (suffix === 'AM' && hour === 12) hour = 0;
    if (hour > 23 || minute > 59) return null;

    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function cleanActivities(value) {
    // Daylio separates activities with " | ". Slashes and commas are part of
    // activity names (e.g. "gym / workout"), so they must not split anything.
    return String(value || '')
        .split('|')
        .map((activity) => activity.trim())
        .filter(Boolean);
}

function cleanNote(value) {
    return String(value || '').replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim();
}

function makeDate(date, time) {
    const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!dateMatch) return null;

    // A missing/invalid time sorts to the start of the day but is never
    // written into the log; see entry.timestamp below.
    const [hours, minutes] = (time || '00:00').split(':').map(Number);
    const datetime = new Date(
        Number(dateMatch[1]),
        Number(dateMatch[2]) - 1,
        Number(dateMatch[3]),
        hours,
        minutes
    );

    return Number.isNaN(datetime.getTime()) ? null : datetime;
}

function getColumnMap(headers) {
    const map = {};
    headers.forEach((header, index) => {
        map[normaliseHeader(header)] = index;
    });

    const required = ['full_date', 'time', 'mood', 'activities'];
    const missing = required.filter((key) => map[key] === undefined);
    if (missing.length) {
        throw new Error(`This does not look like a Daylio CSV. Missing: ${missing.join(', ')}.`);
    }

    return map;
}

function parseDaylioCSV(text) {
    const rows = parseCSV(String(text || ''));
    if (rows.length < 2) throw new Error('This file has no Daylio entries to explore.');

    const columns = getColumnMap(rows[0]);
    const entries = [];
    const warnings = [];

    rows.slice(1).forEach((row, index) => {
        const date = String(row[columns.full_date] || '').trim();
        const rawTime = String(row[columns.time] || '').trim();
        const time = to24Hour(rawTime);
        const datetime = makeDate(date, time);
        if (!datetime) {
            warnings.push(`Row ${index + 2} has no valid full_date and was skipped.`);
            return;
        }
        if (rawTime && !time) {
            warnings.push(`Row ${index + 2} has an invalid time and was exported without one.`);
        }

        const noteTitle = cleanNote(row[columns.note_title]);
        const note = cleanNote(row[columns.note]);
        const scales = cleanNote(row[columns.scales]);
        entries.push({
            date,
            time: time || '',
            datetime,
            mood: String(row[columns.mood] || '').trim(),
            activities: cleanActivities(row[columns.activities]),
            scales,
            noteTitle,
            note,
            timestamp: time ? `${date} ${time}` : date
        });
    });

    if (!entries.length) throw new Error('No valid dated entries were found in this Daylio CSV.');
    parseDaylioCSV.lastWarnings = warnings;
    return entries.sort((first, second) => first.datetime - second.datetime);
}

function formatEntryForLog(entry) {
    let line = `[${entry.timestamp}]`;
    if (entry.mood) line += ` Mood: ${entry.mood}`;
    // "; " keeps activity names containing commas or slashes unambiguous.
    if (entry.activities.length) line += ` | Activities: ${entry.activities.join('; ')}`;
    if (entry.scales) line += ` | Scales: ${entry.scales}`;

    const note = [entry.noteTitle, entry.note].filter(Boolean).join(': ');
    if (note) line += ` | Note: ${note}`;
    return line;
}

function formatLogsByHalfYear(entries) {
    return entries.reduce((files, entry) => {
        const month = Number.parseInt(entry.date.slice(5, 7), 10);
        const filename = `${entry.date.slice(0, 4)}-${month <= 6 ? 'P1' : 'P2'}.txt`;
        if (!files[filename]) files[filename] = '';
        files[filename] += `${formatEntryForLog(entry)}\n`;
        return files;
    }, {});
}

function cleanDaylioCSV(text) {
    return formatLogsByHalfYear(parseDaylioCSV(text));
}

if (typeof window !== 'undefined') {
    window.parseDaylioCSV = parseDaylioCSV;
    window.formatLogsByHalfYear = formatLogsByHalfYear;
    window.cleanDaylioCSV = cleanDaylioCSV;
    window.getDaylioParseWarnings = () => [...(parseDaylioCSV.lastWarnings || [])];
}