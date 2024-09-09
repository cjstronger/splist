const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({
  name: String,
  artists: [{ type: String }],
  genre: String,
  duration: Number,
});

const Song = mongoose.model("song", songSchema);

module.exports = Song;
