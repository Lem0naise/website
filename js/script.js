// Initial page setup
document.getElementById('bio').style.transform = 'translateY(0)';
document.getElementById('bio').style.opacity = 1;
window.scrollTo(0, 0);

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

function hideElements(elements) {
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
    });
}

function animateAboutContent() {
    // Animate quick projects
    const quickProjectItems = document.querySelectorAll('.quick-item');
    animateElements(quickProjectItems, 200);
    
    // Animate bio grid items
    const bioGrid = document.getElementById("bio");
    const bioItems = Array.from(bioGrid.children);
    animateElements(bioItems, 200);
}

function hideAboutContent() {
    // Hide quick projects
    const quickProjectItems = document.querySelectorAll('.quick-item');
    hideElements(quickProjectItems);
    
    // Hide bio grid items
    const bioGrid = document.getElementById("bio");
    const bioItems = Array.from(bioGrid.children);
    hideElements(bioItems);
}

function load_about() {
    animateAboutContent();
}

function unload_about() {
    hideAboutContent();
}

function load_portfolio() {
    const portfolioGrid = document.getElementById("portfolio-grid");
    const portfolioItems = Array.from(portfolioGrid.children);
    
    // Set initial background color for all items
    portfolioItems.forEach(item => {
        item.style.backgroundColor = "var(--item)";
    });
    
    // Animate items sequentially
    let currentIndex = 0;
    function animateNextItem() {         
        setTimeout(() => {  
            portfolioItems[currentIndex].style.opacity = "1";
            portfolioItems[currentIndex].style.backgroundColor = "";
            portfolioItems[currentIndex].style.transform = "translateY(0)";
            currentIndex++;                  
            if (currentIndex < portfolioItems.length) {   
                animateNextItem();
            }
        }, 100);
    }
    animateNextItem();
}

function unload_portfolio() {
    const portfolioGrid = document.getElementById("portfolio-grid");
    const portfolioItems = Array.from(portfolioGrid.children);
    hideElements(portfolioItems);
}

window.onload = function() {
    animateAboutContent();
}

let currentTab = 0;
tab(0);

function tab(newTabIndex) {
    const tabs = document.getElementsByClassName('tab');
    const tabValues = document.getElementsByClassName("val");
    
    // Update active tab styling
    tabs[currentTab].classList.remove("active");
    tabs[newTabIndex].classList.add("active");
    
    if (newTabIndex !== currentTab) {
        const targetName = tabs[newTabIndex].dataset.name; 
        const displayType = tabs[newTabIndex].dataset.type;
        
        // Hide current content
        tabValues[currentTab].style.opacity = "0";
        setTimeout(() => {
            tabValues[currentTab].style.display = "none";
            document.getElementById(targetName).style.display = displayType;
            tabValues[newTabIndex].style.opacity = "0";
            currentTab = newTabIndex;
        }, 50);
        
        // Show new content
        setTimeout(() => {
            tabValues[newTabIndex].style.opacity = "1";
        }, 100);

        // Handle section-specific animations
        if (targetName === "portfolio") {
            unload_about();
            load_portfolio();
        } else {
            unload_portfolio();
            load_about();
        }
    }   
}

document.addEventListener('DOMContentLoaded', function() {
    // Handle project items in portfolio section
    const projectItems = document.querySelectorAll('.project-item');
    
    projectItems.forEach((item, index) => {
        item.setAttribute('tabindex', 0);
        item.setAttribute('id', index);
        
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
});

function toggleDropdown() {
    const dropdown = document.getElementById('contactDropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function github() {
    window.open('https://github.com/Lem0naise', '_blank');
}

// Tutoring Modal Functions
function openTutoringModal() {
    document.getElementById('tutoringModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeTutoringModal() {
    document.getElementById('tutoringModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside of it
window.addEventListener('click', function(event) {
    const modal = document.getElementById('tutoringModal');
    if (event.target === modal) {
        closeTutoringModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeTutoringModal();
    }
});