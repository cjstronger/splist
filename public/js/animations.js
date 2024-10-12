import gsap from "gsap";
import { handleModalListener, playlistEventListeners } from "./index";
import axios from "axios";

const buffer = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function handleGenerationAnimation(io) {
  const splistTitle = document.querySelector(".title");
  const playlistForm = document.querySelector(".playlist-form");
  const songs = document.querySelectorAll(".song");
  const savedPlaylists = document.querySelectorAll(".playlist-group");
  const backButton =
    document.querySelector(".back-button") ||
    document.querySelector(".solo-back-button");
  const playlist = document.querySelector(".playlist");
  const playlistTitle = document.querySelector(".playlist-title");
  const switcher = document.querySelector(".switch-previews");
  const chatBot = document.querySelector(".chat-bot");
  const editButton = document.querySelector(".edit-button");
  const openPlaylist = document.querySelector(".open-playlist")?.childNodes[0];

  if (io) {
    if (songs.length) {
      gsap.from(songs, {
        y: "100vh",
        stagger: 0.1,
        duration: 0.5,
        ease: "sine",
        onStart: async () => {
          document.querySelector("body").classList.add("overflow-hidden");
          await buffer(100);
          songs.forEach((song) => song.classList.remove("hidden"));
        },
        onComplete: () =>
          document.querySelector("body").classList.remove("overflow-hidden"),
      });
    } else if (savedPlaylists.length) {
      gsap.from(savedPlaylists, {
        y: "100vh",
        stagger: 0.1,
        duration: 0.5,
        ease: "sine",
        onStart: async () => {
          document.querySelector("body").classList.add("overflow-hidden"),
            await buffer(100);
          savedPlaylists.forEach((playlist) =>
            playlist.classList.remove("hidden")
          );
        },
        onComplete: () =>
          document.querySelector("body").classList.remove("overflow-hidden"),
      });
    }
    if (chatBot) {
      gsap.to(chatBot, {
        y: "100vh",
        duration: 1.5,
      });
    }
    if (splistTitle) {
      gsap.to(splistTitle, {
        y: "-100vh",
        duration: 1.5,
      });
    } else {
      gsap.from(playlistTitle, {
        y: "-100vh",
        duration: 0.5,
        ease: "power3.out",
        onStart: async () =>
          (await buffer(100)) & playlistTitle.classList.remove("hidden"),
      });
    }
    gsap.to(playlistForm, {
      y: 0,
      duration: 0.5,
      delay: 0.5,
      ease: "power2",
    });
    gsap.to(editButton, {
      y: 0,
      duration: 0.45,
    });
    gsap.to(backButton, {
      y: 0,
      duration: 0.5,
      delay: 0.3,
    });
    gsap.to(switcher, {
      y: 0,
      duration: 0.2,
      delay: 0.5,
    });
    gsap.to(openPlaylist, {
      y: 0,
      duration: 0.2,
      delay: 0.8,
    });
  } else {
    const submitButton = document.querySelector(".spotify-playlist-submit");
    const playlistButton = document.querySelector(".open-playlist");

    if (songs.length) {
      gsap.to(songs, {
        x: "100vw",
        ease: "power1",
        duration: 0.5,
        stagger: {
          amount: 0.2,
          from: "end",
        },
      });
    } else {
      gsap.to(savedPlaylists, {
        x: "100vw",
        ease: "power1",
        duration: 0.5,
        stagger: {
          amount: 0.2,
          from: "end",
        },
      });
    }
    gsap.to(playlistForm, {
      y: -200,
      duration: 0.5,
    });
    if (splistTitle) {
      gsap.to(splistTitle, {
        y: 0,
        duration: 0.5,
        ease: "power1.out",
        delay: 0.25,
      });
    } else {
      gsap.to(playlistTitle, {
        y: "-100vh",
        duration: 3.5,
        ease: "power1.out",
        delay: 0.25,
      });
    }
    gsap.to(editButton, {
      y: 50,
      duration: 0.25,
    });
    gsap.to(backButton, {
      y: 50,
      duration: 0.5,
      ease: "power3.in",
    });
    gsap.to(switcher, {
      y: 50,
      duration: 0.5,
      ease: "power3.in",
    });
    gsap.to(chatBot, {
      y: 0,
      ease: "power1.out",
      duration: 0.5,
      delay: 0.25,
    });
    if (submitButton) {
      gsap.to(submitButton, {
        y: 80,
        ease: "power2",
        duration: 0.5,
      });
    }
    if (playlistButton) {
      gsap.to(playlistButton, {
        y: 80,
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
    // backButton.remove();
    if (playlistButton) {
      playlistButton.remove();
    }
  }
}

export function handleSongsAnimation() {
  const songs = document.querySelectorAll(".song");
  const playlist = document.querySelector(".playlist");

  songs.forEach((song, i) => {
    let songsBelow = [];
    window.addEventListener("resize", () => {
      triggerSongs();
    });
    triggerSongs();
    function triggerSongs() {
      const gridLength =
        getComputedStyle(playlist).gridTemplateColumns.split(" ").length;
      songsBelow = [];
      for (let j = i + gridLength; j < songs.length; j += gridLength) {
        songsBelow = [...songsBelow, songs[j]];
      }
    }
    const songDetails = song.children[1];
    song.dataset.clicked = "false";

    song.addEventListener("mousedown", () => {
      if (song.dataset.clicked === "false") {
        song.dataset.clicked = "true";
        gsap.to(songDetails, {
          y: songDetails.clientHeight - 15,
          ease: "sine",
          duration: 0.25,
        });
        if (songsBelow.length) {
          gsap.to(songsBelow, {
            y: songDetails.clientHeight - 15,
            ease: "sine",
            duration: 0.25,
            delay: 0.05,
            stagger: 0.05,
          });
        }
      } else {
        song.dataset.clicked = "false";
        gsap.to(songDetails, {
          y: 0,
          ease: "sine",
          duration: 0.15,
        });
        if (songsBelow.length) {
          gsap.to(songsBelow, {
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
      gsap.to(songDetails, {
        y: 10,
        ease: "sine",
        duration: 0.1,
      });
    });
    song.addEventListener("mouseleave", () => {
      gsap.to(songDetails, {
        y: 0,
        ease: "sine",
        duration: 0.1,
      });
      if (song.dataset.clicked === "true") {
        song.dataset.clicked = "false";
        if (songsBelow.length) {
          gsap.to(songsBelow, {
            y: 0,
            ease: "sine",
            delay: 0.15,
            duration: 0.15,
            stagger: 0.05,
          });
        }
      }
    });
  });
}

function addDeleteListeners() {
  const playlists = document.querySelectorAll(".playlist-group");
  playlists.forEach((playlist) => {
    const name = playlist.querySelector(".playlist-group-name").textContent;
    const deleteButton = playlist.querySelector(".delete-button");
    const deleteContainer = playlist.querySelector(".delete-container");
    deleteButton.addEventListener("mousedown", async () => {
      gsap.to(playlist, {
        scale: 0,
        duration: 0.5,
        ease: "back.in",
      });
      await buffer(500);
      playlist.remove();
      try {
        await axios.delete("/api/playlists/delete", {
          data: {
            name,
          },
        });
      } catch (err) {
        console.log(err);
      }
    });
    deleteButton.addEventListener("mouseenter", () => {
      gsap.to(deleteContainer, {
        background: "rgba(234, 100, 100, 0.8)",
        duration: 0.1,
        ease: "power1",
      });
    });
    deleteButton.addEventListener("mouseleave", () => {
      gsap.to(deleteContainer, {
        background: "rgba(234, 100, 100, 0.5)",
        duration: 0.1,
        ease: "power1",
      });
    });
  });
}

export function handlePlaylistEdit(io, clicked) {
  if (!clicked) addDeleteListeners();

  const deleteContainers = document.querySelectorAll(".delete-container");
  const deleteButtons = document.querySelectorAll(".delete-button");

  if (io) {
    gsap.to(deleteContainers, {
      stagger: 0.08,
      background: "rgba(234, 100, 100, 0.5)",
      duration: 0.1,
      onStart: () => playlistEventListeners(false),
    });
    gsap.to(deleteButtons, {
      scale: 1,
      stagger: 0.05,
    });
  } else {
    gsap.to(deleteContainers, {
      stagger: 0.05,
      background: "transparent",
      duration: 0.1,
      onStart: () => playlistEventListeners(true),
    });
    gsap.to(deleteButtons, {
      scale: 0,
      stagger: 0.05,
    });
  }
}

export function handleSwitchPreviews(switchPreviews) {
  const songs = document.querySelectorAll(".song");
  const playlistList = document.querySelector(".playlist-list");
  const switcher = switchPreviews.querySelector(".previews-switch");
  const gridIcon = switchPreviews.querySelector(".grid-icon");
  const textIcon = switchPreviews.querySelector(".text-icon");
  const songList = document.querySelectorAll(".hidden-details > p");
  const songSeparators = document.querySelectorAll(".list-separator");
  let switched = false;
  gsap.set(songList, { y: 50 });
  switchPreviews.addEventListener("mousedown", () => {
    switchPreviews.style.pointerEvents = "none";
    if (!switched) {
      switched = true;
      gsap.to(songList, {
        y: 0,
        ease: "sine",
        duration: 0.35,
        stagger: 0.04,
        onStart: () => (playlistList.style.visibility = "visible"),
      });
      gsap.to(songs, {
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
      gsap.to(songSeparators, {
        scaleX: () => `${window.innerWidth * 0.9}`,
        ease: "sine",
        duration: 0.8,
        stagger: 0.08,
        delay: 0.25,
        onStart: () =>
          songSeparators.forEach((sep) => (sep.style.opacity = 0.75)),
        onComplete: () => (switchPreviews.style.pointerEvents = ""),
      });
      gsap.to(textIcon, {
        opacity: 0,
        ease: "power1",
        duration: 0.25,
      });
      gsap.to(gridIcon, {
        opacity: 0.75,
        ease: "power1",
        duration: 0.5,
      });
      gsap.to(switcher, {
        x: 32,
        ease: "power1",
        duration: 0.5,
      });
    } else {
      switched = false;
      let timeline = gsap.timeline();
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
      gsap.to(songList, {
        y: -50,
        ease: "sine",
        duration: 0.35,
        stagger: 0.04,
        delay: 0.5,
      });
      gsap.to(songSeparators, {
        scaleX: 0,
        ease: "sine",
        duration: 0.3,
        stagger: 0.09,
        onComplete: () =>
          songSeparators.forEach((sep) => (sep.style.opacity = 0)),
      });
      gsap.to(textIcon, {
        opacity: 0.75,
        ease: "power1",
        duration: 0.5,
      });
      gsap.to(gridIcon, {
        opacity: 0,
        ease: "power1",
        duration: 0.25,
      });
      gsap.to(switcher, {
        x: 0,
        ease: "power1",
        duration: 0.5,
      });
    }
  });
}

export function handleCloseMenu(io) {
  const modal = document.querySelector(".user-modal");
  const links = modal.querySelectorAll(".overflow-hidden > p");

  if (io) {
    gsap.to(links, {
      y: 100,
      stagger: {
        amount: 0.2,
        from: "end",
      },
      duration: 0.4,
    });
    gsap.to(modal, {
      delay: 0.3,
      duration: 1,
      ease: "power4.out",
      y: "-200vh",
      onComplete: () => {
        gsap.to(modal, {
          opacity: 0,
          duration: 0.01,
          onComplete: () =>
            gsap.to(modal, {
              y: "100vh",
              duration: 0.01,
              onComplete: () => handleModalListener(true),
            }),
        });
      },
    });
  } else {
    gsap.to(links, {
      y: 0,
      stagger: 0.1,
      duration: 0.8,
    });
    gsap.to(modal, {
      duration: 1,
      ease: "power4.out",
      y: "-100vh",
    });
  }
}

export function handleLoginForm(io) {
  const [passwordForm, loginForm, registerForm] =
    document.querySelectorAll(".form-box");
  if (io) {
    gsap.to(loginForm, {
      x: -600,
    });
    gsap.to(registerForm, {
      x: 0,
    });
  } else {
    gsap.to(loginForm, {
      x: 0,
    });
    gsap.to(registerForm, {
      x: 600,
    });
  }
}

export function handleForgetPasswordForm(io) {
  const [passwordForm, loginForm] = document.querySelectorAll(".form-box");
  if (io) {
    gsap.to(passwordForm, {
      x: 0,
    });
    gsap.to(loginForm, {
      x: 500,
    });
  } else {
    gsap.to(loginForm, {
      x: 0,
    });
    gsap.to(passwordForm, {
      x: -500,
    });
  }
}

export function handleFailAnimation(io) {
  const success = document.querySelector(".success");
  const error = document.querySelector(".error");
  if (io) {
    gsap.from(error, {
      opacity: 0,
    });
    gsap.to(success, {
      opacity: 0,
    });
  } else {
    gsap.from(success, {
      opacity: 0,
    });
    gsap.to(error, {
      opacity: 0,
    });
  }
}

export function handleFormSumbit(io, span, spinner) {
  if (io) {
    gsap.to(span, {
      opacity: 0,
      duration: 0.25,
    });
    gsap.to(spinner, {
      opacity: 1,
      delay: 0.3,
    });
  } else {
    gsap.to(span, {
      opacity: 1,
      delay: 0.3,
    });
    gsap.to(spinner, {
      opacity: 0,
    });
  }
}
