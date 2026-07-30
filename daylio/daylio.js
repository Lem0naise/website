// Landing navigation and AI-log export UI.

const exportUpload = document.getElementById('export-upload');
const exportResults = document.getElementById('export-results');
const exportStatus = document.getElementById('export-status');
const exportPreview = document.getElementById('export-preview');
const csvLinks = document.getElementById('csv-links');
const downloadZipBtn = document.getElementById('download-zip');
let jsZipPromise;

function showMode(mode) {
    document.querySelectorAll('.mode-view').forEach((view) => {
        const active = view.id === `${mode}-view`;
        view.hidden = !active;
        view.classList.toggle('is-active', active);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

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

function loadJSZip() {
    if (window.JSZip) return Promise.resolve(window.JSZip);
    if (jsZipPromise) return jsZipPromise;

    jsZipPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
        script.onload = () => resolve(window.JSZip);
        script.onerror = () => reject(new Error('ZIP download could not load. Please try again with a connection.'));
        document.head.appendChild(script);
    });
    return jsZipPromise;
}

async function createZip(files) {
    const JSZip = await loadJSZip();
    if (!JSZip) {
        throw new Error('ZIP download is unavailable right now.');
    }
    const zip = new JSZip();
    for (const [filename, content] of Object.entries(files)) {
        zip.file(filename, content);
    }
    return zip.generateAsync({ type: 'blob' });
}

function renderExport(files, entryCount) {
    csvLinks.replaceChildren();
    const filenames = Object.keys(files).sort();
    exportPreview.textContent = files[filenames[0]].split('\n').filter(Boolean).slice(0, 4).join('\n');

    filenames.forEach((filename) => {
        const button = document.createElement('button');
        button.className = 'download-button';
        button.type = 'button';
        button.textContent = `Download ${filename}`;
        button.addEventListener('click', () => {
            downloadBlob(new Blob([files[filename]], { type: 'text/plain;charset=utf-8' }), filename);
        });
        csvLinks.appendChild(button);
    });

    exportResults.hidden = false;
    exportStatus.textContent = `${entryCount} ${entryCount === 1 ? 'entry' : 'entries'} arranged into ${filenames.length} ${filenames.length === 1 ? 'log' : 'logs'}.`;
    downloadZipBtn.hidden = filenames.length < 2;
    downloadZipBtn.onclick = async () => {
        downloadZipBtn.disabled = true;
        downloadZipBtn.textContent = 'Preparing ZIP…';
        try {
            downloadBlob(await createZip(files), 'daylio_logs.zip');
        } catch (error) {
            exportStatus.textContent = error.message;
        } finally {
            downloadZipBtn.disabled = false;
            downloadZipBtn.textContent = 'Download everything as a ZIP';
        }
    };
}

async function handleExportUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    exportStatus.textContent = 'Reading your journal…';
    exportResults.hidden = true;
    try {
        const entries = window.parseDaylioCSV(await file.text());
        renderExport(window.formatLogsByHalfYear(entries), entries.length);
    } catch (error) {
        exportStatus.textContent = error.message || 'This CSV could not be read.';
    } finally {
        event.target.value = '';
    }
}

document.querySelectorAll('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => showMode(button.dataset.mode));
});
document.querySelectorAll('[data-action="landing"]').forEach((button) => {
    button.addEventListener('click', () => showMode('landing'));
});
document.querySelector('[data-action="home"]').addEventListener('click', () => {
    window.location.href = '../';
});

exportUpload.addEventListener('change', handleExportUpload);
window.daylioShowMode = showMode;