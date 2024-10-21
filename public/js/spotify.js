import axios from "axios";
import toast from "./toast";
import gsap from "gsap";

const buffer = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.spotifyGenerate = async (params) => {
  let err = null;
  let data = null;
  try {
    const data = await axios.post("/api/playlists/generate", {
      message: params,
    });
    return { data, err };
  } catch (err) {
    toast(err.response.data.message, "fail");
    return { data, err };
  }
};

exports.sendPlaylist = async (params) => {
  const html = `<button class="spotify-playlist-submit"><div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div><span>create <img src="/images/Spotify_icon.svg" width="50px"/></span></button>`;
  document
    .querySelector(".spotify-buttons")
    .insertAdjacentHTML("beforeend", html);
  const submitButton = document.querySelector(".spotify-playlist-submit");
  const submitSpan = submitButton.querySelector("span");
  const spinner = document.querySelector(".lds-ellipsis");
  gsap.to(submitButton, {
    y: 0,
    ease: "power1",
    duration: 0.5,
    delay: 0.5,
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
  submitButton.addEventListener("mousedown", async () => {
    if (submitButton.dataset.clicked !== "true") {
      gsap.to(submitSpan, {
        y: 80,
        duration: 0.5,
      });
      gsap.to(spinner, {
        opacity: 1,
        delay: 0.5,
        duration: 0.5,
      });
      try {
        await axios.post("/api/playlists/save", {
          name: params.name,
          songs: params.uris,
        });
      } catch (err) {
        await buffer(500);
        gsap.to(submitSpan, {
          y: 0,
          duration: 0.5,
          delay: 0.5,
        });
        gsap.to(spinner, {
          opacity: 0,
          duration: 0.5,
        });
        return toast(err.response.data.message, "fail");
      }
    }
    const { data } = await axios.post("/api/playlists/create", {
      name: params.name,
      uris: params.uris,
    });
    submitButton.dataset.clicked = "true";
    submitSpan.innerHTML =
      '<span>open <img src="/images/Spotify_icon.svg" width="50px"/></span>';
    submitButton.addEventListener("mousedown", () => {
      window.open(`${data.link}`, "_blank");
    });
    gsap.to(submitSpan, {
      y: 0,
      duration: 0.5,
      delay: 0.5,
    });
    gsap.to(spinner, {
      opacity: 0,
      duration: 0.5,
    });
  });
};

exports.savePlaylist = async (params) => {
  try {
    const { data } = await axios.post("/api/playlists/save", {
      name: params.name,
      songs: params.uris,
    });
    return toast("Playlist created!", "success");
  } catch (err) {
    return toast(err.response.data.message, "fail");
  }
};
