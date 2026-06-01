(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const header = document.getElementById("header");

  function getScrollOffset() {
    if (header) return header.offsetHeight;
    return 80;
  }

  function getSectionScrollTop(section) {
    if (!section) return 0;
    if (section.id === "hero") return 0;
    return section.offsetTop;
  }

  function scrollToSection(target, immediate = false) {
    const top = getSectionScrollTop(target);
    window.scrollTo({
      top,
      behavior: immediate || prefersReducedMotion ? "auto" : "smooth",
    });
  }

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

  // Header scroll state
  const updateHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", updateHeaderState, { passive: true });
  updateHeaderState();

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

  // Active nav
  const sections = Array.from(document.querySelectorAll("main > section[id]"));
  const navLinks = document.querySelectorAll(
    ".header__link[href^='#'], .header__mobile a[href^='#']"
  );
  let activeSectionId = "";

  function updateActiveNav() {
    if (!sections.length || !navLinks.length) return;

    const viewportMid = window.innerHeight * 0.45;
    let current = sections[0]?.id || "";

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= viewportMid && rect.bottom > viewportMid) {
        current = section.id;
      }
    });

    if (current === activeSectionId) return;
    activeSectionId = current;

    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${current}`);
    });
  }

  window.addEventListener("scroll", updateActiveNav, { passive: true });
  updateActiveNav();

  // Nav links — snap to full-viewport sections
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target || !target.matches("section[id]")) return;
      e.preventDefault();
      closeMobileNav();

      scrollToSection(target, prefersReducedMotion);

      activeSectionId = target.id;
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === id);
      });
    });
  });

  // Back to top
  const backToTop = document.getElementById("back-to-top");
  const hero = document.getElementById("hero");
  if (backToTop && hero) {
    backToTop.addEventListener("click", () => scrollToSection(hero, prefersReducedMotion));
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

  // Subtle parallax on brand background
  if (!prefersReducedMotion) {
    const artboard = document.querySelector(".brand-bg__artboard");
    let ticking = false;

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (artboard) {
            artboard.style.transform = `translateY(${y * 0.06}px)`;
          }
          ticking = false;
        });
      },
      { passive: true }
    );
  }
})();
