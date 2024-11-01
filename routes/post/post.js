const express = require("express");
const router = express.Router();

const createPostRouter = require("./createPost");
const getPostUsername_Router = require("./getPost_AccountID");
const getPostID_Router = require("./getPost_ID");
const getPostAll_Router = require("./getPost_All");

router.use("/post-article", createPostRouter);
router.use("/g_postArticle", getPostUsername_Router);
router.use("/g_postArticleID", getPostID_Router);
router.use("/g_postArticleAll", getPostAll_Router);

router.get("/", (req, res) => {
  res.send("Welcome to the API");
});

module.exports = router;
