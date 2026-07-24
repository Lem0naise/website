document.addEventListener('DOMContentLoaded', () => {
    const viewBtns = document.querySelectorAll('.view-btn');
    const tagChips = document.querySelectorAll('.tag-chip');
    const timelineView = document.getElementById('timeline-view');
    const groupedView = document.getElementById('grouped-view');
    const noResults = document.getElementById('no-results');

    if (!timelineView || !groupedView) return;

    const STORAGE_KEY = 'blog-view';
    let currentView = localStorage.getItem(STORAGE_KEY) || 'timeline';
    let activeTag = 'all';

    function setView(view) {
        currentView = view;
        localStorage.setItem(STORAGE_KEY, view);

        viewBtns.forEach(btn => {
            const isActive = btn.dataset.view === view;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive);
        });

        timelineView.classList.toggle('hidden', view !== 'timeline');
        groupedView.classList.toggle('hidden', view !== 'topics');

        applyFilter();
    }

    function applyFilter() {
        if (noResults) noResults.classList.add('hidden');

        if (currentView === 'timeline') {
            filterTimeline();
        } else {
            filterGroups();
        }
    }

    function filterTimeline() {
        const cards = timelineView.querySelectorAll('.blog-post');
        let visibleCount = 0;

        cards.forEach(card => {
            const tags = card.dataset.tags ? card.dataset.tags.split(',') : [];
            const show = activeTag === 'all' || tags.includes(activeTag);
            card.classList.toggle('hidden', !show);
            if (show) visibleCount++;
        });

        if (noResults && visibleCount === 0 && activeTag !== 'all') {
            noResults.classList.remove('hidden');
        }
    }

    function filterGroups() {
        const groups = groupedView.querySelectorAll('.tag-group');
        groups.forEach(group => {
            const groupTag = group.dataset.groupTag;
            const show = activeTag === 'all' || groupTag === activeTag;
            group.classList.toggle('hidden', !show);
        });
    }

    function setTag(tag) {
        activeTag = tag;
        tagChips.forEach(chip => {
            chip.classList.toggle('active', chip.dataset.tag === tag);
        });
        applyFilter();
    }

    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => setView(btn.dataset.view));
    });

    tagChips.forEach(chip => {
        chip.addEventListener('click', () => setTag(chip.dataset.tag));
    });

    setView(currentView);
});
