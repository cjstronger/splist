const querystring = require("querystring");
const cookieParser = require("cookie-parser");

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
      scope: "user-read-private user-read-email",
      redirect_uri: "http://127.0.0.1:3000/api/auth/callback",
      state: state,
    });

  res.cookie("state", state, {
    httpOnly: true,
  });

  res.cookie("api", false);

  res.redirect(spotifyAuthUrl);
};