// Intersection Observer for scroll animations - removed entrance animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};


document.addEventListener('DOMContentLoaded', () => {
    let activeFilters = new Set(); 
    const tagFilters = document.querySelectorAll('.tag-filter');
    const blogPosts = document.querySelectorAll('.blog-post');
    const countElement = document.querySelector('.posts-header h2');

    updatePostCount(blogPosts.length);

    tagFilters.forEach(button => {
        button.addEventListener('click', () => {
            const selectedTag = button.dataset.tag;
            button.classList.toggle('active');
            if (button.classList.contains('active')) {
                activeFilters.add(selectedTag);
            } else {
                activeFilters.delete(selectedTag);
            }
            filterPosts();
        });
    });

    function filterPosts() {
        const activeFiltersArray = [...activeFilters]; // Convert Set to Array for filtering.

        blogPosts.forEach(post => {
            const postTags = post.dataset.tags ? post.dataset.tags.split(',').map(tag => tag.trim()) : [];
            const isVisible = activeFilters.size === 0 || activeFiltersArray.some(filter => postTags.includes(filter));

            post.classList.toggle('not-selected', !isVisible);
        });

        // Update the post count after filtering.
        const visibleCount = document.querySelectorAll('.blog-post:not(.not-selected)').length;
        updatePostCount(visibleCount);
    }

    function updatePostCount(count) {
        if (countElement) {
            countElement.textContent = `${count} Post${count !== 1 ? 's' : ''}`;
        }
    }
})

// end toggle code


// Pricing toggle functionality with animations
const pricingData = {
    gcse: {
        individual: '£25/hour',
        package: '£20/hour',
        project: '£30/hour'
    },
    alevel: {
        individual: '£30/hour',
        package: '£25/hour',
        project: '£35/hour'
    }
};

function setPricing(level) {
    // Update active button with animation
    const buttons = document.querySelectorAll('.pricing-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        btn.style.transform = 'scale(1)';
    });
    
    event.target.classList.add('active');
    event.target.style.transform = 'scale(1.05)';
    
    setTimeout(() => {
        event.target.style.transform = 'scale(1)';
    }, 200);
    
    // Update prices with fade animation
    const priceElements = [
        { element: document.getElementById('individual-price'), price: pricingData[level].individual },
        { element: document.getElementById('package-price'), price: pricingData[level].package },
        { element: document.getElementById('project-price'), price: pricingData[level].project }
    ];
    
    priceElements.forEach(({ element, price }) => {
        if (element) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                element.textContent = price;
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 150);
        }
    });
}
