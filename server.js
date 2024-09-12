const app = require("./app");
const mongoose = require("mongoose");

mongoose.connect(process.env.DATABASE);

app.listen(process.env.PORT, () =>
  console.log(`Listening on port ${process.env.PORT}`)
);
