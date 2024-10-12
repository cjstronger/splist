function darkMode() {
  const userTheme = localStorage.getItem("theme");
  if (userTheme) {
    document.documentElement.setAttribute("data-theme", userTheme);
  }
}

darkMode();
