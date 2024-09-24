const { login } = require("./login");
const spotify = require("./spotify");
const toast = require("./toast");
const gsap = require("gsap");

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
    await spotify.spotifyLogin();
  });
}

const chatBot = document.querySelector(".chat-bot");

if (chatBot) {
  const parameters = document.querySelector(".chat-input");
  parameters.focus();
  chatBot.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { data, err } = await spotify.spotifyGenerate(parameters.value);
    if (err) {
      return;
    }
    let songs = [];
    const playlist = document.createElement("div");
    playlist.className = "playlist";
    document.querySelector("main").appendChild(playlist);
    data.data.data.forEach((item) => {
      let html = `<div class="song"><img class="song-image" src="${item.album.images[1].url}"/><div class="song-details"><p class="song-name">${item.name}</p><p class="album-name">${item.album.name}</p><p class="artist-name">${item.artists[0].name}</p></div></div>`;
      document
        .querySelector(".playlist")
        .insertAdjacentHTML("afterbegin", html);
    });

    songs.push(document.querySelectorAll(".song"));

    songs = songs[0];

    const splistTitle = document.querySelector(".title");
    const playlistForm = document.querySelector(".playlist-form");

    gsap.gsap.to(chatBot, {
      y: "100vh",
      duration: 3.5,
      ease: "power3.out",
    });
    gsap.gsap.to(splistTitle, {
      y: "-100vh",
      duration: 3.5,
      ease: "power3.out",
    });
    gsap.gsap.to(playlistForm, {
      y: 200,
      duration: 0.5,
      delay: 0.5,
      ease: "power2",
    });
    playlistForm.focus();

    const gridLength =
      getComputedStyle(playlist).gridTemplateColumns.split(" ").length;

    songs.forEach((song, i) => {
      const songDetails = song.children[1];
      let songsBelow = [];
      for (let j = i + gridLength; j < songs.length; j += gridLength) {
        songsBelow = [...songsBelow, songs[j]];
      }
      song.dataset.clicked = "false";

      song.addEventListener("mouseenter", () => {
        gsap.gsap.to(songDetails, {
          y: 10,
          ease: "sine",
          duration: 0.1,
        });
      });
      song.addEventListener("mouseleave", () => {
        gsap.gsap.to(songDetails, {
          y: 0,
          ease: "sine",
          duration: 0.1,
        });
      });

      song.addEventListener("mousedown", () => {
        if (song.dataset.clicked === "false") {
          song.dataset.clicked = "true"; // Set clicked to true
          gsap.gsap.to(songDetails, {
            y: songDetails.clientHeight - 15,
            ease: "sine",
            duration: 0.25,
          });
          if (songsBelow.length) {
            gsap.gsap.to(songsBelow, {
              y: songDetails.clientHeight - 15,
              ease: "sine",
              duration: 0.25,
              delay: 0.05,
            });
          }
        } else {
          song.dataset.clicked = "false"; // Set clicked to false
          gsap.gsap.to(songDetails, {
            y: 0,
            ease: "sine",
            duration: 0.15,
          });
          if (songsBelow.length) {
            gsap.gsap.to(songsBelow, {
              y: 0,
              ease: "sine",
              delay: 0.15,
              duration: 0.15,
            });
          }
        }
      });
    });
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
