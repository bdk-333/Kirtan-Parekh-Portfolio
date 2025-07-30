// Get references to the mobile menu button and the mobile menu
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuLinks = mobileMenu.querySelectorAll('a');
const currentYearSpan = document.getElementById('currentYear');

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


// --- New Slider Class Implementation ---
class Slider {
    constructor(wrapperSelector, prevBtnSelector, nextBtnSelector, cardSelector) {
        this.sliderWrapper = document.querySelector(wrapperSelector);
        this.prevBtn = document.querySelector(prevBtnSelector);
        this.nextBtn = document.querySelector(nextBtnSelector);
        this.cardSelector = cardSelector; // Selector for individual cards within the wrapper

        if (!this.sliderWrapper || !this.prevBtn || !this.nextBtn) {
            console.error('One or more slider elements not found for:', wrapperSelector);
            return;
        }

        this.cards = Array.from(this.sliderWrapper.querySelectorAll(this.cardSelector));
        this.cardWidth = 0; // Will be calculated dynamically
        this.gap = 0; // Will be calculated dynamically
        this.visibleCards = 0; // Number of cards visible at once
        this.totalCards = this.cards.length;

        this.isDown = false;
        this.startX;
        this.scrollLeft;
        this.activeSlider = null; // To keep track of which slider is being dragged

        this.init();
    }

    init() {
        this.calculateCardDimensions();
        this.cloneCards();
        this.setupEventListeners();
        // Initial scroll to the start of the "real" content
        this.sliderWrapper.scrollLeft = this.getClonedCount() * (this.cardWidth + this.gap);
    }

    calculateCardDimensions() {
        if (this.cards.length === 0) return;
        const firstCard = this.cards[0];
        this.cardWidth = firstCard.offsetWidth;
        // Get the computed gap from the wrapper's style
        this.gap = parseFloat(getComputedStyle(this.sliderWrapper).gap);

        // Calculate how many cards are visible
        const wrapperWidth = this.sliderWrapper.offsetWidth;
        this.visibleCards = Math.floor(wrapperWidth / (this.cardWidth + this.gap));
        // Ensure at least one card is visible
        if (this.visibleCards === 0 && this.cardWidth > 0) {
            this.visibleCards = 1;
        }
    }

    cloneCards() {
        // Clear any existing clones first to prevent duplicates on re-init
        this.sliderWrapper.querySelectorAll('.clone').forEach(clone => clone.remove());

        // Clone enough cards from the end to fill the visible area and prepend them
        // This ensures a smooth transition when scrolling left from the beginning
        const clonedEndCount = Math.min(this.visibleCards + 1, this.totalCards); // Clone at least visibleCards + 1 for smooth loop
        const clonedEnd = this.cards.slice(-clonedEndCount).map(card => {
            const clone = card.cloneNode(true);
            clone.classList.add('clone');
            return clone;
        });
        clonedEnd.reverse().forEach(clone => this.sliderWrapper.prepend(clone));

        // Clone enough cards from the beginning to fill the visible area and append them
        // This ensures a smooth transition when scrolling right from the end
        const clonedStartCount = Math.min(this.visibleCards + 1, this.totalCards); // Clone at least visibleCards + 1 for smooth loop
        const clonedStart = this.cards.slice(0, clonedStartCount).map(card => {
            const clone = card.cloneNode(true);
            clone.classList.add('clone');
            return clone;
        });
        clonedStart.forEach(clone => this.sliderWrapper.append(clone));

        this.clonedCount = clonedEndCount; // The number of cards cloned at the beginning (and end)
    }

    setupEventListeners() {
        this.prevBtn.addEventListener('click', () => this.scrollSlider('left'));
        this.nextBtn.addEventListener('click', () => this.scrollSlider('right'));

        this.sliderWrapper.addEventListener('scroll', () => this.handleScroll());
        this.sliderWrapper.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.sliderWrapper.addEventListener('mouseleave', this.handleMouseUp.bind(this)); // Use mouseup for leave
        this.sliderWrapper.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.sliderWrapper.addEventListener('mousemove', this.handleMouseMove.bind(this));

        this.sliderWrapper.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.sliderWrapper.addEventListener('touchend', this.handleTouchEnd.bind(this));
        this.sliderWrapper.addEventListener('touchmove', this.handleTouchMove.bind(this));

        // Recalculate dimensions and re-clone on resize
        window.addEventListener('resize', () => {
            this.calculateCardDimensions();
            this.cloneCards(); // Re-clone to adjust for new visibleCards count
            this.sliderWrapper.scrollLeft = this.getClonedCount() * (this.cardWidth + this.gap);
        });
    }

    getClonedCount() {
        // Returns the number of cards cloned at the beginning (which is also used for the end)
        return Math.min(this.visibleCards + 1, this.totalCards);
    }

    scrollSlider(direction) {
        const scrollAmount = this.cardWidth + this.gap;
        if (direction === 'left') {
            this.sliderWrapper.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        } else {
            this.sliderWrapper.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
    }

    handleScroll() {
        const scrollLeft = this.sliderWrapper.scrollLeft;
        const singleCardScroll = this.cardWidth + this.gap;
        const clonedCount = this.getClonedCount();

        const firstRealCardScrollPos = clonedCount * singleCardScroll;
        // The position where the appended clones *start*
        const startOfAppendedClonesPos = (clonedCount + this.totalCards) * singleCardScroll;

        // If scrolled past the *start* of the real content into the prepended clones (left side)
        if (scrollLeft < firstRealCardScrollPos) {
            // Disable smooth scrolling and snap-type for instant jump
            this.sliderWrapper.style.scrollBehavior = 'auto';
            this.sliderWrapper.style.scrollSnapType = 'none';

            // Jump to the corresponding position at the end of the real content
            this.sliderWrapper.scrollLeft = startOfAppendedClonesPos - (this.visibleCards * singleCardScroll); // Adjust to land on the last real card
            
            // Re-enable after a very short delay to allow the browser to process the jump
            requestAnimationFrame(() => {
                this.sliderWrapper.style.scrollBehavior = 'smooth';
                this.sliderWrapper.style.scrollSnapType = 'x mandatory';
            });
        }
        // If scrolled past the *end* of the real content into the appended clones (right side)
        else if (scrollLeft >= startOfAppendedClonesPos) { // Check if the left edge of the view has passed the start of appended clones
            // Disable smooth scrolling and snap-type for instant jump
            this.sliderWrapper.style.scrollBehavior = 'auto';
            this.sliderWrapper.style.scrollSnapType = 'none';

            // Jump back to the beginning of the real content
            this.sliderWrapper.scrollLeft = firstRealCardScrollPos;
            
            // Re-enable after a very short delay to allow the browser to process the jump
            requestAnimationFrame(() => {
                this.sliderWrapper.style.scrollBehavior = 'smooth';
                this.sliderWrapper.style.scrollSnapType = 'x mandatory';
            });
        }
    }

    // Mouse Drag Handlers
    handleMouseDown(e) {
        this.isDown = true;
        this.activeSlider = this.sliderWrapper;
        this.sliderWrapper.classList.add('active-drag');
        this.startX = e.pageX - this.sliderWrapper.offsetLeft;
        this.scrollLeft = this.sliderWrapper.scrollLeft;
    }

    handleMouseUp() {
        if (this.activeSlider === this.sliderWrapper) {
            this.isDown = false;
            this.sliderWrapper.classList.remove('active-drag');
            this.activeSlider = null;
        }
    }

    handleMouseMove(e) {
        if (!this.isDown || this.activeSlider !== this.sliderWrapper) return;
        e.preventDefault();
        const x = e.pageX - this.sliderWrapper.offsetLeft;
        const walk = (x - this.startX) * 1.5; // Adjust sensitivity
        this.sliderWrapper.scrollLeft = this.scrollLeft - walk;
    }

    // Touch Drag Handlers
    handleTouchStart(e) {
        this.isDown = true;
        this.activeSlider = this.sliderWrapper;
        this.startX = e.touches[0].pageX - this.sliderWrapper.offsetLeft;
        this.scrollLeft = this.sliderWrapper.scrollLeft;
    }

    handleTouchEnd() {
        if (this.activeSlider === this.sliderWrapper) {
            this.isDown = false;
            this.activeSlider = null;
        }
    }

    handleTouchMove(e) {
        if (!this.isDown || this.activeSlider !== this.sliderWrapper) return;
        const x = e.touches[0].pageX - this.sliderWrapper.offsetLeft;
        const walk = (x - this.startX) * 1.5; // Adjust sensitivity
        this.sliderWrapper.scrollLeft = this.scrollLeft - walk;
    }
}

// --- Initialize Sliders ---
window.addEventListener('load', () => {
    // Hide loader overlay when the page is fully loaded
    const loaderOverlay = document.getElementById('loader-overlay');
    if (loaderOverlay) {
        loaderOverlay.style.opacity = '0';
        loaderOverlay.addEventListener('transitionend', () => {
            loaderOverlay.style.visibility = 'hidden';
        });
    }

    // Initialize Projects Slider
    new Slider(
        '.projects-slider-wrapper',
        '#projects .slider-nav-btn.left',
        '#projects .slider-nav-btn.right',
        '.project-card'
    );

    // Initialize Skills Slider
    new Slider(
        '.skills-slider-wrapper',
        '#skills .slider-nav-btn.left',
        '#skills .slider-nav-btn.right',
        '.skill-card'
    );
});
