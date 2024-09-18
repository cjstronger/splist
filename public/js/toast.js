const { default: gsap } = require("gsap");

function remove() {
  const toast = document.querySelector(".app-notif");
  gsap.to(toast, {
    y: -400,
    ease: "expo.inOut",
    duration: 0.5,
  });
  setTimeout(() => document.querySelector("body").removeChild(toast), 1000);
}

function toast(message) {
  if (document.querySelector(".app-notif")) {
    remove();
  }
  const toast = `<div class="app-notif">${message}</div>`;
  document.querySelector("body").insertAdjacentHTML("afterbegin", toast);
  const alert = document.querySelector(".app-notif");
  gsap.to(alert, {
    y: 175,
    ease: "expo.inOut",
    duration: 0.5,
  });
  setTimeout(() => remove(), 3000);
}

module.exports = toast;
