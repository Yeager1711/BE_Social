const express = require("express");
const multer = require("multer");
const db = require("../../db_connect/db");
const { v4: uuidv4 } = require('uuid'); 
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/create", upload.single("media"), async (req, res) => {
  const { accountId, postInfo, location } = req.body;

  // Ensure file is uploaded and accountId is provided
  if (!req.file || !accountId) {
    return res.status(400).json({ error: "Image file and accountId are required" });
  }

  // Convert the image file to Base64
  const mediaBase64 = req.file.buffer.toString("base64");
  const mediaDataUrl = `data:${req.file.mimetype};base64,${mediaBase64}`;

  try {
    const postId = uuidv4(); // Generate a unique postId

    // Insert post data
    await db.promise().query(
      "INSERT INTO posts (postId, accountId, content, location, created_at) VALUES (?, ?, ?, ?, NOW())",
      [postId, accountId, postInfo, location]
    );

    // Insert media into the thumbnail table with the created postId
    await db.promise().query(
      "INSERT INTO thumnail (postId, media) VALUES (?, ?)",
      [postId, mediaDataUrl]
    );

    res.json({
      success: true,
      message: "The article has been created successfully.",
      postId: postId,
      media: mediaDataUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while creating the post." });
  }
});

module.exports = router;
