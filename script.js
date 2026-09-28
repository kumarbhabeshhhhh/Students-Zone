(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  // Premium, short loading sequence.
  const loader = $("#loader");
  const loaderBar = $("#loaderBar");
  const loaderPercent = $("#loaderPercent");
  let progress = 0;

  const loaderTimer = setInterval(() => {
    progress = Math.min(progress + Math.floor(Math.random() * 12) + 5, 100);
    loaderBar.style.width = `${progress}%`;
    loaderPercent.textContent = `${progress}%`;
    if (progress >= 100) {
      clearInterval(loaderTimer);
      setTimeout(() => loader.classList.add("is-hidden"), 180);
    }
  }, 55);

  // Header state and scroll progress.
  const header = $("#siteHeader");
  const progressBar = $("#scrollProgress");

  const updateScrollUI = () => {
    const scrollTop = window.scrollY;
    header.classList.toggle("scrolled", scrollTop > 18);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = `${max > 0 ? (scrollTop / max) * 100 : 0}%`;
  };
  window.addEventListener("scroll", updateScrollUI, { passive: true });
  updateScrollUI();

  // Accessible mobile navigation.
  const menuToggle = $("#menuToggle");
  const mobileMenu = $("#mobileMenu");

  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
  };

  const openMenu = () => {
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close menu");
    mobileMenu.classList.add("is-open");
    mobileMenu.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
  };

  menuToggle.addEventListener("click", () => {
    menuToggle.getAttribute("aria-expanded") === "true" ? closeMenu() : openMenu();
  });

  $$("#mobileMenu a").forEach(link => link.addEventListener("click", closeMenu));

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  // Scroll reveal using IntersectionObserver.
  const revealItems = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  // Lightweight particles: fixed count, CSS-driven movement.
  const particleHost = $("#particles");
  const particleCount = window.matchMedia("(max-width: 600px)").matches ? 18 : 30;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.setProperty("--dx", `${(Math.random() - 0.5) * 55}px`);
    particle.style.setProperty("--duration", `${4 + Math.random() * 5}s`);
    particle.style.animationDelay = `${Math.random() * -6}s`;
    particleHost.appendChild(particle);
  }

  // Desktop pointer glow and subtle parallax. Disabled on coarse pointers.
  const pointerGlow = $("#pointerGlow");
  const parallaxItems = $$("[data-parallax]");
  const finePointer = window.matchMedia("(pointer:fine)").matches;

  if (finePointer) {
    let targetX = 50, targetY = 50, currentX = 50, currentY = 50;
    let ticking = false;

    window.addEventListener("pointermove", event => {
      targetX = (event.clientX / window.innerWidth) * 100;
      targetY = (event.clientY / window.innerHeight) * 100;
      if (!ticking) {
        requestAnimationFrame(() => {
          currentX += (targetX - currentX) * 0.12;
          currentY += (targetY - currentY) * 0.12;
          pointerGlow.style.left = `${currentX}%`;
          pointerGlow.style.top = `${currentY}%`;

          parallaxItems.forEach(item => {
            const strength = Number(item.dataset.parallax || 0);
            const x = (targetX - 50) * strength;
            const y = (targetY - 50) * strength;
            item.style.transform = `translate3d(${x}%, ${y}%, 0)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  } else {
    pointerGlow.remove();
  }


  // Mobile-safe motion: gently shift the hero layers with page scroll.
  // This does not require hover or a mouse and is disabled for reduced motion.
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = $(".hero");
  const mobileMotionItems = $$(".hero .orb, .hero .ring, .hero .hero-grid");
  if (!reducedMotion && hero && mobileMotionItems.length) {
    let mobileScrollTick = false;
    const updateMobileMotion = () => {
      if (window.innerWidth <= 900) {
        const rect = hero.getBoundingClientRect();
        const progress = Math.max(-0.2, Math.min(1.2, -rect.top / Math.max(hero.offsetHeight, 1)));
        mobileMotionItems.forEach((item, index) => {
          const depth = [0.025, 0.04, 0.012, 0.018, 0.028, 0.01][index] || 0.02;
          item.style.setProperty("--scroll-shift", `${progress * depth * 100}%`);
        });
      }
      mobileScrollTick = false;
    };
    window.addEventListener("scroll", () => {
      if (!mobileScrollTick) {
        requestAnimationFrame(updateMobileMotion);
        mobileScrollTick = true;
      }
    }, { passive: true });
    updateMobileMotion();
  }

  // Button/contact ripple. Works for mouse and touch.
  $$(".ripple").forEach(element => {
    element.addEventListener("pointerdown", event => {
      const rect = element.getBoundingClientRect();
      const dot = document.createElement("span");
      dot.className = "ripple-dot";
      const size = Math.max(rect.width, rect.height) * 0.32;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.left = `${event.clientX - rect.left - size / 2}px`;
      dot.style.top = `${event.clientY - rect.top - size / 2}px`;
      element.appendChild(dot);
      dot.addEventListener("animationend", () => dot.remove(), { once: true });
    }, { passive: true });
  });

  // Prevent accidental stale loading state if the browser restores a page.
  window.addEventListener("pageshow", () => {
    if (loader && loader.classList.contains("is-hidden") === false && document.readyState === "complete") {
      setTimeout(() => loader.classList.add("is-hidden"), 250);
    }
  });
})();
