// Pricing toggle functionality with animations
const pricingData = {
    g: {
        individual: '£25/hour',
        package: '£20/hour',
        project: '£30/hour'
    },
    a: {
        individual: '£30/hour',
        package: '£25/hour',
        project: '£35/hour'
    }
};

function setPricing(level, targetButton) {
    // Update active button with animation
    const buttons = document.querySelectorAll('.pricing-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        btn.style.transform = 'scale(1)';
    });
    
    targetButton.classList.add('active');
    targetButton.style.transform = 'scale(1.05)';
    
    setTimeout(() => {
        targetButton.style.transform = 'scale(1)';
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

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.pricing-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            const level = btn.dataset.level; // Add data-level="gcse" to HTML
            setPricing(level, event.target);
        });
    });
});