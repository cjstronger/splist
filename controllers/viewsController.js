const querystring = require("querystring");
const cookieParser = require("cookie-parser");
const catchAsync = require("../utils/catchAsync");
const { default: axios } = require("axios");

exports.getHome = (req, res) => {
  const cookies = cookieParser.JSONCookies(req.cookies);
  let spotifyToken = false;
  if (cookies.spotify_token) {
    spotifyToken = true;
  }
  res.render("home", {
    title: "Home",
    spotifyToken,
  });
};

exports.getLogin = (req, res) => {
  res.render("login", {
    title: "Login",
  });
};

const generateRandomString = (length) => {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

exports.getSpotify = async (req, res) => {
  const state = generateRandomString(16);
  const spotifyAuthUrl =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: process.env.SPOTIFY_ID,
      scope: "playlist-modify-public playlist-modify-private",
      redirect_uri: "http://127.0.0.1:3000/api/auth/callback",
      state: state,
    });

  res.cookie("state", state, {
    httpOnly: true,
  });

  res.cookie("api", false);

  res.redirect(spotifyAuthUrl);
};

exports.getPlaylists = catchAsync(async (req, res, next) => {
  let { playlists } = res;
  const cookies = req.cookies;
  const uris = playlists.map((playlist) => {
    return [
      playlist.songs.reduce((acc, curr, index) => {
        return index === 0 ? curr : `${acc},${curr}`;
      }, ""),
    ];
  });
  try {
    const urisPromise = uris.map(async (uriList) => {
      const res = await axios.get(
        `https://api.spotify.com/v1/tracks?ids=${uriList[0]}`,
        {
          headers: { Authorization: `Bearer ${cookies.spotify_token}` },
        }
      );
      return res;
    });

    const promise = await Promise.all(urisPromise);
    playlists = promise.map((playlist, index) => {
      const name = playlists[index].name;
      return {
        name,
        tracks: playlist.data.tracks.map((track) => {
          return {
            img: track.album.images[1].url,
            artist: track.artists[0].name,
            name: track.name,
          };
        }),
      };
    });
    res.render("playlists", {
      title: "Playlists",
      playlists,
    });
  } catch (err) {
    console.log(err.response.data);
    return next(err);
  }
});

exports.getPlaylist = catchAsync(async (req, res, next) => {
  res.render("saved-playlist");
});
