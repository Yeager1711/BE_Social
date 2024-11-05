const express = require("express");
const router = express.Router();

const createSavedPostRouter = require("./create_SavedPost");

router.use("/post", createSavedPostRouter);

router.get("/", (req, res) => {
  res.send("Welcome to the API");
});

module.exports = router;
