/**
 * Renders the gist-backed /photos grid.
 *
 * Source format (photos.json): either a top-level array of photos, or an
 * object with a "photos" array. Order is preserved, so put newest first.
 * Each photo can be a plain URL string, or an object:
 *
 *   {
 *     "src": "https://.../photo_w.jpg",   // required, image to display
 *     "href": "https://.../photo_o.jpg",  // optional, full-size link
 *     "alt": "The National Theatre",       // optional, alt text
 *     "title": "The National Theatre",     // optional caption
 *     "location": "London, 2026",          // optional caption
 *     "description": "Featured on [X](https://example.com)" // optional caption
 *   }
 *
 * "thumb"/"image"/"url" work as aliases for "src"; "link"/"full" work as
 * aliases for "href". A relative path such as "thumbs/bird.jpg" is resolved
 * from /photos/. Trailing commas in the JSON are tolerated.
 */
(function () {
    var DEFAULT_ALT = 'Photography by Indigo Nolan';

    function firstString() {
        for (var i = 0; i < arguments.length; i++) {
            var value = arguments[i];
            if (typeof value === 'string' && value.trim()) return value.trim();
        }
        return '';
    }

    function safeUrl(value) {
        var url = firstString(value);
        if (!url) return '';
        if (/^(?:javascript|data|vbscript):/i.test(url)) return '';
        return url;
    }

    function inline(text) {
        var raw = String(text || '');
        var html = '';
        var last = 0;
        var linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
        var match;

        while ((match = linkPattern.exec(raw)) !== null) {
            html += GistLoader.escapeHtml(raw.slice(last, match.index));
            var href = safeUrl(match[2]);
            var label = GistLoader.escapeHtml(match[1]);
            if (href) {
                var isExternal = /^https?:\/\//i.test(href);
                html += '<a href="' + GistLoader.escapeAttr(href) + '"' +
                    (isExternal ? ' target="_blank" rel="noopener noreferrer"' : '') +
                    '>' + label + '</a>';
            } else {
                html += label;
            }
            last = linkPattern.lastIndex;
        }

        if (last < raw.length) html += GistLoader.escapeHtml(raw.slice(last));
        return html;
    }

    function normalizePhoto(entry) {
        if (typeof entry === 'string') {
            var url = safeUrl(entry);
            if (!url) return null;
            return { src: url, href: url, alt: DEFAULT_ALT, title: '', location: '', description: '' };
        }

        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;

        var src = safeUrl(entry.src || entry.thumb || entry.thumbnail || entry.image || entry.url);
        if (!src) return null;

        var title = firstString(entry.title);
        return {
            src: src,
            href: safeUrl(entry.href || entry.link || entry.full || entry.fullsize) || src,
            alt: firstString(entry.alt, title, DEFAULT_ALT),
            title: title,
            location: firstString(entry.location, entry.place),
            description: firstString(entry.description, entry.caption)
        };
    }

    function normalize(data) {
        var list;
        if (Array.isArray(data)) {
            list = data;
        } else if (data && typeof data === 'object' && Array.isArray(data.photos)) {
            list = data.photos;
        } else if (data && typeof data === 'object') {
            list = [data];
        } else {
            throw new Error('photos.json must be an array of photos');
        }

        return list.map(normalizePhoto).filter(Boolean);
    }

    function renderPhoto(photo, index) {
        var loading = index === 0
            ? 'loading="eager" fetchpriority="high"'
            : 'loading="lazy"';
        var html = '<article class="photo-item featured-photo">' +
            '<div class="photo-container">' +
            '<a href="' + GistLoader.escapeAttr(photo.href) + '">' +
            '<img src="' + GistLoader.escapeAttr(photo.src) + '" alt="' +
            GistLoader.escapeAttr(photo.alt) + '" class="photo-image" ' + loading +
            ' decoding="async">' +
            '</a></div>';

        if (photo.title || photo.location || photo.description) {
            html += '<div class="photo-content">';
            if (photo.title) html += '<h3>' + inline(photo.title) + '</h3>';
            if (photo.location) html += '<p class="photo-location">' + inline(photo.location) + '</p>';
            if (photo.description) html += '<p class="photo-description">' + inline(photo.description) + '</p>';
            html += '</div>';
        }

        return html + '</article>';
    }

    async function init(containerId, gistUser, gistId, gistFile) {
        var container = document.getElementById(containerId);
        if (!container || !gistId) return;

        try {
            var data = await GistLoader.fetchGistJson(gistUser, gistId, gistFile);
            var photos = normalize(data);

            if (!photos.length) {
                container.innerHTML = '<p class="no-results">No photos yet.</p>';
                return;
            }

            container.innerHTML = photos.map(renderPhoto).join('');
        } catch (e) {
            // Keep the server-rendered grid available when the gist cannot load.
            if (window.console && console.warn) {
                console.warn('Photos gist failed to load:', e);
            }
        }
    }

    window.PhotosLoader = {
        init: init,
        normalize: normalize,
        renderPhoto: renderPhoto
    };
})();
