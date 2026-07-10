/**
 * Copy text to clipboard with temporary feedback on an element.
 */
window.copyWithFeedback = function (el, text, labels) {
    labels = labels || {};
    const copied = labels.copied || 'Copied!';
    const original = labels.original || el.textContent;

    return navigator.clipboard.writeText(text).then(function () {
        el.textContent = copied;
        setTimeout(function () {
            el.textContent = original;
        }, labels.duration || 2000);
    });
};
