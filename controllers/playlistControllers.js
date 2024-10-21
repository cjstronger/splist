const AppError = require("../utils/AppError");
const OpenAI = require("openai");
const catchAsync = require("../utils/catchAsync");
const { default: axios } = require("axios");
const cookieParser = require("cookie-parser");
const Playlist = require("../models/playlistModel");
const { default: slugify } = require("slugify");
const localStorage = require("localStorage");
const jsonStorage = require("json-storage").JsonStorage;

exports.store = jsonStorage.create(localStorage, "storage", {
  stringify: true,
});

exports.generatePlaylist = catchAsync(async (req, res, next) => {
  const openai = new OpenAI();
  console.log(req.body.message);
  const message = `Look at the following input: '${req.body.message}'. Create a playlist that matches the mood, style, or genre described in the prompt. Output the playlist in a JSON object format, where each key is the artist's name and each value is the song name. If no direct matches are found, suggest songs that are generally associated with similar genres or themes.`;
  const cookies = cookieParser.JSONCookies(req.cookies);

  if (!cookies.spotify_token)
    return next(
      new AppError("Please sign in with Spotify to generate playlists")
    );

  try {
    const AIContent = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: message }],
    });

    const playlists = JSON.parse(AIContent.choices[0].message.content);

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
    console.log(err);
    if (err.response?.data?.error?.status === 401) {
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

exports.createPlaylist = catchAsync(async (req, res, next) => {
  const cookies = cookieParser.JSONCookies(req.cookies);
  const { data, error } = await axios.get(`https://api.spotify.com/v1/me`, {
    headers: { Authorization: `Bearer ${cookies.spotify_token}` },
  });
  if (error)
    return next(new AppError("There was a problem getting your profile", 400));
  const { id } = data;
  const { data: playlistData, error: playlistError } = await axios.post(
    `https://api.spotify.com/v1/users/${id}/playlists`,
    {
      name: req.body.name,
    },
    {
      headers: {
        Authorization: `Bearer ${cookies.spotify_token}`,
      },
    }
  );
  const link = playlistData.external_urls.spotify;
  if (playlistError) {
    return next(new AppError("There was an error creating the playlist", 400));
  }

  const { href } = playlistData;

  const trackUris = req.body.uris.map((id) => `spotify:track:${id}`);

  try {
    await axios.post(
      `${href}/tracks`,
      { uris: trackUris },
      {
        headers: {
          Authorization: `Bearer ${cookies.spotify_token}`,
        },
      }
    );
    const { url } = req.body;
    await Playlist.findOneAndUpdate({ url, created: true, createdUrl: link });
    res.status(201).json({
      status: "success",
      link,
    });
  } catch (err) {
    return next(
      new AppError("There was an error adding the songs to the playlist", 400)
    );
  }
});

exports.savePlaylist = catchAsync(async (req, res, next) => {
  const user = res.user._id;
  const { name, songs } = req.body;
  try {
    exports.store.set("playlists", null);
    const newPlaylist = await Playlist.create({
      name,
      songs,
      user,
    });
    res.status(201).json({
      status: "success",
      newPlaylist,
    });
  } catch (err) {
    return next(err);
  }
});

exports.getPlaylists = catchAsync(async (req, res, next) => {
  const user = res.user._id;
  const cookies = req.cookies;
  const storedPlaylists = exports.store.get("playlists");
  if (storedPlaylists !== null) {
    res.playlists = storedPlaylists;
    return next();
  }
  try {
    let playlists = await Playlist.find({ user });

    const uris = playlists.map((playlist) => {
      return [
        playlist.songs.reduce((acc, curr, index) => {
          return index === 0 ? curr : `${acc},${curr}`;
        }, ""),
      ];
    });
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

    exports.store.set("playlists", playlists);

    res.playlists = playlists;

    if (req.cookies.api === "true") {
      res.status(200).json({
        status: "success",
        playlists,
      });
    }
    return next();
  } catch (err) {
    return next(err);
  }
});

exports.getPlaylist = catchAsync(async (req, res, next) => {
  try {
    let playlist = await Playlist.findOne({
      url: slugify(req.params.name).replaceAll(".", ""),
    });
    req.dbPlaylist = playlist;
    if (!playlist)
      return next(
        new AppError(`You have no playlists with the name '${req.params.name}'`)
      );

    const playlists = exports.store.get("playlists");

    if (!playlists) {
      return res.redirect("/playlists");
    }

    playlist = playlists.filter((playlist) => {
      return slugify(playlist.name) === req.params.name;
    });

    if (!playlist)
      return next(
        new AppError(
          `There was a problem getting the playlist '${req.params.name}'`
        )
      );

    req.playlist = playlist[0];
    next();
  } catch (err) {
    return next(err);
  }
});

exports.deletePlaylist = catchAsync(async (req, res, next) => {
  const name = req.body.name;
  const user = res.user._id;
  let storedPlaylists = exports.store.get("playlists");
  try {
    if (storedPlaylists !== null) {
      storedPlaylists = storedPlaylists.filter((playlist) => {
        return playlist.name !== name;
      });
      exports.store.set("playlists", storedPlaylists);
    }
    const playlist = await Playlist.findOneAndDelete({ name, user });
    if (!playlist) {
      return next(
        new AppError(`You have no playlists with this name to delete ${name}`)
      );
    }
    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    console.log(err);
    return next(err);
  }
});
