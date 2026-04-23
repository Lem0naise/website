class CVParser {
    parse(latex) {
        let content = latex;
        
        // 1. Protect escaped characters BEFORE stripping comments
        content = content.replace(/\\%/g, '&#37;');
        content = content.replace(/\\&/g, '&amp;');
        
        // Hardcode fix for your A* grades
        content = content.replace(/A\$\^\{\*\}\$A\$\^\{\*\}\$A/g, 'A*A*A'); 

        // 2. Strip LaTeX comments
        content = content.replace(/%.*$/gm, '');

        // 3. Extract Document Body
        const bodyMatch = content.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
        content = bodyMatch ? bodyMatch[1] : content;

        // 4. Strip layout/spacing commands
        content = content.replace(/\\vspace\{[^}]+\}/g, '');
        content = content.replace(/\\small/g, '');
        content = content.replace(/\\Huge/g, '');
        content = content.replace(/\\newline/g, '<br>');
        content = content.replace(/\\\\/g, '<br>'); // Handle double backslash newlines
        
        // FIX: Remove LaTeX forced spaces (a backslash followed by whitespace)
        content = content.replace(/\\\s+/g, ' '); 

        content = content.replace(/\$\|\$/g, '<span class="cv-divider">|</span>');
        
        // 5. Replace Icons (Direct regex to safely handle the asterisk in faMapMarker*)
        content = content.replace(/\\faPhone/g, '<i class="fas fa-phone"></i>');
        content = content.replace(/\\faEnvelope/g, '<i class="fas fa-envelope"></i>');
        content = content.replace(/\\faGlobe/g, '<i class="fas fa-globe"></i>');
        content = content.replace(/\\faGithub/g, '<i class="fab fa-github"></i>');
        content = content.replace(/\\faLinkedin/g, '<i class="fab fa-linkedin"></i>');
        content = content.replace(/\\faMapMarker\*/g, '<i class="fas fa-map-marker-alt"></i>');

        // 6. Text Formatting (Run 3x to handle nested formats safely)
        for (let i = 0; i < 3; i++) {
            content = content.replace(/\\href\{([^}]+)\}\{([^}]+)\}/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="cv-link">$2</a>');
            content = content.replace(/\\underline\{([^}]+)\}/g, '<span class="cv-underline">$1</span>');
            content = content.replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>');
            content = content.replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>');
            content = content.replace(/\\emph\{([^}]+)\}/g, '<em>$1</em>');
        }

        // 7. Structural Macros
        content = content.replace(/\\begin\{center\}([\s\S]*?)\\end\{center\}/g, '<div class="cv-header">$1</div>');
        content = content.replace(/\\section\{([^}]+)\}/g, '<h3 class="cv-section-title">$1</h3>');

        // Subheadings
        content = content.replace(/\\resumeSubheading\s*\{([\s\S]*?)\}\s*\{([\s\S]*?)\}\s*\{([\s\S]*?)\}\s*\{([\s\S]*?)\}/g, `
            <div class="cv-entry">
                <div class="cv-row"><strong class="cv-title">$1</strong><span class="cv-date-loc">$2</span></div>
                <div class="cv-row"><em>$3</em><em class="cv-date-loc">$4</em></div>
            </div>
        `);

        // Project Headings
        content = content.replace(/\\resumeProjectHeading\s*\{([\s\S]*?)\}\s*\{([\s\S]*?)\}/g, `
            <div class="cv-entry">
                <div class="cv-row cv-project-header"><span>$1</span><span class="cv-project-link-container">$2</span></div>
            </div>
        `);

        // 8. Lists
        content = content.replace(/\\resumeSubHeadingListStart/g, '<div class="cv-list">');
        content = content.replace(/\\resumeSubHeadingListEnd/g, '</div>');
        
        content = content.replace(/\\resumeItemListStart/g, '<ul class="cv-bullets">');
        content = content.replace(/\\resumeItemListEnd/g, '</ul>');
        
        // FIX: Just replace the opening macro with an <li> tag. 
        // This stops nested braces from prematurely closing the list item.
        content = content.replace(/\\resumeItem\s*\{/g, '<li>');

        // Skills block generic itemize
        content = content.replace(/\\begin\{itemize\}\[[^\]]+\]/g, '<ul class="cv-skills">');
        content = content.replace(/\\end\{itemize\}/g, '</ul>');
        
        // FIX: Handle standard LaTeX items
        content = content.replace(/\\item\s*\{/g, '<li>');
        content = content.replace(/\\item\b/g, '<li>');

        // 9. Final cleanup of any orphaned braces left behind by layout macros
        content = content.replace(/[{}]/g, '');

        return content;
    }
}