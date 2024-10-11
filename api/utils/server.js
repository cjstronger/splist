const app = require("..");
const mongoose = require("mongoose");

mongoose.connect(process.env.DATABASE);

app.listen(process.env.PORT, () =>
  console.log(`Listening on port ${process.env.PORT}`)
);

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  console.error("Stack Trace:", reason.stack);
  // Optionally, you can exit the process if needed
  // process.exit(1);
});
