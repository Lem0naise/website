class CVParser {
    parse(latex) {
        let content = latex;

        // 1. Protect escaped characters & hardcode A* fix
        content = content.replace(/\\%/g, '&#37;');
        content = content.replace(/\\&/g, '&amp;');
        content = content.replace(/A\$\^\{\*\}\$/g, 'A*');

        // 2. Strip LaTeX comments
        content = content.replace(/%.*$/gm, '');

        // 3. Extract Document Body
        const bodyMatch = content.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
        content = bodyMatch ? bodyMatch[1] : content;

        // 4. Extract and parse header
        const headerMatch = content.match(/\\begin\{center\}([\s\S]*?)\\end\{center\}/);
        let headerHtml = '';
        if (headerMatch) {
            headerHtml = this._parseHeader(headerMatch[1]);
            content = content.replace(/\\begin\{center\}[\s\S]*?\\end\{center\}/, '');
        }

        // 5. Strip layout/spacing commands
        content = content.replace(/\\vspace\{[^}]+\}/g, '');
        content = content.replace(/\\small\b/g, '');
        content = content.replace(/\\Huge\b/g, '');
        content = content.replace(/\\newline/g, '');
        content = content.replace(/\\\\/g, '<br>');
        content = content.replace(/\\\s+/g, ' ');

        // 6. Replace $|$ dividers in body (subtitles, etc.)
        content = content.replace(/\$\|\$/g, '<span class="cv-divider">|</span>');

        // 7. Replace icons (remove them — icon links are handled in header)
        content = content.replace(/\\faPhone/g, '');
        content = content.replace(/\\faEnvelope/g, '');
        content = content.replace(/\\faGlobe/g, '');
        content = content.replace(/\\faGithub/g, '');
        content = content.replace(/\\faLinkedin/g, '');
        content = content.replace(/\\faMapMarker\*/g, '');

        // 8. Text Formatting (3 iterations for nesting)
        for (let i = 0; i < 3; i++) {
            content = content.replace(/\\href\{([^}]+)\}\{([^}]+)\}/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="cv-link">$2</a>');
            content = content.replace(/\\underline\{([^}]+)\}/g, '<span class="cv-underline">$1</span>');
            content = content.replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>');
            content = content.replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>');
            content = content.replace(/\\emph\{([^}]+)\}/g, '<em>$1</em>');
        }

        // 9. Sections
        content = content.replace(/\\section\{([^}]+)\}/g, '</div><div class="cv-section visible"><h2 class="cv-section-title">$1</h2><hr class="cv-section-rule">');

        // 10. ResumeSubheading: 4 args → compact entry with header + subtitle row
        content = content.replace(/\\resumeSubheading\s*\{([\s\S]*?)\}\s*\{([\s\S]*?)\}\s*\{([\s\S]*?)\}\s*\{([\s\S]*?)\}/g,
            '<div class="cv-entry"><div class="cv-entry-header"><h3 class="cv-entry-title"><span>$1</span></h3><span class="cv-entry-right"><span>$2</span></span></div><div class="cv-entry-subtitle-row"><p class="cv-entry-subtitle"><span>$3</span></p><span class="cv-entry-subtitle-right"><span>$4</span></span></div></div>');

        // 11. ResumeProjectHeading: 2 args
        content = content.replace(/\\resumeProjectHeading\s*\{([\s\S]*?)\}\s*\{([\s\S]*?)\}/g,
            '<div class="cv-entry"><div class="cv-entry-header"><h3 class="cv-entry-title"><span>$1</span></h3><span class="cv-entry-right"><span>$2</span></span></div></div>');

        // 12. List wrappers
        content = content.replace(/\\resumeSubHeadingListStart/g, '');
        content = content.replace(/\\resumeSubHeadingListEnd/g, '');
        content = content.replace(/\\resumeItemListStart/g, '<ul class="cv-bullets">');
        content = content.replace(/\\resumeItemListEnd/g, '</ul>');

        // 13. ResumeItem: full match with proper closing
        content = content.replace(/\\resumeItem\s*\{([^}]*)\}/g, '<li class="cv-bullet"><span>$1</span></li>');

        // 14. Skills block: process before general \item so we can handle \item inside specially
        content = content.replace(/\\begin\{itemize\}\[[^\]]+\]\s*([\s\S]*?)\\end\{itemize\}/g, (match, inner) => {
            inner = inner.replace(/\\small\b/g, '');
            inner = inner.replace(/\\item\s*\{([^}]*)\}/, '$1');
            inner = inner.replace(/[{}]/g, '');
            const lines = inner.split(/<br>\s*/).filter(l => l.trim());
            const rows = lines.map(line => {
                const m = line.trim().match(/<strong>\s*(.+?)\s*<\/strong>\s*:\s*(.*)/);
                if (m) {
                    return `<div class="cv-skills-row"><span class="cv-skills-label"><span><strong>${m[1]}:</strong></span></span><span class="cv-skills-value"><span>${m[2].trim()}</span></span></div>`;
                }
                return `<div class="cv-skills-row">${line.trim()}</div>`;
            });
            return `<div class="cv-skills-block">${rows.join('')}</div>`;
        });

        // 15. Standard \item (for non-skills blocks)
        content = content.replace(/\\item\s*\{([^}]*)\}/g, '<li class="cv-bullet"><span>$1</span></li>');
        content = content.replace(/\\item\b/g, '<li class="cv-bullet"><span>');

        // 17. Final brace cleanup
        content = content.replace(/[{}]/g, '');

        // 18. Cleanup wrapper divs
        let result = headerHtml + content;
        result = result.replace(/^\s*<\/div>/, '');
        result = result.replace(/<div class="cv-section visible">\s*<\/div>/g, '');
        result = result.replace(/<\/div>\s*$/, '');
        result = result.replace(/<span class="cv-entry-right"><span>\s*<\/span><\/span>/g, '');

        return result;
    }

    _parseHeader(headerContent) {
        const nameMatch = headerContent.match(/\\textbf\{([^}]+)\}/);
        let name = nameMatch ? nameMatch[1] : '';

        headerContent = headerContent.replace(/\\vspace\{[^}]+\}/g, '');
        headerContent = headerContent.replace(/\\small\b/g, '');
        headerContent = headerContent.replace(/\\\\/g, '');
        headerContent = headerContent.replace(/\\newline/g, ' $|$ ');
        headerContent = headerContent.replace(/\\\s+/g, ' ');
        headerContent = headerContent.replace(/\{[^}]*\\textbf\{[^}]+\}[^}]*\}/, '');
        headerContent = headerContent.replace(/\\textbf\{[^}]+\}/, '');
        headerContent = headerContent.replace(/\\fa\w+\*?\s*/g, '');
        headerContent = headerContent.replace(/\\underline\{([^}]+)\}/g, '$1');

        const parts = headerContent.split(/\$\|\$/);
        let contacts = [];

        for (let part of parts) {
            part = part.trim().replace(/\s+/g, ' ');
            if (!part) continue;

            const hrefMatch = part.match(/\\href\{([^}]+)\}\{([^}]+)\}/);
            if (hrefMatch) {
                const href = hrefMatch[1];
                let display = hrefMatch[2];
                display = display.replace(/\\fa\w+\*?\s*/g, '');
                display = display.replace(/\\underline\{([^}]+)\}/g, '$1');
                display = display.trim();
                contacts.push(`<a class="cv-contact-pill" href="${href}" target="_blank" rel="noopener noreferrer">${display}</a>`);
            } else {
                if (part && /^[\d\s+]+$/.test(part)) {
                    const phone = part.replace(/\s+/g, '');
                    contacts.push(`<a class="cv-contact-pill" href="tel:${phone}" target="_blank" rel="noopener noreferrer">${part}</a>`);
                } else if (part) {
                    contacts.push(`<span class="cv-contact-pill cv-contact-location">${part}</span>`);
                }
            }
        }

        let html = `<h1 class="cv-name">${name}</h1>`;
        if (contacts.length > 0) {
            html += `<div class="cv-contacts">${contacts.join('')}</div>`;
        }
        return html;
    }
}
