import axios from "axios";
import toast from "./toast";

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
  const html = `<button class="spotify-playlist-submit">send to spotify</button>`;
  document.querySelector("main").insertAdjacentHTML("beforeend", html);
  const submitButton = document.querySelector(".spotify-playlist-submit");
  submitButton.addEventListener("mousedown", async () => {
    await axios.post("/api/playlists/create", {
      body: {
        name: params.playlistName,
      },
    });
  });
};
