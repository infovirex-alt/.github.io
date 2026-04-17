/* ============================================================
   Virex Media — main.js v2.0
   ============================================================ */

// ── Intro güvenlik kapısı: herhangi bir JS hatası olursa intro kapanır ──
(function () {
    function forceCloseIntro() {
        try {
            const i = document.getElementById('virex-intro');
            if (i) i.remove();
            document.body.classList.remove('intro-active');
        } catch (e) {}
    }
    window.addEventListener('error', forceCloseIntro);
    // Ekstra güvenlik: 6 saniyede hâlâ açıksa kapat
    setTimeout(forceCloseIntro, 6000);
})();

// ── Mobile Menu ──────────────────────────────────────────────
const mobileMenu = document.getElementById('mobile-menu');
const navMenu    = document.querySelector('.nav-menu');

function toggleMenu(open) {
    const isOpen = typeof open === 'boolean' ? open : !mobileMenu.classList.contains('active');
    mobileMenu.classList.toggle('active', isOpen);
    navMenu.classList.toggle('active', isOpen);
    mobileMenu.setAttribute('aria-expanded', String(isOpen));
}

mobileMenu.addEventListener('click', () => toggleMenu());

mobileMenu.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMenu(); }
});

document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => toggleMenu(false)));

// ── Smooth Scroll ─────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const offsetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    });
});

// ── Scroll Reveal (Intersection Observer) ────────────────────
const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeInUp');
            obs.unobserve(entry.target);
        }
    });
}, { root: null, rootMargin: '0px', threshold: 0.1 });

document.querySelectorAll('.service-card, .about-content, .stat-card, .contact-wrapper').forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});

// ── Navbar Scroll Effect ──────────────────────────────────────
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background  = 'rgba(15,23,42,0.95)';
        navbar.style.boxShadow   = '0 4px 20px rgba(0,0,0,0.1)';
    } else {
        navbar.style.background  = 'rgba(15,23,42,0.85)';
        navbar.style.boxShadow   = 'none';
    }
}, { passive: true });

// ── Showcase Slider ───────────────────────────────────────────
const slides    = document.querySelectorAll('.slide');
const nextBtn   = document.querySelector('.next-btn');
const prevBtn   = document.querySelector('.prev-btn');
const dots      = document.querySelectorAll('.dot');

if (slides.length > 0) {
    let currentSlide  = 0;
    const slideInterval = 5000;
    let slideTimer;

    const slideNumEl  = document.getElementById('slide-num');
    const progressBar = document.getElementById('slideProgressBar');

    const restartProgressBar = () => {
        if (!progressBar) return;
        progressBar.style.animation = 'none';
        void progressBar.offsetWidth; // reflow
        progressBar.style.animation = 'sliderBar 5s linear forwards';
    };

    const showSlide = (index) => {
        if (index >= slides.length) currentSlide = 0;
        else if (index < 0)         currentSlide = slides.length - 1;
        else                         currentSlide = index;

        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach((dot, i) => {
            dot.classList.remove('active');
            dot.setAttribute('aria-selected', 'false');
        });

        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
        dots[currentSlide].setAttribute('aria-selected', 'true');

        // Sayacı güncelle
        if (slideNumEl) slideNumEl.textContent = String(currentSlide + 1).padStart(2, '0');

        // Ken Burns: aktif slayt image'ını sıfırla
        const img = slides[currentSlide].querySelector('img');
        if (img) {
            img.style.animation = 'none';
            void img.offsetWidth;
            img.style.animation = 'kenBurns 5.5s ease-out forwards';
        }

        // İlerleme çubuğunu yeniden başlat
        restartProgressBar();
    };

    window.nextSlide = () => { showSlide(currentSlide + 1); resetTimer(); };
    window.prevSlide = () => { showSlide(currentSlide - 1); resetTimer(); };

    const resetTimer = () => {
        clearInterval(slideTimer);
        slideTimer = setInterval(nextSlide, slideInterval);
    };

    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => { showSlide(index); resetTimer(); });
        dot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showSlide(index); resetTimer(); }
        });
    });

    // Pause on hover
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', () => clearInterval(slideTimer));
        sliderContainer.addEventListener('mouseleave', resetTimer);
    }

    // Touch / swipe support for mobile
    if (sliderContainer) {
        let touchStartX = 0;
        let touchEndX   = 0;

        sliderContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        sliderContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                diff > 0 ? nextSlide() : prevSlide();
            }
        }, { passive: true });
    }

    slideTimer = setInterval(nextSlide, slideInterval);
}

// ── Contact Form ──────────────────────────────────────────────
const contactForm = document.getElementById('contact-form');
const formStatus  = document.getElementById('form-status');
const submitBtn   = document.getElementById('submit-btn');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Honeypot check
        const honeypot = contactForm.querySelector('input[name="_gotcha"]');
        if (honeypot && honeypot.value) return;

        const formData = new FormData(contactForm);
        submitBtn.disabled    = true;
        submitBtn.textContent = 'Gönderiliyor...';
        formStatus.textContent = '';
        formStatus.className   = 'form-status';

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                formStatus.textContent = 'Mesajınız başarıyla gönderildi! En kısa sürede sizinle iletişime geçeceğiz.';
                formStatus.classList.add('success');
                contactForm.reset();
            } else {
                formStatus.textContent = 'Bir hata oluştu. Lütfen e-postanızı kontrol edip tekrar deneyin.';
                formStatus.classList.add('error');
            }
        } catch (_err) {
            formStatus.textContent = 'Bağlantı hatası. Lütfen daha sonra tekrar deneyin.';
            formStatus.classList.add('error');
        } finally {
            submitBtn.disabled    = false;
            submitBtn.textContent = 'Gönder';
        }
    });
}

// ── Custom Cursor (pointer devices only) ──────────────────────
if (window.matchMedia('(pointer: fine)').matches) {
    const cursorDot     = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    if (cursorDot && cursorOutline) {
        window.addEventListener('mousemove', (e) => {
            cursorDot.style.left = `${e.clientX}px`;
            cursorDot.style.top  = `${e.clientY}px`;

            cursorOutline.animate(
                { left: `${e.clientX}px`, top: `${e.clientY}px` },
                { duration: 500, fill: 'forwards' }
            );
        }, { passive: true });
    }
}

// ── Scroll Progress Bar ───────────────────────────────────────
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height    = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled  = height > 0 ? (winScroll / height) * 100 : 0;
    const bar       = document.getElementById('scrollProgress');
    if (bar) bar.style.width = scrolled + '%';
}, { passive: true });


// ── FAQ ACCORDION ──────────────────────────────────────────
document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        // close all
        document.querySelectorAll('.faq-q').forEach(b => {
            b.setAttribute('aria-expanded', 'false');
            b.nextElementSibling.classList.remove('open');
        });
        // open clicked (if was closed)
        if (!isOpen) {
            btn.setAttribute('aria-expanded', 'true');
            btn.nextElementSibling.classList.add('open');
        }
    });
});

// ── COOKIE BANNER ──────────────────────────────────────────
const cookieBanner = document.getElementById('cookie-banner');
const cookieAccept = document.getElementById('cookie-accept');
const cookieDecline = document.getElementById('cookie-decline');

if (cookieBanner) {
    // KVKK: 12 aydan eski onayları geçersiz say
    const stored = localStorage.getItem('virex_cookie');
    const isExpired = stored ? (Date.now() - JSON.parse(stored).ts > 365 * 24 * 60 * 60 * 1000) : true;
    if (!stored || isExpired) {
        setTimeout(() => { cookieBanner.style.display = 'block'; }, 1800);
    }
    const hideCookie = (val) => {
        localStorage.setItem('virex_cookie', JSON.stringify({ val, ts: Date.now() }));
        cookieBanner.style.animation = 'none';
        cookieBanner.style.transform = 'translateY(100%)';
        cookieBanner.style.opacity = '0';
        cookieBanner.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
        setTimeout(() => { cookieBanner.style.display = 'none'; }, 360);
    };
    cookieAccept.addEventListener('click',  () => hideCookie('accepted'));
    cookieDecline.addEventListener('click', () => hideCookie('declined'));
}

// ── COUNTER ANIMATION ──────────────────────────────────────
const counters = document.querySelectorAll('.counter');
if (counters.length > 0) {
    const runCounter = (el) => {
        if (el.dataset.animated) return;
        el.dataset.animated = '1';
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1800;
        const step = Math.ceil(target / (duration / 16));
        let current = 0;
        const tick = () => {
            current = Math.min(current + step, target);
            el.textContent = current + suffix;
            if (current < target) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            runCounter(entry.target);
            counterObserver.unobserve(entry.target);
        });
    }, { threshold: 0.1 });
    counters.forEach(c => {
        const r = c.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
            runCounter(c);
        } else {
            counterObserver.observe(c);
        }
    });
}

// ── TOUCH SWIPE FOR SLIDER ─────────────────────────────────
const sliderEl = document.querySelector('.slider-container');
if (sliderEl && typeof nextSlide === 'function') {
    let touchStartX = 0;
    sliderEl.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    sliderEl.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextSlide(); else prevSlide();
        }
    }, { passive: true });
}


// ── AKTİF NAV HIGHLIGHT ────────────────────────────────────
const navLinks = document.querySelectorAll('.nav-link[data-nav]');
const sections = document.querySelectorAll('section[id]');

if (navLinks.length && sections.length) {
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active-section', link.dataset.nav === id);
                });
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => navObserver.observe(s));
}

// ── FORM VALIDATION ────────────────────────────────────────
const validatedForm = document.getElementById('contact-form');
if (validatedForm) {
    const showError = (input, msg) => {
        input.classList.add('input-error');
        let err = input.parentNode.querySelector('.field-error');
        if (!err) {
            err = document.createElement('span');
            err.className = 'field-error';
            input.parentNode.appendChild(err);
        }
        err.textContent = msg;
        err.classList.add('show');
    };
    const clearError = (input) => {
        input.classList.remove('input-error');
        const err = input.parentNode.querySelector('.field-error');
        if (err) err.classList.remove('show');
    };

    validatedForm.querySelectorAll('input[required], textarea[required]').forEach(input => {
        input.addEventListener('blur', () => {
            if (!input.value.trim()) {
                showError(input, 'Bu alan zorunludur.');
            } else if (input.type === 'email' && !input.value.includes('@')) {
                showError(input, 'Geçerli bir e-posta adresi girin.');
            } else {
                clearError(input);
            }
        });
        input.addEventListener('input', () => {
            if (input.value.trim()) clearError(input);
        });
    });

    validatedForm.addEventListener('submit', (e) => {
        let hasError = false;
        validatedForm.querySelectorAll('input[required], textarea[required]').forEach(input => {
            if (!input.value.trim()) {
                showError(input, 'Bu alan zorunludur.');
                hasError = true;
            } else if (input.type === 'email' && !input.value.includes('@')) {
                showError(input, 'Geçerli bir e-posta adresi girin.');
                hasError = true;
            }
        });
        if (hasError) e.preventDefault();
    });
}

// ── BACK TO TOP BUTONU ─────────────────────────────────────
const backTopBtn = document.getElementById('back-top');
if (backTopBtn) {
    window.addEventListener('scroll', () => {
        backTopBtn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });
    backTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ── Hero Spotlight ─────────────────────────────────────────────
(function () {
    const heroSection = document.getElementById('home');
    const spotlight   = document.querySelector('.hero-spotlight');
    if (!heroSection || !spotlight) return;

    let raf;
    heroSection.addEventListener('mousemove', (e) => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
            const rect = heroSection.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width)  * 100;
            const y = ((e.clientY - rect.top)  / rect.height) * 100;
            spotlight.style.setProperty('--mx', x + '%');
            spotlight.style.setProperty('--my', y + '%');
        });
    }, { passive: true });

    heroSection.addEventListener('mouseleave', () => {
        spotlight.style.setProperty('--mx', '50%');
        spotlight.style.setProperty('--my', '50%');
    });
})();

// ── 3D Kart Tilt ───────────────────────────────────────────────
(function () {
    const TILT_MAX = 9;       // max derece
    const SCALE    = 1.025;   // hover'da scale

    document.querySelectorAll('.service-card, .bot-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x    = e.clientX - rect.left;
            const y    = e.clientY - rect.top;
            const cx   = rect.width  / 2;
            const cy   = rect.height / 2;
            const rotX = ((y - cy) / cy) * -TILT_MAX;
            const rotY = ((x - cx) / cx) *  TILT_MAX;
            card.style.transition = 'transform 0.06s ease-out, box-shadow 0.06s ease-out';
            card.style.transform  = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(${SCALE},${SCALE},${SCALE})`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.55s cubic-bezier(0.23,1,0.32,1), box-shadow 0.55s ease-out';
            card.style.transform  = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
        });
    });
})();

// ══════════════════════════════════════════
// Virex — Giriş Animasyonu
// ══════════════════════════════════════════
(function () {
    const intro = document.getElementById('virex-intro');
    if (!intro) return;

    // Aynı oturumda bir kez göster
    if (sessionStorage.getItem('virexIntroShown')) {
        intro.remove();
        document.body.classList.remove('intro-active');
        return;
    }

    function triggerExplode() {
        intro.classList.add('exploding');
        setTimeout(() => {
            intro.remove();
            document.body.classList.remove('intro-active');
            sessionStorage.setItem('virexIntroShown', '1');
        }, 560);
    }

    // V çizimi (1.5s) + parlama (0.9s) + kısa bekleme
    setTimeout(triggerExplode, 2400);

    const skipBtn = document.getElementById('intro-skip-btn');
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            intro.style.transition = 'opacity 0.3s ease';
            intro.style.opacity = '0';
            setTimeout(() => {
                intro.remove();
                document.body.classList.remove('intro-active');
                sessionStorage.setItem('virexIntroShown', '1');
            }, 320);
        });
    }
})();
