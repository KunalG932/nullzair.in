// ==========================================
// Portfolio JavaScript - Enhanced with Scroll Animations
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // LENIS SMOOTH SCROLL
    // ==========================================
    let lenis = null;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        function raf(time) {
            lenis.raf(time);
            updateScrollProgress(); // Update progress bar
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
    }

    // ==========================================
    // MOTION+ CURTAINS WIPE EFFECT (angle: 12°, direction: "right")
    // Multi-color cascading curtain sheets sweeping left-to-right at a smooth, relaxed speed
    // ==========================================
    function wipe(options = {}) {
        return {
            type: 'wipe',
            direction: options.direction || 'right',
            angle: options.angle !== undefined ? options.angle : 12,
            duration: options.duration || 1.55
        };
    }

    async function curtains(updateFn, config = {}) {
        const motionCurtains = document.getElementById('motionCurtains');
        
        if (!motionCurtains) {
            if (typeof updateFn === 'function') await updateFn();
            return;
        }

        // Lock scroll while curtain covers viewport
        if (lenis) lenis.stop();
        document.body.style.overflow = 'hidden';

        // Execute update callback while content is covered
        if (typeof updateFn === 'function') {
            try {
                await updateFn();
            } catch (err) {
                console.error('[curtains] Update callback error:', err);
            }
        }

        return new Promise((resolve) => {
            // Settle delay before triggering the 12° angled wipe sweep
            setTimeout(() => {
                motionCurtains.classList.add('reveal');
                document.body.style.overflow = '';
                if (lenis) lenis.start();
            }, 100);

            // Cleanly remove overlay after the final cascading sheet completes its wipe
            setTimeout(() => {
                motionCurtains.classList.add('finished');
                resolve();
            }, 2350);
        });
    }

    // Expose globally matching:
    // await curtains(() => update(), { effect: wipe({ direction: "right", angle: 12 }) })
    window.curtains = curtains;
    window.wipe = wipe;

    // Trigger on initial site load
    curtains(async () => {
        // Page components ready hook
    }, {
        effect: wipe({ direction: 'right', angle: 12 })
    });

    // ==========================================
    // SCROLL PROGRESS BAR
    // ==========================================
    function updateScrollProgress() {
        const scrollProgress = document.querySelector('.scroll-progress');
        if (scrollProgress) {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (scrollTop / height) * 100;
            scrollProgress.style.width = `${scrolled}%`;
        }
    }

    // ==========================================
    // MOBILE NAVIGATION OVERLAY
    // ==========================================
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link, .nav-menu .menu-actions a');
    const navbar = document.querySelector('.navbar');

    navToggle?.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu?.classList.toggle('active');
        navbar?.classList.toggle('menu-active');
        
        // Lock body scroll when mobile menu is active
        if (navMenu?.classList.contains('active')) {
            if (lenis) lenis.stop();
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            if (lenis) lenis.start();
        }
    });

    // Close mobile menu on link click
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle?.classList.remove('active');
            navMenu?.classList.remove('active');
            navbar?.classList.remove('menu-active');
            document.body.style.overflow = '';
            if (lenis) lenis.start();
        });
    });

    // ==========================================
    // DYNAMIC SLIDING NAV INDICATOR PILL
    // ==========================================
    const navIndicatorPill = document.querySelector('.nav-indicator-pill');
    const desktopLinks = document.querySelectorAll('.nav-links-desktop .nav-link');
    const linksContainer = document.querySelector('.nav-links-desktop');

    function updateNavPill(targetLink) {
        if (!navIndicatorPill || !targetLink || !linksContainer) return;
        const linkRect = targetLink.getBoundingClientRect();
        const containerRect = linksContainer.getBoundingClientRect();

        const leftOffset = linkRect.left - containerRect.left;
        const width = linkRect.width;

        navIndicatorPill.style.left = `${leftOffset}px`;
        navIndicatorPill.style.width = `${width}px`;
        navIndicatorPill.classList.add('active');
    }

    // Hover effect for links
    desktopLinks.forEach(link => {
        link.addEventListener('mouseenter', () => updateNavPill(link));
    });

    linksContainer?.addEventListener('mouseleave', () => {
        const currentActive = document.querySelector('.nav-links-desktop .nav-link.active') || desktopLinks[0];
        if (currentActive) updateNavPill(currentActive);
    });

    // Active Navigation Link on Scroll
    const sections = document.querySelectorAll('section[id]');

    function highlightNavLink() {
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 120;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-links-desktop .nav-link[href="#${sectionId}"]`);

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                desktopLinks.forEach(link => link.classList.remove('active'));
                if (navLink) {
                    navLink.classList.add('active');
                    updateNavPill(navLink);
                }
            }
        });
    }

    window.addEventListener('scroll', highlightNavLink);

    // Navbar Scroll Compact State
    function handleNavbarScroll() {
        if (navbar) {
            navbar.classList.toggle('scrolled', window.scrollY > 40);
        }
    }

    window.addEventListener('scroll', handleNavbarScroll);
    handleNavbarScroll();

    // Initial pill placement after fonts/DOM layout settle
    window.addEventListener('load', () => {
        const initialActive = document.querySelector('.nav-links-desktop .nav-link.active') || desktopLinks[0];
        if (initialActive) updateNavPill(initialActive);
    });
    setTimeout(() => {
        const initialActive = document.querySelector('.nav-links-desktop .nav-link.active') || desktopLinks[0];
        if (initialActive) updateNavPill(initialActive);
    }, 400);

    // ==========================================
    // STAGGERED TEXT ANIMATION (Lando Norris Effect)
    // ==========================================
    const staggerLinks = document.querySelectorAll('.footer-social-link, .project-link-btn span');

    staggerLinks.forEach(link => {
        const text = link.textContent.trim();
        link.innerHTML = ''; // Clear current text

        // Wrap each character in a span
        [...text].forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char; // Handle spaces
            span.classList.add('letter');
            span.setAttribute('data-letter', char);
            
            // Add stagger delay
            span.style.transitionDelay = `${index * 0.03}s`;
            
            link.appendChild(span);
        });
    });

    // Update pill right after character wrapping completes
    const currentActiveLink = document.querySelector('.nav-links-desktop .nav-link.active') || desktopLinks[0];
    if (currentActiveLink) updateNavPill(currentActiveLink);

    // ==========================================
    // DYNAMIC MULTILINGUAL GREETING ROLLER (EVERY 5 SECONDS)
    // ==========================================
    const heroGreetingReel = document.getElementById('heroGreetingReel');

    if (heroGreetingReel) {
        const greetings = [
            { text: "Hello", font: "'Outfit', sans-serif", class: "greeting-en", tracking: "-0.04em" },
            { text: "नमस्ते", font: "'Noto Sans Devanagari', sans-serif", class: "greeting-hi", tracking: "0em" },
            { text: "வணக்கம்", font: "'Noto Sans Tamil', sans-serif", class: "greeting-ta", tracking: "0em" },
            { text: "Namaste", font: "'Outfit', sans-serif", class: "greeting-en-long", tracking: "-0.03em" },
            { text: "Vanakkam", font: "'Outfit', sans-serif", class: "greeting-en-long", tracking: "-0.03em" },
            { text: "नमस्कार", font: "'Noto Sans Devanagari', sans-serif", class: "greeting-mr", tracking: "0em" }
        ];

        let currentIndex = 0;
        let isTransitioning = false;

        function rollGreeting() {
            if (isTransitioning) return;
            isTransitioning = true;

            const nextIndex = (currentIndex + 1) % greetings.length;
            const nextData = greetings[nextIndex];
            const currentSpan = heroGreetingReel.querySelector('.greeting-text.active') || heroGreetingReel.querySelector('.greeting-text');

            // Create incoming greeting element
            const nextSpan = document.createElement('span');
            nextSpan.className = `greeting-text ${nextData.class}`;
            nextSpan.textContent = nextData.text;
            nextSpan.style.fontFamily = nextData.font;
            nextSpan.style.letterSpacing = nextData.tracking;
            nextSpan.style.transform = 'translateY(100%)';
            nextSpan.style.opacity = '0';
            nextSpan.style.filter = 'blur(2px)';

            heroGreetingReel.appendChild(nextSpan);

            // Reflow
            void nextSpan.offsetWidth;

            // Trigger kinetic slot/roll scroll transition
            requestAnimationFrame(() => {
                if (currentSpan) {
                    currentSpan.classList.remove('active');
                    currentSpan.style.transform = 'translateY(-100%)';
                    currentSpan.style.opacity = '0';
                    currentSpan.style.filter = 'blur(2px)';
                }
                nextSpan.style.transform = 'translateY(0)';
                nextSpan.style.opacity = '1';
                nextSpan.style.filter = 'blur(0)';
            });

            setTimeout(() => {
                if (currentSpan && currentSpan.parentNode === heroGreetingReel) {
                    currentSpan.remove();
                }
                nextSpan.classList.add('active');
                currentIndex = nextIndex;
                isTransitioning = false;
            }, 850);
        }

        // Automatic 5-second interval roll
        let greetingInterval = setInterval(rollGreeting, 5000);

        // Manage visibility state
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                clearInterval(greetingInterval);
            } else {
                clearInterval(greetingInterval);
                greetingInterval = setInterval(rollGreeting, 5000);
            }
        });
    }

    // ==========================================
    // STICKY SCROLL ANIMATIONS
    // ==========================================

    // Hero Title Parallax Effect
    const heroTitle = document.querySelector('.hero-title');
    const heroStats = document.querySelector('.hero-stats');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroPortrait = document.querySelector('.hero-portrait');
    const scrollIndicator = document.querySelector('.scroll-indicator');

    function heroParallax() {
        const scrollY = window.scrollY;
        const heroSection = document.querySelector('.hero');
        const heroHeight = heroSection?.offsetHeight || 0;

        if (scrollY < heroHeight) {
            const progress = scrollY / heroHeight;

            // Title moves down and fades slightly
            if (heroTitle) {
                heroTitle.style.transform = `translateY(${scrollY * 0.22}px)`;
                heroTitle.style.opacity = 1 - (progress * 0.6);
            }

            // Stats move
            if (heroStats) {
                heroStats.style.transform = `translateY(${scrollY * 0.15}px)`;
                heroStats.style.opacity = 1 - (progress * 0.8);
            }

            // Subtitle moves slightly faster than title so they never collide
            if (heroSubtitle) {
                heroSubtitle.style.transform = `translateY(${scrollY * 0.26}px)`;
                heroSubtitle.style.opacity = 1 - (progress * 0.7);
            }

            // Portrait scales slightly and transitions from Black & White to Full Color on scroll
            if (heroPortrait) {
                const baseOffset = window.innerWidth <= 1024 ? 0 : -12;
                heroPortrait.style.transform = `translateY(${baseOffset + scrollY * 0.1}px) scale(${1 + progress * 0.05})`;

                // Color reveal: 100% black & white at top, smoothly becomes fully colored on scroll
                const colorProgress = Math.min(1, Math.max(0, scrollY / 220));
                const grayscaleVal = (1 - colorProgress) * 100;
                const saturationVal = 1 + (colorProgress * 0.08);
                heroPortrait.style.filter = `grayscale(${grayscaleVal.toFixed(1)}%) contrast(1.06) saturate(${saturationVal.toFixed(2)}) drop-shadow(0 15px 30px rgba(0, 0, 0, 0.08))`;
            }

            // Scroll indicator fades out
            if (scrollIndicator) {
                scrollIndicator.style.opacity = 1 - (progress * 3);
            }
        } else if (heroPortrait) {
            // Past hero section, ensure full color
            heroPortrait.style.filter = `grayscale(0%) contrast(1.06) saturate(1.08) drop-shadow(0 15px 30px rgba(0, 0, 0, 0.08))`;
        }
    }

    window.addEventListener('scroll', heroParallax);
    heroParallax(); // Initial check on load

    // ==========================================
    // TEXT REVEAL ON SCROLL
    // ==========================================

    // Split text animation for section titles
    const animatedTexts = document.querySelectorAll('.stat-number, .exp-title, .project-title');

    animatedTexts.forEach(text => {
        text.classList.add('scroll-reveal-text');
    });

    // Scroll Reveal Animation with stagger
    const revealElements = document.querySelectorAll(
        '.hero-content, .about-content, .project-row, .section-header, .cta-container, .project-info-item'
    );

    const revealOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px'
    };

    let revealDelay = 0;

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Staggered animation
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                    entry.target.classList.add('visible'); // Added visible for project items
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach((el, index) => {
        el.classList.add('scroll-reveal');
        revealObserver.observe(el);
    });

    // ==========================================
    // COUNTER ANIMATION FOR STATS
    // ==========================================

    const statNumbers = document.querySelectorAll('.stat-num, .stat-number');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const text = target.textContent;
                const hasPlus = text.includes('+');
                const hasPercent = text.includes('%');
                const number = parseInt(text.replace(/[^0-9]/g, ''));

                if (!isNaN(number) && !target.classList.contains('counted')) {
                    target.classList.add('counted');
                    animateCounter(target, number, hasPlus, hasPercent);
                }
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => counterObserver.observe(stat));

    function animateCounter(element, target, hasPlus, hasPercent) {
        let current = 0;
        const increment = target / 40;
        const duration = 1500;
        const stepTime = duration / 40;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            let display = Math.floor(current);
            if (hasPlus) display = '+' + display;
            if (hasPercent) display = display + '%';
            element.textContent = display;
        }, stepTime);
    }

    // ==========================================
    // SMOOTH SCROLL INDICATOR
    // ==========================================

    scrollIndicator?.addEventListener('click', () => {
        const aboutSection = document.querySelector('#about');
        aboutSection?.scrollIntoView({ behavior: 'smooth' });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ==========================================
    // ADD DYNAMIC CSS FOR ANIMATIONS
    // ==========================================

    const style = document.createElement('style');
    style.textContent = `
        /* Scroll Reveal Animation */
        .scroll-reveal {
            opacity: 0;
            transform: translateY(40px);
            transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), 
                        transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .scroll-reveal.revealed {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* Text reveal animation */
        .scroll-reveal-text {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .revealed .scroll-reveal-text,
        .scroll-reveal-text.revealed {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* Hero elements smooth transitions */
        .hero-title,
        .hero-stats,
        .hero-subtitle,
        .hero-portrait {
            transition: transform 0.1s linear, opacity 0.1s linear;
            will-change: transform, opacity;
        }
        
        /* Stagger animation for cards */
        .project-card:nth-child(1) { transition-delay: 0s; }
        .project-card:nth-child(2) { transition-delay: 0.15s; }
        .project-card:nth-child(3) { transition-delay: 0.3s; }
        
        /* Counter animation pulse */
        .counted {
            animation: countPulse 0.3s ease;
        }
        
        @keyframes countPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        /* Scroll indicator hover */
        .scroll-indicator {
            cursor: pointer;
        }
        
        .scroll-indicator:hover svg {
            animation: bounceMore 0.5s ease;
        }
        
        @keyframes bounceMore {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(8px); }
        }
    `;
    document.head.appendChild(style);

    // Initial animation for hero elements
    setTimeout(() => {
        heroTitle?.classList.add('revealed');
    }, 200);

    setTimeout(() => {
        heroStats?.classList.add('revealed');
    }, 400);

    setTimeout(() => {
        heroSubtitle?.classList.add('revealed');
    }, 600);


    // ==========================================
    // LIVE CLOCK
    // ==========================================
    function updateClock() {
        const clockElement = document.getElementById('hero-clock');
        const timezoneElement = document.getElementById('hero-timezone');
        
        if (clockElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            });
            clockElement.textContent = timeString;
        }
    }

    setInterval(updateClock, 1000);
    updateClock();

    // Console Easter Egg
    console.log('%c👋 Hey there, curious developer!', 'font-size: 20px; color: #1a1a1a; font-weight: bold;');
    console.log('%cLooking to hire? Let\'s connect!', 'font-size: 14px; color: #666;');

    // ==========================================
    // CUSTOM CURSOR LOGIC
    // ==========================================
    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');

    if (cursorDot && cursorOutline) {
        window.addEventListener('mousemove', function (e) {
            const posX = e.clientX;
            const posY = e.clientY;

            // Dot follows instantly
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            // Outline follows with slight delay (handled by CSS transition or simple animation)
            // Using animate for smoother trailing effect
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        });

        // Add hover effect for links and buttons
        const interactiveElements = document.querySelectorAll('a, button, .project-row');
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
                cursorOutline.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                cursorDot.style.transform = 'translate(-50%, -50%) scale(0.5)';
            });
            
            el.addEventListener('mouseleave', () => {
                cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
                cursorOutline.style.backgroundColor = 'transparent';
                cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
            });
        });
    }

    // ==========================================
    // BACK TO TOP BUTTON
    // ==========================================
    const backToTopBtn = document.querySelector('.back-to-top');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            lenis.scrollTo(0); // Use Lenis for smooth scroll
        });
    }

    // ==========================================
    // DYNAMIC COPYRIGHT YEAR
    // ==========================================
    const yearSpan = document.getElementById('copyright-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // ==========================================
    // REACT BITS: SPOTLIGHT CARDS & SURFACES
    // ==========================================
    function initSpotlight() {
        const cards = document.querySelectorAll('[data-spotlight]');
        if (!cards.length) return;

        cards.forEach(card => {
            let isHovered = false;
            let rafId = null;

            card.addEventListener('mouseenter', () => {
                isHovered = true;
            });

            card.addEventListener('mouseleave', () => {
                isHovered = false;
                if (rafId) cancelAnimationFrame(rafId);
            });

            card.addEventListener('mousemove', e => {
                if (!isHovered) return;
                if (rafId) cancelAnimationFrame(rafId);

                rafId = requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    card.style.setProperty('--mouse-x', `${x.toFixed(1)}px`);
                    card.style.setProperty('--mouse-y', `${y.toFixed(1)}px`);
                });
            });
        });
    }

    // ==========================================
    // REACT BITS: DECRYPTED TEXT SCRAMBLE (CINEMATIC SLOW)
    // ==========================================
    function initDecryptedText() {
        const glyphs = '!<>-_\\/[]{}—=+*^?#_0123456789ABCDEF';

        function scrambleElement(el) {
            if (el.dataset.isScrambling === 'true') return;
            el.dataset.isScrambling = 'true';

            const originalText = el.getAttribute('data-original-text') || el.textContent.trim();
            if (!el.getAttribute('data-original-text')) {
                el.setAttribute('data-original-text', originalText);
            }

            const length = originalText.length;
            if (length === 0) {
                el.dataset.isScrambling = 'false';
                return;
            }

            if (el._decryptInterval) {
                clearInterval(el._decryptInterval);
                el._decryptInterval = null;
            }

            // Slower, cinematic pacing: 45ms per frame tick
            const speed = 45;
            // Frames before the next character locks in sequentially
            const revealInterval = Math.max(2, Math.floor(36 / Math.max(length, 6)));
            let currentRevealed = 0;
            let tickCount = 0;

            function render() {
                tickCount++;

                // Progressively advance revealed characters
                if (tickCount % revealInterval === 0 && currentRevealed < length) {
                    currentRevealed++;
                    // Advance past spaces seamlessly
                    while (currentRevealed < length && originalText[currentRevealed] === ' ') {
                        currentRevealed++;
                    }
                }

                let output = '';
                for (let i = 0; i < length; i++) {
                    if (originalText[i] === ' ') {
                        output += ' ';
                    } else if (i < currentRevealed) {
                        output += originalText[i];
                    } else if (i === currentRevealed) {
                        const randomGlyph = glyphs[Math.floor(Math.random() * glyphs.length)];
                        output += `<span class="decrypt-char-scramble decrypt-char-lead">${randomGlyph}</span>`;
                    } else {
                        const randomGlyph = glyphs[Math.floor(Math.random() * glyphs.length)];
                        output += `<span class="decrypt-char-scramble">${randomGlyph}</span>`;
                    }
                }

                el.innerHTML = output;

                if (currentRevealed >= length) {
                    clearInterval(el._decryptInterval);
                    el._decryptInterval = null;
                    el.textContent = originalText;
                    el.dataset.isScrambling = 'false';
                }
            }

            el._decryptInterval = setInterval(render, speed);
        }

        // Scroll reveal triggers
        const decryptElements = document.querySelectorAll('[data-decrypt]');
        if (decryptElements.length && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        scrambleElement(entry.target);
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 });

            decryptElements.forEach(el => observer.observe(el));
        }

        // Hover triggers
        const hoverElements = document.querySelectorAll('[data-decrypt-hover]');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                scrambleElement(el);
            });
        });
    }

    // ==========================================
    // REACT BITS: MAGNETIC BUTTONS & ICONS
    // ==========================================
    function initMagneticButtons() {
        if (window.matchMedia('(pointer: coarse)').matches) return;

        const magneticElements = document.querySelectorAll('[data-magnet]');
        if (!magneticElements.length) return;

        magneticElements.forEach(el => {
            const strength = parseFloat(el.getAttribute('data-magnet')) || 0.28;
            let rafId = null;

            el.addEventListener('mousemove', e => {
                const rect = el.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const deltaX = (e.clientX - centerX) * strength;
                const deltaY = (e.clientY - centerY) * strength;

                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => {
                    el.classList.add('is-magnetizing');
                    el.style.transform = `translate3d(${deltaX.toFixed(2)}px, ${deltaY.toFixed(2)}px, 0)`;
                });
            });

            el.addEventListener('mouseleave', () => {
                if (rafId) cancelAnimationFrame(rafId);
                el.classList.remove('is-magnetizing');
                el.style.transform = `translate3d(0px, 0px, 0)`;
            });
        });
    }

    // ==========================================
    // REACT BITS: CLICK SPARK PARTICLE CANVAS
    // ==========================================
    function initClickSpark() {
        const canvas = document.getElementById('clickSparkCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        let isRunning = false;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const sparkColors = ['#1a1a1a', '#f0c9e4', '#ffffff', '#e5e5e5'];

        function createSparks(x, y) {
            const sparkCount = 9;
            for (let i = 0; i < sparkCount; i++) {
                const angle = (Math.PI * 2 / sparkCount) * i + (Math.random() - 0.5) * 0.4;
                const speed = 3.0 + Math.random() * 4.0;
                particles.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: 2.0 + Math.random() * 1.2,
                    color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
                    alpha: 1.0,
                    decay: 0.04 + Math.random() * 0.025
                });
            }

            if (!isRunning) {
                isRunning = true;
                requestAnimationFrame(animateSparks);
            }
        }

        function animateSparks() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= p.decay;

                if (p.alpha <= 0) {
                    particles.splice(i, 1);
                    continue;
                }

                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.strokeStyle = p.color;
                ctx.lineWidth = p.size;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2);
                ctx.stroke();
                ctx.restore();
            }

            if (particles.length > 0) {
                requestAnimationFrame(animateSparks);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                isRunning = false;
            }
        }

        window.addEventListener('pointerdown', e => {
            // Only trigger on mouse clicks or taps (button 0 = left click)
            if (e.button === 0) {
                createSparks(e.clientX, e.clientY);
            }
        });
    }

    // ==========================================
    // REACT BITS: SLINGBUTTON COMPONENT (VANILLA JS)
    // ==========================================
    const GAP = 4;
    const SLOP = { fine: 4, coarse: 8 };
    const FINGER_MAX = 3000;
    const HAND_MAX = 6000;
    const CANCEL = 0.5;
    const POWER_CAP = 1.5;
    const DOT_MS = 300;
    const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const rubberband = (o, dim, c = 0.55) => (o * dim * c) / (dim + c * Math.abs(o));

    function createSlingButton(rootEl, options = {}) {
        if (!rootEl) return null;

        const config = {
            size: options.size || 56,
            strokeWidth: options.strokeWidth || 3,
            armAt: options.armAt || 48,
            maxPull: options.maxPull || 160,
            launchSpeed: options.launchSpeed || 2600,
            recoil: options.recoil !== undefined ? options.recoil : 0.2,
            flight: options.flight || 120,
            axis: options.axis || 'any',
            tapSends: options.tapSends !== undefined ? options.tapSends : true,
            disabled: options.disabled || false,
            onSend: options.onSend || (() => {})
        };

        const R = config.maxPull;
        const ARM = Math.min(config.armAt, 0.8 * R);
        const wellR = config.size / 2 + GAP + config.strokeWidth;
        const arcR = wellR;
        const H = wellR + config.strokeWidth + 2;
        const DOT = Math.max(6, Math.round(config.size / 7));

        const padRef = rootEl.querySelector('.sling-button__pad');
        const padMove = rootEl.querySelector('.sling-button__move');
        const fxRef = rootEl.querySelector('.sling-button__tension');
        const bandRef = rootEl.querySelector('.sling-button__band:not(.sling-button__band--hot)');
        const hotRef = rootEl.querySelector('.sling-button__band--hot');
        const arcRef = rootEl.querySelector('.sling-button__arc');
        const dotRef = rootEl.querySelector('.sling-button__dot');
        const iconRef = rootEl.querySelector('.sling-button__icon');

        let held = false;
        let armed = false;
        let px = 0;
        let py = 0;
        let grip = null;
        let dir = { ux: 0, uy: -1 };
        let dotPending = false;
        let dotTimer = null;
        let skipClick = false;
        let paintQueued = false;
        let springRaf = null;

        const isReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const launchDot = () => {
            dotPending = false;
            clearTimeout(dotTimer);
            if (!dotRef) return;
            relaxIcon();
            const { ux, uy } = dir;
            const from = wellR;
            const to = wellR + config.flight;

            dotRef.animate(
                [
                    { transform: `translate(${-ux * from}px, ${-uy * from}px) scale(1)` },
                    { transform: `translate(${-ux * to}px, ${-uy * to}px) scale(0.6)` }
                ],
                { duration: DOT_MS, easing: EASE_OUT, fill: 'none' }
            );

            dotRef.animate(
                [
                    { opacity: 1, offset: 0 },
                    { opacity: 1, offset: 0.6 },
                    { opacity: 0, offset: 1 }
                ],
                { duration: DOT_MS, easing: 'linear', fill: 'none' }
            );
        };

        const aimIcon = (ux, uy, dist) => {
            if (!iconRef) return;
            const angle = (Math.atan2(-uy, -ux) * 180) / Math.PI + 90;
            iconRef.style.transition = 'none';
            iconRef.style.transform = `rotate(${angle * clamp(dist / 12, 0, 1)}deg)`;
        };

        const relaxIcon = () => {
            if (!iconRef) return;
            iconRef.style.transition = isReducedMotion() ? 'none' : 'transform 360ms cubic-bezier(0.23, 1, 0.32, 1)';
            iconRef.style.transform = 'rotate(0deg)';
        };

        const paint = () => {
            paintQueued = false;
            if (!bandRef || !hotRef || !arcRef || !fxRef) return;

            const { ux, uy } = dir;
            const proj = px * ux + py * uy;
            const p = clamp(proj / ARM, 0, 1);
            const dist = Math.hypot(px, py);

            let d = '';
            if (dist > 0.5) {
                const a = Math.atan2(py, px);
                const b = Math.acos(clamp((wellR - config.size / 2) / dist, -1, 1));
                d = [a + b, a - b]
                    .map(t => {
                        const cx = Math.cos(t);
                        const cy = Math.sin(t);
                        return `M${(wellR * cx).toFixed(2)},${(wellR * cy).toFixed(2)}L${(px + (config.size / 2) * cx).toFixed(2)},${(py + (config.size / 2) * cy).toFixed(2)}`;
                    })
                    .join('');
            }

            const w = config.strokeWidth * (1 - 0.3 * p);
            bandRef.setAttribute('d', d);
            hotRef.setAttribute('d', d);
            bandRef.setAttribute('stroke-width', String(w));
            hotRef.setAttribute('stroke-width', String(w));
            hotRef.style.opacity = String(p);
            fxRef.style.opacity = String(clamp(proj / 6, 0, 1));
            arcRef.setAttribute('stroke-dasharray', `${p} ${1 - p}`);
            arcRef.setAttribute('stroke-dashoffset', String(p / 2));
            arcRef.style.opacity = p > 0.01 ? '1' : '0';

            if (grip) aimIcon(ux, uy, dist);
            arcRef.setAttribute('transform', `rotate(${(Math.atan2(-uy, -ux) * 180) / Math.PI})`);

            if (padMove) {
                padMove.style.transform = `translate(${px}px, ${py}px)`;
            }

            if (dotPending && proj <= config.size / 4) {
                launchDot();
            }
        };

        const schedulePaint = () => {
            if (paintQueued) return;
            paintQueued = true;
            requestAnimationFrame(paint);
        };

        const settle = (v0) => {
            if (isReducedMotion()) {
                if (fxRef) {
                    fxRef.style.transition = 'opacity 200ms ease';
                    fxRef.style.opacity = '0';
                }
                setTimeout(() => {
                    px = 0;
                    py = 0;
                    paint();
                    if (fxRef) fxRef.style.transition = '';
                }, 200);
                return;
            }

            if (springRaf) cancelAnimationFrame(springRaf);

            const x0 = px;
            const y0 = py;
            const vx0 = v0.x;
            const vy0 = v0.y;
            const bounce = config.recoil; // recoil bounce 0.2
            const zeta = Math.max(0.01, 1 - bounce); // damping ratio 0.8
            const duration = 0.4;
            const omega0 = (2 * Math.PI) / duration; // ~ 15.7
            const omegaD = omega0 * Math.sqrt(Math.max(0.01, 1 - zeta * zeta));
            const startTime = performance.now();

            const stepSpring = (now) => {
                const t = (now - startTime) / 1000;
                if (t >= duration && Math.hypot(px, py) < 0.2) {
                    px = 0;
                    py = 0;
                    paint();
                    springRaf = null;
                    return;
                }

                const env = Math.exp(-zeta * omega0 * t);
                const c = Math.cos(omegaD * t);
                const s = Math.sin(omegaD * t);

                const c1x = x0;
                const c2x = (vx0 + zeta * omega0 * x0) / omegaD;
                px = env * (c1x * c + c2x * s);

                const c1y = y0;
                const c2y = (vy0 + zeta * omega0 * y0) / omegaD;
                py = env * (c1y * c + c2y * s);

                paint();
                springRaf = requestAnimationFrame(stepSpring);
            };

            springRaf = requestAnimationFrame(stepSpring);
        };

        const triggerSend = () => {
            rootEl.setAttribute('data-sent', '');
            setTimeout(() => {
                rootEl.removeAttribute('data-sent');
            }, 250);
            config.onSend();
        };

        const onPointerDown = (e) => {
            if (config.disabled || grip || e.button !== 0) return;
            if (springRaf) {
                cancelAnimationFrame(springRaf);
                springRaf = null;
            }

            const rect = rootEl.getBoundingClientRect();
            const scale = rect.width / (rootEl.offsetWidth || rect.width) || 1;

            const dNow = Math.hypot(px, py);
            const dClamped = Math.min(dNow, 0.95 * R);
            const rawNow = dNow > 0.5 ? (R * dClamped) / (R - dClamped) : 0;

            grip = {
                id: e.pointerId,
                startX: e.clientX,
                startY: e.clientY,
                scale,
                moved: false,
                hist: [],
                rawOrigin: dNow > 0.5 ? { x: (rawNow * px) / dNow, y: (rawNow * py) / dNow } : { x: 0, y: 0 },
                slop: e.pointerType === 'touch' ? SLOP.coarse : SLOP.fine
            };

            try {
                padRef.setPointerCapture(e.pointerId);
            } catch (err) {}

            held = true;
            padRef?.setAttribute('data-held', '');
        };

        const onPointerMove = (e) => {
            if (!grip || grip.id !== e.pointerId) return;

            const dx = (e.clientX - grip.startX) / grip.scale;
            const dy = (e.clientY - grip.startY) / grip.scale;

            let rx = grip.rawOrigin.x + dx;
            let ry = grip.rawOrigin.y + dy;

            if (config.axis === 'horizontal') ry = rubberband(ry, config.size / 4);
            else if (config.axis === 'vertical') rx = rubberband(rx, config.size / 4);

            if (!grip.moved && Math.hypot(dx, dy) > grip.slop) grip.moved = true;

            const raw = Math.hypot(rx, ry);
            if (raw < 0.01) return;

            const d = (R * raw) / (R + raw);
            const ux = rx / raw;
            const uy = ry / raw;
            dir = { ux, uy };
            px = d * ux;
            py = d * uy;

            const t = performance.now();
            grip.hist.push({ x: px, y: py, t });
            while (grip.hist.length > 4 || t - grip.hist[0].t > 80) grip.hist.shift();

            const isArmed = d >= ARM;
            if (isArmed !== armed) {
                armed = isArmed;
                if (armed) {
                    rootEl.setAttribute('data-armed', '');
                    padRef?.setAttribute('data-armed', '');
                } else {
                    rootEl.removeAttribute('data-armed');
                    padRef?.removeAttribute('data-armed');
                }
            }

            schedulePaint();
        };

        const release = (pointerId, cancelled) => {
            if (!grip || grip.id !== pointerId) return;

            const currentGrip = grip;
            grip = null;
            skipClick = true;

            try {
                padRef?.releasePointerCapture(pointerId);
            } catch (err) {}

            const d = Math.hypot(px, py);
            const p = d / ARM;
            const { ux, uy } = dir;

            let vx = 0;
            let vy = 0;

            if (!cancelled && currentGrip.hist.length > 1) {
                const a = currentGrip.hist[0];
                const b = currentGrip.hist[currentGrip.hist.length - 1];
                const dt = b.t - a.t;
                if (dt > 0 && performance.now() - b.t < 50) {
                    vx = ((b.x - a.x) / dt) * 1000;
                    vy = ((b.y - a.y) / dt) * 1000;
                }
            }

            const fm = Math.hypot(vx, vy);
            if (fm > FINGER_MAX) {
                vx *= FINGER_MAX / fm;
                vy *= FINGER_MAX / fm;
            }

            if (!currentGrip.moved) {
                relaxIcon();
                if (config.tapSends && !cancelled) {
                    triggerSend();
                }
            } else {
                const fire = armed && !cancelled;
                const launch = fire ? config.launchSpeed * Math.min(p, POWER_CAP) : CANCEL * config.launchSpeed * Math.min(p, 1);
                let v0x = vx - ux * launch;
                let v0y = vy - uy * launch;
                const m = Math.hypot(v0x, v0y);
                if (m > HAND_MAX) {
                    v0x *= HAND_MAX / m;
                    v0y *= HAND_MAX / m;
                }

                if (!fire) relaxIcon();

                if (fire) {
                    triggerSend();
                    if (isReducedMotion()) {
                        rootEl.setAttribute('data-sent', '');
                        setTimeout(() => rootEl.removeAttribute('data-sent'), 200);
                    } else {
                        dotPending = true;
                        dotTimer = setTimeout(launchDot, 150);
                    }
                }

                settle({ x: v0x, y: v0y });
            }

            armed = false;
            held = false;
            rootEl.removeAttribute('data-armed');
            padRef?.removeAttribute('data-armed');
            padRef?.removeAttribute('data-held');
        };

        // Event Listeners on Pad
        if (padRef) {
            padRef.addEventListener('pointerdown', onPointerDown);
            padRef.addEventListener('pointermove', onPointerMove);
            padRef.addEventListener('pointerup', e => release(e.pointerId, false));
            padRef.addEventListener('pointercancel', e => release(e.pointerId, true));
            padRef.addEventListener('lostpointercapture', e => release(e.pointerId, true));

            padRef.addEventListener('keydown', e => {
                if (e.key === 'Escape' && grip) {
                    release(grip.id, true);
                } else if ((e.key === 'Enter' || e.key === ' ') && !config.disabled) {
                    e.preventDefault();
                    triggerSend();
                    if (!isReducedMotion()) {
                        dotPending = true;
                        dotTimer = setTimeout(launchDot, 150);
                    }
                }
            });

            padRef.addEventListener('click', e => {
                if (skipClick) {
                    skipClick = false;
                    return;
                }
                if (!config.disabled && config.tapSends) {
                    triggerSend();
                }
            });
        }

        // Initial layout paint
        paint();

        return {
            triggerSend,
            setDisabled: (val) => {
                config.disabled = !!val;
                if (padRef) {
                    if (val) {
                        padRef.setAttribute('aria-disabled', 'true');
                    } else {
                        padRef.removeAttribute('aria-disabled');
                    }
                }
            }
        };
    }

    function initSlingButton() {
        const slingMount = document.getElementById('contactSlingButton');
        const msgInput = document.getElementById('contactMessageInput');
        const msgCounter = document.getElementById('msgCharCount');
        const chips = document.querySelectorAll('.contact-chip');
        const toast = document.getElementById('contactToast');
        const toastMsg = document.getElementById('toastMessage');
        const capsule = document.querySelector('.contact-input-capsule');
        const hint = document.getElementById('terminalHint');

        let toastTimeout = null;

        function showToast(text, isError = false) {
            if (!toast || !toastMsg) return;
            toastMsg.textContent = text;
            const icon = toast.querySelector('.toast-icon');
            if (icon) icon.textContent = isError ? '⚠️' : '🚀';
            toast.classList.add('show');

            clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => {
                toast.classList.remove('show');
            }, 4500);
        }

        function handleSendMessage() {
            const message = msgInput ? msgInput.value.trim() : '';

            if (!message) {
                if (capsule) {
                    capsule.classList.remove('shake');
                    void capsule.offsetWidth; // force reflow
                    capsule.classList.add('shake');
                }
                if (hint) {
                    const hintText = hint.querySelector('.hint-text');
                    const hintDot = hint.querySelector('.hint-dot');
                    if (hintText) hintText.textContent = 'Please type a message or choose a topic first!';
                    if (hintDot) hintDot.style.background = '#ef4444';
                    setTimeout(() => {
                        if (hintText) hintText.textContent = 'Pull & release or tap to sling your message';
                        if (hintDot) hintDot.style.background = '#22c55e';
                    }, 3000);
                }
                msgInput?.focus();
                return;
            }

            // Show feedback toast
            showToast('Transmission launched! Opening email client...');

            // Compose mailto link
            const subject = encodeURIComponent('Project / Collaboration Inquiry (via nullzair.in)');
            const body = encodeURIComponent(message + '\n\n--\nSent from nullzair.in message terminal');
            const mailtoUrl = `mailto:kunalgaikwad9322@gmail.com?subject=${subject}&body=${body}`;

            // Reset input field and active chips
            if (msgInput) {
                msgInput.value = '';
                if (msgCounter) msgCounter.textContent = '0';
            }
            chips.forEach(c => c.classList.remove('active'));

            // Open mail client
            setTimeout(() => {
                window.location.href = mailtoUrl;
            }, 350);
        }

        // Initialize the SlingButton instance
        if (slingMount) {
            createSlingButton(slingMount, {
                size: 56,
                strokeWidth: 3,
                armAt: 48,
                maxPull: 160,
                launchSpeed: 2600,
                recoil: 0.2,
                flight: 120,
                axis: 'any',
                tapSends: true,
                onSend: handleSendMessage
            });
        }

        // Input keyboard event (Enter sends)
        if (msgInput) {
            msgInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                }
            });

            msgInput.addEventListener('input', () => {
                if (msgCounter) {
                    msgCounter.textContent = String(msgInput.value.length);
                }
                if (capsule?.classList.contains('shake')) {
                    capsule.classList.remove('shake');
                }
            });
        }

        // Topic chips clicks
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');

                const topicText = chip.getAttribute('data-topic') || '';
                if (msgInput) {
                    msgInput.value = topicText;
                    if (msgCounter) {
                        msgCounter.textContent = String(topicText.length);
                    }
                    msgInput.focus();
                }
            });
        });
    }

    // Initialize React Bits components
    initSpotlight();
    initDecryptedText();
    initMagneticButtons();
    initClickSpark();
    initSlingButton();

});
