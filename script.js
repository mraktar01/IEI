document.addEventListener("DOMContentLoaded", () => {
  // 1. SCROLL NAVBAR
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  });

// 2. MOBILE MENU TOGGLE & CLICK-OUTSIDE LOGIC
  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobileNav");
  const mobileOverlay = document.getElementById("mobileOverlay");
  
  const closeMobileMenu = () => {
    hamburger?.classList.remove("active");
    mobileNav?.classList.remove("open");
    mobileOverlay?.classList.remove("active");
    document.body.style.overflow = ""; // Re-enable scrolling
  };

  const openMobileMenu = () => {
    hamburger?.classList.add("active");
    mobileNav?.classList.add("open");
    mobileOverlay?.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  };

  if (hamburger && mobileNav && mobileOverlay) {
    hamburger.addEventListener("click", () => {
      if (mobileNav.classList.contains("open")) closeMobileMenu();
      else openMobileMenu();
    });

    // Close when clicking the background overlay
    mobileOverlay.addEventListener("click", closeMobileMenu);

    // Close when clicking any nav link
    const mobileLinks = document.querySelectorAll(".mobile-nav-link");
    mobileLinks.forEach(link => {
      link.addEventListener("click", () => {
        setTimeout(closeMobileMenu, 200); // Slight delay for visual feedback
      });
    });
  }

// 3. DARK MODE TOGGLE
  const themeToggles = document.querySelectorAll(".theme-toggle"); // Desktop button
  const mobileThemeBtn = document.getElementById("mobileThemeBtn"); // Mobile button
  const currentTheme = localStorage.getItem("iei-theme");
  
  // Function to update the icons and text
  function updateThemeUI(theme) {
    if (theme === "dark") {
      themeToggles.forEach(btn => btn.innerText = "☀️");
      if (mobileThemeBtn) mobileThemeBtn.innerHTML = '<span class="theme-icon">☀️</span> <span class="theme-text">Light Mode</span>';
    } else {
      themeToggles.forEach(btn => btn.innerText = "🌙");
      if (mobileThemeBtn) mobileThemeBtn.innerHTML = '<span class="theme-icon">🌙</span> <span class="theme-text">Dark Mode</span>';
    }
  }

  // Set initial theme on load
  if (currentTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    updateThemeUI("dark");
  } else {
    updateThemeUI("light");
  }
  
  // Function to handle the actual switching
  const toggleTheme = () => {
    let theme = document.documentElement.getAttribute("data-theme");
    if (theme === "dark") {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("iei-theme", "light");
      updateThemeUI("light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("iei-theme", "dark");
      updateThemeUI("dark");
    }
  };

  // Attach click events to both desktop and mobile buttons
  themeToggles.forEach(btn => btn.addEventListener("click", toggleTheme));
  if (mobileThemeBtn) mobileThemeBtn.addEventListener("click", toggleTheme);

  // 4. SCROLL REVEAL ANIMATIONS
  const reveals = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
  const revealOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("revealed");
      observer.unobserve(entry.target);
    });
  }, revealOptions);
  reveals.forEach(el => revealObserver.observe(el));

  // 5. NUMBER COUNTER ANIMATION
  const counters = document.querySelectorAll(".counter");
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = +counter.getAttribute("data-target");
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        const updateCounter = () => {
          current += increment;
          if (current < target) {
            counter.innerText = Math.ceil(current);
            requestAnimationFrame(updateCounter);
          } else {
            counter.innerText = target;
          }
        };
        updateCounter();
        observer.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(counter => counterObserver.observe(counter));

  // 6. CONTACT FORMS & TOAST NOTIFICATION
  const contactForm = document.getElementById("contactForm");
  const donateBtn = document.getElementById("donateSubmitBtn");
  const toastContainer = document.getElementById("toastContainer") || document.body;

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Thank you! We'll get back to you soon.");
      contactForm.reset();
    });
  }

  if (donateBtn) {
    donateBtn.addEventListener("click", () => {
      showToast("Thank you for your support! We will contact you shortly.");
    });
  }

  // Donation Amount Selection Logic
  document.querySelectorAll(".donation-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      document.querySelectorAll(".donation-btn").forEach(b => b.classList.remove("selected"));
      this.classList.add("selected");
      const customGroup = document.getElementById("customAmountGroup");
      if (customGroup) customGroup.style.display = this.dataset.amount === "custom" ? "block" : "none";
    });
  });
});

// POLICY MODAL LOGIC
const policyModal = document.getElementById('policyModal');
const policyTrigger = document.getElementById('policyTrigger');
const policyCross = document.getElementById('policyCross');
const policyScrollBody = document.getElementById('policyScrollBody');
const acceptPolicyBtn = document.getElementById('acceptPolicyBtn');

if (policyTrigger && policyModal) {
    // Open Modal
    policyTrigger.addEventListener('click', () => {
        policyModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock background scroll
    });

    // Close with Cross
    policyCross.addEventListener('click', () => {
        policyModal.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close when clicking background
    policyModal.addEventListener('click', (e) => {
        if (e.target === policyModal) {
            policyModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Scroll detection to enable button
    policyScrollBody.addEventListener('scroll', () => {
        // If scrolled to 95% of the bottom
        const isAtBottom = policyScrollBody.scrollHeight - policyScrollBody.scrollTop <= policyScrollBody.clientHeight + 50;
        
        if (isAtBottom) {
            acceptPolicyBtn.removeAttribute('disabled');
        }
    });

    // Close with Accept Button
    acceptPolicyBtn.addEventListener('click', () => {
        policyModal.classList.remove('active');
        document.body.style.overflow = '';
        // Optional: Save to local storage so it doesn't bother them again
        localStorage.setItem('policyAccepted', 'true');
    });
}