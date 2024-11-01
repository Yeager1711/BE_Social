const express = require("express");
const router = express.Router();
const db = require("../../db_connect/db");

router.get("/getAll_Article", (req, res) => {
    const query = `
        SELECT 
            posts.postId,
            posts.content,
            posts.created_at AS postCreatedAt,
            posts.updated_at AS postUpdatedAt,
            posts.location,
            accounts.first_name,
            accounts.last_name,
            accounts.avatar,
            thumnail.media
        FROM 
            posts
        LEFT JOIN 
            accounts ON posts.accountId = accounts.accountId
        LEFT JOIN 
            thumnail ON posts.postId = thumnail.postId
        ORDER BY 
            posts.created_at DESC;
    `;

    db.query(query, (error, results) => {
        if (error) {
            console.error("Error fetching posts:", error);
            return res.status(500).json({ error: "Error fetching posts" });
        }

        // Tạo một đối tượng để lưu trữ các bài viết duy nhất
        const postsMap = {};

        results.forEach(post => {
            if (!postsMap[post.postId]) {
                // Nếu chưa có postId này, tạo mới đối tượng bài viết
                postsMap[post.postId] = {
                    postId: post.postId,
                    content: post.content,
                    created_at: post.postCreatedAt,
                    updated_at: post.postUpdatedAt,
                    location: post.location,
                    account: {
                        first_name: post.first_name,
                        last_name: post.last_name,
                        avatar: post.avatar
                    },
                    thumbnails: []  // Mảng để chứa các media của bài viết này
                };
            }

            // Thêm media vào mảng thumbnails (nếu có)
            if (post.media) {
                postsMap[post.postId].thumbnails.push(post.media);
            }
        });

        // Chuyển đổi postsMap thành mảng kết quả
        const formattedResults = Object.values(postsMap);

        res.status(200).json({ data: formattedResults });
    });
});

module.exports = router;
