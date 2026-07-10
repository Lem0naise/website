/**
 * Kudos / Clap counter — shared across all pages.
 * Supports per-path and global counts.
 *
 * localStorage keys:
 *   kudosCount_<path>  { count, timestamp }  — cached per-path
 *   kudosClicks        { count, windowStart } — rate-limit: max 5/min
 */
const KUDOS_API = 'https://indigo-worker.soft-resonance-63c0.workers.dev/visit';
const KUDOS_TTL = 5 * 60 * 1000;
const KUDOS_RATE = 60 * 1000;
const KUDOS_MAX = 5;

const kudosListeners = new Map();

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
    if (typeof count !== 'number') return;
    try {
        localStorage.setItem(cacheKey(path), JSON.stringify({ count, timestamp: Date.now() }));
    } catch (_) {}
}

function notifyKudosListeners(path, count) {
    const key = path || '';
    const listeners = kudosListeners.get(key);
    if (!listeners) return;
    listeners.forEach(function (fn) {
        try { fn(count); } catch (_) {}
    });
}

function subscribeKudosCount(path, fn) {
    const key = path || '';
    if (!kudosListeners.has(key)) kudosListeners.set(key, new Set());
    kudosListeners.get(key).add(fn);
    return function unsubscribe() {
        kudosListeners.get(key).delete(fn);
    };
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

async function parseKudosResponse(resp) {
    if (!resp.ok) throw new Error('Kudos fetch failed: ' + resp.status);
    const data = await resp.json();
    if (typeof data.count !== 'number') throw new Error('Invalid kudos response');
    return data.count;
}

async function parseTotalResponse(resp) {
    if (!resp.ok) throw new Error('Total fetch failed: ' + resp.status);
    const data = await resp.json();
    if (typeof data.total !== 'number') throw new Error('Invalid total response');
    return data.total;
}

// ── Core API calls ────────────────────────────────────────────────────

async function fetchKudosCount(path) {
    const cached = getCachedCount(path);
    if (cached !== null) return cached;
    const url = path ? KUDOS_API + '?path=' + path : KUDOS_API;
    const resp = await fetch(url);
    const count = await parseKudosResponse(resp);
    setCachedCount(path, count);
    notifyKudosListeners(path, count);
    return count;
}

async function postKudos(path) {
    const url = path ? KUDOS_API + '?path=' + path : KUDOS_API;
    const resp = await fetch(url, { method: 'POST' });
    const count = await parseKudosResponse(resp);
    setCachedCount(path, count);
    notifyKudosListeners(path, count);
    return count;
}

async function fetchTotalCount() {
    const cached = getCachedCount('__total');
    if (cached !== null) return cached;
    try {
        const resp = await fetch(KUDOS_API.replace('/visit', '/total'));
        const total = await parseTotalResponse(resp);
        setCachedCount('__total', total);
        return total;
    } catch (_) { return null; }
}

function initLazyKudosCounts(selector) {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    const load = function (el) {
        const path = el.getAttribute('data-path');
        if (!path || el.dataset.kudosLoaded) return;
        el.dataset.kudosLoaded = '1';
        fetchKudosCount(path).then(function (count) {
            el.textContent = '♥ ' + count.toLocaleString();
        }).catch(function () {
            el.textContent = '';
        });
    };

    if (!('IntersectionObserver' in window)) {
        elements.forEach(load);
        return;
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                load(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '100px' });

    elements.forEach(function (el) { observer.observe(el); });
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
        onCountChange = null,
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
        if (onCountChange) onCountChange(count);
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

    subscribeKudosCount(path, function (newCount) {
        count = newCount;
        render('default');
    });

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
            render('default');
        }).catch(function () {
            count = Math.max(0, count - 1);
            render('default');
        });
    });
};

window.fetchKudosCount = fetchKudosCount;
window.postKudos = postKudos;
window.fetchTotalCount = fetchTotalCount;
window.initLazyKudosCounts = initLazyKudosCounts;
window.subscribeKudosCount = subscribeKudosCount;
