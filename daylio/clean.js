// Browser-compatible Daylio CSV cleaner
// Exposes window.cleanDaylioCSV(text) => { year: csvString }

const HEADERS = ["full_date_time", "mood", "activities", "scales", "note_title", "note"];

function parseCSVLine(text) {
    const result = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            result.push(cur);
            cur = '';
            continue;
        }
        cur += char;
    }
    result.push(cur);
    return result;
}

function stripQuotes(s) {
    if (!s) return "";
    return s.replace(/^"|"$/g, '');
}

function formatCSVField(field) {
    if (field === undefined || field === null) return '""';
    if (field.includes('"') || field.includes(',')) {
        return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
}

function cleanDaylioCSV(text) {
    const lines = text.split(/\r?\n/);
    let lineCount = 0;
    const yearCSVs = {};
    for (const line of lines) {
        lineCount++;
        if (lineCount === 1) continue; // Skip header
        if (!line.trim()) continue;
        const columns = parseCSVLine(line);
        const fullDate = stripQuotes(columns[0]);
        const timeRaw = stripQuotes(columns[3]);
        let mood = stripQuotes(columns[4]);
        const activitiesRaw = stripQuotes(columns[5]);
        const scales = stripQuotes(columns[6]);
        let noteTitle = stripQuotes(columns[7]);
        let note = stripQuotes(columns[8]);
        const fullDateTime = `${fullDate}`;
        const cleanActString = activitiesRaw.replace(/[|\/]/g, ',');
        const actArray = cleanActString.split(',');
        const finalActs = actArray.map(a => a.trim()).filter(a => a !== "");
        const actOutput = JSON.stringify(finalActs);
        if (!mood) mood = "";
        if (!noteTitle) noteTitle = "";
        if (!note) note = "";
        const year = fullDate.split('-')[0];
        if (year && !isNaN(year)) {
            if (!yearCSVs[year]) {
                yearCSVs[year] = HEADERS.join(',') + '\n';
            }
            const row = [
                fullDateTime,
                mood ? `"${mood.replace(/"/g, '""')}"` : '""',
                actOutput,
                scales,
                noteTitle ? `"${noteTitle.replace(/"/g, '""')}"` : '""',
                note ? `"${note.replace(/"/g, '""')}"` : '""'
            ].join(',');
            yearCSVs[year] += row + '\n';
        }
    }
    return yearCSVs;
}

// Expose for browser
if (typeof window !== 'undefined') {
    window.cleanDaylioCSV = cleanDaylioCSV;
}