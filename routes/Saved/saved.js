const express = require("express");
const router = express.Router();

const createSavedPostRouter = require("./create_SavedPost");
const getSavedPostRouter_AccnountId = require("./get_SavedPost_AccountId");
const SavedPostItem_Router = require("./savePost_item");

router.use("/post", createSavedPostRouter);
router.use("/get", getSavedPostRouter_AccnountId);
router.use("/post", SavedPostItem_Router);

router.get("/", (req, res) => {
  res.send("Welcome to the API");
});

module.exports = router;
