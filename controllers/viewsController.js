const querystring = require("querystring");
const cookieParser = require("cookie-parser");
const catchAsync = require("../utils/catchAsync");

exports.getHome = (req, res) => {
  res.render("home", {
    title: "Home",
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

exports.getSpotify = catchAsync(async (req, res) => {
  const state = generateRandomString(16);
  const spotifyAuthUrl =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: process.env.SPOTIFY_ID,
      scope: "playlist-modify-public playlist-modify-private",
      redirect_uri: `${req.headers.origin}/api/auth/callback`,
      state: state,
      show_dialog: true,
    });

  if (process.env.MODE === "production") {
    res.cookie("state", state, {
      httpOnly: true,
      secure: true,
    });
  } else {
    res.cookie("state", state, {
      httpOnly: true,
    });
  }

  res.cookie("api", false);

  return next();
});

exports.getPlaylists = catchAsync(async (req, res, next) => {
  const { playlists } = res;

  res.render("playlists", {
    title: "Playlists",
    playlists,
  });
});

exports.getPlaylist = catchAsync(async (req, res, next) => {
  const { playlist, dbPlaylist } = req;
  if (playlist.name.length > 20) {
    playlist.name = `${playlist.name.slice(0, 19)}...`;
  }
  res.render("playlist", {
    playlist: playlist.tracks,
    playlistName: playlist.name,
    dbPlaylist,
    title: playlist.name,
  });
});

exports.getError = (req, res) => {
  const { status, message } = req.query;
  res.render("error", {
    status,
    message,
    title: "Error",
  });
};

exports.getResetPassword = (req, res, next) => {
  res.render("reset-password", {
    title: "Reset Password",
  });
};

exports.getThankYou = (req, res) => {
  res.render("thank-you", {
    title: "Thank you!",
  });
};
