const THEME_KEY = "debuginn_tools_theme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function updateThemeButton(theme) {
  const btn = document.getElementById("themeToggleBtn");
  if (!btn) return;
  btn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
}

function bindLangDropdown() {
  const dropdown = document.querySelector(".header-lang-dropdown");
  const trigger = document.getElementById("langToggleBtn");
  const options = document.querySelectorAll("[data-lang-href]");
  if (!dropdown || !trigger) return;

  const close = () => {
    dropdown.classList.remove("open");
    trigger.setAttribute("aria-expanded", "false");
  };

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const nextOpen = !dropdown.classList.contains("open");
    dropdown.classList.toggle("open", nextOpen);
    trigger.setAttribute("aria-expanded", nextOpen ? "true" : "false");
  });

  options.forEach((option) => {
    option.addEventListener("click", () => {
      const href = option.getAttribute("data-lang-href");
      if (href) window.location.href = href;
    });
  });

  document.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest(".header-lang-dropdown")) return;
    close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

function init() {
  const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
  const themeBtn = document.getElementById("themeToggleBtn");

  applyTheme(savedTheme);
  updateThemeButton(savedTheme);
  bindLangDropdown();

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const nextTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, nextTheme);
      applyTheme(nextTheme);
      updateThemeButton(nextTheme);
    });
  }
}

init();
