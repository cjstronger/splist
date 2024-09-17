const AppError = require("../utils/AppError");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");
const axios = require("axios");

exports.signUp = catchAsync(async function (req, res, next) {
  const { email, password, confirmPassword, name } = req.body;
  await User.create({
    password,
    email,
    confirmPassword,
    name,
  });

  next();
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError("An email and password is required", 401));
  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new AppError("Account not found with this email"));
  const verifiedUser = await user.verify(req.body.password, user.password);
  if (!verifiedUser)
    return next(new AppError("The email or password is incorrect", 401));

  user.password = undefined;

  const token = user.generateToken(user._id);
  const cookieOptions = {
    expires: Date.now() + process.env.JWT_COOKIES_EXPIRES * 1000 * 60 * 60 * 24,
    httpOnly: true,
    //ADD when in production the secure option is set to true
  };

  res.cookie("jwt", token, cookieOptions);

  res.status(201).json({
    status: "success",
    token,
    user,
  });
});

function signJWT(req, next) {
  const token = req.cookies.jwt;
  if (!token) {
    return next(
      new AppError(
        "You must be logged in for this route, use the /login route",
        401
      )
    );
  }
  const verifiedToken = jwt.verify(token, process.env.JWT_KEY);
  if (!verifiedToken) {
    return next(
      new AppError("Your login has expired, please login again", 401)
    );
  }
  return verifiedToken;
}

exports.verify = catchAsync(async (req, res, next) => {
  const verifiedToken = await signJWT(req, next);

  const freshUser = await User.findById(verifiedToken.id);

  res.user = freshUser;

  next();
});

exports.spotifyRedirect = (req, res, next) => {
  const generateRandomString = (length) => {
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
  };

  var state = generateRandomString(16);
  var scope = "user-read-private user-read-email";

  res.cookie("state", state, {
    httpOnly: true,
    //add secure to true for live app
  });

  res.cookie("api", true);

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: process.env.SPOTIFY_ID,
        scope: scope,
        redirect_uri: "http://127.0.0.1:3000/api/auth/callback",
        state: state,
      })
  );
};

exports.spotifyCallback = async (req, res, next) => {
  const cookies = cookieParser.JSONCookies(req.cookies);
  var code = req.query.code || null;
  var state = req.query.state || null;
  const originalState = cookies.state;
  const verifiedToken = await signJWT(req, next);

  if (originalState !== state)
    return next(
      new AppError("The state expired between the login, try again", 400)
    );

  if (state === null) {
    return next(new AppError("There was an issue logging in", 400));
  } else {
    var authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: "http://127.0.0.1:3000/api/auth/callback",
        grant_type: "authorization_code",
      },
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          new Buffer.from(
            process.env.SPOTIFY_ID + ":" + process.env.SPOTIFY_KEY
          ).toString("base64"),
      },
      json: true,
    };
  }
  try {
    const response = await axios.post(authOptions.url, authOptions.form, {
      headers: authOptions.headers,
    });
    await User.findByIdAndUpdate(verifiedToken.id, {
      $addToSet: { platforms: "spotify" },
    });

    res.cookie("spotify_token", response.data.access_token);

    if (cookies.api == "true") {
      res.status(200).json({
        status: "success",
        data: response.data,
      });
    } else {
      res.redirect("/");
    }
  } catch (err) {
    return next(new AppError(err.message, err.statusCode));
  }
};
