import toast from "./toast";

const { default: slugify } = require("slugify");
const {
  login,
  logout,
  signUp,
  forgotPassword,
  resetPassword,
} = require("./login");
const spotify = require("./spotify");
const gsap = require("gsap");
const { default: axios } = require("axios");
const {
  handleSwitchPreviews,
  handleCloseMenu,
  handleSongsAnimation,
  handleGenerationAnimation,
  handlePlaylistEdit,
  handleLoginForm,
  handleForgetPasswordForm,
  handleFailAnimation,
  handleFormSumbit,
} = require("./animations");

const buffer = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const loginForm = document.querySelector(".login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const spinner = loginForm.querySelector(".lds-ellipsis");
    const span = loginForm.querySelector(".form-button").querySelector("span");
    handleFormSumbit(true, span, spinner);
    const email = loginForm.querySelector(".email").value;
    const password = loginForm.querySelector(".password").value;
    const formError = loginForm.querySelector(".error");
    const { error } = await login(email, password);
    if (error) {
      formError.innerHTML = error;
      handleFailAnimation(true);
      handleFormSumbit(false, span, spinner);
    } else {
      handleFailAnimation(false);
      handleFormSumbit(false, span, spinner);
    }
  });
}

const registerForm = document.querySelector(".register-form");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const spinner = registerForm.querySelector(".lds-ellipsis");
    const span = registerForm
      .querySelector(".form-button")
      .querySelector("span");
    handleFormSumbit(true, span, spinner);
    const password = registerForm.querySelector(".password").value;
    const confirmPassword =
      registerForm.querySelector(".confirm-password").value;
    const email = registerForm.querySelector(".email").value;
    const formError = registerForm.querySelector(".error");
    const { error } = await signUp(email, password, confirmPassword);
    if (error) {
      formError.innerHTML = error;
      handleFailAnimation(true);
      handleFormSumbit(false, span, spinner);
    } else {
      handleFailAnimation(false);
      handleFormSumbit(false, span, spinner);
    }
  });
}

const forgotPasswordForm = document.querySelector(".forgot-form");

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener("submit", async (e) => {
    const spinner = forgotPasswordForm.querySelector(".lds-ellipsis");
    const span = forgotPasswordForm
      .querySelector(".form-button")
      .querySelector("span");
    handleFormSumbit(true, span, spinner);
    const email = forgotPasswordForm.querySelector(".email").value;
    const success = forgotPasswordForm.querySelector(".success");
    const formError = forgotPasswordForm.querySelector(".error");
    e.preventDefault();
    const { error } = await forgotPassword(email);
    if (error) {
      formError.innerHTML = error;
      handleFailAnimation(true);
      handleFormSumbit(false, span, spinner);
    } else {
      success.innerHTML = `Password reset sent to '${email}'`;
      handleFailAnimation(false);
      handleFormSumbit(false, span, spinner);
    }
  });
}

const resetPasswordForm = document.querySelector(".reset-password");
if (resetPasswordForm) {
  resetPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = location.pathname.split("/")[2];
    const password = resetPasswordForm.querySelector(".password").value;
    const confirmPassword =
      resetPasswordForm.querySelector(".confirm-password").value;
    const { error } = await resetPassword(password, confirmPassword, token);
    const success = resetPasswordForm.querySelector(".success");
    const formError = resetPasswordForm.querySelector(".error");
    if (error) {
      formError.innerHTML = error;
      return handleFailAnimation(true);
    } else {
      success.innerHTML = "Password reset, logging in...";
      handleFailAnimation(false);
    }
    await buffer(1000);
    location.assign("/");
  });
}

const logoutButton = document.querySelector(".logout");

if (logoutButton) {
  logoutButton.addEventListener("mousedown", async () => {
    await logout();
  });
}

function handleLoaders(loading) {
  if (loading) {
    const loaders =
      '<div class="loaders">' +
      '<div class="loader"></div>'.repeat(21) +
      "</div>";
    document.querySelector("main").insertAdjacentHTML("beforeend", loaders);
    const loaderElements = document.querySelectorAll(".loader");
    loaderElements.forEach((loader) => {
      const random = Math.random() * 2;
      loader.style.animationDelay = `${random}s`;
    });
  } else {
    document.querySelector(".loaders").remove();
  }
}

if (location.pathname === "/playlists/") {
  location.assign("/playlists");
}

if (location.pathname.startsWith("/playlists/")) {
  handleGenerationAnimation(true);
  handleSongsAnimation();
  const backButton = document.querySelector(".back-button");
  backButton.addEventListener("mousedown", async () => {
    handleGenerationAnimation(false);
    await buffer(500);
    location.assign("/playlists");
  });
}

if (location.pathname === "/playlists") {
  const savedPlaylists = document.querySelectorAll(".playlist-group");
  if (savedPlaylists.length) {
    handleGenerationAnimation(true);
  }
  const editButton = document.querySelector(".edit-button");
  let editClicked = false;
  let clicked = false;
  if (editButton) {
    editButton.addEventListener("mousedown", () => {
      if (!editClicked) {
        handlePlaylistEdit(true, clicked);
        clicked = true;
        editClicked = true;
      } else {
        handlePlaylistEdit(false, clicked);
        editClicked = false;
      }
    });
  }
}

const chatBot = document.querySelector(".chat-bot");

if (chatBot) {
  const parameters = document.querySelector(".chat-input");
  parameters.focus();
  chatBot.addEventListener("submit", async (e) => {
    e.preventDefault();
    handleLoaders(true);
    await buffer(1000);
    const { data, err } = await spotify.spotifyGenerate(parameters.value);
    handleLoaders(false);
    if (err) {
      return;
    }
    let uris = [];
    const playlist = document.createElement("div");
    playlist.className = "playlist";
    document.querySelector("main").appendChild(playlist);
    data.data.data.forEach((item) => {
      let html = `<div class="song"><img class="song-image" src="${item.album.images[1].url}"/><div class="song-details"><p class="song-name">${item.name}</p><p class="album-name">${item.album.name}</p><p class="artist-name">${item.artists[0].name}</p></div></div>`;
      document
        .querySelector(".playlist")
        .insertAdjacentHTML("afterbegin", html);
      uris = [...uris, item.id];
    });

    const backButton = document.querySelector(".solo-back-button");

    handleGenerationAnimation(true);

    backButton.addEventListener("mousedown", async () => {
      handleGenerationAnimation(false);
    });

    handleSongsAnimation();

    const playlistName = document.querySelector(".playlist-name");
    let name = "playlist01";
    playlistName.addEventListener("input", (e) => {
      name = e.target.value;
      params.name = name;
    });
    let params = { name, uris };
    const playlistForm = document.querySelector(".playlist-form");
    playlistForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await spotify.savePlaylist(params);
    });

    await spotify.sendPlaylist(params);
  });
}

const lightDarkButton = document.querySelector(".light-dark-button");

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
}

if (lightDarkButton) {
  lightDarkButton.addEventListener("click", toggleTheme);
}

const menuButton = document.querySelector(".modal-svg");
const modal = document.querySelector(".user-modal");

function modalEvent() {
  modal.style.opacity = "1";
  handleCloseMenu(false);
}

export function handleModalListener(io) {
  if (io) {
    menuButton.addEventListener("mousedown", modalEvent);
  } else {
    menuButton.removeEventListener("mousedown", modalEvent);
  }
}

handleModalListener(true);

const closeMenu = document.querySelector(".close-menu");

closeMenu.addEventListener("mousedown", () => {
  handleModalListener(false);
  handleCloseMenu(true);
});

const menuLinks = document.querySelectorAll(".menu-links");

menuLinks.forEach((link) => {
  link.addEventListener("click", async (e) => {
    e.preventDefault();
    const target = e.target;
    const href = target.parentElement.href;
    if (href.includes("playlists")) {
      try {
        await axios.get(`${location.origin}/api/auth/logged-in-spotify`);
      } catch (err) {
        const { status } = err.response.data;
        if (status === "fail") {
          return toast("Please login with Spotify", "fail");
        } else if (status === "token expired") {
          return toast(
            "Your login with Spotify expired, please login again",
            "fail"
          );
        }
      }
    }
    handleCloseMenu(true);
    await buffer(500);
    location.assign(href);
  });
});

const loginRegister = document.querySelectorAll(".login-register");

if (loginRegister.length) {
  let clicked = false;
  loginRegister.forEach((button) =>
    button.addEventListener("mousedown", () => {
      clicked = !clicked;
      handleLoginForm(clicked);
    })
  );
}

const forgetLogin = document.querySelectorAll(".forget");

if (forgetLogin.length) {
  let clicked = false;
  forgetLogin.forEach((button) => {
    button.addEventListener("mousedown", () => {
      clicked = !clicked;
      handleForgetPasswordForm(clicked);
    });
  });
}

const playlists = document.querySelectorAll(".playlist-group");

async function handlePlaylistRoute(playlist) {
  const name = playlist.querySelector(".playlist-group-name");
  const slug = slugify(name.textContent);
  handleGenerationAnimation(false);
  await buffer(500);
  location.assign(`/playlists/${slug}`);
}

const handlePlaylistClick = (event) => {
  const playlist = event.currentTarget;
  handlePlaylistRoute(playlist);
};

export function playlistEventListeners(io) {
  if (io) {
    playlists.forEach((playlist) => {
      playlist.addEventListener("mousedown", handlePlaylistClick);
    });
  } else {
    playlists.forEach((playlist) => {
      playlist.removeEventListener("mousedown", handlePlaylistClick);
    });
  }
}

playlistEventListeners(true);

const switchPreviews = document.querySelector(".switch-previews");

if (switchPreviews) {
  handleSwitchPreviews(switchPreviews);
}

const siteTitle = document.querySelector(".site-title-container");
if (location.pathname !== "/") {
  gsap.gsap.from(siteTitle, {
    y: -55,
  });
} else {
  gsap.gsap.to(siteTitle, {
    y: -55,
  });
}

const submitButton = document.querySelector(".spotify-playlist-submit");
if (submitButton && location.pathname !== "/") {
  gsap.gsap.to(submitButton, {
    y: 0,
    ease: "power1",
    duration: 0.25,
    delay: 1,
  });
  submitButton.addEventListener("mousemove", (e) => {
    submitButton.style.setProperty(
      "--x",
      `${e.pageX - submitButton.offsetLeft}px`
    );
    submitButton.style.setProperty(
      "--y",
      `${e.pageY - submitButton.offsetTop}px`
    );
  });
  const uris = document.querySelector(".dbPlaylist p").innerHTML.split(",");
  const url = slugify(location.pathname.split("/playlists/")[1]);
  const name = document.querySelector(".playlist-title").innerHTML;
  submitButton.addEventListener("mousedown", async () => {
    gsap.gsap.to(submitButton, {
      y: 200,
      ease: "power1",
      duration: 0.25,
    });
    await buffer(250);
    submitButton.remove();
    const { data } = await axios.post("/api/playlists/create", {
      url,
      uris,
      name,
    });
    const playlistButton = document.createElement("button");
    playlistButton.className = "open-playlist";
    playlistButton.innerHTML =
      '<div class="span">open <img src="/images/Spotify_icon.svg" width="50px"/></div>';
    document
      .querySelector(".spotify-buttons-playlist")
      .appendChild(playlistButton);
    const playlistSpan = playlistButton.childNodes[0];
    gsap.gsap.to(playlistSpan, {
      y: 0,
      ease: "power1",
      duration: 0.5,
    });
    playlistSpan.addEventListener("mousedown", () => {
      window.open(`${data.link}`, "_blank");
    });
  });
}

const hidePassword = document.querySelectorAll(".hide-password");

if (hidePassword.length) {
  hidePassword.forEach((hider) => {
    hider.dataset.clicked = "false";
    const eye = hider.querySelector(".eye-svg");
    const closed = hider.querySelector(".closed-eye-svg");
    hider.addEventListener("mousedown", () => {
      if (hider.dataset.clicked === "false") {
        hider.dataset.clicked = "true";
        hider.previousSibling.type = "text";
        gsap.gsap.to(eye, {
          y: 30,
          duration: 0.2,
        });
        gsap.gsap.to(closed, {
          y: 0,
          duration: 0.2,
        });
      } else {
        hider.dataset.clicked = "false";
        hider.previousSibling.type = "password";
        gsap.gsap.to(eye, {
          y: 0,
          duration: 0.2,
        });
        gsap.gsap.to(closed, {
          y: -30,
          duration: 0.2,
        });
      }
    });
  });
}

const videos = document.querySelectorAll("video");

if (videos.length) {
  window.addEventListener("scroll", () => {
    videos.forEach((video) => {
      const { offsetTop, offsetHeight } = video;
      if (
        offsetTop - offsetHeight <= window.scrollY + 300 &&
        window.scrollY <= offsetTop - offsetHeight + 400
      ) {
        video.play();
      } else {
        video.pause();
      }
    });
  });
}

const startNow = document.querySelector(".start-now");

if (startNow) {
  startNow.addEventListener("mousedown", () => {
    const date = new Date();
    date.setSeconds(date.getSeconds() + 10);
    const expires = date.toUTCString();
    document.cookie = `newUser=true; expires=${expires}`;
  });
}

if (location.pathname === "/login") {
  if (document.cookie.includes("newUser")) {
    handleLoginForm(true);
  }
}
