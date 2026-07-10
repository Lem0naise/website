document.addEventListener('DOMContentLoaded', () => {
    const copyEmailBtn = document.getElementById('copy-email');
    if (!copyEmailBtn) return;

    const emailText = copyEmailBtn.querySelector('span') || copyEmailBtn;
    const emailAddress = copyEmailBtn.getAttribute('data-email');
    if (!emailAddress) return;

    copyEmailBtn.addEventListener('click', async () => {
        try {
            if (window.copyWithFeedback && emailText !== copyEmailBtn) {
                await copyWithFeedback(emailText, emailAddress, { copied: 'Copied!' });
            } else if (window.copyWithFeedback) {
                await copyWithFeedback(copyEmailBtn, emailAddress, { copied: 'Copied!', original: emailAddress });
            } else {
                await navigator.clipboard.writeText(emailAddress);
                const originalText = emailText.textContent;
                emailText.textContent = 'Copied!';
                setTimeout(() => { emailText.textContent = originalText; }, 2000);
            }
            copyEmailBtn.classList.add('copied');
            setTimeout(() => copyEmailBtn.classList.remove('copied'), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
            window.location.href = `mailto:${emailAddress}`;
        }
    });
});
