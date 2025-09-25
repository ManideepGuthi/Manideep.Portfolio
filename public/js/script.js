// Smooth scrolling for anchor links
if (typeof document !== 'undefined') {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return; // skip empty hrefs
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// Hero section entrance animation with GSAP - REMOVED to keep text completely fixed

// Track clicks for analytics
function trackClick(element, page) {
  fetch('/track-click', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ element, page })
  }).catch(err => {
    console.error('Click tracking failed:', err);
  });
}

// Auto scroll feature removed as requested

// Projects hover effects
document.addEventListener('DOMContentLoaded', function() {
  const projectCards = document.querySelectorAll('.project-card');
  
  projectCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
      this.style.borderColor = 'rgba(187, 134, 252, 0.4)';
      this.style.boxShadow = '0 20px 40px rgba(187, 134, 252, 0.1)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.borderColor = 'rgba(187, 134, 252, 0.2)';
      this.style.boxShadow = 'none';
    });
  });
});

// Cleanup function for page unload
window.addEventListener('beforeunload', function() {
  // Cleanup any remaining animations
  if (typeof gsap !== 'undefined') {
    gsap.killTweensOf(window);
  }
});

// Material 3 inspired animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(entry.target, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "power3.out" });
      } else {
        entry.target.style.opacity = 1;
      }

      // Staggered animation for children elements within the section
      gsap.fromTo(entry.target.querySelectorAll('.container > *:not(h2)'),
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: "power2.out", stagger: 0.1, delay: 0.2}
      );

      observer.unobserve(entry.target);
    }
  });
}, observerOptions) : null;

// Apply animations to sections (excluding #about which will have custom animations)
if (observer) {
  document.querySelectorAll('section:not(#about)').forEach(section => {
    if (typeof gsap !== 'undefined') {
      gsap.set(section, { opacity: 0 });
    } else {
      section.style.opacity = 0;
    }
    observer.observe(section);
  });
}

// Animate images on scroll (for images outside #about, #about images will have custom animations)
if (observer) {
  document.querySelectorAll('.image-animate-on-scroll:not(#about .image-animate-on-scroll)').forEach(image => {
    if (typeof gsap !== 'undefined') {
      gsap.set(image, { opacity: 0 });
    } else {
      image.style.opacity = 0;
    }
    observer.observe(image);
  });
}

// GSAP ScrollTrigger for About Me section
if (typeof gsap !== 'undefined' && document.querySelector('#about .image-animate-on-scroll')) {
  gsap.fromTo("#about .image-animate-on-scroll",
    { opacity: 0 },
    { opacity: 1, duration: 1.5, ease: "power3.out",
      scrollTrigger: { trigger: "#about", start: "top 75%", end: "bottom top", toggleActions: "play none none reverse" }
    }
  );
}

// Removed GSAP animation for About Me section text and headings as requested
/*
gsap.fromTo("#about h2, #about .lead, #about p",
  { opacity: 0 },
  { 
    opacity: 1, 
    duration: 1, 
    ease: "power2.out", 
    stagger: 0.2,
    scrollTrigger: {
      trigger: "#about",
      start: "top 70%",
      toggleActions: "play none none reverse"
    }
  }
);
*/
// Staggered animations for cards and timeline items
if (typeof gsap !== 'undefined') {
  gsap.utils.toArray(".card").forEach(card => {
    gsap.from(card, { opacity: 0, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: card, start: "top 80%", end: "bottom 20%", toggleActions: "play none none reverse" }
    });
  });
}

// Scroll-triggered text highlights for section headings
if (typeof gsap !== 'undefined') {
  gsap.utils.toArray("h2").forEach(heading => {
    gsap.from(heading, { opacity: 0, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: heading, start: "top 85%", toggleActions: "play none none reverse" }
    });
  });
}

// Navbar link hover animations
document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
  link.addEventListener('mouseenter', () => {
    if (typeof gsap !== 'undefined') gsap.to(link, { scale: 1.05, duration: 0.2, ease: "power1.out" });
  });
  link.addEventListener('mouseleave', () => {
    if (typeof gsap !== 'undefined') gsap.to(link, { scale: 1, duration: 0.2, ease: "power1.out" });
  });
});

// Animated icon hover effects
document.querySelectorAll('.animated-icon').forEach(iconLink => {
  iconLink.addEventListener('mouseenter', () => {
    if (typeof gsap !== 'undefined') gsap.to(iconLink.querySelector('i'), { scale: 1.2, duration: 0.2, ease: "power1.out" });
  });
  iconLink.addEventListener('mouseleave', () => {
    if (typeof gsap !== 'undefined') gsap.to(iconLink.querySelector('i'), { scale: 1, duration: 0.2, ease: "power1.out" });
  });
});

// Enhanced card hover effects (desktop only)
if (typeof window !== 'undefined' && window.innerWidth > 768 && typeof gsap !== 'undefined') {
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mouseenter', () => {
      gsap.to(card, { duration: 0.3, scale: 1.02, boxShadow: "0 12px 24px rgba(187, 134, 252, 0.4)", ease: "power1.out" });
  });

  card.addEventListener('mouseleave', () => {
      gsap.to(card, { duration: 0.3, scale: 1, boxShadow: "0 4px 8px rgba(0,0,0,0.3)", ease: "power1.out" });
    });
  });
}

// Button ripple effect
document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.left = `${e.offsetX}px`;
    ripple.style.top = `${e.offsetY}px`;
    this.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
});

// Removed Timeline animation on scroll (native JS IntersectionObserver) as GSAP handles it now with a simpler fade-in
/*
const timelineItems = document.querySelectorAll('.timeline-item');
const timelineObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        // Removed translateY from here
      }, index * 200);
    }
  });
}, { threshold: 0.5 });

timelineItems.forEach(item => {
  item.style.opacity = '0';
  // Removed translateX from here
  item.style.transition = 'opacity 0.6s ease'; // Adjusted transition to only opacity
  timelineObserver.observe(item);
});
*/

// Button ripple effect
document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.left = `${e.offsetX}px`;
    ripple.style.top = `${e.offsetY}px`;
    this.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
});

// Parallax effect for hero section
if (typeof gsap !== 'undefined') {
  gsap.to(".hero-section", {
    backgroundPositionY: "50%",
    ease: "none",
    scrollTrigger: {
      trigger: ".hero-section",
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });
}

// Dynamic navbar background on scroll
/* Removed scroll-dependent navbar style changes */

// Enhanced Contact Form Functionality
document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contactForm');
  const submitBtn = contactForm?.querySelector('.btn-contact');
  
  if (contactForm && submitBtn) {
    // Form validation and feedback
    const inputs = contactForm.querySelectorAll('.form-input, .form-textarea');
    
    inputs.forEach(input => {
      input.addEventListener('blur', function() {
        validateField(this);
      });
      
      input.addEventListener('input', function() {
        clearFieldError(this);
      });
    });
    
    // Form submission with loading state
    contactForm.addEventListener('submit', function(e) {
      // Allow normal form post (server handles redirect) for maximum reliability
      
      // Validate all fields (client-side hints only)
      let isValid = true;
      inputs.forEach(input => { if (!validateField(input)) isValid = false; });
      if (isValid) { showLoadingState(); }
    });
  }
});

function validateField(field) {
  const feedback = field.parentNode.querySelector('.form-feedback');
  const value = field.value.trim();
  
  // Clear previous feedback
  feedback.textContent = '';
  feedback.className = 'form-feedback';
  
  if (field.hasAttribute('required') && !value) {
    feedback.textContent = 'This field is required';
    feedback.className = 'form-feedback error';
    return false;
  }
  
  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      feedback.textContent = 'Please enter a valid email address';
      feedback.className = 'form-feedback error';
      return false;
    }
  }
  
  if (field.name === 'name' && value && value.length < 2) {
    feedback.textContent = 'Name must be at least 2 characters';
    feedback.className = 'form-feedback error';
    return false;
  }
  
  if (field.name === 'message' && value && value.length < 10) {
    feedback.textContent = 'Message must be at least 10 characters';
    feedback.className = 'form-feedback error';
    return false;
  }
  
  feedback.textContent = '✓';
  feedback.className = 'form-feedback success';
  return true;
}

function clearFieldError(field) {
  const feedback = field.parentNode.querySelector('.form-feedback');
  if (feedback.classList.contains('error')) {
    feedback.textContent = '';
    feedback.className = 'form-feedback';
  }
}

function showLoadingState() {
  const submitBtn = document.querySelector('.btn-contact');
  if (submitBtn) {
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
  }
}

