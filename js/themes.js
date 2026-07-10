document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeDropdown = document.getElementById('theme-dropdown');

    if (!themeToggle || !themeDropdown) return;

    function closeDropdown() {
        themeDropdown.classList.add('hidden');
        themeToggle.setAttribute('aria-expanded', 'false');
    }

    function openDropdown() {
        themeDropdown.classList.remove('hidden');
        themeToggle.setAttribute('aria-expanded', 'true');
    }

    themeToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (themeDropdown.classList.contains('hidden')) {
            openDropdown();
        } else {
            closeDropdown();
        }
    });

    document.addEventListener('click', (e) => {
        if (!themeDropdown.contains(e.target) && e.target !== themeToggle) {
            closeDropdown();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDropdown();
    });

    themeDropdown.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeDropdown);
    });
});
