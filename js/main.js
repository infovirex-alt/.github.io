// Mobile Menu Toggle
const mobileMenu = document.getElementById('mobile-menu');
const navMenu = document.querySelector('.nav-menu');

// FIX: aria-expanded state güncellemesi eklendi
function toggleMenu(open) {
    const isOpen = typeof open === 'boolean' ? open : !mobileMenu.classList.contains('active');
    mobileMenu.classList.toggle('active', isOpen);
    navMenu.classList.toggle('active', isOpen);
    mobileMenu.setAttribute('aria-expanded', String(isOpen));
}

mobileMenu.addEventListener('click', () => toggleMenu());

// FIX: Klavye desteği eklendi (Enter / Space ile toggle)
mobileMenu.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMenu();
    }
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    toggleMenu(false);
}));

// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    });
});

// Scroll Animation (Intersection Observer)
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeInUp');
            obs.unobserve(entry.target);
        }
    });
}, observerOptions);

// Elements to animate
document.querySelectorAll('.service-card, .about-content, .stat-card, .contact-wrapper').forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
    observer.observe(el);
});

// FIX: Inline stil enjeksiyonu yerine class tanımını CSS'e taşıdık.
// animate-fadeInUp CSS'te tanımlı olmalı (style.css içinde).
// Aşağıdaki blok fallback olarak bırakıldı, CSS'te yoksa devreye girer.
if (!document.querySelector('style[data-virex-anim]')) {
    const animStyle = document.createElement('style');
    animStyle.setAttribute('data-virex-anim', '1');
    animStyle.textContent = '.animate-fadeInUp { opacity: 1 !important; transform: translateY(0) !important; }';
    document.head.appendChild(animStyle);
}

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(15, 23, 42, 0.95)';
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
    } else {
        navbar.style.background = 'rgba(15, 23, 42, 0.85)';
        navbar.style.boxShadow = 'none';
    }
}, { passive: true });

// Showcase Slider Logic
const slides = document.querySelectorAll('.slide');
const nextBtn = document.querySelector('.next-btn');
const prevBtn = document.querySelector('.prev-btn');
const dots = document.querySelectorAll('.dot');

if (slides.length > 0) {
    let currentSlide = 0;
    const slideInterval = 5000;
    let slideTimer;

    const showSlide = (index) => {
        if (index >= slides.length) currentSlide = 0;
        else if (index < 0) currentSlide = slides.length - 1;
        else currentSlide = index;

        slides.forEach(slide => slide.classList.remove('active'));
        // FIX: Dot aria-selected güncellendi
        dots.forEach((dot, i) => {
            dot.classList.remove('active');
            dot.setAttribute('aria-selected', 'false');
        });

        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
        dots[currentSlide].setAttribute('aria-selected', 'true');
    };

    const nextSlide = () => { showSlide(currentSlide + 1); resetTimer(); };
    const prevSlide = () => { showSlide(currentSlide - 1); resetTimer(); };

    const resetTimer = () => {
        clearInterval(slideTimer);
        slideTimer = setInterval(nextSlide, slideInterval);
    };

    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    // FIX: Dot klavye desteği
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => { showSlide(index); resetTimer(); });
        dot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showSlide(index);
                resetTimer();
            }
        });
    });

    // FIX: Kullanıcı hover yaptığında otomatik geçişi durdur
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', () => clearInterval(slideTimer));
        sliderContainer.addEventListener('mouseleave', resetTimer);
    }

    slideTimer = setInterval(nextSlide, slideInterval);
}

// Contact Form AJAX Handling
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const submitBtn = document.getElementById('submit-btn');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // FIX: Honeypot kontrolü — bot doldurmuşsa gönderme
        const honeypot = contactForm.querySelector('input[name="_gotcha"]');
        if (honeypot && honeypot.value) return;

        const formData = new FormData(contactForm);
        submitBtn.disabled = true;
        submitBtn.textContent = 'Gönderiliyor...';
        // FIX: textContent kullanıldı, innerHTML değil (XSS koruması)
        formStatus.textContent = '';
        formStatus.className = 'form-status';

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                formStatus.textContent = 'Mesajınız başarıyla gönderildi! Sizinle en kısa sürede iletişime geçeceğiz.';
                formStatus.classList.add('success');
                contactForm.reset();
            } else {
                formStatus.textContent = 'Bir hata oluştu. Lütfen mailinizi onayladığınızdan emin olun veya daha sonra tekrar deneyin.';
                formStatus.classList.add('error');
            }
        } catch (_err) {
            formStatus.textContent = 'Bağlantı hatası. Lütfen daha sonra tekrar deneyin.';
            formStatus.classList.add('error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Gönder';
        }
    });
}

// Custom Cursor Logic
// FIX: pointer: fine kontrolü eklendi — dokunmatik cihazlarda cursor kodu çalışmaz
const hasFinePonter = window.matchMedia('(pointer: fine)').matches;

if (hasFinePonter) {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    if (cursorDot && cursorOutline) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            cursorOutline.animate(
                { left: `${posX}px`, top: `${posY}px` },
                { duration: 500, fill: "forwards" }
            );
        }, { passive: true });
    }
}

// Scroll Progress Logic
// FIX: passive: true eklendi — scroll event performansı iyileştirildi
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    const bar = document.getElementById('scrollProgress');
    if (bar) bar.style.width = scrolled + '%';
}, { passive: true });
