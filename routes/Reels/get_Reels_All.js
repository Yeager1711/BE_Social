// Modify the API endpoint to convert LONGBLOB data to Base64
const express = require("express");
const router = express.Router();
const db = require("../../db_connect/db");

router.get("/getAll_Reels", (req, res) => {
  const queryReels = `
    SELECT 
      r.reelId, 
      r.accountId, 
      r.description, 
      r.likes_count, 
      r.comments_count, 
      r.created_at, 
      r.updated_at, 
      r.location,
      a.first_name, 
      a.last_name, 
      a.avatar,
      TO_BASE64(rs.media) AS media  
    FROM reels r
    JOIN accounts a ON r.accountId = a.accountId
    JOIN reels_storage rs ON r.reelId = rs.reelId
  `;

  db.query(queryReels, (error, results) => {
    if (error) {
      console.error("Error fetching reels:", error);
      return res.status(500).json({ error: "An error occurred while fetching the reels" });
    }
    res.status(200).json({ reels: results });
  });
});

module.exports = router;
