document.addEventListener('DOMContentLoaded', () => {
    const copyEmailBtn = document.getElementById('copy-email');
    if (!copyEmailBtn) return;

    const emailText = copyEmailBtn.querySelector('span');
    // Get email from data attribute or fallback to a default
    const emailAddress = copyEmailBtn.getAttribute('data-email');
    if (!emailAddress) return;

    copyEmailBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(emailAddress);
            
            const originalText = emailText.innerText;
            emailText.innerText = 'Copied!';
            copyEmailBtn.classList.add('copied');
            
            setTimeout(() => {
                emailText.innerText = originalText;
                copyEmailBtn.classList.remove('copied');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
            window.location.href = `mailto:${emailAddress}`;
        }
    });
});
