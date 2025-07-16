// Get references to the mobile menu button and the mobile menu
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuLinks = mobileMenu.querySelectorAll('a');
const currentYearSpan = document.getElementById('currentYear');

// Get references for the project slider
const projectsSliderWrapper = document.querySelector('.projects-slider-wrapper');
const projectsLeftArrowBtn = document.querySelector('#projects .slider-nav-btn.left');
const projectsRightArrowBtn = document.querySelector('#projects .slider-nav-btn.right');

// Get references for the skills slider
const skillsSliderWrapper = document.querySelector('.skills-slider-wrapper');
const skillsLeftArrowBtn = document.querySelector('#skills .slider-nav-btn.left');
const skillsRightArrowBtn = document.querySelector('#skills .slider-nav-btn.right');


// Variables for drag functionality
let isDown = false;
let startX;
let scrollLeft;
let activeSlider = null; // To keep track of which slider is being dragged

// Function to toggle the mobile menu
function toggleMobileMenu() {
    mobileMenuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    // Prevent scrolling when mobile menu is open
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
}

// Add event listener to the mobile menu button
mobileMenuBtn.addEventListener('click', toggleMobileMenu);

// Add event listeners to mobile menu links to close the menu when a link is clicked
mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
        toggleMobileMenu(); // Close the menu
    });
});

// Set current year in the footer
currentYearSpan.textContent = new Date().getFullYear();

// Optional: Close mobile menu if resized to desktop view
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) {
        toggleMobileMenu();
    }
});

// Add scroll effect to header
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Generic Slider Navigation Function
function scrollSlider(sliderWrapper, direction) {
    const card = sliderWrapper.querySelector('.project-card') || sliderWrapper.querySelector('.skill-card');
    if (!card) return; // Exit if no card found
    const cardWidth = card.offsetWidth;
    const gap = parseFloat(getComputedStyle(sliderWrapper).gap); // Get the actual gap value
    const scrollAmount = cardWidth + gap;

    if (direction === 'left') {
        sliderWrapper.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    } else {
        sliderWrapper.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }
}

// Event listeners for Project Slider navigation buttons
projectsLeftArrowBtn.addEventListener('click', () => scrollSlider(projectsSliderWrapper, 'left'));
projectsRightArrowBtn.addEventListener('click', () => scrollSlider(projectsSliderWrapper, 'right'));

// Event listeners for Skills Slider navigation buttons
skillsLeftArrowBtn.addEventListener('click', () => scrollSlider(skillsSliderWrapper, 'left'));
skillsRightArrowBtn.addEventListener('click', () => scrollSlider(skillsSliderWrapper, 'right'));


// Generic Mouse/Touch Drag functionality for sliders
function addDragListeners(sliderWrapper) {
    sliderWrapper.addEventListener('mousedown', (e) => {
        isDown = true;
        activeSlider = sliderWrapper;
        sliderWrapper.classList.add('active-drag');
        startX = e.pageX - sliderWrapper.offsetLeft;
        scrollLeft = sliderWrapper.scrollLeft;
    });

    sliderWrapper.addEventListener('mouseleave', () => {
        if (activeSlider === sliderWrapper) {
            isDown = false;
            sliderWrapper.classList.remove('active-drag');
            activeSlider = null;
        }
    });

    sliderWrapper.addEventListener('mouseup', () => {
        if (activeSlider === sliderWrapper) {
            isDown = false;
            sliderWrapper.classList.remove('active-drag');
            activeSlider = null;
        }
    });

    sliderWrapper.addEventListener('mousemove', (e) => {
        if (!isDown || activeSlider !== sliderWrapper) return;
        e.preventDefault();
        const x = e.pageX - sliderWrapper.offsetLeft;
        const walk = (x - startX) * 1.5;
        sliderWrapper.scrollLeft = scrollLeft - walk;
    });

    sliderWrapper.addEventListener('touchstart', (e) => {
        isDown = true;
        activeSlider = sliderWrapper;
        startX = e.touches[0].pageX - sliderWrapper.offsetLeft;
        scrollLeft = sliderWrapper.scrollLeft;
    });

    sliderWrapper.addEventListener('touchend', () => {
        if (activeSlider === sliderWrapper) {
            isDown = false;
            activeSlider = null;
        }
    });

    sliderWrapper.addEventListener('touchmove', (e) => {
        if (!isDown || activeSlider !== sliderWrapper) return;
        const x = e.touches[0].pageX - sliderWrapper.offsetLeft;
        const walk = (x - startX) * 1.5;
        sliderWrapper.scrollLeft = scrollLeft - walk;
    });
}

// Apply drag listeners to both sliders
addDragListeners(projectsSliderWrapper);
addDragListeners(skillsSliderWrapper);

// Hide loader overlay when the page is fully loaded
window.addEventListener('load', () => {
    const loaderOverlay = document.getElementById('loader-overlay');
    if (loaderOverlay) {
        loaderOverlay.style.opacity = '0';
        loaderOverlay.addEventListener('transitionend', () => {
            loaderOverlay.style.visibility = 'hidden';
        });
    }
});
