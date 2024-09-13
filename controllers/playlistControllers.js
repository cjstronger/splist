const AppError = require("../utils/AppError");
const OpenAI = require("openai");
const catchAsync = require("../utils/catchAsync");

exports.generatePlaylist = catchAsync(async (req, res, next) => {
  const openai = new OpenAI();
  const message = `Generate a playlist that takes in these requirements: ${req.body.message} and make the output a json object with the artist as the key and the trackname as the value`;

  try {
    const playlists = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });
    res.status(200).json({
      status: "success",
      data: playlists,
    });
  } catch (err) {
    console.log(err);
    return next(
      new AppError("Something went wrong while generating the playlist", 500)
    );
  }
});
