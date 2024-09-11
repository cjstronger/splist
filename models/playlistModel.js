const mongoose = require("mongoose");

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
  songs: [{ type: mongoose.Schema.ObjectId, ref: "song" }],
  description: {
    type: String,
    max: [500, "Max characters in a description is 500 characters"],
  },
});

const Playlist = mongoose.model("playlist", playlistSchema);

module.exports = Playlist;
