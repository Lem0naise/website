// Shared application menu and AI-log ZIP export.

const menuToggle = document.getElementById('app-menu-toggle');
const appMenu = document.getElementById('app-menu');
const menuDownloadZip = document.getElementById('menu-download-zip');
const menuChangeCsv = document.getElementById('menu-change-csv');
const menuOpenGroups = document.getElementById('menu-open-groups');
let jsZipPromise;
let currentEntries = [];

function showMode(mode) {
    const landing = document.getElementById('landing-view');
    const explore = document.getElementById('explore-view');
    const isExplore = mode === 'explore';
    landing.hidden = isExplore;
    explore.hidden = !isExplore;
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

function closeMenu() {
    appMenu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
}

function toggleMenu() {
    const open = appMenu.hidden;
    appMenu.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    if (open) appMenu.querySelector('button:not(:disabled), a').focus();
}

async function downloadAiZip() {
    if (!currentEntries.length) return;
    menuDownloadZip.disabled = true;
    menuDownloadZip.textContent = 'Preparing ZIP…';
    try {
        downloadBlob(await createZip(window.formatLogsByHalfYear(currentEntries)), 'daylio_logs.zip');
        closeMenu();
    } catch (error) {
        window.dispatchEvent(new CustomEvent('daylio:status', { detail: error.message }));
    } finally {
        menuDownloadZip.disabled = false;
        menuDownloadZip.textContent = 'Download AI logs as ZIP';
    }
}

menuToggle.addEventListener('click', toggleMenu);
menuDownloadZip.addEventListener('click', downloadAiZip);
menuChangeCsv.addEventListener('click', () => {
    closeMenu();
    showMode('landing');
    document.getElementById('explore-upload').click();
});
menuOpenGroups.addEventListener('click', () => {
    closeMenu();
    window.dispatchEvent(new Event('daylio:open-groups'));
});
document.addEventListener('click', (event) => {
    if (!appMenu.hidden && !appMenu.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
});
window.addEventListener('daylio:entries-loaded', (event) => {
    currentEntries = event.detail.entries;
    menuDownloadZip.disabled = currentEntries.length < 2;
});
window.daylioShowMode = showMode;