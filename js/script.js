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

document.addEventListener('DOMContentLoaded', function() {
    // Handle featured items with anchor links
    const featuredItems = document.querySelectorAll('.featured-item');
    featuredItems.forEach(item => {
        const anchorLink = item.querySelector('div div a');
        if (anchorLink) {
            item.addEventListener('click', function(e) {
                if (e.target.tagName !== 'A') {
                    anchorLink.click();
                }
            });
            
            item.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    anchorLink.click();
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
                    anchorLink.click();
                }
            });
            
            item.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    anchorLink.click();
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
    
    // Smooth scroll behavior for navigation
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
        });
    });
});

function toggleDropdown() {
    const dropdown = document.getElementById('contactDropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function github() {
    window.open('https://github.com/Lem0naise', '_blank');
}


// Pricing toggle functionality
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
    // Update active button
    const buttons = document.querySelectorAll('.pricing-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update prices
    const individualPrice = document.getElementById('individual-price');
    const packagePrice = document.getElementById('package-price');
    const projectPrice = document.getElementById('project-price');
    
    if (individualPrice) individualPrice.textContent = pricingData[level].individual;
    if (packagePrice) packagePrice.textContent = pricingData[level].package;
    if (projectPrice) projectPrice.textContent = pricingData[level].project;
}

// Handle project item clicks
document.addEventListener('DOMContentLoaded', function() {
    const projectItems = document.querySelectorAll('.project-item');
    projectItems.forEach(item => {
        const link = item.querySelector('h4 a');
        if (link) {
            item.addEventListener('click', function(e) {
                if (e.target.tagName !== 'A') {
                    link.click();
                }
            });
        }
    });
});