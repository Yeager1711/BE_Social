const express = require("express");
const db = require("../../db_connect/db");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");

router.get("/getComments_PostID/:postId", (req, res) => {
  const postId = req.params.postId; 

  if (!postId) {
    console.log("PostID is required!");
    return res.status(400).json({ error: "PostID is required!" });
  }

  const queryGetComments_PostID = `
    SELECT comments.commentId, comments.postId, comments.accountId, comments.content, comments.likes_comment, comments.created_at,
           accounts.first_name, accounts.last_name, accounts.avatar
    FROM comments
    INNER JOIN accounts ON comments.accountId = accounts.accountId
    WHERE comments.postId = ?
  `;

  db.query(queryGetComments_PostID, [postId], (err, result) => {
    if (err) {
      console.error("Error fetching comments", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      if (result.length === 0) {
        res.status(404).json({ error: "Comments not found for this post" });
      } else {
        const formattedResult = result.map(comment => ({
          commentId: comment.commentId,
          postId: comment.postId,
          accountId: comment.accountId,
          content: comment.content,
          likes_comment: comment.likes_comment,
          created_at: comment.created_at,
          account: {
            first_name: comment.first_name,
            last_name: comment.last_name,
            avatar: comment.avatar
          }
        }));

        console.log("Comments fetched successfully");
        res.status(200).json(formattedResult);
      }
    }
  });
});

module.exports = router;
