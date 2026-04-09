const THEME_KEY = "debuginn_tools_theme";
const THEME_PREFS = ["auto", "dark", "light"];
const LANG_KEY = "debuginn_tools_lang";

function autoDetectLang() {
  try { if (localStorage.getItem(LANG_KEY)) return; } catch (_) {}
  const lang = (navigator.language || "").toLowerCase();
  if (!lang.startsWith("zh")) return;
  const path = location.pathname;
  if (path.startsWith("/zh")) return;
  location.replace("/zh" + (path === "/" ? "/" : path) + location.search + location.hash);
}

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
        if (href) {
          try { localStorage.setItem(LANG_KEY, "manual"); } catch (_) {}
          window.location.href = href;
        }
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

function initBounceTitle() {
  const el = document.querySelector(".hero-title-accent");
  if (!el) return;
  const text = el.textContent;
  const totalW = el.getBoundingClientRect().width || 200;
  el.style.background = "none";
  el.style.webkitTextFillColor = "";
  el.innerHTML = "";
  let offsetX = 0;
  [...text].forEach((c, i) => {
    const span = document.createElement("span");
    if (c === " ") {
      span.innerHTML = "&nbsp;";
      span.style.display = "inline-block";
      el.appendChild(span);
      offsetX += totalW * 0.06;
      return;
    }
    span.className = "bounce-char";
    span.textContent = c;
    span.style.animationDelay = `${i * 60}ms`;
    span.style.backgroundSize = `${totalW}px 100%`;
    span.style.backgroundPosition = `-${offsetX}px 0`;
    el.appendChild(span);
    offsetX += span.getBoundingClientRect().width || totalW / text.length;
  });
}

function init() {
  let themePref = readThemePref();
  const themeBtn = document.querySelector(".mode-btn");

  applyThemePref(themePref);
  updateThemeButton(themePref, themeBtn);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(initBounceTitle);

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

  autoDetectLang();
  bindLangDropdown(".header-lang-dropdown", ".header-lang-trigger", "data-lang-href");
  bindLangDropdown(".footer-lang-dropdown", ".footer-lang-trigger", "data-footer-lang-href");
  bindMobileMenu();

  document.querySelectorAll(".card-flip-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const wrap = btn.closest(".card-flip-wrap");
      if (wrap) wrap.classList.toggle("flipped");
    });
  });

  document.querySelectorAll(".card-back").forEach((back) => {
    back.addEventListener("click", (e) => {
      if (e.target.closest(".card-install-block")) return;
      if (e.target.closest(".card-flip-btn")) return;
      e.stopPropagation();
    });
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest(".card-flip-wrap")) return;
    document.querySelectorAll(".card-flip-wrap.flipped").forEach((wrap) => {
      wrap.classList.remove("flipped");
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
