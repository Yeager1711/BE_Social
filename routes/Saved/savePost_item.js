const express = require("express");
const router = express.Router();
const db = require("../../db_connect/db");

const queryPromise = (sql, values) => {
    return new Promise((resolve, reject) => {
        db.query(sql, values, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

// POST API to save an item
router.post("/saveItem_Post/:folderId", async (req, res) => {
    const { postId } = req.body;
    const { folderId } = req.params;

    console.log("postId", postId);
    console.log("folderId", folderId);

    if (!postId) {
        return res.status(400).json({ error: "postId is required" });
    }

    if (!folderId) {
        return res.status(400).json({ error: "folderId is required" });
    }

    try {
        // Kiểm tra xem folderId đã có bài viết nào chưa
        const checkQueryFolder = `SELECT * FROM saved_item WHERE folderId = ? AND postId = ? LIMIT 1`;
        const resultFolderId = await queryPromise(checkQueryFolder, [folderId, postId]);

        // Kiểm tra nếu folderId đã chứa bài viết, trả mã lỗi 400
        if (resultFolderId.length > 0) {
            return res.status(400).json({ error: "This folder already contains this post" });
        }

        // Nếu folderId chưa có bài viết, tiến hành lưu bài viết vào folderId
        const insertQuery = `
            INSERT INTO saved_item (folderId, postId, created_at)
            VALUES (?, ?, NOW())
        `;
        
        await queryPromise(insertQuery, [folderId, postId]);

        res.status(201).json({ message: "Item saved successfully" });
    } catch (error) {
        console.error("Error saving item:", error);
        res.status(500).json({ error: "An error occurred while saving the item" });
    }
});


module.exports = router;

