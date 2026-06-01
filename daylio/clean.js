// Browser-compatible Daylio CSV cleaner - AI Log Format
// Exposes window.cleanDaylioCSV(text) => { "2023-P1.txt": string, ... }

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

function cleanDaylioCSV(text) {
    const lines = text.split(/\r?\n/);
    const parsedEntries = [];

    // Parse and format each line
    for (let i = 1; i < lines.length; i++) { // Skip header
        const line = lines[i];
        if (!line.trim()) continue;

        const columns = parseCSVLine(line);
        if (columns.length < 9) continue; // Safety check for column presence

        const fullDate = stripQuotes(columns[0]);
        const timeRaw = stripQuotes(columns[3]);
        const mood = stripQuotes(columns[4]);
        const activitiesRaw = stripQuotes(columns[5]);
        const noteTitle = stripQuotes(columns[7]);
        const noteRaw = stripQuotes(columns[8]);

        // --- Time Formatting (12h to 24h) ---
        let hourStr = "00", minStr = "00";
        if (timeRaw) {
            const timeParts = timeRaw.split(' ');
            if (timeParts.length === 2) {
                const hm = timeParts[0].split(':');
                let h = parseInt(hm[0], 10);
                let m = parseInt(hm[1], 10);
                const ampm = timeParts[1].toUpperCase();

                if (ampm === "PM" && h < 12) h += 12;
                if (ampm === "AM" && h === 12) h = 0;

                hourStr = h.toString().padStart(2, '0');
                minStr = m.toString().padStart(2, '0');
            }
        }
        
        const timestamp = `[${fullDate} ${hourStr}:${minStr}]`;

        // --- Clean Activities ---
        let actStr = "";
        if (activitiesRaw) {
            const cleanActString = activitiesRaw.replace(/[|\/]/g, ',');
            const actArray = cleanActString.split(',');
            const finalActs = actArray.map(a => a.trim()).filter(a => a !== "");
            actStr = finalActs.join(", ");
        }

        // --- Clean Note and Title ---
        let finalNote = "";
        const cleanNote = noteRaw.replace(/<br>/gi, ' ').trim();
        if (noteTitle) finalNote += `${noteTitle}: `;
        if (cleanNote) finalNote += cleanNote;

        // --- Build Output Line ---
        let outLine = timestamp;
        if (mood) outLine += ` Mood: ${mood}`;
        if (actStr) outLine += ` | Activities: ${actStr}`;
        if (finalNote) outLine += ` | Note: ${finalNote}`;

        parsedEntries.push(outLine);
    }

    // Sort chronologically 
    // (Because standard alphabetical string sorting works perfectly on [YYYY-MM-DD HH:MM] prefixes)
    parsedEntries.sort();

    // Split into Half-Year Files
    const outputFiles = {};
    for (const entry of parsedEntries) {
        // Look for [YYYY-MM at the start of the string
        const match = entry.match(/^\[(\d{4})-(\d{2})/);
        
        if (match) {
            const year = match[1];
            const month = parseInt(match[2], 10);
            
            const part = (month >= 1 && month <= 6) ? "P1" : "P2";
            const filename = `${year}-${part}.txt`;

            if (!outputFiles[filename]) outputFiles[filename] = "";
            outputFiles[filename] += entry + '\n';
        } else {
            if (!outputFiles["misc_entries.txt"]) outputFiles["misc_entries.txt"] = "";
            outputFiles["misc_entries.txt"] += entry + '\n';
        }
    }

    return outputFiles;
}

// Expose for browser
if (typeof window !== 'undefined') {
    window.cleanDaylioCSV = cleanDaylioCSV;
}