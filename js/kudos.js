/**
 * Kudos / Clap counter — shared across all pages.
 * Supports per-path and global counts.
 *
 * localStorage keys:
 *   kudosCount_<path>  { count, timestamp }  — cached per-path
 *   kudosClicks        { count, windowStart } — rate-limit: max 10/min
 */
const KUDOS_API = 'https://indigo-worker.soft-resonance-63c0.workers.dev/visit';
const KUDOS_TTL = 5 * 60 * 1000;
const KUDOS_RATE = 60 * 1000;
const KUDOS_MAX = 5; //5

function cacheKey(path) {
    return 'kudosCount_' + (path || '_global');
}

function getCachedCount(path) {
    try {
        const raw = localStorage.getItem(cacheKey(path));
        if (!raw) return null;
        const { count, timestamp } = JSON.parse(raw);
        if (Date.now() - timestamp < KUDOS_TTL) return count;
    } catch (_) {}
    return null;
}

function setCachedCount(path, count) {
    try {
        localStorage.setItem(cacheKey(path), JSON.stringify({ count, timestamp: Date.now() }));
    } catch (_) {}
}

function getRateState() {
    try {
        const raw = localStorage.getItem('kudosClicks');
        if (!raw) return { count: 0, windowStart: Date.now() };
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.windowStart > KUDOS_RATE) {
            return { count: 0, windowStart: Date.now() };
        }
        return parsed;
    } catch (_) {
        return { count: 0, windowStart: Date.now() };
    }
}

function recordClick() {
    const state = getRateState();
    const updated = { count: state.count + 1, windowStart: state.windowStart };
    try { localStorage.setItem('kudosClicks', JSON.stringify(updated)); } catch (_) {}
    return updated.count;
}

// ── Core API calls ────────────────────────────────────────────────────

async function fetchKudosCount(path) {
    const cached = getCachedCount(path);
    if (cached !== null) return cached;
    const url = path ? KUDOS_API + '?path=' + path : KUDOS_API;
    const resp = await fetch(url);
    const data = await resp.json();
    setCachedCount(path, data.count);
    return data.count;
}

async function postKudos(path) {
    const url = path ? KUDOS_API + '?path=' + path : KUDOS_API;
    const resp = await fetch(url, { method: 'POST' });
    const data = await resp.json();
    setCachedCount(path, data.count);
    return data.count;
}

async function fetchTotalCount() {
    const cached = getCachedCount('__total');
    if (cached !== null) return cached;
    try {
        const resp = await fetch(KUDOS_API.replace('/visit', '/total'));
        const data = await resp.json();
        setCachedCount('__total', data.total);
        return data.total;
    } catch (_) { return null; }
}

// ── Mount a kudos widget ──────────────────────────────────────────────

window.mountKudos = async function mountKudos(container, opts = {}) {
    if (!container) return;

    const {
        ctaText = 'click to give kudos',
        thanksText = 'thanks',
        layout = 'inline',
        label = '',
        path = null,
    } = opts;

    container.classList.add('kudos-widget');
    container.style.cursor = 'pointer';
    container.setAttribute('title', 'Give kudos!');

    let count = 0;

    function render(state) {
        const fmt = typeof count === 'number' ? count.toLocaleString() : '?';
        const labelHtml = label ? '<span class="kudos-label">' + label + '</span>' : '';
        if (layout === 'button') {
            if (state === 'loading') {
                container.innerHTML = labelHtml + '<span class="kudos-heart">♥</span> <span class="kudos-num">…</span>';
            } else if (state === 'thanks') {
                container.innerHTML = labelHtml + '<span class="kudos-heart">♥</span> <span class="kudos-num">' + fmt + '</span> <span class="kudos-cta">' + thanksText + '</span>';
            } else if (state === 'slow') {
                container.innerHTML = labelHtml + '<span class="kudos-heart">♥</span> <span class="kudos-num">' + fmt + '</span> <span class="kudos-cta">slow down!</span>';
            } else {
                container.innerHTML = labelHtml + '<span class="kudos-heart">♥</span> <span class="kudos-num">' + fmt + '</span>' + (ctaText ? ' <span class="kudos-cta">' + ctaText + '</span>' : '');
            }
        } else {
            if (state === 'loading') {
                container.innerHTML = '<span class="kudos-count">…</span> kudos — <span class="kudos-count">' + ctaText + '</span>';
            } else if (state === 'thanks') {
                container.innerHTML = '<span class="kudos-count">' + fmt + '</span> kudos — ' + thanksText;
            } else if (state === 'slow') {
                container.innerHTML = '<span class="kudos-count">' + fmt + '</span> kudos — thanks, but slow down!';
            } else {
                container.innerHTML = '<span class="kudos-count">' + fmt + '</span> kudos — <span class="kudos-count">' + ctaText + '</span>';
            }
        }
    }

    let renderTimeout = null;
    function scheduleReset(ms) {
        if (!ms) ms = 3000;
        if (renderTimeout) clearTimeout(renderTimeout);
        renderTimeout = setTimeout(function () {
            render('default');
            renderTimeout = null;
        }, ms);
    }

    render('loading');

    try {
        count = await fetchKudosCount(path);
        render('default');
    } catch (_) {
        render('default');
    }

    container.addEventListener('click', function () {
        if (getRateState().count >= KUDOS_MAX) {
            render('slow');
            scheduleReset(2000);
            return;
        }

        recordClick();
        count++;
        render('thanks');
        scheduleReset(3000);

        postKudos(path).then(function (newCount) {
            count = newCount;
        }).catch(function () {});
    });
};

// Expose for use by status-updates.js and blog page
window.fetchKudosCount = fetchKudosCount;
window.postKudos = postKudos;
window.fetchTotalCount = fetchTotalCount;