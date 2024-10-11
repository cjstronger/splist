const app = require(".");
const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

connectDB();

app.listen(process.env.PORT, () =>
  console.log(`Listening on port ${process.env.PORT}`)
);

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  console.error("Stack Trace:", reason.stack);
  // Optionally, you can exit the process if needed
  // process.exit(1);
});
