(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Year in footer
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Loader
  const loader = document.getElementById("loader");
  const hideLoader = () => {
    if (!loader) return;
    loader.classList.add("is-hidden");
    loader.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-loading");
  };

  document.body.classList.add("is-loading");
  const loaderDuration = prefersReducedMotion ? 100 : 1600;
  window.addEventListener("load", () => setTimeout(hideLoader, loaderDuration));
  setTimeout(hideLoader, loaderDuration + 800);

  // Lenis smooth scroll
  let lenis = null;
  if (!prefersReducedMotion && typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Header scroll state
  const header = document.getElementById("header");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile nav
  const navToggle = document.getElementById("nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");

  const closeMobileNav = () => {
    if (!navToggle || !mobileNav) return;
    navToggle.setAttribute("aria-expanded", "false");
    mobileNav.hidden = true;
  };

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      mobileNav.hidden = expanded;
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileNav);
    });
  }

  // Smooth anchor scroll with Lenis
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMobileNav();
      if (lenis) {
        lenis.scrollTo(target, { offset: -80 });
      } else {
        target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      }
    });
  });

  // Back to top
  const backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      if (lenis) lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  // Reveal on scroll
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  // Hero reveals on load
  const heroReveals = document.querySelectorAll("#hero .reveal");
  if (!prefersReducedMotion && heroReveals.length) {
    requestAnimationFrame(() => {
      heroReveals.forEach((el, i) => {
        setTimeout(() => el.classList.add("is-visible"), 200 + i * 120);
      });
    });
  } else {
    heroReveals.forEach((el) => el.classList.add("is-visible"));
  }

  // Behance embed lazy load
  function loadEmbed(frame) {
    const src = frame.dataset.embedSrc;
    if (!src || frame.classList.contains("is-loaded")) return;

    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.title = frame.closest(".project")?.querySelector(".project__title")?.textContent || "Behance project";
    iframe.loading = "lazy";
    iframe.allowFullscreen = true;
    iframe.setAttribute("allow", "fullscreen");
    frame.appendChild(iframe);
    frame.classList.add("is-loaded");
  }

  document.querySelectorAll(".embed-chrome__load").forEach((btn) => {
    btn.addEventListener("click", () => {
      const frame = btn.closest(".embed-chrome__frame");
      if (frame) loadEmbed(frame);
    });
  });

  // Auto-load embeds when scrolled into view (optional enhancement)
  const embedFrames = document.querySelectorAll(".embed-chrome__frame[data-embed-src]");
  if (embedFrames.length && !prefersReducedMotion) {
    const embedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Only auto-load if user hasn't interacted — keep click-to-load as primary
            // Uncomment below for auto-load on scroll:
            // loadEmbed(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    embedFrames.forEach((frame) => embedObserver.observe(frame));
  }

  // Subtle parallax on brand background
  if (!prefersReducedMotion) {
    const artboard = document.querySelector(".brand-bg__artboard");
    const wave = document.querySelector(".brand-bg__wave");
    let ticking = false;

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (artboard) {
            artboard.style.transform = `translateY(${y * 0.08}px)`;
          }
          if (wave) {
            wave.style.transform = `translateX(10%) translateY(${y * 0.04}px)`;
          }
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  // Active nav link (optional subtle highlight)
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".header__link[href^='#']");

  if (sections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navLinks.forEach((link) => {
              link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
            });
          }
        });
      },
      { threshold: 0.35, rootMargin: "-80px 0px -50% 0px" }
    );
    sections.forEach((s) => sectionObserver.observe(s));
  }
})();
