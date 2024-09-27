import axios from "axios";
import toast from "./toast";
import gsap from "gsap";

exports.spotifyLogin = () => {
  location.assign("/spotify-login");
};

exports.spotifyGenerate = async (params) => {
  let err = null;
  let data = null;
  try {
    const data = await axios.post("/api/playlists/generate", params);
    return { data, err };
  } catch (err) {
    toast(err.response.data.message);
    return { data, err };
  }
};

exports.sendPlaylist = async (params) => {
  const html = `<button class="spotify-playlist-submit"><span>create <img src="/images/Spotify_icon.svg" width="50px"/></span></button>`;
  document.querySelector("main").insertAdjacentHTML("beforeend", html);
  const submitButton = document.querySelector(".spotify-playlist-submit");
  gsap.from(submitButton, {
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
  submitButton.addEventListener("mousedown", async () => {
    try {
      const { data: saveData } = await axios.post("/api/playlists/save", {
        name: params.name,
        songs: params.uris,
      });
      console.log(saveData);
    } catch (err) {
      return toast(err.response.data.message);
    }
    gsap.to(submitButton, {
      scale: 0,
      ease: "sine",
      duration: 0.25,
    });
    submitButton.remove();
    const { data } = await axios.post("/api/playlists/create", {
      name: params.name,
      uris: params.uris,
    });
    document
      .querySelector("main")
      .insertAdjacentHTML(
        "beforeend",
        '<button class="open-playlist">open playlist</button>'
      );
    const playlistButton = document.querySelector(".open-playlist");
    gsap.from(playlistButton, {
      scale: 0,
      ease: "elastic",
      duration: 1,
    });
    playlistButton.addEventListener("mousedown", () => {
      window.open(`${data.link}`, "_blank");
    });
  });
};
