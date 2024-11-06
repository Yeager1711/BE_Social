const express = require("express");
const router = express.Router();
const db = require("../../db_connect/db");
const authenticateToken = require("../middleware/authenticateToken");

router.get("/get_FolderSave", authenticateToken, (req, res) => {
  const accountId  = req.accountId;

  console.log("accountId", accountId);

  if (!accountId) {
    console.log("accountId is required");
    return res.status(400).json({ error: "accountId is required" });
  }

  const FolderSaved_Query = `SELECT * FROM folder_save WHERE accountId = ?`;

  // Using callback to handle query results
  db.query(FolderSaved_Query, [accountId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "An error occurred while fetching folders." });
    }

    // Return the folders associated with the accountId
    res.status(200).json({
      message: "Folders retrieved successfully",
      folders: results,
    });
  });
});

module.exports = router;
