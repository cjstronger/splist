const { createSlice, configureStore } = require("@reduxjs/toolkit");

const playlistSlice = createSlice({
  name: "playlists",
  initialState: {
    playlists: [],
  },
  reducers: {
    addPlaylist: (state, action) => {
      state.playlists = [...state.playlists, action.payload];
    },
    removePlaylist: (state, action) => {
      state.playlists = state.playlists.filter((playlist) => {
        playlist.name !== action.payload;
      });
    },
  },
});

const store = configureStore({
  reducer: {
    lister: playlistSlice.reducer,
  },
});

module.exports = {
  store,
  addPlaylist: playlistSlice.actions.addPlaylist,
  removePlaylist: playlistSlice.actions.removePlaylist,
};
