// Intersection Observer for scroll animations - removed entrance animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

document.addEventListener('DOMContentLoaded', function() {
    // Observe elements for scroll animations (non-entrance effects only)
    const animatedElements = document.querySelectorAll('.content-section');
    animatedElements.forEach(el => observer.observe(el));
    
    // Short story toggle functionality for blog
    const shortStoryToggle = document.getElementById('short-story-toggle');
    if (shortStoryToggle) {
        let isFilteringShortStories = false;
        
        shortStoryToggle.addEventListener('click', function() {
            const blogPosts = document.querySelectorAll('.blog-post');
            
            if (!isFilteringShortStories) {
                // Show only short stories
                blogPosts.forEach(post => {
                    if (!post.classList.contains('short-story')) {
                        post.classList.add('not-short-story');
                    }
                });
                this.classList.add('active');
                isFilteringShortStories = true;
            } else {
                // Show all posts
                blogPosts.forEach(post => {
                    post.classList.remove('not-short-story');
                });
                this.classList.remove('active');
                isFilteringShortStories = false;
            }
        });
    }
});

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
