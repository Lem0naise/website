document.addEventListener("DOMContentLoaded", () => {
    const progressBar = document.createElement("div");
    progressBar.style.position = "fixed";
    progressBar.style.top = "0";
    progressBar.style.left = "0";
    progressBar.style.height = "3px";
    progressBar.style.backgroundColor = "var(--accent)";
    progressBar.style.width = "0%";
    progressBar.style.zIndex = "1005";
    progressBar.style.transition = "width 0.05s ease";

    document.body.appendChild(progressBar);

    let ticking = false;
    window.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const scrollTop = window.scrollY;
            const docHeight = document.body.scrollHeight;
            const winHeight = window.innerHeight;
            const range = docHeight - winHeight;
            const scrollPercent = range > 0 ? scrollTop / range : 0;
            progressBar.style.width = Math.max(0, Math.min(100, scrollPercent * 100)) + "%";
            ticking = false;
        });
    }, { passive: true });
});
