import axios from "axios";

exports.spotifyLogin = () => {
  location.assign("/spotify-login");
};

exports.spotifyGenerate = async (params) => {
  await axios.post("/api/playlists/generate", params);
};
