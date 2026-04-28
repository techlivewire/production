/* ============================================================
   navbar.js — Production
   Save to: public/js/navbar.js
   Link in index.ejs before </body>:
     <script src="/js/navbar.js" defer></script>
   ============================================================ */

(function () {
  "use strict";

  const navbar    = document.getElementById("mainNavbar");
  const hamburger = document.getElementById("navHamburger");
  const drawer    = document.getElementById("navDrawer");

  if (!navbar || !hamburger || !drawer) return;

  /* ── Scroll: add .scrolled shadow ── */
  const onScroll = () => {
    navbar.classList.toggle("scrolled", window.scrollY > 10);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // run once on load in case page is already scrolled

  /* ── Hamburger toggle ── */
  hamburger.addEventListener("click", () => {
    const isOpen = drawer.classList.toggle("open");
    hamburger.classList.toggle("open", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  /* ── Close drawer when any drawer link is clicked ── */
  drawer.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeDrawer);
  });

  /* ── Close on outside click ── */
  document.addEventListener("click", (e) => {
    if (!navbar.contains(e.target) && !drawer.contains(e.target)) {
      closeDrawer();
    }
  });

  /* ── Close on Escape key ── */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  /* ── Close on resize back to desktop ── */
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) closeDrawer();
  }, { passive: true });

  function closeDrawer() {
    drawer.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

})();
