const { default: slugify } = require("slugify");
const { login } = require("./login");
const spotify = require("./spotify");
const gsap = require("gsap");
const { default: axios } = require("axios");

const loginForm = document.querySelector(".login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = loginForm.querySelector(".email").value;
    const password = loginForm.querySelector(".password").value;
    const formError = loginForm.querySelector(".error");
    const { error } = await login(email, password);
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

// function handleLoaders(loading) {
//   if (loading) {
//     const loaders =
//       '<div class="loaders">' +
//       '<div class="loader"></div>'.repeat(21) +
//       "</div>";
//     document.querySelector("main").insertAdjacentHTML("beforeend", loaders);
//     const loaderElements = document.querySelectorAll(".loader");
//     loaderElements.forEach((loader) => {
//       const random = Math.random() * 2;
//       loader.style.animationDelay = `${random}s`;
//     });
//   } else {
//     document.querySelector(".loaders").remove();
//   }
// }

async function handleGenerationAnimation(io) {
  const splistTitle = document.querySelector(".title");
  const playlistForm = document.querySelector(".playlist-form");
  const songs = document.querySelectorAll(".song");
  const savedPlaylists = document.querySelectorAll(".playlist-group");
  const backButton = document.querySelector(".back-button");
  const playlist = document.querySelector(".playlist");
  const playlistTitle = document.querySelector(".playlist-title");
  const switcher = document.querySelector(".switch-previews");

  if (io) {
    if (songs.length) {
      gsap.gsap.from(songs, {
        y: "100vh",
        stagger: 0.1,
        duration: 0.5,
        ease: "sine",
        onStart: async () => {
          await buffer(100);
          songs.forEach((song) => song.classList.remove("hidden"));
        },
      });
    } else if (savedPlaylists.length) {
      gsap.gsap.from(savedPlaylists, {
        y: "100vh",
        stagger: 0.1,
        duration: 0.5,
        ease: "sine",
        onStart: async () => {
          await buffer(100);
          savedPlaylists.forEach((playlist) =>
            playlist.classList.remove("hidden")
          );
        },
      });
    }
    if (chatBot) {
      gsap.gsap.to(chatBot, {
        y: "100vh",
        duration: 3.5,
        ease: "power3.out",
      });
    }
    if (splistTitle) {
      gsap.gsap.to(splistTitle, {
        y: "-100vh",
        duration: 3.5,
        ease: "power3.out",
      });
    } else {
      gsap.gsap.from(playlistTitle, {
        y: "-100vh",
        duration: 0.5,
        ease: "power3.out",
        onStart: async () =>
          (await buffer(100)) & playlistTitle.classList.remove("hidden"),
      });
    }
    gsap.gsap.to(playlistForm, {
      y: 200,
      duration: 0.5,
      delay: 0.5,
      ease: "power2",
    });
    gsap.gsap.to(backButton, {
      x: 180,
      duration: 0.5,
      delay: 0.5,
      ease: "power1.inOut",
    });
    gsap.gsap.to(switcher, {
      x: -150,
      duration: 0.5,
      delay: 0.5,
    });
  } else {
    const submitButton = document.querySelector(".spotify-playlist-submit");
    const playlistButton = document.querySelector(".open-playlist");

    if (songs.length) {
      gsap.gsap.to(songs, {
        x: "100vw",
        ease: "power1",
        duration: 0.5,
        stagger: {
          amount: 0.2,
          from: "end",
        },
      });
    } else {
      gsap.gsap.to(savedPlaylists, {
        x: "100vw",
        ease: "power1",
        duration: 0.5,
        stagger: {
          amount: 0.2,
          from: "end",
        },
      });
    }
    gsap.gsap.to(playlistForm, {
      y: 0,
      duration: 0.5,
    });
    if (splistTitle) {
      gsap.gsap.to(splistTitle, {
        y: 0,
        duration: 0.5,
        ease: "power1.out",
        delay: 0.25,
      });
    } else {
      gsap.gsap.to(playlistTitle, {
        y: "-100vh",
        duration: 3.5,
        ease: "power1.out",
        delay: 0.25,
      });
    }
    gsap.gsap.to(backButton, {
      x: 0,
      duration: 0.5,
      ease: "power3.in",
    });
    gsap.gsap.to(switcher, {
      x: 0,
      duration: 0.5,
      ease: "power3.in",
    });
    gsap.gsap.to(chatBot, {
      y: 0,
      ease: "power1.out",
      duration: 0.5,
      delay: 0.25,
    });
    if (submitButton) {
      gsap.gsap.to(submitButton, {
        scale: 0,
        ease: "power2",
        duration: 0.5,
      });
    }
    if (playlistButton) {
      gsap.gsap.to(playlistButton, {
        scale: 0,
        ease: "power2",
        duration: 0.5,
      });
    }

    await buffer(500);
    if (submitButton) {
      submitButton.remove();
    }
    playlist.remove();
    await buffer(200);
    backButton.remove();
    if (playlistButton) {
      playlistButton.remove();
    }
  }
}

function handleSongsAnimation() {
  const songs = document.querySelectorAll(".song");
  const playlist = document.querySelector(".playlist");

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

function addDeleteListeners() {
  const playlists = document.querySelectorAll(".playlist-group");
  playlists.forEach((playlist) => {
    const name = playlist.querySelector(".playlist-group-name").textContent;
    const deleteButton = playlist.querySelector(".delete-button");
    const deleteContainer = playlist.querySelector(".delete-container");
    deleteButton.addEventListener("mousedown", async () => {
      gsap.gsap.to(playlist, {
        scale: 0,
        duration: 0.5,
        ease: "back.in",
      });
      await buffer(500);
      playlist.remove();
      // try {
      //   await axios.delete("/api/playlists/delete", {
      //     data: {
      //       name,
      //     },
      //   });
      // } catch (err) {
      //   console.log(err);
      // }
    });
    deleteButton.addEventListener("mouseenter", () => {
      gsap.gsap.to(deleteContainer, {
        background: "rgba(234, 100, 100, 0.8)",
        duration: 0.1,
        ease: "power1",
      });
    });
    deleteButton.addEventListener("mouseleave", () => {
      gsap.gsap.to(deleteContainer, {
        background: "rgba(234, 100, 100, 0.5)",
        duration: 0.1,
        ease: "power1",
      });
    });
  });
}

function handlePlaylistEdit(io, clicked) {
  if (!clicked) addDeleteListeners();

  const deleteContainers = document.querySelectorAll(".delete-container");
  const deleteButtons = document.querySelectorAll(".delete-button");

  if (io) {
    gsap.gsap.to(deleteContainers, {
      stagger: 0.08,
      background: "rgba(234, 100, 100, 0.5)",
      duration: 0.1,
      onStart: () => playlistEventListeners(false),
    });
    gsap.gsap.to(deleteButtons, {
      scale: 1,
      stagger: 0.05,
    });
  } else {
    gsap.gsap.to(deleteContainers, {
      stagger: 0.05,
      background: "transparent",
      duration: 0.1,
      onStart: () => playlistEventListeners(true),
    });
    gsap.gsap.to(deleteButtons, {
      scale: 0,
      stagger: 0.05,
    });
  }
}

if (location.pathname === "/playlists") {
  handleGenerationAnimation(true);
  const editButton = document.querySelector(".edit-button");
  let editClicked = false;
  let clicked = false;
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

    document
      .querySelector("main")
      .insertAdjacentHTML(
        "beforebegin",
        '<button class="back-button button">back</button>'
      );

    const backButton = document.querySelector(".back-button");

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

function playlistEventListeners(io) {
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
  const songs = document.querySelectorAll(".song");
  const playlistList = document.querySelector(".playlist-list");
  const switcher = switchPreviews.querySelector(".previews-switch");
  const gridIcon = switchPreviews.querySelector(".grid-icon");
  const textIcon = switchPreviews.querySelector(".text-icon");
  const songList = document.querySelectorAll(".hidden-details > p");
  const songSeparators = document.querySelectorAll(".list-separator");
  let switched = false;
  gsap.gsap.set(songList, { y: 50 });
  switchPreviews.addEventListener("mousedown", () => {
    switchPreviews.style.pointerEvents = "none";
    if (!switched) {
      switched = true;
      gsap.gsap.to(songList, {
        y: 0,
        ease: "sine",
        duration: 0.35,
        stagger: 0.04,
        onStart: () => (playlistList.style.visibility = "visible"),
      });
      gsap.gsap.to(songs, {
        x: "100vw",
        ease: "power1",
        duration: 0.5,
        stagger: {
          amount: 0.2,
          from: "end",
        },
        onComplete: () =>
          songs.forEach(
            (song) => (song.style.transform = "translate(0, 100vh)")
          ),
      });
      gsap.gsap.to(songSeparators, {
        scaleX: () => `${window.innerWidth * 0.9}`,
        ease: "sine",
        duration: 0.8,
        stagger: 0.08,
        delay: 0.25,
        onStart: () =>
          songSeparators.forEach((sep) => (sep.style.opacity = 0.75)),
        onComplete: () => (switchPreviews.style.pointerEvents = ""),
      });
      gsap.gsap.to(textIcon, {
        opacity: 0,
        ease: "power1",
        duration: 0.25,
      });
      gsap.gsap.to(gridIcon, {
        opacity: 0.75,
        ease: "power1",
        duration: 0.5,
      });
      gsap.gsap.to(switcher, {
        x: 32,
        ease: "power1",
        duration: 0.5,
      });
    } else {
      switched = false;
      let timeline = gsap.gsap.timeline();
      timeline.to(songs, {
        x: 0,
        ease: "power1",
        duration: 0.5,
        stagger: {
          amount: 0.3,
          from: "start",
        },
        delay: 1,
        onComplete: () =>
          (playlistList.style.visibility = "hidden") &
          (switchPreviews.style.pointerEvents = ""),
      });
      gsap.gsap.to(songList, {
        y: -50,
        ease: "sine",
        duration: 0.35,
        stagger: 0.04,
        delay: 0.5,
      });
      gsap.gsap.to(songSeparators, {
        scaleX: 0,
        ease: "sine",
        duration: 0.3,
        stagger: 0.09,
        onComplete: () =>
          songSeparators.forEach((sep) => (sep.style.opacity = 0)),
      });
      gsap.gsap.to(textIcon, {
        opacity: 0.75,
        ease: "power1",
        duration: 0.5,
      });
      gsap.gsap.to(gridIcon, {
        opacity: 0,
        ease: "power1",
        duration: 0.25,
      });
      gsap.gsap.to(switcher, {
        x: 0,
        ease: "power1",
        duration: 0.5,
      });
    }
  });
}

const siteTitle = document.querySelector(".site-title");
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
  gsap.gsap.from(submitButton, {
    scale: 0,
    ease: "elastic",
    duration: 1.5,
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
      scale: 0,
      ease: "sine",
      duration: 0.25,
    });
    submitButton.remove();
    const { data } = await axios.post("/api/playlists/create", {
      url,
      uris,
      name,
    });
    const playlistButton = document.querySelector(".open-spotify");
    gsap.gsap.to(playlistButton, {
      scale: 1,
      ease: "elastic",
      duration: 1,
    });
    playlistButton.addEventListener("mousedown", () => {
      window.open(`${data.link}`, "_blank");
    });
  });
}
