document.addEventListener('DOMContentLoaded', () => {
    const tagChips = document.querySelectorAll('.tag-chip');
    const posts = document.querySelectorAll('.blog-posts .blog-post');
    const noResults = document.getElementById('no-results');

    if (!posts.length) return;

    function setTag(tag) {
        tagChips.forEach(chip => {
            chip.classList.toggle('active', chip.dataset.tag === tag);
        });

        let visibleCount = 0;
        posts.forEach(post => {
            const tags = post.dataset.tags ? post.dataset.tags.split(',') : [];
            const show = tag === 'all' || tags.includes(tag);
            post.classList.toggle('hidden', !show);
            if (show) visibleCount++;
        });

        if (noResults) {
            noResults.classList.toggle('hidden', !(visibleCount === 0 && tag !== 'all'));
        }
    }

    tagChips.forEach(chip => {
        chip.addEventListener('click', () => setTag(chip.dataset.tag));
    });
});
