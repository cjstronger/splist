const mongoose = require("mongoose");
const slugify = require("slugify");

//1) a playlist needs to link to the users _id
//2) a playlist can have a length of songs
//3) playlists should have a one to one relationship
//4) songs should have a many to many relationship

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
  const url = slugify(this.name);
  this.url = url;
  return next();
});

const Playlist = mongoose.model("playlist", playlistSchema);

module.exports = Playlist;
