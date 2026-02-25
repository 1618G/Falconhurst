/**
 * Falconhurst Holiday Let - Interactive Features
 * Rich micro-interactions for a delightful user experience
 */

document.addEventListener('DOMContentLoaded', () => {
    initScrollProgress();
    initNavigation();
    initHeroCarousel();
    initHeroParallax();
    initGalleryCarousel();
    initScrollReveals();
    initSectionDividers();
    initRoomsListReveal();
    initStoryReveal();
    initAwardQuoteReveal();
    initReviewCardReveals();
    initContactForm();
    initSmoothScroll();
    initButtonRipple();
});

/**
 * Scroll Progress Bar
 */
function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;

    function update() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = progress + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
}

/**
 * Navigation - Scroll effects, mobile menu, active section tracking
 */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id], header[id]');

    window.addEventListener('scroll', throttle(() => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        updateActiveNav(sections, navLinks);
    }, 80), { passive: true });

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

function updateActiveNav(sections, navLinks) {
    const scrollPos = window.pageYOffset + window.innerHeight / 3;

    let currentSection = '';
    sections.forEach(section => {
        if (section.offsetTop <= scrollPos) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('section-active');
        const href = link.getAttribute('href');
        if (href && href === '#' + currentSection) {
            link.classList.add('section-active');
        }
    });
}

/**
 * Hero Carousel
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

    setInterval(() => {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }, 6000);
}

/**
 * Hero Parallax - Subtle depth on scroll
 */
function initHeroParallax() {
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    if (!hero || !heroContent) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroHeight = hero.offsetHeight;

        if (scrolled > heroHeight) return;

        const parallaxOffset = scrolled * 0.35;
        const opacity = 1 - (scrolled / heroHeight) * 0.8;

        heroContent.style.transform = `translateY(${parallaxOffset}px)`;
        heroContent.style.opacity = Math.max(opacity, 0);
    }, { passive: true });
}

/**
 * Gallery Carousel
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
        const slideWidth = slides[0].offsetWidth + 16;
        const offset = -currentIndex * slideWidth;
        track.style.transform = `translateX(${offset}px)`;

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

    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? nextSlide() : prevSlide();
        }
    }, { passive: true });

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            slidesToShow = getSlidesToShow();
            createDots();
            goToSlide(0);
        }, 250);
    });

    createDots();
}

/**
 * Scroll Reveals - Directional animations on scroll
 */
function initScrollReveals() {
    const revealConfig = [
        { selector: '.welcome-image', direction: 'left' },
        { selector: '.welcome-content', direction: 'right' },
        { selector: '.about-card', direction: 'up', stagger: true },
        { selector: '.contact-info', direction: 'left' },
        { selector: '.contact-form-wrapper', direction: 'right' },
        { selector: '.section-header', direction: 'up' },
        { selector: '.story-content', direction: 'scale' },
        { selector: '.award-content', direction: 'up' },
        { selector: '.about-features-list', direction: 'up' },
        { selector: '.location-content', direction: 'right' },
    ];

    const allElements = [];

    revealConfig.forEach(config => {
        const elements = document.querySelectorAll(config.selector);
        elements.forEach((el, i) => {
            el.classList.add('reveal', `reveal-${config.direction}`);
            if (config.stagger) {
                el.classList.add(`stagger-${(i % 6) + 1}`);
            }
            allElements.push(el);
        });
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    allElements.forEach(el => observer.observe(el));
}

/**
 * Section Dividers - Grow animation on scroll
 */
function initSectionDividers() {
    const dividers = document.querySelectorAll('.section-divider');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    dividers.forEach(d => observer.observe(d));
}

/**
 * Rooms List - Staggered item reveal
 */
function initRoomsListReveal() {
    const list = document.querySelector('.rooms-list');
    if (!list) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.2 }
    );

    observer.observe(list);
}

/**
 * Story Section - Staggered paragraph reveal
 */
function initStoryReveal() {
    const paragraphs = document.querySelectorAll('.story-content p');
    if (!paragraphs.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.3, rootMargin: '0px 0px -40px 0px' }
    );

    paragraphs.forEach(p => observer.observe(p));
}

/**
 * Award Quote - Border grow animation
 */
function initAwardQuoteReveal() {
    const quote = document.querySelector('.award-quote');
    if (!quote) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.3 }
    );

    observer.observe(quote);
}

/**
 * Review Cards - Quote mark reveal
 */
function initReviewCardReveals() {
    const cards = document.querySelectorAll('.review-card');
    if (!cards.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
    );

    cards.forEach((card, i) => {
        card.style.transitionDelay = (i * 0.12) + 's';
        observer.observe(card);
    });
}

/**
 * Button Ripple Effect
 */
function initButtonRipple() {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            btn.style.setProperty('--ripple-x', x + '%');
            btn.style.setProperty('--ripple-y', y + '%');
        });
    });
}

/**
 * Contact Form
 */
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.email || !isValidEmail(data.email)) {
            showFormError('Please enter a valid email address.');
            return;
        }

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
 * Smooth Scroll
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
 * Utility: Throttle
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
