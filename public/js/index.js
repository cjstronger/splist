const { login } = require("./login");
const { default: spotifyLogin } = require("./spotify");

const loginForm = document.querySelector(".login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = loginForm.querySelector(".email").value;
    const password = loginForm.querySelector(".password").value;
    const formError = loginForm.querySelector(".error");
    const { error } = await login(email, password);
    console.log(error);
    if (error) formError.innerHTML = error;
  });
}

const spotifyLink = document.querySelector(".spotify-login");

if (spotifyLink) {
  spotifyLink.addEventListener("click", async () => {
    await spotifyLogin();
  });
}

const lightDarkButton = document.querySelector(".light-dark-button");

if (lightDarkButton) {
  lightDarkButton.addEventListener("click", (e) => {
    const root = document.documentElement;
    const bg = getComputedStyle(root).getPropertyValue("--bg");
    const accent = getComputedStyle(root).getPropertyValue("--accent");
    const text = getComputedStyle(root).getPropertyValue("--text");
    root.style.setProperty("--bg", bg === "#bfcdd9" ? "#414141" : "#bfcdd9");
    root.style.setProperty(
      "--accent",
      accent === "#e8e8e8" ? "#282828" : "#e8e8e8"
    );
    root.style.setProperty(
      "--text",
      text === "#414141" ? "#e8e8e8" : "#414141"
    );
  });
}
