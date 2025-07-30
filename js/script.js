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


// --- Slider Class Implementation ---
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
        this.visibleCards = 0; // Number of cards in the viewport
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

// --- Hero Canvas Animation ---
class NeuronNetwork {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas element not found:', canvasId);
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.connections = [];
        this.animationFrameId = null;

        this.maxNodes = 100; // Increased max neurons
        this.initialNodes = 20; // Start with more neurons
        this.spawnInterval = 1000; // Spawn a new neuron every 1 second initially
        this.lastSpawnTime = Date.now();
        this.nodeLifespan = 25000; // Neurons live for 25 seconds before dying

        // Neon color palette (similar to the provided image)
        this.colors = [
            '270, 100%, 70%', // Purple
            '220, 100%, 70%', // Electric Blue
            '300, 100%, 70%', // Magenta
            '180, 100%, 70%'  // Cyan
        ];

        this.initCanvas();
        this.createInitialNetwork();
        this.animate();

        window.addEventListener('resize', this.handleResize.bind(this));
    }

    initCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        // Clear existing nodes/connections if resizing, for a fresh start
        this.nodes = [];
        this.connections = [];
    }

    createInitialNetwork() {
        for (let i = 0; i < this.initialNodes; i++) {
            this.addNeuron();
        }
    }

    addNeuron() {
        // Remove oldest node if at max capacity to prevent overpopulation
        if (this.nodes.length >= this.maxNodes) {
            this.nodes.shift(); 
        }
        const newNode = new Node(this.canvas.width, this.canvas.height, this.colors);
        this.nodes.push(newNode);
        this.reconnectNetwork(); // Re-evaluate connections for the new node and existing ones
    }

    reconnectNetwork() {
        this.connections = []; // Clear all connections and rebuild
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const dist = this.getDistance(this.nodes[i], this.nodes[j]);
                if (dist < 200) { // Connect nodes within a certain distance
                    this.connections.push(new Connection(this.nodes[i], this.nodes[j], dist));
                }
            }
        }
    }

    getDistance(node1, node2) {
        const dx = node1.x - node2.x;
        const dy = node1.y - node2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    handleResize() {
        this.initCanvas();
        this.createInitialNetwork(); // Re-create with initial nodes on resize
        // Re-initialize lastSpawnTime to prevent immediate spawning after resize
        this.lastSpawnTime = Date.now();
    }

    animate() {
        // Clear the entire canvas each frame to remove all traces
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Periodically add new neurons, respecting maxNodes
        if (Date.now() - this.lastSpawnTime > this.spawnInterval && this.nodes.length < this.maxNodes) {
            this.addNeuron();
            this.lastSpawnTime = Date.now();
        }

        // Update and draw connections
        this.connections.forEach(conn => {
            conn.update();
            conn.draw(this.ctx);
        });

        // Update and draw nodes
        this.nodes.forEach(node => {
            node.update(this.canvas.width, this.canvas.height);
            node.draw(this.ctx);
        });

        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    }

    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
}

class Node {
    constructor(canvasWidth, canvasHeight, colors) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.radius = Math.random() * 1.5 + 1; // Node size between 1 and 2.5
        this.vx = (Math.random() - 0.5) * 3; // Faster initial movement
        this.vy = (Math.random() - 0.5) * 3;
        this.friction = 0.97; // Damping factor to slow down over time (slightly more aggressive)
        this.lightIntensity = 0; // Current light intensity (0 to 1)
        this.targetIntensity = 0; // Target intensity for smooth transition
        this.lightSpeed = Math.random() * 0.02 + 0.005; // Slower, smoother speed of lighting up/down
        this.nextLightTime = Date.now() + Math.random() * 2000; // When to light up next (shorter initial delay)
        this.color = colors[Math.floor(Math.random() * colors.length)]; // Pick from defined neon colors
    }

    update(canvasWidth, canvasHeight) {
        this.x += this.vx;
        this.y += this.vy;

        // Apply friction to slow down movement
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Bounce off walls
        if (this.x < 0 || this.x > canvasWidth) this.vx *= -1;
        if (this.y < 0 || this.y > canvasHeight) this.vy *= -1;

        // Smoothly transition light intensity
        if (Date.now() > this.nextLightTime) {
            this.targetIntensity = (this.targetIntensity === 0) ? 1 : 0; // Toggle target
            this.nextLightTime = Date.now() + Math.random() * 3000 + 500; // Next toggle time (min 0.5s, max 3.5s)
        }
        this.lightIntensity += (this.targetIntensity - this.lightIntensity) * this.lightSpeed;
    }

    draw(ctx) {
        // Draw main node
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        const alpha = this.lightIntensity * 0.8; // Max 0.8 alpha for transparency
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`; // White core for glow
        ctx.fill();

        // Add a glow effect
        const glowRadius = this.radius * 6; // Glow spreads out more
        const gradient = ctx.createRadialGradient(this.x, this.y, this.radius, this.x, this.y, glowRadius);
        
        // Use the selected HSL color for the glow
        const hue = this.color.split(',')[0];
        gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, ${this.lightIntensity * 0.6})`);
        gradient.addColorStop(0.5, `hsla(${hue}, 100%, 70%, ${this.lightIntensity * 0.3})`);
        gradient.addColorStop(1, `hsla(${hue}, 100%, 70%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - glowRadius, this.y - glowRadius, glowRadius * 2, glowRadius * 2);
    }
}

class Connection {
    constructor(node1, node2, distance) {
        this.node1 = node1;
        this.node2 = node2;
        this.initialDistance = distance;
        this.propagationSpeed = 0.05; // Faster propagation speed for lines (more dynamic)
        this.propagationProgress = 0; // 0 to 1, progress of light
        this.isPropagating = false;
        this.triggerNode = null; // Store which node initiated the propagation
    }

    update() {
        // Trigger propagation when one of the connected nodes lights up
        // Only trigger if not already propagating and a node is lighting up
        if (!this.isPropagating && (this.node1.lightIntensity > 0.7 || this.node2.lightIntensity > 0.7)) { // Higher threshold for triggering
            if (Math.random() < 0.005) { // Small chance to trigger
                this.isPropagating = true;
                this.propagationProgress = 0;
                // Determine which node is more lit to set the track color
                this.triggerNode = (this.node1.lightIntensity > this.node2.lightIntensity) ? this.node1 : this.node2;
            }
        }

        if (this.isPropagating) {
            this.propagationProgress += this.propagationSpeed;
            if (this.propagationProgress >= 1) {
                this.isPropagating = false;
                this.propagationProgress = 0;
                this.triggerNode = null;
            }
        }
    }

    draw(ctx) {
        // Only draw the line when it's propagating
        if (this.isPropagating && this.triggerNode) {
            ctx.beginPath();
            ctx.moveTo(this.node1.x, this.node1.y);
            ctx.lineTo(this.node2.x, this.node2.y);
            
            // Use the color of the triggering neuron for the line
            const hue = this.triggerNode.color.split(',')[0];
            const alpha = 1 - Math.abs(0.5 - this.propagationProgress) * 2; // Fade in and out
            ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${alpha * 0.8})`; // Thin, glowing line
            ctx.lineWidth = 1; // Thinner line
            ctx.stroke();

            // Removed the circular glow effect (glowRadius and gradient fill) around the propagating line
            // The line itself is the "track" now
        }
    }
}


// --- Initialize Sliders and Hero Animation ---
window.addEventListener('load', () => {
    // Hide loader overlay when the page is fully loaded
    const loaderOverlay = document.getElementById('loader-overlay');
    if (loaderOverlay) {
        loaderOverlay.style.opacity = '0';
        loaderOverlay.addEventListener('transitionend', () => {
            loaderOverlay.style.visibility = 'hidden';
        });
    }

    // Initialize Hero Canvas Animation
    new NeuronNetwork('heroCanvas');

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
