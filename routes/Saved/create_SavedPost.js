const express = require("express");
const router = express.Router();
const db = require("../../db_connect/db");
const authenticateToken = require("../middleware/authenticateToken");
const { v4: uuidv4 } = require("uuid");

router.post("/create_FolderSave", authenticateToken, (req, res) => {
  const { postId, inputValue } = req.body;
  const accountId = req.accountId;

  console.log("postId", postId);
  console.log("inputValue", inputValue);
  console.log("accountId", accountId);

  if (!postId) {
    console.log("postId is required");
    return res.status(400).json({ error: "postId is required" });
  }

  if (!inputValue) {
    console.log("inputValue is required");
    return res.status(400).json({ error: "inputValue is required" });
  }

  if (!accountId) {
    console.log("accountId is required");
    return res.status(400).json({ error: "accountId is required" });
  }

  const folderId = uuidv4();

  const createFolderSaved_Query = `
    INSERT INTO folder_save (folderId, name_folder, accountId, created_at)
    VALUES (?, ?, ?, NOW())`;

  // Using callback to handle query results
  db.query(createFolderSaved_Query, [folderId, inputValue, accountId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "An error occurred while creating the folder saved." });
    }

    res.status(201).json({
      message: "Folder saved successfully",
      folder: {
        folderId,
        nameFolder: inputValue,
        accountId,
      },
    });
  });
});

module.exports = router;
