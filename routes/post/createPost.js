const express = require("express");
const multer = require("multer");
const db = require("../../db_connect/db");
const { v4: uuidv4 } = require('uuid'); 
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Change upload.single to upload.array to handle multiple files
router.post("/create", upload.array("media", 10), async (req, res) => {
  const { accountId, postInfo, location } = req.body;

  // Ensure files are uploaded and accountId is provided
  if (!req.files || req.files.length === 0 || !accountId) {
    return res.status(400).json({ error: "At least one image file and accountId are required" });
  }

  try {
    const postId = uuidv4(); // Generate a unique postId

    // Insert post data into posts table
    await db.promise().query(
      "INSERT INTO posts (postId, accountId, content, location, created_at) VALUES (?, ?, ?, ?, NOW())",
      [postId, accountId, postInfo, location]
    );

    // Loop through each uploaded file and insert into the thumbnail table
    for (const file of req.files) {
      // Convert the image file to Base64
      const mediaBase64 = file.buffer.toString("base64");
      const mediaDataUrl = `data:${file.mimetype};base64,${mediaBase64}`;

      // Insert media into the thumbnail table with the created postId
      await db.promise().query(
        "INSERT INTO thumnail (postId, media) VALUES (?, ?)",
        [postId, mediaDataUrl]
      );
    }

    // Send a success response
    res.json({
      success: true,
      message: "The article has been created successfully.",
      postId: postId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while creating the post." });
  }
});

module.exports = router;
