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

const buffer = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const chatBot = document.querySelector(".chat-bot");

if (chatBot) {
  const parameters = document.querySelector(".chat-input");
  parameters.focus();
  let loading = false;
  chatBot.addEventListener("submit", async (e) => {
    e.preventDefault();
    loading = true;
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
    }
    await buffer(1000);
    const { data, err } = await spotify.spotifyGenerate(parameters.value);
    document.querySelector(".loaders").remove();
    loading = false;
    if (err) {
      return;
    }
    let songs = [];
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

    songs.push(document.querySelectorAll(".song"));

    songs = songs[0];

    const splistTitle = document.querySelector(".title");
    const playlistForm = document.querySelector(".playlist-form");

    gsap.gsap.from(songs, {
      y: "100vh",
      stagger: 0.1,
      duration: 0.5,
      ease: "sine",
    });
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

    songs.forEach((song, i) => {
      const songDetails = song.children[1];
      let songsBelow = [];
      window.addEventListener("resize", () => {
        triggerSongs();
      });
      function triggerSongs() {
        const gridLength =
          getComputedStyle(playlist).gridTemplateColumns.split(" ").length;
        songsBelow = [];
        for (let j = i + gridLength; j < songs.length; j += gridLength) {
          songsBelow = [...songsBelow, songs[j]];
        }
      }
      triggerSongs();
      song.dataset.clicked = "false";

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
              stagger: 0.05,
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
              stagger: 0.05,
            });
          }
        }
      });

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
    });

    const playlistName = document.querySelector(".playlist-name");

    let name = "playlist01";

    playlistName.addEventListener("input", (e) => {
      name = e.target.value;
    });

    let params = { name, uris };

    await spotify.sendPlaylist(params);
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
