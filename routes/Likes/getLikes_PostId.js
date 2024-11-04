// const express = require("express");
// const db = require("../../db_connect/db");
// const router = express.Router();
// const authenticateToken = require("../middleware/authenticateToken");
// const { v4: uuidv4 } = require("uuid");

// router.post("/createLikes_PostID/:postId", authenticateToken, async (req, res) => {
//     const { postId } = req.params;
//     const { accountId } = req.body;

//     if (!accountId) {
//         return res.status(400).json({ error: "accountId is required" });
//     }

//     try {
//         // Check if the like already exists
//         const [existingLike] = await db.query(
//             "SELECT * FROM likes WHERE postId = ? AND accountId = ?",
//             [postId, accountId]
//         );

//         if (existingLike) {
//             // If like already exists, remove it to "unlike"
//             await db.query("DELETE FROM likes WHERE likeId = ?", [existingLike.likeId]);
//             return res.status(200).json({ message: "Like removed" });
//         } else {
//             // If no like exists, create a new like
//             const likeId = uuidv4();
//             await db.query(
//                 "INSERT INTO likes (likeId, postId, accountId, created_at) VALUES (?, ?, ?, NOW())",
//                 [likeId, postId, accountId]
//             );
//             return res.status(201).json({ message: "Like added" });
//         }
//     } catch (error) {
//         console.error("Error creating like:", error);
//         res.status(500).json({ error: "An error occurred while processing the like" });
//     }
// });

// module.exports = router;
