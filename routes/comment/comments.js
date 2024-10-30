const express = require("express");
const router = express.Router();

const createCommentt_Router = require("./comments_Create");
const getCommentsPostID_Router = require("./comments_GetPostID");


router.use("/post", createCommentt_Router);
router.use("/get", getCommentsPostID_Router);

router.get("/", (req, res) => {
  res.send("Welcome to the API");
});

module.exports = router;