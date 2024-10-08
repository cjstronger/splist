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
  console.log(req.body.data);
  try {
    await User.create({
      password,
      email,
      confirmPassword,
      name,
    });
    next();
  } catch (err) {
    console.log(err);
    return next(err);
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body.data;
  if (!email || !password)
    return next(new AppError("An email and password is required", 401));
  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new AppError("Account not found with this email"));
  const verifiedUser = await user.verify(req.body.data.password, user.password);
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

exports.logout = (req, res) => {
  res.cookie("jwt", "");
  res.user = null;
  res.status(200).json({
    status: "success",
  });
};

function signJWT(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    if (req.originalUrl.startsWith("/api")) {
      return next(new AppError("Login with splist to continue", 401));
    } else {
      return null;
    }
  }
  const verifiedToken = jwt.verify(token, process.env.JWT_KEY);
  if (!verifiedToken) {
    if (req.originalUrl.startsWith("/api")) {
      return next(
        new AppError("Your login has expired, please login again", 401)
      );
    } else {
      return null;
    }
  }
  return verifiedToken;
}

exports.verify = catchAsync(async (req, res, next) => {
  const verifiedToken = await signJWT(req, res, next);

  if (!verifiedToken) {
    return res.redirect("/login");
  }

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
      })
  );
};

exports.spotifyCallback = catchAsync(async (req, res, next) => {
  const cookies = cookieParser.JSONCookies(req.cookies);
  var code = req.query.code || null;
  var state = req.query.state || null;
  const originalState = cookies.state;
  const verifiedToken = await signJWT(req, res, next);

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

  const token = await signJWT(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});
