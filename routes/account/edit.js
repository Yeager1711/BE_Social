const express = require("express");
const multer = require("multer");
const db = require("../../db_connect/db");
const fs = require("fs"); // Add fs to read the file
const path = require("path");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

// Configure multer for memory storage instead of disk storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.put("/change_image", upload.single("avatar"), async (req, res) => {
  const { accountId } = req.body;

  // Ensure file is uploaded and accountId is provided
  if (!req.file || !accountId) {
    return res
      .status(400)
      .json({ error: "Image file and accountId are required" });
  }

  // Convert the image file to Base64
  const avatarBase64 = req.file.buffer.toString("base64");
  const avatarDataUrl = `data:${req.file.mimetype};base64,${avatarBase64}`;

  try {
    // Update the avatar field in the accounts table with Base64 data
    await db
      .promise()
      .query(
        "UPDATE accounts SET avatar = ?, updated_at = NOW() WHERE accountId = ?",
        [avatarDataUrl, accountId]
      );

    res.json({
      success: true,
      message: "Profile image updated successfully",
      avatar: avatarDataUrl,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while updating the profile image" });
  }
});

router.put("/edit-social", async (req, res) => {
  try {
      const { bio, nickname, linkFB, linkInsta, accountId } = req.body;
      let { private_status } = req.body;

      if (!accountId) {
          return res.status(400).json({ error: "accountId is required" });
      }

      const fields = [];
      const values = [];

      if (nickname !== undefined) {
          fields.push("nickname = ?");
          values.push(nickname);
      }
      if (bio !== undefined) {
          fields.push("bio = ?");
          values.push(bio);
      }
      if (linkFB !== undefined) {
          fields.push("link_facebook = ?");
          values.push(linkFB);
      }
      if (linkInsta !== undefined) {
          fields.push("link_instagram = ?");
          values.push(linkInsta);
      }
      if (private_status !== undefined) {
        private_status = private_status ? 1 : 0;
          fields.push("private_status = ?");
          values.push(private_status);
      }

      if (fields.length === 0) {
          return res.status(400).json({ error: "No fields to update" });
      }

      values.push(accountId);

      const query = `
          UPDATE accounts 
          SET ${fields.join(", ")}
          WHERE accountId = ?`;

      db.query(query, values, (err, result) => {
          if (err) {
              console.error("Failed to update user info:", err);
              return res.status(500).json({ error: "Internal Server Error" });
          } else {
              if (result.affectedRows === 0) {
                  return res.status(404).json({ error: "User not found" });
              } else {
                  return res.status(200).json({
                      success: true,
                      message: "Profile updated successfully.",
                  });
              }
          }
      });
  } catch (error) {
      console.error("Update Error:", error);
      return res.status(500).json({
          success: false,
          message: "Failed to update profile.",
          error: error.message,
      });
  }
});


module.exports = router;
