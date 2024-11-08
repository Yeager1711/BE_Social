const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const db = require("../../db_connect/db");
const authenticateToken = require("../middleware/authenticateToken");
const { v4: uuidv4 } = require("uuid");

// Configure multer for temporary file storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// API to create a new reel and save video as BLOB
router.post("/createReels", authenticateToken, upload.single("video"), (req, res) => {
  const accountId = req.accountId;
  const { description, location } = req.body;
  const reelId = uuidv4();
  const videoBuffer = req.file ? req.file.buffer : null;

  // Check if video was uploaded
  if (!videoBuffer) {
    return res.status(400).json({ message: "Video file is required." });
  }

  // Start a transaction using callbacks
  db.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      return res.status(500).json({ message: "Failed to start transaction." });
    }

    // Insert into the reels table
    const insertReelQuery = `
      INSERT INTO reels (reelId, accountId, description, likes_count, comments_count, location, created_at, updated_at)
      VALUES (?, ?, ?, 0, 0, ?, NOW(), NOW())
    `;
    db.query(insertReelQuery, [reelId, accountId, description, location], (err) => {
      if (err) {
        console.error("Error inserting into reels table:", err);
        return db.rollback(() => {
          res.status(500).json({ message: "Failed to insert reel." });
        });
      }

      // Insert into the reels_storage table with video as BLOB
      const insertStorageQuery = `
        INSERT INTO reels_storage (reelId, media)
        VALUES (?, ?)
      `;
      db.query(insertStorageQuery, [reelId, videoBuffer], (err) => {
        if (err) {
          console.error("Error inserting into reels_storage table:", err);
          return db.rollback(() => {
            res.status(500).json({ message: "Failed to store video." });
          });
        }

        // Commit the transaction
        db.commit((err) => {
          if (err) {
            console.error("Error committing transaction:", err);
            return db.rollback(() => {
              res.status(500).json({ message: "Failed to commit transaction." });
            });
          }

          res.status(201).json({ message: "Reel created successfully.", reelId });
        });
      });
    });
  });
});

module.exports = router;
