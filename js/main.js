document.addEventListener('DOMContentLoaded', () => {
    initPageLoader();
    initHeroCarousel();
});

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
