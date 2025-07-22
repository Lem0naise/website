// Animation helper functions
function animateElements(elements, startDelay = 0, delayIncrement = 100) {
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, startDelay + (index * delayIncrement));
    });
}

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            
            // Animate child elements with stagger effect
            if (entry.target.classList.contains('projects-grid')) {
                const projectItems = entry.target.querySelectorAll('.project-item');
                projectItems.forEach((item, index) => {
                    item.style.setProperty('--item-delay', index);
                    setTimeout(() => {
                        item.classList.add('animate');
                    }, index * 100);
                });
            }
            
            if (entry.target.classList.contains('about-grid')) {
                const aboutItems = entry.target.querySelectorAll('.about-item');
                aboutItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('animate');
                    }, index * 200);
                });
            }
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function() {
    // Observe elements for scroll animations
    const animatedElements = document.querySelectorAll('.content-section, .projects-grid, .about-grid, .project-item, .about-item, .options-grid');
    animatedElements.forEach(el => observer.observe(el));

    // Animate option cards when options grid comes into view
    const optionsGrid = document.querySelector('.options-grid');
    if (optionsGrid) {
        const optionCards = optionsGrid.querySelectorAll('.option-card');
        
        // Create a specific observer for the options grid
        const optionsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    
                    // Animate option cards with stagger
                    optionCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('animate');
                        }, index * 150);
                    });
                    
                    optionsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        optionsObserver.observe(optionsGrid);
    }

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

    // Enhanced parallax effect for welcome section with scroll direction
    const welcomeSection = document.querySelector('.welcome-section');
    const welcomeContent = document.querySelector('.welcome-content');
    let lastScrollY = 0;
    
    if (welcomeSection && welcomeContent) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.3; // Negative for upward movement
            const opacity = Math.max(0, 1 - scrolled / (window.innerHeight * 0.8));
            
            // Apply parallax transform
            welcomeContent.style.transform = `translateY(${rate}px)`;
            welcomeContent.style.opacity = opacity;
            
            // Hide options grid when scrolling up past welcome section
            const welcomeSectionBottom = welcomeSection.offsetTop + welcomeSection.offsetHeight;
            const optionsGrid = document.querySelector('.options-grid');
            
            if (optionsGrid && scrolled > welcomeSectionBottom * 0.7) {
                optionsGrid.style.opacity = Math.max(0, 1 - (scrolled - welcomeSectionBottom * 0.7) / 200);
                optionsGrid.style.transform = `translateY(${Math.min(50, (scrolled - welcomeSectionBottom * 0.7) / 4)}px)`;
            } else if (optionsGrid && optionsGrid.classList.contains('animate')) {
                optionsGrid.style.opacity = '';
                optionsGrid.style.transform = '';
            }
            
            lastScrollY = scrolled;
        });
    }

    // Typing effect for welcome message (start immediately, no delay)
    const welcomeTitle = document.querySelector('.welcome-content h1');
    if (welcomeTitle) {
        // Start options grid animation after welcome animations complete
        setTimeout(() => {
            const optionsGrid = document.querySelector('.options-grid');
            if (optionsGrid && !optionsGrid.classList.contains('animate')) {
                optionsGrid.classList.add('animate');
                const optionCards = optionsGrid.querySelectorAll('.option-card');
                optionCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('animate');
                    }, index * 150);
                });
            }
        },800); // Trigger after swoosh + color sweep complete (1s + 1.5s + 0.3s buffer)
    }

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

// Add page load animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});