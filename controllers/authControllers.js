const AppError = require("../utils/AppError");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const { default: axios } = require("axios");
const { sendEmail, SendEmail } = require("../utils/mailer");

exports.signUp = catchAsync(async function (req, res, next) {
  const { email, password, confirmPassword, name } = req.body;
  try {
    await User.create({
      password,
      email,
      confirmPassword,
      name,
    });
    next();
  } catch (err) {
    return next(err);
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError("An email and password is required", 401));
  const user = await User.findOne({ email }).select("+password");

  const correct = await user.verify(password, user.password);

  if (!user || !correct)
    return next(new AppError("The email or password is incorrect", 401));

  const token = user.generateToken(user._id, res);

  res.status(201).json({
    status: "success",
    token,
    user,
  });
});

exports.logout = (req, res) => {
  res.cookie("jwt", "");
  res.user = null;
  res.status(200).json({
    status: "success",
  });
};

function signJWT(id) {
  return jwt.sign({ id }, process.env.JWT_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

exports.verify = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    const verifiedToken = jwt.verify(req.cookies.jwt, process.env.JWT_KEY);

    const freshUser = await User.findById(verifiedToken.id);
    if (!freshUser)
      return next(new AppError("There was a problem verifying the user", 401));

    res.user = freshUser;

    return next();
  }
  return res.redirect("/login");
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    const verifiedToken = jwt.verify(req.cookies.jwt, process.env.JWT_KEY);

    const freshUser = await User.findById(verifiedToken.id);

    if (!freshUser) return next();

    res.locals.user = freshUser;

    if (req.cookies.spotify_token) res.locals.spotifyToken = true;
  }
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
  var scope = "playlist-modify-public playlist-modify-private";

  res.cookie("state", state, {
    httpOnly: true,
    //add secure to true for live app
  });

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: process.env.SPOTIFY_ID,
        scope,
        redirect_uri: "http://127.0.0.1:3000/api/auth/callback",
        state: state,
        show_dialog: true,
      })
  );
};

exports.spotifyCallback = catchAsync(async (req, res, next) => {
  const cookies = cookieParser.JSONCookies(req.cookies);
  var code = req.query.code || null;
  var state = req.query.state || null;
  const originalState = cookies.state;

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
    const { data } = await axios.post(authOptions.url, authOptions.form, {
      headers: authOptions.headers,
    });

    await User.findByIdAndUpdate(res.user._id, {
      $addToSet: { platforms: "spotify" },
    });

    res.cookie("spotify_token", data.access_token, { httpOnly: true });
    res.locals.spotifyToken = true;

    return res.redirect("/");
  } catch (err) {
    return next(new AppError(err.message, err.statusCode));
  }
});

exports.spotifyLoggedIn = catchAsync(async (req, res, next) => {
  const { spotify_token } = req.cookies;
  if (spotify_token) {
    try {
      await axios.get("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${spotify_token}`,
        },
      });
      return res.status(200).json({
        status: "success",
      });
    } catch (error) {
      res.locals.spotifyToken = false;
      res.cookie("spotify_token", "");
      return res.status(401).json({
        status: "token expired",
      });
    }
  }
  res.locals.spotifyToken = false;
  res.cookie("spotify_token", "");
  res.status(401).json({
    status: "fail",
  });
});

exports.sendResetEmail = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return next(
      new AppError(`There is no user with the email '${email}'`, 404)
    );

  const resetToken = await user.generateResetToken();

  await user.save({ validateBeforeSave: false });

  const mailOptions = {
    from: `${user.email}`,
    to: `${user.email}`,
    subject: "Password Reset | Splist",
  };
  const url = `${req.headers.origin}/reset-password/${resetToken}`;
  try {
    await new SendEmail(mailOptions, "passwordReset").sendReset(url);
    res.status(201).json({
      status: "success",
    });
  } catch (err) {
    console.log(err);
    this.resetToken = undefined;
    this.resetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("There was an error sending the token!", 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token: resetToken } = req.params;
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest();

  const user = await User.findOne({ resetToken: hashedToken });

  if (!user)
    return next(new AppError("Token invalid, please generate a new one", 400));

  if (user.resetTokenExpires < Date.now())
    return next(
      new AppError(
        "The reset token has expired, please generate a new one.",
        400
      )
    );
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  try {
    await user.save();
  } catch (err) {
    return next(err);
  }

  const token = await user.generateToken(user._id, res);

  res.status(201).json({
    status: "success",
    token,
  });
});
