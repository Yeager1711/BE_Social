const express = require("express");
const db = require("../../db_connect/db");
const router = express.Router();

router.get("/getLikes_PostID/:postId", (req, res) => {
    const { postId } = req.params;

    db.query(
        `SELECT likeId, accountId, created_at FROM likes WHERE postId = ?`,
        [postId],
        (error, results) => {
            if (error) {
                console.error("Error fetching likes:", error);
                return res.status(500).json({ message: "An error occurred while fetching likes" });
            }

            const likeCount = results.length;
            res.json({ likeCount, likes: results });
        }
    );
});

module.exports = router;
