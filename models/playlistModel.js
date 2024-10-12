const mongoose = require("mongoose");
const slugify = require("slugify");

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A playlist name is required"],
    unique: [true, "Playlist name cannot match that of another"],
  },
  songs: [{ type: String }],
  description: {
    type: String,
    max: [500, "Max characters in a description is 500 characters"],
  },
  user: { type: mongoose.Schema.ObjectId, ref: "user" },
  url: String,
  created: { type: Boolean, default: false },
  createdUrl: String,
});

playlistSchema.pre("save", function (next) {
  let url = slugify(this.name);
  url = url.replaceAll(".", "");
  console.log(url);
  this.url = url;
  return next();
});

const Playlist = mongoose.model("playlist", playlistSchema);

module.exports = Playlist;
