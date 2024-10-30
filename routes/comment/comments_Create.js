const express = require("express");
const db = require("../../db_connect/db");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const { v4: uuidv4 } = require('uuid');

router.post("/create", authenticateToken, (req, res) => {
  const { postId, content } = req.body;
  const accountId = req.accountId;

  if (!postId) {
    console.log("PostID is required!");
    return res.status(400).json({ error: "PostID is required!" });
  }

  if (!content) {
    console.log("Content is required!");
    return res.status(400).json({ error: "Content is required!" });
  }

  if (!accountId) {
    return res.status(400).json({ error: "AccountID is required!" });
  }

  const commentId = uuidv4();

  const queryComments =
    "INSERT INTO comments (commentId, postId, accountId, content, likes_comment, created_at) VALUES (?, ?, ?, ?, 0, NOW())";

  db.query(
    queryComments,
    [commentId, postId, accountId, content],
    (err, result) => {
      if (err) {
        console.error("Error creating comment", err);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.status(201).json({ message: "Comment created successfully", commentId });
      }
    }
  );
});

module.exports = router;
