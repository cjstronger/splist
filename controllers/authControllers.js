const AppError = require("../utils/AppError");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const { default: axios } = require("axios");
const { sendEmail } = require("../utils/mailer");

exports.signUp = catchAsync(async function (req, res, next) {
  const { email, password, confirmPassword, name } = req.body.data;
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
  const { email, password } = req.body.data;
  if (!email || !password)
    return next(new AppError("An email and password is required", 401));
  const user = await User.findOne({ email }).select("+password");

  const correct = await user.verify(req.body.data.password, user.password);

  if (!user || !correct)
    return next(new AppError("The email or password is incorrect", 401));

  const token = user.generateToken(user._id);
  const cookieOptions = {
    expires: Date.now() + process.env.JWT_COOKIES_EXPIRES * 1000 * 60 * 60 * 24,
    httpOnly: true,
    //ADD when in production the secure option is set to true
  };

  res.cookie("jwt", token, cookieOptions);

  res.user = user;

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
  }
  next();
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
  const verifiedToken = signJWT(res.user.id);

  if (!verifiedToken) {
    return res.redirect("/login");
  }

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

    res.locals.spotifyToken = response.data.access_token;

    res.redirect("/");
  } catch (err) {
    return next(new AppError(err.message, err.statusCode));
  }
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
    text: `Hello, Clint! Here is your reset token: ${resetToken}`,
  };
  try {
    await sendEmail(mailOptions);
    res.status(201).json({
      status: "success",
    });
  } catch (err) {
    console.log(err);
    this.resetToken = undefined;
    this.resetTokenExpires = undefined;
    user.save({ validateBeforeSave: false });
    return next(new AppError("There was an error sending the token!", 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest();

  const user = await User.findOne({ resetToken: hashedToken });

  if (!user)
    return next(new AppError("Token invalid, please generate a new one", 400));

  console.log(user.resetTokenExpires, Date.now());

  if (user.resetTokenExpires < Date.now())
    return next(
      new AppError(
        "The reset token has expired, please generate a new one.",
        400
      )
    );
  user.password = req.body.password;
  user.confirmPassword = req.body.password;
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  const token = signJWT(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});
