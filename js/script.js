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
   HERO CANVAS ANIMATION (minimal pastel)
   ============================================ */
class NeuronNetwork {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (this.reducedMotion) return;

        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.connections = [];
        this.animationFrameId = null;
        this.isPaused = false;

        const isMobile = window.innerWidth < 768;
        this.maxNodes = isMobile ? 22 : 48;
        this.connectionDistance = isMobile ? 120 : 170;

        this.colors = [
            '197, 213, 228', // #C5D5E4 dusty blue
            '212, 228, 212', // #D4E4D4 sage
            '232, 213, 224', // #E8D5E0 lavender
            '212, 165, 154', // #D4A59A blush
        ];

        this.initCanvas();
        this.createInitialNetwork();
        this.animate();

        window.addEventListener('resize', this.handleResize.bind(this));
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) this.pause();
            else this.resume();
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
        if (this.reducedMotion) return;
        this.isPaused = false;
        if (!this.animationFrameId) this.animate();
    }

    initCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.nodes = [];
        this.connections = [];
    }

    createInitialNetwork() {
        for (let i = 0; i < this.maxNodes; i++) {
            this.nodes.push(new Node(this.canvas.width, this.canvas.height, this.colors));
        }
        this.reconnectNetwork();
    }

    reconnectNetwork() {
        this.connections = [];
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const dist = this.getDistance(this.nodes[i], this.nodes[j]);
                if (dist < this.connectionDistance) {
                    this.connections.push(new Connection(this.nodes[i], this.nodes[j]));
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
        const isMobile = window.innerWidth < 768;
        this.maxNodes = isMobile ? 22 : 48;
        this.connectionDistance = isMobile ? 120 : 170;
        this.initCanvas();
        this.createInitialNetwork();
    }

    animate() {
        if (this.isPaused) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.connections.forEach(conn => {
            conn.update();
            conn.draw(this.ctx);
        });

        this.nodes.forEach(node => {
            node.update(this.canvas.width, this.canvas.height);
            node.draw(this.ctx);
        });

        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    }
}

class Node {
    constructor(canvasWidth, canvasHeight, colors) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.radius = Math.random() * 1.2 + 1;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update(canvasWidth, canvasHeight) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvasWidth) this.vx *= -1;
        if (this.y < 0 || this.y > canvasHeight) this.vy *= -1;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, 0.45)`;
        ctx.fill();
    }
}

class Connection {
    constructor(node1, node2) {
        this.node1 = node1;
        this.node2 = node2;
    }

    update() {}

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.node1.x, this.node1.y);
        ctx.lineTo(this.node2.x, this.node2.y);
        ctx.strokeStyle = `rgba(${this.node1.color}, 0.18)`;
        ctx.lineWidth = 1;
        ctx.stroke();
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
