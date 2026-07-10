/**
 * Shared GitHub Gist fetch helpers.
 */
(function () {
    function gistRawUrl(user, id, file) {
        return 'https://gist.githubusercontent.com/' + user + '/' + id + '/raw/' + (file || '');
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function escapeAttr(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;');
    }

    function parseRedirects(text) {
        var map = {};
        var lines = text.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line || line[0] === '#') continue;
            var parts = line.split(/\s+/);
            if (parts.length < 2) continue;
            var key = parts[0];
            if (key[0] !== '/') key = '/' + key;
            map[key.toLowerCase()] = parts.slice(1).join(' ');
        }
        return map;
    }

    async function fetchGistText(user, id, file) {
        var res = await fetch(gistRawUrl(user, id, file));
        if (!res.ok) throw new Error('Gist fetch failed: ' + res.status);
        return res.text();
    }

    async function fetchGistJson(user, id, file) {
        var text = await fetchGistText(user, id, file);
        var cleaned = text.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}');
        return JSON.parse(cleaned);
    }

    window.GistLoader = {
        gistRawUrl: gistRawUrl,
        fetchGistText: fetchGistText,
        fetchGistJson: fetchGistJson,
        parseRedirects: parseRedirects,
        escapeHtml: escapeHtml,
        escapeAttr: escapeAttr
    };
})();
