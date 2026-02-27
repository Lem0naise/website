/**
 * Kudos / Clap counter — shared across all pages.
 *
 * localStorage keys:
 *   kudosCount        { count, timestamp }   — cached total, 5-min TTL
 *   kudosClicks       { count, windowStart }  — rate-limit: max 10 per minute
 */

const KUDOS_API = 'https://indigo-worker.soft-resonance-63c0.workers.dev/visit';
const KUDOS_TTL = 5 * 60 * 1000;   // 5 minutes
const KUDOS_RATE = 60 * 1000;        // 1 minute window
const KUDOS_MAX = 10;               // clicks per window

// ── Cache helpers ──────────────────────────────────────────────────────────

function getCachedCount() {
    try {
        const raw = localStorage.getItem('kudosCount');
        if (!raw) return null;
        const { count, timestamp } = JSON.parse(raw);
        if (Date.now() - timestamp < KUDOS_TTL) return count;
    } catch (_) { }
    return null;
}

function setCachedCount(count) {
    try {
        localStorage.setItem('kudosCount', JSON.stringify({ count, timestamp: Date.now() }));
    } catch (_) { }
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
    try { localStorage.setItem('kudosClicks', JSON.stringify(updated)); } catch (_) { }
    return updated.count;
}

// ── Core API calls ─────────────────────────────────────────────────────────

async function fetchKudosCount() {
    const cached = getCachedCount();
    if (cached !== null) return cached;
    const resp = await fetch(KUDOS_API);
    const data = await resp.json();
    setCachedCount(data.count);
    return data.count;
}

async function postKudos() {
    const resp = await fetch(KUDOS_API, { method: 'POST' });
    const data = await resp.json();
    setCachedCount(data.count);
    return data.count;
}

// ── Mount a kudos widget ───────────────────────────────────────────────────
//
//   mountKudos(containerEl, options)
//
//   options:
//     label        – text shown after the number, before the CTA
//     ctaText      – call-to-action inline text  (default: "click to give kudos")
//     ctaLabel     – optional bigger label shown above/around the button
//     thanksText   – text shown briefly after clicking (default: "thanks!")
//     layout       – 'inline' (default) | 'button'
//
// The container element receives class 'kudos-widget' and becomes clickable.

window.mountKudos = async function mountKudos(container, opts = {}) {
    if (!container) return;

    const {
        ctaText = 'click to give kudos',
        thanksText = 'thanks!',
        layout = 'inline',
        label = '',   // optional label shown before heart, e.g. "Enjoyed it?"
    } = opts;

    container.classList.add('kudos-widget');
    container.style.cursor = 'pointer';
    container.setAttribute('title', 'Give kudos!');

    let count = 0;

    function render(state) {
        const fmt = typeof count === 'number' ? count.toLocaleString() : '?';
        const labelHtml = label ? `<span class="kudos-label">${label}</span>` : '';
        if (layout === 'button') {
            if (state === 'loading') {
                container.innerHTML = `${labelHtml}<span class="kudos-heart">♥</span> <span class="kudos-num">…</span>`;
            } else if (state === 'thanks') {
                container.innerHTML = `${labelHtml}<span class="kudos-heart">♥</span> <span class="kudos-num">${fmt}</span> <span class="kudos-cta">${thanksText}</span>`;
            } else if (state === 'slow') {
                container.innerHTML = `${labelHtml}<span class="kudos-heart">♥</span> <span class="kudos-num">${fmt}</span> <span class="kudos-cta">slow down!</span>`;
            } else {
                container.innerHTML = `${labelHtml}<span class="kudos-heart">♥</span> <span class="kudos-num">${fmt}</span>${ctaText ? ` <span class="kudos-cta">${ctaText}</span>` : ''}`;
            }
        } else {
            // inline (list-item style, like the homepage)
            if (state === 'loading') {
                container.innerHTML = `<span class='kudos-count'>…</span> kudos — <span class='kudos-count'>${ctaText}</span>`;
            } else if (state === 'thanks') {
                container.innerHTML = `<span class='kudos-count'>${fmt}</span> kudos — ${thanksText}`;
            } else if (state === 'slow') {
                container.innerHTML = `<span class='kudos-count'>${fmt}</span> kudos — thanks, but slow down!`;
            } else {
                container.innerHTML = `<span class='kudos-count'>${fmt}</span> kudos — <span class='kudos-count'>${ctaText}</span>`;
            }
        }
    }

    render('loading');

    try {
        count = await fetchKudosCount();
        render('default');
    } catch (_) {
        render('default');
    }

    container.addEventListener('click', async () => {
        const clicks = getRateState().count;
        if (clicks >= KUDOS_MAX) {
            render('slow');
            setTimeout(() => render('default'), 2000);
            return;
        }

        recordClick();
        render('thanks');

        try {
            count = await postKudos();
        } catch (_) {
            // optimistic update already shown
        }

        setTimeout(() => render('default'), 3000);
    });
};
