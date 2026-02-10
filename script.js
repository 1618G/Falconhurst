/**
 * Falconhurst Holiday Let - Interactive Features
 * Smooth, elegant interactions for a delightful user experience
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initNavigation();
    initHeroCarousel();
    initGalleryCarousel();
    initScrollAnimations();
    initContactForm();
    initSmoothScroll();
});

/**
 * Navigation - Scroll effects and mobile menu
 */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll effect for navbar
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add scrolled class when past hero
        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

/**
 * Hero Carousel - Auto-rotating background images
 */
function initHeroCarousel() {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length <= 1) return;

    let currentSlide = 0;
    const totalSlides = slides.length;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }

    // Auto-advance every 6 seconds
    setInterval(nextSlide, 6000);
}

/**
 * Gallery Carousel - Interactive image gallery
 */
function initGalleryCarousel() {
    const track = document.getElementById('galleryTrack');
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');
    const dotsContainer = document.getElementById('galleryDots');
    
    if (!track) return;

    const slides = track.querySelectorAll('.gallery-slide');
    const totalSlides = slides.length;
    let currentIndex = 0;
    let slidesToShow = getSlidesToShow();

    // Create dots
    function createDots() {
        dotsContainer.innerHTML = '';
        const numDots = Math.ceil(totalSlides / slidesToShow);
        
        for (let i = 0; i < numDots; i++) {
            const dot = document.createElement('button');
            dot.className = `gallery-dot${i === 0 ? ' active' : ''}`;
            dot.setAttribute('aria-label', `Go to slide group ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i * slidesToShow));
            dotsContainer.appendChild(dot);
        }
    }

    function getSlidesToShow() {
        if (window.innerWidth < 768) return 1;
        if (window.innerWidth < 1024) return 2;
        return 3;
    }

    function updateCarousel() {
        const slideWidth = slides[0].offsetWidth + 16; // Include gap
        const offset = -currentIndex * slideWidth;
        track.style.transform = `translateX(${offset}px)`;

        // Update dots
        const dots = dotsContainer.querySelectorAll('.gallery-dot');
        const activeDotIndex = Math.floor(currentIndex / slidesToShow);
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === activeDotIndex);
        });
    }

    function goToSlide(index) {
        const maxIndex = totalSlides - slidesToShow;
        currentIndex = Math.max(0, Math.min(index, maxIndex));
        updateCarousel();
    }

    function nextSlide() {
        if (currentIndex < totalSlides - slidesToShow) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        updateCarousel();
    }

    function prevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = totalSlides - slidesToShow;
        }
        updateCarousel();
    }

    // Event listeners
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }

    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            slidesToShow = getSlidesToShow();
            createDots();
            goToSlide(0);
        }, 250);
    });

    // Initialize
    createDots();
}

/**
 * Scroll Animations - Fade in elements on scroll
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.welcome-content, .welcome-image, .about-card, .review-card, .contact-info, .contact-form-wrapper, .section-header'
    );

    // Add fade-in class to elements
    animatedElements.forEach((el, index) => {
        el.classList.add('fade-in');
        el.classList.add(`stagger-${(index % 4) + 1}`);
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        }
    );

    animatedElements.forEach((el) => observer.observe(el));
}

/**
 * Contact Form - Opens email client with form data
 */
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Basic validation
        if (!data.email || !isValidEmail(data.email)) {
            showFormError('Please enter a valid email address.');
            return;
        }

        // Create mailto link with form data
        const subject = encodeURIComponent('Falconhurst Holiday Let Enquiry');
        const body = encodeURIComponent(
            `Hello,\n\n` +
            `I would like to make an enquiry about staying at Falconhurst.\n\n` +
            `--- Enquiry Details ---\n\n` +
            `Name: ${data.name || 'Not provided'}\n` +
            `Email: ${data.email}\n` +
            `Number of Guests: ${data.guests || 'Not specified'}\n` +
            `Preferred Dates: ${data.dates || 'Not specified'}\n\n` +
            `Message:\n${data.message || 'No additional message'}\n\n` +
            `---\n\n` +
            `I look forward to hearing from you.\n\n` +
            `Kind regards`
        );

        // Open email client directly
        window.location.href = `mailto:falconhurstbay@gmail.com?subject=${subject}&body=${body}`;
    });

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showFormError(message) {
        alert(message);
    }
}

/**
 * Smooth Scroll - Enhanced scrolling for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            const navbarHeight = document.getElementById('navbar').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });
}

/**
 * Utility: Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Utility: Throttle function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
