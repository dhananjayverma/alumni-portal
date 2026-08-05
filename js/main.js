document.addEventListener('DOMContentLoaded', () => {
    initPageLoader();
    initActiveNav();
    initProfileEntry();
    initHeroCarousel();
});

function initProfileEntry() {
    const entry = document.querySelector('[data-auth-entry]');
    if (!entry) return;

    const email = sessionStorage.getItem('cuAuthEmail');
    const provider = sessionStorage.getItem('cuAuthProvider');
    const profileName = sessionStorage.getItem('cuProfileName') || getProfileName(email, provider);

    if (!email && !provider) return;

    const initial = profileName.trim().charAt(0).toUpperCase() || 'U';
    entry.outerHTML = `
        <div class="profile-menu" data-profile-menu>
            <button class="profile-entry" type="button" data-profile-trigger aria-label="Open profile menu" aria-haspopup="true" aria-expanded="false">
                <span class="profile-avatar">${escapeHtml(initial)}</span>
            </button>
            <div class="profile-dropdown" data-profile-dropdown>
                <div class="profile-dropdown-head">
                    <span class="profile-avatar">${escapeHtml(initial)}</span>
                    <div>
                        <strong>${escapeHtml(profileName)}</strong>
                        <small>${escapeHtml(email || provider || 'Alumni Profile')}</small>
                    </div>
                </div>
                <a href="${pageHref('noticeboard.html')}"><i class="ph-fill ph-house"></i> Noticeboard</a>
                <a href="${pageHref('profile.html')}"><i class="ph-fill ph-user"></i> My Profile</a>
                <a href="${pageHref('role-details.html')}"><i class="ph-fill ph-bank"></i> Role Details</a>
                <button type="button" data-profile-logout><i class="ph-bold ph-sign-out"></i> Logout</button>
            </div>
        </div>
    `;

    const menu = document.querySelector('[data-profile-menu]');
    const trigger = menu?.querySelector('[data-profile-trigger]');

    trigger?.addEventListener('click', (event) => {
        event.stopPropagation();
        const isOpen = menu.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', () => closeProfileMenu(menu, trigger));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeProfileMenu(menu, trigger);
        }
    });

    menu?.querySelector('[data-profile-logout]')?.addEventListener('click', () => {
        clearProfileSession();
        window.location.href = rootHref('auth.html');
    });
}

function closeProfileMenu(menu, trigger) {
    menu?.classList.remove('is-open');
    trigger?.setAttribute('aria-expanded', 'false');
}

function clearProfileSession() {
    sessionStorage.removeItem('cuAuthEmail');
    sessionStorage.removeItem('cuAuthProvider');
    sessionStorage.removeItem('cuProfileName');
    sessionStorage.removeItem('cuInstitute');
}

function pageHref(file) {
    return isPagesRoute() ? file : `pages/${file}`;
}

function rootHref(file) {
    return isPagesRoute() ? `../${file}` : file;
}

function isPagesRoute() {
    return window.location.pathname.includes('/pages/');
}

function getProfileName(email, provider) {
    if (email) {
        const name = email.split('@')[0].replace(/[._-]+/g, ' ').trim();
        return name ? name.replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'My Profile';
    }

    return provider ? `${provider} User` : 'My Profile';
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    }[character]));
}

function initActiveNav() {
    const navLinks = Array.from(document.querySelectorAll('.main-nav .nav-link'));
    if (!navLinks.length) return;

    navLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');

            if (!href || href === '#') {
                event.preventDefault();
            }

            navLinks.forEach((item) => item.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function initPageLoader() {
    const loader = document.querySelector('[data-page-loader]');
    if (!loader) return;

    function hideLoader() {
        loader.classList.add('is-hidden');
        window.setTimeout(() => loader.remove(), 550);
    }

    if (document.readyState === 'complete') {
        window.setTimeout(hideLoader, 350);
    } else {
        window.addEventListener('load', () => window.setTimeout(hideLoader, 350), { once: true });
        window.setTimeout(hideLoader, 2500);
    }
}

function initHeroCarousel() {
    const cards = Array.from(document.querySelectorAll('.hero-card'));
    const dots = Array.from(document.querySelectorAll('.hero-dots .dot'));
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (!cards.length || !dots.length || !prevBtn || !nextBtn) return;

    let classes = ['hero-card-left', 'hero-card-main', 'hero-card-right', 'hero-card-far', 'hero-card-hidden', 'hero-card-hidden'];

    function updateCarousel() {
        cards.forEach((card, i) => {
            card.className = `hero-card ${classes[i]}`;
        });
        
        // Find the index of the card that currently has the 'hero-card-main' class
        const mainCardIndex = classes.indexOf('hero-card-main');
        // Map the 6 images to the 4 dots (0, 1, 2, 3). If mainCardIndex is 4 or 5, it wraps around.
        const dotActiveIndex = mainCardIndex % dots.length;
        
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('active', dotIndex === dotActiveIndex);
        });
    }

    function nextSlide() {
        classes.unshift(classes.pop());
        updateCarousel();
    }

    function prevSlide() {
        classes.push(classes.shift());
        updateCarousel();
    }

    let intervalId;
    function restartAutoPlay() {
        window.clearInterval(intervalId);
        intervalId = window.setInterval(nextSlide, 3000);
    }

    prevBtn.addEventListener('click', () => {
        prevSlide();
        restartAutoPlay();
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        restartAutoPlay();
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const currentMainIndex = classes.indexOf('hero-card-main');
            const currentDotIndex = currentMainIndex % dots.length;
            const diff = index - currentDotIndex;
            
            if (diff > 0) {
                for (let i = 0; i < diff; i++) classes.unshift(classes.pop());
            } else if (diff < 0) {
                for (let i = 0; i < Math.abs(diff); i++) classes.push(classes.shift());
            }
            
            updateCarousel();
            restartAutoPlay();
        });
    });

    restartAutoPlay();
}
