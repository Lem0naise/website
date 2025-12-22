(function() { 
    const storedPreference = localStorage.getItem('dark-mode');
    let isDarkMode;

    if (storedPreference === null){
        isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
        isDarkMode = storedPreference === 'true'
    }

    document.documentElement.classList.toggle('dark-mode', isDarkMode);
})();