// Per-browser Daylio category settings. Journal entries are never persisted here.

(() => {
    const STORAGE_KEY = 'daylio-social-spheres-v1';
    const RADAR_KEY = 'daylio-radar-targets-v1';
    const DEFAULT_RADAR_TARGETS = [
        { id: 'reading', name: 'Reading', terms: ['book', 'reading', 'novel'] },
        { id: 'writing', name: 'Writing', terms: ['writing', 'write'] },
        { id: 'coding', name: 'Coding', terms: ['coding', 'code', 'webdev'] },
        { id: 'gaming', name: 'Gaming', terms: ['gaming', 'game'] },
        { id: 'movement', name: 'Movement', terms: ['gym', 'workout', 'climbing', 'walk'] },
        { id: 'social', name: 'Social', terms: ['friends', 'family', 'night out'] }
    ];

    function normaliseTerms(value) {
        const values = Array.isArray(value) ? value : String(value || '').split(',');
        return [...new Set(values
            .map((term) => String(term).trim().replace(/\s+/g, ' '))
            .filter((term) => term.length >= 2)
            .slice(0, 30))];
    }

    function normaliseSpheres(value) {
        if (!Array.isArray(value)) return [];
        return value
            .map((sphere) => ({
                id: String(sphere.id || crypto.randomUUID()),
                name: String(sphere.name || '').trim().slice(0, 40),
                terms: normaliseTerms(sphere.terms)
            }))
            .filter((sphere) => sphere.name && sphere.terms.length)
            .slice(0, 20);
    }

    function load() {
        try {
            return normaliseSpheres(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]'));
        } catch {
            return [];
        }
    }

    let spheres = load();
    let radarTargets = loadRadarTargets();

    function save(next) {
        spheres = normaliseSpheres(next);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(spheres));
        return getAll();
    }

    function getAll() {
        return spheres.map((sphere) => ({ ...sphere, terms: [...sphere.terms] }));
    }

    function add(name, terms) {
        return save([...spheres, {
            id: crypto.randomUUID(),
            name,
            terms: normaliseTerms(terms)
        }]);
    }

    function update(id, name, terms) {
        return save(spheres.map((sphere) => sphere.id === id
            ? { ...sphere, name, terms: normaliseTerms(terms) }
            : sphere));
    }

    function remove(id) {
        return save(spheres.filter((sphere) => sphere.id !== id));
    }

    function move(id, direction) {
        const index = spheres.findIndex((sphere) => sphere.id === id);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= spheres.length) return getAll();
        const next = [...spheres];
        [next[index], next[target]] = [next[target], next[index]];
        return save(next);
    }

    function exportJson() {
        return JSON.stringify({ version: 1, spheres: getAll() }, null, 2);
    }

    function importJson(text) {
        const parsed = JSON.parse(text);
        return save(parsed.spheres);
    }

    function clear() {
        spheres = [];
        window.localStorage.removeItem(STORAGE_KEY);
        return [];
    }

    function normaliseTargets(value) {
        return normaliseSpheres(value).slice(0, 12);
    }

    function loadRadarTargets() {
        try {
            const stored = window.localStorage.getItem(RADAR_KEY);
            return stored ? normaliseTargets(JSON.parse(stored)) : normaliseTargets(DEFAULT_RADAR_TARGETS);
        } catch {
            return normaliseTargets(DEFAULT_RADAR_TARGETS);
        }
    }

    function saveRadarTargets(next) {
        radarTargets = normaliseTargets(next);
        window.localStorage.setItem(RADAR_KEY, JSON.stringify(radarTargets));
        return getRadarTargets();
    }

    function getRadarTargets() {
        return radarTargets.map((target) => ({ ...target, terms: [...target.terms] }));
    }

    function addRadarTarget(name, terms) {
        return saveRadarTargets([...radarTargets, { id: crypto.randomUUID(), name, terms: normaliseTerms(terms) }]);
    }

    function updateRadarTarget(id, name, terms) {
        return saveRadarTargets(radarTargets.map((target) => target.id === id
            ? { ...target, name, terms: normaliseTerms(terms) }
            : target));
    }

    function removeRadarTarget(id) {
        return saveRadarTargets(radarTargets.filter((target) => target.id !== id));
    }

    function replaceRadarTargets(next) {
        return saveRadarTargets(next);
    }

    window.DaylioSettings = {
        getAll, add, update, remove, move, exportJson, importJson, clear,
        getRadarTargets, addRadarTarget, updateRadarTarget, removeRadarTarget, replaceRadarTargets
    };
})();
