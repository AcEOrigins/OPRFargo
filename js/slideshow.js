// Slideshow Configuration
const SLIDESHOW_INTERVAL = 5000; // 5 seconds between slides

let currentSlideIndex = 0;
let slideshowInterval;

// Initialize slideshow
function initSlideshow() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) return;
    
    // Start auto-advance
    slideshowInterval = setInterval(nextSlide, SLIDESHOW_INTERVAL);
    
    // Pause on hover
    const slideshowContainer = document.querySelector('.slideshow-container');
    if (slideshowContainer) {
        slideshowContainer.addEventListener('mouseenter', () => {
            clearInterval(slideshowInterval);
        });
        
        slideshowContainer.addEventListener('mouseleave', () => {
            slideshowInterval = setInterval(nextSlide, SLIDESHOW_INTERVAL);
        });
    }
}

// Show specific slide
function showSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) return;
    
    // Wrap around if out of bounds
    if (index >= slides.length) {
        currentSlideIndex = 0;
    } else if (index < 0) {
        currentSlideIndex = slides.length - 1;
    } else {
        currentSlideIndex = index;
    }
    
    // Remove active class from all slides with a slight delay for smooth transition
    slides.forEach((slide, i) => {
        if (i !== currentSlideIndex) {
            slide.classList.remove('active');
        }
    });
    
    // Remove active class from all dots
    dots.forEach(dot => {
        dot.classList.remove('active');
    });
    
    // Show current slide with a small delay for smooth transition
    setTimeout(() => {
        if (slides[currentSlideIndex]) {
            slides[currentSlideIndex].classList.add('active');
        }
        
        // Activate current dot
        if (dots[currentSlideIndex]) {
            dots[currentSlideIndex].classList.add('active');
        }
    }, 50);
    
    // Reset interval
    clearInterval(slideshowInterval);
    slideshowInterval = setInterval(nextSlide, SLIDESHOW_INTERVAL);
}

// Go to next slide
function nextSlide() {
    showSlide(currentSlideIndex + 1);
}

// Go to previous slide
function prevSlide() {
    showSlide(currentSlideIndex - 1);
}

// Go to specific slide (for dot navigation)
function currentSlide(index) {
    showSlide(index - 1); // Convert to 0-based index
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initSlideshow();
});

