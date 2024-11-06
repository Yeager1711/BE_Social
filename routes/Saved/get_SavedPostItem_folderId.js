const express = require("express");
const router = express.Router();
const db = require("../../db_connect/db");

router.get("/get_SavedPostItem/:folderId", (req, res) => {
    const { folderId } = req.params;

    // Query to get folder_save information for the specified folderId
    db.query("SELECT folderId, accountId, name_folder, created_at FROM folder_save WHERE folderId = ?", [folderId], (err, folderData) => {
        if (err) {
            console.error("Error fetching folder data:", err);
            return res.status(500).json({ message: "Server error" });
        }

        if (folderData.length === 0) {
            return res.status(404).json({ message: "Folder not found" });
        }

        const folder = folderData[0];

        // Query to get saved items within the specified folderId
        db.query("SELECT folderId, postId, created_at FROM saved_item WHERE folderId = ?", [folderId], (err, savedItems) => {
            if (err) {
                console.error("Error fetching saved items:", err);
                return res.status(500).json({ message: "Server error" });
            }

            // Using a counter to handle multiple async thumbnail queries
            let savedItemsWithThumbnails = [];
            let completedRequests = 0;

            if (savedItems.length === 0) {
                return res.json({
                    folderId: folder.folderId,
                    accountId: folder.accountId,
                    name_folder: folder.name_folder,
                    created_at: folder.created_at,
                    folder_saveItem: savedItemsWithThumbnails
                });
            }

            savedItems.forEach((item) => {
                // Get all thumbnails related to the postId in saved_item
                db.query("SELECT postId, media FROM thumnail WHERE postId = ?", [item.postId], (err, thumbnails) => {
                    if (err) {
                        console.error("Error fetching thumbnails:", err);
                        return res.status(500).json({ message: "Server error" });
                    }

                    // Add the saved item along with its thumbnails
                    savedItemsWithThumbnails.push({
                        ...item,
                        post: {
                            postId: item.postId,
                            thumbnails: thumbnails.map((thumb) => ({
                                postId: thumb.postId,
                                media: thumb.media
                            }))
                        }
                    });

                    // Increment the counter and check if all requests are done
                    completedRequests++;
                    if (completedRequests === savedItems.length) {
                        // Structure the response
                        const response = {
                            folderId: folder.folderId,
                            accountId: folder.accountId,
                            name_folder: folder.name_folder,
                            created_at: folder.created_at,
                            folder_saveItem: savedItemsWithThumbnails
                        };
                        res.json(response);
                    }
                });
            });
        });
    });
});

module.exports = router;
