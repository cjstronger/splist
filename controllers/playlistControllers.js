const AppError = require("../utils/AppError");
const OpenAI = require("openai");
const catchAsync = require("../utils/catchAsync");
const { default: axios } = require("axios");
const cookieParser = require("cookie-parser");

exports.generatePlaylist = catchAsync(async (req, res, next) => {
  const openai = new OpenAI();
  const message = `Generate a playlist that takes in these requirements: ${req.body.message} and make the output a json object with the artist as the key and the trackname as the value`;
  const cookies = cookieParser.JSONCookies(req.cookies);

  try {
    // const AIContent = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   messages: [{ role: "user", content: message }],
    // });
    // const playlists = JSON.parse(AIContent.choices[0].message.content);
    const playlists = {
      COIN: "Talk Too Much",
      "Glass Animals": "Gooey",
      "The Head and the Heart": "All We Ever Knew",
      "Portugal. The Man": "Feel It Still",
      "Young the Giant": "Cough Syrup",
    };

    const spotifySearches = Object.keys(playlists).map((key) => {
      let url = `https://api.spotify.com/v1/search?q=track:${playlists[
        key
      ].replaceAll(" ", "%20")}%20artist:${key.replaceAll(
        " ",
        "%20"
      )}&type=track&limit=1`;
      return axios.get(url, {
        headers: { Authorization: `Bearer ${cookies.spotify_token}` },
      });
    });

    const spotifyRes = await Promise.all(spotifySearches);
    let spotifySongs = [];
    spotifyRes.forEach((res) => {
      spotifySongs = [...spotifySongs, res.data.tracks.items[0]];
    });
    res.status(200).json({
      status: "success",
      data: spotifySongs,
    });
  } catch (err) {
    console.log(err.response.data.error);
    if (err.response.data.error.status === 401) {
      return next(
        new AppError(
          "Your Spotify login expired, login with Spotify please",
          401
        )
      );
    }
    return next(
      new AppError("Something went wrong while generating the playlist", 500)
    );
  }
});
