document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeDropdown = document.getElementById('theme-dropdown');
    
    if (themeToggle && themeDropdown) {
        themeToggle.addEventListener('click', () => {
            themeDropdown.classList.toggle('hidden');
            themeToggle.setAttribute('aria-expanded', 
                !themeDropdown.classList.contains('hidden'));
            if (themeToggle.innerText == "click to jump"){
                themeToggle.innerText = 'show topics'; }else {themeToggle.innerText = 'click to jump';}
        });


    }
});