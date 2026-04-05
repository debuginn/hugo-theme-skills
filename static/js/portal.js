const THEME_KEY = "debuginn_tools_theme";
const THEME_PREFS = ["auto", "dark", "light"];

function detectTheme() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function applyThemePref(pref) {
  applyTheme(pref === "auto" ? detectTheme() : pref);
}

function readThemePref() {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return THEME_PREFS.includes(v) ? v : "auto";
  } catch (_) {
    return "auto";
  }
}

function nextThemePref(pref) {
  const idx = THEME_PREFS.indexOf(pref);
  return THEME_PREFS[(idx + 1) % THEME_PREFS.length];
}

function updateThemeButton(pref, btn) {
  if (!btn) return;
  btn.textContent = pref === "auto" ? "◐" : pref === "dark" ? "☾" : "☀";
  btn.setAttribute("aria-label", pref === "auto" ? "Theme: Auto" : pref === "dark" ? "Theme: Dark" : "Theme: Light");
}

function closeLangDropdown(dropdown) {
  dropdown.classList.remove("open");
  const trigger = dropdown.querySelector("button[aria-expanded]");
  if (trigger) trigger.setAttribute("aria-expanded", "false");
}

function closeLangDropdowns(exceptTarget) {
  document.querySelectorAll(".header-lang-dropdown.open, .footer-lang-dropdown.open").forEach((dropdown) => {
    if (exceptTarget && dropdown.contains(exceptTarget)) return;
    closeLangDropdown(dropdown);
  });
}

function bindLangDropdown(dropdownSel, triggerSel, optionAttr) {
  document.querySelectorAll(dropdownSel).forEach((dropdown) => {
    const trigger = dropdown.querySelector(triggerSel);
    const options = dropdown.querySelectorAll(`[${optionAttr}]`);
    if (!trigger) return;

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      closeLangDropdowns(e.target instanceof Element ? e.target : null);
      const nextOpen = !dropdown.classList.contains("open");
      dropdown.classList.toggle("open", nextOpen);
      trigger.setAttribute("aria-expanded", nextOpen ? "true" : "false");
    });

    options.forEach((option) => {
      option.addEventListener("click", () => {
        const href = option.getAttribute(optionAttr);
        if (href) window.location.href = href;
      });
    });
  });
}

function bindMobileMenu() {
  const menuBtn = document.querySelector(".menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  if (!menuBtn || !mobileMenu) return;

  const closeMenu = () => {
    mobileMenu.classList.remove("open");
    mobileMenu.setAttribute("aria-hidden", "true");
    menuBtn.setAttribute("aria-expanded", "false");
  };

  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = menuBtn.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeMenu();
    } else {
      mobileMenu.classList.add("open");
      mobileMenu.setAttribute("aria-hidden", "false");
      menuBtn.setAttribute("aria-expanded", "true");
    }
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (e) => {
    if (menuBtn.getAttribute("aria-expanded") !== "true") return;
    if (mobileMenu.contains(e.target) || menuBtn.contains(e.target)) return;
    closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) closeMenu();
  });
}

function init() {
  let themePref = readThemePref();
  const themeBtn = document.querySelector(".mode-btn");

  applyThemePref(themePref);
  updateThemeButton(themePref, themeBtn);

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      themePref = nextThemePref(themePref);
      try { localStorage.setItem(THEME_KEY, themePref); } catch (_) {}
      applyThemePref(themePref);
      updateThemeButton(themePref, themeBtn);
    });
  }

  const darkMedia = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
  if (darkMedia && typeof darkMedia.addEventListener === "function") {
    darkMedia.addEventListener("change", () => {
      if (themePref !== "auto") return;
      applyThemePref("auto");
    });
  }

  bindLangDropdown(".header-lang-dropdown", ".header-lang-trigger", "data-lang-href");
  bindLangDropdown(".footer-lang-dropdown", ".footer-lang-trigger", "data-footer-lang-href");
  bindMobileMenu();

  document.querySelectorAll(".card-flip-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const wrap = btn.closest(".card-flip-wrap");
      if (wrap) wrap.classList.toggle("flipped");
    });
  });

  const installSkillBtn = document.getElementById("installSkillBtn");
  const installSkillModal = document.getElementById("installSkillModal");
  const closeInstallModalBtn = document.getElementById("closeInstallModalBtn");

  if (installSkillBtn && installSkillModal) {
    installSkillBtn.addEventListener("click", () => {
      installSkillModal.hidden = false;
    });
    if (closeInstallModalBtn) {
      closeInstallModalBtn.addEventListener("click", () => {
        installSkillModal.hidden = true;
      });
    }
    installSkillModal.querySelectorAll("[data-close-modal]").forEach((el) => {
      el.addEventListener("click", () => { installSkillModal.hidden = true; });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") installSkillModal.hidden = true;
    });
  }

  document.querySelectorAll(".hero-install-copy").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cmd = btn.dataset.cmd;
      if (!cmd) return;
      navigator.clipboard.writeText(cmd).then(() => {
        const copyLabel = btn.dataset.copyLabel || "Copy";
        const copiedLabel = btn.dataset.copiedLabel || "Copied!";
        btn.textContent = copiedLabel;
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = copyLabel;
          btn.classList.remove("copied");
        }, 2000);
      });
    });
  });

  document.addEventListener("click", (e) => {
    if (e.target instanceof Element && e.target.closest(".header-lang-dropdown, .footer-lang-dropdown")) return;
    closeLangDropdowns();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLangDropdowns();
  });
}

// Apply theme immediately to avoid flash
(function () {
  const PREFS = ["auto", "dark", "light"];
  let pref = "auto";
  try {
    const stored = localStorage.getItem("debuginn_tools_theme");
    if (PREFS.includes(stored)) pref = stored;
  } catch (_) {}
  const resolved = pref === "auto"
    ? (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : pref;
  document.documentElement.setAttribute("data-theme", resolved);
})();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
