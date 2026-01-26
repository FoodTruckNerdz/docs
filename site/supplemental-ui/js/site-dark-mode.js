(function () {
  const themeKey = "antora-theme";
  const html = document.documentElement;
  const darkThemeClass = "dark-theme";

  function setTheme(theme) {
    if (theme === "dark") {
      html.classList.add(darkThemeClass);
    } else {
      html.classList.remove(darkThemeClass);
    }
    localStorage.setItem(themeKey, theme);
    updateToggleLabel();
  }

  function isDark() {
    return html.classList.contains(darkThemeClass);
  }

  function updateToggleLabel() {
    const toggle = document.getElementById("theme-toggle");
    if (!toggle) return;
    if (isDark()) {
      toggle.innerHTML =
        '<svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
      toggle.setAttribute("aria-label", "Light mode");
    } else {
      toggle.innerHTML =
        '<svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
      toggle.setAttribute("aria-label", "Dark mode");
    }
  }

  function toggleTheme() {
    setTheme(isDark() ? "light" : "dark");
  }

  function applyInitialTheme() {
    const savedTheme = localStorage.getItem(themeKey);
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
      return;
    }
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }

  function ensureToggleButton() {
    const existingToggle = document.getElementById("theme-toggle");
    if (existingToggle) {
      existingToggle.addEventListener("click", toggleTheme);
      updateToggleLabel();
      return;
    }

    const navbarEnd = document.querySelector(".navbar .navbar-end");
    if (!navbarEnd) return;

    const button = document.createElement("button");
    button.id = "theme-toggle";
    button.className = "navbar-item theme-toggle";
    button.type = "button";
    button.addEventListener("click", toggleTheme);

    navbarEnd.insertBefore(button, navbarEnd.firstChild);
    updateToggleLabel();
  }

  function init() {
    applyInitialTheme();
    ensureToggleButton();
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
