// daylio.js - Handles file upload, cleaning, and download UI for Daylio CSV Cleaner

// --- DOM Elements ---
const uploadInput = document.getElementById('csv-upload');
const downloadSection = document.getElementById('download-section');
const csvLinks = document.getElementById('csv-links');
const downloadZipBtn = document.getElementById('download-zip');

// --- Helper: Download a Blob as a file ---
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// --- Helper: Create a zip file from year-csvs ---
async function createZip(files) {
    // Use JSZip if available, else fallback to browser's native zip (not widely supported)
    if (typeof JSZip === 'undefined') {
        alert('ZIP download requires JSZip.');
        return null;
    }
    const zip = new JSZip();
    for (const [year, csv] of Object.entries(files)) {
        zip.file(`${year}.csv`, csv);
    }
    return await zip.generateAsync({type: 'blob'});
}

// --- Main: Handle File Upload ---
uploadInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const cleaned = window.cleanDaylioCSV(text); // Provided by clean.js
    // cleaned: { [year]: csvString }
    csvLinks.innerHTML = '';
    downloadSection.style.display = 'block';
    let yearCount = 0;
    for (const year of Object.keys(cleaned).sort()) {
        yearCount++;
        const btn = document.createElement('button');
        btn.className = 'download-btn';
        btn.textContent = `Download ${year}.csv`;
        btn.onclick = () => downloadBlob(new Blob([cleaned[year]], {type:'text/csv'}), `${year}.csv`);
        csvLinks.appendChild(btn);
    }
    if (yearCount > 1) {
        downloadZipBtn.style.display = 'inline-block';
        downloadZipBtn.onclick = async () => {
            if (typeof JSZip === 'undefined') {
                // Dynamically load JSZip if not present
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
                script.onload = async () => {
                    const zipBlob = await createZip(cleaned);
                    if (zipBlob) downloadBlob(zipBlob, 'daylio_csvs.zip');
                };
                document.body.appendChild(script);
            } else {
                const zipBlob = await createZip(cleaned);
                if (zipBlob) downloadBlob(zipBlob, 'daylio_csvs.zip');
            }
        };
    } else {
        downloadZipBtn.style.display = 'none';
    }
});
