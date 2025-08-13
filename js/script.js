// Intersection Observer for scroll animations - removed entrance animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Only add animate class for non-entrance effects
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function() {
    // Observe elements for scroll animations (non-entrance effects only)
    const animatedElements = document.querySelectorAll('.content-section');
    animatedElements.forEach(el => observer.observe(el));

    // Add hover sound effect simulation (visual feedback)
    const interactiveElements = document.querySelectorAll('.option-card, .project-item, .contact-method, .tab');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.setProperty('--hover-time', Date.now());
        });
    });

    // Enhanced tab switching with animations
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs with fade effect
            tabs.forEach(t => {
                t.classList.remove('active');
                t.style.transform = 'scale(1)';
            });
            
            // Add active class to clicked tab with scale effect
            this.classList.add('active');
            this.style.transform = 'scale(1.05)';
            
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        });
    });

    

    // Handle featured items with anchor links
    const featuredItems = document.querySelectorAll('.featured-item');
    featuredItems.forEach(item => {
        const anchorLink = item.querySelector('div div a');
        if (anchorLink) {
            item.addEventListener('click', function(e) {
                if (e.target.tagName !== 'A') {
                    // Add click animation
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = '';
                        anchorLink.click();
                    }, 150);
                }
            });
            
            item.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = '';
                        anchorLink.click();
                    }, 150);
                }
            });
        }
    });

    // Handle quick items with anchor links
    const quickItems = document.querySelectorAll('.quick-item');
    quickItems.forEach(item => {
        const anchorLink = item.querySelector('h4 a');
        if (anchorLink) {
            item.addEventListener('click', function(e) {
                if (e.target.tagName !== 'A') {
                    this.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        this.style.transform = '';
                        anchorLink.click();
                    }, 100);
                }
            });
            
            item.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        this.style.transform = '';
                        anchorLink.click();
                    }, 100);
                }
            });
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const dropdown = document.getElementById('contactDropdown');
        const toggle = document.querySelector('.dropdown-toggle');
        
        if (dropdown && !dropdown.contains(event.target) && !toggle.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    });

    // Handle project item clicks with animation
    const projectItems = document.querySelectorAll('.project-item');
    projectItems.forEach(item => {
        const link = item.querySelector('h4 a');
        if (link) {
            item.addEventListener('click', function(e) {
                if (e.target.tagName !== 'A') {
                    this.style.transform = 'scale(0.97) translateY(-6px)';
                    setTimeout(() => {
                        this.style.transform = '';
                        link.click();
                    }, 150);
                }
            });
        }
    });

    // Add mouse trail effect (subtle)
    let mouseTrail = [];
    document.addEventListener('mousemove', (e) => {
        mouseTrail.push({x: e.clientX, y: e.clientY, time: Date.now()});
        
        // Limit trail length
        if (mouseTrail.length > 10) {
            mouseTrail.shift();
        }
        
        // Clean up old trail points
        mouseTrail = mouseTrail.filter(point => Date.now() - point.time < 500);
    });
    
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
                this.textContent = 'Show All';
                this.classList.add('active');
                isFilteringShortStories = true;
            } else {
                // Show all posts
                blogPosts.forEach(post => {
                    post.classList.remove('not-short-story');
                });
                this.textContent = 'Short Stories';
                this.classList.remove('active');
                isFilteringShortStories = false;
            }
        });
    }
});

function toggleDropdown() {
    const dropdown = document.getElementById('contactDropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function github() {
    window.open('https://github.com/Lem0naise', '_blank');
}

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
