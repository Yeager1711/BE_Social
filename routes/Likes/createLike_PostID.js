const express = require("express");
const db = require("../../db_connect/db");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const { v4: uuidv4 } = require("uuid");

router.post(
  "/createLikes_PostID/:postId",
  authenticateToken,
  (req, res) => {
    const { postId } = req.params;
    const accountId = req.accountId;

    console.log("postId", postId);
    console.log("accountId", accountId);

    if (!accountId) {
      return res.status(400).json({ error: "accountId is required" });
    }

    // Check if the like already exists
    db.query(
      "SELECT * FROM likes WHERE postId = ? AND accountId = ?",
      [postId, accountId],
      (error, results) => {
        if (error) {
          console.error("Error checking existing like:", error);
          return res.status(500).json({ error: "Database query error" });
        }

        if (results.length > 0) {
          // If like already exists, remove it to "unlike"
          db.query(
            "DELETE FROM likes WHERE likeId = ?",
            [results[0].likeId],
            (deleteError) => {
              if (deleteError) {
                console.error("Error removing like:", deleteError);
                return res.status(500).json({ error: "Failed to remove like" });
              }
              return res.status(200).json({ message: "Like removed" });
            }
          );
        } else {
          // If no like exists, create a new like
          const likeId = uuidv4();
          db.query(
            "INSERT INTO likes (likeId, postId, accountId, created_at) VALUES (?, ?, ?, NOW())",
            [likeId, postId, accountId],
            (insertError) => {
              if (insertError) {
                console.error("Error adding like:", insertError);
                return res.status(500).json({ error: "Failed to add like" });
              }
              return res.status(201).json({ message: "Like added" });
            }
          );
        }
      }
    );
  }
);

module.exports = router;
