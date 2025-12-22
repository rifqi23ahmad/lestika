// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    const links = document.querySelectorAll('a[href^="#"]');
    
    for (const link of links) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    // Add scroll effect to navigation
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = 'none';
        }
    });

    // Simple testimonial carousel functionality
    const testimonialCarousel = document.querySelector('.testimonial-carousel');
    if (testimonialCarousel) {
        let currentIndex = 0;
        const testimonials = testimonialCarousel.querySelectorAll('.testimonial-item');
        
        // Auto-scroll testimonials every 5 seconds
        setInterval(() => {
            if (testimonials.length > 1) {
                currentIndex = (currentIndex + 1) % testimonials.length;
                const scrollAmount = testimonials[0].offsetWidth * currentIndex;
                testimonialCarousel.scrollTo({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            }
        }, 5000);
    }

    // Add animation on scroll for program items
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe program items and feature items
    const programItems = document.querySelectorAll('.program-item');
    const featureItems = document.querySelectorAll('.feature-item');
    
    programItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });

    featureItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });

    // Mobile menu toggle (if needed in future)
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('nav ul');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
});

// WhatsApp click tracking (optional)
document.addEventListener('click', function(e) {
    if (e.target.closest('.whatsapp-widget')) {
        console.log('WhatsApp widget clicked');
        // You can add analytics tracking here
    }
});
