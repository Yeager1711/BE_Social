const express = require("express");
const router = express.Router();

const createComment_Router = require("./comments_Create");
const getCommentsPostID_Router = require("./comments_GetPostID");


router.use("/post", createComment_Router);
router.use("/get", getCommentsPostID_Router);

router.get("/", (req, res) => {
  res.send("Welcome to the API");
});

module.exports = router;