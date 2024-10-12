const catchAsync = require("../utils/catchAsync");

exports.getHome = (req, res) => {
  res.render("home", {
    title: "Home",
  });
};

exports.getWelcome = (req, res) => {
  res.render("welcome", {
    title: "Welcome",
  });
};

exports.getLogin = (req, res) => {
  res.render("login", {
    title: "Login",
  });
};

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
