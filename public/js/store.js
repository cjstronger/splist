const { createSlice, configureStore } = require("@reduxjs/toolkit");
const { persistStore, persistReducer } = require("redux-persist");
const createNodeStorage = require("redux-persist-node-storage").default;

const storage = createNodeStorage();

const persistConfig = {
  key: "root",
  storage,
};

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
    addPlaylists: (state, action) => {
      state.playlists = action.payload;
    },
  },
});

const persistedReducer = persistReducer(persistConfig, playlistSlice.reducer);

const store = configureStore({
  reducer: {
    lister: persistedReducer,
  },
});

const persistor = persistStore(store);

module.exports = {
  store,
  persistor,
  addPlaylist: playlistSlice.actions.addPlaylist,
  addPlaylists: playlistSlice.actions.addPlaylists,
  removePlaylist: playlistSlice.actions.removePlaylist,
};
