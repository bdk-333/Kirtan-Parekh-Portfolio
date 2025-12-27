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

/* ============================================
   HEADER SCROLL EFFECT
   ============================================ */
// Add scroll effect to header
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

/* ============================================
   SMOOTH SCROLLING & NAVIGATION
   ============================================ */
// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Active section highlighting in navigation
function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNav);
window.addEventListener('load', updateActiveNav);

/* ============================================
   BACK TO TOP BUTTON
   ============================================ */
// Back to Top Button
const backToTopButton = document.getElementById('backToTop');

function toggleBackToTop() {
    if (window.scrollY > 300) {
        backToTopButton.classList.add('show');
    } else {
        backToTopButton.classList.remove('show');
    }
}

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

window.addEventListener('scroll', toggleBackToTop);

/* ============================================
   SCROLL ANIMATIONS
   ============================================ */
// Scroll-triggered animations using Intersection Observer
// Improved configuration for better mobile support
const observerOptions = {
    threshold: [0, 0.1, 0.2], // Multiple thresholds for better detection
    rootMargin: '0px 0px -100px 0px' // Increased margin for earlier triggering
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');
            // Once visible, we can unobserve to improve performance
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    section.classList.add('fade-in');
    observer.observe(section);
    
    // Immediate check: if section is already in viewport on load, make it visible
    const rect = section.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
    if (isInViewport) {
        section.classList.add('fade-in-visible');
    }
});

// Fallback: Ensure sections are visible after a delay or on scroll
// This handles cases where Intersection Observer might not fire on mobile
let fallbackCheckTimeout;
function ensureSectionsVisible() {
    clearTimeout(fallbackCheckTimeout);
    fallbackCheckTimeout = setTimeout(() => {
        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY;
        
        document.querySelectorAll('section').forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + scrollY;
            const sectionBottom = sectionTop + rect.height;
            
            // If section is in or near viewport, make it visible
            // Use larger margin for mobile to catch sections earlier
            const margin = window.innerWidth < 768 ? 400 : 200;
            if (sectionTop < scrollY + viewportHeight + margin && 
                sectionBottom > scrollY - margin) {
                section.classList.add('fade-in-visible');
            }
        });
    }, 50); // Faster check on mobile
}

// Special handling for projects section on mobile
function checkProjectsSection() {
    if (window.innerWidth < 768) {
        const projectsSection = document.getElementById('projects');
        if (projectsSection) {
            const rect = projectsSection.getBoundingClientRect();
            // If projects section is anywhere near viewport, make it visible
            if (rect.top < window.innerHeight + 500 && rect.bottom > -500) {
                projectsSection.classList.add('fade-in-visible');
            }
        }
    }
}

// Run fallback check on scroll and after page load
window.addEventListener('scroll', () => {
    ensureSectionsVisible();
    checkProjectsSection();
}, { passive: true });

window.addEventListener('load', () => {
    ensureSectionsVisible();
    checkProjectsSection();
    // Also check after a short delay to catch any missed sections
    setTimeout(() => {
        ensureSectionsVisible();
        checkProjectsSection();
    }, 500);
});

// Additional check on resize for mobile orientation changes
window.addEventListener('resize', () => {
    setTimeout(() => {
        ensureSectionsVisible();
        checkProjectsSection();
    }, 100);
});

/* ============================================
   FORM VALIDATION & SUBMISSION
   ============================================ */
// Form Validation and Submission
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');

if (contactForm && submitBtn) {
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    // Real-time validation
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const messageError = document.getElementById('messageError');

    function validateName() {
        const value = nameInput.value.trim();
        if (value.length < 2) {
            nameError.textContent = 'Name must be at least 2 characters';
            return false;
        }
        nameError.textContent = '';
        return true;
    }

    function validateEmail() {
        const value = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            emailError.textContent = 'Please enter a valid email address';
            return false;
        }
        emailError.textContent = '';
        return true;
    }

    function validateMessage() {
        const value = messageInput.value.trim();
        if (value.length < 10) {
            messageError.textContent = 'Message must be at least 10 characters';
            return false;
        }
        messageError.textContent = '';
        return true;
    }

    nameInput.addEventListener('blur', validateName);
    nameInput.addEventListener('input', () => {
        if (nameError.textContent) validateName();
    });

    emailInput.addEventListener('blur', validateEmail);
    emailInput.addEventListener('input', () => {
        if (emailError.textContent) validateEmail();
    });

    messageInput.addEventListener('blur', validateMessage);
    messageInput.addEventListener('input', () => {
        if (messageError.textContent) validateMessage();
    });

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Clear previous status
        formStatus.className = 'form-status';
        formStatus.style.display = 'none';

        // Validate all fields
        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isMessageValid = validateMessage();

        if (!isNameValid || !isEmailValid || !isMessageValid) {
            formStatus.className = 'form-status error';
            formStatus.textContent = 'Please fix the errors above';
            formStatus.style.display = 'block';
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        try {
            const formData = new FormData(contactForm);
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                formStatus.className = 'form-status success';
                formStatus.textContent = 'Message sent successfully! I\'ll get back to you soon.';
                formStatus.style.display = 'block';
                contactForm.reset();
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            formStatus.className = 'form-status error';
            formStatus.textContent = 'Something went wrong. Please try again or contact me directly.';
            formStatus.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            // Ensure inline styles are reset (fallback)
            if (btnText) btnText.style.display = '';
            if (btnLoader) btnLoader.style.display = '';
        }
    });
}

/* ============================================
   HERO CANVAS ANIMATION
   ============================================ */
// Hero Canvas Animation
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
        this.isPaused = false;

        // Performance optimization: reduce nodes on mobile devices
        const isMobile = window.innerWidth < 768;
        this.maxNodes = isMobile ? 50 : 100;
        this.initialNodes = isMobile ? 15 : 30;
        this.spawnInterval = isMobile ? 2000 : 1000;
        this.lastSpawnTime = Date.now();
        this.nodeLifespan = 15000;

        // Neon color palette (from the provided image, converted to HSL for dynamic use)
        this.colors = [
            '301, 99%, 71%', // #FC1FF9 (Pink)
            '278, 99%, 65%', // #BC0EEF (Purple)
            '0, 78%, 52%',   // #E42536 (Red)
            '19, 99%, 60%'   // #FC5E31 (Orange)
        ];

        this.initCanvas();
        this.createInitialNetwork();
        this.animate();

        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Pause animation when tab is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }

    pause() {
        this.isPaused = true;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    resume() {
        this.isPaused = false;
        if (!this.animationFrameId) {
            this.animate();
        }
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
                if (dist < 150) { // Connect nodes within a certain distance
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
        const wasMobile = this.maxNodes === 50;
        const isMobile = window.innerWidth < 768;
        
        // Update node counts if switching between mobile/desktop
        if (wasMobile !== isMobile) {
            this.maxNodes = isMobile ? 50 : 100;
            this.initialNodes = isMobile ? 15 : 30;
            this.spawnInterval = isMobile ? 2000 : 1000;
        }
        
        this.initCanvas();
        this.createInitialNetwork(); // Re-create with initial nodes on resize
        // Re-initialize lastSpawnTime to prevent immediate spawning after resize
        this.lastSpawnTime = Date.now();
    }

    animate() {
        if (this.isPaused) return;

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
        const saturation = this.color.split(',')[1];
        const lightness = this.color.split(',')[2];

        gradient.addColorStop(0, `hsla(${hue}, ${saturation}, ${lightness}, ${this.lightIntensity * 0.6})`);
        gradient.addColorStop(0.5, `hsla(${hue}, ${saturation}, ${lightness}, ${this.lightIntensity * 0.3})`);
        gradient.addColorStop(1, `hsla(${hue}, ${saturation}, ${lightness}, 0)`);
        
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
            const saturation = this.triggerNode.color.split(',')[1];
            const lightness = this.triggerNode.color.split(',')[2];
            const alpha = 1 - Math.abs(0.5 - this.propagationProgress) * 2; // Fade in and out
            
            ctx.strokeStyle = `hsla(${hue}, ${saturation}, ${lightness}, ${alpha * 0.8})`; // Thin, glowing line
            ctx.lineWidth = 1; // Thinner line
            ctx.stroke();

            // Removed the circular glow effect (glowRadius and gradient fill) around the propagating line
            // The line itself is the "track" now
        }
    }
}

/* ============================================
   INITIALIZATION
   ============================================ */
// Initialize Hero Animation
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
});
