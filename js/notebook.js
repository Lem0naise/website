/**
 * Renders the gist-backed /notebook stream.
 *
 * Source format (plain text, one gist file): entries separated by a line
 * containing only "---". Each entry starts with a date line
 * ("YYYY-MM-DD HH:MM:SS", UTC), optionally followed by a "song: ..." line
 * (with an optional "spotify: <url>" line after it for an exact track link),
 * then freeform markdown-ish content (blank-line paragraphs, ">" blockquotes
 * with blank ">" lines as paragraph breaks, "* " bullet lists, [text](url)
 * links, and *italic*).
 */
(function () {
    function inline(text) {
        var escaped = GistLoader.escapeHtml(text);
        escaped = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (match, label, url) {
            var isExternal = /^https?:\/\//i.test(url);
            var attrs = 'href="' + GistLoader.escapeAttr(url) + '"';
            if (isExternal) attrs += ' target="_blank" rel="noopener noreferrer"';
            return '<a ' + attrs + '>' + label + '</a>';
        });
        escaped = escaped.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
        return escaped;
    }

    function isBlockquoteBlock(block) {
        return block.split('\n').every(function (l) {
            return l.trim() === '' || l.trim().charAt(0) === '>';
        });
    }

    function isListBlock(block) {
        var lines = block.split('\n');
        return lines.length > 0 && lines.every(function (l) {
            return l.trim() === '' || /^\*\s+/.test(l.trim());
        });
    }

    function renderBlockquote(block) {
        var paras = [];
        var current = [];
        block.split('\n').forEach(function (l) {
            var stripped = l.trim().replace(/^>\s?/, '');
            if (stripped === '') {
                if (current.length) { paras.push(current.join(' ')); current = []; }
            } else {
                current.push(stripped);
            }
        });
        if (current.length) paras.push(current.join(' '));
        return '<blockquote>' + paras.map(function (p) {
            return '<p>' + inline(p) + '</p>';
        }).join('') + '</blockquote>';
    }

    function listItemsFrom(block) {
        return block.split('\n')
            .filter(function (l) { return l.trim() !== ''; })
            .map(function (l) { return l.trim().replace(/^\*\s+/, ''); });
    }

    function renderContent(content) {
        var blocks = content.split(/\n\s*\n/).map(function (b) { return b.trim(); }).filter(Boolean);
        var html = [];
        var i = 0;

        while (i < blocks.length) {
            if (isBlockquoteBlock(blocks[i])) {
                html.push(renderBlockquote(blocks[i]));
                i++;
                continue;
            }

            // Merge consecutive blank-line-separated list blocks into one <ul>,
            // since a list typed with a blank line between each "* item" is
            // still meant to be one list, not several.
            if (isListBlock(blocks[i])) {
                var items = [];
                while (i < blocks.length && isListBlock(blocks[i])) {
                    items = items.concat(listItemsFrom(blocks[i]));
                    i++;
                }
                html.push('<ul>' + items.map(function (it) {
                    return '<li>' + inline(it) + '</li>';
                }).join('') + '</ul>');
                continue;
            }

            html.push('<p>' + inline(blocks[i].split('\n').join(' ').trim()) + '</p>');
            i++;
        }

        return html.join('\n');
    }

    function parse(text) {
        var rawBlocks = text.split(/\n-{3,}\n/);
        var entries = [];

        rawBlocks.forEach(function (raw) {
            var block = raw.replace(/^\s+|\s+$/g, '');
            if (!block) return;

            var lines = block.split('\n');
            var dateLine = lines.shift().trim();
            var date = new Date(dateLine.replace(' ', 'T') + 'Z');
            if (isNaN(date.getTime())) return;

            var song = null;
            var songUrl = null;
            if (lines.length && /^song:\s*/i.test(lines[0])) {
                song = lines.shift().replace(/^song:\s*/i, '').trim();
                if (lines.length && /^spotify:\s*/i.test(lines[0])) {
                    songUrl = lines.shift().replace(/^spotify:\s*/i, '').trim();
                }
            }

            while (lines.length && lines[0].trim() === '') lines.shift();

            entries.push({ date: date, song: song, songUrl: songUrl, content: lines.join('\n') });
        });

        return entries;
    }

    function pad(n) { return n < 10 ? '0' + n : String(n); }

    function anchorId(date) {
        return date.getUTCFullYear() + '-' + pad(date.getUTCMonth() + 1) + '-' +
            pad(date.getUTCDate()) + '-' + pad(date.getUTCHours());
    }

    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function formatDate(date) {
        return MONTHS[date.getUTCMonth()] + ' ' + date.getUTCDate() + ', ' + date.getUTCFullYear();
    }

    function renderEntry(entry) {
        var html = '<div class="stream-entry" id="' + anchorId(entry.date) + '">';
        html += '<div class="stream-header-info"><div class="stream-date">' + formatDate(entry.date) + '</div></div>';
        if (entry.song) {
            var href = entry.songUrl ||
                'https://open.spotify.com/search/' + encodeURIComponent(entry.song);
            html += '<a class="stream-song" href="' + GistLoader.escapeAttr(href) +
                '" target="_blank" rel="noopener noreferrer">' +
                GistLoader.escapeHtml(entry.song) + '</a>';
        }
        html += '<div class="stream-content">' + renderContent(entry.content) + '</div>';
        html += '</div>';
        return html;
    }

    async function init(containerId, gistUser, gistId, gistFile) {
        var container = document.getElementById(containerId);
        if (!container) return;

        try {
            var text = await GistLoader.fetchGistText(gistUser, gistId, gistFile);
            var entries = parse(text);
            entries.sort(function (a, b) { return b.date - a.date; });

            if (!entries.length) {
                container.innerHTML = '<p class="no-results">Nothing here yet.</p>';
                return;
            }

            container.innerHTML = entries.map(renderEntry).join('');

            if (window.location.hash) {
                var target = document.getElementById(window.location.hash.slice(1));
                if (target) target.scrollIntoView();
            }
        } catch (e) {
            // Keep the server-rendered notebook entries available when the gist cannot load.
        }
    }

    window.NotebookLoader = { init: init, parse: parse };
})();
