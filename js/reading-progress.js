document.addEventListener("DOMContentLoaded", () => {
    // Create the progress bar element
    const progressBar = document.createElement("div");
    progressBar.style.position = "fixed";
    progressBar.style.top = "0";
    progressBar.style.left = "0";
    progressBar.style.height = "3px";
    progressBar.style.backgroundColor = "var(--accent)";
    progressBar.style.width = "0%";
    progressBar.style.zIndex = "1005"; // Above header (1000)
    progressBar.style.transition = "width 0.05s ease";

    document.body.appendChild(progressBar);

    // Update width on scroll
    window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY;
        const docHeight = document.body.scrollHeight;
        const winHeight = window.innerHeight;
        const scrollPercent = scrollTop / (docHeight - winHeight);
        progressBar.style.width = Math.max(0, Math.min(100, scrollPercent * 100)) + "%";
    }, { passive: true });
});
