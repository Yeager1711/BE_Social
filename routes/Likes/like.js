const express = require("express");
const router = express.Router();

const createLikes_Router = require("./createLike_PostID");
const getLikesPostID_Router = require("./getLikes_PostId");


router.use("/post", createLikes_Router);
router.use("/get", getLikesPostID_Router);

router.get("/", (req, res) => {
  res.send("Welcome to the API");
});

module.exports = router;