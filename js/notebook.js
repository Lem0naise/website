/**
 * Renders the gist-backed /notebook stream.
 *
 * Source format (plain text, one gist file): entries separated by a line
 * containing only "---". Each entry starts with a date line
 * ("YYYY-MM-DD HH:MM:SS", UTC), optionally followed by a "song: ..." line
 * and at most one of:
 *   spotify: <track/album/playlist url>
 *   soundcloud: <permalink>
 *   bandcamp: <embed src or album/track url>
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
                if (current.length) { paras.push(current.join('\n')); current = []; }
            } else {
                current.push(stripped);
            }
        });
        if (current.length) paras.push(current.join('\n'));
        return '<blockquote>' + paras.map(function (p) {
            return '<p>' + inline(p) + '</p>';
        }).join('') + '</blockquote>';
    }

    function listItemsFrom(block) {
        return block.split('\n')
            .filter(function (l) { return l.trim() !== ''; })
            .map(function (l) { return l.trim().replace(/^\*\s+/, ''); });
    }

    function splitMixedBlock(block) {
        var lines = block.split('\n');
        var quoteLines = [];
        var proseLines = [];
        var pastQuote = false;
        for (var j = 0; j < lines.length; j++) {
            var t = lines[j].trim();
            if (!pastQuote && (t === '' || t.charAt(0) === '>')) {
                quoteLines.push(lines[j]);
            } else {
                pastQuote = true;
                proseLines.push(lines[j]);
            }
        }
        var result = [];
        var q = quoteLines.join('\n').trim();
        var p = proseLines.join('\n').trim();
        if (q) result.push(q);
        if (p) result.push(p);
        return result;
    }

    function renderContent(content) {
        var blocks = content.split(/\n\s*\n/).map(function (b) { return b.trim(); }).filter(Boolean);
        var expanded = [];
        for (var e = 0; e < blocks.length; e++) {
            if (!isBlockquoteBlock(blocks[e]) && blocks[e].trim().charAt(0) === '>') {
                expanded = expanded.concat(splitMixedBlock(blocks[e]));
            } else {
                expanded.push(blocks[e]);
            }
        }
        blocks = expanded;
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

            html.push('<p>' + inline(blocks[i].trim()) + '</p>');
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
            var dateStr = dateLine.indexOf(' ') !== -1
                ? dateLine.replace(' ', 'T') + 'Z'
                : dateLine + 'T00:00:00Z';
            var date = new Date(dateStr);
            if (isNaN(date.getTime())) return;

            var song = null;
            var songUrl = null;
            var embedKind = null;
            if (lines.length && /^song:\s*/i.test(lines[0])) {
                song = lines.shift().replace(/^song:\s*/i, '').trim();
                while (lines.length) {
                    var embedLine = lines[0].trim().match(/^(spotify|bandcamp|soundcloud):\s*(.+)$/i);
                    if (!embedLine) break;
                    lines.shift();
                    embedKind = embedLine[1].toLowerCase();
                    songUrl = embedLine[2].trim();
                }
            }

            while (lines.length && lines[0].trim() === '') lines.shift();

            entries.push({
                date: date,
                song: song,
                songUrl: songUrl,
                embedKind: embedKind,
                content: lines.join('\n')
            });
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

    function iframeHtml(src, height, extraAttrs) {
        return '<iframe class="stream-song-embed" src="' + GistLoader.escapeAttr(src) +
            '" width="100%" height="' + height + '" frameborder="0" loading="lazy"' +
            (extraAttrs ? ' ' + extraAttrs : '') + '></iframe>';
    }

    function songEmbedHtml(kind, url) {
        if (!kind || !url) return '';

        if (kind === 'spotify') {
            var spotify = url.match(/open\.spotify\.com\/(?:embed\/)?(track|album|playlist)\/([A-Za-z0-9]+)/);
            if (!spotify) return '';
            return iframeHtml(
                'https://open.spotify.com/embed/' + spotify[1] + '/' + spotify[2],
                80,
                'allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowfullscreen title="Spotify player"'
            );
        }

        if (kind === 'soundcloud') {
            var scSrc = /w\.soundcloud\.com\/player/i.test(url)
                ? url
                : 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(url.split('?')[0]) +
                    '&color=%23664455&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false';
            return iframeHtml(
                scSrc,
                20,
                'scrolling="no" allow="autoplay" title="SoundCloud player"'
            );
        }

        if (kind === 'bandcamp') {
            var bcSrc = url;
            if (!/bandcamp\.com\/EmbeddedPlayer/i.test(bcSrc)) {
                var album = url.match(/[?&/]album=(\d+)/i);
                var track = url.match(/[?&/]track=(\d+)/i);
                if (album) {
                    bcSrc = 'https://bandcamp.com/EmbeddedPlayer/album=' + album[1] +
                        '/size=small/bgcol=ffffff/linkcol=0687f5/transparent=true/';
                } else if (track) {
                    bcSrc = 'https://bandcamp.com/EmbeddedPlayer/track=' + track[1] +
                        '/size=small/bgcol=ffffff/linkcol=0687f5/transparent=true/';
                } else {
                    return '';
                }
            }
            return iframeHtml(bcSrc, 42, 'seamless title="Bandcamp player"');
        }

        return '';
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
            html += songEmbedHtml(entry.embedKind, entry.songUrl);
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
