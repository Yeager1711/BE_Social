const express = require("express");
const router = express.Router();

const createLikes_Router = require("./createLike_PostID");
// const getCommentsPostID_Router = require("./comments_GetPostID");


router.use("/post", createLikes_Router);
// router.use("/get", getCommentsPostID_Router);

router.get("/", (req, res) => {
  res.send("Welcome to the API");
});

module.exports = router;