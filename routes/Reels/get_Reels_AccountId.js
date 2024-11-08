const express = require("express");
const router = express.Router();
const db = require("../../db_connect/db");
const authenticateToken = require("../middleware/authenticateToken");

router.get("/get_Reels", authenticateToken, (req, res) => {
  const accountId = req.accountId;

  // Query to get all reels for the given accountId, using TO_BASE64 to encode media
  const query = `
    SELECT 
      reels.reelId, 
      reels.accountId,
      reels.description, 
      reels.likes_count, 
      reels.comments_count, 
      reels.created_at, 
      reels.updated_at, 
      reels.location,
      TO_BASE64(reels_storage.media) AS media
    FROM reels
    LEFT JOIN reels_storage ON reels.reelId = reels_storage.reelId
    WHERE reels.accountId = ?
  `;

  db.query(query, [accountId], (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Database query failed" });
    }
    res.status(200).json(results);
  });
});

module.exports = router;
